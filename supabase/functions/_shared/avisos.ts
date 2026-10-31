// Avisos por Web Push (plan de implementación, sección 6, punto 4). Esta es la lógica de la Edge
// Function `avisos`, sin nada propio de Deno, para probarla con Vitest.
//
// La base la llama cuando cambia un turno (trigger con pg_net) y cada minuto (pg_cron), porque el
// estimado baja aunque nadie toque nada. Cada turno recibe como máximo 2 avisos (fallo 6):
// "ya casi" cuando faltan unos 15 minutos y "te toca" cuando el barbero lo llama.

import { z } from "zod";
import { rangoDe, simular } from "./eta.ts";
import { entradaEta, esquemaFilaPublica } from "./filaPublica.ts";
import type { ClavesVapid, ResultadoPush, SuscripcionPush } from "./webpush.ts";

/** Se avisa "ya casi" cuando el estimado llega a esto o menos. */
export const MINUTOS_CASI = 15;

export type TipoAviso = "casi" | "llamado";

/** Lo que devuelve `avisos_pendientes`: turnos activos con suscripción y aviso por mandar. */
export const esquemaPendiente = z.object({
  turno_id: z.string(),
  codigo: z.string(),
  numero: z.number(),
  estado: z.enum(["esperando", "llamado"]),
  barberia: z.object({
    id: z.string(),
    slug: z.string(),
    nombre: z.string(),
    tolerancia_min: z.number(),
  }),
  barbero: z.string().nullable(),
  silla: z.number().nullable(),
  endpoint: z.string(),
  p256dh: z.string(),
  auth: z.string(),
  aviso_casi: z.boolean(),
  aviso_llamado: z.boolean(),
});
export type Pendiente = z.infer<typeof esquemaPendiente>;

/** El aviso que toca mandar ahora, o ninguno. `minutos` es el estimado del turno en espera. */
export function decidirAviso(pendiente: Pendiente, minutos: number | null): TipoAviso | null {
  if (pendiente.aviso_llamado) return null;
  if (pendiente.estado === "llamado") return "llamado";
  if (pendiente.aviso_casi || minutos === null) return null;
  return minutos <= MINUTOS_CASI ? "casi" : null;
}

/** Lo que lee el service worker para mostrar la notificación. */
export interface Aviso {
  tipo: TipoAviso;
  titulo: string;
  cuerpo: string;
  /** Página que abre al tocar la notificación. */
  url: string;
  /** Una notificación por turno: la de "te toca" reemplaza a la de "ya casi". */
  etiqueta: string;
}

export function crearAviso(tipo: TipoAviso, pendiente: Pendiente, minutos: number | null): Aviso {
  const base = {
    tipo,
    url: `/t/${pendiente.codigo}`,
    etiqueta: `turno-${pendiente.codigo}`,
  };
  if (tipo === "llamado") {
    const donde = pendiente.silla ? ` en la silla ${pendiente.silla}` : "";
    const quien = pendiente.barbero ?? "Tu barbero";
    return {
      ...base,
      titulo: `¡Te toca! · Turno #${pendiente.numero}`,
      cuerpo: `${quien} te espera${donde}. Tienes ${pendiente.barberia.tolerancia_min} min para llegar.`,
    };
  }
  const [desde, hasta] = rangoDe(minutos ?? 0);
  const con = pendiente.barbero ? ` con ${pendiente.barbero}` : "";
  return {
    ...base,
    titulo: `Ya casi te toca · Turno #${pendiente.numero}`,
    cuerpo: `Te toca en ≈ ${desde}–${hasta} min${con}. Ve acercándote a ${pendiente.barberia.nombre}.`,
  };
}

type RespuestaRpc = { data: unknown; error: { message: string } | null };

export interface DependenciasAvisos {
  /** Faltan la clave de Supabase o las de VAPID: se rechaza todo. */
  configurado: boolean;
  claves: ClavesVapid;
  /** Contacto que va en el JWT de VAPID (una URL o un mailto:). */
  sujeto: string;
  /** Valida la clave que manda la base y lee lo pendiente. */
  pendientes(clave: string, barberiaId: string | null): PromiseLike<RespuestaRpc>;
  filaPublica(slug: string): PromiseLike<RespuestaRpc>;
  /** Marca el aviso como enviado antes de mandarlo; `false` si otra corrida ya lo tomó. */
  reservar(turnoId: string, tipo: TipoAviso): PromiseLike<RespuestaRpc>;
  /** Deshace la reserva tras una falla pasajera, para reintentar en el siguiente minuto. */
  liberar(turnoId: string, tipo: TipoAviso): PromiseLike<RespuestaRpc>;
  /** Borra la suscripción de un navegador que ya no existe. */
  borrarSuscripcion(turnoId: string): PromiseLike<RespuestaRpc>;
  enviar(suscripcion: SuscripcionPush, contenido: string, tipo: TipoAviso): Promise<ResultadoPush>;
  ahora(): Date;
  registrar(mensaje: string, datos?: Record<string, unknown>): void;
}

