// Piezas pequeñas de la identidad que se repiten en varias pantallas.

import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { cx, vars } from "@/lib/utilidades";
import type { Tono } from "@/prototipo/datos";
import { Franjas } from "./Franjas";

/**
 * Cinta de texto que corre sin fin. Decorativa: el contenido importante va en otro lado.
 * Los bordes se desvanecen para que ninguna letra se vea cortada de golpe.
 */
export function Marquesina({
  items,
  className,
  velocidad = 30,
  separador = "/",
}: {
  items: string[];
  className?: string;
  velocidad?: number;
  separador?: string;
}) {
  const linea = (
    <div className="flex shrink-0 items-center">
      {[...items, ...items].map((item, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: copia decorativa y estática del mismo texto
        <span key={i} className="flex items-center">
          <span className="px-[0.5em]">{item}</span>
          <span className="opacity-40">{separador}</span>
        </span>
      ))}
    </div>
  );
  return (
    <div
      aria-hidden="true"
      className={cx(
        "flex overflow-x-clip whitespace-nowrap [mask-image:linear-gradient(90deg,transparent_4%,#000_22%,#000_78%,transparent_96%)]",
        className,
      )}
    >
      <div
        className="flex w-max shrink-0 animate-marquesina"
        style={vars({ "--marquesina-vel": `${velocidad}s` })}
      >
        {linea}
        {linea}
      </div>
    </div>
  );
}

const TONOS: Record<Tono, string> = {
  rojo: "bg-poste-rojo text-white",
  azul: "bg-poste-azul text-white",
  tinta: "bg-tinta text-fondo",
};

export function Avatar({
  nombre,
  tono,
  className,
}: {
  nombre: string;
  tono: Tono;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        "inline-grid shrink-0 place-items-center rounded-full font-display font-black uppercase",
        TONOS[tono],
        className,
      )}
    >
      {nombre.charAt(0)}
    </span>
  );
}

const CLASE_PRINCIPAL =
  "group relative flex h-16 w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-poste-rojo px-6 font-display text-2xl font-extrabold tracking-wide text-white uppercase shadow-[0_10px_24px_-16px_rgb(10_15_36/0.55)] transition active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none";

function RellenoPrincipal({ children, flecha }: { children: ReactNode; flecha: boolean }) {
  return (
    <>
      <span className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-30">
        <Franjas ancho={14} velocidad={1} className="absolute inset-0" blanco="transparent" />
      </span>
      <span className="relative">{children}</span>
      {flecha && (
        <ArrowRight className="relative size-6 transition-transform group-hover:translate-x-1" />
      )}
    </>
  );
}

/** El botón rojo grande: la acción principal de cada pantalla. */
export function BotonPrincipal({
  children,
  className,
  flecha = true,
  type = "button",
  ...resto
}: {
  children: ReactNode;
  className?: string;
  flecha?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button type={type} className={cx(CLASE_PRINCIPAL, className)} {...resto}>
      <RellenoPrincipal flecha={flecha}>{children}</RellenoPrincipal>
    </button>
  );
}

export function EnlacePrincipal({
  children,
  to,
  className,
  flecha = true,
}: {
  children: ReactNode;
  to: string;
  className?: string;
  flecha?: boolean;
}) {
  return (
    <Link to={to} className={cx(CLASE_PRINCIPAL, className)}>
      <RellenoPrincipal flecha={flecha}>{children}</RellenoPrincipal>
    </Link>
  );
}

/** Boleto con línea punteada y muescas, como el papelito de "tome su número". */
export function Boleto({
  arriba,
  abajo,
  className,
}: {
  arriba: ReactNode;
  abajo: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("text-tinta drop-shadow-[0_18px_28px_rgb(13_20_48/0.2)]", className)}>
      <div className="muesca-abajo rounded-t-[1.75rem] bg-superficie px-6 pt-6 pb-5">{arriba}</div>
      <div className="relative muesca-arriba rounded-b-[1.75rem] bg-superficie px-6 pt-5 pb-6">
        <div
          aria-hidden="true"
          className="absolute inset-x-5 top-0 border-t-2 border-dashed border-tinta/20"
        />
        {abajo}
      </div>
    </div>
  );
}

const PIEZAS = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.cos(i * 2.39) * (90 + ((i * 37) % 150)),
  y: -(110 + ((i * 53) % 190)),
  giro: (i * 67) % 360,
  color: ["bg-poste-rojo", "bg-poste-azul", "bg-white"][i % 3],
  ancho: 6 + (i % 3) * 3,
}));

/** Lluvia de papelitos de los tres colores. Cambia `disparo` para repetirla. */
export function Confeti({ disparo }: { disparo: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 flex justify-center overflow-hidden pt-[33vh]"
    >
      {PIEZAS.map((p) => (
        <motion.span
          key={`${disparo}-${p.id}`}
          className={cx("absolute h-3 rounded-[2px] shadow-sm", p.color)}
          style={{ width: p.ancho }}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 0.3 }}
          animate={{
            x: p.x,
            y: [0, p.y, p.y + 420],
            rotate: p.giro + 540,
            opacity: [1, 1, 0],
            scale: 1,
          }}
          transition={{ duration: 2.2, ease: [0.12, 0.9, 0.4, 1], times: [0, 0.35, 1] }}
        />
      ))}
    </div>
  );
}

/** Aviso corto que aparece abajo y se va solo. */
export function useToast() {
  const [toast, setToast] = useState<{ id: number; texto: string } | null>(null);
  const mostrar = useCallback((texto: string) => setToast({ id: Date.now(), texto }), []);
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(id);
  }, [toast]);
  return { toast, mostrar };
}

export function Toast({
  toast,
  className = "bottom-6",
}: {
  toast: { id: number; texto: string } | null;
  className?: string;
}) {
  return (
    <div
      aria-live="polite"
      className={cx(
        "pointer-events-none fixed inset-x-0 z-[60] flex justify-center px-4",
        className,
      )}
    >
      <AnimatePresence>
        {toast && (
          <motion.p
            key={toast.id}
            initial={{ y: 30, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="max-w-sm rounded-2xl bg-tinta px-5 py-3 text-center text-sm font-semibold text-fondo shadow-2xl"
          >
            {toast.texto}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Estilo de los campos de texto. */
export const claseCampo =
  "h-14 w-full rounded-2xl bg-superficie px-4 text-lg text-tinta ring-1 ring-borde transition outline-none placeholder:text-tenue/60 focus:ring-2 focus:ring-azul";
