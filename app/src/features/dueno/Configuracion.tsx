import { Mail, Minus, Plus, Trash2, UserPlus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useId, useState } from "react";
import { Avatar, claseCampo, Toast, useToast } from "@/components/Piezas";
import { cx } from "@/lib/utilidades";
import { barberia, barberos, DOMINIO, servicios, type Tono } from "@/prototipo/datos";
import { useTitulo } from "@/prototipo/simulacion";

const PESTANAS = [
  { id: "barberia", titulo: "Barbería" },
  { id: "barberos", titulo: "Barberos" },
  { id: "servicios", titulo: "Servicios" },
  { id: "fila", titulo: "Reglas de la fila" },
] as const;

type Pestana = (typeof PESTANAS)[number]["id"];

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export function Configuracion() {
  useTitulo("Configuración");
  const [pestana, setPestana] = useState<Pestana>("barberia");
  const [cambios, setCambios] = useState(false);
  const { toast, mostrar } = useToast();
  const marcar = () => setCambios(true);

  return (
    <div className="mx-auto max-w-4xl" onChangeCapture={marcar}>
      <p className="text-lg font-medium text-tenue">Tu barbería</p>
      <h1 className="font-display text-[clamp(3rem,10vw,5.5rem)] leading-[0.9] font-black uppercase">
        Configuración
      </h1>

      <div
        role="tablist"
        aria-label="Secciones de la configuración"
        className="mt-8 flex flex-wrap gap-1"
      >
        {PESTANAS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={pestana === p.id}
            onClick={() => setPestana(p.id)}
            className={cx(
              "relative shrink-0 rounded-full px-5 py-3 font-semibold transition-colors",
              pestana === p.id ? "text-fondo" : "text-tenue hover:text-tinta",
            )}
          >
            {pestana === p.id && (
              <motion.span
                layoutId="pestana-config"
                className="absolute inset-0 rounded-full bg-tinta"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{p.titulo}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={pestana}
          role="tabpanel"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22 }}
          className="mt-6"
        >
          {pestana === "barberia" && <DatosBarberia />}
          {pestana === "barberos" && <Equipo onCambio={marcar} />}
          {pestana === "servicios" && <Servicios onCambio={marcar} />}
          {pestana === "fila" && <ReglasFila onCambio={marcar} />}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {cambios && (
          <motion.div
            className="fixed inset-x-3 bottom-24 z-30 mx-auto flex max-w-xl items-center gap-3 rounded-full bg-tinta p-2 pl-5 text-fondo shadow-2xl lg:bottom-6"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            <p className="min-w-0 flex-1 text-sm font-semibold">Tienes cambios sin guardar</p>
            <button
              type="button"
              onClick={() => setCambios(false)}
              className="rounded-full px-4 py-2.5 text-sm font-semibold opacity-80 hover:opacity-100"
            >
              Descartar
            </button>
            <button
              type="button"
              onClick={() => {
                setCambios(false);
                mostrar("Cambios guardados");
              }}
              className="rounded-full bg-poste-rojo px-5 py-2.5 text-sm font-bold text-white"
            >
              Guardar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <Toast toast={toast} className="bottom-24 lg:bottom-6" />
    </div>
  );
}

function Tarjeta({
  titulo,
  texto,
  children,
}: {
  titulo: string;
  texto?: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-[2rem] bg-superficie p-6 ring-1 ring-borde">
      <h2 className="font-display text-3xl leading-none font-black uppercase">{titulo}</h2>
      {texto && <p className="mt-1 text-sm text-tenue">{texto}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Campo({ etiqueta, children }: { etiqueta: string; children: (id: string) => ReactNode }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {etiqueta}
      </label>
      {children(id)}
    </div>
  );
}

function Interruptor({
  activo,
  onCambiar,
  etiqueta,
}: {
  activo: boolean;
  onCambiar: () => void;
  etiqueta: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={etiqueta}
      onClick={onCambiar}
      className={cx(
        "flex h-8 w-14 shrink-0 rounded-full p-1 transition-colors",
        activo ? "justify-end bg-poste-azul" : "justify-start bg-superficie-2",
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="size-6 rounded-full bg-white shadow"
      />
    </button>
  );
}

function DatosBarberia() {
  const [abiertos, setAbiertos] = useState(DIAS.map((d) => d !== "Domingo"));
  return (
    <div className="grid grid-cols-1 gap-4">
      <Tarjeta titulo="Datos" texto="Así aparece tu barbería en la fila pública y en la TV.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo etiqueta="Nombre">
            {(id) => <input id={id} defaultValue={barberia.nombre} className={claseCampo} />}
          </Campo>
          <Campo etiqueta="Zona">
            {(id) => <input id={id} defaultValue={barberia.zona} className={claseCampo} />}
          </Campo>
          <div className="sm:col-span-2">
            <Campo etiqueta="Enlace de la fila">
              {(id) => (
                <div className="flex h-14 items-center rounded-2xl bg-superficie ring-1 ring-borde focus-within:ring-2 focus-within:ring-azul">
                  <span className="pl-4 text-tenue">{DOMINIO}/b/</span>
                  <input
                    id={id}
                    defaultValue={barberia.slug}
                    className="h-full min-w-0 flex-1 bg-transparent pr-4 text-lg font-semibold outline-none"
                  />
                </div>
              )}
            </Campo>
          </div>
        </div>
      </Tarjeta>

      <Tarjeta titulo="Horario" texto="Fuera de este horario la fila remota se cierra sola.">
        <ul className="grid gap-2">
          {DIAS.map((dia, i) => (
            <li
              key={dia}
              className="flex flex-wrap items-center gap-3 rounded-2xl bg-fondo px-4 py-3 ring-1 ring-borde"
            >
              <Interruptor
                etiqueta={`Abierto el ${dia.toLowerCase()}`}
                activo={abiertos[i] ?? false}
                onCambiar={() => setAbiertos((a) => a.map((v, j) => (j === i ? !v : v)))}
              />
              <span className="w-24 font-semibold">{dia}</span>
              {abiertos[i] ? (
                <span className="flex w-full items-center gap-2 text-sm sm:ml-auto sm:w-auto">
                  <input
                    type="time"
                    aria-label={`Abre el ${dia.toLowerCase()}`}
                    defaultValue={dia === "Sábado" ? "08:00" : "09:00"}
                    className="w-0 min-w-0 flex-1 rounded-lg bg-superficie px-2 py-1.5 ring-1 ring-borde sm:w-auto sm:flex-none"
                  />
                  <span className="text-tenue">a</span>
                  <input
                    type="time"
                    aria-label={`Cierra el ${dia.toLowerCase()}`}
                    defaultValue="19:00"
                    className="w-0 min-w-0 flex-1 rounded-lg bg-superficie px-2 py-1.5 ring-1 ring-borde sm:w-auto sm:flex-none"
                  />
                </span>
              ) : (
                <span className="ml-auto text-sm text-tenue">Cerrado</span>
              )}
            </li>
          ))}
        </ul>
      </Tarjeta>
    </div>
  );
}

interface Miembro {
  id: string;
  nombre: string;
  detalle: string;
  tono: Tono;
  pendiente: boolean;
}

function Equipo({ onCambio }: { onCambio: () => void }) {
  const [equipo, setEquipo] = useState<Miembro[]>(
    barberos.map((b) => ({
      id: b.id,
      nombre: b.nombre,
      detalle: `Silla ${b.silla} · ${b.apodo}`,
      tono: b.tono,
      pendiente: false,
    })),
  );
  const [correo, setCorreo] = useState("");
  const idCorreo = useId();

  function invitar() {
    const limpio = correo.trim();
    if (!limpio.includes("@")) return;
    setEquipo((e) => [
      ...e,
      { id: limpio, nombre: limpio, detalle: "Invitación enviada", tono: "tinta", pendiente: true },
    ]);
    setCorreo("");
    onCambio();
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <Tarjeta titulo="Tu equipo" texto="Cada barbero entra con su correo y solo ve sus turnos.">
        <ul className="grid gap-2">
          <AnimatePresence initial={false}>
            {equipo.map((m) => (
              <motion.li
                key={m.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3 rounded-2xl bg-fondo px-4 py-3 ring-1 ring-borde">
                  {m.pendiente ? (
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-superficie-2">
                      <Mail className="size-5" />
                    </span>
                  ) : (
                    <Avatar nombre={m.nombre} tono={m.tono} className="size-11 text-xl" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-xl leading-tight font-extrabold break-all uppercase">
                      {m.nombre}
                    </span>
                    <span className="text-sm text-tenue">{m.detalle}</span>
                  </span>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </Tarjeta>

      <Tarjeta titulo="Invitar barbero" texto="Le llega un correo para crear su contraseña.">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            invitar();
          }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <label htmlFor={idCorreo} className="sr-only">
            Correo del barbero
          </label>
          <input
            id={idCorreo}
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="correo@ejemplo.com"
            className={claseCampo}
          />
          <button
            type="submit"
            className="flex h-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-poste-rojo px-6 font-bold text-white transition active:scale-[0.97]"
          >
            <UserPlus className="size-5" /> Invitar
          </button>
        </form>
      </Tarjeta>
    </div>
  );
}

function Servicios({ onCambio }: { onCambio: () => void }) {
  const [lista, setLista] = useState(servicios.map((s) => ({ ...s })));

  function actualizar(id: string, cambio: Partial<(typeof lista)[number]>) {
    setLista((l) => l.map((s) => (s.id === id ? { ...s, ...cambio } : s)));
    onCambio();
  }

  return (
    <Tarjeta
      titulo="Servicios"
      texto="La duración alimenta el tiempo estimado mientras no haya historial."
    >
      <ul className="grid gap-2">
        <AnimatePresence initial={false}>
          {lista.map((s) => (
            <motion.li
              key={s.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: 60 }}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-fondo p-3 ring-1 ring-borde sm:grid-cols-[minmax(0,1fr)_auto_auto_auto]"
            >
              <input
                aria-label="Nombre del servicio"
                value={s.nombre}
                onChange={(e) => actualizar(s.id, { nombre: e.target.value })}
                className="h-11 min-w-0 rounded-xl bg-transparent px-3 font-display text-xl font-extrabold uppercase ring-1 ring-transparent outline-none focus:ring-azul"
              />
              <button
                type="button"
                aria-label={`Quitar ${s.nombre}`}
                onClick={() => {
                  setLista((l) => l.filter((x) => x.id !== s.id));
                  onCambio();
                }}
                className="grid size-10 place-items-center rounded-full text-tenue transition hover:bg-rojo/10 hover:text-rojo sm:order-last"
              >
                <Trash2 className="size-4" />
              </button>
              <div className="flex items-center gap-1 rounded-xl bg-superficie p-1 ring-1 ring-borde">
                <button
                  type="button"
                  aria-label={`Menos minutos para ${s.nombre}`}
                  onClick={() => actualizar(s.id, { minutos: Math.max(5, s.minutos - 5) })}
                  className="grid size-9 place-items-center rounded-lg hover:bg-superficie-2"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-16 text-center font-semibold tabular-nums">{s.minutos} min</span>
                <button
                  type="button"
                  aria-label={`Más minutos para ${s.nombre}`}
                  onClick={() => actualizar(s.id, { minutos: s.minutos + 5 })}
                  className="grid size-9 place-items-center rounded-lg hover:bg-superficie-2"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <label className="flex h-11 items-center gap-1 rounded-xl bg-superficie px-3 ring-1 ring-borde focus-within:ring-2 focus-within:ring-azul">
                <span className="text-tenue">L</span>
                <input
                  aria-label={`Precio de ${s.nombre}`}
                  value={s.precio}
                  inputMode="numeric"
                  onChange={(e) =>
                    actualizar(s.id, { precio: Number(e.target.value.replace(/\D/g, "")) })
                  }
                  className="w-14 bg-transparent font-semibold tabular-nums outline-none"
                />
              </label>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      <button
        type="button"
        onClick={() => {
          setLista((l) => [
            ...l,
            {
              id: `nuevo-${Date.now()}`,
              nombre: "Nuevo servicio",
              detalle: "",
              minutos: 20,
              precio: 100,
            },
          ]);
          onCambio();
        }}
        className="mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-borde font-semibold text-tenue transition hover:border-tinta hover:text-tinta"
      >
        <Plus className="size-5" /> Agregar servicio
      </button>
    </Tarjeta>
  );
}

function Deslizador({
  etiqueta,
  texto,
  valor,
  min,
  max,
  unidad,
  onCambio,
}: {
  etiqueta: string;
  texto: string;
  valor: number;
  min: number;
  max: number;
  unidad: string;
  onCambio: (valor: number) => void;
}) {
  const id = useId();
  return (
    <div className="rounded-2xl bg-fondo p-5 ring-1 ring-borde">
      <div className="flex items-start justify-between gap-4">
        <div>
          <label htmlFor={id} className="font-semibold">
            {etiqueta}
          </label>
          <p className="text-sm text-tenue">{texto}</p>
        </div>
        <p className="font-display text-5xl leading-none font-black tabular-nums">
          {valor}
          <span className="ml-1 text-xl font-bold text-tenue">{unidad}</span>
        </p>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={valor}
        onChange={(e) => onCambio(Number(e.target.value))}
        className="mt-4 w-full accent-poste-rojo"
      />
    </div>
  );
}

function ReglasFila({ onCambio }: { onCambio: () => void }) {
  const [maximo, setMaximo] = useState(20);
  const [tolerancia, setTolerancia] = useState(5);
  const [reglas, setReglas] = useState({ telefono: true, picos: true, tv: true });

  const opciones: Array<{ id: keyof typeof reglas; titulo: string; texto: string }> = [
    {
      id: "telefono",
      titulo: "Un turno activo por teléfono",
      texto: "Evita que alguien aparte varios lugares.",
    },
    {
      id: "picos",
      titulo: "Pausa automática ante picos",
      texto: "Si llegan demasiados turnos de golpe, pausamos la fila remota y te avisamos.",
    },
    {
      id: "tv",
      titulo: "Mostrar la fila en la TV",
      texto: "Solo número, nombre corto y barbero. Nunca teléfonos.",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4">
      <Tarjeta titulo="Reglas de la fila">
        <div className="grid gap-3">
          <Deslizador
            etiqueta="Tamaño máximo de la fila"
            texto="Al llegar a este número, nadie más se puede anotar."
            valor={maximo}
            min={5}
            max={40}
            unidad="personas"
            onCambio={setMaximo}
          />
          <Deslizador
            etiqueta="Tolerancia para llegar"
            texto="Minutos que esperamos a alguien llamado antes de marcar “no llegó”."
            valor={tolerancia}
            min={2}
            max={15}
            unidad="min"
            onCambio={setTolerancia}
          />
        </div>
      </Tarjeta>
      <Tarjeta titulo="Protección">
        <ul className="grid gap-2">
          {opciones.map((o) => (
            <li
              key={o.id}
              className="flex items-center gap-4 rounded-2xl bg-fondo px-4 py-4 ring-1 ring-borde"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{o.titulo}</span>
                <span className="block text-sm text-tenue">{o.texto}</span>
              </span>
              <Interruptor
                etiqueta={o.titulo}
                activo={reglas[o.id]}
                onCambiar={() => {
                  setReglas((r) => ({ ...r, [o.id]: !r[o.id] }));
                  onCambio();
                }}
              />
            </li>
          ))}
        </ul>
      </Tarjeta>
    </div>
  );
}
