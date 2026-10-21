import type { Expresion, Programa, Sentencia, TipoDato } from "./tipos";
import { PALABRAS_CLAVE, type Token } from "./lexico";

/**
 * Parser descendente recursivo para el subconjunto de C del propedeutico.
 *
 * Grammar:
 *
 *   programa   := sentencia*
 *   sentencia := tipo IDENT ('=' expresion)? ';'
 *               | 'if' '(' expresion ')' bloque ('else' bloque)?
 *               | 'return' expresion? ';'
 *               | IDENT '=' expresion ';'
 *               | expresion ';'
 *   bloque    := '{' sentencia* '}' | sentencia
 *   expresion := logica
 *   logica    := igualdad (('&&' | '||') igualdad)*
 *   igualdad  := comparacion (('==' | '!=') comparacion)*
 *   comparacion:= suma (('<' | '>' | '<=' | '>=') suma)*
 *   suma      := producto (('+' | '-') producto)*
 *   producto  := unario (('*' | '/' | '%') unario)*
 *   unario    := ('!' | '-' | '+') unario | llamada
 *   llamada   := IDENT '(' argumentos? ')' | IDENT | numero | cadena
 */

export type ErrorSintactico = { mensaje: string; linea: number };

/** Un grupo de sentencias: una sentencia suelta, o el cuerpo de una funcion. */
type GrupoSentencias = {
  sentencias: Sentencia[];
  funcion?: string;
};

export type ResultadoSintactico = {
  programa: Programa | null;
  errores: ErrorSintactico[];
};

class Parser {
  private pos = 0;

  constructor(
    private readonly tokens: Token[],
    private readonly errores: ErrorSintactico[],
  ) {}

  private actual(): Token {
    // las directivas de preprocesador no son codigo: se saltan
    while (this.tokens[this.pos]?.tipo === "directiva") this.pos++;
    return this.tokens[this.pos];
  }

  private avanzar(): Token {
    while (this.tokens[this.pos]?.tipo === "directiva") this.pos++;
    const t = this.tokens[this.pos];
    if (this.pos < this.tokens.length - 1) this.pos++;
    return t;
  }

  private es(valor: string): boolean {
    const t = this.actual();
    return t.valor === valor;
  }

  /** El token siguiente, saltando las directivas de preprocesador. */
  private siguienteEs(valor: string): boolean {
    let i = this.pos + 1;
    while (this.tokens[i]?.tipo === "directiva") i++;
    return this.tokens[i]?.valor === valor;
  }

  private esTipoDato(): boolean {
    const t = this.actual();
    return t.tipo === "palabraclave" && t.valor in PALABRAS_CLAVE && ["int", "float", "double", "char", "bool"].includes(t.valor);
  }

  private error(mensaje: string, token = this.actual()): void {
    this.errores.push({ mensaje, linea: token.linea });
  }

  private esperar(valor: string): boolean {
    if (this.es(valor)) {
      this.avanzar();
      return true;
    }
    this.error(`Se esperaba «${valor}» y se encontró «${this.actual().valor || "fin del código"}».`);
    return false;
  }

  /* ── programa ──────────────────────────────────────────────── */

  /*
   * El programa que se analiza es el CUERPO de una funcion, normalmente
   * main: lo que el estudiante escribe dentro de las llaves es lo que
   * el reto pide completar. Si hay varias funciones, se analiza main; si
   * no hay main, la primera.
   */
  programa(): Programa {
    const cuerpos: { nombre: string; sentencias: Sentencia[] }[] = [];
    const sueltas: Sentencia[] = [];

    while (this.actual().tipo !== "fin") {
      const antes = this.pos;
      const resultado = this.sentencia();
      if (resultado) {
        if (resultado.funcion) {
          cuerpos.push({ nombre: resultado.funcion, sentencias: resultado.sentencias });
        } else {
          sueltas.push(...resultado.sentencias);
        }
      }
      if (this.pos === antes) this.avanzar(); // evita bucles infinitos
    }

    const main = cuerpos.find((c) => c.nombre === "main");
    const cuerpo = main?.sentencias ?? cuerpos[0]?.sentencias ?? sueltas;

    return { tipo: "programa", cuerpo };
  }

