// Prueba de riesgo 2, la parte de escritorio: los avisos por Web Push llegan de verdad a Chrome.
// El cliente activa los avisos en su turno, recibe "ya casi" (el reloj de pg_cron revisa cada
// minuto) y "te toca" cuando el barbero lo llama. Pasa por la base, pg_net, la Edge Function
// `avisos`, el servicio de push de Google y el service worker.
//
// Solo en la laptop: el Chromium de Playwright del CI no tiene servicio de push. Necesita las
// claves VAPID cargadas (scripts/claves-vapid.mjs) y la configuración de Vault (ADR-014).

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium, expect, type Page, test } from "@playwright/test";
import {
  anotarPorApi,
  BARBERO_CLAVE,
  BARBERO_CORREO,
  CLAVE,
  cancelarPorApi,
  datosTurno,
  leerFila,
  primero,
  SLUG,
  SUPABASE,
} from "./utilidades";

test.skip(!!process.env.CI, "El Chromium del CI no tiene servicio de push");
test.skip(
  !SUPABASE || !CLAVE || !BARBERO_CORREO || !BARBERO_CLAVE || !process.env.VITE_VAPID_PUBLIC_KEY,
  "Faltan las variables de Supabase, la cuenta de barbero o la clave VAPID en .env.local",
);

/** Títulos de las notificaciones que mostró el service worker. */
function notificaciones(pagina: Page) {
  return pagina.evaluate(async () => {
    const registro = await navigator.serviceWorker.ready;
    return (await registro.getNotifications()).map((n) => n.title);
  });
}

test("los avisos de ya casi y te toca llegan a Chrome por Web Push", async ({
  browser,
  request,
  baseURL,
}) => {
  // El reloj de los avisos corre cada minuto.
  test.setTimeout(240_000);
  const fila = await leerFila(request, SLUG);
  const servicio = primero(fila.servicios, "servicios");
  const carlos = fila.barberos.find((b) => b.nombre === "Carlos");
  if (!carlos) throw new Error("La barbería de prueba no tiene a Carlos");

  const turno = datosTurno({
    nombre: "Prueba Avisos",
    barberoId: carlos.id,
    servicioId: servicio.id,
  });
  const creado = await anotarPorApi(request, turno);
  expect(creado.status(), await creado.text()).toBe(200);
  const { codigo, numero } = (await creado.json()) as { codigo: string; numero: number };

  // El teléfono del cliente necesita un perfil de verdad: los contextos normales de Playwright
  // son tipo incógnito, y Chrome no deja usar Web Push en incógnito ("permission denied").
  // Sin --disable-background-networking, para que Chrome escuche al servicio de push de Google.
  const perfil = mkdtempSync(join(tmpdir(), "nextcut-avisos-"));
  // El permiso de notificaciones queda guardado en el perfil, como cuando una persona acepta el
  // cuadro. Con el permiso temporal de Playwright, Chrome a veces da de baja la suscripción al
  // repasar los permisos, y Google responde 410.
  mkdirSync(join(perfil, "Default"));
  writeFileSync(
    join(perfil, "Default", "Preferences"),
    JSON.stringify({
      profile: {
        content_settings: {
          exceptions: { notifications: { [`${baseURL},*`]: { setting: 1 } } },
        },
      },
    }),
  );
  const contexto = await chromium.launchPersistentContext(perfil, {
    channel: "chrome",
    baseURL,
    ignoreDefaultArgs: ["--disable-background-networking"],
  });
  const cliente = await contexto.newPage();
  const barbero = await browser.newPage();
  try {
    // El secreto queda en el teléfono como si se hubiera anotado desde el formulario.
    await cliente.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [
      `nextcut:secreto:${codigo}`,
      turno.secreto,
    ] as const);
    await cliente.goto(`/t/${codigo}`);
    await expect(cliente.getByText(`#${numero}`).first()).toBeVisible();

    await cliente.getByRole("button", { name: "Avisarme cuando falten 15 min" }).click();
    await expect(
      cliente.getByRole("button", { name: "Te avisamos a los 15 min y cuando te toque" }),
    ).toBeVisible();

    // Carlos está libre: el estimado es 0 y en el siguiente minuto llega "ya casi".
    await expect
      .poll(() => notificaciones(cliente), { timeout: 150_000, intervals: [3_000] })
      .toContain(`Ya casi te toca · Turno #${numero}`);

    // Carlos lo llama: el cambio de estado dispara la función y llega "te toca".
    await barbero.goto("/panel");
    await barbero.getByLabel("Correo").fill(BARBERO_CORREO);
    await barbero.getByLabel("Contraseña", { exact: true }).fill(BARBERO_CLAVE);
    await barbero.getByRole("button", { name: "Entrar", exact: true }).click();
    await expect(barbero.getByText("Hola, Carlos")).toBeVisible();
    await barbero.getByRole("button", { name: /Llamar siguiente/ }).click();
    await expect(barbero.getByText(`#${numero}`).first()).toBeVisible();

    await expect
      .poll(() => notificaciones(cliente), { timeout: 60_000, intervals: [2_000] })
      .toContain(`¡Te toca! · Turno #${numero}`);
  } finally {
    await cancelarPorApi(request, codigo, turno.secreto);
    await contexto.close();
    await barbero.close();
    rmSync(perfil, { recursive: true, force: true });
  }
});
