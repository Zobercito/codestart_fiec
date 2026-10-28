import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Conexión de Postgres para limpiar los datos que crean las pruebas. */
export function urlBaseDeDatos(): string {
  if (process.env.SUPABASE_DB_URL) return process.env.SUPABASE_DB_URL;

  const texto = readFileSync(join(process.cwd(), ".env.local"), "utf8");
  const linea = texto
    .split("\n")
    .find((fila) => fila.startsWith("SUPABASE_DB_URL="));
  if (!linea) throw new Error("Falta SUPABASE_DB_URL en .env.local");

  return linea
    .slice("SUPABASE_DB_URL=".length)
    .trim()
    .replace(/^['"]|['"]$/g, "");
}

export function ejecutarSql(sql: string) {
  execFileSync(
    "psql",
    [urlBaseDeDatos(), "-v", "ON_ERROR_STOP=1", "-c", sql],
    { stdio: "pipe" },
  );
}
