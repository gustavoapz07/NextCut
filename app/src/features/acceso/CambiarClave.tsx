import { Eye, EyeOff } from "lucide-react";
import { type FormEvent, useId, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router";
import { BotonMarca, Cargando } from "@/components/Marco";
import { BotonPrincipal, claseCampo } from "@/components/Piezas";
import { cambiarClave, debeCambiarClave, problemaClave } from "@/lib/cuentas";
import { useTitulo } from "@/lib/ganchos";
import { useSesion } from "@/lib/sesion";
import { destinoAlEntrar } from "./Entrar";

/** Después de entrar con una contraseña temporal (ADR-017), la cuenta elige la suya. */
export function CambiarClave() {
  useTitulo("Tu contraseña");
  const sesion = useSesion();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const destino = destinoAlEntrar(params.get("siguiente"));
  const [clave, setClave] = useState("");
  const [repetida, setRepetida] = useState("");
  const [ver, setVer] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idClave = useId();
  const idRepetida = useId();

  if (sesion.tipo === "cargando") return <Cargando />;
  if (sesion.tipo === "fuera") return <Navigate to="/entrar" replace />;
  const temporal = debeCambiarClave(sesion.sesion.user);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    const problema = problemaClave(clave, repetida);
    if (problema) {
      setError(problema);
      return;
    }
    setEnviando(true);
    setError(null);
    const fallo = await cambiarClave(clave);
    if (fallo) {
      setError(fallo);
      setEnviando(false);
      return;
    }
    navigate(destino, { replace: true });
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4 py-10">
      <BotonMarca />
      <h1 className="mt-10 font-display text-6xl leading-[0.9] font-black uppercase">
        Tu contraseña
      </h1>
      <p className="mt-3 text-tenue">
        {temporal
          ? "Entraste con una contraseña temporal. Elige la tuya para seguir."
          : "Elige una contraseña nueva."}
      </p>

      <form onSubmit={(e) => void enviar(e)} className="mt-8 grid gap-5">
        <div>
          <label htmlFor={idClave} className="mb-1.5 block text-sm font-semibold">
            Contraseña nueva
          </label>
          <div className="relative">
            <input
              id={idClave}
              type={ver ? "text" : "password"}
              required
              autoComplete="new-password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              className={`${claseCampo} pr-14`}
            />
            <button
              type="button"
              onClick={() => setVer((v) => !v)}
              aria-label={ver ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="absolute inset-y-0 right-1.5 my-auto grid size-11 place-items-center rounded-xl text-tenue transition hover:text-tinta"
            >
              {ver ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
          <p className="mt-1 text-sm text-tenue">Al menos 10 caracteres, con letras y números.</p>
        </div>
        <div>
          <label htmlFor={idRepetida} className="mb-1.5 block text-sm font-semibold">
            Repítela
          </label>
          <input
            id={idRepetida}
            type={ver ? "text" : "password"}
            required
            autoComplete="new-password"
            value={repetida}
            onChange={(e) => setRepetida(e.target.value)}
            className={claseCampo}
          />
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-2xl bg-superficie px-4 py-3 text-sm font-medium text-rojo ring-1 ring-rojo/40"
          >
            {error}
          </p>
        )}
        <BotonPrincipal type="submit" disabled={enviando}>
          {enviando ? "Guardando…" : "Guardar y seguir"}
        </BotonPrincipal>
      </form>
    </main>
  );
}
