import { BellRing, Check, CircleAlert, RefreshCw, X } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { BotonMarca } from "@/components/Marco";
import {
  avisoDePrueba,
  type Diagnostico as DatosDiagnostico,
  diagnosticar,
  pedirPermiso,
  type ResultadoPrueba,
} from "@/lib/diagnostico";
import { useTitulo } from "@/lib/ganchos";
import { cx } from "@/lib/utilidades";

type Nivel = "bien" | "ojo" | "mal";

const PERMISOS: Record<DatosDiagnostico["permiso"], [string, Nivel]> = {
  granted: ["Permitido", "bien"],
  denied: ["Bloqueado en el navegador", "mal"],
  default: ["Todavía no se pidió", "ojo"],
  sin_soporte: ["Este navegador no tiene avisos", "mal"],
};

const SERVICE_WORKER: Record<DatosDiagnostico["serviceWorker"], [string, Nivel]> = {
  activo: ["Activo", "bien"],
  instalando: ["Instalándose", "ojo"],
  sin_registrar: ["No está: activa los avisos desde tu turno", "ojo"],
  sin_soporte: ["Este navegador no lo permite", "mal"],
};

function explicar(resultado: ResultadoPrueba) {
  if (resultado === "a_la_vista") {
    return "El navegador la está mostrando. Si no la ves en la barra de notificaciones, la esconde un ajuste de Android: las categorías de notificaciones de Chrome, el modo No molestar o el ahorro de batería.";
  }
  if (resultado === "sin_rastro") {
    return "El navegador no la tiene a la vista: está bloqueando las notificaciones de este sitio.";
  }
  if (resultado === "sin_service_worker") {
    return "Este navegador no tiene el service worker de NextCut. Activa los avisos desde tu turno y vuelve aquí.";
  }
  return `No se pudo mostrar (${resultado.error}).`;
}

const hora = (iso: string) =>
  new Intl.DateTimeFormat("es-HN", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "America/Tegucigalpa",
  }).format(new Date(iso));

