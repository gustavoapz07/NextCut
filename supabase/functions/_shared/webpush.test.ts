// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import {
  base64url,
  type ClavesVapid,
  cifrar,
  desdeBase64url,
  endpointPermitido,
  enviarPush,
  firmarVapid,
  interpretarRespuesta,
} from "./webpush.ts";

const texto = new TextEncoder();

// RFC 8291, apéndice A: el ejemplo completo de un aviso cifrado.
const RFC = {
  contenido: "When I grow up, I want to be a watermelon",
  servidor: {
    publica:
      "BP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A8",
    privada: "yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw",
  },
  navegador: {
    publica:
      "BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4",
    privada: "q1dXpw3UpT5VOmu_cf_v6ih07Aems3njxI-JWgLcM94",
  },
  sal: "DGv6ra1nlYgDCS1FRnbzlw",
  auth: "BTBZMqHH6r4Tts7J_aSIgg",
  cuerpo:
    "DGv6ra1nlYgDCS1FRnbzlwAAEABBBP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A_yl95bQpu6cVPTpK4Mqgkf1CXztLVBSt2Ks3oZwbuwXPXLWyouBWLVWGNWQexSgSxsj_Qulcy4a-fN",
};

async function hkdf(sal: Uint8Array, ikm: Uint8Array, info: Uint8Array, bits: number) {
  const llave = await crypto.subtle.importKey("raw", new Uint8Array(ikm), "HKDF", false, [
    "deriveBits",
  ]);
  return new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "HKDF", hash: "SHA-256", salt: new Uint8Array(sal), info: new Uint8Array(info) },
      llave,
      bits,
    ),
  );
}

/** Lo que hace el navegador al recibir el aviso: lo descifra con su clave privada. */
async function descifrar(
  cuerpo: Uint8Array,
  navegador: { publica: string; privada: string },
  auth: string,
) {
  const sal = cuerpo.slice(0, 16);
  const largoClave = cuerpo[20] ?? 0;
  const publicaServidor = cuerpo.slice(21, 21 + largoClave);
  const cifrado = cuerpo.slice(21 + largoClave);
  const publicaNavegador = desdeBase64url(navegador.publica);

  const privada = await crypto.subtle.importKey(
    "jwk",
    {
      kty: "EC",
      crv: "P-256",
      x: base64url(publicaNavegador.slice(1, 33)),
      y: base64url(publicaNavegador.slice(33, 65)),
      d: navegador.privada,
    },
    { name: "ECDH", namedCurve: "P-256" },
    false,
    ["deriveBits"],
  );
  const servidor = await crypto.subtle.importKey(
    "raw",
    publicaServidor,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    [],
  );
  const ecdh = new Uint8Array(
    await crypto.subtle.deriveBits({ name: "ECDH", public: servidor }, privada, 256),
  );
  const info = new Uint8Array([
    ...texto.encode("WebPush: info"),
    0,
    ...publicaNavegador,
    ...publicaServidor,
  ]);
  const ikm = await hkdf(desdeBase64url(auth), ecdh, info, 256);
  const cek = await hkdf(sal, ikm, texto.encode("Content-Encoding: aes128gcm\0"), 128);
  const nonce = await hkdf(sal, ikm, texto.encode("Content-Encoding: nonce\0"), 96);
  const llave = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["decrypt"]);
  const claro = new Uint8Array(
    await crypto.subtle.decrypt({ name: "AES-GCM", iv: nonce }, llave, cifrado),
  );
  // Quita el relleno y el delimitador 0x02 del último registro.
  let fin = claro.length - 1;
  while (fin > 0 && claro[fin] === 0) fin--;
  expect(claro[fin]).toBe(2);
  return new TextDecoder().decode(claro.slice(0, fin));
}

async function nuevoPar() {
  const par = (await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, [
    "sign",
    "verify",
  ])) as CryptoKeyPair;
  const publica = base64url(new Uint8Array(await crypto.subtle.exportKey("raw", par.publicKey)));
  const jwk = await crypto.subtle.exportKey("jwk", par.privateKey);
  return { publica, privada: jwk.d ?? "", llavePublica: par.publicKey };
}

