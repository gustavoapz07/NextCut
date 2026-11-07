import { ArrowUpRight, KeyRound, LogOut, Store } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useId, useState } from "react";
import { Link, Navigate } from "react-router";
import { ClaveTemporal } from "@/components/ClaveTemporal";
import { BotonMarca, Cargando } from "@/components/Marco";
import { BotonPrincipal, claseCampo } from "@/components/Piezas";
import { SinConexion } from "@/components/SinConexion";
import {
  type BarberiaAdmin,
  cargarBarberiasAdmin,
  crearBarberia,
  debeCambiarClave,
  MENSAJES_CUENTAS,
  type ResultadoAdmin,
  restablecerDueno,
  slugDe,
} from "@/lib/cuentas";
import { useTitulo } from "@/lib/ganchos";
import { salir, useSesion } from "@/lib/sesion";

// Panel del super admin (ADR-017): da de alta barberías con la cuenta de su dueño y le pone una
// contraseña nueva al dueño que la olvidó. Quién es admin lo decide la tabla privado.admins.

export function Admin() {
  useTitulo("Administración");
  const sesion = useSesion();
  if (sesion.tipo === "cargando") return <Cargando />;
  if (sesion.tipo === "fuera") return <Navigate to="/entrar?siguiente=/admin" replace />;
  if (debeCambiarClave(sesion.sesion.user)) {
    return <Navigate to="/cambiar-clave?siguiente=/admin" replace />;
  }
  return <AdminReal />;
}

type Entregada = { titulo: string; correo: string; clave: string };

function AdminReal() {
  const [estado, setEstado] = useState<{ tipo: "cargando" } | ResultadoAdmin>({
    tipo: "cargando",
  });
  const [entregada, setEntregada] = useState<Entregada | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setEstado(await cargarBarberiasAdmin());
  }, []);
  useEffect(() => {
    void cargar();
  }, [cargar]);

  if (estado.tipo === "cargando") return <Cargando />;
  if (estado.tipo === "error") {
    return (
      <SinConexion titulo="No pudimos cargar las barberías" alReintentar={() => void cargar()} />
    );
  }
  if (estado.tipo === "no_admin") return <NoEsAdmin />;

  async function nuevaClaveDueno(b: BarberiaAdmin) {
    if (!b.dueno_correo) return;
    if (
      !window.confirm(
        `¿Poner una contraseña nueva a ${b.dueno_correo}? La de ahora deja de servir.`,
      )
    ) {
      return;
    }
    setAviso(null);
    const resultado = await restablecerDueno(b.id);
    if (!resultado.ok) {
      setAviso(MENSAJES_CUENTAS[resultado.error]);
      return;
    }
    setEntregada({
      titulo: `Contraseña nueva del dueño de ${b.nombre}`,
      correo: b.dueno_correo,
      clave: resultado.datos.clave,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="mx-auto min-h-dvh max-w-3xl px-4 pt-5 pb-16 sm:px-6">
      <header className="flex items-center justify-between gap-3">
        <BotonMarca />
        <button
          type="button"
          onClick={() => void salir()}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-borde"
        >
          Salir <LogOut className="size-4" />
        </button>
      </header>

      <p className="mt-10 text-lg font-medium text-tenue">Administración</p>
      <h1 className="font-display text-[clamp(3rem,10vw,5.5rem)] leading-[0.9] font-black uppercase">
        Barberías
      </h1>

      <div className="mt-8 grid gap-4">
        {entregada && (
          <ClaveTemporal
            titulo={entregada.titulo}
            correo={entregada.correo}
            clave={entregada.clave}
            onCerrar={() => setEntregada(null)}
          />
        )}
        {aviso && (
          <p
            role="alert"
            className="rounded-2xl bg-superficie px-4 py-3 text-sm font-medium text-rojo ring-1 ring-rojo/40"
          >
            {aviso}
          </p>
        )}

        <NuevaBarberia
          onCreada={(resultado) => {
            setAviso(
              resultado.clave
                ? null
                : `${resultado.correo} ya tenía cuenta: entra con su contraseña de siempre.`,
            );
            if (resultado.clave) {
              setEntregada({
                titulo: `Lista: /b/${resultado.slug}`,
                correo: resultado.correo,
                clave: resultado.clave,
              });
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
            void cargar();
          }}
        />

        <section className="rounded-[2rem] bg-superficie p-6 ring-1 ring-borde">
          <h2 className="font-display text-3xl leading-none font-black uppercase">
            Dadas de alta ({estado.barberias.length})
          </h2>
          {estado.barberias.length === 0 ? (
            <p className="mt-3 text-tenue">Todavía no hay barberías.</p>
          ) : (
            <ul className="mt-5 grid gap-2">
              {estado.barberias.map((b) => (
                <li key={b.id} className="rounded-2xl bg-fondo p-4 ring-1 ring-borde">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold break-words">{b.nombre}</p>
                      <p className="text-sm text-tenue break-all">
                        {b.dueno_correo ?? "Sin dueño"} · {b.barberos}{" "}
                        {b.barberos === 1 ? "barbero" : "barberos"}
                        {b.zona ? ` · ${b.zona}` : ""}
                      </p>
                    </div>
                    <Link
                      to={`/b/${b.slug}`}
                      className="flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ring-borde"
                    >
                      /b/{b.slug} <ArrowUpRight className="size-4" />
                    </Link>
                  </div>
                  {b.dueno_correo && (
                    <button
                      type="button"
                      onClick={() => void nuevaClaveDueno(b)}
                      className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-tenue transition hover:text-tinta"
                    >
                      <KeyRound className="size-4" /> Nueva contraseña para el dueño
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function NuevaBarberia({
  onCreada,
}: {
  onCreada: (resultado: { slug: string; correo: string; clave: string | null }) => void;
}) {
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
    setNombre("");
    setSlug("");
    setSlugTocado(false);
    setZona("");
    setCorreo("");
    onCreada(resultado.datos);
  }

  return (
    <form
      onSubmit={(e) => void enviar(e)}
      className="rounded-[2rem] bg-superficie p-6 ring-1 ring-borde"
    >
      <h2 className="flex items-center gap-2 font-display text-3xl leading-none font-black uppercase">
        <Store className="size-7" /> Nueva barbería
      </h2>
      <p className="mt-1 text-sm text-tenue">
        Se crea con su dueño y un servicio "Corte" para empezar. El dueño agrega a sus barberos y
        ajusta los servicios desde su configuración.
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
        <p
          role="alert"
          className="mt-5 rounded-2xl bg-fondo px-4 py-3 text-sm font-medium text-rojo ring-1 ring-rojo/40"
        >
          {error}
        </p>
      )}
      <BotonPrincipal type="submit" className="mt-6" disabled={enviando}>
        {enviando ? "Creando…" : "Crear barbería"}
      </BotonPrincipal>
    </form>
  );
}

function NoEsAdmin() {
  useTitulo("Solo para el administrador");
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <BotonMarca />
      <h1 className="mt-10 font-display text-6xl leading-[0.9] font-black uppercase">
        Solo para el administrador
      </h1>
      <p className="mt-4 text-lg text-tenue">Esta cuenta no puede dar de alta barberías.</p>
      <div className="mt-8 grid gap-3">
        <Link
          to="/panel"
          className="flex h-14 items-center justify-center rounded-full bg-tinta font-display text-xl font-extrabold text-fondo uppercase"
        >
          Ir a mi panel
        </Link>
        <button
          type="button"
          onClick={() => void salir()}
          className="h-14 rounded-full font-semibold ring-1 ring-borde"
        >
          Salir
        </button>
      </div>
    </main>
  );
}
