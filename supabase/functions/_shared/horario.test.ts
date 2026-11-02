// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  abiertaEn,
  cierreDeHoy,
  esquemaHorario,
  HORARIO_INICIAL,
  type Horario,
  horaLegible,
  momentoEn,
  textoApertura,
} from "./horario";

// Tegucigalpa está en UTC-6 todo el año. El 2 de noviembre de 2026 es lunes.
const ZONA = "America/Tegucigalpa";
const utc = (iso: string) => new Date(`${iso}Z`);

const SOLO_LUNES: Horario = {
  "1": { abre: "09:00", cierra: "12:00" },
  "2": null,
  "3": null,
  "4": null,
  "5": null,
  "6": null,
  "7": null,
};

describe("esquemaHorario", () => {
  it("un día que falta cuenta como cerrado", () => {
    expect(esquemaHorario.parse({ "1": { abre: "09:00", cierra: "19:00" } })).toEqual({
      ...SOLO_LUNES,
      "1": { abre: "09:00", cierra: "19:00" },
    });
  });

  it.each([
    ["una hora sin formato", { "1": { abre: "9:00", cierra: "19:00" } }],
    ["cerrar antes de abrir", { "1": { abre: "19:00", cierra: "09:00" } }],
    ["una hora vacía", { "1": { abre: "", cierra: "19:00" } }],
    ["un día que no existe", { "8": null }],
    ["un campo de más", { "1": { abre: "09:00", cierra: "19:00", nota: "x" } }],
  ])("rechaza %s", (_caso, horario) => {
    expect(esquemaHorario.safeParse(horario).success).toBe(false);
  });
});

describe("momentoEn", () => {
  it("da el día y la hora en la zona de la barbería", () => {
    expect(momentoEn(utc("2026-11-02T15:30:00"), ZONA)).toEqual({ dia: "1", hora: "09:30" });
    // A medianoche dice 00:00, no 24:00.
    expect(momentoEn(utc("2026-11-03T06:00:00"), ZONA)).toEqual({ dia: "2", hora: "00:00" });
    // A las 23:30 del domingo en UTC todavía es domingo allá.
    expect(momentoEn(utc("2026-11-08T23:30:00"), ZONA)).toEqual({ dia: "7", hora: "17:30" });
  });
});

describe("abiertaEn", () => {
  it("sin horario siempre está abierta", () => {
    expect(abiertaEn(null, utc("2026-11-08T08:00:00"), ZONA)).toBe(true);
  });

  it.each([
    ["el lunes a las 8:59", "2026-11-02T14:59:00", false],
    ["el lunes a las 9:00", "2026-11-02T15:00:00", true],
    ["el lunes a las 18:59", "2026-11-03T00:59:00", true],
    ["el lunes a las 19:00", "2026-11-03T01:00:00", false],
    ["el domingo a mediodía", "2026-11-08T18:00:00", false],
  ])("%s", (_caso, momento, abierta) => {
    expect(abiertaEn(HORARIO_INICIAL, utc(momento), ZONA)).toBe(abierta);
  });
});

describe("textoApertura", () => {
  it.each([
    ["antes de abrir, abre hoy", HORARIO_INICIAL, "2026-11-02T13:00:00", "Abre hoy"],
    ["después de cerrar, abre mañana", HORARIO_INICIAL, "2026-11-03T02:00:00", "Abre mañana"],
    [
      "el sábado en la noche, abre el lunes",
      HORARIO_INICIAL,
      "2026-11-08T02:00:00",
      "Abre el lunes",
    ],
    [
      "si solo abre el lunes y ya abrió, el otro lunes",
      SOLO_LUNES,
      "2026-11-02T16:00:00",
      "Abre el lunes",
    ],
  ])("%s", (_caso, horario, momento, inicio) => {
    expect(textoApertura(horario, utc(momento), ZONA)).toBe(`${inicio} a las 9:00 a. m.`);
  });

  it("sin días de atención lo dice", () => {
    const cerrado: Horario = { ...SOLO_LUNES, "1": null };
    expect(textoApertura(cerrado, utc("2026-11-02T16:00:00"), ZONA)).toBe(
      "Por ahora no tiene días de atención.",
    );
  });
});

describe("cierreDeHoy", () => {
  it("dice a qué hora cierra solo si ahora está abierta", () => {
    expect(cierreDeHoy(HORARIO_INICIAL, utc("2026-11-02T16:00:00"), ZONA)).toBe("7:00 p. m.");
    expect(cierreDeHoy(HORARIO_INICIAL, utc("2026-11-03T02:00:00"), ZONA)).toBeNull();
    expect(cierreDeHoy(null, utc("2026-11-02T16:00:00"), ZONA)).toBeNull();
  });
});

describe("horaLegible", () => {
  it.each([
    ["00:15", "12:15 a. m."],
    ["09:00", "9:00 a. m."],
    ["12:00", "12:00 p. m."],
    ["19:30", "7:30 p. m."],
  ])("%s → %s", (hhmm, texto) => {
    expect(horaLegible(hhmm)).toBe(texto);
  });
});
