import { ArrowUpRight, LayoutDashboard, LogOut, QrCode, Settings } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, NavLink, Outlet } from "react-router";
import { Poste } from "@/components/Franjas";
import { BotonMarca, Cargando } from "@/components/Marco";
import { SinConexion } from "@/components/SinConexion";
import { cargarBarberiaDueno, type ResultadoBarberia } from "@/lib/dueno";
import { useTitulo } from "@/lib/ganchos";
import { salir, useSesion } from "@/lib/sesion";
import { cx } from "@/lib/utilidades";
import { barberia as barberiaPrototipo } from "@/prototipo/datos";
import { Contexto, type ContextoDueno } from "./contexto";

const resorte = { type: "spring" as const, stiffness: 380, damping: 32 };

// ---------------------------------------------------------------------------------------------
// Panel real (/dueno)
// ---------------------------------------------------------------------------------------------

export function LayoutDueno() {
  const sesion = useSesion();
  if (sesion.tipo === "cargando") return <Cargando />;
  if (sesion.tipo === "fuera") return <Navigate to="/entrar?siguiente=/dueno" replace />;
  return <LayoutReal userId={sesion.sesion.user.id} />;
}

function LayoutReal({ userId }: { userId: string }) {
  const [estado, setEstado] = useState<{ tipo: "cargando" } | ResultadoBarberia>({
    tipo: "cargando",
  });
  const cargar = useCallback(async () => {
    setEstado({ tipo: "cargando" });
    setEstado(await cargarBarberiaDueno(userId));
  }, [userId]);
  useEffect(() => {
    void cargar();
  }, [cargar]);

  if (estado.tipo === "cargando") return <Cargando />;
  if (estado.tipo === "error") {
    return (
      <SinConexion titulo="No pudimos cargar tu barbería" alReintentar={() => void cargar()} />
    );
  }
  if (estado.tipo === "no_dueno") return <NoEsDueno />;

  const { barberia } = estado;
  return (
    <MarcoDueno
      contexto={{
        modo: "real",
        base: "/dueno",
        barberia: {
          id: barberia.id,
          nombre: barberia.nombre,
          slug: barberia.slug,
          detalle: barberia.zona,
        },
      }}
      onSalir={() => void salir()}
    />
  );
}

