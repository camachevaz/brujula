# Brújula

PWA sin dependencias (HTML/CSS/JS) para estudiar cada tema de varias formas, con práctica que reconoce el tipo de error, Detective de errores, panel del tutor e informe. Los datos se guardan solo en el dispositivo y se exportan como JSON/CSV.

Desde la versión 3 la app es **modular**: un núcleo común y una carpeta por asignatura.

## Probar localmente
```powershell
cd C:\ruta\a\brujula
py -m http.server 8000
```
Abre `http://localhost:8000`. Con doble clic en `index.html` **no funciona**: las asignaturas se cargan desde `modules/modules.json`.

Consejo: en Chrome, DevTools → Application → Service workers → **Update on reload** mientras pruebas.

## Sincronizar con GitHub (repo.bat)
Doble clic en `repo.bat` abre un menú: estado, traer de GitHub, subir cambios, cambiar de rama, marcar versión, probar localmente, sesión de GitHub, publicar en main y conectar a otro repositorio.
- Usa **git** y **GitHub CLI**. Si faltan, ofrece instalarlos con winget; la sesión se inicia en el navegador (`gh auth login`) y git usa esas credenciales.
- La primera vez conecta la carpeta al repositorio que elijas **sin mover tus archivos**: lo que sea distinto a GitHub aparece como cambio por subir.
- Es portable: la configuración se guarda dentro de `.git/` y viaja con la carpeta.
- Al subir: muestra los archivos cambiados, pide un mensaje, integra primero lo que haya nuevo en GitHub y nunca fuerza. Si subes a `main`, avisa que GitHub Pages lo publicará.
- **Sesión de GitHub** (opción 7): muestra las cuentas iniciadas y cuál está activa; permite cambiar a otra cuenta ya iniciada, iniciar sesión con otra o cerrar sesión. El autor de los cambios de la carpeta se ajusta a la cuenta activa (con su correo privado de GitHub); si pusiste tu propio nombre y correo en la carpeta, pregunta antes de cambiarlos. **Estado** muestra la cuenta y el autor.
- **Publicar en main** (opción 8): lleva lo de la rama actual (por ejemplo `v3`) a `main` para que GitHub Pages lo publique. Pide que todo esté subido; si `main` tiene cambios propios, primero los junta en la rama y nunca fuerza. Al final ofrece dejar la carpeta trabajando en `main`; la otra rama se conserva.
- Desde una terminal: `repo.bat estado`, `repo.bat traer`, `repo.bat subir "mensaje"`, `repo.bat rama`, `repo.bat etiqueta`, `repo.bat publicar`, `repo.bat sesion`.

## Estructura
```
index.html
css/styles.css
js/core/kit.js        utilidades compartidas (números, formato, lectura de respuestas)
js/core/registry.js   registro de asignaturas: Brujula, Content, Gen, LAB
js/core/sound.js      sonidos de fondo generados con Web Audio (ruidos, lluvia, olas) y aviso de fin de bloque
js/core/loader.js     lee modules/modules.json, carga cada asignatura y arranca la app
js/app.js             la app (rutas, práctica, diagnóstico, simulacro, panel, informe, respaldo)
modules/modules.json  lista de asignaturas y sus archivos (en orden de carga)
modules/matematicas/  gen.js · content.js · content-f2.js · detective.js · lab.js
modules/fisica/       gen.js · content.js · detective.js · lab.js
sw.js                 caché sin conexión (precarga el núcleo y todo lo listado en modules.json)
probar.bat            servidor local para probar
repo.bat, tools/      sincronización con GitHub
```

## Agregar una asignatura
1. Crea `modules/<carpeta>/` con, como mínimo, `gen.js` (ejercicios) y `content.js` (temas).
2. Agrégala a `modules/modules.json`:
   ```json
   { "id": "qui", "folder": "quimica", "files": ["gen.js", "content.js"] }
   ```
3. En los archivos, registra todo con un **id de asignatura** y **prefijos únicos** (los ids de temas, ejercicios, errores y explicaciones no pueden repetirse entre asignaturas):
   ```js
   // gen.js
   Brujula.addExercises('qui', { ERR: { Q_...: {t, m, lens} }, SUBS: { q_...: { topic, name, gen } } });
   Brujula.subject('qui', { diag: [...subs], sim: { tema: [...subs] } });
   // content.js
   Brujula.subject('qui', { name, short, grade, summary, exam: { date: 'AAAA-MM-DD', label }, examTopics: [...], plan: [...] });
   Brujula.addTopics('qui', [ { id, kind: 'tema'|'fund'|'extra', title, summary, prereq, subs, lab, lenses, videos } ]);
   // opcionales
   Brujula.subject('qui', { detective: { make } });   // detective.js
   Brujula.addLabs('qui', { q_algo: { title, topic, desc, mount(el) {} } });   // lab.js
   ```
4. Sube la versión en `index.html` (`BRUJULA_VERSION` y los `?v=`), en `sw.js` (`CACHE` y `V`) y en `js/app.js` (`VERSION`).

Cada ejercicio generado devuelve `{ type: 'num'|'exp'|'nc'|'mc', prompt, answerText, solution, check(input) → {ok, err} }`; `num` acepta `unit` y `hint`. El código de error de `check` debe existir en `ERR`; su campo `lens` apunta a la explicación que lo resuelve.

## Datos
- Se guardan en `localStorage` con la clave `brujula.v1` (la misma desde la v1: actualizar no borra nada).
- Cada intento guarda `subject`. Los datos anteriores a la v3 se asignan a Matemáticas al cargar.
- Cada dispositivo elige sus asignaturas en **Más → Mis asignaturas**. Ocultar una no borra su avance.
- Enfoque: `focus` guarda las sesiones (`{t, end, min, plan, done, subject}`), `focusNow` el bloque en curso y los intentos hechos durante un bloque llevan `focus: 1`.
