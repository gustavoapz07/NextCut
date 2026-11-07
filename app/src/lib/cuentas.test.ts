import { describe, expect, it, vi } from "vitest";

// Sin conexión real: en la CI no hay variables de Supabase y estas pruebas no la necesitan.
vi.mock("@/lib/supabase", () => ({ supabase: {} }));

import { mensajeDeAcceso } from "@/components/ClaveTemporal";
import { destinoAlEntrar } from "@/features/acceso/Entrar";
import { debeCambiarClave, problemaClave, slugDe } from "./cuentas";

describe("slugDe", () => {
  it.each([
    ["Barbería Don Juan", "barberia-don-juan"],
    ["  El   Corte Fino!! ", "el-corte-fino"],
    ["Ñañas & Co.", "nanas-co"],
    ["a".repeat(60), "a".repeat(40)],
  ])("%s → %s", (nombre, slug) => {
    expect(slugDe(nombre)).toBe(slug);
  });

  it("no termina en guion aunque corte a los 40", () => {
    expect(slugDe(`${"a".repeat(39)} b`)).toBe("a".repeat(39));
  });
});

describe("problemaClave", () => {
  it("pide 10 caracteres, letras y números, y que coincidan", () => {
    expect(problemaClave("abc123", "abc123")).toMatch(/10/);
    expect(problemaClave("abcdefghijk", "abcdefghijk")).toMatch(/números/);
    expect(problemaClave("1234567890", "1234567890")).toMatch(/letras/);
    expect(problemaClave("navaja2026x", "navaja2026y")).toMatch(/coinciden/);
    expect(problemaClave("navaja2026x", "navaja2026x")).toBeNull();
  });
});

describe("debeCambiarClave", () => {
  it("solo con la marca de contraseña temporal", () => {
    const usuario = (meta: object) => ({ user_metadata: meta }) as never;
    expect(debeCambiarClave(usuario({ cambiar_clave: true }))).toBe(true);
    expect(debeCambiarClave(usuario({ cambiar_clave: false }))).toBe(false);
    expect(debeCambiarClave(usuario({}))).toBe(false);
    expect(debeCambiarClave(null)).toBe(false);
  });
});

describe("mensajeDeAcceso", () => {
  it("trae la dirección, el correo y la contraseña temporal", () => {
    const mensaje = mensajeDeAcceso("kevin@ejemplo.com", "abcd-2345-wxyz", "https://nextcut.test");
    expect(mensaje).toContain("https://nextcut.test/entrar");
    expect(mensaje).toContain("Correo: kevin@ejemplo.com");
    expect(mensaje).toContain("Contraseña temporal: abcd-2345-wxyz");
  });

  it("al restablecer, recuerda que el correo es el de siempre", () => {
    expect(mensajeDeAcceso(null, "abcd-2345-wxyz", "https://x.test")).toContain(
      "Correo: el de siempre",
    );
  });
});

describe("destinoAlEntrar", () => {
  it("acepta el panel del admin", () => {
    expect(destinoAlEntrar("/admin")).toBe("/admin");
    expect(destinoAlEntrar("/admin/../b")).toBe("/panel");
  });
});
