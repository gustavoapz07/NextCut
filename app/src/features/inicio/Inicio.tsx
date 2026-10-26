const roles = [
  {
    titulo: "Cliente",
    texto: "Escanea el QR, ve cuántas personas hay y cuánto falta, y se anota desde donde esté.",
  },
  {
    titulo: "Barbero",
    texto: "Pasa los turnos desde el celular: llamar, empezar, terminar o marcar que no llegó.",
  },
  {
    titulo: "Dueño",
    texto: "Ve cuántos clientes atendió cada barbero, cuánto esperaron y cuántos se fueron.",
  },
];

export function Inicio() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-10 px-4 py-12 sm:px-6">
      <header className="flex flex-col gap-4">
        <p className="flex items-center gap-2 text-sm font-semibold tracking-wide text-marca-oscuro uppercase dark:text-marca">
          <span aria-hidden="true">›</span> Fila virtual para barberías
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Siguiente</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Que ningún cliente se vaya por no saber cuánto le falta.
        </p>
      </header>

      <section aria-labelledby="como-funciona" className="flex flex-col gap-4">
        <h2 id="como-funciona" className="text-xl font-semibold">
          Cómo funciona
        </h2>
        <ul className="grid gap-3">
          {roles.map((rol) => (
            <li
              key={rol.titulo}
              className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <h3 className="font-semibold">{rol.titulo}</h3>
              <p className="mt-1 text-zinc-600 dark:text-zinc-400">{rol.texto}</p>
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-auto text-sm text-zinc-500">En construcción · v0.1</footer>
    </main>
  );
}
