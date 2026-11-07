import { useId } from "react";
import { cx } from "@/lib/utilidades";

// El boleto del turno, el mismo del cliente: muescas a los lados, línea punteada y la "N"
// recortada. La N es un trazo (no texto) para verse igual aunque la fuente no haya cargado.
// Lo usa también app/public/favicon.svg; si cambia uno, cambia el otro.
export const BOLETO =
  "M6 2h40a4 4 0 0 1 4 4v9a5 5 0 0 0 0 10v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-9a5 5 0 0 0 0-10V6a4 4 0 0 1 4-4z";
export const LETRA_N = "M11 31V9h5.2l5.6 12.4V9H27v22h-5.1L16.2 18.4V31z";

/** El boleto solo. El papel toma el color del texto; la N y la línea dejan ver el fondo. */
export function Boleto({ className }: { className?: string }) {
  const mascara = useId();
  return (
    <svg viewBox="0 0 52 40" aria-hidden="true" className={cx("shrink-0", className)}>
      <mask id={mascara}>
        <path d={BOLETO} fill="#fff" />
        <path d={LETRA_N} fill="#000" />
        <path d="M36 6v28" stroke="#000" strokeWidth="1.75" strokeDasharray="3 3" />
      </mask>
      <path d={BOLETO} fill="currentColor" mask={`url(#${mascara})`} />
      <circle cx="43" cy="20" r="3" className="fill-poste-rojo" />
    </svg>
  );
}

/** Logotipo: el boleto del turno y "Next" de rótulo con "Cut" ligera. Toma el color del texto. */
export function Marca({ className }: { className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-[0.3em] font-display text-2xl leading-none font-extrabold tracking-tight uppercase",
        className,
      )}
    >
      <Boleto className="h-[1.05em] w-auto" />
      <span>
        Next
        <span className="font-light">Cut</span>
      </span>
    </span>
  );
}
