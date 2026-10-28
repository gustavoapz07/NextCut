// Respuesta de `fila_publica(slug)` y su conversión a la entrada del estimado. Lo usan la página
// pública (Vite) y la Edge Function `unirse-a-fila` (Deno), que guarda el estimado del turno.

import { z } from "zod";
import type { EntradaEta } from "./eta.ts";

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

/** Convierte la respuesta de la base en la entrada del estimado (`eta.ts`). */
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
