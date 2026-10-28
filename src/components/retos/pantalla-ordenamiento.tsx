"use client";

import { useState } from "react";
import Link from "next/link";
import type {
  ElementoOrdenamiento,
  ResultadoOrdenamiento,
} from "@/lib/retos/ordenamiento";

type Pista = { nivel: number; texto: string };

export type DatosOrdenamiento = {
  reto: {
    id: string;
    enunciado: string;
    enunciado_detalle: string | null;
    elementos: ElementoOrdenamiento[];
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
  resultado?: ResultadoOrdenamiento;
};

/**
 * Reto de ordenamiento accesible: los botones «Subir» y «Bajar» son el
 * equivalente de teclado y de toque del arrastre. El servidor corrige.
 */
export function PantallaOrdenamiento({
  datos,
}: {
  datos: DatosOrdenamiento;
}) {
  const { reto, intentosHechos, leccion, modoClase = false } = datos;
  const [orden, setOrden] = useState(reto.elementos);
  const [pistasUsadas, setPistasUsadas] = useState(0);
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);
  const [enviando, setEnviando] = useState(false);

  function mover(indice: number, delta: number) {
    const destino = indice + delta;
    if (destino < 0 || destino >= orden.length) return;
    setOrden((actual) => {
      const copia = [...actual];
      [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
      return copia;
    });
  }

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
        body: JSON.stringify({ orden: orden.map((elemento) => elemento.id) }),
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
          Reto de ordenamiento
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

      <ol className="mt-5 space-y-2" aria-label="Pasos para ordenar">
        {orden.map((elemento, indice) => {
          const posicion = detalle.find((d) => d.posicion === indice + 1);
          const clase =
            posicion === undefined
              ? "border-slate-200 bg-white"
              : posicion.correcto
                ? "border-emerald-300 bg-emerald-50"
                : "border-red-200 bg-red-50";
          return (
            <li
              key={elemento.id}
              className={`flex items-center gap-3 rounded-xl border p-3 ${clase}`}
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100 text-[11px] font-extrabold text-slate-700">
                {indice + 1}
              </span>
              <span className="min-w-0 flex-1 text-[13px] leading-relaxed text-slate-800">
                {elemento.texto}
              </span>
              <span className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => mover(indice, -1)}
                  disabled={indice === 0}
                  aria-label={`Subir «${elemento.texto}»`}
                  className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                >
                  ↑ Subir
                </button>
                <button
                  type="button"
                  onClick={() => mover(indice, 1)}
                  disabled={indice === orden.length - 1}
                  aria-label={`Bajar «${elemento.texto}»`}
                  className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                >
                  ↓ Bajar
                </button>
              </span>
            </li>
          );
        })}
      </ol>

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
        disabled={enviando}
        className="mt-5 rounded-xl bg-fiec-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-fiec-600/25 transition hover:bg-fiec-700 disabled:cursor-wait disabled:opacity-60"
      >
        {enviando ? "Comprobando…" : "Comprobar orden"}
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
            <p className="font-extrabold">✓ Orden correcto. +{respuesta.puntos} pts</p>
          ) : (
            <p className="font-extrabold">
              ✕ {respuesta.resultado?.mensaje ?? respuesta.error ?? "Revisa el orden."}
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
