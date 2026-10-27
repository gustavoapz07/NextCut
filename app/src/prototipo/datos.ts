// Datos de ejemplo del prototipo de diseño. Nada de esto viene de Supabase todavía.

import { redondear5 } from "@/lib/formato";

export type IdBarbero = "carlos" | "jorge" | "kevin";
export type Preferencia = IdBarbero | "cualquiera";
export type Tono = "rojo" | "azul" | "tinta";

export interface Barbero {
  id: IdBarbero;
  nombre: string;
  apodo: string;
  silla: number;
  tono: Tono;
  estado: "atendiendo" | "libre" | "pausa";
  /** Número del turno que tiene en la silla. */
  atendiendo: number | null;
  /** Minutos que le faltan al servicio en curso. */
  restante: number;
}

export interface Servicio {
  id: string;
  nombre: string;
  detalle: string;
  minutos: number;
  precio: number;
}

export interface TurnoFila {
  numero: number;
  nombre: string;
  barbero: Preferencia;
  servicio: string;
  origen: "local" | "remoto";
  /** Minutos que lleva esperando. */
  espera: number;
}

/** Dominio por definir (plan de implementación, sección 15). */
export const DOMINIO = "nextcut.app";

export const barberia = {
  nombre: "La Navaja",
  slug: "la-navaja",
  zona: "Col. Palmira, Tegucigalpa",
  cierra: "7:00 p. m.",
  enlace: `${DOMINIO}/b/la-navaja`,
};

export const barberos: Barbero[] = [
  {
    id: "carlos",
    nombre: "Carlos",
    apodo: "El Profe",
    silla: 1,
    tono: "rojo",
    estado: "atendiendo",
    atendiendo: 24,
    restante: 8,
  },
  {
    id: "jorge",
    nombre: "Jorge",
    apodo: "Rey del fade",
    silla: 2,
    tono: "azul",
    estado: "atendiendo",
    atendiendo: 25,
    restante: 6,
  },
  {
    id: "kevin",
    nombre: "Kevin",
    apodo: "Mano rápida",
    silla: 3,
    tono: "tinta",
    estado: "atendiendo",
    atendiendo: 23,
    restante: 4,
  },
];

export const servicios: Servicio[] = [
  { id: "corte", nombre: "Corte clásico", detalle: "Tijera y máquina", minutos: 25, precio: 150 },
  { id: "fade", nombre: "Fade", detalle: "Degradado a navaja", minutos: 35, precio: 180 },
  { id: "combo", nombre: "Corte + barba", detalle: "El combo completo", minutos: 45, precio: 230 },
  {
    id: "barba",
    nombre: "Barba",
    detalle: "Perfilado y toalla caliente",
    minutos: 15,
    precio: 100,
  },
  { id: "cejas", nombre: "Cejas o diseño", detalle: "Líneas y detalles", minutos: 10, precio: 50 },
];

export const filaInicial: TurnoFila[] = [
  {
    numero: 26,
    nombre: "Luis R.",
    barbero: "carlos",
    servicio: "corte",
    origen: "local",
    espera: 24,
  },
  {
    numero: 27,
    nombre: "Andrea M.",
    barbero: "jorge",
    servicio: "fade",
    origen: "remoto",
    espera: 21,
  },
  {
    numero: 28,
    nombre: "José P.",
    barbero: "kevin",
    servicio: "barba",
    origen: "local",
    espera: 17,
  },
  {
    numero: 29,
    nombre: "Daniel H.",
    barbero: "carlos",
    servicio: "barba",
    origen: "remoto",
    espera: 14,
  },
  {
    numero: 30,
    nombre: "Marvin C.",
    barbero: "jorge",
    servicio: "corte",
    origen: "remoto",
    espera: 9,
  },
  {
    numero: 31,
    nombre: "Óscar L.",
    barbero: "carlos",
    servicio: "corte",
    origen: "remoto",
    espera: 6,
  },
  {
    numero: 32,
    nombre: "Kenia A.",
    barbero: "cualquiera",
    servicio: "cejas",
    origen: "local",
    espera: 2,
  },
];

/** Nombres para simular gente que se va anotando. */
export const nombresNuevos = [
  "Ricardo V.",
  "Fernando G.",
  "Allan M.",
  "Nelson Z.",
  "Gabriela E.",
  "Mario S.",
  "Josué T.",
  "Wendy R.",
];

/** El turno de la página /t/:codigo. */
export const miTurno = {
  codigo: "K7P2Q",
  numero: 33,
  nombre: "Óscar L.",
  barbero: "carlos" as Preferencia,
  servicio: "corte",
  anotado: "10:42 a. m.",
};

export const reporte = {
  atendidos: 23,
  ingresos: 4380,
  esperaPromedio: 18,
  errorEstimado: 4,
  abandonos: 2,
  porBarbero: [
    { id: "carlos" as IdBarbero, atendidos: 9, ingresos: 1740, espera: 21 },
    { id: "jorge" as IdBarbero, atendidos: 8, ingresos: 1610, espera: 17 },
    { id: "kevin" as IdBarbero, atendidos: 6, ingresos: 1030, espera: 12 },
  ],
  horas: [
    { etiqueta: "9", turnos: 2 },
    { etiqueta: "10", turnos: 4 },
    { etiqueta: "11", turnos: 6 },
    { etiqueta: "12", turnos: 3 },
    { etiqueta: "1", turnos: 2 },
    { etiqueta: "2", turnos: 4 },
    { etiqueta: "3", turnos: 5 },
    { etiqueta: "4", turnos: 8 },
    { etiqueta: "5", turnos: 9 },
    { etiqueta: "6", turnos: 7 },
  ],
};

export const buscarBarbero = (id: Preferencia) => barberos.find((b) => b.id === id);
export const buscarServicio = (id: string) => servicios.find((s) => s.id === id);

export function nombreDe(preferencia: Preferencia) {
  return buscarBarbero(preferencia)?.nombre ?? "El primero libre";
}

/** Estimado para alguien que se anota ahora con ese barbero: lo que le falta más la fila. */
export function estimar(barbero: Barbero, fila: TurnoFila[]): [number, number] {
  const minutos = fila
    .filter((t) => t.barbero === barbero.id)
    .reduce((total, t) => total + (buscarServicio(t.servicio)?.minutos ?? 25), barbero.restante);
  const desde = redondear5(barbero.estado === "pausa" ? minutos + 20 : minutos);
  return [desde, desde + 10];
}
