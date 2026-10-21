"use client";

import { useState } from "react";

/**
 * Simulador de memoria.
 *
 * La memoria como casilleros numerados, con el valor que tiene cada
 * variable en este momento. Es la respuesta directa a "no entiendo que
 * es una variable": el nombre es la etiqueta del casillero y el valor
 * es lo que hay dentro.
 *
 * Se avanza linea a linea, para que el estudiante pueda predecir el
 * resultado antes de continuar.
 */

export type CasilleroMemoria = {
  indice: number;
  nombre: string;
  tipo: "int" | "float" | "double" | "char" | "bool";
  valor: string;
  /** Texto de la linea de codigo que se ejecuta en este paso. */
  paso: string;
};

export function SimuladorMemoria({
  inicial,
  pasos,
}: {
  inicial: CasilleroMemoria[];
  pasos: CasilleroMemoria[][];
}) {
  const [paso, setPaso] = useState(0);

  const estado = paso === 0 ? inicial : pasos[paso - 1];
  const total = pasos.length;

  return (
    <section className="my-5">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-extrabold text-slate-900">Simulador de memoria</h3>
        <span className="rounded-md bg-coder-100 px-2 py-0.5 text-[10px] font-extrabold text-coder-700">
          Interactivo
        </span>
      </div>
      <p className="mt-1 text-[12.5px] text-slate-600">
        La memoria como casilleros numerados. Avanza una instrucción cada vez y mira cómo cambia el
        valor de cada variable.
      </p>

      {/* Estado actual */}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-slate-50 p-3 text-[12.5px] text-slate-600 ring-1 ring-slate-200">
        <span>Estado actual:</span>
        {estado.length === 0 ? (
          <span className="font-mono text-slate-500">memoria vacía</span>
        ) : (
          estado.map((c) => (
            <span key={c.indice} className="font-mono">
              {c.nombre} ={" "}
              <span className="font-bold text-slate-800">{c.valor}</span>
            </span>
          ))
        )}
      </div>

      {/* Casilleros */}
      <div className="mt-3 grid gap-3 sm:grid-cols-4">
        {estado.length === 0 ? (
          <p className="text-[12.5px] text-slate-500 sm:col-span-4">
            Todavía no hay variables en memoria. Ejecuta la primera instrucción.
          </p>
        ) : (
          estado.map((c) => (
            <div
              key={c.indice}
              className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-3 text-center"
            >
              <div className="text-[11px] font-semibold text-slate-400">{c.indice}</div>
              <div className="mt-1 font-mono text-[15px] font-extrabold text-slate-900">
                {c.valor}
              </div>
              <div className="mt-0.5 font-mono text-[11px] text-fiec-700">{c.nombre}</div>
              <div className="text-[10px] text-slate-500">{c.tipo}</div>
            </div>
          ))
        )}
      </div>

      {/* Controles */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setPaso((p) => Math.min(p + 1, total))}
          disabled={paso >= total}
          className="rounded-lg bg-slate-900 px-3.5 py-2 text-[12.5px] font-bold text-white transition hover:bg-slate-800 disabled:opacity-40"
        >
          ▶ Ejecutar línea
        </button>
        <button
          type="button"
          onClick={() => setPaso(0)}
          disabled={paso === 0}
          className="rounded-lg bg-white px-3.5 py-2 text-[12.5px] font-bold text-slate-700 ring-1 ring-slate-300 transition hover:bg-slate-50 disabled:opacity-40"
        >
          ↺ Reiniciar
        </button>

        <span className="text-[12px] text-slate-500">
          Paso {paso} de {total}
        </span>
      </div>

      {/* La linea que se esta ejecutando */}
      {paso > 0 && pasos[paso - 1].length > 0 ? (
        <div className="mono mt-3 overflow-x-auto rounded-xl bg-slate-900 px-3.5 py-2.5 text-[12px] text-slate-300 ring-1 ring-slate-800">
          <span className="text-slate-500">$</span> {pasos[paso - 1][0].paso}
        </div>
      ) : null}
    </section>
  );
}
