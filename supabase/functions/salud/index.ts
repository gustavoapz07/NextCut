// Edge Function salud (fallo 10). La lógica vive en ../_shared/salud.ts y se prueba con Vitest;
// aquí solo se conecta la base. No pide sesión: la consulta UptimeRobot. La clave secreta de
// Supabase llega sola en SUPABASE_SECRET_KEYS.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import { manejarSalud } from "../_shared/salud.ts";

function claveSecreta() {
  try {
    return String(JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}").default ?? "");
  } catch {
    return "";
  }
}

const admin = createClient(Deno.env.get("SUPABASE_URL") ?? "", claveSecreta(), {
  auth: { persistSession: false, autoRefreshToken: false },
});

Deno.serve((peticion) =>
  manejarSalud(peticion, {
    estadoBase: () => admin.rpc("estado_salud"),
    ahora: () => new Date(),
  }),
);
