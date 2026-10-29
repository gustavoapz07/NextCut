// Salida del Sprint 3 (la parte del panel): el barbero entra, llama, empieza y termina un turno,
// y el cliente lo ve en su página sin recargar. Usa la cuenta de scripts/e2e/barbero-prueba.sql.

import { expect, test } from "@playwright/test";
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

test.skip(
  !SUPABASE || !CLAVE || !BARBERO_CORREO || !BARBERO_CLAVE,
  "Faltan las variables de Supabase o la cuenta de barbero de prueba en .env.local",
);

test("el barbero llama, empieza y termina un turno y el cliente lo ve en su página", async ({
  browser,
  request,
}) => {
  const fila = await leerFila(request, SLUG);
  const servicio = primero(fila.servicios, "servicios");
  const carlos = fila.barberos.find((b) => b.nombre === "Carlos");
  if (!carlos) throw new Error("La barbería de prueba no tiene a Carlos");

  // Dos celulares: el del barbero y el del cliente.
  const barbero = await browser.newPage();
  const cliente = await browser.newPage();

  const turno = datosTurno({
    nombre: "Prueba Panel",
    telefono: "+50499998888",
    barberoId: carlos.id,
    servicioId: servicio.id,
  });
  const creado = await anotarPorApi(request, turno);
  expect(creado.status(), await creado.text()).toBe(200);
  const { codigo, numero } = (await creado.json()) as { codigo: string; numero: number };

  try {
    // El barbero entra.
    await barbero.goto("/panel");
    await expect(barbero.getByRole("heading", { level: 1, name: "Entrar" })).toBeVisible();
    await barbero.getByLabel("Correo").fill(BARBERO_CORREO);
    await barbero.getByLabel("Contraseña", { exact: true }).fill(BARBERO_CLAVE);
    await barbero.getByRole("button", { name: "Entrar", exact: true }).click();
    await expect(barbero.getByText("Hola, Carlos")).toBeVisible();

    // El cliente abre su turno.
    await cliente.goto(`/t/${codigo}`);
    await expect(cliente.getByText(`#${numero}`).first()).toBeVisible();

    // Llamar siguiente: tiene que ser este turno (si no, quedó algo de una corrida anterior).
    const llamar = barbero.getByRole("button", { name: /Llamar siguiente/ });
    await expect(
      llamar,
      "El primero de la fila de Carlos debe ser el turno recién creado",
    ).toContainText(`#${numero} Prueba Panel`);
    await llamar.click();
    await expect(barbero.getByText("Llamaste a")).toBeVisible();
    await expect(barbero.getByRole("link", { name: /Avisar por WhatsApp/ })).toHaveAttribute(
      "href",
      /^https:\/\/wa\.me\/50499998888\?text=Prueba%2C%20ya%20te%20toca/,
    );
    await expect(cliente.getByRole("heading", { name: /¡Te\s*toca!/ })).toBeVisible();

    // Empezar.
    await barbero.getByRole("button", { name: /Empezar/ }).click();
    await expect(barbero.getByText("En la silla")).toBeVisible();
    await expect(cliente.getByRole("heading", { name: /Disfruta\s*tu corte/ })).toBeVisible();

    // Terminar con tarjeta.
    await barbero.getByRole("button", { name: /Terminar/ }).click();
    await barbero.getByRole("button", { name: "Tarjeta" }).click();
    await barbero.getByRole("button", { name: "Guardar y terminar" }).click();
    await expect(barbero.getByText(/Turno cerrado/)).toBeVisible();
    await expect(cliente.getByRole("heading", { name: "fino!" })).toBeVisible();

    // Salir del panel.
    await barbero.getByRole("button", { name: "Salir" }).click();
    await expect(barbero.getByRole("heading", { level: 1, name: "Entrar" })).toBeVisible();
  } finally {
    // Si algo falló antes de llamarlo, el turno no queda en la fila.
    await cancelarPorApi(request, codigo, turno.secreto);
    await barbero.close();
    await cliente.close();
  }
});
