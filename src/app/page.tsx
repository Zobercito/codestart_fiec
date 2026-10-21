import Link from "next/link";
import { Marca } from "@/components/layout/marca";

/**
 * Portada. Es lo primero que ve quien abre la direccion de la
 * plataforma: de que se trata y como entrar.
 *
 * No lee la sesion a proposito: asi se puede prerenderizar como
 * pagina estatica. Si el visitante ya tiene sesion, el proxy lo
 * redirige al panel antes de que esta pagina llegue a renderizarse.
 */
export default function Portada() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1240px] items-center px-4 py-2.5 sm:px-6">
          <Marca />
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-fiec-600">
              Curso Propedéutico · FIEC
            </p>
            <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              Aprende a programar entendiendo{" "}
              <span className="text-fiec-600">por qué</span>, no memorizando.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
              CodeStart FIEC es el apoyo en linea del curso propedéutico: lecciones con ejemplos
              explicados linea por linea, una simulacion de la memoria, retos que se corrigen al
              instante y un panel para que tu docente sepa en que reforzar en clase.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="rounded-xl bg-fiec-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-fiec-600/25 transition hover:bg-fiec-700"
              >
                Entrar
              </Link>
              <Link
                href="/registro"
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 transition hover:bg-slate-50"
              >
                Crear cuenta
              </Link>
            </div>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {[
              {
                t: "Anatomía del código",
                d: "Cada línea del programa te explica qué hace y por qué está ahí.",
              },
              {
                t: "Simulador de memoria",
                d: "La memoria como casilleros numerados, con el valor de cada variable.",
              },
              {
                t: "Retos con pistas",
                d: "Si no sale, el sistema te dice qué falta, no solo que está mal.",
              },
              {
                t: "Panel del docente",
                d: "Qué error repite el grupo, para reforzar ese tema en clase.",
              },
            ].map((c) => (
              <li key={c.t} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-sm font-bold text-slate-900">{c.t}</h2>
                <p className="mt-1 text-[12.5px] leading-relaxed text-slate-600">{c.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <footer className="mx-auto w-full max-w-[1240px] px-4 pb-8 text-center text-[11px] leading-relaxed text-slate-500 sm:px-6">
        CodeStart FIEC — Universidad de Panamá, Facultad de Informática, Electrónica y Comunicación.
      </footer>
    </main>
  );
}
