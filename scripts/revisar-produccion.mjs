// Revisa las variables de producción antes de armar el build (`npm run deploy:produccion`).
//
// Vite también carga .env.local al armar producción, y .env.local apunta al proyecto de pruebas.
// Si a .env.production.local le falta una variable, el build saldría conectado a la base de
// pruebas sin ningún aviso. Este script lo frena:
// - URL y clave publicable de Supabase: obligatorias y distintas de las de .env.local.
// - Turnstile: obligatoria y no una clave de prueba de Cloudflare (esas dejan pasar a cualquiera).
// - Clave pública VAPID: obligatoria y distinta de la de pruebas (cada proyecto tiene las suyas).
// - Contacto de privacidad: opcional; si falta, solo avisa.
// Nunca imprime los valores.

import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadEnv } from "vite";
import { leerEnv } from "./revisar-build.mjs";

const RAIZ = fileURLToPath(new URL("..", import.meta.url));

// Claves de sitio de prueba de Cloudflare Turnstile: 1x…AA, 2x…AB, 3x…FF, etc.
const TURNSTILE_DE_PRUEBA = /^[123]x0{20}[A-F]{2}$/;

/**
 * Devuelve los problemas (que frenan la publicación) y los avisos (que no) de las variables de
 * producción `env`, comparadas con las de pruebas `pruebas`.
 */
export function revisarVariables(env, pruebas = {}) {
  const problemas = [];
  const avisos = [];
  const igualAPruebas = (nombre) =>
    env[nombre] && pruebas[nombre] && env[nombre] === pruebas[nombre];

  const url = env.VITE_SUPABASE_URL ?? "";
  if (!url) problemas.push("falta VITE_SUPABASE_URL");
  else if (!/^https:\/\/[a-z0-9]{20}\.supabase\.co\/?$/.test(url))
    problemas.push("VITE_SUPABASE_URL no es la URL de un proyecto de Supabase en la nube");
  else if (igualAPruebas("VITE_SUPABASE_URL"))
    problemas.push("VITE_SUPABASE_URL es la del proyecto de pruebas (.env.local)");

  const clave = env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";
  if (!clave) problemas.push("falta VITE_SUPABASE_PUBLISHABLE_KEY");
  else if (!clave.startsWith("sb_publishable_"))
    problemas.push("VITE_SUPABASE_PUBLISHABLE_KEY no empieza con sb_publishable_");
  else if (igualAPruebas("VITE_SUPABASE_PUBLISHABLE_KEY"))
    problemas.push("VITE_SUPABASE_PUBLISHABLE_KEY es la del proyecto de pruebas (.env.local)");

  const turnstile = env.VITE_TURNSTILE_SITE_KEY ?? "";
  if (!turnstile) problemas.push("falta VITE_TURNSTILE_SITE_KEY");
  else if (TURNSTILE_DE_PRUEBA.test(turnstile))
    problemas.push("VITE_TURNSTILE_SITE_KEY es una clave de prueba de Cloudflare");

  const vapid = env.VITE_VAPID_PUBLIC_KEY ?? "";
  if (!vapid) problemas.push("falta VITE_VAPID_PUBLIC_KEY");
  else if (igualAPruebas("VITE_VAPID_PUBLIC_KEY"))
    problemas.push("VITE_VAPID_PUBLIC_KEY es la del proyecto de pruebas (.env.local)");

  if (!env.VITE_CONTACTO_PRIVACIDAD?.trim())
    avisos.push("sin VITE_CONTACTO_PRIVACIDAD: el aviso de privacidad solo remite a la barbería");
  if (!env.VITE_SENTRY_DSN) avisos.push("sin VITE_SENTRY_DSN: los errores no llegan a Sentry");

  return { problemas, avisos };
}

function leerPruebas() {
  try {
    return Object.fromEntries(
      leerEnv(readFileSync(new URL("../.env.local", import.meta.url), "utf8")).map((v) => [
        v.nombre,
        v.valor,
      ]),
    );
  } catch {
    return {};
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const env = loadEnv("production", RAIZ, "VITE_");
  const { problemas, avisos } = revisarVariables(env, leerPruebas());
  for (const aviso of avisos) console.warn(`aviso - ${aviso}`);
  for (const problema of problemas) console.error(`FALLA - ${problema}`);
  if (problemas.length > 0) {
    console.error("Revisa .env.production.local (plantilla: .env.production.example).");
    process.exitCode = 1;
  } else {
    console.log("ok - variables de producción listas");
  }
}
