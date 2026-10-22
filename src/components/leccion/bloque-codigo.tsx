"use client";

import { CLASES_TOKEN, trocear } from "@/lib/codigo/resaltar";

/**
 * Bloque de codigo con resaltado.
 *
 * Aparece en el markdown normal (```c). El visor de anatomia es el
 * que explica linea a linea; este solo colorea.
 */
export function BloqueCodigo({
  codigo,
  lenguaje = "c",
}: {
  codigo: string;
  lenguaje?: string;
}) {
  const lineas = codigo.replace(/\n$/, "").split("\n");

  return (
    <div className="my-4 overflow-hidden rounded-xl bg-slate-900 ring-1 ring-slate-800">
      <div className="flex items-center gap-2 border-b border-slate-800 px-3.5 py-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {lenguaje}
        </span>
      </div>
      <pre className="mono overflow-x-auto px-3.5 py-3 text-[12.5px] leading-[1.7] thin-scroll">
        <code>
          {lineas.map((linea, i) => (
            <span key={i} className="block">
              {trocear(linea).map((t, j) => (
                <span key={j} className={CLASES_TOKEN[t.tipo]}>
                  {t.texto}
                </span>
              ))}
              {i < lineas.length - 1 ? "\n" : ""}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
