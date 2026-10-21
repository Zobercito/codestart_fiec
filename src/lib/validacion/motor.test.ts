import { describe, expect, it } from "vitest";
import { analizar } from "./motor";
import type { CasoPrueba, Reglas } from "./tipos";

/**
 * Pruebas del motor de validacion.
 *
 * El caso de referencia es el reto del prototipo: clasificar una edad
 * con un condicional. El estudiante que usa `>` en vez de `>=` es el
 * error que el panel docente tiene que detectar.
 */

const REGLAS: Reglas = {
  declaraciones: [{ tipo: "int", nombre: "edad" }],
  comparaciones: [{ variable: "edad", operador: ">=", valor: 18 }],
  requiere_ramas: 2,
  impresiones: { verdadero: "Mayor de edad", falso: "Menor de edad" },
};

const CASOS: CasoPrueba[] = [
  { nombre: "edad = 20", entrada: { edad: 20 }, salida_esperada: "Mayor de edad" },
  { nombre: "edad = 18", entrada: { edad: 18 }, salida_esperada: "Mayor de edad" },
  { nombre: "edad = 15", entrada: { edad: 15 }, salida_esperada: "Menor de edad" },
];

const SOLUCION = `#include <stdio.h>
int main() {
    int edad = 18;
    if (edad >= 18) {
        printf("Mayor de edad\\n");
    } else {
        printf("Menor de edad\\n");
    }
    return 0;
}`;

describe("el motor de validacion", () => {
  it("acepta la solucion correcta", () => {
    const r = analizar(SOLUCION, REGLAS, CASOS);
    expect(r.errores).toEqual([]);
    expect(r.casos).toHaveLength(3);
    expect(r.casos.every((c) => c.coincide)).toBe(true);
    expect(r.ok).toBe(true);
  });

  it("detecta el operador equivocado y lo explica", () => {
    const codigo = SOLUCION.replace("edad >= 18", "edad > 18");
    const r = analizar(codigo, REGLAS, CASOS);

    expect(r.ok).toBe(false);
    // el error menciona el operador que se pidio
    expect(r.errores.some((e) => e.mensaje.includes(">="))).toBe(true);
    // el caso limite es el que falla
    const limite = r.casos.find((c) => c.nombre === "edad = 18");
    expect(limite?.coincide).toBe(false);
    expect(limite?.salida_obtenida).toBe("Menor de edad");
    expect(limite?.salida_esperada).toBe("Mayor de edad");
    // y el diagnostico dice por que
    expect(limite?.error).toContain("falsa");
    expect(limite?.error).toContain("Mayor de edad");
  });

  it("exige la rama else", () => {
    const codigo = `#include <stdio.h>
int main() {
    int edad = 18;
    if (edad >= 18) {
        printf("Mayor de edad\\n");
    }
    return 0;
}`;
    const r = analizar(codigo, REGLAS, CASOS);
    expect(r.ok).toBe(false);
    expect(r.errores.some((e) => e.mensaje.includes("else"))).toBe(true);
  });

  it("exige la declaracion de la variable", () => {
    const codigo = `#include <stdio.h>
int main() {
    if (edad >= 18) {
        printf("Mayor de edad\\n");
    } else {
        printf("Menor de edad\\n");
    }
    return 0;
}`;
    const r = analizar(codigo, REGLAS, CASOS);
    expect(r.ok).toBe(false);
    expect(r.errores.some((e) => e.mensaje.includes("edad"))).toBe(true);
  });

  it("detecta el error de tipo: un texto donde va un numero", () => {
    const codigo = `#include <stdio.h>
int main() {
    int edad = "edad";
    if (edad >= 18) {
        printf("Mayor de edad\\n");
    } else {
        printf("Menor de edad\\n");
    }
    return 0;
}`;
    const r = analizar(codigo, REGLAS, CASOS);
    expect(r.ok).toBe(false);
    // el mensaje dice que el texto no cabe en un int, y lo dice de la
    // forma que lo entiende quien empieza
    expect(
      r.errores.some((e) => /no se puede guardar un texto/i.test(e.mensaje)),
    ).toBe(true);
  });

  it("detecta que se compara un texto con un numero", () => {
    const codigo = `#include <stdio.h>
int main() {
    char letra = "a";
    if (letra >= 18) {
        printf("Mayor de edad\\n");
    } else {
        printf("Menor de edad\\n");
    }
    return 0;
}`;
    const r = analizar(codigo, REGLAS, CASOS);
    expect(r.ok).toBe(false);
    expect(
      r.errores.some((e) => /no se puede comparar/i.test(e.mensaje)),
    ).toBe(true);
  });

  it("detecta una variable usada sin declarar", () => {
    const codigo = `#include <stdio.h>
int main() {
    int edad = 18;
    if (edad >= limite) {
        printf("Mayor de edad\\n");
    } else {
        printf("Menor de edad\\n");
    }
    return 0;
}`;
    const r = analizar(codigo, REGLAS, CASOS);
    expect(r.ok).toBe(false);
    expect(r.errores.some((e) => e.mensaje.includes("limite"))).toBe(true);
  });

  it("reporta los errores de sintaxis con su linea", () => {
    const r = analizar("int main() { if (edad { } }", REGLAS, CASOS);
    expect(r.ok).toBe(false);
    expect(r.errores.length).toBeGreaterThan(0);
    expect(r.errores[0].linea).toBeGreaterThan(0);
  });

  it("avisa de los caracteres que no son del lenguaje", () => {
    const r = analizar("int edad = 18 @ 20;", REGLAS, CASOS);
    expect(r.ok).toBe(false);
    expect(r.errores.some((e) => e.mensaje.includes("@"))).toBe(true);
  });

  it("descarta los comentarios y no los toma por codigo", () => {
    const codigo = `// un comentario
int main() { /* otro */ int edad = 18; return 0; }`;
    const r = analizar(codigo, REGLAS, CASOS);
    // no hay error de sintaxis por los comentarios
    expect(r.errores.filter((e) => /comentario/i.test(e.mensaje))).toEqual([]);
  });

  it("acepta cualquier valor inicial: manda el caso de prueba", () => {
    // el valor inicial da igual: lo que cuenta es el caso de prueba
    const codigo = SOLUCION.replace("int edad = 18;", "int edad = 0;");
    const r = analizar(codigo, REGLAS, CASOS);
    expect(r.casos.every((c) => c.coincide)).toBe(true);
  });

  it("el caso limite es el que separa >= de >", () => {
    const conMayor = analizar(SOLUCION, REGLAS, CASOS);
    const conEstricto = analizar(SOLUCION.replace(">=", ">"), REGLAS, CASOS);
    expect(conMayor.casos.find((c) => c.nombre === "edad = 18")?.coincide).toBe(true);
    expect(conEstricto.casos.find((c) => c.nombre === "edad = 18")?.coincide).toBe(false);
    // los otros dos casos pasan igual con > que con >=
    expect(conEstricto.casos.find((c) => c.nombre === "edad = 20")?.coincide).toBe(true);
    expect(conEstricto.casos.find((c) => c.nombre === "edad = 15")?.coincide).toBe(true);
  });

  it("el analisis es rapido: menos de 50 ms por caso", () => {
    const r = analizar(SOLUCION, REGLAS, CASOS);
    expect(r.duracionMs).toBeLessThan(50);
  });
});
