import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import type { HtmlTagDescriptor, Plugin } from "vite";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

const raiz = (ruta: string) => fileURLToPath(new URL(ruta, import.meta.url));

/**
 * Adelanta lo que toda primera visita necesita:
 * - precarga las dos fuentes en su versión latina (los titulares gigantes se ven al instante y no
 *   saltan cuando llega la fuente). Las demás versiones (latin-ext, vietnamita) siguen bajando
 *   solo si la página usa esos caracteres.
 * - abre la conexión con Supabase mientras el JavaScript todavía baja.
 */
function cargaInicial(mode: string): Plugin {
  const supabase = loadEnv(mode, raiz("."), "VITE_").VITE_SUPABASE_URL;
  return {
    name: "nextcut-carga-inicial",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(_html, { bundle }) {
        const etiquetas: HtmlTagDescriptor[] = [];
        if (supabase) {
          etiquetas.push({
            tag: "link",
            attrs: { rel: "preconnect", href: new URL(supabase).origin, crossorigin: "" },
            injectTo: "head-prepend",
          });
        }
        for (const archivo of Object.keys(bundle ?? {})) {
          if (
            /(big-shoulders-display|bricolage-grotesque)-latin-wght-normal-[^/]+\.woff2$/.test(
              archivo,
            )
          ) {
            etiquetas.push({
              tag: "link",
              attrs: {
                rel: "preload",
                href: `/${archivo}`,
                as: "font",
                type: "font/woff2",
                crossorigin: "",
              },
              injectTo: "head",
            });
          }
        }
        return etiquetas;
      },
    },
  };
}

export default defineConfig(({ mode }) => ({
  // El código de la app vive en app/; las variables (.env.local) y el build quedan en la raíz.
  root: raiz("./app"),
  envDir: raiz("."),
  plugins: [react(), tailwindcss(), cargaInicial(mode)],
  resolve: {
    alias: {
      "@": raiz("./app/src"),
      "@shared": raiz("./supabase/functions/_shared"),
    },
  },
  build: {
    outDir: raiz("./dist"),
    emptyOutDir: true,
  },
  test: {
    dir: raiz("."),
    include: [
      "app/src/**/*.test.{ts,tsx}",
      "supabase/functions/_shared/**/*.test.ts",
      "scripts/**/*.test.mjs",
    ],
    environment: "jsdom",
    setupFiles: [raiz("./app/src/test/setup.ts")],
  },
}));
