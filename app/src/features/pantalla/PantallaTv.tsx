import { Maximize, Volume2, VolumeX } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Franjas } from "@/components/Franjas";
import { BotonMarca, Cargando } from "@/components/Marco";
import { NoEncontrado } from "@/components/NoEncontrado";
import { NumeroAnimado } from "@/components/NumeroAnimado";
import { Marquesina } from "@/components/Piezas";
import { SinConexion } from "@/components/SinConexion";
import { useFilaPublica } from "@/lib/enVivo";
import { hora } from "@/lib/formato";
import { usePantallaEncendida, useReloj, useTitulo } from "@/lib/ganchos";
import { prepararSonido, tocarTonos } from "@/lib/sonido";
import { type ColumnaTv, columnasTv, type Llamado, useAnuncios } from "@/lib/tv";
import { cx } from "@/lib/utilidades";
import { barberia, buscarBarbero, buscarServicio, DOMINIO, nombreDe } from "@/prototipo/datos";
import { useFilaEnVivo } from "@/prototipo/simulacion";

const BANDA = {
  rojo: "bg-poste-rojo text-white",
  azul: "bg-poste-azul text-white",
  tinta: "bg-hueso text-noche",
};

const ESTADO: Record<ColumnaTv["estado"], string> = {
  pausa: "En pausa",
  libre: "Libre",
  llamando: "Llamando",
  atendiendo: "Atendiendo",
};

/** Todo lo que dibuja la TV, venga del prototipo o de la base. */
interface VistaTv {
  nombre: string;
  /** Texto de la marquesina, sin https://. */
  enlace: string;
  qr: string;
  columnas: ColumnaTv[];
  fila: { numero: number; nombre: string; barbero: string }[];
  enFila: number;
  anuncio: Llamado | null;
  sonido?: { activo: boolean; activar: () => void };
}

export function PantallaTv() {
  const { slug = "" } = useParams();
  // La barbería del prototipo de diseño sigue simulada; las demás vienen de la base.
  if (slug === barberia.slug) return <TableroPrototipo />;
  return <TableroReal slug={slug} />;
}

// ---------------------------------------------------------------------------------------------
// TV real
// ---------------------------------------------------------------------------------------------

function TableroReal({ slug }: { slug: string }) {
  const { estado, recargar } = useFilaPublica(slug);
  const ahora = useReloj(30_000);
  const datos = estado.tipo === "lista" ? estado.datos : null;
  const anuncio = useAnuncios(datos);
  const [sonido, setSonido] = useState(false);
  usePantallaEncendida();
  useTitulo(datos ? `Pantalla · ${datos.barberia.nombre}` : "Pantalla");

  useEffect(() => {
    if (anuncio && sonido) tocarTonos([660, 880, 1175]);
  }, [anuncio, sonido]);

  if (estado.tipo === "cargando") return <Cargando />;
  if (estado.tipo === "no_existe") return <NoEncontrado />;
  if (estado.tipo === "error") return <SinConexion alReintentar={() => void recargar()} />;

  const { barberia: local, barberos, fila } = estado.datos;
  const nombres = new Map(barberos.map((b) => [b.id, b.nombre]));
  const vista: VistaTv = {
    nombre: local.nombre,
    enlace: `${window.location.host}/b/${local.slug}`,
    qr: `${window.location.origin}/b/${local.slug}?origen=qr`,
    columnas: columnasTv(estado.datos, ahora),
    fila: fila.map((t) => ({
      numero: t.numero,
      nombre: t.nombre ?? "Cliente",
      barbero: t.barbero_id ? (nombres.get(t.barbero_id) ?? "Su barbero") : "El primero",
    })),
    enFila: fila.length,
    anuncio,
    sonido: {
      activo: sonido,
      activar: () => {
        if (prepararSonido()) {
          setSonido(true);
          tocarTonos([880]);
        }
      },
    },
  };
  return <Tablero vista={vista} />;
}

// ---------------------------------------------------------------------------------------------
// TV del prototipo
// ---------------------------------------------------------------------------------------------

