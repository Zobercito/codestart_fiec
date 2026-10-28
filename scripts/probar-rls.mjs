// Matriz RLS del Avance 4.
//
// Crea dos docentes, dos estudiantes y dos grupos temporales, y comprueba
// desde el cliente (con la clave anónima y el JWT de cada usuario) que el
// RLS no deja ver ni escribir datos ajenos. Usa service_role solo para
// preparar y limpiar el escenario.
//
//   npm run test:rls
//
// No se ejecuta contra datos reales: todo lo que crea se borra al final.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anon || !service) {
  console.error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY o SUPABASE_SERVICE_ROLE_KEY.",
  );
  process.exit(1);
}

const marca = Date.now();
const clave = "Codestart2026!";
const correos = {
  estudianteA: `rls.est.a.${marca}@up.ac.pa`,
  estudianteB: `rls.est.b.${marca}@up.ac.pa`,
  docenteA: `rls.doc.a.${marca}@up.ac.pa`,
  docenteB: `rls.doc.b.${marca}@up.ac.pa`,
};

const creados = {
  usuarios: [],
  grupos: [],
};

function cabeceras(token, extra = {}) {
  return {
    apikey: token === service ? service : anon,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

async function rest(ruta, { metodo = "GET", token = service, cuerpo } = {}) {
  const respuesta = await fetch(`${url}/rest/v1/${ruta}`, {
    method: metodo,
    headers: cabeceras(token, {
      ...(cuerpo ? { Prefer: "return=representation" } : {}),
    }),
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });

  const texto = await respuesta.text();
  let datos = null;
  try {
    datos = texto ? JSON.parse(texto) : null;
  } catch {
    datos = texto;
  }

  return { ok: respuesta.ok, estado: respuesta.status, datos, texto };
}

async function crearUsuario(correo, nombre) {
  const respuesta = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers: cabeceras(service),
    body: JSON.stringify({
      email: correo,
      password: clave,
      email_confirm: true,
      user_metadata: { nombre, acepta_privacidad: true },
    }),
  });

  const cuerpo = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(
      `No se pudo crear ${correo}: ${respuesta.status} ${JSON.stringify(cuerpo)}`,
    );
  }

  const id = cuerpo.id ?? cuerpo.user?.id;
  if (!id) throw new Error(`El alta de ${correo} no devolvió id.`);
  creados.usuarios.push(id);
  return id;
}

