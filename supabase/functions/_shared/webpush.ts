// Web Push sin dependencias, solo con WebCrypto: cifrado aes128gcm (RFC 8291) y firma VAPID
// (RFC 8292). Lo usa la Edge Function `avisos` (Deno) y se prueba con Vitest contra el ejemplo
// de la RFC 8291. El servicio de push (Google, Apple, Mozilla, Microsoft) no puede leer el aviso.

export interface SuscripcionPush {
  endpoint: string;
  /** Clave pública del navegador: punto P-256 sin comprimir (65 bytes) en base64url. */
  p256dh: string;
  /** Secreto de autenticación del navegador (16 bytes) en base64url. */
  auth: string;
}

export interface ClavesVapid {
  /** Punto P-256 sin comprimir (65 bytes) en base64url. Es la que usa el navegador. */
  publica: string;
  /** Escalar privado `d` (32 bytes) en base64url. Solo vive en los secretos de Supabase. */
  privada: string;
}

type Bytes = Uint8Array<ArrayBuffer>;

const texto = new TextEncoder();

export function base64url(bytes: Uint8Array) {
  let binario = "";
  for (const byte of bytes) binario += String.fromCharCode(byte);
  return btoa(binario).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

export function desdeBase64url(valor: string): Bytes {
  const base64 = valor.replaceAll("-", "+").replaceAll("_", "/");
  const binario = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  return bytes;
}

function unir(...partes: Uint8Array[]): Bytes {
  const total = new Uint8Array(partes.reduce((suma, parte) => suma + parte.length, 0));
  let posicion = 0;
  for (const parte of partes) {
    total.set(parte, posicion);
    posicion += parte.length;
  }
  return total;
}

/**
 * Solo los servicios de push conocidos. La función manda una solicitud al endpoint que dio el
 * navegador; sin esta lista, alguien podría usarla para pegarle a cualquier dirección (SSRF).
 * La base aplica la misma regla en `suscribir_push`.
 */
const SERVICIOS_DE_PUSH = [
  /^fcm\.googleapis\.com$/,
  /^android\.googleapis\.com$/,
  /^([a-z0-9-]+\.)*push\.services\.mozilla\.com$/,
  /^web\.push\.apple\.com$/,
  /^[a-z0-9-]+\.notify\.windows\.com$/,
];

export function endpointPermitido(endpoint: string) {
  try {
    const url = new URL(endpoint);
    return (
      url.protocol === "https:" &&
      url.port === "" &&
      url.username === "" &&
      endpoint.length <= 1000 &&
      SERVICIOS_DE_PUSH.some((patron) => patron.test(url.hostname))
    );
  } catch {
    return false;
  }
}

/** Clave pública sin comprimir → JWK (`x` e `y`), que es lo que WebCrypto acepta con `d`. */
function jwkPrivada(publica: Uint8Array, privada: string): JsonWebKey {
  if (publica.length !== 65 || publica[0] !== 4) throw new Error("clave_publica_invalida");
  return {
    kty: "EC",
    crv: "P-256",
    x: base64url(publica.slice(1, 33)),
    y: base64url(publica.slice(33, 65)),
    d: privada,
    ext: true,
  };
}

async function hkdf(sal: Bytes, ikm: Bytes, info: Bytes, bits: number): Promise<Bytes> {
  const llave = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  const derivado = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt: sal, info },
    llave,
    bits,
  );
  return new Uint8Array(derivado);
}

/** Tamaño de registro del encabezado aes128gcm. El aviso cabe de sobra en un solo registro. */
const TAMANO_REGISTRO = 4096;
/** Lo máximo que aceptan los servicios de push en el cuerpo, ya cifrado. */
export const MAXIMO_CONTENIDO = 3993;

export interface OpcionesCifrado {
  /** Solo para las pruebas: la RFC 8291 trae una sal y una clave del servidor fijas. */
  sal?: Uint8Array;
  efimera?: { publica: string; privada: string };
}

