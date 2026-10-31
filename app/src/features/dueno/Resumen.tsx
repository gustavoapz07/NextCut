import {
  Check,
  Clock,
  Eye,
  EyeOff,
  type LucideIcon,
  Pencil,
  QrCode,
  Scissors,
  Smartphone,
  Target,
  Users,
  UserX,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { Link } from "react-router";
import { Franjas } from "@/components/Franjas";
import { Cargando } from "@/components/Marco";
import { NumeroAnimado } from "@/components/NumeroAnimado";
import { Avatar, Toast, useToast } from "@/components/Piezas";
import { SinConexion } from "@/components/SinConexion";
import {
  type DatosResumen,
  horaCorta,
  horasDelDia,
  MENSAJES_DUENO,
  ocultarTurno,
  pausarFilaRemota,
  type ResultadoDueno,
  renombrarTurno,
  useResumen,
} from "@/lib/dueno";
import { tonoDe } from "@/lib/fila";
import { fechaLarga, lempiras } from "@/lib/formato";
import { useReloj, useTitulo } from "@/lib/ganchos";
import { cx } from "@/lib/utilidades";
import {
  barberia as barberiaPrototipo,
  buscarBarbero,
  nombreDe,
  reporte as reportePrototipo,
  type Tono,
} from "@/prototipo/datos";
import { useFilaEnVivo } from "@/prototipo/simulacion";
import { useContextoDueno } from "./contexto";

interface Indicador {
  titulo: string;
  /** `null`: todavía no hay con qué calcularlo. */
  valor: number | null;
  formato?: (n: number) => string;
  detalle: string;
  icono: LucideIcon;
  clase: string;
}

interface FilaVista {
  clave: string;
  numero: number;
  nombre: string;
  oculto: boolean;
  barbero: string;
  origen: "local" | "remoto";
  espera: number;
}

/** Todo lo que dibuja el resumen, venga del prototipo o de la base. */
interface VistaResumen {
  slug: string;
  remota: boolean;
  /** El cambio de la fila remota va en camino. */
  cambiandoRemota: boolean;
  indicadores: Indicador[];
  porBarbero: Array<{
    clave: string;
    nombre: string;
    tono: Tono;
    atendidos: number;
    ingresos: number;
    espera: number | null;
  }>;
  horas: Array<{ clave: string; etiqueta: string; texto: string; turnos: number }>;
  fila: FilaVista[];
}

interface AccionesResumen {
  alternarRemota: () => void;
  renombrar: (clave: string, nombre: string) => void;
  ocultar: (clave: string, oculto: boolean) => void;
}

const CLASES = {
  rojo: "bg-poste-rojo text-white",
  tinta: "bg-tinta text-fondo",
  suave: "bg-superficie ring-1 ring-borde",
  azul: "bg-poste-azul text-white",
};

export function Resumen() {
  const { modo, barberia } = useContextoDueno();
  if (modo === "prototipo" || !barberia.id) return <ResumenPrototipo />;
  return <ResumenReal barberiaId={barberia.id} />;
}

// ---------------------------------------------------------------------------------------------
// Resumen real
// ---------------------------------------------------------------------------------------------

const minutosDesde = (fecha: string, ahora: Date) =>
  Math.max(0, Math.round((ahora.getTime() - Date.parse(fecha)) / 60_000));

function vistaReal(datos: DatosResumen, ahora: Date): Omit<VistaResumen, "cambiandoRemota"> {
  const { barberia, reporte, barberos, turnos } = datos;
  const enFila = turnos.filter((t) => t.estado === "esperando");
  const cancelaron = reporte.abandonos - reporte.no_llegaron;
  return {
    slug: barberia.slug,
    remota: barberia.fila_remota_activa,
    indicadores: [
      {
        titulo: "Atendidos",
        valor: reporte.atendidos,
        detalle: `${reporte.turnos} ${reporte.turnos === 1 ? "turno" : "turnos"} hoy`,
        icono: Scissors,
        clase: CLASES.rojo,
      },
      {
        titulo: "Ingresos registrados",
        valor: reporte.ingresos,
        formato: lempiras,
        detalle:
          reporte.atendidos > 0
            ? `${lempiras(Math.round(reporte.ingresos / reporte.atendidos))} por cliente`
            : "Todavía sin cobros",
        icono: Wallet,
        clase: CLASES.tinta,
      },
      {
        titulo: "Espera promedio",
        valor: reporte.espera_promedio_min,
        formato: (n) => `${n} min`,
        detalle: "Desde que se anotan hasta que los llaman",
        icono: Clock,
        clase: CLASES.suave,
      },
      {
        titulo: "Error del estimado",
        valor: reporte.error_estimado_min,
        formato: (n) => `±${n} min`,
        detalle: "Diferencia con la espera real",
        icono: Target,
        clase: CLASES.suave,
      },
      {
        titulo: "Abandonos",
        valor: reporte.abandonos,
        detalle: `${reporte.no_llegaron} no ${reporte.no_llegaron === 1 ? "llegó" : "llegaron"} · ${cancelaron} ${cancelaron === 1 ? "canceló" : "cancelaron"}`,
        icono: UserX,
        clase: CLASES.suave,
      },
      {
        titulo: "En fila ahora",
        valor: enFila.length,
        detalle: "Se actualiza en vivo",
        icono: Users,
        clase: CLASES.azul,
      },
    ],
    porBarbero: reporte.por_barbero.map((b, i) => ({
      clave: b.barbero_id,
      nombre: b.nombre,
      tono: tonoDe(i),
      atendidos: b.atendidos,
      ingresos: b.ingresos,
      espera: b.espera_promedio_min,
    })),
    horas: horasDelDia(reporte.por_hora).map((h) => ({
      clave: String(h.hora),
      etiqueta: String(h.hora % 12 === 0 ? 12 : h.hora % 12),
      texto: horaCorta(h.hora),
      turnos: h.turnos,
    })),
    // Lo que ven las pantallas públicas: quien espera y quien ya fue llamado.
    fila: turnos
      .filter((t) => t.estado === "esperando" || t.estado === "llamado")
      .map((t) => ({
        clave: t.id,
        numero: t.numero,
        nombre: t.nombre,
        oculto: t.oculto,
        barbero:
          t.barbero_id === null
            ? "El primero"
            : (barberos.find((b) => b.id === t.barbero_id)?.nombre ?? "Barbero"),
        origen: t.origen,
        espera: minutosDesde(t.creado_en, ahora),
      })),
  };
}

function ResumenReal({ barberiaId }: { barberiaId: string }) {
  const { estado, recargar } = useResumen(barberiaId);
  const ahora = useReloj(30_000);
  const { toast, mostrar } = useToast();
  const [cambiandoRemota, setCambiandoRemota] = useState(false);
  useTitulo(
    estado.tipo === "listo"
      ? `Resumen del día · ${estado.datos.barberia.nombre}`
      : "Resumen del día",
  );

  if (estado.tipo === "cargando") return <Cargando />;
  if (estado.tipo === "error") {
    return (
      <SinConexion titulo="No pudimos cargar el resumen" alReintentar={() => void recargar()} />
    );
  }

  async function correr(accion: () => Promise<ResultadoDueno>, listo?: string) {
    const resultado = await accion();
    if (!resultado.ok) mostrar(MENSAJES_DUENO[resultado.error]);
    else if (listo) mostrar(listo);
    await recargar();
  }

  const vista: VistaResumen = { ...vistaReal(estado.datos, ahora), cambiandoRemota };
  const acciones: AccionesResumen = {
    alternarRemota: () => {
      setCambiandoRemota(true);
      void correr(
        () => pausarFilaRemota(barberiaId, vista.remota),
        vista.remota ? "Pausaste la fila remota" : "La fila remota está abierta otra vez",
      ).finally(() => setCambiandoRemota(false));
    },
    renombrar: (clave, nombre) => void correr(() => renombrarTurno(clave, nombre)),
    ocultar: (clave, oculto) => void correr(() => ocultarTurno(clave, oculto)),
  };

  return (
    <>
      <PantallaResumen vista={vista} acciones={acciones} />
      <Toast toast={toast} />
    </>
  );
}

// ---------------------------------------------------------------------------------------------
// Resumen del prototipo
// ---------------------------------------------------------------------------------------------

function ResumenPrototipo() {
  useTitulo(`Resumen del día · ${barberiaPrototipo.nombre}`);
  const [remota, setRemota] = useState(true);
  const [nombres, setNombres] = useState<Record<string, string>>({});
  const [ocultos, setOcultos] = useState<Record<string, boolean>>({});
  const { fila } = useFilaEnVivo(9000);
  const r = reportePrototipo;
  const pico = Math.max(...r.horas.map((h) => h.turnos));

  const vista: VistaResumen = {
    slug: barberiaPrototipo.slug,
    remota,
    cambiandoRemota: false,
    indicadores: [
      {
        titulo: "Atendidos",
        valor: r.atendidos,
        detalle: "4 más que el lunes pasado",
        icono: Scissors,
        clase: CLASES.rojo,
      },
      {
        titulo: "Ingresos registrados",
        valor: r.ingresos,
        formato: lempiras,
        detalle: `${lempiras(Math.round(r.ingresos / r.atendidos))} por cliente`,
        icono: Wallet,
        clase: CLASES.tinta,
      },
      {
        titulo: "Espera promedio",
        valor: r.esperaPromedio,
        formato: (n) => `${n} min`,
        detalle: "Meta: menos de 25 min",
        icono: Clock,
        clase: CLASES.suave,
      },
      {
        titulo: "Error del estimado",
        valor: r.errorEstimado,
        formato: (n) => `±${n} min`,
        detalle: "Acertó 8 de cada 10 turnos",
        icono: Target,
        clase: CLASES.suave,
      },
      {
        titulo: "Abandonos",
        valor: r.abandonos,
        detalle: "1 canceló · 1 no llegó",
        icono: UserX,
        clase: CLASES.suave,
      },
      {
        titulo: "En fila ahora",
        valor: fila.length,
        detalle: "Se actualiza en vivo",
        icono: Users,
        clase: CLASES.azul,
      },
    ],
    porBarbero: r.porBarbero.map((b) => {
      const barbero = buscarBarbero(b.id);
      return {
        clave: b.id,
        nombre: barbero?.nombre ?? "",
        tono: barbero?.tono ?? "tinta",
        atendidos: b.atendidos,
        ingresos: b.ingresos,
        espera: b.espera,
      };
    }),
    horas: r.horas.map((h) => ({
      clave: h.etiqueta,
      etiqueta: h.etiqueta,
      // En el prototipo el pico es de tarde.
      texto: `${h.etiqueta} ${h.turnos === pico ? "p. m." : ""}`.trim(),
      turnos: h.turnos,
    })),
    fila: fila.map((t) => ({
      clave: String(t.numero),
      numero: t.numero,
      nombre: nombres[t.numero] ?? t.nombre,
      oculto: ocultos[t.numero] ?? false,
      barbero: t.barbero === "cualquiera" ? "El primero" : nombreDe(t.barbero),
      origen: t.origen,
      espera: t.espera,
    })),
  };

  const acciones: AccionesResumen = {
    alternarRemota: () => setRemota((activa) => !activa),
    renombrar: (clave, nombre) => setNombres((n) => ({ ...n, [clave]: nombre })),
    ocultar: (clave, oculto) => setOcultos((o) => ({ ...o, [clave]: oculto })),
  };

  return <PantallaResumen vista={vista} acciones={acciones} />;
}

// ---------------------------------------------------------------------------------------------
// Pantalla
// ---------------------------------------------------------------------------------------------

function PantallaResumen({ vista, acciones }: { vista: VistaResumen; acciones: AccionesResumen }) {
  const { remota } = vista;
  const maximo = Math.max(1, ...vista.porBarbero.map((b) => b.ingresos));
  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-lg font-medium text-tenue">Hoy</p>
          <h1 className="font-display text-[clamp(3rem,10vw,5.5rem)] leading-[0.9] font-black uppercase">
            {fechaLarga(new Date())}
          </h1>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={remota}
          disabled={vista.cambiandoRemota}
          onClick={acciones.alternarRemota}
          className={cx(
            "flex items-center gap-4 rounded-[1.75rem] p-4 pr-6 text-left text-white transition-colors duration-500",
            remota ? "bg-poste-azul" : "bg-poste-rojo",
            vista.cambiandoRemota && "opacity-70",
          )}
        >
          <span
            className={cx(
              "flex h-8 w-14 shrink-0 rounded-full bg-white/25 p-1",
              remota ? "justify-end" : "justify-start",
            )}
          >
            <motion.span
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="size-6 rounded-full bg-white"
            />
          </span>
          <span>
            <span className="block font-display text-2xl leading-none font-extrabold uppercase">
              {remota ? "Fila remota abierta" : "Fila remota pausada"}
            </span>
            <span className="mt-1 block text-sm">
              {remota ? "Se anotan desde el celular y en el local" : "Solo se anotan en el local"}
            </span>
          </span>
        </button>
      </header>

      <section
        aria-label="Indicadores del día"
        className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-3"
      >
        {vista.indicadores.map((ind, i) => (
          <motion.article
            key={ind.titulo}
            className={cx("relative overflow-hidden rounded-[1.75rem] p-5", ind.clase)}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, type: "spring", stiffness: 140, damping: 18 }}
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-sm font-medium opacity-80">{ind.titulo}</h2>
              <ind.icono className="size-5 shrink-0 opacity-80" />
            </div>
            <p className="mt-4 font-display text-[clamp(2.75rem,7vw,4.5rem)] leading-none font-black">
              {ind.valor === null ? (
                "—"
              ) : (
                <NumeroAnimado valor={ind.valor} formato={ind.formato} desdeCero />
              )}
            </p>
            <p className="mt-2 text-sm opacity-80">{ind.detalle}</p>
          </motion.article>
        ))}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <section className="rounded-[2rem] bg-superficie p-6 ring-1 ring-borde">
          <h2 className="font-display text-4xl leading-none font-black uppercase">Por barbero</h2>
          {vista.porBarbero.length === 0 ? (
            <p className="mt-6 text-tenue">Todavía no hay barberos en esta barbería.</p>
          ) : (
            <ul className="mt-6 grid gap-6">
              {vista.porBarbero.map((b, i) => (
                <li key={b.clave}>
                  <div className="flex items-center gap-3">
                    <Avatar nombre={b.nombre} tono={b.tono} className="size-11 text-xl" />
                    <p className="min-w-0 flex-1 font-display text-2xl font-extrabold break-words uppercase">
                      {b.nombre}
                    </p>
                    <p className="text-right">
                      <span className="block font-display text-2xl leading-none font-black">
                        {lempiras(b.ingresos)}
                      </span>
                      <span className="text-xs text-tenue">
                        {b.atendidos} {b.atendidos === 1 ? "corte" : "cortes"}
                        {b.espera !== null ? ` · espera ${b.espera} min` : ""}
                      </span>
                    </p>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-superficie-2">
                    <motion.div
                      className={cx(
                        "h-full rounded-full",
                        b.tono === "rojo"
                          ? "bg-poste-rojo"
                          : b.tono === "azul"
                            ? "bg-poste-azul"
                            : "bg-tinta",
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${(b.ingresos / maximo) * 100}%` }}
                      transition={{
                        delay: 0.3 + i * 0.12,
                        type: "spring",
                        stiffness: 50,
                        damping: 14,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <HorasPico horas={vista.horas} />
      </div>

      <FilaAhora
        fila={vista.fila}
        slug={vista.slug}
        renombrar={acciones.renombrar}
        ocultar={acciones.ocultar}
      />
    </div>
  );
}

function HorasPico({ horas }: { horas: VistaResumen["horas"] }) {
  if (horas.length === 0) {
    return (
      <section className="rounded-[2rem] bg-superficie p-6 ring-1 ring-borde">
        <h2 className="font-display text-4xl leading-none font-black uppercase">Horas pico</h2>
        <p className="mt-6 text-tenue">Todavía no hay turnos hoy.</p>
      </section>
    );
  }
  const maximo = Math.max(...horas.map((h) => h.turnos));
  const pico = horas.find((h) => h.turnos === maximo);
  const resumen = horas.map((h) => `${h.texto}: ${h.turnos}`).join(", ");
  return (
    <section className="rounded-[2rem] bg-superficie p-6 ring-1 ring-borde">
      <div className="flex items-end justify-between gap-3">
        <h2 className="font-display text-4xl leading-none font-black uppercase">Horas pico</h2>
        <p className="text-right text-sm text-tenue">
          Pico a las {pico?.texto} · {maximo} {maximo === 1 ? "turno" : "turnos"}
        </p>
      </div>
      <div
        role="img"
        aria-label={`Turnos por hora: ${resumen}`}
        className="mt-8 flex h-52 items-end gap-1.5 sm:gap-2"
      >
        {horas.map((h, i) => {
          const esPico = h.turnos === maximo;
          return (
            <div key={h.clave} className="flex h-full flex-1 flex-col justify-end gap-2">
              <motion.div
                className={cx(
                  "relative overflow-hidden rounded-t-xl",
                  esPico ? "" : h.turnos >= maximo * 0.75 ? "bg-poste-azul" : "bg-tinta/15",
                )}
                initial={{ height: 0 }}
                animate={{ height: `${(h.turnos / maximo) * 100}%` }}
                transition={{ delay: 0.2 + i * 0.05, type: "spring", stiffness: 70, damping: 14 }}
              >
                {esPico && (
                  <Franjas vertical ancho={7} velocidad={1.4} className="absolute inset-0" />
                )}
              </motion.div>
              <span className="text-center text-xs text-tenue">{h.etiqueta}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FilaAhora({
  fila,
  slug,
  renombrar,
  ocultar,
}: { fila: FilaVista[]; slug: string } & Pick<AccionesResumen, "renombrar" | "ocultar">) {
  const [editando, setEditando] = useState<{ clave: string; valor: string } | null>(null);
  // Enter, el botón de guardar, Escape y perder el foco pueden llegar seguidos (al quitar el
  // campo, el navegador también avisa que perdió el foco): solo cuenta el primero.
  const cerrado = useRef(false);

  function abrir(t: FilaVista) {
    cerrado.current = false;
    setEditando({ clave: t.clave, valor: t.nombre });
  }

  function guardar() {
    if (!editando || cerrado.current) return;
    cerrado.current = true;
    const turno = fila.find((t) => t.clave === editando.clave);
    const nuevo = editando.valor.replace(/\s+/g, " ").trim();
    if (turno && nuevo && nuevo !== turno.nombre) renombrar(turno.clave, nuevo);
    setEditando(null);
  }

  function cancelar() {
    cerrado.current = true;
    setEditando(null);
  }

  return (
    <section className="mt-6 rounded-[2rem] bg-superficie p-6 ring-1 ring-borde">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-4xl leading-tight font-black uppercase">Fila ahora</h2>
        <Link
          to={`/b/${slug}/tv`}
          className="text-sm font-semibold text-azul underline-offset-4 hover:underline"
        >
          Abrir la pantalla de TV
        </Link>
      </div>
      <p className="mt-2 text-sm text-tenue">
        Renombra un turno si el nombre no es apropiado, u ocúltalo de las pantallas públicas.
      </p>
      {fila.length === 0 ? (
        <p className="mt-5 rounded-2xl bg-fondo px-4 py-5 text-center text-tenue ring-1 ring-borde">
          No hay nadie en la fila.
        </p>
      ) : (
        <ol className="mt-5 grid gap-2">
          {fila.map((t) => (
            <motion.li
              key={t.clave}
              layout
              className={cx(
                "flex items-center gap-3 rounded-2xl bg-fondo px-4 py-3 ring-1 ring-borde",
                t.oculto && "opacity-50",
              )}
            >
              <span className="w-12 font-display text-xl font-black">#{t.numero}</span>
              {editando?.clave === t.clave ? (
                <input
                  aria-label={`Nuevo nombre para el turno ${t.numero}`}
                  value={editando.valor}
                  maxLength={40}
                  onChange={(e) => setEditando({ clave: t.clave, valor: e.target.value })}
                  onBlur={guardar}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") guardar();
                    if (e.key === "Escape") cancelar();
                  }}
                  ref={(el) => el?.focus()}
                  className="h-9 min-w-0 flex-1 rounded-lg bg-superficie px-2 font-semibold ring-2 ring-azul outline-none"
                />
              ) : (
                <span
                  className={cx(
                    "min-w-0 flex-1 font-semibold break-words",
                    t.oculto && "line-through",
                  )}
                >
                  {t.nombre}
                </span>
              )}
              <span className="hidden text-sm text-tenue sm:inline">{t.barbero}</span>
              <span className="hidden items-center gap-1 text-xs text-tenue sm:flex">
                {t.origen === "local" ? (
                  <QrCode className="size-3.5" />
                ) : (
                  <Smartphone className="size-3.5" />
                )}
                {t.espera} min
              </span>
              <button
                type="button"
                aria-label={
                  editando?.clave === t.clave ? "Guardar nombre" : `Renombrar el turno ${t.numero}`
                }
                // Mientras se edita, el campo no pierde el foco al tocar el botón: guarda una vez.
                onMouseDown={(e) => {
                  if (editando?.clave === t.clave) e.preventDefault();
                }}
                onClick={() => (editando?.clave === t.clave ? guardar() : abrir(t))}
                className="grid size-9 place-items-center rounded-full ring-1 ring-borde transition hover:bg-superficie-2"
              >
                {editando?.clave === t.clave ? (
                  <Check className="size-4" />
                ) : (
                  <Pencil className="size-4" />
                )}
              </button>
              <button
                type="button"
                aria-label={
                  t.oculto ? `Mostrar el turno ${t.numero}` : `Ocultar el turno ${t.numero}`
                }
                aria-pressed={t.oculto}
                onClick={() => ocultar(t.clave, !t.oculto)}
                className="grid size-9 place-items-center rounded-full ring-1 ring-borde transition hover:bg-superficie-2"
              >
                {t.oculto ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
              </button>
            </motion.li>
          ))}
        </ol>
      )}
    </section>
  );
}
