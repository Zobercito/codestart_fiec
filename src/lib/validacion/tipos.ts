/**
 * Tipos del analizador de C.
 *
 * El analizador NO ejecuta el codigo: lo analiza. C no se puede ejecutar en el
 * navegador, y ademas el analisis estatico da un diagnostico mejor que la
 * ejecucion, porque sabe por que se toma cada camino.
 *
 * El subconjunto es el del propedeutico (seccion 8 del Avance 1): variables
 * y tipos, condicionales, retorno y llamadas de salida.
 */

export type TipoDato = "int" | "float" | "double" | "char" | "bool";

export type OperadorComparacion = "==" | "!=" | "<" | "<=" | ">" | ">=";
export type OperadorAritmetico = "+" | "-" | "*" | "/" | "%";
export type OperadorLogico = "&&" | "||";
export type OperadorUnario = "!" | "-";

/* ── Expresiones ──────────────────────────────────────────────── */

export type Expresion =
  | { tipo: "literal"; valor: number | string; clase: "numero" | "cadena"; linea: number }
  | { tipo: "variable"; nombre: string; linea: number }
  | { tipo: "llamada"; nombre: string; argumentos: Expresion[]; linea: number }
  | {
      tipo: "operacion";
      operador: OperadorComparacion | OperadorAritmetico | OperadorLogico | OperadorUnario | "=";
      izquierda: Expresion;
      derecha?: Expresion;
      linea: number;
    };

/* ── Sentencias ───────────────────────────────────────────────── */

export type Sentencia =
  | {
      tipo: "declaracion";
      tipoDato: TipoDato;
      nombre: string;
      valor?: Expresion;
      linea: number;
    }
  | {
      tipo: "asignacion";
      nombre: string;
      valor: Expresion;
      linea: number;
    }
  | {
      tipo: "si";
      condicion: Expresion;
      entonces: Sentencia[];
      siNo?: Sentencia[];
      linea: number;
    }
  | { tipo: "retorno"; valor?: Expresion; linea: number }
  | { tipo: "expresion"; valor: Expresion; linea: number };

export type Programa = { tipo: "programa"; cuerpo: Sentencia[] };

/* ── Reglas del reto (las guarda la base de datos en JSONB) ────── */

export type ReglaDeclaracion = {
  tipo: TipoDato;
  nombre: string;
};

export type ReglaComparacion = {
  variable: string;
  operador: OperadorComparacion;
  valor: number;
};

export type Reglas = {
  /** Variables que el reto exige declarar, con su tipo. */
  declaraciones?: ReglaDeclaracion[];
  /** Comparaciones que el reto exige, con el operador exacto. */
  comparaciones?: ReglaComparacion[];
  /** Cuantas ramas debe tener el condicional: 1 = if, 2 = if/else. */
  requiere_ramas?: number;
  /** Los textos que se deben imprimir en cada rama. */
  impresiones?: { verdadero?: string; falso?: string };
};

export type CasoPrueba = {
  nombre: string;
  entrada: Record<string, number | string>;
  salida_esperada: string;
};

/* ── Resultado ────────────────────────────────────────────────── */

export type ResultadoCaso = {
  nombre: string;
  coincide: boolean;
  salida_esperada: string;
  salida_obtenida: string;
  /** El camino que sigue el programa con esos datos. */
  camino: string[];
  /** El error, si lo hay, en lenguaje natural. */
  error?: string;
  /** La regla que se incumplio, si se puede señalar. */
  reglaIncumplida?: string;
};

export type ResultadoAnalisis = {
  ok: boolean;
  casos: ResultadoCaso[];
  /** Errores de sintaxis o de tipo que impiden analizar el programa. */
  errores: { mensaje: string; linea?: number }[];
  /** Las salidas que el programa imprime, en orden. */
  salidas: string[];
  /** El tiempo de analisis, en milisegundos. */
  duracionMs: number;
};
