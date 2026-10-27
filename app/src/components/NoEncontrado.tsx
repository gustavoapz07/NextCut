import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { Franjas, Poste } from "./Franjas";

export function NoEncontrado() {
  return (
    <main className="relative mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-5 overflow-hidden px-4 py-16 sm:px-6">
      <div className="flex items-end gap-4">
        <p
          aria-hidden="true"
          className="font-display text-[clamp(7rem,38vw,15rem)] leading-[0.9] font-black text-rojo"
        >
          404
        </p>
        <Poste className="mb-2 h-[clamp(6rem,30vw,11rem)] w-[clamp(1.75rem,8vw,3rem)] text-tinta" />
      </div>
      <h1 className="font-display text-4xl leading-[0.9] font-black tracking-tight uppercase sm:text-6xl">
        No encontramos esta página
      </h1>
      <p className="max-w-md text-lg text-tenue">
        Revisa el enlace o vuelve a escanear el código QR de la barbería.
      </p>
      <Link
        to="/"
        className="group inline-flex w-fit items-center gap-2 rounded-full bg-tinta px-6 py-3.5 font-display text-lg font-bold tracking-wide text-fondo uppercase"
      >
        Ir al inicio
        <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
      </Link>
      <Franjas className="absolute inset-x-0 bottom-0 h-3" />
    </main>
  );
}
