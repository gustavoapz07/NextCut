// Ganchos genéricos que usan tanto las pantallas reales como las del prototipo.

import { useEffect, useRef, useState } from "react";

/** setInterval que siempre llama a la versión más reciente de `accion`. `null` lo detiene. */
export function useIntervalo(accion: () => void, ms: number | null) {
  const ultima = useRef(accion);
  useEffect(() => {
    ultima.current = accion;
  });
  useEffect(() => {
    if (ms === null) return;
    const id = window.setInterval(() => ultima.current(), ms);
    return () => window.clearInterval(id);
  }, [ms]);
}

export function useTitulo(titulo: string) {
  useEffect(() => {
    document.title = `${titulo} · NextCut`;
  }, [titulo]);
}

export function useReloj(cada = 1000) {
  const [ahora, setAhora] = useState(() => new Date());
  useIntervalo(() => setAhora(new Date()), cada);
  return ahora;
}
