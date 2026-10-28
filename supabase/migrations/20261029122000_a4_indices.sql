-- ═══════════════════════════════════════════════════════════════
-- CodeStart FIEC · Avance 4 · Índices para progreso y panel
--
-- Las consultas del panel agrupan por usuario y estado, y ordenan por
-- fecha. Los índices existentes cubren la clave foránea, no ese patrón.
-- ═══════════════════════════════════════════════════════════════

create index if not exists idx_progresos_usuario_estado
  on public.progresos (usuario_id, estado);

create index if not exists idx_intentos_usuario_fecha
  on public.intentos (usuario_id, fecha desc);

create index if not exists idx_insignias_usuario_fecha
  on public.insignias (usuario_id, fecha desc);
