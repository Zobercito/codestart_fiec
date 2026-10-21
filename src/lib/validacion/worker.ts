/// <reference lib="webworker" />

import { analizar } from "./motor";
import type { CasoPrueba, Reglas, ResultadoAnalisis } from "./tipos";

/**
 * El analizador corre en un Web Worker.
 *
 * El analisis no puede quedarse colgado (no ejecuta el codigo del
 * estudiante, asi que no hay bucles infinitos), pero el calculo de tipos
 * y la simulacion de todos los casos puede tardar lo suyo, y hacerlo
 * aqui evita que la pagina se congele mientras el estudiante espera.
 *
 * Tambien es la frontera de seguridad: el codigo del estudiante nunca
 * sale del navegador (RNF07).
 */

export type PeticionAnalisis = {
  id: string;
  codigo: string;
  reglas: Reglas;
  casos: CasoPrueba[];
};

export type RespuestaAnalisis = {
  id: string;
  resultado?: ResultadoAnalisis;
  error?: string;
};

const worker = self as unknown as DedicatedWorkerGlobalScope;

worker.onmessage = (evento: MessageEvent<PeticionAnalisis>) => {
  const { id, codigo, reglas, casos } = evento.data;
  try {
    const resultado = analizar(codigo, reglas, casos);
    worker.postMessage({ id, resultado } satisfies RespuestaAnalisis);
  } catch (error) {
    worker.postMessage({
      id,
      error: error instanceof Error ? error.message : "Error desconocido al analizar.",
    } satisfies RespuestaAnalisis);
  }
};
