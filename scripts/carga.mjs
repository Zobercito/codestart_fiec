// Prueba de carga de CodeStart FIEC (RNF08).
//
//   node --env-file=.env.local scripts/carga.mjs
//
// 100 usuarios simultáneos durante 5 minutos contra el build de
// producción local (`npm start`). Cada usuario repite un recorrido de
// solo lectura con su sesión real de Supabase, con un tiempo de reflexión
// entre peticiones.
//
// No usa k6 ni Artillery porque no están instalados en este host; el
// modelo es cerrado (VUs fijas) y mide lo que pide el plan: p95 y tasa
// de errores. Criterio: p95 < 2 s y errores < 1 %.
//
// Variables:
//   CARGA_VUS            usuarios simultáneos (100)
//   CARGA_DURACION_MS    duración del sostenimiento (300000)
//   CARGA_PIENSA_MS      pausa media entre peticiones (400)
//   CARGA_BASE           URL de la aplicación (http://localhost:3000)

import http from "node:http";
import { URL } from "node:url";
import { performance } from "node:perf_hooks";
import { createServerClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !ANON) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  process.exit(1);
}

const BASE = process.env.CARGA_BASE ?? "http://localhost:3000";
const VUS = Number(process.env.CARGA_VUS ?? 100);
const DURACION_MS = Number(process.env.CARGA_DURACION_MS ?? 300_000);
const PIENSA_MS = Number(process.env.CARGA_PIENSA_MS ?? 400);

const GRUPO_DEMO = "ec7185c1-3fff-4e84-aa72-c2e867101e6c";
const RETO_DEMO = "a3c0bec8-453b-4b1d-bcc3-92445276e359";

const RECORRIDOS = {
  estudiante: [
    "/dashboard",
    "/modulos",
    "/modulos/1",
    "/modulos/1/lecciones/1",
    "/modulos/2",
    "/modulos/3",
    "/modulos/4",
    `/retos/${RETO_DEMO}`,
    "/medallas",
    "/evaluacion/1",
  ],
  docente: [
    "/docente",
    `/docente/grupo/${GRUPO_DEMO}`,
    "/docente/grupos",
    "/docente/asignar",
    "/modulos",
  ],
};

const CUENTAS = {
  estudiante: { correo: "francisco.gonzalez@up.ac.pa", clave: "Codestart2026!" },
  docente: { correo: "docente@up.ac.pa", clave: "Codestart2026!" },
};

/** Firma sesión con el mismo formato de cookie que usa `@supabase/ssr`. */
async function iniciarSesion({ correo, clave }) {
  const tarro = new Map();
  const supabase = createServerClient(SUPABASE_URL, ANON, {
    cookies: {
      getAll: () => [...tarro].map(([name, value]) => ({ name, value })),
      setAll: (lista) => {
        for (const { name, value } of lista) tarro.set(name, value);
      },
    },
  });

  const { error } = await supabase.auth.signInWithPassword({ email: correo, password: clave });
  if (error) throw new Error(`No se pudo iniciar sesión con ${correo}: ${error.message}`);
  return [...tarro].map(([name, value]) => `${name}=${value}`).join("; ");
}

const agente = new http.Agent({ keepAlive: true, maxSockets: VUS + 32 });

function pedir(ruta, cookie) {
  return new Promise((resolver) => {
    const inicio = performance.now();
    const peticion = http.get(
      new URL(ruta, BASE),
      {
        agent: agente,
        headers: {
          cookie,
          "accept-language": "es-PA",
          "user-agent": "codestart-carga/1.0",
        },
        timeout: 30_000,
      },
      (respuesta) => {
        let bytes = 0;
        respuesta.on("data", (trozo) => {
          bytes += trozo.length;
        });
        respuesta.on("end", () =>
          resolver({ estado: respuesta.statusCode ?? 0, ms: performance.now() - inicio, bytes }),
        );
      },
    );

    peticion.on("timeout", () => peticion.destroy(new Error("timeout")));
    peticion.on("error", () =>
      resolver({ estado: 0, ms: performance.now() - inicio, bytes: 0 }),
    );
  });
}

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

const sesiones = {
  estudiante: await iniciarSesion(CUENTAS.estudiante),
  docente: await iniciarSesion(CUENTAS.docente),
};

