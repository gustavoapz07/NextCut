// Edge Function avisos: manda los avisos por Web Push. La lógica vive en ../_shared/avisos.ts y
// el cifrado en ../_shared/webpush.ts, y las dos se prueban con Vitest.
//
// Solo la llama la base (trigger con pg_net y pg_cron), con la clave `avisos_clave` de Vault en el
// encabezado x-avisos-clave; `avisos_pendientes` la valida antes de devolver nada.
//
// Secretos: VAPID_PUBLIC_KEY y VAPID_PRIVATE_KEY (scripts/claves-vapid.mjs) y, opcional,
// VAPID_SUBJECT. La clave secreta de Supabase llega sola en SUPABASE_SECRET_KEYS.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import { manejarAvisos } from "../_shared/avisos.ts";
import { enviarPush } from "../_shared/webpush.ts";

function claveSecreta() {
  try {
    return String(JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}").default ?? "");
  } catch {
    return "";
  }
}

const url = Deno.env.get("SUPABASE_URL") ?? "";
const clave = claveSecreta();
const claves = {
  publica: Deno.env.get("VAPID_PUBLIC_KEY") ?? "",
  privada: Deno.env.get("VAPID_PRIVATE_KEY") ?? "",
};
const sujeto = Deno.env.get("VAPID_SUBJECT") || "https://github.com/gustavoapz07/NextCut";

const admin = createClient(url, clave, {
  auth: { persistSession: false, autoRefreshToken: false },
});

Deno.serve((peticion) =>
  manejarAvisos(peticion, {
    configurado: Boolean(url && clave && claves.publica && claves.privada),
    claves,
    sujeto,
    pendientes: (claveAvisos, barberiaId) =>
      admin.rpc("avisos_pendientes", { p_clave: claveAvisos, p_barberia: barberiaId }),
    filaPublica: (slug) => admin.rpc("fila_publica", { p_slug: slug }),
    reservar: (turnoId, tipo) => admin.rpc("reservar_aviso", { p_turno: turnoId, p_tipo: tipo }),
    liberar: (turnoId, tipo) => admin.rpc("liberar_aviso", { p_turno: turnoId, p_tipo: tipo }),
    borrarSuscripcion: (turnoId) => admin.rpc("borrar_suscripcion", { p_turno: turnoId }),
    enviar: (suscripcion, contenido, tipo) =>
      enviarPush(fetch, suscripcion, contenido, claves, {
        sujeto,
        // Si el teléfono está sin señal, el servicio guarda el aviso solo mientras sirve.
        ttl: tipo === "llamado" ? 10 * 60 : 15 * 60,
        urgencia: "high",
        ahora: new Date(),
      }),
    ahora: () => new Date(),
    registrar: (mensaje, datos) => console.error(mensaje, JSON.stringify(datos ?? {})),
  }),
);
