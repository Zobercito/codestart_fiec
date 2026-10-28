import { describe, expect, it } from "vitest";
import { corregirOrdenamiento, type ReglasOrdenamiento } from "./ordenamiento";

const reglas: ReglasOrdenamiento = {
  elementos: [
    { id: "a", texto: "Leer la entrada" },
    { id: "b", texto: "Calcular el resultado" },
    { id: "c", texto: "Mostrar la salida" },
  ],
  correctas: ["a", "b", "c"],
};

describe("corregirOrdenamiento", () => {
  it("acepta el orden correcto", () => {
    const resultado = corregirOrdenamiento(["a", "b", "c"], reglas);
    expect(resultado.acierto).toBe(true);
    expect(resultado.correctas).toBe(3);
    expect(resultado.total).toBe(3);
    expect(resultado.mensaje).toBeNull();
  });

  it("cuenta las posiciones correctas sin aprobar", () => {
    const resultado = corregirOrdenamiento(["a", "c", "b"], reglas);
    expect(resultado.acierto).toBe(false);
    expect(resultado.correctas).toBe(1);
    expect(resultado.detalle.map((d) => d.correcto)).toEqual([true, false, false]);
    expect(resultado.mensaje).toContain("1 de 3");
  });

  it("rechaza un orden incompleto o con ids desconocidos", () => {
    expect(corregirOrdenamiento(["a", "b"], reglas).acierto).toBe(false);
    expect(corregirOrdenamiento(["a", "b", "z"], reglas).acierto).toBe(false);
  });

  it("no aprueba una lista vacía", () => {
    const resultado = corregirOrdenamiento([], reglas);
    expect(resultado.acierto).toBe(false);
    expect(resultado.correctas).toBe(0);
  });
});
