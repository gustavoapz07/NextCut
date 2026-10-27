import "@fontsource-variable/big-shoulders-display";
import "@fontsource-variable/bricolage-grotesque/index.css";
import { MotionConfig } from "motion/react";
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
    {/* Respeta "reducir movimiento" del sistema en todas las animaciones de motion. */}
    <MotionConfig reducedMotion="user">
      <RouterProvider router={createBrowserRouter(rutas)} />
    </MotionConfig>
  </StrictMode>,
);