const ENDPOINT = "https://fcm.googleapis.com/fcm/send/abc123:APA91bHuno";

describe("base64url", () => {
  it("va y vuelve sin relleno ni + ni /", () => {
    const bytes = new Uint8Array([251, 255, 0, 1, 2, 62, 63]);
    const codificado = base64url(bytes);
    expect(codificado).not.toMatch(/[+/=]/);
    expect(Array.from(desdeBase64url(codificado))).toEqual(Array.from(bytes));
  });
});

describe("cifrar (RFC 8291)", () => {
  it("da exactamente el cuerpo del ejemplo de la RFC", async () => {
    const cuerpo = await cifrar(
      texto.encode(RFC.contenido),
      { p256dh: RFC.navegador.publica, auth: RFC.auth },
      { sal: desdeBase64url(RFC.sal), efimera: RFC.servidor },
    );
    expect(base64url(cuerpo)).toBe(RFC.cuerpo);
  });

  it("el navegador descifra el ejemplo de la RFC con su clave privada", async () => {
    expect(await descifrar(desdeBase64url(RFC.cuerpo), RFC.navegador, RFC.auth)).toBe(
      RFC.contenido,
    );
  });

  it("con claves nuevas, el navegador recupera el aviso con tildes y emojis", async () => {
    const navegador = await nuevoPar();
    const auth = base64url(crypto.getRandomValues(new Uint8Array(16)));
    const aviso = JSON.stringify({ titulo: "¡Te toca! · Turno #9", cuerpo: "Óscar ✂️ silla 1" });
    const cuerpo = await cifrar(texto.encode(aviso), { p256dh: navegador.publica, auth });

    // Sal y clave nuevas en cada aviso: dos cifrados del mismo texto no se parecen.
    const otro = await cifrar(texto.encode(aviso), { p256dh: navegador.publica, auth });
    expect(base64url(cuerpo.slice(0, 16))).not.toBe(base64url(otro.slice(0, 16)));
    expect(new DataView(cuerpo.buffer).getUint32(16)).toBe(4096);
    expect(await descifrar(cuerpo, navegador, auth)).toBe(aviso);
  });

  it("rechaza claves del navegador con el largo equivocado", async () => {
    await expect(cifrar(texto.encode("hola"), { p256dh: "AAAA", auth: RFC.auth })).rejects.toThrow(
      "suscripcion_invalida",
    );
    await expect(
      cifrar(texto.encode("hola"), { p256dh: RFC.navegador.publica, auth: "AAAA" }),
    ).rejects.toThrow("suscripcion_invalida");
  });

  it("no cifra un aviso que el servicio de push rechazaría por grande", async () => {
    await expect(
      cifrar(new Uint8Array(4000), { p256dh: RFC.navegador.publica, auth: RFC.auth }),
    ).rejects.toThrow("contenido_muy_grande");
  });
});

describe("firmarVapid (RFC 8292)", () => {
  it("firma un JWT ES256 para el origen del servicio, que se verifica con la clave pública", async () => {
    const par = await nuevoPar();
    const jwt = await firmarVapid(ENDPOINT, "https://nextcut.example", par, 1_800_000_000);
    const [encabezado = "", datos = "", firma = ""] = jwt.split(".");

    const leer = (parte: string) => JSON.parse(new TextDecoder().decode(desdeBase64url(parte)));
    expect(leer(encabezado)).toEqual({ typ: "JWT", alg: "ES256" });
    expect(leer(datos)).toEqual({
      aud: "https://fcm.googleapis.com",
      exp: 1_800_000_000,
      sub: "https://nextcut.example",
    });
    expect(desdeBase64url(firma)).toHaveLength(64);
    const valida = await crypto.subtle.verify(
      { name: "ECDSA", hash: "SHA-256" },
      par.llavePublica,
      desdeBase64url(firma),
      texto.encode(`${encabezado}.${datos}`),
    );
    expect(valida).toBe(true);
  });
});

