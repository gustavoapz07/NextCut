import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { filaDeEjemplo, turnoDeEjemplo } from "@/test/filaEjemplo";
import { rutas } from "./router";

// En las pruebas no hay Supabase: `rpc` e `invoke` responden lo que cada prueba necesita.
const { rpc, invoke } = vi.hoisted(() => ({ rpc: vi.fn(), invoke: vi.fn() }));
vi.mock("@/lib/supabase", () => {
  const canal = { on: () => canal, subscribe: () => canal };
  return {
    supabase: { rpc, functions: { invoke }, channel: () => canal, removeChannel: async () => "ok" },
  };
});

// Turnstile real necesita el script de Cloudflare; aquí entrega un token de una vez.
vi.mock("@/components/Turnstile", async () => {
  const { useEffect } = await import("react");
  return {
    Turnstile: ({ onToken }: { onToken: (token: string) => void }) => {
      useEffect(() => onToken("token-de-prueba"), [onToken]);
      return null;
    },
  };
});

/** Responde cada función de la base con lo que se le pase; las demás devuelven `null`. */
function responder(respuestas: Record<string, unknown>) {
  rpc.mockImplementation(async (funcion: string) => ({
    data: respuestas[funcion] ?? null,
    error: null,
  }));
}

const CODIGO = "K7P2QM4XZA";

beforeEach(() => {
  localStorage.clear();
  rpc.mockReset();
  rpc.mockResolvedValue({ data: null, error: null });
  invoke.mockReset();
});

function abrir(ruta: string) {
  render(<RouterProvider router={createMemoryRouter(rutas, { initialEntries: [ruta] })} />);
}

