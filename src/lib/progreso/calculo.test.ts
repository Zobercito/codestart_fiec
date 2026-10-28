import { describe, expect, it } from "vitest";
import { calcularEstadosModulos, porcentajeModulo } from "./calculo";

function modulo(
  orden: number,
  completadas: number,
  total = 4,
  enProgreso = false,
) {
  return { id: `m${orden}`, orden, total, completadas, enProgreso };
}

describe("calcularEstadosModulos", () => {
  it("calcula 0, 25, 50 y 100 % con 4 lecciones", () => {
    const { modulos } = calcularEstadosModulos([
      modulo(1, 0),
      modulo(2, 1),
      modulo(3, 2),
      modulo(4, 4),
    ]);

    expect(modulos.map((m) => m.estado)).toEqual([
      "pendiente",
      "en_progreso",
      "en_progreso",
      "completado",
    ]);
    expect(modulos.map(porcentajeModulo)).toEqual([0, 25, 50, 100]);
  });

  it("bloquea los módulos siguientes si el anterior no está completo", () => {
    const { modulos } = calcularEstadosModulos([
      modulo(1, 1),
      modulo(2, 0),
      modulo(3, 0),
    ]);

    expect(modulos.map((m) => m.estado)).toEqual([
      "en_progreso",
      "bloqueado",
      "bloqueado",
    ]);
  });

  it("un módulo vacío no se marca completado ni bloquea la cadena", () => {
    const { modulos } = calcularEstadosModulos([
      modulo(1, 4),
      modulo(2, 0, 0),
      modulo(3, 0, 2),
    ]);

    expect(modulos.map((m) => m.estado)).toEqual([
      "completado",
      "pendiente",
      "pendiente",
    ]);
  });

  it("devuelve como módulo en curso el primero con contenido si no hay uno en progreso", () => {
    const { moduloEnCurso } = calcularEstadosModulos([
      modulo(1, 4),
      modulo(2, 0, 0),
      modulo(3, 0, 2),
    ]);

    expect(moduloEnCurso?.orden).toBe(3);
  });

  it("no elige un módulo vacío como módulo en curso", () => {
    const { moduloEnCurso } = calcularEstadosModulos([
      modulo(1, 4),
      modulo(2, 0, 0),
    ]);

    expect(moduloEnCurso).toBeNull();
  });
});

describe("porcentajeModulo", () => {
  it("no divide por cero", () => {
    expect(porcentajeModulo({ total: 0, completadas: 0 })).toBe(0);
  });

  it("redondea al entero más cercano", () => {
    expect(porcentajeModulo({ total: 3, completadas: 1 })).toBe(33);
  });
});
