import { lex } from "./lexico";
import { analizarSintaxis } from "./sintactico";
import {
  construirTablaSimbolos,
  evaluar,
  textoExpresion,
  type Entorno,
  type TablaSimbolos,
  type Valor,
} from "./entorno";
import type {
  CasoPrueba,
  Expresion,
  TipoDato,
  Programa,
  Reglas,
  ResultadoAnalisis,
  ResultadoCaso,
  Sentencia,
} from "./tipos";

/**
 * El motor de validacion.
 *
 * No ejecuta el codigo del estudiante como lo haria un compilador de C:
 * lo analiza. Extrae su estructura (AST), comprueba sus tipos y simula
 * el camino que tomaria con los datos de cada caso de prueba.
 *
 * El analisis estatico da un diagnostico mejor que la ejecucion, porque
 * sabe POR QUE se toma cada rama. Es lo que el panel docente convierte
 * despues en el patron de error del grupo (RF15).
 */

/* ── Registro de la simulacion ─────────────────────────────────── */

export type ComparacionEvaluada = {
  operador: string;
  izquierda: string;
  valorIzquierdo: Valor;
  derecha: string;
  valorDerecho: Valor;
  resultado: boolean;
};

type Contexto = {
  entorno: Entorno;
  /**
   * Variables cuyo valor fija el caso de prueba. La declaracion del
   * estudiante las inicializa con su propio valor, pero el caso manda:
   * un caso dice "que pasa si edad = 15", y el 15 del enunciado no
   * cambia lo que el codigo hace.
   */
  entradas: Set<string>;
  tabla: TablaSimbolos;
  comparaciones: ComparacionEvaluada[];
  error?: string;
  lineaError?: number;
};

type ResultadoRama = {
  salidas: string[];
  error?: string;
  lineaError?: number;
};

/**
 * Comprueba que un valor se pueda guardar en una variable de ese tipo.
 *
 * Es el error que mas veces va a cometer quien empieza: guardar un
 * texto donde va un numero, como `edad = "edad";`.
 */
export function comprobarTipo(tipo: TipoDato, valor: Valor): string | null {
  const esTexto = typeof valor === "string";
  const esBooleano = typeof valor === "boolean";

  if (tipo === "bool") {
    return esBooleano ? null : "No se puede guardar un valor que no sea verdadero o falso.";
  }

  if (tipo === "int") {
    if (esTexto) return "No se puede guardar un texto en una variable de tipo int.";
    if (esBooleano) return "No se puede guardar un valor verdadero o falso en una variable de tipo int.";
    if (!Number.isInteger(valor as number)) {
      return "No se puede guardar un numero decimal en una variable de tipo int.";
    }
    return null;
  }

  if (tipo === "float" || tipo === "double") {
    if (esTexto) return "No se puede guardar un texto en una variable de tipo " + tipo + ".";
    if (esBooleano) return "No se puede guardar un valor verdadero o falso en una variable de tipo " + tipo + ".";
    return null;
  }

  if (tipo === "char") {
    if (esTexto && (valor as string).length === 1) return null;
    if (esTexto) return "Un char solo puede guardar un caracter, no un texto entero.";
    if (esBooleano) return "No se puede guardar un valor verdadero o falso en una variable de tipo char.";
    return null;
  }

  return null;
}

/** Texto que imprime un printf, sin el salto de linea final. */
function textoDePrintf(argumentos: Expresion[]): string | null {
  if (argumentos.length === 0) return null;
  const primero = argumentos[0];
  if (primero.tipo !== "literal" || primero.clase !== "cadena") return null;
  return String(primero.valor).replace(/\n$/, "");
}

