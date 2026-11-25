import { describe, expect, it } from "vitest";
import type { ResultadoEvaluacion } from "@/lib/evaluacion/calcular";
import type { ResultadoAnalisis } from "@/lib/validacion/tipos";
import type { ResultadoAutocompletado } from "./autocompletado";
import {
  resultadoAutocompletadoParaGuardar,
  resultadoCodigoParaGuardar,
  resultadoEvaluacionParaGuardar,
  resultadoOrdenamientoParaGuardar,
  resultadoSeleccionParaGuardar,
} from "./resultado";
import type { ResultadoOrdenamiento } from "./ordenamiento";

const evaluacion: ResultadoEvaluacion = {
  aprobado: false,
  puntaje: 1,
  total: 2,
  porcentaje: 50,
  umbral: 60,
  areas: [{ area: "Anatomía", correctas: 1, total: 2, porcentaje: 50 }],
  areasAReforzar: ["Anatomía"],
  mensaje: "Obtuviste 50 %.",
  detalle: [
    {
      id: "p1",
      enunciado: "¿Qué hace?",
      area: "Anatomía",
      elegida: "a",
      elegidaTexto: "Traduce",
      correcta: "b",
      correctaTexto: "Ejecuta",
      acierto: false,
      explicacion: "La respuesta correcta es b.",
    },
  ],
};

const autocompletado: ResultadoAutocompletado = {
  acierto: false,
  correctas: 1,
  total: 2,
  mensaje: "Completaste 1 de 2 espacios correctamente.",
  detalle: [
    {
      id: "condicion",
      etiqueta: "Condición",
      respuesta: "i < 5",
      correcta: "i <= 5",
      correcto: false,
      explicacion: "Con <= 5 el ciclo incluye el 5.",
    },
  ],
};

const ordenamiento: ResultadoOrdenamiento = {
  acierto: false,
  correctas: 1,
  total: 2,
  mensaje: "Hay 1 de 2 pasos en la posición correcta.",
  detalle: [{ posicion: 1, elementoId: "b", correcto: false }],
};

const codigo: ResultadoAnalisis = {
  ok: false,
  salidas: [],
  duracionMs: 1,
  errores: [{ mensaje: "La comparación usa «>».", linea: 4 }],
  casos: [
    {
      nombre: "edad = 18",
      coincide: false,
      salida_esperada: "Mayor de edad",
      salida_obtenida: "Menor de edad",
      camino: [],
      reglaIncumplida: "comparaciones",
    },
  ],
};

describe("saneo de intentos.resultado", () => {
  it("la selección múltiple no guarda la lista de correctas", () => {
    const guardado = JSON.stringify(resultadoSeleccionParaGuardar("a"));
    expect(guardado).not.toContain("correctas");
    expect(guardado).toContain("a");
  });

  it("la evaluación no guarda el detalle con la respuesta correcta", () => {
    const guardado = resultadoEvaluacionParaGuardar(evaluacion);
    expect(guardado).not.toHaveProperty("detalle");
    expect(JSON.stringify(guardado)).not.toContain('"correcta"');
    expect(guardado).toMatchObject({ puntaje: 1, total: 2 });
  });

  it("el autocompletado no guarda el detalle con la respuesta correcta", () => {
    const guardado = resultadoAutocompletadoParaGuardar(autocompletado);
    expect(guardado).not.toHaveProperty("detalle");
    expect(JSON.stringify(guardado)).not.toContain('"correcta"');
    expect(guardado).toMatchObject({ acierto: false, correctas: 1, total: 2 });
  });

  it("el ordenamiento no guarda el detalle de posiciones", () => {
    const guardado = resultadoOrdenamientoParaGuardar(ordenamiento);
    expect(guardado).not.toHaveProperty("detalle");
    expect(guardado).toMatchObject({ acierto: false, correctas: 1, total: 2 });
  });

  it("el código guarda diagnóstico y regla incumplida, no reglas", () => {
    const guardado = resultadoCodigoParaGuardar(codigo);
    expect(guardado).toMatchObject({
      regla_incumplida: "comparaciones",
      errores: [{ mensaje: "La comparación usa «>».", linea: 4 }],
    });
    expect(JSON.stringify(guardado)).not.toContain("reglas");
  });
});
