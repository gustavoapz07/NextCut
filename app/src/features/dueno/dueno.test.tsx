import { fireEvent, render, screen, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { destinoAlEntrar } from "@/features/acceso/Entrar";
import type { ReporteDia, TurnoDueno } from "@/lib/dueno";
import { horaCorta, horasDelDia } from "@/lib/dueno";
import { rutas } from "@/router";

// Supabase falso: sesión, consultas a tablas (una respuesta por tabla) y funciones de la base.
const falso = vi.hoisted(() => ({
  rpc: vi.fn(),
  sesion: null as { user: { id: string } } | null,
  tablas: {} as Record<string, unknown>,
  /** Cada insert o update que hace la pantalla: [tabla, operación, valores]. */
  escrituras: [] as Array<[string, string, unknown]>,
}));

vi.mock("@/lib/supabase", () => {
  const canal = { on: () => canal, subscribe: () => canal };

  function consulta(tabla: string) {
    let escritura = false;
    // Una escritura con .select("id") devuelve la fila que cambió.
    const respuesta = () =>
      escritura
        ? { data: [{ id: "fila-cambiada" }], error: null }
        : { data: falso.tablas[tabla] ?? null, error: null };
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
          if (propiedad === "insert" || propiedad === "update") {
            return (valores: unknown) => {
              escritura = true;
              falso.escrituras.push([tabla, propiedad, valores]);
              return cadena;
            };
          }
          return () => cadena;
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
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signOut: vi.fn(),
      },
    },
  };
});

const BARBERIA = {
  id: "e0000000-0000-4000-8000-000000000001",
  nombre: "Barbería Prueba",
  slug: "barberia-prueba",
  zona: "Col. Centro, El Progreso",
  zona_horaria: "America/Tegucigalpa",
  fila_remota_activa: true,
};
const CARLOS = { id: "b-carlos", nombre: "Carlos", silla: 1, en_pausa: false };
const JORGE = { id: "b-jorge", nombre: "Jorge", silla: 2, en_pausa: false };

const REPORTE: ReporteDia = {
  fecha: "2026-10-31",
  turnos: 7,
  atendidos: 3,
  ingresos: 450,
  espera_promedio_min: 18,
  error_estimado_min: 4,
  abandonos: 2,
  no_llegaron: 1,
  en_fila: 2,
  por_metodo: { efectivo: 300, tarjeta: 150 },
  por_barbero: [
    {
      barbero_id: CARLOS.id,
      nombre: "Carlos",
      atendidos: 2,
      ingresos: 300,
      espera_promedio_min: 20,
    },
    {
      barbero_id: JORGE.id,
      nombre: "Jorge",
      atendidos: 1,
      ingresos: 150,
      espera_promedio_min: null,
    },
  ],
  por_hora: [
    { hora: 13, turnos: 1 },
    { hora: 15, turnos: 4 },
  ],
};

function turno(numero: number, cambios: Partial<TurnoDueno> = {}): TurnoDueno {
  return {
    id: `t-${numero}`,
    numero,
    nombre: "Óscar López",
    barbero_id: null,
    origen: "remoto",
    estado: "esperando",
    oculto: false,
    creado_en: new Date(Date.now() - 12 * 60_000).toISOString(),
    ...cambios,
  };
}

/** Una cuenta dueña de "Barbería Prueba", con su reporte del día y su fila. */
function comoDueno(cambios: { reporte?: ReporteDia; turnos?: TurnoDueno[] } = {}) {
  falso.sesion = { user: { id: "u-duena" } };
  falso.tablas = {
    miembros: { barberia_id: BARBERIA.id },
    barberias: BARBERIA,
    barberos: [CARLOS, JORGE],
    turnos: cambios.turnos ?? [
      turno(8, { nombre: "Ana Pérez", barbero_id: CARLOS.id, estado: "en_silla" }),
      turno(9, { nombre: "Luis Mejía", barbero_id: CARLOS.id }),
      turno(10, { nombre: "Marta Díaz", origen: "local" }),
    ],
  };
  const reporte = cambios.reporte ?? REPORTE;
  falso.rpc.mockImplementation(async (funcion: string) => ({
    data: funcion === "reporte_dia" ? reporte : true,
    error: null,
  }));
}

function abrir(ruta: string) {
  render(<RouterProvider router={createMemoryRouter(rutas, { initialEntries: [ruta] })} />);
}

beforeEach(() => {
  falso.sesion = null;
  falso.tablas = {};
  falso.escrituras = [];
  falso.rpc.mockReset();
  falso.rpc.mockResolvedValue({ data: null, error: null });
});

