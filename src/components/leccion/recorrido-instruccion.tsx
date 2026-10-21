"use client";

import { useState } from "react";

/**
 * El recorrido de una instruccion.
 *
 * Cuatro etapas: lo que escribes, como se traduce, donde se guarda y
 * lo que ves. Es la respuesta a "que pasa cuando ejecuto un programa",
 * que es la pregunta que el visor de anatomia responde linea a linea y
 * este responde de forma general.
 */

export type EtapaRecorrido = {
  titulo: string;
  resumen: string;
  detalle: string;
  analogia?: string;
};

export function RecorridoInstruccion({ etapas }: { etapas: EtapaRecorrido[] }) {
  const [activa, setActiva] = useState<number | null>(null);

  return (
    <section className="my-5">
      <h3 className="text-sm font-extrabold text-slate-900">El recorrido de una instrucción</h3>
      <p className="mt-1 text-[12.5px] text-slate-600">
        Pasa el cursor por cada etapa (o tócala) para ver qué ocurre en ese momento.
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {etapas.map((etapa, i) => {
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
              className={`rounded-2xl border p-4 text-left transition ${
                encendida
                  ? "border-fiec-400 bg-fiec-50 shadow-md"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <span
                className={`grid h-8 w-8 place-items-center rounded-lg text-sm font-extrabold ${
                  encendida ? "bg-fiec-600 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {i + 1}
              </span>
              <span className="mt-2 block text-[13px] font-extrabold text-slate-900">
                {etapa.titulo}
              </span>
              <span className="mt-0.5 block text-[12px] leading-relaxed text-slate-600">
                {etapa.resumen}
              </span>
              {encendida ? (
                <span className="mt-2 block border-t border-fiec-200 pt-2 text-[12px] leading-relaxed text-fiec-900">
                  {etapa.detalle}
                  {etapa.analogia ? (
                    <span className="mt-1 block text-slate-600">
                      <strong className="font-semibold">Analogía:</strong> {etapa.analogia}
                    </span>
                  ) : null}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
