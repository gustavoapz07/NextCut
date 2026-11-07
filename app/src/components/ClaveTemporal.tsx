import { Check, Copy, KeyRound, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

/** El mensaje listo para mandar por WhatsApp con los datos para entrar. */
export function mensajeDeAcceso(
  correo: string | null,
  clave: string,
  origen = window.location.origin,
) {
  return [
    correo ? "Tu cuenta de NextCut está lista." : "Tu contraseña de NextCut cambió.",
    `Entra en ${origen}/entrar`,
    correo ? `Correo: ${correo}` : "Correo: el de siempre",
    `Contraseña temporal: ${clave}`,
    "Al entrar te va a pedir una contraseña nueva.",
  ].join("\n");
}

/**
 * La contraseña temporal recién creada. Se muestra una sola vez: la base no la guarda en claro y
 * nadie la puede volver a ver.
 */
export function ClaveTemporal({
  titulo,
  correo,
  clave,
  onCerrar,
}: {
  titulo: string;
  /** `null` al restablecer: la cuenta entra con el correo que ya tenía. */
  correo: string | null;
  clave: string;
  onCerrar: () => void;
}) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(mensajeDeAcceso(correo, clave));
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2400);
    } catch {
      // Sin permiso para el portapapeles: la contraseña sigue a la vista para copiarla a mano.
    }
  }

  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-[1.5rem] bg-noche p-5 text-hueso ring-1 ring-white/10"
    >
      <button
        type="button"
        onClick={onCerrar}
        aria-label="Cerrar"
        className="absolute top-3 right-3 grid size-10 place-items-center rounded-full text-hueso/70 transition hover:bg-white/10 hover:text-hueso"
      >
        <X className="size-5" />
      </button>
      <p className="flex items-center gap-2 pr-10 font-semibold">
        <KeyRound className="size-5 shrink-0" /> {titulo}
      </p>
      <p className="mt-3 text-sm text-hueso/70 break-all">
        {correo ?? "Entra con su correo de siempre"}
      </p>
      <p
        data-testid="clave-temporal"
        className="mt-1 font-mono text-[clamp(1.5rem,7vw,2.25rem)] font-bold tracking-wide break-all select-all"
      >
        {clave}
      </p>
      <p className="mt-3 text-sm text-hueso/70">
        Cópiala ahora: no se vuelve a mostrar. Al entrar le va a pedir una contraseña nueva.
      </p>
      <button
        type="button"
        onClick={() => void copiar()}
        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-hueso font-semibold text-noche transition hover:opacity-90"
      >
        {copiado ? <Check className="size-5" /> : <Copy className="size-5" />}
        {copiado ? "Copiado" : "Copiar mensaje para WhatsApp"}
      </button>
    </motion.div>
  );
}
