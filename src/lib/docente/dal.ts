import "server-only";

import { redirect } from "next/navigation";
import { crearClienteSupabase } from "@/lib/supabase/server";
import { obtenerMiPerfil, type Perfil } from "@/lib/auth/dal";
import type { Json } from "@/lib/supabase/types.generados";

/**
 * DAL del panel docente.
 *
 * Todas las consultas usan el cliente del usuario: el RLS de Postgres
 * decide qué grupos, estudiantes, progresos e intentos puede ver. Encima
 * de eso se comprueba la propiedad del grupo, para que un docente no
 * llegue a otro grupo ni siquiera si una política cambiara.
 */

export type GrupoDocente = {
  id: string;
  nombre: string;
  codigo_inscripcion: string;
  docente_id: string;
  periodo_inicio: string | null;
  periodo_fin: string | null;
  creado_en: string;
  estudiantes: number;
};

export type EstudianteGrupo = {
  id: string;
  nombre: string;
  correo: string;
};

export type LeccionCurso = {
  id: string;
  modulo_id: string;
  titulo: string;
  orden: number;
};

export type ModuloCurso = {
  id: string;
  titulo: string;
  orden: number;
  lecciones: LeccionCurso[];
};

export type IntentoResumen = {
  id: string;
  usuario_id: string;
  reto_id: string;
  reto_titulo: string;
  modulo_id: string | null;
  modulo_titulo: string;
  acierto: boolean;
  error_detectado: string | null;
  resultado: Json;
  fecha: string;
};

export type InsigniaResumen = {
  usuario_id: string;
  tipo: string;
  descripcion: string | null;
  fecha: string;
};

export type ProgresoResumen = {
  usuario_id: string;
  leccion_id: string;
  estado: string;
  fecha: string;
};

export type AsignacionResumen = {
  id: string;
  descripcion: string | null;
  fecha_entrega: string;
  creado_en: string;
  modulo_id: string | null;
  reto_id: string | null;
  objetivo: string;
  completados: number;
  total: number;
  vencida: boolean;
};

export type ErrorFrecuente = {
  clave: string;
  error: string;
  casos: number;
  estudiantes: number;
  ultimaFecha: string;
  retoId: string;
  retoTitulo: string;
  estudianteId: string;
  estudianteNombre: string;
};

export type CriticoPanel =
  | { tipo: "reto"; etiqueta: string; detalle: string; retoId: string }
  | { tipo: "error"; etiqueta: string; detalle: string; retoId: string | null }
  | { tipo: "ninguno"; etiqueta: string; detalle: string; retoId: null };

export type IndicadoresGrupo = {
  estudiantes: number;
  cumplimiento: number | null;
  tasaAcierto: number | null;
  atrasados: number;
  critico: CriticoPanel;
};

export type EstadoSeguimiento = "al_dia" | "en_riesgo" | "atrasado" | "sin_actividad";

export type FilaSeguimiento = {
  id: string;
  nombre: string;
  correo: string;
  estado: EstadoSeguimiento;
  avance: number;
  completadas: number;
  totalLecciones: number;
  moduloActual: string | null;
  ultimoReto: string | null;
  ultimoIntentoFecha: string | null;
  intentos: number;
  acierto: number | null;
  insignias: number;
};

export type PanoramaGrupo = {
  grupo: GrupoDocente;
  estudiantes: EstudianteGrupo[];
  seguimiento: FilaSeguimiento[];
  indicadores: IndicadoresGrupo;
  errores: ErrorFrecuente[];
  asignaciones: AsignacionResumen[];
  modulos: ModuloCurso[];
  intentos: IntentoResumen[];
  insignias: InsigniaResumen[];
  progresos: ProgresoResumen[];
  hoy: string;
};

export type OpcionesAsignacion = {
  modulos: { id: string; titulo: string; orden: number }[];
  retos: {
    id: string;
    enunciado: string;
    tipo: string;
    modulo: string;
    leccion: string;
  }[];
};

