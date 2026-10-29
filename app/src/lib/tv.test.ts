import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { filaDeEjemplo } from "@/test/filaEjemplo";
import type { FilaPublica } from "./fila";
import { ANUNCIO_MS, columnasTv, detectarLlamados, useAnuncios } from "./tv";

/** La fila de ejemplo con Ana llamando al #4 en vez de atender al #3. */
function conLlamado(numero: number): FilaPublica {
  const datos = filaDeEjemplo();
  const [ana, beto] = datos.barberos;
  if (!ana || !beto) throw new Error("faltan barberos en el ejemplo");
  return {
    ...datos,
    barberos: [
      { ...ana, atendiendo: { numero, estado: "llamado", servicio_id: "corte", desde: null } },
      beto,
    ],
    fila: datos.fila.filter((t) => t.numero !== numero),
  };
}

describe("columnasTv", () => {
  const [ana, beto] = columnasTv(filaDeEjemplo(), new Date());

  it("dice qué hace cada barbero", () => {
    expect(ana).toMatchObject({ nombre: "Ana", silla: 1, estado: "atendiendo", numero: 3 });
    expect(beto).toMatchObject({ nombre: "Beto", estado: "pausa", numero: null });
  });

  it("'sigue' sale de la simulación: Beto está en pausa, así que el #4 y el #5 van con Ana", () => {
    expect(ana?.sigue).toEqual({ numero: 4, nombre: "Óscar L.", servicio: "Corte" });
    expect(beto?.sigue).toBeNull();
  });

  it("un barbero sin nadie en la silla está libre", () => {
    const datos = filaDeEjemplo();
    const [primero] = columnasTv(
      { ...datos, barberos: datos.barberos.map((b) => ({ ...b, atendiendo: null })) },
      new Date(),
    );
    expect(primero?.estado).toBe("libre");
  });
});

describe("detectarLlamados", () => {
  const nombres = new Map([[4, "Óscar L."]]);

  it("al encender la TV no anuncia lo que ya estaba llamado", () => {
    const { nuevos, vistos } = detectarLlamados(null, conLlamado(4), nombres);
    expect(nuevos).toEqual([]);
    expect(vistos.get(filaDeEjemplo().barberos[0]?.id ?? "")).toBe(4);
  });

  it("anuncia un llamado nuevo con el nombre que tenía en la fila", () => {
    const antes = detectarLlamados(null, filaDeEjemplo(), nombres).vistos;
    const { nuevos } = detectarLlamados(antes, conLlamado(4), nombres);
    expect(nuevos).toEqual([
      { clave: "ana-4", numero: 4, nombre: "Óscar L.", barbero: "Ana", silla: 1 },
    ]);
  });

  it("no repite el anuncio mientras siga el mismo llamado", () => {
    const antes = detectarLlamados(null, conLlamado(4), nombres).vistos;
    expect(detectarLlamados(antes, conLlamado(4), nombres).nuevos).toEqual([]);
  });

  it("un llamado nuevo en la misma silla sí se anuncia", () => {
    const antes = detectarLlamados(null, conLlamado(4), nombres).vistos;
    expect(detectarLlamados(antes, conLlamado(5), nombres).nuevos).toMatchObject([
      { numero: 5, nombre: null },
    ]);
  });
});

/** La fila de ejemplo con Ana libre. */
function libre(): FilaPublica {
  const datos = filaDeEjemplo();
  return { ...datos, barberos: datos.barberos.map((b) => ({ ...b, atendiendo: null })) };
}

describe("useAnuncios", () => {
  it("anuncia cada llamado nuevo, también después de que la silla quedó libre", () => {
    vi.useFakeTimers();
    try {
      const { result, rerender } = renderHook(({ datos }) => useAnuncios(datos), {
        initialProps: { datos: libre() as FilaPublica | null },
      });
      expect(result.current).toBeNull();

      rerender({ datos: conLlamado(4) });
      expect(result.current).toMatchObject({ numero: 4 });
      act(() => {
        vi.advanceTimersByTime(ANUNCIO_MS);
      });
      expect(result.current).toBeNull();

      // El #4 no llegó: la silla queda libre y luego llama al #5.
      rerender({ datos: libre() });
      rerender({ datos: conLlamado(5) });
      expect(result.current).toMatchObject({ numero: 5 });
    } finally {
      vi.useRealTimers();
    }
  });

  it("no anuncia otra vez con cada recarga de los mismos datos", () => {
    const { result, rerender } = renderHook(({ datos }) => useAnuncios(datos), {
      initialProps: { datos: conLlamado(4) as FilaPublica | null },
    });
    rerender({ datos: conLlamado(4) });
    expect(result.current).toBeNull();
  });
});
