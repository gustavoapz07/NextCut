// Datos y acciones del panel del dueño (Sprint 4). Todo se lee con la sesión del dueño (RLS: solo
// su barbería) y cada acción es una función de la base que vuelve a revisar que sea el dueño.

import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import type { Database } from "./database.types";
import { useSenalFila } from "./enVivo";
import { supabase } from "./supabase";

type Tablas = Database["public"]["Tables"];

export type BarberiaDueno = Pick<
  Tablas["barberias"]["Row"],
  "id" | "nombre" | "slug" | "zona" | "zona_horaria" | "fila_remota_activa"
>;
export type BarberoDueno = Pick<Tablas["barberos"]["Row"], "id" | "nombre" | "silla" | "en_pausa">;
export type TurnoDueno = Pick<
  Tablas["turnos"]["Row"],
  "id" | "numero" | "nombre" | "barbero_id" | "origen" | "estado" | "oculto" | "creado_en"
>;

const COLUMNAS_BARBERIA = "id, nombre, slug, zona, zona_horaria, fila_remota_activa";

export type ResultadoBarberia =
  | { tipo: "listo"; barberia: BarberiaDueno }
  /** La cuenta entró, pero no es dueña de ninguna barbería (un barbero, por ejemplo). */
  | { tipo: "no_dueno" }
  | { tipo: "error" };

/** La barbería de la que esta cuenta es dueña. */
export async function cargarBarberiaDueno(userId: string): Promise<ResultadoBarberia> {
  const miembro = await supabase
    .from("miembros")
    .select("barberia_id")
    .eq("user_id", userId)
    .eq("rol", "dueno")
    .limit(1)
    .maybeSingle();
  if (miembro.error) return { tipo: "error" };
  if (!miembro.data) return { tipo: "no_dueno" };

  const barberia = await supabase
    .from("barberias")
    .select(COLUMNAS_BARBERIA)
    .eq("id", miembro.data.barberia_id)
    .single();
  if (barberia.error) return { tipo: "error" };
  return { tipo: "listo", barberia: barberia.data };
}

/** Lo que devuelve `reporte_dia`: el día de la barbería en su zona horaria. */
export const esquemaReporte = z.object({
  fecha: z.string(),
  turnos: z.number(),
  atendidos: z.number(),
  ingresos: z.number(),
  espera_promedio_min: z.number().nullable(),
  error_estimado_min: z.number().nullable(),
  /** Cancelados, abandonos y "no llegó". */
  abandonos: z.number(),
  no_llegaron: z.number(),
  en_fila: z.number(),
  por_metodo: z.record(z.string(), z.number()),
  por_barbero: z.array(
    z.object({
      barbero_id: z.string(),
      nombre: z.string(),
      atendidos: z.number(),
      ingresos: z.number(),
      espera_promedio_min: z.number().nullable(),
    }),
  ),
  /** Turnos por hora en que se anotaron; solo vienen las horas que tuvieron alguno. */
  por_hora: z.array(z.object({ hora: z.number(), turnos: z.number() })),
});
export type ReporteDia = z.infer<typeof esquemaReporte>;

export interface DatosResumen {
  barberia: BarberiaDueno;
  reporte: ReporteDia;
  barberos: BarberoDueno[];
  /** Turnos activos (en fila, llamados o en la silla), del más antiguo al más nuevo. */
  turnos: TurnoDueno[];
}

export type ResultadoResumen = { tipo: "listo"; datos: DatosResumen } | { tipo: "error" };

export async function cargarResumen(barberiaId: string): Promise<ResultadoResumen> {
  const [barberia, reporte, barberos, turnos] = await Promise.all([
    supabase.from("barberias").select(COLUMNAS_BARBERIA).eq("id", barberiaId).single(),
    supabase.rpc("reporte_dia", { p_barberia_id: barberiaId }),
    supabase
      .from("barberos")
      .select("id, nombre, silla, en_pausa")
      .eq("barberia_id", barberiaId)
      .eq("activo", true)
      .order("silla")
      .order("nombre"),
    supabase
      .from("turnos")
      .select("id, numero, nombre, barbero_id, origen, estado, oculto, creado_en")
      .eq("barberia_id", barberiaId)
      .in("estado", ["esperando", "llamado", "en_silla"])
      .order("creado_en")
      .order("numero"),
  ]);
  if (barberia.error || reporte.error || barberos.error || turnos.error) return { tipo: "error" };
  const leido = esquemaReporte.safeParse(reporte.data);
  if (!leido.success) return { tipo: "error" };
  return {
    tipo: "listo",
    datos: {
      barberia: barberia.data,
      reporte: leido.data,
      barberos: barberos.data,
      turnos: turnos.data,
    },
  };
}

