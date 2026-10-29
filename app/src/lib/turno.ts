// Lo que devuelve `ver_turno(codigo)`, cancelar el turno propio y el aviso de "te toca".

import { z } from "zod";
import { supabase } from "./supabase";

export const ESTADOS_TURNO = [
  "esperando",
  "llamado",
  "en_silla",
  "atendido",
  "cancelado",
  "abandono",
  "no_llego",
] as const;
export type EstadoDelTurno = (typeof ESTADOS_TURNO)[number];

/** Mientras el turno está en alguno de estos estados, la página sigue escuchando la fila. */
export const ACTIVOS: readonly EstadoDelTurno[] = ["esperando", "llamado", "en_silla"];

export const esquemaTurnoPublico = z.object({
  numero: z.number(),
  /** Ya viene como "Óscar L.". */
  nombre: z.string(),
  estado: z.enum(ESTADOS_TURNO),
  barbero_id: z.string().nullable(),
  barbero: z.string().nullable(),
  silla: z.number().nullable(),
  servicio_id: z.string(),
  servicio: z.string(),
  duracion_min: z.number(),
  precio_ref: z.number(),
  estimado_min: z.number().nullable(),
  creado_en: z.string(),
  llamado_en: z.string().nullable(),
  inicio_en: z.string().nullable(),
  fin_en: z.string().nullable(),
  /** Personas que pasan antes: las de su barbero y las de "el primero libre". */
  adelante: z.number(),
  barberia: z.object({ nombre: z.string(), slug: z.string(), tolerancia_min: z.number() }),
});

export type TurnoPublico = z.infer<typeof esquemaTurnoPublico>;

/** Cancela con el secreto que quedó en el teléfono al anotarse. */
export async function cancelarTurno(codigo: string, secreto: string) {
  const { data, error } = await supabase.rpc("cancelar_turno", {
    p_codigo: codigo,
    p_secreto: secreto,
  });
  return !error && data === true;
}

type ConAudioViejo = Window & { webkitAudioContext?: typeof AudioContext };

/** Vibra y suena dos tonos cortos. Si el navegador no lo permite, no pasa nada. */
export function avisarQueToca() {
  // Sin un toque previo en la página, el navegador bloquea las dos cosas y deja un error en la
  // consola. Quien llega desde el formulario ya tocó; quien abre el enlace de cero, todavía no.
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
  try {
    navigator.vibrate?.([400, 150, 400, 150, 600]);
  } catch {
    // Sin vibración.
  }
  try {
    const Contexto = window.AudioContext ?? (window as ConAudioViejo).webkitAudioContext;
    if (!Contexto) return;
    const audio = new Contexto();
    for (const [indice, frecuencia] of [880, 1175].entries()) {
      const inicio = audio.currentTime + indice * 0.35;
      const tono = audio.createOscillator();
      const volumen = audio.createGain();
      tono.frequency.value = frecuencia;
      volumen.gain.setValueAtTime(0.0001, inicio);
      volumen.gain.exponentialRampToValueAtTime(0.3, inicio + 0.02);
      volumen.gain.exponentialRampToValueAtTime(0.0001, inicio + 0.3);
      tono.connect(volumen).connect(audio.destination);
      tono.start(inicio);
      tono.stop(inicio + 0.32);
    }
    window.setTimeout(() => void audio.close(), 1200);
  } catch {
    // Sin sonido (el navegador lo bloquea hasta que la persona toque la página).
  }
}