  /* ── sentencias ────────────────────────────────────────────── */

  private sentencia(): GrupoSentencias | null {
    const t = this.actual();

    if (t.tipo === "palabraclave" && t.valor === "if") {
      const s = this.si();
      return s ? { sentencias: [s] } : null;
    }
    if (t.tipo === "palabraclave" && t.valor === "return") {
      const s = this.retorno();
      return s ? { sentencias: [s] } : null;
    }

    if (this.esTipoDato()) return this.declaracion();

    // asignacion: IDENT '=' expresion ';'
    if (t.tipo === "identificador" && this.siguienteEs("=")) {
      const linea = t.linea;
      const nombre = this.avanzar().valor;
      this.avanzar(); // '='
      const valor = this.expresion();
      this.esperar(";");
      return { sentencias: [{ tipo: "asignacion", nombre, valor: valor!, linea }] };
    }

    // expresion suelta
    const expresion = this.expresion();
    if (!expresion) return null;
    this.esperar(";");
    return { sentencias: [{ tipo: "expresion", valor: expresion, linea: expresion.linea }] };
  }

  private declaracion(): GrupoSentencias | null {
    const t = this.avanzar();
    const tipoDato = t.valor as TipoDato;
    const linea = t.linea;

    if (this.actual().tipo !== "identificador") {
      this.error("Tras el tipo de dato hace falta el nombre de la variable.");
      return null;
    }
    const nombre = this.avanzar().valor;

    // declaracion de funcion: int main() { ... }
    if (this.es("(")) {
      this.avanzar(); // '('
      while (!this.es(")") && this.actual().tipo !== "fin") this.avanzar();
      this.esperar(")");
      const cuerpo = this.bloque();
      return { funcion: nombre, sentencias: cuerpo };
    }

    let valor: Expresion | undefined;
    if (this.es("=")) {
      this.avanzar();
      valor = this.expresion() ?? undefined;
    }
    this.esperar(";");
    return { sentencias: [{ tipo: "declaracion", tipoDato, nombre, valor, linea }] };
  }

  private si(): Sentencia | null {
    const linea = this.avanzar().linea; // 'if'
    if (!this.esperar("(")) return null;
    const condicion = this.expresion();
    if (!condicion) return null;
    if (!this.esperar(")")) return null;

    const entonces = this.bloque();

    let siNo: Sentencia[] | undefined;
    if (this.actual().tipo === "palabraclave" && this.actual().valor === "else") {
      this.avanzar();
      siNo = this.bloque();
    }

    return { tipo: "si", condicion, entonces, siNo, linea };
  }

  private retorno(): Sentencia | null {
    const linea = this.avanzar().linea; // 'return'
    let valor: Expresion | undefined;
    if (!this.es(";")) valor = this.expresion() ?? undefined;
    this.esperar(";");
    return { tipo: "retorno", valor, linea };
  }

  private bloque(): Sentencia[] {
    if (this.es("{")) {
      this.avanzar();
      const cuerpo: Sentencia[] = [];
      while (!this.es("}") && this.actual().tipo !== "fin") {
        const antes = this.pos;
        const grupo = this.sentencia();
        if (grupo) cuerpo.push(...grupo.sentencias);
        if (this.pos === antes) this.avanzar();
      }
      this.esperar("}");
      return cuerpo;
    }
    const grupo = this.sentencia();
    return grupo ? grupo.sentencias : [];
  }

  /* ── expresiones ───────────────────────────────────────────── */

  private expresion(): Expresion | null {
    return this.logica();
  }

