// Crea los usuarios de prueba en Supabase Auth y asegura su perfil.
//
// Desde el A4, el trigger trg_crear_perfil crea SIEMPRE un estudiante:
// el rol de user_metadata ya no es una autorizacion (F09). Este script
// usa service_role para asignar el rol real y dejar constancia de la
// aceptacion del aviso de privacidad de los usuarios de demostracion.
//
//   node --env-file=.env.local scripts/crear-usuarios.mjs
//
// Es idempotente: se puede ejecutar las veces que haga falta.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const CONTRASENA = "Codestart2026!";
const AHORA = new Date().toISOString();

const usuarios = [
  { correo: "docente@up.ac.pa", nombre: "Alvin Blanco", rol: "docente" },
  { correo: "francisco.gonzalez@up.ac.pa", nombre: "Francisco González", rol: "estudiante" },
];

// Grupo institucional del docente. Todo estudiante creado por este
// script queda inscrito en él, además de poder unirse con el código.
const GRUPO = {
  nombre: "Sección 1 · Verano 2026",
  codigo: "FIEC-V26-8QK4",
  periodo_inicio: "2026-07-06",
  periodo_fin: "2026-08-14",
};

const cabecerasAuth = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
};

const cabecerasApi = {
  ...cabecerasAuth,
  "Accept-Profile": "public",
  "Prefer": "resolution=merge-duplicates,return=representation",
};

const cabecerasConsulta = {
  ...cabecerasAuth,
  "Accept-Profile": "public",
};

const ids = new Map();

for (const u of usuarios) {
  const r = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers: cabecerasAuth,
    body: JSON.stringify({
      email: u.correo,
      password: CONTRASENA,
      email_confirm: true,
      user_metadata: { nombre: u.nombre, rol: u.rol },
    }),
  });

  let id = null;
  if (r.ok) {
    ({ id } = await r.json());
    console.log(`  usuario  ${u.rol.padEnd(9)} ${u.correo}`);
  } else {
    const cuerpo = await r.text();
    if (!/already been registered|already exists/i.test(cuerpo)) {
      console.error(`  ERROR    ${u.correo}: ${r.status} ${cuerpo.slice(0, 160)}`);
      process.exit(1);
    }
    // ya existe: se busca para reconstruir su perfil
    const lista = await fetch(`${url}/auth/v1/admin/users?page=1&per_page=200`, {
      headers: cabecerasAuth,
    });
    const todos = await lista.json();
    id = todos.users?.find((x) => x.email === u.correo)?.id;
    console.log(`  existe   ${u.rol.padEnd(9)} ${u.correo}`);
  }

  // El perfil se asegura siempre. service_role puede cambiar el rol
  // aunque el trigger de alta haya creado un estudiante.
  const p = await fetch(`${url}/rest/v1/perfiles`, {
    method: "POST",
    headers: cabecerasApi,
    body: JSON.stringify({
      id,
      nombre: u.nombre,
      correo: u.correo,
      rol: u.rol,
      acepta_privacidad: true,
      fecha_aceptacion: AHORA,
    }),
  });
  if (!p.ok) {
    const cuerpo = await p.text();
    console.error(`  ERROR perfil ${u.correo}: ${p.status} ${cuerpo.slice(0, 200)}`);
    process.exit(1);
  }
  ids.set(u.correo, id);
  console.log(`  perfil  ${u.rol.padEnd(9)} ${u.correo}`);
}

// ── Enlace docente ↔ estudiantes ───────────────────────────────
// Un estudiante recién creado debe aparecer en el panel del docente
// sin depender de que alguien comparta el código de inscripción.
const docente = usuarios.find((u) => u.rol === "docente");

if (docente) {
  const docenteId = ids.get(docente.correo);

  const busqueda = await fetch(
    `${url}/rest/v1/grupos?select=id&codigo_inscripcion=eq.${encodeURIComponent(GRUPO.codigo)}`,
    { headers: cabecerasConsulta },
  );
  if (!busqueda.ok) {
    const cuerpo = await busqueda.text();
    console.error(`  ERROR grupo: ${busqueda.status} ${cuerpo.slice(0, 200)}`);
    process.exit(1);
  }

  let [grupo] = await busqueda.json();
  if (!grupo) {
    const creacion = await fetch(`${url}/rest/v1/grupos`, {
      method: "POST",
      headers: cabecerasApi,
      body: JSON.stringify({
        nombre: GRUPO.nombre,
        codigo_inscripcion: GRUPO.codigo,
        docente_id: docenteId,
        periodo_inicio: GRUPO.periodo_inicio,
        periodo_fin: GRUPO.periodo_fin,
      }),
    });
    if (!creacion.ok) {
      const cuerpo = await creacion.text();
      console.error(`  ERROR grupo: ${creacion.status} ${cuerpo.slice(0, 200)}`);
      process.exit(1);
    }
    [grupo] = await creacion.json();
    console.log(`  grupo    ${GRUPO.nombre} (${GRUPO.codigo})`);
  } else {
    console.log(`  grupo    ${GRUPO.nombre} (${GRUPO.codigo}) ya existía`);
  }

  // Se inscriben todos los perfiles con rol estudiante, no solo los de
  // la lista: así también quedan enlazadas las cuentas creadas a mano
  // desde el panel de Supabase.
  const listado = await fetch(
    `${url}/rest/v1/perfiles?select=id,correo&rol=eq.estudiante`,
    { headers: cabecerasConsulta },
  );
  if (!listado.ok) {
    const cuerpo = await listado.text();
    console.error(`  ERROR estudiantes: ${listado.status} ${cuerpo.slice(0, 200)}`);
    process.exit(1);
  }

  for (const estudiante of await listado.json()) {
    const inscripcion = await fetch(
      `${url}/rest/v1/inscripciones?on_conflict=usuario_id,grupo_id`,
      {
        method: "POST",
        headers: {
          ...cabecerasApi,
          Prefer: "resolution=ignore-duplicates,return=minimal",
        },
        body: JSON.stringify({
          usuario_id: estudiante.id,
          grupo_id: grupo.id,
        }),
      },
    );
    if (!inscripcion.ok) {
      const cuerpo = await inscripcion.text();
      console.error(
        `  ERROR inscripción ${estudiante.correo}: ${inscripcion.status} ${cuerpo.slice(0, 200)}`,
      );
      process.exit(1);
    }
    console.log(`  inscrito ${estudiante.correo}`);
  }
}

console.log(`\n${usuarios.length} usuarios listos. Contraseña de prueba: ${CONTRASENA}`);
