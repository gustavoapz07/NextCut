import type { RouteObject } from "react-router";
import { ErrorDeRuta } from "./components/ErrorDeRuta";
import { Cargando, MarcoPrototipo } from "./components/Marco";
import { NoEncontrado } from "./components/NoEncontrado";
import { Inicio } from "./features/inicio/Inicio";

// Prototipo de diseño: las pantallas usan datos de ejemplo (app/src/prototipo/), todavía sin Supabase.
// Cada pantalla se carga por separado para que el cliente no descargue el panel ni el reporte.
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
        path: "entrar",
        lazy: () => import("./features/acceso/Entrar").then((m) => ({ Component: m.Entrar })),
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
        path: "dueno",
        lazy: () =>
          import("./features/dueno/LayoutDueno").then((m) => ({ Component: m.LayoutDueno })),
        children: [
          {
            index: true,
            lazy: () => import("./features/dueno/Resumen").then((m) => ({ Component: m.Resumen })),
          },
          {
            path: "configuracion",
            lazy: () =>
              import("./features/dueno/Configuracion").then((m) => ({
                Component: m.Configuracion,
              })),
          },
          {
            path: "qr",
            lazy: () =>
              import("./features/dueno/CodigoQr").then((m) => ({ Component: m.CodigoQr })),
          },
        ],
      },
      { path: "*", element: <NoEncontrado /> },
    ],
  },
];
