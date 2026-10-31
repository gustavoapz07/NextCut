// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import {
  crearAviso,
  type DependenciasAvisos,
  decidirAviso,
  MINUTOS_CASI,
  manejarAvisos,
  type Pendiente,
} from "./avisos.ts";

const BARBERIA = "b0000000-0000-4000-8000-000000000001";
const ANA = "b1000000-0000-4000-8000-000000000001";
const CORTE = "b2000000-0000-4000-8000-000000000001";
const CLAVE = "f".repeat(64);
const AHORA = new Date("2026-10-31T15:00:00Z");

// Ana lleva 20 de los 30 minutos del corte: queda libre en 10. Luego #4 (10 min) y #5 (40 min).
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
  barberos: [
    {
      id: ANA,
      nombre: "Ana",
      apodo: null,
      silla: 2,
      en_pausa: false,
      atendiendo: {
        numero: 3,
        estado: "en_silla",
        servicio_id: CORTE,
        desde: "2026-10-31T14:40:00Z",
      },
    },
  ],
  servicios: [{ id: CORTE, nombre: "Corte", duracion_min: 30, precio_ref: 150 }],
  fila: [
    { numero: 4, nombre: "Óscar L.", barbero_id: ANA, servicio_id: CORTE, creado_en: "" },
    { numero: 5, nombre: "Luis P.", barbero_id: null, servicio_id: CORTE, creado_en: "" },
  ],
};

function pendiente(cambios: Partial<Pendiente> = {}): Pendiente {
  return {
    turno_id: "c0000000-0000-4000-8000-000000000004",
    codigo: "K7P2QM4XZA",
    numero: 4,
    estado: "esperando",
    barberia: { id: BARBERIA, slug: "el-faro", nombre: "El Faro", tolerancia_min: 5 },
    barbero: "Ana",
    silla: 2,
    endpoint: "https://fcm.googleapis.com/fcm/send/secreto-del-navegador",
    p256dh: "BCVxsr7N_eNgVRqvHtD0zTZsEc6",
    auth: "BTBZMqHH6r4Tts7J_aSIgg",
    aviso_casi: false,
    aviso_llamado: false,
    ...cambios,
  };
}

function dependencias(lista: Pendiente[], cambios: Partial<DependenciasAvisos> = {}) {
  return {
    configurado: true,
    claves: { publica: "publica", privada: "privada" },
    sujeto: "https://nextcut.example",
    pendientes: vi.fn(async () => ({ data: lista, error: null })),
    filaPublica: vi.fn(async () => ({ data: fila, error: null })),
    reservar: vi.fn(async () => ({ data: true, error: null })),
    liberar: vi.fn(async () => ({ data: null, error: null })),
    borrarSuscripcion: vi.fn(async () => ({ data: null, error: null })),
    enviar: vi.fn(async () => ({ tipo: "enviado" as const })),
    ahora: () => AHORA,
    registrar: vi.fn(),
    ...cambios,
  } satisfies DependenciasAvisos;
}

function peticion(cuerpo?: unknown, { clave = CLAVE, metodo = "POST" } = {}) {
  return new Request("https://ejemplo.supabase.co/functions/v1/avisos", {
    method: metodo,
    headers: { "content-type": "application/json", ...(clave ? { "x-avisos-clave": clave } : {}) },
    body: metodo === "POST" && cuerpo !== undefined ? JSON.stringify(cuerpo) : null,
  });
}

async function revisar(deps: DependenciasAvisos, req = peticion({})) {
  const respuesta = await manejarAvisos(req, deps);
  return { estado: respuesta.status, cuerpo: await respuesta.json() };
}

describe("decidirAviso", () => {
  it.each([
    ["esperando a 10 min", pendiente(), 10, "casi"],
    ["esperando justo a 15 min", pendiente(), MINUTOS_CASI, "casi"],
    ["esperando a 16 min", pendiente(), 16, null],
    ["esperando sin estimado (barbero en pausa)", pendiente(), null, null],
    ["esperando con el de 15 min ya enviado", pendiente({ aviso_casi: true }), 5, null],
    ["llamado", pendiente({ estado: "llamado" }), null, "llamado"],
    ["llamado sin haber recibido el de 15 min", pendiente({ estado: "llamado" }), 40, "llamado"],
    [
      "llamado con el de te toca ya enviado",
      pendiente({ estado: "llamado", aviso_llamado: true }),
      null,
      null,
    ],
  ] as const)("%s → %s", (_caso, p, minutos, esperado) => {
    expect(decidirAviso(p, minutos)).toBe(esperado);
  });
});

