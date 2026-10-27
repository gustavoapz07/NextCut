import { ArrowLeft, Check, Clock, ShieldCheck, Zap } from "lucide-react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { type ReactNode, useEffect, useId, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { BarraPoste, Franjas } from "@/components/Franjas";
import { NoEncontrado } from "@/components/NoEncontrado";
import { Avatar, Boleto, BotonPrincipal } from "@/components/Piezas";
import { duracion, lempiras, nombreCorto, rango } from "@/lib/formato";
import { cx } from "@/lib/utilidades";
import {
  barberia,
  barberos,
  buscarServicio,
  estimar,
  filaInicial,
  miTurno,
  nombreDe,
  type Preferencia,
  servicios,
} from "@/prototipo/datos";
import { useTitulo } from "@/prototipo/simulacion";

const PASOS = 4;

const deslizar: Variants = {
  entra: (direccion: number) => ({ x: direccion * 90, opacity: 0, filter: "blur(6px)" }),
  centro: { x: 0, opacity: 1, filter: "blur(0px)" },
  sale: (direccion: number) => ({ x: direccion * -90, opacity: 0, filter: "blur(6px)" }),
};

const esPreferencia = (valor: string | null): valor is Preferencia =>
  valor === "cualquiera" || barberos.some((b) => b.id === valor);

export function Unirse() {
  const { slug } = useParams();
  if (slug !== barberia.slug) return <NoEncontrado />;
  return <Formulario />;
}

function Formulario() {
  useTitulo(`Anotarme · ${barberia.nombre}`);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const sugerido = params.get("barbero");

  const [paso, setPaso] = useState(0);
  const [direccion, setDireccion] = useState(1);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [barbero, setBarbero] = useState<Preferencia | null>(
    esPreferencia(sugerido) ? sugerido : null,
  );
  const [servicio, setServicio] = useState<string | null>(null);
  const [verificado, setVerificado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const corto = nombreCorto(nombre);
  const digitos = telefono.replace(/\D/g, "");
  const telefonoValido = digitos.length === 0 || digitos.length === 8;
  const valido = [
    corto.length >= 2 && telefonoValido,
    barbero !== null,
    servicio !== null,
    verificado,
  ][paso];

  // Turnstile simulado: en el producto lo resuelve el widget de Cloudflare.
  useEffect(() => {
    if (paso !== 3) return;
    const id = window.setTimeout(() => setVerificado(true), 1500);
    return () => window.clearTimeout(id);
  }, [paso]);

  useEffect(() => {
    if (!enviando) return;
    const id = window.setTimeout(
      () =>
        navigate(`/t/${miTurno.codigo}`, {
          state: { nombre: corto, barbero, servicio },
        }),
      1900,
    );
    return () => window.clearTimeout(id);
  }, [enviando, navigate, corto, barbero, servicio]);

  function ir(destino: number) {
    setDireccion(destino > paso ? 1 : -1);
    setPaso(destino);
  }

  function elegirYSeguir(accion: () => void) {
    accion();
    window.setTimeout(() => ir(paso + 1), 380);
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto w-full max-w-lg px-4 pt-5">
        <div className="flex items-center justify-between gap-3">
          {paso === 0 ? (
            <Link
              to=".."
              relative="path"
              aria-label="Volver a la fila"
              className="grid size-11 place-items-center rounded-full ring-1 ring-borde transition hover:bg-superficie-2"
            >
              <ArrowLeft className="size-5" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => ir(paso - 1)}
              aria-label="Paso anterior"
              className="grid size-11 place-items-center rounded-full ring-1 ring-borde transition hover:bg-superficie-2"
            >
              <ArrowLeft className="size-5" />
            </button>
          )}
          <p className="text-sm font-medium text-tenue">
            Paso {paso + 1} de {PASOS}
          </p>
          <span className="font-display text-lg font-extrabold uppercase">{barberia.nombre}</span>
        </div>
        <BarraPoste valor={(paso + 1) / PASOS} className="mt-4 h-2.5" />
      </header>

      <main className="relative mx-auto w-full max-w-lg flex-1 overflow-x-clip px-4 pt-10 pb-40">
        <AnimatePresence mode="wait" custom={direccion} initial={false}>
          <motion.section
            key={paso}
            custom={direccion}
            variants={deslizar}
            initial="entra"
            animate="centro"
            exit="sale"
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            {paso === 0 && (
              <PasoNombre
                nombre={nombre}
                corto={corto}
                telefono={telefono}
                telefonoValido={telefonoValido}
                onNombre={setNombre}
                onTelefono={setTelefono}
              />
            )}
            {paso === 1 && (
              <PasoBarbero
                elegido={barbero}
                onElegir={(id) => elegirYSeguir(() => setBarbero(id))}
              />
            )}
            {paso === 2 && (
              <PasoServicio
                elegido={servicio}
                onElegir={(id) => elegirYSeguir(() => setServicio(id))}
              />
            )}
            {paso === 3 && barbero && servicio && (
              <PasoConfirmar
                nombre={corto}
                barbero={barbero}
                servicio={servicio}
                verificado={verificado}
              />
            )}
          </motion.section>
        </AnimatePresence>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-30 bg-linear-to-t from-fondo from-60% to-transparent px-4 pt-10 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-lg">
          <BotonPrincipal
            disabled={!valido || enviando}
            onClick={() => (paso < PASOS - 1 ? ir(paso + 1) : setEnviando(true))}
          >
            {paso < PASOS - 1 ? "Siguiente" : "Tomar mi turno"}
          </BotonPrincipal>
        </div>
      </footer>

      <AnimatePresence>{enviando && <Imprimiendo nombre={corto} />}</AnimatePresence>
    </div>
  );
}

