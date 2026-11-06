// El dueño puede atender cualquier silla de su barbería desde el panel. La cuenta de prueba
// (scripts/e2e/dueno-prueba.sql) es dueña de la Barbería Prueba y tiene su propia silla: entra
// a la suya, cambia a otra y vuelve. No crea turnos.

import { expect, test } from "@playwright/test";
import { BARBERO_CLAVE, BARBERO_CORREO, CLAVE, leerFila, SLUG, SUPABASE } from "./utilidades";

test.skip(
  !SUPABASE || !CLAVE || !BARBERO_CORREO || !BARBERO_CLAVE,
  "Faltan las variables de Supabase o la cuenta de prueba en .env.local",
);

test("el dueño cambia de silla desde el panel", async ({ page, request }) => {
  const fila = await leerFila(request, SLUG);
  const otra = fila.barberos.find((b) => b.nombre !== "Carlos");
  test.skip(!otra, "La barbería de prueba solo tiene una silla");
  if (!otra) return;

  await page.goto("/panel");
  await page.getByLabel("Correo").fill(BARBERO_CORREO);
  await page.getByLabel("Contraseña", { exact: true }).fill(BARBERO_CLAVE);
  await page.getByRole("button", { name: "Entrar" }).click();

  // Entra a su propia silla y, como es dueño, puede cambiarla.
  await expect(page.getByText("Hola, Carlos")).toBeVisible();
  await page.getByRole("button", { name: /Cambiar silla/ }).click();

  await expect(page.getByRole("heading", { name: "¿En qué silla vas a atender?" })).toBeVisible();
  await page.getByRole("button", { name: new RegExp(otra.nombre) }).click();
  await expect(page.getByText(`Hola, ${otra.nombre}`)).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`silla=${otra.id}`));

  // La silla elegida sobrevive a recargar.
  await page.reload();
  await expect(page.getByText(`Hola, ${otra.nombre}`)).toBeVisible();
});
