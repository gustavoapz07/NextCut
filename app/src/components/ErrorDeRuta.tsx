import { Link } from "react-router";

// Mensaje genérico para el usuario; el detalle del error irá a Sentry (fallo 8 de docs/seguridad.md).
export function ErrorDeRuta() {
  return (
    <main
      role="alert"
      className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-4 px-4 py-12 sm:px-6"
    >
      <h1 className="text-3xl font-bold tracking-tight">Algo salió mal</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        No pudimos cargar esta página. Intenta de nuevo en unos segundos.
      </p>
      <Link to="/" className="font-semibold text-marca-oscuro underline dark:text-marca">
        Ir al inicio
      </Link>
    </main>
  );
}
