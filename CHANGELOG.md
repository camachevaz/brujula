# Changelog

Todos los cambios relevantes de Brújula. El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el versionado [SemVer](https://semver.org/lang/es/).

Para publicar una versión: sube todo el contenido de la carpeta y comprueba en **Más** que aparezca el número de versión nuevo. Si no aparece, cierra la app y vuelve a abrirla.

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
