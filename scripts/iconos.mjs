// Genera los íconos PNG de la app (manifiesto, iPhone y avisos) a partir de app/public/favicon.svg.
// Usa el Chrome instalado a través de Playwright. Uso: node scripts/iconos.mjs

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const publico = new URL("../app/public/", import.meta.url);
const svg = await readFile(new URL("favicon.svg", publico), "utf8");
// El poste solo, sin el fondo redondeado, para los íconos a sangre y la insignia.
const poste = svg.replace(/<rect width="64" height="64" rx="16" fill="#0a0f24"\/>/, "");

const ICONOS = [
  // Tal cual el favicon, con las esquinas redondeadas.
  { archivo: "icono-192.png", tamano: 192, html: svg },
  { archivo: "icono-512.png", tamano: 512, html: svg },
  // A sangre: Android (maskable) y iPhone recortan la forma ellos mismos. El poste queda dentro
  // de la zona segura (el círculo central del 80 %).
  { archivo: "icono-mascara-512.png", tamano: 512, fondo: "#0a0f24", html: poste, escala: 0.62 },
  { archivo: "apple-touch-icon.png", tamano: 180, fondo: "#0a0f24", html: poste, escala: 0.78 },
  // Insignia de la barra de Android: solo la silueta, en blanco sobre transparente.
  {
    archivo: "insignia-96.png",
    tamano: 96,
    html: poste
      .replace(/fill="url\(#franjas\)"/, 'fill="#fff"')
      .replace(/stroke="#f3eee4"/, 'stroke="#fff"'),
    escala: 0.9,
  },
];

const navegador = await chromium.launch({ channel: process.env.CI ? undefined : "chrome" });
try {
  const pagina = await navegador.newPage();
  for (const { archivo, tamano, html, fondo, escala = 1 } of ICONOS) {
    await pagina.setViewportSize({ width: tamano, height: tamano });
    const lado = Math.round(tamano * escala);
    await pagina.setContent(
      `<body style="margin:0;display:grid;place-items:center;width:${tamano}px;height:${tamano}px;background:${fondo ?? "transparent"}">
        <div style="width:${lado}px;height:${lado}px">${html.replace("<svg ", '<svg width="100%" height="100%" ')}</div>
      </body>`,
    );
    await pagina.screenshot({
      path: fileURLToPath(new URL(archivo, publico)),
      omitBackground: !fondo,
    });
    console.log(`${archivo} (${tamano}×${tamano})`);
  }
} finally {
  await navegador.close();
}