type Relacion<T> = T | T[] | null;

function primero<T>(valor: Relacion<T> | undefined): T | null {
  if (!valor) return null;
  return Array.isArray(valor) ? (valor[0] ?? null) : valor;
}

function textoDeResultado(resultado: Json, clave: string): string | null {
  if (!resultado || typeof resultado !== "object" || Array.isArray(resultado)) {
    return null;
  }
  const valor = resultado[clave];
  return typeof valor === "string" ? valor : null;
}

function porcentaje(parte: number, total: number): number | null {
  if (total <= 0) return null;
  return Math.round((parte / total) * 100);
}

/** Exige sesión y rol docente (o admin). Un estudiante vuelve al panel. */
export async function exigirDocente(): Promise<Perfil> {
  const perfil = await obtenerMiPerfil();
  if (!perfil) redirect("/login");
  if (perfil.rol === "estudiante") redirect("/dashboard");
  return perfil;
}

/** Los grupos del docente. El admin ve todos. */
export async function obtenerMisGrupos(perfil: Perfil): Promise<GrupoDocente[]> {
  const supabase = await crearClienteSupabase();

  let consulta = supabase
    .from("grupos")
    .select("*")
    .order("creado_en", { ascending: false });

  if (perfil.rol !== "admin") {
    consulta = consulta.eq("docente_id", perfil.id);
  }

  const { data: grupos } = await consulta;
  const lista = grupos ?? [];
  if (lista.length === 0) return [];

  const { data: inscripciones } = await supabase
    .from("inscripciones")
    .select("grupo_id")
    .in("grupo_id", lista.map((g) => g.id));

  const conteo = new Map<string, number>();
  for (const inscripcion of inscripciones ?? []) {
    conteo.set(
      inscripcion.grupo_id,
      (conteo.get(inscripcion.grupo_id) ?? 0) + 1,
    );
  }

  return lista.map((grupo) => ({
    ...grupo,
    estudiantes: conteo.get(grupo.id) ?? 0,
  }));
}

/** Un grupo, solo si es del docente (o si es admin). */
export async function obtenerGrupo(
  perfil: Perfil,
  grupoId: string,
): Promise<GrupoDocente | null> {
  const supabase = await crearClienteSupabase();
  const { data: grupo } = await supabase
    .from("grupos")
    .select("*")
    .eq("id", grupoId)
    .maybeSingle();

  if (!grupo) return null;
  if (perfil.rol !== "admin" && grupo.docente_id !== perfil.id) return null;

  const { count } = await supabase
    .from("inscripciones")
    .select("id", { count: "exact", head: true })
    .eq("grupo_id", grupo.id);

  return { ...grupo, estudiantes: count ?? 0 };
}

/** El primer grupo del que el estudiante forma parte, si el docente lo ve. */
export async function obtenerGrupoDelEstudiante(
  perfil: Perfil,
  estudianteId: string,
): Promise<GrupoDocente | null> {
  const supabase = await crearClienteSupabase();
  const { data } = await supabase
    .from("inscripciones")
    .select("grupo:grupos(*)")
    .eq("usuario_id", estudianteId);

  for (const fila of data ?? []) {
    const grupo = primero(fila.grupo);
    if (!grupo) continue;
    if (perfil.rol === "admin" || grupo.docente_id === perfil.id) {
      const { count } = await supabase
        .from("inscripciones")
        .select("id", { count: "exact", head: true })
        .eq("grupo_id", grupo.id);
      return { ...grupo, estudiantes: count ?? 0 };
    }
  }

  return null;
}

