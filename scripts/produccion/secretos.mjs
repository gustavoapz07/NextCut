// Carga de una vez los secretos de producción (docs/produccion.md, paso 3) sin mostrarlos:
// - pide la Secret Key del widget de Turnstile (no se ve al pegarla);
// - genera IP_SALT y el par de claves VAPID;
// - guarda en Supabase TURNSTILE_SECRET, ORIGENES_PERMITIDOS, IP_SALT, VAPID_PUBLIC_KEY y
//   VAPID_PRIVATE_KEY con la CLI;
// - escribe la clave pública VAPID en .env.production.local. La Site Key de Turnstile ya tiene
//   que estar ahí (VITE_TURNSTILE_SITE_KEY).
//
// Requiere sesión en la CLI (`npx supabase login`, una vez). Uso, desde la carpeta del proyecto:
//   node scripts/produccion/secretos.mjs
//   node scripts/produccion/secretos.mjs --sin-guardar   → ensayo: no toca Supabase ni archivos
//
// Correrlo otra vez cambia las claves VAPID: los avisos que ya estaban activados dejan de llegar
// hasta que cada cliente vuelva a tocar "Avisarme".

import { spawnSync } from "node:child_process";
import { randomBytes, webcrypto } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";

const PROYECTO = "ctexofluhhsnsxenblgp";
const SITIO = "https://nextcut-produccion.gustavoapz07.workers.dev";
const ENV_PRODUCCION = fileURLToPath(new URL("../../.env.production.local", import.meta.url));
const ensayo = process.argv.includes("--sin-guardar");

function salir(mensaje) {
  console.error(mensaje);
  console.error("No se guardó nada.");
  process.exit(1);
}

let env = "";
try {
  env = readFileSync(ENV_PRODUCCION, "utf8");
} catch {
  salir("No existe .env.production.local (docs/produccion.md, paso 7).");
}
const sitioTurnstile = env.match(/^VITE_TURNSTILE_SITE_KEY=(.*)$/m)?.[1]?.trim() ?? "";
if (!sitioTurnstile) salir("Falta VITE_TURNSTILE_SITE_KEY en .env.production.local.");

/** Lee una línea sin mostrar lo que se escribe o se pega. */
function leerOculto(texto) {
  return new Promise((resolver) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    let mostrarPregunta = true;
    rl._writeToOutput = (s) => {
      if (mostrarPregunta) process.stdout.write(s);
    };
    rl.question(texto, (respuesta) => {
      rl.close();
      process.stdout.write("\n");
      resolver(respuesta.trim());
    });
    mostrarPregunta = false;
  });
}

const secretaTurnstile = await leerOculto(
  "Pega la Secret Key de Turnstile (no se va a ver) y presiona Enter: ",
);
if (!/^0x[A-Za-z0-9_-]{10,}$/.test(secretaTurnstile) || secretaTurnstile === sitioTurnstile) {
  salir("Eso no parece la Secret Key: empieza con 0x y es distinta de la Site Key.");
}

const base64url = (bytes) => Buffer.from(bytes).toString("base64url");
const par = await webcrypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, [
  "sign",
]);
const vapidPublica = base64url(
  new Uint8Array(await webcrypto.subtle.exportKey("raw", par.publicKey)),
);
const { d: vapidPrivada } = await webcrypto.subtle.exportKey("jwk", par.privateKey);

const secretos = {
  TURNSTILE_SECRET: secretaTurnstile,
  ORIGENES_PERMITIDOS: SITIO,
  IP_SALT: randomBytes(32).toString("base64url"),
  VAPID_PUBLIC_KEY: vapidPublica,
  VAPID_PRIVATE_KEY: vapidPrivada,
};

if (ensayo) {
  console.log(`Ensayo: se guardarían en ${PROYECTO}: ${Object.keys(secretos).join(", ")}.`);
  console.log("Ensayo: se escribiría VITE_VAPID_PUBLIC_KEY en .env.production.local.");
  process.exit(0);
}

// Los secretos van por un archivo temporal que se borra al terminar: nunca a la pantalla.
const carpeta = mkdtempSync(join(tmpdir(), "nextcut-secretos-"));
const archivo = join(carpeta, "secretos.env");
try {
  writeFileSync(
    archivo,
    `${Object.entries(secretos)
      .map(([nombre, valor]) => `${nombre}=${valor}`)
      .join("\n")}\n`,
    { mode: 0o600 },
  );
  console.log("Guardando los secretos en Supabase...");
  const resultado = spawnSync(
    "npx",
    ["supabase", "secrets", "set", "--env-file", archivo, "--project-ref", PROYECTO],
    { stdio: ["ignore", "ignore", "inherit"], shell: process.platform === "win32" },
  );
  if (resultado.status !== 0) {
    salir("La CLI no pudo guardar los secretos. Corre `npx supabase login` y repite.");
  }
} finally {
  rmSync(carpeta, { recursive: true, force: true });
}

// La clave pública VAPID va al build (es pública por diseño).
const linea = `VITE_VAPID_PUBLIC_KEY=${vapidPublica}`;
env = /^VITE_VAPID_PUBLIC_KEY=.*$/m.test(env)
  ? env.replace(/^VITE_VAPID_PUBLIC_KEY=.*$/m, linea)
  : `${env.trimEnd()}\n${linea}\n`;
writeFileSync(ENV_PRODUCCION, env);

console.log(
  "Listo: 5 secretos guardados en Supabase y la clave pública VAPID en .env.production.local.",
);