/** Ejecuta una lista de sentencias y devuelve lo que imprime. */
function ejecutarRama(sentencias: Sentencia[], ctx: Contexto): ResultadoRama {
  const salidas: string[] = [];

  for (const s of sentencias) {
    if (ctx.error) break;

    switch (s.tipo) {
      case "declaracion": {
        const inicial = s.valor ? evaluar(s.valor, ctx.entorno, ctx.tabla) : { valor: undefined };
        if (inicial.error) {
          ctx.error = inicial.error;
          ctx.lineaError = inicial.linea;
          break;
        }
        // El tipo se comprueba SIEMPRE, aunque el caso fije despues el
        // valor: asignar un texto a un int es un error del programa, no
        // un fallo del caso de prueba.
        if (s.valor) {
          const problema = comprobarTipo(s.tipoDato, inicial.valor as Valor);
          if (problema) {
            ctx.error = problema;
            ctx.lineaError = s.linea;
            break;
          }
        }
        if (!ctx.entradas.has(s.nombre)) {
          ctx.entorno.set(s.nombre, inicial.valor as Valor);
          ctx.tabla.variables.set(s.nombre, {
            ...ctx.tabla.variables.get(s.nombre)!,
            valor: inicial.valor as Valor,
          });
        }
        break;
      }

      case "asignacion": {
        const valor = evaluar(s.valor, ctx.entorno, ctx.tabla);
        if (valor.error) {
          ctx.error = valor.error;
          ctx.lineaError = valor.linea;
          break;
        }
        ctx.entorno.set(s.nombre, valor.valor as Valor);
        const declarada = ctx.tabla.variables.get(s.nombre);
        if (declarada) declarada.valor = valor.valor as Valor;
        break;
      }

      case "si": {
        const condicion = evaluar(s.condicion, ctx.entorno, ctx.tabla);
        if (condicion.error) {
          ctx.error = condicion.error;
          ctx.lineaError = condicion.linea;
          break;
        }
        // Se registra la comparacion que decide, para poder explicarla.
        const comparacion = buscarComparacion(s.condicion);
        if (comparacion) {
          const izq = evaluar(comparacion.izquierda, ctx.entorno, ctx.tabla);
          const der = evaluar(comparacion.derecha, ctx.entorno, ctx.tabla);
          if (!izq.error && !der.error) {
            ctx.comparaciones.push({
              operador: comparacion.operador,
              izquierda: textoExpresion(comparacion.izquierda),
              valorIzquierdo: izq.valor as Valor,
              derecha: textoExpresion(comparacion.derecha),
              valorDerecho: der.valor as Valor,
              resultado: Boolean(condicion.valor),
            });
          }
        }

        const verdadera = Boolean(condicion.valor);
        const ramaVerdadera = ejecutarRama(s.entonces, ctx);
        const ramaFalsa = s.siNo ? ejecutarRama(s.siNo, ctx) : { salidas: [] };

        // El camino elegido: sus salidas son las que ve el caso.
        const elegidas = verdadera ? ramaVerdadera : ramaFalsa;
        salidas.push(...elegidas.salidas);
        if (elegidas.error) {
          ctx.error = elegidas.error;
          ctx.lineaError = elegidas.lineaError;
        }
        break;
      }

      case "retorno":
        break;

      case "expresion": {
        if (s.valor.tipo === "llamada" && s.valor.nombre === "printf") {
          const texto = textoDePrintf(s.valor.argumentos);
          if (texto !== null) salidas.push(texto);
        }
        break;
      }
    }
  }

  return { salidas, error: ctx.error, lineaError: ctx.lineaError };
}

/** Busca, dentro de una condicion, la comparacion que la decide. */
function buscarComparacion(e: Expresion): {
  operador: string;
  izquierda: Expresion;
  derecha: Expresion;
} | null {
  if (e.tipo === "operacion" && e.derecha) {
    if (["==", "!=", "<", ">", "<=", ">="].includes(e.operador)) {
      return { operador: e.operador, izquierda: e.izquierda, derecha: e.derecha };
    }
    const dentro = buscarComparacion(e.izquierda) ?? buscarComparacion(e.derecha);
    if (dentro) return dentro;
  }
  return null;
}

/* ── Verificacion de reglas ───────────────────────────────────── */

type Incumplimiento = {
  regla: string;
  mensaje: string;
};

/**
 * Comprueba las reglas declarativas del reto contra el AST.
 *
 * Las reglas vienen de la base de datos (columna JSONB) y describen lo
 * que el programa TIENE que hacer, no como lo tiene que escribir. Asi el
 * motor no depende del lenguaje.
 */
