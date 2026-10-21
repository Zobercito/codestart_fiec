-- ═══════════════════════════════════════════════════════════════
-- CodeStart FIEC · Datos de prueba
--
-- Se aplica DESPUES de crear los usuarios en auth.users
-- (scripts/crear-usuarios.mjs), porque el trigger de alta crea los
-- perfiles y este seed los referencia por correo.
--
--   psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/seed.sql
--
-- El grupo y los estudiantes son los del mockup del Avance 2, para que
-- la aplicacion se vea igual que el prototipo.
--
-- El seed es idempotente: limpia los datos de negocio antes de
-- insertar. No toca auth.users ni public.perfiles.
-- ═══════════════════════════════════════════════════════════════

-- ── Limpieza (orden por dependencias) ───────────────────────────
delete from public.intentos;
delete from public.progresos;
delete from public.insignias;
delete from public.asignaciones;
delete from public.retos;
delete from public.lecciones;
delete from public.inscripciones;
delete from public.grupos;
delete from public.modulos;

-- ── Grupo y docente ────────────────────────────────────────────
insert into public.grupos (nombre, codigo_inscripcion, docente_id, periodo_inicio, periodo_fin)
select
  'Sección 1 · Verano 2026',
  'FIEC-V26-8QK4',
  p.id,
  date '2026-07-06',
  date '2026-08-14'
from public.perfiles p
where p.correo = 'docente@up.ac.pa';

-- ── Inscripciones de los estudiantes ────────────────────────────
insert into public.inscripciones (usuario_id, grupo_id)
select p.id, g.id
from public.perfiles p
cross join public.grupos g
where g.codigo_inscripcion = 'FIEC-V26-8QK4'
  and p.correo in (
    'julieth.rojas@up.ac.pa',
    'luis.martinez@up.ac.pa',
    'camila.rios@up.ac.pa',
    'andres.perez@up.ac.pa',
    'sofia.bernal@up.ac.pa'
  );

-- ── Los 8 modulos del curso (seccion 8 del Avance 1) ───────────
insert into public.modulos (titulo, orden, descripcion, archivo_contenido) values
  ('Introducción a la informática y al computador', 1,
   'Hardware, software, instrucciones y memoria; pensamiento computacional.',
   'modulos/01-introduccion-a-la-informatica.mdx'),
  ('Algoritmos', 2,
   'Descomponer un problema en pasos; pseudocódigo y diagramas de flujo.',
   'modulos/02-algoritmos.mdx'),
  ('De la idea al programa', 3,
   'Qué es programar, compilación frente a interpretación y anatomía de un «Hola Mundo».',
   'modulos/03-de-la-idea-al-programa.mdx'),
  ('Variables, tipos de datos y operadores', 4,
   'Enteros, decimales, caracteres, booleanos y asignación de memoria.',
   'modulos/04-variables-y-tipos-de-datos.mdx'),
  ('Estructuras de control de flujo', 5,
   'Condicionales y ciclos: predecir la salida y ordenar bloques de código.',
   'modulos/05-estructuras-de-control-de-flujo.mdx'),
  ('Introducción a estructuras de datos básicas', 6,
   'Arreglos, listas e indexación: visualizar posiciones e índices en memoria.',
   'modulos/06-estructuras-de-datos.mdx'),
  ('Taller de retos y ejercicios de integración', 7,
   'Retos que combinan variables, control de flujo y arreglos.',
   'modulos/07-taller-de-retos.mdx'),
  ('Evaluación formativa final', 8,
   'Cuestionario automatizado de los 8 módulos.',
   'modulos/08-evaluacion-final.mdx');

-- ── Lecciones ───────────────────────────────────────────────────
-- El modulo 3 tiene dos, porque es el primero con contenido interactivo
-- completo (visor de anatomia y simulador de memoria).
insert into public.lecciones (modulo_id, titulo, orden, archivo_contenido, duracion_min)
select m.id, v.titulo, v.orden, v.archivo, v.duracion
from public.modulos m
join (values
  ('¿Qué pasa cuando ejecutamos un programa?', 1,
   'lecciones/m03-l1-que-pasa-al-ejecutar.mdx', 25),
  ('Anatomía de un programa: cada línea y su porqué', 2,
   'lecciones/m03-l2-anatomia-de-un-programa.mdx', 30)
) as v(titulo, orden, archivo, duracion) on true
where m.orden = 3;

