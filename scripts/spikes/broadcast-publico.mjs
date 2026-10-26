// Prueba de riesgo 1 del Sprint 0 (docs/plan-implementacion.md, sección 9).
// ¿Una señal enviada desde Postgres con realtime.send(..., private => false) llega a un cliente
// anónimo que solo tiene la clave publicable? ¿Y ese cliente queda fuera de un canal privado?
//
// Uso: node --env-file=.env.local scripts/spikes/broadcast-publico.mjs
// Cuando imprima "LISTO", ejecutar en el proyecto de pruebas:
//   select realtime.send(jsonb_build_object('version', 1), 'cambio', 'fila:prueba-riesgo', false);
import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL;
const clave = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url || !clave) {
  console.error("Faltan VITE_SUPABASE_URL o VITE_SUPABASE_PUBLISHABLE_KEY en .env.local");
  process.exit(2);
}

const ESPERA_MS = 120_000;
const supabase = createClient(url, clave);
const resultado = { publico: "esperando", privado: "esperando" };

function terminar(codigo) {
  console.log(JSON.stringify(resultado));
  supabase.removeAllChannels().finally(() => process.exit(codigo));
}

// 1. Canal privado: un anónimo sin políticas en realtime.messages no debería poder entrar.
supabase
  .channel("fila:privado-prueba", { config: { private: true } })
  .subscribe((estado, error) => {
    if (estado === "SUBSCRIBED") resultado.privado = "ENTRÓ (mal: debería rechazarlo)";
    if (estado === "CHANNEL_ERROR" || estado === "TIMED_OUT") {
      resultado.privado = `rechazado (${estado}${error ? `: ${error.message}` : ""})`;
    }
  });

// 2. Canal público: debe recibir la señal vacía que manda la base.
supabase
  .channel("fila:prueba-riesgo", { config: { private: false } })
  .on("broadcast", { event: "cambio" }, (mensaje) => {
    resultado.publico = `recibido: ${JSON.stringify(mensaje.payload)}`;
    terminar(0);
  })
  .subscribe((estado, error) => {
    if (estado === "SUBSCRIBED") console.log("LISTO: suscrito al canal público");
    if (estado === "CHANNEL_ERROR" || estado === "TIMED_OUT") {
      resultado.publico = `error al suscribirse (${estado}${error ? `: ${error.message}` : ""})`;
      terminar(1);
    }
  });

setTimeout(() => {
  resultado.publico = `sin mensaje después de ${ESPERA_MS / 1000} s`;
  terminar(1);
}, ESPERA_MS);
