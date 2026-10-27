import { motion } from "motion/react";
import { cx, vars } from "@/lib/utilidades";

interface FranjasProps {
  className?: string;
  /** Mueve las franjas hacia arriba, como un poste girando. */
  vertical?: boolean;
  /** Segundos por ciclo: menos es más rápido. */
  velocidad?: number;
  /** Ancho de cada franja en píxeles. */
  ancho?: number;
  quieto?: boolean;
  /** Color de las franjas blancas (por defecto, hueso). */
  blanco?: string;
}

/** Franjas rojo, blanco y azul del poste de barbería, en movimiento continuo. */
export function Franjas({
  className,
  vertical = false,
  velocidad = 1.6,
  ancho = 10,
  quieto = false,
  blanco,
}: FranjasProps) {
  return (
    <div
      aria-hidden="true"
      className={cx(
        "franjas",
        !quieto && (vertical ? "animate-poste-y" : "animate-poste"),
        className,
      )}
      style={vars({
        "--poste-vel": `${velocidad}s`,
        "--franja": `${ancho}px`,
        ...(blanco ? { "--franja-blanco": blanco } : {}),
      })}
    />
  );
}

/** Poste de barbería completo, con tapas. Las tapas toman el color del texto. */
export function Poste({
  className,
  velocidad = 2.2,
  ancho = 10,
}: {
  className?: string;
  velocidad?: number;
  ancho?: number;
}) {
  return (
    <div aria-hidden="true" className={cx("flex flex-col items-center", className)}>
      <div className="h-[7%] min-h-2 w-[72%] rounded-t-full bg-current" />
      <div className="h-[2%] min-h-1 w-[96%] rounded-full bg-current" />
      <div className="relative w-[86%] flex-1 overflow-hidden rounded-full border-2 border-current">
        <Franjas vertical velocidad={velocidad} ancho={ancho} className="absolute inset-0" />
        <div className="absolute inset-y-[6%] left-[16%] w-[14%] rounded-full bg-white/50 blur-[1.5px]" />
      </div>
      <div className="h-[2%] min-h-1 w-[96%] rounded-full bg-current" />
      <div className="h-[5%] min-h-2 w-[60%] rounded-b-xl bg-current" />
    </div>
  );
}

/** Barra de progreso rellena con las franjas del poste. */
export function BarraPoste({
  valor,
  velocidad = 1.4,
  className,
  pista = "bg-superficie-2",
  desdeCero = false,
}: {
  valor: number;
  velocidad?: number;
  className?: string;
  pista?: string;
  desdeCero?: boolean;
}) {
  const porcentaje = Math.min(1, Math.max(0, valor)) * 100;
  return (
    <div
      aria-hidden="true"
      className={cx("relative h-3 overflow-hidden rounded-full", pista, className)}
    >
      <motion.div
        className="absolute inset-y-0 left-0 overflow-hidden rounded-full"
        initial={desdeCero ? { width: "0%" } : false}
        animate={{ width: `${porcentaje}%` }}
        transition={{ type: "spring", stiffness: 70, damping: 18 }}
      >
        <Franjas velocidad={velocidad} ancho={6} className="absolute inset-0" />
      </motion.div>
    </div>
  );
}
