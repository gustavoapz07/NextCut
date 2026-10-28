// Ganchos del prototipo: simulan el tiempo real para que las pantallas se sientan vivas.

import { useState } from "react";
import { useIntervalo } from "@/lib/ganchos";
import {
  type Barbero,
  barberos as barberosIniciales,
  buscarServicio,
  filaInicial,
  type IdBarbero,
  nombresNuevos,
  type Preferencia,
  servicios,
  type TurnoFila,
} from "./datos";

export { useIntervalo, useReloj, useTitulo } from "@/lib/ganchos";

/** Segundos que pasaron desde que cambió `clave`. */
export function useCronometro(clave: unknown, activo = true) {
  const [segundos, setSegundos] = useState(0);
  const [claveVista, setClaveVista] = useState(clave);
  if (clave !== claveVista) {
    setClaveVista(clave);
    setSegundos(0);
  }
  useIntervalo(() => setSegundos((s) => s + 1), activo ? 1000 : null);
  return segundos;
}

export interface Evento {
  id: number;
  tipo: "llega" | "pasa";
  numero: number;
  nombre: string;
  barbero: Preferencia;
}

interface EstadoFila {
  fila: TurnoFila[];
  barberos: Barbero[];
  siguiente: number;
  paso: number;
  evento: Evento | null;
}

const ORDEN: Preferencia[] = ["jorge", "carlos", "cualquiera", "kevin", "carlos"];
const RITMO = ["pasa", "llega", "llega", "pasa", "pasa", "llega"] as const;

function masPronto(barberos: Barbero[]): IdBarbero {
  const [primero] = [...barberos]
    .filter((b) => b.estado !== "pausa")
    .sort((a, b) => a.restante - b.restante);
  return primero?.id ?? "kevin";
}

function avanzar(e: EstadoFila): EstadoFila {
  const paso = e.paso + 1;
  const ritmo = RITMO[paso % RITMO.length];
  const llega = e.fila.length <= 5 || (e.fila.length < 9 && ritmo === "llega");

  if (llega) {
    const nombre = nombresNuevos[paso % nombresNuevos.length] ?? "Cliente";
    const barbero = ORDEN[paso % ORDEN.length] ?? "cualquiera";
    const turno: TurnoFila = {
      numero: e.siguiente,
      nombre,
      barbero,
      servicio: servicios[paso % servicios.length]?.id ?? "corte",
      origen: paso % 3 === 0 ? "local" : "remoto",
      espera: 0,
    };
    return {
      ...e,
      paso,
      siguiente: e.siguiente + 1,
      fila: [...e.fila, turno],
      evento: { id: paso, tipo: "llega", numero: turno.numero, nombre, barbero },
    };
  }

  const [primero, ...resto] = e.fila;
  if (!primero) return { ...e, paso };
  const id = primero.barbero === "cualquiera" ? masPronto(e.barberos) : primero.barbero;
  const minutos = buscarServicio(primero.servicio)?.minutos ?? 25;
  return {
    ...e,
    paso,
    fila: resto.map((t) => ({ ...t, espera: t.espera + 2 })),
    barberos: e.barberos.map((b) =>
      b.id === id
        ? { ...b, estado: "atendiendo", atendiendo: primero.numero, restante: minutos }
        : { ...b, restante: Math.max(2, b.restante - 3) },
    ),
    evento: { id: paso, tipo: "pasa", numero: primero.numero, nombre: primero.nombre, barbero: id },
  };
}

/** Fila que se mueve sola: gente que llega y gente que pasa a la silla. */
export function useFilaEnVivo(intervalo = 7000) {
  const [estado, setEstado] = useState<EstadoFila>(() => ({
    fila: filaInicial,
    barberos: barberosIniciales,
    siguiente: 33,
    paso: 0,
    evento: { id: 0, tipo: "llega", numero: 32, nombre: "Kenia A.", barbero: "cualquiera" },
  }));
  useIntervalo(() => setEstado(avanzar), intervalo);
  return estado;
}
