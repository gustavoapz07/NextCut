import { Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import { type FormEvent, useId, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router";
import { Franjas } from "@/components/Franjas";
import { BotonMarca, Cargando } from "@/components/Marco";
import { BotonPrincipal, claseCampo } from "@/components/Piezas";
import { useTitulo } from "@/lib/ganchos";
import { entrar, MENSAJES_ENTRAR, type ResultadoEntrar, useSesion } from "@/lib/sesion";

/** A dónde ir después de entrar: solo los paneles del personal, nunca otra página u otro sitio. */
export function destinoAlEntrar(siguiente: string | null) {
  return siguiente && /^\/(panel|dueno)(\/[a-z]+)?$/.test(siguiente) ? siguiente : "/panel";
}

export function Entrar() {
  useTitulo("Entrar");
  const sesion = useSesion();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const destino = destinoAlEntrar(params.get("siguiente"));
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [verClave, setVerClave] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<Exclude<ResultadoEntrar, "ok"> | null>(null);
  const idCorreo = useId();
  const idClave = useId();

  if (sesion.tipo === "cargando") return <Cargando />;
  // Con la sesión abierta no hay nada que hacer aquí.
  if (sesion.tipo === "dentro" && !enviando) return <Navigate to={destino} replace />;

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setEnviando(true);
    setError(null);
    const resultado = await entrar(correo, clave);
    if (resultado === "ok") {
      navigate(destino, { replace: true });
      return;
    }
    setError(resultado);
    setEnviando(false);
  }

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
          onSubmit={(e) => void enviar(e)}
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
                required
                autoComplete="email"
                placeholder="carlos@lanavaja.hn"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
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
                  required
                  autoComplete="current-password"
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
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
            {/* Recuperar la contraseña por correo necesita el SMTP de Resend (pendiente). */}
            <p className="text-sm text-tenue">
              ¿Olvidaste tu contraseña? Pídele al dueño de la barbería que te la cambie.
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-6 rounded-2xl bg-superficie px-4 py-3 text-sm font-medium text-rojo ring-1 ring-rojo/40"
            >
              {MENSAJES_ENTRAR[error]}
            </p>
          )}

          <BotonPrincipal type="submit" className="mt-8" disabled={enviando}>
            {enviando ? "Entrando…" : "Entrar"}
          </BotonPrincipal>
        </motion.form>
      </main>
    </div>
  );
}