/** Cifra el contenido para un navegador (RFC 8291) y devuelve el cuerpo listo para enviar. */
export async function cifrar(
  contenido: Uint8Array,
  suscripcion: Pick<SuscripcionPush, "p256dh" | "auth">,
  opciones: OpcionesCifrado = {},
): Promise<Bytes> {
  if (contenido.length > MAXIMO_CONTENIDO) throw new Error("contenido_muy_grande");
  const publicaNavegador = desdeBase64url(suscripcion.p256dh);
  const secretoAuth = desdeBase64url(suscripcion.auth);
  if (publicaNavegador.length !== 65 || secretoAuth.length !== 16) {
    throw new Error("suscripcion_invalida");
  }

  // Par de claves de un solo uso del servidor (o el de la RFC, en las pruebas).
  let privadaServidor: CryptoKey;
  let publicaServidor: Bytes;
  if (opciones.efimera) {
    publicaServidor = desdeBase64url(opciones.efimera.publica);
    privadaServidor = await crypto.subtle.importKey(
      "jwk",
      jwkPrivada(publicaServidor, opciones.efimera.privada),
      { name: "ECDH", namedCurve: "P-256" },
      false,
      ["deriveBits"],
    );
  } else {
    const par = (await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, [
      "deriveBits",
    ])) as CryptoKeyPair;
    privadaServidor = par.privateKey;
    publicaServidor = new Uint8Array(await crypto.subtle.exportKey("raw", par.publicKey));
  }

  const llaveNavegador = await crypto.subtle.importKey(
    "raw",
    publicaNavegador,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    [],
  );
  const secretoEcdh = new Uint8Array(
    await crypto.subtle.deriveBits({ name: "ECDH", public: llaveNavegador }, privadaServidor, 256),
  );

  // RFC 8291, sección 3.4: la clave de contenido sale del secreto ECDH y del secreto de auth.
  const infoClave = unir(
    texto.encode("WebPush: info"),
    new Uint8Array([0]),
    publicaNavegador,
    publicaServidor,
  );
  const ikm = await hkdf(secretoAuth, secretoEcdh, infoClave, 256);
  const sal = opciones.sal ? unir(opciones.sal) : crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(sal, ikm, texto.encode("Content-Encoding: aes128gcm\0"), 128);
  const nonce = await hkdf(sal, ikm, texto.encode("Content-Encoding: nonce\0"), 96);

  // Un solo registro: el contenido y el delimitador 0x02 de "último registro", sin relleno.
  const llaveAes = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const cifrado = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: nonce },
      llaveAes,
      unir(contenido, new Uint8Array([2])),
    ),
  );

  // Encabezado aes128gcm (RFC 8188): sal, tamaño de registro, largo de la clave y la clave.
  const encabezado = new Uint8Array(16 + 4 + 1 + publicaServidor.length);
  encabezado.set(sal, 0);
  new DataView(encabezado.buffer).setUint32(16, TAMANO_REGISTRO);
  encabezado[20] = publicaServidor.length;
  encabezado.set(publicaServidor, 21);
  return unir(encabezado, cifrado);
}

/** JWT de VAPID (RFC 8292) firmado con ES256. Vale para el origen del servicio de push. */
export async function firmarVapid(
  endpoint: string,
  sujeto: string,
  claves: ClavesVapid,
  expiraEn: number,
) {
  const llave = await crypto.subtle.importKey(
    "jwk",
    jwkPrivada(desdeBase64url(claves.publica), claves.privada),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );
  const codificar = (valor: unknown) => base64url(texto.encode(JSON.stringify(valor)));
  const datos = `${codificar({ typ: "JWT", alg: "ES256" })}.${codificar({
    aud: new URL(endpoint).origin,
    exp: expiraEn,
    sub: sujeto,
  })}`;
  // WebCrypto devuelve la firma como r||s (64 bytes), que es justo el formato de JWS.
  const firma = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    llave,
    texto.encode(datos),
  );
  return `${datos}.${base64url(new Uint8Array(firma))}`;
}

export type ResultadoPush =
  | { tipo: "enviado" }
  /** El navegador ya no existe o quitó el permiso: hay que borrar la suscripción. */
  | { tipo: "vencida"; estado: number }
  /** Falla pasajera (sin red, 429 o 5xx): se puede reintentar en el siguiente minuto. */
  | { tipo: "reintentar"; estado: number | null }
  /** El servicio rechazó el aviso: reintentar no sirve. */
  | { tipo: "rechazado"; estado: number };

export interface OpcionesEnvio {
  sujeto: string;
  /** Segundos que el servicio guarda el aviso si el teléfono está apagado. */
  ttl: number;
  urgencia: "very-low" | "low" | "normal" | "high";
  ahora: Date;
}

export function interpretarRespuesta(estado: number): ResultadoPush {
  if (estado >= 200 && estado < 300) return { tipo: "enviado" };
  if (estado === 404 || estado === 410) return { tipo: "vencida", estado };
  if (estado === 429 || estado >= 500) return { tipo: "reintentar", estado };
  return { tipo: "rechazado", estado };
}

/** Cifra, firma y manda un aviso. Nunca lanza: cada falla vuelve como resultado. */
export async function enviarPush(
  pedir: typeof fetch,
  suscripcion: SuscripcionPush,
  contenido: string,
  claves: ClavesVapid,
  opciones: OpcionesEnvio,
): Promise<ResultadoPush> {
  if (!endpointPermitido(suscripcion.endpoint)) return { tipo: "rechazado", estado: 0 };
  let cuerpo: Bytes;
  let jwt: string;
  try {
    cuerpo = await cifrar(texto.encode(contenido), suscripcion);
    // 12 horas: el máximo que aceptan todos los servicios es 24.
    const expira = Math.floor(opciones.ahora.getTime() / 1000) + 12 * 60 * 60;
    jwt = await firmarVapid(suscripcion.endpoint, opciones.sujeto, claves, expira);
  } catch {
    return { tipo: "rechazado", estado: 0 };
  }
  try {
    const respuesta = await pedir(suscripcion.endpoint, {
      method: "POST",
      headers: {
        Authorization: `vapid t=${jwt}, k=${claves.publica}`,
        "Content-Encoding": "aes128gcm",
        "Content-Type": "application/octet-stream",
        TTL: String(opciones.ttl),
        Urgency: opciones.urgencia,
      },
      body: cuerpo,
    });
    await respuesta.body?.cancel();
    return interpretarRespuesta(respuesta.status);
  } catch {
    return { tipo: "reintentar", estado: null };
  }
}
