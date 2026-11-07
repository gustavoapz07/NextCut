// Cuentas del personal sin correo (ADR-017). Esta es la lógica de la Edge Function `cuentas`, sin
// nada propio de Deno, para probarla con Vitest.
//
// - El admin da de alta una barbería con la cuenta de su dueño y le restablece la contraseña.
// - El dueño le crea la cuenta a un barbero de su barbería y se la restablece.
// En cada caso se genera una contraseña temporal que la app muestra una sola vez; quien la recibe
// la cambia al entrar. Quién puede qué lo vuelve a revisar la base con el id de la sesión.

import { z } from "zod";
import { limpiarNombre } from "./unirse.ts";

const esquemaCorreo = z
  .string()
  .max(254)
  .transform((correo) => correo.trim().toLowerCase())
  .pipe(z.email());

export const esquemaSlug = z
  .string()
  .min(3)
  .max(40)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);

export const esquemaCuentas = z.discriminatedUnion("accion", [
  z.object({
    accion: z.literal("crear_barberia"),
    nombre: z.string().max(200).transform(limpiarNombre).pipe(z.string().min(2).max(60)),
    slug: esquemaSlug,
    zona: z.string().max(200).transform(limpiarNombre).pipe(z.string().max(80)).nullable(),
    correoDueno: esquemaCorreo,
  }),
  z.object({
    accion: z.literal("crear_cuenta_barbero"),
    barberoId: z.uuid(),
    correo: esquemaCorreo,
  }),
  z.object({ accion: z.literal("restablecer_barbero"), barberoId: z.uuid() }),
  z.object({ accion: z.literal("restablecer_dueno"), barberiaId: z.uuid() }),
]);

export type PeticionCuentas = z.input<typeof esquemaCuentas>;

export const CODIGOS_CUENTAS = [
  "datos_invalidos",
  "sin_sesion",
  "sin_permiso",
  "slug_en_uso",
  "correo_en_uso",
  "barbero_con_cuenta",
  "barbero_inactivo",
  "error",
] as const;
export type CodigoCuentas = (typeof CODIGOS_CUENTAS)[number];

const ESTADO_HTTP: Record<CodigoCuentas, number> = {
  datos_invalidos: 400,
  sin_sesion: 401,
  sin_permiso: 403,
  slug_en_uso: 409,
  correo_en_uso: 409,
  barbero_con_cuenta: 409,
  barbero_inactivo: 409,
  error: 500,
};

const ERRORES_DE_LA_BASE: Record<string, CodigoCuentas> = {
  sin_permiso: "sin_permiso",
  slug_en_uso: "slug_en_uso",
  slug_invalido: "datos_invalidos",
  nombre_invalido: "datos_invalidos",
  zona_invalida: "datos_invalidos",
  barbero_con_cuenta: "barbero_con_cuenta",
  barbero_inactivo: "barbero_inactivo",
};

export function errorDeLaBase(mensaje: string): CodigoCuentas {
  for (const [clave, codigo] of Object.entries(ERRORES_DE_LA_BASE)) {
    if (mensaje.includes(clave)) return codigo;
  }
  return "error";
}

/** Sin letras ni números que se confundan al dictarla (0/o, 1/l/i). */
const ALFABETO = "abcdefghjkmnpqrstuvwxyz23456789";

/**
 * Contraseña temporal de 14 caracteres, en tres grupos fáciles de dictar ("k7pq-m3xa-tr9w").
 * Cumple la regla de Auth en producción (10 o más, con letras y números).
 */
export function claveTemporal(azar: (n: number) => Uint8Array = aleatorio): string {
  for (;;) {
    // 248 es el múltiplo de 31 más grande bajo 256: así cada carácter sale con la misma probabilidad.
    const letras = Array.from(azar(64))
      .filter((byte) => byte < 248)
      .slice(0, 12)
      .map((byte) => ALFABETO[byte % ALFABETO.length]);
    if (letras.length < 12) continue;
    const clave = [letras.slice(0, 4), letras.slice(4, 8), letras.slice(8)]
      .map((grupo) => grupo.join(""))
      .join("-");
    if (/[a-z]/.test(clave) && /[0-9]/.test(clave)) return clave;
  }
}

function aleatorio(n: number) {
  return crypto.getRandomValues(new Uint8Array(n));
}

type RespuestaRpc = { data: unknown; error: { message: string } | null };
type ResultadoAuth<T> = { data: T; error: { code?: string; message: string } | null };

export interface Dependencias {
  configurado: boolean;
  origenes: readonly string[];
  /** El id de la cuenta dueña del token, o `null` si el token no sirve. */
  usuarioDelToken(token: string): Promise<string | null>;
  /** Crea una cuenta confirmada que debe cambiar la contraseña al entrar. */
  crearCuenta(correo: string, clave: string): Promise<ResultadoAuth<{ id: string } | null>>;
  cambiarClave(cuenta: string, clave: string): Promise<{ error: { message: string } | null }>;
  borrarCuenta(cuenta: string): Promise<unknown>;
  rpc(funcion: string, argumentos: Record<string, unknown>): PromiseLike<RespuestaRpc>;
  claveTemporal(): string;
}

