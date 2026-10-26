import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const raiz = (ruta: string) => fileURLToPath(new URL(ruta, import.meta.url));

export default defineConfig({
  // El código de la app vive en app/; las variables (.env.local) y el build quedan en la raíz.
  root: raiz("./app"),
  envDir: raiz("."),
  plugins: [react(), tailwindcss()],
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
    include: ["app/src/**/*.test.{ts,tsx}", "supabase/functions/_shared/**/*.test.ts"],
    environment: "jsdom",
    setupFiles: [raiz("./app/src/test/setup.ts")],
  },
});
