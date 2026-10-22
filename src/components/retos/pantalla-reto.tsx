"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EditorCodigo } from "@/components/retos/editor-codigo";
import type { ResultadoAnalisis } from "@/lib/validacion/tipos";

/**
 * La pantalla del reto: la pantalla C del mockup del Avance 2.
 *
 * El estudiante escribe el codigo, lo verifica, y ve que le pasa. Lo
 * que decide si el codigo es correcto lo calcula el servidor
 * (POST /api/retos/[id]/verificar), nunca el navegador: el cliente
 * manda el codigo, pero las reglas y los casos salen de la base de
 * datos.
 */

type Pista = { nivel: number; texto: string };
type Caso = {
  nombre: string;
  entrada: Record<string, number | string>;
  salida_esperada: string;
};

export type DatosReto = {
  reto: {
    id: string;
    tipo: string;
    enunciado: string;
    enunciado_detalle: string | null;
    pistas: Pista[];
    casos: Caso[];
    puntos: number;
    intentos_maximos: number;
    codigoInicial: string;
  };
  borrador: { codigo: string; pistas_usadas: number } | null;
  intentosHechos: number;
  leccion: {
    titulo: string;
    orden: number;
    moduloTitulo: string;
    moduloOrden: number;
  };
  fragmento: string;
};

type RespuestaVerificacion = {
  resultado?: ResultadoAnalisis;
  acierto?: boolean;
  puntos?: number;
  intentos?: number;
  intentosRestantes?: number;
  intentosMaximos?: number;
  error?: string;
};

