/* Brújula · Física — temas, explicaciones, videos y plan */
(function (global) {
  'use strict';
  const fr = (n, d) => '<span class="ifrac"><span>' + n + '</span><span>' + d + '</span></span>';
  const yv = (id) => 'https://www.youtube.com/watch?v=' + id;
  const yt = (q) => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);
  const ka = (q) => 'https://es.khanacademy.org/search?page_search_query=' + encodeURIComponent(q);
  const V = (st, title, id, ch) => ({ st, title, ch: ch || 'YouTube', url: yv(id), v: 1 });
  const S = (st, title, ch, url) => ({ st, title, ch, url });
  const tri = (hl) => `<svg class="tri" viewBox="0 0 160 120" role="img" aria-label="triángulo d v t"><path d="M80 8 L152 112 L8 112 Z" class="tri-b"/><line x1="36" y1="72" x2="124" y2="72" class="tri-b"/><line x1="80" y1="72" x2="80" y2="112" class="tri-b"/><text x="80" y="58" class="tri-t ${hl === 'd' ? 'hl' : ''}">d</text><text x="56" y="102" class="tri-t ${hl === 'v' ? 'hl' : ''}">v</text><text x="104" y="102" class="tri-t ${hl === 't' ? 'hl' : ''}">t</text></svg>`;

  const TOPICS = [
    /* ================= BASES ================= */
    {
      id: 'f_regla3', kind: 'fund', title: 'Regla de tres y equivalencias',
      summary: 'Convertir de una unidad a otra sin dudar si se multiplica o se divide. Incluye horas y minutos.',
      prereq: [], subs: ['f_r3', 'f_hmin'], lab: [],
      lenses: [
        {
          id: 'r3-sentido', kind: 'paso', title: '¿Más grande o más chico?',
          html: `<p>Antes de hacer cualquier cuenta, contesta una sola pregunta: <b>¿el número debe quedar más grande o más chico?</b></p>
<ul><li>Si pasas a una unidad <b>más chica</b> (km → m, h → min), caben <b>más</b> → el número <b>crece</b> → <b>multiplicas</b>.</li>
<li>Si pasas a una unidad <b>más grande</b> (m → km, min → h), caben <b>menos</b> → el número <b>se achica</b> → <b>divides</b>.</li></ul>
<div class="ex"><p>14.6 km → m: el metro es más chico → crece → 14.6 × 1000 = <b>14,600 m</b></p><p>3096 mi → km: el km es más chico que la milla → crece → 3096 × 1.609 = <b>4,981.46 km</b></p><p>7200 min → h: la hora es más grande → se achica → 7200 ÷ 60 = <b>120 h</b></p></div>
<p>Si al final tu resultado va en la dirección contraria, revisa: probablemente multiplicaste en vez de dividir.</p>`
        },
        {
          id: 'r3-cruz', kind: 'visual', title: 'La cruz de la regla de tres',
          html: `<p>Acomoda la equivalencia arriba y tu dato abajo, <b>cada unidad en su columna</b>:</p>
<div class="r3 big"><span>1 mi</span><span>—</span><span>1609.34 m</span><span>11.5 mi</span><span>—</span><span class="x">x</span></div>
<p>Multiplica en <b>diagonal</b> los dos números que se conocen y divide entre el que queda:</p>
<p class="mono">x = ${fr('(11.5)(1609.34)', '1')} = 18,507.41 m</p>
<p>La regla de oro: <b>la misma unidad, en la misma columna</b>. Si las mezclas, la cruz da el resultado al revés.</p>`
        },
        {
          id: 'r3-historia', kind: 'historia', title: 'Cambiar dólares a pesos',
          html: `<p>Vives en Mexicali y vas a comprar algo del otro lado. Si <b>1 dólar = 18 pesos</b>:</p>
<ul><li><b>25 dólares a pesos:</b> cada dólar vale muchos pesos → tendrás <b>más</b> pesos → 25 × 18 = <b>450 pesos</b>.</li>
<li><b>540 pesos a dólares:</b> necesitas 18 pesos para cada dólar → tendrás <b>menos</b> dólares → 540 ÷ 18 = <b>30 dólares</b>.</li></ul>
<p>Con las unidades pasa igual: 1 km “vale” 1000 m. Pasar km a m es como pasar dólares a pesos (multiplicar); pasar m a km es como pasar pesos a dólares (dividir).</p>`
        },
        {
          id: 'r3-tabla', kind: 'patron', title: 'La tabla de equivalencias',
          html: `<p>Estas son las que usa tu clase. Observa el patrón: <b>1 de la grande = muchas de la chica</b>.</p>
<table class="tbl"><tr><th>Grande</th><th>Chica</th></tr>
<tr><td>1 km</td><td>1000 m</td></tr><tr><td>1 m</td><td>100 cm = 1000 mm</td></tr><tr><td>1 mi</td><td>1609.34 m = 1.609 km</td></tr>
<tr><td>1 m</td><td>3.281 ft (pies)</td></tr><tr><td>1 m</td><td>1.093 yd (yardas)</td></tr>
<tr><td>1 h</td><td>60 min = 3600 s</td></tr><tr><td>1 min</td><td>60 s</td></tr><tr><td>1 kg</td><td>1000 g</td></tr><tr><td>1 lb</td><td>0.454 kg</td></tr></table>
<p>Y si conoces una, conoces muchas: 1 km = 1000 m → 2 km = 2000 m → 0.5 km = 500 m.</p>
<p class="small muted">Ojo con estas dos que se parecen: pies (3.281 por metro) y yardas (1.093 por metro).</p>`
        },
        {
          id: 'r3-tiempo', kind: 'paso', title: 'Horas y minutos no son decimales',
          html: `<p>El reloj no cuenta de 100 en 100: <b>una hora tiene 60 minutos</b>.</p>
<div class="ex"><p class="mono">2 h 26 min ≠ 2.26 h</p><p class="mono">2 h 26 min ≠ 0.43 h (se olvidaron las 2 horas)</p><p class="mono">2 h 26 min = 2 + ${fr('26', '60')} = 2 + 0.43 = <b>2.43 h</b></p></div>
<p><b>Pasos:</b> 1) los minutos entre 60; 2) súmalos a las horas.</p>
<p>Al revés: 0.75 h × 60 = 45 min. Y 3.6 min no son “3 min 6 s”: son 3 min + 0.6 × 60 = 3 min 36 s.</p>`
        }
      ],
      videos: [
        V('Regla de tres', 'Regla de tres y conversión de unidades', '2Tn0eONbhLc'),
        V('Longitud', 'Conversión de unidades de longitud', 'Dkc2h0br7So'),
        V('Millas y metros', 'Millas a metros', 'ftVsoRBS5Ow'),
        V('Millas y metros', 'Metros a millas', 'i7Ohkz8hy7Q'),
        S('Más canales', 'Conversión de unidades', 'Julioprofe', yt('Julioprofe conversión de unidades regla de tres')),
        S('Más canales', 'Conversión de unidades de tiempo', 'Daniel Carreón', yt('Daniel Carreón conversión de horas a minutos'))
      ]
    },
    {
      id: 'f_despeje', kind: 'fund', title: 'Despejar fórmulas',
      summary: 'Pasar de v = d/t a t = d/v, y de la fórmula de aceleración a vf, vi o t.',
      prereq: [], subs: ['f_desp_vdt', 'f_desp_acel'], lab: ['f_tri'],
      lenses: [
        {
          id: 'desp-triangulo', kind: 'visual', title: 'El triángulo d · v · t',
          html: `<div class="two"><div>${tri()}</div><div><p><b>d</b> arriba; <b>v</b> y <b>t</b> abajo.</p><p>Tapa con el dedo lo que buscas y lee lo que queda:</p>
<ul><li>Tapas <b>d</b>: quedan v y t lado a lado → <b>d = v · t</b></li><li>Tapas <b>t</b>: queda d sobre v → <b>t = ${fr('d', 'v')}</b></li><li>Tapas <b>v</b>: queda d sobre t → <b>v = ${fr('d', 't')}</b></li></ul></div></div>
<p>Error frecuente: <span class="mono">t = v · d</span>. El tiempo nunca es “velocidad por distancia”: con más velocidad, tardas <b>menos</b>, así que la velocidad va <b>abajo</b>.</p>
<p><a href="#/lab/f_tri" class="btn ghost sm">Probar el triángulo</a></p>`
        },
        {
          id: 'desp-balanza', kind: 'historia', title: 'El sube y baja',
          html: `<p>Una fórmula es como un sube y baja en equilibrio: lo que está de un lado <b>pesa igual</b> que lo del otro.</p>
<p>Si quitas algo de un lado, para que no se caiga tienes que hacer <b>lo contrario</b> del otro lado:</p>
<ul><li>lo que <b>divide</b> pasa <b>multiplicando</b>;</li><li>lo que <b>multiplica</b> pasa <b>dividiendo</b>;</li><li>lo que <b>resta</b> pasa <b>sumando</b>, y al revés.</li></ul>
<div class="ex"><p class="mono">v = ${fr('d', 't')}</p><p>La t está dividiendo → pasa multiplicando: <span class="mono">v · t = d</span></p><p>Para dejar t sola, la v que multiplica pasa dividiendo: <span class="mono">t = ${fr('d', 'v')}</span></p></div>`
        },
        {
          id: 'desp-pasos', kind: 'paso', title: 'Despejar la fórmula de aceleración',
          html: `<p>Empieza siempre de <span class="mono">a = ${fr('vf − vi', 't')}</span>. Primer movimiento, siempre el mismo: la <b>t</b> pasa multiplicando.</p>
<p class="mono">a · t = vf − vi</p>
<table class="tbl"><tr><th>Busco</th><th>Movimiento</th><th>Resultado</th></tr>
<tr><td>vf</td><td>vi pasa sumando</td><td class="mono"><b>vf = vi + a·t</b></td></tr>
<tr><td>vi</td><td>vi pasa al otro lado y a·t pasa restando</td><td class="mono"><b>vi = vf − a·t</b></td></tr>
<tr><td>t</td><td>a pasa dividiendo</td><td class="mono"><b>t = ${fr('vf − vi', 'a')}</b></td></tr></table>
<p class="small muted">Si “parte del reposo”, vi = 0 y queda vf = a·t.</p>`
        },
        {
          id: 'desp-patron', kind: 'patron', title: 'Compruébalo con números fáciles',
          html: `<p>¿Dudas de un despeje? Pruébalo con números que tú inventes y que ya sepas que cumplen.</p>
<div class="ex"><p>Si recorres 12 km en 2 h, vas a 6 km/h. Entonces d = 12, t = 2, v = 6.</p>
<p>¿t = d ÷ v? → 12 ÷ 6 = 2 ✔</p><p>¿t = v · d? → 6 × 12 = 72 ✘</p><p>¿d = v ÷ t? → 6 ÷ 2 = 3 ✘</p><p>¿d = v · t? → 6 × 2 = 12 ✔</p></div>
<p>Para aceleración: vi = 2, a = 3, t = 4 → vf = 14. Prueba: ¿vf = a·t − vi? → 12 − 2 = 10 ✘. ¿vf = vi + a·t? → 2 + 12 = 14 ✔</p>`
        }
      ],
      videos: [
        V('Triángulo', 'La fórmula para hallar la distancia, velocidad y tiempo', 'iS6gMT7mcmg'),
        V('d, v y t', 'Despejar la distancia y el tiempo en la fórmula de la velocidad', 'Ztfy6rBuXrA'),
        V('Física', 'Despeje de fórmulas de física', 'n9JVIrlRdlk'),
        V('Aceleración', 'Despeje de fórmulas: velocidad final y tiempo', 'mvtd65ai-90'),
        V('Tiempo', 'Despeje de la variable tiempo', 'IdNZ3xKsxw0')
      ]
    },

    /* ================= TEMAS DEL EXAMEN ================= */
    {
      id: 'f_conv', kind: 'tema', title: 'Factor unitario',
      summary: 'Convertir velocidades (km/h, m/s, mi/h) tachando unidades.',
      prereq: ['f_regla3'], subs: ['f_fu'], lab: ['f_fu'],
      lenses: [
        {
          id: 'fu-cancel', kind: 'visual', title: 'Las unidades se tachan',
          html: `<p>Un factor unitario es una fracción que vale <b>1</b> (arriba y abajo es lo mismo, en distinta unidad). Multiplicar por 1 no cambia la cantidad, solo su unidad.</p>
<p>La regla: <b>lo que quieres quitar va del lado contrario</b>, para que se tache.</p>
<div class="ex"><p class="fu-line">120 ${fr('<s>km</s>', '<s>h</s>')} × (${fr('1000 m', '1 <s>km</s>')}) × (${fr('1 <s>h</s>', '3600 s')}) = ${fr('120,000 m', '3600 s')} = <b>33.33 m/s</b></p></div>
<p>km estaba <b>arriba</b> → en el factor va <b>abajo</b>. h estaba <b>abajo</b> → en el factor va <b>arriba</b>.</p>
<p>Si una unidad no se tacha (por ejemplo te queda km² o h²), la fracción está volteada.</p>
<p><a href="#/lab/f_fu" class="btn ghost sm">Probar en el laboratorio</a></p>`
        },
        {
          id: 'fu-pasos', kind: 'paso', title: 'La receta del factor unitario',
          html: `<ol><li>Escribe la cantidad como fracción: <span class="mono">92 ${fr('m', 's')}</span></li>
<li><b>Distancia:</b> agrega una fracción que tache la unidad de distancia: <span class="mono">(${fr('1 mi', '1609.34 m')})</span></li>
<li><b>Tiempo:</b> agrega otra que tache la unidad de tiempo: <span class="mono">(${fr('3600 s', '1 h')})</span></li>
<li>Multiplica todo lo de arriba y divide entre todo lo de abajo: <span class="mono">${fr('92 × 3600', '1609.34')} = 205.80 mi/h</span></li></ol>
<p>Una velocidad tiene <b>dos</b> unidades (distancia y tiempo). Si solo conviertes una, el resultado queda muy lejos.</p>`
        },
        {
          id: 'fu-historia', kind: 'historia', title: 'Velocidades de la vida real',
          html: `<table class="tbl"><tr><th>¿Qué?</th><th>km/h</th><th>m/s</th></tr>
<tr><td>Caminar</td><td>5</td><td>1.4</td></tr><tr><td>Una jugadora en un sprint</td><td>29</td><td>8</td></tr>
<tr><td>Un balón en un tiro fuerte</td><td>100</td><td>27.8</td></tr><tr><td>Auto en carretera</td><td>110</td><td>30.6</td></tr>
<tr><td>Sonido en el aire</td><td>1,224</td><td>340</td></tr></table>
<p>Fíjate: en m/s los números son <b>más chicos</b> que en km/h (casi 4 veces). Si conviertes km/h → m/s y te sale un número más grande, algo está volteado.</p>`
        },
        {
          id: 'fu-patron', kind: 'patron', title: 'El atajo del 3.6',
          html: `<p>Observa la tabla:</p>
<table class="tbl c"><tr><th>km/h</th><th>m/s</th></tr><tr><td>36</td><td>10</td></tr><tr><td>72</td><td>20</td></tr><tr><td>18</td><td>5</td></tr><tr><td>90</td><td>25</td></tr><tr><td>120</td><td>33.33</td></tr></table>
<p>Siempre es <b>÷ 3.6</b> para ir de km/h a m/s y <b>× 3.6</b> para regresar. ¿Por qué? Porque ${fr('1000', '3600')} = ${fr('1', '3.6')}.</p>
<p>Úsalo para <b>comprobar</b> tu factor unitario, no para saltarte el procedimiento (tu maestra pide los factores).</p>`
        },
        {
          id: 'fu-sentido', kind: 'paso', title: '¿Tiene sentido el resultado?',
          html: `<p>Antes de entregar, haz una prueba rápida de tamaño:</p>
<ul><li>¿Un auto a 270,000,000 km/h? Imposible: es más rápido que la luz. Volteaste un factor.</li>
<li>¿Una ambulancia que recorre 60 km en 5 segundos? Imposible. Revisa la división.</li>
<li>¿Un balón rodando a 250 mi/h? Muy raro. Revisa si el punto decimal se recorrió (11.2 no es 112).</li></ul>
<p><b>Redondea solo al final.</b> Si redondeas 0.0597 a 0.05 y 0.0636 a 0.06 en medio de la cuenta, el resultado final puede salir 20 % mal.</p>`
        }
      ],
      videos: [
        V('km/h y m/s', 'Factor unitario: 54 km/h a m/s y 15 m/s a km/h', 'nOg9ZBIIePI'),
        V('km/h y m/s', 'Factores de conversión km/h ↔ m/s', 'VER_RzfT8i4'),
        V('km/h y m/s', 'Pasar de km por hora a metros por segundo', 'FlBhOr0vL5E'),
        V('km/h y m/s', 'Kilómetros por hora a metros por segundo', 'Djc3V9810ow'),
        S('Más canales', 'Factor unitario', 'Matemáticas profe Alex', yt('Matemáticas profe Alex conversión de unidades factor unitario')),
        S('Más canales', 'Conversión de unidades de velocidad', 'Khan Academy Español', ka('conversión de unidades velocidad'))
      ]
    },
    {
      id: 'f_vel', kind: 'tema', title: 'Velocidad, distancia y tiempo',
      summary: 'Movimiento uniforme (MRU): calcular v, d o t con conversiones.',
      prereq: ['f_despeje', 'f_conv'], subs: ['f_v', 'f_d', 'f_t'], lab: ['f_tri', 'f_pista'],
      lenses: [
        {
          id: 'vel-pasos', kind: 'paso', title: 'Datos, conversiones, fórmula, sustitución',
          html: `<p>El orden que pide tu maestra, con un paso que evita la mitad de los errores: <b>convertir antes de sustituir</b>.</p>
<ol><li><b>Datos:</b> escribe d, v y t con su unidad. Marca cuál buscas y <b>en qué unidad lo piden</b>.</li>
<li><b>Conversiones:</b> haz que todo combine: si v está en m/s → d en m y t en s. Si v está en km/h → d en km y t en h.</li>
<li><b>Fórmula:</b> d = v · t, t = d ÷ v o v = d ÷ t.</li><li><b>Sustitución</b> y <b>resultado</b>.</li>
<li><b>Conversión final:</b> si te piden minutos y te salió en segundos, conviértelo.</li></ol>
<div class="ex"><p>Disparo a 2.05 km; el sonido va a 330 m/s. ¿Cuánto tarda (min)?</p><p>2.05 km = 2050 m · t = 2050 ÷ 330 = 6.21 s · 6.21 ÷ 60 = <b>0.10 min</b></p></div>`
        },
        {
          id: 'vel-historia', kind: 'historia', title: 'El autobús de la gira',
          html: `<p>Una banda sale de gira en autobús a <b>90 km/h</b>.</p>
<ul><li>Si viaja <b>3 h</b>, recorre 90 × 3 = <b>270 km</b> (cada hora suma 90 km).</li>
<li>Si la siguiente ciudad está a <b>450 km</b>, tarda 450 ÷ 90 = <b>5 h</b> (¿cuántos “bloques” de 90 caben?).</li>
<li>Si otro autobús hizo 300 km en 4 h, iba a 300 ÷ 4 = <b>75 km/h</b>.</li></ul>
<p>Piensa en la velocidad como “cuántos km cada hora”. Así se ve por qué el tiempo es distancia ÷ velocidad y no velocidad × distancia.</p>`
        },
        {
          id: 'vel-visual', kind: 'visual', title: 'Pasos iguales en la pista',
          html: `<p>En el movimiento uniforme el móvil avanza <b>la misma distancia cada segundo</b>. En la pista se ven puntos igual de separados:</p>
<div class="dots-strip">${[0, 1, 2, 3, 4, 5].map((i) => `<span style="left:${i * 18}%"><i></i><em>${i} s</em></span>`).join('')}</div>
<p>Si va a 5 m/s: 0, 5, 10, 15, 20, 25 m. Distancia = 5 × tiempo. Eso es <b>d = v · t</b>.</p>
<p><a href="#/lab/f_pista" class="btn ghost sm">Ver en la pista</a></p>`
        },
        {
          id: 'vel-patron', kind: 'patron', title: 'Doble tiempo, doble distancia',
          html: `<p>Con la misma velocidad (60 km/h):</p>
<table class="tbl c"><tr><th>Tiempo</th><th>Distancia</th></tr><tr><td>0.5 h</td><td>30 km</td></tr><tr><td>1 h</td><td>60 km</td></tr><tr><td>2 h</td><td>120 km</td></tr><tr><td>3 h</td><td>180 km</td></tr></table>
<p>Si el tiempo se duplica, la distancia se duplica: <b>se multiplican</b>. Y para una distancia fija, si vas al doble de velocidad tardas la <b>mitad</b>: tiempo y velocidad van al revés, por eso v va <b>dividiendo</b> en t = d ÷ v.</p>`
        },
        {
          id: 'vel-sonido', kind: 'historia', title: 'El relámpago y el trueno',
          html: `<p>La luz del relámpago llega casi al instante, pero el sonido viaja a unos <b>340 m/s</b>. Cuenta los segundos entre el relámpago y el trueno:</p>
<p class="mono">d = v · t = 340 × 6 = 2,040 m ≈ 2 km</p>
<p>Truco: cada <b>3 segundos ≈ 1 km</b>. En sólidos el sonido es más rápido (acero ≈ 5,200 m/s), así que tarda menos.</p>`
        }
      ],
      videos: [
        V('MRU', 'Movimiento rectilíneo uniforme (MRU)', 'QjYdiIq2weQ'),
        V('MRU', 'Cálculo de velocidad, distancia y tiempo', 'iXMLxD467qI'),
        V('MRU', 'Ejercicios resueltos de distancia y velocidad', 'Wmic7SU3ig0'),
        V('MRU', 'Ejercicios resueltos y propuestos de MRU', 'n2iQrTioQRo'),
        S('Más canales', 'Movimiento rectilíneo uniforme', 'Matemáticas profe Alex', yt('Matemáticas profe Alex movimiento rectilíneo uniforme')),
        S('Más canales', 'Velocidad y rapidez', 'Khan Academy Español', ka('rapidez y velocidad'))
      ]
    },
    {
      id: 'f_acel', kind: 'tema', title: 'Aceleración',
      summary: 'Movimiento uniformemente acelerado (MRUA): a, vf, vi y t.',
      prereq: ['f_despeje', 'f_conv'], subs: ['f_a', 'f_vf', 'f_vi', 'f_ta'], lab: ['f_pista'],
      lenses: [
        {
          id: 'ac-pasos', kind: 'paso', title: 'Primero identifica cada dato',
          html: `<p>La mitad del problema es saber <b>qué es cada número</b>. Fíjate en la unidad:</p>
<table class="tbl"><tr><th>Si dice…</th><th>Es…</th></tr>
<tr><td>m/s², “aceleración de…”</td><td><b>a</b></td></tr><tr><td>m/s, km/h, mi/h al inicio</td><td><b>vi</b></td></tr>
<tr><td>“alcanza”, “llega a”, “al final”</td><td><b>vf</b></td></tr><tr><td>“parte del reposo”, “arranca”</td><td><b>vi = 0</b></td></tr>
<tr><td>“se detiene”</td><td><b>vf = 0</b></td></tr><tr><td>“frena”, “reduce su velocidad”</td><td><b>a es negativa</b></td></tr></table>
<p>Después: tiempo en <b>segundos</b> y velocidades en <b>m/s</b>, <i>antes</i> de sustituir. Si te dan 2.8 min, son 168 s.</p>
<p>Y siempre <b>final menos inicial</b>: a = (vf − vi) ÷ t.</p>`
        },
        {
          id: 'ac-historia', kind: 'historia', title: 'El velocímetro que sube',
          html: `<p>Una moto arranca y su velocímetro marca: 0, 3, 6, 9, 12 m/s cada segundo. Cada segundo gana <b>3 m/s</b>: esa es su aceleración, <b>3 m/s²</b> (“metros por segundo, cada segundo”).</p>
<p>Ahora un camión va a 30 m/s y frena: 30, 26, 22, 18… pierde 4 m/s cada segundo. Su aceleración es <b>−4 m/s²</b>.</p>
<p class="mono">vf = 30 + (−4)(3) = 30 − 12 = 18 m/s</p>
<p>Frenar no es “acelerar al revés con signo más”: el signo menos hace que la velocidad <b>baje</b>.</p>`
        },
        {
          id: 'ac-visual', kind: 'visual', title: 'Puntos cada vez más separados',
          html: `<p>Con aceleración, cada segundo avanza <b>más</b> que el anterior. En la pista los puntos se separan:</p>
<div class="dots-strip">${[0, 1, 4, 9, 16, 25].map((p, i) => `<span style="left:${p * 3.6}%"><i></i><em>${i} s</em></span>`).join('')}</div>
<p>Compáralo con el movimiento uniforme, donde los puntos están igual de separados.</p>
<p><a href="#/lab/f_pista" class="btn ghost sm">Comparar en la pista</a></p>`
        },
        {
          id: 'ac-patron', kind: 'patron', title: 'Tabla segundo a segundo',
          html: `<p>Una bicicleta va a 4 m/s y acelera 2 m/s²:</p>
<table class="tbl c"><tr><th>t (s)</th><th>v (m/s)</th></tr><tr><td>0</td><td>4</td></tr><tr><td>1</td><td>6</td></tr><tr><td>2</td><td>8</td></tr><tr><td>3</td><td>10</td></tr><tr><td>5</td><td>?</td></tr></table>
<details class="sol"><summary>Ver el patrón</summary><p>A los 5 s: 4 + 2 × 5 = <b>14 m/s</b>. La regla es <b>vf = vi + a·t</b>: empiezas en vi y sumas “a” cada segundo.</p><p>Si olvidas la vi (4), te sale 10: por eso la aceleración usa el <b>cambio</b> de velocidad, vf − vi.</p></details>`
        }
      ],
      videos: [
        V('Velocidad final', 'Velocidad final y aceleración (MRUA)', 'YofD2Lnigyg'),
        V('Aceleración', 'Ejercicio de aceleración (MRUA), ejemplo 1', 'q0nzGR9DUzQ'),
        V('Velocidad final', 'Ejercicios resueltos de velocidad final', 'T9NJ8LrBmQ4'),
        V('Tiempo', 'Aceleración y tiempo (MRUA)', '1x2VHy-pxSk'),
        V('MRUA', 'Movimiento rectilíneo uniformemente acelerado', 'Kz7_3wp5Wmc'),
        S('Más canales', 'Aceleración', 'Khan Academy Español', ka('aceleración'))
      ]
    },

    /* ================= TAMBIÉN EN SU LIBRO ================= */
    {
      id: 'f_ondas', kind: 'extra', title: 'Ondas y sonido',
      summary: 'Tipos de ondas, sus partes, frecuencia y periodo, velocidad del sonido.',
      prereq: [], subs: ['f_ond_conc', 'f_ond_tf', 'f_ond_snd'], lab: [],
      lenses: [
        {
          id: 'on-partes', kind: 'visual', title: 'Las partes de una onda',
          html: `<svg class="wave" viewBox="0 0 320 140" role="img" aria-label="partes de una onda"><line x1="0" y1="70" x2="320" y2="70" class="w-eq"/><path d="M0 70 C20 10 60 10 80 70 S140 130 160 70 S220 10 240 70 S300 130 320 70" class="w-ln"/>
<text x="40" y="12" class="w-t">cresta</text><text x="110" y="134" class="w-t">valle</text><circle cx="80" cy="70" r="4" class="w-pt"/><text x="84" y="86" class="w-t">nodo</text>
<line x1="40" y1="22" x2="200" y2="22" class="w-ar"/><text x="102" y="34" class="w-t">λ</text><line x1="262" y1="70" x2="262" y2="22" class="w-ar"/><text x="266" y="50" class="w-t">amplitud</text></svg>
<ul><li><b>Cresta</b>: la parte más alta. <b>Valle</b>: la más baja.</li><li><b>Nodo</b>: donde toca la línea de equilibrio.</li><li><b>Longitud de onda (λ)</b>: distancia entre dos crestas seguidas.</li><li><b>Amplitud</b>: qué tanto se aleja de la línea de equilibrio.</li></ul>`
        },
        {
          id: 'on-tipos', kind: 'paso', title: 'Dos formas de clasificarlas',
          html: `<table class="tbl"><tr><th>Por el medio</th><th></th></tr><tr><td><b>Mecánicas</b></td><td>Necesitan un medio (aire, agua, metal). Ej.: sonido, olas del mar.</td></tr>
<tr><td><b>Electromagnéticas</b></td><td>Viajan hasta en el vacío. Ej.: luz del Sol, radio, señal del celular.</td></tr>
<tr><th>Por su forma</th><th></th></tr><tr><td><b>Transversales</b></td><td>Vibran perpendicular a hacia donde avanzan (cuerda arriba y abajo).</td></tr>
<tr><td><b>Longitudinales</b></td><td>Vibran en la misma dirección en que avanzan (resorte que se comprime).</td></tr></table>
<p>El sonido es <b>mecánica</b> y <b>longitudinal</b>: por eso no viaja en el vacío del espacio.</p>`
        },
        {
          id: 'on-ft', kind: 'patron', title: 'Frecuencia y periodo son inversos',
          html: `<table class="tbl c"><tr><th>Frecuencia f</th><th>Periodo T</th></tr><tr><td>1 Hz</td><td>1 s</td></tr><tr><td>2 Hz</td><td>0.5 s</td></tr><tr><td>4 Hz</td><td>0.25 s</td></tr><tr><td>10 Hz</td><td>0.1 s</td></tr></table>
<p>Si vibra más veces por segundo, cada vibración dura menos: <b>T = ${fr('1', 'f')}</b> y <b>f = ${fr('1', 'T')}</b>.</p>
<p>Frecuencia alta → sonido <b>agudo</b>. Frecuencia baja → sonido <b>grave</b>. El oído humano escucha de 20 a 20,000 Hz.</p>`
        },
        {
          id: 'on-historia', kind: 'historia', title: 'Las botellas con agua',
          html: `<p>En el experimento del libro, golpeas botellas con distinta cantidad de agua. Cada una vibra a una frecuencia distinta y suena a una nota distinta (Do 261.63 Hz, La 440 Hz…).</p>
<p>En un concierto, el sonido viaja por el aire a unos 340 m/s. Si estás a 170 m del escenario, lo escuchas 0.5 s después de que la cantante canta: t = 170 ÷ 340.</p>
<p>Y si pones el oído en un riel de acero, el sonido llega mucho antes: en sólidos viaja más rápido.</p>`
        }
      ],
      videos: [
        V('Frecuencia y periodo', 'Relación entre periodo y frecuencia', 'jqAxGLNxQsw'),
        V('Frecuencia y periodo', 'Frecuencia, periodo y velocidad de una onda', '-9cZQjoQXIM'),
        V('Tipos de onda', '¿Qué es una onda? Longitudinal y transversal, periodo y frecuencia', '9lWpXF5N-Vk'),
        V('Elementos', 'Elementos de una onda: amplitud, periodo, frecuencia', 'okSglkoeE00')
      ]
    }
  ];

  const PLAN = [
    { day: 'Martes (tarde)', items: [{ t: 'Diagnóstico corto de física', href: '#/diagnostico', key: 'diag' }, { t: 'Factor unitario: explicaciones', href: '#/tema/f_conv', key: 'lens:f_conv' }, { t: 'Practicar factor unitario', href: '#/practica/f_conv', key: 'prac:f_conv' }] },
    { day: 'Miércoles', items: [{ t: 'Despejar fórmulas', href: '#/tema/f_despeje', key: 'lens:f_despeje' }, { t: 'Practicar velocidad', href: '#/practica/f_vel', key: 'prac:f_vel' }, { t: 'Aceleración: explicaciones', href: '#/tema/f_acel', key: 'lens:f_acel' }, { t: 'Practicar aceleración', href: '#/practica/f_acel', key: 'prac:f_acel' }, { t: 'Simulacro de examen', href: '#/simulacro', key: 'sim' }] }
  ];

  Object.assign(Content.LENS_SUBS, {
    'r3-sentido': ['f_r3'], 'r3-cruz': ['f_r3'], 'r3-historia': ['f_r3'], 'r3-tabla': ['f_r3'], 'r3-tiempo': ['f_hmin'],
    'desp-triangulo': ['f_desp_vdt'], 'desp-balanza': ['f_desp_vdt', 'f_desp_acel'], 'desp-pasos': ['f_desp_acel'], 'desp-patron': ['f_desp_vdt', 'f_desp_acel'],
    'fu-cancel': ['f_fu'], 'fu-pasos': ['f_fu'], 'fu-historia': ['f_fu'], 'fu-patron': ['f_fu'], 'fu-sentido': ['f_fu', 'f_t'],
    'vel-pasos': ['f_t', 'f_v', 'f_d'], 'vel-historia': ['f_t', 'f_v', 'f_d'], 'vel-visual': ['f_d'], 'vel-patron': ['f_t', 'f_d'], 'vel-sonido': ['f_ond_snd'],
    'ac-pasos': ['f_a', 'f_vf', 'f_ta'], 'ac-historia': ['f_vf'], 'ac-visual': ['f_vf', 'f_a'], 'ac-patron': ['f_vf', 'f_a'],
    'on-partes': ['f_ond_conc'], 'on-tipos': ['f_ond_conc'], 'on-ft': ['f_ond_tf'], 'on-historia': ['f_ond_snd', 'f_ond_tf']
  });
  Object.assign(Content.ERR_RECS, {
    F_DIR: 'Regla de tres: antes de calcular, que decida en voz alta si el resultado debe crecer o achicarse; escribirlo con una flecha ↑ o ↓.',
    F_EQ: 'Tener a la vista una tarjeta con las equivalencias que usa la maestra (pies y yardas por separado).',
    F_MAG: 'Pedir siempre una estimación del tamaño del resultado antes de usar la calculadora; revisar el punto decimal al copiar del cuaderno a la calculadora.',
    F_ROUND: 'Conservar 3 o 4 decimales en cuentas intermedias y redondear solo el resultado final.',
    F_HMIN: 'Practicar aparte el paso de “h y min” a horas decimales (minutos ÷ 60 y sumar).',
    F_FU_INV: 'Factor unitario: tachar visiblemente las unidades en cada paso; si una no se tacha, el factor está volteado.',
    F_FU_HALF: 'Recordar que una velocidad tiene dos unidades; usar una plantilla con dos factores (distancia y tiempo).',
    F_DESP: 'Usar el triángulo d·v·t y comprobar cada despeje con números inventados fáciles.',
    F_DESP_A: 'Despejes de aceleración: practicar el primer movimiento (t pasa multiplicando) y luego cada variable.',
    F_UNITS: 'Agregar un paso explícito “unidades que combinan” antes de sustituir (m/s con m y s).',
    F_OUT: 'Subrayar en el enunciado la unidad que piden para el resultado y revisarla al final.',
    F_SWAP: 'Escribir siempre “final − inicial” y verificar el signo: acelera → positivo, frena → negativo.',
    F_DV: 'Identificar si el móvil parte del reposo; si no, la vi entra en la cuenta.',
    F_SIGN: 'En problemas de frenado, escribir la aceleración con su signo negativo desde los datos.',
    F_DATA: 'Leer la unidad de cada número para clasificarlo (m/s² = a; m/s = velocidad) antes de escribir los datos.',
    F_TF: 'Relacionar frecuencia y periodo con una tabla (1 Hz → 1 s, 2 Hz → 0.5 s).'
  });

  global.Brujula.subject('fis', {
    name: 'Física', short: 'Física', grade: '2.º de secundaria',
    summary: 'Factor unitario, velocidad, distancia, tiempo y aceleración.',
    exam: { date: '2026-11-05', label: 'Examen de Física' },
    examTopics: ['f_conv', 'f_vel', 'f_acel'],
    plan: PLAN
  });
  global.Brujula.addTopics('fis', TOPICS);
})(window);
