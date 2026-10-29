// Sesión del personal (barberos y dueños): correo y contraseña con Supabase Auth.

import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export type EstadoSesion =
  | { tipo: "cargando" }
  | { tipo: "fuera" }
  | { tipo: "dentro"; sesion: Session };

/** La sesión actual, al día cuando alguien entra, sale o se renueva el token. */
export function useSesion(): EstadoSesion {
  const [estado, setEstado] = useState<EstadoSesion>({ tipo: "cargando" });

  useEffect(() => {
    let vivo = true;
    const aplicar = (sesion: Session | null) => {
      if (vivo) setEstado(sesion ? { tipo: "dentro", sesion } : { tipo: "fuera" });
    };
    void supabase.auth.getSession().then(({ data }) => aplicar(data.session));
    const { data } = supabase.auth.onAuthStateChange((_evento, sesion) => aplicar(sesion));
    return () => {
      vivo = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return estado;
}

export type ResultadoEntrar = "ok" | "credenciales" | "demasiados_intentos" | "error";

export const MENSAJES_ENTRAR: Record<Exclude<ResultadoEntrar, "ok">, string> = {
  credenciales: "El correo o la contraseña no coinciden.",
  demasiados_intentos: "Demasiados intentos. Espera unos minutos y vuelve a probar.",
  error: "No pudimos entrar. Revisa tu conexión e inténtalo de nuevo.",
};

export async function entrar(correo: string, clave: string): Promise<ResultadoEntrar> {
  const { error } = await supabase.auth.signInWithPassword({
    email: correo.trim(),
    password: clave,
  });
  if (!error) return "ok";
  if (error.status === 429) return "demasiados_intentos";
  // Supabase no dice si el correo existe (así nadie puede averiguar quién trabaja dónde).
  if (error.status === 400) return "credenciales";
  return "error";
}

export async function salir() {
  await supabase.auth.signOut();
}
