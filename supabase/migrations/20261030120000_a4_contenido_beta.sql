-- ═══════════════════════════════════════════════════════════════
-- A4 · Contenido provisional de los módulos 5–8 y evaluaciones
--
-- Las lecciones 5–8, sus retos de ordenamiento/autocompletado y las
-- autoevaluaciones de los módulos 1–7 más la evaluación final.
--
-- El contenido está marcado como PROVISIONAL: sigue el esquema del
-- curso, pero no ha sido revisado por el experto docente. No se debe
-- presentar como material validado.
--
-- Es idempotente: se puede aplicar sobre la base demo sin borrar datos.
-- ═══════════════════════════════════════════════════════════════

-- ── Lecciones de los módulos 5–8 ───────────────────────────────
insert into public.lecciones
  (modulo_id, titulo, orden, archivo_contenido, duracion_min)
select m.id, v.titulo, 1, v.archivo, v.duracion
from public.modulos m
join (values
  (5, $$Estructuras de control de flujo$$,
      $$lecciones/m05-control-de-flujo.mdx$$, 30),
  (6, $$Introducción a estructuras de datos básicas$$,
      $$lecciones/m06-arreglos.mdx$$, 30),
  (7, $$Taller de retos y ejercicios de integración$$,
      $$lecciones/m07-taller.mdx$$, 35),
  (8, $$Evaluación formativa final$$,
      $$lecciones/m08-evaluacion-final.mdx$$, 45)
) as v(orden, titulo, archivo, duracion) on m.orden = v.orden
where not exists (
  select 1 from public.lecciones l
  where l.modulo_id = m.id and l.orden = 1
);

