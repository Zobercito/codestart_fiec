import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";

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

/**
 * Ejecuta SQL con el driver `pg`, no con `psql`: el host de CI no
 * siempre trae el cliente de Postgres instalado.
 *
 * Usa el pooler en modo transacción (6543) y cae al puerto de la URL
 * si el pooler no responde ahí.
 */
export async function ejecutarSql(sql: string): Promise<void> {
  const url = new URL(urlBaseDeDatos());
  const base = {
    host: url.hostname,
    user: url.username,
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, "") || "postgres",
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 20_000,
  };

  const puertos = [6543, Number(url.port || 5432)];
  let ultimoError: unknown = null;

  for (const puerto of puertos) {
    const cliente = new Client({ ...base, port: puerto });
    try {
      await cliente.connect();
      await cliente.query(sql);
      await cliente.end();
      return;
    } catch (error) {
      ultimoError = error;
      try {
        await cliente.end();
      } catch {
        // La conexión ya estaba cerrada.
      }
    }
  }

  throw ultimoError;
}
