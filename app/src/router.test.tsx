import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";
import { rutas } from "./router";

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

  it("muestra los cuatro botones del panel del barbero", async () => {
    abrir("/panel");
    for (const nombre of [/Llamar siguiente/, /Empezar/, /No llegó/, /Terminar/]) {
      expect(await screen.findByRole("button", { name: nombre })).toBeInTheDocument();
    }
  });
});
