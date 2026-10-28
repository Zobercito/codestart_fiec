// Chequeo automático del checklist WCAG 2.1 AA (RNF06).
//
//   node scripts/chequeo-accesibilidad.mjs
//
// Complementa a axe (tests/accesibilidad.spec.ts) con los puntos del
// checklist que se pueden verificar sin una persona delante: idioma,
// landmarks, alternativas de imagen, nombres accesibles, foco visible,
// anuncio de estados y reflow a 320 px. No sustituye la prueba con
// lector de pantalla ni la sesión de usabilidad.
//
// Requiere la aplicación corriendo (`npm start`) en CARGA_BASE o en
// http://localhost:3000.

import { chromium } from "playwright";

const BASE = process.env.CARGA_BASE ?? "http://localhost:3000";
const ESTUDIANTE = { correo: "francisco.gonzalez@up.ac.pa", clave: "Codestart2026!" };
const DOCENTE = { correo: "docente@up.ac.pa", clave: "Codestart2026!" };

const PUBLICAS = ["/", "/login", "/privacidad"];
const DE_ESTUDIANTE = [
  "/dashboard",
  "/modulos",
  "/modulos/1",
  "/modulos/1/lecciones/1",
  "/retos/a3c0bec8-453b-4b1d-bcc3-92445276e359",
  "/medallas",
  "/evaluacion/1",
];
const DE_DOCENTE = ["/docente", "/docente/grupos", "/docente/asignar"];

const navegador = await chromium.launch();

async function entrar(cuenta) {
  const contexto = await navegador.newContext({ locale: "es-PA" });
  const pagina = await contexto.newPage();
  await pagina.goto(`${BASE}/login`);
  await pagina.fill('input[type="email"]', cuenta.correo);
  await pagina.fill('input[type="password"]', cuenta.clave);
  await pagina.click('button[type="submit"]');
  await pagina.waitForLoadState("networkidle");
  return { contexto, pagina };
}

async function revisar(pagina, ruta) {
  await pagina.goto(`${BASE}${ruta}`, { waitUntil: "load" });
  await pagina.waitForTimeout(400);

  const datos = await pagina.evaluate(() => {
    const html = document.documentElement;
    const imagenes = [...document.images];
    const sinAlt = imagenes.filter(
      (img) => !img.hasAttribute("alt") && img.getAttribute("aria-hidden") !== "true",
    );
    const controles = [
      ...document.querySelectorAll("a, button, input, select, textarea, summary"),
    ];
    const nombreDe = (elemento) =>
      (elemento.getAttribute("aria-label") ||
        elemento.getAttribute("title") ||
        elemento.textContent ||
        elemento.labels?.[0]?.textContent ||
        "").trim();
    const sinNombre = controles.filter((c) => {
      if (c instanceof HTMLInputElement && c.type === "hidden") return false;
      if (c instanceof HTMLInputElement && c.type === "text") return false;
      return nombreDe(c) === "";
    });

    // CSS cargado: foco visible y movimiento reducido.
    let css = "";
    for (const hoja of document.styleSheets) {
      try {
        css += [...hoja.cssRules].map((r) => r.cssText).join("\n");
      } catch {
        /* hoja remota sin CORS: no aplica en local */
      }
    }

    return {
      lang: html.getAttribute("lang") ?? "",
      main: document.querySelectorAll("main").length,
      nav: document.querySelectorAll("nav").length,
      h1: document.querySelectorAll("h1").length,
      sinAlt: sinAlt.length,
      sinNombre: sinNombre.map((c) => c.tagName.toLowerCase()).slice(0, 4),
      focoVisible: /focus-visible/.test(css),
      motionReducido: /prefers-reduced-motion/.test(css),
      anunciaEstado:
        document.querySelectorAll('[role="status"], [role="alert"], [aria-live]').length > 0,
    };
  });

  // Reflow a 320 px: sin scroll horizontal.
  await pagina.setViewportSize({ width: 320, height: 640 });
  await pagina.waitForTimeout(250);
  const desborda = await pagina.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 2,
  );
  await pagina.setViewportSize({ width: 1440, height: 900 });

  return { ruta, ...datos, desborda };
}

const filas = [];
const sesionEstudiante = await entrar(ESTUDIANTE);
const sesionDocente = await entrar(DOCENTE);

for (const ruta of PUBLICAS) filas.push(await revisar(sesionEstudiante.pagina, ruta));
for (const ruta of DE_ESTUDIANTE) filas.push(await revisar(sesionEstudiante.pagina, ruta));
for (const ruta of DE_DOCENTE) filas.push(await revisar(sesionDocente.pagina, ruta));

await sesionEstudiante.contexto.close();
await sesionDocente.contexto.close();
await navegador.close();

const cabeceras = [
  "lang=es",
  "main",
  "nav",
  "h1",
  "img sin alt",
  "controles sin nombre",
  "focus-visible",
  "reduced-motion",
  "role=status/alert",
  "reflow 320",
];

console.log("Ruta".padEnd(46), cabeceras.map((c) => c.padStart(18)).join(""));
let fallos = 0;
for (const f of filas) {
  const valores = [
    f.lang === "es" ? "ok" : `FAIL(${f.lang})`,
    f.main === 1 ? "ok" : `FAIL(${f.main})`,
    f.nav >= 1 ? "ok" : "sin nav",
    f.h1 === 1 ? "ok" : `FAIL(${f.h1})`,
    f.sinAlt === 0 ? "ok" : `FAIL(${f.sinAlt})`,
    f.sinNombre.length === 0 ? "ok" : `FAIL(${f.sinNombre.join(",")})`,
    f.focoVisible ? "ok" : "FAIL",
    f.motionReducido ? "ok" : "FAIL",
    f.anunciaEstado ? "ok" : "no en ruta",
    f.desborda ? "FAIL" : "ok",
  ];
  fallos += valores.filter((v) => v.startsWith("FAIL")).length;
  console.log(f.ruta.padEnd(46), valores.map((v) => v.padStart(18)).join(""));
}

console.log(`\nChequeo WCAG automático: ${filas.length} rutas · ${fallos} fallos`);
process.exit(fallos === 0 ? 0 : 1);
