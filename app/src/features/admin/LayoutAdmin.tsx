import { LogOut, Plus, ShieldCheck, Store } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link, Navigate, NavLink, Outlet, useLocation } from "react-router";
import { Poste } from "@/components/Franjas";
import { BotonMarca, Cargando } from "@/components/Marco";
import { debeCambiarClave, soyAdmin } from "@/lib/cuentas";
import { useTitulo } from "@/lib/ganchos";
import { salir, useSesion } from "@/lib/sesion";
import { cx } from "@/lib/utilidades";

// Panel del super admin (ADR-018): su propia entrada, aparte de los paneles de las barberías.
// Quién es admin lo decide la tabla privado.admins; cada función lo vuelve a revisar.

const resorte = { type: "spring" as const, stiffness: 380, damping: 32 };

const SECCIONES = [
  { ruta: "/admin", titulo: "Barberías", corto: "Barberías", icono: Store },
  { ruta: "/admin/nueva", titulo: "Nueva barbería", corto: "Nueva", icono: Plus },
];

/** /admin/nueva no cuenta como "Barberías"; el detalle de una barbería sí. */
const activa = (ruta: string, pathname: string) =>
  ruta === "/admin" ? pathname === "/admin" || pathname.startsWith("/admin/b/") : pathname === ruta;

export function LayoutAdmin() {
  const sesion = useSesion();
  const { pathname } = useLocation();
  if (sesion.tipo === "cargando") return <Cargando />;
  if (sesion.tipo === "fuera") {
    return <Navigate to={`/entrar?siguiente=${encodeURIComponent(pathname)}`} replace />;
  }
  if (debeCambiarClave(sesion.sesion.user)) {
    return <Navigate to={`/cambiar-clave?siguiente=${encodeURIComponent(pathname)}`} replace />;
  }
  return <LayoutReal correo={sesion.sesion.user.email ?? ""} />;
}

function LayoutReal({ correo }: { correo: string }) {
  const [admin, setAdmin] = useState<boolean | null>(null);
  const { pathname } = useLocation();
  useEffect(() => {
    let vivo = true;
    void soyAdmin().then((es) => {
      if (vivo) setAdmin(es);
    });
    return () => {
      vivo = false;
    };
  }, []);

  if (admin === null) return <Cargando />;
  if (!admin) return <NoEsAdmin />;

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="relative hidden overflow-hidden bg-noche p-6 text-hueso lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col">
        <BotonMarca className="text-3xl" />
        <div className="mt-8 rounded-[1.5rem] bg-white/5 p-4 ring-1 ring-white/10">
          <p className="flex items-center gap-1.5 text-sm font-medium text-hueso/70">
            <ShieldCheck className="size-4" /> Administración
          </p>
          <p className="mt-1 text-sm font-semibold break-all">{correo}</p>
        </div>

        <nav aria-label="Secciones del admin" className="mt-8 grid gap-1">
          {SECCIONES.map((s) => {
            const esta = activa(s.ruta, pathname);
            return (
              <NavLink
                key={s.ruta}
                to={s.ruta}
                className={cx(
                  "relative flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-colors",
                  esta ? "text-noche" : "text-hueso/75 hover:bg-white/5 hover:text-hueso",
                )}
              >
                {esta && (
                  <motion.span
                    layoutId="nav-admin"
                    className="absolute inset-0 rounded-xl bg-hueso"
                    transition={resorte}
                  />
                )}
                <s.icono className="relative size-5" />
                <span className="relative">{s.titulo}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="relative mt-auto grid gap-1 text-sm">
          <button
            type="button"
            onClick={() => void salir()}
            className="flex items-center justify-between rounded-xl px-4 py-2 text-left text-hueso/70 transition hover:bg-white/5 hover:text-hueso"
          >
            Salir <LogOut className="size-4" />
          </button>
        </div>
        <Poste
          className="pointer-events-none absolute -right-5 bottom-24 h-52 w-11 rotate-12 text-hueso opacity-20"
          velocidad={3}
        />
      </aside>

      <header className="flex items-center justify-between gap-3 px-4 pt-5 lg:hidden">
        <BotonMarca />
        <span className="flex min-w-0 items-center gap-1.5 truncate font-display text-xl font-black uppercase">
          <ShieldCheck className="size-5 shrink-0" /> Admin
        </span>
        <button
          type="button"
          onClick={() => void salir()}
          aria-label="Salir"
          className="grid size-10 shrink-0 place-items-center rounded-full ring-1 ring-borde"
        >
          <LogOut className="size-4" />
        </button>
      </header>

      <main className="min-w-0 px-4 pt-6 pb-32 sm:px-6 lg:px-10 lg:pt-10 lg:pb-14">
        <Outlet />
      </main>

      <motion.nav
        layoutRoot
        aria-label="Secciones del admin"
        className="fixed inset-x-3 bottom-3 z-30 mx-auto grid max-w-xs grid-cols-2 gap-1 rounded-full bg-noche p-1.5 text-hueso shadow-2xl ring-1 ring-white/10 lg:hidden"
      >
        {SECCIONES.map((s) => {
          const esta = activa(s.ruta, pathname);
          return (
            <NavLink
              key={s.ruta}
              to={s.ruta}
              className={cx(
                "relative flex flex-col items-center gap-0.5 rounded-full py-2 text-xs font-bold transition-colors",
                esta ? "text-noche" : "text-hueso/70",
              )}
            >
              {esta && (
                <motion.span
                  layoutId="tab-admin"
                  className="absolute inset-0 rounded-full bg-hueso"
                  transition={resorte}
                />
              )}
              <s.icono className="relative size-5" />
              <span className="relative">{s.corto}</span>
            </NavLink>
          );
        })}
      </motion.nav>
    </div>
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
      <p className="mt-4 text-lg text-tenue">Esta cuenta no administra NextCut.</p>
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
