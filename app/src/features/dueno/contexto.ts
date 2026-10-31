// Lo que comparten las pantallas del dueño: si son el prototipo o la barbería real, dónde viven
// y qué barbería muestran. Lo pone LayoutDueno.

import { createContext, useContext } from "react";

export interface ContextoDueno {
  modo: "real" | "prototipo";
  /** "/dueno" o "/demo/dueno". */
  base: string;
  barberia: {
    /** `null` en el prototipo. */
    id: string | null;
    nombre: string;
    slug: string;
    detalle: string | null;
  };
}

export const Contexto = createContext<ContextoDueno | null>(null);

export function useContextoDueno() {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("Las pantallas del dueño van dentro de LayoutDueno");
  return contexto;
}
