// Avisos por Web Push desde la página del turno (Sprint 3). El navegador se suscribe con la clave
// pública VAPID y la base guarda la suscripción con el secreto del turno: solo el teléfono con el
// que la persona se anotó puede activar los avisos de ese turno. La Edge Function `avisos` los
// manda: "ya casi" cuando faltan unos 15 minutos y "te toca" cuando el barbero llama.

import { desdeBase64url } from "@shared/webpush";
import { useCallback, useEffect, useRef, useState } from "react";
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
  /**
   * Se pidió el permiso y no hubo respuesta: la persona cerró la pregunta o el teléfono no la
   * mostró (pasa con la página agregada a la pantalla de inicio de Android, que tiene su propio
   * permiso). Se puede volver a intentar, pero hay que decir qué revisar.
   */
  | "sin_respuesta"
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

export function desdePantallaDeInicio() {
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
  return activadosAntes(codigo) && Notification.permission === "granted";
}

/** Este teléfono los activó alguna vez, aunque después haya perdido el permiso. */
function activadosAntes(codigo: string) {
  try {
    return localStorage.getItem(marca(codigo)) === "1";
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
 * Una notificación que no pasa por el servidor: si no aparece, el teléfono bloquea las del
 * navegador (ajustes de Android, de iOS o del propio navegador). Lleva la etiqueta del turno, así
 * "ya casi" la reemplaza.
 */
function avisoLocal(
  registro: ServiceWorkerRegistration,
  codigo: string,
  titulo: string,
  cuerpo: string,
) {
  return registro.showNotification(titulo, {
    body: cuerpo,
    tag: `turno-${codigo}`,
    icon: "/icono-192.png",
    badge: "/insignia-96.png",
    lang: "es",
    data: { url: `/t/${codigo}` },
  });
}

/** Al activarlos, para que la persona se entere ahora si no le llegan, no cuando ya le toca. */
async function confirmarEnElTelefono(registro: ServiceWorkerRegistration, codigo: string) {
  try {
    await avisoLocal(
      registro,
      codigo,
      "Avisos activados",
      "Así te avisamos cuando falten unos 15 minutos y cuando te toque.",
    );
  } catch {
    // Los avisos quedan activos igual; si no se ven, el problema está en los ajustes del teléfono.
  }
}

/**
 * "Probar el aviso", con los avisos ya activos. Devuelve `false` si este navegador perdió el
 * service worker o la suscripción: entonces hay que volver a activarlos.
 */
export async function probarAviso(codigo: string) {
  try {
    const registro = await navigator.serviceWorker.getRegistration("/");
    if (!registro || !(await registro.pushManager.getSubscription())) return false;
    await avisoLocal(
      registro,
      codigo,
      "Así te llega el aviso",
      "Si ves esto, los avisos de tu turno funcionan en este teléfono.",
    );
    return true;
  } catch {
    return false;
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
  if (avisosActivos(codigo)) return "activos";
  // Los había activado y el permiso se perdió (en Android, al agregar la página a la pantalla de
  // inicio): se dice desde ya qué revisar, en vez de un botón que parece no hacer nada.
  return activadosAntes(codigo) ? "sin_respuesta" : "apagados";
}

const DESPUES_DE: Record<ResultadoAvisos, EstadoAvisos> = {
  activados: "activos",
  bloqueados: "bloqueados",
  sin_permiso: "sin_respuesta",
  error: "error",
};

export function useAvisos(codigo: string, secreto: string | null) {
  const [estado, setEstado] = useState<EstadoAvisos>(() => estadoInicial(codigo, secreto));
  /** Se mandó un aviso de prueba: la página explica qué revisar si no apareció. */
  const [prueba, setPrueba] = useState(false);
  const activar = useCallback(async () => {
    if (!secreto) return;
    setEstado("activando");
    setPrueba(false);
    setEstado(DESPUES_DE[await activarAvisos(codigo, secreto)]);
  }, [codigo, secreto]);
  const probar = useCallback(async () => {
    setPrueba(false);
    if (await probarAviso(codigo)) setPrueba(true);
    // El navegador perdió la suscripción: vuelve a aparecer "Avisarme".
    else setEstado("apagados");
  }, [codigo]);

  // Al abrir con los avisos activos se revisa que la suscripción siga ahí: el navegador la borra
  // si el permiso se perdió un rato (en Android, al agregar la página a la pantalla de inicio). Con
  // el permiso dado, volver a suscribirse no pregunta nada.
  const revisada = useRef(false);
  useEffect(() => {
    if (revisada.current || estado !== "activos") return;
    revisada.current = true;
    void (async () => {
      try {
        const registro = await navigator.serviceWorker.getRegistration("/");
        if (!(await registro?.pushManager.getSubscription())) await activar();
      } catch {
        // Sin poder revisarla, se queda como está; "Probar el aviso" lo detecta.
      }
    })();
  }, [estado, activar]);

  return { estado, activar, probar, prueba };
}
