# Brújula — fase 1

PWA sin dependencias (HTML/CSS/JS). Todo se guarda en el dispositivo (localStorage) y se exporta como JSON/CSV.

## Publicar
1. Sube el contenido de esta carpeta a un repositorio (p. ej. `carloschee/brujula`).
2. Settings → Pages → Deploy from branch → `main` / raíz.
3. Abre la URL en el celular y en la laptop e instala la app.

Para probar localmente: `python3 -m http.server` dentro de la carpeta y abrir `http://localhost:8000`.
(Abrir `index.html` con doble clic funciona, pero sin modo offline ni instalación.)

## Estructura
- `js/gen.js` — generadores de ejercicios y detección de errores (catálogo `ERR`).
- `js/content.js` — temas, explicaciones por tipo (historia, visual, paso a paso, patrón) y videos.
- `js/lab.js` — interactivos: recta, fichas, punto decimal, escalera de potencias de 10, expansor, −3² vs (−3)².
- `js/app.js` — rutas, práctica, diagnóstico, simulacro, panel del tutor, respaldo.
- `sw.js` — caché offline. Al publicar cambios, sube el número de `CACHE`.

## Versión 2.0.0 (fase 2)
- `js/content-f2.js` (nuevo): 8 explicaciones más (cada tema tiene historia, visual, paso a paso y patrón), videos específicos por subtema, ejercicios ligados a cada explicación, recomendaciones del informe y plan actualizado.
- `js/detective.js` (nuevo): Detective de errores (soluciones resueltas con un paso equivocado, ponderadas por los errores de la alumna).
- `js/app.js`: Pruébalo (3 ejercicios al final de cada explicación), Repaso de mis errores, Detective, panel con evolución por día, tendencia de errores, efectividad por tipo de explicación, informe imprimible.
- `css/styles.css`, `index.html`, `sw.js`: estilos nuevos, scripts nuevos y caché v2.0.0.
