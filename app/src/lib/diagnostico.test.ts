import { afterEach, describe, expect, it, vi } from "vitest";
import { avisoDePrueba, describirNavegador, diagnosticar } from "./diagnostico";
import { paqueteDe, puedeRecargar } from "./version";

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(navigator, "serviceWorker");
});

describe("describirNavegador", () => {
  it.each([
    [
      "Mozilla/5.0 (Linux; Android 15; SM-A556E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36",
      "Chrome 141 · Android 15",
    ],
    [
      "Mozilla/5.0 (Linux; Android 15; SM-A556E) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/130.0.0.0 Mobile Safari/537.36",
      "Samsung Internet 28 · Android 15",
    ],
    [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1",
      "Safari · iOS 18",
    ],
    [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0",
      "Edge 141 · Windows",
    ],
  ])("%s", (agente, esperado) => {
    expect(describirNavegador(agente)).toBe(esperado);
  });
});

describe("diagnosticar", () => {
  it("en un navegador sin service worker ni avisos lo dice sin fallar", async () => {
    const datos = await diagnosticar();
    expect(datos.serviceWorker).toBe("sin_soporte");
    expect(datos.suscripcion).toBeNull();
    expect(datos.recibidos).toEqual([]);
  });

  it("lee el registro de avisos que dejó el service worker y lo que está a la vista", async () => {
    const recibidos = [
      {
        fecha: "2026-10-31T18:52:01Z",
        titulo: "Ya casi te toca · Turno #13",
        resultado: "mostrado",
      },
    ];
    vi.stubGlobal("caches", {
      open: async () => ({ match: async () => new Response(JSON.stringify(recibidos)) }),
    });
    const registro = {
      active: {},
      update: async () => {},
      pushManager: {
        getSubscription: async () => ({ endpoint: "https://fcm.googleapis.com/fcm/send/abc" }),
      },
      getNotifications: async () => [{ title: "Ya casi te toca · Turno #13" }],
    };
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: { getRegistration: async () => registro },
    });
    const datos = await diagnosticar();
    expect(datos.serviceWorker).toBe("activo");
    expect(datos.suscripcion).toBe("fcm.googleapis.com");
    expect(datos.recibidos).toEqual(recibidos);
    expect(datos.aLaVista).toEqual(["Ya casi te toca · Turno #13"]);
  });
});

describe("avisoDePrueba", () => {
  function conRegistro(aLaVista: number, falla?: Error) {
    const registro = {
      showNotification: vi.fn(async () => {
        if (falla) throw falla;
      }),
      getNotifications: vi.fn(async () => Array.from({ length: aLaVista }, () => ({}))),
    };
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: { getRegistration: async () => registro },
    });
    return registro;
  }

  it("si el navegador la tiene a la vista, el problema está en el sistema", async () => {
    conRegistro(1);
    expect(await avisoDePrueba()).toBe("a_la_vista");
  });

  it("si no la tiene, el navegador bloquea el sitio", async () => {
    conRegistro(0);
    expect(await avisoDePrueba()).toBe("sin_rastro");
  });

  it("devuelve el error del navegador", async () => {
    conRegistro(0, new TypeError("No notification permission has been granted"));
    expect(await avisoDePrueba()).toEqual({
      error: "TypeError: No notification permission has been granted",
    });
  });

  it("sin service worker lo dice", async () => {
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: { getRegistration: async () => undefined },
    });
    expect(await avisoDePrueba()).toBe("sin_service_worker");
  });
});

describe("versión nueva", () => {
  it("encuentra el paquete principal en el index.html publicado", () => {
    expect(
      paqueteDe('<script type="module" crossorigin src="/assets/index-FAp9XzBF.js"></script>'),
    ).toBe("/assets/index-FAp9XzBF.js");
    expect(paqueteDe("<html></html>")).toBeNull();
  });

  it("no recarga a media escritura ni en el formulario para anotarse", () => {
    const campo = document.createElement("input");
    expect(puedeRecargar("/t/K7P2QM4XZA", document.body)).toBe(true);
    expect(puedeRecargar("/t/K7P2QM4XZA", campo)).toBe(false);
    expect(puedeRecargar("/b/barberia-prueba/unirse", document.body)).toBe(false);
  });
});
