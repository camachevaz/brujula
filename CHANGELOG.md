# Changelog

Todos los cambios relevantes de Brújula. El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el versionado [SemVer](https://semver.org/lang/es/).

Para publicar una versión: sube todo el contenido de la carpeta y comprueba en **Más** que aparezca el número de versión nuevo. Si no aparece, cierra la app y vuelve a abrirla.

## Herramientas — 2026-11-03
La app no cambia (sigue siendo 3.0.0); solo `tools/repo.ps1`.
- **Publicar en main** (opción 8 / `repo.bat publicar`): lleva la rama actual a `main`, integra antes lo que `main` tenga y no fuerza; ofrece dejar la carpeta en `main`.
- **Sesión de GitHub** (opción 7 / `repo.bat sesion`): cambiar entre cuentas ya iniciadas, iniciar sesión con otra o cerrar sesión. El autor de los cambios sigue a la cuenta activa.
- **Estado** muestra la cuenta de GitHub y el autor. *Conectar a otro repositorio* pasa a la opción 9.

## [3.0.0] — 2026-11-02

Versión modular: un núcleo común y una carpeta por asignatura. Primera asignatura nueva: **Física**.

### Agregado
- **Asignaturas como módulos** (`modules/<asignatura>/`), cargadas desde `modules/modules.json`. Para agregar una asignatura no hay que tocar `index.html` ni la app (instrucciones en el README).
- **Mis asignaturas** (Más → Mis asignaturas): cada dispositivo elige qué asignaturas ve. La primera vez, la app pide elegir. A quien ya tenía avance, Inicio le muestra "Nueva asignatura disponible" con botones **Agregar** y **Ahora no**.
- Selector de asignatura en Inicio, en el panel del tutor y en el informe, más una etiqueta con la asignatura actual en el encabezado.
- Aviso con la fecha del examen de cada asignatura y los días que faltan.
- Sección **“También en tu libro”** para temas que no entran al examen pero están en el libro.
- **Módulo de Física** (examen: jueves 5 de noviembre):
  - Temas del examen: *Factor unitario*, *Velocidad, distancia y tiempo* y *Aceleración*. Bases: *Regla de tres y equivalencias* (incluye horas y minutos) y *Despejar fórmulas*. Extra: *Ondas y sonido*.
  - 27 explicaciones en los cuatro enfoques, 26 videos específicos por subtema y enlaces de búsqueda por canal.
  - 15 tipos de ejercicio generados. Las soluciones siguen el formato de su cuaderno: Datos · Fórmula · Conversiones · Sustitución · Resultado.
  - Reconoce 17 tipos de error, la mayoría tomados de su cuaderno: multiplicar en vez de dividir al convertir, equivocar la equivalencia, factor volteado, convertir solo una unidad, despeje equivocado (t = v·d), unidades mezcladas (minutos con m/s), falta la conversión final, horas y minutos (2 h 26 min ≠ 2.26 h), punto decimal recorrido, redondeo prematuro, vf − vi al revés, olvidar vi, signo al frenar, confundir datos (m/s² como velocidad) y frecuencia contra periodo.
  - Detective de física con 13 casos basados en sus errores reales.
  - Laboratorio: *Triángulo d · v · t*, *Pista: uniforme contra acelerado* y *Factor unitario: ¿se tachan?*.
  - Diagnóstico de 10 ejercicios, simulacro de 12 (4 de factor unitario, 4 de velocidad y 4 de aceleración) y plan de martes a jueves.
- Los ejercicios numéricos muestran la unidad junto a la casilla de respuesta.
- La exportación CSV incluye la columna **asignatura**.
- Herramientas para Windows: `probar.bat` (servidor local) y `repo.bat` + `tools/repo.ps1` (sincronizar la carpeta con GitHub usando git y GitHub CLI: conectar, traer, subir, ramas y versiones).

### Cambiado
- `js/gen.js`, `js/content.js`, `js/content-f2.js`, `js/detective.js` y `js/lab.js` pasaron a `modules/matematicas/` y se registran en el núcleo.
- Nuevos archivos de núcleo: `js/core/kit.js`, `js/core/registry.js` y `js/core/loader.js`.
- El panel del tutor, el informe, el plan, el diagnóstico, el simulacro, el Repaso de mis errores, el Detective y el Laboratorio funcionan por asignatura.
- El diagnóstico se guarda por asignatura (`diagBy`). El de matemáticas se sigue guardando también en `diag` por compatibilidad con la v2.
- El service worker precarga todas las asignaturas listadas en `modules.json`. Caché: `brujula-v3.0.0`.
- La app ya no abre con doble clic en `index.html`; se necesita un servidor (ver README).

### Migración
- No se borra nada. Los intentos, simulacros y diagnóstico anteriores se asignan a **Matemáticas** al cargar. Un dispositivo con avance previo queda con Matemáticas activa y ve el aviso para agregar Física.

## [2.0.1] — 2026-11-01

### Corregido
- **Detective de errores: la pregunta era ambigua.** Cuando un paso está mal, los pasos siguientes arrastran el error y también se ven mal, así que varias opciones parecían correctas, pero la app solo aceptaba una. Ahora:
  - La pregunta es **“¿En qué paso empieza el error?”**, con una nota que aclara que los pasos de después pueden arrastrarlo.
  - Si eligen un paso que solo arrastra el error, la app responde “Casi” y da **otra oportunidad**. Si eligen un paso correcto, dice que está bien y también da otra oportunidad.
  - Al terminar, cada paso queda etiquetado: **aquí empieza**, **arrastra el error** o correcto (en verde).
  - El puntaje separa lo encontrado **a la primera** de lo encontrado **con pista**. La barra de progreso usa naranja para “con pista”.
- Panel del tutor: la sección de Detective muestra los aciertos a la primera y los que fueron con pista.

## [2.0.0] — 2026-10-31

Fase 2. Hay más formas de explicar cada tema y la app mide cuáles le funcionan a la alumna.

### Agregado
- **8 explicaciones nuevas.** Con ellas, los seis temas tienen los cuatro enfoques: historia, visual, paso a paso y patrón.
  - Sumar y restar con negativos: *Restar es sumar el contrario* (paso a paso) y *¿Qué pasa si sigo restando?* (patrón).
  - El punto decimal: *Kilómetros, metros y milímetros* (historia).
  - Qué es un exponente: *La tabla que se duplica* (patrón).
  - Regla de los signos: *Pinta los signos dobles* (visual).
  - Notación científica: *¿En qué casilla cae la primera cifra?* (visual) y *El mismo 8.1, distintos tamaños* (patrón).
- **Pruébalo.** Al final de cada explicación hay 3 ejercicios ligados a ella, con retroalimentación inmediata. Se registra el acierto que obtiene justo después de leer cada explicación.
- **Detective de errores** (`#/detective`). Muestra ejercicios ya resueltos con un paso equivocado, y la alumna debe encontrar cuál es. Hay 17 tipos de error escondido, basados en sus errores reales, y aparecen con más frecuencia los que ella comete más.
- **Repaso de mis errores** (`#/practica/errores`). Arma una ronda de 8 ejercicios con los tipos que más le han costado en sus últimos 60 intentos.
- **Videos específicos por subtema.** Son 26 enlaces directos a YouTube, agrupados por subtema (por ejemplo: Con paréntesis, Exponente negativo, División, Suma y resta). Los enlaces de búsqueda por canal se conservan en el grupo "Más canales".
- **Panel del tutor**
  - Gráfica de evolución por día con el porcentaje de aciertos de cada tema del examen y la meta de 8. Tiene tooltip y vista de tabla.
  - Tendencia de cada error, que compara la primera mitad de los ejercicios con la segunda (bajando / subiendo).
  - Efectividad por tipo de explicación: compara lo que ella dice (valoración) con su acierto en "Pruébalo".
  - Detalle por explicación con su valoración, el resultado de Pruébalo y cuántas veces la abrió.
  - Sección de Detective: qué errores reconoce cuando los ve resueltos.
  - Botón al informe imprimible.
- **Informe para adecuar material** (`#/informe`). Resume cómo aprende mejor, qué domina, qué le cuesta, sus errores frecuentes con su tendencia, recomendaciones automáticas por tipo de error y de enfoque, y las notas del tutor. Se puede imprimir o guardar como PDF.
- **Plan hasta el martes**: el domingo incluye el Detective de errores y el lunes el Repaso de mis errores.
- Sección **Entrenamientos especiales** en Práctica y tarjeta del informe en Más.
- Archivos nuevos: `js/content-f2.js` y `js/detective.js`.

### Cambiado
- El indicador de dominio (puntos verdes) ya no cuenta los ejercicios del Detective, porque miden si reconoce errores, no si resuelve.
- Las estadísticas del panel separan los ejercicios que ella resuelve de los del Detective.
- Las valoraciones de videos usan un identificador estable basado en la URL. Las valoraciones anteriores se conservan.
- Caché del service worker: `brujula-v2.0.0`.

### Corregido
- La etiqueta de la meta en la gráfica ya no se encima con las etiquetas de las líneas.
- El tooltip de la gráfica ya no se sale de la pantalla en celular.
- La tabla de posiciones de *¿En qué casilla cae…?* cabe completa en pantallas de 360 px.

## [1.0.2] — 2026-10-31

### Agregado
- Pantalla "Algo salió mal": cuando falla algo, muestra el error, la versión y el navegador en lugar de dejar la pantalla en blanco.
- Número de versión visible en **Más**.

### Cambiado
- Los archivos se cargan con `?v=` para que el navegador no use copias viejas.
- Caché del service worker: `brujula-v1.0.2`.

### Corregido
- Las tablas del panel del tutor ya no se salen de la pantalla en celular.

### Conocido
- Hubo un reporte de pantalla en blanco al abrir el Diagnóstico desde el plan que no se ha podido reproducir. La pantalla de error de esta versión permite diagnosticarlo.

## [1.0.0] — 2026-10-30

Fase 1. Primera versión, enfocada en el examen del martes 3 de noviembre.

### Agregado
- PWA en HTML/CSS/JS sin dependencias. Funciona sin conexión, se puede instalar y tiene modo claro y oscuro.
- Seis temas: tres del examen (regla de los signos, leyes de los exponentes y notación científica) y tres fundacionales (sumar y restar con negativos, el punto decimal y las potencias de 10, y qué es un exponente).
- 25 explicaciones de cuatro tipos, con valoración "Sí / Más o menos / No" y videos de varios canales.
- Práctica con 22 tipos de ejercicio generados al azar. Detecta 29 tipos de error específicos y enlaza cada uno a la explicación que lo resuelve. La práctica se adapta según los errores.
- Diagnóstico corto (12 ejercicios) que propone una ruta de estudio.
- Simulacro de examen (15 ejercicios, calificación sobre 10, revisión al final).
- Laboratorio con seis interactivos: recta numérica, fichas, mover el punto, escalera de potencias de 10, expansor de potencias y −3² contra (−3)².
- Plan de tres días que se marca solo.
- Panel del tutor: acierto por tema, errores repetidos, valoraciones por tipo de explicación, comparación por su cuenta / con tutor, simulacros y notas.
- Datos solo en el dispositivo, con respaldo JSON, importación que combina sin duplicar, exportación CSV, solicitud de almacenamiento persistente y una guía de prácticas para no perder datos.

[2.0.0]: #200--2026-10-31
[1.0.2]: #102--2026-10-31
[1.0.0]: #100--2026-10-30
