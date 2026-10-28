"use client";

import { useCallback, useState } from "react";
import Link from "next/link";

/**
 * Reto conceptual (seleccion multiple).
 *
 * La correccion la hace el servidor, igual que en los retos de codigo:
 * el navegador manda la eleccion, no el veredicto.
 */

type Opcion = { id: string; texto: string };
type Pista = { nivel: number; texto: string };

export type DatosRetoConceptual = {
  reto: {
    id: string;
    enunciado: string;
    enunciado_detalle: string | null;
    opciones: Opcion[];
    pistas: Pista[];
    puntos: number;
    intentos_maximos: number;
  };
  intentosHechos: number;
  leccion: { titulo: string; orden: number; moduloTitulo: string; moduloOrden: number };
  modoClase?: boolean;
};

export function PantallaRetoConceptual({
  datos,
}: {
  datos: DatosRetoConceptual;
}) {
  const { reto, intentosHechos, leccion, modoClase = false } = datos;

  const [elegida, setElegida] = useState<string | null>(null);
  const [pistasUsadas, setPistasUsadas] = useState(0);
  const [respuesta, setRespuesta] = useState<{
    acierto?: boolean;
    puntos?: number;
    error?: string;
  } | null>(null);
  const [enviando, setEnviando] = useState(false);

  const revelarPista = useCallback(() => {
    const siguiente = Math.min(pistasUsadas + 1, reto.pistas.length);
    setPistasUsadas(siguiente);
    // Las pistas reveladas quedan registradas en el borrador: el
    // descuento por pistas lo aplica el servidor, y no se fia del
    // navegador.
    void fetch(`/api/retos/${reto.id}/borrador`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo: "", pistasUsadas: siguiente }),
    });
  }, [pistasUsadas, reto.id, reto.pistas.length]);

  async function enviar() {
    if (!elegida) return;
    setEnviando(true);
    try {
      const r = await fetch(`/api/retos/${reto.id}/verificar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eleccion: elegida }),
      });
      setRespuesta(await r.json());
    } catch {
      setRespuesta({ error: "No se pudo conectar con el servidor." });
    } finally {
      setEnviando(false);
    }
  }

  const pistasReveladas = reto.pistas.slice(0, pistasUsadas);

  return (
    <main className="mx-auto w-full max-w-[760px] flex-1 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-fiec-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-fiec-700">
          Reto conceptual
        </span>
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
          +{reto.puntos} pts
        </span>
        <span className="ml-auto text-[10px] font-bold text-slate-600">
          Intento {intentosHechos + 1} de {reto.intentos_maximos}
        </span>
      </div>

      <h1 className="mt-3 text-xl font-extrabold tracking-tight text-slate-900">
        {reto.enunciado}
      </h1>
      {modoClase ? (
        <p className="mt-2 rounded-lg bg-up-50 px-3 py-1.5 text-[11px] font-semibold text-up-900 ring-1 ring-up-200">
          Modo clase: pistas y soluciones ocultas.
        </p>
      ) : null}
      {reto.enunciado_detalle ? (
        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{reto.enunciado_detalle}</p>
      ) : null}

      <fieldset className="mt-5 space-y-2.5">
        <legend className="sr-only">{reto.enunciado}</legend>
        {reto.opciones.map((opcion) => {
          const esElegida = elegida === opcion.id;
          return (
            <label
              key={opcion.id}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                esElegida
                  ? "border-fiec-500 bg-fiec-50 ring-1 ring-fiec-500"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="opcion"
                value={opcion.id}
                checked={esElegida}
                onChange={() => setElegida(opcion.id)}
                className="mt-0.5 h-4 w-4 accent-[#0B62A4]"
              />
              <span className="text-[13px] leading-relaxed text-slate-700">{opcion.texto}</span>
            </label>
          );
        })}
      </fieldset>

      {/* Pistas */}
      {!modoClase ? (
        <div className="mt-5 space-y-2">
          {pistasReveladas.map((pista) => (
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
        disabled={!elegida || enviando}
        className="mt-5 rounded-xl bg-fiec-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-fiec-600/25 transition hover:bg-fiec-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 disabled:shadow-none"
      >
        {enviando ? "Comprobando…" : "Comprobar respuesta"}
      </button>

      {respuesta ? (
        <div
          className={`mt-4 rounded-xl p-4 text-[13px] ring-1 ${
            respuesta.acierto
              ? "bg-coder-100 text-coder-700 ring-coder-200"
              : "bg-red-50 text-red-700 ring-red-200"
          }`}
        >
          {respuesta.acierto ? (
            <p className="font-extrabold">✓ Correcto. +{respuesta.puntos} pts</p>
          ) : (
            <p className="font-extrabold">✕ Todavía no. {respuesta.error ?? ""}</p>
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
