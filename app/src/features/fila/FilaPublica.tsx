import { rangoDe } from "@shared/eta";
import {
  ArrowRight,
  Clock,
  MapPin,
  PauseCircle,
  Scissors,
  ShieldCheck,
  UserPlus,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { BarraPoste, Franjas } from "@/components/Franjas";
import { BotonMarca, Cargando } from "@/components/Marco";
import { NoEncontrado } from "@/components/NoEncontrado";
import { NumeroAnimado } from "@/components/NumeroAnimado";
import { Avatar, EnlacePrincipal } from "@/components/Piezas";
import { SinConexion } from "@/components/SinConexion";
import { useFilaPublica } from "@/lib/enVivo";
import { detalleBarbero, resumirFila, tonoDe } from "@/lib/fila";
import { duracion, rango, redondear5 } from "@/lib/formato";
import { useReloj, useTitulo } from "@/lib/ganchos";
import { cx } from "@/lib/utilidades";
import { barberia, estimar, nombreDe, type Tono } from "@/prototipo/datos";
import { useFilaEnVivo } from "@/prototipo/simulacion";

export function FilaPublica() {
  const { slug = "" } = useParams();
  // La barbería del prototipo de diseño sigue con datos simulados; las demás vienen de la base.
  if (slug === barberia.slug) return <FilaPrototipo />;
  return <FilaReal slug={slug} />;
}

function FilaReal({ slug }: { slug: string }) {
  const { estado, recargar } = useFilaPublica(slug);
  // El QR de la puerta lleva ?origen=qr: quien está en el local puede anotarse aunque la fila
  // en línea esté pausada.
  const [params] = useSearchParams();
  const local = params.get("origen") === "qr";
  // El estimado depende de la hora aunque nadie toque nada.
  const ahora = useReloj(30_000);
  useTitulo(estado.tipo === "lista" ? `${estado.datos.barberia.nombre} · fila en vivo` : "Fila");

  if (estado.tipo === "cargando") return <Cargando />;
  if (estado.tipo === "no_existe") return <NoEncontrado />;
  if (estado.tipo === "error") return <SinConexion alReintentar={() => void recargar()} />;

  const { datos } = estado;
  const { porBarbero, primeroLibre, masRapido } = resumirFila(datos, ahora);
  const nombres = new Map(datos.barberos.map((b) => [b.id, b.nombre]));
  const cerrada = !(local || datos.barberia.fila_remota_activa)
    ? "pausada"
    : datos.fila.length >= datos.barberia.max_fila
      ? "llena"
      : null;

  return (
    <VistaFila
      nombre={datos.barberia.nombre}
      zona={datos.barberia.zona}
      enFila={datos.fila.length}
      masRapido={
        masRapido && { nombre: masRapido.barbero.nombre, rango: rangoDe(masRapido.minutos) }
      }
      primeroLibre={primeroLibre.minutos === null ? null : redondear5(primeroLibre.minutos)}
      barberos={porBarbero.map(({ barbero, enFila, estimado }, i) => ({
        id: barbero.id,
        nombre: barbero.nombre,
        detalle: detalleBarbero(barbero),
        tono: tonoDe(i),
        enFila,
        minutos: estimado.minutos === null ? null : redondear5(estimado.minutos),
      }))}
      fila={datos.fila.map((t) => ({
        numero: t.numero,
        // La base ya lo manda como "Carlos M."; `null` si el dueño lo ocultó.
        nombre: t.nombre ?? "Cliente",
        barbero: t.barbero_id ? (nombres.get(t.barbero_id) ?? "Su barbero") : "El primero",
      }))}
      cerrada={cerrada}
      local={local}
    />
  );
}

function FilaPrototipo() {
  useTitulo(`${barberia.nombre} · fila en vivo`);
  const { fila, barberos, evento } = useFilaEnVivo();

  const estimados = barberos.map((barbero) => ({
    barbero,
    enFila: fila.filter((t) => t.barbero === barbero.id).length,
    estimado: estimar(barbero, fila),
  }));
  const masRapido = [...estimados].sort((a, b) => a.estimado[0] - b.estimado[0])[0];
  const sinPreferencia = fila.filter((t) => t.barbero === "cualquiera").length;

  return (
    <VistaFila
      nombre={barberia.nombre}
      zona={barberia.zona}
      cierra={barberia.cierra}
      aviso={
        <AnimatePresence mode="popLayout" initial={false}>
          {evento && (
            <motion.p
              key={evento.id}
              initial={{ y: 28, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -28, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="inline-flex max-w-full items-center gap-2 rounded-[1.25rem] bg-superficie py-2 pr-4 pl-2 text-sm ring-1 ring-borde"
            >
              <span
                className={cx(
                  "grid size-6 shrink-0 place-items-center rounded-full text-white",
                  evento.tipo === "llega" ? "bg-poste-azul" : "bg-poste-rojo",
                )}
              >
                {evento.tipo === "llega" ? (
                  <UserPlus className="size-3.5" />
                ) : (
                  <Scissors className="size-3.5" />
                )}
              </span>
              <span>
                <strong>{evento.nombre}</strong>{" "}
                {evento.tipo === "llega"
                  ? "se anotó en la fila"
                  : `pasó a la silla de ${nombreDe(evento.barbero)}`}
              </span>
            </motion.p>
          )}
        </AnimatePresence>
      }
      enFila={fila.length}
      masRapido={masRapido && { nombre: masRapido.barbero.nombre, rango: masRapido.estimado }}
      primeroLibre={masRapido ? masRapido.estimado[0] + sinPreferencia * 5 : 10}
      barberos={estimados.map(({ barbero, enFila, estimado }) => ({
        id: barbero.id,
        nombre: barbero.nombre,
        detalle: `${barbero.apodo} · ${
          barbero.estado === "pausa" ? "en pausa" : `atendiendo al #${barbero.atendiendo}`
        }`,
        tono: barbero.tono,
        enFila,
        minutos: estimado[0],
      }))}
      fila={fila.map((t) => ({
        numero: t.numero,
        nombre: t.nombre,
        barbero: t.barbero === "cualquiera" ? "El primero" : nombreDe(t.barbero),
      }))}
      cerrada={null}
      local={false}
    />
  );
}

interface VistaFilaProps {
  nombre: string;
  zona: string | null;
  cierra?: string;
  /** Lo último que pasó en la fila (solo el prototipo lo tiene por ahora). */
  aviso?: ReactNode;
  enFila: number;
  masRapido: { nombre: string; rango: readonly [number, number] } | null | undefined;
  /** Minutos para "el primero libre"; `null` si no hay barberos disponibles. */
  primeroLibre: number | null;
  barberos: {
    id: string;
    nombre: string;
    detalle: string;
    tono: Tono;
    enFila: number;
    minutos: number | null;
  }[];
  fila: { numero: number; nombre: string; barbero: string }[];
  /** Por qué no se puede anotar desde el celular, si es el caso. */
  cerrada: "pausada" | "llena" | null;
  /** Llegó por el QR de la puerta. */
  local: boolean;
}

function VistaFila({
  nombre,
  zona,
  cierra,
  aviso,
  enFila,
  masRapido,
  primeroLibre,
  barberos,
  fila,
  cerrada,
  local,
}: VistaFilaProps) {
  const abierta = cerrada === null;
  const unirse = (barbero?: string) => {
    const params = new URLSearchParams();
    if (barbero) params.set("barbero", barbero);
    if (local) params.set("origen", "qr");
    const consulta = params.toString();
    return consulta ? `unirse?${consulta}` : "unirse";
  };

  return (
    <div className="min-h-dvh pb-36">
      <div className="mx-auto max-w-lg">
        <header className="flex items-center px-4 pt-5">
          <BotonMarca />
        </header>

        <section className="px-4 pt-8">
          <motion.p
            className="text-lg font-medium text-tenue"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Barbería
          </motion.p>
          <motion.h1
            className="font-display text-[clamp(4.5rem,25vw,8.5rem)] leading-[0.9] font-black tracking-tight break-words uppercase"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 90, damping: 14 }}
          >
            {nombre}
          </motion.h1>
          {(zona || cierra) && (
            <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-tenue">
              {zona && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" /> {zona}
                </span>
              )}
              {cierra && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4" /> Abierto hasta {cierra}
                </span>
              )}
            </p>
          )}
        </section>

        <div aria-live="polite" className="mt-6 min-h-11 px-4">
          {aviso}
        </div>

        <section aria-labelledby="t-fila" className="mt-4 px-4">
          <motion.div
            className="relative overflow-hidden rounded-[2rem] bg-tinta px-6 pt-8 pb-6 text-fondo shadow-[0_24px_50px_-24px_rgb(13_20_48/0.7)]"
            initial={{ rotate: 0, scale: 0.96, opacity: 0 }}
            animate={{ rotate: -1.5, scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 90, damping: 13 }}
          >
            <Franjas className="absolute inset-x-0 top-0 h-2.5" ancho={7} />
            <h2 id="t-fila" className="text-lg font-medium opacity-80">
              Ahora mismo hay
            </h2>
            <div className="mt-1 flex items-end gap-3">
              <NumeroAnimado
                valor={enFila}
                className="font-display text-[9rem] leading-none font-black"
              />
              <p className="mb-4 font-display text-4xl leading-[0.9] font-extrabold uppercase">
                {enFila === 1 ? "persona" : "personas"}
                <br />
                en fila
              </p>
            </div>
            {masRapido && (
              <p className="mt-3 flex items-center gap-2 rounded-2xl bg-fondo/10 px-3 py-2 text-sm">
                <Zap className="size-4 shrink-0" />
                <span>
                  La espera más corta: <strong>≈ {rango(masRapido.rango)}</strong> con{" "}
                  {masRapido.nombre}
                </span>
              </p>
            )}
          </motion.div>
        </section>

        <section aria-labelledby="t-barberos" className="mt-14 px-4">
          <div className="flex items-end justify-between gap-4">
            <h2
              id="t-barberos"
              className="font-display text-5xl leading-[0.9] font-black uppercase"
            >
              ¿Con <span className="font-light text-rojo">quién?</span>
            </h2>
            {abierta && (
              <p className="pb-1 text-right text-sm text-tenue">Toca uno para anotarte</p>
            )}
          </div>

          <ul className="mt-5 grid gap-3">
            <li>
              <Tarjeta
                to={abierta ? unirse("cualquiera") : null}
                className="group relative flex items-center gap-4 overflow-hidden rounded-[1.75rem] bg-poste-azul p-4 pl-6 text-white transition active:scale-[0.98]"
              >
                <Franjas vertical className="absolute inset-y-0 left-0 w-2" ancho={5} />
                <span className="grid size-14 shrink-0 place-items-center rounded-full bg-white/15">
                  <Zap className="size-7" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-2xl leading-none font-extrabold uppercase">
                    El primero libre
                  </span>
                  <span className="mt-1 block text-sm">Te toca con quien termine antes</span>
                </span>
                <span className="shrink-0 text-right font-display text-2xl leading-none font-extrabold">
                  {primeroLibre === null ? "—" : `≈ ${duracion(primeroLibre)}`}
                </span>
              </Tarjeta>
            </li>
            {barberos.map((barbero, i) => (
              <motion.li
                key={barbero.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.08 }}
              >
                <Tarjeta
                  to={abierta ? unirse(barbero.id) : null}
                  className="group flex items-center gap-4 rounded-[1.75rem] bg-superficie p-4 ring-1 ring-borde transition hover:ring-tinta active:scale-[0.98]"
                >
                  <Avatar
                    nombre={barbero.nombre}
                    tono={barbero.tono}
                    className="size-14 text-3xl"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-2xl leading-none font-extrabold break-words uppercase">
                      {barbero.nombre}
                    </span>
                    <span className="mt-1 block text-sm text-tenue">{barbero.detalle}</span>
                    <BarraPoste valor={barbero.enFila / 5} className="mt-2.5 h-2" />
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-display text-2xl leading-none font-extrabold">
                      {barbero.minutos === null ? "—" : `≈ ${duracion(barbero.minutos)}`}
                    </span>
                    <span className="mt-1 block text-xs text-tenue">
                      <NumeroAnimado valor={barbero.enFila} /> en fila
                    </span>
                  </span>
                </Tarjeta>
              </motion.li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="t-lista" className="mt-14 px-4">
          <h2 id="t-lista" className="font-display text-5xl leading-[0.9] font-black uppercase">
            En la fila
          </h2>
          {fila.length === 0 ? (
            <p className="mt-5 rounded-2xl bg-superficie px-4 py-5 text-tenue ring-1 ring-borde">
              No hay nadie esperando.
            </p>
          ) : (
            <ol className="mt-5 grid gap-2">
              <AnimatePresence initial={false} mode="popLayout">
                {fila.map((turno, i) => (
                  <motion.li
                    key={turno.numero}
                    layout
                    initial={{ opacity: 0, y: 30, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -90, transition: { duration: 0.35 } }}
                    transition={{ type: "spring", stiffness: 260, damping: 26 }}
                    className="flex items-center gap-3 rounded-2xl bg-superficie px-4 py-3 ring-1 ring-borde"
                  >
                    <span className="w-5 font-display text-lg font-bold text-tenue">{i + 1}</span>
                    <span className="rounded-lg bg-tinta px-2 py-0.5 font-display text-xl font-extrabold text-fondo">
                      #{turno.numero}
                    </span>
                    <span className="min-w-0 flex-1 font-semibold break-words">{turno.nombre}</span>
                    <span className="flex items-center gap-1 text-sm text-tenue">
                      <ArrowRight className="size-3.5" />
                      {turno.barbero}
                    </span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ol>
          )}
          <p className="mt-5 flex items-start gap-2 text-sm text-tenue">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" />
            Solo mostramos tu nombre y la inicial del apellido. Tu teléfono nunca aparece aquí.
          </p>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 bg-linear-to-t from-fondo from-55% to-transparent px-4 pt-10 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-lg">
          {abierta ? (
            <>
              <EnlacePrincipal to={unirse()}>Anotarme en la fila</EnlacePrincipal>
              <p className="mt-2 text-center text-xs text-tenue">
                Gratis · sin descargar nada · sin crear cuenta
              </p>
            </>
          ) : (
            <p className="flex items-start gap-3 rounded-[1.5rem] bg-superficie p-4 ring-1 ring-borde">
              <PauseCircle className="mt-0.5 size-5 shrink-0 text-rojo" />
              <span>
                <strong className="block">
                  {cerrada === "llena"
                    ? "La fila está llena por ahora"
                    : "La fila en línea está pausada"}
                </strong>
                <span className="text-sm text-tenue">
                  Puedes anotarte en el local. Esta página se actualiza sola.
                </span>
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/** Un enlace para anotarse, o la misma tarjeta sin enlace si la fila está cerrada. */
function Tarjeta({
  to,
  className,
  children,
}: {
  to: string | null;
  className: string;
  children: ReactNode;
}) {
  if (to === null) return <div className={className}>{children}</div>;
  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
}
