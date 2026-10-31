import { describe, expect, it } from "vitest";
import { cambiosEntre, type DatosConfig, validar } from "./configuracion";

/** El elemento i de la lista; la prueba falla si no existe. */
function en<T>(lista: T[], i: number): T {
  const elemento = lista[i];
  if (elemento === undefined) throw new Error(`Falta el elemento ${i}`);
  return elemento;
}

function datos(): DatosConfig {
  return {
    barberia: {
      id: "b1",
      nombre: "Barbería Prueba",
      slug: "barberia-prueba",
      zona: "Centro",
      max_fila: 20,
      tolerancia_min: 5,
    },
    barberos: [
      { clave: "c", id: "c", nombre: "Carlos", apodo: "", silla: 1, activo: true, conCuenta: true },
      {
        clave: "j",
        id: "j",
        nombre: "Jorge",
        apodo: "El Profe",
        silla: 2,
        activo: true,
        conCuenta: false,
      },
    ],
    servicios: [
      { clave: "s1", id: "s1", nombre: "Corte", duracion_min: 30, precio_ref: 150, activo: true },
    ],
  };
}

describe("cambiosEntre", () => {
  it("sin cambios no hay nada que guardar", () => {
    expect(cambiosEntre(datos(), datos())).toEqual([]);
  });

  it("solo manda los campos que cambiaron, con el texto limpio", () => {
    const borrador = datos();
    borrador.barberia.nombre = "  La   Navaja ";
    borrador.barberia.tolerancia_min = 8;
    borrador.servicios[0] = { ...en(borrador.servicios, 0), duracion_min: 35 };
    expect(cambiosEntre(datos(), borrador)).toEqual([
      { tipo: "barberia", cambios: { nombre: "La Navaja", tolerancia_min: 8 } },
      { tipo: "servicio", id: "s1", cambios: { duracion_min: 35 } },
    ]);
  });

  it("un espacio de más no cuenta como cambio", () => {
    const borrador = datos();
    borrador.barberos[0] = { ...en(borrador.barberos, 0), nombre: "Carlos " };
    expect(cambiosEntre(datos(), borrador)).toEqual([]);
  });

  it("los nuevos se insertan y quitar uno guardado lo deja inactivo", () => {
    const borrador = datos();
    borrador.barberos.push({
      clave: "nuevo-1",
      id: null,
      nombre: "Kevin",
      apodo: "",
      silla: 3,
      activo: true,
      conCuenta: false,
    });
    borrador.servicios[0] = { ...en(borrador.servicios, 0), activo: false };
    borrador.servicios.push({
      clave: "nuevo-2",
      id: null,
      nombre: "Barba",
      duracion_min: 15,
      precio_ref: 100,
      activo: true,
    });
    expect(cambiosEntre(datos(), borrador)).toEqual([
      { tipo: "barbero_nuevo", datos: { nombre: "Kevin", apodo: "", silla: 3, activo: true } },
      { tipo: "servicio", id: "s1", cambios: { activo: false } },
      {
        tipo: "servicio_nuevo",
        datos: { nombre: "Barba", duracion_min: 15, precio_ref: 100, activo: true },
      },
    ]);
  });
});

describe("validar", () => {
  it("acepta la configuración de ejemplo", () => {
    expect(validar(datos())).toBeNull();
  });

  it.each([
    [
      "un barbero sin nombre",
      (d: DatosConfig) => {
        en(d.barberos, 0).nombre = " ";
      },
      /el nombre lleva entre 2 y 40 letras/,
    ],
    [
      "dos barberos en la misma silla",
      (d: DatosConfig) => {
        en(d.barberos, 1).silla = 1;
      },
      /misma silla/,
    ],
    [
      "un servicio de 3 minutos",
      (d: DatosConfig) => {
        en(d.servicios, 0).duracion_min = 3;
      },
      /dura de 5 a 240 minutos/,
    ],
    [
      "sin ningún servicio activo",
      (d: DatosConfig) => {
        en(d.servicios, 0).activo = false;
      },
      /al menos un servicio activo/,
    ],
    [
      "una zona de más de 80 letras",
      (d: DatosConfig) => {
        d.barberia.zona = "x".repeat(81);
      },
      /la zona hasta 80/,
    ],
  ])("rechaza %s", (_caso, cambiar, mensaje) => {
    const d = datos();
    cambiar(d);
    expect(validar(d)).toMatch(mensaje);
  });

  it("un barbero inactivo puede repetir silla", () => {
    const d = datos();
    d.barberos[1] = { ...en(d.barberos, 1), silla: 1, activo: false };
    expect(validar(d)).toBeNull();
  });
});