function Titulo({ children, acento }: { children: ReactNode; acento: string }) {
  return (
    <h1 className="font-display text-6xl leading-[0.9] font-black tracking-tight uppercase">
      {children} <span className="font-light text-rojo">{acento}</span>
    </h1>
  );
}

function PasoNombre({
  nombre,
  corto,
  telefono,
  telefonoValido,
  onNombre,
  onTelefono,
}: {
  nombre: string;
  corto: string;
  telefono: string;
  telefonoValido: boolean;
  onNombre: (valor: string) => void;
  onTelefono: (valor: string) => void;
}) {
  const idNombre = useId();
  const idTelefono = useId();
  const idAyuda = useId();
  return (
    <>
      <Titulo acento="llamas?">¿Cómo te</Titulo>

      <label htmlFor={idNombre} className="mt-10 block text-sm font-semibold text-tenue">
        Tu nombre
      </label>
      <input
        id={idNombre}
        value={nombre}
        onChange={(e) => onNombre(e.target.value)}
        maxLength={40}
        autoComplete="name"
        placeholder="Escribe aquí"
        className="mt-1 w-full border-b-4 border-tinta bg-transparent pb-2 font-display text-5xl font-extrabold uppercase transition-colors outline-none placeholder:text-tinta/15 focus:border-rojo"
      />
      <div className="mt-4 h-10">
        <AnimatePresence>
          {corto.length >= 2 && (
            <motion.p
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6 }}
              className="inline-flex items-center gap-2 rounded-full bg-superficie py-1.5 pr-4 pl-1.5 text-sm ring-1 ring-borde"
            >
              <span className="rounded-full bg-tinta px-2.5 py-1 font-display font-extrabold text-fondo">
                #{miTurno.numero}
              </span>
              Así te verán en la fila: <strong>{corto}</strong>
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 rounded-[1.75rem] bg-superficie p-5 ring-1 ring-borde">
        <label htmlFor={idTelefono} className="block font-semibold">
          WhatsApp <span className="font-normal text-tenue">(opcional)</span>
        </label>
        <div className="mt-3 flex items-center gap-2">
          <span className="rounded-xl bg-superficie-2 px-3 py-3 font-semibold">+504</span>
          <input
            id={idTelefono}
            value={telefono}
            onChange={(e) => onTelefono(e.target.value.replace(/[^\d\s]/g, "").slice(0, 9))}
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="9999 9999"
            aria-describedby={idAyuda}
            aria-invalid={!telefonoValido}
            className={cx(
              "h-12 w-full rounded-xl bg-transparent px-3 text-lg tracking-wider ring-1 outline-none focus:ring-2",
              telefonoValido ? "ring-borde focus:ring-azul" : "ring-rojo",
            )}
          />
        </div>
        <p id={idAyuda} className={cx("mt-2 text-sm", telefonoValido ? "text-tenue" : "text-rojo")}>
          {telefonoValido
            ? "Solo para avisarte cuando te toque. Lo borramos a los 90 días."
            : "Revisa el número: son 8 dígitos."}
        </p>
      </div>
    </>
  );
}

