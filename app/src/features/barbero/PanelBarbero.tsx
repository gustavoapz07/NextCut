import {
  ArrowLeftRight,
  Banknote,
  Check,
  Coffee,
  CreditCard,
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
import { useId, useState } from "react";
import { Franjas } from "@/components/Franjas";
import { BotonMarca } from "@/components/Marco";
import { NumeroAnimado } from "@/components/NumeroAnimado";
import { Avatar, BotonPrincipal, Toast, useToast } from "@/components/Piezas";
import { lempiras, reloj } from "@/lib/formato";
import { cx } from "@/lib/utilidades";
import {
  barberia,
  buscarServicio,
  filaInicial,
  nombresNuevos,
  servicios,
  type TurnoFila,
} from "@/prototipo/datos";
import { useCronometro, useTitulo } from "@/prototipo/simulacion";

type Fase = "libre" | "llamado" | "atendiendo";
type Metodo = "efectivo" | "transferencia" | "tarjeta";

const TOLERANCIA = 300;

const METODOS: Array<{ id: Metodo; nombre: string; icono: LucideIcon }> = [
  { id: "efectivo", nombre: "Efectivo", icono: Banknote },
  { id: "transferencia", nombre: "Transferencia", icono: ArrowLeftRight },
  { id: "tarjeta", nombre: "Tarjeta", icono: CreditCard },
];

const colaInicial = filaInicial.filter((t) => t.barbero === "carlos" || t.barbero === "cualquiera");

const enSilla: TurnoFila = {
  numero: 24,
  nombre: "Ricardo V.",
  barbero: "carlos",
  servicio: "fade",
  origen: "local",
  espera: 31,
};

export function PanelBarbero() {
  useTitulo("Panel · Carlos");
  const [fase, setFase] = useState<Fase>("atendiendo");
  const [actual, setActual] = useState<TurnoFila | null>(enSilla);
  const [cola, setCola] = useState(colaInicial);
  const [pausa, setPausa] = useState(false);
  const [hoy, setHoy] = useState({ atendidos: 8, ingresos: 1490 });
  const [hoja, setHoja] = useState(false);
  const [llegados, setLlegados] = useState(0);
  const { toast, mostrar } = useToast();
  const segundos = useCronometro(`${fase}-${actual?.numero}`);

  function llamar() {
    const [siguiente, ...resto] = cola;
    if (!siguiente) return;
    setActual(siguiente);
    setCola(resto);
    setFase("llamado");
  }

  function noLlego() {
    if (actual) mostrar(`#${actual.numero} ${actual.nombre} quedó como "no llegó"`);
    setActual(null);
    setFase("libre");
  }

  function terminar(monto: number, metodo: Metodo) {
    setHoy((h) => ({ atendidos: h.atendidos + 1, ingresos: h.ingresos + monto }));
    mostrar(`Turno cerrado · ${lempiras(monto)} en ${metodo}`);
    setHoja(false);
    setActual(null);
    setFase("libre");
    // Simula que alguien más se anotó mientras tanto.
    const nombre = nombresNuevos[llegados % nombresNuevos.length] ?? "Cliente";
    setCola((c) => [
      ...c,
      {
        numero: 40 + llegados,
        nombre,
        barbero: "carlos",
        servicio: servicios[llegados % servicios.length]?.id ?? "corte",
        origen: llegados % 2 === 0 ? "remoto" : "local",
        espera: 0,
      },
    ]);
    setLlegados((n) => n + 1);
  }

  const siguiente = cola[0];

  return (
    <div className="min-h-dvh pb-12">
      <div className="mx-auto max-w-5xl px-4 pt-5 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10 lg:pt-10">
        <div>
          <BotonMarca className="mb-5" />
          <header className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar nombre="Carlos" tono="rojo" className="size-12 text-2xl" />
              <div>
                <p className="font-display text-3xl leading-none font-black uppercase">
                  Hola, Carlos
                </p>
                <p className="text-sm text-tenue">Silla 1 · {barberia.nombre}</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={!pausa}
              aria-label="Disponible para atender"
              onClick={() => {
                setPausa((p) => !p);
                mostrar(
                  pausa ? "Volviste: la fila sigue contigo" : "En pausa: recalculamos los tiempos",
                );
              }}
              className={cx(
                "flex h-12 items-center gap-2 rounded-full p-1.5 pr-4 text-sm font-bold transition-colors",
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
              { titulo: "Atendidos", valor: hoy.atendidos, formato: String },
              { titulo: "Registrado", valor: hoy.ingresos, formato: lempiras },
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
                key={`${fase}-${actual?.numero ?? "nadie"}`}
                fase={fase}
                actual={actual}
                segundos={segundos}
                pausa={pausa}
                enFila={cola.length}
                onWhatsApp={() =>
                  actual &&
                  mostrar(
                    `WhatsApp para enviar: "${actual.nombre.split(" ")[0]}, ya te toca en ${barberia.nombre}. Te esperamos en la silla 1."`,
                  )
                }
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
              disabled={fase !== "libre" || !siguiente || pausa}
              onClick={llamar}
            />
            <BotonAccion
              titulo="Empezar"
              compacto
              icono={Play}
              className="bg-poste-azul text-white"
              disabled={fase !== "llamado"}
              onClick={() => setFase("atendiendo")}
            />
            <BotonAccion
              titulo="No llegó"
              compacto
              icono={UserX}
              className="bg-superficie text-tinta ring-2 ring-tinta"
              disabled={fase !== "llamado"}
              onClick={noLlego}
            />
            <BotonAccion
              titulo="Terminar"
              detalle={actual && fase === "atendiendo" ? "Registra servicio y pago" : undefined}
              icono={Check}
              className="col-span-2 bg-tinta text-fondo"
              disabled={fase !== "atendiendo"}
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
          <ol className="mt-4 grid gap-2">
            <AnimatePresence initial={false} mode="popLayout">
              {cola.map((t, i) => (
                <motion.li
                  key={t.numero}
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
                  <span className="font-display text-2xl leading-none font-black">#{t.numero}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold break-words">{t.nombre}</span>
                    <span className="block text-xs opacity-70">
                      {buscarServicio(t.servicio)?.nombre}
                      {t.barbero === "cualquiera" && " · el primero libre"}
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
                    {t.espera} min
                  </span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
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
            key={actual.numero}
            turno={actual}
            onCerrar={() => setHoja(false)}
            onGuardar={terminar}
          />
        )}
      </AnimatePresence>
      <Toast toast={toast} />
    </div>
  );
}

function TarjetaActual({
  fase,
  actual,
  segundos,
  pausa,
  enFila,
  onWhatsApp,
}: {
  fase: Fase;
  actual: TurnoFila | null;
  segundos: number;
  pausa: boolean;
  enFila: number;
  onWhatsApp: () => void;
}) {
  const servicio = actual ? buscarServicio(actual.servicio) : undefined;
  const transicion = {
    initial: { opacity: 0, y: 16, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -16, scale: 0.98 },
    transition: { type: "spring" as const, stiffness: 260, damping: 26 },
  };

  if (fase === "libre" || !actual) {
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
    const quedan = TOLERANCIA - segundos;
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
            <p className="text-sm">{servicio?.nombre}</p>
          </div>
          <Anillo valor={quedan / TOLERANCIA} texto={reloj(quedan)} etiqueta="para llegar" />
        </div>
        <button
          type="button"
          onClick={onWhatsApp}
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white/15 font-semibold ring-1 ring-white/25 transition hover:bg-white/25"
        >
          <MessageCircle className="size-5" /> Avisar por WhatsApp
        </button>
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
            {servicio?.nombre} · {servicio?.minutos} min aprox.
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
            {reloj(segundos + 12 * 60)}
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
        {detalle && <span className="mt-1 block text-sm opacity-85">{detalle}</span>}
      </span>
    </motion.button>
  );
}

function HojaTerminar({
  turno,
  onCerrar,
  onGuardar,
}: {
  turno: TurnoFila;
  onCerrar: () => void;
  onGuardar: (monto: number, metodo: Metodo) => void;
}) {
  const [servicio, setServicio] = useState(turno.servicio);
  const [monto, setMonto] = useState(String(buscarServicio(turno.servicio)?.precio ?? 0));
  const [metodo, setMetodo] = useState<Metodo>("efectivo");
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
        <h2 className="font-display text-5xl leading-[0.9] font-black uppercase">
          #{turno.numero} {turno.nombre}
        </h2>

        <p className="mt-6 text-sm text-tenue">Servicio</p>
        <div className="-mx-5 mt-2 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
          {servicios.map((s) => (
            <button
              key={s.id}
              type="button"
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
          disabled={monto === ""}
          onClick={() => onGuardar(Number(monto), metodo)}
          flecha={false}
        >
          Guardar y terminar
        </BotonPrincipal>
      </motion.section>
    </>
  );
}
