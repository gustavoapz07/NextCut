const ZONA = "America/Tegucigalpa";
const numero = new Intl.NumberFormat("es-HN");

export const lempiras = (monto: number) => `L ${numero.format(monto)}`;

/** Redondea a 5 minutos, nunca menos de 5. */
export const redondear5 = (minutos: number) => Math.max(5, Math.round(minutos / 5) * 5);

/** 35 → "35 min" · 75 → "1 h 15". */
export function duracion(minutos: number) {
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto === 0 ? `${horas} h` : `${horas} h ${String(resto).padStart(2, "0")}`;
}

/** [35, 45] → "35–45 min" · [75, 85] → "1 h 15 – 1 h 25". */
export function rango([desde, hasta]: readonly [number, number]) {
  if (hasta < 60) return `${desde}–${hasta} min`;
  return `${duracion(desde)} – ${duracion(hasta)}`;
}

/** "óscar  lópez" → "Óscar L.": así se muestra un nombre en las pantallas públicas. */
export function nombreCorto(nombre: string) {
  const [primero, segundo] = nombre.trim().split(/\s+/).filter(Boolean);
  if (!primero) return "";
  const capital = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  return segundo ? `${capital(primero)} ${segundo.charAt(0).toUpperCase()}.` : capital(primero);
}

/** 272 → "4:32". */
export function reloj(segundos: number) {
  const s = Math.max(0, segundos);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export const hora = (fecha: Date) =>
  new Intl.DateTimeFormat("es-HN", { hour: "numeric", minute: "2-digit", timeZone: ZONA }).format(
    fecha,
  );

/** "lunes 26 de octubre" → "Lunes 26 de octubre". */
export function fechaLarga(fecha: Date) {
  const texto = new Intl.DateTimeFormat("es-HN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: ZONA,
  })
    .format(fecha)
    .replace(",", "");
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
