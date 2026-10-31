// Crea las claves VAPID de los avisos por Web Push y las deja donde van, sin mostrarlas:
// - la pública en .env.local (VITE_VAPID_PUBLIC_KEY), que la usa el navegador;
// - la pública y la privada en los secretos de la Edge Function `avisos` (VAPID_PUBLIC_KEY y
//   VAPID_PRIVATE_KEY), con la CLI de Supabase.
//
// Requiere sesión en la CLI (`npx supabase login`, una vez). Uso:
//   node scripts/claves-vapid.mjs                 → proyecto de VITE_SUPABASE_URL en .env.local
//   node scripts/claves-vapid.mjs <project-ref>   → otro proyecto (producción)
//
// Cambiar las claves invalida las suscripciones que ya existen: cada navegador se vuelve a
// suscribir solo la próxima vez que la persona toque "Avisarme".

import { spawnSync } from "node:child_process";
import { webcrypto } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ENV_LOCAL = fileURLToPath(new URL("../.env.local", import.meta.url));

function leerEnv() {
  try {
    return readFileSync(ENV_LOCAL, "utf8");
  } catch {
    return "";
  }
}

const env = leerEnv();
const url = env.match(/^VITE_SUPABASE_URL=(.*)$/m)?.[1]?.trim() ?? "";
const proyecto = process.argv[2] ?? url.match(/^https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1];
if (!proyecto) {
  console.error("No sé a qué proyecto cargar las claves: pasa el project-ref como argumento.");
  process.exit(1);
}

const base64url = (bytes) => Buffer.from(bytes).toString("base64url");
const par = await webcrypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, [
  "sign",
]);
const publica = base64url(new Uint8Array(await webcrypto.subtle.exportKey("raw", par.publicKey)));
const { d: privada } = await webcrypto.subtle.exportKey("jwk", par.privateKey);

// Los secretos van por un archivo temporal que se borra al terminar: nunca a la pantalla.
const carpeta = mkdtempSync(join(tmpdir(), "nextcut-vapid-"));
const archivo = join(carpeta, "vapid.env");
try {
  writeFileSync(archivo, `VAPID_PUBLIC_KEY=${publica}\nVAPID_PRIVATE_KEY=${privada}\n`, {
    mode: 0o600,
  });
  const resultado = spawnSync(
    "npx",
    ["supabase", "secrets", "set", "--env-file", archivo, "--project-ref", proyecto],
    { stdio: "inherit", shell: process.platform === "win32" },
  );
  if (resultado.status !== 0) {
    console.error("La CLI no pudo guardar los secretos. ¿Corriste `npx supabase login`?");
    process.exit(1);
  }
} finally {
  rmSync(carpeta, { recursive: true, force: true });
}

// La pública es pública por diseño: va al navegador.
if (!process.argv[2]) {
  const linea = `VITE_VAPID_PUBLIC_KEY=${publica}`;
  const nuevo = /^VITE_VAPID_PUBLIC_KEY=.*$/m.test(env)
    ? env.replace(/^VITE_VAPID_PUBLIC_KEY=.*$/m, linea)
    : `${env.trimEnd()}\n${linea}\n`;
  writeFileSync(ENV_LOCAL, nuevo);
  console.log("Listo: secretos cargados en Supabase y clave pública en .env.local.");
} else {
  console.log(
    `Listo: secretos cargados en ${proyecto}. Pon esta clave pública en VITE_VAPID_PUBLIC_KEY del build: ${publica}`,
  );
}
