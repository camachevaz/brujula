/* Brújula — fase 2: explicaciones adicionales, videos por subtema y ejercicios de cada explicación */
(function () {
  'use strict';
  const s = (e) => '<sup>' + e + '</sup>';
  const fr = (n, d) => '<span class="ifrac"><span>' + n + '</span><span>' + d + '</span></span>';
  const yv = (id) => 'https://www.youtube.com/watch?v=' + id;
  const T = (id) => Content.byId(id);

  /* ---------- Explicaciones nuevas: cada tema queda con los cuatro enfoques ---------- */
  const NEW = {
    enteros: [
      {
        id: 'enteros-opuesto', kind: 'paso', title: 'Restar es sumar el contrario',
        html: `<p>Toda resta se puede convertir en suma con un solo cambio:</p>
<p class="mono" style="font-size:1.15em">a − b = a + (contrario de b)</p>
<p>El contrario de 8 es −8. El contrario de −8 es 8.</p>
<table class="tbl"><tr><th>Resta</th><th>Se convierte en</th><th>Resultado</th></tr>
<tr><td class="mono">7 − 3</td><td class="mono">7 + (−3)</td><td>4</td></tr>
<tr><td class="mono">7 − (−3)</td><td class="mono">7 + 3</td><td>10</td></tr>
<tr><td class="mono">−7 − 3</td><td class="mono">−7 + (−3)</td><td>−10</td></tr>
<tr><td class="mono">−7 − (−3)</td><td class="mono">−7 + 3</td><td>−4</td></tr></table>
<p><b>Dos cambios a la vez:</b> el menos se vuelve más, y el número de adentro cambia de signo.</p>`
      },
      {
        id: 'enteros-patron', kind: 'patron', title: '¿Qué pasa si sigo restando?',
        html: `<p>Mira la columna de resultados. ¿Qué pasa cada vez que el número que restas baja 1?</p>
<table class="tbl c"><tr><td class="mono">5 − 3</td><td>2</td></tr><tr><td class="mono">5 − 2</td><td>3</td></tr><tr><td class="mono">5 − 1</td><td>4</td></tr><tr><td class="mono">5 − 0</td><td>5</td></tr>
<tr><td class="mono">5 − (−1)</td><td><b>?</b></td></tr><tr><td class="mono">5 − (−2)</td><td><b>?</b></td></tr></table>
<details class="sol"><summary>Ver el patrón</summary><p>Cada vez que restas uno menos, el resultado <b>sube 1</b>. Siguiendo el patrón: 5 − (−1) = <b>6</b> y 5 − (−2) = <b>7</b>.</p><p>Restar un negativo hace que el resultado <b>suba</b>. Por eso −(−2) es lo mismo que +2.</p></details>`
      }
    ],
    posicional: [
      {
        id: 'pos-historia', kind: 'historia', title: 'Kilómetros, metros y milímetros',
        html: `<p>Una carrera de 3.45 km. ¿Cuántos metros son? Un kilómetro tiene 1000 metros, así que multiplicas por 1000:</p>
<p class="mono">3.45 × 1000 = 3450 m</p>
<p>No hiciste la multiplicación completa: solo moviste el punto 3 lugares, porque 1000 tiene 3 ceros.</p>
<div class="ex"><p>Una cancha mide 105 m. ¿En kilómetros? Ahora divides entre 1000:</p><p class="mono">105 ÷ 1000 = 0.105 km</p></div>
<p>Pregunta de control: ¿el número debe quedar <b>más grande</b> (unidades más chiquitas) o <b>más chico</b> (unidades más grandes)? Eso te dice hacia dónde va el punto.</p>`
      }
    ],
    exponente: [
      {
        id: 'exp-patron1', kind: 'patron', title: 'La tabla que se duplica',
        html: `<p>Observa cómo crece cada renglón:</p>
<table class="tbl c"><tr><td>2${s(5)}</td><td>2·2·2·2·2</td><td>32</td></tr><tr><td>2${s(4)}</td><td>2·2·2·2</td><td>16</td></tr><tr><td>2${s(3)}</td><td>2·2·2</td><td>8</td></tr><tr><td>2${s(2)}</td><td>2·2</td><td>4</td></tr><tr><td>2${s(1)}</td><td>2</td><td><b>2</b></td></tr></table>
<p>El exponente cuenta cuántos 2 hay. Con <b>un solo</b> 2, el exponente es <b>1</b>. Por eso una letra sola, como k, es k${s(1)}.</p>
<p>Ahora con base negativa entre paréntesis:</p>
<table class="tbl c"><tr><td>(−2)${s(1)}</td><td>−2</td></tr><tr><td>(−2)${s(2)}</td><td>+4</td></tr><tr><td>(−2)${s(3)}</td><td>−8</td></tr><tr><td>(−2)${s(4)}</td><td>+16</td></tr></table>
<p>El signo <b>se alterna</b>: exponente par → positivo; impar → negativo.</p>`
      }
    ],
    signos: [
      {
        id: 'signos-color', kind: 'visual', title: 'Pinta los signos dobles',
        html: `<p>Antes de calcular, busca cada <b>pareja de signos</b>: el de afuera y el de adentro del paréntesis. Píntala según el resultado:</p>
<div class="ex" style="font-size:1.15em"><p class="mono">(12) <span class="hl-g">− (−8)</span> <span class="hl-o">+ (−6)</span> <span class="hl-o">− (+12)</span></p>
<p class="mono">12 <span class="hl-g">+ 8</span> <span class="hl-o">− 6</span> <span class="hl-o">− 12</span></p></div>
<p><span class="hl-g">verde</span> = signos iguales → <b>+</b> &nbsp;·&nbsp; <span class="hl-o">naranja</span> = signos diferentes → <b>−</b></p>
<p>Después: positivos 12 + 8 = 20 · negativos 6 + 12 = 18 · 20 − 18 = <b>2</b>.</p>
<p>En tu cuaderno puedes usar dos colores o encerrar cada pareja. Lo importante es <b>no saltarte la pareja</b>.</p>`
      }
    ],
    nc: [
      {
        id: 'nc-casilla', kind: 'visual', title: '¿En qué casilla cae la primera cifra?',
        html: `<p>El exponente es el <b>nombre de la casilla</b> donde está la primera cifra que no es cero:</p>
<div class="scroll"><table class="tbl c pos-grid"><tr><th>10${s(3)}</th><th>10${s(2)}</th><th>10${s(1)}</th><th>10${s(0)}</th><th>.</th><th>10${s('−1')}</th><th>10${s('−2')}</th><th>10${s('−3')}</th><th>10${s('−4')}</th></tr>
<tr><td class="first">3</td><td>2</td><td>0</td><td>5</td><td>.</td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td></td><td></td><td>0</td><td>.</td><td>0</td><td>0</td><td>0</td><td class="first">8</td></tr></table></div>
<p>3,205 → el 3 está en la casilla 10${s(3)} → <b>3.205 × 10${s(3)}</b></p>
<p>0.0008 → el 8 está en la casilla 10${s('−4')} → <b>8 × 10${s('−4')}</b></p>
<p>Las casillas a la izquierda del punto son positivas; las de la derecha, negativas. Así el signo sale solo.</p>`
      },
      {
        id: 'nc-patron', kind: 'patron', title: 'El mismo 8.1, distintos tamaños',
        html: `<p>Cambia solo el exponente y mira el resultado:</p>
<table class="tbl c"><tr><td>8.1 × 10${s(3)}</td><td class="mono">8100</td></tr><tr><td>8.1 × 10${s(2)}</td><td class="mono">810</td></tr><tr><td>8.1 × 10${s(1)}</td><td class="mono">81</td></tr><tr><td>8.1 × 10${s(0)}</td><td class="mono">8.1</td></tr><tr><td>8.1 × 10${s('−1')}</td><td class="mono">0.81</td></tr><tr><td>8.1 × 10${s('−2')}</td><td class="mono">0.081</td></tr><tr><td>8.1 × 10${s('−3')}</td><td class="mono">0.0081</td></tr></table>
<p>Cada vez que el exponente baja 1, el punto se recorre <b>un lugar a la izquierda</b>.</p>
<p>¿Ves que 8.1 × 10${s('−4')} tiene <b>3 ceros</b> después del punto (0.00081) pero el exponente es 4? Por eso se cuentan <b>saltos</b>, no ceros.</p>`
      }
    ]
  };
  Object.keys(NEW).forEach((tid) => { const t = T(tid); NEW[tid].forEach((l) => t.lenses.push(l)); });

  /* ---------- Ejercicios con los que se prueba cada explicación ---------- */
  Content.LENS_SUBS = {
    'enteros-var': ['menosneg'], 'enteros-deudas': ['menosneg'], 'enteros-fichas': ['menosneg'], 'enteros-recta': ['menosneg'], 'enteros-opuesto': ['menosneg', 'eparentesis'], 'enteros-patron': ['menosneg'],
    'pos-punto': ['mult10'], 'pos-tabla': ['mult10'], 'pos-escalera': ['mult10'], 'pos-historia': ['mult10'],
    'exp-def': ['signobase', 'expand'], 'exp-uno': ['expand', 'producto'], 'exp-signo': ['signobase'], 'exp-patron1': ['expand', 'signobase'],
    'signos-quitar': ['parentesis'], 'signos-tabla': ['multdiv', 'parentesis'], 'signos-mult': ['multdiv'], 'signos-amigos': ['multdiv'], 'signos-decimales': ['decimales'], 'signos-color': ['parentesis'],
    'exp-tabla': ['producto', 'cociente', 'potpot'], 'exp-expand': ['producto', 'potpot', 'potprod'], 'exp-tachar': ['cociente'], 'exp-patron': ['cero', 'negativo'], 'exp-neg': ['negativo'],
    'nc-contexto': ['a_nc'], 'nc-grande': ['a_nc', 'a_decimal'], 'nc-norm': ['normalizar'], 'nc-ops': ['mult', 'div'], 'nc-suma': ['suma'], 'nc-casilla': ['a_nc', 'a_decimal'], 'nc-patron': ['a_decimal']
  };

  /* ---------- Videos por subtema ---------- */
  const V = (st, title, id, ch) => ({ st, title, ch: ch || 'YouTube', url: yv(id), v: 1 });
  const VIDEOS = {
    enteros: [
      V('Sumar y restar', 'Suma y resta de números positivos y negativos', 'UftkSzUx3ps'),
      V('Con paréntesis', 'Suma y resta de números con signos y paréntesis', 'ADCIrUlhP-w'),
      V('Con paréntesis', 'Sumar y restar números enteros con paréntesis', 'yPC7JImJVv8')
    ],
    posicional: [
      V('Multiplicar', 'Multiplicación de decimales por 10, 100 y 1000', '1zXKKkCfQ04'),
      V('Dividir', 'División de decimales entre 10, 100 y 1000', '8dbtnLGEvXY')
    ],
    exponente: [
      V('Base negativa', 'Potencias con base negativa: ¿cuándo son y cuándo no?', 'jg_vC908v0k'),
      V('Base negativa', 'Potencias de base negativa', 'sncyb2YjZi8')
    ],
    signos: [
      V('Con paréntesis', 'Suma y resta de enteros con paréntesis (parte III)', 'hszRrUUoQz0'),
      V('Con paréntesis', 'Suma y resta de números enteros con paréntesis', '0ZtFeYXX22I'),
      V('Multiplicación y división', 'Regla de los signos en multiplicación y división', 'udGLCVQLdXU'),
      V('Todo junto', 'Regla de signos en suma, resta, multiplicación y división', 'elAuKMsB7mg')
    ],
    exponentes: [
      V('Todas las leyes', 'Todas las leyes de los exponentes (para principiantes)', 'ainnlQ_Owq8'),
      V('Producto', 'Multiplicación de potencias', 'gY-JOziwMsE'),
      V('Cociente', 'Cociente de potencias de igual base', 'rGVCmSQmt0I'),
      V('Potencia de potencia', 'Potencia de una potencia', 'rKDnXEGp1NM'),
      V('Potencia de un producto', 'Potencia de un producto', 'BNlWluHEg78'),
      V('Exponente cero', 'Exponente 0: por qué vale 1', 'ed-3rXKiD5A'),
      V('Exponente negativo', 'Exponente negativo (para principiantes)', 'AOPpWM1Qr2Q')
    ],
    nc: [
      V('Introducción', 'Notación científica: introducción', 'qjX4wKUoK7E', 'Matemáticas profe Alex'),
      V('Números chiquitos', 'De número menor que 1 a notación científica', 'MlJOpzX-PNw'),
      V('Números chiquitos', 'De notación científica a decimal (exponente negativo)', 'chlM2Vwoq8Q'),
      V('Multiplicación', 'Multiplicación en notación científica: ejercicios', '5BirwKGx7H0'),
      V('División', 'División en notación científica', 'pjy1NCAb-xw'),
      V('División', 'División en notación científica (ejemplos)', 'a6mkGZSPIWo'),
      V('Suma y resta', 'Suma y resta con exponentes diferentes', 'wcXNtRoCC6k'),
      V('Suma y resta', 'Suma y resta con exponentes diferentes (otra explicación)', 'pwEC-9otOcI')
    ]
  };
  Object.keys(VIDEOS).forEach((tid) => {
    const t = T(tid);
    const old = t.videos.map((v) => Object.assign({ st: v.v ? 'Otros enfoques' : 'Más canales' }, v));
    t.videos = VIDEOS[tid].concat(old);
  });

  /* ---------- Recomendaciones para el informe ---------- */
  Content.KIND_RECS = {
    historia: 'Presentar cada tema nuevo con una situación concreta (marcador de un partido, dinero, distancias, una receta) antes de dar la regla.',
    visual: 'Apoyarse en representaciones que se puedan ver y mover: recta numérica, fichas, tachar factores arriba y abajo, tabla de posiciones.',
    paso: 'Dar procedimientos numerados y cortos, en una tarjeta que pueda consultar; pedirle que escriba cada paso por separado.',
    patron: 'Mostrar tablas o secuencias para que descubra la regla antes de enunciarla; después formalizar.',
    video: 'Complementar con videos cortos, vistos con pausa y cuaderno, y comentar después qué entendió.'
  };
  Content.ERR_RECS = {
    ABS_SUM: 'Signos con paréntesis: exigir un renglón intermedio “sin paréntesis” antes de agrupar; marcar cada pareja de signos con color.',
    MINUS_NEG: 'Menos de un negativo: practicar aparte −(−n) con contextos de “quitar algo malo” (gol anulado, deuda perdonada).',
    OP_IGNORED: 'Cuidar que lea el signo de afuera del paréntesis: encerrar en un círculo cada operador antes de resolver.',
    SIGN_FLIP: 'Antes de escribir el resultado, preguntar en voz alta qué grupo pesa más (positivos o negativos).',
    MULT_SIGN: 'Multiplicación con signos: contar y anotar el número de negativos antes de multiplicar.',
    ARITH: 'Errores de cuenta: alinear puntos decimales y escribir los enteros con .0; revisar con estimación.',
    IMPL1: 'Exponente 1 implícito: pedir que escriba el 1 sobre cada letra sola como primer paso, siempre.',
    PROD_MULT: 'Confunde producto con potencia de potencia: comparar a³·a⁴ y (a³)⁴ expandiendo los dos lado a lado.',
    POT_SUM: 'Potencia de potencia: expandir (a³)⁴ en grupos para que vea que son grupos repetidos (multiplicación).',
    QUOT_ORDER: 'Cociente: usar el modelo de tachar factores; la regla “arriba menos abajo” escrita en el encabezado de la hoja.',
    QUOT_ADD: 'Cociente: distinguir explícitamente división (resta exponentes) de multiplicación (suma).',
    NEG_FRAC: 'Exponente negativo: trabajar con la tabla descendente de potencias (2³, 2², 2¹, 2⁰, 2⁻¹…) y la idea de “cambiar de piso”.',
    NEG_NUM: 'Separar “exponente negativo” de “número negativo”: ejemplos con valores numéricos (2⁻³ = 1/8, no −8).',
    ZERO: 'Exponente cero: mostrarlo como división de algo entre sí mismo (m⁴/m⁴ = 1).',
    SQ_SIGN: 'Base negativa: contrastar siempre −3² y (−3)² en pares; resaltar qué toca el exponente.',
    POW_MULT: 'Significado de potencia: escribir la multiplicación repetida antes de calcular.',
    DIR_PUNTO: 'Valor posicional: antes de mover el punto, decidir si el número debe crecer o achicarse.',
    COUNT: 'Contar saltos del punto, no ceros: usar una tabla de posiciones o flechas de salto en el cuaderno.',
    NC_SIGN: 'Notación científica: fijar la regla “número grande → exponente positivo; número chiquito (0.algo) → negativo” y comprobar al final.',
    NC_NORM: 'Coeficiente: verificar siempre que quede una sola cifra distinta de cero antes del punto.',
    NC_COUNT: 'Notación científica: contar saltos del punto, no ceros (el patrón 8.1 × 10ⁿ ayuda a verlo).',
    NC_EXP: 'Notación científica: separar los dos pasos (cuántos saltos y qué signo) y escribir cada uno.',
    NC_COEF: 'Notación científica: las cifras del coeficiente son las mismas del número; solo cambia el lugar del punto.',
    NC_DIR: 'De notación científica a número: decidir primero si el resultado debe ser grande o chiquito.',
    NC_MULT_EXP: 'Multiplicación en notación científica: recordar que los exponentes de 10 se suman, como en las leyes de los exponentes.',
    NC_DIV_INV: 'División en notación científica: escribir “arriba ÷ abajo” y aceptar resultados menores que 1 antes de acomodar.',
    NC_DIV_EXP: 'División en notación científica: exponentes arriba menos abajo.',
    NC_EXP_SIGN: 'Operaciones con exponentes negativos: aplicar el paso “quitar paréntesis” de la regla de signos al restar exponentes.',
    NC_SUM_NOEQ: 'Suma en notación científica: igualar exponentes primero, o pasar a número completo si los exponentes son pequeños.'
  };

  /* ---------- Plan: se suman las herramientas nuevas ---------- */
  const dom = Content.PLAN.find((p) => p.day === 'Domingo');
  const lun = Content.PLAN.find((p) => p.day === 'Lunes');
  if (dom) dom.items.push({ t: 'Detective de errores', href: '#/detective', key: 'det' });
  if (lun) lun.items.splice(2, 0, { t: 'Repaso de mis errores', href: '#/practica/errores', key: 'rep' });
})();