const muestras = [];
const porRuta = new Map();
const fin = performance.now() + DURACION_MS;

// Un 10 % de los usuarios simultáneos son docentes.
const usuarios = Array.from({ length: VUS }, (_, i) =>
  i % 10 === 0 ? "docente" : "estudiante",
);

console.log(`Carga: ${VUS} VUs · ${Math.round(DURACION_MS / 1000)} s · reflexión ${PIENSA_MS} ms`);
console.log(`Objetivo: ${BASE} · recorridos de solo lectura\n`);

const trabajadores = usuarios.map(async (rol, i) => {
  const recorrido = RECORRIDOS[rol];
  const cookie = sesiones[rol];
  let paso = i % recorrido.length;

  while (performance.now() < fin) {
    const ruta = recorrido[paso % recorrido.length];
    paso += 1;

    const resultado = await pedir(ruta, cookie);
    const ok = resultado.estado >= 200 && resultado.estado < 300;
    const marca = { ruta, rol, ...resultado, ok };
    muestras.push(marca);

    const acum = porRuta.get(ruta) ?? { ms: [], ok: 0, total: 0 };
    acum.ms.push(resultado.ms);
    acum.total += 1;
    if (ok) acum.ok += 1;
    porRuta.set(ruta, acum);

    await dormir(PIENSA_MS + Math.random() * PIENSA_MS);
  }
});

const inicioReal = performance.now();
await Promise.all(trabajadores);
const segundos = (performance.now() - inicioReal) / 1000;

const orden = muestras.map((m) => m.ms).sort((a, b) => a - b);
const percentil = (p) => orden[Math.min(orden.length - 1, Math.floor(orden.length * p))];
const errores = muestras.filter((m) => !m.ok);
const tasaError = (errores.length / Math.max(muestras.length, 1)) * 100;

const resumen = new Map();
for (const m of errores) {
  const clave = `${m.estado || "red"}`;
  resumen.set(clave, (resumen.get(clave) ?? 0) + 1);
}

function tablaPorRuta() {
  const filas = [...porRuta.entries()].map(([ruta, datos]) => {
    const ms = datos.ms.sort((a, b) => a - b);
    return {
      ruta,
      peticiones: datos.total,
      media: ms[Math.floor(ms.length / 2)],
      p95: ms[Math.min(ms.length - 1, Math.floor(ms.length * 0.95))],
      errores: datos.total - datos.ok,
    };
  });
  filas.sort((a, b) => b.p95 - a.p95);

  const ancho = (n) => String(n).padStart(10);
  console.log("Ruta".padEnd(46), ancho("peticiones"), ancho("mediana"), ancho("p95"), ancho("errores"));
  for (const f of filas) {
    console.log(
      f.ruta.padEnd(46),
      ancho(f.peticiones),
      ancho(`${Math.round(f.media)} ms`),
      ancho(`${Math.round(f.p95)} ms`),
      ancho(f.errores),
    );
  }
}

console.log("\nResultado global:");
console.log(`  peticiones      ${muestras.length}`);
console.log(`  duración        ${Math.round(segundos)} s`);
console.log(`  throughput      ${(muestras.length / segundos).toFixed(1)} req/s`);
console.log(`  media           ${Math.round(percentil(0.5))} ms`);
console.log(`  p95             ${Math.round(percentil(0.95))} ms  (umbral 2000 ms)`);
console.log(`  p99             ${Math.round(percentil(0.99))} ms`);
console.log(`  errores         ${errores.length} (${tasaError.toFixed(2)} %)  (umbral 1 %)`);
if (errores.length > 0) {
  console.log(`  por estado      ${[...resumen].map(([k, v]) => `${k}: ${v}`).join(" · ")}`);
}
console.log("");
tablaPorRuta();

const cumpleP95 = percentil(0.95) < 2000;
const cumpleErrores = tasaError < 1;
console.log(
  `\nCriterio RNF08: p95 ${cumpleP95 ? "OK" : "FALLA"} · errores ${cumpleErrores ? "OK" : "FALLA"}`,
);
agente.destroy();
process.exit(cumpleP95 && cumpleErrores ? 0 : 1);