function NoEsDueno() {
  useTitulo("Solo para dueños");
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <BotonMarca />
      <h1 className="mt-10 font-display text-6xl leading-[0.9] font-black uppercase">
        Solo para dueños
      </h1>
      <p className="mt-4 text-lg text-tenue">
        Esta cuenta no es dueña de ninguna barbería. Si atiendes en una silla, tu lugar es el panel
        del barbero.
      </p>
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

// ---------------------------------------------------------------------------------------------
// Prototipo (/demo/dueno)
// ---------------------------------------------------------------------------------------------

export function LayoutDuenoPrototipo() {
  return (
    <MarcoDueno
      contexto={{
        modo: "prototipo",
        base: "/demo/dueno",
        barberia: {
          id: null,
          nombre: barberiaPrototipo.nombre,
          slug: barberiaPrototipo.slug,
          detalle: `Abierta hasta ${barberiaPrototipo.cierra}`,
        },
      }}
    />
  );
}

// ---------------------------------------------------------------------------------------------
// Marco compartido
// ---------------------------------------------------------------------------------------------

function MarcoDueno({ contexto, onSalir }: { contexto: ContextoDueno; onSalir?: () => void }) {
  const { base, barberia } = contexto;
  // La configuración real llega en el siguiente paso del Sprint 4; por ahora solo en el prototipo.
  const secciones = [
    { ruta: base, titulo: "Resumen", corto: "Resumen", icono: LayoutDashboard },
    ...(contexto.modo === "prototipo"
      ? [
          {
            ruta: `${base}/configuracion`,
            titulo: "Configuración",
            corto: "Ajustes",
            icono: Settings,
          },
        ]
      : []),
    { ruta: `${base}/qr`, titulo: "Código QR", corto: "QR", icono: QrCode },
  ];

  return (
    <Contexto.Provider value={contexto}>
      <div className="min-h-dvh lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="relative hidden overflow-hidden bg-noche p-6 text-hueso lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col print:hidden">
          <BotonMarca className="text-3xl" />
          <div className="mt-8 rounded-[1.5rem] bg-white/5 p-4 ring-1 ring-white/10">
            <p className="text-sm font-medium text-hueso/70">Barbería</p>
            <p className="font-display text-4xl leading-none font-black break-words uppercase">
              {barberia.nombre}
            </p>
            {barberia.detalle && <p className="mt-2 text-sm text-hueso/70">{barberia.detalle}</p>}
          </div>

          <nav aria-label="Secciones del dueño" className="mt-8 grid gap-1">
            {secciones.map((s) => (
              <NavLink
                key={s.ruta}
                to={s.ruta}
                end
                className={({ isActive }) =>
                  cx(
                    "relative flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-colors",
                    isActive ? "text-noche" : "text-hueso/75 hover:bg-white/5 hover:text-hueso",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="nav-dueno"
                        className="absolute inset-0 rounded-xl bg-hueso"
                        transition={resorte}
                      />
                    )}
                    <s.icono className="relative size-5" />
                    <span className="relative">{s.titulo}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="relative mt-auto grid gap-1 text-sm">
            {[
              [`/b/${barberia.slug}/tv`, "Pantalla de TV"],
              [`/b/${barberia.slug}`, "Fila pública"],
            ].map(([ruta, texto]) => (
              <Link
                key={ruta}
                to={ruta ?? "/"}
                className="flex items-center justify-between rounded-xl px-4 py-2 text-hueso/70 transition hover:bg-white/5 hover:text-hueso"
              >
                {texto} <ArrowUpRight className="size-4" />
              </Link>
            ))}
            {onSalir && (
              <button
                type="button"
                onClick={onSalir}
                className="flex items-center justify-between rounded-xl px-4 py-2 text-left text-hueso/70 transition hover:bg-white/5 hover:text-hueso"
              >
                Salir <LogOut className="size-4" />
              </button>
            )}
          </div>
          <Poste
            className="pointer-events-none absolute -right-5 bottom-24 h-52 w-11 rotate-12 text-hueso opacity-20"
            velocidad={3}
          />
        </aside>

        <header className="flex items-center justify-between gap-3 px-4 pt-5 lg:hidden print:hidden">
          <BotonMarca />
          <span className="min-w-0 truncate font-display text-xl font-black uppercase">
            {barberia.nombre}
          </span>
          {onSalir && (
            <button
              type="button"
              onClick={onSalir}
              aria-label="Salir"
              className="grid size-10 shrink-0 place-items-center rounded-full ring-1 ring-borde"
            >
              <LogOut className="size-4" />
            </button>
          )}
        </header>

        <main className="min-w-0 px-4 pt-6 pb-32 sm:px-6 lg:px-10 lg:pt-10 lg:pb-14">
          <Outlet />
        </main>

        <nav
          aria-label="Secciones del dueño"
          className={cx(
            "fixed inset-x-3 bottom-3 z-30 mx-auto grid max-w-md gap-1 rounded-full bg-noche p-1.5 text-hueso shadow-2xl ring-1 ring-white/10 lg:hidden print:hidden",
            secciones.length === 3 ? "grid-cols-3" : "grid-cols-2",
          )}
        >
          {secciones.map((s) => (
            <NavLink
              key={s.ruta}
              to={s.ruta}
              end
              className={({ isActive }) =>
                cx(
                  "relative flex flex-col items-center gap-0.5 rounded-full py-2 text-xs font-bold transition-colors",
                  isActive ? "text-noche" : "text-hueso/70",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="tab-dueno"
                      className="absolute inset-0 rounded-full bg-hueso"
                      transition={resorte}
                    />
                  )}
                  <s.icono className="relative size-5" />
                  <span className="relative">{s.corto}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </Contexto.Provider>
  );
}
