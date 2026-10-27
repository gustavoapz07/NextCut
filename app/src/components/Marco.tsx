// Marco de todas las pantallas: barra de carga, menú de pantallas y scroll.
// El menú se abre tocando el logo, para no sumar nada visible a las pantallas.

import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, ScrollRestoration, useLocation, useNavigation } from "react-router";
import { cx } from "@/lib/utilidades";
import { pantallas } from "@/prototipo/pantallas";
import { Franjas, Poste } from "./Franjas";
import { Marca } from "./Marca";

const AbrirMenu = createContext<() => void>(() => {});

export function MarcoPrototipo() {
  const navegacion = useNavigation();
  const [abierto, setAbierto] = useState(false);
  const abrir = useCallback(() => setAbierto(true), []);
  const cerrar = useCallback(() => setAbierto(false), []);
  return (
    <AbrirMenu.Provider value={abrir}>
      <AnimatePresence>
        {navegacion.state !== "idle" && (
          <motion.div
            className="fixed inset-x-0 top-0 z-[70] h-1.5 origin-left overflow-hidden"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 0.85 }}
            exit={{ scaleX: 1, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Franjas ancho={5} velocidad={0.5} className="absolute inset-0" />
          </motion.div>
        )}
      </AnimatePresence>
      <Outlet />
      <MenuPantallas abierto={abierto} onCerrar={cerrar} />
      <ScrollRestoration />
    </AbrirMenu.Provider>
  );
}

/** El logo de los encabezados: al tocarlo abre el menú con todas las pantallas. */
export function BotonMarca({ className }: { className?: string }) {
  const abrir = useContext(AbrirMenu);
  return (
    <button
      type="button"
      onClick={abrir}
      aria-label="NextCut: ver todas las pantallas"
      className="rounded-lg text-left"
    >
      <Marca className={className} />
    </button>
  );
}

/** Pantalla de carga mientras llega el código de una página. */
export function Cargando() {
  return (
    <div className="grid min-h-dvh place-items-center bg-fondo text-tinta">
      <Poste className="h-28 w-8" velocidad={0.9} ancho={6} />
    </div>
  );
}

function MenuPantallas({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  const cerrar = useRef<HTMLButtonElement>(null);
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (!abierto) return;
    cerrar.current?.focus();
    const alPresionar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", alPresionar);
    return () => window.removeEventListener("keydown", alPresionar);
  }, [abierto, onCerrar]);

  return (
    <AnimatePresence>
      {abierto && (
        <div className="print:hidden">
          <motion.button
            type="button"
            aria-label="Cerrar el menú"
            tabIndex={-1}
            onClick={onCerrar}
            className="fixed inset-0 z-50 bg-noche/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.nav
            aria-label="Pantallas"
            className="fixed inset-y-0 right-0 z-50 flex w-[min(23rem,90vw)] flex-col overflow-y-auto bg-fondo text-tinta shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
          >
            <Franjas className="h-2 shrink-0" ancho={6} />
            <div className="flex items-center justify-between gap-4 px-5 pt-5">
              <Link to="/" onClick={onCerrar} className="rounded-lg">
                <Marca />
              </Link>
              <button
                ref={cerrar}
                type="button"
                aria-label="Cerrar"
                onClick={onCerrar}
                className="grid size-10 shrink-0 place-items-center rounded-full ring-1 ring-borde transition hover:bg-superficie-2"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="grid gap-6 px-3 py-6">
              {pantallas.map((grupo) => (
                <section key={grupo.grupo}>
                  <h2 className="px-4 text-sm font-medium text-tenue">{grupo.grupo}</h2>
                  <ul className="mt-1">
                    {grupo.items.map((p) => (
                      <li key={p.ruta}>
                        <NavLink
                          to={p.ruta}
                          end
                          onClick={onCerrar}
                          className={({ isActive }) =>
                            cx(
                              "flex items-center gap-3 rounded-2xl px-4 py-2.5 transition",
                              isActive && !search
                                ? "bg-poste-rojo text-white"
                                : "hover:bg-superficie-2",
                            )
                          }
                        >
                          <p.icono className="size-5 shrink-0" />
                          <span className="font-semibold">{p.titulo}</span>
                        </NavLink>
                        {p.estados && (
                          <ul className="mt-1 mb-2 flex flex-wrap gap-1.5 pl-12">
                            {p.estados.map((estado) => {
                              const destino = `?estado=${estado.clave}`;
                              const activo = pathname === p.ruta && search === destino;
                              return (
                                <li key={estado.clave}>
                                  <Link
                                    to={`${p.ruta}${destino}`}
                                    onClick={onCerrar}
                                    className={cx(
                                      "block rounded-full px-3 py-1.5 text-sm ring-1 transition",
                                      activo
                                        ? "bg-tinta text-fondo ring-tinta"
                                        : "ring-borde hover:bg-superficie-2",
                                    )}
                                  >
                                    {estado.titulo}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </motion.nav>
        </div>
      )}
    </AnimatePresence>
  );
}
