import Image from "next/image";

export default function Home() {
  return (
    <>
      {/* Navbar de la app. Los destinos todavía no existen: llegan en la fase de navegación. */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-4 px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Image src="/logo-up.png" alt="Universidad de Panamá" width={40} height={40} priority />
            <Image src="/logo-fiec.png" alt="Facultad de Informática, Electrónica y Comunicación" width={44} height={34} priority />
            <div className="hidden leading-none sm:block">
              <div className="text-[17px] font-extrabold tracking-tight text-fiec-700">
                CodeStart <span className="text-fiec-500">FIEC</span>
              </div>
              <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Curso Propedéutico · Programación
              </div>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-3">
            <div className="hidden items-center gap-1 rounded-lg bg-slate-100 p-1 text-xs font-semibold md:flex">
              <span className="rounded-md bg-white px-3 py-1.5 text-fiec-700 shadow-sm">Módulos</span>
              <span className="px-3 py-1.5 text-slate-500">Mis tareas</span>
              <span className="px-3 py-1.5 text-slate-500">Mis medallas</span>
            </div>
            <div className="hidden items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200 sm:flex">
              <span>🔥</span> 5 días
            </div>
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-fiec-600 text-xs font-bold text-white">JR</div>
              <div className="hidden leading-tight sm:block">
                <div className="text-xs font-bold text-slate-700">Julieth Rojas</div>
                <div className="text-[10px] font-medium text-slate-500">Estudiante</div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-8 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-wider text-fiec-600">
          Curso Propedéutico · Verano 2026
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
          Versión alfa en construcción
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Avance 3 · Desarrollo y Programación (parte 1). La navegación, el acceso de usuarios, el
          motor de contenidos y las primeras actividades llegan en las próximas fases.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { t: "Navegación completa", d: "RF02 · RF05 · RF06 · RF13" },
            { t: "Acceso de usuarios", d: "RF01 · RF08 · RLS" },
            { t: "Primeras actividades", d: "RF04 · RF10 · RF11" },
          ].map((c) => (
            <article key={c.t} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-sm font-bold text-slate-900">{c.t}</h2>
              <p className="mono mt-1 text-[11px] text-slate-500">{c.d}</p>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
