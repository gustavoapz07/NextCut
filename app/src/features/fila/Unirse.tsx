import { estimarNuevo, rangoDe } from "@shared/eta";
import { ArrowLeft, Check, Clock, ShieldCheck, Zap } from "lucide-react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { type ReactNode, useEffect, useId, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { BarraPoste, Franjas } from "@/components/Franjas";
import { Cargando } from "@/components/Marco";
import { NoEncontrado } from "@/components/NoEncontrado";
import { Avatar, Boleto, BotonPrincipal } from "@/components/Piezas";
import { SinConexion } from "@/components/SinConexion";
import { Turnstile } from "@/components/Turnstile";
import { useFilaPublica } from "@/lib/enVivo";
import { entradaEta, type FilaPublica, tonoDe } from "@/lib/fila";
import { duracion, lempiras, nombreCorto, rango, redondear5 } from "@/lib/formato";
import { useReloj, useTitulo } from "@/lib/ganchos";
import {
  anotarse,
  type ErrorUnirse,
  guardarSecreto,
  MENSAJES,
  nuevoSecreto,
  type ResultadoUnirse,
} from "@/lib/unirse";
import { cx } from "@/lib/utilidades";
import {
  barberia,
  barberos as barberosPrototipo,
  estimar,
  filaInicial,
  miTurno,
  servicios as serviciosPrototipo,
  type Tono,
} from "@/prototipo/datos";

const PASOS = 4;
const CUALQUIERA = "cualquiera";

const deslizar: Variants = {
  entra: (direccion: number) => ({ x: direccion * 90, opacity: 0, filter: "blur(6px)" }),
  centro: { x: 0, opacity: 1, filter: "blur(0px)" },
  sale: (direccion: number) => ({ x: direccion * -90, opacity: 0, filter: "blur(6px)" }),
};

interface Espera {
  /** Un solo número para las tarjetas, redondeado a 5 minutos. */
  minutos: number;
  rango: readonly [number, number];
}

interface Envio {
  nombre: string;
  telefono: string | null;
  barbero: string;
  servicio: string;
  secreto: string;
  clave: string;
  token: string | null;
}

/** Lo que el formulario necesita saber de la barbería, venga del prototipo o de la base. */
interface Fuente {
  nombreBarberia: string;
  barberos: { id: string; nombre: string; apodo: string | null; tono: Tono }[];
  servicios: {
    id: string;
    nombre: string;
    detalle: string | null;
    minutos: number;
    precio: number;
  }[];
  /** Espera de quien se anota ahora; `null` si ese barbero no está disponible. */
  esperar(barbero: string, servicio: string | null): Espera | null;
  /** El número que le tocaría (solo el prototipo lo sabe de antemano). */
  numeroPrevio?: number;
  verificacion: "simulada" | "turnstile";
  enviar(envio: Envio): Promise<ResultadoUnirse>;
}

export function Unirse() {
  const { slug = "" } = useParams();
  // La barbería del prototipo de diseño sigue con datos simulados; las demás vienen de la base.
  if (slug === barberia.slug) return <UnirsePrototipo />;
  return <UnirseReal slug={slug} />;
}

function UnirsePrototipo() {
  const fuente = useMemo<Fuente>(
    () => ({
      nombreBarberia: barberia.nombre,
      barberos: barberosPrototipo.map(({ id, nombre, apodo, tono }) => ({
        id,
        nombre,
        apodo,
        tono,
      })),
      servicios: serviciosPrototipo.map((s) => ({
        id: s.id,
        nombre: s.nombre,
        detalle: s.detalle,
        minutos: s.minutos,
        precio: s.precio,
      })),
      esperar: (id) => {
        const elegido = barberosPrototipo.find((b) => b.id === id);
        const estimado = elegido ? estimar(elegido, filaInicial) : ([30, 40] as const);
        return { minutos: estimado[0], rango: estimado };
      },
      numeroPrevio: miTurno.numero,
      verificacion: "simulada",
      enviar: async () => ({ ok: true, codigo: miTurno.codigo, numero: miTurno.numero }),
    }),
    [],
  );
  return <Formulario fuente={fuente} />;
}

