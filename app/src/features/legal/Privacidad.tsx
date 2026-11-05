// Aviso de privacidad para los clientes que se anotan en la fila. Cada dato que menciona tiene que
// coincidir con lo que guarda la base (docs/seguridad.md, fallo 5): si cambia lo que se guarda o
// cuánto dura, se cambia aquí también.

import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { Franjas } from "@/components/Franjas";
import { BotonMarca } from "@/components/Marco";
import { useTitulo } from "@/lib/ganchos";

export const ACTUALIZADO = "4 de noviembre de 2026";

/** Correo o WhatsApp para pedir que se borren los datos. Vacío: se le pide a la barbería. */
const contacto = import.meta.env.VITE_CONTACTO_PRIVACIDAD?.trim() ?? "";

export function Privacidad() {
  useTitulo("Aviso de privacidad");
  const navegar = useNavigate();

  return (
    <div className="min-h-dvh bg-fondo text-tinta">
      <Franjas className="h-2" ancho={6} />
      <header className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 pt-5 sm:px-6">
        <BotonMarca />
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? navegar(-1) : navegar("/"))}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-borde transition hover:bg-superficie-2"
        >
          <ArrowLeft className="size-4" />
          Volver
        </button>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-8 pb-16 sm:px-6">
        <h1 className="font-display text-5xl leading-[0.9] font-black tracking-tight uppercase sm:text-6xl">
          Aviso de privacidad
        </h1>
        <p className="mt-4 text-lg text-tenue">
          NextCut es la fila virtual que usa esta barbería. Aquí está qué datos se guardan cuando te
          anotas, para qué sirven y cuánto tiempo se quedan.
        </p>

        <Seccion titulo="Qué se guarda">
          <ul className="grid gap-3">
            <Dato nombre="Tu nombre">
              Tal como lo escribes. En la fila pública y en la pantalla del local solo se ve tu
              primer nombre y la inicial del apellido. El nombre completo queda en el historial de
              la barbería para sus reportes.
            </Dato>
            <Dato nombre="Tu WhatsApp, si lo das">
              Es opcional. Solo lo ve el personal de la barbería, para avisarte cuando te toque. Se
              borra solo a los 90 días.
            </Dato>
            <Dato nombre="Tu turno">
              El barbero y el servicio que elegiste, y las horas en que te anotaste, te llamaron y
              terminó tu servicio. Con eso se calcula cuánto falta para cada cliente.
            </Dato>
            <Dato nombre="Una huella de tu conexión">
              Un código cifrado que sale de tu dirección IP, pero no es tu dirección IP. Sirve para
              frenar turnos falsos limitando cuántos se crean desde una misma conexión. No dice
              quién eres ni dónde estás.
            </Dato>
            <Dato nombre="Los avisos, si los activas">
              La dirección que da tu navegador para mandarte notificaciones. Se borra cuando te
              sientas en la silla o cuando se cierra tu turno.
            </Dato>
          </ul>
          <p className="mt-4 text-tenue">
            En tu teléfono queda un código para cancelar tu turno. Solo lo guarda tu navegador.
          </p>
        </Seccion>

        <Seccion titulo="Qué no se hace">
          <ul className="grid list-disc gap-2 pl-5">
            <li>No se pide correo ni hay que crear una cuenta.</li>
            <li>No se venden tus datos ni se usan para publicidad.</li>
            <li>No hay cookies de publicidad ni herramientas que sigan lo que haces.</li>
            <li>Otras barberías no ven tus datos.</li>
          </ul>
        </Seccion>

        <Seccion titulo="Quién más participa">
          <p>
            Los datos se guardan en Supabase, y la página la sirve Cloudflare, que también revisa
            que no seas un robot antes de anotarte. Sus servidores pueden estar fuera de Honduras.
            Los avisos los entrega el servicio de tu navegador (Google, Apple, Mozilla o Microsoft)
            cifrados, sin que ellos puedan leerlos. Si la página falla, se registra el error sin tu
            nombre ni tu teléfono.
          </p>
        </Seccion>

        <Seccion titulo="Si quieres que se borren">
          <p>
            Puedes cancelar tu turno desde su página. Para que se borre tu teléfono antes de los 90
            días, pídeselo a la barbería
            {contacto ? (
              <>
                {" "}
                o escribe a <strong className="break-all">{contacto}</strong>
              </>
            ) : null}
            .
          </p>
        </Seccion>

        <p className="mt-12 text-sm text-tenue">Última actualización: {ACTUALIZADO}.</p>
      </main>
    </div>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl font-black tracking-tight uppercase">{titulo}</h2>
      <div className="mt-3 text-base leading-relaxed">{children}</div>
    </section>
  );
}

function Dato({ nombre, children }: { nombre: string; children: ReactNode }) {
  return (
    <li className="rounded-2xl bg-superficie p-4 ring-1 ring-borde">
      <p className="font-semibold">{nombre}</p>
      <p className="mt-1 text-tenue">{children}</p>
    </li>
  );
}