/** Módulos y retos disponibles para asignar. */
export async function obtenerOpcionesAsignacion(): Promise<OpcionesAsignacion> {
  const supabase = await crearClienteSupabase();

  const [{ data: modulos }, { data: retos }] = await Promise.all([
    supabase.from("modulos").select("id, titulo, orden").order("orden"),
    supabase
      .from("retos")
      .select(
        "id, enunciado, tipo, leccion:lecciones(id, titulo, modulo:modulos(id, titulo, orden))",
      )
      .order("orden"),
  ]);

  return {
    modulos: modulos ?? [],
    retos: (retos ?? []).map((reto) => {
      const leccion = primero(reto.leccion);
      const modulo = leccion ? primero(leccion.modulo) : null;
      return {
        id: reto.id,
        enunciado: reto.enunciado,
        tipo: reto.tipo,
        modulo: modulo ? `Módulo ${modulo.orden}: ${modulo.titulo}` : "Sin módulo",
        leccion: leccion?.titulo ?? "Sin lección",
      };
    }),
  };
}

/**
 * Todo lo que necesita el panel de un grupo, calculado en el servidor.
 *
 * No se guardan indicadores en la base: se derivan de progresos e
 * intentos para que no puedan quedar desincronizados.
 */
export async function obtenerPanoramaGrupo(
  perfil: Perfil,
  grupoId: string,
): Promise<PanoramaGrupo | null> {
  const grupo = await obtenerGrupo(perfil, grupoId);
  if (!grupo) return null;

  const supabase = await crearClienteSupabase();

  const [
    { data: inscripciones },
    { data: modulos },
    { data: lecciones },
    { data: fecha },
  ] = await Promise.all([
    supabase
      .from("inscripciones")
      .select("usuario:perfiles(id, nombre, correo)")
      .eq("grupo_id", grupo.id),
    supabase.from("modulos").select("id, titulo, orden").order("orden"),
    supabase
      .from("lecciones")
      .select("id, modulo_id, titulo, orden")
      .order("orden"),
    supabase.rpc("fecha_actual"),
  ]);

  const estudiantes: EstudianteGrupo[] = [];
  for (const inscripcion of inscripciones ?? []) {
    const alumno = primero(inscripcion.usuario);
    if (alumno) {
      estudiantes.push({
        id: alumno.id,
        nombre: alumno.nombre,
        correo: alumno.correo,
      });
    }
  }
  estudiantes.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  const ids = estudiantes.map((e) => e.id);
  const hoy = typeof fecha === "string" ? fecha : "";

  // Las asignaciones se consultan siempre: un grupo recién creado puede
  // tener una tarea asignada aunque todavía no tenga estudiantes.
  const { data: asignaciones } = await supabase
    .from("asignaciones")
    .select(
      "id, descripcion, fecha_entrega, creado_en, modulo_id, reto_id, modulo:modulos(titulo, orden), reto:retos(id, enunciado)",
    )
    .eq("grupo_id", grupo.id)
    .order("creado_en", { ascending: false });

  const [{ data: progresos }, { data: intentos }, { data: insignias }] =
    ids.length > 0
      ? await Promise.all([
          supabase
            .from("progresos")
            .select("usuario_id, leccion_id, estado, fecha")
            .in("usuario_id", ids),
          supabase
            .from("intentos")
            .select(
              "id, usuario_id, reto_id, acierto, error_detectado, resultado, fecha, reto:retos(id, enunciado, leccion:lecciones(modulo_id, titulo, modulo:modulos(titulo, orden)))",
            )
            .in("usuario_id", ids)
            .order("fecha", { ascending: false }),
          supabase
            .from("insignias")
            .select("usuario_id, tipo, descripcion, fecha")
            .in("usuario_id", ids)
            .order("fecha", { ascending: false }),
        ])
      : [{ data: null }, { data: null }, { data: null }];

  const leccionesLista: LeccionCurso[] = (lecciones ?? []).map((leccion) => ({
    id: leccion.id,
    modulo_id: leccion.modulo_id,
    titulo: leccion.titulo,
    orden: leccion.orden,
  }));

  const leccionesPorModulo = new Map<string, LeccionCurso[]>();
  for (const leccion of leccionesLista) {
    const actual = leccionesPorModulo.get(leccion.modulo_id) ?? [];
    actual.push(leccion);
    leccionesPorModulo.set(leccion.modulo_id, actual);
  }

  const modulosCurso: ModuloCurso[] = (modulos ?? []).map((modulo) => ({
    id: modulo.id,
    titulo: modulo.titulo,
    orden: modulo.orden,
    lecciones: leccionesPorModulo.get(modulo.id) ?? [],
  }));

  const totalLecciones = leccionesLista.length;

  const completadasPorUsuario = new Map<string, Set<string>>();
  for (const progreso of progresos ?? []) {
    if (progreso.estado !== "completado") continue;
    const actual = completadasPorUsuario.get(progreso.usuario_id) ?? new Set();
    actual.add(progreso.leccion_id);
    completadasPorUsuario.set(progreso.usuario_id, actual);
  }

  const intentosResumen: IntentoResumen[] = (intentos ?? []).map((intento) => {
    const reto = primero(intento.reto);
    const leccion = reto ? primero(reto.leccion) : null;
    const modulo = leccion ? primero(leccion.modulo) : null;

    return {
      id: intento.id,
      usuario_id: intento.usuario_id,
      reto_id: intento.reto_id,
      reto_titulo: reto?.enunciado ?? "Reto",
      modulo_id: leccion?.modulo_id ?? null,
      modulo_titulo: modulo?.titulo ?? "Sin módulo",
      acierto: intento.acierto,
      error_detectado: intento.error_detectado,
      resultado: intento.resultado,
      fecha: intento.fecha,
    };
  });

  const intentosPorUsuario = new Map<string, IntentoResumen[]>();
  for (const intento of intentosResumen) {
    const actual = intentosPorUsuario.get(intento.usuario_id) ?? [];
    actual.push(intento);
    intentosPorUsuario.set(intento.usuario_id, actual);
  }

  const insigniasResumen: InsigniaResumen[] = (insignias ?? []).map((insignia) => ({
    usuario_id: insignia.usuario_id,
    tipo: insignia.tipo,
    descripcion: insignia.descripcion,
    fecha: insignia.fecha,
  }));

  const progresosResumen: ProgresoResumen[] = (progresos ?? []).map(
    (progreso) => ({
      usuario_id: progreso.usuario_id,
      leccion_id: progreso.leccion_id,
      estado: progreso.estado,
      fecha: progreso.fecha,
    }),
  );

  const insigniasPorUsuario = new Map<string, number>();
  for (const insignia of insigniasResumen) {
    insigniasPorUsuario.set(
      insignia.usuario_id,
      (insigniasPorUsuario.get(insignia.usuario_id) ?? 0) + 1,
    );
  }

  const asignacionesBase = (asignaciones ?? []).map((asignacion) => {
    const modulo = primero(asignacion.modulo);
    const reto = primero(asignacion.reto);
    return {
      id: asignacion.id,
      descripcion: asignacion.descripcion,
      fecha_entrega: asignacion.fecha_entrega,
      creado_en: asignacion.creado_en,
      modulo_id: asignacion.modulo_id,
      reto_id: asignacion.reto_id,
      objetivo: modulo
        ? `Módulo ${modulo.orden}: ${modulo.titulo}`
        : reto
          ? `Reto: ${reto.enunciado}`
          : "Sin destino",
    };
  });

  function objetivoCompletado(
    usuarioId: string,
    asignacion: { modulo_id: string | null; reto_id: string | null },
  ): boolean {
    const completadas = completadasPorUsuario.get(usuarioId) ?? new Set<string>();

    if (asignacion.modulo_id) {
      const delModulo = leccionesPorModulo.get(asignacion.modulo_id) ?? [];
      return (
        delModulo.length > 0 &&
        delModulo.every((leccion) => completadas.has(leccion.id))
      );
    }

    if (asignacion.reto_id) {
      return (intentosPorUsuario.get(usuarioId) ?? []).some(
        (intento) => intento.reto_id === asignacion.reto_id && intento.acierto,
      );
    }

    return false;
  }

  const asignacionesResumen: AsignacionResumen[] = asignacionesBase.map(
    (asignacion) => ({
      ...asignacion,
      completados: estudiantes.filter((estudiante) =>
        objetivoCompletado(estudiante.id, asignacion),
      ).length,
      total: estudiantes.length,
      vencida: hoy !== "" && asignacion.fecha_entrega < hoy,
    }),
  );

  const errores = agruparErrores(intentosResumen, estudiantes);

  const seguimiento: FilaSeguimiento[] = estudiantes.map((estudiante) => {
    const completadas = completadasPorUsuario.get(estudiante.id)?.size ?? 0;
    const avance = totalLecciones > 0 ? Math.round((completadas / totalLecciones) * 100) : 0;
    const suyos = intentosPorUsuario.get(estudiante.id) ?? [];
    const aciertos = suyos.filter((intento) => intento.acierto).length;
    const ultimo = suyos[0] ?? null;

    const atrasado = asignacionesBase.some(
      (asignacion) =>
        hoy !== "" &&
        asignacion.fecha_entrega < hoy &&
        !objetivoCompletado(estudiante.id, asignacion),
    );

    const moduloActual = modulosCurso.find((modulo) => {
      if (modulo.lecciones.length === 0) return false;
      return !modulo.lecciones.every((leccion) =>
        (completadasPorUsuario.get(estudiante.id) ?? new Set<string>()).has(
          leccion.id,
        ),
      );
    });

    let estado: EstadoSeguimiento;
    if (completadas === 0 && suyos.length === 0) {
      estado = "sin_actividad";
    } else if (atrasado) {
      estado = "atrasado";
    } else if (avance < 50) {
      estado = "en_riesgo";
    } else {
      estado = "al_dia";
    }

    return {
      id: estudiante.id,
      nombre: estudiante.nombre,
      correo: estudiante.correo,
      estado,
      avance,
      completadas,
      totalLecciones,
      moduloActual: moduloActual
        ? `Módulo ${moduloActual.orden}: ${moduloActual.titulo}`
        : null,
      ultimoReto: ultimo?.reto_titulo ?? null,
      ultimoIntentoFecha: ultimo?.fecha ?? null,
      intentos: suyos.length,
      acierto: porcentaje(aciertos, suyos.length),
      insignias: insigniasPorUsuario.get(estudiante.id) ?? 0,
    };
  });

  const asignacionActual = asignacionesBase[0] ?? null;
  let cumplimiento: number | null = null;
  if (estudiantes.length > 0) {
    if (asignacionActual) {
      const completados = estudiantes.filter((estudiante) =>
        objetivoCompletado(estudiante.id, asignacionActual),
      ).length;
      cumplimiento = Math.round((completados / estudiantes.length) * 100);
    } else if (totalLecciones > 0) {
      const suma = estudiantes.reduce((acc, estudiante) => {
        const completadas = completadasPorUsuario.get(estudiante.id)?.size ?? 0;
        return acc + (completadas / totalLecciones) * 100;
      }, 0);
      cumplimiento = Math.round(suma / estudiantes.length);
    } else {
      cumplimiento = 0;
    }
  }

  const atrasados = seguimiento.filter((fila) => fila.estado === "atrasado").length;
  const totalIntentos = intentosResumen.length;
  const totalAciertos = intentosResumen.filter((intento) => intento.acierto).length;

  return {
    grupo,
    estudiantes,
    seguimiento,
    indicadores: {
      estudiantes: estudiantes.length,
      cumplimiento,
      tasaAcierto: porcentaje(totalAciertos, totalIntentos),
      atrasados,
      critico: calcularCritico(intentosResumen, errores),
    },
    errores,
    asignaciones: asignacionesResumen,
    modulos: modulosCurso,
    intentos: intentosResumen,
    insignias: insigniasResumen,
    progresos: progresosResumen,
    hoy,
  };
}

