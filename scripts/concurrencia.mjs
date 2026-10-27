// Prueba de concurrencia del Sprint 1 (docs/plan-implementacion.md, sección 9; fallo 8).
// 1. Mientras un barbero tiene un cliente "en mano", otro que llama a la vez recibe otro cliente.
// 2. Seis barberos llaman al mismo tiempo y cada uno recibe un cliente distinto.
// 3. Un doble envío del formulario (misma clave de idempotencia) crea un solo turno.
//
// Uso (con Supabase local levantado): npm run test:concurrencia
// DATABASE_URL apunta por defecto a la base local de `supabase start`.
import { randomUUID } from "node:crypto";
import pg from "pg";

const url = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
const BARBEROS = 6;
const prefijo = `conc-${Date.now().toString(36)}`;
const barberiaId = randomUUID();
const servicioId = randomUUID();
const usuarios = Array.from({ length: BARBEROS }, () => randomUUID());
const barberos = Array.from({ length: BARBEROS }, () => randomUUID());

let fallas = 0;
function revisar(condicion, mensaje) {
  console.log(`${condicion ? "ok" : "FALLA"} - ${mensaje}`);
  if (!condicion) fallas++;
}

async function conectar() {
  const cliente = new pg.Client({ connectionString: url });
  await cliente.connect();
  return cliente;
}

/** Abre una transacción con la sesión de un usuario, como lo haría la API de Supabase. */
async function comoUsuario(cliente, userId) {
  await cliente.query("begin");
  await cliente.query("set local role authenticated");
  await cliente.query("select set_config('request.jwt.claims', $1, true)", [
    JSON.stringify({ sub: userId, role: "authenticated" }),
  ]);
  await cliente.query("set local statement_timeout = '5s'");
}

async function anotar(cliente, nombre, clave = null) {
  const { rows } = await cliente.query(
    `select public.unirse_a_fila($1, $2, $3, $4, null, null, 'local', null, $5) as turno`,
    [barberiaId, nombre, servicioId, randomUUID() + randomUUID(), clave],
  );
  return rows[0].turno;
}

async function preparar(admin) {
  await admin.query("begin");
  for (const [i, id] of usuarios.entries()) {
    await admin.query("insert into auth.users (id, email) values ($1, $2)", [
      id,
      `${prefijo}-${i}@concurrencia.test`,
    ]);
  }
  await admin.query(
    "insert into public.barberias (id, nombre, slug, max_fila) values ($1, $2, $3, 100)",
    [barberiaId, "Concurrencia", prefijo],
  );
  await admin.query(
    "insert into public.servicios (id, barberia_id, nombre, duracion_min) values ($1, $2, 'Corte', 30)",
    [servicioId, barberiaId],
  );
  for (let i = 0; i < BARBEROS; i++) {
    await admin.query(
      "insert into public.miembros (user_id, barberia_id, rol) values ($1, $2, 'barbero')",
      [usuarios[i], barberiaId],
    );
    await admin.query(
      "insert into public.barberos (id, barberia_id, user_id, nombre, silla) values ($1, $2, $3, $4, $5)",
      [barberos[i], barberiaId, usuarios[i], `Barbero ${i + 1}`, i + 1],
    );
  }
  for (let i = 1; i <= BARBEROS + 2; i++) await anotar(admin, `Cliente ${i}`);
  await admin.query("commit");
}

async function limpiar(admin) {
  await admin.query("rollback").catch(() => {});
  await admin.query("delete from public.barberias where id = $1", [barberiaId]);
  await admin.query("delete from auth.users where id = any($1::uuid[])", [usuarios]);
}

async function liberarBarberos(admin) {
  // Devuelve a todos a "libre" marcando como "no llegó" lo que tengan en mano.
  await admin.query(
    "update public.turnos set estado = 'no_llego', fin_en = now() where barberia_id = $1 and estado = 'llamado'",
    [barberiaId],
  );
}

async function pruebaConBloqueo() {
  const a = await conectar();
  const b = await conectar();
  try {
    await comoUsuario(a, usuarios[0]);
    const primero = (await a.query("select public.llamar_siguiente($1) as t", [barberos[0]]))
      .rows[0].t;
    // A todavía no confirma: su cliente sigue bloqueado mientras B llama.
    await comoUsuario(b, usuarios[1]);
    const inicio = Date.now();
    const segundo = (await b.query("select public.llamar_siguiente($1) as t", [barberos[1]]))
      .rows[0].t;
    const espera = Date.now() - inicio;
    await a.query("commit");
    await b.query("commit");
    revisar(primero && segundo, "los dos barberos reciben un cliente");
    revisar(
      primero?.id !== segundo?.id,
      "y son clientes distintos aunque el primero no había confirmado",
    );
    revisar(espera < 2000, `el segundo no espera a que el primero termine (${espera} ms)`);
  } finally {
    await a.end();
    await b.end();
  }
}

async function pruebaSimultanea(admin) {
  const clientes = await Promise.all(barberos.map(() => conectar()));
  try {
    await Promise.all(clientes.map((c, i) => comoUsuario(c, usuarios[i])));
    const resultados = await Promise.all(
      clientes.map((c, i) =>
        c.query("select public.llamar_siguiente($1) as t", [barberos[i]]).then((r) => r.rows[0].t),
      ),
    );
    await Promise.all(clientes.map((c) => c.query("commit")));
    const ids = resultados.filter(Boolean).map((t) => t.id);
    revisar(ids.length === BARBEROS, `los ${BARBEROS} barberos reciben un cliente`);
    revisar(new Set(ids).size === ids.length, "y ninguno se repite");
    const { rows } = await admin.query(
      "select count(*)::int as n from public.turnos where barberia_id = $1 and estado = 'llamado'",
      [barberiaId],
    );
    revisar(rows[0].n === BARBEROS, "la base tiene exactamente un llamado por barbero");
  } finally {
    await Promise.all(clientes.map((c) => c.end()));
  }
}

async function pruebaDobleEnvio(admin) {
  const clave = randomUUID();
  const [a, b] = await Promise.all([conectar(), conectar()]);
  try {
    await a.query("set role service_role");
    await b.query("set role service_role");
    const [uno, dos] = await Promise.all([
      anotar(a, "Doble Toque", clave),
      anotar(b, "Doble Toque", clave),
    ]);
    revisar(uno.codigo === dos.codigo, "el doble envío devuelve el mismo turno");
    const { rows } = await admin.query(
      "select count(*)::int as n from public.turnos where clave_idempotencia = $1",
      [clave],
    );
    revisar(rows[0].n === 1, "y la base guarda uno solo");
  } finally {
    await a.end();
    await b.end();
  }
}

const admin = await conectar();
try {
  await preparar(admin);
  await pruebaConBloqueo();
  await liberarBarberos(admin);
  await pruebaSimultanea(admin);
  await pruebaDobleEnvio(admin);
} catch (error) {
  console.error("FALLA - la prueba no terminó:", error.message);
  fallas++;
} finally {
  await limpiar(admin).catch((error) => console.error("No se pudo limpiar:", error.message));
  await admin.end();
}

console.log(
  fallas === 0 ? "\nConcurrencia: todo en verde." : `\nConcurrencia: ${fallas} falla(s).`,
);
process.exit(fallas === 0 ? 0 : 1);
