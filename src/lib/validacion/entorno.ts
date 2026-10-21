import type {
  Expresion,
  Programa,
  Sentencia,
  TipoDato,
} from "./tipos";

/**
 * Tabla de simbolos y evaluacion de expresiones.
 *
 * Aqui NO se ejecuta codigo del estudiante en el sentido de C: se evaluan
 * expresiones del subconjunto del propedeutico, con los valores de las
 * variables de entrada de cada caso de prueba. Es un analisis de camino:
 * se sabe que rama se tomaria y por que.
 */

export type Valor = number | string | boolean;

export type Variable = {
  nombre: string;
  tipo: TipoDato;
  valor: Valor | undefined;
  linea: number;
};

export type ErrorSimbolo = { mensaje: string; linea: number };

export type TablaSimbolos = {
  variables: Map<string, Variable>;
  errores: ErrorSimbolo[];
};

export type Entorno = Map<string, Valor>;

/* ── Tabla de simbolos ────────────────────────────────────────── */

export function construirTablaSimbolos(programa: Programa): TablaSimbolos {
  const variables = new Map<string, Variable>();
  const errores: ErrorSimbolo[] = [];

  const recorrer = (sentencias: Sentencia[]) => {
    for (const s of sentencias) {
      switch (s.tipo) {
        case "declaracion": {
          if (variables.has(s.nombre)) {
            errores.push({
              mensaje: `La variable «${s.nombre}» ya estaba declarada.`,
              linea: s.linea,
            });
          }
          variables.set(s.nombre, {
            nombre: s.nombre,
            tipo: s.tipoDato,
            valor: undefined,
            linea: s.linea,
          });
          break;
        }
        case "si":
          recorrer(s.entonces);
          if (s.siNo) recorrer(s.siNo);
          break;
        default:
          break;
      }
    }
  };

  recorrer(programa.cuerpo);
  return { variables, errores };
}

/* ── Evaluacion de expresiones ────────────────────────────────── */

export type ResultadoEvaluacion = {
  valor?: Valor;
  error?: string;
  linea?: number;
};

const TIPO_DE_LITERAL = (v: number | string): TipoDato =>
  typeof v === "number" ? (Number.isInteger(v) ? "int" : "double") : "char";

/** Texto de una expresion, para poder mostrarla en los mensajes. */
export function textoExpresion(e: Expresion): string {
  switch (e.tipo) {
    case "literal":
      return e.clase === "cadena" ? `"${e.valor}"` : String(e.valor);
    case "variable":
      return e.nombre;
    case "llamada":
      return `${e.nombre}(${e.argumentos.map(textoExpresion).join(", ")})`;
    case "operacion": {
      if (!e.derecha) return `${e.operador}${textoExpresion(e.izquierda)}`;
      const izq = textoExpresion(e.izquierda);
      const der = textoExpresion(e.derecha);
      const necesitaParentesis = e.operador === "&&" || e.operador === "||";
      return necesitaParentesis
        ? `(${izq} ${e.operador} ${der})`
        : `${izq} ${e.operador} ${der}`;
    }
  }
}

/** El tipo que produce una expresion, para detectar mezclas. */
export function tipoDeExpresion(
  e: Expresion,
  entorno: Entorno,
  tabla: TablaSimbolos,
): TipoDato | "desconocido" {
  switch (e.tipo) {
    case "literal":
      return TIPO_DE_LITERAL(e.valor as number | string);
    case "variable": {
      const v = tabla.variables.get(e.nombre);
      return v ? v.tipo : "desconocido";
    }
    case "llamada":
      return "desconocido";
    case "operacion": {
      if (!e.derecha) {
        return tipoDeExpresion(e.izquierda, entorno, tabla);
      }
      if (["==", "!=", "<", ">", "<=", ">="].includes(e.operador)) return "bool";
      const izq = tipoDeExpresion(e.izquierda, entorno, tabla);
      const der = tipoDeExpresion(e.derecha, entorno, tabla);
      if (izq === "desconocido" || der === "desconocido") return "desconocido";
      return izq === "char" || der === "char" ? "int" : izq;
    }
  }
}

/** Evalua una expresion con los valores del entorno. */
export function evaluar(
  e: Expresion,
  entorno: Entorno,
  tabla: TablaSimbolos,
): ResultadoEvaluacion {
  switch (e.tipo) {
    case "literal":
      return { valor: e.valor };

    case "variable": {
      const declarada = tabla.variables.has(e.nombre);
      if (!declarada) {
        return {
          error: `La variable «${e.nombre}» se usa sin haberla declarado.`,
          linea: e.linea,
        };
      }
      const valor = entorno.get(e.nombre);
      if (valor === undefined) {
        return {
          error: `La variable «${e.nombre}» todavía no tiene valor.`,
          linea: e.linea,
        };
      }
      return { valor };
    }

    case "llamada":
      // Solo printf tiene sentido como llamada con valor; el resto se
      // evalua en la simulacion, no aqui.
      return { valor: undefined };

    case "operacion": {
      const izq = evaluar(e.izquierda, entorno, tabla);
      if (izq.error) return izq;
      if (!e.derecha) {
        // unario
        if (e.operador === "!") return { valor: !izq.valor };
        if (e.operador === "-") return { valor: -Number(izq.valor) };
        return { valor: izq.valor };
      }
      const der = evaluar(e.derecha, entorno, tabla);
      if (der.error) return der;

      const a = izq.valor as number | string;
      const b = der.valor as number | string;

      // comparaciones entre numero y texto son un error de tipo claro
      if (typeof a !== typeof b && ["==", "!=", "<", ">", "<=", ">="].includes(e.operador)) {
        return {
          error: `No se puede comparar «${textoExpresion(e.izquierda)}» (${typeof a === "number" ? "número" : "texto"}) con «${textoExpresion(e.derecha)}» (${typeof b === "number" ? "número" : "texto"}).`,
          linea: e.linea,
        };
      }

      switch (e.operador) {
        case "==":
          return { valor: a === b };
        case "!=":
          return { valor: a !== b };
        case "<":
          return { valor: (a as number) < (b as number) };
        case ">":
          return { valor: (a as number) > (b as number) };
        case "<=":
          return { valor: (a as number) <= (b as number) };
        case ">=":
          return { valor: (a as number) >= (b as number) };
        case "&&":
          return { valor: Boolean(a) && Boolean(b) };
        case "||":
          return { valor: Boolean(a) || Boolean(b) };
        case "+":
          return { valor: typeof a === "string" ? a + b : (a as number) + (b as number) };
        case "-":
          return { valor: (a as number) - (b as number) };
        case "*":
          return { valor: (a as number) * (b as number) };
        case "/":
          if (b === 0) {
            return { error: "División por cero.", linea: e.linea };
          }
          return { valor: (a as number) / (b as number) };
        case "%":
          if (b === 0) {
            return { error: "Módulo por cero.", linea: e.linea };
          }
          return { valor: (a as number) % (b as number) };
        default:
          return { error: `El operador «${e.operador}» no está soportado.`, linea: e.linea };
      }
    }
  }
}
