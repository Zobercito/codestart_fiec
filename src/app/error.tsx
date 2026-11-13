"use client";

import { useEffect } from "react";
import Link from "next/link";

/** Frontera de error de la aplicación. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-xs font-bold uppercase tracking-wider text-fiec-600">
        Algo salió mal
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
        No pudimos cargar esta pantalla
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">
        El fallo quedó registrado. Puedes intentarlo otra vez; si persiste,
        vuelve al inicio y avisa al docente.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fiec-500 focus-visible:ring-offset-2"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fiec-500 focus-visible:ring-offset-2"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
