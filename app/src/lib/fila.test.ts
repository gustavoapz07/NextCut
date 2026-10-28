import { describe, expect, it } from "vitest";
import { filaDeEjemplo } from "@/test/filaEjemplo";
import { detalleBarbero, esquemaFilaPublica, resumirFila } from "./fila";

describe("esquemaFilaPublica", () => {
  it("acepta la respuesta de la base", () => {
    expect(esquemaFilaPublica.safeParse(filaDeEjemplo()).success).toBe(true);
  });

  it("rechaza una respuesta con otra forma", () => {
    expect(esquemaFilaPublica.safeParse({ barberia: null }).success).toBe(false);
  });
});

describe("resumirFila", () => {
  const ahora = new Date();
  const { porBarbero, primeroLibre, masRapido } = resumirFila(filaDeEjemplo(), ahora);
  const [ana, beto] = porBarbero;

  it("estima cuánto esperaría alguien que se anota con cada barbero", () => {
    // Ana: 20 min que le faltan + el corte de #4 (30) + la barba de #5 (15), que solo ella puede tomar.
    expect(ana?.estimado.minutos).toBeCloseTo(65, 1);
    expect(ana?.enFila).toBe(1);
  });

  it("un barbero en pausa no tiene estimado", () => {
    expect(beto?.estimado).toEqual({ minutos: null, motivo: "barbero_no_disponible" });
  });

  it("'el primero libre' y la espera más corta salen del barbero disponible", () => {
    expect(primeroLibre).toMatchObject({ barberoId: "ana" });
    expect(masRapido?.barbero.nombre).toBe("Ana");
  });
});

describe("detalleBarbero", () => {
  it("dice qué hace cada barbero", () => {
    const [ana, beto] = filaDeEjemplo().barberos;
    expect(ana && detalleBarbero(ana)).toBe("La Tijera · atendiendo al #3");
    expect(beto && detalleBarbero(beto)).toBe("en pausa");
  });
});
