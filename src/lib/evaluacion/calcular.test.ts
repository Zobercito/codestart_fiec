import { describe, expect, it } from "vitest";
import { calcularEvaluacion } from "./calcular";
import type { PreguntaEvaluacion } from "./tipos";

const preguntas: PreguntaEvaluacion[] = [
  {
    id: "p1",
    enunciado: "¿Qué hace printf?",
    opciones: [
      { id: "a", texto: "Lee datos" },
      { id: "b", texto: "Escribe en la salida" },
    ],
    correcta: "b",
    area: "Entrada y salida",
  },
  {
    id: "p2",
    enunciado: "¿Qué tipo guarda un entero?",
    opciones: [
      { id: "a", texto: "int" },
      { id: "b", texto: "char" },
    ],
    correcta: "a",
    area: "Tipos de datos",
  },
  {
    id: "p3",
    enunciado: "¿Qué operador compara igualdad?",
    opciones: [
      { id: "a", texto: "=" },
      { id: "b", texto: "==" },
    ],
    correcta: "b",
    area: "Operadores",
  },
];

describe("calcularEvaluacion", () => {
  it("aprueba con todas las respuestas correctas", () => {
    const resultado = calcularEvaluacion(
      preguntas,
      { p1: "b", p2: "a", p3: "b" },
      60,
    );
    expect(resultado.aprobado).toBe(true);
    expect(resultado.puntaje).toBe(3);
    expect(resultado.porcentaje).toBe(100);
    expect(resultado.areasAReforzar).toEqual([]);
    expect(resultado.mensaje).toContain("Aprobaste");
  });

  it("no aprueba por debajo del umbral y nombra las áreas a reforzar", () => {
    const resultado = calcularEvaluacion(preguntas, { p1: "a", p2: "a" }, 60);
    expect(resultado.aprobado).toBe(false);
    expect(resultado.puntaje).toBe(1);
    expect(resultado.porcentaje).toBe(33);
    expect(resultado.areasAReforzar).toContain("Entrada y salida");
    expect(resultado.areasAReforzar).not.toContain("Tipos de datos");
    expect(resultado.mensaje).toContain("33");
  });

  it("trata una respuesta vacía como incorrecta", () => {
    const resultado = calcularEvaluacion(preguntas, { p1: "" }, 60);
    expect(resultado.detalle[0].acierto).toBe(false);
    expect(resultado.detalle[0].elegida).toBeNull();
  });

  it("no aprueba una evaluación sin preguntas", () => {
    const resultado = calcularEvaluacion([], {}, 60);
    expect(resultado.aprobado).toBe(false);
    expect(resultado.total).toBe(0);
    expect(resultado.mensaje).toContain("no tiene preguntas");
  });

  it("respeta un umbral distinto", () => {
    const resultado = calcularEvaluacion(
      preguntas,
      { p1: "b", p2: "a", p3: "a" },
      70,
    );
    expect(resultado.porcentaje).toBe(67);
    expect(resultado.aprobado).toBe(false);
    expect(resultado.umbral).toBe(70);
  });
});
