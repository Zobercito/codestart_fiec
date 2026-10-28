import type { GrupoDocente } from "@/lib/docente/dal";

/** Selector de grupo del panel. Envía `?grupo=` por GET. */
export function SelectorGrupo({
  grupos,
  actual,
}: {
  grupos: GrupoDocente[];
  actual: string;
}) {
  return (
    <form
      method="get"
      action="/docente"
      className="flex flex-wrap items-end gap-2"
    >
      <div>
        <label
          htmlFor="selector-grupo"
          className="block text-[11px] font-bold uppercase tracking-wider text-slate-600"
        >
          Grupo
        </label>
        <select
          id="selector-grupo"
          name="grupo"
          defaultValue={actual}
          className="mt-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:border-fiec-500 focus:outline-none focus:ring-2 focus:ring-fiec-500/25"
        >
          {grupos.map((grupo) => (
            <option key={grupo.id} value={grupo.id}>
              {grupo.nombre} · {grupo.estudiantes} estudiantes
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
      >
        Ver
      </button>
    </form>
  );
}
