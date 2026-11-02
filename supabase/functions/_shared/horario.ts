// Horario de la barbería: por día de la semana ISO ("1" lunes … "7" domingo), la hora de abrir y de
// cerrar ("09:00"), o `null` si ese día no abre. Sin horario, la barbería se considera siempre
// abierta. La base aplica la misma regla en `privado.abierta_en`; esto lo usa la página para decir
// cuándo abre. TypeScript puro: lo usan Vite y Deno.

import { z } from "zod";

export type Dia = "1" | "2" | "3" | "4" | "5" | "6" | "7";
// Tipos y no interfaces: así cuentan como JSON para el cliente de Supabase.
export type Franja = {
  abre: string;
  cierra: string;
};
export type Horario = Record<Dia, Franja | null>;

export const DIAS: ReadonlyArray<{ id: Dia; nombre: string }> = [
  { id: "1", nombre: "Lunes" },
  { id: "2", nombre: "Martes" },
  { id: "3", nombre: "Miércoles" },
  { id: "4", nombre: "Jueves" },
  { id: "5", nombre: "Viernes" },
  { id: "6", nombre: "Sábado" },
  { id: "7", nombre: "Domingo" },
];

const HORA = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
const esquemaFranja = z
  .object({ abre: z.string().regex(HORA), cierra: z.string().regex(HORA) })
  .strict()
  .refine((f) => f.abre < f.cierra);

/** Lo que guarda la base: un día que falta cuenta como cerrado. */
export const esquemaHorario = z
  .object({
    "1": esquemaFranja.nullable().optional(),
    "2": esquemaFranja.nullable().optional(),
    "3": esquemaFranja.nullable().optional(),
    "4": esquemaFranja.nullable().optional(),
    "5": esquemaFranja.nullable().optional(),
    "6": esquemaFranja.nullable().optional(),
    "7": esquemaFranja.nullable().optional(),
  })
  .strict()
  .transform(
    (h): Horario =>
      Object.fromEntries(DIAS.map(({ id }) => [id, h[id] ?? null])) as Record<Dia, Franja | null>,
  );

/** El horario con el que arranca quien lo activa: de lunes a sábado de 9:00 a 19:00. */
export const HORARIO_INICIAL: Horario = {
  "1": { abre: "09:00", cierra: "19:00" },
  "2": { abre: "09:00", cierra: "19:00" },
  "3": { abre: "09:00", cierra: "19:00" },
  "4": { abre: "09:00", cierra: "19:00" },
  "5": { abre: "09:00", cierra: "19:00" },
  "6": { abre: "09:00", cierra: "19:00" },
  "7": null,
};

const DIA_INGLES: Record<string, Dia> = {
  Mon: "1",
  Tue: "2",
  Wed: "3",
  Thu: "4",
  Fri: "5",
  Sat: "6",
  Sun: "7",
};

/** El día ISO y la hora ("14:05") de `fecha` en la zona horaria de la barbería. */
export function momentoEn(fecha: Date, zona: string): { dia: Dia; hora: string } {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: zona,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(fecha);
  const valor = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? "";
  return { dia: DIA_INGLES[valor("weekday")] ?? "1", hora: `${valor("hour")}:${valor("minute")}` };
}

export function abiertaEn(horario: Horario | null, fecha: Date, zona: string) {
  if (!horario) return true;
  const { dia, hora } = momentoEn(fecha, zona);
  const franja = horario[dia];
  return Boolean(franja && franja.abre <= hora && hora < franja.cierra);
}

/** Dentro de cuántos días y a qué hora vuelve a abrir; `null` si no abre ningún día. */
export function proximaApertura(horario: Horario, fecha: Date, zona: string) {
  const { dia, hora } = momentoEn(fecha, zona);
  const hoy = Number(dia);
  for (let dias = 0; dias < 8; dias++) {
    const id = String(((hoy - 1 + dias) % 7) + 1) as Dia;
    const franja = horario[id];
    if (!franja) continue;
    // Hoy solo cuenta si todavía no abre.
    if (dias === 0 && hora >= franja.abre) continue;
    return { dias, dia: id, abre: franja.abre };
  }
  return null;
}

/** "09:00" → "9:00 a. m." · "19:30" → "7:30 p. m." */
export function horaLegible(hhmm: string) {
  const [h = 0, m = 0] = hhmm.split(":").map(Number);
  const doce = h % 12 === 0 ? 12 : h % 12;
  return `${doce}:${String(m).padStart(2, "0")} ${h < 12 ? "a. m." : "p. m."}`;
}

/** "Abre hoy a las 9:00 a. m.", "Abre mañana a las…" o "Abre el lunes a las…". */
export function textoApertura(horario: Horario, fecha: Date, zona: string) {
  const proxima = proximaApertura(horario, fecha, zona);
  if (!proxima) return "Por ahora no tiene días de atención.";
  const cuando =
    proxima.dias === 0
      ? "hoy"
      : proxima.dias === 1
        ? "mañana"
        : `el ${DIAS.find((d) => d.id === proxima.dia)?.nombre.toLowerCase()}`;
  // horaLegible ya termina en punto ("a. m.").
  return `Abre ${cuando} a las ${horaLegible(proxima.abre)}`;
}

/** "7:00 p. m.": a qué hora cierra hoy, si ahora está abierta según su horario. */
export function cierreDeHoy(horario: Horario | null, fecha: Date, zona: string) {
  if (!horario || !abiertaEn(horario, fecha, zona)) return null;
  const franja = horario[momentoEn(fecha, zona).dia];
  return franja ? horaLegible(franja.cierra) : null;
}
