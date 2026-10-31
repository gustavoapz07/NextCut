// Service worker de NextCut: solo muestra los avisos por Web Push (Sprint 3, ADR-014).
// No guarda la app en caché: la fila tiene que verse siempre al día y nadie se queda con una
// versión vieja. Lo único que guarda es un registro corto de los avisos que llegaron, para la
// página /diagnostico (en el teléfono, nunca sale de ahí).

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (evento) => evento.waitUntil(self.clients.claim()));

const texto = (valor, otro) => (typeof valor === "string" && valor ? valor : otro);

const REGISTRO = { cache: "nextcut-diagnostico", ruta: "/diagnostico/avisos.json", maximo: 10 };

/** Anota el aviso en el registro del teléfono. Si falla, el aviso no se ve afectado. */
async function anotar(entrada) {
  try {
    const cache = await caches.open(REGISTRO.cache);
    const anterior = await cache.match(REGISTRO.ruta);
    const lista = anterior ? await anterior.json() : [];
    lista.unshift(entrada);
    await cache.put(
      REGISTRO.ruta,
      new Response(JSON.stringify(lista.slice(0, REGISTRO.maximo)), {
        headers: { "Content-Type": "application/json" },
      }),
    );
  } catch {
    // Sin registro: el aviso ya se mostró (o no) igual.
  }
}

async function mostrar(aviso) {
  // Solo abre páginas de turnos de este mismo sitio.
  const url =
    typeof aviso.url === "string" && /^\/t\/[A-Z0-9]{10}$/.test(aviso.url) ? aviso.url : "/";
  const titulo = texto(aviso.titulo, "NextCut");
  let resultado = "mostrado";
  try {
    await self.registration.showNotification(titulo, {
      body: texto(aviso.cuerpo, "Tu turno cambió."),
      tag: texto(aviso.etiqueta, "nextcut"),
      renotify: true,
      requireInteraction: aviso.tipo === "llamado",
      icon: "/icono-192.png",
      badge: "/insignia-96.png",
      lang: "es",
      vibrate: [400, 150, 400, 150, 600],
      data: { url },
    });
  } catch (error) {
    resultado = `no se pudo mostrar: ${error?.name ?? "error"}`;
  }
  const entrada = { fecha: new Date().toISOString(), titulo, resultado };
  await anotar(entrada);
  // Las páginas abiertas (como /diagnostico) se enteran al momento.
  const ventanas = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  for (const ventana of ventanas) ventana.postMessage({ tipo: "nextcut:aviso", ...entrada });
}

self.addEventListener("push", (evento) => {
  let aviso = {};
  try {
    aviso = evento.data ? evento.data.json() : {};
  } catch {
    aviso = {};
  }
  evento.waitUntil(mostrar(aviso));
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
