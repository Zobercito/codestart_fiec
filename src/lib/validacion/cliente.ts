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
 *
 * El análisis tiene un límite de 5 segundos (RNF07). No se ejecuta
 * código C, pero un programa grande o mal formado no debe dejar la
 * pantalla esperando indefinidamente.
 */

export const TIEMPO_MAXIMO_MS = 5000;

const MENSAJE_TIMEOUT =
  "El análisis tardó más de 5 segundos. Revisa el código e intenta de nuevo.";

function resultadoTimeout(): ResultadoAnalisis {
  return {
    ok: false,
    casos: [],
    errores: [{ mensaje: MENSAJE_TIMEOUT }],
    salidas: [],
    duracionMs: TIEMPO_MAXIMO_MS,
  };
}

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

function conTiempoMaximo(
  promesa: Promise<ResultadoAnalisis>,
): Promise<ResultadoAnalisis> {
  return new Promise((resolver) => {
    let terminado = false;
    const temporizador = setTimeout(() => {
      if (terminado) return;
      terminado = true;
      resolver(resultadoTimeout());
    }, TIEMPO_MAXIMO_MS);

    promesa.then(
      (resultado) => {
        if (terminado) return;
        terminado = true;
        clearTimeout(temporizador);
        resolver(resultado);
      },
      () => {
        if (terminado) return;
        terminado = true;
        clearTimeout(temporizador);
        resolver(resultadoTimeout());
      },
    );
  });
}

/** Analiza el codigo del estudiante y devuelve el resultado. */
export function analizarCodigo(
  codigo: string,
  reglas: Reglas,
  casos: CasoPrueba[],
): Promise<ResultadoAnalisis> {
  const elWorker = obtenerWorker();

  if (!elWorker) {
    return conTiempoMaximo(
      Promise.resolve().then(() => analizar(codigo, reglas, casos)),
    );
  }

  const trabajador = elWorker;
  const id = `a${++contador}`;

  return new Promise((resolver) => {
    let terminado = false;

    function terminar(resultado: ResultadoAnalisis) {
      if (terminado) return;
      terminado = true;
      clearTimeout(temporizador);
      trabajador.removeEventListener("message", alRecibir);
      resolver(resultado);
    }

    function alRecibir(evento: MessageEvent<RespuestaAnalisis>) {
      if (evento.data.id !== id) return;
      if (evento.data.error || !evento.data.resultado) {
        terminar({
          ok: false,
          casos: [],
          errores: [
            { mensaje: evento.data.error ?? "No se pudo analizar el codigo." },
          ],
          salidas: [],
          duracionMs: 0,
        });
        return;
      }
      terminar(evento.data.resultado);
    }

    const temporizador = setTimeout(
      () => terminar(resultadoTimeout()),
      TIEMPO_MAXIMO_MS,
    );
    trabajador.addEventListener("message", alRecibir);
    trabajador.postMessage({ id, codigo, reglas, casos } satisfies PeticionAnalisis);
  });
}
