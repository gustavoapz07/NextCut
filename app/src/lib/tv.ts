// Lo que muestra la pantalla de TV del local, calculado desde `fila_publica`.

import { simular } from "@shared/eta";
import { useEffect, useRef, useState } from "react";
import { entradaEta, type FilaPublica, tonoDe } from "./fila";

export interface ColumnaTv {
  id: string;
  nombre: string;
  silla: number | null;
  tono: ReturnType<typeof tonoDe>;
  estado: "pausa" | "libre" | "llamando" | "atendiendo";
  /** El turno que tiene llamado o en la silla. */
  numero: number | null;
  /** El que pasa después con este barbero, según la misma simulación del estimado. */
  sigue: { numero: number; nombre: string; servicio: string } | null;
}

/**
 * Una columna por barbero. "Sigue" sale de la simulación del estimado, así un turno de
 * "el primero libre" aparece una sola vez, con el barbero que probablemente lo atienda.
 */
export function columnasTv(datos: FilaPublica, ahora: Date): ColumnaTv[] {
  const asignados = simular(entradaEta(datos, ahora));
  const servicios = new Map(datos.servicios.map((s) => [s.id, s.nombre]));

  return datos.barberos.map((barbero, indice) => {
    const siguiente = datos.fila.find((t) => {
      const estimado = asignados.get(t.numero);
      return estimado?.minutos != null && estimado.barberoId === barbero.id;
    });
    const atendiendo = barbero.atendiendo;
    return {
      id: barbero.id,
      nombre: barbero.nombre,
      silla: barbero.silla,
      tono: tonoDe(indice),
      estado: barbero.en_pausa
        ? "pausa"
        : !atendiendo
          ? "libre"
          : atendiendo.estado === "llamado"
            ? "llamando"
            : "atendiendo",
      numero: atendiendo?.numero ?? null,
      sigue: siguiente
        ? {
            numero: siguiente.numero,
            nombre: siguiente.nombre ?? "Cliente",
            servicio: servicios.get(siguiente.servicio_id) ?? "",
          }
        : null,
    };
  });
}

export interface Llamado {
  clave: string;
  numero: number;
  /** El nombre corto del turno, si estaba en la fila la última vez que se vio. */
  nombre: string | null;
  barbero: string;
  silla: number | null;
}

/** Quién está llamado en cada silla: barbero → número de turno. */
export type LlamadosVistos = Map<string, number>;

/**
 * Compara con lo visto antes y devuelve los llamados nuevos, para anunciarlos.
 * La primera vez (`antes` vacío o `null`) no anuncia nada: la TV recién se encendió.
 */
export function detectarLlamados(
  antes: LlamadosVistos | null,
  datos: FilaPublica,
  nombres: ReadonlyMap<number, string>,
): { nuevos: Llamado[]; vistos: LlamadosVistos } {
  const vistos: LlamadosVistos = new Map();
  const nuevos: Llamado[] = [];
  for (const barbero of datos.barberos) {
    const atendiendo = barbero.atendiendo;
    if (atendiendo?.estado !== "llamado") continue;
    vistos.set(barbero.id, atendiendo.numero);
    if (antes && antes.get(barbero.id) !== atendiendo.numero) {
      nuevos.push({
        clave: `${barbero.id}-${atendiendo.numero}`,
        numero: atendiendo.numero,
        nombre: nombres.get(atendiendo.numero) ?? null,
        barbero: barbero.nombre,
        silla: barbero.silla,
      });
    }
  }
  return { nuevos, vistos };
}

/** Cuánto dura cada anuncio en pantalla. */
export const ANUNCIO_MS = 4500;

/** Llamados nuevos, uno a la vez, cada uno unos segundos en pantalla. */
export function useAnuncios(datos: FilaPublica | null) {
  const vistos = useRef<LlamadosVistos | null>(null);
  // Los nombres se recuerdan de la fila: al llamarlos, ya no están en ella.
  const nombres = useRef(new Map<number, string>());
  const [cola, setCola] = useState<Llamado[]>([]);

  useEffect(() => {
    if (!datos) return;
    for (const t of datos.fila) if (t.nombre) nombres.current.set(t.numero, t.nombre);
    const { nuevos, vistos: ahora } = detectarLlamados(vistos.current, datos, nombres.current);
    vistos.current = ahora;
    if (nuevos.length > 0) setCola((c) => [...c, ...nuevos]);
  }, [datos]);

  const actual = cola[0] ?? null;
  useEffect(() => {
    if (!actual) return;
    const id = window.setTimeout(() => setCola((c) => c.slice(1)), ANUNCIO_MS);
    return () => window.clearTimeout(id);
  }, [actual]);
  return actual;
}
