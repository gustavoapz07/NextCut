import { ArrowLeft, ArrowUpRight, ChevronRight, KeyRound, Plus, Store, Tv } from "lucide-react";
import { type FormEvent, type ReactNode, useCallback, useEffect, useId, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ClaveTemporal } from "@/components/ClaveTemporal";
import { Cargando } from "@/components/Marco";
import { BotonPrincipal, claseCampo } from "@/components/Piezas";
import { SinConexion } from "@/components/SinConexion";
import {
  cargarBarberiasAdmin,
  cargarDetalleAdmin,
  crearBarberia,
  type DetalleBarberia,
  MENSAJES_CUENTAS,
  type ResultadoAdmin,
  type ResultadoDetalle,
  restablecerDueno,
  slugDe,
} from "@/lib/cuentas";
import { lempiras } from "@/lib/formato";
import { useTitulo } from "@/lib/ganchos";

// Las secciones del panel del admin (ADR-018). El marco y la revisión de que la cuenta es admin
// viven en LayoutAdmin; aquí, cada función de la base lo vuelve a revisar.

function Encabezado({
  antes,
  titulo,
  accion,
}: {
  antes: string;
  titulo: string;
  accion?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="text-lg font-medium text-tenue">{antes}</p>
        <h1 className="font-display text-[clamp(3rem,10vw,5.5rem)] leading-[0.9] font-black break-words uppercase">
          {titulo}
        </h1>
      </div>
      {accion}
    </div>
  );
}

