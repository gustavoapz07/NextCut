import { Armchair, BellRing, Check, Scissors } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router";
import { BarraPoste, Poste } from "@/components/Franjas";
import { BotonMarca } from "@/components/Marco";
import { NoEncontrado } from "@/components/NoEncontrado";
import { NumeroAnimado } from "@/components/NumeroAnimado";
import { Boleto, Confeti } from "@/components/Piezas";
import { lempiras, rango, reloj } from "@/lib/formato";
import { cx } from "@/lib/utilidades";
import {
  barberia,
  buscarBarbero,
  buscarServicio,
  miTurno,
  nombreDe,
  type Preferencia,
} from "@/prototipo/datos";
import { useCronometro, useIntervalo, useTitulo } from "@/prototipo/simulacion";

type Fase = "esperando" | "llamado" | "en_silla" | "atendido";

const SECUENCIA: Array<{ fase: Fase; adelante: number }> = [
  { fase: "esperando", adelante: 2 },
  { fase: "esperando", adelante: 1 },
  { fase: "esperando", adelante: 0 },
  { fase: "llamado", adelante: 0 },
  { fase: "en_silla", adelante: 0 },
  { fase: "atendido", adelante: 0 },
];

/** `?estado=` abre la página directo en un estado; sin él, el turno avanza solo. */
const ESTADOS: Record<string, number> = { fila: 0, casi: 2, llamado: 3, silla: 4, listo: 5 };

const DURACION: Record<Fase, number> = {
  esperando: 6000,
  llamado: 8000,
  en_silla: 6000,
  atendido: 6000,
};

const ESTIMADOS: Array<[number, number]> = [
  [35, 45],
  [20, 30],
  [5, 10],
];

/** Personas delante en la fila visual, con claves estables para animarlas. */
const ADELANTE = [
  { id: "luis", inicial: "L" },
  { id: "daniel", inicial: "D" },
];

const TEMAS = {
  esperando: "bg-fondo text-tinta",
  casi: "bg-poste-azul text-white",
  llamado: "bg-poste-rojo text-white",
  en_silla: "bg-noche text-hueso",
  atendido: "bg-fondo text-tinta",
  cancelado: "bg-fondo text-tinta",
};

const COLOR_BARRA: Record<keyof typeof TEMAS, string> = {
  esperando: "#f3eee4",
  casi: "#2c4d96",
  llamado: "#b8312a",
  en_silla: "#0a0f24",
  atendido: "#f3eee4",
  cancelado: "#f3eee4",
};

interface DatosTurno {
  nombre: string;
  barbero: Preferencia;
  servicio: string;
}

/** Los datos llegan del formulario (estado de la navegación) o se usan los de ejemplo. */
function leerDatos(estado: unknown): DatosTurno {
  const datos = estado as Partial<DatosTurno> | null;
  return {
    nombre: datos?.nombre || miTurno.nombre,
    barbero: datos?.barbero ?? miTurno.barbero,
    servicio: datos?.servicio ?? miTurno.servicio,
  };
}

export function Turno() {
  const { codigo } = useParams();
  const [params] = useSearchParams();
  if (codigo !== miTurno.codigo) return <NoEncontrado />;
  const estado = params.get("estado");
  return <TurnoEnVivo key={estado ?? "auto"} estado={estado} />;
}

