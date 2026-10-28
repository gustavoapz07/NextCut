// Edge Function unirse-a-fila (ADR-007). La lógica vive en ../_shared/unirse.ts y se prueba con
// Vitest; aquí solo se conectan los secretos, Cloudflare y la base.
//
// Secretos: TURNSTILE_SECRET (obligatorio) y ORIGENES_PERMITIDOS (lista separada por comas).
// La clave secreta de Supabase llega sola en SUPABASE_SECRET_KEYS.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import { hmacHex, manejarUnirse, verificarTurnstile } from "../_shared/unirse.ts";

function claveSecreta() {
  try {
    return String(JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}").default ?? "");
  } catch {
    return "";
  }
}

const url = Deno.env.get("SUPABASE_URL") ?? "";
const clave = claveSecreta();
const secretoTurnstile = Deno.env.get("TURNSTILE_SECRET") ?? "";
// El hash de la IP usa su propia sal si existe; si no, la clave secreta, que nunca sale de aquí.
const sal = Deno.env.get("IP_SALT") || clave;
const origenes = (Deno.env.get("ORIGENES_PERMITIDOS") ?? "http://localhost:5173")
  .split(",")
  .map((origen) => origen.trim())
  .filter(Boolean);

const admin = createClient(url, clave, {
  auth: { persistSession: false, autoRefreshToken: false },
});

Deno.serve((peticion) =>
  manejarUnirse(peticion, {
    configurado: Boolean(url && clave && secretoTurnstile),
    origenes,
    verificarTurnstile: (token, ip, idempotencia) =>
      verificarTurnstile(fetch, secretoTurnstile, token, ip, idempotencia),
    filaPublica: (slug) => admin.rpc("fila_publica", { p_slug: slug }),
    unirseAFila: (argumentos) => admin.rpc("unirse_a_fila", argumentos),
    hashIp: (ip) => hmacHex(sal, ip),
    ahora: () => new Date(),
  }),
);
