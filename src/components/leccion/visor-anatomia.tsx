"use client";

import { useState } from "react";
import { CLASES_TOKEN, trocear } from "@/lib/codigo/resaltar";

/**
 * Visor de anatomia de un programa.
 *
 * Es el componente central de la leccion: responde a la pregunta de
 * fondo del proyecto, por que el codigo es como es. Cada linea se
 * explica al pasar el cursor, al enfocarla con el teclado o al tocarla
 * en una tableta.
 *
 * El resaltado de la lista es propio y sencillo: el subconjunto de C
 * del propedeutico no necesita mas.
 */

export type LineaAnatomia = {
  codigo: string;
  titulo: string;
  explicacion: string;
};

export function VisorAnatomia({
  archivo,
  lineas,
}: {
  archivo: string;
  lineas: LineaAnatomia[];
}) {
  const [activa, setActiva] = useState<number | null>(null);

  return (
    <section className="my-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-extrabold text-slate-900">Anatomía de un programa</h3>
        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-600">
          {archivo}
        </span>
      </div>
      <p className="mt-1 text-[12.5px] text-slate-600">
        Pasa el cursor sobre cada línea (o tócala, si estás en una tableta) para descubrir qué hace y
        por qué está ahí.
      </p>

      {/* Código */}
      <div className="mono mt-3 overflow-x-auto rounded-xl bg-slate-900 py-3 text-[12.5px] leading-[1.7] ring-1 ring-slate-800 thin-scroll">
        {lineas.map((linea, i) => {
          const encendida = activa === i;
          return (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setActiva(i)}
              onMouseLeave={() => setActiva(null)}
              onFocus={() => setActiva(i)}
              onBlur={() => setActiva(null)}
              onClick={() => setActiva(encendida ? null : i)}
              aria-pressed={encendida}
              className={`flex w-full items-baseline gap-3 px-3 py-px text-left transition-colors ${
                encendida ? "bg-amber-100 shadow-[inset_3px_0_0_#F5B014]" : ""
              }`}
            >
              <span className="w-5 shrink-0 select-none text-right text-slate-500">
                {i + 1}
              </span>
              <span className="whitespace-pre">
                {trocear(linea.codigo).map((t, j) => (
                  <span key={j} className={CLASES_TOKEN[t.tipo]}>
                    {t.texto}
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>

      {/* Explicaciones */}
      <ul className="mt-4 list-none space-y-2.5">
        {lineas.map((linea, i) => {
          const encendida = activa === i;
          return (
            <li key={i}>
              <button
                type="button"
                onMouseEnter={() => setActiva(i)}
                onMouseLeave={() => setActiva(null)}
                onFocus={() => setActiva(i)}
                onBlur={() => setActiva(null)}
                onClick={() => setActiva(encendida ? null : i)}
                className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
                  encendida
                    ? "border-up-300 bg-up-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[11px] font-extrabold ${
                    encendida ? "bg-fiec-600 text-white" : "bg-fiec-100 text-fiec-700"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-bold text-slate-900">{linea.titulo}</span>
                    <code className="mono rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-700">
                      {linea.codigo.trim()}
                    </code>
                  </span>
                  <span className="mt-1 block text-[12.5px] leading-relaxed text-slate-600">
                    {linea.explicacion}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
