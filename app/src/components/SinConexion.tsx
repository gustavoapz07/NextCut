/** Pantalla para cuando la base no responde, con un botón para reintentar. */
export function SinConexion({
  titulo = "No pudimos cargar la fila",
  alReintentar,
}: {
  titulo?: string;
  alReintentar: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-5 px-4 py-16">
      <h1 className="font-display text-5xl leading-[0.9] font-black uppercase">{titulo}</h1>
      <p className="text-lg text-tenue">Revisa tu conexión e inténtalo de nuevo.</p>
      <button
        type="button"
        onClick={alReintentar}
        className="w-fit rounded-full bg-tinta px-6 py-3.5 font-display text-lg font-bold tracking-wide text-fondo uppercase"
      >
        Reintentar
      </button>
    </main>
  );
}
