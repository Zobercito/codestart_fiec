// Crea los usuarios de prueba en Supabase Auth y asegura su perfil.
//
// El trigger trg_crear_perfil crea el perfil en public.perfiles al
// insertar en auth.users, con el rol que viene en user_metadata. Pero
// si el usuario ya existia y el perfil no (por ejemplo, tras recrear
// el esquema public), aqui se reconstruye.
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

const usuarios = [
  { correo: "docente@up.ac.pa", nombre: "Alvin Blanco", rol: "docente" },
  { correo: "francisco.gonzalez@up.ac.pa", nombre: "Francisco González", rol: "estudiante" },
];

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

  // el perfil se asegura siempre: si el trigger no corrio, se reconstruye
  const p = await fetch(`${url}/rest/v1/perfiles`, {
    method: "POST",
    headers: cabecerasApi,
    body: JSON.stringify({ id, nombre: u.nombre, correo: u.correo, rol: u.rol }),
  });
  if (!p.ok) {
    const cuerpo = await p.text();
    console.error(`  ERROR perfil ${u.correo}: ${p.status} ${cuerpo.slice(0, 200)}`);
    process.exit(1);
  }
  console.log(`  perfil  ${u.rol.padEnd(9)} ${u.correo}`);
}

console.log(`\n${usuarios.length} usuarios listos. Contraseña de prueba: ${CONTRASENA}`);