function UnirseReal({ slug }: { slug: string }) {
  const { estado, recargar } = useFilaPublica(slug);
  const [params] = useSearchParams();
  const origen = params.get("origen") === "qr" ? "local" : "remoto";
  const ahora = useReloj(30_000);

  if (estado.tipo === "cargando") return <Cargando />;
  if (estado.tipo === "no_existe") return <NoEncontrado />;
  if (estado.tipo === "error") return <SinConexion alReintentar={() => void recargar()} />;
  return <FormularioReal slug={slug} datos={estado.datos} ahora={ahora} origen={origen} />;
}

function FormularioReal({
  slug,
  datos,
  ahora,
  origen,
}: {
  slug: string;
  datos: FilaPublica;
  ahora: Date;
  origen: "local" | "remoto";
}) {
  const fuente = useMemo<Fuente>(() => {
    const entrada = entradaEta(datos, ahora);
    const primerServicio = datos.servicios[0]?.id ?? "";
    return {
      nombreBarberia: datos.barberia.nombre,
      barberos: datos.barberos.map((b, i) => ({
        id: b.id,
        nombre: b.nombre,
        apodo: b.en_pausa ? "En pausa" : b.apodo,
        tono: tonoDe(i),
      })),
      servicios: datos.servicios.map((s) => ({
        id: s.id,
        nombre: s.nombre,
        detalle: null,
        minutos: s.duracion_min,
        precio: s.precio_ref,
      })),
      esperar: (barbero, servicio) => {
        const estimado = estimarNuevo(entrada, {
          barberoId: barbero === CUALQUIERA ? null : barbero,
          servicioId: servicio ?? primerServicio,
        });
        if (estimado.minutos === null) return null;
        return { minutos: redondear5(estimado.minutos), rango: rangoDe(estimado.minutos) };
      },
      verificacion: "turnstile",
      enviar: async (envio) => {
        const resultado = await anotarse({
          slug,
          nombre: envio.nombre,
          telefono: envio.telefono,
          barberoId: envio.barbero === CUALQUIERA ? null : envio.barbero,
          servicioId: envio.servicio,
          origen,
          secreto: envio.secreto,
          clave: envio.clave,
          turnstile: envio.token ?? "",
        });
        if (resultado.ok) guardarSecreto(resultado.codigo, envio.secreto);
        return resultado;
      },
    };
  }, [datos, ahora, slug, origen]);
  return <Formulario fuente={fuente} />;
}

