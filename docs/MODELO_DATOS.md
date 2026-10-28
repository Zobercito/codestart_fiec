# Modelo de datos

11 tablas en PostgreSQL (Supabase). El Avance 1 (§16.1) listaba 8: las tres que se añadieron
están explicadas al final.

Todas tienen **RLS activo** y sus claves foráneas borran en cascada (`on delete cascade`), para
que al borrar un grupo o un módulo no queden filas huérfanas.

---

## Diagrama

```
                    ┌──────────────┐
                    │   perfiles   │  id, nombre, correo, rol (estudiante|docente|admin)
                    └──────┬───────┘
             ┌─────────────┼──────────────┬───────────────┐
             │             │              │               │
        ┌────┴─────┐  ┌────┴──────┐  ┌────┴──────┐  ┌─────┴──────┐
        │  grupos  │  │inscripciones│ │  progresos │  │  insignias │
        │ docente_id│  │ usuario_id │  │ leccion_id │  │  usuario_id│
        │codigo_ins│  │  grupo_id  │  │  usuario_id│  └────────────┘
        └────┬─────┘  └───────────┘  └───────────┘
             │
   ┌─────────┴──────────┐
   │                    │
┌──┴───────────┐   ┌────┴──────────────┐
│ asignaciones │   │      retos         │
│ grupo_id     │   │ leccion_id         │
│ modulo_id    │   │ tipo (codigo|      │
│ reto_id      │   │  seleccion_multiple)
│ fecha_entrega│   │ enunciado,         │
└──────────────┘   │ enunciado_detalle  │
                   │ reglas (JSONB)      │
                   │ casos (JSONB)       │
                   │ pistas (JSONB)      │
                   │ puntos,             │
                   │ intentos_maximos    │
                   └──────────┬──────────┘
                              │
                   ┌──────────┴──────────┐
                   │                     │
            ┌──────┴──────┐      ┌───────┴───────┐
            │   intentos  │      │    codigos    │
            │ usuario_id  │      │  usuario_id   │
            │ reto_id     │      │   reto_id     │
            │ respuesta   │      │    codigo     │
            │codigo_enviado│     │pistas_usadas │
            │ resultado   │      │actualizado_en│
            │error_detectado│    └───────────────┘
            │ acierto     │
            │puntos_obtenidos
            │ fecha       │
            └─────────────┘

┌─────────────┐        ┌─────────────┐
│   modulos   │──┐  ┌──│  lecciones  │
│ titulo      │  └──┘  │ modulo_id  │
│ orden       │        │ titulo     │
│ descripcion │        │ orden      │
│archivo_cont.│        │archivo_cont.│
└─────────────┘        │ duracion_min│
                       └─────────────┘
```

---

## Las tablas

| Tabla | Qué guarda | Campos principales |
|---|---|---|
| `perfiles` | Persona con acceso a la plataforma | `nombre`, `correo`, `rol` |
| `grupos` | Sección del curso a cargo de un docente | `nombre`, `codigo_inscripcion`, `docente_id`, periodo |
| `inscripciones` | Relación entre estudiante y grupo | `usuario_id`, `grupo_id`, `fecha` |
| `modulos` | Bloque del temario (8 en total) | `titulo`, `orden`, `descripcion`, `archivo_contenido` |
| `lecciones` | Unidad de progreso dentro de un módulo | `modulo_id`, `titulo`, `orden`, `archivo_contenido`, `duracion_min` |
| `retos` | Ejercicio o pregunta de una lección | `tipo`, `enunciado`, `reglas` (JSONB), `casos` (JSONB), `pistas` (JSONB), `puntos`, `intentos_maximos` |
| `asignaciones` | Módulo o reto que el docente asigna a un grupo | `grupo_id`, `modulo_id`, `reto_id`, `fecha_entrega`, `descripcion` |
| `progresos` | Estado de cada lección para cada estudiante | `usuario_id`, `leccion_id`, `estado`, `fecha` |
| `intentos` | Cada vez que el estudiante responde un reto | `usuario_id`, `reto_id`, `respuesta` o `codigo_enviado`, `resultado` (JSONB), `error_detectado`, `acierto`, `puntos_obtenidos`, `fecha` |
| `insignias` | Reconocimiento obtenido | `usuario_id`, `tipo`, `descripcion`, `fecha` |
| `codigos` | El código que se está escribiendo ahora mismo | `usuario_id`, `reto_id`, `codigo`, `pistas_usadas`, `actualizado_en` |

