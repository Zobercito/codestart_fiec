/**
 * Iconos de los modulos del curso.
 *
 * Son los mismos del mockup del Avance 2: linea de 24x24, trazo de 1.6
 * y el color lo pone el contenedor.
 */
const trazo = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
} as const;

export function IconoModulo({ orden }: { orden: number }) {
  const clase = "h-11 w-11 text-white/85";

  switch (orden) {
    case 1:
      // monitor
      return (
        <svg className={clase} viewBox="0 0 24 24" aria-hidden="true">
          <rect x="2" y="4" width="20" height="13" rx="2" {...trazo} />
          <path d="M8 21h8M12 17v4" {...trazo} />
          <path d="M6 8h5M6 11h8" {...trazo} />
        </svg>
      );
    case 2:
      // nodos conectados
      return (
        <svg className={clase} viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="3" width="6" height="6" rx="1.5" {...trazo} />
          <rect x="15" y="15" width="6" height="6" rx="1.5" {...trazo} />
          <path d="M9 6h6a3 3 0 013 3v6M6 9v6a3 3 0 003 3h6" {...trazo} />
        </svg>
      );
    case 3:
      // chevrones: el codigo que se ejecuta
      return (
        <svg className={clase} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 6l-5 6 5 6M16 6l5 6-5 6" {...trazo} />
        </svg>
      );
    case 4:
      // variable / bloque de memoria
      return (
        <svg className={clase} viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="2" {...trazo} />
          <path d="M3 9h18M8 4v5" {...trazo} />
        </svg>
      );
    case 5:
      // control de flujo: flecha que se desvía
      return (
        <svg className={clase} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 4l16 16M9.5 5.5A7 7 0 0119 12a6.9 6.9 0 01-1.2 3.8M6 8a7 7 0 00.5 8.3" {...trazo} />
        </svg>
      );
    case 6:
      // arreglos
      return (
        <svg className={clase} viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="4" width="7" height="16" rx="1.5" {...trazo} />
          <rect x="14" y="4" width="7" height="16" rx="1.5" {...trazo} />
          <path d="M6 9h1M6 13h1M17 9h1M17 13h1" {...trazo} />
        </svg>
      );
    case 7:
      // taller: herramientas
      return (
        <svg className={clase} viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M14.7 6.3a4 4 0 01-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 015.4-5.4l-2.4 2.4"
            {...trazo}
          />
        </svg>
      );
    case 8:
      // medalla
      return (
        <svg className={clase} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="9" r="6" {...trazo} />
          <path d="M8.2 14.3L7 22l5-3 5 3-1.2-7.7" {...trazo} />
        </svg>
      );
    default:
      return (
        <svg className={clase} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" {...trazo} />
        </svg>
      );
  }
}
