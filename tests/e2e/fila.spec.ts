// Salida del Sprint 2: un cliente se anota desde un celular y ve su posición cambiar cuando otro
// turno avanza; y la Edge Function rechaza lo que pide el fallo 3.
//
// Corre contra el proyecto de Supabase de .env.local y la barbería de prueba de
// scripts/e2e/barberias-prueba.sql. Cada corrida saca 2 turnos y los cancela al final; el límite
// es de 5 turnos por IP cada 10 minutos, así que caben 2 corridas seguidas.

import { expect, test } from "@playwright/test";
import {
  anotarPorApi,
  CLAVE,
  cancelarPorApi,
  datosTurno,
  leerFila,
  primero,
  SLUG,
  SLUG_OTRA,
  SUPABASE,
} from "./utilidades";

test.skip(!SUPABASE || !CLAVE, "Faltan VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY");

test("un cliente se anota desde el celular y ve su posición cambiar cuando otro turno avanza", async ({
  page,
  request,
}) => {
  const fila = await leerFila(request, SLUG);
  const barbero = primero(fila.barberos, "barberos");
  const servicio = primero(fila.servicios, "servicios");

  // Alguien ya se anotó con ese barbero. Su nombre comprueba que un <script> se ve como texto.
  const otro = datosTurno({
    nombre: "<script>alert(1)</script>",
    barberoId: barbero.id,
    servicioId: servicio.id,
  });
  const creado = await anotarPorApi(request, otro);
  expect(creado.status(), await creado.text()).toBe(200);
  const { codigo: codigoOtro } = (await creado.json()) as { codigo: string };

  let dialogos = 0;
  page.on("dialog", (dialogo) => {
    dialogos += 1;
    void dialogo.dismiss();
  });

  try {
    // La fila pública.
    await page.goto(`/b/${SLUG}`);
    await expect(page.getByRole("heading", { level: 1, name: fila.barberia.nombre })).toBeVisible();
    await expect(page.getByText("<script>alert(1)</script>").first()).toBeVisible();

    // El formulario, con un nombre con emoji.
    await page.getByRole("link", { name: /Anotarme en la fila/ }).click();
    await page.getByLabel("Tu nombre").fill("Óscar López 💈");
    await expect(page.getByText("Óscar L.")).toBeVisible();
    await page.getByRole("button", { name: "Siguiente" }).click();
    await page.locator("label", { hasText: barbero.nombre }).click();
    await page.locator("label", { hasText: servicio.nombre }).click();
    await expect(page.getByRole("heading", { name: /Confirma tu\s*turno/ })).toBeVisible();

    // Turnstile con la clave de prueba de Cloudflare pasa solo.
    const tomar = page.getByRole("button", { name: "Tomar mi turno" });
    await expect(tomar).toBeEnabled({ timeout: 30_000 });
    await tomar.click();

    // La página del turno.
    await page.waitForURL(/\/t\/[A-HJ-NP-Z2-9]{10}$/, { timeout: 30_000 });
    const antes = page.getByText(/^\d+ personas? antes que tú/);
    await expect(antes).toBeVisible();
    const adelante = Number((await antes.textContent())?.match(/^\d+/)?.[0]);
    expect(adelante).toBeGreaterThanOrEqual(1);

    // El turno de adelante sale de la fila y la página se actualiza sola, sin recargar.
    expect(await cancelarPorApi(request, codigoOtro, otro.secreto)).toBe(true);
    if (adelante === 1) {
      await expect(page.getByText("¡Ya casi, ve acercándote!")).toBeVisible();
    } else {
      await expect(
        page.getByText(new RegExp(`^${adelante - 1} personas? antes que tú`)),
      ).toBeVisible();
    }

    // Cancelar el turno propio: mantener presionado.
    await page.getByRole("button", { name: "Mantén presionado para cancelar" }).focus();
    await page.keyboard.down("Space");
    await page.waitForTimeout(1_800);
    await page.keyboard.up("Space");
    await expect(page.getByRole("heading", { name: /Turno\s*cancelado/ })).toBeVisible();
    expect(dialogos).toBe(0);
  } finally {
    // Si algo falló antes, el otro turno no queda en la fila.
    await cancelarPorApi(request, codigoOtro, otro.secreto);
  }
});

test("la Edge Function rechaza datos inválidos y lo que es de otra barbería (fallo 3)", async ({
  request,
}) => {
  const fila = await leerFila(request, SLUG);
  const otra = await leerFila(request, SLUG_OTRA);
  const servicio = primero(fila.servicios, "servicios").id;

  const casos: [string, Record<string, unknown>][] = [
    ["un nombre de 500 caracteres", { nombre: "a".repeat(500), servicioId: servicio }],
    ["un teléfono de otro país", { telefono: "+12025550123", servicioId: servicio }],
    ["un servicio de otra barbería", { servicioId: primero(otra.servicios, "servicios").id }],
    [
      "un barbero de otra barbería",
      { barberoId: primero(otra.barberos, "barberos").id, servicioId: servicio },
    ],
  ];
  for (const [caso, cambios] of casos) {
    const respuesta = await anotarPorApi(request, datosTurno(cambios));
    expect(respuesta.status(), caso).toBe(400);
    expect(await respuesta.json(), caso).toEqual({ error: "datos_invalidos" });
  }
});