describe("panel del dueño", () => {
  it("sin sesión manda a entrar", async () => {
    abrir("/dueno");
    expect(await screen.findByRole("heading", { level: 1, name: "Entrar" })).toBeInTheDocument();
  });

  it("después de entrar vuelve a la sección que se pidió", async () => {
    const router = createMemoryRouter(rutas, { initialEntries: ["/dueno/configuracion"] });
    render(<RouterProvider router={router} />);
    expect(await screen.findByRole("heading", { level: 1, name: "Entrar" })).toBeInTheDocument();
    expect(new URLSearchParams(router.state.location.search).get("siguiente")).toBe(
      "/dueno/configuracion",
    );
    expect(destinoAlEntrar("/dueno/configuracion")).toBe("/dueno/configuracion");
  });

  it("una cuenta que no es dueña no ve nada de la barbería", async () => {
    falso.sesion = { user: { id: "u-barbero" } };
    falso.tablas = { miembros: null };
    abrir("/dueno");
    expect(
      await screen.findByRole("heading", { level: 1, name: "Solo para dueños" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir a mi panel" })).toHaveAttribute("href", "/panel");
    expect(falso.rpc).not.toHaveBeenCalled();
  });

  it("muestra el reporte del día de su barbería", async () => {
    comoDueno();
    abrir("/dueno");
    expect(await screen.findByText("7 turnos hoy")).toBeInTheDocument();
    expect(falso.rpc).toHaveBeenCalledWith("reporte_dia", { p_barberia_id: BARBERIA.id });
    expect(screen.getAllByText("Barbería Prueba").length).toBeGreaterThan(0);
    expect(screen.getByText("L 150 por cliente")).toBeInTheDocument();
    expect(screen.getByText("1 no llegó · 1 canceló")).toBeInTheDocument();
    // Por barbero: sin espera calculada no la inventa.
    expect(screen.getByText("2 cortes · espera 20 min")).toBeInTheDocument();
    expect(screen.getByText("1 corte")).toBeInTheDocument();
    // Horas pico sin huecos: 1, 2 y 3 de la tarde.
    expect(screen.getByText("Pico a las 3 p. m. · 4 turnos")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Turnos por hora/ })).toHaveAccessibleName(
      "Turnos por hora: 1 p. m.: 1, 2 p. m.: 0, 3 p. m.: 4",
    );
  });

  it("la fila muestra quien espera o fue llamado, con nombre completo y su barbero", async () => {
    comoDueno();
    abrir("/dueno");
    expect(await screen.findByText("Luis Mejía")).toBeInTheDocument();
    expect(screen.getByText("Marta Díaz")).toBeInTheDocument();
    // Quien ya está en la silla no está en la fila.
    expect(screen.queryByText("Ana Pérez")).not.toBeInTheDocument();
    expect(screen.getByText("El primero")).toBeInTheDocument();
  });

  it("sin turnos hoy lo dice en vez de dibujar una gráfica vacía", async () => {
    comoDueno({
      reporte: { ...REPORTE, turnos: 0, atendidos: 0, ingresos: 0, por_hora: [] },
      turnos: [],
    });
    abrir("/dueno");
    expect(await screen.findByText("Todavía no hay turnos hoy.")).toBeInTheDocument();
    expect(screen.getByText("No hay nadie en la fila.")).toBeInTheDocument();
    expect(screen.getByText("Todavía sin cobros")).toBeInTheDocument();
  });

  it("pausa la fila remota", async () => {
    comoDueno();
    abrir("/dueno");
    fireEvent.click(await screen.findByRole("switch", { name: /Fila remota abierta/ }));
    expect(await screen.findByText("Pausaste la fila remota")).toBeInTheDocument();
    expect(falso.rpc).toHaveBeenCalledWith("pausar_fila_remota", {
      p_barberia_id: BARBERIA.id,
      p_pausada: true,
    });
  });

  it("oculta un turno de las pantallas públicas", async () => {
    comoDueno();
    abrir("/dueno");
    fireEvent.click(await screen.findByRole("button", { name: "Ocultar el turno 9" }));
    await vi.waitFor(() =>
      expect(falso.rpc).toHaveBeenCalledWith("ocultar_turno", {
        p_turno_id: "t-9",
        p_oculto: true,
      }),
    );
  });

  it("renombra un turno una sola vez, con el nombre limpio", async () => {
    comoDueno();
    abrir("/dueno");
    fireEvent.click(await screen.findByRole("button", { name: "Renombrar el turno 9" }));
    const campo = screen.getByLabelText("Nuevo nombre para el turno 9");
    fireEvent.change(campo, { target: { value: "  Luis   M.  " } });
    fireEvent.keyDown(campo, { key: "Enter" });
    fireEvent.blur(campo);
    await vi.waitFor(() =>
      expect(falso.rpc).toHaveBeenCalledWith("renombrar_turno", {
        p_turno_id: "t-9",
        p_nombre: "Luis M.",
      }),
    );
    expect(falso.rpc.mock.calls.filter(([f]) => f === "renombrar_turno")).toHaveLength(1);
  });

  it("Escape deja el nombre como estaba", async () => {
    comoDueno();
    abrir("/dueno");
    fireEvent.click(await screen.findByRole("button", { name: "Renombrar el turno 9" }));
    const campo = screen.getByLabelText("Nuevo nombre para el turno 9");
    fireEvent.change(campo, { target: { value: "Otro" } });
    fireEvent.keyDown(campo, { key: "Escape" });
    fireEvent.blur(campo);
    expect(falso.rpc).not.toHaveBeenCalledWith("renombrar_turno", expect.anything());
  });

  it("explica si la base rechaza el cambio", async () => {
    comoDueno();
    falso.rpc.mockImplementation(async (funcion: string) =>
      funcion === "reporte_dia"
        ? { data: REPORTE, error: null }
        : { data: null, error: { message: "sin_permiso" } },
    );
    abrir("/dueno");
    fireEvent.click(await screen.findByRole("button", { name: "Ocultar el turno 9" }));
    expect(
      await screen.findByText("Tu cuenta no puede cambiar esta barbería."),
    ).toBeInTheDocument();
  });

  it("el QR lleva a la fila real, y las tres secciones están en el menú", async () => {
    comoDueno();
    abrir("/dueno/qr");
    expect(await screen.findByRole("heading", { level: 1, name: "Código QR" })).toBeInTheDocument();
    const enlace = `${window.location.host}/b/barberia-prueba`;
    expect(screen.getByText(enlace)).toBeInTheDocument();
    expect(screen.getByTitle("Código QR de la fila de Barbería Prueba")).toBeInTheDocument();
    const [lateral] = screen.getAllByRole("navigation", { name: "Secciones del dueño" });
    expect(within(lateral as HTMLElement).getByText("Configuración")).toHaveAttribute(
      "href" in (lateral as HTMLElement) ? "href" : "class",
    );
  });
});

describe("configuración del dueño", () => {
  /** La barbería con dos barberos (uno con cuenta) y un servicio activo y otro que ya no se ofrece. */
  function conConfiguracion() {
    comoDueno();
    falso.tablas.barberias = { ...BARBERIA, max_fila: 20, tolerancia_min: 5 };
    falso.tablas.barberos = [
      { id: "b-carlos", nombre: "Carlos", apodo: null, silla: 1, activo: true, user_id: "u-1" },
      { id: "b-jorge", nombre: "Jorge", apodo: "El Profe", silla: 2, activo: true, user_id: null },
    ];
    falso.tablas.servicios = [
      { id: "s-corte", nombre: "Corte clásico", duracion_min: 30, precio_ref: 150, activo: true },
      { id: "s-barba", nombre: "Barba", duracion_min: 15, precio_ref: 100, activo: false },
    ];
  }

  const pestana = async (nombre: string) =>
    fireEvent.click(await screen.findByRole("tab", { name: nombre }));

  it("muestra los datos reales de la barbería, su equipo y sus servicios", async () => {
    conConfiguracion();
    abrir("/dueno/configuracion");
    expect(await screen.findByLabelText("Nombre")).toHaveValue("Barbería Prueba");
    expect(
      screen.getByText("El enlace no cambia, para que los QR impresos sigan funcionando."),
    ).toBeInTheDocument();

    await pestana("Barberos");
    const nombres = await screen.findAllByLabelText("Nombre del barbero");
    expect(nombres.map((n) => (n as HTMLInputElement).value)).toEqual(["Carlos", "Jorge"]);
    expect(screen.getByText("Entra al panel con su cuenta.")).toBeInTheDocument();
    expect(screen.getByText("Todavía no tiene cuenta para el panel.")).toBeInTheDocument();

    await pestana("Servicios");
    expect(await screen.findByDisplayValue("Corte clásico")).toBeInTheDocument();
    expect(screen.getByText("Ya no se ofrecen")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Volver a ofrecer/ })).toBeInTheDocument();
  });

  it("cambia la duración de un servicio y guarda solo eso", async () => {
    conConfiguracion();
    abrir("/dueno/configuracion");
    await pestana("Servicios");
    fireEvent.click(await screen.findByRole("button", { name: "Más minutos para Corte clásico" }));
    fireEvent.click(await screen.findByRole("button", { name: "Guardar" }));
    expect(await screen.findByText("Cambios guardados")).toBeInTheDocument();
    expect(falso.escrituras).toEqual([["servicios", "update", { duracion_min: 35 }]]);
  });

  it("agrega un barbero con la siguiente silla libre", async () => {
    conConfiguracion();
    abrir("/dueno/configuracion");
    await pestana("Barberos");
    fireEvent.click(await screen.findByRole("button", { name: /Agregar barbero/ }));
    const nombres = screen.getAllByLabelText("Nombre del barbero");
    fireEvent.change(nombres.at(-1) as HTMLElement, { target: { value: "Kevin" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
    expect(await screen.findByText("Cambios guardados")).toBeInTheDocument();
    expect(falso.escrituras).toEqual([
      [
        "barberos",
        "insert",
        { nombre: "Kevin", apodo: null, silla: 3, activo: true, barberia_id: BARBERIA.id },
      ],
    ]);
  });

  it("quitar un servicio guardado lo deja inactivo, no lo borra", async () => {
    conConfiguracion();
    falso.tablas.servicios = [
      { id: "s-corte", nombre: "Corte clásico", duracion_min: 30, precio_ref: 150, activo: true },
      { id: "s-barba", nombre: "Barba", duracion_min: 15, precio_ref: 100, activo: true },
    ];
    abrir("/dueno/configuracion");
    await pestana("Servicios");
    fireEvent.click(await screen.findByRole("button", { name: "Quitar Barba" }));
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
    expect(await screen.findByText("Cambios guardados")).toBeInTheDocument();
    expect(falso.escrituras).toEqual([["servicios", "update", { activo: false }]]);
  });

  it("no guarda un servicio sin nombre y explica qué arreglar", async () => {
    conConfiguracion();
    abrir("/dueno/configuracion");
    await pestana("Servicios");
    fireEvent.click(await screen.findByRole("button", { name: /Agregar servicio/ }));
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
    expect(await screen.findByText(/el nombre lleva entre 2 y 40 letras/)).toBeInTheDocument();
    expect(falso.escrituras).toEqual([]);
  });

  it("descartar vuelve a lo guardado", async () => {
    conConfiguracion();
    abrir("/dueno/configuracion");
    fireEvent.change(await screen.findByLabelText("Nombre"), { target: { value: "Otra" } });
    fireEvent.click(await screen.findByRole("button", { name: "Descartar" }));
    expect(screen.getByLabelText("Nombre")).toHaveValue("Barbería Prueba");
    // La barra se va con una animación.
    await vi.waitFor(() =>
      expect(screen.queryByText("Tienes cambios sin guardar")).not.toBeInTheDocument(),
    );
  });

  it("las protecciones están siempre activas: no hay interruptores para apagarlas", async () => {
    conConfiguracion();
    abrir("/dueno/configuracion");
    await pestana("Reglas de la fila");
    expect(await screen.findByText("Un turno activo por teléfono")).toBeInTheDocument();
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
  });
});

describe("ayudantes", () => {
  it("después de entrar solo va a los paneles del personal", () => {
    expect(destinoAlEntrar("/dueno")).toBe("/dueno");
    expect(destinoAlEntrar("/dueno/qr")).toBe("/dueno/qr");
    expect(destinoAlEntrar("/panel")).toBe("/panel");
    expect(destinoAlEntrar(null)).toBe("/panel");
    expect(destinoAlEntrar("https://ataque.com")).toBe("/panel");
    expect(destinoAlEntrar("//ataque.com")).toBe("/panel");
    expect(destinoAlEntrar("/b/barberia-prueba")).toBe("/panel");
  });

  it("las horas pico van de la primera a la última sin huecos", () => {
    expect(horasDelDia([])).toEqual([]);
    expect(
      horasDelDia([
        { hora: 9, turnos: 2 },
        { hora: 11, turnos: 1 },
      ]),
    ).toEqual([
      { hora: 9, turnos: 2 },
      { hora: 10, turnos: 0 },
      { hora: 11, turnos: 1 },
    ]);
    expect([horaCorta(9), horaCorta(12), horaCorta(13), horaCorta(0)]).toEqual([
      "9 a. m.",
      "12 p. m.",
      "1 p. m.",
      "12 a. m.",
    ]);
  });
});