/** La fecha de hoy según Postgres, sin `new Date()` en el render. */
export async function obtenerFechaActual(): Promise<string> {
  const supabase = await crearClienteSupabase();
  const { data } = await supabase.rpc("fecha_actual");
  return typeof data === "string" ? data : "";
}

function agruparErrores(
  intentos: IntentoResumen[],
  estudiantes: EstudianteGrupo[],
): ErrorFrecuente[] {
  const nombres = new Map(estudiantes.map((e) => [e.id, e.nombre]));
  const mapa = new Map<
    string,
    {
      error: string;
      casos: number;
      estudiantes: Set<string>;
      ultimaFecha: string;
      retoId: string;
      retoTitulo: string;
      estudianteId: string;
      estudianteNombre: string;
    }
  >();

  for (const intento of intentos) {
    if (!intento.error_detectado) continue;

    const clave =
      textoDeResultado(intento.resultado, "regla_incumplida") ??
      intento.error_detectado;

    const actual = mapa.get(clave) ?? {
      error: intento.error_detectado,
      casos: 0,
      estudiantes: new Set<string>(),
      ultimaFecha: intento.fecha,
      retoId: intento.reto_id,
      retoTitulo: intento.reto_titulo,
      estudianteId: intento.usuario_id,
      estudianteNombre: nombres.get(intento.usuario_id) ?? "Estudiante",
    };

    actual.casos += 1;
    actual.estudiantes.add(intento.usuario_id);

    if (intento.fecha >= actual.ultimaFecha) {
      actual.ultimaFecha = intento.fecha;
      actual.error = intento.error_detectado;
      actual.retoId = intento.reto_id;
      actual.retoTitulo = intento.reto_titulo;
      actual.estudianteId = intento.usuario_id;
      actual.estudianteNombre = nombres.get(intento.usuario_id) ?? "Estudiante";
    }

    mapa.set(clave, actual);
  }

  return [...mapa.entries()]
    .map(([clave, valor]) => ({
      clave,
      error: valor.error,
      casos: valor.casos,
      estudiantes: valor.estudiantes.size,
      ultimaFecha: valor.ultimaFecha,
      retoId: valor.retoId,
      retoTitulo: valor.retoTitulo,
      estudianteId: valor.estudianteId,
      estudianteNombre: valor.estudianteNombre,
    }))
    .sort((a, b) => b.casos - a.casos || b.ultimaFecha.localeCompare(a.ultimaFecha))
    .slice(0, 5);
}

