// Revisa que el build (dist/) no lleve claves secretas antes de publicarlo (fallo 1 de
// docs/seguridad.md). Corre en la CI después del build y antes de cada `npm run deploy`.
//
// Busca claves reales, no palabras: `supabase-js` trae el texto `sb_secret_` para reconocer el
// prefijo de las claves, así que buscar solo el prefijo da una falsa alarma.
// 1. Claves secretas de Supabase (`sb_secret_` seguido de la clave).
// 2. JWT con el rol `service_role` o `supabase_admin` (las claves heredadas).
// 3. Llaves privadas en formato PEM.
// 4. El valor de cada variable sin prefijo `VITE_` de los .env de la raíz y de las variables de
//    entorno con nombre de secreto. Vite solo mete en el build las que empiezan con `VITE_`;
//    si aparece otra, alguien la importó a mano.
// 5. Archivos .map: traen el código fuente completo y no se publican.
//
// Uso: npm run revisar:build            → revisa dist/
//      node scripts/revisar-build.mjs <carpeta>
// Nunca imprime el valor encontrado, solo el archivo y la regla.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const TEXTO = new Set([".js", ".mjs", ".css", ".html", ".json", ".webmanifest", ".txt", ".svg"]);
const NOMBRE_DE_SECRETO = /SECRET|PRIVATE|CLAVE|PASSWORD|TOKEN|SALT|API_KEY|SERVICE_ROLE/i;
const LARGO_MINIMO = 8;

const REGLAS = [
  { regla: "clave secreta de Supabase", patron: /sb_secret_[A-Za-z0-9_-]{16,}/ },
  { regla: "llave privada PEM", patron: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
];

const JWT = /eyJ[A-Za-z0-9_-]{10,}\.(eyJ[A-Za-z0-9_-]+)\.[A-Za-z0-9_-]+/g;

function rolDelJwt(cuerpo) {
  try {
    return JSON.parse(Buffer.from(cuerpo, "base64url").toString("utf8")).role;
  } catch {
    return undefined;
  }
}

/**
 * Busca secretos en un texto. `valores` son los textos que no pueden aparecer (los secretos de los
 * .env), con el nombre de su variable. Devuelve las reglas que fallaron, sin el valor.
 */
export function buscarSecretos(texto, valores = []) {
  const hallazgos = [];
  for (const { regla, patron } of REGLAS) {
    if (patron.test(texto)) hallazgos.push(regla);
  }
  for (const [, cuerpo] of texto.matchAll(JWT)) {
    const rol = rolDelJwt(cuerpo);
    if (rol === "service_role" || rol === "supabase_admin") {
      hallazgos.push(`JWT con rol ${rol}`);
      break;
    }
  }
  for (const { nombre, valor } of valores) {
    if (valor.length >= LARGO_MINIMO && texto.includes(valor)) {
      hallazgos.push(`valor de ${nombre}`);
    }
  }
  return hallazgos;
}

/** Lee las variables de un archivo .env (sin expandir nada). */
export function leerEnv(contenido) {
  const variables = [];
  for (const linea of contenido.split(/\r?\n/)) {
    const encontrado = linea.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!encontrado) continue;
    const valor = encontrado[2].trim().replace(/^(['"])(.*)\1$/, "$2");
    variables.push({ nombre: encontrado[1], valor });
  }
  return variables;
}

/** Los valores que no pueden aparecer en el build: lo que no es `VITE_` en los .env y el entorno. */
function valoresProhibidos() {
  const valores = [];
  for (const archivo of readdirSync(RAIZ)) {
    if (!archivo.startsWith(".env") || archivo === ".env.example") continue;
    for (const variable of leerEnv(readFileSync(join(RAIZ, archivo), "utf8"))) {
      if (!variable.nombre.startsWith("VITE_")) valores.push(variable);
    }
  }
  for (const [nombre, valor] of Object.entries(process.env)) {
    if (valor && !nombre.startsWith("VITE_") && NOMBRE_DE_SECRETO.test(nombre)) {
      valores.push({ nombre, valor });
    }
  }
  return valores;
}

function archivosDe(carpeta) {
  const archivos = [];
  for (const nombre of readdirSync(carpeta)) {
    const ruta = join(carpeta, nombre);
    if (statSync(ruta).isDirectory()) archivos.push(...archivosDe(ruta));
    else archivos.push(ruta);
  }
  return archivos;
}

function revisar(carpeta) {
  let archivos;
  try {
    archivos = archivosDe(carpeta);
  } catch {
    console.error(`No existe ${carpeta}: corre el build primero.`);
    return 1;
  }
  const valores = valoresProhibidos();
  let fallas = 0;
  let revisados = 0;
  for (const archivo of archivos) {
    const nombre = relative(carpeta, archivo);
    if (extname(archivo) === ".map") {
      console.error(`FALLA - ${nombre}: archivo .map (trae el código fuente)`);
      fallas++;
      continue;
    }
    if (!TEXTO.has(extname(archivo))) continue;
    revisados++;
    for (const hallazgo of buscarSecretos(readFileSync(archivo, "utf8"), valores)) {
      console.error(`FALLA - ${nombre}: ${hallazgo}`);
      fallas++;
    }
  }
  if (revisados === 0) {
    console.error(`${carpeta} no tiene archivos para revisar.`);
    return 1;
  }
  console.log(
    fallas === 0
      ? `ok - ${revisados} archivos sin claves secretas (${valores.length} valores de .env y del entorno comparados)`
      : `${fallas} problema(s): no publiques este build.`,
  );
  return fallas === 0 ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = revisar(process.argv[2] ?? join(RAIZ, "dist"));
}
