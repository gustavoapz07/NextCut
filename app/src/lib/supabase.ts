import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const url = import.meta.env.VITE_SUPABASE_URL;
const clavePublicable = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !clavePublicable) {
  throw new Error(
    "Faltan VITE_SUPABASE_URL o VITE_SUPABASE_PUBLISHABLE_KEY: copia .env.example como .env.local y llénalo.",
  );
}

// Solo la clave publicable (sb_publishable_…) va al navegador; lo que puede leer lo decide RLS.
export const supabase = createClient<Database>(url, clavePublicable);
