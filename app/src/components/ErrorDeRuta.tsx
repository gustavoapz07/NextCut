import { Link } from "react-router";
import { Franjas } from "./Franjas";

// Mensaje genérico para el usuario; el detalle del error irá a Sentry (fallo 8 de docs/seguridad.md).
export function ErrorDeRuta() {
  return (
    <main
      role="alert"
      className="relative mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-5 overflow-hidden px-4 py-16 sm:px-6"
    >
      <p aria-hidden="true" className="font-display text-6xl font-light text-rojo uppercase">
        Uy…
      </p>
      <h1 className="font-display text-4xl leading-[0.9] font-black tracking-tight uppercase sm:text-6xl">
        Algo salió mal
      </h1>
      <p className="max-w-md text-lg text-tenue">
        No pudimos cargar esta página. Intenta de nuevo en unos segundos.
      </p>
      <Link
        to="/"
        className="inline-flex w-fit items-center gap-2 rounded-full bg-tinta px-6 py-3.5 font-display text-lg font-bold tracking-wide text-fondo uppercase"
      >
        Ir al inicio
      </Link>
      <Franjas className="absolute inset-x-0 bottom-0 h-3" />
    </main>
  );
}
