import { desdeBase64url } from "@shared/webpush";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  activarAvisos,
  avisosActivos,
  disponibilidadAvisos,
  probarAviso,
  useAvisos,
} from "./avisos";

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("./supabase", () => ({ supabase: { rpc } }));

// Una clave pública P-256 válida (la del ejemplo de la RFC 8291).
const CLAVE =
  "BP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A8";
const CODIGO = "K7P2QM4XZA";
const SECRETO = "s".repeat(64);
const ANDROID = "Mozilla/5.0 (Linux; Android 15; Pixel 7) Chrome/141.0 Mobile Safari/537.36";
const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Version/18.0 Mobile Safari";

function suscripcionFalsa(clave: Uint8Array | null = desdeBase64url(CLAVE)) {
  return {
    options: { applicationServerKey: clave ? clave.buffer : null },
    unsubscribe: vi.fn(async () => true),
    toJSON: () => ({
      endpoint: "https://fcm.googleapis.com/fcm/send/abc",
      keys: { p256dh: "BCVxsr7N_eNgVRqvHtD0zTZsEc6", auth: "BTBZMqHH6r4Tts7J_aSIgg" },
    }),
  };
}

/** Un navegador con Web Push: service worker, PushManager y permiso de notificaciones. */
function navegadorConPush({
  permiso = "default" as NotificationPermission,
  respuesta = "granted" as NotificationPermission,
  actual = null as ReturnType<typeof suscripcionFalsa> | null,
  agente = ANDROID,
} = {}) {
  const nueva = suscripcionFalsa();
  const pushManager = {
    getSubscription: vi.fn(async () => actual),
    subscribe: vi.fn(async () => nueva),
  };
  const showNotification = vi.fn(async () => {});
  const registro = { pushManager, showNotification };
  const serviceWorker = {
    register: vi.fn(async () => ({})),
    ready: Promise.resolve(registro),
    getRegistration: vi.fn(async (): Promise<typeof registro | undefined> => registro),
  };
  const notificacion = {
    permission: permiso,
    requestPermission: vi.fn(async () => {
      notificacion.permission = respuesta;
      return respuesta;
    }),
  };
  vi.stubGlobal("PushManager", () => {});
  vi.stubGlobal("Notification", notificacion);
  vi.stubGlobal("isSecureContext", true);
  Object.defineProperty(navigator, "serviceWorker", { configurable: true, value: serviceWorker });
  Object.defineProperty(navigator, "userAgent", { configurable: true, get: () => agente });
  return { pushManager, serviceWorker, notificacion, nueva, showNotification };
}

/** Safari en iPhone sin la página en la pantalla de inicio: no hay PushManager ni Notification. */
function safariSinInstalar() {
  Object.defineProperty(navigator, "userAgent", { configurable: true, get: () => IPHONE });
}

beforeEach(() => {
  localStorage.clear();
  rpc.mockReset();
  rpc.mockResolvedValue({ data: true, error: null });
  vi.stubEnv("VITE_VAPID_PUBLIC_KEY", CLAVE);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(navigator, "serviceWorker");
  Reflect.deleteProperty(navigator, "userAgent");
});

describe("disponibilidadAvisos", () => {
  it("sin clave pública no hay avisos", () => {
    navegadorConPush();
    vi.stubEnv("VITE_VAPID_PUBLIC_KEY", "");
    expect(disponibilidadAvisos()).toBe("no_disponible");
  });

  it("un navegador sin Web Push no los ofrece", () => {
    expect(disponibilidadAvisos()).toBe("no_disponible");
  });

  it("en Safari de iPhone pide agregar la página a la pantalla de inicio", () => {
    safariSinInstalar();
    expect(disponibilidadAvisos()).toBe("instalar");
  });

  it("si la persona los bloqueó, lo dice", () => {
    navegadorConPush({ permiso: "denied" });
    expect(disponibilidadAvisos()).toBe("bloqueados");
  });

  it("con todo listo, están disponibles", () => {
    navegadorConPush();
    expect(disponibilidadAvisos()).toBe("disponible");
  });
});

