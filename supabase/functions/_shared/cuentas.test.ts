// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { claveTemporal, type Dependencias, manejarCuentas } from "./cuentas";

const ADMIN = "a0000000-0000-4000-8000-000000000001";
const NUEVA = "c0000000-0000-4000-8000-000000000002";
const BARBERO = "b0000000-0000-4000-8000-000000000003";
const BARBERIA = "e0000000-0000-4000-8000-000000000004";
const TOKEN = "aaa.bbb.ccc";

type Rpc = { data: unknown; error: { message: string } | null };

function deps(rpc: Record<string, Rpc> = {}, cambios: Partial<Dependencias> = {}) {
  const llamadas: Array<[string, Record<string, unknown>]> = [];
  const d: Dependencias = {
    configurado: true,
    origenes: ["https://nextcut.test"],
    usuarioDelToken: async (token) => (token === TOKEN ? ADMIN : null),
    crearCuenta: vi.fn(async () => ({ data: { id: NUEVA }, error: null })),
    cambiarClave: vi.fn(async () => ({ error: null })),
    borrarCuenta: vi.fn(async () => undefined),
    rpc: async (funcion, argumentos) => {
      llamadas.push([funcion, argumentos]);
      return rpc[funcion] ?? { data: null, error: null };
    },
    claveTemporal: () => "abcd-2345-wxyz",
    ...cambios,
  };
  return { d, llamadas };
}