describe("crearAviso", () => {
  it("te toca: barbero, silla y tolerancia, con la página del turno", () => {
    expect(crearAviso("llamado", pendiente({ estado: "llamado" }), null)).toEqual({
      tipo: "llamado",
      titulo: "¡Te toca! · Turno #4",
      cuerpo: "Ana te espera en la silla 2. Tienes 5 min para llegar.",
      url: "/t/K7P2QM4XZA",
      etiqueta: "turno-K7P2QM4XZA",
    });
  });

  it("te toca sin silla ni barbero", () => {
    const aviso = crearAviso("llamado", pendiente({ barbero: null, silla: null }), null);
    expect(aviso.cuerpo).toBe("Tu barbero te espera. Tienes 5 min para llegar.");
  });

  it("ya casi: el mismo rango que muestra la página", () => {
    const aviso = crearAviso("casi", pendiente(), 10);
    expect(aviso.titulo).toBe("Ya casi te toca · Turno #4");
    expect(aviso.cuerpo).toBe("Te toca en ≈ 10–20 min con Ana. Ve acercándote a El Faro.");
  });

  it("ya casi con el primero libre no nombra barbero", () => {
    expect(crearAviso("casi", pendiente({ barbero: null }), 3).cuerpo).toBe(
      "Te toca en ≈ 0–15 min. Ve acercándote a El Faro.",
    );
  });
});

