import { ArrowUpRight, Check, Megaphone, MessageCircle, Play, UserX } from "lucide-react";
import { type FormEvent, useId, useState } from "react";
import { Link } from "react-router";
import { Avatar } from "@/components/Piezas";
import { lempiras } from "@/lib/formato";
import type { MetodoPago } from "@/lib/panel";
import { cx } from "@/lib/utilidades";
import type { Tono } from "@/prototipo/datos";

// Atender una silla desde el resumen del dueño, cuando el barbero no puede (ADR-019): llamar al
// siguiente, empezar, marcar "no llegó" y terminar con el cobro. Son las mismas funciones de la
// base que usa el panel del barbero, y la base deja que el dueño las use en cualquier silla suya.

export interface TurnoSilla {
  clave: string;
  numero: number;
  nombre: string;
  estado: "llamado" | "en_silla";
  servicioId: string | null;
  /** Enlace de WhatsApp con el aviso ya escrito, si el cliente dejó número. */
  whatsapp: string | null;
}

export interface SillaVista {
  clave: string;
  nombre: string;
  silla: number | null;
  tono: Tono;
  enPausa: boolean;
  actual: TurnoSilla | null;
  enFila: number;
  /** "#12 Ana P.": a quien llamaría ahora. */
  siguiente: string | null;
  /** El panel del barbero en esa silla, para quien prefiera la pantalla completa. */
  panel: string | null;
}

export interface ServicioSilla {
  id: string;
  nombre: string;
  precio: number;
}

export interface AccionesSilla {
  llamar: (barberoId: string) => Promise<void>;
  empezar: (turnoId: string) => Promise<void>;
  noLlego: (turnoId: string) => Promise<void>;
  terminar: (
    turnoId: string,
    monto: number,
    metodo: MetodoPago,
    servicioId: string,
  ) => Promise<void>;
  quitarPausa: (barberoId: string) => Promise<void>;
}

const METODOS: Array<{ id: MetodoPago; texto: string }> = [
  { id: "efectivo", texto: "Efectivo" },
  { id: "transferencia", texto: "Transferencia" },
  { id: "tarjeta", texto: "Tarjeta" },
];

export function Sillas({
  sillas,
  servicios,
  acciones,
}: {
  sillas: SillaVista[];
  servicios: ServicioSilla[];
  acciones: AccionesSilla;
}) {
  if (sillas.length === 0) return null;
  return (
    <section aria-labelledby="titulo-sillas" className="mt-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 id="titulo-sillas" className="font-display text-4xl leading-none font-black uppercase">
          Sillas
        </h2>
        <p className="text-sm text-tenue">
          Si un barbero no puede, llama a sus clientes desde aquí.
        </p>
      </div>
      <ul className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {sillas.map((s) => (
          <TarjetaSilla key={s.clave} silla={s} servicios={servicios} acciones={acciones} />
        ))}
      </ul>
    </section>
  );
}

const claseBoton =
  "flex h-12 items-center justify-center gap-2 rounded-full px-4 text-sm font-bold transition disabled:opacity-50";

