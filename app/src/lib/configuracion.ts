// Configuración de la barbería para el dueño (Sprint 4): datos, barberos, servicios y reglas de la
// fila. Se edita un borrador y se guarda de una vez. RLS deja escribir solo al dueño de esa
// barbería y la base vuelve a revisar cada valor con sus CHECK (fallo 3); aquí se validan las
// mismas reglas para explicar el error antes de mandar nada.
//
// Nada se borra: un barbero o un servicio que se quita queda inactivo, porque los turnos pasados
// lo siguen nombrando (y la base no deja borrar lo que un turno usa).

import { z } from "zod";
import { supabase } from "./supabase";

export interface BarberiaConfig {
  id: string;
  nombre: string;
  slug: string;
  zona: string;
  max_fila: number;
  tolerancia_min: number;
}

export interface BarberoConfig {
  /** Clave estable en pantalla; para los nuevos, una temporal. */
  clave: string;
  /** `null` mientras no se guarda. */
  id: string | null;
  nombre: string;
  apodo: string;
  silla: number | null;
  activo: boolean;
  /** Tiene una cuenta para entrar al panel. */
  conCuenta: boolean;
}

export interface ServicioConfig {
  clave: string;
  id: string | null;
  nombre: string;
  duracion_min: number;
  precio_ref: number;
  activo: boolean;
}

export interface DatosConfig {
  barberia: BarberiaConfig;
  barberos: BarberoConfig[];
  servicios: ServicioConfig[];
}

// ---------------------------------------------------------------------------------------------
// Validación: las mismas reglas que los CHECK de la base
// ---------------------------------------------------------------------------------------------

const limpio = (texto: string) => texto.replace(/\s+/g, " ").trim();

const nombre = z.string().transform(limpio).pipe(z.string().min(2, "corto").max(40, "largo"));

const esquemaBarberia = z.object({
  nombre: z.string().transform(limpio).pipe(z.string().min(2).max(60)),
  zona: z.string().transform(limpio).pipe(z.string().max(80)),
  max_fila: z.number().int().min(1).max(100),
  tolerancia_min: z.number().int().min(1).max(30),
});
const esquemaBarbero = z.object({
  nombre,
  apodo: z.string().transform(limpio).pipe(z.string().max(40)),
  silla: z.number().int().min(1).max(50).nullable(),
});
const esquemaServicio = z.object({
  nombre,
  duracion_min: z.number().int().min(5).max(240),
  precio_ref: z.number().min(0).max(100000),
});

/** El primer problema del borrador, explicado para el dueño; `null` si se puede guardar. */
export function validar(borrador: DatosConfig): string | null {
  if (!esquemaBarberia.safeParse(borrador.barberia).success) {
    return "Revisa los datos de la barbería: el nombre lleva entre 2 y 60 letras y la zona hasta 80.";
  }
  for (const b of borrador.barberos) {
    if (!esquemaBarbero.safeParse(b).success) {
      return `Revisa a ${limpio(b.nombre) || "el barbero nuevo"}: el nombre lleva entre 2 y 40 letras, el apodo hasta 40 y la silla va del 1 al 50.`;
    }
  }
  const sillas = borrador.barberos.filter((b) => b.activo && b.silla !== null).map((b) => b.silla);
  if (new Set(sillas).size !== sillas.length) {
    return "Dos barberos activos tienen la misma silla.";
  }
  for (const s of borrador.servicios) {
    if (!esquemaServicio.safeParse(s).success) {
      return `Revisa ${limpio(s.nombre) || "el servicio nuevo"}: el nombre lleva entre 2 y 40 letras, dura de 5 a 240 minutos y el precio no puede ser negativo.`;
    }
  }
  if (!borrador.servicios.some((s) => s.activo)) {
    return "Deja al menos un servicio activo: sin servicios nadie se puede anotar.";
  }
  return null;
}

// ---------------------------------------------------------------------------------------------
// Cambios entre lo guardado y el borrador
// ---------------------------------------------------------------------------------------------

