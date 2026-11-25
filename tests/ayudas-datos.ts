const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
const clave =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Resuelve un reto por un fragmento de su enunciado.
 *
 * Los tests no deben depender de UUIDs fijos: al resembrar la demo los
 * ids cambian. Se consulta el reto por texto y se devuelve su id.
 */
export async function idRetoPorEnunciado(fragmento: string): Promise<string> {
  if (!base || !clave) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL y una clave de Supabase para resolver el reto.",
    );
  }

  const patron = encodeURIComponent(`*${fragmento}*`);
  const respuesta = await fetch(
    `${base}/rest/v1/retos?select=id,enunciado&enunciado=ilike.${patron}&limit=1`,
    {
      headers: {
        apikey: clave,
        Authorization: `Bearer ${clave}`,
      },
    },
  );

  if (!respuesta.ok) {
    throw new Error(
      `No se pudo resolver el reto «${fragmento}»: HTTP ${respuesta.status}`,
    );
  }

  const filas = await respuesta.json();
  if (!Array.isArray(filas) || filas.length === 0) {
    throw new Error(`No existe un reto que contenga «${fragmento}».`);
  }

  return filas[0].id;
}