describe("endpointPermitido", () => {
  it.each([
    "https://fcm.googleapis.com/fcm/send/abc",
    "https://updates.push.services.mozilla.com/wpush/v2/abc",
    "https://web.push.apple.com/QGuQyavXutnMH",
    "https://wns2-par02p.notify.windows.com/w/?token=abc",
  ])("acepta %s", (endpoint) => {
    expect(endpointPermitido(endpoint)).toBe(true);
  });

  it.each([
    "http://fcm.googleapis.com/fcm/send/abc",
    "https://fcm.googleapis.com.ataque.com/abc",
    "https://ataque.com/fcm.googleapis.com",
    "https://fcm.googleapis.com:8443/abc",
    "https://usuario@fcm.googleapis.com/abc",
    "https://169.254.169.254/latest/meta-data",
    "https://localhost/push",
    `https://fcm.googleapis.com/${"a".repeat(1000)}`,
    "esto no es una url",
  ])("rechaza %s", (endpoint) => {
    expect(endpointPermitido(endpoint)).toBe(false);
  });
});

describe("enviarPush", () => {
  const opciones = {
    sujeto: "https://nextcut.example",
    ttl: 600,
    urgencia: "high" as const,
    ahora: new Date("2026-10-31T15:00:00Z"),
  };

  async function preparar() {
    const vapid: ClavesVapid & { llavePublica: CryptoKey } = await nuevoPar();
    const navegador = await nuevoPar();
    const auth = base64url(crypto.getRandomValues(new Uint8Array(16)));
    return {
      vapid,
      navegador,
      auth,
      suscripcion: { endpoint: ENDPOINT, p256dh: navegador.publica, auth },
    };
  }

  it("manda el aviso cifrado con VAPID, TTL y urgencia", async () => {
    const { vapid, navegador, auth, suscripcion } = await preparar();
    const pedir = vi.fn(async () => new Response(null, { status: 201 }));

    const resultado = await enviarPush(pedir, suscripcion, '{"titulo":"Hola"}', vapid, opciones);

    expect(resultado).toEqual({ tipo: "enviado" });
    expect(pedir).toHaveBeenCalledTimes(1);
    const [url, init] = pedir.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(ENDPOINT);
    const encabezados = init.headers as Record<string, string>;
    expect(encabezados["Content-Encoding"]).toBe("aes128gcm");
    expect(encabezados.TTL).toBe("600");
    expect(encabezados.Urgency).toBe("high");
    expect(encabezados.Authorization).toMatch(
      new RegExp(`^vapid t=[\\w-]+\\.[\\w-]+\\.[\\w-]+, k=${vapid.publica}$`),
    );
    // El JWT vence 12 horas después.
    const jwt = encabezados.Authorization?.slice(8).split(",")[0] ?? "";
    const datos = JSON.parse(new TextDecoder().decode(desdeBase64url(jwt.split(".")[1] ?? "")));
    expect(datos.exp).toBe(Date.parse("2026-10-31T15:00:00Z") / 1000 + 12 * 3600);
    expect(await descifrar(init.body as Uint8Array, navegador, auth)).toBe('{"titulo":"Hola"}');
  });

  it("no le pega a un endpoint que no es de un servicio de push", async () => {
    const { vapid, suscripcion } = await preparar();
    const pedir = vi.fn(async () => new Response(null, { status: 201 }));
    const resultado = await enviarPush(
      pedir,
      { ...suscripcion, endpoint: "https://ataque.com/push" },
      "{}",
      vapid,
      opciones,
    );
    expect(resultado.tipo).toBe("rechazado");
    expect(pedir).not.toHaveBeenCalled();
  });

  it("sin red pide reintentar", async () => {
    const { vapid, suscripcion } = await preparar();
    const pedir = vi.fn(async () => {
      throw new TypeError("fetch failed");
    });
    expect(await enviarPush(pedir, suscripcion, "{}", vapid, opciones)).toEqual({
      tipo: "reintentar",
      estado: null,
    });
  });

  it.each([
    [201, "enviado"],
    [202, "enviado"],
    [404, "vencida"],
    [410, "vencida"],
    [429, "reintentar"],
    [503, "reintentar"],
    [400, "rechazado"],
    [403, "rechazado"],
    [413, "rechazado"],
  ] as const)("una respuesta %i es %s", (estado, tipo) => {
    expect(interpretarRespuesta(estado).tipo).toBe(tipo);
  });
});