  private logica(): Expresion | null {
    let izq = this.igualdad();
    if (!izq) return null;
    while (this.actual().tipo === "operador" && ["&&", "||"].includes(this.actual().valor)) {
      const op = this.avanzar();
      const der = this.igualdad();
      if (!der) return izq;
      izq = { tipo: "operacion", operador: op.valor as "&&" | "||", izquierda: izq, derecha: der, linea: op.linea };
    }
    return izq;
  }

  private igualdad(): Expresion | null {
    let izq = this.comparacion();
    if (!izq) return null;
    while (this.actual().tipo === "operador" && ["==", "!="].includes(this.actual().valor)) {
      const op = this.avanzar();
      const der = this.comparacion();
      if (!der) return izq;
      izq = { tipo: "operacion", operador: op.valor as "==" | "!=", izquierda: izq, derecha: der, linea: op.linea };
    }
    return izq;
  }

  private comparacion(): Expresion | null {
    let izq = this.suma();
    if (!izq) return null;
    while (this.actual().tipo === "operador" && ["<", ">", "<=", ">="].includes(this.actual().valor)) {
      const op = this.avanzar();
      const der = this.suma();
      if (!der) return izq;
      izq = {
        tipo: "operacion",
        operador: op.valor as "<" | ">" | "<=" | ">=",
        izquierda: izq,
        derecha: der,
        linea: op.linea,
      };
    }
    return izq;
  }

  private suma(): Expresion | null {
    let izq = this.producto();
    if (!izq) return null;
    while (this.actual().tipo === "operador" && ["+", "-"].includes(this.actual().valor)) {
      const op = this.avanzar();
      const der = this.producto();
      if (!der) return izq;
      izq = { tipo: "operacion", operador: op.valor as "+" | "-", izquierda: izq, derecha: der, linea: op.linea };
    }
    return izq;
  }

  private producto(): Expresion | null {
    let izq = this.unario();
    if (!izq) return null;
    while (this.actual().tipo === "operador" && ["*", "/", "%"].includes(this.actual().valor)) {
      const op = this.avanzar();
      const der = this.unario();
      if (!der) return izq;
      izq = { tipo: "operacion", operador: op.valor as "*" | "/" | "%", izquierda: izq, derecha: der, linea: op.linea };
    }
    return izq;
  }

  private unario(): Expresion | null {
    if (this.actual().tipo === "operador" && ["!", "-", "+"].includes(this.actual().valor)) {
      const op = this.avanzar();
      const operando = this.unario();
      if (!operando) return null;
      if (op.valor === "+") return operando;
      return { tipo: "operacion", operador: op.valor as "!" | "-", izquierda: operando, linea: op.linea };
    }
    return this.primaria();
  }

  private primaria(): Expresion | null {
    const t = this.actual();

    if (t.tipo === "numero") {
      this.avanzar();
      return { tipo: "literal", valor: Number(t.valor), clase: "numero", linea: t.linea };
    }

    if (t.tipo === "cadena") {
      this.avanzar();
      return { tipo: "literal", valor: t.valor, clase: "cadena", linea: t.linea };
    }

    if (t.tipo === "identificador") {
      this.avanzar();
      // llamada: IDENT '(' argumentos ')'
      if (this.es("(")) {
        this.avanzar();
        const argumentos: Expresion[] = [];
        if (!this.es(")")) {
          do {
            const argumento = this.expresion();
            if (!argumento) break;
            argumentos.push(argumento);
          } while (this.es(",") && this.avanzar());
        }
        this.esperar(")");
        return { tipo: "llamada", nombre: t.valor, argumentos, linea: t.linea };
      }
      return { tipo: "variable", nombre: t.valor, linea: t.linea };
    }

    this.error(`Se esperaba un valor y se encontró «${t.valor || "fin del código"}».`);
    return null;
  }
}

/** Analiza el codigo y devuelve su AST, o los errores que lo impiden. */
export function analizarSintaxis(tokens: Token[]): ResultadoSintactico {
  const errores: ErrorSintactico[] = [];
  const parser = new Parser(tokens, errores);
  const programa = parser.programa();
  return { programa: errores.length ? null : programa, errores };
}
