import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { filaDeEjemplo } from "@/test/filaEjemplo";
import { rutas } from "./router";

// En las pruebas no hay Supabase: `rpc` responde lo que cada prueba necesita.
const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("@/lib/supabase", () => {
  const canal = { on: () => canal, subscribe: () => canal };
  return { supabase: { rpc, channel: () => canal, removeChannel: async () => "ok" } };
});

beforeEach(() => {
  rpc.mockReset();
  rpc.mockResolvedValue({ data: null, error: null });
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

  it("muestra los cuatro botones del panel del barbero", async () => {
    abrir("/panel");
    for (const nombre of [/Llamar siguiente/, /Empezar/, /No llegó/, /Terminar/]) {
      expect(await screen.findByRole("button", { name: nombre })).toBeInTheDocument();
    }
  });
});
