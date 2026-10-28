// Anotarse desde el navegador: llama a la Edge Function `unirse-a-fila` y guarda el secreto para
// cancelar. El formulario nunca llama a la base directo (ADR-007).

import { CODIGOS_DE_ERROR, type CodigoError, type DatosUnirse } from "@shared/unirse";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export type ErrorUnirse = CodigoError | "sin_conexion";
export type ResultadoUnirse =
  | { ok: true; codigo: string; numero: number }
  | { ok: false; error: ErrorUnirse };

export const MENSAJES: Record<ErrorUnirse, string> = {
  datos_invalidos: "Revisa tu nombre y tu número e inténtalo de nuevo.",
  verificacion: "No pudimos comprobar que no eres un robot. Inténtalo otra vez.",
  no_existe: "Esta barbería ya no recibe turnos por aquí.",
  fila_llena: "La fila se llenó. Inténtalo en un rato o anótate en el local.",
  fila_remota_pausada: "La barbería pausó la fila en línea. Puedes anotarte en el local.",
  telefono_con_turno: "Ese número ya tiene un turno activo en esta barbería.",
  limite_ip: "Se pidieron muchos turnos desde esta conexión. Espera unos minutos.",
  error: "Algo salió mal de nuestro lado. Inténtalo de nuevo.",
  sin_conexion: "No hay conexión. Revisa tu internet e inténtalo de nuevo.",
};

const esCodigo = (valor: unknown): valor is CodigoError =>
  CODIGOS_DE_ERROR.includes(valor as CodigoError);

export async function anotarse(datos: DatosUnirse): Promise<ResultadoUnirse> {
  const { data, error } = await supabase.functions.invoke("unirse-a-fila", { body: datos });
  if (!error) {
    if (typeof data?.codigo === "string" && typeof data?.numero === "number") {
      return { ok: true, codigo: data.codigo, numero: data.numero };
    }
    return { ok: false, error: "error" };
  }
  if (error instanceof FunctionsHttpError) {
    try {
      const cuerpo: unknown = await error.context.json();
      const codigo = (cuerpo as { error?: unknown } | null)?.error;
      if (esCodigo(codigo)) return { ok: false, error: codigo };
    } catch {
      // Una respuesta que no es JSON cuenta como error genérico.
    }
    return { ok: false, error: "error" };
  }
  return { ok: false, error: "sin_conexion" };
}

/** 32 bytes al azar en hexadecimal: el secreto para cancelar el turno. */
export function nuevoSecreto() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

const claveDe = (codigo: string) => `nextcut:secreto:${codigo}`;

/** El secreto se queda en este teléfono; sin él no se puede cancelar el turno. */
export function guardarSecreto(codigo: string, secreto: string) {
  try {
    localStorage.setItem(claveDe(codigo), secreto);
  } catch {
    // Modo privado o almacenamiento bloqueado: el turno existe igual, solo no se podrá cancelar.
  }
}

export function leerSecreto(codigo: string) {
  try {
    return localStorage.getItem(claveDe(codigo));
  } catch {
    return null;
  }
}