function TurnoEnVivo({ estado }: { estado: string | null }) {
  const { state } = useLocation();
  const datos = leerDatos(state);
  const [indice, setIndice] = useState(estado ? (ESTADOS[estado] ?? 0) : 0);
  const [cancelado, setCancelado] = useState(estado === "cancelado");
  const auto = estado === null && !cancelado;

  const paso = SECUENCIA[indice] ?? { fase: "esperando" as Fase, adelante: 2 };
  const fase = paso.fase;
  const tema: keyof typeof TEMAS = cancelado
    ? "cancelado"
    : fase === "esperando" && paso.adelante === 0
      ? "casi"
      : fase;

  // Con "el primero libre", el barbero se conoce al llamarlo.
  const asignado = datos.barbero === "cualquiera" ? "kevin" : datos.barbero;
  const barbero = buscarBarbero(asignado);
  const nombreBarbero = fase === "esperando" ? nombreDe(datos.barbero) : (barbero?.nombre ?? "");

  useTitulo(cancelado ? "Turno cancelado" : `Turno #${miTurno.numero}`);
  useIntervalo(
    () => setIndice((i) => Math.min(i + 1, SECUENCIA.length - 1)),
    auto && indice < SECUENCIA.length - 1 ? DURACION[fase] : null,
  );

  // La barra del navegador del celular cambia de color con el estado.
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    const anterior = meta?.getAttribute("content");
    meta?.setAttribute("content", COLOR_BARRA[tema]);
    return () => {
      if (anterior) meta?.setAttribute("content", anterior);
    };
  }, [tema]);

  const cancelar = useCallback(() => setCancelado(true), []);

  return (
    <div className={cx("min-h-dvh overflow-x-clip transition-colors duration-700", TEMAS[tema])}>
      <div className="mx-auto max-w-lg px-4 pb-16">
        <header className="flex items-center justify-between gap-4 pt-5">
          <BotonMarca />
          <span className="font-display text-lg font-extrabold uppercase">{barberia.nombre}</span>
        </header>

        <AnimatePresence mode="wait">
          {cancelado ? (
            <Cancelado key="cancelado" />
          ) : fase === "esperando" ? (
            <Esperando
              key="esperando"
              adelante={paso.adelante}
              datos={datos}
              nombreBarbero={nombreBarbero}
              onCancelar={cancelar}
            />
          ) : fase === "llamado" ? (
            <Llamado key="llamado" barbero={nombreBarbero} silla={barbero?.silla ?? 1} />
          ) : fase === "en_silla" ? (
            <EnSilla key="en_silla" barbero={nombreBarbero} />
          ) : (
            <Atendido key="atendido" />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const aparecer = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
  transition: { type: "spring" as const, stiffness: 200, damping: 24 },
};

function Esperando({
  adelante,
  datos,
  nombreBarbero,
  onCancelar,
}: {
  adelante: number;
  datos: DatosTurno;
  nombreBarbero: string;
  onCancelar: () => void;
}) {
  const [avisos, setAvisos] = useState(false);
  const servicio = buscarServicio(datos.servicio);
  const estimado = ESTIMADOS[2 - adelante] ?? [5, 10];
  const casi = adelante === 0;

  return (
    <motion.main {...aparecer}>
      <section className="pt-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={casi ? "casi" : "fila"}
            className="text-xl font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {casi ? "¡Ya casi, ve acercándote!" : `Hola, ${datos.nombre.replace(/\.$/, "")}. Vas`}
          </motion.p>
        </AnimatePresence>
        <div className="flex items-end gap-3">
          <span className="relative font-display text-[12rem] leading-[0.9] font-black">
            <NumeroAnimado valor={adelante + 1} />
            <span className="absolute top-2 -right-7 text-6xl">º</span>
          </span>
          <p className="mb-2 ml-6 font-display text-4xl leading-[0.9] font-extrabold uppercase">
            {casi ? (
              <>
                Eres el
                <br />
                siguiente
              </>
            ) : (
              <>
                en la fila
                <br />
                de {nombreBarbero}
              </>
            )}
          </p>
        </div>

        <FilaVisual adelante={adelante} />
      </section>

      <section className="mt-8 rounded-[1.75rem] bg-current/[0.06] p-5 ring-1 ring-current/10">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm opacity-75">Te toca en</p>
          <p className="font-display text-4xl leading-none font-extrabold">≈ {rango(estimado)}</p>
        </div>
        <BarraPoste
          valor={[0.25, 0.6, 0.92][2 - adelante] ?? 0.9}
          velocidad={casi ? 0.45 : 1.4}
          pista="bg-current/10"
          className="mt-4 h-4"
        />
        <p className="mt-3 text-sm opacity-80">
          {casi
            ? `Cuando ${nombreBarbero} termine con el #24, te llama.`
            : `${adelante} ${adelante === 1 ? "persona" : "personas"} antes que tú · ${nombreBarbero} va por el #24`}
        </p>
      </section>

      <Boleto
        className="mt-8"
        arriba={
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-base font-medium text-tenue">Tu número</p>
              <p className="font-display text-7xl leading-[0.9] font-black">#{miTurno.numero}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-tenue">Código</p>
              <p className="font-mono text-lg font-bold tracking-widest">{miTurno.codigo}</p>
            </div>
          </div>
        }
        abajo={
          <dl className="grid grid-cols-2 gap-4">
            {[
              ["Barbero", nombreBarbero],
              ["Servicio", servicio?.nombre ?? "—"],
              ["Te anotaste", miTurno.anotado],
              ["Precio", lempiras(servicio?.precio ?? 0)],
            ].map(([titulo, valor]) => (
              <div key={titulo}>
                <dt className="text-sm text-tenue">{titulo}</dt>
                <dd className="mt-0.5 font-display text-xl leading-none font-extrabold uppercase">
                  {valor}
                </dd>
              </div>
            ))}
          </dl>
        }
      />

      <div className="mt-6 grid gap-3">
        <button
          type="button"
          onClick={() => setAvisos(true)}
          className={cx(
            "flex min-h-14 items-center justify-center gap-2 rounded-full px-5 py-3 text-center font-semibold transition",
            avisos
              ? "bg-current/10 ring-1 ring-current/20"
              : casi
                ? "bg-white text-poste-azul"
                : "bg-tinta text-fondo",
          )}
        >
          <motion.span
            animate={avisos ? { rotate: [0, -25, 20, -14, 8, 0] } : { rotate: 0 }}
            transition={{ duration: 0.8 }}
          >
            {avisos ? <Check className="size-5" /> : <BellRing className="size-5" />}
          </motion.span>
          {avisos ? "Te avisamos a los 15 min y cuando te toque" : "Avisarme cuando falten 15 min"}
        </button>
        <MantenerParaCancelar onCancelar={onCancelar} />
      </div>
      <p className="mt-6 text-center text-sm opacity-70">
        Puedes cerrar esta página. Vuelve con el mismo enlace o el código{" "}
        <strong className="font-mono">{miTurno.codigo}</strong>.
      </p>
    </motion.main>
  );
}

function FilaVisual({ adelante }: { adelante: number }) {
  const delante = ADELANTE.slice(ADELANTE.length - adelante);
  return (
    <div className="mt-8 flex items-center gap-2.5" aria-hidden="true">
      <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-current/10">
        <Armchair className="size-8" />
      </div>
      <div className="h-0.5 w-6 shrink-0 border-t-2 border-dotted border-current opacity-40" />
      <AnimatePresence mode="popLayout" initial={false}>
        {delante.map((p) => (
          <motion.div
            key={p.id}
            layout
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ x: -70, scale: 0.3, opacity: 0, transition: { duration: 0.45 } }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="grid size-14 shrink-0 place-items-center rounded-full bg-current/15 font-display text-2xl font-bold"
          >
            {p.inicial}
          </motion.div>
        ))}
        <motion.div
          key="tu"
          layout
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="relative grid size-16 shrink-0 place-items-center rounded-full bg-poste-rojo font-display text-xl font-black text-white"
        >
          <span className="absolute inset-0 animate-latido rounded-full bg-poste-rojo" />
          <span className="relative">TÚ</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function MantenerParaCancelar({ onCancelar }: { onCancelar: () => void }) {
  const [presionando, setPresionando] = useState(false);

  useEffect(() => {
    if (!presionando) return;
    const id = window.setTimeout(onCancelar, 1400);
    return () => window.clearTimeout(id);
  }, [presionando, onCancelar]);

  return (
    <button
      type="button"
      onPointerDown={() => setPresionando(true)}
      onPointerUp={() => setPresionando(false)}
      onPointerLeave={() => setPresionando(false)}
      onKeyDown={(e) => {
        if ((e.key === " " || e.key === "Enter") && !e.repeat) setPresionando(true);
      }}
      onKeyUp={() => setPresionando(false)}
      onContextMenu={(e) => e.preventDefault()}
      className="relative h-14 touch-none overflow-hidden rounded-full font-semibold ring-1 ring-current/25 select-none"
    >
      <motion.span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 bg-poste-rojo"
        initial={false}
        animate={{ width: presionando ? "100%" : "0%" }}
        transition={{ duration: presionando ? 1.4 : 0.25, ease: "linear" }}
      />
      <span className={cx("relative transition-colors", presionando && "text-white")}>
        {presionando ? "Sigue presionando para cancelar…" : "Mantén presionado para cancelar"}
      </span>
    </button>
  );
}

function Llamado({ barbero, silla }: { barbero: string; silla: number }) {
  const segundos = useCronometro("llamado");
  return (
    <motion.main
      {...aparecer}
      className="relative flex min-h-[78dvh] flex-col items-center justify-center text-center"
    >
      <Confeti disparo={1} />
      <motion.p
        className="text-2xl font-medium"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Tu turno #{miTurno.numero}
      </motion.p>
      <motion.h1
        className="font-display text-[clamp(7rem,36vw,13rem)] leading-[0.9] font-black uppercase"
        initial={{ scale: 0.3, rotate: -10 }}
        animate={{ scale: [0.3, 1.12, 1], rotate: [-10, 3, 0] }}
        transition={{ duration: 0.7, times: [0, 0.6, 1] }}
      >
        <motion.span
          className="block"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.1, delay: 0.8 }}
        >
          ¡Te
          <br />
          toca!
        </motion.span>
      </motion.h1>
      <p className="mt-6 text-2xl">
        {barbero} te espera en la <strong>silla {silla}</strong>
      </p>
      <div className="mt-8 rounded-[1.75rem] bg-white/15 px-10 py-5">
        <p className="text-sm">Tienes para llegar</p>
        <p className="font-display text-7xl leading-none font-black tabular-nums">
          {reloj(300 - segundos)}
        </p>
      </div>
      <button
        type="button"
        className="mt-8 h-16 w-full rounded-full bg-white font-display text-2xl font-extrabold tracking-wide text-poste-rojo uppercase shadow-xl transition active:scale-[0.97]"
      >
        Ya voy en camino
      </button>
      <p className="mt-3 text-sm">Si no llegas a tiempo, pasa el siguiente de la fila.</p>
    </motion.main>
  );
}

function EnSilla({ barbero }: { barbero: string }) {
  const segundos = useCronometro("silla");
  return (
    <motion.main
      {...aparecer}
      className="flex min-h-[78dvh] flex-col items-center justify-center text-center"
    >
      <motion.div
        animate={{ rotate: [0, -22, 0] }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 0.5,
          repeatDelay: 0.5,
          ease: "easeInOut",
        }}
      >
        <Scissors className="size-24" strokeWidth={1.5} />
      </motion.div>
      <p className="mt-8 text-2xl font-medium">En la silla</p>
      <h1 className="font-display text-[clamp(3rem,15vw,4.5rem)] leading-[0.9] font-black uppercase">
        Disfruta
        <br />
        tu corte
      </h1>
      <p className="mt-5 text-hueso/80">
        {barbero} empezó hace <span className="tabular-nums">{reloj(segundos)}</span>
      </p>
      <Poste className="mt-10 h-36 w-9 text-hueso" velocidad={1.1} ancho={7} />
    </motion.main>
  );
}