function Tarjeta({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="min-w-0 rounded-[2rem] bg-superficie p-6 ring-1 ring-borde">
      <h2 className="font-display text-3xl leading-none font-black uppercase">{titulo}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Aviso({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-2xl bg-superficie px-4 py-3 text-sm font-medium text-rojo ring-1 ring-rojo/40"
    >
      {children}
    </p>
  );
}

const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-HN", { day: "numeric", month: "short", year: "numeric" });

// ---------------------------------------------------------------------------------------------
// /admin: todas las barberías
// ---------------------------------------------------------------------------------------------

export function Barberias() {
  useTitulo("Barberías · Administración");
  const [estado, setEstado] = useState<{ tipo: "cargando" } | ResultadoAdmin>({
    tipo: "cargando",
  });
  const cargar = useCallback(async () => {
    setEstado({ tipo: "cargando" });
    setEstado(await cargarBarberiasAdmin());
  }, []);
  useEffect(() => {
    void cargar();
  }, [cargar]);

  if (estado.tipo === "cargando") return <Cargando />;
  if (estado.tipo !== "listo") {
    return (
      <SinConexion titulo="No pudimos cargar las barberías" alReintentar={() => void cargar()} />
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Encabezado
        antes="Administración"
        titulo="Barberías"
        accion={
          <Link
            to="/admin/nueva"
            className="flex h-12 items-center gap-2 rounded-full bg-tinta px-5 font-semibold text-fondo"
          >
            <Plus className="size-5" /> Nueva barbería
          </Link>
        }
      />
      <p className="mt-3 text-tenue">
        {estado.barberias.length === 1
          ? "1 barbería dada de alta."
          : `${estado.barberias.length} barberías dadas de alta.`}
      </p>

      {estado.barberias.length === 0 ? (
        <div className="mt-8 rounded-[2rem] bg-superficie p-8 text-center ring-1 ring-borde">
          <Store className="mx-auto size-10 text-tenue" />
          <p className="mt-3 font-semibold">Todavía no hay barberías.</p>
          <p className="mt-1 text-sm text-tenue">Da de alta la primera con su dueño.</p>
        </div>
      ) : (
        <ul className="mt-8 grid gap-3">
          {estado.barberias.map((b) => (
            <li key={b.id}>
              <Link
                to={`/admin/b/${b.id}`}
                className="flex items-center gap-4 rounded-[1.5rem] bg-superficie p-5 ring-1 ring-borde transition hover:ring-tinta"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-display text-2xl leading-none font-black break-words uppercase">
                    {b.nombre}
                  </p>
                  <p className="mt-1.5 text-sm text-tenue break-all">
                    /b/{b.slug} · {b.dueno_correo ?? "Sin dueño"}
                  </p>
                  <p className="mt-1 text-sm text-tenue">
                    {b.barberos} {b.barberos === 1 ? "barbero" : "barberos"}
                    {b.zona ? ` · ${b.zona}` : ""} · desde {fecha(b.creado_en)}
                  </p>
                </div>
                <ChevronRight className="size-5 shrink-0 text-tenue" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// /admin/nueva: alta de una barbería con su dueño
// ---------------------------------------------------------------------------------------------

type Creada = { slug: string; correo: string; clave: string | null };

export function NuevaBarberia() {
  useTitulo("Nueva barbería · Administración");
  const [creada, setCreada] = useState<Creada | null>(null);

  return (
    <div className="mx-auto max-w-2xl">
      <Encabezado antes="Administración" titulo="Nueva barbería" />
      <div className="mt-8 grid gap-4">
        {creada ? (
          <Lista creada={creada} onOtra={() => setCreada(null)} />
        ) : (
          <FormularioAlta onCreada={setCreada} />
        )}
      </div>
    </div>
  );
}

function Lista({ creada, onOtra }: { creada: Creada; onOtra: () => void }) {
  const [verClave, setVerClave] = useState(true);
  return (
    <>
      {creada.clave && verClave ? (
        <ClaveTemporal
          titulo={`Lista: /b/${creada.slug}`}
          correo={creada.correo}
          clave={creada.clave}
          onCerrar={() => setVerClave(false)}
        />
      ) : (
        <p className="rounded-2xl bg-superficie px-4 py-3 text-sm font-medium ring-1 ring-borde">
          {creada.clave
            ? `Lista: /b/${creada.slug}.`
            : `Lista: /b/${creada.slug}. ${creada.correo} ya tenía cuenta: entra con su contraseña de siempre.`}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onOtra}
          className="flex h-14 items-center justify-center gap-2 rounded-full font-semibold ring-1 ring-borde"
        >
          <Plus className="size-5" /> Dar de alta otra
        </button>
        <Link
          to="/admin"
          className="flex h-14 items-center justify-center rounded-full bg-tinta font-semibold text-fondo"
        >
          Ver todas las barberías
        </Link>
      </div>
    </>
  );
}

function FormularioAlta({ onCreada }: { onCreada: (creada: Creada) => void }) {
  const [nombre, setNombre] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTocado, setSlugTocado] = useState(false);
  const [zona, setZona] = useState("");
  const [correo, setCorreo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ids = { nombre: useId(), slug: useId(), zona: useId(), correo: useId() };

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setEnviando(true);
    setError(null);
    const resultado = await crearBarberia({ nombre, slug, zona, correoDueno: correo });
    setEnviando(false);
    if (!resultado.ok) {
      setError(MENSAJES_CUENTAS[resultado.error]);
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    onCreada(resultado.datos);
  }

  return (
    <form
      onSubmit={(e) => void enviar(e)}
      className="rounded-[2rem] bg-superficie p-6 ring-1 ring-borde"
    >
      <p className="text-sm text-tenue">
        Se crea con su dueño y un servicio "Corte" para empezar. El dueño agrega a sus barberos y
        ajusta los servicios y el horario desde su configuración.
      </p>

      <div className="mt-5 grid gap-4">
        <div>
          <label htmlFor={ids.nombre} className="mb-1.5 block text-sm font-semibold">
            Nombre de la barbería
          </label>
          <input
            id={ids.nombre}
            required
            minLength={2}
            maxLength={60}
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              if (!slugTocado) setSlug(slugDe(e.target.value));
            }}
            placeholder="Barbería Don Juan"
            className={claseCampo}
          />
        </div>
        <div>
          <label htmlFor={ids.slug} className="mb-1.5 block text-sm font-semibold">
            Dirección pública
          </label>
          <div className="flex items-center rounded-2xl bg-superficie ring-1 ring-borde focus-within:ring-2 focus-within:ring-azul">
            <span className="pl-4 text-lg text-tenue">/b/</span>
            <input
              id={ids.slug}
              required
              minLength={3}
              maxLength={40}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              title="Minúsculas, números y guiones"
              value={slug}
              onChange={(e) => {
                setSlugTocado(true);
                setSlug(e.target.value.toLowerCase());
              }}
              className="h-14 w-full min-w-0 bg-transparent pr-4 text-lg outline-none"
            />
          </div>
          <p className="mt-1 text-sm text-tenue">Es la del QR: después no conviene cambiarla.</p>
        </div>
        <div>
          <label htmlFor={ids.zona} className="mb-1.5 block text-sm font-semibold">
            Zona (opcional)
          </label>
          <input
            id={ids.zona}
            maxLength={80}
            value={zona}
            onChange={(e) => setZona(e.target.value)}
            placeholder="Barrio El Centro, El Progreso"
            className={claseCampo}
          />
        </div>
        <div>
          <label htmlFor={ids.correo} className="mb-1.5 block text-sm font-semibold">
            Correo del dueño
          </label>
          <input
            id={ids.correo}
            type="email"
            required
            autoComplete="off"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="dueno@correo.com"
            className={claseCampo}
          />
          <p className="mt-1 text-sm text-tenue">
            No se le manda nada: tú le pasas la contraseña temporal.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-5">
          <Aviso>{error}</Aviso>
        </div>
      )}
      <BotonPrincipal type="submit" className="mt-6" disabled={enviando}>
        {enviando ? "Creando…" : "Crear barbería"}
      </BotonPrincipal>
    </form>
  );
}

// ---------------------------------------------------------------------------------------------
// /admin/b/:id: el detalle de una barbería
// ---------------------------------------------------------------------------------------------

export function DetalleBarberiaAdmin() {
  const { id = "" } = useParams();
  const [estado, setEstado] = useState<{ tipo: "cargando" } | ResultadoDetalle>({
    tipo: "cargando",
  });
  const cargar = useCallback(async () => {
    setEstado({ tipo: "cargando" });
    setEstado(await cargarDetalleAdmin(id));
  }, [id]);
  useEffect(() => {
    void cargar();
  }, [cargar]);
  useTitulo(
    estado.tipo === "listo" ? `${estado.barberia.nombre} · Administración` : "Administración",
  );

  if (estado.tipo === "cargando") return <Cargando />;
  if (estado.tipo === "no_existe") {
    return (
      <div className="mx-auto max-w-2xl">
        <Volver />
        <p className="mt-6 text-lg">Esta barbería no existe.</p>
      </div>
    );
  }
  if (estado.tipo !== "listo") {
    return (
      <SinConexion titulo="No pudimos cargar la barbería" alReintentar={() => void cargar()} />
    );
  }
  return <Detalle barberia={estado.barberia} />;
}

function Volver() {
  return (
    <Link
      to="/admin"
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-tenue hover:text-tinta"
    >
      <ArrowLeft className="size-4" /> Todas las barberías
    </Link>
  );
}

function Detalle({ barberia: b }: { barberia: DetalleBarberia }) {
  const navigate = useNavigate();
  const [clave, setClave] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const activos = b.barberos.filter((x) => x.activo);
  const inactivos = b.barberos.length - activos.length;

  async function nuevaClaveDueno() {
    if (!b.dueno_correo) return;
    if (
      !window.confirm(
        `¿Poner una contraseña nueva a ${b.dueno_correo}? La de ahora deja de servir.`,
      )
    ) {
      return;
    }
    setEnviando(true);
    setAviso(null);
    const resultado = await restablecerDueno(b.id);
    setEnviando(false);
    if (!resultado.ok) {
      if (resultado.error === "sin_sesion") navigate("/entrar?siguiente=/admin");
      setAviso(MENSAJES_CUENTAS[resultado.error]);
      return;
    }
    setClave(resultado.datos.clave);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Volver />
      <div className="mt-4">
        <Encabezado antes={b.zona ?? "Barbería"} titulo={b.nombre} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to={`/b/${b.slug}`}
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-borde"
        >
          /b/{b.slug} <ArrowUpRight className="size-4" />
        </Link>
        <Link
          to={`/b/${b.slug}/tv`}
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-borde"
        >
          <Tv className="size-4" /> Pantalla de TV
        </Link>
      </div>

      <div className="mt-8 grid gap-4">
        {clave && b.dueno_correo && (
          <ClaveTemporal
            titulo={`Contraseña nueva del dueño de ${b.nombre}`}
            correo={b.dueno_correo}
            clave={clave}
            onCerrar={() => setClave(null)}
          />
        )}
        {aviso && <Aviso>{aviso}</Aviso>}

        <div className="grid gap-4 sm:grid-cols-3">
          <Dato titulo="Turnos en 7 días" valor={String(b.turnos_7_dias)} />
          <Dato titulo="Atendidos en 7 días" valor={String(b.atendidos_7_dias)} />
          <Dato
            titulo="Fila en línea"
            valor={b.fila_remota_activa ? "Abierta" : "Pausada"}
            detalle={b.con_horario ? "Con horario" : "Sin horario"}
          />
        </div>

        <Tarjeta titulo="Dueño">
          <p className="font-semibold break-all">{b.dueno_correo ?? "Sin dueño"}</p>
          <p className="mt-1 text-sm text-tenue">Alta el {fecha(b.creado_en)}.</p>
          {b.dueno_correo && (
            <button
              type="button"
              onClick={() => void nuevaClaveDueno()}
              disabled={enviando}
              className="mt-4 flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ring-1 ring-borde disabled:opacity-60"
            >
              <KeyRound className="size-4" />
              {enviando ? "Generando…" : "Nueva contraseña para el dueño"}
            </button>
          )}
        </Tarjeta>

        <div className="grid gap-4 lg:grid-cols-2">
          <Tarjeta titulo={`Barberos (${activos.length})`}>
            {activos.length === 0 ? (
              <p className="text-tenue">El dueño todavía no agrega barberos.</p>
            ) : (
              <ul className="grid gap-2">
                {activos.map((x) => (
                  <li
                    key={`${x.nombre}-${x.silla}`}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-fondo px-4 py-3 ring-1 ring-borde"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold break-words">{x.nombre}</p>
                      <p className="text-sm text-tenue break-all">{x.correo ?? "Sin cuenta"}</p>
                    </div>
                    <span className="shrink-0 text-sm text-tenue tabular-nums">
                      {x.silla ? `Silla ${x.silla}` : "Sin silla"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {inactivos > 0 && (
              <p className="mt-3 text-sm text-tenue">
                {inactivos === 1 ? "1 ya no atiende." : `${inactivos} ya no atienden.`}
              </p>
            )}
          </Tarjeta>

          <Tarjeta titulo="Servicios">
            <ul className="grid gap-2">
              {b.servicios
                .filter((s) => s.activo)
                .map((s) => (
                  <li
                    key={s.nombre}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-fondo px-4 py-3 ring-1 ring-borde"
                  >
                    <span className="min-w-0 font-semibold break-words">{s.nombre}</span>
                    <span className="shrink-0 text-sm text-tenue tabular-nums">
                      {s.duracion_min} min · {lempiras(s.precio_ref)}
                    </span>
                  </li>
                ))}
            </ul>
          </Tarjeta>
        </div>
      </div>
    </div>
  );
}

function Dato({ titulo, valor, detalle }: { titulo: string; valor: string; detalle?: string }) {
  return (
    <div className="rounded-[1.5rem] bg-superficie p-5 ring-1 ring-borde">
      <p className="text-sm text-tenue">{titulo}</p>
      <p className="mt-1 font-display text-4xl leading-none font-black uppercase tabular-nums">
        {valor}
      </p>
      {detalle && <p className="mt-1 text-sm text-tenue">{detalle}</p>}
    </div>
  );
}
