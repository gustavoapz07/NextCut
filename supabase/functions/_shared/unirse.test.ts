// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import {
  type DatosUnirse,
  type Dependencias,
  hmacHex,
  limpiarNombre,
  manejarUnirse,
  obtenerIp,
  URL_TURNSTILE,
  verificarTurnstile,
} from "./unirse";

const BARBERIA = "b0000000-0000-4000-8000-000000000001";
const ANA = "b1000000-0000-4000-8000-000000000001";
const CORTE = "b2000000-0000-4000-8000-000000000001";
const ORIGEN = "http://localhost:5173";

const fila = {
  barberia: {
    id: BARBERIA,
    nombre: "El Faro",
    slug: "el-faro",
    zona: null,
    fila_remota_activa: true,
    max_fila: 15,
    tolerancia_min: 5,
  },
  barberos: [{ id: ANA, nombre: "Ana", apodo: null, silla: 1, en_pausa: false, atendiendo: null }],
  servicios: [{ id: CORTE, nombre: "Corte", duracion_min: 30, precio_ref: 150 }],
  fila: [{ numero: 4, nombre: "Óscar L.", barbero_id: ANA, servicio_id: CORTE, creado_en: "" }],
};

function datos(cambios: Partial<DatosUnirse> = {}): DatosUnirse {
  return {
    slug: "el-faro",
    nombre: "Óscar López",
    telefono: "+50499998888",
    barberoId: ANA,
    servicioId: CORTE,
    origen: "remoto",
    secreto: "a".repeat(64),
    clave: "c0000000-0000-4000-8000-000000000001",
    turnstile: "XXXX.DUMMY.TOKEN.XXXX",
    ...cambios,
  };
}

function dependencias(cambios: Partial<Dependencias> = {}) {
  return {
    configurado: true,
    origenes: [ORIGEN],
    verificarTurnstile: vi.fn(async () => true),
    filaPublica: vi.fn(async () => ({ data: fila, error: null })),
    unirseAFila: vi.fn(async () => ({ data: { codigo: "K7P2QM4XZA", numero: 5 }, error: null })),
    hashIp: vi.fn(async (ip: string) => `hash-de-${ip}`),
    ahora: () => new Date(),
    ...cambios,
  } satisfies Dependencias;
}

function peticion(cuerpo: unknown, metodo = "POST") {
  return new Request("https://ejemplo.supabase.co/functions/v1/unirse-a-fila", {
    method: metodo,
    headers: {
      origin: ORIGEN,
      "content-type": "application/json",
      "cf-connecting-ip": "190.5.1.2",
    },
    body: metodo === "POST" ? JSON.stringify(cuerpo) : null,
  });
}

async function enviar(cuerpo: unknown, deps = dependencias()) {
  const respuesta = await manejarUnirse(peticion(cuerpo), deps);
  return { estado: respuesta.status, cuerpo: await respuesta.json(), respuesta };
}

