// Diagnóstico de los avisos en un teléfono (/diagnostico). Junta lo que el navegador sabe de los
// avisos de este sitio y el registro que lleva el service worker de los avisos que llegaron, para
// saber si un aviso no llega o si llega y el teléfono no lo muestra. Nada sale del teléfono.

export interface AvisoRecibido {
  fecha: string;
  titulo: string;
  /** "mostrado" o el error con el que falló `showNotification`. */
  resultado: string;
}

export interface Diagnostico {
  navegador: string;
  seguro: boolean;
  /** Abierta desde la pantalla de inicio (lo que iPhone necesita para avisar). */
  instalada: boolean;
  permiso: NotificationPermission | "sin_soporte";
  serviceWorker: "activo" | "instalando" | "sin_registrar" | "sin_soporte";
  /** Servicio de push de la suscripción de este navegador, o `null` si no tiene. */
  suscripcion: string | null;
  recibidos: AvisoRecibido[];
  /** Notificaciones del sitio que el navegador dice tener a la vista. */
  aLaVista: string[];
}

/** Lo mismo que usa sw.js. */
export const REGISTRO = { cache: "nextcut-diagnostico", ruta: "/diagnostico/avisos.json" };

/** "Chrome 141 · Android 15", "Samsung Internet 28 · Android 15", "Safari · iOS 18"… */
export function describirNavegador(agente: string) {
  // Chrome dice "Android 10; K" en todos los teléfonos para no revelar la versión real.
  const android = /Android 10; K\)/.test(agente) ? "Android" : agente.match(/Android \d+/)?.[0];
  const sistema =
    android ??
    (/iPhone|iPad/.test(agente)
      ? `iOS ${agente.match(/OS (\d+)_/)?.[1] ?? ""}`.trim()
      : /Windows/.test(agente)
        ? "Windows"
        : /Mac OS X/.test(agente)
          ? "macOS"
          : "otro sistema");
  const navegador = /SamsungBrowser\/(\d+)/.test(agente)
    ? `Samsung Internet ${agente.match(/SamsungBrowser\/(\d+)/)?.[1]}`
    : /EdgA?\/(\d+)/.test(agente)
      ? `Edge ${agente.match(/EdgA?\/(\d+)/)?.[1]}`
      : /Firefox\/(\d+)/.test(agente)
        ? `Firefox ${agente.match(/Firefox\/(\d+)/)?.[1]}`
        : /CriOS\/(\d+)|Chrome\/(\d+)/.test(agente)
          ? `Chrome ${agente.match(/(?:CriOS|Chrome)\/(\d+)/)?.[1]}`
          : /Safari\//.test(agente)
            ? "Safari"
            : "otro navegador";
  return `${navegador} · ${sistema}`;
}

async function leerRecibidos(): Promise<AvisoRecibido[]> {
  try {
    if (!("caches" in window)) return [];
    const respuesta = await (await caches.open(REGISTRO.cache)).match(REGISTRO.ruta);
    if (!respuesta) return [];
    const lista: unknown = await respuesta.json();
    return Array.isArray(lista) ? (lista as AvisoRecibido[]) : [];
  } catch {
    return [];
  }
}

export async function diagnosticar(): Promise<Diagnostico> {
  const conSw = "serviceWorker" in navigator;
  const registro = conSw ? await navigator.serviceWorker.getRegistration("/") : undefined;
  // Trae el service worker más nuevo, por si el teléfono tenía uno de antes.
  await registro?.update().catch(() => undefined);
  const suscripcion = await registro?.pushManager?.getSubscription().catch(() => null);
  const aLaVista = await registro?.getNotifications().catch(() => []);
  const standalone = (navigator as Navigator & { standalone?: boolean }).standalone;
  return {
    navegador: describirNavegador(navigator.userAgent),
    seguro: window.isSecureContext !== false,
    instalada:
      standalone === true || window.matchMedia?.("(display-mode: standalone)").matches === true,
    permiso: "Notification" in window ? Notification.permission : "sin_soporte",
    serviceWorker: !conSw
      ? "sin_soporte"
      : !registro
        ? "sin_registrar"
        : registro.active
          ? "activo"
          : "instalando",
    suscripcion: suscripcion ? new URL(suscripcion.endpoint).hostname : null,
    recibidos: await leerRecibidos(),
    aLaVista: (aLaVista ?? []).map((n) => n.title),
  };
}

export type ResultadoPrueba =
  /** El navegador la tiene a la vista: si la persona no la ve, la esconde el sistema. */
  | "a_la_vista"
  /** `showNotification` terminó bien pero el navegador no la lista. */
  | "sin_rastro"
  | "sin_service_worker"
  | { error: string };

/** Muestra una notificación local (sin servidor) y revisa si el navegador la tiene a la vista. */
export async function avisoDePrueba(): Promise<ResultadoPrueba> {
  try {
    const registro = await navigator.serviceWorker?.getRegistration("/");
    if (!registro) return "sin_service_worker";
    const etiqueta = `nextcut-diagnostico-${Date.now()}`;
    await registro.showNotification("Prueba de NextCut", {
      body: "Si ves esto, este teléfono muestra los avisos de NextCut.",
      tag: etiqueta,
      icon: "/icono-192.png",
      badge: "/insignia-96.png",
      lang: "es",
    });
    const vistas = await registro.getNotifications({ tag: etiqueta });
    return vistas.length > 0 ? "a_la_vista" : "sin_rastro";
  } catch (error) {
    return { error: error instanceof Error ? `${error.name}: ${error.message}` : "desconocido" };
  }
}

/** Pide el permiso de notificaciones desde el diagnóstico y dice qué contestó el navegador. */
export async function pedirPermiso(): Promise<NotificationPermission | "sin_soporte"> {
  if (!("Notification" in window)) return "sin_soporte";
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}