function TarjetaSilla({
  silla: s,
  servicios,
  acciones,
}: {
  silla: SillaVista;
  servicios: ServicioSilla[];
  acciones: AccionesSilla;
}) {
  const [ocupado, setOcupado] = useState(false);
  const [terminando, setTerminando] = useState(false);

  async function correr(accion: () => Promise<void>) {
    setOcupado(true);
    try {
      await accion();
    } finally {
      setOcupado(false);
    }
  }

  const estado = s.enPausa
    ? { texto: "En pausa", clase: "bg-superficie-2 text-tenue" }
    : s.actual?.estado === "en_silla"
      ? { texto: "Atendiendo", clase: "bg-poste-azul text-white" }
      : s.actual
        ? { texto: "Llamado", clase: "bg-poste-rojo text-white" }
        : { texto: "Libre", clase: "bg-tinta text-fondo" };

  return (
    <li
      aria-label={`Silla de ${s.nombre}`}
      className="flex min-w-0 flex-col rounded-[1.75rem] bg-superficie p-5 ring-1 ring-borde"
    >
      <div className="flex items-center gap-3">
        <Avatar nombre={s.nombre} tono={s.tono} className="size-11 shrink-0 text-xl" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-2xl leading-none font-extrabold break-words uppercase">
            {s.nombre}
          </p>
          <p className="mt-1 text-sm text-tenue">{s.silla ? `Silla ${s.silla}` : "Sin silla"}</p>
        </div>
        <span className={cx("shrink-0 rounded-full px-3 py-1 text-xs font-bold", estado.clase)}>
          {estado.texto}
        </span>
      </div>

      <div className="mt-4 flex-1">
        {s.actual ? (
          <p className="font-semibold break-words">
            <span className="text-tenue tabular-nums">#{s.actual.numero}</span> {s.actual.nombre}
          </p>
        ) : (
          <>
            <p className="text-sm text-tenue">
              {s.enFila === 0 ? "Nadie en su fila" : `${s.enFila} en su fila`}
            </p>
            {s.siguiente && <p className="mt-0.5 font-semibold break-words">Sigue {s.siguiente}</p>}
          </>
        )}
      </div>

      <div className="mt-4 grid gap-2">
        {s.enPausa && !s.actual ? (
          <button
            type="button"
            disabled={ocupado}
            onClick={() => void correr(() => acciones.quitarPausa(s.clave))}
            className={cx(claseBoton, "ring-1 ring-borde")}
          >
            <Play className="size-4" /> Quitar pausa
          </button>
        ) : !s.actual ? (
          <button
            type="button"
            disabled={ocupado || s.enFila === 0}
            onClick={() => void correr(() => acciones.llamar(s.clave))}
            className={cx(claseBoton, "bg-primario text-sobre-primario")}
          >
            <Megaphone className="size-4" />
            {ocupado ? "Llamando…" : "Llamar siguiente"}
          </button>
        ) : s.actual.estado === "llamado" ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={ocupado}
                onClick={() => {
                  const actual = s.actual;
                  if (actual) void correr(() => acciones.empezar(actual.clave));
                }}
                className={cx(claseBoton, "bg-tinta text-fondo")}
              >
                <Play className="size-4" /> Empezar
              </button>
              <button
                type="button"
                disabled={ocupado}
                onClick={() => {
                  const actual = s.actual;
                  if (!actual) return;
                  if (!window.confirm(`¿Marcar que ${actual.nombre} no llegó?`)) return;
                  void correr(() => acciones.noLlego(actual.clave));
                }}
                className={cx(claseBoton, "ring-1 ring-borde")}
              >
                <UserX className="size-4" /> No llegó
              </button>
            </div>
            {s.actual.whatsapp && (
              <a
                href={s.actual.whatsapp}
                target="_blank"
                rel="noreferrer"
                className={cx(claseBoton, "ring-1 ring-borde")}
              >
                <MessageCircle className="size-4" /> Avisarle por WhatsApp
              </a>
            )}
          </>
        ) : terminando ? (
          <Terminar
            turno={s.actual}
            servicios={servicios}
            ocupado={ocupado}
            onCancelar={() => setTerminando(false)}
            onTerminar={(monto, metodo, servicioId) => {
              const actual = s.actual;
              if (!actual) return;
              void correr(async () => {
                await acciones.terminar(actual.clave, monto, metodo, servicioId);
                setTerminando(false);
              });
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setTerminando(true)}
            className={cx(claseBoton, "bg-tinta text-fondo")}
          >
            <Check className="size-4" /> Terminar y cobrar
          </button>
        )}
        {s.panel && (
          <Link
            to={s.panel}
            className="flex items-center justify-center gap-1 pt-1 text-xs font-semibold text-tenue hover:text-tinta"
          >
            Abrir su panel completo <ArrowUpRight className="size-3.5" />
          </Link>
        )}
      </div>
    </li>
  );
}

function Terminar({
  turno,
  servicios,
  ocupado,
  onCancelar,
  onTerminar,
}: {
  turno: TurnoSilla;
  servicios: ServicioSilla[];
  ocupado: boolean;
  onCancelar: () => void;
  onTerminar: (monto: number, metodo: MetodoPago, servicioId: string) => void;
}) {
  const inicial = servicios.find((x) => x.id === turno.servicioId) ?? servicios[0] ?? null;
  const [servicioId, setServicioId] = useState(inicial?.id ?? "");
  const [monto, setMonto] = useState(String(inicial?.precio ?? ""));
  const [metodo, setMetodo] = useState<MetodoPago>("efectivo");
  const ids = { servicio: useId(), monto: useId() };

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    const valor = Number(monto);
    if (!servicioId || !Number.isFinite(valor) || valor < 0) return;
    onTerminar(valor, metodo, servicioId);
  }

  return (
    <form onSubmit={enviar} className="grid gap-3 rounded-2xl bg-fondo p-3 ring-1 ring-borde">
      <div>
        <label htmlFor={ids.servicio} className="mb-1 block text-xs font-semibold">
          Servicio
        </label>
        <select
          id={ids.servicio}
          value={servicioId}
          onChange={(e) => {
            setServicioId(e.target.value);
            const elegido = servicios.find((x) => x.id === e.target.value);
            if (elegido) setMonto(String(elegido.precio));
          }}
          className="h-11 w-full rounded-xl bg-superficie px-3 ring-1 ring-borde outline-none focus:ring-2 focus:ring-azul"
        >
          {servicios.map((x) => (
            <option key={x.id} value={x.id}>
              {x.nombre} · {lempiras(x.precio)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={ids.monto} className="mb-1 block text-xs font-semibold">
          Cobrado (L)
        </label>
        <input
          id={ids.monto}
          inputMode="decimal"
          required
          value={monto}
          onChange={(e) => setMonto(e.target.value.replace(/[^\d.]/g, "").slice(0, 8))}
          className="h-11 w-full rounded-xl bg-superficie px-3 font-semibold tabular-nums ring-1 ring-borde outline-none focus:ring-2 focus:ring-azul"
        />
      </div>
      <fieldset>
        <legend className="mb-1 text-xs font-semibold">Forma de pago</legend>
        <div className="grid grid-cols-3 gap-1">
          {METODOS.map((m) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={metodo === m.id}
              onClick={() => setMetodo(m.id)}
              className={cx(
                "h-10 rounded-xl text-xs font-semibold ring-1 ring-borde",
                metodo === m.id ? "bg-tinta text-fondo" : "bg-superficie",
              )}
            >
              {m.texto}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={onCancelar} className={cx(claseBoton, "ring-1 ring-borde")}>
          Cancelar
        </button>
        <button
          type="submit"
          disabled={ocupado || !servicioId}
          className={cx(claseBoton, "bg-tinta text-fondo")}
        >
          {ocupado ? "Guardando…" : "Terminar"}
        </button>
      </div>
    </form>
  );
}
