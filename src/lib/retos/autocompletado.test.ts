import { describe, expect, it } from "vitest";
import {
  corregirAutocompletado,
  type ReglasAutocompletado,
} from "./autocompletado";

const reglas: ReglasAutocompletado = {
  plantilla: "if ({{condicion}}) { {{accion}}; }",
  blancos: [
    {
      id: "condicion",
      etiqueta: "Condición",
      opciones: ["edad >= 18", "edad < 18"],
      correcta: "edad >= 18",
      explicacion: "La mayoría de edad empieza en 18.",
    },
    {
      id: "accion",
      etiqueta: "Acción",
      opciones: ["printf", "scanf"],
      correcta: "printf",
      explicacion: "printf escribe en la salida.",
    },
  ],
};

describe("corregirAutocompletado", () => {
  it("acepta todas las respuestas correctas", () => {
    const resultado = corregirAutocompletado(
      { condicion: "edad >= 18", accion: "printf" },
      reglas,
    );
    expect(resultado.acierto).toBe(true);
    expect(resultado.correctas).toBe(2);
    expect(resultado.mensaje).toBeNull();
  });

  it("detecta el blanco incorrecto y explica cuál es", () => {
    const resultado = corregirAutocompletado(
      { condicion: "edad < 18", accion: "printf" },
      reglas,
    );
    expect(resultado.acierto).toBe(false);
    expect(resultado.correctas).toBe(1);
    const condicion = resultado.detalle.find((d) => d.id === "condicion");
    expect(condicion?.correcto).toBe(false);
    expect(condicion?.correcta).toBe("edad >= 18");
  });

  it("trata un blanco vacío como incorrecto", () => {
    const resultado = corregirAutocompletado({ condicion: "" }, reglas);
    expect(resultado.acierto).toBe(false);
    expect(resultado.correctas).toBe(0);
  });

  it("no aprueba si no hay blancos", () => {
    const resultado = corregirAutocompletado({}, { plantilla: "", blancos: [] });
    expect(resultado.acierto).toBe(false);
  });
});
