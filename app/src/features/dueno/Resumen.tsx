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
import { useState } from "react";
import { Link } from "react-router";
import { Franjas } from "@/components/Franjas";
import { NumeroAnimado } from "@/components/NumeroAnimado";
import { Avatar } from "@/components/Piezas";
import { fechaLarga, lempiras } from "@/lib/formato";
import { cx } from "@/lib/utilidades";
import { barberia, buscarBarbero, nombreDe, reporte, type TurnoFila } from "@/prototipo/datos";
import { useFilaEnVivo, useTitulo } from "@/prototipo/simulacion";

interface Indicador {
  titulo: string;
  valor: number;
  formato?: (n: number) => string;
  detalle: string;
  icono: LucideIcon;
  clase: string;
}

export function Resumen() {
  useTitulo(`Resumen del día · ${barberia.nombre}`);
  const [remota, setRemota] = useState(true);
  const { fila } = useFilaEnVivo(9000);

  const indicadores: Indicador[] = [
    {
      titulo: "Atendidos",
      valor: reporte.atendidos,
      detalle: "4 más que el lunes pasado",
      icono: Scissors,
      clase: "bg-poste-rojo text-white",
    },
    {
      titulo: "Ingresos registrados",
      valor: reporte.ingresos,
      formato: lempiras,
      detalle: `${lempiras(Math.round(reporte.ingresos / reporte.atendidos))} por cliente`,
      icono: Wallet,
      clase: "bg-tinta text-fondo",
    },
    {
      titulo: "Espera promedio",
      valor: reporte.esperaPromedio,
      formato: (n) => `${n} min`,
      detalle: "Meta: menos de 25 min",
      icono: Clock,
      clase: "bg-superficie ring-1 ring-borde",
    },
    {
      titulo: "Error del estimado",
      valor: reporte.errorEstimado,
      formato: (n) => `±${n} min`,
      detalle: "Acertó 8 de cada 10 turnos",
      icono: Target,
      clase: "bg-superficie ring-1 ring-borde",
    },
    {
      titulo: "Abandonos",
      valor: reporte.abandonos,
      detalle: "1 canceló · 1 no llegó",
      icono: UserX,
      clase: "bg-superficie ring-1 ring-borde",
    },
    {
      titulo: "En fila ahora",
      valor: fila.length,
      detalle: "Se actualiza en vivo",
      icono: Users,
      clase: "bg-poste-azul text-white",
    },
  ];

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
          onClick={() => setRemota((r) => !r)}
          className={cx(
            "flex items-center gap-4 rounded-[1.75rem] p-4 pr-6 text-left text-white transition-colors duration-500",
            remota ? "bg-poste-azul" : "bg-poste-rojo",
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
        {indicadores.map((ind, i) => (
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
              <NumeroAnimado valor={ind.valor} formato={ind.formato} desdeCero />
            </p>
            <p className="mt-2 text-sm opacity-80">{ind.detalle}</p>
          </motion.article>
        ))}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <section className="rounded-[2rem] bg-superficie p-6 ring-1 ring-borde">
          <h2 className="font-display text-4xl leading-none font-black uppercase">Por barbero</h2>
          <ul className="mt-6 grid gap-6">
            {reporte.porBarbero.map((fila, i) => {
              const barbero = buscarBarbero(fila.id);
              const maximo = Math.max(...reporte.porBarbero.map((b) => b.ingresos));
              return (
                <li key={fila.id}>
                  <div className="flex items-center gap-3">
                    <Avatar
                      nombre={barbero?.nombre ?? ""}
                      tono={barbero?.tono ?? "tinta"}
                      className="size-11 text-xl"
                    />
                    <p className="min-w-0 flex-1 font-display text-2xl font-extrabold uppercase">
                      {barbero?.nombre}
                    </p>
                    <p className="text-right">
                      <span className="block font-display text-2xl leading-none font-black">
                        {lempiras(fila.ingresos)}
                      </span>
                      <span className="text-xs text-tenue">
                        {fila.atendidos} cortes · espera {fila.espera} min
                      </span>
                    </p>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-superficie-2">
                    <motion.div
                      className={cx(
                        "h-full rounded-full",
                        barbero?.tono === "rojo"
                          ? "bg-poste-rojo"
                          : barbero?.tono === "azul"
                            ? "bg-poste-azul"
                            : "bg-tinta",
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${(fila.ingresos / maximo) * 100}%` }}
                      transition={{
                        delay: 0.3 + i * 0.12,
                        type: "spring",
                        stiffness: 50,
                        damping: 14,
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <HorasPico />
      </div>

      <FilaAhora fila={fila} />
    </div>
  );
}

function HorasPico() {
  const maximo = Math.max(...reporte.horas.map((h) => h.turnos));
  const pico = reporte.horas.find((h) => h.turnos === maximo);
  const resumen = reporte.horas.map((h) => `${h.etiqueta}: ${h.turnos}`).join(", ");
  return (
    <section className="rounded-[2rem] bg-superficie p-6 ring-1 ring-borde">
      <div className="flex items-end justify-between gap-3">
        <h2 className="font-display text-4xl leading-none font-black uppercase">Horas pico</h2>
        <p className="text-right text-sm text-tenue">
          Pico a las {pico?.etiqueta} p. m. · {maximo} turnos
        </p>
      </div>
      <div
        role="img"
        aria-label={`Turnos por hora: ${resumen}`}
        className="mt-8 flex h-52 items-end gap-1.5 sm:gap-2"
      >
        {reporte.horas.map((h, i) => {
          const esPico = h.turnos === maximo;
          return (
            <div key={h.etiqueta} className="flex h-full flex-1 flex-col justify-end gap-2">
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

function FilaAhora({ fila }: { fila: TurnoFila[] }) {
  const [nombres, setNombres] = useState<Record<number, string>>({});
  const [ocultos, setOcultos] = useState<Record<number, boolean>>({});
  const [editando, setEditando] = useState<number | null>(null);

  return (
    <section className="mt-6 rounded-[2rem] bg-superficie p-6 ring-1 ring-borde">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-4xl leading-tight font-black uppercase">Fila ahora</h2>
        <Link
          to={`/b/${barberia.slug}/tv`}
          className="text-sm font-semibold text-azul underline-offset-4 hover:underline"
        >
          Abrir la pantalla de TV
        </Link>
      </div>
      <p className="mt-2 text-sm text-tenue">
        Renombra un turno si el nombre no es apropiado, u ocúltalo de las pantallas públicas.
      </p>
      <ol className="mt-5 grid gap-2">
        {fila.map((t) => {
          const oculto = ocultos[t.numero] ?? false;
          const nombre = nombres[t.numero] ?? t.nombre;
          return (
            <motion.li
              key={t.numero}
              layout
              className={cx(
                "flex items-center gap-3 rounded-2xl bg-fondo px-4 py-3 ring-1 ring-borde",
                oculto && "opacity-50",
              )}
            >
              <span className="w-12 font-display text-xl font-black">#{t.numero}</span>
              {editando === t.numero ? (
                <input
                  aria-label={`Nuevo nombre para el turno ${t.numero}`}
                  defaultValue={nombre}
                  maxLength={40}
                  onBlur={(e) => {
                    setNombres((n) => ({ ...n, [t.numero]: e.target.value || t.nombre }));
                    setEditando(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                    if (e.key === "Escape") setEditando(null);
                  }}
                  ref={(el) => el?.focus()}
                  className="h-9 min-w-0 flex-1 rounded-lg bg-superficie px-2 font-semibold ring-2 ring-azul outline-none"
                />
              ) : (
                <span
                  className={cx(
                    "min-w-0 flex-1 font-semibold break-words",
                    oculto && "line-through",
                  )}
                >
                  {nombre}
                </span>
              )}
              <span className="hidden text-sm text-tenue sm:inline">
                {t.barbero === "cualquiera" ? "El primero" : nombreDe(t.barbero)}
              </span>
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
                  editando === t.numero ? "Guardar nombre" : `Renombrar el turno ${t.numero}`
                }
                onClick={() => setEditando(editando === t.numero ? null : t.numero)}
                className="grid size-9 place-items-center rounded-full ring-1 ring-borde transition hover:bg-superficie-2"
              >
                {editando === t.numero ? (
                  <Check className="size-4" />
                ) : (
                  <Pencil className="size-4" />
                )}
              </button>
              <button
                type="button"
                aria-label={
                  oculto ? `Mostrar el turno ${t.numero}` : `Ocultar el turno ${t.numero}`
                }
                aria-pressed={oculto}
                onClick={() => setOcultos((o) => ({ ...o, [t.numero]: !oculto }))}
                className="grid size-9 place-items-center rounded-full ring-1 ring-borde transition hover:bg-superficie-2"
              >
                {oculto ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
              </button>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
