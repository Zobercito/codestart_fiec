-- ═══════════════════════════════════════════════════════════════
-- A5 · Integridad de pistas y respuestas guardadas
--
-- 1. `retos.pistas` deja de ser legible por el cliente. Las pistas se
--    piden una a una a `POST /api/retos/[id]/pista`, que mueve el
--    contador con service_role y devuelve solo la pista nueva. Si la
--    columna siguiera concedida, el estudiante podría leer todas las
--    pistas sin pagar los 10 puntos.
--
-- 2. Los intentos ya guardados no deben contener la respuesta correcta:
--    el estudiante puede leer sus propios `intentos.resultado` con su
--    JWT. Se eliminan `correctas` (selección múltiple) y `detalle`
--    (evaluación, autocompletado y ordenamiento). El detalle completo
--    sigue devolviéndose en la respuesta HTTP para la retroalimentación.
--    El docente conserva `error_detectado` y `regla_incumplida`.
--
-- La migración es idempotente.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Pistas fuera del alcance del cliente ─────────────────────
revoke select (pistas) on public.retos from authenticated;
revoke select (pistas) on public.retos from anon;

-- ── 2. Sanear los resultados existentes ─────────────────────────
update public.intentos
set resultado = resultado - 'correctas'
where resultado ? 'correctas';

update public.intentos
set resultado = resultado - 'detalle'
where resultado ? 'detalle';

comment on column public.retos.pistas is
  'Pistas del reto. Solo las lee el servidor; el cliente recibe una a una por /api/retos/[id]/pista.';
