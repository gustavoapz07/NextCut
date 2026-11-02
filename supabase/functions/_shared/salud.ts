// Edge Function salud (fallo 10): la consulta UptimeRobot cada 5 minutos. Responde 200 si la base
// contesta y el reloj de pg_cron corrió hace poco, y 503 si no, para que salte la alerta. No
// devuelve datos de ninguna barbería ni detalles del error. TypeScript puro: lo usan Vitest y Deno.

import { z } from "zod";

export interface DependenciasSalud {
  /** `estado_salud()` de la base, con la clave secreta. */
  estadoBase(): PromiseLike<{ data: unknown; error: unknown }>;
  ahora(): Date;
  /** Cuánto se espera a la base antes de darla por caída. */
  esperaMs?: number;
}

const esquemaEstado = z.object({ base: z.literal(true), tareas: z.boolean() });

type Resultado = "ok" | "falla" | "atrasadas";

async function consultarBase(deps: DependenciasSalud) {
  let temporizador: ReturnType<typeof setTimeout> | undefined;
  const limite = new Promise<"tiempo">((resolver) => {
    temporizador = setTimeout(() => resolver("tiempo"), deps.esperaMs ?? 5000);
  });
  try {
    const respuesta = await Promise.race([deps.estadoBase(), limite]);
    if (respuesta === "tiempo" || respuesta.error) return null;
    const estado = esquemaEstado.safeParse(respuesta.data);
    return estado.success ? estado.data : null;
  } catch {
    return null;
  } finally {
    clearTimeout(temporizador);
  }
}

export async function manejarSalud(peticion: Request, deps: DependenciasSalud) {
  if (peticion.method !== "GET" && peticion.method !== "HEAD") {
    return new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } });
  }

  const estado = await consultarBase(deps);
  const base: Resultado = estado ? "ok" : "falla";
  const tareas: Resultado = estado ? (estado.tareas ? "ok" : "atrasadas") : "falla";
  const sano = base === "ok" && tareas === "ok";

  const cuerpo = JSON.stringify({
    estado: sano ? "ok" : "falla",
    base,
    tareas,
    hora: deps.ahora().toISOString(),
  });
  return new Response(peticion.method === "HEAD" ? null : cuerpo, {
    status: sano ? 200 : 503,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
