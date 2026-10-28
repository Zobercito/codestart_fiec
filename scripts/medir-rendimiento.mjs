// Medición local de rendimiento de las tres pantallas del informe.
//
//   node scripts/medir-rendimiento.mjs
//
// Chromium con Fast 3G (1,6 Mbps de bajada, 150 ms de latencia) y CPU
// 4x, como pide el subplan. Mide TTFB, FCP, LCP y peso transferido por
// pantalla. Es una medición LOCAL contra `npm start`; no sustituye una
// medición en producción.

import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const CORREO = process.env.PRUEBA_CORREO ?? "francisco.gonzalez@up.ac.pa";
const CLAVE = process.env.PRUEBA_CLAVE ?? "Codestart2026!";
const REPETICIONES = 3;

const PANTALLAS = [
  { nombre: "Dashboard", ruta: "/dashboard" },
  { nombre: "Lección", ruta: "/modulos/1/lecciones/1" },
  { nombre: "Editor de retos", ruta: "/retos/a3c0bec8-453b-4b1d-bcc3-92445276e359" },
];

const navegador = await chromium.launch();
const contexto = await navegador.newContext({
  viewport: { width: 1440, height: 900 },
  locale: "es-PA",
});
const page = await contexto.newPage();

// Iniciar sesión sin throttling para no medir el login.
await page.goto(`${BASE}/login`);
await page.fill('input[type="email"]', CORREO);
await page.fill('input[type="password"]', CLAVE);
await page.click('button[type="submit"]');
await page.waitForURL(/\/dashboard/, { timeout: 30_000 });

const cliente = await contexto.newCDPSession(page);
await cliente.send("Network.enable");
await cliente.send("Network.emulateNetworkConditions", {
  offline: false,
  latency: 150,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (750 * 1024) / 8,
});
await cliente.send("Emulation.setCPUThrottlingRate", { rate: 4 });

await page.addInitScript(() => {
  window.__lcp = 0;
  new PerformanceObserver((lista) => {
    const entradas = lista.getEntries();
    const ultima = entradas[entradas.length - 1];
    if (ultima) window.__lcp = ultima.startTime;
  }).observe({ type: "largest-contentful-paint", buffered: true });
});

const mediana = (valores) => {
  const orden = [...valores].sort((a, b) => a - b);
  return orden[Math.floor(orden.length / 2)];
};

const resumen = [];

for (const pantalla of PANTALLAS) {
  const muestras = [];
  for (let i = 0; i < REPETICIONES; i += 1) {
    await page.goto(`${BASE}${pantalla.ruta}`, { waitUntil: "load", timeout: 60_000 });
    await page.waitForTimeout(1_200);

    muestras.push(
      await page.evaluate(() => {
        const navegacion = performance.getEntriesByType("navigation")[0];
        const fcp = performance.getEntriesByName("first-contentful-paint")[0];
        const recursos = performance.getEntriesByType("resource");
        const peso = recursos.reduce((total, r) => total + (r.transferSize || 0), 0);
        return {
          ttfb: navegacion ? navegacion.responseStart - navegacion.requestStart : 0,
          fcp: fcp ? fcp.startTime : 0,
          lcp: window.__lcp ?? 0,
          peso,
        };
      }),
    );
  }

  const fila = {
    pantalla: pantalla.nombre,
    ttfb: mediana(muestras.map((m) => m.ttfb)),
    fcp: mediana(muestras.map((m) => m.fcp)),
    lcp: mediana(muestras.map((m) => m.lcp)),
    pesoKb: mediana(muestras.map((m) => m.peso)) / 1024,
  };
  resumen.push(fila);
  console.log(
    `${fila.pantalla.padEnd(16)} TTFB ${Math.round(fila.ttfb)} ms · FCP ${Math.round(
      fila.fcp,
    )} ms · LCP ${Math.round(fila.lcp)} ms · ${fila.pesoKb.toFixed(0)} KB`,
  );
}

console.log("\nCondiciones: Chromium local, Fast 3G simulado, CPU 4x, servidor `next start`.");
for (const fila of resumen) {
  console.log(
    `| ${fila.pantalla} | ${Math.round(fila.ttfb)} ms | ${Math.round(
      fila.fcp,
    )} ms | ${Math.round(fila.lcp)} ms | ${fila.pesoKb.toFixed(0)} KB |`,
  );
}

await navegador.close();
