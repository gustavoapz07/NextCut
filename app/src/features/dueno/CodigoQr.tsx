import { Check, Copy, Printer } from "lucide-react";
import { motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { Marca } from "@/components/Marca";
import { cx, vars } from "@/lib/utilidades";
import { barberia, DOMINIO } from "@/prototipo/datos";
import { useTitulo } from "@/prototipo/simulacion";

const ESTILOS = {
  clasico: {
    nombre: "Clásico",
    cartel: "bg-hueso text-noche",
    acento: "text-poste-rojo",
    muestra: "bg-hueso",
  },
  noche: {
    nombre: "Noche",
    cartel: "bg-noche text-hueso",
    acento: "text-[#e8736a]",
    muestra: "bg-noche",
  },
  rojo: {
    nombre: "Rojo",
    cartel: "bg-poste-rojo text-white",
    acento: "text-white",
    muestra: "bg-poste-rojo",
  },
  azul: {
    nombre: "Azul",
    cartel: "bg-poste-azul text-white",
    acento: "text-white",
    muestra: "bg-poste-azul",
  },
};

type Estilo = keyof typeof ESTILOS;

export function CodigoQr() {
  useTitulo("Código QR");
  const [estilo, setEstilo] = useState<Estilo>("clasico");
  const [copiado, setCopiado] = useState(false);
  const enlaceQr = `https://${DOMINIO}/b/${barberia.slug}?origen=qr`;
  const enlaceBio = `https://${DOMINIO}/b/${barberia.slug}?origen=ig`;
  const tema = ESTILOS[estilo];

  async function copiar() {
    try {
      await navigator.clipboard.writeText(enlaceBio);
    } catch {
      // En el prototipo basta con mostrar el estado de copiado.
    }
    setCopiado(true);
    window.setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header className="print:hidden">
        <p className="text-lg font-medium text-tenue">Para la puerta y el espejo</p>
        <h1 className="font-display text-[clamp(3rem,10vw,5.5rem)] leading-[0.9] font-black uppercase">
          Código QR
        </h1>
        <p className="mt-3 max-w-xl text-tenue">Imprímelo y pégalo donde la gente espera.</p>
      </header>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,27rem)_minmax(0,1fr)]">
        <motion.div
          key={estilo}
          initial={{ rotate: -2, scale: 0.97 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 16 }}
          className="franjas animate-poste rounded-[2.25rem] p-3 [print-color-adjust:exact] print:mx-auto print:w-[170mm]"
          style={vars({ "--franja": "14px", "--poste-vel": "3s" })}
        >
          <div
            className={cx(
              "flex aspect-[1/1.414] flex-col items-center justify-between rounded-[1.6rem] px-6 py-9 text-center",
              tema.cartel,
            )}
          >
            <div>
              <p className={cx("font-display text-4xl font-light uppercase", tema.acento)}>
                ¿Cuánto falta?
              </p>
              <p className="font-display text-[3.75rem] leading-[0.9] font-black uppercase">
                Escanea
                <br />y anótate
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-white p-4 shadow-[0_10px_30px_-12px_rgb(0_0_0/0.4)]">
              <QRCodeSVG
                value={enlaceQr}
                size={200}
                level="M"
                fgColor="#0a0f24"
                bgColor="#ffffff"
                title={`Código QR de la fila de ${barberia.nombre}`}
                className="h-auto w-[min(200px,52vw)]"
              />
            </div>
            <div>
              <p className="font-display text-5xl leading-none font-black uppercase">
                {barberia.nombre}
              </p>
              <p className="mt-2 text-sm opacity-80">Mira la fila en vivo · sin descargar nada</p>
              <Marca className="mt-5 text-lg" />
            </div>
          </div>
        </motion.div>

        <div className="grid gap-4 print:hidden">
          <section className="rounded-[2rem] bg-superficie p-6 ring-1 ring-borde">
            <h2 className="font-display text-3xl leading-none font-black uppercase">Estilo</h2>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {(Object.keys(ESTILOS) as Estilo[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={estilo === id}
                  onClick={() => setEstilo(id)}
                  className={cx(
                    "flex flex-col items-center gap-2 rounded-2xl p-3 text-sm font-semibold ring-2 transition",
                    estilo === id ? "ring-tinta" : "ring-transparent hover:ring-borde",
                  )}
                >
                  <span
                    className={cx("h-14 w-10 rounded-lg ring-1 ring-borde", ESTILOS[id].muestra)}
                  />
                  {ESTILOS[id].nombre}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] bg-superficie p-6 ring-1 ring-borde">
            <h2 className="font-display text-3xl leading-none font-black uppercase">Imprimir</h2>
            <p className="mt-1 text-sm text-tenue">
              Tamaño carta. Pega uno en la puerta y otro frente a las sillas.
            </p>
            <button
              type="button"
              onClick={() => window.print()}
              className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-poste-rojo font-display text-xl font-extrabold tracking-wide text-white uppercase transition active:scale-[0.97]"
            >
              <Printer className="size-5" /> Imprimir cartel
            </button>
          </section>

          <section className="rounded-[2rem] bg-superficie p-6 ring-1 ring-borde">
            <h2 className="font-display text-3xl leading-none font-black uppercase">
              Para Instagram y WhatsApp
            </h2>
            <p className="mt-1 text-sm text-tenue">Ponlo en la bio o en tu estado.</p>
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-fondo p-2 pl-4 ring-1 ring-borde">
              <p className="min-w-0 flex-1 font-mono text-sm break-all">{barberia.enlace}</p>
              <button
                type="button"
                onClick={copiar}
                className={cx(
                  "flex h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors",
                  copiado ? "bg-poste-azul text-white" : "bg-tinta text-fondo",
                )}
              >
                {copiado ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copiado ? "Copiado" : "Copiar"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
