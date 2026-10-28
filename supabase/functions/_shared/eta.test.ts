import { describe, expect, it } from "vitest";
import {
  type BarberoEta,
  DURACION_POR_DEFECTO,
  duracionDe,
  type EntradaEta,
  estimarNuevo,
  rangoDe,
  type ServicioTerminado,
  simular,
  type TurnoEta,
} from "./eta";

const ahora = new Date("2026-10-31T15:00:00Z");
const haceMin = (minutos: number) => new Date(ahora.getTime() - minutos * 60_000);

const servicios = [
  { id: "corte", duracionMin: 30 },
  { id: "barba", duracionMin: 15 },
];

const libre = (id: string, enPausa = false): BarberoEta => ({ id, enPausa });
const turno = (numero: number, barberoId: string | null, servicioId = "corte"): TurnoEta => ({
  numero,
  barberoId,
  servicioId,
});

function entrada(cambios: Partial<EntradaEta>): EntradaEta {
  return { ahora, barberos: [libre("carlos")], servicios, fila: [], ...cambios };
}

function terminados(barberoId: string, servicioId: string, minutos: number[]) {
  return minutos.map((m): ServicioTerminado => ({ barberoId, servicioId, minutos: m }));
}

describe("duracionDe", () => {
  it("usa la duración configurada si hay menos de 5 servicios terminados", () => {
    const recientes = terminados("carlos", "corte", [40, 40, 40, 40]);
    expect(duracionDe("carlos", "corte", servicios, recientes)).toBe(30);
  });

  it("promedia los servicios recientes desde 5", () => {
    const recientes = terminados("carlos", "corte", [40, 50, 40, 50, 45]);
    expect(duracionDe("carlos", "corte", servicios, recientes)).toBe(45);
  });

  it("solo promedia los últimos 20", () => {
    const recientes = terminados("carlos", "corte", [...Array(20).fill(20), ...Array(30).fill(90)]);
    expect(duracionDe("carlos", "corte", servicios, recientes)).toBe(20);
  });

  it("solo cuenta los servicios de ese barbero y de ese servicio", () => {
    const recientes = [
      ...terminados("jorge", "corte", [60, 60, 60, 60, 60]),
      ...terminados("carlos", "barba", [60, 60, 60, 60, 60]),
    ];
    expect(duracionDe("carlos", "corte", servicios, recientes)).toBe(30);
  });

  it("ignora duraciones imposibles, como un turno que nadie terminó", () => {
    const recientes = terminados("carlos", "corte", [40, 40, 40, 40, 600, 0, Number.NaN]);
    expect(duracionDe("carlos", "corte", servicios, recientes)).toBe(30);
  });

  it("usa la duración por defecto si el servicio ya no está activo", () => {
    expect(duracionDe("carlos", "tinte", servicios)).toBe(DURACION_POR_DEFECTO);
  });
});

