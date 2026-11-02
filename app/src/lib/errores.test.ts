import type { ErrorEvent } from "@sentry/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { limpiarEvento, limpiarMiga, limpiarTexto } from "./errores";

const sentry = vi.hoisted(() => ({ init: vi.fn(), captureException: vi.fn() }));
vi.mock("@sentry/react", () => sentry);

describe("limpiarTexto", () => {
  it.each([
    [
      "https://nextcut.gustavoapz07.workers.dev/t/ABCDEFGHJK?origen=qr#arriba",
      "https://nextcut.gustavoapz07.workers.dev/t/:codigo",
    ],
    ["Falló al abrir /t/K7M2Q9XRPA", "Falló al abrir /t/:codigo"],
    ["Llamar a +504 9999-0002", "Llamar a [teléfono]"],
    ["tel: +50499990002", "tel: [teléfono]"],
    ["9999-0002 no contesta", "[teléfono] no contesta"],
    ["número 33334444", "número [teléfono]"],
    ["Escribir a ana.perez@correo.hn", "Escribir a [correo]"],
  ])("%s", (texto, limpio) => {
    expect(limpiarTexto(texto)).toBe(limpio);
  });

  it.each([
    "Falló fila_publica en la línea 120",
    "2026-11-02T15:00:00.000Z",
    "https://bquvluxsqfacleumlnmi.supabase.co/rest/v1/rpc/ver_turno",
    "TypeError: Cannot read properties of undefined (reading 'numero')",
  ])("no toca lo que no identifica a nadie: %s", (texto) => {
    expect(limpiarTexto(texto)).toBe(texto);
  });
});

describe("limpiarEvento", () => {
  it("quita al usuario y limpia todos los textos sin tocar los números", () => {
    const evento = {
      type: undefined,
      event_id: "abc123",
      timestamp: 1793627204.559,
      user: { id: "u-1", ip_address: "{{auto}}" },
      request: { url: "https://nextcut.gustavoapz07.workers.dev/t/ABCDEFGHJK?origen=qr" },
      exception: {
        values: [
          {
            type: "Error",
            value: "No se pudo avisar a +504 9999-0002",
            stacktrace: { frames: [{ filename: "/assets/index.js", lineno: 12, colno: 345 }] },
          },
        ],
      },
    } as ErrorEvent;
    const limpio = limpiarEvento(evento);
    expect(limpio.user).toBeUndefined();
    expect(limpio.request?.url).toBe("https://nextcut.gustavoapz07.workers.dev/t/:codigo");
    expect(limpio.exception?.values?.[0]?.value).toBe("No se pudo avisar a [teléfono]");
    expect(limpio.exception?.values?.[0]?.stacktrace?.frames?.[0]).toEqual({
      filename: "/assets/index.js",
      lineno: 12,
      colno: 345,
    });
    expect(limpio.timestamp).toBe(1793627204.559);
  });
});

describe("limpiarMiga", () => {
  it("descarta las migas de consola y de clics, que pueden traer nombres", () => {
    expect(limpiarMiga({ category: "console", message: "Óscar López" })).toBeNull();
    expect(
      limpiarMiga({ category: "ui.click", message: 'button[aria-label="Renombrar"]' }),
    ).toBeNull();
  });

  it("deja las de red y navegación con la URL limpia", () => {
    expect(
      limpiarMiga({
        category: "fetch",
        data: { url: "https://x.supabase.co/rest/v1/turnos?nombre=eq.Ana", status_code: 200 },
      }),
    ).toEqual({
      category: "fetch",
      data: { url: "https://x.supabase.co/rest/v1/turnos", status_code: 200 },
    });
    expect(
      limpiarMiga({ category: "navigation", data: { from: "/t/ABCDEFGHJK", to: "/" } }),
    ).toEqual({ category: "navigation", data: { from: "/t/:codigo", to: "/" } });
  });
});

describe("iniciarErrores", () => {
  beforeEach(() => {
    vi.resetModules();
    sentry.init.mockReset();
    sentry.captureException.mockReset();
  });

  it("sin DSN no carga Sentry ni manda nada", async () => {
    const { iniciarErrores, reportarError } = await import("./errores");
    iniciarErrores("");
    reportarError(new Error("x"));
    await new Promise((resolver) => setTimeout(resolver, 20));
    expect(sentry.init).not.toHaveBeenCalled();
    expect(sentry.captureException).not.toHaveBeenCalled();
  });

  it("con DSN lo inicia sin datos personales y reporta los errores", async () => {
    const modulo = await import("./errores");
    modulo.iniciarErrores("https://clave@o1.ingest.sentry.io/1");
    await vi.waitFor(() => expect(sentry.init).toHaveBeenCalledTimes(1));
    expect(sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: "https://clave@o1.ingest.sentry.io/1",
        dataCollection: expect.objectContaining({
          userInfo: false,
          cookies: false,
          httpHeaders: false,
          httpBodies: [],
          urlQueryParams: false,
          stackFrameVariables: false,
        }),
        beforeSend: modulo.limpiarEvento,
        beforeBreadcrumb: modulo.limpiarMiga,
      }),
    );

    const error = new Error("falló la ruta");
    modulo.reportarError(error);
    await vi.waitFor(() => expect(sentry.captureException).toHaveBeenCalledWith(error));
    expect(sentry.init).toHaveBeenCalledTimes(1);
  });
});