const pedir = (cuerpo: unknown, token: string | null = TOKEN) =>
  new Request("https://ejemplo.test/functions/v1/cuentas", {
    method: "POST",
    headers: {
      origin: "https://nextcut.test",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(cuerpo),
  });

const altaValida = {
  accion: "crear_barberia",
  nombre: "  Barbería   Don Juan ",
  slug: "don-juan",
  zona: null,
  correoDueno: " Juan@Ejemplo.com ",
};

describe("claveTemporal", () => {
  it("da tres grupos de 4, con letras y números y sin caracteres confusos", () => {
    for (let i = 0; i < 200; i++) {
      const clave = claveTemporal();
      expect(clave).toMatch(/^[a-z2-9]{4}-[a-z2-9]{4}-[a-z2-9]{4}$/);
      expect(clave).toMatch(/[0-9]/);
      expect(clave).toMatch(/[a-z]/);
      expect(clave).not.toMatch(/[01ilo]/);
    }
  });

  it("vuelve a sortear si salen solo letras", () => {
    let vuelta = 0;
    // Primero bytes que dan solo "a" (0 % 31); después, bytes que incluyen números.
    const azar = (n: number) =>
      vuelta++ === 0
        ? new Uint8Array(n)
        : Uint8Array.from({ length: n }, (_, i) => (i % 2 ? 23 : 0));
    expect(claveTemporal(azar)).toBe("a2a2-a2a2-a2a2");
  });
});

describe("cuentas", () => {
  it("sin sesión responde 401 y no toca nada", async () => {
    const { d, llamadas } = deps();
    const respuesta = await manejarCuentas(pedir(altaValida, null), d);
    expect(respuesta.status).toBe(401);
    expect(llamadas).toEqual([]);
    expect(d.crearCuenta).not.toHaveBeenCalled();
  });

  it("la clave publicable (que no es un JWT) cuenta como sin sesión", async () => {
    const { d } = deps();
    const respuesta = await manejarCuentas(pedir(altaValida, "sb_publishable_abc"), d);
    expect(respuesta.status).toBe(401);
  });

  it("con datos inválidos responde 400", async () => {
    const { d } = deps();
    const respuesta = await manejarCuentas(pedir({ ...altaValida, slug: "Don Juan" }), d);
    expect(respuesta.status).toBe(400);
    expect(await respuesta.json()).toEqual({ error: "datos_invalidos" });
  });

  it("el admin da de alta una barbería con un dueño nuevo y recibe la clave una vez", async () => {
    const { d, llamadas } = deps({ alta_barberia: { data: { slug: "don-juan" }, error: null } });
    const respuesta = await manejarCuentas(pedir(altaValida), d);
    expect(respuesta.status).toBe(200);
    expect(respuesta.headers.get("Cache-Control")).toBe("no-store");
    expect(await respuesta.json()).toEqual({
      slug: "don-juan",
      correo: "juan@ejemplo.com",
      clave: "abcd-2345-wxyz",
    });
    expect(d.crearCuenta).toHaveBeenCalledWith("juan@ejemplo.com", "abcd-2345-wxyz");
    expect(llamadas.map(([f]) => f)).toEqual([
      "admin_puede_crear",
      "cuenta_por_correo",
      "alta_barberia",
    ]);
    // El id de quien pide sale del token, y el nombre llega limpio.
    expect(llamadas[2]?.[1]).toMatchObject({
      p_admin: ADMIN,
      p_nombre: "Barbería Don Juan",
      p_dueno: NUEVA,
    });
  });

  it("si el correo ya tiene cuenta, la reusa sin cambiarle la clave", async () => {
    const { d } = deps({ cuenta_por_correo: { data: NUEVA, error: null } });
    const respuesta = await manejarCuentas(pedir(altaValida), d);
    expect(await respuesta.json()).toMatchObject({ clave: null });
    expect(d.crearCuenta).not.toHaveBeenCalled();
  });

  it("quien no es admin no crea ninguna cuenta", async () => {
    const { d } = deps({ admin_puede_crear: { data: null, error: { message: "sin_permiso" } } });
    const respuesta = await manejarCuentas(pedir(altaValida), d);
    expect(respuesta.status).toBe(403);
    expect(d.crearCuenta).not.toHaveBeenCalled();
  });

  it("si el alta falla, borra la cuenta que acababa de crear", async () => {
    const { d } = deps({ alta_barberia: { data: null, error: { message: "slug_en_uso" } } });
    const respuesta = await manejarCuentas(pedir(altaValida), d);
    expect(respuesta.status).toBe(409);
    expect(await respuesta.json()).toEqual({ error: "slug_en_uso" });
    expect(d.borrarCuenta).toHaveBeenCalledWith(NUEVA);
  });

  it("el dueño le crea la cuenta a un barbero y la liga a su silla", async () => {
    const { d, llamadas } = deps();
    const respuesta = await manejarCuentas(
      pedir({ accion: "crear_cuenta_barbero", barberoId: BARBERO, correo: "kevin@ejemplo.com" }),
      d,
    );
    expect(respuesta.status).toBe(200);
    expect(await respuesta.json()).toEqual({
      correo: "kevin@ejemplo.com",
      clave: "abcd-2345-wxyz",
    });
    expect(llamadas.map(([f]) => f)).toEqual(["dueno_puede_ligar", "ligar_cuenta_barbero"]);
    expect(llamadas[1]?.[1]).toEqual({ p_dueno: ADMIN, p_barbero: BARBERO, p_cuenta: NUEVA });
  });

  it("un correo que ya tiene cuenta no se liga a un barbero", async () => {
    const { d } = deps(
      {},
      {
        crearCuenta: vi.fn(async () => ({
          data: null,
          error: { code: "email_exists", message: "already registered" },
        })),
      },
    );
    const respuesta = await manejarCuentas(
      pedir({ accion: "crear_cuenta_barbero", barberoId: BARBERO, correo: "kevin@ejemplo.com" }),
      d,
    );
    expect(respuesta.status).toBe(409);
    expect(await respuesta.json()).toEqual({ error: "correo_en_uso" });
  });

  it("si la base no deja ligar la cuenta, la borra", async () => {
    const { d } = deps({
      ligar_cuenta_barbero: { data: null, error: { message: "barbero_con_cuenta" } },
    });
    const respuesta = await manejarCuentas(
      pedir({ accion: "crear_cuenta_barbero", barberoId: BARBERO, correo: "kevin@ejemplo.com" }),
      d,
    );
    expect(await respuesta.json()).toEqual({ error: "barbero_con_cuenta" });
    expect(d.borrarCuenta).toHaveBeenCalledWith(NUEVA);
  });

  it.each([
    [
      { accion: "restablecer_barbero", barberoId: BARBERO },
      { p_barbero: BARBERO, p_barberia: null },
    ],
    [
      { accion: "restablecer_dueno", barberiaId: BARBERIA },
      { p_barbero: null, p_barberia: BARBERIA },
    ],
  ])("restablece la contraseña de la cuenta que permite la base (%o)", async (cuerpo, args) => {
    const { d, llamadas } = deps({ cuenta_para_restablecer: { data: NUEVA, error: null } });
    const respuesta = await manejarCuentas(pedir(cuerpo), d);
    expect(await respuesta.json()).toEqual({ clave: "abcd-2345-wxyz" });
    expect(llamadas[0]?.[1]).toEqual({ p_quien: ADMIN, ...args });
    expect(d.cambiarClave).toHaveBeenCalledWith(NUEVA, "abcd-2345-wxyz");
  });

  it("no restablece nada si la base dice que no", async () => {
    const { d } = deps({
      cuenta_para_restablecer: { data: null, error: { message: "sin_permiso" } },
    });
    const respuesta = await manejarCuentas(
      pedir({ accion: "restablecer_barbero", barberoId: BARBERO }),
      d,
    );
    expect(respuesta.status).toBe(403);
    expect(d.cambiarClave).not.toHaveBeenCalled();
  });

  it("solo responde CORS a los orígenes permitidos", async () => {
    const { d } = deps();
    const opciones = await manejarCuentas(
      new Request("https://ejemplo.test", {
        method: "OPTIONS",
        headers: { origin: "https://otro.test" },
      }),
      d,
    );
    expect(opciones.status).toBe(204);
    expect(opciones.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });
});
