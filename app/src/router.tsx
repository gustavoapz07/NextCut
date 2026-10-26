import type { RouteObject } from "react-router";
import { ErrorDeRuta } from "./components/ErrorDeRuta";
import { NoEncontrado } from "./components/NoEncontrado";
import { Inicio } from "./features/inicio/Inicio";

// Las rutas de la fila (/b/:slug, /t/:codigo), el panel y la TV llegan en los sprints 2 a 4.
export const rutas: RouteObject[] = [
  {
    path: "/",
    errorElement: <ErrorDeRuta />,
    children: [
      { index: true, element: <Inicio /> },
      { path: "*", element: <NoEncontrado /> },
    ],
  },
];
