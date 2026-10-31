import { rangoDe, simular } from "@shared/eta";
import type { FilaPublica } from "@shared/filaPublica";
import { Armchair, BellRing, Check, Scissors } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router";
import { BarraPoste, Poste } from "@/components/Franjas";
import { BotonMarca, Cargando } from "@/components/Marco";
import { NoEncontrado } from "@/components/NoEncontrado";
import { NumeroAnimado } from "@/components/NumeroAnimado";
import { Boleto, Confeti } from "@/components/Piezas";
import { SinConexion } from "@/components/SinConexion";
import { type EstadoAvisos, useAvisos } from "@/lib/avisos";
import { useTurno } from "@/lib/enVivo";
import { entradaEta } from "@/lib/fila";
import { hora, lempiras, rango, reloj } from "@/lib/formato";
import { useIntervalo, useReloj, useTitulo } from "@/lib/ganchos";
import { avisarQueToca, cancelarTurno, type TurnoPublico } from "@/lib/turno";
import { leerSecreto } from "@/lib/unirse";
import { cx } from "@/lib/utilidades";
import {
  barberia,
  buscarBarbero,
  buscarServicio,
  miTurno,
  nombreDe,
  type Preferencia,
} from "@/prototipo/datos";

type Fase =
  | "esperando"
  | "llamado"
  | "en_silla"
  | "atendido"
  | "cancelado"
  | "no_llego"
  | "abandono";
type Rango = readonly [number, number];

/** Todo lo que dibuja la página, venga del prototipo o de la base. */
interface VistaTurno {
  barberia: { nombre: string; slug: string };
  numero: number;
  codigo: string;
  nombre: string;
  fase: Fase;
  /** Personas que pasan antes, con clave estable para animarlas (las más cercanas al final). */
  delante: { id: string; inicial: string }[];
  adelante: number;
  /** `null` mientras espera con "el primero libre". */
  barbero: string | null;
  /** El número que tiene su barbero en la silla, si se sabe. */
  atendiendo: number | null;
  /** Qué está haciendo su barbero; `null` si no se sabe (todavía no llegó la fila). */
  estadoBarbero: "atendiendo" | "libre" | "pausa" | null;
  silla: number | null;
  servicio: string;
  precio: number;
  anotado: string;
  estimado: Rango | null;
  /** Hora (ms) en que lo llamaron y en que se sentó; sin ella se cuenta desde que se abre. */
  llamadoDesde?: number;
  enSillaDesde?: number;
  toleranciaMin: number;
  esperaste: number | null;
  estimamos: Rango | null;
  /** Se puede cancelar desde este teléfono. */
  cancelable: boolean;
  /** Piezas del prototipo que todavía no hacen nada de verdad ("Ya voy en camino"). */
  simulado: boolean;
}

/** Avisos por Web Push: en qué está el botón y qué hace al tocarlo. */
interface ControlAvisos {
  estado: EstadoAvisos;
  activar: () => void;
  /** Muestra un aviso de prueba en el teléfono, sin pasar por el servidor. */
  probar: () => void;
  /** Ya se mandó el de prueba: la página dice qué revisar si no apareció. */
  prueba: boolean;
}

interface Acciones {
  onCancelar: () => void;
  errorCancelar: boolean;
  avisos: ControlAvisos;
}

export function Turno() {
  const { codigo = "" } = useParams();
  const [params] = useSearchParams();
  // El turno del prototipo de diseño sigue simulado; los demás vienen de la base.
  if (codigo === miTurno.codigo) {
    const estado = params.get("estado");
    return <TurnoPrototipo key={estado ?? "auto"} estado={estado} />;
  }
  return <TurnoReal codigo={codigo} />;
}

// ---------------------------------------------------------------------------------------------
// Turno real
// ---------------------------------------------------------------------------------------------

