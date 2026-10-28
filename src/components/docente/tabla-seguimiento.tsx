import Link from "next/link";
import type { EstadoSeguimiento, FilaSeguimiento } from "@/lib/docente/dal";

const ESTADOS: Record<
  EstadoSeguimiento,
  { texto: string; clases: string }
> = {
  al_dia: {
    texto: "Al día",
    clases: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  },
  en_riesgo: {
    texto: "En riesgo",
    clases: "bg-amber-50 text-amber-900 ring-amber-200",
  },
  atrasado: {
    texto: "Atrasado",
    clases: "bg-red-50 text-red-800 ring-red-200",
  },
  sin_actividad: {
    texto: "Sin actividad",
    clases: "bg-slate-100 text-slate-700 ring-slate-200",
  },
};

/** Tabla de seguimiento: una fila por estudiante del grupo. */
export function TablaSeguimiento({ filas }: { filas: FilaSeguimiento[] }) {
  if (filas.length === 0) {
    return (
      <p className="rounded-xl bg-slate-50 p-4 text-[12.5px] text-slate-600 ring-1 ring-slate-200">
        Este grupo todavía no tiene estudiantes inscritos. Comparte el código
        de inscripción.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-200">
      <table className="min-w-full divide-y divide-slate-200 bg-white text-left text-[12px]">
        <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-600">
          <tr>
            <th scope="col" className="px-3 py-2.5">Estudiante</th>
            <th scope="col" className="px-3 py-2.5">Estado</th>
            <th scope="col" className="px-3 py-2.5">Avance</th>
            <th scope="col" className="px-3 py-2.5">Módulo actual</th>
            <th scope="col" className="px-3 py-2.5">Último reto</th>
            <th scope="col" className="px-3 py-2.5 text-right">Intentos</th>
            <th scope="col" className="px-3 py-2.5 text-right">Acierto</th>
            <th scope="col" className="px-3 py-2.5 text-right">Medallas</th>
            <th scope="col" className="px-3 py-2.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filas.map((fila) => {
            const estado = ESTADOS[fila.estado];
            return (
              <tr key={fila.id} className="align-top">
                <td className="px-3 py-3">
                  <div className="font-semibold text-slate-900">{fila.nombre}</div>
                  <div className="text-[10.5px] text-slate-600">{fila.correo}</div>
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${estado.clases}`}
                  >
                    {estado.texto}
                  </span>
                </td>
                <td className="min-w-[110px] px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-fiec-600"
                        style={{ width: `${fila.avance}%` }}
                      />
                    </div>
                    <span className="font-bold text-slate-800">{fila.avance} %</span>
                  </div>
                  <div className="mt-0.5 text-[10.5px] text-slate-600">
                    {fila.completadas} de {fila.totalLecciones} lecciones
                  </div>
                </td>
                <td className="max-w-[190px] px-3 py-3 text-slate-700">
                  {fila.moduloActual ?? "Curso completo"}
                </td>
                <td className="max-w-[190px] px-3 py-3">
                  <div className="text-slate-700">{fila.ultimoReto ?? "Sin intentos"}</div>
                  {fila.ultimoIntentoFecha ? (
                    <div className="text-[10.5px] text-slate-600">
                      {fila.ultimoIntentoFecha.slice(0, 10)}
                    </div>
                  ) : null}
                </td>
                <td className="px-3 py-3 text-right font-semibold text-slate-800">
                  {fila.intentos}
                </td>
                <td className="px-3 py-3 text-right font-semibold text-slate-800">
                  {fila.acierto === null ? "—" : `${fila.acierto} %`}
                </td>
                <td className="px-3 py-3 text-right font-semibold text-slate-800">
                  {fila.insignias}
                </td>
                <td className="px-3 py-3 text-right">
                  <Link
                    href={`/docente/estudiante/${fila.id}`}
                    className="whitespace-nowrap text-[11.5px] font-bold text-fiec-700 underline decoration-fiec-300 underline-offset-4 hover:text-fiec-800"
                  >
                    Ver detalle
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
