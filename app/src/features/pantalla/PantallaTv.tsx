import { Maximize } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Franjas } from "@/components/Franjas";
import { BotonMarca } from "@/components/Marco";
import { NoEncontrado } from "@/components/NoEncontrado";
import { NumeroAnimado } from "@/components/NumeroAnimado";
import { Marquesina } from "@/components/Piezas";
import { hora } from "@/lib/formato";
import { cx } from "@/lib/utilidades";
import {
  type Barbero,
  barberia,
  buscarBarbero,
  buscarServicio,
  DOMINIO,
  nombreDe,
  type TurnoFila,
} from "@/prototipo/datos";
import { type Evento, useFilaEnVivo, useReloj, useTitulo } from "@/prototipo/simulacion";

const BANDA = {
  rojo: "bg-poste-rojo text-white",
  azul: "bg-poste-azul text-white",
  tinta: "bg-hueso text-noche",
};

export function PantallaTv() {
  const { slug } = useParams();
  if (slug !== barberia.slug) return <NoEncontrado />;
  return <Tablero />;
}

function Tablero() {
  useTitulo(`Pantalla · ${barberia.nombre}`);
  const { fila, barberos, evento } = useFilaEnVivo(6500);
  const ahora = useReloj();
  const [anuncio, setAnuncio] = useState<Evento | null>(null);

  useEffect(() => {
    if (evento?.tipo !== "pasa") return;
    setAnuncio(evento);
    const id = window.setTimeout(() => setAnuncio(null), 3600);
    return () => window.clearTimeout(id);
  }, [evento]);

  return (
    <div className="relative flex h-dvh min-h-[34rem] flex-col overflow-hidden bg-noche text-hueso">
      <Franjas className="absolute inset-x-0 top-0 h-[0.9vh] min-h-1.5" ancho={9} />

      <header className="flex items-center justify-between gap-6 px-[3vw] pt-[3vh]">
        <BotonMarca className="text-[clamp(1.5rem,2.4vw,3rem)]" />
        <p className="font-display text-[clamp(2rem,4.2vw,5.5rem)] leading-tight font-black tracking-tight uppercase">
          {barberia.nombre}
        </p>
        <div className="flex items-center gap-[1.2vw]">
          <p className="font-display text-[clamp(2rem,3.6vw,4.75rem)] leading-none font-bold tabular-nums">
            {hora(ahora)}
          </p>
          <button
            type="button"
            aria-label="Pantalla completa"
            onClick={() => document.documentElement.requestFullscreen?.()}
            className="grid size-10 place-items-center rounded-full text-hueso/50 transition hover:bg-white/10 hover:text-hueso"
          >
            <Maximize className="size-5" />
          </button>
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,1.2fr)] gap-[1.4vw] px-[3vw] py-[3vh]">
        {barberos.map((b) => (
          <ColumnaBarbero key={b.id} barbero={b} siguiente={fila.find((t) => t.barbero === b.id)} />
        ))}

        <section className="flex min-h-0 flex-col rounded-[2vw] bg-hueso p-[1.6vw] text-noche">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-display text-[clamp(1.5rem,2.8vw,3.75rem)] leading-none font-black uppercase">
              En fila
            </h2>
            <p className="font-display text-[clamp(1.1rem,1.9vw,2.5rem)] font-bold">
              <NumeroAnimado valor={fila.length} /> personas
            </p>
          </div>
          <ol className="mt-[1.6vh] flex min-h-0 flex-1 flex-col gap-[0.9vh] overflow-hidden">
            <AnimatePresence initial={false} mode="popLayout">
              {fila.slice(0, 6).map((t) => (
                <motion.li
                  key={t.numero}
                  layout
                  initial={{ opacity: 0, x: 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -60, transition: { duration: 0.3 } }}
                  transition={{ type: "spring", stiffness: 240, damping: 26 }}
                  className="flex items-center gap-[0.9vw] rounded-[0.9vw] bg-noche/[0.06] px-[1vw] py-[0.9vh]"
                >
                  <span className="w-[4.5vw] font-display text-[clamp(1.25rem,2.4vw,3.25rem)] leading-none font-black">
                    #{t.numero}
                  </span>
                  <span className="min-w-0 flex-1 text-[clamp(0.95rem,1.45vw,2rem)] font-semibold break-words">
                    {t.nombre}
                  </span>
                  <span className="text-[clamp(0.75rem,1.05vw,1.4rem)] opacity-60">
                    {t.barbero === "cualquiera" ? "El primero" : nombreDe(t.barbero)}
                  </span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
        </section>
      </main>

      <footer className="flex h-[13vh] min-h-20 items-stretch">
        <div className="flex min-w-0 flex-1 items-center bg-poste-rojo text-white">
          <Marquesina
            items={[
              "Anótate desde tu celular",
              "Escanea el código",
              barberia.enlace,
              "Ya no tienes que esperar aquí",
              "Te avisamos cuando te toque",
            ]}
            velocidad={36}
            className="font-display text-[clamp(1.5rem,3.4vw,4.25rem)] font-extrabold uppercase"
          />
        </div>
        <div className="flex items-center gap-[1vw] bg-hueso px-[1.6vw] text-noche">
          <QRCodeSVG
            value={`https://${DOMINIO}/b/${barberia.slug}?origen=qr`}
            size={256}
            bgColor="transparent"
            fgColor="#0a0f24"
            title="Código QR para anotarse en la fila"
            className="h-[9.5vh] min-h-16 w-auto"
          />
          <p className="font-display text-[clamp(1rem,1.7vw,2.25rem)] leading-[0.9] font-black uppercase">
            Escanea
            <br />y anótate
          </p>
        </div>
      </footer>

      <AnimatePresence>{anuncio && <Anuncio evento={anuncio} />}</AnimatePresence>
    </div>
  );
}

function ColumnaBarbero({ barbero, siguiente }: { barbero: Barbero; siguiente?: TurnoFila }) {
  const servicio = siguiente ? buscarServicio(siguiente.servicio) : undefined;
  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-[2vw] bg-noche-2 ring-1 ring-white/10">
      <div
        className={cx(
          "flex items-center justify-between px-[1.4vw] py-[1.5vh]",
          BANDA[barbero.tono],
        )}
      >
        <h2 className="font-display text-[clamp(1.25rem,2.3vw,3.25rem)] leading-none font-black uppercase">
          {barbero.nombre}
        </h2>
        <p className="text-[clamp(0.85rem,1.2vw,1.6rem)] font-medium opacity-80">
          Silla {barbero.silla}
        </p>
      </div>

      <div className="flex flex-1 flex-col justify-center px-[1.4vw] [perspective:900px]">
        <p className="text-[clamp(0.85rem,1.2vw,1.6rem)] text-hueso/60">
          {barbero.estado === "pausa" ? "En pausa" : "Atendiendo"}
        </p>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={barbero.atendiendo}
            initial={{ rotateX: -95, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: 95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 160, damping: 18 }}
            className="origin-center font-display text-[clamp(4rem,10.5vw,15rem)] leading-[0.9] font-black"
          >
            #{barbero.atendiendo}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="border-t border-white/10 px-[1.4vw] py-[1.8vh]">
        <p className="text-[clamp(0.85rem,1.2vw,1.6rem)] text-hueso/60">Sigue</p>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={siguiente?.numero ?? "nadie"}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <p className="font-display text-[clamp(1.4rem,2.6vw,3.5rem)] leading-tight font-extrabold">
              {siguiente ? `#${siguiente.numero} ${siguiente.nombre}` : "Sin fila"}
            </p>
            <p className="mt-1 text-[clamp(0.75rem,1.1vw,1.5rem)] text-hueso/60">
              {servicio?.nombre ?? "Anótate con el QR"}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function Anuncio({ evento }: { evento: Evento }) {
  const barbero = buscarBarbero(evento.barbero);
  return (
    <motion.div
      className="absolute inset-0 z-20 grid place-items-center overflow-hidden bg-poste-azul text-white"
      initial={{ clipPath: "inset(0 100% 0 0)" }}
      animate={{ clipPath: "inset(0 0% 0 0)" }}
      exit={{ clipPath: "inset(0 0 0 100%)" }}
      transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
    >
      <Franjas className="absolute inset-0 opacity-15" ancho={44} velocidad={1.2} />
      <div className="relative text-center">
        <p className="text-[clamp(1.5rem,3vw,4rem)] font-medium">Turno</p>
        <motion.p
          className="font-display text-[clamp(8rem,27vw,32rem)] leading-[0.9] font-black"
          initial={{ scale: 0.5 }}
          animate={{ scale: [0.5, 1.08, 1] }}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          #{evento.numero}
        </motion.p>
        <p className="font-display text-[clamp(2.5rem,5.5vw,7rem)] leading-none font-light uppercase">
          {evento.nombre}
        </p>
        <p className="mt-[3vh] font-display text-[clamp(1.5rem,3.4vw,4.5rem)] font-extrabold uppercase">
          Pasa con {barbero?.nombre} · silla {barbero?.silla}
        </p>
      </div>
    </motion.div>
  );
}
