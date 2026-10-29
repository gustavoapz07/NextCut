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

/**
 * Mantiene la pantalla encendida (Wake Lock) mientras la página está visible. El navegador lo
 * suelta al ocultarla, así que se vuelve a pedir al volver. Sin soporte, no hace nada.
 */
export function usePantallaEncendida() {
  useEffect(() => {
    if (!("wakeLock" in navigator)) return;
    let vivo = true;
    let bloqueo: WakeLockSentinel | null = null;

    const pedir = async () => {
      if (document.visibilityState !== "visible" || bloqueo) return;
      try {
        const nuevo = await navigator.wakeLock.request("screen");
        if (!vivo) {
          void nuevo.release();
          return;
        }
        bloqueo = nuevo;
        nuevo.addEventListener("release", () => {
          bloqueo = null;
        });
      } catch {
        // El navegador lo negó (batería baja o ahorro de energía): la pantalla se apaga sola.
      }
    };

    void pedir();
    document.addEventListener("visibilitychange", pedir);
    return () => {
      vivo = false;
      document.removeEventListener("visibilitychange", pedir);
      void bloqueo?.release();
    };
  }, []);
}
