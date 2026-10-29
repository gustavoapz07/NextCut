// Lo que comparten las pruebas de punta a punta: hablar con Supabase como lo haría un cliente.

import { type APIRequestContext, expect } from "@playwright/test";

export const SUPABASE = process.env.VITE_SUPABASE_URL ?? "";
export const CLAVE = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";
export const SLUG = process.env.E2E_SLUG ?? "barberia-prueba";
export const SLUG_OTRA = process.env.E2E_SLUG_OTRA ?? "prueba-dos";
/** Cuenta de barbero de prueba (scripts/e2e/barbero-prueba.sql); vive en .env.local. */
export const BARBERO_CORREO = process.env.E2E_BARBERO_CORREO ?? "";
export const BARBERO_CLAVE = process.env.E2E_BARBERO_CLAVE ?? "";
/** Token de prueba de Cloudflare; lo acepta la clave secreta de prueba del proyecto. */
const TOKEN_DE_PRUEBA = "XXXX.DUMMY.TOKEN.XXXX";

const encabezados = { apikey: CLAVE, "Content-Type": "application/json" };

export interface Fila {
  barberia: { id: string; nombre: string };
  barberos: { id: string; nombre: string }[];
  servicios: { id: string; nombre: string }[];
}

export function primero<T>(lista: T[], que: string): T {
  const elemento = lista[0];
  if (elemento === undefined) throw new Error(`La barbería de prueba no tiene ${que}`);
  return elemento;
}

export async function leerFila(request: APIRequestContext, slug: string): Promise<Fila> {
  const respuesta = await request.post(`${SUPABASE}/rest/v1/rpc/fila_publica`, {
    headers: encabezados,
    data: { p_slug: slug },
  });
  expect(respuesta.ok(), `fila_publica(${slug})`).toBe(true);
  const fila = (await respuesta.json()) as Fila | null;
  if (!fila) throw new Error(`No existe ${slug}: corre scripts/e2e/barberias-prueba.sql`);
  return fila;
}

const hex = (bytes: number) =>
  Array.from(crypto.getRandomValues(new Uint8Array(bytes)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");

export function datosTurno(cambios: Record<string, unknown>) {
  return {
    slug: SLUG,
    nombre: "Prueba Automática",
    telefono: null,
    barberoId: null,
    servicioId: "",
    origen: "remoto",
    secreto: hex(32),
    clave: crypto.randomUUID(),
    turnstile: TOKEN_DE_PRUEBA,
    ...cambios,
  };
}

export function anotarPorApi(request: APIRequestContext, datos: ReturnType<typeof datosTurno>) {
  return request.post(`${SUPABASE}/functions/v1/unirse-a-fila`, {
    headers: encabezados,
    data: datos,
  });
}

export async function cancelarPorApi(request: APIRequestContext, codigo: string, secreto: string) {
  const respuesta = await request.post(`${SUPABASE}/rest/v1/rpc/cancelar_turno`, {
    headers: encabezados,
    data: { p_codigo: codigo, p_secreto: secreto },
  });
  return respuesta.json();
}
