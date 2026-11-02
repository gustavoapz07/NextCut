// Prueba de carga y abuso del Sprint 4 (fallo 9; docs/plan-implementacion.md, sección 9).
// 50 intentos de anotarse en línea al mismo tiempo, como los manda la Edge Function:
// 1. Desde 50 IPs distintas: entran 10 (el límite de la pausa automática), la fila en línea se
//    pausa sola, el resto recibe `fila_remota_pausada` y la alerta queda una sola vez.
// 2. Desde una sola IP: entran 5 (el límite por IP) y el resto recibe `limite_ip`.
// Con la fila en línea pausada, en el local se siguen anotando.
//
// Uso (con Supabase local levantado): npm run test:carga
// DATABASE_URL apunta por defecto a la base local de `supabase start`.
import { createHash, randomUUID } from "node:crypto";
import pg from "pg";

const url = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
const INTENTOS = 50;
const CONEXIONES = 20;
const prefijo = `carga-${Date.now().toString(36)}`;
const muchasIps = { id: randomUUID(), servicio: randomUUID(), slug: `${prefijo}-ips` };
const unaIp = { id: randomUUID(), servicio: randomUUID(), slug: `${prefijo}-ip` };

let fallas = 0;
function revisar(condicion, mensaje) {
  console.log(`${condicion ? "ok" : "FALLA"} - ${mensaje}`);
  if (!condicion) fallas++;
}

const hashDe = (texto) => createHash("sha256").update(texto).digest("hex");

/** Un intento de anotarse. Devuelve "anotado" o el código del error de la base. */
async function intentar(pool, barberia, nombre, ipHash, origen = "remoto") {
  try {
    await pool.query(
      "select public.unirse_a_fila($1, $2, $3, $4, null, null, $5::public.origen_turno, $6) as turno",
      [barberia.id, nombre, barberia.servicio, randomUUID() + randomUUID(), origen, ipHash],
    );
    return "anotado";
  } catch (error) {
    return error.message;
  }
}

/** Los intentos, todos a la vez, repartidos entre las conexiones del pool. */
async function rafaga(pool, barberia, ipDe) {
  const inicio = Date.now();
  const resultados = await Promise.all(
    Array.from({ length: INTENTOS }, (_, i) => intentar(pool, barberia, `Bot ${i + 1}`, ipDe(i))),
  );
  const conteo = {};
  for (const r of resultados) conteo[r] = (conteo[r] ?? 0) + 1;
  return { conteo, ms: Date.now() - inicio };
}

async function preparar(admin) {
  for (const b of [muchasIps, unaIp]) {
    await admin.query(
      "insert into public.barberias (id, nombre, slug, max_fila) values ($1, $2, $3, 100)",
      [b.id, `Carga ${b.slug}`, b.slug],
    );
    await admin.query(
      "insert into public.servicios (id, barberia_id, nombre, duracion_min) values ($1, $2, 'Corte', 30)",
      [b.servicio, b.id],
    );
  }
}

async function estado(admin, barberia) {
  const { rows } = await admin.query(
    `select b.fila_remota_activa, b.pausa_automatica_en,
            (select count(*)::int from public.eventos_turno e
             where e.barberia_id = b.id and e.accion = 'pausa_automatica') as alertas
     from public.barberias b where b.id = $1`,
    [barberia.id],
  );
  return rows[0];
}

async function pruebaMuchasIps(admin, pool) {
  const { conteo, ms } = await rafaga(pool, muchasIps, (i) => hashDe(`${prefijo}-ip-${i}`));
  console.log(`  ${INTENTOS} intentos desde ${INTENTOS} IPs en ${ms} ms:`, conteo);
  revisar(ms < 60_000, "los 50 intentos caben en un minuto");
  revisar(conteo.anotado === 10, "entran exactamente 10, el límite de la pausa automática");
  revisar(conteo.fila_remota_pausada === 40, "los otros 40 encuentran la fila en línea pausada");
  const b = await estado(admin, muchasIps);
  revisar(
    !b.fila_remota_activa && b.pausa_automatica_en !== null,
    "la fila en línea queda pausada y marcada como pausa automática",
  );
  revisar(b.alertas === 1, "la alerta queda una sola vez en la bitácora");
  revisar(
    (await intentar(pool, muchasIps, "En El Local", hashDe(`${prefijo}-local`), "local")) ===
      "anotado",
    "con la fila en línea pausada, en el local se siguen anotando",
  );
}

async function pruebaUnaIp(admin, pool) {
  const ip = hashDe(`${prefijo}-una-ip`);
  const { conteo, ms } = await rafaga(pool, unaIp, () => ip);
  console.log(`  ${INTENTOS} intentos desde una IP en ${ms} ms:`, conteo);
  revisar(conteo.anotado === 5, "entran exactamente 5, el límite por IP");
  revisar(conteo.limite_ip === 45, "los otros 45 reciben limite_ip");
  const b = await estado(admin, unaIp);
  revisar(b.fila_remota_activa, "con 5 turnos la pausa automática no salta");
}

const admin = new pg.Client({ connectionString: url });
const pool = new pg.Pool({ connectionString: url, max: CONEXIONES });
// La Edge Function llama con la clave secreta.
pool.on("connect", (cliente) => cliente.query("set role service_role"));
await admin.connect();
try {
  await preparar(admin);
  await pruebaMuchasIps(admin, pool);
  await pruebaUnaIp(admin, pool);
} catch (error) {
  console.error("FALLA - la prueba no terminó:", error.message);
  fallas++;
} finally {
  await admin
    .query("delete from public.barberias where id = any($1::uuid[])", [[muchasIps.id, unaIp.id]])
    .catch((error) => console.error("No se pudo limpiar:", error.message));
  await pool.end();
  await admin.end();
}

console.log(fallas === 0 ? "\nCarga: todo en verde." : `\nCarga: ${fallas} falla(s).`);
process.exit(fallas === 0 ? 0 : 1);
