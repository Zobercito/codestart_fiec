"use client";

import { useActionState } from "react";
import { entrar } from "@/lib/auth/acciones";
import { Campo } from "@/components/ui/campo";

export function FormularioAcceso() {
  const [estado, accion, pendiente] = useActionState(entrar, null);

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

      <Campo
        etiqueta="Correo institucional"
        name="correo"
        type="email"
        autoComplete="email"
        required
        autoFocus
        placeholder="nombre.apellido@up.ac.pa"
        error={estado?.ok === false ? estado.campos?.correo : undefined}
      />

      <Campo
        etiqueta="Contraseña"
        name="contrasena"
        type="password"
        autoComplete="current-password"
        required
        placeholder="••••••••"
        error={estado?.ok === false ? estado.campos?.contrasena : undefined}
      />

      <button
        type="submit"
        disabled={pendiente}
        className="w-full rounded-xl bg-fiec-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-fiec-600/25 transition hover:bg-fiec-700 disabled:opacity-60"
      >
        {pendiente ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
