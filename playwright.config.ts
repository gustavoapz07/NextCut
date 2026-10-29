import { defineConfig, devices } from "@playwright/test";

// Las variables públicas de Supabase salen de .env.local; en el CI, del entorno.
try {
  process.loadEnvFile(".env.local");
} catch {
  // No hay .env.local (CI).
}

const PUERTO = 5173;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  // Una a la vez: la barbería de prueba es compartida y cada IP puede sacar 5 turnos cada 10 min.
  workers: 1,
  fullyParallel: false,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PUERTO}`,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "celular",
      // En la laptop usa el Chrome instalado; en el CI, el Chromium de Playwright.
      use: { ...devices["Pixel 7"], channel: process.env.CI ? undefined : "chrome" },
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${PUERTO} --strictPort`,
    url: `http://localhost:${PUERTO}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