export type EstadoResumen = { tipo: "cargando" } | ResultadoResumen;

/** El resumen siempre al día: recarga con la señal de la fila de su barbería. */
export function useResumen(barberiaId: string) {
  const [estado, setEstado] = useState<EstadoResumen>({ tipo: "cargando" });
  const ultimaPeticion = useRef(0);

  const recargar = useCallback(async () => {
    const peticion = ++ultimaPeticion.current;
    const resultado = await cargarResumen(barberiaId);
    if (peticion !== ultimaPeticion.current) return;
    // Con datos en pantalla, un error de red no los borra; el siguiente aviso vuelve a intentar.
    setEstado((anterior) =>
      resultado.tipo === "error" && anterior.tipo === "listo" ? anterior : resultado,
    );
  }, [barberiaId]);

  useEffect(() => {
    setEstado({ tipo: "cargando" });
    void recargar();
  }, [recargar]);

  useSenalFila(barberiaId, recargar, 30_000);
  return { estado, recargar };
}

/** De la primera a la última hora con turnos, sin huecos, para la gráfica de horas pico. */
export function horasDelDia(porHora: ReporteDia["por_hora"]) {
  if (porHora.length === 0) return [];
  const horas = porHora.map((h) => h.hora);
  const desde = Math.min(...horas);
  const hasta = Math.max(...horas);
  return Array.from({ length: hasta - desde + 1 }, (_, i) => {
    const hora = desde + i;
    return { hora, turnos: porHora.find((h) => h.hora === hora)?.turnos ?? 0 };
  });
}

/** 13 → "1 p. m." */
export function horaCorta(hora: number) {
  const doce = hora % 12 === 0 ? 12 : hora % 12;
  return `${doce} ${hora < 12 ? "a. m." : "p. m."}`;
}

// ---------------------------------------------------------------------------------------------
// Acciones
// ---------------------------------------------------------------------------------------------

export type ErrorDueno = "sin_permiso" | "nombre" | "error";

export const MENSAJES_DUENO: Record<ErrorDueno, string> = {
  sin_permiso: "Tu cuenta no puede cambiar esta barbería.",
  nombre: "El nombre debe tener entre 2 y 40 letras.",
  error: "No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.",
};

export type ResultadoDueno = { ok: true } | { ok: false; error: ErrorDueno };

async function ejecutar(
  llamada: PromiseLike<{ error: { message: string } | null }>,
): Promise<ResultadoDueno> {
  try {
    const { error } = await llamada;
    if (!error) return { ok: true };
    if (error.message.includes("sin_permiso")) return { ok: false, error: "sin_permiso" };
    if (error.message.includes("nombre_invalido")) return { ok: false, error: "nombre" };
    return { ok: false, error: "error" };
  } catch {
    return { ok: false, error: "error" };
  }
}

/** Pausada, solo se anotan en el local (con el QR de la puerta). */
export const pausarFilaRemota = (barberiaId: string, pausada: boolean) =>
  ejecutar(supabase.rpc("pausar_fila_remota", { p_barberia_id: barberiaId, p_pausada: pausada }));

export const renombrarTurno = (turnoId: string, nombre: string) =>
  ejecutar(supabase.rpc("renombrar_turno", { p_turno_id: turnoId, p_nombre: nombre }));

/** Oculto, el turno sigue en la fila, pero las pantallas públicas no muestran su nombre. */
export const ocultarTurno = (turnoId: string, oculto: boolean) =>
  ejecutar(supabase.rpc("ocultar_turno", { p_turno_id: turnoId, p_oculto: oculto }));