describe("manejarAvisos", () => {
  it("manda el de 15 min a quien le faltan 10 y no a quien le faltan 40", async () => {
    const lejos = pendiente({ turno_id: "c5", numero: 5, codigo: "LUISPXXXXX", barbero: null });
    const deps = dependencias([pendiente(), lejos]);

    const { estado, cuerpo } = await revisar(deps);

    expect(estado).toBe(200);
    expect(cuerpo).toEqual({ revisados: 2, enviados: 1, vencidos: 0, fallidos: 0 });
    expect(deps.filaPublica).toHaveBeenCalledTimes(1);
    expect(deps.reservar).toHaveBeenCalledTimes(1);
    expect(deps.reservar).toHaveBeenCalledWith("c0000000-0000-4000-8000-000000000004", "casi");
    const [suscripcion, contenido, tipo] = vi.mocked(deps.enviar).mock.calls[0] as unknown as [
      unknown,
      string,
      string,
    ];
    expect(suscripcion).toEqual({
      endpoint: "https://fcm.googleapis.com/fcm/send/secreto-del-navegador",
      p256dh: "BCVxsr7N_eNgVRqvHtD0zTZsEc6",
      auth: "BTBZMqHH6r4Tts7J_aSIgg",
    });
    expect(tipo).toBe("casi");
    expect(JSON.parse(contenido)).toMatchObject({ tipo: "casi", url: "/t/K7P2QM4XZA" });
  });

  it("manda el de te toca sin leer la fila", async () => {
    const deps = dependencias([pendiente({ estado: "llamado" })]);
    const { cuerpo } = await revisar(deps);
    expect(cuerpo.enviados).toBe(1);
    expect(deps.filaPublica).not.toHaveBeenCalled();
    expect(deps.reservar).toHaveBeenCalledWith(expect.any(String), "llamado");
  });

  it("pasa la barbería que mandó el trigger", async () => {
    const deps = dependencias([]);
    await revisar(deps, peticion({ barberia_id: BARBERIA }));
    expect(deps.pendientes).toHaveBeenCalledWith(CLAVE, BARBERIA);
  });

  it("sin cuerpo (el reloj de cada minuto) revisa todas las barberías", async () => {
    const deps = dependencias([]);
    const { estado } = await revisar(deps, peticion(undefined));
    expect(estado).toBe(200);
    expect(deps.pendientes).toHaveBeenCalledWith(CLAVE, null);
  });

  it("no manda nada si otra corrida ya reservó el aviso", async () => {
    const deps = dependencias([pendiente()], {
      reservar: vi.fn(async () => ({ data: false, error: null })),
    });
    const { cuerpo } = await revisar(deps);
    expect(cuerpo.enviados).toBe(0);
    expect(deps.enviar).not.toHaveBeenCalled();
  });

  it("borra la suscripción de un navegador que ya no existe", async () => {
    const deps = dependencias([pendiente({ estado: "llamado" })], {
      enviar: vi.fn(async () => ({ tipo: "vencida" as const, estado: 410 })),
    });
    const { cuerpo } = await revisar(deps);
    expect(cuerpo).toMatchObject({ enviados: 0, vencidos: 1 });
    expect(deps.borrarSuscripcion).toHaveBeenCalledWith("c0000000-0000-4000-8000-000000000004");
    expect(deps.liberar).not.toHaveBeenCalled();
    // Queda registrado con el código del servicio, sin el endpoint.
    expect(deps.registrar).toHaveBeenCalledWith("suscripción vencida", {
      servicio: "fcm.googleapis.com",
      tipo: "llamado",
      estado: 410,
    });
  });

  it("tras una falla pasajera libera la reserva para el siguiente minuto", async () => {
    const deps = dependencias([pendiente({ estado: "llamado" })], {
      enviar: vi.fn(async () => ({ tipo: "reintentar" as const, estado: 503 })),
    });
    const { cuerpo } = await revisar(deps);
    expect(cuerpo.fallidos).toBe(1);
    expect(deps.liberar).toHaveBeenCalledWith("c0000000-0000-4000-8000-000000000004", "llamado");
  });

  it("si el servicio lo rechaza no reintenta y registra solo el servicio, sin el endpoint", async () => {
    const deps = dependencias([pendiente({ estado: "llamado" })], {
      enviar: vi.fn(async () => ({ tipo: "rechazado" as const, estado: 403 })),
    });
    await revisar(deps);
    expect(deps.liberar).not.toHaveBeenCalled();
    expect(deps.borrarSuscripcion).not.toHaveBeenCalled();
    expect(deps.registrar).toHaveBeenCalledWith("aviso no enviado", {
      servicio: "fcm.googleapis.com",
      tipo: "llamado",
      resultado: "rechazado",
      estado: 403,
    });
    expect(JSON.stringify(vi.mocked(deps.registrar).mock.calls)).not.toContain(
      "secreto-del-navegador",
    );
  });

  it("si no puede leer la fila no manda el de 15 min, pero sí el de te toca", async () => {
    const llamado = pendiente({
      turno_id: "c9",
      estado: "llamado",
      barberia: { ...pendiente().barberia },
    });
    const deps = dependencias([pendiente(), llamado], {
      filaPublica: vi.fn(async () => ({ data: null, error: { message: "timeout" } })),
    });
    const { cuerpo } = await revisar(deps);
    expect(cuerpo.enviados).toBe(1);
    expect(deps.reservar).toHaveBeenCalledWith("c9", "llamado");
  });

  it("rechaza sin clave o con una clave mal formada, sin tocar la base", async () => {
    const deps = dependencias([pendiente()]);
    expect((await revisar(deps, peticion({}, { clave: "" }))).estado).toBe(401);
    expect((await revisar(deps, peticion({}, { clave: "abc" }))).estado).toBe(401);
    expect(deps.pendientes).not.toHaveBeenCalled();
  });

  it("rechaza una clave que la base no reconoce", async () => {
    const deps = dependencias([], {
      pendientes: vi.fn(async () => ({ data: null, error: { message: "sin_permiso" } })),
    });
    expect(await revisar(deps)).toEqual({ estado: 401, cuerpo: { error: "sin_permiso" } });
  });

  it("solo acepta POST", async () => {
    const deps = dependencias([]);
    expect((await revisar(deps, peticion(undefined, { metodo: "GET" }))).estado).toBe(405);
  });

  it("rechaza un cuerpo que no es el esperado", async () => {
    const deps = dependencias([]);
    expect((await revisar(deps, peticion({ barberia_id: "no-es-uuid" }))).estado).toBe(400);
    expect((await revisar(deps, peticion({ otra: 1 }))).estado).toBe(400);
    const roto = new Request("https://ejemplo.supabase.co/functions/v1/avisos", {
      method: "POST",
      headers: { "x-avisos-clave": CLAVE },
      body: "{no es json",
    });
    expect((await revisar(deps, roto)).estado).toBe(400);
  });

  it("sin las claves de VAPID no hace nada", async () => {
    const deps = dependencias([pendiente()], { configurado: false });
    expect((await revisar(deps)).estado).toBe(500);
    expect(deps.pendientes).not.toHaveBeenCalled();
  });

  it("un error interno da un mensaje genérico", async () => {
    const deps = dependencias([pendiente({ estado: "llamado" })], {
      reservar: vi.fn(async () => {
        throw new Error("connection reset con detalles internos");
      }),
    });
    const { estado, cuerpo } = await revisar(deps);
    expect(estado).toBe(500);
    expect(cuerpo).toEqual({ error: "error" });
  });
});
