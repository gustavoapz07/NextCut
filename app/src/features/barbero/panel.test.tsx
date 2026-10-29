import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TurnoPersonal } from "@/lib/panel";
import { rutas } from "@/router";

// Supabase falso: sesión, consultas a tablas y funciones de la base.
const falso = vi.hoisted(() => ({
  rpc: vi.fn(),
  entrar: vi.fn(),
  salir: vi.fn(),
  sesion: null as { user: { id: string } } | null,
  /** Respuesta de cada consulta por tabla; "turnos:hoy" son los atendidos de hoy. */
  tablas: {} as Record<string, unknown>,
  oyentes: [] as Array<(evento: string, sesion: unknown) => void>,
}));

vi.mock("@/lib/supabase", () => {
  const canal = { on: () => canal, subscribe: () => canal };

  function consulta(tabla: string) {
    let clave = tabla;
    const respuesta = () => ({ data: falso.tablas[clave] ?? null, error: null });
    const cadena: object = new Proxy(
      {},
      {
        get(_objetivo, propiedad: string) {
          if (propiedad === "then") {
            return (ok: (valor: unknown) => unknown) => Promise.resolve(respuesta()).then(ok);
          }
          if (propiedad === "single" || propiedad === "maybeSingle") {
            return async () => respuesta();
          }
          return (...argumentos: unknown[]) => {
            if (propiedad === "eq" && argumentos[0] === "dia") clave = `${tabla}:hoy`;
            return cadena;
          };
        },
      },
    );
    return cadena;
  }

  return {
    supabase: {
      rpc: falso.rpc,
      from: consulta,
      channel: () => canal,
      removeChannel: async () => "ok",
      auth: {
        getSession: async () => ({ data: { session: falso.sesion } }),
        onAuthStateChange: (oyente: (evento: string, sesion: unknown) => void) => {
          falso.oyentes.push(oyente);
          return { data: { subscription: { unsubscribe: () => {} } } };
        },
        signInWithPassword: falso.entrar,
        signOut: falso.salir,
      },
    },
  };
});

const USUARIO = "10000000-0000-4000-8000-0000000000e1";
const BARBERO = {
  id: "e1000000-0000-4000-8000-000000000001",
  nombre: "Carlos",
  apodo: "El Profe",
  silla: 1,
  en_pausa: false,
  barberia_id: "e0000000-0000-4000-8000-000000000001",
};
const BARBERIA = {
  id: BARBERO.barberia_id,
  nombre: "Barbería Prueba",
  slug: "barberia-prueba",
  tolerancia_min: 5,
  zona_horaria: "America/Tegucigalpa",
};
const SERVICIOS = [
  { id: "s-barba", nombre: "Barba", duracion_min: 15, precio_ref: 100 },
  { id: "s-corte", nombre: "Corte clásico", duracion_min: 30, precio_ref: 150 },
];

function turno(numero: number, cambios: Partial<TurnoPersonal> = {}): TurnoPersonal {
  return {
    id: `t-${numero}`,
    numero,
    nombre: "Óscar López",
    telefono: "+50499998888",
    barbero_id: null,
    servicio_id: "s-corte",
    origen: "remoto",
    estado: "esperando",
    creado_en: new Date(Date.now() - 12 * 60_000).toISOString(),
    llamado_en: null,
    inicio_en: null,
    ...cambios,
  };
}

function conPanel(turnos: TurnoPersonal[]) {
  falso.sesion = { user: { id: USUARIO } };
  falso.tablas = {
    barberos: BARBERO,
    barberias: BARBERIA,
    servicios: SERVICIOS,
    turnos,
    "turnos:hoy": [{ monto: 150 }, { monto: 230 }],
  };
}

function abrir(ruta: string) {
  render(<RouterProvider router={createMemoryRouter(rutas, { initialEntries: [ruta] })} />);
}

beforeEach(() => {
  falso.sesion = null;
  falso.tablas = {};
  falso.oyentes = [];
  falso.rpc.mockReset();
  falso.rpc.mockResolvedValue({ data: null, error: null });
  falso.entrar.mockReset();
  falso.salir.mockReset();
});

