/**
 * Formateo de fechas, sin Date.
 *
 * Next.js marca `new Date()` y `Date.now()` como valores inestables y
 * rompe el prerenderizado cuando aparecen en un componente. Ademas,
 * `toLocaleDateString` depende del locale y de la zona horaria del
 * servidor, asi que el mismo codigo daria fechas distintas en cada
 * despliegue.
 *
 * Aqui se formatea a mano desde la cadena ISO, que es lo que guarda la
 * base de datos (columnas date).
 */

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

/** "2026-07-16" -> "16 de julio de 2026" */
export function formatearFecha(iso: string): string {
  const partes = iso.split("-");
  if (partes.length !== 3) return iso;
  const [anio, mes, dia] = partes.map(Number);
  const nombreMes = MESES[mes - 1];
  if (!nombreMes) return iso;
  return `${dia} de ${nombreMes} de ${anio}`;
}

/** "2026-07-16" -> "16 jul" */
export function formatearFechaCorta(iso: string): string {
  const partes = iso.split("-");
  if (partes.length !== 3) return iso;
  const [, mes, dia] = partes.map(Number);
  const nombreMes = MESES[mes - 1];
  if (!nombreMes) return iso;
  return `${dia} ${nombreMes.slice(0, 3)}`;
}

/**
 * Fecha de hoy en la zona del curso (America/Panama), en formato ISO.
 *
 * `new Date().toISOString()` usa UTC: a partir de las 19:00 de Panamá ya
 * es el día siguiente, y una tarea con entrega hoy se marcaba vencida.
 */
export function fechaISOEnPanama(fecha = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Panama",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(fecha);
}

/** Convierte un timestamp ISO a la fecha de Panamá (YYYY-MM-DD). */
export function fechaDeTimestampEnPanama(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return iso.slice(0, 10);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Panama",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(fecha);
}
