import { analizar } from "./motor";
import type { CasoPrueba, Reglas, ResultadoAnalisis } from "./tipos";
import type { PeticionAnalisis, RespuestaAnalisis } from "./worker";

/**
 * Cliente del analizador.
 *
 * Intenta el Web Worker y, si no esta disponible (por ejemplo, en una
 * prueba unitaria o en un entorno sin workers), cae al analisis en la
 * misma linea. El resultado es el mismo: el worker no cambia lo que el
 * motor decide, solo donde se ejecuta.
 */

let worker: Worker | null = null;
let contador = 0;

function obtenerWorker(): Worker | null {
  if (worker) return worker;
  if (typeof Worker === "undefined") return null;
  try {
    worker = new Worker(new URL("./worker.ts", import.meta.url));
    return worker;
  } catch {
    return null;
  }
}

/** Analiza el codigo del estudiante y devuelve el resultado. */
export function analizarCodigo(
  codigo: string,
  reglas: Reglas,
  casos: CasoPrueba[],
): Promise<ResultadoAnalisis> {
  const elWorker = obtenerWorker();

  if (!elWorker) {
    return Promise.resolve(analizar(codigo, reglas, casos));
  }

  const id = `a${++contador}`;

  return new Promise((resolver) => {
    const alRecibir = (evento: MessageEvent<RespuestaAnalisis>) => {
      if (evento.data.id !== id) return;
      elWorker.removeEventListener("message", alRecibir);
      if (evento.data.error || !evento.data.resultado) {
        resolver({
          ok: false,
          casos: [],
          errores: [{ mensaje: evento.data.error ?? "No se pudo analizar el codigo." }],
          salidas: [],
          duracionMs: 0,
        });
        return;
      }
      resolver(evento.data.resultado);
    };

    elWorker.addEventListener("message", alRecibir);
    elWorker.postMessage({ id, codigo, reglas, casos } satisfies PeticionAnalisis);
  });
}