const esquemaCuerpo = z.object({ barberia_id: z.uuid().optional() }).strict();

export interface Resumen {
  revisados: number;
  enviados: number;
  vencidos: number;
  fallidos: number;
}

/** Minutos estimados de cada turno en espera, por barbería. */
async function estimados(slugs: Iterable<string>, deps: DependenciasAvisos) {
  const porBarberia = new Map<string, Map<number, number | null>>();
  for (const slug of slugs) {
    const fila = await deps.filaPublica(slug);
    const leida = esquemaFilaPublica.safeParse(fila.data);
    if (fila.error || !leida.success) {
      deps.registrar("no se pudo leer la fila", { slug });
      continue;
    }
    const minutos = new Map<number, number | null>();
    for (const [numero, estimado] of simular(entradaEta(leida.data, deps.ahora()))) {
      minutos.set(numero, estimado.minutos);
    }
    porBarberia.set(slug, minutos);
  }
  return porBarberia;
}

export async function manejarAvisos(
  peticion: Request,
  deps: DependenciasAvisos,
): Promise<Response> {
  const responder = (estado: number, cuerpo: unknown) =>
    new Response(JSON.stringify(cuerpo), {
      status: estado,
      headers: { "Content-Type": "application/json" },
    });

  // Solo la base la llama, nunca un navegador: no hay CORS.
  if (peticion.method !== "POST") return responder(405, { error: "metodo" });
  const clave = peticion.headers.get("x-avisos-clave") ?? "";
  if (!/^[0-9a-f]{64}$/.test(clave)) return responder(401, { error: "sin_permiso" });
  if (!deps.configurado) return responder(500, { error: "error" });

  let cuerpo: unknown = {};
  try {
    const crudo = await peticion.text();
    if (crudo.trim()) cuerpo = JSON.parse(crudo);
  } catch {
    return responder(400, { error: "datos_invalidos" });
  }
  const leido = esquemaCuerpo.safeParse(cuerpo);
  if (!leido.success) return responder(400, { error: "datos_invalidos" });

  try {
    const respuesta = await deps.pendientes(clave, leido.data.barberia_id ?? null);
    if (respuesta.error) {
      return respuesta.error.message.includes("sin_permiso")
        ? responder(401, { error: "sin_permiso" })
        : responder(500, { error: "error" });
    }
    const lista = z.array(esquemaPendiente).safeParse(respuesta.data);
    if (!lista.success) return responder(500, { error: "error" });
    const pendientes = lista.data;

    // El estimado solo hace falta para quien espera y no ha recibido "ya casi".
    const slugs = new Set(
      pendientes.filter((p) => p.estado === "esperando").map((p) => p.barberia.slug),
    );
    const minutosPorBarberia = await estimados(slugs, deps);

    const resumen: Resumen = {
      revisados: pendientes.length,
      enviados: 0,
      vencidos: 0,
      fallidos: 0,
    };
    for (const pendiente of pendientes) {
      const minutos =
        pendiente.estado === "esperando"
          ? (minutosPorBarberia.get(pendiente.barberia.slug)?.get(pendiente.numero) ?? null)
          : null;
      const tipo = decidirAviso(pendiente, minutos);
      if (!tipo) continue;

      // Se reserva antes de mandar: el trigger y el reloj pueden correr a la vez.
      const reserva = await deps.reservar(pendiente.turno_id, tipo);
      if (reserva.error || reserva.data !== true) continue;

      const aviso = crearAviso(tipo, pendiente, minutos);
      const resultado = await deps.enviar(
        { endpoint: pendiente.endpoint, p256dh: pendiente.p256dh, auth: pendiente.auth },
        JSON.stringify(aviso),
        tipo,
      );
      // Nunca se registra el endpoint ni datos del cliente: solo el servicio y el resultado.
      const servicio = new URL(pendiente.endpoint).hostname;
      if (resultado.tipo === "enviado") {
        resumen.enviados++;
      } else if (resultado.tipo === "vencida") {
        resumen.vencidos++;
        deps.registrar("suscripción vencida", { servicio, tipo, estado: resultado.estado });
        await deps.borrarSuscripcion(pendiente.turno_id);
      } else {
        resumen.fallidos++;
        deps.registrar("aviso no enviado", {
          servicio,
          tipo,
          resultado: resultado.tipo,
          estado: resultado.estado,
        });
        if (resultado.tipo === "reintentar") await deps.liberar(pendiente.turno_id, tipo);
      }
    }
    return responder(200, resumen);
  } catch (error) {
    deps.registrar("error al revisar avisos", {
      error: error instanceof Error ? error.name : "desconocido",
    });
    // Nunca se devuelve el detalle de un error interno (fallo 8).
    return responder(500, { error: "error" });
  }
}
