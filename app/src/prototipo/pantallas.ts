import {
  LayoutDashboard,
  LogIn,
  type LucideIcon,
  PenLine,
  QrCode,
  Scissors,
  Settings,
  Ticket,
  Tv,
  Users,
} from "lucide-react";

export interface Pantalla {
  ruta: string;
  titulo: string;
  texto: string;
  icono: LucideIcon;
  /** Accesos directos a cada estado de la pantalla (?estado=clave). */
  estados?: Array<{ clave: string; titulo: string }>;
}

export const pantallas: Array<{ grupo: string; descripcion: string; items: Pantalla[] }> = [
  {
    grupo: "Cliente",
    descripcion: "Desde el celular, sin descargar nada",
    items: [
      {
        ruta: "/b/la-navaja",
        titulo: "Fila de la barbería",
        texto: "Lo primero que ve al escanear el QR.",
        icono: Users,
      },
      {
        ruta: "/b/la-navaja/unirse",
        titulo: "Anotarse",
        texto: "Nombre, barbero y servicio en cuatro toques.",
        icono: PenLine,
      },
      {
        ruta: "/t/K7P2Q",
        titulo: "Mi turno en vivo",
        texto: "Posición, estimado y el aviso de “te toca”.",
        icono: Ticket,
        estados: [
          { clave: "fila", titulo: "En fila" },
          { clave: "casi", titulo: "Ya casi" },
          { clave: "llamado", titulo: "Te toca" },
          { clave: "silla", titulo: "En la silla" },
          { clave: "listo", titulo: "Listo" },
          { clave: "cancelado", titulo: "Cancelado" },
        ],
      },
    ],
  },
  {
    grupo: "Barbería",
    descripcion: "En el local, durante el día",
    items: [
      {
        ruta: "/b/la-navaja/tv",
        titulo: "Pantalla de TV",
        texto: "La fila en grande para la sala de espera.",
        icono: Tv,
      },
      {
        ruta: "/entrar",
        titulo: "Entrar",
        texto: "Acceso de barberos y dueños.",
        icono: LogIn,
      },
      {
        ruta: "/demo/panel",
        titulo: "Panel del barbero",
        texto: "Llamar, empezar, terminar o no llegó.",
        icono: Scissors,
      },
    ],
  },
  {
    grupo: "Dueño",
    descripcion: "El control del negocio",
    items: [
      {
        ruta: "/demo/dueno",
        titulo: "Resumen del día",
        texto: "Atendidos, ingresos, esperas y horas pico.",
        icono: LayoutDashboard,
      },
      {
        ruta: "/demo/dueno/configuracion",
        titulo: "Configuración",
        texto: "Barberos, servicios, horario y reglas de la fila.",
        icono: Settings,
      },
      {
        ruta: "/demo/dueno/qr",
        titulo: "Código QR",
        texto: "El cartel para la puerta, listo para imprimir.",
        icono: QrCode,
      },
    ],
  },
];
