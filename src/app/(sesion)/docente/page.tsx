import { redirect } from "next/navigation";
import { obtenerMiPerfil } from "@/lib/auth/dal";

/**
 * Panel docente: marcador de posicion del Avance 3.
 *
 * La pantalla completa (grupos, indicadores, seguimiento y errores
 * frecuentes) es el entregable principal del Avance 4. Esta pagina
 * existe para que el enlace del navbar no termine en un 404 en la
 * version alfa y para dejar claro que el rol ya esta protegido.
 *
 * La comprobacion real esta aqui, ademas del proxy: un estudiante no
 * puede entrar aunque escriba la URL.
 */
export const instant = false;

export const metadata = { title: "Panel docente" };

export default async function PaginaDocente() {
  const perfil = await obtenerMiPerfil();
  if (!perfil) redirect("/login");
  if (perfil.rol === "estudiante") redirect("/dashboard");

  return (
    <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-8 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-wider text-fiec-600">
        Avance 4 · en construcción
      </p>
      <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
        Panel docente
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
        Hola, {perfil.nombre.split(" ")[0]}. Esta pantalla todavía no muestra los indicadores del
        grupo: llega en el Avance 4, junto con el seguimiento por estudiante y el análisis de
        errores frecuentes.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-extrabold text-slate-900">Lo que ya funciona</h2>
          <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-slate-600">
            <li>· Los estudiantes ya pueden unirse con el código del grupo.</li>
            <li>· Cada intento se guarda con el error detectado en la base de datos.</li>
            <li>· El acceso por rol está comprobado en el servidor y en el RLS de Postgres.</li>
          </ul>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-extrabold text-slate-900">Lo que llega en el A4</h2>
          <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-slate-600">
            <li>· Indicadores del grupo: cumplimiento, tasa de acierto y atrasados.</li>
            <li>· Seguimiento por asignación y detalle por estudiante.</li>
            <li>· Errores frecuentes por reto y próxima acción sugerida.</li>
            <li>· Asignar módulos o retos con fecha de entrega.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
