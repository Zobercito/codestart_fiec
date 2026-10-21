import type { TipoDato } from "./tipos";

/**
 * Lexico de C para el subconjunto del propedeutico.
 *
 * Convierte el codigo en una lista de tokens. Los comentarios se descartan
 * (no afectan al analisis) y los errores se acumulan en vez de lanzar
 * excepcion, para poder mostrarlos al estudiante.
 */

export type TipoToken =
  | "identificador"
  | "palabraclave"
  | "numero"
  | "cadena"
  | "operador"
  | "puntuacion"
  | "directiva"
  | "fin";

export type Token = {
  tipo: TipoToken;
  valor: string;
  linea: number;
  columna: number;
};

export const PALABRAS_CLAVE: Record<string, TipoDato | "if" | "else" | "return" | "void"> = {
  int: "int",
  float: "float",
  double: "double",
  char: "char",
  bool: "bool",
  void: "void",
  if: "if",
  else: "else",
  return: "return",
};

const OPERADORES_DE_TRES = ["<<=", ">>="];
const OPERADORES_DE_DOS = ["==", "!=", "<=", ">=", "&&", "||", "+=", "-=", "*=", "/="];
const OPERADORES_DE_UNO = ["+", "-", "*", "/", "%", "=", "<", ">", "!", "&", "|"];

export type ResultadoLexico = {
  tokens: Token[];
  errores: { mensaje: string; linea: number; columna: number }[];
};

/** Convierte el codigo en tokens. No lanza: acumula los errores. */
export function lex( codigo: string): ResultadoLexico {
  const tokens: Token[] = [];
  const errores: ResultadoLexico["errores"] = [];

  let linea = 1;
  let columna = 1;
  let i = 0;

  const anadir = (tipo: TipoToken, valor: string, lin: number, col: number) => {
    tokens.push({ tipo, valor, linea: lin, columna: col });
  };

  const avanzar = (n: number) => {
    for (let k = 0; k < n; k++) {
      if (codigo[i] === "\n") {
        linea++;
        columna = 1;
      } else {
        columna++;
      }
      i++;
    }
  };

  while (i < codigo.length) {
    const c = codigo[i];

    // espacios
    if (c === " " || c === "\t" || c === "\r" || c === "\n") {
      avanzar(1);
      continue;
    }

    // comentarios
    if (c === "/" && codigo[i + 1] === "/") {
      while (i < codigo.length && codigo[i] !== "\n") avanzar(1);
      continue;
    }
    if (c === "/" && codigo[i + 1] === "*") {
      const inicio = linea;
      avanzar(2);
      while (i < codigo.length && !(codigo[i] === "*" && codigo[i + 1] === "/")) avanzar(1);
      if (i >= codigo.length) {
        errores.push({
          mensaje: "El comentario /* ... */ no se cierra.",
          linea: inicio,
          columna: 1,
        });
      } else {
        avanzar(2);
      }
      continue;
    }

    // directivas de preprocesador (#include <stdio.h>): la linea
    // entera se consume como un token, porque no afecta al analisis
    if (c === "#") {
      const lin = linea;
      const col = columna;
      let valor = "";
      while (i < codigo.length && codigo[i] !== "\n") {
        valor += codigo[i];
        avanzar(1);
      }
      anadir("directiva", valor.trim(), lin, col);
      continue;
    }

    // cadenas
    if (c === '"') {
      const lin = linea;
      const col = columna;
      avanzar(1);
      let valor = "";
      let cerrada = false;
      while (i < codigo.length) {
        if (codigo[i] === "\\" && i + 1 < codigo.length) {
          const siguiente = codigo[i + 1];
          valor += siguiente === "n" ? "\n" : siguiente === "t" ? "\t" : siguiente;
          avanzar(2);
          continue;
        }
        if (codigo[i] === '"') {
          avanzar(1);
          cerrada = true;
          break;
        }
        if (codigo[i] === "\n") break;
        valor += codigo[i];
        avanzar(1);
      }
      if (!cerrada) {
        errores.push({ mensaje: "La cadena de texto no se cierra.", linea: lin, columna: col });
      }
      anadir("cadena", valor, lin, col);
      continue;
    }

    // numeros
    if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(codigo[i + 1] ?? ""))) {
      const lin = linea;
      const col = columna;
      let valor = "";
      while (i < codigo.length && /[0-9.]/.test(codigo[i])) {
        valor += codigo[i];
        avanzar(1);
      }
      if (!/^[0-9]+(\.[0-9]+)?$/.test(valor)) {
        errores.push({ mensaje: `El número «${valor}» no es válido.`, linea: lin, columna: col });
      }
      anadir("numero", valor, lin, col);
      continue;
    }

    // identificadores y palabras clave
    if (/[A-Za-z_]/.test(c)) {
      const lin = linea;
      const col = columna;
      let valor = "";
      while (i < codigo.length && /[A-Za-z0-9_]/.test(codigo[i])) {
        valor += codigo[i];
        avanzar(1);
      }
      anadir(valor in PALABRAS_CLAVE ? "palabraclave" : "identificador", valor, lin, col);
      continue;
    }

    // operadores
    const tres = codigo.slice(i, i + 3);
    const dos = codigo.slice(i, i + 2);
    if (OPERADORES_DE_TRES.includes(tres)) {
      anadir("operador", tres, linea, columna);
      avanzar(3);
      continue;
    }
    if (OPERADORES_DE_DOS.includes(dos)) {
      anadir("operador", dos, linea, columna);
      avanzar(2);
      continue;
    }
    if (OPERADORES_DE_UNO.includes(c)) {
      anadir("operador", c, linea, columna);
      avanzar(1);
      continue;
    }

    // puntuacion
    if ("(){};,".includes(c)) {
      anadir("puntuacion", c, linea, columna);
      avanzar(1);
      continue;
    }

    errores.push({
      mensaje: `El carácter «${c}» no pertenece al lenguaje.`,
      linea,
      columna,
    });
    avanzar(1);
  }

  anadir("fin", "", linea, columna);
  return { tokens, errores };
}
