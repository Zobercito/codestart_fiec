"use client";

import { useState } from "react";

/** Copia un código al portapapeles y confirma la acción. */
export function BotonCopiar({ codigo }: { codigo: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copiar}
      className="rounded-lg bg-slate-900 px-2.5 py-1.5 text-[10.5px] font-bold text-white transition hover:bg-slate-800"
    >
      {copiado ? "Copiado" : "Copiar código"}
    </button>
  );
}