export function Diagnostico() {
  useTitulo("Diagnóstico de avisos");
  const [datos, setDatos] = useState<DatosDiagnostico | null>(null);
  const [prueba, setPrueba] = useState<ResultadoPrueba | null>(null);
  const [probando, setProbando] = useState(false);

  const actualizar = useCallback(async () => setDatos(await diagnosticar()), []);

  useEffect(() => {
    void actualizar();
    // El service worker avisa cada vez que llega un aviso.
    const alRecibir = () => void actualizar();
    navigator.serviceWorker?.addEventListener("message", alRecibir);
    return () => navigator.serviceWorker?.removeEventListener("message", alRecibir);
  }, [actualizar]);

  async function probar() {
    setProbando(true);
    setPrueba(await avisoDePrueba());
    setProbando(false);
    await actualizar();
  }

  const [respuesta, setRespuesta] = useState<string | null>(null);
  async function pedir() {
    const permiso = await pedirPermiso();
    setRespuesta(
      permiso === "granted"
        ? "Permitido. Ahora prueba el aviso, y en tu turno vuelve a tocar «Avisarme»."
        : permiso === "denied"
          ? "El teléfono dijo que no. Actívalo en los ajustes, como dice arriba."
          : "No apareció ninguna pregunta, o la cerraste. Actívalo en los ajustes, como dice arriba.",
    );
    await actualizar();
  }

  return (
    <main className="mx-auto min-h-dvh max-w-lg bg-fondo px-4 pt-5 pb-16 text-tinta">
      <BotonMarca />
      <h1 className="mt-8 font-display text-6xl leading-[0.9] font-black uppercase">
        Diagnóstico de avisos
      </h1>
      <p className="mt-3 text-tenue">
        Lo que este teléfono sabe de los avisos de NextCut. Nada de esto sale del teléfono: si
        alguien te está ayudando, mándale una captura.
      </p>

      {!datos ? (
        <p className="mt-8 text-tenue">Revisando…</p>
      ) : (
        <>
          <dl className="mt-8 grid gap-2 rounded-[1.75rem] bg-superficie p-5 ring-1 ring-borde">
            <Fila titulo="Navegador">{datos.navegador}</Fila>
            <Fila titulo="Conexión segura" nivel={datos.seguro ? "bien" : "mal"}>
              {datos.seguro ? "Sí" : "No"}
            </Fila>
            <Fila titulo="Permiso del sitio" nivel={PERMISOS[datos.permiso][1]}>
              {PERMISOS[datos.permiso][0]}
            </Fila>
            <Fila titulo="Service worker" nivel={SERVICE_WORKER[datos.serviceWorker][1]}>
              {SERVICE_WORKER[datos.serviceWorker][0]}
            </Fila>
            <Fila titulo="Suscripción" nivel={datos.suscripcion ? "bien" : "ojo"}>
              {datos.suscripcion ?? "Ninguna"}
            </Fila>
            <Fila titulo="Desde la pantalla de inicio">{datos.instalada ? "Sí" : "No"}</Fila>
          </dl>

          {datos.permiso !== "granted" && datos.permiso !== "sin_soporte" && (
            <section className="mt-6 rounded-[1.75rem] bg-poste-azul p-5 text-white">
              <h2 className="font-display text-3xl leading-none font-black uppercase">
                Falta el permiso
              </h2>
              <p className="mt-2 text-sm">
                {datos.instalada
                  ? "Abriste NextCut desde la pantalla de inicio. En Android eso la vuelve una app aparte, con su propio permiso: en Ajustes → Aplicaciones → NextCut → Notificaciones, actívalas."
                  : "Permite las notificaciones de este sitio: en Chrome, ⋮ → Configuración → Configuración de sitios → Notificaciones. Revisa también que Chrome tenga las notificaciones activadas en los ajustes del teléfono."}
              </p>
              <button
                type="button"
                onClick={() => void pedir()}
                className="mt-4 h-12 w-full rounded-full bg-white font-semibold text-poste-azul"
              >
                Pedir permiso
              </button>
              {respuesta && (
                <p role="status" className="mt-3 text-sm">
                  {respuesta}
                </p>
              )}
            </section>
          )}

          <section className="mt-6 rounded-[1.75rem] bg-superficie p-5 ring-1 ring-borde">
            <h2 className="font-display text-3xl leading-none font-black uppercase">
              Avisos que llegaron
            </h2>
            <p className="mt-1 text-sm text-tenue">Los últimos 10 que recibió este teléfono.</p>
            {datos.recibidos.length === 0 ? (
              <p className="mt-4 text-sm">Ninguno todavía.</p>
            ) : (
              <ol className="mt-4 grid gap-2 text-sm">
                {datos.recibidos.map((aviso) => (
                  <li key={`${aviso.fecha}-${aviso.titulo}`} className="rounded-xl bg-fondo p-3">
                    <p className="font-semibold">{aviso.titulo}</p>
                    <p className="text-tenue">
                      {hora(aviso.fecha)} · {aviso.resultado}
                    </p>
                  </li>
                ))}
              </ol>
            )}
            <p className="mt-4 text-sm text-tenue">
              A la vista ahora: {datos.aLaVista.length ? datos.aLaVista.join(" · ") : "ninguna"}
            </p>
          </section>
        </>
      )}

      <div className="mt-6 grid gap-3">
        <button
          type="button"
          onClick={() => void probar()}
          disabled={probando}
          className="flex h-14 items-center justify-center gap-2 rounded-full bg-tinta font-semibold text-fondo disabled:opacity-70"
        >
          <BellRing className="size-5" />
          {probando ? "Mostrando…" : "Mostrar un aviso de prueba"}
        </button>
        {prueba && (
          <p role="status" className="rounded-2xl bg-superficie p-4 text-sm ring-1 ring-borde">
            {explicar(prueba)}
          </p>
        )}
        <button
          type="button"
          onClick={() => void actualizar()}
          className="flex h-12 items-center justify-center gap-2 rounded-full font-semibold ring-1 ring-borde"
        >
          <RefreshCw className="size-4" /> Actualizar
        </button>
      </div>
    </main>
  );
}

function Fila({ titulo, nivel, children }: { titulo: string; nivel?: Nivel; children: ReactNode }) {
  const Icono = nivel === "bien" ? Check : nivel === "mal" ? X : CircleAlert;
  return (
    <div className="flex items-start justify-between gap-3 border-b border-borde pb-2 last:border-0 last:pb-0">
      <dt className="text-sm text-tenue">{titulo}</dt>
      <dd className="flex items-center gap-1.5 text-right text-sm font-semibold">
        {children}
        {nivel && (
          <Icono
            aria-hidden="true"
            className={cx(
              "size-4 shrink-0",
              nivel === "bien" ? "text-azul" : nivel === "mal" ? "text-rojo" : "text-tenue",
            )}
          />
        )}
      </dd>
    </div>
  );
}