-- ── Retos de ordenamiento y autocompletado (5–7) ───────────────
with contenido(modulo, orden, tipo, enunciado, detalle, reglas, pistas) as (
  values
  (5, 1, 'ordenamiento'::public.tipo_reto,
   $$Ordena el ciclo while que imprime del 1 al 5$$,
   $$Cada pieza debe quedar en el orden en que el programa la ejecuta.$$,
   $${
      "elementos": [
        {"id": "d", "texto": "i = i + 1;"},
        {"id": "b", "texto": "while (i <= 5) {"},
        {"id": "e", "texto": "}"},
        {"id": "a", "texto": "int i = 1;"},
        {"id": "c", "texto": "printf(\"%d\\n\", i);"}
      ],
      "correctas": ["a", "b", "c", "d", "e"]
    }$$::jsonb,
   $$[{"nivel": 1, "texto": "El ciclo necesita un valor inicial antes de la condición y un cambio dentro del bloque."}]$$::jsonb),

  (5, 2, 'autocompletado'::public.tipo_reto,
   $$Completa el ciclo que imprime del 1 al 5$$,
   $$Elige la condición y el incremento correctos.$$,
   $${
      "plantilla": "int i = 1;\nwhile ({{condicion}}) {\n    printf(\"%d\\n\", i);\n    {{incremento}};\n}",
      "blancos": [
        {"id": "condicion", "etiqueta": "Condición del ciclo", "opciones": ["i <= 5", "i < 5", "i >= 5"], "correcta": "i <= 5", "explicacion": "Con <= 5 el ciclo incluye el 5."},
        {"id": "incremento", "etiqueta": "Cambio de la variable", "opciones": ["i = i + 1", "i = i - 1", "i = 0"], "correcta": "i = i + 1", "explicacion": "Hay que acercar i al final; si no, el ciclo no termina."}
      ]
    }$$::jsonb,
   $$[{"nivel": 1, "texto": "El incremento debe acercar la variable a la condición de salida."}]$$::jsonb),

  (6, 1, 'ordenamiento'::public.tipo_reto,
   $$Ordena el recorrido que suma un arreglo$$,
   $$El arreglo tiene cinco notas y se quiere acumular su suma.$$,
   $${
      "elementos": [
        {"id": "c", "texto": "suma = suma + notas[i];"},
        {"id": "a", "texto": "int suma = 0;"},
        {"id": "d", "texto": "}"},
        {"id": "b", "texto": "for (int i = 0; i < 5; i = i + 1) {"}
      ],
      "correctas": ["a", "b", "c", "d"]
    }$$::jsonb,
   $$[{"nivel": 1, "texto": "El acumulador se inicializa antes del ciclo; dentro se suma cada elemento."}]$$::jsonb),

  (6, 2, 'autocompletado'::public.tipo_reto,
   $$Completa el recorrido de un arreglo de cinco elementos$$,
   $$El ciclo debe visitar todas las posiciones válidas una sola vez.$$,
   $${
      "plantilla": "for (int i = {{inicio}}; {{fin}}; i = i + 1) {\n    printf(\"%d\\n\", notas[i]);\n}",
      "blancos": [
        {"id": "inicio", "etiqueta": "Valor inicial", "opciones": ["0", "1", "-1"], "correcta": "0", "explicacion": "El primer índice de un arreglo en C es 0."},
        {"id": "fin", "etiqueta": "Condición de continuación", "opciones": ["i < 5", "i <= 5", "i > 5"], "correcta": "i < 5", "explicacion": "Con i < 5 se llega hasta el índice 4, el último válido."}
      ]
    }$$::jsonb,
   $$[{"nivel": 1, "texto": "Los índices válidos de un arreglo de tamaño 5 son 0 a 4."}]$$::jsonb),

  (7, 1, 'ordenamiento'::public.tipo_reto,
   $$Ordena el cálculo del promedio$$,
   $$Primero se declara el acumulador, luego se recorre y al final se imprime.$$,
   $${
      "elementos": [
        {"id": "e", "texto": "printf(\"Promedio: %d\\n\", suma / 5);"},
        {"id": "c", "texto": "suma = suma + notas[i];"},
        {"id": "a", "texto": "int suma = 0;"},
        {"id": "d", "texto": "}"},
        {"id": "b", "texto": "for (int i = 0; i < 5; i = i + 1) {"}
      ],
      "correctas": ["a", "b", "c", "d", "e"]
    }$$::jsonb,
   $$[{"nivel": 1, "texto": "El promedio necesita la suma completa antes de dividir."}]$$::jsonb),

  (7, 2, 'autocompletado'::public.tipo_reto,
   $$Completa la condición que cuenta aprobados$$,
   $$Un estudiante aprueba con 70 o más.$$,
   $${
      "plantilla": "if ({{condicion}}) {\n    aprobados = aprobados + 1;\n}",
      "blancos": [
        {"id": "condicion", "etiqueta": "Condición de aprobado", "opciones": ["notas[i] >= 70", "notas[i] > 70", "notas[i] < 70"], "correcta": "notas[i] >= 70", "explicacion": "El 70 también aprueba, por eso se usa >=."}
      ]
    }$$::jsonb,
   $$[{"nivel": 1, "texto": "El límite forma parte del conjunto de aprobados."}]$$::jsonb)
)
insert into public.retos
  (leccion_id, tipo, enunciado, enunciado_detalle, reglas, casos,
   pistas, puntos, intentos_maximos, orden)
select l.id, c.tipo, c.enunciado, c.detalle, c.reglas, '[]'::jsonb,
       c.pistas, 50, 3, c.orden
from contenido c
join public.modulos m on m.orden = c.modulo
join public.lecciones l on l.modulo_id = m.id and l.orden = 1
where not exists (
  select 1 from public.retos r
  where r.leccion_id = l.id and r.enunciado = c.enunciado
);