function calcularCritico(
  intentos: IntentoResumen[],
  errores: ErrorFrecuente[],
): CriticoPanel {
  const porReto = new Map<
    string,
    { titulo: string; total: number; aciertos: number }
  >();

  for (const intento of intentos) {
    const actual = porReto.get(intento.reto_id) ?? {
      titulo: intento.reto_titulo,
      total: 0,
      aciertos: 0,
    };
    actual.total += 1;
    if (intento.acierto) actual.aciertos += 1;
    porReto.set(intento.reto_id, actual);
  }

  const candidatos = [...porReto.entries()]
    .filter(([, valor]) => valor.total >= 3)
    .sort((a, b) => {
      const tasaA = a[1].aciertos / a[1].total;
      const tasaB = b[1].aciertos / b[1].total;
      return tasaA - tasaB || b[1].total - a[1].total;
    });

  const peor = candidatos[0];
  if (peor) {
    const [retoId, valor] = peor;
    return {
      tipo: "reto",
      etiqueta: valor.titulo,
      detalle: `${porcentaje(valor.aciertos, valor.total)} % de acierto en ${valor.total} intentos`,
      retoId,
    };
  }

  const error = errores[0];
  if (error) {
    return {
      tipo: "error",
      etiqueta: error.error,
      detalle: `${error.casos} casos en ${error.estudiantes} estudiantes`,
      retoId: error.retoId,
    };
  }

  return {
    tipo: "ninguno",
    etiqueta: "Sin datos suficientes",
    detalle: "Aún no hay intentos registrados en este grupo.",
    retoId: null,
  };
}
