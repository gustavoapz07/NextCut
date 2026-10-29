import {
  ArrowLeftRight,
  Banknote,
  Check,
  Coffee,
  CreditCard,
  LogOut,
  type LucideIcon,
  Megaphone,
  MessageCircle,
  Play,
  QrCode,
  Scissors,
  Smartphone,
  UserX,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useId, useState } from "react";
import { Navigate } from "react-router";
import { Franjas } from "@/components/Franjas";
import { BotonMarca, Cargando } from "@/components/Marco";
import { NumeroAnimado } from "@/components/NumeroAnimado";
import { Avatar, BotonPrincipal, Toast, useToast } from "@/components/Piezas";
import { SinConexion } from "@/components/SinConexion";
import { lempiras, reloj } from "@/lib/formato";
import { useReloj, useTitulo } from "@/lib/ganchos";
import {
  type DatosPanel,
  empezarTurno,
  enlaceWhatsApp,
  llamarSiguiente,
  MENSAJES_ACCION,
  type MetodoPago,
  marcarNoLlego,
  pausarBarbero,
  type ResultadoAccion,
  resumirPanel,
  type TurnoPersonal,
  terminarTurno,
  usePanel,
} from "@/lib/panel";
import { salir, useSesion } from "@/lib/sesion";
import { cx } from "@/lib/utilidades";
import {
  barberia,
  buscarServicio,
  filaInicial,
  nombresNuevos,
  servicios as serviciosPrototipo,
  type Tono,
  type TurnoFila,
} from "@/prototipo/datos";

type Fase = "libre" | "llamado" | "atendiendo";

const METODOS: Array<{ id: MetodoPago; nombre: string; icono: LucideIcon }> = [
  { id: "efectivo", nombre: "Efectivo", icono: Banknote },
  { id: "transferencia", nombre: "Transferencia", icono: ArrowLeftRight },
  { id: "tarjeta", nombre: "Tarjeta", icono: CreditCard },
];

interface TurnoVista {
  clave: string;
  numero: number;
  nombre: string;
  servicioId: string;
  servicio: string;
  minutosServicio: number | null;
  cualquiera: boolean;
  origen: "local" | "remoto";
  esperaMin: number;
}

interface ActualVista extends TurnoVista {
  /** Hora (ms) en que lo llamó o lo sentó. */
  desde: number;
  /** Enlace de WhatsApp, o `null` si no dejó número. */
  whatsApp: string | null;
}

/** Todo lo que dibuja el panel, venga del prototipo o de la base. */
interface VistaPanel {
  barbero: { nombre: string; silla: number | null; tono: Tono };
  barberia: string;
  toleranciaSeg: number;
  fase: Fase;
  actual: ActualVista | null;
  cola: TurnoVista[];
  pausa: boolean;
  hoy: { atendidos: number; ingresos: number };
  servicios: { id: string; nombre: string; precio: number }[];
  /** Hay una acción en camino: los botones esperan. */
  ocupado: boolean;
}

interface AccionesPanel {
  llamar: () => void;
  empezar: () => void;
  noLlego: () => void;
  /** Devuelve si se guardó, para cerrar la hoja. */
  terminar: (monto: number, metodo: MetodoPago, servicioId: string) => Promise<boolean>;
  pausar: () => void;
  /** Solo el prototipo: muestra el mensaje en vez de abrir WhatsApp. */
  whatsAppSimulado?: () => void;
  salir?: () => void;
}

// ---------------------------------------------------------------------------------------------
// Panel real (/panel)
// ---------------------------------------------------------------------------------------------

export function PanelBarbero() {
  const sesion = useSesion();
  if (sesion.tipo === "cargando") return <Cargando />;
  if (sesion.tipo === "fuera") return <Navigate to="/entrar" replace />;
  return <PanelReal userId={sesion.sesion.user.id} />;
}

const minutosDesde = (fecha: string, ahora: Date) =>
  Math.max(0, Math.round((ahora.getTime() - Date.parse(fecha)) / 60_000));

