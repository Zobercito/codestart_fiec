# Manual del administrador — CodeStart FIEC

**Versión:** 1.0.0 · **Última actualización:** 24/11/2026

La versión 1.0 **no incluye una interfaz de administración**. La administración se hace desde Supabase y desde los scripts del repositorio. Este manual describe el procedimiento seguro.

## 1. Antes de tocar producción

1. Confirma que estás en el proyecto correcto: `vorhdykyfnklwcfwhfme` (Supabase) y `codestart-fiec.vercel.app` (Vercel).
2. Haz un respaldo de la base (ver `docs/MANTENIMIENTO.md`).
3. No ejecutes `db:seed` sobre una base con datos reales: borra progresos, intentos, insignias, grupos y contenido.
4. No pegues claves en el chat, en issues ni en archivos versionados.

## 2. Altas de estudiantes y docentes

El flujo previsto es el script de cuentas:

```bash
DEMO_PASSWORD='<contraseña-temporal>' npm run db:usuarios
```

El script crea las cuentas de demostración y sincroniza perfil y metadato. Para un curso real, el equipo debe ampliar la lista de usuarios del script o crear las cuentas desde **Supabase → Authentication → Users** con el correo institucional.

El alta pública está deshabilitada. Si se habilita, el trigger crea siempre un **estudiante**; no confía en `user_metadata.rol`.

## 3. Cambiar un rol

Usa la RPC `cambiar_rol` con `service_role` (o desde una sesión admin). Nunca cambies `perfiles.rol` con un `UPDATE` directo sin pasar por la RPC: la RPC sincroniza también `auth.users.raw_user_meta_data.rol`, que es lo que usa el enrutado inicial.

```sql
select public.cambiar_rol('<uuid-del-usuario>', 'docente');
```

Roles válidos: `estudiante`, `docente`, `admin`.

## 4. Grupos

- Un grupo pertenece a un docente (`grupos.docente_id`).
- El código de inscripción es único y se comparte con los estudiantes.
- Un estudiante se inscribe con la RPC `unirse_por_codigo(codigo)`.
- El docente puede crear grupos desde el panel; la administración puede consultarlos en Supabase.

## 5. Contenido

El contenido de las lecciones es **MDX versionado** en `src/content/lecciones/`. La base guarda la ruta del archivo en `lecciones.archivo_contenido`. Cambiar una lección es un commit y un despliegue, no una edición en la base.

Los retos y evaluaciones viven en `retos.reglas` (JSONB); solo los lee el servidor. No edites `reglas` desde el cliente.

## 6. Respaldos y restauración

- Activa los respaldos automáticos del plan de Supabase.
- Antes de una migración o un seed, guarda un `pg_dump` (esquema + datos) en un destino fuera del repositorio.
- Prueba la restauración en una base nueva antes de confiar en el respaldo.
- La guía completa está en `docs/MANTENIMIENTO.md` y el script previsto en `scripts/respaldar.sh`.

## 7. Seguridad

- `SUPABASE_SERVICE_ROLE_KEY` solo en el servidor y en scripts locales; nunca con prefijo `NEXT_PUBLIC_`.
- La `anon key` es pública por diseño; lo que protege los datos es RLS.
- Revisa que RLS esté activo en las 11 tablas después de cualquier migración.
- Rota `DEMO_PASSWORD` si se filtró y actualiza las cuentas de demostración.
- No borres usuarios con `DELETE` directo si tienen grupos: la FK `on delete restrict` lo impedirá; reasigna o elimina primero los grupos.

## 8. Operación

- Salud: `GET /api/salud` (200 con base arriba, 503 si no).
- Monitor: configurar un monitor externo cada 5 minutos sobre `/api/salud`.
- Incidentes: revisar logs de Vercel, estado de Supabase y el último despliegue; si el fallo es de código, hacer rollback al deployment anterior.
- Región: Vercel debe estar en `pdx1` (us-west-2) para coincidir con el pooler de Supabase.

## 9. Limitaciones conocidas de la 1.0

- No hay interfaz de administración.
- No hay exportación CSV (RF17) ni editor de contenidos (RF18).
- La validación de C no ejecuta código; analiza un subconjunto.
- RNF04, RNF05 y RNF08 no están cerrados; consulta `docs/INFORME_A5.md`.