export function PantallaReto({ datos }: { datos: DatosReto }) {
  const { reto, borrador, intentosHechos, leccion, fragmento } = datos;

  const [codigo, setCodigo] = useState(borrador?.codigo || reto.codigoInicial);
  const [pistasUsadas, setPistasUsadas] = useState(borrador?.pistas_usadas ?? 0);
  const [respuesta, setRespuesta] = useState<RespuestaVerificacion | null>(null);
  const [verificando, setVerificando] = useState(false);
  const [pestana, setPestana] = useState<"salida" | "retro">("salida");
  const [archivo, setArchivo] = useState<"solucion" | "casos">("solucion");
  const [guardado, setGuardado] = useState<"guardando" | "guardado" | null>(null);

  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  /* ── autoguardado (RF11) ─────────────────────────────────── */
  const autoguardar = useCallback(
    (codigoNuevo: string, pistas: number) => {
      if (temporizador.current) clearTimeout(temporizador.current);
      temporizador.current = setTimeout(async () => {
        setGuardado("guardando");
        await fetch(`/api/retos/${reto.id}/borrador`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ codigo: codigoNuevo, pistasUsadas: pistas }),
        });
        setGuardado("guardado");
      }, 1500);
    },
    [reto.id],
  );

  /* ── guardar y salir ──────────────────────────────────────── */
  const guardarYSalir = useCallback(async () => {
    if (temporizador.current) clearTimeout(temporizador.current);
    setGuardado("guardando");
    await fetch(`/api/retos/${reto.id}/borrador`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo, pistasUsadas }),
    });
    router.push(`/modulos/${leccion.moduloOrden}/lecciones/${leccion.orden}`);
  }, [codigo, leccion.moduloOrden, leccion.orden, pistasUsadas, reto.id, router]);

  const alCambiar = useCallback(
    (codigoNuevo: string) => {
      setCodigo(codigoNuevo);
      autoguardar(codigoNuevo, pistasUsadas);
    },
    [autoguardar, pistasUsadas],
  );

  useEffect(() => () => {
    if (temporizador.current) clearTimeout(temporizador.current);
  }, []);

  /* ── verificar ───────────────────────────────────────────── */
  async function verificar() {
    setVerificando(true);
    try {
      const r = await fetch(`/api/retos/${reto.id}/verificar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo }),
      });
      const datosRespuesta = await r.json();
      setRespuesta(datosRespuesta);
      setPestana(datosRespuesta.acierto ? "salida" : "retro");
    } catch {
      setRespuesta({ error: "No se pudo conectar con el servidor." });
    } finally {
      setVerificando(false);
    }
  }

  /* ── pedir una pista ─────────────────────────────────────── */
  async function pedirPista() {
    const indice = pistasUsadas;
    if (indice >= reto.pistas.length) return;
    const siguiente = indice + 1;
    setPistasUsadas(siguiente);
    // Se guarda sin esperar al autoguardado: si el estudiante pide una
    // pista y verifica justo despues, el servidor tiene que saber que
    // la pidio para descontar los 10 puntos.
    void fetch(`/api/retos/${reto.id}/borrador`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo, pistasUsadas: siguiente }),
    });
  }

  const resultado = respuesta?.resultado;
  const aciertos = resultado?.casos.filter((c) => c.coincide).length ?? 0;
  const totalCasos = resultado?.casos.length ?? 0;
  const pistasReveladas = reto.pistas.slice(0, pistasUsadas);

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      {/* ══ Columna izquierda: enunciado, casos y pistas ══ */}
      <aside className="shrink-0 border-b border-slate-200 bg-white p-4 lg:w-[330px] lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-fiec-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-fiec-700">
            Reto de código
          </span>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
            +{reto.puntos} pts
          </span>
          <span className="ml-auto text-[10px] font-bold text-slate-600">
            Intento {intentosHechos + 1} de {reto.intentos_maximos}
          </span>
        </div>

        <h1 className="mt-3 text-base font-extrabold leading-snug text-slate-900">
          {reto.enunciado}
        </h1>
        {reto.enunciado_detalle ? (
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-600">{reto.enunciado_detalle}</p>
        ) : null}

        {/* Ejemplo */}
        {reto.casos.length > 0 ? (
          <section className="mt-4 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
            <h2 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600">
              Ejemplo
            </h2>
            <p className="mono mt-1.5 text-[11.5px] text-slate-600">
              Entrada:{" "}
              <span className="font-bold text-slate-800">
                {Object.entries(reto.casos[0].entrada)
                  .map(([k, v]) => `${k} = ${v}`)
                  .join(", ")}
              </span>{" "}
              →{" "}
              <span className="font-bold text-slate-800">
                {reto.casos[0].salida_esperada}
              </span>
            </p>
          </section>
        ) : null}

        {/* Casos de prueba */}
        <section className="mt-4">
          <h2 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600">
            Casos de prueba
          </h2>
          <ul className="mt-2 space-y-1.5">
            {reto.casos.map((caso) => {
              const estado = resultado?.casos.find((c) => c.nombre === caso.nombre);
              const aprobado = estado?.coincide === true;
              const fallido = estado?.coincide === false;
              return (
                <li
                  key={caso.nombre}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11.5px] ring-1 ${
                    aprobado
                      ? "bg-coder-100 text-coder-700 ring-coder-200"
                      : fallido
                        ? "bg-red-50 text-red-700 ring-red-200"
                        : "bg-slate-50 text-slate-600 ring-slate-200"
                  }`}
                >
                  <span aria-hidden="true">
                    {aprobado ? "✓" : fallido ? "✕" : "○"}
                  </span>
                  <span className="mono">
                    {Object.entries(caso.entrada)
                      .map(([k, v]) => `${k} = ${v}`)
                      .join(", ")}
                  </span>
                  <span className="ml-auto font-semibold">
                    {aprobado ? "aprobado" : fallido ? "falló" : "pendiente"}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Pistas */}
        <section className="mt-5">
          <h2 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600">
            Pistas
          </h2>
          <div className="mt-2 space-y-2">
            {pistasReveladas.map((pista) => (
              <div
                key={pista.nivel}
                className="rounded-xl bg-up-50 p-3 text-[11.5px] leading-relaxed text-up-900 ring-1 ring-up-200"
              >
                <span className="font-extrabold">Pista {pista.nivel}</span>
                <p className="mt-1">{pista.texto}</p>
              </div>
            ))}

            {pistasUsadas < reto.pistas.length ? (
              <button
                type="button"
                onClick={pedirPista}
                className="w-full rounded-xl border-2 border-dashed border-slate-300 bg-white px-3 py-2.5 text-left transition hover:border-up-400 hover:bg-up-50"
              >
                <span className="text-[11.5px] font-extrabold text-slate-700">
                  🔒 Pista {pistasUsadas + 1} · Revelar
                </span>
                <span className="mt-0.5 block text-[10.5px] text-slate-600">
                  −10 pts
                </span>
              </button>
            ) : null}
          </div>
        </section>
      </aside>

      {/* ══ Centro: editor y resultado ══ */}
      <main className="flex min-w-0 flex-1 flex-col bg-slate-900">
        {/* Pestañas de archivo */}
        <div className="flex items-center gap-1 border-b border-slate-800 px-3 pt-2">
          <button
            type="button"
            onClick={() => setArchivo("solucion")}
            className={`rounded-t-lg px-3 py-1.5 font-mono text-[12px] ${
              archivo === "solucion"
                ? "bg-slate-900 text-slate-200"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            solucion.c
          </button>
          <button
            type="button"
            onClick={() => setArchivo("casos")}
            className={`rounded-t-lg px-3 py-1.5 font-mono text-[12px] ${
              archivo === "casos"
                ? "bg-slate-900 text-slate-200"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            casos_prueba.txt
          </button>
        </div>

        {/* Editor */}
        {archivo === "solucion" ? (
          <div className="h-[380px] shrink-0 overflow-hidden lg:h-auto lg:min-h-0 lg:flex-1">
            <EditorCodigo valor={codigo} onCambio={alCambiar} />
          </div>
        ) : (
          <div className="mono h-[380px] shrink-0 overflow-auto bg-slate-950 px-4 py-3 text-[12px] leading-relaxed text-slate-300 lg:h-auto lg:min-h-0 lg:flex-1">
            <p className="text-slate-500">
              # Casos de prueba del reto. Son los que el servidor usa para
              verificar la solucion.
            </p>
            <ul className="mt-2 space-y-1.5">
              {reto.casos.map((caso) => {
                const estado = resultado?.casos.find((c) => c.nombre === caso.nombre);
                return (
                  <li key={caso.nombre}>
                    <span className="text-slate-500">caso</span> {caso.nombre}
                    <span className="text-slate-500"> → espera </span>
                    <span className="text-slate-100">{caso.salida_esperada}</span>
                    {estado ? (
                      <span className={estado.coincide ? "text-coder-400" : "text-red-400"}>
                        {estado.coincide ? "  (coincide)" : "  (no coincide)"}
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-wrap items-center gap-3 border-t border-slate-800 px-4 py-3">
          <button
            type="button"
            onClick={verificar}
            disabled={verificando}
            className="rounded-xl bg-coder-500 px-5 py-2.5 text-[13px] font-extrabold text-slate-900 shadow transition hover:bg-coder-400 disabled:opacity-60"
          >
            {verificando ? "Verificando…" : "▶ Verificar solución"}
          </button>

          <button
            type="button"
            onClick={guardarYSalir}
            className="rounded-xl bg-slate-800 px-4 py-2.5 text-[12.5px] font-bold text-slate-200 transition hover:bg-slate-700"
          >
            Guardar y salir
          </button>

          <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
            {guardado === "guardando" ? (
              <>… guardando</>
            ) : guardado === "guardado" ? (
              <>✓ Autoguardado · RF11</>
            ) : null}
          </span>

          <span className="ml-auto text-[11px] text-slate-400">
            El código no sale del equipo
          </span>
        </div>

        {/* Resultado */}
        <div className="border-t border-slate-800 bg-slate-950">
          <div className="flex items-center gap-1 px-3 pt-2">
            <button
              type="button"
              onClick={() => setPestana("salida")}
              className={`rounded-t-lg px-4 py-2 text-[11px] font-bold ${
                pestana === "salida"
                  ? "bg-slate-900 font-extrabold text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Salida
            </button>
            <button
              type="button"
              onClick={() => setPestana("retro")}
              className={`flex items-center gap-2 rounded-t-lg px-4 py-2 text-[11px] font-bold ${
                pestana === "retro"
                  ? "bg-slate-900 font-extrabold text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Retroalimentación
              {resultado && !respuesta?.acierto ? (
                <span className="rounded-md bg-red-600 px-1.5 py-0.5 text-[9px] font-extrabold text-white">
                  {resultado.errores.length || 1} error
                </span>
              ) : null}
            </button>
            {respuesta?.acierto ? (
              <span className="ml-2 rounded-md bg-coder-500 px-2 py-0.5 text-[10px] font-extrabold text-slate-900">
                ✓ Aprobado · +{respuesta.puntos} pts
              </span>
            ) : null}
            {respuesta && !respuesta.acierto && respuesta.intentosRestantes === 0 ? (
              <span className="ml-2 rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold text-slate-950">
                Se acabaron los intentos
              </span>
            ) : null}
          </div>

          <div className="min-h-[150px] bg-slate-900 px-4 py-3">
            {respuesta?.error ? (
              <p className="text-[12px] text-red-300">{respuesta.error}</p>
            ) : !resultado ? (
              <p className="mono text-[12px] text-slate-400">
                <span className="text-slate-400">$</span> verificar solucion.c
                <span className="text-slate-400"> · pulsa «Verificar solución»</span>
              </p>
            ) : pestana === "salida" ? (
              <div className="mono space-y-1 text-[12px]">
                <p className="text-slate-400">
                  <span className="text-slate-400">$</span> verificar solucion.c
                </p>
                {resultado.casos.map((caso) => (
                  <p key={caso.nombre} className="text-slate-300">
                    → Caso {caso.nombre}:{" "}
                    {caso.coincide ? (
                      <span className="text-coder-400">coincide</span>
                    ) : (
                      <span className="text-red-400">no coincide</span>
                    )}
                  </p>
                ))}
                <p className="pt-1 text-slate-400">
                  {aciertos} de {totalCasos} casos · análisis en{" "}
                  {Math.round(resultado.duracionMs)} ms
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {resultado.errores.length > 0 ? (
                  resultado.errores.map((e) => (
                    <p
                      key={e.mensaje}
                      className="rounded-lg bg-red-500/10 px-3 py-2 text-[12px] text-red-200 ring-1 ring-red-500/30"
                    >
                      {e.mensaje}
                      {e.linea ? (
                        <span className="ml-2 text-[10px] text-red-300/70">línea {e.linea}</span>
                      ) : null}
                    </p>
                  ))
                ) : null}

                {resultado.casos
                  .filter((c) => !c.coincide)
                  .map((c) => (
                    <div
                      key={c.nombre}
                      className="rounded-lg bg-slate-800/60 px-3 py-2 text-[12px] text-slate-200"
                    >
                      <p className="font-extrabold">Caso {c.nombre}</p>
                      {c.camino.map((linea) => (
                        <p key={linea} className="mt-1 text-slate-300">
                          {linea}
                        </p>
                      ))}
                      {c.error ? (
                        <p className="mt-1 text-slate-300">{c.error}</p>
                      ) : null}
                    </div>
                  ))}

                {resultado.errores.length === 0 &&
                resultado.casos.every((c) => c.coincide) ? (
                  <p className="rounded-lg bg-coder-500/10 px-3 py-2 text-[12px] text-coder-300 ring-1 ring-coder-500/30">
                    Todos los casos pasan. El reto queda aprobado.
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ══ Columna derecha: repaso de la lección ══ */}
      <aside className="hidden w-[200px] shrink-0 border-l border-slate-200 bg-slate-50 p-4 xl:block">
        <h2 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600">
          Repasa la lección
        </h2>
        <pre className="mono mt-2 overflow-x-auto rounded-xl bg-slate-900 p-3 text-[10.5px] leading-relaxed text-slate-300">
          {fragmento}
        </pre>

        <div className="mt-4 rounded-xl bg-up-50 p-3 ring-1 ring-up-200">
          <h2 className="text-[10px] font-extrabold text-up-800">📘 Atajo</h2>
          <p className="mt-1 text-[10.5px] leading-relaxed text-up-900">
            Si olvidas una llave, el editor te lo señala en la línea exacta.
          </p>
        </div>

        <Link
          href={`/modulos/${leccion.moduloOrden}/lecciones/${leccion.orden}`}
          className="mt-4 block rounded-lg bg-white px-2 py-2 text-center text-[11px] font-bold text-fiec-700 ring-1 ring-slate-300 transition hover:bg-slate-50"
        >
          ← Volver a la lección
        </Link>
      </aside>
    </div>
  );
}
