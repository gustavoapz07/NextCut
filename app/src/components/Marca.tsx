import { cx } from "@/lib/utilidades";
import { Franjas } from "./Franjas";

/** Logotipo: un poste mínimo y "Next" de rótulo con "Cut" en cursiva. Toma el color del texto. */
export function Marca({ className }: { className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-[0.3em] font-display text-2xl leading-none font-extrabold tracking-tight uppercase",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="relative h-[1.05em] w-[0.42em] overflow-hidden rounded-full border-[1.5px] border-current"
      >
        <Franjas vertical velocidad={2.4} ancho={3} className="absolute inset-0" />
      </span>
      <span>
        Next
        <span className="font-light">Cut</span>
      </span>
    </span>
  );
}