-- Los modulos 1, 2 y 4 tienen una leccion cada uno, para que el
-- progreso del curso se vea escalonado como en el mockup.
insert into public.lecciones (modulo_id, titulo, orden, archivo_contenido, duracion_min)
select m.id, v.titulo, 1, v.archivo, v.duracion
from public.modulos m
join (values
  ('Introducción a la informática y al computador', 'lecciones/m01-introduccion.mdx', 20),
  ('Algoritmos', 'lecciones/m02-algoritmos.mdx', 25),
  ('Variables, tipos de datos y operadores', 'lecciones/m04-variables.mdx', 30)
) as v(titulo, archivo, duracion) on m.titulo = v.titulo;

-- ── Retos ──────────────────────────────────────────────────────
-- El primero es el de codigo del prototipo. Sus reglas y sus casos son
-- el contrato con el analizador estatico (seccion 15.3): se guardan
-- como datos, no como codigo, para no depender del lenguaje.
insert into public.retos (
  leccion_id, tipo, enunciado, enunciado_detalle, reglas, casos, pistas,
  puntos, intentos_maximos, orden
)
select l.id,
  'codigo',
  'Clasifica la edad con un condicional',
  'Completa el programa para que imprima "Mayor de edad" si la edad es igual o mayor que 18, y "Menor de edad" en cualquier otro caso.',
  jsonb_build_object(
    'declaraciones', jsonb_build_array(
      jsonb_build_object('tipo', 'int', 'nombre', 'edad')
    ),
    'comparaciones', jsonb_build_array(
      jsonb_build_object('variable', 'edad', 'operador', '>=', 'valor', 18)
    ),
    'requiere_ramas', 2,
    'impresiones', jsonb_build_object(
      'verdadero', 'Mayor de edad',
      'falso', 'Menor de edad'
    )
  ),
  jsonb_build_array(
    jsonb_build_object('nombre', 'edad = 20', 'entrada', jsonb_build_object('edad', 20), 'salida_esperada', 'Mayor de edad'),
    jsonb_build_object('nombre', 'edad = 18', 'entrada', jsonb_build_object('edad', 18), 'salida_esperada', 'Mayor de edad'),
    jsonb_build_object('nombre', 'edad = 15', 'entrada', jsonb_build_object('edad', 15), 'salida_esperada', 'Menor de edad')
  ),
  jsonb_build_array(
    jsonb_build_object('nivel', 1, 'texto', 'Recuerda que el lenguaje compara con >= el número en el rango. Con solo > el 18 quedaría fuera.'),
    jsonb_build_object('nivel', 2, 'texto', 'El número debe INCLUIR el límite: usa el operador mayor o igual que.')
  ),
  100, 3, 1
from public.lecciones l
join public.modulos m on m.id = l.modulo_id
where m.orden = 3 and l.orden = 1;

-- El segundo es conceptual: se valida contra una lista de respuestas.
insert into public.retos (
  leccion_id, tipo, enunciado, enunciado_detalle, reglas, casos, pistas,
  puntos, intentos_maximos, orden
)
select l.id,
  'seleccion_multiple',
  '¿Qué es una variable?',
  'Elige la opción que explica mejor qué es una variable en un programa.',
  jsonb_build_object(
    'opciones', jsonb_build_array(
      jsonb_build_object('id', 'a', 'texto', 'Un espacio de memoria con nombre donde se guarda un valor'),
      jsonb_build_object('id', 'b', 'texto', 'Una instrucción que el procesador ejecuta'),
      jsonb_build_object('id', 'c', 'texto', 'Un tipo de dato: entero, decimal o carácter'),
      jsonb_build_object('id', 'd', 'texto', 'Una línea de código que imprime un mensaje')
    ),
    'correctas', jsonb_build_array('a')
  ),
  '[]'::jsonb,
  jsonb_build_array(
    jsonb_build_object('nivel', 1, 'texto', 'Piensa en la analogía de la casilla con etiqueta: la etiqueta es el nombre y dentro está el valor.')
  ),
  40, 3, 2
from public.lecciones l
join public.modulos m on m.id = l.modulo_id
where m.orden = 3 and l.orden = 1;

-- ── Asignacion vigente (la que ve el estudiante en el dashboard) ──
insert into public.asignaciones (grupo_id, modulo_id, descripcion, fecha_entrega, creada_por)
select g.id, m.id, 'Módulo 4 completo + autoevaluación', date '2026-07-17', p.id
from public.grupos g
join public.modulos m on m.orden = 4
join public.perfiles p on p.correo = 'docente@up.ac.pa'
where g.codigo_inscripcion = 'FIEC-V26-8QK4';

-- ── Progreso: lo que el dashboard y el panel docente muestran ────
-- Módulos 1 a 3 completados; el 4 en progreso; el 5 sin empezar.
insert into public.progresos (usuario_id, leccion_id, estado, fecha)
select p.id, l.id, 'completado', timestamptz '2026-07-12 15:00:00+00'
from public.perfiles p
cross join public.lecciones l
join public.modulos m on m.id = l.modulo_id
where p.correo in (
  'julieth.rojas@up.ac.pa', 'luis.martinez@up.ac.pa',
  'camila.rios@up.ac.pa', 'andres.perez@up.ac.pa'
) and m.orden <= 3;