function vistaTurno(t: TurnoPersonal, datos: DatosPanel, ahora: Date): TurnoVista {
  const servicio = datos.servicios.find((s) => s.id === t.servicio_id);
  return {
    clave: t.id,
    numero: t.numero,
    nombre: t.nombre,
    servicioId: t.servicio_id,
    servicio: servicio?.nombre ?? "Servicio",
    minutosServicio: servicio?.duracion_min ?? null,
    cualquiera: t.barbero_id === null,
    origen: t.origen,
    esperaMin: minutosDesde(t.creado_en, ahora),
  };
}

function PanelReal({ userId }: { userId: string }) {
  const { estado, recargar } = usePanel(userId);
  const { toast, mostrar } = useToast();
  const [ocupado, setOcupado] = useState(false);
  const ahora = useReloj(30_000);
  useTitulo(estado.tipo === "listo" ? `Panel · ${estado.datos.barbero.nombre}` : "Panel");

  if (estado.tipo === "cargando") return <Cargando />;
  if (estado.tipo === "error") {
    return <SinConexion titulo="No pudimos cargar tu panel" alReintentar={() => void recargar()} />;
  }
  if (estado.tipo === "sin_silla") return <SinSilla />;

  const { datos } = estado;
  const { barbero } = datos;
  const { actual, cola } = resumirPanel(datos);

  async function correr<T>(
    accion: () => Promise<ResultadoAccion<T>>,
    alTerminar?: (datos: T) => void,
  ) {
    setOcupado(true);
    const resultado = await accion();
    setOcupado(false);
    if (resultado.ok) alTerminar?.(resultado.datos);
    else mostrar(MENSAJES_ACCION[resultado.error]);
    void recargar();
    return resultado.ok;
  }

  const vista: VistaPanel = {
    barbero: { nombre: barbero.nombre, silla: barbero.silla, tono: "rojo" },
    barberia: datos.barberia.nombre,
    toleranciaSeg: datos.barberia.tolerancia_min * 60,
    fase: !actual ? "libre" : actual.estado === "llamado" ? "llamado" : "atendiendo",
    actual: actual && {
      ...vistaTurno(actual, datos, ahora),
      desde: Date.parse(
        (actual.estado === "en_silla" ? actual.inicio_en : actual.llamado_en) ?? actual.creado_en,
      ),
      whatsApp: enlaceWhatsApp(actual, datos.barberia.nombre, barbero.silla),
    },
    cola: cola.map((t) => vistaTurno(t, datos, ahora)),
    pausa: barbero.en_pausa,
    hoy: datos.hoy,
    servicios: datos.servicios.map((s) => ({ id: s.id, nombre: s.nombre, precio: s.precio_ref })),
    ocupado,
  };

  const acciones: AccionesPanel = {
    llamar: () =>
      void correr(
        () => llamarSiguiente(barbero.id),
        (turno) => {
          if (turno === null) mostrar("No hay nadie en tu fila.");
        },
      ),
    empezar: () => actual && void correr(() => empezarTurno(actual.id)),
    noLlego: () =>
      actual &&
      void correr(
        () => marcarNoLlego(actual.id),
        () => mostrar(`#${actual.numero} ${actual.nombre} quedó como "no llegó"`),
      ),
    terminar: async (monto, metodo, servicioId) =>
      actual
        ? correr(
            () => terminarTurno(actual.id, monto, metodo, servicioId),
            () => mostrar(`Turno cerrado · ${lempiras(monto)} en ${metodo}`),
          )
        : false,
    pausar: () =>
      void correr(
        () => pausarBarbero(barbero.id, !barbero.en_pausa),
        () =>
          mostrar(
            barbero.en_pausa
              ? "Volviste: la fila sigue contigo"
              : "En pausa: recalculamos los tiempos",
          ),
      ),
    salir: () => void salir(),
  };

  return <Panel vista={vista} acciones={acciones} toast={<Toast toast={toast} />} />;
}

function SinSilla() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-5 px-4 py-16">
      <h1 className="font-display text-5xl leading-[0.9] font-black uppercase">
        Tu cuenta no tiene silla
      </h1>
      <p className="text-lg text-tenue">
        Entraste bien, pero tu cuenta no está ligada a ningún barbero activo. Pídele al dueño de la
        barbería que te asigne una silla.
      </p>
      <button
        type="button"
        onClick={() => void salir()}
        className="w-fit rounded-full bg-tinta px-6 py-3.5 font-display text-lg font-bold tracking-wide text-fondo uppercase"
      >
        Salir
      </button>
    </main>
  );
}