describe("rutas", () => {
  it("muestra el inicio en /", () => {
    abrir("/");
    expect(screen.getByRole("heading", { level: 1, name: "NextCut" })).toBeInTheDocument();
  });

  it("muestra la página de no encontrado en una ruta desconocida", async () => {
    abrir("/no-existe");
    expect(
      await screen.findByRole("heading", { level: 1, name: "No encontramos esta página" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir al inicio" })).toHaveAttribute("href", "/");
  });

  it("no muestra la fila de una barbería que no existe", async () => {
    abrir("/b/no-existe");
    expect(
      await screen.findByRole("heading", { level: 1, name: "No encontramos esta página" }),
    ).toBeInTheDocument();
  });

  it.each([
    ["/b/la-navaja", "La Navaja"],
    ["/b/la-navaja/unirse", "¿Cómo te llamas?"],
    ["/entrar", "Entrar"],
    ["/dueno", /de/],
    ["/dueno/configuracion", "Configuración"],
    ["/dueno/qr", "Código QR"],
  ])("abre %s", async (ruta, titulo) => {
    abrir(ruta);
    expect(await screen.findByRole("heading", { level: 1, name: titulo })).toBeInTheDocument();
  });

  it("muestra el turno en vivo", async () => {
    abrir("/t/K7P2Q");
    expect(await screen.findByText("#33")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Mantén presionado para cancelar" }),
    ).toBeInTheDocument();
  });

  it.each([
    ["llamado", /¡Te\s*toca!/],
    ["silla", /Disfruta\s*tu corte/],
    ["listo", "fino!"],
    ["cancelado", /Turno\s*cancelado/],
  ])("abre el turno en el estado %s", async (estado, titulo) => {
    abrir(`/t/K7P2Q?estado=${estado}`);
    expect(await screen.findByRole("heading", { level: 1, name: titulo })).toBeInTheDocument();
  });

  it("muestra la fila real de una barbería con sus estimados", async () => {
    rpc.mockResolvedValue({ data: filaDeEjemplo(), error: null });
    abrir("/b/el-faro");
    expect(await screen.findByRole("heading", { level: 1, name: "El Faro" })).toBeInTheDocument();
    expect(rpc).toHaveBeenCalledWith("fila_publica", { p_slug: "el-faro" });
    expect(screen.getByText("La Tijera · atendiendo al #3")).toBeInTheDocument();
    expect(screen.getByText("en pausa")).toBeInTheDocument();
    expect(screen.getAllByText("≈ 1 h 05")).toHaveLength(2);
    expect(screen.getByText("Óscar L.")).toBeInTheDocument();
    expect(screen.getByText("Cliente")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Anotarme en la fila/ })).toBeInTheDocument();
  });

  it("avisa cuando la fila en línea está pausada", async () => {
    rpc.mockResolvedValue({ data: filaDeEjemplo({ fila_remota_activa: false }), error: null });
    abrir("/b/el-faro");
    expect(await screen.findByText("La fila en línea está pausada")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Anotarme en la fila/ })).not.toBeInTheDocument();
  });

  it("ofrece reintentar si la base no responde", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "sin conexión" } });
    abrir("/b/el-faro");
    expect(
      await screen.findByRole("heading", { level: 1, name: "No pudimos cargar la fila" }),
    ).toBeInTheDocument();
  });

  it("lleva el origen del QR de la fila al formulario", async () => {
    rpc.mockResolvedValue({ data: filaDeEjemplo(), error: null });
    abrir("/b/el-faro?origen=qr");
    expect(await screen.findByRole("link", { name: /Anotarme en la fila/ })).toHaveAttribute(
      "href",
      "/b/el-faro/unirse?origen=qr",
    );
  });

  it("con el QR de la puerta deja anotarse aunque la fila en línea esté pausada", async () => {
    rpc.mockResolvedValue({ data: filaDeEjemplo({ fila_remota_activa: false }), error: null });
    abrir("/b/el-faro?origen=qr");
    expect(await screen.findByRole("link", { name: /Anotarme en la fila/ })).toBeInTheDocument();
  });

  it("anota a un cliente de una barbería real y lo lleva a su turno", async () => {
    rpc.mockResolvedValue({ data: filaDeEjemplo(), error: null });
    invoke.mockResolvedValue({ data: { codigo: "K7P2QM4XZA", numero: 7 }, error: null });
    abrir("/b/el-faro/unirse?barbero=ana&origen=qr");

    fireEvent.change(await screen.findByLabelText("Tu nombre"), {
      target: { value: "Óscar López" },
    });
    expect(screen.getByText("Óscar L.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(await screen.findByRole("radio", { name: /Ana/ })).toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    fireEvent.click(await screen.findByRole("radio", { name: /Barba/ }));
    expect(await screen.findByRole("heading", { name: /Confirma tu\s*turno/ })).toBeInTheDocument();

    const tomar = screen.getByRole("button", { name: "Tomar mi turno" });
    await waitFor(() => expect(tomar).toBeEnabled());
    fireEvent.click(tomar);

    expect(await screen.findByText("#7")).toBeInTheDocument();
    expect(invoke).toHaveBeenCalledWith("unirse-a-fila", {
      body: {
        slug: "el-faro",
        nombre: "Óscar López",
        telefono: null,
        barberoId: "ana",
        servicioId: "barba",
        origen: "local",
        secreto: expect.stringMatching(/^[0-9a-f]{64}$/),
        clave: expect.stringMatching(/^[0-9a-f-]{36}$/),
        turnstile: "token-de-prueba",
      },
    });
  });

  it("explica por qué no se pudo tomar el turno", async () => {
    rpc.mockResolvedValue({ data: filaDeEjemplo(), error: null });
    const respuesta = new Response(JSON.stringify({ error: "telefono_con_turno" }), {
      status: 409,
    });
    const { FunctionsHttpError } = await import("@supabase/supabase-js");
    invoke.mockResolvedValue({ data: null, error: new FunctionsHttpError(respuesta) });
    abrir("/b/el-faro/unirse?barbero=cualquiera");

    fireEvent.change(await screen.findByLabelText("Tu nombre"), { target: { value: "Ana" } });
    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    fireEvent.click(await screen.findByRole("button", { name: "Siguiente" }));
    fireEvent.click(await screen.findByRole("radio", { name: /Corte/ }));
    const tomar = await screen.findByRole("button", { name: "Tomar mi turno" });
    await waitFor(() => expect(tomar).toBeEnabled());
    fireEvent.click(tomar);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Ese número ya tiene un turno activo en esta barbería.",
    );
  });

  it("muestra un turno real en la fila con quién va antes", async () => {
    localStorage.setItem(`nextcut:secreto:${CODIGO}`, "s".repeat(64));
    responder({ ver_turno: turnoDeEjemplo(), fila_publica: filaDeEjemplo() });
    abrir(`/t/${CODIGO}`);
    expect(await screen.findByText("#5")).toBeInTheDocument();
    expect(rpc).toHaveBeenCalledWith("ver_turno", { p_codigo: CODIGO });
    expect(screen.getAllByText(CODIGO).length).toBeGreaterThan(0);
    expect(screen.getByText("1 persona antes que tú")).toBeInTheDocument();
    expect(screen.getByText("El primero libre")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Mantén presionado para cancelar" }),
    ).toBeInTheDocument();
    // Los avisos por Web Push todavía no existen: el botón solo está en el prototipo.
    expect(screen.queryByText("Avisarme cuando falten 15 min")).not.toBeInTheDocument();
  });

  it("cancela el turno con el secreto guardado en el teléfono", async () => {
    localStorage.setItem(`nextcut:secreto:${CODIGO}`, "s".repeat(64));
    responder({ ver_turno: turnoDeEjemplo(), fila_publica: filaDeEjemplo() });
    abrir(`/t/${CODIGO}`);
    const boton = await screen.findByRole("button", { name: "Mantén presionado para cancelar" });

    responder({
      cancelar_turno: true,
      ver_turno: turnoDeEjemplo({ estado: "cancelado" }),
      fila_publica: filaDeEjemplo(),
    });
    fireEvent.keyDown(boton, { key: " " });
    expect(
      await screen.findByRole("heading", { name: /Turno\s*cancelado/ }, { timeout: 3000 }),
    ).toBeInTheDocument();
    expect(rpc).toHaveBeenCalledWith("cancelar_turno", {
      p_codigo: CODIGO,
      p_secreto: "s".repeat(64),
    });
  });

  it("sin el secreto no ofrece cancelar", async () => {
    responder({ ver_turno: turnoDeEjemplo(), fila_publica: filaDeEjemplo() });
    abrir(`/t/${CODIGO}`);
    expect(
      await screen.findByText(
        "Para cancelar, abre esta página en el teléfono con el que te anotaste.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /cancelar/ })).not.toBeInTheDocument();
  });

  it("avisa cuando le toca, con el barbero y la silla", async () => {
    responder({
      ver_turno: turnoDeEjemplo({
        estado: "llamado",
        barbero_id: "ana",
        barbero: "Ana",
        silla: 1,
        llamado_en: new Date().toISOString(),
      }),
      fila_publica: filaDeEjemplo(),
    });
    abrir(`/t/${CODIGO}`);
    expect(await screen.findByRole("heading", { name: /¡Te\s*toca!/ })).toBeInTheDocument();
    expect(screen.getByText("silla 1")).toBeInTheDocument();
  });

  it("explica cuando se le pasó el turno", async () => {
    responder({ ver_turno: turnoDeEjemplo({ estado: "no_llego" }) });
    abrir(`/t/${CODIGO}`);
    expect(await screen.findByRole("heading", { name: /Se pasó\s*tu turno/ })).toBeInTheDocument();
    // Un turno cerrado ya no pide la fila.
    expect(rpc).not.toHaveBeenCalledWith("fila_publica", expect.anything());
  });

  it("un código que no existe da no encontrado", async () => {
    abrir("/t/ZZZZZZZZZZ");
    expect(
      await screen.findByRole("heading", { level: 1, name: "No encontramos esta página" }),
    ).toBeInTheDocument();
  });

  it("muestra los cuatro botones del panel del barbero", async () => {
    abrir("/panel");
    for (const nombre of [/Llamar siguiente/, /Empezar/, /No llegó/, /Terminar/]) {
      expect(await screen.findByRole("button", { name: nombre })).toBeInTheDocument();
    }
  });
});
