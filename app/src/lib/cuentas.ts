// Cuentas del personal sin correo (ADR-017): el admin da de alta barberías con su dueño y el dueño
// les crea la cuenta a sus barberos. Todo pasa por la Edge Function `cuentas`, que devuelve una
// contraseña temporal una sola vez; quien la recibe la cambia al entrar.

import { CODIGOS_CUENTAS, type CodigoCuentas, type PeticionCuentas } from "@shared/cuentas";
import { FunctionsHttpError, type User } from "@supabase/supabase-js";
import { z } from "zod";
import { supabase } from "./supabase";

export type ErrorCuentas = CodigoCuentas | "sin_conexion";

export const MENSAJES_CUENTAS: Record<ErrorCuentas, string> = {
  datos_invalidos: "Revisa los datos: el correo, el nombre y la dirección.",
  sin_sesion: "Tu sesión se cerró. Vuelve a entrar.",
  sin_permiso: "Tu cuenta no puede hacer esto.",
  slug_en_uso: "Ya hay una barbería con esa dirección. Prueba otra.",
  correo_en_uso: "Ese correo ya tiene una cuenta. Usa otro.",
  barbero_con_cuenta: "Este barbero ya tiene cuenta.",
  barbero_inactivo: "Primero vuelve a activar a este barbero.",
  error: "Algo salió mal de nuestro lado. Inténtalo de nuevo.",
  sin_conexion: "No hay conexión. Revisa tu internet e inténtalo de nuevo.",
};

const esCodigo = (valor: unknown): valor is CodigoCuentas =>
  CODIGOS_CUENTAS.includes(valor as CodigoCuentas);

type Resultado<T> = { ok: true; datos: T } | { ok: false; error: ErrorCuentas };

async function pedir<T>(cuerpo: PeticionCuentas, esquema: z.ZodType<T>): Promise<Resultado<T>> {
  const { data, error } = await supabase.functions.invoke("cuentas", { body: cuerpo });
  if (!error) {
    const leido = esquema.safeParse(data);
    return leido.success ? { ok: true, datos: leido.data } : { ok: false, error: "error" };
  }
  if (error instanceof FunctionsHttpError) {
    try {
      const codigo = ((await error.context.json()) as { error?: unknown } | null)?.error;
      if (esCodigo(codigo)) return { ok: false, error: codigo };
    } catch {
      // Una respuesta que no es JSON cuenta como error genérico.
    }
    return { ok: false, error: "error" };
  }
  return { ok: false, error: "sin_conexion" };
}

const esquemaClave = z.object({ clave: z.string() });

export function crearBarberia(datos: {
  nombre: string;
  slug: string;
  zona: string;
  correoDueno: string;
}) {
  return pedir(
    {
      accion: "crear_barberia",
      nombre: datos.nombre,
      slug: datos.slug,
      zona: datos.zona.trim() || null,
      correoDueno: datos.correoDueno,
    },
    z.object({ slug: z.string(), correo: z.string(), clave: z.string().nullable() }),
  );
}

export function crearCuentaBarbero(barberoId: string, correo: string) {
  return pedir(
    { accion: "crear_cuenta_barbero", barberoId, correo },
    z.object({ correo: z.string(), clave: z.string() }),
  );
}

export function restablecerBarbero(barberoId: string) {
  return pedir({ accion: "restablecer_barbero", barberoId }, esquemaClave);
}

export function restablecerDueno(barberiaId: string) {
  return pedir({ accion: "restablecer_dueno", barberiaId }, esquemaClave);
}

/** La dirección pública a partir del nombre: "Barbería Don Juan" → "barberia-don-juan". */
export function slugDe(nombre: string) {
  return nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/, "");
}

// ---------------------------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------------------------

/** Si no se puede saber (sin conexión), se trata como no admin: solo esconde un enlace. */
export async function soyAdmin() {
  try {
    const { data, error } = await supabase.rpc("soy_admin");
    return !error && data === true;
  } catch {
    return false;
  }
}

