// Anotarse en la fila (ADR-007). Esta es la lógica de la Edge Function `unirse-a-fila`, sin nada
// propio de Deno, para probarla con Vitest. El formulario usa los mismos esquemas.
//
// Orden: valida los datos → verifica Turnstile → lee la fila (para guardar el estimado) →
// llama a `unirse_a_fila` con la clave secreta. La base vuelve a validar todo.

import { z } from "zod";
import { estimarNuevo } from "./eta.ts";
import { entradaEta, esquemaFilaPublica } from "./filaPublica.ts";

/**
 * Caracteres de control y los que invierten el texto en pantalla (U+202A–U+202E, U+2066–U+2069).
 * Van como escapes para que el código no tenga caracteres invisibles.
 */
const INVISIBLES = /[\p{Cc}\u202A-\u202E\u2066-\u2069]/gu;

/** Quita espacios de más, caracteres de control y los que invierten el texto en pantalla. */
export function limpiarNombre(nombre: string) {
  return nombre.replace(INVISIBLES, "").replace(/\s+/g, " ").trim();
}

export const esquemaNombre = z
  .string()
  .max(200)
  .transform(limpiarNombre)
  .pipe(z.string().min(2).max(40));
export const esquemaTelefono = z.string().regex(/^\+504[0-9]{8}$/);

/** Lo que manda el formulario. */
export const esquemaUnirse = z.object({
  slug: z
    .string()
    .min(3)
    .max(40)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  nombre: esquemaNombre,
  telefono: esquemaTelefono.nullable(),
  /** `null`: "el primero libre". */
  barberoId: z.uuid().nullable(),
  servicioId: z.uuid(),
  origen: z.enum(["local", "remoto"]),
  /** Secreto para cancelar, generado en el navegador; la base guarda solo su hash. */
  secreto: z.string().regex(/^[0-9a-f]{64}$/),
  /** Clave de idempotencia: un doble envío devuelve el mismo turno. */
  clave: z.uuid(),
  turnstile: z.string().min(1).max(2048),
});

export type DatosUnirse = z.input<typeof esquemaUnirse>;

export const CODIGOS_DE_ERROR = [
  "datos_invalidos",
  "verificacion",
  "no_existe",
  "fila_llena",
  "fila_remota_pausada",
  "telefono_con_turno",
  "limite_ip",
  "error",
] as const;
export type CodigoError = (typeof CODIGOS_DE_ERROR)[number];

const ESTADO_HTTP: Record<CodigoError, number> = {
  datos_invalidos: 400,
  verificacion: 403,
  no_existe: 404,
  fila_llena: 409,
  fila_remota_pausada: 409,
  telefono_con_turno: 409,
  limite_ip: 429,
  error: 500,
};

/** Las excepciones de `unirse_a_fila` que el cliente puede entender. Lo demás es "error". */
const ERRORES_DE_LA_BASE: Record<string, CodigoError> = {
  barberia_no_existe: "no_existe",
  fila_llena: "fila_llena",
  fila_remota_pausada: "fila_remota_pausada",
  telefono_con_turno: "telefono_con_turno",
  limite_ip: "limite_ip",
  nombre_invalido: "datos_invalidos",
  telefono_invalido: "datos_invalidos",
  secreto_invalido: "datos_invalidos",
  estimado_invalido: "datos_invalidos",
  servicio_invalido: "datos_invalidos",
  barbero_invalido: "datos_invalidos",
};

export function errorDeLaBase(mensaje: string): CodigoError {
  for (const [clave, codigo] of Object.entries(ERRORES_DE_LA_BASE)) {
    if (mensaje.includes(clave)) return codigo;
  }
  return "error";
}

/**
 * IP del cliente según el borde de Supabase (prueba de riesgo 3, 28/10/2026): Cloudflare pone
 * `cf-connecting-ip` y bloquea a quien lo manda por su cuenta, y `x-real-ip` llega con la IP
 * real aunque el cliente mande otra. `x-forwarded-for` no se usa: su primer valor lo escribe
 * el cliente. Sin estos encabezados (Supabase local) no hay IP y no se aplica el límite por IP.
 */
export function obtenerIp(encabezados: Headers) {
  const candidata = encabezados.get("cf-connecting-ip") ?? encabezados.get("x-real-ip");
  const ip = candidata?.trim();
  return ip && ip.length <= 64 ? ip : null;
}

