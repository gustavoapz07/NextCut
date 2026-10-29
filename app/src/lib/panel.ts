// Datos y acciones del panel del barbero. Todo se lee con la sesión del barbero (RLS: solo su
// barbería) y cada acción es una función de la base que vuelve a revisar el permiso.

import { useCallback, useEffect, useRef, useState } from "react";
import type { Database } from "./database.types";
import { useSenalFila } from "./enVivo";
import { supabase } from "./supabase";

type Tablas = Database["public"]["Tables"];
export type MetodoPago = Database["public"]["Enums"]["metodo_pago"];

export type BarberoPanel = Pick<
  Tablas["barberos"]["Row"],
  "id" | "nombre" | "apodo" | "silla" | "en_pausa" | "barberia_id"
>;
export type BarberiaPanel = Pick<
  Tablas["barberias"]["Row"],
  "id" | "nombre" | "slug" | "tolerancia_min" | "zona_horaria"
>;
export type ServicioPanel = Pick<
  Tablas["servicios"]["Row"],
  "id" | "nombre" | "duracion_min" | "precio_ref"
>;
export type TurnoPersonal = Pick<
  Tablas["turnos"]["Row"],
  | "id"
  | "numero"
  | "nombre"
  | "telefono"
  | "barbero_id"
  | "servicio_id"
  | "origen"
  | "estado"
  | "creado_en"
  | "llamado_en"
  | "inicio_en"
>;

export interface DatosPanel {
  barbero: BarberoPanel;
  barberia: BarberiaPanel;
  servicios: ServicioPanel[];
  /** Turnos activos de toda la barbería, del más antiguo al más nuevo. */
  turnos: TurnoPersonal[];
  hoy: { atendidos: number; ingresos: number };
}

/** "2026-10-28" en la zona horaria de la barbería: el `dia` de sus turnos. */
export function diaEn(zona: string, fecha = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: zona,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(fecha);
}

export type ResultadoPanel =
  | { tipo: "listo"; datos: DatosPanel }
  | { tipo: "sin_silla" }
  | { tipo: "error" };

export async function cargarPanel(userId: string): Promise<ResultadoPanel> {
  const barbero = await supabase
    .from("barberos")
    .select("id, nombre, apodo, silla, en_pausa, barberia_id")
    .eq("user_id", userId)
    .eq("activo", true)
    .limit(1)
    .maybeSingle();
  if (barbero.error) return { tipo: "error" };
  if (!barbero.data) return { tipo: "sin_silla" };
  const { barberia_id: barberiaId, id: barberoId } = barbero.data;

  const barberia = await supabase
    .from("barberias")
    .select("id, nombre, slug, tolerancia_min, zona_horaria")
    .eq("id", barberiaId)
    .single();
  if (barberia.error) return { tipo: "error" };

  const [servicios, turnos, atendidos] = await Promise.all([
    supabase
      .from("servicios")
      .select("id, nombre, duracion_min, precio_ref")
      .eq("barberia_id", barberiaId)
      .eq("activo", true)
      .order("precio_ref")
      .order("nombre"),
    supabase
      .from("turnos")
      .select(
        "id, numero, nombre, telefono, barbero_id, servicio_id, origen, estado, creado_en, llamado_en, inicio_en",
      )
      .eq("barberia_id", barberiaId)
      .in("estado", ["esperando", "llamado", "en_silla"])
      .order("creado_en")
      .order("numero"),
    supabase
      .from("turnos")
      .select("monto")
      .eq("barbero_id", barberoId)
      .eq("estado", "atendido")
      .eq("dia", diaEn(barberia.data.zona_horaria)),
  ]);
  if (servicios.error || turnos.error || atendidos.error) return { tipo: "error" };

  return {
    tipo: "listo",
    datos: {
      barbero: barbero.data,
      barberia: barberia.data,
      servicios: servicios.data,
      turnos: turnos.data,
      hoy: {
        atendidos: atendidos.data.length,
        // `numeric` puede llegar como texto: se convierte antes de sumar.
        ingresos: atendidos.data.reduce((total, t) => total + Number(t.monto ?? 0), 0),
      },
    },
  };
}

export type EstadoPanel = { tipo: "cargando" } | ResultadoPanel;