describe("entrar", () => {
  it("sin sesión, el panel manda a entrar", async () => {
    abrir("/panel");
    expect(await screen.findByRole("heading", { level: 1, name: "Entrar" })).toBeInTheDocument();
  });

  it("explica cuando el correo o la contraseña no coinciden", async () => {
    falso.entrar.mockResolvedValue({ error: { status: 400 } });
    abrir("/entrar");
    fireEvent.change(await screen.findByLabelText("Correo"), {
      target: { value: "carlos@prueba.test" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "equivocada" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "El correo o la contraseña no coinciden.",
    );
    expect(falso.entrar).toHaveBeenCalledWith({
      email: "carlos@prueba.test",
      password: "equivocada",
    });
  });

  it("con la contraseña correcta lleva al panel", async () => {
    conPanel([]);
    falso.sesion = null;
    falso.entrar.mockImplementation(async () => {
      falso.sesion = { user: { id: USUARIO } };
      for (const oyente of falso.oyentes) oyente("SIGNED_IN", falso.sesion);
      return { error: null };
    });
    abrir("/entrar");
    fireEvent.change(await screen.findByLabelText("Correo"), {
      target: { value: "carlos@prueba.test" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "correcta" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByText("Hola, Carlos")).toBeInTheDocument();
  });
});

describe("panel del barbero", () => {
  it("muestra su fila y el día, y llama al siguiente", async () => {
    conPanel([
      turno(4),
      turno(5, { nombre: "Ana Ruiz", barbero_id: "otro-barbero" }),
      turno(6, { nombre: "Kevin Paz", barbero_id: BARBERO.id, origen: "local" }),
    ]);
    abrir("/panel");
    expect(await screen.findByText("Hola, Carlos")).toBeInTheDocument();
    expect(screen.getByText("Silla 1 · Barbería Prueba")).toBeInTheDocument();
    // Su fila: el #4 ("el primero libre") y el #6 (suyo); el #5 es de otro barbero.
    expect(screen.getByText("Óscar López")).toBeInTheDocument();
    expect(screen.getByText("Kevin Paz")).toBeInTheDocument();
    expect(screen.queryByText("Ana Ruiz")).not.toBeInTheDocument();

    const llamar = screen.getByRole("button", { name: /Llamar siguiente/ });
    expect(llamar).toHaveTextContent("#4 Óscar López");
    fireEvent.click(llamar);
    await waitFor(() =>
      expect(falso.rpc).toHaveBeenCalledWith("llamar_siguiente", { p_barbero_id: BARBERO.id }),
    );
  });

  it("con alguien llamado ofrece WhatsApp con el mensaje escrito", async () => {
    conPanel([
      turno(4, {
        estado: "llamado",
        barbero_id: BARBERO.id,
        llamado_en: new Date().toISOString(),
      }),
    ]);
    abrir("/panel");
    const enlace = await screen.findByRole("link", { name: /Avisar por WhatsApp/ });
    const href = enlace.getAttribute("href") ?? "";
    expect(href).toMatch(/^https:\/\/wa\.me\/50499998888\?text=/);
    expect(decodeURIComponent(href.split("text=")[1] ?? "")).toBe(
      "Óscar, ya te toca en Barbería Prueba. Te esperamos en la silla 1.",
    );
    fireEvent.click(screen.getByRole("button", { name: /Empezar/ }));
    await waitFor(() =>
      expect(falso.rpc).toHaveBeenCalledWith("empezar_turno", { p_turno_id: "t-4" }),
    );
  });

  it("cierra el turno con el servicio, el monto y la forma de pago", async () => {
    conPanel([
      turno(4, {
        estado: "en_silla",
        barbero_id: BARBERO.id,
        llamado_en: new Date().toISOString(),
        inicio_en: new Date().toISOString(),
      }),
    ]);
    falso.rpc.mockResolvedValue({ data: {}, error: null });
    abrir("/panel");
    fireEvent.click(await screen.findByRole("button", { name: /Terminar/ }));
    fireEvent.click(await screen.findByRole("button", { name: "Barba" }));
    fireEvent.click(screen.getByRole("button", { name: "Transferencia" }));
    fireEvent.click(screen.getByRole("button", { name: "Guardar y terminar" }));
    await waitFor(() =>
      expect(falso.rpc).toHaveBeenCalledWith("terminar_turno", {
        p_turno_id: "t-4",
        p_monto: 100,
        p_metodo_pago: "transferencia",
        p_servicio_id: "s-barba",
      }),
    );
  });

  it("explica el error cuando la base rechaza la acción", async () => {
    conPanel([turno(4)]);
    falso.rpc.mockResolvedValue({ data: null, error: { message: "barbero_ocupado" } });
    abrir("/panel");
    fireEvent.click(await screen.findByRole("button", { name: /Llamar siguiente/ }));
    expect(
      await screen.findByText("Ya tienes a alguien llamado o en la silla."),
    ).toBeInTheDocument();
  });

  it("una cuenta sin silla lo explica", async () => {
    conPanel([]);
    falso.tablas.barberos = null;
    abrir("/panel");
    expect(
      await screen.findByRole("heading", { name: "Tu cuenta no tiene silla" }),
    ).toBeInTheDocument();
  });
});