/** HMAC-SHA256 en hexadecimal. Con él se guarda la IP sin guardarla (fallo 5). */
export async function hmacHex(clave: string, texto: string) {
  const codificar = new TextEncoder();
  const llave = await crypto.subtle.importKey(
    "raw",
    codificar.encode(clave),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const firma = await crypto.subtle.sign("HMAC", llave, codificar.encode(texto));
  return Array.from(new Uint8Array(firma), (b) => b.toString(16).padStart(2, "0")).join("");
}

export const URL_TURNSTILE = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Pregunta a Cloudflare si el token es válido. Con la misma clave, un reintento vuelve a pasar. */
export async function verificarTurnstile(
  pedir: typeof fetch,
  secreto: string,
  token: string,
  ip: string | null,
  idempotencia: string,
) {
  const datos = new FormData();
  datos.append("secret", secreto);
  datos.append("response", token);
  datos.append("idempotency_key", idempotencia);
  if (ip) datos.append("remoteip", ip);
  const respuesta = await pedir(URL_TURNSTILE, { method: "POST", body: datos });
  if (!respuesta.ok) return false;
  const resultado = (await respuesta.json()) as { success?: unknown };
  return resultado.success === true;
}

type RespuestaRpc = { data: unknown; error: { message: string } | null };

export interface Dependencias {
  /** Falta un secreto (clave de Supabase o de Turnstile): se rechaza todo. */
  configurado: boolean;
  /** Orígenes que pueden llamar a la función desde el navegador. */
  origenes: readonly string[];
  verificarTurnstile(token: string, ip: string | null, idempotencia: string): Promise<boolean>;
  filaPublica(slug: string): PromiseLike<RespuestaRpc>;
  unirseAFila(argumentos: Record<string, unknown>): PromiseLike<RespuestaRpc>;
  hashIp(ip: string): Promise<string>;
  ahora(): Date;
}

const esquemaTurnoCreado = z.object({ codigo: z.string(), numero: z.number() });

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

export async function manejarUnirse(peticion: Request, deps: Dependencias): Promise<Response> {
  const cors = encabezadosCors(peticion, deps.origenes);
  const responder = (estado: number, cuerpo: unknown) =>
    new Response(JSON.stringify(cuerpo), {
      status: estado,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  const fallar = (codigo: CodigoError) => responder(ESTADO_HTTP[codigo], { error: codigo });

  if (peticion.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (peticion.method !== "POST") return responder(405, { error: "metodo" });
  if (!deps.configurado) return fallar("error");

  let cuerpo: unknown;
  try {
    cuerpo = await peticion.json();
  } catch {
    return fallar("datos_invalidos");
  }
  const leido = esquemaUnirse.safeParse(cuerpo);
  if (!leido.success) return fallar("datos_invalidos");
  const datos = leido.data;

  try {
    const ip = obtenerIp(peticion.headers);
    if (!(await deps.verificarTurnstile(datos.turnstile, ip, datos.clave))) {
      return fallar("verificacion");
    }

    const fila = await deps.filaPublica(datos.slug);
    if (fila.error) return fallar("error");
    if (fila.data === null) return fallar("no_existe");
    const filaLeida = esquemaFilaPublica.safeParse(fila.data);
    if (!filaLeida.success) return fallar("error");

    // El estimado se guarda para medir después qué tan bien acertó (reporte del día).
    const estimado = estimarNuevo(entradaEta(filaLeida.data, deps.ahora()), {
      barberoId: datos.barberoId,
      servicioId: datos.servicioId,
    });

    const turno = await deps.unirseAFila({
      p_barberia_id: filaLeida.data.barberia.id,
      p_nombre: datos.nombre,
      p_servicio_id: datos.servicioId,
      p_secreto: datos.secreto,
      p_barbero_id: datos.barberoId,
      p_telefono: datos.telefono,
      p_origen: datos.origen,
      p_ip_hash: ip ? await deps.hashIp(ip) : null,
      p_clave: datos.clave,
      p_estimado_min:
        estimado.minutos === null ? null : Math.min(600, Math.round(estimado.minutos)),
    });
    if (turno.error) return fallar(errorDeLaBase(turno.error.message));
    const creado = esquemaTurnoCreado.safeParse(turno.data);
    if (!creado.success) return fallar("error");
    return responder(200, creado.data);
  } catch {
    // Nunca se devuelve el detalle de un error interno (fallo 8).
    return fallar("error");
  }
}