export function verificarReglas(
  programa: Programa,
  tabla: TablaSimbolos,
  reglas: Reglas,
): Incumplimiento[] {
  const fallos: Incumplimiento[] = [];

  // 1. declaraciones exigidas
  for (const exigida of reglas.declaraciones ?? []) {
    const declarada = tabla.variables.get(exigida.nombre);
    if (!declarada) {
      fallos.push({
        regla: "declaraciones",
        mensaje: `Falta declarar la variable «${exigida.nombre}» de tipo ${exigida.tipo}.`,
      });
    } else if (declarada.tipo !== exigida.tipo) {
      fallos.push({
        regla: "declaraciones",
        mensaje: `La variable «${exigida.nombre}» es de tipo ${declarada.tipo}, y el reto pide ${exigida.tipo}.`,
      });
    }
  }

  // 2. comparaciones exigidas, con su operador exacto
  const comparaciones = comparacionesDelPrograma(programa);
  for (const exigida of reglas.comparaciones ?? []) {
    const conLaVariable = comparaciones.filter(
      (c) => c.izquierda === exigida.variable || c.derecha === exigida.variable,
    );
    const exacta = conLaVariable.find((c) => c.operador === exigida.operador);

    if (exacta) continue;

    if (conLaVariable.length > 0) {
      const usada = conLaVariable[0];
      fallos.push({
        regla: "comparaciones",
        mensaje: `La comparación con «${exigida.variable}» usa el operador «${usada.operador}», y el reto pide «${exigida.operador}».`,
      });
    } else {
      fallos.push({
        regla: "comparaciones",
        mensaje: `Falta la comparación «${exigida.variable} ${exigida.operador} ${exigida.valor}».`,
      });
    }
  }

  // 3. numero de ramas
  const condicionales = condicionalesDelPrograma(programa);
  const ramas = Math.max(0, ...condicionales.map((c) => (c.siNo ? 2 : 1)));
  if (reglas.requiere_ramas && ramas < reglas.requiere_ramas) {
    fallos.push({
      regla: "requiere_ramas",
      mensaje:
        reglas.requiere_ramas === 2
          ? "Falta la rama `else`: el programa solo tiene un camino."
          : "Falta el condicional.",
    });
  }

  // 4. impresiones exigidas, por rama
  if (reglas.impresiones) {
    const porRama = salidasPorRama(programa, tabla);
    if (reglas.impresiones.verdadero) {
      const enVerdadera = porRama.some((r) => r.salidasVerdadero.includes(reglas.impresiones!.verdadero!));
      if (!enVerdadera) {
        fallos.push({
          regla: "impresiones",
          mensaje: `En la rama verdadera falta imprimir «${reglas.impresiones.verdadero}».`,
        });
      }
    }
    if (reglas.impresiones.falso) {
      const enFalsa = porRama.some((r) => r.salidasFalso.includes(reglas.impresiones!.falso!));
      if (!enFalsa) {
        fallos.push({
          regla: "impresiones",
          mensaje: `En la rama falsa falta imprimir «${reglas.impresiones.falso}».`,
        });
      }
    }
  }

  return fallos;
}

type ComparacionDelPrograma = {
  operador: string;
  izquierda: string;
  derecha: string;
};

function comparacionesDelPrograma(programa: Programa): ComparacionDelPrograma[] {
  const encontradas: ComparacionDelPrograma[] = [];

  const recorrer = (e: Expresion) => {
    if (e.tipo === "operacion") {
      if (e.derecha && ["==", "!=", "<", ">", "<=", ">="].includes(e.operador)) {
        encontradas.push({
          operador: e.operador,
          izquierda: textoExpresion(e.izquierda),
          derecha: textoExpresion(e.derecha),
        });
      }
      if (e.derecha) {
        recorrer(e.izquierda);
        recorrer(e.derecha);
      }
    }
  };

  const recorrerSentencias = (sentencias: Sentencia[]) => {
    for (const s of sentencias) {
      if (s.tipo === "si") {
        recorrer(s.condicion);
        recorrerSentencias(s.entonces);
        if (s.siNo) recorrerSentencias(s.siNo);
      } else if (s.tipo === "expresion") {
        recorrer(s.valor);
      }
    }
  };

  recorrerSentencias(programa.cuerpo);
  return encontradas;
}

function condicionalesDelPrograma(programa: Programa): { siNo?: Sentencia[] }[] {
  const condicionales: { siNo?: Sentencia[] }[] = [];
  const recorrer = (sentencias: Sentencia[]) => {
    for (const s of sentencias) {
      if (s.tipo === "si") {
        condicionales.push({ siNo: s.siNo });
        recorrer(s.entonces);
        if (s.siNo) recorrer(s.siNo);
      }
    }
  };
  recorrer(programa.cuerpo);
  return condicionales;
}

/** Las salidas de cada rama de cada condicional. */
function salidasPorRama(
  programa: Programa,
  tabla: TablaSimbolos,
): { salidasVerdadero: string[]; salidasFalso: string[] }[] {
  const resultado: { salidasVerdadero: string[]; salidasFalso: string[] }[] = [];

  const recorrer = (sentencias: Sentencia[]) => {
    for (const s of sentencias) {
      if (s.tipo !== "si") continue;
      // Para recoger las salidas de cada rama hacen falta valores, asi
      // que se usa un entorno con ceros: aqui solo importa el texto
      // que se imprime, no el valor.
      const entornoVacio: Entorno = new Map();
      for (const nombre of tabla.variables.keys()) entornoVacio.set(nombre, 0);

      const ctxV: Contexto = { entorno: new Map(entornoVacio), entradas: new Set(), tabla, comparaciones: [] };
      const ramaV = ejecutarRama(s.entonces, ctxV);

      const ctxF: Contexto = { entorno: new Map(entornoVacio), entradas: new Set(), tabla, comparaciones: [] };
      const ramaF = s.siNo ? ejecutarRama(s.siNo, ctxF) : { salidas: [] };

      resultado.push({ salidasVerdadero: ramaV.salidas, salidasFalso: ramaF.salidas });
      recorrer(s.entonces);
      if (s.siNo) recorrer(s.siNo);
    }
  };

  recorrer(programa.cuerpo);
  return resultado;
}

