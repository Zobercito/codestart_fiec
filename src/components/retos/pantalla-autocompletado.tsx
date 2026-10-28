"use client";

import { useState } from "react";
import Link from "next/link";
import type {
  BlancoAutocompletado,
  ResultadoAutocompletado,
} from "@/lib/retos/autocompletado";

type Pista = { nivel: number; texto: string };

export type DatosAutocompletado = {
  reto: {
    id: string;
    enunciado: string;
    enunciado_detalle: string | null;
    plantilla: string;
    blancos: BlancoAutocompletado[];
    pistas: Pista[];
    puntos: number;
    intentos_maximos: number;
  };
  intentosHechos: number;
  leccion: {
    titulo: string;
    orden: number;
    moduloTitulo: string;
    moduloOrden: number;
  };
  modoClase?: boolean;
};

type Respuesta = {
  acierto?: boolean;
  puntos?: number;
  error?: string;
  resultado?: ResultadoAutocompletado;
};

/**
 * Reto de autocompletado con selects etiquetados. El cliente manda las
 * opciones elegidas; el servidor compara con la respuesta correcta.
 */
export function PantallaAutocompletado({
  datos,
}: {
  datos: DatosAutocompletado;
}) {
  const { reto, intentosHechos, leccion, modoClase = false } = datos;
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [pistasUsadas, setPistasUsadas] = useState(0);
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);
  const [enviando, setEnviando] = useState(false);

  const completas = reto.blancos.every((blanco) => respuestas[blanco.id]);

  async function revelarPista() {
    const siguiente = Math.min(pistasUsadas + 1, reto.pistas.length);
    setPistasUsadas(siguiente);
    void fetch(`/api/retos/${reto.id}/borrador`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo: "", pistasUsadas: siguiente }),
    });
  }

  async function enviar() {
    setEnviando(true);
    try {
      const r = await fetch(`/api/retos/${reto.id}/verificar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ respuestas }),
      });
      setRespuesta(await r.json());
    } catch {
      setRespuesta({ error: "No se pudo conectar con el servidor." });
    } finally {
      setEnviando(false);
    }
  }

  const acierto = respuesta?.acierto === true;
  const detalle = respuesta?.resultado?.detalle ?? [];

  return (
    <main className="mx-auto w-full max-w-[760px] flex-1 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-fiec-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-fiec-700">
          Reto de autocompletado
        </span>
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
          +{reto.puntos} pts
        </span>
        <span className="ml-auto text-[10px] font-bold text-slate-600">
          Intento {intentosHechos + 1} de {reto.intentos_maximos}
        </span>
      </div>

      {modoClase ? (
        <p className="mt-3 rounded-lg bg-up-50 px-3 py-1.5 text-[11px] font-semibold text-up-900 ring-1 ring-up-200">
          Modo clase: pistas y soluciones ocultas.
        </p>
      ) : null}

      <h1 className="mt-3 text-xl font-extrabold tracking-tight text-slate-900">
        {reto.enunciado}
      </h1>
      {reto.enunciado_detalle ? (
        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
          {reto.enunciado_detalle}
        </p>
      ) : null}

      <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-900 p-4 text-[12.5px] leading-relaxed text-slate-100">
        <code>{reto.plantilla.replace(/\{\{[^}]+\}\}/g, "____")}</code>
      </pre>

      <div className="mt-4 space-y-3">
        {reto.blancos.map((blanco) => {
          const resultado = detalle.find((d) => d.id === blanco.id);
          const clase =
            resultado === undefined
              ? "border-slate-200 bg-white"
              : resultado.correcto
                ? "border-emerald-300 bg-emerald-50"
                : "border-red-200 bg-red-50";
          return (
            <div
              key={blanco.id}
              className={`rounded-xl border p-3 ${clase}`}
            >
              <label
                htmlFor={`blanco-${blanco.id}`}
                className="block text-[12px] font-bold text-slate-800"
              >
                {blanco.etiqueta}
              </label>
              <select
                id={`blanco-${blanco.id}`}
                value={respuestas[blanco.id] ?? ""}
                onChange={(evento) =>
                  setRespuestas((actual) => ({
                    ...actual,
                    [blanco.id]: evento.target.value,
                  }))
                }
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] text-slate-800 focus:border-fiec-500 focus:outline-none focus:ring-2 focus:ring-fiec-500/25"
              >
                <option value="">Elige una opción</option>
                {blanco.opciones.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion}
                  </option>
                ))}
              </select>
              {resultado && !resultado.correcto && !modoClase ? (
                <p className="mt-1 text-[11.5px] font-medium text-red-700">
                  La respuesta correcta es «{resultado.correcta}».{" "}
                  {resultado.explicacion ?? ""}
                </p>
              ) : null}
              {resultado && resultado.correcto ? (
                <p className="mt-1 text-[11.5px] font-medium text-emerald-800">
                  Correcto. {resultado.explicacion ?? ""}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      {!modoClase ? (
        <div className="mt-5 space-y-2">
          {reto.pistas.slice(0, pistasUsadas).map((pista) => (
            <div
              key={pista.nivel}
              className="rounded-xl bg-up-50 p-3 text-[12px] leading-relaxed text-up-900 ring-1 ring-up-200"
            >
              <span className="font-extrabold">Pista {pista.nivel}</span>
              <p className="mt-1">{pista.texto}</p>
            </div>
          ))}
          {pistasUsadas < reto.pistas.length ? (
            <button
              type="button"
              onClick={revelarPista}
              className="rounded-xl border-2 border-dashed border-slate-300 bg-white px-3 py-2.5 text-left text-[12px] font-bold text-slate-700 transition hover:border-up-400 hover:bg-up-50"
            >
              🔒 Pista {pistasUsadas + 1} · Revelar{" "}
              <span className="font-normal text-slate-600">−10 pts</span>
            </button>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={enviar}
        disabled={!completas || enviando}
        className="mt-5 rounded-xl bg-fiec-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-fiec-600/25 transition hover:bg-fiec-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 disabled:shadow-none"
      >
        {enviando ? "Comprobando…" : "Comprobar respuestas"}
      </button>

      {respuesta ? (
        <div
          className={`mt-4 rounded-xl p-4 text-[13px] ring-1 ${
            acierto
              ? "bg-coder-100 text-coder-700 ring-coder-200"
              : "bg-red-50 text-red-700 ring-red-200"
          }`}
        >
          {acierto ? (
            <p className="font-extrabold">✓ Todo correcto. +{respuesta.puntos} pts</p>
          ) : (
            <p className="font-extrabold">
              ✕ {respuesta.resultado?.mensaje ?? respuesta.error ?? "Revisa las respuestas."}
            </p>
          )}
        </div>
      ) : null}

      <Link
        href={`/modulos/${leccion.moduloOrden}/lecciones/${leccion.orden}`}
        className="mt-6 inline-block text-[12.5px] font-bold text-fiec-700 underline decoration-fiec-300 underline-offset-4"
      >
        ← Volver a la lección
      </Link>
    </main>
  );
}
