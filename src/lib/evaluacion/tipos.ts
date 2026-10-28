/**
 * Evaluaciones de módulo y evaluación final.
 *
 * Una evaluación es un reto de selección múltiple con varias preguntas.
 * Se guarda en `retos.reglas` para no crear una tabla nueva: el modo
 * (`autoevaluacion` o `final`) y el módulo al que pertenece van dentro
 * del JSON. El cliente recibe las preguntas sin la respuesta correcta;
 * el servidor califica.
 */

export type OpcionEvaluacion = {
  id: string;
  texto: string;
};

export type PreguntaEvaluacion = {
  id: string;
  enunciado: string;
  opciones: OpcionEvaluacion[];
  correcta: string;
  area: string;
  explicacion?: string;
};

export type ReglasEvaluacion = {
  modo: "autoevaluacion" | "final";
  modulo?: number;
  titulo?: string;
  umbral?: number;
  preguntas: PreguntaEvaluacion[];
};

/** Lo que viaja al navegador antes de responder: sin respuestas. */
export type PreguntaPublica = {
  id: string;
  enunciado: string;
  opciones: OpcionEvaluacion[];
  area: string;
};
