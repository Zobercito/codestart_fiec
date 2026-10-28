"use client";

import { useState } from "react";
import Link from "next/link";
import type {
  PreguntaPublica,
  ReglasEvaluacion,
} from "@/lib/evaluacion/tipos";
import type { ResultadoEvaluacion } from "@/lib/evaluacion/calcular";

export type DatosEvaluacion = {
  evaluacion: {
    id: string;
    titulo: string;
    descripcion: string | null;
    modo: ReglasEvaluacion["modo"];
    modulo: number | null;
    moduloTitulo: string | null;
    umbral: number;
    puntos: number;
    intentosMaximos: number;
    preguntas: PreguntaPublica[];
  };
  intentosHechos: number;
  modoClase?: boolean;
};

type Respuesta = {
  acierto?: boolean;
  puntos?: number;
  error?: string;
  evaluacion?: ResultadoEvaluacion;
};

/**
 * Evaluación de módulo o final. Las preguntas llegan sin la respuesta
 * correcta; el servidor califica y devuelve el detalle. En modo clase
 * se ocultan las soluciones para poder proyectar la pantalla.
 */
export function PantallaEvaluacion({
  datos,
}: {
  datos: DatosEvaluacion;
}) {
  const { evaluacion, intentosHechos, modoClase = false } = datos;
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);
  const [enviando, setEnviando] = useState(false);

  const total = evaluacion.preguntas.length;
  const respondidas = evaluacion.preguntas.filter(
    (pregunta) => respuestas[pregunta.id],
  ).length;
  const completas = respondidas === total;

  async function enviar() {
    setEnviando(true);
    try {
      const r = await fetch(`/api/retos/${evaluacion.id}/verificar`, {
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

  const resultado = respuesta?.evaluacion;
  const aprobado = resultado?.aprobado === true;

  return (
    <main className="mx-auto w-full max-w-[820px] flex-1 px-4 py-8 sm:px-6">
      {modoClase ? (
        <div className="mb-4 rounded-xl bg-up-50 p-3 text-[12px] font-semibold text-up-900 ring-1 ring-up-200">
          Modo clase: las respuestas correctas y las explicaciones están
          ocultas. Puedes proyectar esta pantalla sin revelar la solución.
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-fiec-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-fiec-700">
          {evaluacion.modo === "final" ? "Evaluación final" : "Autoevaluación"}
        </span>
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
          {evaluacion.preguntas.length} preguntas · {evaluacion.umbral} % para
          aprobar
        </span>
        <span className="ml-auto text-[10px] font-bold text-slate-600">
          Intento {intentosHechos + 1}
        </span>
      </div>

      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">
        {evaluacion.titulo}
      </h1>
      {evaluacion.descripcion ? (
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-slate-600">
          {evaluacion.descripcion}
        </p>
      ) : null}

      {!resultado ? (
        <>
          <div className="mt-5 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
              <span>Progreso</span>
              <span>
                {respondidas} de {total}
              </span>
            </div>
            <div
              className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={respondidas}
              aria-label="Preguntas respondidas"
            >
              <div
                className="h-full rounded-full bg-fiec-500 transition-all"
                style={{ width: `${total ? (respondidas / total) * 100 : 0}%` }}
              />
            </div>
          </div>

          <ol className="mt-5 space-y-4">
            {evaluacion.preguntas.map((pregunta, indice) => (
              <li key={pregunta.id}>
                <fieldset className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                  <legend className="px-1 text-[10px] font-extrabold uppercase tracking-wider text-fiec-700">
                    {pregunta.area} · pregunta {indice + 1}
                  </legend>
                  <p className="text-[13.5px] font-bold leading-relaxed text-slate-900">
                    {pregunta.enunciado}
                  </p>
                  <div className="mt-3 space-y-2">
                    {pregunta.opciones.map((opcion) => (
                      <label
                        key={opcion.id}
                        className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-2.5 text-[12.5px] transition ${
                          respuestas[pregunta.id] === opcion.id
                            ? "border-fiec-400 bg-fiec-50 text-fiec-900"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name={pregunta.id}
                          value={opcion.id}
                          checked={respuestas[pregunta.id] === opcion.id}
                          onChange={() =>
                            setRespuestas((actual) => ({
                              ...actual,
                              [pregunta.id]: opcion.id,
                            }))
                          }
                          className="mt-0.5 h-4 w-4 accent-fiec-600"
                        />
                        <span>{opcion.texto}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </li>
            ))}
          </ol>

          {!modoClase ? (
            <>
              <button
                type="button"
                onClick={enviar}
                disabled={!completas || enviando}
                className="mt-5 rounded-xl bg-fiec-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-fiec-600/25 transition hover:bg-fiec-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 disabled:shadow-none"
              >
                {enviando ? "Calificando…" : "Entregar evaluación"}
              </button>
              {!completas ? (
                <p className="mt-2 text-[11.5px] font-medium text-slate-600">
                  Responde todas las preguntas para entregar.
                </p>
              ) : null}
            </>
          ) : (
            <p className="mt-5 text-[11.5px] font-medium text-slate-600">
              En modo clase no se entregan intentos.
            </p>
          )}
        </>
      ) : (
        <section
          className={`mt-5 rounded-2xl p-5 ring-1 ${
            aprobado
              ? "bg-coder-100 text-coder-700 ring-coder-200"
              : "bg-red-50 text-red-700 ring-red-200"
          }`}
          aria-live="polite"
        >
          <p className="text-3xl font-extrabold">
            {resultado.porcentaje} %
          </p>
          <p className="mt-1 text-sm font-bold">{resultado.mensaje}</p>
          <p className="mt-0.5 text-[12px]">
            {resultado.puntaje} de {resultado.total} respuestas correctas ·{" "}
            {aprobado ? "aprobada" : "no aprobada"}
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {resultado.areas.map((area) => (
              <div
                key={area.area}
                className="rounded-xl bg-white/70 p-3 text-[12px] ring-1 ring-black/5"
              >
                <div className="flex items-center justify-between font-bold">
                  <span>{area.area}</span>
                  <span>{area.porcentaje} %</span>
                </div>
                <div className="mt-1 text-[11px]">
                  {area.correctas} de {area.total} correctas
                </div>
              </div>
            ))}
          </div>

          {!modoClase ? (
            <div className="mt-4 space-y-2">
              {resultado.detalle.map((fila) => (
                <details
                  key={fila.id}
                  className="rounded-xl bg-white/70 p-3 text-[12px] text-slate-800 ring-1 ring-black/5"
                >
                  <summary className="cursor-pointer font-bold">
                    {fila.acierto ? "✓" : "✕"} {fila.enunciado}
                  </summary>
                  <p className="mt-1">
                    Tu respuesta:{" "}
                    <strong>
                      {fila.elegidaTexto
                        ? fila.elegidaTexto
                        : "sin responder"}
                    </strong>
                    . Correcta: <strong>{fila.correctaTexto}</strong>.
                  </p>
                  {fila.explicacion ? (
                    <p className="mt-1 text-slate-700">{fila.explicacion}</p>
                  ) : null}
                </details>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-[12px] font-semibold">
              El detalle de respuestas está oculto en modo clase.
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl bg-slate-900 px-4 py-2 text-[12px] font-bold text-white transition hover:bg-slate-800"
            >
              Intentar de nuevo
            </button>
            {evaluacion.modulo ? (
              <Link
                href={`/modulos/${evaluacion.modulo}`}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-[12px] font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Volver al módulo {evaluacion.modulo}
              </Link>
            ) : (
              <Link
                href="/modulos"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-[12px] font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Volver a los módulos
              </Link>
            )}
          </div>
        </section>
      )}

      {respuesta?.error && !resultado ? (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-red-50 p-3 text-[12.5px] font-medium text-red-700 ring-1 ring-red-200"
        >
          {respuesta.error}
        </p>
      ) : null}
    </main>
  );
}