-- ── Preguntas de las autoevaluaciones (1–7) y final (8) ────────
with preguntas(modulo, id, enunciado, opciones, correcta, area, explicacion) as (
  values
  -- Módulo 1
  (1, 'p1', $$¿Qué es el hardware?$$,
   $$[{"id":"a","texto":"Los programas y datos"},{"id":"b","texto":"Las partes físicas del computador"},{"id":"c","texto":"Las instrucciones del usuario"}]$$::jsonb,
   'b', $$Hardware y software$$, $$El hardware es lo que se puede tocar; el software son los programas.$$),
  (1, 'p2', $$¿Qué ocurre con el contenido de la memoria RAM al apagar el equipo?$$,
   $$[{"id":"a","texto":"Se conserva para siempre"},{"id":"b","texto":"Se pierde"},{"id":"c","texto":"Se convierte en disco"}]$$::jsonb,
   'b', $$Memoria$$, $$La RAM es volátil: necesita energía para mantener los datos.$$),
  (1, 'p3', $$¿Qué es una instrucción?$$,
   $$[{"id":"a","texto":"Un paso que el procesador ejecuta"},{"id":"b","texto":"Una imagen"},{"id":"c","texto":"Un archivo comprimido"}]$$::jsonb,
   'a', $$Instrucciones$$, $$Un programa es una secuencia de instrucciones.$$),
  (1, 'p4', $$¿Qué es el software?$$,
   $$[{"id":"a","texto":"El monitor"},{"id":"b","texto":"Los programas y los datos"},{"id":"c","texto":"El teclado"}]$$::jsonb,
   'b', $$Hardware y software$$, $$El software es la parte lógica: programas y datos.$$),
  (1, 'p5', $$¿Qué significa descomponer un problema?$$,
   $$[{"id":"a","texto":"Memorizar código"},{"id":"b","texto":"Dividirlo en partes más pequeñas"},{"id":"c","texto":"Escribir todo de una vez"}]$$::jsonb,
   'b', $$Pensamiento computacional$$, $$Descomponer hace manejable un problema grande.$$),

  -- Módulo 2
  (2, 'p1', $$¿Qué es un algoritmo?$$,
   $$[{"id":"a","texto":"Un lenguaje de programación"},{"id":"b","texto":"Una secuencia finita de pasos para resolver algo"},{"id":"c","texto":"Una computadora"}]$$::jsonb,
   'b', $$Algoritmos$$, $$Un algoritmo describe pasos, no necesariamente código.$$),
  (2, 'p2', $$¿Qué estructura repite mientras se cumpla una condición?$$,
   $$[{"id":"a","texto":"if"},{"id":"b","texto":"while"},{"id":"c","texto":"int"}]$$::jsonb,
   'b', $$Control de flujo$$, $$while repite mientras la condición sea verdadera.$$),
  (2, 'p3', $$En un diagrama de flujo, ¿qué representa un rombo?$$,
   $$[{"id":"a","texto":"Una decisión"},{"id":"b","texto":"Una salida"},{"id":"c","texto":"El inicio"}]$$::jsonb,
   'a', $$Diagramas$$, $$El rombo plantea una condición con dos caminos.$$),
  (2, 'p4', $$¿Qué es el pseudocódigo?$$,
   $$[{"id":"a","texto":"Código que ejecuta la máquina"},{"id":"b","texto":"Una descripción de pasos cercana al lenguaje humano"},{"id":"c","texto":"Un compilador"}]$$::jsonb,
   'b', $$Pseudocódigo$$, $$Sirve para pensar el algoritmo antes de elegir un lenguaje.$$),
  (2, 'p5', $$¿Para qué sirve dividir un problema en subproblemas?$$,
   $$[{"id":"a","texto":"Para resolver cada parte por separado"},{"id":"b","texto":"Para borrar código"},{"id":"c","texto":"Para compilar más rápido"}]$$::jsonb,
   'a', $$Descomposición$$, $$Cada subproblema se puede entender y probar por separado.$$),

  -- Módulo 3
  (3, 'p1', $$¿Qué hace un compilador?$$,
   $$[{"id":"a","texto":"Traduce el programa antes de ejecutarlo"},{"id":"b","texto":"Ejecuta línea a línea"},{"id":"c","texto":"Guarda los datos en disco"}]$$::jsonb,
   'a', $$Compilación$$, $$El compilador produce un programa ejecutable.$$),
  (3, 'p2', $$¿Qué biblioteca permite usar printf?$$,
   $$[{"id":"a","texto":"stdio.h"},{"id":"b","texto":"math.h"},{"id":"c","texto":"string.h"}]$$::jsonb,
   'a', $$Anatomía$$, $$stdio significa standard input/output.$$),
  (3, 'p3', $$¿Qué indica return 0; al final de main?$$,
   $$[{"id":"a","texto":"Que hubo un error"},{"id":"b","texto":"Que el programa terminó correctamente"},{"id":"c","texto":"Que empieza un ciclo"}]$$::jsonb,
   'b', $$Anatomía$$, $$El 0 es la convención de terminación correcta.$$),
  (3, 'p4', $$¿Qué es un intérprete?$$,
   $$[{"id":"a","texto":"Traduce y ejecuta paso a paso"},{"id":"b","texto":"Solo compila"},{"id":"c","texto":"Diseña pantallas"}]$$::jsonb,
   'a', $$Interpretación$$, $$El intérprete ejecuta mientras traduce.$$),
  (3, 'p5', $$¿Qué parte del programa se analiza en los retos de código?$$,
   $$[{"id":"a","texto":"El cuerpo de la función"},{"id":"b","texto":"El sistema operativo"},{"id":"c","texto":"El teclado"}]$$::jsonb,
   'a', $$Anatomía$$, $$El reto pide completar el cuerpo de main.$$),

  -- Módulo 4
  (4, 'p1', $$¿Qué tipo guarda un número entero?$$,
   $$[{"id":"a","texto":"int"},{"id":"b","texto":"char"},{"id":"c","texto":"float"}]$$::jsonb,
   'a', $$Tipos$$, $$int es el tipo entero.$$),
  (4, 'p2', $$¿Qué operador asigna un valor?$$,
   $$[{"id":"a","texto":"=="},{"id":"b","texto":"="},{"id":"c","texto":"!="}]$$::jsonb,
   'b', $$Operadores$$, $$= asigna; == compara.$$),
  (4, 'p3', $$¿Qué guarda una variable de tipo char?$$,
   $$[{"id":"a","texto":"Un carácter"},{"id":"b","texto":"Un entero grande"},{"id":"c","texto":"Una lista"}]$$::jsonb,
   'a', $$Tipos$$, $$char guarda un carácter.$$),
  (4, 'p4', $$¿Qué hace la expresión edad >= 18?$$,
   $$[{"id":"a","texto":"Asigna 18"},{"id":"b","texto":"Compara si edad es al menos 18"},{"id":"c","texto":"Resta 18"}]$$::jsonb,
   'b', $$Operadores$$, $$>= devuelve verdadero si edad es 18 o más.$$),
  (4, 'p5', $$¿Qué es una variable?$$,
   $$[{"id":"a","texto":"Un espacio de memoria con nombre"},{"id":"b","texto":"Una instrucción de impresión"},{"id":"c","texto":"Un ciclo"}]$$::jsonb,
   'a', $$Variables$$, $$La variable tiene nombre, tipo y valor.$$),

  -- Módulo 5
  (5, 'p1', $$¿Qué estructura elige entre dos caminos?$$,
   $$[{"id":"a","texto":"if / else"},{"id":"b","texto":"for"},{"id":"c","texto":"int"}]$$::jsonb,
   'a', $$Condicionales$$, $$if evalúa una condición y else cubre el caso falso.$$),
  (5, 'p2', $$¿Cuántas veces imprime el ciclo for (i = 1; i <= 5; i = i + 1)?$$,
   $$[{"id":"a","texto":"4"},{"id":"b","texto":"5"},{"id":"c","texto":"6"}]$$::jsonb,
   'b', $$Ciclos$$, $$Incluye el 1 y el 5, así que son cinco vueltas.$$),
  (5, 'p3', $$¿Qué pasa si no se actualiza la variable de un while?$$,
   $$[{"id":"a","texto":"Termina antes"},{"id":"b","texto":"Puede entrar en un ciclo infinito"},{"id":"c","texto":"No compila"}]$$::jsonb,
   'b', $$Ciclos$$, $$Si la condición nunca cambia, el ciclo no termina.$$),
  (5, 'p4', $$¿Qué operador incluye el límite 18?$$,
   $$[{"id":"a","texto":">"},{"id":"b","texto":">="},{"id":"c","texto":"<"}]$$::jsonb,
   'b', $$Condicionales$$, $$>= incluye el 18; > lo deja fuera.$$),
  (5, 'p5', $$¿Cuándo se ejecuta el bloque else?$$,
   $$[{"id":"a","texto":"Cuando la condición es falsa"},{"id":"b","texto":"Siempre"},{"id":"c","texto":"Solo si hay un ciclo"}]$$::jsonb,
   'a', $$Condicionales$$, $$else es el camino alternativo.$$),

  -- Módulo 6
  (6, 'p1', $$¿Cuál es el primer índice de un arreglo en C?$$,
   $$[{"id":"a","texto":"0"},{"id":"b","texto":"1"},{"id":"c","texto":"-1"}]$$::jsonb,
   'a', $$Arreglos$$, $$Los índices empiezan en 0.$$),
  (6, 'p2', $$En int notas[5], ¿cuál es el último índice válido?$$,
   $$[{"id":"a","texto":"5"},{"id":"b","texto":"4"},{"id":"c","texto":"6"}]$$::jsonb,
   'b', $$Arreglos$$, $$Con tamaño 5, las posiciones son 0 a 4.$$),
  (6, 'p3', $$¿Qué patrón suma los elementos de un arreglo?$$,
   $$[{"id":"a","texto":"Un acumulador"},{"id":"b","texto":"Una bandera"},{"id":"c","texto":"Un compilador"}]$$::jsonb,
   'a', $$Recorridos$$, $$El acumulador guarda la suma parcial.$$),
  (6, 'p4', $$¿Qué condición recorre todo un arreglo de cinco elementos?$$,
   $$[{"id":"a","texto":"i <= 5"},{"id":"b","texto":"i < 5"},{"id":"c","texto":"i > 5"}]$$::jsonb,
   'b', $$Recorridos$$, $$i < 5 visita 0, 1, 2, 3 y 4.$$),
  (6, 'p5', $$¿Qué guarda una bandera?$$,
   $$[{"id":"a","texto":"Si ocurrió algo"},{"id":"b","texto":"El total acumulado"},{"id":"c","texto":"El índice actual"}]$$::jsonb,
   'a', $$Recorridos$$, $$La bandera es un valor de verdad sobre el recorrido.$$),

  -- Módulo 7
  (7, 'p1', $$¿Cuál es el primer paso para resolver un reto?$$,
   $$[{"id":"a","texto":"Entender la entrada y la salida"},{"id":"b","texto":"Copiar código"},{"id":"c","texto":"Ejecutar sin leer"}]$$::jsonb,
   'a', $$Método$$, $$Sin entender el problema, el código es una lotería.$$),
  (7, 'p2', $$Para calcular un promedio, ¿qué se acumula?$$,
   $$[{"id":"a","texto":"La suma de los valores"},{"id":"b","texto":"El índice"},{"id":"c","texto":"La condición"}]$$::jsonb,
   'a', $$Acumuladores$$, $$El promedio es la suma dividida entre la cantidad.$$),
  (7, 'p3', $$¿Qué condición cuenta aprobados con 70 o más?$$,
   $$[{"id":"a","texto":"notas[i] >= 70"},{"id":"b","texto":"notas[i] > 70"},{"id":"c","texto":"notas[i] < 70"}]$$::jsonb,
   'a', $$Condiciones$$, $$>= 70 incluye el 70.$$),
  (7, 'p4', $$¿Dónde empieza el recorrido de un arreglo?$$,
   $$[{"id":"a","texto":"En 0"},{"id":"b","texto":"En 1"},{"id":"c","texto":"En el tamaño"}]$$::jsonb,
   'a', $$Recorridos$$, $$El primer elemento está en la posición 0.$$),
  (7, 'p5', $$¿Qué se debe probar además del caso normal?$$,
   $$[{"id":"a","texto":"Los límites y los casos vacíos"},{"id":"b","texto":"Solo el caso feliz"},{"id":"c","texto":"Nada más"}]$$::jsonb,
   'a', $$Pruebas$$, $$Los límites son donde suelen aparecer los errores.$$),

  -- Evaluación final (15)
  (8, 'p01', $$¿Qué es el hardware?$$,
   $$[{"id":"a","texto":"Los programas"},{"id":"b","texto":"Las partes físicas"},{"id":"c","texto":"Los datos"}]$$::jsonb,
   'b', $$Hardware y software$$, $$El hardware es la parte física.$$),
  (8, 'p02', $$¿Qué es el software?$$,
   $$[{"id":"a","texto":"Los programas y datos"},{"id":"b","texto":"El monitor"},{"id":"c","texto":"La memoria RAM"}]$$::jsonb,
   'a', $$Hardware y software$$, $$El software es la parte lógica.$$),
  (8, 'p03', $$¿Qué es un algoritmo?$$,
   $$[{"id":"a","texto":"Una secuencia finita de pasos"},{"id":"b","texto":"Un lenguaje"},{"id":"c","texto":"Una computadora"}]$$::jsonb,
   'a', $$Algoritmos$$, $$Un algoritmo resuelve un problema en pasos finitos.$$),
  (8, 'p04', $$En un diagrama de flujo, ¿qué representa un rombo?$$,
   $$[{"id":"a","texto":"Una decisión"},{"id":"b","texto":"Una salida"},{"id":"c","texto":"Un inicio"}]$$::jsonb,
   'a', $$Algoritmos$$, $$El rombo plantea una condición.$$),
  (8, 'p05', $$¿Qué estructura repite mientras se cumple una condición?$$,
   $$[{"id":"a","texto":"while"},{"id":"b","texto":"if"},{"id":"c","texto":"int"}]$$::jsonb,
   'a', $$Control de flujo$$, $$while repite según la condición.$$),
  (8, 'p06', $$¿Qué hace un compilador?$$,
   $$[{"id":"a","texto":"Traduce antes de ejecutar"},{"id":"b","texto":"Ejecuta línea a línea"},{"id":"c","texto":"Guarda datos"}]$$::jsonb,
   'a', $$Compilación$$, $$El compilador produce un ejecutable.$$),
  (8, 'p07', $$¿Qué biblioteca permite usar printf?$$,
   $$[{"id":"a","texto":"stdio.h"},{"id":"b","texto":"math.h"},{"id":"c","texto":"string.h"}]$$::jsonb,
   'a', $$Anatomía$$, $$stdio es entrada/salida estándar.$$),
  (8, 'p08', $$¿Qué tipo guarda un entero?$$,
   $$[{"id":"a","texto":"int"},{"id":"b","texto":"char"},{"id":"c","texto":"float"}]$$::jsonb,
   'a', $$Tipos$$, $$int es entero.$$),
  (8, 'p09', $$¿Qué operador compara igualdad?$$,
   $$[{"id":"a","texto":"="},{"id":"b","texto":"=="},{"id":"c","texto":"!="}]$$::jsonb,
   'b', $$Operadores$$, $$== compara; = asigna.$$),
  (8, 'p10', $$¿Qué operador incluye el límite 18?$$,
   $$[{"id":"a","texto":">"},{"id":"b","texto":">="},{"id":"c","texto":"<"}]$$::jsonb,
   'b', $$Condicionales$$, $$>= incluye el 18.$$),
  (8, 'p11', $$¿Qué pasa si un while no actualiza su variable?$$,
   $$[{"id":"a","texto":"Puede ser infinito"},{"id":"b","texto":"Termina"},{"id":"c","texto":"No compila"}]$$::jsonb,
   'a', $$Ciclos$$, $$La condición no cambia y el ciclo no termina.$$),
  (8, 'p12', $$¿Cuál es el primer índice de un arreglo?$$,
   $$[{"id":"a","texto":"0"},{"id":"b","texto":"1"},{"id":"c","texto":"-1"}]$$::jsonb,
   'a', $$Arreglos$$, $$Los índices empiezan en 0.$$),
  (8, 'p13', $$En un arreglo de tamaño 5, ¿cuál es el último índice válido?$$,
   $$[{"id":"a","texto":"5"},{"id":"b","texto":"4"},{"id":"c","texto":"6"}]$$::jsonb,
   'b', $$Arreglos$$, $$Las posiciones van de 0 a 4.$$),
  (8, 'p14', $$¿Qué patrón suma los elementos de un arreglo?$$,
   $$[{"id":"a","texto":"Un acumulador"},{"id":"b","texto":"Una bandera"},{"id":"c","texto":"Un compilador"}]$$::jsonb,
   'a', $$Recorridos$$, $$El acumulador guarda la suma parcial.$$),
  (8, 'p15', $$¿Qué se debe probar además del caso normal?$$,
   $$[{"id":"a","texto":"Los límites y casos vacíos"},{"id":"b","texto":"Solo el caso feliz"},{"id":"c","texto":"Nada"}]$$::jsonb,
   'a', $$Pruebas$$, $$Los límites son los casos que más fallan.$$)
),
evaluaciones as (
  select modulo,
    jsonb_agg(
      jsonb_build_object(
        'id', id,
        'enunciado', enunciado,
        'opciones', opciones,
        'correcta', correcta,
        'area', area,
        'explicacion', explicacion
      ) order by id
    ) as preguntas
  from preguntas
  group by modulo
)
insert into public.retos
  (leccion_id, tipo, enunciado, enunciado_detalle, reglas, casos,
   pistas, puntos, intentos_maximos, orden)
