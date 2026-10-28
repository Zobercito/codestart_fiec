// Auditoría de contraste WCAG AA sobre todas las rutas.
//
//   node scripts/auditar-contraste.mjs
//
// Recorre cada ruta con la sesión iniciada, calcula el contraste de
// cada texto visible contra su fondo real y avisa de lo que no llega a
// 4,5:1 (texto normal) o 3:1 (texto grande: >= 18,66 px en negrita o
// >= 24 px).
//
// Por qué un script y no mirar la pantalla: el contraste no se razona a
// ojo, y el mismo error se cuela en cualquier pantalla nueva.
//
// Dos trampas que costaron tiempo:
//   - Tailwind v4 devuelve los colores en oklab (`lab(...)`), no en
//     `rgb(...)`. Un auditor que solo entienda `rgb()` no ve ningún
//     color y da falsos «todo blanco».
//   - Por eso los colores se pasan por un canvas: el navegador los
//     convierte a sRGB, que es lo que necesita la fórmula de
//     luminancia relativa.
//
// Requiere el servidor de producción levantado (`npm run build && npm start`).

import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const CORREO = process.env.AUDITORIA_CORREO ?? "francisco.gonzalez@up.ac.pa";
const CLAVE = process.env.AUDITORIA_CLAVE ?? "Codestart2026!";

const RUTAS = [
  "/dashboard",
  "/modulos",
  "/modulos/1",
  "/modulos/3",
  "/modulos/3/lecciones/1",
  "/retos/a3c0bec8-453b-4b1d-bcc3-92445276e359",
  "/retos/cb534a18-b206-4da7-8128-9533ee7631d3",
];

const INSTRUMENTO = () => {
  const lienzo = document.createElement("canvas");
  lienzo.width = 1;
  lienzo.height = 1;
  const ctx = lienzo.getContext("2d", { willReadFrequently: true });

  function aRgb(color) {
    if (!color) return null;
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "#000000";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return { r: d[0], g: d[1], b: d[2], a: d[3] / 255 };
  }
  function lum({ r, g, b }) {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  }
  function mezcla(fg, bg) {
    const a = fg.a;
    return {
      r: fg.r * a + bg.r * (1 - a),
      g: fg.g * a + bg.g * (1 - a),
      b: fg.b * a + bg.b * (1 - a),
      a: 1,
    };
  }
  function ratio(a, b) {
    const l1 = lum(a);
    const l2 = lum(b);
    const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
    return (hi + 0.05) / (lo + 0.05);
  }
  function fondoDe(el) {
    let n = el;
    while (n && n !== document.documentElement) {
      const c = aRgb(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0.95) return c;
      n = n.parentElement;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  }

  const out = [];
  const vistos = new Set();
  for (const el of document.querySelectorAll("body *")) {
    // El tema del editor lo pone CodeMirror, no Tailwind.
    if (el.closest(".cm-editor")) continue;
    const texto = [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join(" ")
      .trim();
    if (!texto) continue;
    const est = getComputedStyle(el);
    if (est.visibility === "hidden" || est.display === "none") continue;
    if (parseFloat(est.opacity) === 0) continue;
    const caja = el.getBoundingClientRect();
    if (caja.width === 0 || caja.height === 0) continue;

    const fg = aRgb(est.color);
    if (!fg) continue;
    const bg = fondoDe(el);
    const color = fg.a < 1 ? mezcla(fg, bg) : fg;
    const cr = ratio(color, bg);

    const tam = parseFloat(est.fontSize);
    const grueso = parseInt(est.fontWeight, 10) >= 700;
    const grande = tam >= 24 || (grueso && tam >= 18.66);
    const exigido = grande ? 3 : 4.5;

    const clave = `${texto}|${est.color}|${cr.toFixed(2)}`;
    if (vistos.has(clave)) continue;
    vistos.add(clave);

    if (cr < exigido) {
      out.push({
        texto: texto.slice(0, 60),
        color: est.color,
        fondo: `rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)})`,
        tam,
        ratio: cr.toFixed(2),
        exigido,
        selector: el.tagName.toLowerCase() + "." + [...el.classList].slice(0, 3).join("."),
      });
    }
  }
  return out;
};

const navegador = await chromium.launch();
const contexto = await navegador.newContext({ viewport: { width: 1440, height: 900 } });
const pagina = await contexto.newPage();

await pagina.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await pagina.fill('input[type="email"]', CORREO);
await pagina.fill('input[type="password"]', CLAVE);
await pagina.click('button[type="submit"]');
await pagina.waitForURL(/dashboard/, { timeout: 20000 });

let total = 0;

for (const ruta of RUTAS) {
  const respuesta = await pagina.goto(`${BASE}${ruta}`, { waitUntil: "networkidle" });
  await pagina.waitForTimeout(800);

  if (!respuesta || respuesta.status() >= 400) {
    console.log(`\n${ruta} → HTTP ${respuesta ? respuesta.status() : "?"} (se omite)`);
    continue;
  }

  const fallos = await pagina.evaluate(INSTRUMENTO);

  if (fallos.length === 0) {
    console.log(`✓ ${ruta}`);
    continue;
  }

  total += fallos.length;
  console.log(`\n✕ ${ruta} — ${fallos.length} textos por debajo de AA`);
  for (const f of fallos) {
    console.log(`   ${f.ratio} (mín ${f.exigido})  ${f.color} sobre ${f.fondo}  ${f.tam}px`);
    console.log(`     «${f.texto}»  ${f.selector}`);
  }
}

await navegador.close();

console.log(`\n══ ${total} textos por debajo de AA ══`);
process.exit(total === 0 ? 0 : 1);