function TurnoReal({ codigo }: { codigo: string }) {
  const { estado, recargar } = useTurno(codigo);
  const ahora = useReloj(30_000);
  const [secreto] = useState(() => leerSecreto(codigo));
  const [errorCancelar, setErrorCancelar] = useState(false);
  const { estado: estadoAvisos, activar, probar, prueba } = useAvisos(codigo, secreto);

  useTitulo(
    estado.tipo !== "listo"
      ? "Turno"
      : estado.turno.estado === "cancelado"
        ? "Turno cancelado"
        : `Turno #${estado.turno.numero}`,
  );

  const cancelar = useCallback(async () => {
    if (!secreto) return;
    setErrorCancelar(false);
    if (await cancelarTurno(codigo, secreto)) void recargar();
    else setErrorCancelar(true);
  }, [codigo, secreto, recargar]);

  if (estado.tipo === "cargando") return <Cargando />;
  if (estado.tipo === "no_existe") return <NoEncontrado />;
  if (estado.tipo === "error") {
    return <SinConexion titulo="No pudimos cargar tu turno" alReintentar={() => void recargar()} />;
  }

  const vista = vistaReal(estado.turno, estado.fila, codigo, ahora, secreto !== null);
  return (
    <PantallaTurno
      vista={vista}
      onCancelar={() => void cancelar()}
      errorCancelar={errorCancelar}
      avisos={{
        estado: estadoAvisos,
        activar: () => void activar(),
        probar: () => void probar(),
        prueba,
      }}
    />
  );
}

const minutosEntre = (desde: string, hasta: string) =>
  Math.max(0, Math.round((Date.parse(hasta) - Date.parse(desde)) / 60_000));

function vistaReal(
  turno: TurnoPublico,
  fila: FilaPublica | null,
  codigo: string,
  ahora: Date,
  conSecreto: boolean,
): VistaTurno {
  // Quienes pasan antes, con la misma regla que `ver_turno`: su barbero o "el primero libre".
  const antes = (fila?.fila ?? []).filter(
    (t) =>
      t.numero !== turno.numero &&
      Date.parse(t.creado_en) <= Date.parse(turno.creado_en) &&
      (turno.barbero_id === null || t.barbero_id === null || t.barbero_id === turno.barbero_id),
  );
  const estimado = fila ? simular(entradaEta(fila, ahora)).get(turno.numero) : undefined;
  const suBarbero = fila?.barberos.find((b) => b.id === turno.barbero_id);

  return {
    barberia: turno.barberia,
    numero: turno.numero,
    codigo,
    nombre: turno.nombre,
    fase: turno.estado,
    delante: antes.slice(-3).map((t) => ({
      id: String(t.numero),
      inicial: t.nombre?.charAt(0).toUpperCase() || "•",
    })),
    adelante: turno.adelante,
    barbero: turno.barbero,
    atendiendo: suBarbero?.atendiendo?.numero ?? null,
    estadoBarbero: !suBarbero
      ? null
      : suBarbero.en_pausa
        ? "pausa"
        : suBarbero.atendiendo
          ? "atendiendo"
          : "libre",
    silla: turno.silla,
    servicio: turno.servicio,
    precio: turno.precio_ref,
    anotado: hora(new Date(turno.creado_en)),
    estimado: estimado?.minutos != null ? rangoDe(estimado.minutos) : null,
    llamadoDesde: turno.llamado_en ? Date.parse(turno.llamado_en) : undefined,
    enSillaDesde: turno.inicio_en ? Date.parse(turno.inicio_en) : undefined,
    toleranciaMin: turno.barberia.tolerancia_min,
    esperaste: turno.inicio_en ? minutosEntre(turno.creado_en, turno.inicio_en) : null,
    estimamos: turno.estimado_min === null ? null : rangoDe(turno.estimado_min),
    cancelable: conSecreto && (turno.estado === "esperando" || turno.estado === "llamado"),
    simulado: false,
  };
}

// ---------------------------------------------------------------------------------------------
// Turno del prototipo
// ---------------------------------------------------------------------------------------------

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