function Atendido() {
  return (
    <motion.main {...aparecer} className="relative pt-14 text-center">
      <Confeti disparo={2} />
      <p className="font-display text-[clamp(2.5rem,13vw,3.75rem)] font-light text-rojo uppercase">
        ¡Quedaste
      </p>
      <h1 className="font-display text-[clamp(5rem,27vw,9rem)] leading-[0.9] font-black uppercase">
        fino!
      </h1>
      <div className="mt-10 grid grid-cols-2 gap-3 text-left">
        {[
          ["Esperaste", "41 min"],
          ["Estimamos", "35–45 min"],
        ].map(([titulo, valor]) => (
          <div key={titulo} className="rounded-[1.5rem] bg-superficie p-5 ring-1 ring-borde">
            <p className="text-sm text-tenue">{titulo}</p>
            <p className="mt-1 font-display text-4xl leading-none font-black">{valor}</p>
          </div>
        ))}
      </div>
      <p className="mt-8 text-lg text-tenue">
        Gracias por venir a {barberia.nombre}. ¡Vuelve pronto!
      </p>
      <Link
        to={`/b/${barberia.slug}`}
        className="mt-6 inline-flex h-14 items-center justify-center rounded-full px-8 font-display text-xl font-extrabold uppercase ring-2 ring-tinta transition hover:bg-tinta hover:text-fondo"
      >
        Ver la fila
      </Link>
    </motion.main>
  );
}

function Cancelado() {
  return (
    <motion.main {...aparecer} className="pt-16">
      <p className="text-2xl font-medium text-tenue">Listo,</p>
      <h1 className="font-display text-[clamp(3.5rem,19vw,6rem)] leading-[0.9] font-black uppercase">
        Turno
        <br />
        <span className="text-rojo">cancelado</span>
      </h1>
      <p className="mt-6 max-w-sm text-lg text-tenue">
        Liberaste tu lugar y los demás avanzaron un puesto. Gracias por avisar.
      </p>
      <Link
        to={`/b/${barberia.slug}/unirse`}
        className="mt-8 inline-flex h-14 items-center justify-center rounded-full bg-tinta px-8 font-display text-xl font-extrabold text-fondo uppercase"
      >
        Anotarme otra vez
      </Link>
    </motion.main>
  );
}
