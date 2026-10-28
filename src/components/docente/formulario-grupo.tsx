"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Campo } from "@/components/ui/campo";
import { crearGrupo, type EstadoAccionDocente } from "@/lib/docente/acciones";

/** Formulario de creación de un grupo (RF12). */
export function FormularioGrupo() {
  const [estado, accion, pendiente] = useActionState<EstadoAccionDocente | null, FormData>(
    crearGrupo,
    null,
  );

  return (
    <form action={accion} className="space-y-4">
      {estado && !estado.ok ? (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-3 text-[12.5px] font-medium text-red-700 ring-1 ring-red-200"
        >
          {estado.error}
        </p>
      ) : null}

      {estado?.ok ? (
        <p className="rounded-xl bg-emerald-50 p-3 text-[12.5px] font-medium text-emerald-800 ring-1 ring-emerald-200">
          {estado.mensaje}{" "}
          {estado.id ? (
            <Link
              href={`/docente/grupo/${estado.id}`}
              className="font-bold underline decoration-emerald-400 underline-offset-4"
            >
              Abrir el grupo
            </Link>
          ) : null}
        </p>
      ) : null}

      <Campo
        etiqueta="Nombre del grupo"
        name="nombre"
        type="text"
        required
        placeholder="Sección 2 · Verano 2026"
        error={estado?.ok === false ? estado.campos?.nombre : undefined}
      />

      <Campo
        etiqueta="Código de inscripción"
        name="codigo"
        type="text"
        placeholder="FIEC-V26-XXXX"
        ayuda="Si lo dejas vacío, se genera uno. Compártelo con tus estudiantes."
        error={estado?.ok === false ? estado.campos?.codigo : undefined}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo
          etiqueta="Inicio del período"
          name="periodo_inicio"
          type="date"
          error={estado?.ok === false ? estado.campos?.periodo_inicio : undefined}
        />
        <Campo
          etiqueta="Fin del período"
          name="periodo_fin"
          type="date"
          error={estado?.ok === false ? estado.campos?.periodo_fin : undefined}
        />
      </div>

      <button
        type="submit"
        disabled={pendiente}
        className="rounded-xl bg-fiec-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-fiec-700 disabled:cursor-wait disabled:opacity-70"
      >
        {pendiente ? "Creando…" : "Crear grupo"}
      </button>
    </form>
  );
}
