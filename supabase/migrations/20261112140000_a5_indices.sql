-- ═══════════════════════════════════════════════════════════════
-- A5 · Índices que faltaban para el panel y la verificación (RNF08)
--
-- Los índices del A4 cubren usuario+fecha. Estas consultas nuevas
-- filtran por reto, por grupo y por módulo, y no tenían índice.
-- Todos son idempotentes y no bloquean la tabla (CREATE INDEX normal
-- es suficiente por el tamaño actual; en producción grande se usaría
-- CONCURRENTLY, que no corre dentro de una transacción).
-- ═══════════════════════════════════════════════════════════════

-- Contar intentos de un usuario en un reto (verificar/route.ts).
create index if not exists idx_intentos_usuario_reto
  on public.intentos (usuario_id, reto_id);

-- Inscripciones por grupo (panel y seguimiento).
create index if not exists idx_inscripciones_grupo
  on public.inscripciones (grupo_id);

-- Lecciones por módulo, en orden (ruta de módulos).
create index if not exists idx_lecciones_modulo_orden
  on public.lecciones (modulo_id, orden);

-- Retos por lección (catálogo y detalle).
create index if not exists idx_retos_leccion
  on public.retos (leccion_id);

-- Asignaciones por grupo, de la más reciente a la más antigua.
create index if not exists idx_asignaciones_grupo_fecha
  on public.asignaciones (grupo_id, creado_en desc);

-- Progresos por lección (agregaciones del panel).
create index if not exists idx_progresos_leccion
  on public.progresos (leccion_id);
