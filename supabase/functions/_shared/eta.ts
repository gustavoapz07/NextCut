// Estimado de espera de NextCut. TypeScript puro y sin dependencias: lo usan la página del
// cliente (Vite) y la Edge Function `avisos` (Deno). Plan de implementación, sección 6.
//
// Simula la fila igual que la base: cuando un barbero queda libre, `llamar_siguiente` le da el
// turno más antiguo que sea suyo o de "el primero libre". Los barberos en pausa no llaman a nadie.

/** Duración que se usa si el servicio ya no está activo. */
export const DURACION_POR_DEFECTO = 30;
/** Se promedian los últimos 20 servicios, y solo si hay al menos 5. */
export const RECIENTES_MAXIMO = 20;
export const RECIENTES_MINIMO = 5;
/** Un servicio terminado fuera de este rango es un error de registro y no cuenta. */
const DURACION_VALIDA = { min: 1, max: 240 };

export interface BarberoEta {
  id: string;
  enPausa: boolean;
  /** Turno que tiene llamado o en la silla, con la hora en que lo llamó o lo sentó. */
  atendiendo?: {
    estado: "llamado" | "en_silla";
    servicioId: string;
    desde: Date | string;
  } | null;
}

export interface ServicioEta {
  id: string;
  duracionMin: number;
}

export interface TurnoEta {
  numero: number;
  /** `null`: "el primero libre". */
  barberoId: string | null;
  servicioId: string;
}

/** Duración real de un servicio terminado. La lista va del más reciente al más viejo. */
export interface ServicioTerminado {
  barberoId: string;
  servicioId: string;
  minutos: number;
}

export interface EntradaEta {
  ahora: Date;
  /** En el orden de las sillas: si dos barberos quedan libres a la vez, gana el primero. */
  barberos: readonly BarberoEta[];
  servicios: readonly ServicioEta[];
  /** Turnos en espera, en orden de llegada. */
  fila: readonly TurnoEta[];
  recientes?: readonly ServicioTerminado[];
}

export type Estimado =
  | { minutos: number; barberoId: string }
  | { minutos: null; motivo: "barbero_no_disponible" | "sin_barberos" };

const MINUTO = 60_000;
const NUEVO = -1;

export function promedio(valores: readonly number[]) {
  return valores.reduce((total, valor) => total + valor, 0) / valores.length;
}

/** Lo que tarda ese barbero en ese servicio: su promedio reciente o la duración configurada. */
export function duracionDe(
  barberoId: string,
  servicioId: string,
  servicios: readonly ServicioEta[],
  recientes: readonly ServicioTerminado[] = [],
) {
  const propios: number[] = [];
  for (const r of recientes) {
    if (r.barberoId !== barberoId || r.servicioId !== servicioId) continue;
    if (!(r.minutos >= DURACION_VALIDA.min && r.minutos <= DURACION_VALIDA.max)) continue;
    propios.push(r.minutos);
    if (propios.length === RECIENTES_MAXIMO) break;
  }
  if (propios.length >= RECIENTES_MINIMO) return promedio(propios);
  return servicios.find((s) => s.id === servicioId)?.duracionMin ?? DURACION_POR_DEFECTO;
}

/** Minutos que le faltan a un barbero para quedar libre. */
function minutosHastaLibre(barbero: BarberoEta, entrada: EntradaEta) {
  const actual = barbero.atendiendo;
  if (!actual) return 0;
  const total = duracionDe(barbero.id, actual.servicioId, entrada.servicios, entrada.recientes);
  // Un cliente llamado todavía no se sienta: el servicio completo está por delante.
  if (actual.estado === "llamado") return total;
  const transcurrido = (entrada.ahora.getTime() - new Date(actual.desde).getTime()) / MINUTO;
  if (!Number.isFinite(transcurrido)) return total;
  return Math.max(0, total - Math.max(0, transcurrido));
}

/** Minutos que faltan para que empiece cada turno de la fila, por número de turno. */
export function simular(entrada: EntradaEta) {
  const resultado = new Map<number, Estimado>();
  const disponibles = entrada.barberos
    .filter((b) => !b.enPausa)
    .map((b) => ({ id: b.id, libre: minutosHastaLibre(b, entrada) }));
  const activos = new Set(disponibles.map((b) => b.id));

  const pendientes: TurnoEta[] = [];
  for (const turno of entrada.fila) {
    if (turno.barberoId !== null && !activos.has(turno.barberoId)) {
      resultado.set(turno.numero, { minutos: null, motivo: "barbero_no_disponible" });
    } else {
      pendientes.push(turno);
    }
  }

  while (pendientes.length > 0) {
    let elegido: { barbero: (typeof disponibles)[number]; indice: number } | null = null;
    for (const barbero of disponibles) {
      const indice = pendientes.findIndex(
        (t) => t.barberoId === null || t.barberoId === barbero.id,
      );
      if (indice === -1) continue;
      if (!elegido || barbero.libre < elegido.barbero.libre) elegido = { barbero, indice };
    }
    if (!elegido) break;

    const [turno] = pendientes.splice(elegido.indice, 1);
    if (!turno) break;
    const { barbero } = elegido;
    resultado.set(turno.numero, { minutos: barbero.libre, barberoId: barbero.id });
    barbero.libre += duracionDe(barbero.id, turno.servicioId, entrada.servicios, entrada.recientes);
  }

  // Lo que queda es "el primero libre" con todos los barberos en pausa.
  for (const turno of pendientes) {
    resultado.set(turno.numero, { minutos: null, motivo: "sin_barberos" });
  }
  return resultado;
}

/** Estimado para alguien que se anota ahora, al final de la fila. */
export function estimarNuevo(
  entrada: EntradaEta,
  turno: { barberoId: string | null; servicioId: string },
): Estimado {
  const fila = [...entrada.fila, { ...turno, numero: NUEVO }];
  return simular({ ...entrada, fila }).get(NUEVO) ?? { minutos: null, motivo: "sin_barberos" };
}

/**
 * Rango que ve el cliente, redondeado a 5 minutos. El margen crece con la espera
 * (mínimo 10 minutos o el 20 %), porque mientras más gente hay adelante, más incierto es.
 */
export function rangoDe(minutos: number): [number, number] {
  const espera = Number.isFinite(minutos) ? Math.max(0, minutos) : 0;
  const desde = Math.floor(espera / 5) * 5;
  const hasta = Math.ceil((espera + Math.max(10, espera * 0.2)) / 5) * 5;
  return [desde, hasta];
}
