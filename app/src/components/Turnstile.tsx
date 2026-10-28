import { useEffect, useRef, useState } from "react";

const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
/** Clave pública de prueba de Cloudflare (siempre pasa). Solo se usa en desarrollo. */
const CLAVE_DE_PRUEBA = "1x00000000000000000000AA";
const CLAVE_SITIO =
  import.meta.env.VITE_TURNSTILE_SITE_KEY || (import.meta.env.DEV ? CLAVE_DE_PRUEBA : "");

interface ApiTurnstile {
  render(caja: HTMLElement, opciones: Record<string, unknown>): string;
  remove(id: string): void;
}

declare global {
  interface Window {
    turnstile?: ApiTurnstile;
  }
}

let carga: Promise<ApiTurnstile> | null = null;

function cargarTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  carga ??= new Promise<ApiTurnstile>((resolver, rechazar) => {
    const script = document.createElement("script");
    script.src = SCRIPT;
    script.async = true;
    script.onload = () =>
      window.turnstile ? resolver(window.turnstile) : rechazar(new Error("turnstile"));
    script.onerror = () => {
      carga = null;
      rechazar(new Error("turnstile"));
    };
    document.head.append(script);
  });
  return carga;
}

/** Verificación de Cloudflare. Avisa con el token, o con `null` cuando vence o falla. */
export function Turnstile({ onToken }: { onToken: (token: string | null) => void }) {
  const caja = useRef<HTMLDivElement>(null);
  const avisar = useRef(onToken);
  const [fallo, setFallo] = useState(!CLAVE_SITIO);
  useEffect(() => {
    avisar.current = onToken;
  });

  useEffect(() => {
    if (!CLAVE_SITIO) return;
    let vivo = true;
    let id: string | undefined;
    cargarTurnstile()
      .then((api) => {
        if (!vivo || !caja.current) return;
        id = api.render(caja.current, {
          sitekey: CLAVE_SITIO,
          action: "unirse",
          language: "es",
          theme: "auto",
          size: "flexible",
          callback: (token: string) => avisar.current(token),
          "expired-callback": () => avisar.current(null),
          "error-callback": () => avisar.current(null),
        });
      })
      .catch(() => {
        if (vivo) setFallo(true);
      });
    return () => {
      vivo = false;
      if (id) window.turnstile?.remove(id);
    };
  }, []);

  return (
    <div>
      <div ref={caja} className="min-h-[65px]" />
      {fallo && (
        <p role="alert" className="mt-2 text-sm text-rojo">
          No pudimos cargar la verificación. Revisa tu conexión y recarga la página.
        </p>
      )}
    </div>
  );
}
