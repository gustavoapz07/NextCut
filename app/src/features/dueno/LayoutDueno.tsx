import { ArrowUpRight, LayoutDashboard, QrCode, Settings } from "lucide-react";
import { motion } from "motion/react";
import { Link, NavLink, Outlet } from "react-router";
import { Poste } from "@/components/Franjas";
import { BotonMarca } from "@/components/Marco";
import { cx } from "@/lib/utilidades";
import { barberia } from "@/prototipo/datos";

const secciones = [
  { ruta: "/dueno", titulo: "Resumen", corto: "Resumen", icono: LayoutDashboard },
  { ruta: "/dueno/configuracion", titulo: "Configuración", corto: "Ajustes", icono: Settings },
  { ruta: "/dueno/qr", titulo: "Código QR", corto: "QR", icono: QrCode },
];

const resorte = { type: "spring" as const, stiffness: 380, damping: 32 };

export function LayoutDueno() {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="relative hidden overflow-hidden bg-noche p-6 text-hueso lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col print:hidden">
        <BotonMarca className="text-3xl" />
        <div className="mt-8 rounded-[1.5rem] bg-white/5 p-4 ring-1 ring-white/10">
          <p className="text-sm font-medium text-hueso/70">Barbería</p>
          <p className="font-display text-4xl leading-none font-black uppercase">
            {barberia.nombre}
          </p>
          <p className="mt-2 text-sm text-hueso/70">Abierta hasta {barberia.cierra}</p>
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
        </div>
        <Poste
          className="pointer-events-none absolute -right-5 bottom-24 h-52 w-11 rotate-12 text-hueso opacity-20"
          velocidad={3}
        />
      </aside>

      <header className="flex items-center justify-between px-4 pt-5 lg:hidden print:hidden">
        <BotonMarca />
        <span className="font-display text-xl font-black uppercase">{barberia.nombre}</span>
      </header>

      <main className="min-w-0 px-4 pt-6 pb-32 sm:px-6 lg:px-10 lg:pt-10 lg:pb-14">
        <Outlet />
      </main>

      <nav
        aria-label="Secciones del dueño"
        className="fixed inset-x-3 bottom-3 z-30 mx-auto grid max-w-md grid-cols-3 gap-1 rounded-full bg-noche p-1.5 text-hueso shadow-2xl ring-1 ring-white/10 lg:hidden print:hidden"
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
  );
}
