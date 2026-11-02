// Prueba de carga contra la Edge Function publicada (fallo 9): 50 intentos de anotarse en
// línea en menos de un minuto desde esta computadora. Cada intento manda `x-forwarded-for` y
// `x-real-ip` falsos para comprobar que no sirven para saltarse el límite por IP. Como todos
// salen de la misma IP real, deben entrar como máximo 5 y el resto recibir `limite_ip` (429).
// Al final cancela los turnos que entraron.
//
// Uso: node scripts/carga-api.mjs [slug]   (por omisión, barberia-prueba)
// Lee VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY de .env.local. Solo sirve con el
// proyecto de pruebas: manda el token de prueba de Turnstile.
import { randomBytes, randomUUID } from "node:crypto";

try {
  process.loadEnvFile(".env.local");
} catch {
  // Sin archivo, se usan las variables del entorno.
}
const URL_BASE = process.env.VITE_SUPABASE_URL;
const CLAVE = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!URL_BASE || !CLAVE) {
  console.error("Faltan VITE_SUPABASE_URL o VITE_SUPABASE_PUBLISHABLE_KEY en .env.local.");
  process.exit(1);
}
const SLUG = process.argv[2] ?? "barberia-prueba";
const INTENTOS = 50;
const A_LA_VEZ = 5;
const LIMITE_IP = 5;
const encabezados = { apikey: CLAVE, "Content-Type": "application/json" };

async function rpc(nombre, datos) {
  const respuesta = await fetch(`${URL_BASE}/rest/v1/rpc/${nombre}`, {
    method: "POST",
    headers: encabezados,
    body: JSON.stringify(datos),
  });
  return respuesta.json();
}

const fila = await rpc("fila_publica", { p_slug: SLUG });
if (!fila?.servicios?.length) {
  console.error(`No existe la barbería ${SLUG} o no tiene servicios.`);
  process.exit(1);
}
if (!fila.barberia.fila_remota_activa || fila.barberia.abierta === false) {
  console.error("La fila en línea está cerrada: ábrela antes de probar.");
  process.exit(1);
}

const anotados = [];
async function intentar(i) {
  const secreto = randomBytes(32).toString("hex");
  const ipFalsa = `203.0.113.${i + 1}`;
  const respuesta = await fetch(`${URL_BASE}/functions/v1/unirse-a-fila`, {
    method: "POST",
    headers: { ...encabezados, "x-forwarded-for": ipFalsa, "x-real-ip": ipFalsa },
    body: JSON.stringify({
      slug: SLUG,
      nombre: `Carga ${i + 1}`,
      telefono: null,
      barberoId: null,
      servicioId: fila.servicios[0].id,
      origen: "remoto",
      secreto,
      clave: randomUUID(),
      turnstile: "XXXX.DUMMY.TOKEN.XXXX",
    }),
  });
  const cuerpo = await respuesta.json().catch(() => ({}));
  if (cuerpo.codigo) anotados.push({ codigo: cuerpo.codigo, secreto });
  return cuerpo.codigo ? "anotado" : `${respuesta.status} ${cuerpo.error ?? "?"}`;
}

const inicio = Date.now();
const conteo = {};
for (let i = 0; i < INTENTOS; i += A_LA_VEZ) {
  const tanda = Array.from({ length: Math.min(A_LA_VEZ, INTENTOS - i) }, (_, j) => intentar(i + j));
  for (const r of await Promise.all(tanda)) conteo[r] = (conteo[r] ?? 0) + 1;
}
const segundos = ((Date.now() - inicio) / 1000).toFixed(1);
console.log(`${INTENTOS} intentos en ${segundos} s:`, conteo);

const despues = await rpc("fila_publica", { p_slug: SLUG });
console.log("Fila en línea abierta después:", despues.barberia.fila_remota_activa);

let cancelados = 0;
for (const t of anotados) {
  if ((await rpc("cancelar_turno", { p_codigo: t.codigo, p_secreto: t.secreto })) === true) {
    cancelados++;
  }
}
console.log(`Cancelados: ${cancelados} de ${anotados.length}.`);

const bien =
  Number(segundos) < 60 &&
  anotados.length <= LIMITE_IP &&
  (conteo["429 limite_ip"] ?? 0) === INTENTOS - anotados.length &&
  cancelados === anotados.length;
console.log(
  bien
    ? `\nCarga: en verde. Entraron ${anotados.length} (máximo ${LIMITE_IP}) y las IP falsas no sirvieron.`
    : "\nCarga: FALLA. Revisa el conteo.",
);
process.exit(bien ? 0 : 1);
