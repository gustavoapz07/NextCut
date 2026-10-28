// Resumen de la fila pública para la página `/b/:slug`.

import { type Estimado, estimarNuevo } from "@shared/eta";
import { type BarberoPublico, entradaEta, type FilaPublica } from "@shared/filaPublica";
import type { Tono } from "@/prototipo/datos";

export {
  type BarberoPublico,
  entradaEta,
  esquemaFilaPublica,
  type FilaPublica,
} from "@shared/filaPublica";

export interface ResumenBarbero {
  barbero: BarberoPublico;
  enFila: number;
  estimado: Estimado;
}

/**
 * Cuánto esperaría alguien que se anota ahora con cada barbero y con "el primero libre".
 * Se estima con el primer servicio de la lista (el más barato, casi siempre el corte).
 */
export function resumirFila(datos: FilaPublica, ahora: Date) {
  const entrada = entradaEta(datos, ahora);
  const servicioId = datos.servicios[0]?.id ?? "";
  const porBarbero: ResumenBarbero[] = datos.barberos.map((barbero) => ({
    barbero,
    enFila: datos.fila.filter((t) => t.barbero_id === barbero.id).length,
    estimado: estimarNuevo(entrada, { barberoId: barbero.id, servicioId }),
  }));
  const primeroLibre = estimarNuevo(entrada, { barberoId: null, servicioId });

  let masRapido: { barbero: BarberoPublico; minutos: number } | null = null;
  for (const { barbero, estimado } of porBarbero) {
    if (estimado.minutos === null) continue;
    if (!masRapido || estimado.minutos < masRapido.minutos) {
      masRapido = { barbero, minutos: estimado.minutos };
    }
  }
  return { porBarbero, primeroLibre, masRapido };
}

/** "Carlos" · "El Profe · atendiendo al #24" · "en pausa". */
export function detalleBarbero(barbero: BarberoPublico) {
  const estado = barbero.en_pausa
    ? "en pausa"
    : barbero.atendiendo
      ? `atendiendo al #${barbero.atendiendo.numero}`
      : "libre";
  return barbero.apodo ? `${barbero.apodo} · ${estado}` : estado;
}

const TONOS: Tono[] = ["rojo", "azul", "tinta"];

/** Color del avatar de cada barbero, según su lugar en la lista. */
export const tonoDe = (indice: number): Tono => TONOS[indice % TONOS.length] ?? "tinta";