/* ── El motor ─────────────────────────────────────────────────── */

export function analizar(
  codigo: string,
  reglas: Reglas,
  casos: CasoPrueba[],
): ResultadoAnalisis {
  const inicio = performance.now();
  const errores: ResultadoAnalisis["errores"] = [];

  const lexico = lex(codigo);
  for (const e of lexico.errores) errores.push({ mensaje: e.mensaje, linea: e.linea });

  if (errores.length > 0) {
    return { ok: false, casos: [], errores, salidas: [], duracionMs: performance.now() - inicio };
  }

  const sintaxis = analizarSintaxis(lexico.tokens);
  for (const e of sintaxis.errores) errores.push({ mensaje: e.mensaje, linea: e.linea });

  const programa = sintaxis.programa;
  if (!programa) {
    return { ok: false, casos: [], errores, salidas: [], duracionMs: performance.now() - inicio };
  }

  const tabla = construirTablaSimbolos(programa);
  for (const e of tabla.errores) errores.push({ mensaje: e.mensaje, linea: e.linea });

  const incumplimientos = verificarReglas(programa, tabla, reglas);
  for (const i of incumplimientos) errores.push({ mensaje: i.mensaje });

  // Por cada caso: se simula el camino con esos datos.
  const resultados: ResultadoCaso[] = casos.map((caso) => {
    const entorno: Entorno = new Map();
    // Las entradas del caso se aplican a las variables declaradas.
    for (const [nombre, variable] of tabla.variables) {
      const entrada = caso.entrada[nombre];
      entorno.set(nombre, entrada !== undefined ? entrada : (variable.valor ?? 0));
    }

    const entradas = new Set(Object.keys(caso.entrada).filter((n) => tabla.variables.has(n)));
    const ctx: Contexto = { entorno, entradas, tabla, comparaciones: [] };
    const rama = ejecutarRama(programa.cuerpo, ctx);

    // Un error del PROGRAMA (tipo, variable sin declarar) no es un
    // fallo del caso: es un error del codigo, y va en la lista global.
    if (rama.error) {
      errores.push({ mensaje: rama.error, linea: rama.lineaError });
    }

    const salidaObtenida = rama.salidas.join("\n");

    const coincide = salidaObtenida.trim() === caso.salida_esperada.trim();
    const resultado: ResultadoCaso = {
      nombre: caso.nombre,
      coincide,
      salida_esperada: caso.salida_esperada,
      salida_obtenida: salidaObtenida,
      camino: [],
    };

    if (!coincide) {
      const comparacion = ctx.comparaciones[ctx.comparaciones.length - 1];
      const ruta = comparacion
        ? `Con ${caso.entrada[comparacion.izquierda] ?? comparacion.valorIzquierdo}, tu condición \`${comparacion.izquierda} ${comparacion.operador} ${comparacion.derecha}\` es ${comparacion.resultado ? "verdadera" : "falsa"}`
        : "El programa tomó un camino distinto del esperado";
      resultado.camino = [
        ruta,
        comparacion
          ? comparacion.resultado
            ? "y por eso entró en la primera rama"
            : "así que el programa cae en la rama `else`"
          : "",
      ].filter(Boolean);
      resultado.error = rama.error
        ? rama.error
        : `${ruta}, y respondió «${salidaObtenida || "(nada)"}». El caso espera «${caso.salida_esperada}».`;
    }

    const incumplida = incumplimientos.find(
      (i) => i.regla === "comparaciones" && !coincide,
    );
    if (incumplida) resultado.reglaIncumplida = incumplida.regla;

    return resultado;
  });

  // Un error del programa se repite en cada caso: se deja una vez.
  const unicos = new Map<string, { mensaje: string; linea?: number }>();
  for (const e of errores) {
    if (!unicos.has(e.mensaje)) unicos.set(e.mensaje, e);
  }
  const erroresUnicos = [...unicos.values()];

  return {
    ok: erroresUnicos.length === 0 && resultados.every((r) => r.coincide),
    casos: resultados,
    errores: erroresUnicos,
    salidas: resultados.flatMap((r) => r.salida_obtenida ? [r.salida_obtenida] : []),
    duracionMs: performance.now() - inicio,
  };
}
