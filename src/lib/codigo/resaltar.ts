/**
 * Resaltado de codigo C para los bloques de la leccion.
 *
 * El subconjunto del propedeutico es pequeno: comentarios, cadenas,
 * directivas, palabras clave, funciones, numeros y el resto. No hace
 * falta mas, y hacerlo aqui evita duplicar el troceador.
 */

export type TipoToken =
  | "normal"
  | "comentario"
  | "cadena"
  | "palabraClave"
  | "funcion"
  | "numero"
  | "directiva"
  | "tipo";

export type Trozo = { texto: string; tipo: TipoToken };

const PALABRAS_CLAVE =
  "int|float|double|char|void|short|long|unsigned|signed|const|static|struct|union|enum|typedef|bool|sizeof|if|else|for|while|do|switch|case|default|break|continue|return|goto";

const FUNCIONES =
  "printf|scanf|puts|putchar|getchar|malloc|free|strlen|strcmp|strcpy|main";

const PATRONES: { tipo: TipoToken; re: RegExp }[] = [
  { tipo: "comentario", re: /\/\/.*$/ },
  { tipo: "cadena", re: /"(?:[^"\\]|\\.)*"/ },
  { tipo: "directiva", re: /^\s*#\w+/ },
  { tipo: "directiva", re: /<\w+\.h>/ },
  { tipo: "palabraClave", re: new RegExp(`\\b(${PALABRAS_CLAVE})\\b`) },
  { tipo: "funcion", re: new RegExp(`\\b(${FUNCIONES})\\b`) },
  { tipo: "numero", re: /\b\d+(?:\.\d+)?\b/ },
];

/** Divide una linea de C en tramos con su tipo, para colorearlos. */
export function trocear(linea: string): Trozo[] {
  let resto = linea;
  const trozos: Trozo[] = [];

  while (resto.length > 0) {
    let mejor: { tipo: TipoToken; re: RegExp; indice: number } | null = null;

    for (const p of PATRONES) {
      const m = p.re.exec(resto);
      if (m && (mejor === null || m.index < mejor.indice)) {
        mejor = { tipo: p.tipo, re: p.re, indice: m.index };
      }
    }

    if (!mejor) {
      trozos.push({ texto: resto, tipo: "normal" });
      break;
    }

    if (mejor.indice > 0) {
      trozos.push({ texto: resto.slice(0, mejor.indice), tipo: "normal" });
    }
    const m = mejor.re.exec(resto.slice(mejor.indice))!;
    trozos.push({ texto: m[0], tipo: mejor.tipo });
    resto = resto.slice(mejor.indice + m[0].length);
  }

  return trozos;
}

export const CLASES_TOKEN: Record<TipoToken, string> = {
  normal: "text-slate-300",
  comentario: "text-slate-500 italic",
  cadena: "text-rose-300",
  palabraClave: "text-sky-300",
  funcion: "text-emerald-300",
  numero: "text-amber-300",
  directiva: "text-amber-300",
  tipo: "text-sky-300",
};
