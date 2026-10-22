// Genera los tipos de TypeScript de Supabase a partir del esquema real.
//
//   node --env-file=.env.local scripts/generar-tipos.mjs
//
// Por que no `supabase gen types --linked`: ese modo pide el PAT de
// Supabase (SUPABASE_ACCESS_TOKEN), y la CLI escribe su propio mensaje
// de error en la salida estandar. Con `> archivo`, ese error acaba
// DENTRO del archivo de tipos y rompe el typecheck entero.
//
// Aqui se usa `--db-url` con la conexion del pooler (que es la unica
// que resuelve: el host directo de la BD solo tiene IPv6) y se escribe
// el archivo solo si la generacion ha funcionado. Un fallo deja los
// tipos anteriores intactos en vez de romperlos.

import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const destino = join(raiz, "src/lib/supabase/types.generados.ts");

const url = process.env.SUPABASE_DB_URL;

if (!url) {
  console.error("Falta SUPABASE_DB_URL en .env.local");
  process.exit(1);
}

const resultado = spawnSync(
  "supabase",
  ["gen", "types", "typescript", "--db-url", url, "--schema", "public"],
  { encoding: "utf8" },
);

const salida = (resultado.stdout ?? "").trim();

if (resultado.status !== 0 || !salida.startsWith("export type")) {
  console.error("La generacion de tipos fallo; se deja el archivo anterior intacto.");
  console.error((resultado.stderr ?? "").trim());
  if (salida) console.error(salida.slice(0, 500));
  process.exit(1);
}

writeFileSync(destino, salida + "\n", "utf8");

const tablas = [...salida.matchAll(/^\s+"([a-z_]+)": \{$/gm)].map((m) => m[1]);
console.log(`Tipos generados en ${destino}`);
console.log(`Tablas: ${tablas.join(", ")}`);
