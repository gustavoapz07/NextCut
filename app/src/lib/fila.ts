// Lo que devuelve `fila_publica(slug)` y cómo se convierte en estimados para la página pública.

import { type EntradaEta, type Estimado, estimarNuevo } from "@shared/eta";
import { z } from "zod";

const esquemaBarbero = z.object({
  id: z.string(),
  nombre: z.string(),
  apodo: z.string().nullable(),
  silla: z.number().nullable(),
  en_pausa: z.boolean(),
  atendiendo: z
    .object({
      numero: z.number(),
      estado: z.enum(["llamado", "en_silla"]),
      servicio_id: z.string(),
      desde: z.string().nullable(),
    })
    .nullable(),
});

export const esquemaFilaPublica = z.object({
  barberia: z.object({
    id: z.string(),
    nombre: z.string(),
    slug: z.string(),
    zona: z.string().nullable(),
    fila_remota_activa: z.boolean(),
    max_fila: z.number(),
    tolerancia_min: z.number(),
  }),
  barberos: z.array(esquemaBarbero),
  servicios: z.array(
    z.object({
      id: z.string(),
      nombre: z.string(),
      duracion_min: z.number(),
      precio_ref: z.number(),
    }),
  ),
  fila: z.array(
    z.object({
      numero: z.number(),
      // `null` cuando el dueño ocultó el nombre.
      nombre: z.string().nullable(),
      barbero_id: z.string().nullable(),
      servicio_id: z.string(),
      creado_en: z.string(),
    }),
  ),
});

export type FilaPublica = z.infer<typeof esquemaFilaPublica>;
export type BarberoPublico = z.infer<typeof esquemaBarbero>;

/** Convierte la respuesta de la base en la entrada del estimado (`supabase/functions/_shared/eta.ts`). */
export function entradaEta(datos: FilaPublica, ahora: Date): EntradaEta {
  return {
    ahora,
    barberos: datos.barberos.map((b) => ({
      id: b.id,
      enPausa: b.en_pausa,
      atendiendo: b.atendiendo && {
        estado: b.atendiendo.estado,
        servicioId: b.atendiendo.servicio_id,
        desde: b.atendiendo.desde ?? ahora,
      },
    })),
    servicios: datos.servicios.map((s) => ({ id: s.id, duracionMin: s.duracion_min })),
    fila: datos.fila.map((t) => ({
      numero: t.numero,
      barberoId: t.barbero_id,
      servicioId: t.servicio_id,
    })),
  };
}

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
