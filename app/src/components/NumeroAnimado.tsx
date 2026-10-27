import { motion } from "motion/react";
import { cx } from "@/lib/utilidades";

const DIGITOS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

interface Props {
  valor: number;
  formato?: (n: number) => string;
  className?: string;
  /** Hace rodar los dígitos desde 0 al aparecer (para reportes). */
  desdeCero?: boolean;
}

/** Número que cambia como un contador mecánico: cada dígito rueda hasta su lugar. */
export function NumeroAnimado({ valor, formato = String, className, desdeCero = false }: Props) {
  const texto = formato(valor);
  const caracteres = [...texto].map((caracter, i, todos) => ({
    caracter,
    posicion: todos.length - i,
  }));
  return (
    <span className={cx("inline-flex tabular-nums", className)}>
      <span className="sr-only">{texto}</span>
      <span aria-hidden="true" className="inline-flex">
        {caracteres.map(({ caracter, posicion }) =>
          /\d/.test(caracter) ? (
            <Digito key={`d${posicion}`} digito={Number(caracter)} desdeCero={desdeCero} />
          ) : (
            <span key={`s${posicion}`} className="leading-none whitespace-pre">
              {caracter}
            </span>
          ),
        )}
      </span>
    </span>
  );
}

// El dígito invisible da el ancho real del número actual (la tipografía no tiene cifras
// de ancho fijo); la columna de 0 a 9 rueda encima, centrada.
function Digito({ digito, desdeCero }: { digito: number; desdeCero: boolean }) {
  return (
    <span className="relative inline-block h-[1em] overflow-hidden leading-none">
      <span className="invisible">{digito}</span>
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col items-center"
        initial={desdeCero ? { y: "0em" } : false}
        animate={{ y: `${-digito}em` }}
        transition={{ type: "spring", stiffness: 110, damping: 18, mass: 0.9 }}
      >
        {DIGITOS.map((n) => (
          <span key={n} className="block h-[1em] leading-none">
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}