export type Operacion =
  | { tipo: "barberia"; cambios: Partial<Omit<BarberiaConfig, "id" | "slug">> }
  | { tipo: "barbero_nuevo"; datos: Pick<BarberoConfig, "nombre" | "apodo" | "silla" | "activo"> }
  | {
      tipo: "barbero";
      id: string;
      cambios: Partial<Pick<BarberoConfig, "nombre" | "apodo" | "silla" | "activo">>;
    }
  | {
      tipo: "servicio_nuevo";
      datos: Pick<ServicioConfig, "nombre" | "duracion_min" | "precio_ref" | "activo">;
    }
  | {
      tipo: "servicio";
      id: string;
      cambios: Partial<Pick<ServicioConfig, "nombre" | "duracion_min" | "precio_ref" | "activo">>;
    };

function diferencias<T extends object, K extends keyof T>(antes: T, despues: T, campos: K[]) {
  const cambios: Partial<Pick<T, K>> = {};
  for (const campo of campos) {
    const valor = despues[campo];
    const normalizado = (typeof valor === "string" ? limpio(valor) : valor) as T[K];
    if (normalizado !== antes[campo]) cambios[campo] = normalizado;
  }
  return cambios;
}

const hayCambios = (cambios: object) => Object.keys(cambios).length > 0;

/** Lo que hay que escribir en la base para que quede como el borrador. */
export function cambiosEntre(original: DatosConfig, borrador: DatosConfig): Operacion[] {
  const operaciones: Operacion[] = [];

  const barberia = diferencias(original.barberia, borrador.barberia, [
    "nombre",
    "zona",
    "max_fila",
    "tolerancia_min",
  ]);
  if (hayCambios(barberia)) operaciones.push({ tipo: "barberia", cambios: barberia });

  const camposBarbero: Array<"nombre" | "apodo" | "silla" | "activo"> = [
    "nombre",
    "apodo",
    "silla",
    "activo",
  ];
  for (const b of borrador.barberos) {
    if (b.id === null) {
      operaciones.push({
        tipo: "barbero_nuevo",
        datos: {
          nombre: limpio(b.nombre),
          apodo: limpio(b.apodo),
          silla: b.silla,
          activo: b.activo,
        },
      });
      continue;
    }
    const antes = original.barberos.find((o) => o.id === b.id);
    if (!antes) continue;
    const cambios = diferencias(antes, b, camposBarbero);
    if (hayCambios(cambios)) operaciones.push({ tipo: "barbero", id: b.id, cambios });
  }

  const camposServicio: Array<"nombre" | "duracion_min" | "precio_ref" | "activo"> = [
    "nombre",
    "duracion_min",
    "precio_ref",
    "activo",
  ];
  for (const s of borrador.servicios) {
    if (s.id === null) {
      operaciones.push({
        tipo: "servicio_nuevo",
        datos: {
          nombre: limpio(s.nombre),
          duracion_min: s.duracion_min,
          precio_ref: s.precio_ref,
          activo: s.activo,
        },
      });
      continue;
    }
    const antes = original.servicios.find((o) => o.id === s.id);
    if (!antes) continue;
    const cambios = diferencias(antes, s, camposServicio);
    if (hayCambios(cambios)) operaciones.push({ tipo: "servicio", id: s.id, cambios });
  }
  return operaciones;
}

// ---------------------------------------------------------------------------------------------
// Base
// ---------------------------------------------------------------------------------------------

export type ResultadoCarga = { tipo: "listo"; datos: DatosConfig } | { tipo: "error" };

