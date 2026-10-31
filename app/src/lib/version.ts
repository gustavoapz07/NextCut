// La app se actualiza sola cuando se publica una versión nueva: al volver a la pestaña y cada 15
// minutos (la TV pasa el día encendida), compara el paquete que dice el index.html publicado con
// el que está corriendo y recarga. Sin esto, un teléfono con la pestaña abierta se queda con la
// versión vieja hasta que alguien recargue a mano.

import { useEffect, useRef } from "react";

const CADA_MS = 15 * 60_000;

/** "/assets/index-AbC123.js": el paquete principal que carga un index.html de Vite. */
export function paqueteDe(html: string) {
  return html.match(/\/assets\/index-[\w-]+\.js/)?.[0] ?? null;
}

/** El paquete con el que arrancó esta página; `null` en desarrollo (Vite sirve /src/main.tsx). */
export function paqueteActual() {
  const script = document.querySelector<HTMLScriptElement>(
    'script[type="module"][src*="/assets/index-"]',
  );
  return script ? new URL(script.src).pathname : null;
}

/** No se recarga a media escritura ni en el formulario para anotarse. */
export function puedeRecargar(ruta: string, activo: Element | null) {
  if (/\/unirse$/.test(ruta)) return false;
  return !(activo instanceof HTMLInputElement || activo instanceof HTMLTextAreaElement);
}

export function useVersionNueva(ruta: string) {
  const rutaActual = useRef(ruta);
  useEffect(() => {
    rutaActual.current = ruta;
  });

  useEffect(() => {
    const actual = paqueteActual();
    if (!actual) return;
    let revisando = false;

    const revisar = async () => {
      if (revisando || document.visibilityState !== "visible") return;
      revisando = true;
      try {
        const respuesta = await fetch("/", { cache: "no-store" });
        const publicado = respuesta.ok ? paqueteDe(await respuesta.text()) : null;
        if (
          publicado &&
          publicado !== actual &&
          puedeRecargar(rutaActual.current, document.activeElement)
        ) {
          window.location.reload();
        }
      } catch {
        // Sin conexión: se vuelve a revisar más tarde.
      } finally {
        revisando = false;
      }
    };

    const alVolver = () => {
      if (document.visibilityState === "visible") void revisar();
    };
    document.addEventListener("visibilitychange", alVolver);
    const intervalo = window.setInterval(() => void revisar(), CADA_MS);
    return () => {
      document.removeEventListener("visibilitychange", alVolver);
      window.clearInterval(intervalo);
    };
  }, []);
}