-- El modulo 4 en curso: una leccion a medias.
insert into public.progresos (usuario_id, leccion_id, estado, fecha)
select p.id, l.id, 'en_progreso', timestamptz '2026-07-16 18:30:00+00'
from public.perfiles p
cross join public.lecciones l
join public.modulos m on m.id = l.modulo_id
where p.correo = 'julieth.rojas@up.ac.pa' and m.orden = 4;


-- ── Intentos: el origen del analisis de errores (RF15) ──────────
-- Julieth falló el condicional por usar > en vez de >=: es el patron
-- de error que el panel docente muestra como dominante.
insert into public.intentos (
  usuario_id, reto_id, respuesta, codigo_enviado, resultado,
  error_detectado, acierto, puntos_obtenidos, fecha
)
select p.id, r.id, 'a', $$#include <stdio.h>
int main() {
    int edad = 18;
    if (edad > 18) {
        printf("Mayor de edad\n");
    } else {
        printf("Menor de edad\n");
    }
    return 0;
}$$,
  jsonb_build_object(
    'casos', jsonb_build_array(
      jsonb_build_object('caso', 'edad = 20', 'coincide', true),
      jsonb_build_object('caso', 'edad = 18', 'coincide', false)
    ),
    'regla_incumplida', 'comparaciones',
    'esperado', '>=',
    'encontrado', '>'
  ),
  'Con edad = 18 tu condición `edad > 18` es falsa, así que el programa cae al `else` y responde "Menor de edad". El caso espera "Mayor de edad" porque 18 debe entrar en la primera rama.',
  false, 0, timestamptz '2026-07-16 18:42:00+00'
from public.perfiles p
cross join public.retos r
join public.lecciones l on l.id = r.leccion_id
where p.correo = 'julieth.rojas@up.ac.pa' and r.tipo = 'codigo';

-- Luis y Sofia fallaron tambien: mismo error, patron dominante del grupo.
insert into public.intentos (
  usuario_id, reto_id, respuesta, codigo_enviado, resultado,
  error_detectado, acierto, puntos_obtenidos, fecha
)
select p.id, r.id, 'a', $$int main() {
    int edad = 18;
    if (edad > 18) {
        printf("Mayor de edad\n");
    } else {
        printf("Menor de edad\n");
    }
    return 0;
}$$,
  jsonb_build_object(
    'casos', jsonb_build_array(
      jsonb_build_object('caso', 'edad = 18', 'coincide', false)
    ),
    'regla_incumplida', 'comparaciones',
    'esperado', '>=',
    'encontrado', '>'
  ),
  'Con edad = 18 tu condición `edad > 18` es falsa y el programa responde "Menor de edad". El caso espera "Mayor de edad".',
  false, 0, timestamptz '2026-07-16 16:05:00+00'
from public.perfiles p
cross join public.retos r
where p.correo in ('luis.martinez@up.ac.pa', 'sofia.bernal@up.ac.pa') and r.tipo = 'codigo';

-- Camila y Andres lo resolvieron bien.
insert into public.intentos (
  usuario_id, reto_id, respuesta, codigo_enviado, resultado,
  error_detectado, acierto, puntos_obtenidos, fecha
)
select p.id, r.id, 'a', $$int main() {
    int edad = 18;
    if (edad >= 18) {
        printf("Mayor de edad\n");
    } else {
        printf("Menor de edad\n");
    }
    return 0;
}$$,
  jsonb_build_object(
    'casos', jsonb_build_array(
      jsonb_build_object('caso', 'edad = 20', 'coincide', true),
      jsonb_build_object('caso', 'edad = 18', 'coincide', true),
      jsonb_build_object('caso', 'edad = 15', 'coincide', true)
    )
  ),
  null,
  true, 100, timestamptz '2026-07-15 19:20:00+00'
from public.perfiles p
cross join public.retos r
where p.correo in ('camila.rios@up.ac.pa', 'andres.perez@up.ac.pa') and r.tipo = 'codigo';

-- ── Insignias del muro de progreso ─────────────────────────────
insert into public.insignias (usuario_id, tipo, descripcion)
select p.id, v.tipo, v.descripcion
from public.perfiles p
join (values
  ('Primer paso',       'Completaste el módulo 1'),
  ('Sin errores',       '5 retos superados al primer intento'),
  ('Racha 5 días',      'Cinco días seguidos con actividad')
) as v(tipo, descripcion) on true
where p.correo = 'julieth.rojas@up.ac.pa';
