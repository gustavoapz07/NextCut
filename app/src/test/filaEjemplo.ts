import type { FilaPublica } from "@/lib/fila";
import type { TurnoPublico } from "@/lib/turno";

const hace = (minutos: number) => new Date(Date.now() - minutos * 60_000).toISOString();

/**
 * Respuesta de `fila_publica` con la forma que devuelve la base. Ana lleva 10 de sus 30 minutos
 * de corte, Beto está en pausa y hay dos turnos esperando.
 */
export function filaDeEjemplo(cambios: Partial<FilaPublica["barberia"]> = {}): FilaPublica {
  return {
    barberia: {
      id: "b0000000-0000-4000-8000-000000000001",
      nombre: "El Faro",
      slug: "el-faro",
      zona: "Barrio Abajo, Tegucigalpa",
      fila_remota_activa: true,
      max_fila: 15,
      tolerancia_min: 5,
      ...cambios,
    },
    barberos: [
      {
        id: "ana",
        nombre: "Ana",
        apodo: "La Tijera",
        silla: 1,
        en_pausa: false,
        atendiendo: { numero: 3, estado: "en_silla", servicio_id: "corte", desde: hace(10) },
      },
      { id: "beto", nombre: "Beto", apodo: null, silla: 2, en_pausa: true, atendiendo: null },
    ],
    servicios: [
      { id: "corte", nombre: "Corte", duracion_min: 30, precio_ref: 150 },
      { id: "barba", nombre: "Barba", duracion_min: 15, precio_ref: 100 },
    ],
    fila: [
      {
        numero: 4,
        nombre: "Óscar L.",
        barbero_id: "ana",
        servicio_id: "corte",
        creado_en: hace(8),
      },
      { numero: 5, nombre: null, barbero_id: null, servicio_id: "barba", creado_en: hace(2) },
    ],
  };
}

/**
 * Respuesta de `ver_turno` para el #5 de la fila de ejemplo: Óscar espera con "el primero libre"
 * y tiene una persona antes (el #4 de Ana).
 */
export function turnoDeEjemplo(cambios: Partial<TurnoPublico> = {}): TurnoPublico {
  return {
    numero: 5,
    nombre: "Óscar L.",
    estado: "esperando",
    barbero_id: null,
    barbero: null,
    silla: null,
    servicio_id: "barba",
    servicio: "Barba",
    duracion_min: 15,
    precio_ref: 100,
    estimado_min: 50,
    creado_en: hace(2),
    llamado_en: null,
    inicio_en: null,
    fin_en: null,
    adelante: 1,
    barberia: { nombre: "El Faro", slug: "el-faro", tolerancia_min: 5 },
    ...cambios,
  };
}