describe("manejarUnirse", () => {
  it("crea el turno y devuelve solo el código y el número", async () => {
    const deps = dependencias();
    const { estado, cuerpo, respuesta } = await enviar(datos(), deps);
    expect(estado).toBe(200);
    expect(cuerpo).toEqual({ codigo: "K7P2QM4XZA", numero: 5 });
    expect(respuesta.headers.get("access-control-allow-origin")).toBe(ORIGEN);
    expect(deps.verificarTurnstile).toHaveBeenCalledWith(
      "XXXX.DUMMY.TOKEN.XXXX",
      "190.5.1.2",
      datos().clave,
    );
  });

  it("manda a la base el hash de la IP, nunca la IP, y el estimado del turno", async () => {
    const deps = dependencias();
    await enviar(datos(), deps);
    expect(deps.unirseAFila).toHaveBeenCalledWith({
      p_barberia_id: BARBERIA,
      p_nombre: "Óscar López",
      p_servicio_id: CORTE,
      p_secreto: "a".repeat(64),
      p_barbero_id: ANA,
      p_telefono: "+50499998888",
      p_origen: "remoto",
      p_ip_hash: "hash-de-190.5.1.2",
      p_clave: datos().clave,
      // Ana está libre y tiene a #4 con un corte de 30 minutos.
      p_estimado_min: 30,
    });
  });

  it("si Turnstile no pasa, no toca la base", async () => {
    const deps = dependencias({ verificarTurnstile: vi.fn(async () => false) });
    const { estado, cuerpo } = await enviar(datos(), deps);
    expect(estado).toBe(403);
    expect(cuerpo).toEqual({ error: "verificacion" });
    expect(deps.filaPublica).not.toHaveBeenCalled();
    expect(deps.unirseAFila).not.toHaveBeenCalled();
  });

  it.each([
    ["un nombre de 500 caracteres", { nombre: "a".repeat(500) }],
    ["un nombre vacío", { nombre: "   " }],
    ["un teléfono de otro país", { telefono: "+12025550123" }],
    ["un teléfono sin código de país", { telefono: "99998888" }],
    ["un servicio que no es un id", { servicioId: "corte" }],
    ["un barbero que no es un id", { barberoId: "1 or 1=1" }],
    ["un secreto corto", { secreto: "abc" }],
    ["un origen inventado", { origen: "vip" as "local" }],
    ["un slug con mayúsculas", { slug: "El-Faro" }],
  ])("rechaza %s sin llamar a nadie", async (_caso, cambios) => {
    const deps = dependencias();
    const { estado, cuerpo } = await enviar(datos(cambios), deps);
    expect(estado).toBe(400);
    expect(cuerpo).toEqual({ error: "datos_invalidos" });
    expect(deps.verificarTurnstile).not.toHaveBeenCalled();
  });

  it.each([
    ["<script>alert(1)</script>", "<script>alert(1)</script>"],
    ["José 💈✂️", "José 💈✂️"],
    ["  Kevin\t  Ramos  ", "Kevin Ramos"],
  ])("deja pasar %j como texto", async (nombre, guardado) => {
    const deps = dependencias();
    expect((await enviar(datos({ nombre }), deps)).estado).toBe(200);
    expect(deps.unirseAFila).toHaveBeenCalledWith(expect.objectContaining({ p_nombre: guardado }));
  });

  it("acepta 'el primero libre' y no exige teléfono", async () => {
    const { estado } = await enviar(datos({ barberoId: null, telefono: null }));
    expect(estado).toBe(200);
  });

  it("una barbería que no existe da 404", async () => {
    const deps = dependencias({ filaPublica: vi.fn(async () => ({ data: null, error: null })) });
    expect((await enviar(datos(), deps)).cuerpo).toEqual({ error: "no_existe" });
  });

  it.each([
    ["servicio_invalido", 400, "datos_invalidos"],
    ["fila_llena", 409, "fila_llena"],
    ["fila_remota_pausada", 409, "fila_remota_pausada"],
    ["telefono_con_turno", 409, "telefono_con_turno"],
    ["limite_ip", 429, "limite_ip"],
    ['relation "turnos" does not exist', 500, "error"],
  ])("traduce el error de la base %j", async (mensaje, estado, codigo) => {
    const deps = dependencias({
      unirseAFila: vi.fn(async () => ({ data: null, error: { message: mensaje } })),
    });
    const respuesta = await enviar(datos(), deps);
    expect(respuesta.estado).toBe(estado);
    // Nunca se filtra el mensaje original.
    expect(respuesta.cuerpo).toEqual({ error: codigo });
  });

  it("un error inesperado no muestra detalles", async () => {
    const deps = dependencias({
      verificarTurnstile: vi.fn(async () => {
        throw new Error("se cayó Cloudflare");
      }),
    });
    expect(await enviar(datos(), deps)).toMatchObject({ estado: 500, cuerpo: { error: "error" } });
  });

  it("sin los secretos configurados rechaza todo", async () => {
    const deps = dependencias({ configurado: false });
    expect((await enviar(datos(), deps)).estado).toBe(500);
    expect(deps.verificarTurnstile).not.toHaveBeenCalled();
  });

  it("rechaza un cuerpo que no es JSON", async () => {
    const respuesta = await manejarUnirse(
      new Request("https://ejemplo.supabase.co", { method: "POST", body: "nombre=Óscar" }),
      dependencias(),
    );
    expect(respuesta.status).toBe(400);
  });

  it("responde la verificación previa de CORS solo a los orígenes permitidos", async () => {
    const permitido = await manejarUnirse(peticion(null, "OPTIONS"), dependencias());
    expect(permitido.status).toBe(204);
    expect(permitido.headers.get("access-control-allow-origin")).toBe(ORIGEN);

    const otro = await manejarUnirse(
      new Request("https://ejemplo.supabase.co", {
        method: "OPTIONS",
        headers: { origin: "https://otro-sitio.com" },
      }),
      dependencias(),
    );
    expect(otro.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("solo acepta POST", async () => {
    expect((await manejarUnirse(peticion(null, "GET"), dependencias())).status).toBe(405);
  });
});

describe("limpiarNombre", () => {
  it("quita caracteres de control y los que invierten el texto", () => {
    expect(limpiarNombre("Ana\u0000\u202E Ruiz\n")).toBe("Ana Ruiz");
  });
});

describe("obtenerIp", () => {
  it("prefiere la IP que pone Cloudflare y si no, x-real-ip", () => {
    expect(obtenerIp(new Headers({ "cf-connecting-ip": "1.1.1.1", "x-real-ip": "2.2.2.2" }))).toBe(
      "1.1.1.1",
    );
    expect(obtenerIp(new Headers({ "x-real-ip": " 2.2.2.2 " }))).toBe("2.2.2.2");
    expect(obtenerIp(new Headers())).toBeNull();
  });

  it("no confía en x-forwarded-for, que puede escribir el cliente", () => {
    expect(obtenerIp(new Headers({ "x-forwarded-for": "203.0.113.7" }))).toBeNull();
  });
});

describe("hmacHex", () => {
  it("da siempre el mismo hash de 64 caracteres, distinto con otra clave", async () => {
    const hash = await hmacHex("clave", "190.5.1.2");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(await hmacHex("clave", "190.5.1.2")).toBe(hash);
    expect(await hmacHex("otra", "190.5.1.2")).not.toBe(hash);
  });
});

describe("verificarTurnstile", () => {
  it("manda el token, la IP y la clave de idempotencia a Cloudflare", async () => {
    const pedir = vi.fn(async (_url: string | URL | Request, _opciones?: RequestInit) =>
      Response.json({ success: true }),
    );
    expect(await verificarTurnstile(pedir, "secreto", "token", "1.1.1.1", "clave")).toBe(true);
    const [url, opciones] = pedir.mock.calls[0] ?? [];
    expect(url).toBe(URL_TURNSTILE);
    const enviado = opciones?.body as FormData;
    expect(Object.fromEntries(enviado)).toEqual({
      secret: "secreto",
      response: "token",
      idempotency_key: "clave",
      remoteip: "1.1.1.1",
    });
  });

  it("un token inválido o una caída de Cloudflare no pasan", async () => {
    const invalido = vi.fn(async () => Response.json({ success: false }));
    expect(await verificarTurnstile(invalido, "s", "t", null, "c")).toBe(false);
    const caido = vi.fn(async () => new Response("", { status: 502 }));
    expect(await verificarTurnstile(caido, "s", "t", null, "c")).toBe(false);
  });
});