### `intentos` es la base del análisis de errores (RF15)

Guarda **el código enviado y el error detectado**. El docente no ve solo «falló»: ve *en qué*
falló. La columna `error_detectado` guarda el diagnóstico del motor, y `resultado` guarda el
detalle por caso de prueba.

Por eso el veredicto lo emite el servidor: si el análisis corriera en el cliente, esta tabla
guardaría lo que el estudiante quisiera que guardara.

---

## Las tres tablas que no salen del Avance 1

| Tabla | Por qué |
|---|---|
| `modulos` + `lecciones` separadas | El ODT habla de «módulo y lección» como una sola cosa, pero el módulo tiene 4 lecciones y **la lección es la unidad de progreso**: es lo que se marca como visto, lo que da el porcentaje de avance y lo que se asigna. Con una sola tabla, el progreso tendría que vivir en el módulo y no se podría medir una lección suelta. |
| `codigos` | El RF11 pide «guardado automático del avance y **del último código escrito en cada reto** para retomarlo después». `intentos` guarda lo **entregado**, no lo que se está escribiendo: sin esta tabla, recargar la página tiraba el trabajo del estudiante. |

---

## Seguridad: RLS, funciones y triggers

### Políticas por tabla

| Tabla | Políticas | Quién ve qué |
|---|---|---|
| `perfiles` | 3 | El propio perfil, los perfiles del propio grupo, todo el admin |
| `grupos` | 3 | Grupos propios (docente), grupos a los que pertenece el estudiante |
| `inscripciones` | 2 | Las propias y las del grupo del docente |
| `modulos`, `lecciones`, `retos` | 2 cada una | Todo el autenticado (es contenido del curso) |
| `progresos`, `insignias` | 2 cada una | Los propios, y los del grupo si eres docente |
| `intentos` | 2 | Los propios, y los del grupo si eres docente (esto es lo que alimenta el panel docente) |
| `asignaciones` | 2 | Las de los grupos propios |
| `codigos` | 4 | Solo el propio borrador: select, insert, update, delete |

### Funciones

| Función | Para qué |
|---|---|
| `es_admin()` | ¿El usuario actual es administrador? |
| `es_docente_de(grupo_id)` | ¿Es docente de ese grupo? |
| `es_miembro_de(grupo_id)` | ¿Pertenece a ese grupo? |
| `unirse_por_codigo(codigo)` | Inscripción por código de grupo. Devuelve el id del grupo o `null` |
| `crear_perfil_al_registrarse()` | Trigger de `auth.users`: crea el perfil; un alta pública siempre quedaría como estudiante |
| `proteger_campos_perfil()` | Trigger de `perfiles`: bloquea que el rol o la fecha de creación se cambien |

### Lo que la base de datos no deja hacer

- **Escalada de privilegios**: el trigger `trg_proteger_campos_perfil` rechaza que alguien
  actualice su propio `rol` a `docente` o `admin`. El rol lo asigna el docente o el
  administrador con `service_role`; el alta pública solo crearía estudiantes.
- **Acceso cruzado**: un docente no puede leer los intentos de un grupo ajeno, porque la política
  comprueba `g.docente_id = auth.uid()`.
- **Falsificar el veredicto**: las reglas y los casos de prueba son JSONB de solo lectura para el
  estudiante (no hay política de insert ni update sobre `retos` para estudiantes), y el motor
  corre en el servidor.

---

## Catálogos

| Tipo | Valores |
|---|---|
| `rol_usuario` | `estudiante`, `docente`, `admin` |
| `estado_progreso` | `pendiente`, `en_progreso`, `completado` |
| `tipo_reto` | `codigo`, `seleccion_multiple` |
