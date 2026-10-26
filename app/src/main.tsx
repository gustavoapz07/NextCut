import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { rutas } from "./router";
import "./index.css";

const raiz = document.getElementById("root");
if (!raiz) throw new Error("No existe el elemento #root en index.html");

createRoot(raiz).render(
  <StrictMode>
    <RouterProvider router={createBrowserRouter(rutas)} />
  </StrictMode>,
);
