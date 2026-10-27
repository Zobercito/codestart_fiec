import Link from "next/link";
import { Marca } from "@/components/layout/marca";
import { salir } from "@/lib/auth/acciones";
import type { Perfil } from "@/lib/auth/dal";

/**
 * Navbar de la aplicacion. Es la del mockup del Avance 2, con el
 * nombre del usuario y la racha en lugar de los datos de ejemplo.
 */
export function Navbar({ perfil }: { perfil: Perfil }) {
  const iniciales = perfil.nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-4 px-4 py-2.5 sm:px-6">
        <Marca compacta />

        <div className="ml-auto flex items-center gap-1 sm:gap-3">
          <div className="hidden items-center gap-1 rounded-lg bg-slate-100 p-1 text-xs font-semibold md:flex">
            <Link
              href="/modulos"
              className="rounded-md bg-white px-3 py-1.5 text-fiec-700 shadow-sm transition hover:text-fiec-800"
            >
              Módulos
            </Link>
            <Link
              href="/dashboard#tareas"
              className="rounded-md px-3 py-1.5 text-slate-600 transition hover:bg-white hover:text-slate-800"
            >
              Mis tareas
            </Link>
          </div>

          {perfil.rol !== "estudiante" ? (
            <Link
              href="/docente"
              className="rounded-lg bg-up-500 px-3 py-1.5 text-xs font-bold text-slate-900 transition hover:bg-up-400"
            >
              Panel docente
            </Link>
          ) : null}

          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-fiec-600 text-xs font-bold text-white">
              {iniciales}
            </div>
            <div className="hidden leading-tight sm:block">
              <div className="text-xs font-bold text-slate-700">{perfil.nombre}</div>
              <div className="text-[10px] font-medium text-slate-600 capitalize">{perfil.rol}</div>
            </div>
            <form action={salir}>
              <button
                type="submit"
                className="rounded-lg px-2 py-1.5 text-[11px] font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-700"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
}
