function configuracion() {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!base || !clave) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL y una clave de Supabase.",
    );
  }
  return {
    base,
    cabeceras: { apikey: clave, Authorization: `Bearer ${clave}` },
  };
}

export async function idRetoPorEnunciado(fragmento) {
  const { base, cabeceras } = configuracion();
  const patron = encodeURIComponent(`*${fragmento}*`);
  const respuesta = await fetch(
    `${base}/rest/v1/retos?select=id,enunciado&enunciado=ilike.${patron}&limit=1`,
    { headers: cabeceras },
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

export async function idGrupoPorCodigo(codigo) {
  const { base, cabeceras } = configuracion();
  const respuesta = await fetch(
    `${base}/rest/v1/grupos?select=id&codigo_inscripcion=eq.${encodeURIComponent(codigo)}&limit=1`,
    { headers: cabeceras },
  );
  if (!respuesta.ok) {
    throw new Error(
      `No se pudo resolver el grupo «${codigo}»: HTTP ${respuesta.status}`,
    );
  }
  const filas = await respuesta.json();
  if (!Array.isArray(filas) || filas.length === 0) {
    throw new Error(`No existe el grupo «${codigo}».`);
  }
  return filas[0].id;
}
