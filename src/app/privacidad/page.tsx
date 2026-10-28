import type { Metadata } from "next";
import Link from "next/link";
import { Marca } from "@/components/layout/marca";

export const metadata: Metadata = {
  title: "Aviso de privacidad",
  description:
    "Cómo trata CodeStart FIEC los datos personales de estudiantes y docentes.",
};

/**
 * Aviso de privacidad público (RNF09).
 *
 * Es una página estática: no lee la sesión y puede abrirse sin
 * iniciar sesión.
 */
export default function PaginaPrivacidad() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex justify-center">
          <Marca />
        </div>

        <article className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-wider text-fiec-700">
            CodeStart FIEC
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
            Aviso de privacidad
          </h1>
          <p className="mt-2 text-[12.5px] text-slate-600">
            Última actualización: 29 de octubre de 2026.
          </p>

          <div className="mt-6 space-y-5 text-sm leading-relaxed text-slate-700">
            <section>
              <h2 className="text-base font-extrabold text-slate-900">1. Quién trata tus datos</h2>
              <p className="mt-1">
                La plataforma CodeStart FIEC es un material de apoyo del Curso Propedéutico de la
                Facultad de Informática, Electrónica y Comunicación (FIEC) de la Universidad de
                Panamá. El responsable del tratamiento es el equipo docente del curso.
              </p>
            </section>

            <section>
              <h2 className="text-base font-extrabold text-slate-900">2. Qué datos se recogen</h2>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                <li>Nombre y correo institucional asociados a tu cuenta.</li>
                <li>Tu avance en las lecciones, evaluaciones e insignias.</li>
                <li>Los intentos de los retos, el código que envías y los errores detectados.</li>
                <li>El borrador del código mientras escribes en un reto.</li>
                <li>La fecha en que aceptas este aviso.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-extrabold text-slate-900">3. Para qué se usan</h2>
              <p className="mt-1">
                Para crear y proteger tu cuenta, mostrarte tu progreso, darte retroalimentación,
                permitir que el docente de tu grupo vea tu avance y detecte errores frecuentes, y
                mejorar el material del curso. No se usan para publicidad ni se venden a terceros.
              </p>
            </section>

            <section>
              <h2 className="text-base font-extrabold text-slate-900">4. Base y conservación</h2>
              <p className="mt-1">
                El tratamiento se apoya en tu consentimiento y en la finalidad académica del curso.
                Los datos se conservan durante el período del curso y el tiempo necesario para la
                evaluación. Después se eliminan o se anonimizan, salvo que exista una obligación
                académica o legal de conservarlos.
              </p>
            </section>

            <section>
              <h2 className="text-base font-extrabold text-slate-900">5. Quién puede verlos</h2>
              <p className="mt-1">
                Tú ves tus propios datos. El docente ve los datos de los estudiantes inscritos en
                sus grupos. La administración de la plataforma tiene acceso técnico limitado. Las
                reglas de acceso se aplican en la base de datos (RLS), no solo en la pantalla.
              </p>
            </section>

            <section>
              <h2 className="text-base font-extrabold text-slate-900">6. Tus derechos</h2>
              <p className="mt-1">
                Puedes solicitar acceso, rectificación, supresión u oposición al tratamiento de tus
                datos. Para ejercerlos, contacta al docente del curso o a la coordinación de la
                FIEC. También puedes consultar la Ley 81 de 2019 sobre protección de datos
                personales de la República de Panamá.
              </p>
            </section>

            <section>
              <h2 className="text-base font-extrabold text-slate-900">7. Seguridad</h2>
              <p className="mt-1">
                Las contraseñas las gestiona Supabase Auth y no se guardan en la aplicación. El
                acceso a los datos está restringido por rol y por grupo. Si detectas un problema,
                repórtalo al equipo docente.
              </p>
            </section>
          </div>

          <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-200 pt-5">
            <Link
              href="/"
              className="rounded-xl bg-fiec-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-fiec-700"
            >
              Ir al inicio
            </Link>
            <Link
              href="/login"
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 transition hover:bg-slate-50"
            >
              Iniciar sesión
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
