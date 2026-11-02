// Errores del frontend a Sentry, sin datos personales (fallos 5, 8 y 10).
//
// Sin VITE_SENTRY_DSN no se carga nada. Con DSN, el SDK se baja aparte cuando la página termina
// de cargar (o al primer error de una ruta), para no hacer más pesada la primera carga en un
// celular con datos.
//
// Antes de salir, cada evento se limpia:
// - los códigos de turno de las URL (/t/:codigo) y lo que va después de "?" o "#";
// - teléfonos y correos en cualquier texto;
// - las migas de clics y de consola, que pueden traer nombres de clientes.
// Sentry no recibe la IP, cookies, encabezados ni cuerpos (dataCollection), y no hay trazas de
// rendimiento ni grabación de sesiones.

import type { Breadcrumb, ErrorEvent } from "@sentry/react";

type Sdk = typeof import("./sentry");

const CODIGO_EN_URL = /\/t\/[A-HJ-NP-Z2-9]{10}/g;
const CONSULTA_EN_URL = /(https?:\/\/[^\s?#"'<>]+)[?#][^\s"'<>]*/g;
const TELEFONO_CON_PREFIJO = /\+504[\s-]?\d{4}[\s-]?\d{4}/g;
const TELEFONO_LOCAL = /\b\d{4}[\s-]\d{4}\b|\b[2-9]\d{7}\b/g;
const CORREO = /[^\s@"'<>/(),:;]+@[^\s@"'<>/(),:;]+\.[a-z]{2,}/gi;

/** Quita de un texto lo que puede identificar a alguien. */
export function limpiarTexto(texto: string) {
  return texto
    .replace(CONSULTA_EN_URL, "$1")
    .replace(CODIGO_EN_URL, "/t/:codigo")
    .replace(TELEFONO_CON_PREFIJO, "[teléfono]")
    .replace(TELEFONO_LOCAL, "[teléfono]")
    .replace(CORREO, "[correo]");
}

/** Limpia todos los textos de un valor, sin tocar números ni la forma del objeto. */
function limpiarValor<T>(valor: T): T {
  if (typeof valor === "string") return limpiarTexto(valor) as T;
  if (Array.isArray(valor)) return valor.map(limpiarValor) as T;
  if (valor && typeof valor === "object") {
    return Object.fromEntries(
      Object.entries(valor).map(([clave, v]) => [clave, limpiarValor(v)]),
    ) as T;
  }
  return valor;
}

export function limpiarEvento(evento: ErrorEvent): ErrorEvent {
  const { user: _usuario, ...resto } = evento;
  return limpiarValor(resto);
}

/** Sin migas de clics ni de consola; las de navegación y de red, con la URL limpia. */
export function limpiarMiga(miga: Breadcrumb): Breadcrumb | null {
  if (miga.category === "console" || miga.category?.startsWith("ui.")) return null;
  return limpiarValor(miga);
}

let sdk: Promise<Sdk | null> | null = null;
let dsnActual: string | undefined;

function cargar() {
  if (!dsnActual) return Promise.resolve(null);
  const dsn = dsnActual;
  sdk ??= import("./sentry")
    .then((sentry) => {
      sentry.init({
        dsn,
        environment: import.meta.env.MODE,
        // Nada de datos del usuario (tampoco su IP), cookies, encabezados, cuerpos, parámetros
        // de URL ni variables locales.
        dataCollection: {
          userInfo: false,
          cookies: false,
          httpHeaders: false,
          httpBodies: [],
          urlQueryParams: false,
          stackFrameVariables: false,
        },
        maxBreadcrumbs: 30,
        beforeSend: limpiarEvento,
        beforeBreadcrumb: limpiarMiga,
      });
      return sentry;
    })
    .catch(() => null);
  return sdk;
}

/** Prepara Sentry si hay DSN. El SDK se baja cuando la página termina de cargar. */
export function iniciarErrores(dsn = import.meta.env.VITE_SENTRY_DSN) {
  dsnActual = dsn || undefined;
  if (!dsnActual) return;
  if (document.readyState === "complete") void cargar();
  else window.addEventListener("load", () => void cargar(), { once: true });
}

/** Manda un error a Sentry (si está activo). Nunca lanza. */
export function reportarError(error: unknown) {
  void cargar().then((sentry) => sentry?.captureException(error));
}
