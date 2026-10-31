// Avisos por Web Push desde la página del turno (Sprint 3). El navegador se suscribe con la clave
// pública VAPID y la base guarda la suscripción con el secreto del turno: solo el teléfono con el
// que la persona se anotó puede activar los avisos de ese turno. La Edge Function `avisos` los
// manda: "ya casi" cuando faltan unos 15 minutos y "te toca" cuando el barbero llama.

import { desdeBase64url } from "@shared/webpush";
import { useCallback, useState } from "react";
import { supabase } from "./supabase";

export type DisponibilidadAvisos =
  | "disponible"
  /** iPhone o iPad con la página abierta en Safari: los avisos solo llegan desde la pantalla de inicio. */
  | "instalar"
  /** La persona dijo que no; solo se puede cambiar en los ajustes del navegador. */
  | "bloqueados"
  | "no_disponible";

export type ResultadoAvisos = "activados" | "bloqueados" | "sin_permiso" | "error";

export type EstadoAvisos =
  | "oculto"
  | "apagados"
  | "activando"
  | "activos"
  | "bloqueados"
  | "instalar"
  | "error";

/** Se lee cada vez, no al cargar el módulo, para que las pruebas puedan cambiarla. */
const clavePublica = () => import.meta.env.VITE_VAPID_PUBLIC_KEY ?? "";

function esIos() {
  const agente = navigator.userAgent;
  // El iPad se presenta como Mac; lo delata la pantalla táctil.
  return (
    /iPhone|iPad|iPod/.test(agente) || (/Macintosh/.test(agente) && navigator.maxTouchPoints > 1)
  );
}

function desdePantallaDeInicio() {
  const standalone = (navigator as Navigator & { standalone?: boolean }).standalone;
  return standalone === true || window.matchMedia?.("(display-mode: standalone)").matches === true;
}

export function disponibilidadAvisos(): DisponibilidadAvisos {
  if (!clavePublica()) return "no_disponible";
  const soporta =
    window.isSecureContext !== false &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;
  if (!soporta) return esIos() && !desdePantallaDeInicio() ? "instalar" : "no_disponible";
  if (Notification.permission === "denied") return "bloqueados";
  return "disponible";
}

const marca = (codigo: string) => `nextcut:avisos:${codigo}`;

/** Este teléfono ya activó los avisos de este turno (y el permiso sigue dado). */
export function avisosActivos(codigo: string) {
  try {
    return localStorage.getItem(marca(codigo)) === "1" && Notification.permission === "granted";
  } catch {
    return false;
  }
}

function recordarActivos(codigo: string) {
  try {
    localStorage.setItem(marca(codigo), "1");
  } catch {
    // Sin almacenamiento: los avisos llegan igual, solo el botón no lo recordará al volver.
  }
}

function mismaClave(usada: ArrayBuffer | null, clave: Uint8Array) {
  if (!usada) return false;
  const bytes = new Uint8Array(usada);
  return bytes.length === clave.length && bytes.every((byte, i) => byte === clave[i]);
}

/** Usa la suscripción que ya tiene el navegador si es de esta clave; si no, crea otra. */
async function suscribirNavegador(push: PushManager) {
  const clave = desdeBase64url(clavePublica());
  const actual = await push.getSubscription();
  if (actual) {
    if (mismaClave(actual.options.applicationServerKey, clave)) return actual;
    // Otra clave (otro entorno o se cambió): esa suscripción ya no sirve para estos avisos.
    await actual.unsubscribe();
  }
  return push.subscribe({ userVisibleOnly: true, applicationServerKey: clave });
}

/**
 * Un aviso de prueba al activarlos, que no pasa por el servidor: si no aparece, el teléfono bloquea
 * las notificaciones del navegador (ajustes de Android, de iOS o del propio navegador) y la persona
 * se entera ahora, no cuando ya le toca. Lleva la etiqueta del turno: "ya casi" lo reemplaza.
 */
async function confirmarEnElTelefono(registro: ServiceWorkerRegistration, codigo: string) {
  try {
    await registro.showNotification("Avisos activados", {
      body: "Así te avisamos cuando falten unos 15 minutos y cuando te toque.",
      tag: `turno-${codigo}`,
      icon: "/icono-192.png",
      badge: "/insignia-96.png",
      lang: "es",
      data: { url: `/t/${codigo}` },
    });
  } catch {
    // Los avisos quedan activos igual; si no se ven, el problema está en los ajustes del teléfono.
  }
}

export async function activarAvisos(codigo: string, secreto: string): Promise<ResultadoAvisos> {
  try {
    const permiso = await Notification.requestPermission();
    if (permiso === "denied") return "bloqueados";
    if (permiso !== "granted") return "sin_permiso";

    await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    const registro = await navigator.serviceWorker.ready;
    const suscripcion = (await suscribirNavegador(registro.pushManager)).toJSON();

    const { data, error } = await supabase.rpc("suscribir_push", {
      p_codigo: codigo,
      p_secreto: secreto,
      p_suscripcion: {
        endpoint: suscripcion.endpoint ?? "",
        keys: { p256dh: suscripcion.keys?.p256dh ?? "", auth: suscripcion.keys?.auth ?? "" },
      },
    });
    if (error || data !== true) return "error";
    recordarActivos(codigo);
    await confirmarEnElTelefono(registro, codigo);
    return "activados";
  } catch {
    return "error";
  }
}

function estadoInicial(codigo: string, secreto: string | null): EstadoAvisos {
  // Sin el secreto (otro teléfono) la base no deja suscribirse.
  if (!secreto) return "oculto";
  const disponibilidad = disponibilidadAvisos();
  if (disponibilidad === "no_disponible") return "oculto";
  if (disponibilidad !== "disponible") return disponibilidad;
  return avisosActivos(codigo) ? "activos" : "apagados";
}

const DESPUES_DE: Record<ResultadoAvisos, EstadoAvisos> = {
  activados: "activos",
  bloqueados: "bloqueados",
  sin_permiso: "apagados",
  error: "error",
};

export function useAvisos(codigo: string, secreto: string | null) {
  const [estado, setEstado] = useState<EstadoAvisos>(() => estadoInicial(codigo, secreto));
  const activar = useCallback(async () => {
    if (!secreto) return;
    setEstado("activando");
    setEstado(DESPUES_DE[await activarAvisos(codigo, secreto)]);
  }, [codigo, secreto]);
  return { estado, activar };
}
