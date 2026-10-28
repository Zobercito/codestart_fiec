/**
 * Catálogo de insignias.
 *
 * El tipo es el contrato con la base de datos; el nombre, el icono y la
 * descripción son presentación. Las insignias antiguas que no estén en
 * el catálogo se muestran con un texto de respaldo, no se ocultan.
 */

export type InsigniaCatalogo = {
  tipo: string;
  nombre: string;
  descripcion: string;
  icono: string;
};

const MODULOS = [
  "Introducción a la informática",
  "Algoritmos",
  "De la idea al programa",
  "Variables y tipos de datos",
  "Estructuras de control",
  "Estructuras de datos",
  "Taller integrador",
  "Evaluación final",
];

export const CATALOGO_INSIGNIAS: InsigniaCatalogo[] = [
  {
    tipo: "primer_reto",
    nombre: "Primer reto",
    descripcion: "Aprobaste tu primer reto en la plataforma.",
    icono: "🎯",
  },
  ...MODULOS.map((nombre, indice) => ({
    tipo: `modulo_${indice + 1}`,
    nombre: `Módulo ${indice + 1}`,
    descripcion: `Completaste el módulo ${indice + 1}: ${nombre}.`,
    icono: "📘",
  })),
  {
    tipo: "curso",
    nombre: "Curso completo",
    descripcion: "Completaste todas las lecciones de los ocho módulos.",
    icono: "🏁",
  },
];

export function obtenerInsignia(tipo: string): InsigniaCatalogo {
  return (
    CATALOGO_INSIGNIAS.find((insignia) => insignia.tipo === tipo) ?? {
      tipo,
      nombre: tipo,
      descripcion: "Insignia obtenida.",
      icono: "🏅",
    }
  );
}
