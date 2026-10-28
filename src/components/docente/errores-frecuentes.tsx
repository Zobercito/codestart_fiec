import Link from "next/link";
import { formatearFecha } from "@/lib/fechas";
import type { ErrorFrecuente } from "@/lib/docente/dal";

/**
 * Top de errores frecuentes. Cada uno enlaza al reto y al último
 * estudiante que lo cometió, para que el docente pueda actuar.
 */
export function ErroresFrecuentes({ errores }: { errores: ErrorFrecuente[] }) {
  if (errores.length === 0) {
    return (
      <p className="rounded-xl bg-slate-50 p-4 text-[12.5px] leading-relaxed text-slate-600 ring-1 ring-slate-200">
        Aún no hay errores registrados. Cuando los estudiantes envíen
        intentos, aquí aparecerá el patrón dominante.
      </p>
    );
  }

  return (
    <ol className="space-y-3">
      {errores.map((error, indice) => (
        <li
          key={error.clave}
          className="rounded-xl bg-white p-3.5 ring-1 ring-slate-200"
        >
          <div className="flex items-start gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-fiec-100 text-[11px] font-extrabold text-fiec-800">
              {indice + 1}
            </span>
            <div className="min-w-0">
              <p className="text-[12.5px] font-semibold leading-relaxed text-slate-800">
                {error.error}
              </p>
              <p className="mt-0.5 text-[11.5px] text-slate-600">
                {error.casos} {error.casos === 1 ? "caso" : "casos"} en{" "}
                {error.estudiantes}{" "}
                {error.estudiantes === 1 ? "estudiante" : "estudiantes"} ·{" "}
                {formatearFecha(error.ultimaFecha.slice(0, 10))}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold">
                <Link
                  href={`/retos/${error.retoId}`}
                  className="text-fiec-700 underline decoration-fiec-300 underline-offset-4 hover:text-fiec-800"
                >
                  Abrir el reto
                </Link>
                <Link
                  href={`/docente/estudiante/${error.estudianteId}`}
                  className="text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-900"
                >
                  Ver a {error.estudianteNombre}
                </Link>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
