"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registrarse } from "@/lib/auth/acciones";
import { Campo } from "@/components/ui/campo";

export function FormularioRegistro() {
  const [estado, accion, pendiente] = useActionState(registrarse, null);

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
        etiqueta="Nombre completo"
        name="nombre"
        type="text"
        autoComplete="name"
        required
        autoFocus
        placeholder="Julieth Rojas"
        error={estado?.ok === false ? estado.campos?.nombre : undefined}
      />

      <Campo
        etiqueta="Correo institucional"
        name="correo"
        type="email"
        autoComplete="email"
        required
        placeholder="nombre.apellido@up.ac.pa"
        ayuda="Usa el correo que te dio la universidad."
        error={estado?.ok === false ? estado.campos?.correo : undefined}
      />

      <Campo
        etiqueta="Contraseña"
        name="contrasena"
        type="password"
        autoComplete="new-password"
        required
        placeholder="Mínimo 8 caracteres"
        error={estado?.ok === false ? estado.campos?.contrasena : undefined}
      />

      <button
        type="submit"
        disabled={pendiente}
        className="w-full rounded-xl bg-fiec-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-fiec-600/25 transition hover:bg-fiec-700 disabled:opacity-60"
      >
        {pendiente ? "Creando cuenta…" : "Crear cuenta"}
      </button>

      <p className="text-center text-[12.5px] text-slate-600">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-fiec-700 underline decoration-fiec-300 underline-offset-4">
          Entra
        </Link>
      </p>
    </form>
  );
}
