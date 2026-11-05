// @vitest-environment node
import { describe, expect, it } from "vitest";
import { revisarVariables } from "./revisar-produccion.mjs";

// Valores inventados con el mismo formato que los reales.
const pruebas = {
  VITE_SUPABASE_URL: "https://aaaaaaaaaaaaaaaaaaaa.supabase.co",
  VITE_SUPABASE_PUBLISHABLE_KEY: `sb_publishable_${"a".repeat(20)}`,
  VITE_TURNSTILE_SITE_KEY: "1x00000000000000000000AA",
  VITE_VAPID_PUBLIC_KEY: `B${"a".repeat(86)}`,
};
const produccion = {
  VITE_SUPABASE_URL: "https://bbbbbbbbbbbbbbbbbbbb.supabase.co",
  VITE_SUPABASE_PUBLISHABLE_KEY: `sb_publishable_${"b".repeat(20)}`,
  VITE_TURNSTILE_SITE_KEY: "0x4AAAAAAAbbbbbbbbbbbbbb",
  VITE_VAPID_PUBLIC_KEY: `B${"b".repeat(86)}`,
  VITE_CONTACTO_PRIVACIDAD: "hola@ejemplo.com",
  VITE_SENTRY_DSN: "https://clave@o1.ingest.sentry.io/1",
};

describe("revisarVariables", () => {
  it("deja pasar unas variables de producción completas", () => {
    expect(revisarVariables(produccion, pruebas)).toEqual({ problemas: [], avisos: [] });
  });

  it("frena si alguna variable quedó con el valor de pruebas", () => {
    const { problemas } = revisarVariables(
      { ...produccion, ...pruebas, VITE_TURNSTILE_SITE_KEY: produccion.VITE_TURNSTILE_SITE_KEY },
      pruebas,
    );
    expect(problemas).toEqual([
      "VITE_SUPABASE_URL es la del proyecto de pruebas (.env.local)",
      "VITE_SUPABASE_PUBLISHABLE_KEY es la del proyecto de pruebas (.env.local)",
      "VITE_VAPID_PUBLIC_KEY es la del proyecto de pruebas (.env.local)",
    ]);
  });

  it("frena con las claves de prueba de Turnstile", () => {
    for (const clave of [
      "1x00000000000000000000AA",
      "2x00000000000000000000AB",
      "3x00000000000000000000FF",
    ]) {
      expect(revisarVariables({ ...produccion, VITE_TURNSTILE_SITE_KEY: clave }).problemas).toEqual(
        ["VITE_TURNSTILE_SITE_KEY es una clave de prueba de Cloudflare"],
      );
    }
  });

  it("frena si faltan las obligatorias", () => {
    expect(revisarVariables({}).problemas).toEqual([
      "falta VITE_SUPABASE_URL",
      "falta VITE_SUPABASE_PUBLISHABLE_KEY",
      "falta VITE_TURNSTILE_SITE_KEY",
      "falta VITE_VAPID_PUBLIC_KEY",
    ]);
  });

  it("frena una URL local o una clave que no es publicable", () => {
    const { problemas } = revisarVariables({
      ...produccion,
      VITE_SUPABASE_URL: "http://127.0.0.1:54321",
      VITE_SUPABASE_PUBLISHABLE_KEY: `sb_secret_${"x".repeat(20)}`,
    });
    expect(problemas).toEqual([
      "VITE_SUPABASE_URL no es la URL de un proyecto de Supabase en la nube",
      "VITE_SUPABASE_PUBLISHABLE_KEY no empieza con sb_publishable_",
    ]);
  });

  it("solo avisa si faltan el contacto y Sentry", () => {
    const { VITE_CONTACTO_PRIVACIDAD, VITE_SENTRY_DSN, ...sinOpcionales } = produccion;
    const resultado = revisarVariables(sinOpcionales, pruebas);
    expect(resultado.problemas).toEqual([]);
    expect(resultado.avisos).toHaveLength(2);
  });
});
