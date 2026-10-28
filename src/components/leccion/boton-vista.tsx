"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { marcarLeccionVista } from "@/lib/progreso/acciones";

/**
 * Cierra la lección de forma explícita.
 *
 * El progreso lo escribe el servidor; el botón solo dispara la acción
 * y navega al siguiente destino. Si la acción falla, se muestra el
 * error y no se navega.
 */
export function BotonVista({
  leccionId,
  destino,
  completado,
  className = "",
}: {
  leccionId: string;
  destino: string;
  completado: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [pendiente, setPendiente] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function alPulsar() {
    setPendiente(true);
    setError(null);

    const resultado = await marcarLeccionVista(leccionId);
    if (!resultado.ok) {
      setError(resultado.error);
      setPendiente(false);
      return;
    }

    router.push(destino);
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={alPulsar}
        disabled={pendiente}
        className="w-full rounded-xl bg-fiec-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-fiec-600/25 transition hover:bg-fiec-700 disabled:cursor-wait disabled:opacity-70"
      >
        {pendiente
          ? "Guardando…"
          : completado
            ? "Continuar →"
            : "Marcar como vista y continuar →"}
      </button>

      {error ? (
        <p
          role="alert"
          className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-[12px] font-medium text-red-700 ring-1 ring-red-200"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
