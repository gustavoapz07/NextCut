import { Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import { useId, useState } from "react";
import { useNavigate } from "react-router";
import { Franjas } from "@/components/Franjas";
import { BotonMarca } from "@/components/Marco";
import { BotonPrincipal, claseCampo } from "@/components/Piezas";
import { useTitulo } from "@/prototipo/simulacion";

export function Entrar() {
  useTitulo("Entrar");
  const navigate = useNavigate();
  const [verClave, setVerClave] = useState(false);
  const idCorreo = useId();
  const idClave = useId();

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative flex min-h-[42dvh] flex-col justify-between overflow-hidden bg-noche p-6 text-hueso sm:p-10">
        <motion.div
          aria-hidden="true"
          className="absolute top-1/2 -right-20 h-[160%] w-36 overflow-hidden rounded-full sm:w-52 lg:-right-10 lg:w-64"
          initial={{ rotate: 30, y: "-40%", opacity: 0 }}
          animate={{ rotate: 18, y: "-50%", opacity: 1 }}
          transition={{ type: "spring", stiffness: 50, damping: 14 }}
        >
          <Franjas vertical ancho={24} velocidad={3.2} className="absolute inset-0" />
        </motion.div>
        <BotonMarca className="relative text-3xl" />
        <div className="relative">
          <p className="text-xl font-medium text-hueso/80">Para el equipo</p>
          <p className="font-display text-[clamp(3rem,13vw,9.5rem)] leading-[0.9] font-black uppercase">
            Pasa el
            <br />
            siguiente
          </p>
        </div>
      </aside>

      <main className="flex items-center justify-center px-4 py-12 sm:px-10">
        <motion.form
          onSubmit={(e) => {
            e.preventDefault();
            navigate("/panel");
          }}
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h1 className="font-display text-6xl leading-none font-black uppercase">Entrar</h1>
          <p className="mt-2 text-tenue">
            Barberos y dueños entran con el correo que registró la barbería.
          </p>

          <div className="mt-8 grid gap-5">
            <div>
              <label htmlFor={idCorreo} className="mb-1.5 block text-sm font-semibold">
                Correo
              </label>
              <input
                id={idCorreo}
                type="email"
                autoComplete="email"
                placeholder="carlos@lanavaja.hn"
                className={claseCampo}
              />
            </div>
            <div>
              <label htmlFor={idClave} className="mb-1.5 block text-sm font-semibold">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id={idClave}
                  type={verClave ? "text" : "password"}
                  autoComplete="current-password"
                  className={`${claseCampo} pr-14`}
                />
                <button
                  type="button"
                  onClick={() => setVerClave((v) => !v)}
                  aria-label={verClave ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute inset-y-0 right-1.5 my-auto grid size-11 place-items-center rounded-xl text-tenue transition hover:text-tinta"
                >
                  {verClave ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>
            <button
              type="button"
              className="justify-self-start text-sm font-semibold text-azul underline-offset-4 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <BotonPrincipal type="submit" className="mt-8">
            Entrar
          </BotonPrincipal>
        </motion.form>
      </main>
    </div>
  );
}