function TableroPrototipo() {
  useTitulo(`Pantalla · ${barberia.nombre}`);
  const { fila, barberos, evento } = useFilaEnVivo(6500);
  const [anuncio, setAnuncio] = useState<Llamado | null>(null);

  useEffect(() => {
    if (evento?.tipo !== "pasa") return;
    const barbero = buscarBarbero(evento.barbero);
    setAnuncio({
      clave: String(evento.id),
      numero: evento.numero,
      nombre: evento.nombre,
      barbero: barbero?.nombre ?? "",
      silla: barbero?.silla ?? null,
    });
    const id = window.setTimeout(() => setAnuncio(null), 3600);
    return () => window.clearTimeout(id);
  }, [evento]);

  const vista: VistaTv = {
    nombre: barberia.nombre,
    enlace: barberia.enlace,
    qr: `https://${DOMINIO}/b/${barberia.slug}?origen=qr`,
    columnas: barberos.map((b) => {
      const siguiente = fila.find((t) => t.barbero === b.id);
      return {
        id: b.id,
        nombre: b.nombre,
        silla: b.silla,
        tono: b.tono,
        estado: b.estado === "pausa" ? "pausa" : b.estado === "libre" ? "libre" : "atendiendo",
        numero: b.atendiendo,
        sigue: siguiente
          ? {
              numero: siguiente.numero,
              nombre: siguiente.nombre,
              servicio: buscarServicio(siguiente.servicio)?.nombre ?? "",
            }
          : null,
      };
    }),
    fila: fila.map((t) => ({
      numero: t.numero,
      nombre: t.nombre,
      barbero: t.barbero === "cualquiera" ? "El primero" : nombreDe(t.barbero),
    })),
    enFila: fila.length,
    anuncio,
  };
  return <Tablero vista={vista} />;
}

// ---------------------------------------------------------------------------------------------
// Vista
// ---------------------------------------------------------------------------------------------