function Opcion({
  activo,
  nombre,
  valor,
  onElegir,
  children,
  className,
}: {
  activo: boolean;
  nombre: string;
  valor: string;
  onElegir: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.label
      whileTap={{ scale: 0.97 }}
      className={cx(
        "relative flex cursor-pointer items-center gap-4 rounded-[1.75rem] p-4 ring-2 transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-azul",
        activo ? "bg-tinta text-fondo ring-tinta" : "bg-superficie ring-borde hover:ring-tinta/40",
        className,
      )}
    >
      <input
        type="radio"
        name={nombre}
        value={valor}
        checked={activo}
        onChange={onElegir}
        className="sr-only"
      />
      {children}
      <AnimatePresence>
        {activo && (
          <motion.span
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            className="absolute -top-2 -right-1 grid size-8 place-items-center rounded-full bg-poste-rojo text-white shadow-lg"
          >
            <Check className="size-4" strokeWidth={3} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.label>
  );
}

function PasoBarbero({
  elegido,
  onElegir,
}: {
  elegido: Preferencia | null;
  onElegir: (id: Preferencia) => void;
}) {
  return (
    <fieldset>
      <legend>
        <Titulo acento="te cortas?">¿Con quién</Titulo>
      </legend>
      <div className="mt-8 grid gap-3">
        <Opcion
          activo={elegido === "cualquiera"}
          nombre="barbero"
          valor="cualquiera"
          onElegir={() => onElegir("cualquiera")}
        >
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-poste-azul text-white">
            <Zap className="size-7" />
          </span>
          <span className="flex-1">
            <span className="block font-display text-2xl leading-none font-extrabold uppercase">
              El primero libre
            </span>
            <span className="mt-1 block text-sm opacity-70">La opción más rápida</span>
          </span>
        </Opcion>
        {barberos.map((b) => (
          <Opcion
            key={b.id}
            activo={elegido === b.id}
            nombre="barbero"
            valor={b.id}
            onElegir={() => onElegir(b.id)}
          >
            <Avatar nombre={b.nombre} tono={b.tono} className="size-14 text-3xl" />
            <span className="min-w-0 flex-1">
              <span className="block font-display text-2xl leading-none font-extrabold uppercase">
                {b.nombre}
              </span>
              <span className="mt-1 block text-sm opacity-70">{b.apodo}</span>
            </span>
            <span className="shrink-0 text-right">
              <span className="block font-display text-xl leading-none font-extrabold">
                ≈ {duracion(estimar(b, filaInicial)[0])}
              </span>
              <span className="mt-1 block text-xs opacity-70">de espera</span>
            </span>
          </Opcion>
        ))}
      </div>
    </fieldset>
  );
}

function PasoServicio({
  elegido,
  onElegir,
}: {
  elegido: string | null;
  onElegir: (id: string) => void;
}) {
  return (
    <fieldset>
      <legend>
        <Titulo acento="te haces?">¿Qué</Titulo>
      </legend>
      <div className="mt-8 grid grid-cols-2 gap-3">
        {servicios.map((s, i) => (
          <Opcion
            key={s.id}
            activo={elegido === s.id}
            nombre="servicio"
            valor={s.id}
            onElegir={() => onElegir(s.id)}
            className={cx("flex-col items-start gap-6", i === 0 && "col-span-2")}
          >
            <span>
              <span className="block font-display text-2xl leading-none font-extrabold uppercase">
                {s.nombre}
              </span>
              <span className="mt-1 block text-sm opacity-70">{s.detalle}</span>
            </span>
            <span className="flex w-full items-end justify-between gap-2">
              <span className="inline-flex items-center gap-1 text-sm opacity-70">
                <Clock className="size-3.5" /> {s.minutos} min
              </span>
              <span className="font-display text-2xl leading-none font-black">
                {lempiras(s.precio)}
              </span>
            </span>
          </Opcion>
        ))}
      </div>
    </fieldset>
  );
}

function PasoConfirmar({
  nombre,
  barbero,
  servicio,
  verificado,
}: {
  nombre: string;
  barbero: Preferencia;
  servicio: string;
  verificado: boolean;
}) {
  const detalle = buscarServicio(servicio);
  const elegido = barberos.find((b) => b.id === barbero);
  const estimado = elegido ? estimar(elegido, filaInicial) : ([30, 40] as [number, number]);
  return (
    <>
      <Titulo acento="turno">Confirma tu</Titulo>
      <motion.div
        initial={{ rotate: -6, y: 40, opacity: 0 }}
        animate={{ rotate: -1.5, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 13, delay: 0.1 }}
      >
        <Boleto
          className="mt-8"
          arriba={
            <>
              <p className="text-base font-medium text-tenue">Turno para</p>
              <p className="font-display text-5xl leading-[0.9] font-black uppercase">{nombre}</p>
              <p className="mt-1 text-sm text-tenue">en {barberia.nombre}</p>
            </>
          }
          abajo={
            <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
              <Dato titulo="Barbero" valor={nombreDe(barbero)} />
              <Dato titulo="Servicio" valor={detalle?.nombre ?? "—"} />
              <Dato titulo="Te toca en" valor={`≈ ${rango(estimado)}`} />
              <Dato titulo="Precio" valor={lempiras(detalle?.precio ?? 0)} />
            </dl>
          }
        />
      </motion.div>

      <div className="mt-6 flex items-center gap-3 rounded-2xl bg-superficie p-4 ring-1 ring-borde">
        <AnimatePresence mode="wait" initial={false}>
          {verificado ? (
            <motion.span
              key="listo"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="grid size-7 place-items-center rounded-full bg-poste-azul text-white"
            >
              <Check className="size-4" strokeWidth={3} />
            </motion.span>
          ) : (
            <motion.span
              key="girando"
              exit={{ scale: 0 }}
              className="size-7 animate-spin rounded-full border-[3px] border-borde border-t-azul"
            />
          )}
        </AnimatePresence>
        <p className="text-sm">
          {verificado ? "Listo, eres humano." : "Verificando que no eres un robot…"}
        </p>
      </div>
      <p className="mt-4 flex items-start gap-2 text-xs text-tenue">
        <ShieldCheck className="size-4 shrink-0" />
        Usamos tu nombre para llamarte y tu teléfono solo para avisarte. No lo compartimos ni lo
        mostramos en pantallas.
      </p>
    </>
  );
}

function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div>
      <dt className="text-sm text-tenue">{titulo}</dt>
      <dd className="mt-0.5 font-display text-2xl leading-none font-extrabold uppercase">
        {valor}
      </dd>
    </div>
  );
}

function Imprimiendo({ nombre }: { nombre: string }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center overflow-hidden bg-poste-rojo text-white"
      initial={{ clipPath: "circle(0% at 50% 100%)" }}
      animate={{ clipPath: "circle(150% at 50% 100%)" }}
      transition={{ duration: 0.75, ease: [0.7, 0, 0.3, 1] }}
    >
      <Franjas className="absolute inset-0 opacity-20" ancho={30} velocidad={0.7} />
      <div className="relative px-6 text-center">
        <motion.p
          className="text-2xl font-medium"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          ¡Listo, {nombre}!
        </motion.p>
        <motion.p
          className="font-display text-[11rem] leading-[0.9] font-black"
          initial={{ scale: 0.4, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 180, damping: 11 }}
        >
          #{miTurno.numero}
        </motion.p>
        <motion.p
          className="text-xl font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          Es tu número
        </motion.p>
      </div>
    </motion.div>
  );
}
