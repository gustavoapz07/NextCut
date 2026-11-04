// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buscarSecretos, leerEnv } from "./revisar-build.mjs";

// Las claves falsas se arman al correr, para que gitleaks no las confunda con claves reales.
const falsa = (prefijo) => `${prefijo}${"x".repeat(24)}`;
const jwt = (cuerpo) =>
  `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify(cuerpo)).toString("base64url")}.firma_falsa`;

describe("buscarSecretos", () => {
  it("no confunde el chequeo de prefijo de supabase-js con una clave", () => {
    const deSupabaseJs =
      "Ki=e=>e.startsWith(`sb_publishable_`)||e.startsWith(`sb_secret_`),qi=`sb_temp_`";
    expect(buscarSecretos(deSupabaseJs)).toEqual([]);
  });

  it("encuentra una clave secreta de Supabase", () => {
    expect(buscarSecretos(`const k="${falsa("sb_secret_")}"`)).toEqual([
      "clave secreta de Supabase",
    ]);
  });

  it("deja pasar la clave publicable", () => {
    expect(buscarSecretos(`const k="${falsa("sb_publishable_")}"`)).toEqual([]);
  });

  it("encuentra un JWT de service_role y deja pasar uno anónimo", () => {
    expect(buscarSecretos(`x="${jwt({ role: "service_role" })}"`)).toEqual([
      "JWT con rol service_role",
    ]);
    expect(buscarSecretos(`x="${jwt({ role: "anon" })}"`)).toEqual([]);
  });

  it("encuentra una llave privada PEM", () => {
    expect(buscarSecretos(`-----BEGIN EC ${"PRIVATE"} KEY-----`)).toEqual(["llave privada PEM"]);
  });

  it("encuentra el valor de una variable secreta sin mostrarlo", () => {
    const valores = [{ nombre: "TURNSTILE_SECRET", valor: "0x4AAAAsecretodeprueba" }];
    expect(buscarSecretos("a=`0x4AAAAsecretodeprueba`", valores)).toEqual([
      "valor de TURNSTILE_SECRET",
    ]);
  });

  it("ignora valores muy cortos, que aparecerían por casualidad", () => {
    expect(buscarSecretos("let a=true", [{ nombre: "FLAG", valor: "true" }])).toEqual([]);
  });
});

describe("leerEnv", () => {
  it("lee nombres y valores, con o sin comillas, y salta comentarios", () => {
    const env = "# comentario\nVITE_X=publico\nE2E_CLAVE=\"secreta 123\"\nexport OTRA='y'\n\n";
    expect(leerEnv(env)).toEqual([
      { nombre: "VITE_X", valor: "publico" },
      { nombre: "E2E_CLAVE", valor: "secreta 123" },
      { nombre: "OTRA", valor: "y" },
    ]);
  });
});
