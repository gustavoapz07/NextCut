import { ArrowUpRight } from "lucide-react";
import { motion, type Variants } from "motion/react";
import { Link } from "react-router";
import { Franjas, Poste } from "@/components/Franjas";
import { BotonMarca } from "@/components/Marco";
import { EnlacePrincipal, Marquesina } from "@/components/Piezas";
import { pantallas } from "@/prototipo/pantallas";
import { useTitulo } from "@/prototipo/simulacion";

const pasos = [
  {
    numero: "01",
    titulo: "Escanea",
    texto:
      "El cliente escanea el QR de la puerta o abre el enlace de Instagram. Ve cuántos hay y cuánto falta.",
  },
  {
    numero: "02",
    titulo: "Anótate",
    texto: "Pone su nombre, elige barbero y servicio. Sin descargar nada y sin crear cuenta.",
  },
  {
    numero: "03",
    titulo: "Llega a tiempo",
    texto: "Su turno avanza en vivo. Le avisamos cuando faltan 15 minutos y cuando le toca.",
  },
];

// Las letras suben sin recortarse: se animan opacidad y posición, sin contenedor que las tape.
const subir: Variants = {
  oculto: { opacity: 0, y: 48 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.14, type: "spring", stiffness: 80, damping: 15 },
  }),
};

export function Inicio() {
  useTitulo("Fila virtual para barberías");
  return (
    <div className="overflow-x-clip">
      <header className="mx-auto flex max-w-6xl items-center px-4 pt-5 sm:px-6">
        <BotonMarca />
      </header>

      <section className="mx-auto max-w-6xl px-4 pt-10 pb-16 sm:px-6 sm:pt-14">
        <p className="text-lg font-medium text-tenue sm:text-xl">Fila virtual para barberías</p>
        <div className="mt-2 flex items-end justify-between gap-4">
          <h1 className="font-display text-[clamp(6rem,30vw,17rem)] leading-[0.9] font-black tracking-tight uppercase">
            <motion.span
              className="block"
              variants={subir}
              custom={0}
              initial="oculto"
              animate="visible"
            >
              Next
            </motion.span>
            <motion.span
              className="block font-light text-rojo"
              variants={subir}
              custom={1}
              initial="oculto"
              animate="visible"
            >
              Cut
            </motion.span>
          </h1>

          <motion.div
            className="mb-[0.1em] shrink-0 text-tinta"
            initial={{ opacity: 0, y: 40, rotate: 8 }}
            animate={{ opacity: 1, y: 0, rotate: 4 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 60, damping: 12 }}
          >
            <Poste
              className="h-[clamp(11rem,50vw,25rem)] w-[clamp(2.5rem,11vw,5.25rem)]"
              velocidad={2.6}
              ancho={14}
            />
          </motion.div>
        </div>

        <motion.p
          className="mt-8 max-w-xl text-xl leading-snug sm:text-2xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          Que ningún cliente se vaya por no saber cuánto le falta.
        </motion.p>
        <motion.div
          className="mt-8 grid max-w-md gap-3 sm:max-w-none sm:grid-cols-[auto_auto] sm:justify-start"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <EnlacePrincipal to="/b/la-navaja" className="sm:w-auto sm:px-8">
            Ver la fila en vivo
          </EnlacePrincipal>
          <Link
            to="/panel"
            className="flex h-16 items-center justify-center rounded-full px-8 font-display text-2xl font-extrabold tracking-wide uppercase ring-2 ring-tinta transition hover:bg-tinta hover:text-fondo"
          >
            Panel del barbero
          </Link>
        </motion.div>
      </section>

      <div className="relative -mx-[5%] w-[110%] -rotate-2">
        <div className="bg-tinta py-3 text-fondo">
          <Marquesina
            items={[
              "Sin adivinar",
              "Sin amontonarse",
              "Anótate desde donde estés",
              "Corte",
              "Barba",
              "Fade",
              "Te avisamos a los 15 min",
            ]}
            className="font-display text-3xl font-extrabold uppercase sm:text-4xl"
          />
        </div>
        <Franjas className="h-4" ancho={8} velocidad={1.2} />
      </div>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pt-20 pb-6 sm:grid-cols-3 sm:px-6">
        {pasos.map((paso, i) => (
          <motion.article
            key={paso.numero}
            className="rounded-[2rem] bg-superficie p-6 ring-1 ring-borde"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 90, damping: 16 }}
          >
            <p className="font-display text-7xl leading-none font-black text-azul">{paso.numero}</p>
            <h2 className="mt-4 font-display text-3xl font-extrabold uppercase">{paso.titulo}</h2>
            <p className="mt-2 text-tenue">{paso.texto}</p>
          </motion.article>
        ))}
      </section>

      <section aria-labelledby="t-pantallas" className="mx-auto max-w-6xl px-4 pt-16 pb-24 sm:px-6">
        <h2
          id="t-pantallas"
          className="font-display text-6xl leading-[0.9] font-black uppercase sm:text-7xl"
        >
          Las <span className="font-light text-rojo">pantallas</span>
        </h2>

        {pantallas.map((grupo) => (
          <div key={grupo.grupo} className="mt-12">
            <h3 className="flex flex-wrap items-baseline gap-x-3">
              <span className="font-display text-4xl font-light uppercase">{grupo.grupo}</span>
              <span className="text-sm text-tenue">{grupo.descripcion}</span>
            </h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {grupo.items.map((p) => (
                <li key={p.ruta}>
                  <Link
                    to={p.ruta}
                    className="group relative flex h-full flex-col gap-8 overflow-hidden rounded-[2rem] bg-superficie p-5 ring-1 ring-borde transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-24px_rgb(13_20_48/0.5)] hover:ring-tinta"
                  >
                    <span className="flex items-start justify-between">
                      <span className="grid size-12 place-items-center rounded-2xl bg-tinta text-fondo transition-colors duration-300 group-hover:bg-poste-rojo group-hover:text-white">
                        <p.icono className="size-6" />
                      </span>
                      <ArrowUpRight className="size-6 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </span>
                    <span>
                      <span className="block font-display text-3xl leading-none font-extrabold uppercase">
                        {p.titulo}
                      </span>
                      <span className="mt-2 block text-sm text-tenue">{p.texto}</span>
                    </span>
                    <Franjas
                      ancho={5}
                      className="absolute inset-x-0 bottom-0 h-1.5 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <footer className="border-t border-borde px-4 py-8 text-center text-sm text-tenue">
        © 2026 NextCut
      </footer>
    </div>
  );
}