export async function cargarConfiguracion(barberiaId: string): Promise<ResultadoCarga> {
  const [barberia, barberos, servicios] = await Promise.all([
    supabase
      .from("barberias")
      .select("id, nombre, slug, zona, max_fila, tolerancia_min")
      .eq("id", barberiaId)
      .single(),
    supabase
      .from("barberos")
      .select("id, nombre, apodo, silla, activo, user_id")
      .eq("barberia_id", barberiaId)
      .order("silla")
      .order("nombre"),
    supabase
      .from("servicios")
      .select("id, nombre, duracion_min, precio_ref, activo")
      .eq("barberia_id", barberiaId)
      .order("precio_ref")
      .order("nombre"),
  ]);
  if (barberia.error || barberos.error || servicios.error) return { tipo: "error" };
  return {
    tipo: "listo",
    datos: {
      barberia: { ...barberia.data, zona: barberia.data.zona ?? "" },
      barberos: barberos.data.map((b) => ({
        clave: b.id,
        id: b.id,
        nombre: b.nombre,
        apodo: b.apodo ?? "",
        silla: b.silla,
        activo: b.activo,
        conCuenta: b.user_id !== null,
      })),
      servicios: servicios.data.map((s) => ({
        clave: s.id,
        id: s.id,
        nombre: s.nombre,
        duracion_min: s.duracion_min,
        // `numeric` puede llegar como texto.
        precio_ref: Number(s.precio_ref),
        activo: s.activo,
      })),
    },
  };
}

export type ErrorGuardar = "sin_permiso" | "datos" | "error";

export const MENSAJES_GUARDAR: Record<ErrorGuardar, string> = {
  sin_permiso: "Tu cuenta no puede cambiar esta barbería.",
  datos: "La base no aceptó uno de los valores. Revisa los datos e inténtalo de nuevo.",
  error: "No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.",
};

const vacioANull = (texto: string | undefined) =>
  texto === undefined ? undefined : texto === "" ? null : texto;

function errorDe(error: { code?: string; message: string }): ErrorGuardar {
  // 23514: un CHECK; 22P02/22003: un número fuera de rango. 42501 o ninguna fila: RLS.
  if (error.code === "23514" || error.code === "22P02" || error.code === "22003") return "datos";
  if (error.code === "42501") return "sin_permiso";
  return "error";
}

type Respuesta = { data: unknown; error: { code?: string; message: string } | null };

/**
 * Aplica las operaciones en orden. Con RLS, una actualización que no le toca a esta cuenta no da
 * error: simplemente no cambia ninguna fila; por eso cada una pide de vuelta lo que cambió.
 */
export async function guardarConfiguracion(
  barberiaId: string,
  operaciones: Operacion[],
): Promise<{ ok: true } | { ok: false; error: ErrorGuardar }> {
  try {
    for (const op of operaciones) {
      let respuesta: Respuesta;
      if (op.tipo === "barberia") {
        const { zona, ...resto } = op.cambios;
        respuesta = await supabase
          .from("barberias")
          .update({ ...resto, ...(zona === undefined ? {} : { zona: vacioANull(zona) }) })
          .eq("id", barberiaId)
          .select("id");
      } else if (op.tipo === "barbero_nuevo") {
        respuesta = await supabase
          .from("barberos")
          .insert({ ...op.datos, apodo: vacioANull(op.datos.apodo), barberia_id: barberiaId })
          .select("id");
      } else if (op.tipo === "barbero") {
        const { apodo, ...resto } = op.cambios;
        respuesta = await supabase
          .from("barberos")
          .update({ ...resto, ...(apodo === undefined ? {} : { apodo: vacioANull(apodo) }) })
          .eq("id", op.id)
          .eq("barberia_id", barberiaId)
          .select("id");
      } else if (op.tipo === "servicio_nuevo") {
        respuesta = await supabase
          .from("servicios")
          .insert({ ...op.datos, barberia_id: barberiaId })
          .select("id");
      } else {
        respuesta = await supabase
          .from("servicios")
          .update(op.cambios)
          .eq("id", op.id)
          .eq("barberia_id", barberiaId)
          .select("id");
      }
      if (respuesta.error) return { ok: false, error: errorDe(respuesta.error) };
      if (!Array.isArray(respuesta.data) || respuesta.data.length === 0) {
        return { ok: false, error: "sin_permiso" };
      }
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "error" };
  }
}
