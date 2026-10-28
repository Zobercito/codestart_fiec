// Prueba de regresión de F09: el alta pública no puede crear docentes
// ni administradores. Usa la clave anónima, como lo haría un atacante,
// y comprueba el perfil con service_role. Al final borra el usuario.
//
//   node --env-file=.env.local scripts/probar-escalada-rol.mjs
//
// No se ejecuta contra una base con datos reales: crea y elimina un
// usuario temporal.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anon || !service) {
  console.error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY o SUPABASE_SERVICE_ROLE_KEY.",
  );
  process.exit(1);
}

const correo = `prueba.escalada.${Date.now()}@up.ac.pa`;
const contrasena = "Codestart2026!";
let id = null;

const cabecerasAnon = {
  apikey: anon,
  Authorization: `Bearer ${anon}`,
  "Content-Type": "application/json",
};

const cabecerasService = {
  apikey: service,
  Authorization: `Bearer ${service}`,
  "Content-Type": "application/json",
};

async function perfil() {
  const r = await fetch(
    `${url}/rest/v1/perfiles?correo=eq.${encodeURIComponent(correo)}&select=id,rol,acepta_privacidad,fecha_aceptacion`,
    { headers: cabecerasService },
  );
  if (!r.ok) throw new Error(`No se pudo leer el perfil: ${r.status}`);
  const filas = await r.json();
  return filas[0] ?? null;
}

try {
  // 1. Alta con metadatos de admin, usando solo la clave anónima.
  const alta = await fetch(`${url}/auth/v1/signup`, {
    method: "POST",
    headers: cabecerasAnon,
    body: JSON.stringify({
      email: correo,
      password: contrasena,
      data: {
        nombre: "Prueba Escalada",
        rol: "admin",
        acepta_privacidad: true,
      },
    }),
  });

  const cuerpoAlta = await alta.json();
  if (!alta.ok) {
    // Con el registro público deshabilitado (modo solo inicio de sesión),
    // el vector de F09 no existe: es el resultado más seguro.
    if (
      alta.status === 422 &&
      /signups? not allowed|signup.*disabled/i.test(JSON.stringify(cuerpoAlta))
    ) {
      console.log("  ok  alta pública deshabilitada: el vector de F09 está cerrado");
      console.log("\nPrueba de escalada de rol: PASÓ (sin alta pública)");
      process.exit(0);
    }
    throw new Error(`El alta falló: ${alta.status} ${JSON.stringify(cuerpoAlta)}`);
  }

  id = cuerpoAlta.user?.id ?? cuerpoAlta.id ?? null;
  if (!id) {
    const p = await perfil();
    id = p?.id ?? null;
  }
  if (!id) throw new Error("No se pudo obtener el id del usuario temporal.");

  // 2. El perfil debe ser estudiante, aunque el metadata diga admin.
  const creado = await perfil();
  if (!creado) throw new Error("El trigger no creó el perfil.");
  if (creado.rol !== "estudiante") {
    throw new Error(`F09: el alta creó un perfil con rol "${creado.rol}".`);
  }
  if (!creado.acepta_privacidad || !creado.fecha_aceptacion) {
    throw new Error("RNF09: no se guardó la aceptación del aviso de privacidad.");
  }
  console.log("  ok  alta pública con rol falso -> estudiante");
  console.log("  ok  aceptación de privacidad guardada con fecha");

  // 3. service_role sí puede asignar un rol mediante la RPC.
  const cambio = await fetch(`${url}/rest/v1/rpc/cambiar_rol`, {
    method: "POST",
    headers: cabecerasService,
    body: JSON.stringify({ p_usuario: id, p_rol: "docente" }),
  });
  if (!cambio.ok) {
    throw new Error(`cambiar_rol falló: ${cambio.status} ${await cambio.text()}`);
  }

  const actualizado = await perfil();
  if (actualizado?.rol !== "docente") {
    throw new Error("service_role no pudo asignar el rol docente.");
  }
  console.log("  ok  service_role asigna rol docente por RPC");

  console.log("\nPrueba de escalada de rol: PASÓ");
} finally {
  if (id) {
    await fetch(`${url}/auth/v1/admin/users/${id}`, {
      method: "DELETE",
      headers: cabecerasService,
    });
    console.log("  limpieza: usuario temporal eliminado");
  }
}
