// Service worker de NextCut: solo muestra los avisos por Web Push (Sprint 3, ADR-014).
// No guarda nada en caché: la fila tiene que verse siempre al día y nadie se queda con una
// versión vieja de la app.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (evento) => evento.waitUntil(self.clients.claim()));

const texto = (valor, otro) => (typeof valor === "string" && valor ? valor : otro);

self.addEventListener("push", (evento) => {
  let aviso = {};
  try {
    aviso = evento.data ? evento.data.json() : {};
  } catch {
    aviso = {};
  }
  // Solo abre páginas de turnos de este mismo sitio.
  const url =
    typeof aviso.url === "string" && /^\/t\/[A-Z0-9]{10}$/.test(aviso.url) ? aviso.url : "/";
  evento.waitUntil(
    self.registration.showNotification(texto(aviso.titulo, "NextCut"), {
      body: texto(aviso.cuerpo, "Tu turno cambió."),
      tag: texto(aviso.etiqueta, "nextcut"),
      renotify: true,
      requireInteraction: aviso.tipo === "llamado",
      icon: "/icono-192.png",
      badge: "/insignia-96.png",
      lang: "es",
      vibrate: [400, 150, 400, 150, 600],
      data: { url },
    }),
  );
});

// Al tocar el aviso: vuelve a la pestaña del turno si está abierta; si no, la abre.
self.addEventListener("notificationclick", (evento) => {
  evento.notification.close();
  const destino = new URL(evento.notification.data?.url ?? "/", self.location.origin).href;
  evento.waitUntil(
    (async () => {
      const ventanas = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const abierta = ventanas.find((ventana) => ventana.url === destino);
      if (abierta) return abierta.focus();
      return self.clients.openWindow(destino);
    })(),
  );
});