const DURACION: Partial<Record<Fase, number>> = {
  esperando: 6000,
  llamado: 8000,
  en_silla: 6000,
  atendido: 6000,
};

const ESTIMADOS: Rango[] = [
  [35, 45],
  [20, 30],
  [5, 10],
];

/** Personas delante en la fila visual, con claves estables para animarlas. */
const ADELANTE = [
  { id: "luis", inicial: "L" },
  { id: "daniel", inicial: "D" },
];

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

function TurnoPrototipo({ estado }: { estado: string | null }) {
  const { state } = useLocation();
  const datos = leerDatos(state);
  const [indice, setIndice] = useState(estado ? (ESTADOS[estado] ?? 0) : 0);
  const [cancelado, setCancelado] = useState(estado === "cancelado");
  // En el prototipo los avisos se simulan: se encienden al tocar el botón.
  const [avisos, setAvisos] = useState<EstadoAvisos>("apagados");
  const [prueba, setPrueba] = useState(false);
  const auto = estado === null && !cancelado;

  const paso = SECUENCIA[indice] ?? { fase: "esperando" as Fase, adelante: 2 };
  // Con "el primero libre", el barbero se conoce al llamarlo.
  const asignado = datos.barbero === "cualquiera" ? "kevin" : datos.barbero;
  const barbero = buscarBarbero(asignado);
  const servicio = buscarServicio(datos.servicio);

  useTitulo(cancelado ? "Turno cancelado" : `Turno #${miTurno.numero}`);
  useIntervalo(
    () => setIndice((i) => Math.min(i + 1, SECUENCIA.length - 1)),
    auto && indice < SECUENCIA.length - 1 ? (DURACION[paso.fase] ?? null) : null,
  );

  const vista: VistaTurno = {
    barberia: { nombre: barberia.nombre, slug: barberia.slug },
    numero: miTurno.numero,
    codigo: miTurno.codigo,
    nombre: datos.nombre,
    fase: cancelado ? "cancelado" : paso.fase,
    delante: ADELANTE.slice(ADELANTE.length - paso.adelante),
    adelante: paso.adelante,
    barbero: paso.fase === "esperando" ? nombreDe(datos.barbero) : (barbero?.nombre ?? ""),
    atendiendo: 24,
    estadoBarbero: "atendiendo",
    silla: barbero?.silla ?? 1,
    servicio: servicio?.nombre ?? "—",
    precio: servicio?.precio ?? 0,
    anotado: miTurno.anotado,
    estimado: ESTIMADOS[2 - paso.adelante] ?? [5, 10],
    toleranciaMin: 5,
    esperaste: 41,
    estimamos: [35, 45],
    cancelable: true,
    simulado: true,
  };

  return (
    <PantallaTurno
      vista={vista}
      onCancelar={() => setCancelado(true)}
      errorCancelar={false}
      avisos={{
        estado: avisos,
        activar: () => setAvisos("activos"),
        // En el prototipo no hay service worker: solo se muestra la explicación.
        probar: () => setPrueba(true),
        prueba,
      }}
    />
  );
}

// ---------------------------------------------------------------------------------------------
// Pantallas
// ---------------------------------------------------------------------------------------------

const TEMAS = {
  esperando: "bg-fondo text-tinta",
  casi: "bg-poste-azul text-white",
  llamado: "bg-poste-rojo text-white",
  en_silla: "bg-noche text-hueso",
  final: "bg-fondo text-tinta",
};

const COLOR_BARRA: Record<keyof typeof TEMAS, string> = {
  esperando: "#f3eee4",
  casi: "#2c4d96",
  llamado: "#b8312a",
  en_silla: "#0a0f24",
  final: "#f3eee4",
};

