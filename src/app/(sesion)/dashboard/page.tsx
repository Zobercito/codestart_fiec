import Link from "next/link";
import { redirect } from "next/navigation";
import { IconoModulo } from "@/components/modulos/icono-modulo";
import { formatearFecha } from "@/lib/fechas";
import {
  obtenerMiGrupo,
  obtenerMiPerfil,
  obtenerMiTarea,
  obtenerRutaDeModulos,
} from "@/lib/auth/dal";
import { aceptarPrivacidad } from "@/lib/auth/acciones";
import { calcularEstadosModulos } from "@/lib/progreso/calculo";
import { FormularioUnirse } from "@/components/grupos/formulario-unirse";

/**
 * Dashboard del estudiante: la pantalla A del mockup del Avance 2, con
 * los datos que vienen de la base de datos.
 */
export default async function PaginaDashboard() {
  const perfil = await obtenerMiPerfil();
  if (!perfil) return null;

  // El dashboard mide el avance de un estudiante. Un docente que llegue
  // aqui por una URL directa vuelve a su panel.
  if (perfil.rol !== "estudiante") redirect("/docente");

  const [grupo, ruta, tarea] = await Promise.all([
    obtenerMiGrupo(perfil),
    obtenerRutaDeModulos(perfil),
    obtenerMiTarea(perfil),
  ]);

  const { modulos, moduloEnCurso } = calcularEstadosModulos(ruta);
  const completados = modulos.filter((m) => m.estado === "completado").length;
  const porcentaje = Math.round((completados / Math.max(modulos.length, 1)) * 100);
  const enProgreso = moduloEnCurso;

  const destinoTarea = tarea?.modulo
    ? `Módulo ${tarea.modulo.orden}: ${tarea.modulo.titulo}`
    : tarea?.reto
      ? `Reto: ${tarea.reto.enunciado}`
      : "Actividad asignada";
  const enlaceTarea = tarea?.modulo
    ? `/modulos/${tarea.modulo.orden}`
    : tarea?.reto
      ? `/retos/${tarea.reto.id}`
      : "/modulos";

  return (
    <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-6 sm:px-6">
      {!perfil.acepta_privacidad ? (
        <section className="mb-5 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5">
          <h2 className="text-sm font-extrabold text-slate-900">
            Acepta el aviso de privacidad
          </h2>
          <p className="mt-1 max-w-3xl text-[12.5px] leading-relaxed text-slate-700">
            Antes de seguir usando la plataforma, revisa cómo tratamos tus datos personales. Puedes
            leer el{" "}
            <Link
              href="/privacidad"
              className="font-semibold text-fiec-700 underline decoration-fiec-300 underline-offset-4"
            >
              aviso de privacidad
            </Link>
            .
          </p>
          <form action={aceptarPrivacidad} className="mt-3">
            <button
              type="submit"
              className="rounded-xl bg-fiec-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-fiec-700"
            >
              Acepto el aviso de privacidad
            </button>
          </form>
        </section>
      ) : null}

      {!grupo ? (
        <section className="mb-5 rounded-2xl border border-fiec-200 bg-fiec-50/70 p-4 sm:p-5">
          <div className="grid gap-4 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                Únete a tu grupo
              </h2>
              <p className="mt-1 max-w-xl text-[12.5px] leading-relaxed text-slate-700">
                Pide a tu docente el código de inscripción del grupo. Con él
                verás las tareas asignadas y el panel del curso quedará
                vinculado a tu sección.
              </p>
            </div>
            <div className="md:justify-self-end md:w-full md:max-w-sm">
              <FormularioUnirse />
            </div>
          </div>
        </section>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wider text-fiec-600">
            {grupo ? `${grupo.nombre}` : "Curso Propedéutico · Verano 2026"}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
            ¡Hola, {perfil.nombre.split(" ")[0]}! Continúa donde quedaste
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {enProgreso ? (
              <>
                Estás en el{" "}
                <strong className="font-semibold text-slate-700">
                  Módulo {enProgreso.orden} · {enProgreso.titulo}
                </strong>
                .
              </>
            ) : (
              "Empieza por el primer módulo del curso."
            )}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href={enProgreso ? `/modulos/${enProgreso.orden}` : "/modulos/1"}
              className="rounded-xl bg-fiec-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-fiec-600/25 transition hover:bg-fiec-700"
            >
              {enProgreso ? `Continuar módulo ${enProgreso.orden} →` : "Empezar el curso →"}
            </Link>
          </div>
        </div>

        {/* Progreso global, con el mismo anillo del mockup */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center gap-4">
            <div className="relative h-[86px] w-[86px] shrink-0">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#E2E8F0" strokeWidth="11" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#0B62A4"
                  strokeWidth="11"
                  strokeLinecap="round"
                  strokeDasharray="263.9"
                  strokeDashoffset={263.9 - (263.9 * porcentaje) / 100}
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center leading-none">
                  <div className="text-xl font-extrabold text-slate-900">{porcentaje}%</div>
                  <div className="text-[9px] font-semibold uppercase text-slate-500">avance</div>
                </div>
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-800">Avance global del curso</div>
              <div className="mt-0.5 text-xs text-slate-500">
                {completados} de {modulos.length} módulos completados
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tarea asignada (RF13) */}
      {tarea ? (
        <div
          id="tareas"
          className="mt-6 scroll-mt-24 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-up-500 text-lg">
              <span aria-hidden="true">📌</span>
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-up-700">
                Tarea asignada por el docente
              </div>
              <div className="mt-0.5 text-sm font-bold text-slate-800">
                {destinoTarea}
              </div>
              {tarea.descripcion ? (
                <p className="mt-0.5 text-[12px] leading-relaxed text-slate-700">
                  {tarea.descripcion}
                </p>
              ) : null}
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                <span>
                  <span aria-hidden="true">📅</span> Entrega:{" "}
                  <strong className="font-semibold text-slate-700">
                    {formatearFecha(tarea.fecha_entrega)}
                  </strong>
                </span>
                <Link
                  href={enlaceTarea}
                  className="font-bold text-fiec-700 underline decoration-fiec-300 underline-offset-4 hover:text-fiec-800"
                >
                  Ir a la tarea →
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Ruta de modulos (RF02) */}
      <div className="mt-7 flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-lg font-extrabold tracking-tight text-slate-900">Ruta de módulos</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500">
            Contenido del propedéutico · {modulos.length} módulos
          </span>
          <Link
            href="/medallas"
            className="text-xs font-bold text-fiec-700 underline decoration-fiec-300 underline-offset-4 hover:text-fiec-800"
          >
            Mis medallas →
          </Link>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {modulos.map((m) => {
          const completado = m.estado === "completado";
          const enCurso = m.estado === "en_progreso";
          const bloqueado = m.estado === "bloqueado";

          return (
            <article
              key={m.id}
              className={`flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ${
                enCurso ? "ring-2 ring-fiec-500" : "ring-slate-200"
              }`}
            >
              <div
                className={`relative h-24 overflow-hidden ${
                  enCurso
                    ? "bg-linear-to-br from-fiec-600 to-fiec-800"
                    : completado
                      ? "bg-linear-to-br from-fiec-700 to-fiec-500"
                      : "bg-linear-to-br from-slate-500 to-slate-700"
                }`}
              >
                {/*
                  La retícula va en un div propio: en Tailwind v4 el
                  gradiente y el tramado compiten por background-image,
                  y la retícula se comeria el gradiente.
                */}
                <div className="dotgrid absolute inset-0" aria-hidden="true" />
                <div className="absolute inset-0 grid place-items-center">
                  <IconoModulo orden={m.orden} />
                </div>
                <span className="absolute left-3 top-3 rounded-lg bg-white/95 px-2 py-0.5 text-[11px] font-extrabold text-fiec-700">
                  Módulo {m.orden}
                </span>
                {completado ? (
                  <span className="absolute right-3 top-3 rounded-full bg-coder-500 px-2 py-0.5 text-[10px] font-extrabold text-slate-900">
                    ✓ Completado
                  </span>
                ) : enCurso ? (
                  <span className="absolute right-3 top-3 rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-fiec-700">
                    ● En progreso
                  </span>
                ) : bloqueado ? (
                  <span className="absolute right-3 top-3 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-extrabold text-white">
                    🔒 Bloqueado
                  </span>
                ) : null}
              </div>

              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-sm font-bold leading-snug text-slate-800">{m.titulo}</h3>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{m.descripcion}</p>

                <div className="mt-auto pt-3">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                    <span>
                      {m.total === 0
                        ? "Sin lecciones todavía"
                        : `${m.completadas} de ${m.total} ${m.total === 1 ? "lección" : "lecciones"}`}
                    </span>
                    <span className={completado ? "text-coder-700" : "text-fiec-700"}>
                      {completado ? "100%" : enCurso ? `${m.total ? Math.round((m.completadas / m.total) * 100) : 0}%` : "0%"}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full ${completado ? "bg-coder-500" : "bg-fiec-600"}`}
                      style={{
                        width: `${m.total ? (m.completadas / m.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {enCurso ? (
                  <Link
                    href={`/modulos/${m.orden}`}
                    className="mt-3 w-full rounded-lg bg-fiec-600 px-3 py-2 text-center text-xs font-bold text-white transition hover:bg-fiec-700"
                  >
                    Seguir aquí →
                  </Link>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