function encabezadosCors(peticion: Request, origenes: readonly string[]): Record<string, string> {
  const origen = peticion.headers.get("origin");
  const comunes = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
  return origen && origenes.includes(origen)
    ? { ...comunes, "Access-Control-Allow-Origin": origen }
    : comunes;
}

function tokenDe(peticion: Request) {
  const valor = peticion.headers.get("authorization") ?? "";
  const token = valor.startsWith("Bearer ") ? valor.slice(7).trim() : "";
  // La clave publicable también viaja como "Bearer" cuando no hay sesión: no es un JWT.
  return token.split(".").length === 3 ? token : null;
}

/** Auth responde `email_exists` (o 422 con ese texto) cuando el correo ya tiene cuenta. */
function correoRepetido(error: { code?: string; message: string }) {
  return error.code === "email_exists" || /already (been )?registered|exists/i.test(error.message);
}

export async function manejarCuentas(peticion: Request, deps: Dependencias): Promise<Response> {
  const cors = encabezadosCors(peticion, deps.origenes);
  const responder = (estado: number, cuerpo: unknown) =>
    new Response(JSON.stringify(cuerpo), {
      status: estado,
      headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  const fallar = (codigo: CodigoCuentas) => responder(ESTADO_HTTP[codigo], { error: codigo });

  if (peticion.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (peticion.method !== "POST") return responder(405, { error: "metodo" });
  if (!deps.configurado) return fallar("error");

  try {
    const token = tokenDe(peticion);
    const quien = token ? await deps.usuarioDelToken(token) : null;
    if (!quien) return fallar("sin_sesion");

    let cuerpo: unknown;
    try {
      cuerpo = await peticion.json();
    } catch {
      return fallar("datos_invalidos");
    }
    const leido = esquemaCuentas.safeParse(cuerpo);
    if (!leido.success) return fallar("datos_invalidos");
    const datos = leido.data;

    if (datos.accion === "crear_barberia") {
      // Antes de crear la cuenta: que sea admin y que el slug esté libre (la base lo repite).
      const admin = await deps.rpc("admin_puede_crear", { p_admin: quien, p_slug: datos.slug });
      if (admin.error) return fallar(errorDeLaBase(admin.error.message));

      // Si el correo ya tiene cuenta (un dueño con dos barberías), se reusa sin tocar su clave.
      let dueno: string | null = null;
      let clave: string | null = null;
      let nueva = false;
      const existente = await deps.rpc("cuenta_por_correo", { p_correo: datos.correoDueno });
      if (existente.error) return fallar("error");
      if (typeof existente.data === "string") {
        dueno = existente.data;
      } else {
        clave = deps.claveTemporal();
        const creada = await deps.crearCuenta(datos.correoDueno, clave);
        if (creada.error || !creada.data) {
          return fallar(creada.error && correoRepetido(creada.error) ? "correo_en_uso" : "error");
        }
        dueno = creada.data.id;
        nueva = true;
      }

      const alta = await deps.rpc("alta_barberia", {
        p_admin: quien,
        p_nombre: datos.nombre,
        p_slug: datos.slug,
        p_zona: datos.zona,
        p_dueno: dueno,
      });
      if (alta.error) {
        // Sin barbería, la cuenta recién creada no sirve: se borra para poder reintentar.
        if (nueva) await deps.borrarCuenta(dueno);
        return fallar(errorDeLaBase(alta.error.message));
      }
      return responder(200, { slug: datos.slug, correo: datos.correoDueno, clave });
    }

    if (datos.accion === "crear_cuenta_barbero") {
      const permiso = await deps.rpc("dueno_puede_ligar", {
        p_dueno: quien,
        p_barbero: datos.barberoId,
      });
      if (permiso.error) return fallar(errorDeLaBase(permiso.error.message));

      const clave = deps.claveTemporal();
      const creada = await deps.crearCuenta(datos.correo, clave);
      if (creada.error || !creada.data) {
        return fallar(creada.error && correoRepetido(creada.error) ? "correo_en_uso" : "error");
      }
      const ligada = await deps.rpc("ligar_cuenta_barbero", {
        p_dueno: quien,
        p_barbero: datos.barberoId,
        p_cuenta: creada.data.id,
      });
      if (ligada.error) {
        await deps.borrarCuenta(creada.data.id);
        return fallar(errorDeLaBase(ligada.error.message));
      }
      return responder(200, { correo: datos.correo, clave });
    }

    const cuenta = await deps.rpc("cuenta_para_restablecer", {
      p_quien: quien,
      p_barbero: datos.accion === "restablecer_barbero" ? datos.barberoId : null,
      p_barberia: datos.accion === "restablecer_dueno" ? datos.barberiaId : null,
    });
    if (cuenta.error) return fallar(errorDeLaBase(cuenta.error.message));
    if (typeof cuenta.data !== "string") return fallar("error");
    const clave = deps.claveTemporal();
    const cambio = await deps.cambiarClave(cuenta.data, clave);
    if (cambio.error) return fallar("error");
    return responder(200, { clave });
  } catch {
    // Nunca se devuelve el detalle de un error interno (fallo 8).
    return fallar("error");
  }
}