select l.id,
  'seleccion_multiple'::public.tipo_reto,
  $$Autoevaluación del módulo $$ || e.modulo::text,
  $$Responde las cinco preguntas. La autoevaluación es formativa: puedes repetirla y ver las áreas que conviene reforzar.$$,
  jsonb_build_object(
    'modo', 'autoevaluacion',
    'modulo', e.modulo,
    'titulo', $$Autoevaluación del módulo $$ || e.modulo::text,
    'umbral', 60,
    'preguntas', e.preguntas
  ),
  '[]'::jsonb,
  '[]'::jsonb,
  50, 3, 99
from evaluaciones e
join public.modulos m on m.orden = e.modulo
join lateral (
  select id from public.lecciones
  where modulo_id = m.id
  order by orden
  limit 1
) l on true
where e.modulo between 1 and 7
  and not exists (
    select 1 from public.retos r
    where r.reglas->>'modo' = 'autoevaluacion'
      and (r.reglas->>'modulo')::int = e.modulo
  );

-- ── Evaluación final (15 preguntas, umbral 70 %) ───────────────
with preguntas(modulo, id, enunciado, opciones, correcta, area, explicacion) as (
  values
  (8, 'p01', $$¿Qué es el hardware?$$,
   $$[{"id":"a","texto":"Los programas"},{"id":"b","texto":"Las partes físicas"},{"id":"c","texto":"Los datos"}]$$::jsonb,
   'b', $$Hardware y software$$, $$El hardware es la parte física.$$),
  (8, 'p02', $$¿Qué es el software?$$,
   $$[{"id":"a","texto":"Los programas y datos"},{"id":"b","texto":"El monitor"},{"id":"c","texto":"La memoria RAM"}]$$::jsonb,
   'a', $$Hardware y software$$, $$El software es la parte lógica.$$),
  (8, 'p03', $$¿Qué es un algoritmo?$$,
   $$[{"id":"a","texto":"Una secuencia finita de pasos"},{"id":"b","texto":"Un lenguaje"},{"id":"c","texto":"Una computadora"}]$$::jsonb,
   'a', $$Algoritmos$$, $$Un algoritmo resuelve un problema en pasos finitos.$$),
  (8, 'p04', $$En un diagrama de flujo, ¿qué representa un rombo?$$,
   $$[{"id":"a","texto":"Una decisión"},{"id":"b","texto":"Una salida"},{"id":"c","texto":"Un inicio"}]$$::jsonb,
   'a', $$Algoritmos$$, $$El rombo plantea una condición.$$),
  (8, 'p05', $$¿Qué estructura repite mientras se cumple una condición?$$,
   $$[{"id":"a","texto":"while"},{"id":"b","texto":"if"},{"id":"c","texto":"int"}]$$::jsonb,
   'a', $$Control de flujo$$, $$while repite según la condición.$$),
  (8, 'p06', $$¿Qué hace un compilador?$$,
   $$[{"id":"a","texto":"Traduce antes de ejecutar"},{"id":"b","texto":"Ejecuta línea a línea"},{"id":"c","texto":"Guarda datos"}]$$::jsonb,
   'a', $$Compilación$$, $$El compilador produce un ejecutable.$$),
  (8, 'p07', $$¿Qué biblioteca permite usar printf?$$,
   $$[{"id":"a","texto":"stdio.h"},{"id":"b","texto":"math.h"},{"id":"c","texto":"string.h"}]$$::jsonb,
   'a', $$Anatomía$$, $$stdio es entrada/salida estándar.$$),
  (8, 'p08', $$¿Qué tipo guarda un entero?$$,
   $$[{"id":"a","texto":"int"},{"id":"b","texto":"char"},{"id":"c","texto":"float"}]$$::jsonb,
   'a', $$Tipos$$, $$int es entero.$$),
  (8, 'p09', $$¿Qué operador compara igualdad?$$,
   $$[{"id":"a","texto":"="},{"id":"b","texto":"=="},{"id":"c","texto":"!="}]$$::jsonb,
   'b', $$Operadores$$, $$== compara; = asigna.$$),
  (8, 'p10', $$¿Qué operador incluye el límite 18?$$,
   $$[{"id":"a","texto":">"},{"id":"b","texto":">="},{"id":"c","texto":"<"}]$$::jsonb,
   'b', $$Condicionales$$, $$>= incluye el 18.$$),
  (8, 'p11', $$¿Qué pasa si un while no actualiza su variable?$$,
   $$[{"id":"a","texto":"Puede ser infinito"},{"id":"b","texto":"Termina"},{"id":"c","texto":"No compila"}]$$::jsonb,
   'a', $$Ciclos$$, $$La condición no cambia y el ciclo no termina.$$),
  (8, 'p12', $$¿Cuál es el primer índice de un arreglo?$$,
   $$[{"id":"a","texto":"0"},{"id":"b","texto":"1"},{"id":"c","texto":"-1"}]$$::jsonb,
   'a', $$Arreglos$$, $$Los índices empiezan en 0.$$),
  (8, 'p13', $$En un arreglo de tamaño 5, ¿cuál es el último índice válido?$$,
   $$[{"id":"a","texto":"5"},{"id":"b","texto":"4"},{"id":"c","texto":"6"}]$$::jsonb,
   'b', $$Arreglos$$, $$Las posiciones van de 0 a 4.$$),
  (8, 'p14', $$¿Qué patrón suma los elementos de un arreglo?$$,
   $$[{"id":"a","texto":"Un acumulador"},{"id":"b","texto":"Una bandera"},{"id":"c","texto":"Un compilador"}]$$::jsonb,
   'a', $$Recorridos$$, $$El acumulador guarda la suma parcial.$$),
  (8, 'p15', $$¿Qué se debe probar además del caso normal?$$,
   $$[{"id":"a","texto":"Los límites y casos vacíos"},{"id":"b","texto":"Solo el caso feliz"},{"id":"c","texto":"Nada"}]$$::jsonb,
   'a', $$Pruebas$$, $$Los límites son los casos que más fallan.$$)
),
evaluaciones as (
  select modulo,
    jsonb_agg(
      jsonb_build_object(
        'id', id,
        'enunciado', enunciado,
        'opciones', opciones,
        'correcta', correcta,
        'area', area,
        'explicacion', explicacion
      ) order by id
    ) as preguntas
  from preguntas
  group by modulo
)
insert into public.retos
  (leccion_id, tipo, enunciado, enunciado_detalle, reglas, casos,
   pistas, puntos, intentos_maximos, orden)
select l.id,
  'seleccion_multiple'::public.tipo_reto,
  $$Evaluación final del curso$$,
  $$Quince preguntas de los ocho módulos. Necesitas 70 % para aprobar.$$,
  jsonb_build_object(
    'modo', 'final',
    'modulo', 8,
    'titulo', $$Evaluación final del curso$$,
    'umbral', 70,
    'preguntas', e.preguntas
  ),
  '[]'::jsonb,
  '[]'::jsonb,
  100, 3, 99
from evaluaciones e
join public.modulos m on m.orden = 8
join lateral (
  select id from public.lecciones
  where modulo_id = m.id
  order by orden
  limit 1
) l on true
where e.modulo = 8
  and not exists (
    select 1 from public.retos r
    where r.reglas->>'modo' = 'final'
  );