// ---------------------------------------------------------------------------------------------
// Panel del prototipo (/demo/panel)
// ---------------------------------------------------------------------------------------------

const colaInicial = filaInicial.filter((t) => t.barbero === "carlos" || t.barbero === "cualquiera");

const enSilla: TurnoFila = {
  numero: 24,
  nombre: "Ricardo V.",
  barbero: "carlos",
  servicio: "fade",
  origen: "local",
  espera: 31,
};

function vistaPrototipo(t: TurnoFila): TurnoVista {
  const servicio = buscarServicio(t.servicio);
  return {
    clave: String(t.numero),
    numero: t.numero,
    nombre: t.nombre,
    servicioId: t.servicio,
    servicio: servicio?.nombre ?? "Servicio",
    minutosServicio: servicio?.minutos ?? null,
    cualquiera: t.barbero === "cualquiera",
    origen: t.origen,
    esperaMin: t.espera,
  };
}

export function PanelPrototipo() {
  useTitulo("Panel · Carlos");
  const [fase, setFase] = useState<Fase>("atendiendo");
  const [actual, setActual] = useState<TurnoFila | null>(enSilla);
  // El corte de #24 empezó hace 12 minutos.
  const [desde, setDesde] = useState(() => Date.now() - 12 * 60_000);
  const [cola, setCola] = useState(colaInicial);
  const [pausa, setPausa] = useState(false);
  const [hoy, setHoy] = useState({ atendidos: 8, ingresos: 1490 });
  const [llegados, setLlegados] = useState(0);
  const { toast, mostrar } = useToast();

  function cambiar(nueva: Fase, turno: TurnoFila | null) {
    setFase(nueva);
    setActual(turno);
    setDesde(Date.now());
  }

  const vista: VistaPanel = {
    barbero: { nombre: "Carlos", silla: 1, tono: "rojo" },
    barberia: barberia.nombre,
    toleranciaSeg: 300,
    fase,
    actual: actual && { ...vistaPrototipo(actual), desde, whatsApp: null },
    cola: cola.map(vistaPrototipo),
    pausa,
    hoy,
    servicios: serviciosPrototipo.map((s) => ({ id: s.id, nombre: s.nombre, precio: s.precio })),
    ocupado: false,
  };

  const acciones: AccionesPanel = {
    llamar: () => {
      const [siguiente, ...resto] = cola;
      if (!siguiente) return;
      setCola(resto);
      cambiar("llamado", siguiente);
    },
    empezar: () => cambiar("atendiendo", actual),
    noLlego: () => {
      if (actual) mostrar(`#${actual.numero} ${actual.nombre} quedó como "no llegó"`);
      cambiar("libre", null);
    },
    terminar: async (monto, metodo) => {
      setHoy((h) => ({ atendidos: h.atendidos + 1, ingresos: h.ingresos + monto }));
      mostrar(`Turno cerrado · ${lempiras(monto)} en ${metodo}`);
      cambiar("libre", null);
      // Simula que alguien más se anotó mientras tanto.
      const nombre = nombresNuevos[llegados % nombresNuevos.length] ?? "Cliente";
      setCola((c) => [
        ...c,
        {
          numero: 40 + llegados,
          nombre,
          barbero: "carlos",
          servicio: serviciosPrototipo[llegados % serviciosPrototipo.length]?.id ?? "corte",
          origen: llegados % 2 === 0 ? "remoto" : "local",
          espera: 0,
        },
      ]);
      setLlegados((n) => n + 1);
      return true;
    },
    pausar: () => {
      setPausa((p) => !p);
      mostrar(pausa ? "Volviste: la fila sigue contigo" : "En pausa: recalculamos los tiempos");
    },
    whatsAppSimulado: () =>
      actual &&
      mostrar(
        `WhatsApp para enviar: "${actual.nombre.split(" ")[0]}, ya te toca en ${barberia.nombre}. Te esperamos en la silla 1."`,
      ),
  };

  return <Panel vista={vista} acciones={acciones} toast={<Toast toast={toast} />} />;
}

// ---------------------------------------------------------------------------------------------
// Vista
// ---------------------------------------------------------------------------------------------