function PantallaTurno({
  vista,
  onCancelar,
  errorCancelar,
  avisos,
}: { vista: VistaTurno } & Acciones) {
  const { fase } = vista;
  const tema: keyof typeof TEMAS =
    fase === "esperando"
      ? vista.adelante === 0
        ? "casi"
        : "esperando"
      : fase === "llamado" || fase === "en_silla"
        ? fase
        : "final";

  // La barra del navegador del celular cambia de color con el estado.
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    const anterior = meta?.getAttribute("content");
    meta?.setAttribute("content", COLOR_BARRA[tema]);
    return () => {
      if (anterior) meta?.setAttribute("content", anterior);
    };
  }, [tema]);

  // Sonido y vibración cuando le toca (una vez por llamada).
  const faseAnterior = useRef<Fase | null>(null);
  useEffect(() => {
    if (fase === "llamado" && faseAnterior.current !== "llamado") avisarQueToca();
    faseAnterior.current = fase;
  }, [fase]);

  return (
    <div className={cx("min-h-dvh overflow-x-clip transition-colors duration-700", TEMAS[tema])}>
      <div className="mx-auto max-w-lg px-4 pb-16">
        <header className="flex items-center justify-between gap-4 pt-5">
          <BotonMarca />
          <span className="min-w-0 truncate font-display text-lg font-extrabold uppercase">
            {vista.barberia.nombre}
          </span>
        </header>

        <AnimatePresence mode="wait">
          {fase === "esperando" ? (
            <Esperando
              key="esperando"
              vista={vista}
              onCancelar={onCancelar}
              errorCancelar={errorCancelar}
              avisos={avisos}
            />
          ) : fase === "llamado" ? (
            <Llamado
              key="llamado"
              vista={vista}
              onCancelar={onCancelar}
              errorCancelar={errorCancelar}
              avisos={avisos}
            />
          ) : fase === "en_silla" ? (
            <EnSilla key="en_silla" vista={vista} />
          ) : fase === "atendido" ? (
            <Atendido key="atendido" vista={vista} />
          ) : (
            <Terminado key={fase} vista={vista} />
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

function Esperando({ vista, onCancelar, errorCancelar, avisos }: { vista: VistaTurno } & Acciones) {
  const { adelante, barbero, atendiendo } = vista;
  const casi = adelante === 0;
  const progreso = casi ? 0.92 : Math.max(0.08, 0.9 / (adelante + 1));

  const detalle = casi
    ? !barbero
      ? "Te llama el primer barbero que quede libre."
      : vista.estadoBarbero === "libre"
        ? `${barbero} está libre: te llama en cualquier momento.`
        : vista.estadoBarbero === "pausa"
          ? `${barbero} está en pausa: te llama cuando vuelva.`
          : `Cuando ${barbero} termine${atendiendo ? ` con el #${atendiendo}` : ""}, te llama.`
    : `${adelante} ${adelante === 1 ? "persona" : "personas"} antes que tú${
        barbero && atendiendo ? ` · ${barbero} va por el #${atendiendo}` : ""
      }`;

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
            {casi ? "¡Ya casi, ve acercándote!" : `Hola, ${vista.nombre.replace(/\.$/, "")}. Vas`}
          </motion.p>
        </AnimatePresence>
        <div className="flex items-end gap-3">
          <span className="relative font-display text-[12rem] leading-[0.9] font-black">
            <NumeroAnimado valor={adelante + 1} />
            <span className="absolute top-2 -right-7 text-6xl">º</span>
          </span>
          <p className="mb-2 ml-6 min-w-0 font-display text-4xl leading-[0.9] font-extrabold break-words uppercase">
            {casi ? (
              <>
                Eres el
                <br />
                siguiente
              </>
            ) : barbero ? (
              <>
                en la fila
                <br />
                de {barbero}
              </>
            ) : (
              "en la fila"
            )}
          </p>
        </div>

        <FilaVisual delante={vista.delante} restantes={adelante - vista.delante.length} />
      </section>

      <section className="mt-8 rounded-[1.75rem] bg-current/[0.06] p-5 ring-1 ring-current/10">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm opacity-75">Te toca en</p>
          <p className="font-display text-4xl leading-none font-extrabold">
            {vista.estimado ? `≈ ${rango(vista.estimado)}` : "Por confirmar"}
          </p>
        </div>
        <BarraPoste
          valor={progreso}
          velocidad={casi ? 0.45 : 1.4}
          pista="bg-current/10"
          className="mt-4 h-4"
        />
        <p className="mt-3 text-sm opacity-80">{detalle}</p>
      </section>

      <Boleto
        className="mt-8"
        arriba={
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-base font-medium text-tenue">Tu número</p>
              <p className="font-display text-7xl leading-[0.9] font-black">#{vista.numero}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-tenue">Código</p>
              <p className="font-mono text-lg font-bold tracking-widest">{vista.codigo}</p>
            </div>
          </div>
        }
        abajo={
          <dl className="grid grid-cols-2 gap-4">
            {[
              ["Barbero", barbero ?? "El primero libre"],
              ["Servicio", vista.servicio],
              ["Te anotaste", vista.anotado],
              ["Precio", lempiras(vista.precio)],
            ].map(([titulo, valor]) => (
              <div key={titulo} className="min-w-0">
                <dt className="text-sm text-tenue">{titulo}</dt>
                <dd className="mt-0.5 font-display text-xl leading-none font-extrabold break-words uppercase">
                  {valor}
                </dd>
              </div>
            ))}
          </dl>
        }
      />

      <div className="mt-6 grid gap-3">
        <BotonAvisos avisos={avisos} casi={casi} />
        <Cancelar vista={vista} onCancelar={onCancelar} errorCancelar={errorCancelar} />
      </div>
      <p className="mt-6 text-center text-sm opacity-70">
        {vista.simulado || avisos.estado === "activos"
          ? "Puedes cerrar esta página."
          : "Deja esta página abierta para ver tu turno al día."}{" "}
        Vuelve con el mismo enlace o el código <strong className="font-mono">{vista.codigo}</strong>
        .
      </p>
    </motion.main>
  );
}

/** "Avisarme cuando falten 15 min": pide permiso, se suscribe y explica si no se puede. */
function BotonAvisos({ avisos, casi }: { avisos: ControlAvisos; casi: boolean }) {
  const { estado } = avisos;
  if (estado === "oculto") return null;
  if (estado === "bloqueados") {
    return (
      <p className="text-center text-sm opacity-80">
        Bloqueaste los avisos de esta página. Si los quieres, actívalos en los ajustes del
        navegador.
      </p>
    );
  }
  if (estado === "instalar") {
    return (
      <p className="rounded-[1.25rem] bg-current/[0.06] px-4 py-3 text-center text-sm ring-1 ring-current/10">
        <BellRing className="mr-1 inline size-4 align-[-2px]" aria-hidden="true" />
        En iPhone los avisos llegan si agregas esta página a tu pantalla de inicio: toca{" "}
        <strong>Compartir</strong> y luego <strong>Agregar a pantalla de inicio</strong>.
      </p>
    );
  }

  const activos = estado === "activos";
  return (
    <>
      <button
        type="button"
        onClick={avisos.activar}
        disabled={activos || estado === "activando"}
        className={cx(
          "flex min-h-14 items-center justify-center gap-2 rounded-full px-5 py-3 text-center font-semibold transition",
          activos
            ? "bg-current/10 ring-1 ring-current/20"
            : casi
              ? "bg-white text-poste-azul"
              : "bg-tinta text-fondo",
          estado === "activando" && "opacity-70",
        )}
      >
        <motion.span
          animate={activos ? { rotate: [0, -25, 20, -14, 8, 0] } : { rotate: 0 }}
          transition={{ duration: 0.8 }}
        >
          {activos ? <Check className="size-5" /> : <BellRing className="size-5" />}
        </motion.span>
        {activos
          ? "Te avisamos a los 15 min y cuando te toque"
          : estado === "activando"
            ? "Activando los avisos…"
            : "Avisarme cuando falten 15 min"}
      </button>
      {estado === "error" && (
        <p role="alert" className="text-center text-sm font-semibold">
          No pudimos activar los avisos. Revisa tu conexión e inténtalo de nuevo.
        </p>
      )}
      {activos && (
        <div className="text-center text-sm">
          <button
            type="button"
            onClick={avisos.probar}
            className="min-h-11 px-3 font-semibold underline underline-offset-4"
          >
            Probar el aviso
          </button>
          {avisos.prueba && (
            <p role="status" className="opacity-80">
              Te mandamos uno de prueba. Si no apareció, activa las notificaciones de tu navegador
              en los ajustes del teléfono.
            </p>
          )}
        </div>
      )}
    </>
  );
}

function Cancelar({
  vista,
  onCancelar,
  errorCancelar,
}: { vista: VistaTurno } & Omit<Acciones, "avisos">) {
  if (!vista.cancelable) {
    return (
      <p className="text-center text-sm opacity-70">
        Para cancelar, abre esta página en el teléfono con el que te anotaste.
      </p>
    );
  }
  return (
    <>
      <MantenerParaCancelar onCancelar={onCancelar} />
      {errorCancelar && (
        <p role="alert" className="text-center text-sm font-semibold">
          No pudimos cancelar tu turno. Revisa tu conexión e inténtalo de nuevo.
        </p>
      )}
    </>
  );
}

function FilaVisual({
  delante,
  restantes,
}: {
  delante: VistaTurno["delante"];
  /** Personas antes que no caben en la fila visual. */
  restantes: number;
}) {
  return (
    <div className="mt-8 flex items-center gap-2.5" aria-hidden="true">
      <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-current/10">
        <Armchair className="size-8" />
      </div>
      <div className="h-0.5 w-6 shrink-0 border-t-2 border-dotted border-current opacity-40" />
      <AnimatePresence mode="popLayout" initial={false}>
        {restantes > 0 && (
          <motion.div
            key="mas"
            layout
            className="grid size-11 shrink-0 place-items-center rounded-full bg-current/10 text-sm font-bold"
          >
            +{restantes}
          </motion.div>
        )}
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
  // La pantalla se redibuja cada segundo (el reloj de "Te toca"); eso no debe reiniciar la espera.
  const accion = useRef(onCancelar);
  useEffect(() => {
    accion.current = onCancelar;
  });

  useEffect(() => {
    if (!presionando) return;
    const id = window.setTimeout(() => accion.current(), 1400);
    return () => window.clearTimeout(id);
  }, [presionando]);

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

/** Segundos desde `desde` (ms); sin ella, desde que se montó la pantalla. */
function useSegundosDesde(desde: number | undefined) {
  const [montado] = useState(() => Date.now());
  const ahora = useReloj(1000);
  return Math.floor((ahora.getTime() - (desde ?? montado)) / 1000);
}

function Llamado({ vista, onCancelar, errorCancelar }: { vista: VistaTurno } & Acciones) {
  const segundos = useSegundosDesde(vista.llamadoDesde);
  const restante = vista.toleranciaMin * 60 - segundos;
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
        Tu turno #{vista.numero}
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
        {vista.barbero} te espera
        {vista.silla ? (
          <>
            {" "}
            en la <strong>silla {vista.silla}</strong>
          </>
        ) : null}
      </p>
      <div className="mt-8 rounded-[1.75rem] bg-white/15 px-10 py-5">
        <p className="text-sm">
          {restante > 0 ? "Tienes para llegar" : "Ve ya, te están esperando"}
        </p>
        <p className="font-display text-7xl leading-none font-black tabular-nums">
          {reloj(restante)}
        </p>
      </div>
      {vista.simulado && (
        <button
          type="button"
          className="mt-8 h-16 w-full rounded-full bg-white font-display text-2xl font-extrabold tracking-wide text-poste-rojo uppercase shadow-xl transition active:scale-[0.97]"
        >
          Ya voy en camino
        </button>
      )}
      <p className="mt-3 text-sm">Si no llegas a tiempo, pasa el siguiente de la fila.</p>
      {!vista.simulado && (
        <div className="mt-8 grid w-full gap-3">
          <Cancelar vista={vista} onCancelar={onCancelar} errorCancelar={errorCancelar} />
        </div>
      )}
    </motion.main>
  );
}

function EnSilla({ vista }: { vista: VistaTurno }) {
  const segundos = useSegundosDesde(vista.enSillaDesde);
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
        {vista.barbero} empezó hace <span className="tabular-nums">{reloj(segundos)}</span>
      </p>
      <Poste className="mt-10 h-36 w-9 text-hueso" velocidad={1.1} ancho={7} />
    </motion.main>
  );
}

function Atendido({ vista }: { vista: VistaTurno }) {
  const datos = [
    ["Esperaste", vista.esperaste === null ? null : `${vista.esperaste} min`],
    ["Estimamos", vista.estimamos ? rango(vista.estimamos) : null],
  ].filter((dato): dato is [string, string] => dato[1] !== null);
  return (
    <motion.main {...aparecer} className="relative pt-14 text-center">
      <Confeti disparo={2} />
      <p className="font-display text-[clamp(2.5rem,13vw,3.75rem)] font-light text-rojo uppercase">
        ¡Quedaste
      </p>
      <h1 className="font-display text-[clamp(5rem,27vw,9rem)] leading-[0.9] font-black uppercase">
        fino!
      </h1>
      {datos.length > 0 && (
        <div className="mt-10 grid grid-cols-2 gap-3 text-left">
          {datos.map(([titulo, valor]) => (
            <div key={titulo} className="rounded-[1.5rem] bg-superficie p-5 ring-1 ring-borde">
              <p className="text-sm text-tenue">{titulo}</p>
              <p className="mt-1 font-display text-4xl leading-none font-black">{valor}</p>
            </div>
          ))}
        </div>
      )}
      <p className="mt-8 text-lg text-tenue">
        Gracias por venir a {vista.barberia.nombre}. ¡Vuelve pronto!
      </p>
      <Link
        to={`/b/${vista.barberia.slug}`}
        className="mt-6 inline-flex h-14 items-center justify-center rounded-full px-8 font-display text-xl font-extrabold uppercase ring-2 ring-tinta transition hover:bg-tinta hover:text-fondo"
      >
        Ver la fila
      </Link>
    </motion.main>
  );
}

const FINALES: Record<
  "cancelado" | "no_llego" | "abandono",
  { arriba: string; titulo: [string, string]; texto: string }
> = {
  cancelado: {
    arriba: "Listo,",
    titulo: ["Turno", "cancelado"],
    texto: "Liberaste tu lugar y los demás avanzaron un puesto. Gracias por avisar.",
  },
  no_llego: {
    arriba: "Lo sentimos,",
    titulo: ["Se pasó", "tu turno"],
    texto: "Te llamamos y no llegaste a tiempo, así que pasó el siguiente de la fila.",
  },
  abandono: {
    arriba: "Por hoy,",
    titulo: ["Fila", "cerrada"],
    texto: "La barbería cerró la fila del día antes de que te tocara.",
  },
};

function Terminado({ vista }: { vista: VistaTurno }) {
  const final = FINALES[vista.fase as keyof typeof FINALES] ?? FINALES.cancelado;
  return (
    <motion.main {...aparecer} className="pt-16">
      <p className="text-2xl font-medium text-tenue">{final.arriba}</p>
      <h1 className="font-display text-[clamp(3.5rem,19vw,6rem)] leading-[0.9] font-black uppercase">
        {final.titulo[0]}
        <br />
        <span className="text-rojo">{final.titulo[1]}</span>
      </h1>
      <p className="mt-6 max-w-sm text-lg text-tenue">{final.texto}</p>
      <Link
        to={`/b/${vista.barberia.slug}/unirse`}
        className="mt-8 inline-flex h-14 items-center justify-center rounded-full bg-tinta px-8 font-display text-xl font-extrabold text-fondo uppercase"
      >
        Anotarme otra vez
      </Link>
    </motion.main>
  );
}
