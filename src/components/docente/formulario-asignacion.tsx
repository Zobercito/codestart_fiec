"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Campo } from "@/components/ui/campo";
import {
  crearAsignacion,
  type EstadoAccionDocente,
} from "@/lib/docente/acciones";
import type { GrupoDocente, OpcionesAsignacion } from "@/lib/docente/dal";

export function FormularioAsignacion({
  grupos,
  opciones,
  hoy,
}: {
  grupos: GrupoDocente[];
  opciones: OpcionesAsignacion;
  hoy: string;
}) {
  const [estado, accion, pendiente] = useActionState<
    EstadoAccionDocente | null,
    FormData
  >(crearAsignacion, null);

  if (grupos.length === 0) {
    return (
      <p className="rounded-xl bg-amber-50 p-4 text-[12.5px] leading-relaxed text-amber-900 ring-1 ring-amber-200">
        Primero necesitas un grupo.{" "}
        <Link
          href="/docente/grupos"
          className="font-bold underline decoration-amber-400 underline-offset-4"
        >
          Crear un grupo
        </Link>
        .
      </p>
    );
  }

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
          <Link
            href="/docente"
            className="font-bold underline decoration-emerald-400 underline-offset-4"
          >
            Volver al panel
          </Link>
        </p>
      ) : null}

      <div>
        <label
          htmlFor="asignacion-grupo"
          className="block text-[12.5px] font-semibold text-slate-700"
        >
          Grupo
        </label>
        <select
          id="asignacion-grupo"
          name="grupo_id"
          required
          className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-fiec-500 focus:outline-none focus:ring-2 focus:ring-fiec-500/25"
        >
          {grupos.map((grupo) => (
            <option key={grupo.id} value={grupo.id}>
              {grupo.nombre} · {grupo.estudiantes} estudiantes
            </option>
          ))}
        </select>
        {estado?.ok === false && estado.campos?.grupo_id ? (
          <p className="mt-1.5 text-[12px] font-medium text-red-700">
            {estado.campos.grupo_id}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="asignacion-destino"
          className="block text-[12.5px] font-semibold text-slate-700"
        >
          Módulo o reto
        </label>
        <select
          id="asignacion-destino"
          name="destino"
          required
          defaultValue={`modulo:${opciones.modulos[0]?.id ?? ""}`}
          className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-fiec-500 focus:outline-none focus:ring-2 focus:ring-fiec-500/25"
        >
          <optgroup label="Módulos">
            {opciones.modulos.map((modulo) => (
              <option key={modulo.id} value={`modulo:${modulo.id}`}>
                Módulo {modulo.orden}: {modulo.titulo}
              </option>
            ))}
          </optgroup>
          <optgroup label="Retos">
            {opciones.retos.map((reto) => (
              <option key={reto.id} value={`reto:${reto.id}`}>
                {reto.enunciado} ({reto.modulo})
              </option>
            ))}
          </optgroup>
        </select>
        {estado?.ok === false && estado.campos?.destino ? (
          <p className="mt-1.5 text-[12px] font-medium text-red-700">
            {estado.campos.destino}
          </p>
        ) : null}
      </div>

      <Campo
        etiqueta="Fecha de entrega"
        name="fecha_entrega"
        type="date"
        required
        min={hoy}
        error={estado?.ok === false ? estado.campos?.fecha_entrega : undefined}
      />

      <div>
        <label
          htmlFor="asignacion-descripcion"
          className="block text-[12.5px] font-semibold text-slate-700"
        >
          Descripción (opcional)
        </label>
        <textarea
          id="asignacion-descripcion"
          name="descripcion"
          rows={3}
          maxLength={280}
          placeholder="Qué deben entregar y para qué"
          className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-fiec-500 focus:outline-none focus:ring-2 focus:ring-fiec-500/25"
        />
      </div>

      <button
        type="submit"
        disabled={pendiente}
        className="rounded-xl bg-fiec-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-fiec-700 disabled:cursor-wait disabled:opacity-70"
      >
        {pendiente ? "Asignando…" : "Crear asignación"}
      </button>
    </form>
  );
}