function Formulario({ fuente }: { fuente: Fuente }) {
  useTitulo(`Anotarme · ${fuente.nombreBarberia}`);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const sugerido = params.get("barbero");
  const esOpcion = (valor: string | null) =>
    valor === CUALQUIERA || fuente.barberos.some((b) => b.id === valor);

  const [paso, setPaso] = useState(0);
  const [direccion, setDireccion] = useState(1);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [barbero, setBarbero] = useState<string | null>(esOpcion(sugerido) ? sugerido : null);
  const [servicio, setServicio] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [verificado, setVerificado] = useState(false);
  // Un doble envío con la misma clave devuelve el mismo turno; el secreto sirve para cancelar.
  const [clave, setClave] = useState(() => crypto.randomUUID());
  const [secreto] = useState(nuevoSecreto);
  // Cambiarlo vuelve a mostrar Turnstile desde cero (un token se usa una sola vez).
  const [intento, setIntento] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<ErrorUnirse | null>(null);
  const [turno, setTurno] = useState<{ codigo: string; numero: number } | null>(null);

  const corto = nombreCorto(nombre);
  const digitos = telefono.replace(/\D/g, "");
  const telefonoValido = digitos.length === 0 || digitos.length === 8;
  const humano = fuente.verificacion === "simulada" ? verificado : token !== null;
  const valido = [corto.length >= 2 && telefonoValido, barbero !== null, servicio !== null, humano][
    paso
  ];

  // Turnstile simulado del prototipo.
  useEffect(() => {
    if (fuente.verificacion !== "simulada" || paso !== 3) return;
    const id = window.setTimeout(() => setVerificado(true), 1500);
    return () => window.clearTimeout(id);
  }, [paso, fuente.verificacion]);

  // Después de la animación del número, a la página del turno.
  useEffect(() => {
    if (!turno) return;
    const id = window.setTimeout(
      () => navigate(`/t/${turno.codigo}`, { state: { nombre: corto, barbero, servicio } }),
      1900,
    );
    return () => window.clearTimeout(id);
  }, [turno, navigate, corto, barbero, servicio]);

  function ir(destino: number) {
    setDireccion(destino > paso ? 1 : -1);
    setPaso(destino);
    setError(null);
  }

  function elegirYSeguir(accion: () => void) {
    accion();
    window.setTimeout(() => ir(paso + 1), 380);
  }

  async function tomarTurno() {
    if (!barbero || !servicio) return;
    setEnviando(true);
    setError(null);
    const resultado = await fuente.enviar({
      nombre,
      telefono: digitos.length === 8 ? `+504${digitos}` : null,
      barbero,
      servicio,
      secreto,
      clave,
      token,
    });
    if (resultado.ok) {
      setTurno({ codigo: resultado.codigo, numero: resultado.numero });
      return;
    }
    setError(resultado.error);
    setEnviando(false);
    if (resultado.error === "verificacion") {
      setToken(null);
      setClave(crypto.randomUUID());
      setIntento((n) => n + 1);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto w-full max-w-lg px-4 pt-5">
        <div className="flex items-center justify-between gap-3">
          {paso === 0 ? (
            <Link
              to={{ pathname: "..", search: params.get("origen") === "qr" ? "?origen=qr" : "" }}
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
              disabled={enviando}
              className="grid size-11 place-items-center rounded-full ring-1 ring-borde transition hover:bg-superficie-2"
            >
              <ArrowLeft className="size-5" />
            </button>
          )}
          <p className="text-sm font-medium text-tenue">
            Paso {paso + 1} de {PASOS}
          </p>
          <span className="min-w-0 truncate font-display text-lg font-extrabold uppercase">
            {fuente.nombreBarberia}
          </span>
        </div>
        <BarraPoste valor={(paso + 1) / PASOS} className="mt-4 h-2.5" />
      </header>

      <main className="relative mx-auto w-full max-w-lg flex-1 overflow-x-clip px-4 pt-10 pb-48">
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
                numeroPrevio={fuente.numeroPrevio}
                telefono={telefono}
                telefonoValido={telefonoValido}
                onNombre={setNombre}
                onTelefono={setTelefono}
              />
            )}
            {paso === 1 && (
              <PasoBarbero
                fuente={fuente}
                elegido={barbero}
                onElegir={(id) => elegirYSeguir(() => setBarbero(id))}
              />
            )}
            {paso === 2 && (
              <PasoServicio
                servicios={fuente.servicios}
                elegido={servicio}
                onElegir={(id) => elegirYSeguir(() => setServicio(id))}
              />
            )}
            {paso === 3 && barbero && servicio && (
              <PasoConfirmar
                fuente={fuente}
                nombre={corto}
                barbero={barbero}
                servicio={servicio}
                verificacion={
                  fuente.verificacion === "simulada" ? (
                    <VerificacionSimulada verificado={verificado} />
                  ) : (
                    <Turnstile key={intento} onToken={setToken} />
                  )
                }
              />
            )}
          </motion.section>
        </AnimatePresence>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-30 bg-linear-to-t from-fondo from-60% to-transparent px-4 pt-10 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-lg">
          {error && (
            <p
              role="alert"
              className="mb-3 rounded-2xl bg-superficie px-4 py-3 text-sm font-medium text-rojo ring-1 ring-rojo/40"
            >
              {MENSAJES[error]}
            </p>
          )}
          <BotonPrincipal
            disabled={!valido || enviando}
            onClick={() => (paso < PASOS - 1 ? ir(paso + 1) : void tomarTurno())}
          >
            {paso < PASOS - 1 ? "Siguiente" : enviando ? "Tomando tu turno…" : "Tomar mi turno"}
          </BotonPrincipal>
        </div>
      </footer>

      <AnimatePresence>
        {turno && <Imprimiendo nombre={corto} numero={turno.numero} />}
      </AnimatePresence>
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
  numeroPrevio,
  telefono,
  telefonoValido,
  onNombre,
  onTelefono,
}: {
  nombre: string;
  corto: string;
  numeroPrevio: number | undefined;
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
      <div className="mt-4 min-h-10">
        <AnimatePresence>
          {corto.length >= 2 && (
            <motion.p
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6 }}
              className="inline-flex max-w-full items-center gap-2 rounded-full bg-superficie py-1.5 pr-4 pl-1.5 text-sm ring-1 ring-borde"
            >
              {numeroPrevio !== undefined && (
                <span className="rounded-full bg-tinta px-2.5 py-1 font-display font-extrabold text-fondo">
                  #{numeroPrevio}
                </span>
              )}
              <span className={cx("min-w-0 break-words", numeroPrevio === undefined && "pl-2.5")}>
                Así te verán en la fila: <strong>{corto}</strong>
              </span>
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
  fuente,
  elegido,
  onElegir,
}: {
  fuente: Fuente;
  elegido: string | null;
  onElegir: (id: string) => void;
}) {
  return (
    <fieldset>
      <legend>
        <Titulo acento="te cortas?">¿Con quién</Titulo>
      </legend>
      <div className="mt-8 grid gap-3">
        <Opcion
          activo={elegido === CUALQUIERA}
          nombre="barbero"
          valor={CUALQUIERA}
          onElegir={() => onElegir(CUALQUIERA)}
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
        {fuente.barberos.map((b) => {
          const espera = fuente.esperar(b.id, null);
          return (
            <Opcion
              key={b.id}
              activo={elegido === b.id}
              nombre="barbero"
              valor={b.id}
              onElegir={() => onElegir(b.id)}
            >
              <Avatar nombre={b.nombre} tono={b.tono} className="size-14 text-3xl" />
              <span className="min-w-0 flex-1">
                <span className="block font-display text-2xl leading-none font-extrabold break-words uppercase">
                  {b.nombre}
                </span>
                {b.apodo && <span className="mt-1 block text-sm opacity-70">{b.apodo}</span>}
              </span>
              <span className="shrink-0 text-right">
                <span className="block font-display text-xl leading-none font-extrabold">
                  {espera ? `≈ ${duracion(espera.minutos)}` : "—"}
                </span>
                <span className="mt-1 block text-xs opacity-70">de espera</span>
              </span>
            </Opcion>
          );
        })}
      </div>
    </fieldset>
  );
}