describe("activarAvisos", () => {
  it("pide permiso, se suscribe con la clave VAPID y guarda la suscripción con el secreto", async () => {
    const { serviceWorker, pushManager } = navegadorConPush();

    expect(await activarAvisos(CODIGO, SECRETO)).toBe("activados");

    expect(serviceWorker.register).toHaveBeenCalledWith("/sw.js", { scope: "/" });
    expect(pushManager.subscribe).toHaveBeenCalledWith({
      userVisibleOnly: true,
      applicationServerKey: desdeBase64url(CLAVE),
    });
    expect(rpc).toHaveBeenCalledWith("suscribir_push", {
      p_codigo: CODIGO,
      p_secreto: SECRETO,
      p_suscripcion: {
        endpoint: "https://fcm.googleapis.com/fcm/send/abc",
        keys: { p256dh: "BCVxsr7N_eNgVRqvHtD0zTZsEc6", auth: "BTBZMqHH6r4Tts7J_aSIgg" },
      },
    });
    expect(avisosActivos(CODIGO)).toBe(true);
  });

  it("al activarlos muestra un aviso de prueba en el teléfono, con la etiqueta del turno", async () => {
    const { showNotification } = navegadorConPush();
    expect(await activarAvisos(CODIGO, SECRETO)).toBe("activados");
    expect(showNotification).toHaveBeenCalledWith(
      "Avisos activados",
      expect.objectContaining({ tag: `turno-${CODIGO}`, data: { url: `/t/${CODIGO}` } }),
    );
  });

  it("si el teléfono no deja mostrar el aviso de prueba, los avisos quedan activos igual", async () => {
    const { showNotification } = navegadorConPush();
    showNotification.mockRejectedValue(new TypeError("No notification permission"));
    expect(await activarAvisos(CODIGO, SECRETO)).toBe("activados");
  });

  it("si la base no la acepta, no muestra el aviso de prueba", async () => {
    const { showNotification } = navegadorConPush();
    rpc.mockResolvedValue({ data: false, error: null });
    expect(await activarAvisos(CODIGO, SECRETO)).toBe("error");
    expect(showNotification).not.toHaveBeenCalled();
  });

  it("si dice que no, quedan bloqueados y no se registra nada", async () => {
    const { serviceWorker } = navegadorConPush({ respuesta: "denied" });
    expect(await activarAvisos(CODIGO, SECRETO)).toBe("bloqueados");
    expect(serviceWorker.register).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("si cierra la pregunta sin responder, se puede volver a intentar", async () => {
    navegadorConPush({ respuesta: "default" });
    expect(await activarAvisos(CODIGO, SECRETO)).toBe("sin_permiso");
  });

  it("si la base no la acepta, no los da por activos", async () => {
    navegadorConPush();
    rpc.mockResolvedValue({ data: false, error: null });
    expect(await activarAvisos(CODIGO, SECRETO)).toBe("error");
    expect(avisosActivos(CODIGO)).toBe(false);
  });

  it("sin conexión con la base da error", async () => {
    navegadorConPush();
    rpc.mockRejectedValue(new TypeError("Failed to fetch"));
    expect(await activarAvisos(CODIGO, SECRETO)).toBe("error");
  });

  it("reusa la suscripción del navegador si es de la misma clave", async () => {
    const actual = suscripcionFalsa();
    const { pushManager } = navegadorConPush({ actual });
    expect(await activarAvisos(CODIGO, SECRETO)).toBe("activados");
    expect(pushManager.subscribe).not.toHaveBeenCalled();
    expect(actual.unsubscribe).not.toHaveBeenCalled();
  });

  it("cambia una suscripción hecha con otra clave", async () => {
    const actual = suscripcionFalsa(new Uint8Array(65).fill(4));
    const { pushManager } = navegadorConPush({ actual });
    expect(await activarAvisos(CODIGO, SECRETO)).toBe("activados");
    expect(actual.unsubscribe).toHaveBeenCalled();
    expect(pushManager.subscribe).toHaveBeenCalled();
  });
});

describe("useAvisos", () => {
  it("sin el secreto del turno (otro teléfono) no muestra nada", () => {
    navegadorConPush();
    const { result } = renderHook(() => useAvisos(CODIGO, null));
    expect(result.current.estado).toBe("oculto");
  });

  it("recuerda que este teléfono ya los activó", () => {
    navegadorConPush({ permiso: "granted" });
    localStorage.setItem(`nextcut:avisos:${CODIGO}`, "1");
    const { result } = renderHook(() => useAvisos(CODIGO, SECRETO));
    expect(result.current.estado).toBe("activos");
  });

  it("al activarlos pasa por activando y queda activo", async () => {
    navegadorConPush();
    const { result } = renderHook(() => useAvisos(CODIGO, SECRETO));
    expect(result.current.estado).toBe("apagados");
    await act(() => result.current.activar());
    expect(result.current.estado).toBe("activos");
  });

  it("en Safari de iPhone explica cómo instalar", () => {
    safariSinInstalar();
    const { result } = renderHook(() => useAvisos(CODIGO, SECRETO));
    expect(result.current.estado).toBe("instalar");
  });
});

describe("probarAviso", () => {
  it("con los avisos activos muestra uno de prueba en el teléfono", async () => {
    const { showNotification } = navegadorConPush({
      permiso: "granted",
      actual: suscripcionFalsa(),
    });
    expect(await probarAviso(CODIGO)).toBe(true);
    expect(showNotification).toHaveBeenCalledWith(
      "Así te llega el aviso",
      expect.objectContaining({ tag: `turno-${CODIGO}` }),
    );
  });

  it("si el navegador perdió la suscripción, pide volver a activarlos", async () => {
    const { showNotification } = navegadorConPush({ permiso: "granted", actual: null });
    expect(await probarAviso(CODIGO)).toBe(false);
    expect(showNotification).not.toHaveBeenCalled();
  });

  it("sin service worker también", async () => {
    const { serviceWorker } = navegadorConPush({ permiso: "granted" });
    serviceWorker.getRegistration.mockResolvedValue(undefined);
    expect(await probarAviso(CODIGO)).toBe(false);
  });

  it("desde la página: con la prueba enviada explica qué revisar; sin suscripción vuelve a Avisarme", async () => {
    navegadorConPush({ permiso: "granted", actual: suscripcionFalsa() });
    localStorage.setItem(`nextcut:avisos:${CODIGO}`, "1");
    const { result } = renderHook(() => useAvisos(CODIGO, SECRETO));
    expect(result.current.estado).toBe("activos");
    await act(() => result.current.probar());
    expect(result.current.prueba).toBe(true);

    navegadorConPush({ permiso: "granted", actual: null });
    await act(() => result.current.probar());
    expect(result.current.prueba).toBe(false);
    expect(result.current.estado).toBe("apagados");
  });
});
