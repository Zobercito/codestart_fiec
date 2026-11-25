# Guía de mantenimiento — CodeStart FIEC 1.0

**Última actualización:** 24/11/2026

## 1. Rutina semanal

- Revisar `/api/salud` (debe responder 200 y `{ok:true}`).
- Revisar los logs de Vercel y el estado del proyecto Supabase.
- Comprobar que el monitor externo tiene historial (RNF05).
- Revisar intentos y errores del panel docente; si un reto tiene una tasa anómala, revisar su contenido.
- No ejecutar `db:seed` sobre datos reales.

## 2. Contenido

Las lecciones son MDX en `src/content/lecciones/`. Para corregir o ampliar una lección:

1. Edita el `.mdx`.
2. Ejecuta `npm run typecheck && npm run lint && npm run build`.
3. Revisa la página en local y en preview.
4. Haz commit y despliega.
5. Si añades una lección, actualiza `lecciones` en la migración/seed y el orden; el progreso se calcula por lecciones reales.

Los retos y evaluaciones están en `retos.reglas` (JSONB). No los edites desde el cliente. Si cambias reglas, actualiza también los casos y prueba el motor.

## 3. Migraciones

- Las migraciones viven en `supabase/migrations/` y se aplican en orden.
- Antes de aplicar: respaldo y revisión del SQL.
- `npm run db:migrate` usa la CLI de Supabase y el proyecto vinculado; si falla por PAT, aplica el SQL con `psql`/`pg` y `SUPABASE_DB_URL`.
- Después de una migración: `npm run db:types`, `typecheck`, `test:rls` y smoke test.
- No edites una migración ya aplicada; crea una nueva.

## 4. Respaldos

- Activa los respaldos automáticos del plan de Supabase.
- Respaldo manual recomendado (requiere `pg_dump` instalado):

```bash
mkdir -p respaldos
pg_dump "$SUPABASE_DB_URL" --no-owner --no-privileges \
  > "respaldos/codestart-fiec_$(date +%Y-%m-%d_%H%M).sql"
```

- Guarda el archivo fuera del repositorio y con acceso restringido.
- Restauración: crea una base nueva, aplica el dump, ejecuta `npm run test:rls` y un smoke test antes de apuntar producción a la copia.
- **No se ha probado una restauración completa en este entorno** (no hay `pg_dump` instalado); es una tarea pendiente de la entrega.

## 5. Monitorización e incidentes

- Monitor externo cada 5 minutos sobre `/api/salud`.
- Si `/api/salud` devuelve 503: comprobar estado de Supabase, variables de Vercel y límites del plan.
- Si el login falla: comprobar Auth, DNS del proyecto, claves y estado del proyecto.
- Si un deploy rompe: rollback al deployment anterior en Vercel y avisar al equipo.
- Registrar fecha, causa, impacto y acción en el informe de incidentes.

## 6. Seguridad

- Rotar `DEMO_PASSWORD` si se filtra; actualizar `.env.local`, Vercel y las cuentas demo.
- Rotar `SUPABASE_SERVICE_ROLE_KEY` solo con coordinación; actualizar Vercel y scripts.
- No versionar `.env.local`, respaldos ni salidas de validación con datos personales.
- Revisar `npm audit --omit=dev` en cada cierre; Next 16.4.1 tiene avisos conocidos (actualizar a 16.4.6 cuando se valide).
- Revisar RLS después de cada migración.

## 7. Dependencias y versión

- `package-lock.json` se versiona; usar `npm ci` en CI.
- Node recomendado: 20+ (probado con 26); CI usa 22.
- Antes de un tag: `typegen`, `lint`, `typecheck`, `test`, `build`, `test:e2e`, `test:rls`, `test:seguridad`, `auditar:contraste`.
- El tag se crea sobre un commit limpio y se despliega; el README debe coincidir con la versión.

## 8. Roadmap posterior a la 1.0

- Completar `m01`, `m02` y `m04` con el experto.
- Función SQL `panorama_grupo` y prueba de carga de 100 usuarios.
- WebKit/Edge en CI y revisión manual de accesibilidad.
- Exportación CSV (RF17), editor de contenidos (RF18) e interfaz de administración (RF08).
- Motor de C nivel 2 (bucles/arreglos) o ejecución aislada.
- Monitor de disponibilidad con historial y plan de incidentes formal.