function PasoServicio({
  servicios,
  elegido,
  onElegir,
}: {
  servicios: Fuente["servicios"];
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
            <span className="min-w-0">
              <span className="block font-display text-2xl leading-none font-extrabold break-words uppercase">
                {s.nombre}
              </span>
              {s.detalle && <span className="mt-1 block text-sm opacity-70">{s.detalle}</span>}
            </span>
            <span className="flex w-full flex-wrap items-end justify-between gap-2">
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
  fuente,
  nombre,
  barbero,
  servicio,
  verificacion,
}: {
  fuente: Fuente;
  nombre: string;
  barbero: string;
  servicio: string;
  verificacion: ReactNode;
}) {
  const detalle = fuente.servicios.find((s) => s.id === servicio);
  const nombreBarbero =
    barbero === CUALQUIERA
      ? "El primero libre"
      : (fuente.barberos.find((b) => b.id === barbero)?.nombre ?? "—");
  const espera = fuente.esperar(barbero, servicio);
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
              <p className="font-display text-5xl leading-[0.9] font-black break-words uppercase">
                {nombre}
              </p>
              <p className="mt-1 text-sm text-tenue">en {fuente.nombreBarberia}</p>
            </>
          }
          abajo={
            <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
              <Dato titulo="Barbero" valor={nombreBarbero} />
              <Dato titulo="Servicio" valor={detalle?.nombre ?? "—"} />
              <Dato
                titulo="Te toca en"
                valor={espera ? `≈ ${rango(espera.rango)}` : "Por confirmar"}
              />
              <Dato titulo="Precio" valor={lempiras(detalle?.precio ?? 0)} />
            </dl>
          }
        />
      </motion.div>

      <div className="mt-6">{verificacion}</div>
      <p className="mt-4 flex items-start gap-2 text-xs text-tenue">
        <ShieldCheck className="size-4 shrink-0" />
        Usamos tu nombre para llamarte y tu teléfono solo para avisarte. No lo compartimos ni lo
        mostramos en pantallas.
      </p>
    </>
  );
}

function VerificacionSimulada({ verificado }: { verificado: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-superficie p-4 ring-1 ring-borde">
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
  );
}

function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-sm text-tenue">{titulo}</dt>
      <dd className="mt-0.5 font-display text-2xl leading-none font-extrabold break-words uppercase">
        {valor}
      </dd>
    </div>
  );
}

function Imprimiendo({ nombre, numero }: { nombre: string; numero: number }) {
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
          #{numero}
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
