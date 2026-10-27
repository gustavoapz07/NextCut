import type { CSSProperties } from "react";

/** Une clases de Tailwind y descarta las vacías. */
export function cx(...clases: Array<string | false | null | undefined>) {
  return clases.filter(Boolean).join(" ");
}

/** Pasa variables CSS (`--algo`) en `style` sin pelear con los tipos de React. */
export function vars(valores: Record<`--${string}`, string | number>): CSSProperties {
  return valores as CSSProperties;
}
