// Edge Function cuentas (ADR-017). La lógica vive en ../_shared/cuentas.ts y se prueba con Vitest;
// aquí solo se conectan los secretos, Auth y la base.
//
// No usa verify_jwt: revisa la sesión con Auth (getUser), que también rechaza tokens de cuentas
// que ya salieron. Secretos: ORIGENES_PERMITIDOS (el mismo de unirse-a-fila). La clave secreta de
// Supabase llega sola en SUPABASE_SECRET_KEYS.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import { claveTemporal, manejarCuentas } from "../_shared/cuentas.ts";

function claveSecreta() {
  try {
    return String(JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}").default ?? "");
  } catch {
    return "";
  }
}

const url = Deno.env.get("SUPABASE_URL") ?? "";
const clave = claveSecreta();
const origenes = (Deno.env.get("ORIGENES_PERMITIDOS") ?? "http://localhost:5173")
  .split(",")
  .map((origen) => origen.trim())
  .filter(Boolean);

const admin = createClient(url, clave, {
  auth: { persistSession: false, autoRefreshToken: false },
});

Deno.serve((peticion) =>
  manejarCuentas(peticion, {
    configurado: Boolean(url && clave),
    origenes,
    usuarioDelToken: async (token) => {
      const { data, error } = await admin.auth.getUser(token);
      return error ? null : (data.user?.id ?? null);
    },
    crearCuenta: async (correo, claveNueva) => {
      const { data, error } = await admin.auth.admin.createUser({
        email: correo,
        password: claveNueva,
        email_confirm: true,
        user_metadata: { cambiar_clave: true },
      });
      return { data: data.user ? { id: data.user.id } : null, error };
    },
    cambiarClave: async (cuenta, claveNueva) => {
      const { error } = await admin.auth.admin.updateUserById(cuenta, {
        password: claveNueva,
        user_metadata: { cambiar_clave: true },
      });
      return { error };
    },
    borrarCuenta: (cuenta) => admin.auth.admin.deleteUser(cuenta),
    rpc: (funcion, argumentos) => admin.rpc(funcion, argumentos),
    claveTemporal: () => claveTemporal(),
  }),
);
