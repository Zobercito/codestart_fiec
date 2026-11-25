// Aplica supabase/seed.sql usando `pg`, sin depender de `psql`.
//
// El seed es destructivo: borra intentos, progresos, insignias,
// asignaciones, retos, lecciones, inscripciones, grupos y módulos antes
// de recrearlos. No toca auth.users ni perfiles.
//
//   npm run db:seed
//
// `seed.sql` usa `\ir migrations/...` (meta-comando de psql); aquí se
// sustituye por el contenido del archivo para que `pg` lo ejecute.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";

const url = process.env.SUPABASE_DB_URL;
if (!url) {
  console.error("Falta SUPABASE_DB_URL en .env.local");
  process.exit(1);
}

const raiz = process.cwd();
const rutaSeed = join(raiz, "supabase", "seed.sql");
let sql = readFileSync(rutaSeed, "utf8");

sql = sql.replace(/^\\ir\s+(.+)$/gm, (_linea, ruta) => {
  const archivo = join(raiz, "supabase", ruta.trim());
  return readFileSync(archivo, "utf8");
});

const soloPrueba = process.env.SEED_DRY_RUN === "1";

const cliente = new Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 20_000,
});

try {
  await cliente.connect();
  await cliente.query("begin");
  await cliente.query(sql);
  if (soloPrueba) {
    await cliente.query("rollback");
    console.log("Seed validado en seco; no se escribió nada (SEED_DRY_RUN=1).");
  } else {
    await cliente.query("commit");
    console.log("Seed aplicado: demo recreada.");
  }
} catch (error) {
  await cliente.query("rollback").catch(() => {});
  console.error(`El seed falló y se revirtió: ${error.message}`);
  process.exitCode = 1;
} finally {
  await cliente.end().catch(() => {});
}