describe("simular", () => {
  it("con la fila vacía no estima nada", () => {
    expect(simular(entrada({})).size).toBe(0);
  });

  it("encadena los servicios de un barbero libre", () => {
    const fila = [turno(1, "carlos"), turno(2, "carlos", "barba"), turno(3, "carlos")];
    const r = simular(entrada({ fila }));
    expect(r.get(1)).toEqual({ minutos: 0, barberoId: "carlos" });
    expect(r.get(2)).toEqual({ minutos: 30, barberoId: "carlos" });
    expect(r.get(3)).toEqual({ minutos: 45, barberoId: "carlos" });
  });

  it("descuenta lo que ya avanzó el servicio en la silla", () => {
    const barberos: BarberoEta[] = [
      {
        id: "carlos",
        enPausa: false,
        atendiendo: { estado: "en_silla", servicioId: "corte", desde: haceMin(10) },
      },
    ];
    expect(simular(entrada({ barberos, fila: [turno(1, "carlos")] })).get(1)?.minutos).toBe(20);
  });

  it("acepta la hora como texto, como llega de la base", () => {
    const barberos: BarberoEta[] = [
      {
        id: "carlos",
        enPausa: false,
        atendiendo: { estado: "en_silla", servicioId: "corte", desde: haceMin(10).toISOString() },
      },
    ];
    expect(simular(entrada({ barberos, fila: [turno(1, "carlos")] })).get(1)?.minutos).toBe(20);
  });

  it("un servicio que ya se pasó de su duración deja al barbero a punto de quedar libre", () => {
    const barberos: BarberoEta[] = [
      {
        id: "carlos",
        enPausa: false,
        atendiendo: { estado: "en_silla", servicioId: "corte", desde: haceMin(45) },
      },
    ];
    expect(simular(entrada({ barberos, fila: [turno(1, "carlos")] })).get(1)?.minutos).toBe(0);
  });

  it("a un cliente llamado le falta el servicio completo", () => {
    const barberos: BarberoEta[] = [
      {
        id: "carlos",
        enPausa: false,
        atendiendo: { estado: "llamado", servicioId: "barba", desde: haceMin(3) },
      },
    ];
    expect(simular(entrada({ barberos, fila: [turno(1, "carlos")] })).get(1)?.minutos).toBe(15);
  });

  it("quien pide un barbero lo espera aunque otro esté libre", () => {
    const barberos: BarberoEta[] = [
      libre("carlos"),
      {
        id: "jorge",
        enPausa: false,
        atendiendo: { estado: "en_silla", servicioId: "corte", desde: haceMin(5) },
      },
    ];
    const r = simular(entrada({ barberos, fila: [turno(1, "jorge")] }));
    expect(r.get(1)).toEqual({ minutos: 25, barberoId: "jorge" });
  });

  it("'el primero libre' pasa con quien termine antes", () => {
    const barberos: BarberoEta[] = [
      {
        id: "carlos",
        enPausa: false,
        atendiendo: { estado: "en_silla", servicioId: "corte", desde: haceMin(5) },
      },
      {
        id: "jorge",
        enPausa: false,
        atendiendo: { estado: "en_silla", servicioId: "corte", desde: haceMin(20) },
      },
    ];
    const r = simular(entrada({ barberos, fila: [turno(1, null), turno(2, null)] }));
    expect(r.get(1)).toEqual({ minutos: 10, barberoId: "jorge" });
    expect(r.get(2)).toEqual({ minutos: 25, barberoId: "carlos" });
  });

  it("si dos barberos quedan libres a la vez, gana la primera silla", () => {
    const barberos = [libre("carlos"), libre("jorge")];
    const r = simular(entrada({ barberos, fila: [turno(1, null)] }));
    expect(r.get(1)).toEqual({ minutos: 0, barberoId: "carlos" });
  });

  it("el turno de otro barbero no frena a los que vienen detrás", () => {
    const barberos = [
      libre("carlos"),
      {
        id: "jorge",
        enPausa: false,
        atendiendo: { estado: "en_silla" as const, servicioId: "corte", desde: haceMin(0) },
      },
    ];
    const r = simular(entrada({ barberos, fila: [turno(1, "jorge"), turno(2, null)] }));
    expect(r.get(1)).toEqual({ minutos: 30, barberoId: "jorge" });
    expect(r.get(2)).toEqual({ minutos: 0, barberoId: "carlos" });
  });

  it("un barbero en pausa no recibe a nadie", () => {
    const barberos = [libre("carlos", true), libre("jorge")];
    const r = simular(entrada({ barberos, fila: [turno(1, "carlos"), turno(2, null)] }));
    expect(r.get(1)).toEqual({ minutos: null, motivo: "barbero_no_disponible" });
    expect(r.get(2)).toEqual({ minutos: 0, barberoId: "jorge" });
  });

  it("sin barberos disponibles, 'el primero libre' no tiene estimado", () => {
    const barberos = [libre("carlos", true)];
    const r = simular(entrada({ barberos, fila: [turno(1, null)] }));
    expect(r.get(1)).toEqual({ minutos: null, motivo: "sin_barberos" });
  });

  it("un barbero que ya no está activo cuenta como no disponible", () => {
    const r = simular(entrada({ fila: [turno(1, "kevin")] }));
    expect(r.get(1)).toEqual({ minutos: null, motivo: "barbero_no_disponible" });
  });

  it("usa el promedio reciente del barbero", () => {
    const recientes = terminados("carlos", "corte", [50, 50, 50, 50, 50]);
    const r = simular(entrada({ recientes, fila: [turno(1, "carlos"), turno(2, "carlos")] }));
    expect(r.get(2)?.minutos).toBe(50);
  });
});

describe("estimarNuevo", () => {
  it("estima a alguien que se anota al final de la fila", () => {
    const fila = [turno(1, "carlos"), turno(2, "carlos")];
    expect(estimarNuevo(entrada({ fila }), { barberoId: "carlos", servicioId: "corte" })).toEqual({
      minutos: 60,
      barberoId: "carlos",
    });
  });

  it("con 'el primero libre' dice con quién le tocaría", () => {
    const barberos = [libre("carlos"), libre("jorge")];
    const fila = [turno(1, "carlos")];
    expect(
      estimarNuevo(entrada({ barberos, fila }), { barberoId: null, servicioId: "corte" }),
    ).toEqual({ minutos: 0, barberoId: "jorge" });
  });

  it("no cambia la fila que recibe", () => {
    const fila = [turno(1, "carlos")];
    estimarNuevo(entrada({ fila }), { barberoId: "carlos", servicioId: "corte" });
    expect(fila).toHaveLength(1);
  });
});

describe("rangoDe", () => {
  it.each([
    [0, [0, 10]],
    [3, [0, 15]],
    [33, [30, 45]],
    [100, [100, 120]],
    [-5, [0, 10]],
    [Number.NaN, [0, 10]],
  ])("%s min → %j", (minutos, esperado) => {
    expect(rangoDe(minutos)).toEqual(esperado);
  });
});
