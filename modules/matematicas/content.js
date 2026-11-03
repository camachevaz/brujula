/* Brújula · Matemáticas — temas, explicaciones y videos */
(function (global) {
  'use strict';
  const s = (e) => '<sup>' + e + '</sup>';
  const fr = (n, d) => '<span class="ifrac"><span>' + n + '</span><span>' + d + '</span></span>';
  const yt = (q) => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);
  const ka = (q) => 'https://es.khanacademy.org/search?page_search_query=' + encodeURIComponent(q);

  const KINDS = {
    historia: { name: 'Historia', hint: 'Una situación de la vida real' },
    visual: { name: 'Visual', hint: 'Verlo y manipularlo' },
    paso: { name: 'Paso a paso', hint: 'Un procedimiento con pasos fijos' },
    patron: { name: 'Patrón', hint: 'Descubrir la regla en una secuencia' },
    video: { name: 'Video', hint: 'Que alguien más lo explique' }
  };

  const TOPICS = [
    /* ================= FUNDACIONALES ================= */
    {
      id: 'enteros', kind: 'fund', title: 'Sumar y restar con negativos',
      summary: 'La base de la regla de los signos y de operar exponentes negativos.',
      prereq: [], subs: ['menosneg', 'eparentesis'], lab: ['recta', 'fichas'],
      lenses: [
        {
          id: 'enteros-var', kind: 'historia', title: 'La diferencia de goles',
          html: `<p>En un torneo, cada equipo lleva su <b>diferencia de goles</b>. Un gol a favor cuenta <b>+1</b>; un gol en contra cuenta <b>−1</b>.</p>
<table class="tbl"><tr><th>Operación</th><th>Qué pasa en la cancha</th><th>Efecto</th></tr>
<tr><td>+ (+2)</td><td>Anotas 2 goles</td><td>sube</td></tr>
<tr><td>+ (−2)</td><td>Te anotan 2 goles</td><td>baja</td></tr>
<tr><td>− (+2)</td><td>El árbitro anula 2 goles tuyos</td><td>baja</td></tr>
<tr><td>− (−2)</td><td>El VAR anula 2 goles que te habían metido</td><td><b>sube</b></td></tr></table>
<p>Quitar algo malo es bueno. Por eso <b>−(−2) = +2</b>.</p>
<div class="ex"><p>Tu equipo va con diferencia <b>−3</b>. El VAR anula 2 goles en contra:</p><p class="mono">−3 − (−2) = −3 + 2 = −1</p><p>Sigues abajo, pero mejoraste.</p></div>`
        },
        {
          id: 'enteros-deudas', kind: 'historia', title: 'Tengo y debo',
          html: `<p>Positivo = <b>tengo</b>. Negativo = <b>debo</b>.</p>
<ul><li><b>12 − 8</b>: tengo 12, gasto 8 → tengo 4.</li>
<li><b>−5 − 4</b>: debo 5 y pido prestados 4 más → debo 9 → <b>−9</b>.</li>
<li><b>−5 + 7</b>: debo 5 y me pagan 7 → pago la deuda y me sobran 2 → <b>+2</b>.</li>
<li><b>6 − (−4)</b>: tengo 6 y alguien me <b>perdona</b> una deuda de 4 → es como si me dieran 4 → <b>10</b>.</li></ul>
<div class="ex"><p>Truco: lee “menos menos” como “me perdonan una deuda”.</p></div>`
        },
        {
          id: 'enteros-fichas', kind: 'visual', title: 'Fichas que se anulan',
          html: `<p>Usa fichas <span class="chip pos">+</span> y <span class="chip neg">−</span>. Una de cada tipo juntas valen <b>cero</b>: se anulan.</p>
<ul><li><b>Sumar</b> = poner fichas.</li><li><b>Restar</b> = quitar fichas.</li></ul>
<p>¿Y si tienes que quitar fichas <span class="chip neg">−</span> que no hay? Agregas parejas <span class="chip pos">+</span><span class="chip neg">−</span> (que valen cero, no cambian nada) y luego quitas las <span class="chip neg">−</span>. Te quedan <span class="chip pos">+</span> de sobra.</p>
<div class="ex"><p><b>2 − (−3)</b>: tienes 2 positivas. Agregas 3 parejas cero y quitas 3 negativas. Quedan <b>5 positivas</b>.</p></div>
<p><a href="#/lab/fichas" class="btn ghost sm">Probar con fichas</a></p>`
        },
        {
          id: 'enteros-recta', kind: 'visual', title: 'Caminar en la recta',
          html: `<p>Imagina que caminas sobre una recta numérica, empezando en el primer número.</p>
<ul><li>El <b>signo del número</b> dice hacia dónde miras: positivo → derecha, negativo → izquierda.</li>
<li>La <b>operación</b> dice si caminas de frente (+) o <b>de espaldas</b> (−).</li></ul>
<div class="ex"><p><b>−4 − (−6)</b>: estás en −4, miras a la izquierda (−6), pero caminas de espaldas (−): avanzas 6 a la <b>derecha</b> → llegas a <b>2</b>.</p></div>
<p><a href="#/lab/recta" class="btn ghost sm">Probar en la recta</a></p>`
        }
      ],
      videos: [
        { title: 'Suma y resta de enteros en la recta numérica (SEP)', ch: 'Nueva Escuela Mexicana', url: 'https://nuevaescuelamexicana.sep.gob.mx/contenido/recurso/suma-y-resta-de-numeros-enteros-en-la-recta-numerica/', v: 1 },
        { title: '¿Debo o tengo? Números enteros (SEP)', ch: 'Aprende en casa', url: 'https://www.youtube.com/watch?v=uMk3ja_zIZo', v: 1 },
        { title: 'Suma y resta de números enteros', ch: 'Daniel Carreón', url: yt('Daniel Carreón suma y resta de números enteros') },
        { title: 'Suma y resta de enteros', ch: 'Matemáticas profe Alex', url: yt('Matemáticas profe Alex suma y resta de números enteros') },
        { title: 'Resta de números negativos', ch: 'Khan Academy Español', url: ka('restar números negativos') },
        { title: 'Suma y resta de enteros con paréntesis', ch: 'Julioprofe', url: yt('Julioprofe suma y resta de enteros signos de agrupación') }
      ]
    },
    {
      id: 'posicional', kind: 'fund', title: 'El punto decimal y las potencias de 10',
      summary: 'Mover el punto con seguridad es la mitad de la notación científica.',
      prereq: [], subs: ['mult10'], lab: ['punto', 'escalera'],
      lenses: [
        {
          id: 'pos-punto', kind: 'visual', title: 'El punto que salta',
          html: `<p>Multiplicar o dividir entre 10, 100, 1000… no requiere hacer la cuenta: solo <b>mueves el punto</b>.</p>
<ul><li><b>× 10</b> → el número crece → el punto salta <b>1 lugar a la derecha</b>.</li>
<li><b>÷ 10</b> → el número se achica → el punto salta <b>1 lugar a la izquierda</b>.</li>
<li>× 1000 tiene 3 ceros → 3 saltos.</li></ul>
<p>Si te quedas sin cifras, rellenas con ceros.</p>
<div class="ex"><p class="mono">3.45 × 1000 = 3450.</p><p class="mono">52.7 ÷ 100 = 0.527</p></div>
<p><b>Cuenta saltos, no ceros.</b> En 0.000308 hay 3 ceros después del punto, pero el punto tiene que saltar 4 veces para quedar después del 3.</p>
<p><a href="#/lab/punto" class="btn ghost sm">Mover el punto</a></p>`
        },
        {
          id: 'pos-tabla', kind: 'paso', title: 'La tabla de posiciones',
          html: `<p>Cada lugar vale 10 veces lo que vale el lugar de su derecha.</p>
<div class="scroll"><table class="tbl c"><tr><th>millares</th><th>centenas</th><th>decenas</th><th>unidades</th><th>.</th><th>décimos</th><th>centésimos</th><th>milésimos</th></tr>
<tr><td>1000</td><td>100</td><td>10</td><td>1</td><td>.</td><td>0.1</td><td>0.01</td><td>0.001</td></tr>
<tr><td></td><td></td><td>5</td><td>2</td><td>.</td><td>7</td><td></td><td></td></tr>
<tr><td></td><td></td><td></td><td>0</td><td>.</td><td>5</td><td>2</td><td>7</td></tr></table></div>
<p>52.7 ÷ 100: cada cifra baja 2 lugares → 0.527. Las cifras no cambian; cambia su lugar.</p>`
        },
        {
          id: 'pos-escalera', kind: 'patron', title: 'La escalera de potencias de 10',
          html: `<p>Mira qué pasa al bajar un escalón: siempre se <b>divide entre 10</b>.</p>
<table class="tbl c"><tr><td>10${s(3)}</td><td>1000</td></tr><tr><td>10${s(2)}</td><td>100</td></tr><tr><td>10${s(1)}</td><td>10</td></tr><tr><td>10${s(0)}</td><td>1</td></tr><tr><td>10${s('−1')}</td><td>0.1</td></tr><tr><td>10${s('−2')}</td><td>0.01</td></tr><tr><td>10${s('−3')}</td><td>0.001</td></tr></table>
<p>El exponente dice <b>cuántos lugares</b> se aleja del 1: positivo hacia los números grandes, negativo hacia los chiquitos.</p>
<p><a href="#/lab/escalera" class="btn ghost sm">Recorrer la escalera</a></p>`
        }
      ],
      videos: [
        { title: 'Multiplicar y dividir decimales entre 10, 100 y 1000', ch: 'Daniel Carreón', url: yt('Daniel Carreón multiplicar decimales por 10 100 1000') },
        { title: 'Multiplicación por potencias de 10', ch: 'Khan Academy Español', url: ka('multiplicar por potencias de 10') },
        { title: 'Valor posicional de decimales', ch: 'Matemáticas profe Alex', url: yt('Matemáticas profe Alex valor posicional decimales') },
        { title: 'Potencias de 10 positivas y negativas', ch: 'Math2me', url: yt('math2me potencias de 10 exponente negativo') }
      ]
    },
    {
      id: 'exponente', kind: 'fund', title: 'Qué es un exponente',
      summary: 'El 1 invisible y el signo que queda dentro o fuera de la potencia.',
      prereq: [], subs: ['expand', 'signobase'], lab: ['expansor', 'signo'],
      lenses: [
        {
          id: 'exp-def', kind: 'paso', title: 'Qué dice un exponente',
          html: `<p>El exponente dice <b>cuántas veces se multiplica la base por sí misma</b>.</p>
<div class="ex"><p class="mono">5${s(2)} = 5 · 5 = 25 &nbsp;&nbsp;(no 5 · 2)</p><p class="mono">a${s(4)} = a · a · a · a</p></div>
<p>Por eso 3${s(4)} = 81 y no 12: elevar no es multiplicar por el exponente.</p>`
        },
        {
          id: 'exp-uno', kind: 'historia', title: 'El 1 invisible',
          html: `<p>Piensa en el número en la playera de un equipo: aunque veas al jugador de frente y no se vea, <b>todos traen número</b>.</p>
<p>Con las letras pasa igual: una letra sola trae un <b>exponente 1 escondido</b>.</p>
<div class="ex"><p class="mono">k = k${s(1)}</p><p class="mono">(k${s(5)})(k)(k${s(3)}) = k${s('5+1+3')} = k${s(9)}</p><p class="mono">${fr('(k' + s(7) + ')' + s(7), '(k' + s(3) + ')(k' + s(8) + ')(k)')} = k${s('49 − 12')} = k${s(37)}</p></div>
<p>Antes de sumar o restar exponentes, <b>escribe el 1</b> encima de cada letra sola.</p>`
        },
        {
          id: 'exp-signo', kind: 'visual', title: '¿Quién está dentro de la potencia?',
          html: `<p>El exponente solo “agarra” lo que está <b>pegado</b> a él.</p>
<div class="two"><div class="ex"><p class="mono">−3${s(2)}</p><p>El 2 solo toca al 3. El menos se queda afuera esperando.</p><p class="mono">−(3·3) = <b>−9</b></p></div>
<div class="ex"><p class="mono">(−3)${s(2)}</p><p>El paréntesis mete al menos dentro.</p><p class="mono">(−3)(−3) = <b>+9</b></p></div></div>
<p>Con base negativa <b>entre paréntesis</b>: exponente par → positivo; impar → negativo.</p>
<p><a href="#/lab/signo" class="btn ghost sm">Compararlos</a></p>`
        }
      ],
      videos: [
        { title: 'Qué es una potencia', ch: 'Daniel Carreón', url: yt('Daniel Carreón potenciación qué es una potencia') },
        { title: 'Potencias de base negativa', ch: 'Matemáticas con Juan', url: yt('Matemáticas con Juan potencia base negativa') },
        { title: 'Introducción a los exponentes', ch: 'Khan Academy Español', url: ka('introducción a los exponentes') },
        { title: 'Potenciación con números negativos', ch: 'Julioprofe', url: yt('Julioprofe potenciación números negativos') }
      ]
    },

    /* ================= TEMAS DEL EXAMEN ================= */
    {
      id: 'signos', kind: 'tema', title: 'Regla de los signos',
      summary: 'Sumas y restas con paréntesis, decimales, multiplicación y división.',
      prereq: ['enteros'], subs: ['cadena', 'parentesis', 'decimales', 'multdiv'], lab: ['recta', 'fichas'],
      lenses: [
        {
          id: 'signos-quitar', kind: 'paso', title: 'Dos pasos: quita paréntesis y agrupa',
          html: `<p><b>Paso 1. Quita los paréntesis.</b> Mira los dos signos juntos:</p>
<table class="tbl c"><tr><td>+ ( + )</td><td>→ +</td><td rowspan="2">signos iguales → <b>+</b></td></tr><tr><td>− ( − )</td><td>→ +</td></tr>
<tr><td>+ ( − )</td><td>→ −</td><td rowspan="2">signos diferentes → <b>−</b></td></tr><tr><td>− ( + )</td><td>→ −</td></tr></table>
<p><b>Paso 2. Agrupa</b> (este ya lo dominas): suma todos los positivos, suma todos los negativos, réstalos y pon el signo del grupo más grande.</p>
<div class="ex"><p class="mono">(−4) + (7) + (−12) + (9)</p><p class="mono">= −4 + 7 − 12 + 9</p><p>positivos 16 · negativos 16 → <b>0</b></p></div>
<div class="ex"><p class="mono">(12) − (−8) − (−6) − (12)</p><p class="mono">= 12 + 8 + 6 − 12</p><p>positivos 26 · negativos 12 → <b>14</b></p></div>
<p>Nunca sumes los números “sin signo”: primero el paso 1.</p>`
        },
        {
          id: 'signos-tabla', kind: 'paso', title: 'Una sola tabla para todo',
          html: `<p>La misma tabla sirve para <b>quitar paréntesis</b> y para <b>multiplicar o dividir</b>:</p>
<table class="tbl c"><tr><th>×  ÷</th><th>+</th><th>−</th></tr><tr><th>+</th><td>+</td><td>−</td></tr><tr><th>−</th><td>−</td><td>+</td></tr></table>
<ul><li>(−6) × (−4) = +24 &nbsp; (iguales → +)</li><li>(−20) ÷ (5) = −4 &nbsp; (diferentes → −)</li><li>− (−9) = +9 &nbsp; (iguales → +)</li></ul>
<p>La suma de dos números <b>no</b> usa esta tabla: ahí se agrupan positivos y negativos.</p>`
        },
        {
          id: 'signos-mult', kind: 'patron', title: 'Cuenta los negativos',
          html: `<p>Observa el patrón: cada renglón baja 3.</p>
<table class="tbl c"><tr><td>3 × 2</td><td>6</td><td>(−3) × 2</td><td>−6</td></tr><tr><td>3 × 1</td><td>3</td><td>(−3) × 1</td><td>−3</td></tr><tr><td>3 × 0</td><td>0</td><td>(−3) × 0</td><td>0</td></tr><tr><td>3 × (−1)</td><td>−3</td><td>(−3) × (−1)</td><td><b>3</b></td></tr><tr><td>3 × (−2)</td><td>−6</td><td>(−3) × (−2)</td><td><b>6</b></td></tr></table>
<p>En la columna derecha el resultado <b>sube</b> de 3 en 3, así que negativo por negativo da positivo.</p>
<p>Con muchos factores: <b>cuenta los negativos</b>. Par → positivo. Impar → negativo.</p>
<div class="ex"><p class="mono">(−3)(−2)(5)(−8)</p><p>3 negativos → impar → negativo · 3·2·5·8 = 240 → <b>−240</b></p></div>`
        },
        {
          id: 'signos-amigos', kind: 'historia', title: 'Amigos y rivales',
          html: `<p>Piensa en <b>+</b> como “amigo” y <b>−</b> como “rival” (un equipo con el que tienes rivalidad).</p>
<ul><li>El amigo de mi amigo es mi amigo → + · + = <b>+</b></li><li>El amigo de mi rival es mi rival → + · − = <b>−</b></li><li>El rival de mi amigo es mi rival → − · + = <b>−</b></li><li>El rival de mi rival es mi amigo → − · − = <b>+</b></li></ul>
<p>Funciona para multiplicar, dividir y quitar paréntesis.</p>`
        },
        {
          id: 'signos-decimales', kind: 'paso', title: 'Decimales con signo',
          html: `<p>El método es el mismo; solo cuida <b>alinear los puntos</b> al sumar.</p>
<div class="ex"><p class="mono">(−2.7) + (−12.3) + (7.5) + (−3)</p><p class="mono">= −2.7 − 12.3 + 7.5 − 3</p>
<pre class="mono vert">  negativos      positivos
    2.7             7.5
   12.3
 +  3.0
   ----
   18.0</pre><p>18.0 − 7.5 = 10.5 · gana el grupo negativo → <b>−10.5</b></p></div>
<p>Escribe los enteros con <b>.0</b> (3 → 3.0; 12 → 12.00 si hay centésimos) para que las columnas no se mezclen.</p>`
        }
      ],
      videos: [
        { title: 'Regla de los signos (SEP)', ch: 'Aprende en casa', url: 'https://www.youtube.com/watch?v=j4kU1DfKWdE', v: 1 },
        { title: 'Ley de los signos', ch: 'Matemáticas profe Alex', url: yt('Matemáticas profe Alex ley de los signos') },
        { title: 'Suma y resta con signos de agrupación', ch: 'Daniel Carreón', url: yt('Daniel Carreón suma y resta de números con signo paréntesis') },
        { title: 'Multiplicación y división de negativos', ch: 'Khan Academy Español', url: ka('multiplicar números negativos') },
        { title: 'Ley de los signos', ch: 'Susi Profe', url: yt('Susi profe ley de los signos') },
        { title: 'Suma de decimales positivos y negativos', ch: 'Matemáticas profe Alex', url: yt('profe Alex suma y resta de decimales con signo') }
      ]
    },
    {
      id: 'exponentes', kind: 'tema', title: 'Leyes de los exponentes',
      summary: 'Producto, cociente, potencia de potencia, de un producto, cero y negativo.',
      prereq: ['exponente', 'enteros'], subs: ['producto', 'cociente', 'potpot', 'potprod', 'negativo', 'cero', 'mixto'], lab: ['expansor', 'signo'],
      lenses: [
        {
          id: 'exp-tabla', kind: 'paso', title: 'Las leyes en una tabla',
          html: `<table class="tbl"><tr><th>Si ves…</th><th>Haz</th><th>Ejemplo</th></tr>
<tr><td>multiplicación, misma base</td><td><b>suma</b></td><td>a${s(3)}·a${s(4)} = a${s(7)}</td></tr>
<tr><td>división, misma base</td><td><b>resta</b> (arriba − abajo)</td><td>${fr('a' + s(2), 'a' + s(7))} = a${s('−5')}</td></tr>
<tr><td>potencia de potencia</td><td><b>multiplica</b></td><td>(a${s(3)})${s(4)} = a${s(12)}</td></tr>
<tr><td>potencia de un producto</td><td><b>reparte</b> y multiplica</td><td>(a${s(2)}b)${s(3)} = a${s(6)}b${s(3)}</td></tr>
<tr><td>exponente 0</td><td>vale <b>1</b></td><td>m${s(0)} = 1</td></tr>
<tr><td>exponente negativo</td><td><b>cambia de piso</b></td><td>h${s('−5')} = ${fr(1, 'h' + s(5))}</td></tr></table>
<p>Antes de empezar: escribe el <b>1</b> sobre cada letra sola.</p>`
        },
        {
          id: 'exp-expand', kind: 'visual', title: 'Expándelo y cuenta',
          html: `<p>Si dudas, escribe todas las letras y cuéntalas. La regla aparece sola.</p>
<div class="ex"><p class="mono">a${s(3)} · a${s(4)} = (a·a·a)(a·a·a·a) = 7 letras = a${s(7)}</p><p>Por eso en la multiplicación <b>se suman</b>.</p></div>
<div class="ex"><p class="mono">(a${s(3)})${s(4)} = a${s(3)} · a${s(3)} · a${s(3)} · a${s(3)} = 4 grupos de 3 = a${s(12)}</p><p>Por eso en potencia de potencia <b>se multiplican</b>.</p></div>
<div class="ex"><p class="mono">(ab${s(2)})${s(3)} = (ab${s(2)})(ab${s(2)})(ab${s(2)}) = a${s(3)}b${s(6)}</p><p>La a también se repite 3 veces: el exponente <b>se reparte a todas</b>.</p></div>
<p><a href="#/lab/expansor" class="btn ghost sm">Abrir el expansor</a></p>`
        },
        {
          id: 'exp-tachar', kind: 'visual', title: 'Tacha arriba y abajo',
          html: `<p>En una división, cada letra de arriba se cancela con una de abajo (a/a = 1).</p>
<div class="ex"><p class="mono">${fr('a' + s(7), 'a' + s(4))} = ${fr('<s>a·a·a·a</s>·a·a·a', '<s>a·a·a·a</s>')} = a${s(3)}</p><p>Sobran 3 <b>arriba</b> → exponente positivo. 7 − 4 = 3.</p></div>
<div class="ex"><p class="mono">${fr('a' + s(4), 'a' + s(7))} = ${fr('<s>a·a·a·a</s>', '<s>a·a·a·a</s>·a·a·a')} = ${fr(1, 'a' + s(3))} = a${s('−3')}</p><p>Sobran 3 <b>abajo</b> → exponente negativo. 4 − 7 = −3.</p></div>
<p>Siempre <b>arriba menos abajo</b>. El signo del resultado te dice de qué lado sobraron.</p>`
        },
        {
          id: 'exp-patron', kind: 'patron', title: 'Bajando la escalera',
          html: `<p>Cada vez que el exponente baja 1, el valor se divide entre 2:</p>
<table class="tbl c"><tr><td>2${s(4)}</td><td>16</td></tr><tr><td>2${s(3)}</td><td>8</td></tr><tr><td>2${s(2)}</td><td>4</td></tr><tr><td>2${s(1)}</td><td>2</td></tr><tr><td>2${s(0)}</td><td><b>1</b></td></tr><tr><td>2${s('−1')}</td><td>${fr(1, 2)}</td></tr><tr><td>2${s('−2')}</td><td>${fr(1, 4)} = ${fr(1, '2' + s(2))}</td></tr><tr><td>2${s('−3')}</td><td>${fr(1, 8)} = ${fr(1, '2' + s(3))}</td></tr></table>
<p>Siguiendo el patrón: el exponente 0 da <b>1</b>, y los exponentes negativos dan <b>fracciones</b>, no números negativos.</p>`
        },
        {
          id: 'exp-neg', kind: 'historia', title: 'El boleto para cambiar de piso',
          html: `<p>Imagina una fracción como un edificio de dos pisos: arriba el numerador, abajo el denominador.</p>
<p>Un exponente negativo es un <b>boleto para cambiar de piso</b>. La potencia baja (o sube) y, al llegar, <b>entrega el boleto</b>: el menos desaparece.</p>
<div class="ex"><p class="mono">h${s('−5')} = ${fr(1, 'h' + s(5))} ✔</p><p class="mono">${fr(1, 'h' + s('−5'))} ✘ &nbsp;(no entregó el boleto)</p><p class="mono">−h${s(5)} ✘ &nbsp;(el boleto no vuelve negativo al número)</p></div>
<div class="ex"><p>Al revés también funciona: ${fr(1, 'x' + s(3))} = x${s('−3')} (subió y le dieron boleto).</p></div>`
        }
      ],
      videos: [
        { title: 'Leyes de los exponentes: todas las leyes', ch: 'Math2me', url: 'https://www.youtube.com/watch?v=CfbspxOf0lA', v: 1 },
        { title: 'Leyes de los exponentes y notación científica (SEP)', ch: 'Aprende en casa', url: 'https://www.youtube.com/watch?v=bXMhMhL1Mkg', v: 1 },
        { title: 'Leyes de los exponentes', ch: 'Matemáticas profe Alex', url: yt('Matemáticas profe Alex leyes de los exponentes') },
        { title: 'Leyes de los exponentes', ch: 'Daniel Carreón', url: yt('Daniel Carreón leyes de los exponentes') },
        { title: 'Exponente negativo', ch: 'Khan Academy Español', url: ka('exponentes negativos') },
        { title: 'Propiedades de la potenciación', ch: 'Julioprofe', url: yt('Julioprofe propiedades de la potenciación') }
      ]
    },
    {
      id: 'nc', kind: 'tema', title: 'Notación científica',
      summary: 'Convertir en ambos sentidos y operar: multiplicar, dividir, sumar y restar.',
      prereq: ['posicional', 'exponentes', 'enteros'], subs: ['a_nc', 'a_decimal', 'normalizar', 'mult', 'div', 'suma'], lab: ['punto', 'escalera'],
      lenses: [
        {
          id: 'nc-contexto', kind: 'historia', title: 'Cosas enormes y diminutas',
          html: `<p>La notación científica existe para no contar ceros.</p>
<ul><li>Una canción muy escuchada: 2,500,000,000 reproducciones = <b>2.5 × 10${s(9)}</b></li>
<li>Una fábrica de chocolate grande: 3,600,000 barras al mes = <b>3.6 × 10${s(6)}</b></li>
<li>Distancia de la Tierra al Sol: 150,000,000 km = <b>1.5 × 10${s(8)}</b></li>
<li>Una célula: 0.00001 m = <b>1 × 10${s('−5')}</b></li>
<li>Un virus: 0.0000023 mm = <b>2.3 × 10${s('−6')}</b></li></ul>
<p>Lo grande lleva exponente <b>positivo</b>. Lo diminuto, <b>negativo</b>.</p>`
        },
        {
          id: 'nc-grande', kind: 'paso', title: '¿Grande o chiquito?',
          html: `<p>Olvídate de “izquierda o derecha”. Pregúntate: <b>¿el número es grande o chiquito?</b></p>
<p><b>De número a notación científica</b></p>
<ol><li>Pon el punto después de la <b>primera cifra que no sea cero</b>.</li><li>Cuenta <b>cuántos saltos</b> dio el punto.</li><li>Signo: número original <b>grande</b> (10 o más) → <b>+</b>. Número <b>chiquito</b> (empieza con 0.) → <b>−</b>.</li></ol>
<div class="ex"><p class="mono">0.00081 → 8.1 · 4 saltos · chiquito → 8.1 × 10${s('−4')}</p><p class="mono">3,205 → 3.205 · 3 saltos · grande → 3.205 × 10${s(3)}</p></div>
<p><b>De notación científica a número</b></p>
<p>Exponente <b>+</b> → el resultado tiene que ser <b>grande</b>. Exponente <b>−</b> → tiene que ser <b>chiquito</b> (0.000…).</p>
<div class="ex"><p class="mono">3.08 × 10${s(6)} → grande → 3,080,000</p><p class="mono">1.2 × 10${s('−1')} → chiquito → 0.12</p></div>
<p><b>Comprobación final:</b> ¿tu respuesta es grande o chiquita? ¿Coincide con el signo?</p>`
        },
        {
          id: 'nc-norm', kind: 'paso', title: 'El coeficiente entre 1 y 10',
          html: `<p>El primer número debe tener <b>una sola cifra antes del punto</b>, y no puede ser 0.</p>
<p>Si no la tiene, acomódalo con la <b>regla de la balanza</b>: lo que crece de un lado, se compensa del otro.</p>
<div class="ex"><p class="mono">34.16 × 10${s('−7')}</p><p>34.16 → 3.416: el coeficiente se hizo <b>más chico</b> → el exponente <b>sube</b> 1</p><p class="mono">= 3.416 × 10${s('−6')}</p></div>
<div class="ex"><p class="mono">0.5 × 10${s('−4')}</p><p>0.5 → 5: el coeficiente se hizo <b>más grande</b> → el exponente <b>baja</b> 1</p><p class="mono">= 5 × 10${s('−5')}</p></div>
<div class="ex"><p class="mono">9109.5 × 10${s('−34')}</p><p>9109.5 → 9.1095: 3 saltos, más chico → sube 3</p><p class="mono">= 9.1095 × 10${s('−31')}</p></div>`
        },
        {
          id: 'nc-ops', kind: 'paso', title: 'Multiplicar y dividir',
          html: `<p><b>Multiplicar</b></p><ol><li>Coeficiente × coeficiente.</li><li><b>Suma</b> los exponentes (cuida los signos).</li><li>Acomoda si el coeficiente quedó en 10 o más.</li></ol>
<div class="ex"><p class="mono">(5.6 × 10${s('−3')})(6.1 × 10${s('−4')}) = 34.16 × 10${s('−7')} = 3.416 × 10${s('−6')}</p></div>
<p><b>Dividir</b></p><ol><li><b>Arriba ÷ abajo</b>, en ese orden, aunque arriba sea más chico.</li><li>Exponentes: <b>arriba − abajo</b>. Si hay negativos, primero quita paréntesis.</li><li>Acomoda si el coeficiente quedó menor que 1.</li></ol>
<div class="ex"><p class="mono">${fr('2 × 10' + s('−6'), '4 × 10' + s('−2'))}</p><p>2 ÷ 4 = 0.5 · −6 − (−2) = −6 + 2 = −4</p><p class="mono">0.5 × 10${s('−4')} = 5 × 10${s('−5')}</p></div>
<div class="ex"><p class="mono">${fr('4.8 × 10' + s('−7'), '1.2 × 10' + s(4))}</p><p>4.8 ÷ 1.2 = 4 · −7 − 4 = −11 → <b>4 × 10${s('−11')}</b></p></div>`
        },
        {
          id: 'nc-suma', kind: 'paso', title: 'Sumar y restar: dos caminos',
          html: `<p>Solo puedes sumar coeficientes si las potencias de 10 son <b>iguales</b>.</p>
<p><b>Camino A — pásalos a número normal</b> (cómodo cuando los exponentes son pequeños):</p>
<div class="ex"><p class="mono">7 × 10${s(3)} + 4 × 10${s(2)} = 7000 + 400 = 7400 = 7.4 × 10${s(3)}</p></div>
<p><b>Camino B — iguala al exponente mayor:</b> el número con exponente chico se convierte. Su exponente <b>sube</b>, así que su coeficiente se hace <b>más chico</b> (el punto va a la izquierda).</p>
<div class="ex"><p class="mono">5.3 × 10${s(5)} + 3.2 × 10${s(2)}</p><p>De 2 a 5 son 3 lugares: 3.2 → 0.0032</p><p class="mono">5.3 + 0.0032 = 5.3032 → 5.3032 × 10${s(5)}</p></div>
<p>Usa el camino que te dé más confianza. Los dos dan lo mismo.</p>`
        }
      ],
      videos: [
        { title: 'Notación científica II (SEP)', ch: 'Nueva Escuela Mexicana', url: 'https://nuevaescuelamexicana.sep.gob.mx/contenido/coleccion/notacion-cientifica-ii/', v: 1 },
        { title: 'Leyes de los exponentes y notación científica (SEP)', ch: 'Aprende en casa', url: 'https://www.youtube.com/watch?v=bXMhMhL1Mkg', v: 1 },
        { title: 'Notación científica', ch: 'Daniel Carreón', url: yt('Daniel Carreón notación científica') },
        { title: 'Notación científica', ch: 'Matemáticas profe Alex', url: yt('Matemáticas profe Alex notación científica') },
        { title: 'Operaciones con notación científica', ch: 'Matemáticas profe Alex', url: yt('Matemáticas profe Alex multiplicación y división notación científica') },
        { title: 'Suma y resta en notación científica', ch: 'Julioprofe', url: yt('Julioprofe suma y resta notación científica') },
        { title: 'Notación científica', ch: 'Khan Academy Español', url: ka('notación científica') },
        { title: 'Notación científica', ch: 'Math2me', url: yt('math2me notación científica') }
      ]
    }
  ];

  const PLAN = [
    { day: 'Sábado', items: [{ t: 'Diagnóstico corto', href: '#/diagnostico', key: 'diag' }, { t: 'Regla de los signos: explicaciones', href: '#/tema/signos', key: 'lens:signos' }, { t: 'Practicar signos', href: '#/practica/signos', key: 'prac:signos' }] },
    { day: 'Domingo', items: [{ t: 'Qué es un exponente (repaso)', href: '#/tema/exponente', key: 'lens:exponente' }, { t: 'Leyes de los exponentes', href: '#/tema/exponentes', key: 'lens:exponentes' }, { t: 'Practicar exponentes', href: '#/practica/exponentes', key: 'prac:exponentes' }] },
    { day: 'Lunes', items: [{ t: 'Notación científica', href: '#/tema/nc', key: 'lens:nc' }, { t: 'Practicar notación científica', href: '#/practica/nc', key: 'prac:nc' }, { t: 'Simulacro de examen', href: '#/simulacro', key: 'sim' }] }
  ];

  global.Brujula.subject('mat', {
    name: 'Matemáticas', short: 'Mate', grade: '2.º de secundaria',
    summary: 'Regla de los signos, leyes de los exponentes y notación científica.',
    exam: { date: '2026-11-03', label: 'Examen de Matemáticas' },
    examTopics: ['signos', 'exponentes', 'nc'],
    plan: PLAN
  });
  global.Brujula.addTopics('mat', TOPICS);
})(window);