const esquemaBarberias = z.array(
  z.object({
    id: z.string(),
    nombre: z.string(),
    slug: z.string(),
    zona: z.string().nullable(),
    creado_en: z.string(),
    dueno_correo: z.string().nullable(),
    barberos: z.number(),
  }),
);
export type BarberiaAdmin = z.infer<typeof esquemaBarberias>[number];

export type ResultadoAdmin =
  | { tipo: "listo"; barberias: BarberiaAdmin[] }
  | { tipo: "no_admin" }
  | { tipo: "error" };

export async function cargarBarberiasAdmin(): Promise<ResultadoAdmin> {
  const { data, error } = await supabase.rpc("admin_barberias");
  if (error) return error.code === "42501" ? { tipo: "no_admin" } : { tipo: "error" };
  const leido = esquemaBarberias.safeParse(data);
  return leido.success ? { tipo: "listo", barberias: leido.data } : { tipo: "error" };
}

const esquemaDetalle = z.object({
  id: z.string(),
  nombre: z.string(),
  slug: z.string(),
  zona: z.string().nullable(),
  creado_en: z.string(),
  fila_remota_activa: z.boolean(),
  con_horario: z.boolean(),
  dueno_correo: z.string().nullable(),
  barberos: z.array(
    z.object({
      nombre: z.string(),
      silla: z.number().nullable(),
      activo: z.boolean(),
      correo: z.string().nullable(),
    }),
  ),
  servicios: z.array(
    z.object({
      nombre: z.string(),
      duracion_min: z.number(),
      // `numeric` puede llegar como texto.
      precio_ref: z.coerce.number(),
      activo: z.boolean(),
    }),
  ),
  turnos_7_dias: z.number(),
  atendidos_7_dias: z.number(),
});
export type DetalleBarberia = z.infer<typeof esquemaDetalle>;

export type ResultadoDetalle =
  | { tipo: "listo"; barberia: DetalleBarberia }
  | { tipo: "no_existe" }
  | { tipo: "no_admin" }
  | { tipo: "error" };

export async function cargarDetalleAdmin(barberiaId: string): Promise<ResultadoDetalle> {
  const { data, error } = await supabase.rpc("admin_barberia", { p_barberia: barberiaId });
  if (error) return error.code === "42501" ? { tipo: "no_admin" } : { tipo: "error" };
  if (data === null) return { tipo: "no_existe" };
  const leido = esquemaDetalle.safeParse(data);
  return leido.success ? { tipo: "listo", barberia: leido.data } : { tipo: "error" };
}

/** A dónde va el admin al entrar: a su panel, salvo que haya pedido una página de ese panel. */
export function destinoDelAdmin(pedido: string | null) {
  return pedido?.startsWith("/admin") ? pedido : "/admin";
}

// ---------------------------------------------------------------------------------------------
// Contraseña temporal
// ---------------------------------------------------------------------------------------------

/** La cuenta entró con una contraseña temporal y todavía no la cambia. */
export const debeCambiarClave = (usuario: User | null | undefined) =>
  usuario?.user_metadata?.cambiar_clave === true;

/** La misma regla que Auth en producción: 10 o más, con letras y números. */
export function problemaClave(clave: string, repetida: string): string | null {
  if (clave.length < 10) return "Usa al menos 10 caracteres.";
  if (!/[a-zA-Z]/.test(clave) || !/[0-9]/.test(clave)) return "Mezcla letras y números.";
  if (clave !== repetida) return "Las dos contraseñas no coinciden.";
  return null;
}

export async function cambiarClave(clave: string): Promise<string | null> {
  const { error } = await supabase.auth.updateUser({
    password: clave,
    data: { cambiar_clave: false },
  });
  if (!error) return null;
  if (error.code === "same_password") return "Elige una distinta a la temporal.";
  if (error.code === "weak_password") return "Esa contraseña es muy débil. Prueba otra.";
  return "No se pudo cambiar. Revisa tu conexión e inténtalo de nuevo.";
}
