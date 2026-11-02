// @vitest-environment node
import { describe, expect, it } from "vitest";
import { type DependenciasSalud, manejarSalud } from "./salud";

const HORA = new Date("2026-11-02T15:00:00Z");

function deps(estadoBase: DependenciasSalud["estadoBase"], esperaMs = 50): DependenciasSalud {
  return { estadoBase, ahora: () => HORA, esperaMs };
}
const responde =
  (data: unknown, error: unknown = null) =>
  async () => ({ data, error });
const pedir = (metodo = "GET") =>
  new Request("https://ejemplo.test/functions/v1/salud", { method: metodo });

describe("salud", () => {
  it("con la base y el reloj al día responde 200", async () => {
    const respuesta = await manejarSalud(pedir(), deps(responde({ base: true, tareas: true })));
    expect(respuesta.status).toBe(200);
    expect(respuesta.headers.get("Cache-Control")).toBe("no-store");
    expect(await respuesta.json()).toEqual({
      estado: "ok",
      base: "ok",
      tareas: "ok",
      hora: "2026-11-02T15:00:00.000Z",
    });
  });

  it("si el reloj de pg_cron se detuvo responde 503, aunque la base conteste", async () => {
    const respuesta = await manejarSalud(pedir(), deps(responde({ base: true, tareas: false })));
    expect(respuesta.status).toBe(503);
    expect(await respuesta.json()).toMatchObject({
      estado: "falla",
      base: "ok",
      tareas: "atrasadas",
    });
  });

  it.each([
    ["un error de la base", responde(null, { message: "connection refused" })],
    ["una respuesta rara", responde({ base: "sí" })],
    [
      "una excepción",
      async () => {
        throw new Error("sin red");
      },
    ],
  ])("con %s responde 503 sin contar el detalle", async (_caso, estadoBase) => {
    const respuesta = await manejarSalud(pedir(), deps(estadoBase));
    expect(respuesta.status).toBe(503);
    const texto = await respuesta.text();
    expect(JSON.parse(texto)).toMatchObject({ estado: "falla", base: "falla", tareas: "falla" });
    expect(texto).not.toMatch(/connection|sin red/);
  });

  it("si la base tarda demasiado, no se queda esperando", async () => {
    const nunca = () => new Promise<{ data: unknown; error: unknown }>(() => {});
    const inicio = Date.now();
    const respuesta = await manejarSalud(pedir(), deps(nunca, 50));
    expect(respuesta.status).toBe(503);
    expect(Date.now() - inicio).toBeLessThan(1000);
  });

  it("HEAD da el mismo estado sin cuerpo, para el monitor", async () => {
    const sana = await manejarSalud(pedir("HEAD"), deps(responde({ base: true, tareas: true })));
    expect(sana.status).toBe(200);
    expect(await sana.text()).toBe("");
    const caida = await manejarSalud(pedir("HEAD"), deps(responde(null, { message: "x" })));
    expect(caida.status).toBe(503);
  });

  it("no acepta otros métodos", async () => {
    const respuesta = await manejarSalud(
      pedir("POST"),
      deps(responde({ base: true, tareas: true })),
    );
    expect(respuesta.status).toBe(405);
    expect(respuesta.headers.get("Allow")).toBe("GET, HEAD");
  });
});
