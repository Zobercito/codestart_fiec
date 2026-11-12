# Línea base — Fase 0 del A5

**Fecha:** 12 de noviembre de 2026  
**Rama:** `main`  
**Commit base:** `806fc90`  
**Versión:** `v0.2.0-beta`

## Comandos ejecutados

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Resultados

| Comando | Resultado | Detalle |
|---------|-----------|---------|
| `typecheck` | ✅ PASÓ | Sin errores de TypeScript |
| `lint` | ✅ PASÓ | Sin errores de ESLint |
| `test` | ✅ PASÓ | 5 archivos, 33 pruebas, 0 fallos, 381 ms |
| `build` | ✅ PASÓ | 19 rutas generadas, compilación exitosa |

## Pruebas no ejecutadas (requieren servidor + BD real)

- `npm run test:e2e` — requiere servidor en producción y credenciales demo
- `npm run test:rls` — requiere `SUPABASE_DB_URL` y base de datos real
- `npm run test:seguridad` — requiere `SUPABASE_DB_URL` y usuarios demo
- `npm run auditar:contraste` — requiere servidor corriendo en `http://localhost:3000`

Estas pruebas se declaran como **no ejecutadas en esta fase**; la evidencia previa está en `docs/INFORME_PRUEBAS.md` del A4.

## Cambios de la Fase 0

1. ✅ Versionado `docs/subplan_a5.md`
2. ✅ Borrados `scripts/tmp-probar-docente.mjs` y `scripts/tmp-ver-grupo.mjs`
3. ✅ Corregido `AGENTS.md:13` (Avance 3 → Avance 4)
4. ✅ Corregido `package.json:54` (alfa → beta)
5. ✅ Documentado `SUPABASE_DB_URL` en `.env.example`
6. ✅ Línea base ejecutada y guardada

## Estado de git tras Fase 0

```
M  .gitignore
M  AGENTS.md
A  docs/subplan_a5.md
A  docs/LINEA_BASE_FASE_0.md
M  package.json
M  .env.example
?? .agents/
?? skills-lock.json
```

Los archivos `M .gitignore` y `M AGENTS.md` pre-existían antes de la Fase 0; los cambios de esta fase son solo los de versión y documentación.

## Definición de terminado

✅ Scripts temporales borrados  
✅ Subplan versionado  
✅ Referencias a "Avance 3" / "alfa" corregidas  
✅ `SUPABASE_DB_URL` documentada  
✅ Línea base técnica (typecheck, lint, test, build) en verde  
✅ Evidencia guardada en `docs/LINEA_BASE_FASE_0.md`

---

**Fase 0 completada.** El proyecto está listo para la Fase 1 (integridad y seguridad).