function Panel({
  vista,
  acciones,
  toast,
}: {
  vista: VistaPanel;
  acciones: AccionesPanel;
  toast: ReactNode;
}) {
  const [hoja, setHoja] = useState(false);
  const { fase, actual, cola, pausa, ocupado } = vista;
  const siguiente = cola[0];

  return (
    <div className="min-h-dvh pb-12">
      <div className="mx-auto max-w-5xl px-4 pt-5 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10 lg:pt-10">
        <div>
          <div className="mb-5 flex items-center justify-between gap-3">
            <BotonMarca />
            {acciones.salir && (
              <button
                type="button"
                onClick={acciones.salir}
                className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold ring-1 ring-borde transition hover:bg-superficie-2"
              >
                <LogOut className="size-4" /> Salir
              </button>
            )}
          </div>
          <header className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar
                nombre={vista.barbero.nombre}
                tono={vista.barbero.tono}
                className="size-12 shrink-0 text-2xl"
              />
              <div className="min-w-0">
                <p className="font-display text-3xl leading-none font-black break-words uppercase">
                  Hola, {vista.barbero.nombre}
                </p>
                <p className="text-sm text-tenue">
                  {vista.barbero.silla ? `Silla ${vista.barbero.silla} · ` : ""}
                  {vista.barberia}
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={!pausa}
              aria-label="Disponible para atender"
              disabled={ocupado}
              onClick={acciones.pausar}
              className={cx(
                "flex h-12 shrink-0 items-center gap-2 rounded-full p-1.5 pr-4 text-sm font-bold transition-colors",
                pausa ? "bg-superficie-2 text-tinta" : "bg-poste-azul text-white",
              )}
            >
              <motion.span
                layout
                className="grid size-9 place-items-center rounded-full bg-white text-noche"
              >
                {pausa ? <Coffee className="size-4" /> : <Scissors className="size-4" />}
              </motion.span>
              {pausa ? "En pausa" : "Disponible"}
            </button>
          </header>

          <dl className="mt-5 grid grid-cols-3 gap-2">
            {[
              { titulo: "Atendidos", valor: vista.hoy.atendidos, formato: String },
              { titulo: "Registrado", valor: vista.hoy.ingresos, formato: lempiras },
              { titulo: "En tu fila", valor: cola.length, formato: String },
            ].map((d) => (
              <div key={d.titulo} className="rounded-2xl bg-superficie px-3 py-3 ring-1 ring-borde">
                <dt className="text-xs text-tenue">{d.titulo}</dt>
                <dd className="mt-1 font-display text-2xl leading-none font-black sm:text-3xl">
                  <NumeroAnimado valor={d.valor} formato={d.formato} />
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-4">
            <AnimatePresence mode="wait" initial={false}>
              <TarjetaActual
                key={`${fase}-${actual?.clave ?? "nadie"}`}
                vista={vista}
                whatsAppSimulado={acciones.whatsAppSimulado}
              />
            </AnimatePresence>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <BotonAccion
              titulo="Llamar siguiente"
              detalle={
                pausa
                  ? "Estás en pausa"
                  : siguiente
                    ? `#${siguiente.numero} ${siguiente.nombre}`
                    : "No hay nadie en fila"
              }
              icono={Megaphone}
              className="col-span-2 h-28 bg-poste-rojo text-white"
              disabled={ocupado || fase !== "libre" || !siguiente || pausa}
              onClick={acciones.llamar}
            />
            <BotonAccion
              titulo="Empezar"
              compacto
              icono={Play}
              className="bg-poste-azul text-white"
              disabled={ocupado || fase !== "llamado"}
              onClick={acciones.empezar}
            />
            <BotonAccion
              titulo="No llegó"
              compacto
              icono={UserX}
              className="bg-superficie text-tinta ring-2 ring-tinta"
              disabled={ocupado || fase !== "llamado"}
              onClick={acciones.noLlego}
            />
            <BotonAccion
              titulo="Terminar"
              detalle={actual && fase === "atendiendo" ? "Registra servicio y pago" : undefined}
              icono={Check}
              className="col-span-2 bg-tinta text-fondo"
              disabled={ocupado || fase !== "atendiendo"}
              onClick={() => setHoja(true)}
            />
          </div>
        </div>

        <aside className="mt-10 lg:mt-0">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-4xl leading-none font-black uppercase">Tu fila</h2>
            <p className="text-sm text-tenue">
              <NumeroAnimado valor={cola.length} /> en espera
            </p>
          </div>
          {cola.length === 0 ? (
            <p className="mt-4 rounded-2xl bg-superficie px-4 py-5 text-tenue ring-1 ring-borde">
              Nadie esperando por ahora.
            </p>
          ) : (
            <ol className="mt-4 grid gap-2">
              <AnimatePresence initial={false} mode="popLayout">
                {cola.map((t, i) => (
                  <motion.li
                    key={t.clave}
                    layout
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -60, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 280, damping: 26 }}
                    className={cx(
                      "flex items-center gap-3 rounded-2xl px-4 py-3 ring-1",
                      i === 0 ? "bg-tinta text-fondo ring-tinta" : "bg-superficie ring-borde",
                    )}
                  >
                    <span className="font-display text-2xl leading-none font-black">
                      #{t.numero}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold break-words">{t.nombre}</span>
                      <span className="block text-xs opacity-70">
                        {t.servicio}
                        {t.cualquiera && " · el primero libre"}
                      </span>
                    </span>
                    <span
                      className="flex items-center gap-1 text-xs opacity-70"
                      title={
                        t.origen === "local" ? "Se anotó en el local" : "Se anotó desde el celular"
                      }
                    >
                      {t.origen === "local" ? (
                        <QrCode className="size-3.5" />
                      ) : (
                        <Smartphone className="size-3.5" />
                      )}
                      {t.esperaMin} min
                    </span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ol>
          )}
          <p className="mt-3 flex items-center gap-4 text-xs text-tenue">
            <span className="inline-flex items-center gap-1">
              <QrCode className="size-3.5" /> En el local
            </span>
            <span className="inline-flex items-center gap-1">
              <Smartphone className="size-3.5" /> Desde el celular
            </span>
          </p>
        </aside>
      </div>

      <AnimatePresence>
        {hoja && actual && (
          <HojaTerminar
            key={actual.clave}
            turno={actual}
            servicios={vista.servicios}
            ocupado={ocupado}
            onCerrar={() => setHoja(false)}
            onGuardar={async (monto, metodo, servicioId) => {
              if (await acciones.terminar(monto, metodo, servicioId)) setHoja(false);
            }}
          />
        )}
      </AnimatePresence>
      {toast}
    </div>
  );
}

function TarjetaActual({
  vista,
  whatsAppSimulado,
}: {
  vista: VistaPanel;
  whatsAppSimulado?: () => void;
}) {
  const { fase, actual, pausa, cola } = vista;
  const ahora = useReloj(1000);
  const segundos = actual ? Math.max(0, Math.floor((ahora.getTime() - actual.desde) / 1000)) : 0;
  const transicion = {
    initial: { opacity: 0, y: 16, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -16, scale: 0.98 },
    transition: { type: "spring" as const, stiffness: 260, damping: 26 },
  };

  if (fase === "libre" || !actual) {
    const enFila = cola.length;
    return (
      <motion.section
        {...transicion}
        className="flex min-h-44 flex-col justify-center rounded-[2rem] border-2 border-dashed border-borde p-6"
      >
        <p className="text-lg font-medium text-tenue">
          {pausa ? "Tómate tu tiempo" : "Silla libre"}
        </p>
        <p className="font-display text-5xl leading-[0.9] font-black uppercase">
          {pausa ? "Estás en pausa" : enFila > 0 ? "Llama al siguiente" : "Sin clientes"}
        </p>
        <p className="mt-2 text-sm text-tenue">
          {pausa
            ? "Nadie nuevo pasa contigo y los tiempos de tu fila se recalculan."
            : `Tienes ${enFila} ${enFila === 1 ? "persona" : "personas"} esperando.`}
        </p>
      </motion.section>
    );
  }

  if (fase === "llamado") {
    const quedan = vista.toleranciaSeg - segundos;
    const claseWhatsApp =
      "mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white/15 font-semibold ring-1 ring-white/25 transition hover:bg-white/25";
    return (
      <motion.section
        {...transicion}
        className="relative overflow-hidden rounded-[2rem] bg-poste-azul p-6 text-white"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-lg font-medium">Llamaste a</p>
            <p className="font-display text-7xl leading-[0.9] font-black">#{actual.numero}</p>
            <p className="mt-1 font-display text-3xl leading-tight font-extrabold break-words uppercase">
              {actual.nombre}
            </p>
            <p className="text-sm">{actual.servicio}</p>
          </div>
          <Anillo
            valor={quedan / vista.toleranciaSeg}
            texto={reloj(quedan)}
            etiqueta="para llegar"
          />
        </div>
        {actual.whatsApp ? (
          <a href={actual.whatsApp} target="_blank" rel="noreferrer" className={claseWhatsApp}>
            <MessageCircle className="size-5" /> Avisar por WhatsApp
          </a>
        ) : whatsAppSimulado ? (
          <button type="button" onClick={whatsAppSimulado} className={claseWhatsApp}>
            <MessageCircle className="size-5" /> Avisar por WhatsApp
          </button>
        ) : (
          <p className="mt-5 text-center text-sm opacity-80">No dejó número de WhatsApp.</p>
        )}
      </motion.section>
    );
  }

  return (
    <motion.section
      {...transicion}
      className="relative overflow-hidden rounded-[2rem] bg-tinta p-6 text-fondo"
    >
      <Franjas vertical ancho={6} velocidad={1.2} className="absolute inset-y-0 right-0 w-2.5" />
      <div className="flex items-start justify-between gap-4 pr-4">
        <div className="min-w-0">
          <p className="text-lg font-medium opacity-80">En la silla</p>
          <p className="font-display text-7xl leading-[0.9] font-black">#{actual.numero}</p>
          <p className="mt-1 font-display text-3xl leading-tight font-extrabold break-words uppercase">
            {actual.nombre}
          </p>
          <p className="text-sm opacity-80">
            {actual.servicio}
            {actual.minutosServicio ? ` · ${actual.minutosServicio} min aprox.` : ""}
          </p>
        </div>
        <div className="text-right">
          <motion.div
            animate={{ rotate: [0, -20, 0] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.5, repeatDelay: 0.8 }}
            className="ml-auto w-fit"
          >
            <Scissors className="size-8" />
          </motion.div>
          <p className="mt-3 font-display text-5xl leading-none font-black tabular-nums">
            {reloj(segundos)}
          </p>
          <p className="text-xs opacity-70">transcurrido</p>
        </div>
      </div>
    </motion.section>
  );
}

function Anillo({ valor, texto, etiqueta }: { valor: number; texto: string; etiqueta: string }) {
  const radio = 42;
  const perimetro = 2 * Math.PI * radio;
  return (
    <div className="relative grid size-28 shrink-0 place-items-center">
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle
          cx="50"
          cy="50"
          r={radio}
          fill="none"
          stroke="rgb(255 255 255 / 0.2)"
          strokeWidth="8"
        />
        <motion.circle
          cx="50"
          cy="50"
          r={radio}
          fill="none"
          stroke="#fff"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={perimetro}
          animate={{ strokeDashoffset: perimetro * (1 - Math.max(0, valor)) }}
          transition={{ ease: "linear", duration: 1 }}
        />
      </svg>
      <div className="text-center">
        <p className="font-display text-3xl leading-none font-black tabular-nums">{texto}</p>
        <p className="text-[10px] font-bold tracking-wider uppercase">{etiqueta}</p>
      </div>
    </div>
  );
}

function BotonAccion({
  titulo,
  detalle,
  icono: Icono,
  className,
  disabled,
  onClick,
  compacto = false,
}: {
  titulo: string;
  detalle?: string;
  icono: LucideIcon;
  className?: string;
  disabled: boolean;
  onClick: () => void;
  /** Para los botones de media columna: ícono arriba y texto abajo. */
  compacto?: boolean;
}) {
  return (
    <motion.button
      type="button"
      whileTap={disabled ? undefined : { scale: 0.95 }}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "relative flex h-24 overflow-hidden rounded-[1.75rem] px-5 text-left transition-[opacity,filter] disabled:opacity-30 disabled:saturate-0",
        compacto ? "flex-col justify-center gap-2" : "items-center gap-4",
        className,
      )}
    >
      <span
        className={cx(
          "grid shrink-0 place-items-center rounded-full bg-current/15",
          compacto ? "size-9" : "size-12",
        )}
      >
        <Icono className={compacto ? "size-5" : "size-6"} />
      </span>
      <span className="min-w-0">
        <span
          className={cx(
            "block font-display leading-none font-black uppercase",
            compacto ? "text-2xl" : "text-3xl",
          )}
        >
          {titulo}
        </span>
        {detalle && <span className="mt-1 block text-sm break-words opacity-85">{detalle}</span>}
      </span>
    </motion.button>
  );
}

function HojaTerminar({
  turno,
  servicios,
  ocupado,
  onCerrar,
  onGuardar,
}: {
  turno: ActualVista;
  servicios: VistaPanel["servicios"];
  ocupado: boolean;
  onCerrar: () => void;
  onGuardar: (monto: number, metodo: MetodoPago, servicioId: string) => void;
}) {
  const [servicio, setServicio] = useState(turno.servicioId);
  const [monto, setMonto] = useState(
    String(servicios.find((s) => s.id === turno.servicioId)?.precio ?? 0),
  );
  const [metodo, setMetodo] = useState<MetodoPago>("efectivo");
  const idMonto = useId();

  return (
    <>
      <motion.button
        type="button"
        aria-label="Cerrar sin guardar"
        tabIndex={-1}
        onClick={onCerrar}
        className="fixed inset-0 z-40 bg-noche/50 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.section
        aria-label={`Cerrar el turno #${turno.numero}`}
        className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg rounded-t-[2.25rem] bg-fondo px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-20px_60px_-20px_rgb(10_15_36/0.6)]"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.7 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 120) onCerrar();
        }}
      >
        <div className="mx-auto h-1.5 w-12 rounded-full bg-borde" />
        <p className="mt-4 text-base font-medium text-tenue">Cerrar turno</p>
        <h2 className="font-display text-5xl leading-[0.9] font-black break-words uppercase">
          #{turno.numero} {turno.nombre}
        </h2>

        <p className="mt-6 text-sm text-tenue">Servicio</p>
        <div className="-mx-5 mt-2 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
          {servicios.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={servicio === s.id}
              onClick={() => {
                setServicio(s.id);
                setMonto(String(s.precio));
              }}
              className={cx(
                "shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold ring-1 transition",
                servicio === s.id ? "bg-tinta text-fondo ring-tinta" : "ring-borde",
              )}
            >
              {s.nombre}
            </button>
          ))}
        </div>

        <label htmlFor={idMonto} className="mt-6 block text-sm text-tenue">
          Monto cobrado
        </label>
        <div className="mt-2 flex items-baseline gap-2 border-b-4 border-tinta pb-1 focus-within:border-rojo">
          <span className="font-display text-5xl font-black text-tenue">L</span>
          <input
            id={idMonto}
            value={monto}
            onChange={(e) => setMonto(e.target.value.replace(/\D/g, "").slice(0, 5))}
            inputMode="numeric"
            className="w-full bg-transparent font-display text-6xl leading-none font-black outline-none"
          />
        </div>

        <p className="mt-6 text-sm text-tenue">Método de pago</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {METODOS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMetodo(m.id)}
              aria-pressed={metodo === m.id}
              className={cx(
                "relative flex flex-col items-center gap-2 rounded-2xl px-2 py-4 text-sm font-semibold ring-1 ring-borde transition-colors",
                metodo === m.id ? "text-fondo" : "text-tinta",
              )}
            >
              {metodo === m.id && (
                <motion.span
                  layoutId="metodo-pago"
                  className="absolute inset-0 rounded-2xl bg-tinta"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <m.icono className="relative size-6" />
              <span className="relative">{m.nombre}</span>
            </button>
          ))}
        </div>

        <BotonPrincipal
          className="mt-7"
          disabled={monto === "" || ocupado}
          onClick={() => onGuardar(Number(monto), metodo, servicio)}
          flecha={false}
        >
          {ocupado ? "Guardando…" : "Guardar y terminar"}
        </BotonPrincipal>
      </motion.section>
    </>
  );
}
