"use client";

import { useActionState } from "react";
import { Campo } from "@/components/ui/campo";
import { unirseAGrupo, type EstadoUnirse } from "@/lib/grupos/acciones";

/** Formulario para que un estudiante se una a un grupo con el código. */
export function FormularioUnirse() {
  const [estado, accion, pendiente] = useActionState<EstadoUnirse | null, FormData>(
    unirseAGrupo,
    null,
  );

  return (
    <form action={accion} className="space-y-3">
      {estado && !estado.ok ? (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-3 text-[12px] font-medium text-red-700 ring-1 ring-red-200"
        >
          {estado.error}
        </p>
      ) : null}

      {estado?.ok ? (
        <p className="rounded-xl bg-emerald-50 p-3 text-[12px] font-medium text-emerald-800 ring-1 ring-emerald-200">
          {estado.mensaje}
        </p>
      ) : null}

      <Campo
        etiqueta="Código del grupo"
        name="codigo"
        type="text"
        required
        placeholder="FIEC-V26-8QK4"
        error={estado?.ok === false ? estado.campos?.codigo : undefined}
      />

      <button
        type="submit"
        disabled={pendiente}
        className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-70"
      >
        {pendiente ? "Uniéndome…" : "Unirme al grupo"}
      </button>
    </form>
  );
}