function Tablero({ vista }: { vista: VistaTv }) {
  const ahora = useReloj();
  const columnas = Math.max(1, vista.columnas.length);

  return (
    <div className="relative flex h-dvh min-h-[34rem] flex-col overflow-hidden bg-noche text-hueso">
      <Franjas className="absolute inset-x-0 top-0 h-[0.9vh] min-h-1.5" ancho={9} />

      <header className="flex items-center justify-between gap-6 px-[3vw] pt-[3vh]">
        <BotonMarca className="text-[clamp(1.5rem,2.4vw,3rem)]" />
        <p className="min-w-0 truncate font-display text-[clamp(2rem,4.2vw,5.5rem)] leading-tight font-black tracking-tight uppercase">
          {vista.nombre}
        </p>
        <div className="flex items-center gap-[1.2vw]">
          <p className="font-display text-[clamp(2rem,3.6vw,4.75rem)] leading-none font-bold tabular-nums">
            {hora(ahora)}
          </p>
          {vista.sonido && (
            <button
              type="button"
              aria-label={
                vista.sonido.activo
                  ? "Sonido de los anuncios activado"
                  : "Activar sonido de los anuncios"
              }
              aria-pressed={vista.sonido.activo}
              onClick={vista.sonido.activar}
              className={cx(
                "grid size-10 place-items-center rounded-full transition hover:bg-white/10 hover:text-hueso",
                vista.sonido.activo ? "text-hueso" : "text-hueso/50",
              )}
            >
              {vista.sonido.activo ? (
                <Volume2 className="size-5" />
              ) : (
                <VolumeX className="size-5" />
              )}
            </button>
          )}
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

      <main
        className="grid min-h-0 flex-1 gap-[1.4vw] px-[3vw] py-[3vh]"
        style={{
          gridTemplateColumns: `repeat(${columnas}, minmax(0, 1fr)) minmax(0, 1.2fr)`,
        }}
      >
        {vista.columnas.length === 0 ? (
          <section className="grid place-items-center rounded-[2vw] bg-noche-2 p-[2vw] text-center ring-1 ring-white/10">
            <p className="text-[clamp(1rem,1.6vw,2rem)] text-hueso/70">
              Todavía no hay barberos activos.
            </p>
          </section>
        ) : (
          vista.columnas.map((columna) => <ColumnaBarbero key={columna.id} columna={columna} />)
        )}

        <section className="flex min-h-0 flex-col rounded-[2vw] bg-hueso p-[1.6vw] text-noche">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-display text-[clamp(1.5rem,2.8vw,3.75rem)] leading-none font-black uppercase">
              En fila
            </h2>
            <p className="font-display text-[clamp(1.1rem,1.9vw,2.5rem)] font-bold">
              <NumeroAnimado valor={vista.enFila} /> {vista.enFila === 1 ? "persona" : "personas"}
            </p>
          </div>
          {vista.fila.length === 0 ? (
            <p className="mt-[2vh] text-[clamp(0.95rem,1.45vw,2rem)] font-semibold opacity-60">
              Nadie esperando. Escanea el código y pasas de una.
            </p>
          ) : (
            <ol className="mt-[1.6vh] flex min-h-0 flex-1 flex-col gap-[0.9vh] overflow-hidden">
              <AnimatePresence initial={false} mode="popLayout">
                {vista.fila.slice(0, 6).map((t) => (
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
                      {t.barbero}
                    </span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ol>
          )}
        </section>
      </main>

      <footer className="flex h-[13vh] min-h-20 items-stretch">
        <div className="flex min-w-0 flex-1 items-center bg-poste-rojo text-white">
          <Marquesina
            items={[
              "Anótate desde tu celular",
              "Escanea el código",
              vista.enlace,
              "Ya no tienes que esperar aquí",
              "Te avisamos cuando te toque",
            ]}
            velocidad={36}
            className="font-display text-[clamp(1.5rem,3.4vw,4.25rem)] font-extrabold uppercase"
          />
        </div>
        <div className="flex items-center gap-[1vw] bg-hueso px-[1.6vw] text-noche">
          <QRCodeSVG
            value={vista.qr}
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

      <AnimatePresence>
        {vista.anuncio && <Anuncio key={vista.anuncio.clave} llamado={vista.anuncio} />}
      </AnimatePresence>
    </div>
  );
}

function ColumnaBarbero({ columna }: { columna: ColumnaTv }) {
  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-[2vw] bg-noche-2 ring-1 ring-white/10">
      <div
        className={cx(
          "flex items-center justify-between gap-2 px-[1.4vw] py-[1.5vh]",
          BANDA[columna.tono],
        )}
      >
        <h2 className="min-w-0 truncate font-display text-[clamp(1.25rem,2.3vw,3.25rem)] leading-none font-black uppercase">
          {columna.nombre}
        </h2>
        {columna.silla && (
          <p className="shrink-0 text-[clamp(0.85rem,1.2vw,1.6rem)] font-medium opacity-80">
            Silla {columna.silla}
          </p>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-center px-[1.4vw] [perspective:900px]">
        {/* Sin turno en la silla, el estado va en grande en lugar del número. */}
        {columna.numero && (
          <p className="text-[clamp(0.85rem,1.2vw,1.6rem)] text-hueso/60">
            {ESTADO[columna.estado]}
          </p>
        )}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={columna.numero ?? columna.estado}
            initial={{ rotateX: -95, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: 95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 160, damping: 18 }}
            className={cx(
              "origin-center font-display leading-[0.9]",
              columna.numero
                ? "text-[clamp(4rem,10.5vw,15rem)] font-black"
                : "text-[clamp(2.5rem,5.5vw,7.5rem)] font-light text-hueso/70 uppercase",
            )}
          >
            {columna.numero ? `#${columna.numero}` : ESTADO[columna.estado]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="border-t border-white/10 px-[1.4vw] py-[1.8vh]">
        <p className="text-[clamp(0.85rem,1.2vw,1.6rem)] text-hueso/60">Sigue</p>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={columna.sigue?.numero ?? "nadie"}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <p className="font-display text-[clamp(1.4rem,2.6vw,3.5rem)] leading-tight font-extrabold break-words">
              {columna.sigue ? `#${columna.sigue.numero} ${columna.sigue.nombre}` : "Sin fila"}
            </p>
            <p className="mt-1 text-[clamp(0.75rem,1.1vw,1.5rem)] text-hueso/60">
              {columna.sigue?.servicio || "Anótate con el QR"}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function Anuncio({ llamado }: { llamado: Llamado }) {
  return (
    <motion.div
      role="status"
      className="absolute inset-0 z-20 grid place-items-center overflow-hidden bg-poste-azul text-white"
      initial={{ clipPath: "inset(0 100% 0 0)" }}
      animate={{ clipPath: "inset(0 0% 0 0)" }}
      exit={{ clipPath: "inset(0 0 0 100%)" }}
      transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
    >
      <Franjas className="absolute inset-0 opacity-15" ancho={44} velocidad={1.2} />
      <div className="relative px-[4vw] text-center">
        <p className="text-[clamp(1.5rem,3vw,4rem)] font-medium">Turno</p>
        <motion.p
          className="font-display text-[clamp(8rem,27vw,32rem)] leading-[0.9] font-black"
          initial={{ scale: 0.5 }}
          animate={{ scale: [0.5, 1.08, 1] }}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          #{llamado.numero}
        </motion.p>
        {llamado.nombre && (
          <p className="font-display text-[clamp(2.5rem,5.5vw,7rem)] leading-none font-light break-words uppercase">
            {llamado.nombre}
          </p>
        )}
        <p className="mt-[3vh] font-display text-[clamp(1.5rem,3.4vw,4.5rem)] font-extrabold uppercase">
          Pasa con {llamado.barbero}
          {llamado.silla ? ` · silla ${llamado.silla}` : ""}
        </p>
      </div>
    </motion.div>
  );
}