/** El panel siempre al día: recarga con la señal de la fila de su barbería. */
export function usePanel(userId: string) {
  const [estado, setEstado] = useState<EstadoPanel>({ tipo: "cargando" });
  const ultimaPeticion = useRef(0);

  const recargar = useCallback(async () => {
    const peticion = ++ultimaPeticion.current;
    const resultado = await cargarPanel(userId);
    if (peticion !== ultimaPeticion.current) return;
    // Con datos en pantalla, un error de red no los borra; el siguiente aviso vuelve a intentar.
    setEstado((anterior) =>
      resultado.tipo === "error" && anterior.tipo === "listo" ? anterior : resultado,
    );
  }, [userId]);

  useEffect(() => {
    setEstado({ tipo: "cargando" });
    void recargar();
  }, [recargar]);

  useSenalFila(estado.tipo === "listo" ? estado.datos.barberia.id : null, recargar, 20_000);
  return { estado, recargar };
}

/** Lo que le toca hacer al barbero ahora, según sus turnos. */
export function resumirPanel(datos: DatosPanel) {
  const { barbero, turnos } = datos;
  const actual =
    turnos.find(
      (t) => t.barbero_id === barbero.id && (t.estado === "llamado" || t.estado === "en_silla"),
    ) ?? null;
  // Su fila: lo que `llamar_siguiente` le daría, en el mismo orden.
  const cola = turnos.filter(
    (t) => t.estado === "esperando" && (t.barbero_id === null || t.barbero_id === barbero.id),
  );
  return { actual, cola };
}

// ---------------------------------------------------------------------------------------------
// Acciones
// ---------------------------------------------------------------------------------------------

export type ErrorAccion = "ocupado" | "en_pausa" | "cambio" | "sin_permiso" | "monto" | "error";

export const MENSAJES_ACCION: Record<ErrorAccion, string> = {
  ocupado: "Ya tienes a alguien llamado o en la silla.",
  en_pausa: "Estás en pausa: vuelve a Disponible para llamar.",
  cambio: "Ese turno ya cambió. Actualizamos tu panel.",
  sin_permiso: "Tu cuenta no puede atender en esta silla.",
  monto: "Revisa el monto y la forma de pago.",
  error: "No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.",
};

function errorDe(mensaje: string): ErrorAccion {
  if (mensaje.includes("barbero_ocupado")) return "ocupado";
  if (mensaje.includes("barbero_en_pausa")) return "en_pausa";
  if (mensaje.includes("estado_invalido")) return "cambio";
  if (mensaje.includes("sin_permiso")) return "sin_permiso";
  if (/monto_invalido|metodo_invalido|servicio_invalido/.test(mensaje)) return "monto";
  return "error";
}

export type ResultadoAccion<T = unknown> =
  | { ok: true; datos: T }
  | { ok: false; error: ErrorAccion };

async function ejecutar<T>(
  llamada: PromiseLike<{ data: T; error: { message: string } | null }>,
): Promise<ResultadoAccion<T>> {
  try {
    const { data, error } = await llamada;
    return error ? { ok: false, error: errorDe(error.message) } : { ok: true, datos: data };
  } catch {
    return { ok: false, error: "error" };
  }
}

/** Devuelve el turno llamado, o `null` si no había nadie en su fila. */
export const llamarSiguiente = (barberoId: string) =>
  ejecutar(supabase.rpc("llamar_siguiente", { p_barbero_id: barberoId }));

export const empezarTurno = (turnoId: string) =>
  ejecutar(supabase.rpc("empezar_turno", { p_turno_id: turnoId }));

export const marcarNoLlego = (turnoId: string) =>
  ejecutar(supabase.rpc("marcar_no_llego", { p_turno_id: turnoId }));

export const terminarTurno = (
  turnoId: string,
  monto: number,
  metodo: MetodoPago,
  servicioId: string,
) =>
  ejecutar(
    supabase.rpc("terminar_turno", {
      p_turno_id: turnoId,
      p_monto: monto,
      p_metodo_pago: metodo,
      p_servicio_id: servicioId,
    }),
  );

export const pausarBarbero = (barberoId: string, enPausa: boolean) =>
  ejecutar(supabase.rpc("pausar_barbero", { p_barbero_id: barberoId, p_en_pausa: enPausa }));

/** Enlace de WhatsApp con el mensaje ya escrito, o `null` si el cliente no dejó número. */
export function enlaceWhatsApp(
  turno: Pick<TurnoPersonal, "nombre" | "telefono">,
  barberia: string,
  silla: number | null,
) {
  if (!turno.telefono) return null;
  const nombre = turno.nombre.split(" ")[0] ?? turno.nombre;
  const texto = `${nombre}, ya te toca en ${barberia}.${silla ? ` Te esperamos en la silla ${silla}.` : ""}`;
  return `https://wa.me/${turno.telefono.replace(/\D/g, "")}?text=${encodeURIComponent(texto)}`;
}
