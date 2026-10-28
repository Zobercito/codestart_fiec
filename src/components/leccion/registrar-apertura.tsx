"use client";

import { useEffect, useRef } from "react";
import { marcarLeccionEnProgreso } from "@/lib/progreso/acciones";

/**
 * Marca la lección como "en progreso" al abrirla.
 *
 * La escritura no ocurre durante el render del Server Component: se
 * hace en un efecto del cliente. El ref evita repetir la llamada si el
 * componente se vuelve a renderizar.
 */
export function RegistrarApertura({
  leccionId,
  activo,
}: {
  leccionId: string;
  activo: boolean;
}) {
  const yaRegistrada = useRef(false);

  useEffect(() => {
    if (!activo || yaRegistrada.current) return;
    yaRegistrada.current = true;

    void marcarLeccionEnProgreso(leccionId).catch(() => {
      // Si falla, la lección sigue siendo legible. El botón explícito
      // de "Marcar como vista" vuelve a intentarlo.
    });
  }, [activo, leccionId]);

  return null;
}
