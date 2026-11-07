import type { RouteObject } from "react-router";
import { ErrorDeRuta } from "./components/ErrorDeRuta";
import { Cargando, MarcoPrototipo } from "./components/Marco";
import { NoEncontrado } from "./components/NoEncontrado";
import { Inicio } from "./features/inicio/Inicio";

// Cada pantalla se carga por separado para que el cliente no descargue el panel ni el reporte.
// Las del prototipo de diseño (datos de ejemplo de app/src/prototipo/) viven en /demo y en los
// ejemplos fijos (/b/la-navaja y /t/K7P2Q); las demás leen de Supabase.

// El resumen, la configuración y el QR del dueño son los mismos en el panel real y en el
// prototipo: cada pantalla sabe cuál es por el contexto que pone LayoutDueno.
const resumenDueno: RouteObject = {
  index: true,
  lazy: () => import("./features/dueno/Resumen").then((m) => ({ Component: m.Resumen })),
};
const configuracionDueno: RouteObject = {
  path: "configuracion",
  lazy: () =>
    import("./features/dueno/Configuracion").then((m) => ({ Component: m.Configuracion })),
};
const qrDueno: RouteObject = {
  path: "qr",
  lazy: () => import("./features/dueno/CodigoQr").then((m) => ({ Component: m.CodigoQr })),
};

export const rutas: RouteObject[] = [
  {
    path: "/",
    element: <MarcoPrototipo />,
    errorElement: <ErrorDeRuta />,
    hydrateFallbackElement: <Cargando />,
    children: [
      { index: true, element: <Inicio /> },
      {
        path: "b/:slug",
        lazy: () =>
          import("./features/fila/FilaPublica").then((m) => ({ Component: m.FilaPublica })),
      },
      {
        // Para revisar los avisos en un teléfono; no está enlazada desde ninguna pantalla.
        path: "diagnostico",
        lazy: () =>
          import("./features/diagnostico/Diagnostico").then((m) => ({ Component: m.Diagnostico })),
      },
      {
        path: "b/:slug/unirse",
        lazy: () => import("./features/fila/Unirse").then((m) => ({ Component: m.Unirse })),
      },
      {
        path: "b/:slug/tv",
        lazy: () =>
          import("./features/pantalla/PantallaTv").then((m) => ({ Component: m.PantallaTv })),
      },
      {
        path: "t/:codigo",
        lazy: () => import("./features/fila/Turno").then((m) => ({ Component: m.Turno })),
      },
      {
        path: "privacidad",
        lazy: () =>
          import("./features/legal/Privacidad").then((m) => ({ Component: m.Privacidad })),
      },
      {
        path: "entrar",
        lazy: () => import("./features/acceso/Entrar").then((m) => ({ Component: m.Entrar })),
      },
      {
        path: "cambiar-clave",
        lazy: () =>
          import("./features/acceso/CambiarClave").then((m) => ({ Component: m.CambiarClave })),
      },
      {
        // Panel del super admin, aparte de los de las barberías (ADR-017 y ADR-018).
        path: "admin",
        lazy: () =>
          import("./features/admin/LayoutAdmin").then((m) => ({ Component: m.LayoutAdmin })),
        children: [
          {
            index: true,
            lazy: () => import("./features/admin/Admin").then((m) => ({ Component: m.Barberias })),
          },
          {
            path: "nueva",
            lazy: () =>
              import("./features/admin/Admin").then((m) => ({ Component: m.NuevaBarberia })),
          },
          {
            path: "b/:id",
            lazy: () =>
              import("./features/admin/Admin").then((m) => ({
                Component: m.DetalleBarberiaAdmin,
              })),
          },
        ],
      },
      {
        path: "panel",
        lazy: () =>
          import("./features/barbero/PanelBarbero").then((m) => ({ Component: m.PanelBarbero })),
      },
      {
        path: "demo/panel",
        lazy: () =>
          import("./features/barbero/PanelBarbero").then((m) => ({ Component: m.PanelPrototipo })),
      },
      {
        // Panel real del dueño: pide sesión.
        path: "dueno",
        lazy: () =>
          import("./features/dueno/LayoutDueno").then((m) => ({ Component: m.LayoutDueno })),
        children: [resumenDueno, configuracionDueno, qrDueno],
      },
      {
        path: "demo/dueno",
        lazy: () =>
          import("./features/dueno/LayoutDueno").then((m) => ({
            Component: m.LayoutDuenoPrototipo,
          })),
        children: [resumenDueno, configuracionDueno, qrDueno],
      },
      { path: "*", element: <NoEncontrado /> },
    ],
  },
];
