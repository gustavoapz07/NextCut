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
    expect(screen.getByRole("heading", { level: 1, name: "Siguiente" })).toBeInTheDocument();
  });

  it("muestra la página de no encontrado en una ruta desconocida", () => {
    abrir("/b/no-existe");
    expect(
      screen.getByRole("heading", { level: 1, name: "No encontramos esta página" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir al inicio" })).toHaveAttribute("href", "/");
  });
});
