-- ═══════════════════════════════════════════════════════════════
-- A5 · Integridad de la verificación (L2, L3, L4)
--
-- Tres fugas cerradas:
--
--   1. `retos.reglas` contiene las respuestas correctas de todos los
--      retos. Deja de ser legible con el JWT del usuario: la leen solo
--      las rutas del servidor con service_role.
--
--   2. `intentos` y `progresos` se podían insertar desde el cliente.
--      Un estudiante podía falsificar un acierto, sus puntos o una
--      insignia. La escritura queda solo en el servidor.
--
--   3. `codigos.pistas_usadas` se podía reescribir desde el cliente,
--      así que revelar una pista y luego mandar 0 evitaba el descuento.
--      El cliente solo puede escribir el código; las pistas las mueve
--      el endpoint POST /api/retos/[id]/pista con service_role.
--
-- `casos` se queda visible a propósito: la pantalla del reto los
-- muestra como ejemplos del enunciado. `reglas` es lo que no puede
-- salir del servidor.
-- ═══════════════════════════════════════════════════════════════

-- ── 1.3 · reglas fuera del alcance del cliente ─────────────────
revoke select on public.retos from anon, authenticated;

grant select (
  id,
  leccion_id,
  tipo,
  enunciado,
  enunciado_detalle,
  casos,
  pistas,
  puntos,
  intentos_maximos,
  orden,
  creado_en
) on public.retos to authenticated;

-- ── 1.4 · intentos y progresos solo desde el servidor ──────────
revoke insert, update, delete on public.intentos from anon, authenticated;
revoke insert, update, delete on public.progresos from anon, authenticated;

-- ── 1.2 · el borrador no puede tocar las pistas ni borrarse ────
-- Borrar la fila y recrearla también reiniciaría el contador.
revoke insert, update, delete on public.codigos from anon, authenticated;

grant insert (usuario_id, reto_id, codigo, actualizado_en)
  on public.codigos to authenticated;

grant update (codigo, actualizado_en)
  on public.codigos to authenticated;