async function entrar(correo) {
  const respuesta = await fetch(
    `${url}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: { apikey: anon, "Content-Type": "application/json" },
      body: JSON.stringify({ email: correo, password: clave }),
    },
  );

  const cuerpo = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(
      `No se pudo iniciar sesión como ${correo}: ${respuesta.status} ${JSON.stringify(cuerpo)}`,
    );
  }
  return cuerpo.access_token;
}

async function cambiarRol(usuario, rol) {
  const respuesta = await rest("rpc/cambiar_rol", {
    metodo: "POST",
    cuerpo: { p_usuario: usuario, p_rol: rol },
  });
  if (!respuesta.ok) {
    throw new Error(
      `cambiar_rol falló: ${respuesta.estado} ${JSON.stringify(respuesta.datos)}`,
    );
  }
}

function comprobar(condicion, mensaje) {
  if (!condicion) throw new Error(mensaje);
  console.log(`  ok  ${mensaje}`);
}

function filas(resultado) {
  return Array.isArray(resultado.datos) ? resultado.datos : [];
}

async function principal() {
  console.log("Preparando escenario temporal de RLS…");

  const estudiantes = {
    a: await crearUsuario(correos.estudianteA, "Estudiante RLS A"),
    b: await crearUsuario(correos.estudianteB, "Estudiante RLS B"),
  };
  const docentes = {
    a: await crearUsuario(correos.docenteA, "Docente RLS A"),
    b: await crearUsuario(correos.docenteB, "Docente RLS B"),
  };

  await cambiarRol(docentes.a, "docente");
  await cambiarRol(docentes.b, "docente");

  const modulos = filas(
    await rest("modulos?select=id,orden&order=orden.asc&limit=1"),
  );
  if (modulos.length === 0) throw new Error("No hay módulos para la prueba.");
  const moduloId = modulos[0].id;

  const lecciones = filas(
    await rest(
      `lecciones?select=id&modulo_id=eq.${moduloId}&order=orden.asc&limit=1`,
    ),
  );
  if (lecciones.length === 0) throw new Error("No hay lecciones para la prueba.");
  const leccionId = lecciones[0].id;

  const retos = filas(await rest("retos?select=id&limit=1"));
  if (retos.length === 0) throw new Error("No hay retos para la prueba.");
  const retoId = retos[0].id;

  // Grupos y matrículas.
  const grupoA = filas(
    await rest("grupos", {
      metodo: "POST",
      cuerpo: {
        nombre: `RLS A ${marca}`,
        codigo_inscripcion: `RLS-A-${marca}`,
        docente_id: docentes.a,
      },
    }),
  )[0];
  const grupoB = filas(
    await rest("grupos", {
      metodo: "POST",
      cuerpo: {
        nombre: `RLS B ${marca}`,
        codigo_inscripcion: `RLS-B-${marca}`,
        docente_id: docentes.b,
      },
    }),
  )[0];
  if (!grupoA?.id || !grupoB?.id) throw new Error("No se crearon los grupos.");
  creados.grupos.push(grupoA.id, grupoB.id);

  await rest("inscripciones", {
    metodo: "POST",
    cuerpo: [
      { usuario_id: estudiantes.a, grupo_id: grupoA.id },
      { usuario_id: estudiantes.b, grupo_id: grupoB.id },
    ],
  });

  // Datos de cada estudiante.
  await rest("progresos", {
    metodo: "POST",
    cuerpo: [
      { usuario_id: estudiantes.a, leccion_id: leccionId, estado: "completado" },
      { usuario_id: estudiantes.b, leccion_id: leccionId, estado: "completado" },
    ],
  });
  await rest("intentos", {
    metodo: "POST",
    cuerpo: [
      {
        usuario_id: estudiantes.a,
        reto_id: retoId,
        respuesta: "a",
        acierto: true,
        puntos_obtenidos: 10,
      },
      {
        usuario_id: estudiantes.b,
        reto_id: retoId,
        respuesta: "a",
        acierto: true,
        puntos_obtenidos: 10,
      },
    ],
  });
  await rest("codigos", {
    metodo: "POST",
    cuerpo: [
      { usuario_id: estudiantes.a, reto_id: retoId, codigo: "// A" },
      { usuario_id: estudiantes.b, reto_id: retoId, codigo: "// B" },
    ],
  });
  await rest("insignias", {
    metodo: "POST",
    cuerpo: [
      {
        usuario_id: estudiantes.a,
        tipo: `rls_a_${marca}`,
        descripcion: "Prueba RLS A",
      },
      {
        usuario_id: estudiantes.b,
        tipo: `rls_b_${marca}`,
        descripcion: "Prueba RLS B",
      },
    ],
  });
  await rest("asignaciones", {
    metodo: "POST",
    cuerpo: [
      {
        grupo_id: grupoA.id,
        modulo_id: moduloId,
        descripcion: "Asignación RLS A",
        fecha_entrega: "2026-12-01",
        creada_por: docentes.a,
      },
      {
        grupo_id: grupoB.id,
        modulo_id: moduloId,
        descripcion: "Asignación RLS B",
        fecha_entrega: "2026-12-01",
        creada_por: docentes.b,
      },
    ],
  });

  const token = {
    estA: await entrar(correos.estudianteA),
    estB: await entrar(correos.estudianteB),
    docA: await entrar(correos.docenteA),
    docB: await entrar(correos.docenteB),
  };

  console.log("\nMatriz mínima (Anexo B)");

  const aProgresoB = await rest(
    `progresos?select=id&usuario_id=eq.${estudiantes.b}`,
    { token: token.estA },
  );
  comprobar(filas(aProgresoB).length === 0, "estudiante A no ve progresos de B");

  const aProgresoA = await rest(
    `progresos?select=id&usuario_id=eq.${estudiantes.a}`,
    { token: token.estA },
  );
  comprobar(filas(aProgresoA).length > 0, "estudiante A sí ve su propio progreso");

  const aIntentosB = await rest(
    `intentos?select=id&usuario_id=eq.${estudiantes.b}`,
    { token: token.estA },
  );
  comprobar(filas(aIntentosB).length === 0, "estudiante A no ve intentos de B");

  const aCodigosB = await rest(
    `codigos?select=id&usuario_id=eq.${estudiantes.b}`,
    { token: token.estA },
  );
  comprobar(filas(aCodigosB).length === 0, "estudiante A no ve borradores de B");

  const aInsigniasB = await rest(
    `insignias?select=id&usuario_id=eq.${estudiantes.b}`,
    { token: token.estA },
  );
  comprobar(filas(aInsigniasB).length === 0, "estudiante A no ve insignias de B");

  const aPerfilB = await rest(
    `perfiles?select=id,correo&id=eq.${estudiantes.b}`,
    { token: token.estA },
  );
  comprobar(filas(aPerfilB).length === 0, "estudiante A no ve el perfil de B");

  const docAGrupoB = await rest(`grupos?select=id&id=eq.${grupoB.id}`, {
    token: token.docA,
  });
  comprobar(filas(docAGrupoB).length === 0, "docente A no ve el grupo de B");

  const docBGrupoB = await rest(`grupos?select=id&id=eq.${grupoB.id}`, {
    token: token.docB,
  });
  comprobar(filas(docBGrupoB).length > 0, "docente B sí ve su propio grupo");

  const docAProgresoB = await rest(
    `progresos?select=id&usuario_id=eq.${estudiantes.b}`,
    { token: token.docA },
  );
  comprobar(
    filas(docAProgresoB).length === 0,
    "docente A no ve progresos del grupo de B",
  );

  const docBProgresoB = await rest(
    `progresos?select=id&usuario_id=eq.${estudiantes.b}`,
    { token: token.docB },
  );
  comprobar(
    filas(docBProgresoB).length > 0,
    "docente B sí ve progresos de su grupo",
  );

  const docAIntentosB = await rest(
    `intentos?select=id&usuario_id=eq.${estudiantes.b}`,
    { token: token.docA },
  );
  comprobar(
    filas(docAIntentosB).length === 0,
    "docente A no ve intentos del grupo de B",
  );

  const docAAsignacionB = await rest(
    `asignaciones?select=id&grupo_id=eq.${grupoB.id}`,
    { token: token.docA },
  );
  comprobar(
    filas(docAAsignacionB).length === 0,
    "docente A no ve asignaciones del grupo de B",
  );

  console.log("\nEscrituras prohibidas");

  const insertarInsignia = await rest("insignias", {
    metodo: "POST",
    token: token.estA,
    cuerpo: {
      usuario_id: estudiantes.a,
      tipo: `rls_intruso_${marca}`,
      descripcion: "Intento directo",
    },
  });
  comprobar(
    !insertarInsignia.ok,
    "estudiante no puede insertar insignias directamente",
  );

  const insigniaIntrusa = filas(
    await rest(
      `insignias?select=id&tipo=eq.rls_intruso_${marca}`,
    ),
  );
  comprobar(
    insigniaIntrusa.length === 0,
    "la insignia intrusa no quedó en la base",
  );

  const cambiarRolPropio = await rest(
    `rpc/cambiar_rol`,
    {
      metodo: "POST",
      token: token.estA,
      cuerpo: { p_usuario: estudiantes.a, p_rol: "docente" },
    },
  );
  comprobar(
    !cambiarRolPropio.ok,
    "estudiante no puede llamar a cambiar_rol",
  );

  const perfilA = filas(
    await rest(`perfiles?select=id,rol&id=eq.${estudiantes.a}`),
  )[0];
  comprobar(
    perfilA?.rol === "estudiante",
    "el rol del estudiante A sigue siendo estudiante",
  );

  const updateRol = await rest(
    `perfiles?id=eq.${estudiantes.a}`,
    {
      metodo: "PATCH",
      token: token.estA,
      cuerpo: { rol: "docente" },
    },
  );
  const perfilTrasUpdate = filas(
    await rest(`perfiles?select=id,rol&id=eq.${estudiantes.a}`),
  )[0];
  comprobar(
    updateRol.ok && perfilTrasUpdate?.rol === "estudiante",
    "un PATCH directo del rol no cambia el rol",
  );

  const progresoAjeno = await rest("progresos", {
    metodo: "POST",
    token: token.estA,
    cuerpo: {
      usuario_id: estudiantes.b,
      leccion_id: leccionId,
      estado: "completado",
    },
  });
  comprobar(
    !progresoAjeno.ok,
    "estudiante A no puede escribir progreso de B",
  );

  const insigniaAjena = await rest("insignias", {
    metodo: "POST",
    token: token.estA,
    cuerpo: {
      usuario_id: estudiantes.b,
      tipo: `rls_ajena_${marca}`,
      descripcion: "Intento a B",
    },
  });
  comprobar(
    !insigniaAjena.ok,
    "estudiante A no puede insertar insignias de B",
  );

  console.log("\nLímites de rol");

  const grupoIntruso = await rest("grupos", {
    metodo: "POST",
    token: token.estA,
    cuerpo: {
      nombre: `Grupo intruso ${marca}`,
      codigo_inscripcion: `RLS-X-${marca}`,
      docente_id: estudiantes.a,
    },
  });
  if (grupoIntruso.ok) {
    const id = filas(grupoIntruso)[0]?.id;
    if (id) creados.grupos.push(id);
  }
  comprobar(
    !grupoIntruso.ok,
    "estudiante no puede crear un grupo aunque se ponga como docente",
  );

  const asignacionIntrusa = await rest("asignaciones", {
    metodo: "POST",
    token: token.estA,
    cuerpo: {
      grupo_id: grupoA.id,
      modulo_id: moduloId,
      descripcion: "Asignación intrusa",
      fecha_entrega: "2026-12-01",
      creada_por: estudiantes.a,
    },
  });
  comprobar(
    !asignacionIntrusa.ok,
    "estudiante no puede crear asignaciones en un grupo ajeno",
  );

  console.log("\nMatriz RLS: PASÓ");
}

try {
  await principal();
} catch (error) {
  console.error(`\nMatriz RLS: FALLÓ\n${error.message}`);
  process.exitCode = 1;
} finally {
  for (const grupo of creados.grupos) {
    await rest(`grupos?id=eq.${grupo}`, { metodo: "DELETE" });
  }
  for (const usuario of creados.usuarios) {
    await fetch(`${url}/auth/v1/admin/users/${usuario}`, {
      method: "DELETE",
      headers: cabeceras(service),
    });
  }
  if (creados.usuarios.length > 0) {
    console.log(`\nLimpieza: ${creados.usuarios.length} usuarios y ${creados.grupos.length} grupos temporales eliminados.`);
  }
}
