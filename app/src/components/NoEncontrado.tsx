import { Link } from "react-router";

export function NoEncontrado() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-4 px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">No encontramos esta página</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Revisa el enlace o vuelve a escanear el código QR de la barbería.
      </p>
      <Link to="/" className="font-semibold text-marca-oscuro underline dark:text-marca">
        Ir al inicio
      </Link>
    </main>
  );
}
