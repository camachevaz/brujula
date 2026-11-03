/* Brújula · Física — generadores de ejercicios y detección de errores
   Formato de solución como en su cuaderno: Datos · Fórmula · Conversiones · Sustitución · Resultado */
(function (global) {
  'use strict';
  const { M, R, pick, shuffle, round, near, fmt, parseNum, ok, bad } = global.Kit;

  /* ---------- números ---------- */
  // Muestra con decimales razonables: 2 decimales; números pequeños, 3 cifras significativas
  function show(x) {
    if (!isFinite(x)) return '—';
    const a = Math.abs(x); if (a === 0) return '0';
    const d = a >= 1 ? 2 : Math.min(7, 2 - Math.floor(Math.log10(a)));
    return fmt(round(x, d));
  }
  const rnd = (a, b, dec) => round(a + Math.random() * (b - a), dec === undefined ? 0 : dec);
  const sq = '<sup>2</sup>';
  const frac = (n, d) => '<span class="ifrac"><span>' + n + '</span><span>' + d + '</span></span>';

  /* ---------- unidades ---------- */
  const U = {
    m: { k: 'L', si: 1, name: 'metros' }, km: { k: 'L', si: 1000, name: 'kilómetros' }, cm: { k: 'L', si: 0.01, name: 'centímetros' },
    mm: { k: 'L', si: 0.001, name: 'milímetros' }, mi: { k: 'L', si: 1609.34, name: 'millas' }, ft: { k: 'L', si: 1 / 3.281, name: 'pies' }, yd: { k: 'L', si: 1 / 1.093, name: 'yardas' },
    s: { k: 'T', si: 1, name: 'segundos' }, min: { k: 'T', si: 60, name: 'minutos' }, h: { k: 'T', si: 3600, name: 'horas' },
    'm/s': { k: 'V', si: 1, name: 'm/s' }, 'km/h': { k: 'V', si: 1000 / 3600, name: 'km/h' }, 'mi/h': { k: 'V', si: 1609.34 / 3600, name: 'mi/h' },
    kg: { k: 'Mm', si: 1 }, g: { k: 'Mm', si: 0.001 }, lb: { k: 'Mm', si: 0.454 }
  };
  const toSI = (v, u) => v * U[u].si;
  const fromSI = (v, u) => v / U[u].si;

  // Equivalencias como las escribe en el cuaderno (1 grande = n chicas)
  const EQ = {
    'km|m': [1, 'km', 1000, 'm'], 'm|cm': [1, 'm', 100, 'cm'], 'm|mm': [1, 'm', 1000, 'mm'], 'mi|m': [1, 'mi', 1609.34, 'm'],
    'mi|km': [1, 'mi', 1.609, 'km'], 'm|ft': [1, 'm', 3.281, 'ft'], 'm|yd': [1, 'm', 1.093, 'yd'],
    'h|min': [1, 'h', 60, 'min'], 'min|s': [1, 'min', 60, 's'], 'h|s': [1, 'h', 3600, 's'], 'kg|g': [1, 'kg', 1000, 'g'], 'lb|kg': [1, 'lb', 0.454, 'kg']
  };
  function eqFor(a, b) { return EQ[a + '|' + b] ? { e: EQ[a + '|' + b], big: a } : EQ[b + '|' + a] ? { e: EQ[b + '|' + a], big: b } : null; }
  // factor para pasar de a → b con la equivalencia
  function factorAB(a, b) { const q = eqFor(a, b); if (!q) return null; const [, U1, n, U2] = q.e; return a === U1 ? n : 1 / n; }

  /* ---------- catálogo de errores ---------- */
  const ERR = {
    F_DIR: { t: 'Multiplicaste en lugar de dividir (o al revés)', m: 'Antes de calcular pregúntate: ¿el número debe quedar más grande o más chico? Si pasas a una unidad más chica (km → m) el número crece; si pasas a una más grande (m → km) se achica.', lens: 'r3-sentido' },
    F_EQ: { t: 'Equivalencia equivocada', m: 'Revisa la equivalencia: 1 m = 100 cm; 1 km = 1000 m; 1 m = 3.281 ft; 1 m = 1.093 yd; 1 mi = 1609.34 m = 1.609 km; 1 h = 60 min = 3600 s.', lens: 'r3-tabla' },
    F_MAG: { t: 'El punto decimal se recorrió', m: 'Las cifras están bien, pero el resultado quedó 10, 100 o 1000 veces más grande o más chico. Revisa dónde va el punto y si el resultado tiene sentido.', lens: 'fu-sentido' },
    F_ROUND: { t: 'Redondeaste demasiado pronto', m: 'El procedimiento va bien, pero el resultado se alejó por redondear en medio. Conserva al menos 3 o 4 decimales en las cuentas intermedias y redondea solo al final.', lens: 'fu-sentido' },
    F_HMIN: { t: 'Horas y minutos', m: '2 h 26 min no es 2.26 h ni 0.43 h. Los minutos se dividen entre 60 y se suman a las horas: 2 + 26/60 = 2.43 h.', lens: 'r3-tiempo' },
    F_FU_INV: { t: 'Factor volteado', m: 'En el factor unitario, la unidad que quieres quitar va en el lado contrario para que se tache. Si no se tacha, la fracción está volteada.', lens: 'fu-cancel' },
    F_FU_HALF: { t: 'Faltó convertir una unidad', m: 'En una velocidad hay dos unidades: la de distancia y la de tiempo. Hay que convertir las dos (por ejemplo km → m y h → s).', lens: 'fu-pasos' },
    F_DESP: { t: 'Despeje equivocado', m: 'Revisa la fórmula: d = v · t, v = d ÷ t, t = d ÷ v. Usa el triángulo: tapa lo que buscas y lee lo que queda.', lens: 'desp-triangulo' },
    F_DESP_A: { t: 'Despeje equivocado', m: 'De a = (vf − vi) ÷ t salen: vf = vi + a·t, vi = vf − a·t y t = (vf − vi) ÷ a.', lens: 'desp-pasos' },
    F_UNITS: { t: 'Unidades mezcladas', m: 'Antes de sustituir, todas las unidades deben combinar: si la velocidad está en m/s, la distancia va en metros y el tiempo en segundos.', lens: 'vel-pasos' },
    F_OUT: { t: 'Falta convertir el resultado', m: 'Tu cuenta va bien, pero el problema pide el resultado en otra unidad. Haz la conversión final.', lens: 'vel-pasos' },
    F_SWAP: { t: 'Final menos inicial', m: 'El cambio de velocidad es velocidad final menos velocidad inicial: vf − vi. Si lo haces al revés, el signo sale contrario.', lens: 'ac-pasos' },
    F_DV: { t: 'Faltó la velocidad inicial', m: 'La aceleración usa el cambio de velocidad (vf − vi). Si el móvil no parte del reposo, vi no es cero y hay que restarla (o sumarla).', lens: 'ac-patron' },
    F_SIGN: { t: 'Frenar es aceleración negativa', m: 'Cuando el móvil frena, la aceleración es negativa: vf = vi + (−a)·t, así que la velocidad baja.', lens: 'ac-historia' },
    F_DATA: { t: 'Revisa qué es cada dato', m: 'm/s² es aceleración; m/s, km/h o mi/h son velocidad; “parte del reposo” significa vi = 0; “se detiene” significa vf = 0.', lens: 'ac-pasos' },
    F_TF: { t: 'Periodo y frecuencia son inversos', m: 'T = 1 ÷ f y f = 1 ÷ T. Si la frecuencia es grande, el periodo es chico.', lens: 'on-ft' },
    F_OND: { t: 'Revisa el concepto', m: 'Repasa la clasificación y las partes de una onda.', lens: 'on-tipos' }
  };

  /* ---------- revisión numérica genérica ---------- */
  // variants: [{v, err}] respuestas típicas de cada error
  function numCheck(ans, variants, opts) {
    opts = opts || {}; const tol = opts.tol || 0.01;
    const f = (inp) => {
      const v = parseNum(inp.v); if (isNaN(v)) return bad('INVALID');
      if (near(v, ans, tol)) return ok();
      for (const x of variants || []) if (isFinite(x.v) && !near(x.v, ans, tol) && near(v, x.v, Math.max(tol, 0.015))) return bad(x.err);
      if (opts.sign && near(-v, ans, tol)) return bad(opts.sign);
      for (const k of [10, 100, 1000, 0.1, 0.01, 0.001]) if (near(v, ans * k, 0.015)) return bad('F_MAG');
      if (opts.round !== false && Math.sign(v) === Math.sign(ans) && near(v, ans, 0.16)) return bad('F_ROUND');
      return bad('GENERIC');
    };
    f.ans = ans; f.variants = variants || [];
    return f;
  }
  function mcItem(sub, prompt, options, errs, solution) {
    const order = shuffle(options.map((_, i) => i));
    return {
      type: 'mc', prompt, options: order.map((i) => options[i]), answerText: options[0], answerHtml: true, solution, correct: { choice: order.indexOf(0) },
      check: (inp) => { if (inp.choice === undefined || inp.choice === null) return bad('INVALID'); const o = order[inp.choice]; return o === 0 ? ok() : bad(errs[o] || 'GENERIC'); }
    };
  }
  const sol = (o) => `<div class="fsol">
    ${o.datos ? `<div><b>Datos</b>${o.datos}</div>` : ''}
    ${o.formula ? `<div><b>Fórmula</b>${o.formula}</div>` : ''}
    ${o.conv ? `<div><b>Conversiones</b>${o.conv}</div>` : ''}
    ${o.sust ? `<div><b>Sustitución</b>${o.sust}</div>` : ''}
    ${o.res ? `<div><b>Resultado</b>${o.res}</div>` : ''}</div>${o.check ? `<p class="small muted">¿Tiene sentido? ${o.check}</p>` : ''}`;

  /* ================= REGLA DE TRES ================= */
  const R3_PAIRS = [
    ['km', 'm', [1.2, 98, 1]], ['m', 'km', [350, 98000, 0]], ['m', 'cm', [1.5, 45, 1]], ['cm', 'm', [120, 45200, 0]],
    ['mm', 'm', [850, 81250, 0]], ['mi', 'm', [2, 60, 1]], ['m', 'mi', [1800, 45000, 0]], ['mi', 'km', [12, 3100, 0]], ['km', 'mi', [15, 6510, 0]],
    ['m', 'ft', [12, 7250, 0]], ['ft', 'm', [30, 4800, 0]], ['m', 'yd', [20, 2600, 0]], ['yd', 'm', [40, 3560, 0]],
    ['h', 'min', [1.5, 12, 1]], ['min', 'h', [90, 7200, 0]], ['h', 's', [1.2, 6.4, 1]], ['s', 'h', [5400, 52000, 0]], ['min', 's', [2.5, 45, 1]], ['s', 'min', [150, 3600, 0]],
    ['kg', 'g', [1.2, 35, 1]], ['g', 'kg', [450, 9800, 0]], ['lb', 'kg', [5, 120, 1]], ['kg', 'lb', [10, 3250, 0]]
  ];
  const WRONG_EQ = { 'm|cm': 1000, 'cm|m': 1000, 'm|yd': 3.281, 'yd|m': 3.281, 'h|s': 60, 's|h': 60, 'mi|km': 1609.34, 'km|mi': 1609.34, 'mi|m': 1.609, 'm|mi': 1.609 };
  const CTX_R3 = { L: ['Un camino mide', 'La pista de la escuela mide', 'Una ruta de ciclismo mide', 'La distancia de la gira de un grupo musical entre dos ciudades es de'], T: ['Un viaje dura', 'Un ensayo de música duró', 'Una película dura', 'Un entrenamiento de fútbol duró'], Mm: ['Una caja de chocolates pesa', 'Una mochila pesa', 'Un costal de arena pesa'] };
  function genR3() {
    const [a, b, rg] = pick(R3_PAIRS); const val = rnd(rg[0], rg[1], rg[2]);
    const f = factorAB(a, b); const ans = val * f; const q = eqFor(a, b); const [, U1, n, U2] = q.e;
    const variants = [{ v: val / f, err: 'F_DIR' }];
    const we = WRONG_EQ[a + '|' + b]; if (we) variants.push({ v: f >= 1 ? val * we : val / we, err: 'F_EQ' });
    const k = U[a].k; const ctx = Math.random() < 0.45 ? pick(CTX_R3[k] || ['']) + ' ' + fmt(val) + ' ' + a + '. ' : '';
    const bigger = f > 1;
    return {
      type: 'num', unit: b, prompt: `<p class="ctx">${ctx}</p><p class="expr">${fmt(val)} ${a} → ${b}</p>`, answerText: show(ans) + ' ' + b,
      solution: `<p><b>1. ¿Más grande o más chico?</b> ${a} → ${b}: ${bigger ? 'la unidad nueva es más chica, el número debe <b>crecer</b> (multiplicar)' : 'la unidad nueva es más grande, el número debe <b>achicarse</b> (dividir)'}.</p>
        <p><b>2. Regla de tres:</b></p><div class="r3"><span>${n === 1 ? 1 : 1} ${U1}</span><span>—</span><span>${fmt(n)} ${U2}</span><span>${a === U1 ? fmt(val) + ' ' + U1 : 'x'}</span><span>—</span><span>${a === U1 ? 'x' : fmt(val) + ' ' + U2}</span></div>
        <p>x = ${a === U1 ? '(' + fmt(val) + ')(' + fmt(n) + ') ÷ 1' : '(' + fmt(val) + ')(1) ÷ ' + fmt(n)} = <b>${show(ans)} ${b}</b></p>`,
      check: numCheck(ans, variants)
    };
  }
  // Horas, minutos y segundos
  function genHMin() {
    const form = pick(['hm_h', 'hm_h', 'min_h', 'h_min', 's_min', 'ms_s']);
    if (form === 'hm_h') {
      const h = R(1, 6), m = pick([12, 15, 18, 20, 24, 25, 26, 30, 36, 40, 42, 45, 48, 50]); const ans = h + m / 60;
      return { type: 'num', unit: 'h', prompt: `<p>Escribe el tiempo en horas (con decimales):</p><p class="expr">${h} h ${m} min</p>`, answerText: show(ans) + ' h',
        solution: `<p>Los minutos se pasan a horas dividiendo entre 60: ${m} ÷ 60 = ${show(m / 60)} h</p><p>Se suman a las horas: ${h} + ${show(m / 60)} = <b>${show(ans)} h</b></p><p class="small muted">Ojo: ${h} h ${m} min no es ${h}.${m} h.</p>`,
        check: numCheck(ans, [{ v: m / 60, err: 'F_HMIN' }, { v: h + m / 100, err: 'F_HMIN' }, { v: h * 60 + m, err: 'F_OUT' }]) };
    }
    if (form === 'min_h') {
      const x = pick([R(6, 59), rnd(1.5, 9.9, 1)]); const ans = x / 60;
      return { type: 'num', unit: 'h', prompt: `<p class="expr">${fmt(x)} min → h</p>`, answerText: show(ans) + ' h',
        solution: `<p>1 h — 60 min. Pasar a horas (unidad más grande) → <b>dividir</b> entre 60.</p><p>${fmt(x)} ÷ 60 = <b>${show(ans)} h</b></p>`,
        check: numCheck(ans, [{ v: x * 60, err: 'F_DIR' }, { v: x / 100, err: 'F_HMIN' }]) };
    }
    if (form === 'h_min') {
      const x = pick([0.25, 0.4, 0.5, 0.75, 1.2, 1.5, 2.25, 2.4, 3.6]); const ans = x * 60;
      return { type: 'num', unit: 'min', prompt: `<p class="expr">${fmt(x)} h → min</p>`, answerText: show(ans) + ' min',
        solution: `<p>1 h — 60 min. Pasar a minutos (unidad más chica) → <b>multiplicar</b> por 60.</p><p>${fmt(x)} × 60 = <b>${show(ans)} min</b></p>`,
        check: numCheck(ans, [{ v: x / 60, err: 'F_DIR' }, { v: x * 100, err: 'F_HMIN' }]) };
    }
    if (form === 's_min') {
      const x = R(75, 900); const ans = x / 60;
      return { type: 'num', unit: 'min', prompt: `<p class="expr">${fmt(x)} s → min</p>`, answerText: show(ans) + ' min',
        solution: `<p>1 min — 60 s → dividir entre 60: ${fmt(x)} ÷ 60 = <b>${show(ans)} min</b></p>`,
        check: numCheck(ans, [{ v: x * 60, err: 'F_DIR' }, { v: x / 100, err: 'F_HMIN' }]) };
    }
    const mi = R(1, 9), s = R(5, 55); const ans = mi * 60 + s;
    return { type: 'num', unit: 's', prompt: `<p>Escribe el tiempo en segundos:</p><p class="expr">${mi} min ${s} s</p>`, answerText: fmt(ans) + ' s',
      solution: `<p>${mi} min × 60 = ${mi * 60} s; más ${s} s = <b>${ans} s</b></p>`,
      check: numCheck(ans, [{ v: mi + s, err: 'F_HMIN' }, { v: mi * 100 + s, err: 'F_HMIN' }, { v: mi + s / 60, err: 'F_OUT' }], { round: false }) };
  }

  /* ================= FACTOR UNITARIO (velocidades) ================= */
  const FU = {
    'km/h>m/s': [['1000 m', '1 km', 1000], ['1 h', '3600 s', 1 / 3600]],
    'm/s>km/h': [['1 km', '1000 m', 1 / 1000], ['3600 s', '1 h', 3600]],
    'mi/h>m/s': [['1609.34 m', '1 mi', 1609.34], ['1 h', '3600 s', 1 / 3600]],
    'm/s>mi/h': [['1 mi', '1609.34 m', 1 / 1609.34], ['3600 s', '1 h', 3600]],
    'km/h>mi/h': [['1 mi', '1.609 km', 1 / 1.609]],
    'mi/h>km/h': [['1.609 km', '1 mi', 1.609]]
  };
  const FU_CTX = ['Un tren bala viaja a', 'Una jugadora de fútbol corre a', 'Un balón sale disparado a', 'El autobús de una gira de conciertos va a', 'Una cinta transportadora de una fábrica de chocolate se mueve a', 'Un auto en la carretera Mexicali–Tijuana va a', 'Una ciclista va a', 'Un avión despega a'];
  function fuChainHTML(v, from, chain) {
    const [d1, t1] = from.split('/');
    return fmt(v) + ' ' + frac(d1, t1) + chain.map((c) => ' × (' + frac(c[0], c[1]) + ')').join('');
  }
  function genFU() {
    const key = pick(Object.keys(FU)); const [from, to] = key.split('>'); const chain = FU[key];
    const v = from === 'm/s' ? rnd(2, 95, Math.random() < 0.5 ? 0 : 1) : rnd(10, 260, 0);
    const f = chain.reduce((p, c) => p * c[2], 1); const ans = v * f;
    const variants = [{ v: v / f, err: 'F_FU_INV' }];
    if (chain.length === 2) {
      const [a, b] = chain.map((c) => c[2]);
      variants.push({ v: v * a, err: 'F_FU_HALF' }, { v: v * b, err: 'F_FU_HALF' }, { v: (v / a) * b, err: 'F_FU_INV' }, { v: v * a / b, err: 'F_FU_INV' });
    }
    const ctx = Math.random() < 0.5 ? pick(FU_CTX) + ' ' + fmt(v) + ' ' + from + '. ' : '';
    const num = chain.reduce((p, c) => p * parseFloat(c[0]), v), den = chain.reduce((p, c) => p * parseFloat(c[1]), 1);
    return {
      type: 'num', unit: to, prompt: `<p class="ctx">${ctx}Convierte con factor unitario:</p><p class="expr">${fmt(v)} ${from} → ${to}</p>`, answerText: show(ans) + ' ' + to,
      solution: `<p><b>1. Planteo:</b> lo que quiero quitar va del lado contrario para que se tache.</p><p class="fu-line">${fuChainHTML(v, from, chain)}</p>
        <p><b>2. Multiplico arriba y abajo:</b> ${fmt(round(num, 4))} ÷ ${fmt(den)} = <b>${show(ans)} ${to}</b></p>`,
      check: numCheck(ans, variants)
    };
  }

  /* ================= DESPEJE ================= */
  function genDespVDT() {
    const ask = pick(['d', 't', 'v']);
    const sets = {
      d: ['d = v · t', ['d = ' + frac('v', 't'), 'd = ' + frac('t', 'v'), 'd = v + t']],
      t: ['t = ' + frac('d', 'v'), ['t = v · d', 't = ' + frac('v', 'd'), 't = d − v']],
      v: ['v = ' + frac('d', 't'), ['v = d · t', 'v = ' + frac('t', 'd'), 'v = d − t']]
    };
    const [good, wrong] = sets[ask]; const name = { d: 'la distancia', t: 'el tiempo', v: 'la velocidad' }[ask];
    return mcItem('f_desp_vdt', `<p>En el movimiento uniforme, ¿con qué fórmula se calcula <b>${name}</b>?</p>`, [good, ...wrong], [null, 'F_DESP', 'F_DESP', 'F_DESP'],
      `<p>Triángulo: <b>d</b> arriba; <b>v</b> y <b>t</b> abajo. Tapa ${ask}: ${ask === 'd' ? 'quedan v y t lado a lado → se <b>multiplican</b>' : 'queda d arriba de ' + (ask === 't' ? 'v' : 't') + ' → se <b>divide</b>'}.</p><p><b>${good}</b></p>`);
  }
  function genDespAcel() {
    const ask = pick(['vf', 'vi', 't', 'vf']);
    const sets = {
      vf: ['vf = vi + a·t', ['vf = a·t − vi', 'vf = ' + frac('vi', 'a·t'), 'vf = vi − a·t']],
      vi: ['vi = vf − a·t', ['vi = vf + a·t', 'vi = a·t − vf', 'vi = ' + frac('vf', 'a·t')]],
      t: ['t = ' + frac('vf − vi', 'a'), ['t = a · (vf − vi)', 't = ' + frac('a', 'vf − vi'), 't = vf − vi − a']]
    };
    const [good, wrong] = sets[ask];
    const steps = {
      vf: ['a = ' + frac('vf − vi', 't'), 'a·t = vf − vi  (t pasa multiplicando)', 'a·t + vi = vf  (vi pasa sumando)', '<b>vf = vi + a·t</b>'],
      vi: ['a = ' + frac('vf − vi', 't'), 'a·t = vf − vi', 'vi = vf − a·t  (vi pasa al otro lado, a·t pasa restando)', '<b>vi = vf − a·t</b>'],
      t: ['a = ' + frac('vf − vi', 't'), 'a·t = vf − vi  (t pasa multiplicando)', 't = ' + frac('vf − vi', 'a') + '  (a pasa dividiendo)', '<b>t = ' + frac('vf − vi', 'a') + '</b>']
    }[ask];
    return mcItem('f_desp_acel', `<p>Si <span class="mono">a = ${frac('vf − vi', 't')}</span>, despeja <b>${ask}</b>:</p>`, [good, ...wrong], [null, 'F_DESP_A', 'F_DESP_A', 'F_DESP_A'],
      steps.map((x) => '<p class="mono">' + x + '</p>').join('') + '<p class="small muted">Comprueba con números: si vi = 2, a = 3 y t = 4, entonces vf = 2 + 12 = 14.</p>');
  }

  /* ================= VELOCIDAD, DISTANCIA Y TIEMPO (MRU) ================= */
  const MOVERS = [
    { who: 'Una jugadora de fútbol', verb: 'corre', v: [5, 8.5, 'm/s'], t: [4, 20, 's'], du: 'm', alt: { v: ['km/h'], d: ['m', 'ft'], t: ['s', 'min'] } },
    { who: 'Un autobús de una gira de conciertos', verb: 'viaja', v: [70, 110, 'km/h'], t: [1.5, 7, 'h'], du: 'km', alt: { v: ['km/h', 'm/s', 'mi/h'], d: ['km', 'mi'], t: ['h', 'min'] } },
    { who: 'Un auto que va de Mexicali a Tijuana', verb: 'viaja', v: [80, 110, 'km/h'], t: [1.6, 2.3, 'h'], du: 'km', alt: { v: ['km/h', 'm/s'], d: ['km', 'mi', 'm'], t: ['h', 'min'] } },
    { who: 'Una ciclista', verb: 'pedalea', v: [12, 30, 'km/h'], t: [10, 90, 'min'], du: 'km', alt: { v: ['km/h', 'm/s'], d: ['km', 'm'], t: ['min', 'h', 's'] } },
    { who: 'Una cinta transportadora de una fábrica de chocolate', verb: 'avanza', v: [0.3, 1.5, 'm/s'], t: [20, 240, 's'], du: 'm', alt: { v: ['m/s'], d: ['m', 'ft'], t: ['s', 'min'] } },
    { who: 'El sonido de un trueno', verb: 'viaja', v: [330, 345, 'm/s'], t: [2, 15, 's'], du: 'km', alt: { v: ['m/s'], d: ['km', 'm'], t: ['s', 'min'] } },
    { who: 'Un tren', verb: 'avanza', v: [90, 250, 'km/h'], t: [0.5, 4, 'h'], du: 'km', alt: { v: ['km/h', 'm/s'], d: ['km', 'mi'], t: ['h', 'min', 's'] } },
    { who: 'Un corredor', verb: 'corre', v: [2.5, 6, 'm/s'], t: [10, 80, 'min'], du: 'km', alt: { v: ['m/s', 'km/h', 'mi/h'], d: ['km', 'mi', 'm'], t: ['min', 'h', 's'] } },
    { who: 'Un avión', verb: 'vuela', v: [650, 900, 'km/h'], t: [1, 5, 'h'], du: 'km', alt: { v: ['km/h', 'm/s'], d: ['km', 'mi'], t: ['h', 'min'] } }
  ];
  const QNAME = { d: 'la distancia', t: 'el tiempo', v: 'la velocidad' };
  const decFor = (u) => (['m/s', 's', 'min', 'h', 'mi', 'km'].includes(u) ? 1 : 0);
  function niceGiven(x, u) { const a = Math.abs(x); const d = a >= 100 ? 0 : a >= 10 ? 1 : 2; return round(x, d); }
  function convLine(x, from, to) {
    if (from === to) return '';
    if (U[from].k === 'V') { const key = from + '>' + to; const ch = FU[key]; if (ch) return `<p class="fu-line">${fuChainHTML(x, from, ch)} = ${show(x * ch.reduce((p, c) => p * c[2], 1))} ${to}</p>`; }
    const f = U[from].si / U[to].si; return `<p>${fmt(x)} ${from} → ${to}: ${f > 1 ? '× ' + fmt(round(f, 4)) : '÷ ' + fmt(round(1 / f, 4))} = ${show(x * f)} ${to}</p>`;
  }
  function genMRU(kind) {
    for (let tries = 0; tries < 40; tries++) {
      const M0 = pick(MOVERS);
      const v_si = toSI(rnd(M0.v[0], M0.v[1], 1), M0.v[2]); const t_si = toSI(rnd(M0.t[0], M0.t[1], M0.t[2] === 'h' ? 1 : 0), M0.t[2]);
      const units = { v: pick(M0.alt.v), d: pick(M0.alt.d), t: pick(M0.alt.t) };
      // valores mostrados (redondeados) y respuesta calculada con ellos
      const g = { v: niceGiven(fromSI(v_si, units.v), units.v), t: niceGiven(fromSI(t_si, units.t), units.t), d: niceGiven(fromSI(v_si * t_si, units.d), units.d) };
      if (!g.v || !g.t || !g.d) continue;
      const si = { v: toSI(g.v, units.v), t: toSI(g.t, units.t), d: toSI(g.d, units.d) };
      const askU = pick(M0.alt[kind]);
      let ansSI; if (kind === 'd') ansSI = si.v * si.t; else if (kind === 't') ansSI = si.d / si.v; else ansSI = si.d / si.t;
      const ans = fromSI(ansSI, askU); if (!(ans >= 0.05 && ans < 1e6)) continue;
      // forma de dar el tiempo: “2 h 26 min” a veces
      let tTxt = fmt(g.t) + ' ' + units.t; let hm = null;
      if (kind !== 't' && units.t === 'h' && Math.random() < 0.4) { const H = Math.floor(g.t); const Mi = Math.round((g.t - H) * 60); if (H >= 1 && Mi >= 5) { hm = { H, Mi }; tTxt = H + ' h ' + Mi + ' min'; si.t = H * 3600 + Mi * 60; ansSI = kind === 'd' ? si.v * si.t : si.d / si.t; } }
      const ansF = fromSI(ansSI, askU);
      const giv = { v: fmt(g.v) + ' ' + units.v, d: fmt(g.d) + ' ' + units.d, t: tTxt };
      const others = ['d', 'v', 't'].filter((x) => x !== kind);
      const verbs = { d: (M0.verb) + ' durante ' + giv.t + ' a ' + giv.v, t: 'recorre ' + giv.d + ' a ' + giv.v, v: 'recorre ' + giv.d + ' en ' + giv.t };
      const prompt = `<p>${M0.who} ${verbs[kind]}. Calcula ${QNAME[kind]} <b>(${askU})</b>.</p>`;
      // variantes de error
      const V = [];
      const raw = { v: g.v, d: g.d, t: hm ? hm.H + hm.Mi / 100 : g.t };
      if (kind === 't') { V.push({ v: fromSI(si.d * si.v, askU), err: 'F_DESP' }, { v: fromSI(si.v / si.d, askU), err: 'F_DESP' }, { v: raw.d / raw.v, err: 'F_UNITS' }); if (askU !== 's') V.push({ v: ansSI, err: 'F_OUT' }); }
      if (kind === 'v') { V.push({ v: fromSI(si.d * si.t, askU), err: 'F_DESP' }, { v: fromSI(si.t / si.d, askU), err: 'F_DESP' }, { v: raw.d / raw.t, err: 'F_UNITS' }); if (askU !== 'm/s') V.push({ v: ansSI, err: 'F_OUT' }); }
      if (kind === 'd') { V.push({ v: fromSI(si.v / si.t, askU), err: 'F_DESP' }, { v: fromSI(si.t / si.v, askU), err: 'F_DESP' }, { v: raw.v * raw.t, err: 'F_UNITS' }); if (askU !== 'm') V.push({ v: ansSI, err: 'F_OUT' }); }
      if (hm) { const tw = (hm.H + hm.Mi / 100) * 3600, tw2 = (hm.Mi / 60) * 3600; V.push({ v: fromSI(kind === 'd' ? si.v * tw : si.d / tw, askU), err: 'F_HMIN' }, { v: fromSI(kind === 'd' ? si.v * tw2 : si.d / tw2, askU), err: 'F_HMIN' }); }
      // solución con unidades de trabajo coherentes
      const work = (U[units.v].k === 'V' && units.v === 'km/h' && ['km', 'h'].includes(askU)) ? { v: 'km/h', d: 'km', t: 'h' } : { v: 'm/s', d: 'm', t: 's' };
      const wv = { v: fromSI(si.v, work.v), d: fromSI(si.d, work.d), t: fromSI(si.t, work.t) };
      const convs = others.map((q) => { if (q === 't' && hm) return `<p>${hm.H} h ${hm.Mi} min = ${hm.H} + ${hm.Mi}/60 = ${show(hm.H + hm.Mi / 60)} h${work.t !== 'h' ? ' = ' + show(si.t) + ' s' : ''}</p>`; return convLine(g[q], units[q], work[q]); }).join('');
      const formula = { d: 'd = v · t', t: 't = ' + frac('d', 'v'), v: 'v = ' + frac('d', 't') }[kind];
      const sust = kind === 'd' ? `d = (${show(wv.v)} ${work.v})(${show(wv.t)} ${work.t})` : kind === 't' ? `t = ${frac(show(wv.d) + ' ' + work.d, show(wv.v) + ' ' + work.v)}` : `v = ${frac(show(wv.d) + ' ' + work.d, show(wv.t) + ' ' + work.t)}`;
      const resWork = kind === 'd' ? wv.v * wv.t : kind === 't' ? wv.d / wv.v : wv.d / wv.t; const wu = work[kind];
      return {
        type: 'num', unit: askU, prompt, answerText: show(ansF) + ' ' + askU,
        solution: sol({
          datos: `<p>${others.map((q) => q + ' = ' + giv[q]).join('<br>')}<br>${kind} = ? (${askU})</p>`, formula: `<p class="mono">${formula}</p>`,
          conv: (convs || '<p>No hace falta: las unidades ya combinan.</p>'), sust: `<p class="mono">${sust}</p>`,
          res: (wu !== askU ? `<p>${kind} = ${show(resWork)} ${wu}<br>${convLine(round(resWork, 6), wu, askU).replace(/<\/?p>/g, '')}</p>` : '') + `<p><b>${kind} = ${show(ansF)} ${askU}</b></p>`,
          check: kind === 't' ? 'Más distancia o menos velocidad → más tiempo.' : kind === 'v' ? 'Compara con algo conocido: caminar ≈ 1.4 m/s, auto en carretera ≈ 100 km/h.' : 'Más tiempo o más velocidad → más distancia.'
        }),
        check: numCheck(ansF, V)
      };
    }
    return genMRU(kind);
  }

  /* ================= ACELERACIÓN (MRUA) ================= */
  const ACC = [
    { who: 'Un auto', vi: [0, 15], a: [1.5, 4], t: [3, 12] },
    { who: 'Una motocicleta', vi: [0, 0], a: [2, 5], t: [3, 8] },
    { who: 'Un tractor', vi: [0, 0], a: [0.2, 0.6], t: [30, 120] },
    { who: 'Un tren que sale de la estación', vi: [0, 0], a: [0.3, 1], t: [40, 180] },
    { who: 'Un avión en la pista', vi: [0, 0], a: [2, 3.5], t: [20, 35] },
    { who: 'Un balón que rueda por una rampa', vi: [0, 1], a: [0.5, 2], t: [2, 8] },
    { who: 'Una jugadora que arranca hacia el balón', vi: [0, 2], a: [2, 4], t: [1, 3] },
    { who: 'Un camión que frena', vi: [18, 30], a: [-5, -2], t: [2, 5], brake: true },
    { who: 'Un auto que entra a una curva y reduce su velocidad', vi: [20, 32], a: [-4, -1.5], t: [2, 4], brake: true }
  ];
  function genAccel(kind) {
    for (let tries = 0; tries < 40; tries++) {
      const A = pick(ACC);
      const vi = round(rnd(A.vi[0], A.vi[1], 0), 1); const a = round(rnd(A.a[0], A.a[1], 1), 1); let t = R(A.t[0], A.t[1]);
      const vf = vi + a * t; if (vf < 0 || a === 0) continue;
      // unidades del enunciado
      const vU = pick(['m/s', 'm/s', 'km/h', 'mi/h']); const tU = t >= 60 && Math.random() < 0.6 ? 'min' : 's';
      const gv = (x) => niceGiven(fromSI(x, vU), vU); const gt = tU === 'min' ? round(t / 60, 2) : t;
      const viG = gv(vi), vfG = gv(vf), tG = gt; const viS = toSI(viG, vU), vfS = toSI(vfG, vU), tS = toSI(tG, tU);
      const reposo = viG === 0 && !A.brake;
      let ans, askU = 'm/s', V = [], prompt, formula, sust, res, resNum;
      const datoVi = reposo ? 'parte del reposo' : 'va a ' + fmt(viG) + ' ' + vU;
      if (kind === 'a') {
        ans = (vfS - viS) / tS; askU = 'm/s²';
        prompt = `${A.who} ${datoVi} y ${A.brake ? 'baja' : 'llega'} a ${fmt(vfG)} ${vU} en ${fmt(tG)} ${tU}. Calcula su aceleración <b>(m/s²)</b>.`;
        V.push({ v: (vfG - viG) / tG, err: 'F_UNITS' }, { v: (viS - vfS) / tS, err: 'F_SWAP' }, { v: (vfS - viS) * tS, err: 'F_DESP_A' });
        if (viS) V.push({ v: vfS / tS, err: 'F_DV' });
        formula = 'a = ' + frac('vf − vi', 't'); sust = 'a = ' + frac(show(vfS) + ' − ' + show(viS), show(tS)); resNum = ans; res = show(ans) + ' m/s²';
      } else if (kind === 'vf') {
        askU = pick(['m/s', 'km/h', vU]); const aS = a; ans = fromSI(viS + aS * tS, askU);
        prompt = `${A.who} ${datoVi} con una aceleración de ${fmt(a)} m/s²${A.brake ? ' (va frenando)' : ''}. ¿Qué velocidad <b>(${askU})</b> tendrá a los ${fmt(tG)} ${tU}?`;
        if (A.brake) prompt = `${A.who}: va a ${fmt(viG)} ${vU} y frena con una aceleración de ${fmt(a)} m/s². ¿Qué velocidad <b>(${askU})</b> tendrá a los ${fmt(tG)} ${tU}?`;
        V.push({ v: fromSI(aS * tS - viS, askU), err: 'F_DESP_A' }, { v: fromSI(viS + aS * tG, askU), err: 'F_UNITS' });
        if (viS) V.push({ v: fromSI(aS * tS, askU), err: 'F_DV' });
        if (A.brake) V.push({ v: fromSI(viS - aS * tS, askU), err: 'F_SIGN' });
        if (askU !== 'm/s') V.push({ v: viS + aS * tS, err: 'F_OUT' });
        formula = 'vf = vi + a·t'; sust = 'vf = ' + show(viS) + ' + (' + fmt(a) + ')(' + show(tS) + ')'; resNum = viS + aS * tS; res = show(resNum) + ' m/s';
      } else if (kind === 'vi') {
        if (A.brake || vi === 0) continue;
        askU = pick(['m/s', 'km/h']); ans = fromSI(vfS - a * tS, askU);
        prompt = `${A.who} acelera a ${fmt(a)} m/s² durante ${fmt(tG)} ${tU} y alcanza ${fmt(vfG)} ${vU}. ¿Con qué velocidad <b>(${askU})</b> iba al inicio?`;
        V.push({ v: fromSI(vfS + a * tS, askU), err: 'F_DESP_A' }, { v: fromSI(vfS - a * tG, askU), err: 'F_UNITS' });
        if (askU !== 'm/s') V.push({ v: vfS - a * tS, err: 'F_OUT' });
        formula = 'vi = vf − a·t'; sust = 'vi = ' + show(vfS) + ' − (' + fmt(a) + ')(' + show(tS) + ')'; resNum = vfS - a * tS; res = show(resNum) + ' m/s';
      } else {
        askU = tS >= 90 ? pick(['s', 'min']) : 's'; ans = fromSI((vfS - viS) / a, askU);
        prompt = `${A.who} ${datoVi} y ${A.brake ? 'baja' : 'llega'} a ${fmt(vfG)} ${vU} con una aceleración de ${fmt(a)} m/s². ¿Cuánto tiempo <b>(${askU})</b> tarda?`;
        V.push({ v: fromSI((vfS - viS) * a, askU), err: 'F_DESP_A' }, { v: fromSI(a / (vfS - viS), askU), err: 'F_DESP_A' }, { v: (vfG - viG) / a, err: 'F_UNITS' });
        if (askU !== 's') V.push({ v: (vfS - viS) / a, err: 'F_OUT' });
        formula = 't = ' + frac('vf − vi', 'a'); sust = 't = ' + frac(show(vfS) + ' − ' + show(viS), fmt(a)); resNum = (vfS - viS) / a; res = show(resNum) + ' s';
      }
      if (!isFinite(ans) || Math.abs(ans) < 0.01) continue;
      const conv = [vU !== 'm/s' && kind !== 'vi' && viG ? convLine(viG, vU, 'm/s') : '', vU !== 'm/s' && kind !== 'vf' ? convLine(vfG, vU, 'm/s') : '', tU === 'min' && kind !== 't' ? `<p>${fmt(tG)} min × 60 = ${show(tS)} s</p>` : ''].join('');
      const finalConv = ((kind === 'vf' || kind === 'vi') && askU !== 'm/s') ? convLine(round(resNum, 6), 'm/s', askU).replace(/<\/?p>/g, '') : (kind === 't' && askU === 'min') ? show((vfS - viS) / a) + ' s ÷ 60' : '';
      return {
        type: 'num', unit: askU, prompt: '<p>' + prompt + '</p>', answerText: show(ans) + ' ' + askU,
        solution: sol({
          datos: `<p>vi = ${reposo ? '0 (parte del reposo)' : fmt(viG) + ' ' + vU}${kind !== 'vf' ? '<br>vf = ' + fmt(vfG) + ' ' + vU : ''}${kind !== 'a' ? '<br>a = ' + fmt(a) + ' m/s²' : ''}${kind !== 't' ? '<br>t = ' + fmt(tG) + ' ' + tU : ''}<br>${kind} = ? (${askU})</p>`,
          formula: `<p class="mono">${formula}</p>`, conv: conv || '<p>No hace falta: ya está en m/s y s.</p>', sust: `<p class="mono">${sust}</p>`,
          res: `<p>${kind} = ${res}${finalConv ? '<br>' + finalConv : ''}</p><p><b>${kind} = ${show(ans)} ${askU}</b></p>`,
          check: A.brake ? 'Si frena, la velocidad final es menor que la inicial y la aceleración es negativa.' : 'Si acelera, la velocidad final es mayor que la inicial.'
        }),
        check: numCheck(ans, V, { sign: kind === 'a' ? 'F_SWAP' : null })
      };
    }
    return genAccel(kind);
  }

  /* ================= ONDAS Y SONIDO ================= */
  const OND = [
    ['¿Qué tipo de onda necesita un medio (aire, agua, metal) para viajar?', ['Mecánica', 'Electromagnética', 'Transversal', 'Ninguna']],
    ['La luz del Sol llega a la Tierra viajando por el vacío. Es una onda…', ['Electromagnética', 'Mecánica', 'Longitudinal', 'Sonora']],
    ['El sonido es una onda…', ['Mecánica', 'Electromagnética', 'Que viaja en el vacío', 'Transversal de luz']],
    ['En una cuerda que sacudes hacia arriba y hacia abajo, la onda es…', ['Transversal', 'Longitudinal', 'Electromagnética', 'Estacionaria']],
    ['En un resorte que comprimes y sueltas a lo largo, la onda es…', ['Longitudinal', 'Transversal', 'Electromagnética', 'Circular']],
    ['La parte más alta de una onda se llama…', ['Cresta', 'Valle', 'Nodo', 'Amplitud']],
    ['La parte más baja de una onda se llama…', ['Valle', 'Cresta', 'Nodo', 'Longitud de onda']],
    ['La distancia entre dos crestas seguidas se llama…', ['Longitud de onda (λ)', 'Amplitud', 'Frecuencia', 'Periodo']],
    ['El máximo alejamiento de la onda desde la línea de equilibrio es…', ['La amplitud', 'La frecuencia', 'El nodo', 'El periodo']],
    ['El número de vibraciones por segundo es…', ['La frecuencia (Hz)', 'El periodo (s)', 'La amplitud (m)', 'La longitud de onda']],
    ['El tiempo que tarda una vibración completa es…', ['El periodo (s)', 'La frecuencia (Hz)', 'La amplitud', 'El tono']],
    ['Un sonido agudo tiene una frecuencia…', ['Alta', 'Baja', 'Igual a cero', 'Negativa']],
    ['Un sonido grave tiene una frecuencia…', ['Baja', 'Alta', 'Mayor a 20,000 Hz', 'Igual a la de la luz']],
    ['¿En qué medio viaja más rápido el sonido?', ['Acero (sólido)', 'Agua (líquido)', 'Aire (gas)', 'En el vacío']],
    ['Los sonidos de más de 20,000 Hz, que el oído humano no percibe, se llaman…', ['Ultrasónicos', 'Infrasónicos', 'Graves', 'Electromagnéticos']],
    ['Cuando una onda choca con una barrera y regresa (como el eco), se llama…', ['Reflexión', 'Refracción', 'Difracción', 'Amplitud']]
  ];
  function genOndConc() {
    const [q, opts] = pick(OND);
    return mcItem('f_ond_conc', `<p>${q}</p>`, opts, [null, 'F_OND', 'F_OND', 'F_OND'], `<p>Respuesta: <b>${opts[0]}</b>.</p>`);
  }
  function genOndTF() {
    if (Math.random() < 0.5) {
      const f = pick([2, 4, 5, 10, 20, 50, 100, 261.63, 440, 1000]); const T = 1 / f;
      const ctx = f >= 200 ? `Una nota musical tiene una frecuencia de ${fmt(f)} Hz.` : `Una cuerda vibra ${fmt(f)} veces por segundo (${fmt(f)} Hz).`;
      return { type: 'num', unit: 's', prompt: `<p>${ctx} ¿Cuál es su periodo?</p>`, answerText: show(T) + ' s',
        solution: `<p class="mono">T = ${frac('1', 'f')} = ${frac('1', fmt(f) + ' Hz')} = <b>${show(T)} s</b></p><p class="small muted">Frecuencia grande → periodo chico.</p>`,
        check: numCheck(T, [{ v: f, err: 'F_TF' }], { round: false }) };
    }
    const T = pick([0.5, 0.25, 0.1, 2, 4, 5, 8, 0.02]); const f = 1 / T;
    return { type: 'num', unit: 'Hz', prompt: `<p>Entre una cresta y la siguiente de una ola pasan ${fmt(T)} s (periodo). ¿Cuál es su frecuencia?</p>`, answerText: show(f) + ' Hz',
      solution: `<p class="mono">f = ${frac('1', 'T')} = ${frac('1', fmt(T) + ' s')} = <b>${show(f)} Hz</b></p>`,
      check: numCheck(f, [{ v: T, err: 'F_TF' }], { round: false }) };
  }
  function genOndSnd() {
    const med = pick([['el aire', 340], ['el aire', 340], ['el agua', 1482], ['el acero', 5200], ['la madera', 4000]]);
    if (med[0] === 'el aire' && Math.random() < 0.6) {
      const t = R(2, 12); const d = med[1] * t;
      const askU = pick(['m', 'km']); const ans = fromSI(d, askU);
      return { type: 'num', unit: askU, prompt: `<p>Ves un relámpago y escuchas el trueno ${t} s después. Si el sonido viaja a ${med[1]} m/s en ${med[0]}, ¿a qué distancia <b>(${askU})</b> cayó el rayo?</p>`, answerText: show(ans) + ' ' + askU,
        solution: sol({ datos: `<p>v = ${med[1]} m/s<br>t = ${t} s</p>`, formula: '<p class="mono">d = v · t</p>', sust: `<p class="mono">d = (${med[1]})(${t}) = ${fmt(d)} m</p>`, res: `<p><b>${show(ans)} ${askU}</b></p>`, check: 'Truco: cada 3 segundos ≈ 1 km.' }),
        check: numCheck(ans, [{ v: fromSI(med[1] / t, askU), err: 'F_DESP' }, { v: fromSI(t / med[1], askU), err: 'F_DESP' }, ...(askU !== 'm' ? [{ v: d, err: 'F_OUT' }] : [])]) };
    }
    const d = R(5, 60) * 100; const t = d / med[1];
    return { type: 'num', unit: 's', prompt: `<p>¿Cuánto tarda el sonido en recorrer ${fmt(d)} m en ${med[0]}, donde viaja a ${fmt(med[1])} m/s?</p>`, answerText: show(t) + ' s',
      solution: sol({ datos: `<p>d = ${fmt(d)} m<br>v = ${fmt(med[1])} m/s</p>`, formula: `<p class="mono">t = ${frac('d', 'v')}</p>`, sust: `<p class="mono">t = ${frac(fmt(d), fmt(med[1]))}</p>`, res: `<p><b>${show(t)} s</b></p>`, check: 'En sólidos el sonido es más rápido, así que tarda menos.' }),
      check: numCheck(t, [{ v: d * med[1], err: 'F_DESP' }, { v: med[1] / d, err: 'F_DESP' }]) };
  }

  /* ---------- registro ---------- */
  const SUBS = {
    f_r3: { topic: 'f_regla3', name: 'Regla de tres', gen: genR3 },
    f_hmin: { topic: 'f_regla3', name: 'Horas, minutos y segundos', gen: genHMin },
    f_fu: { topic: 'f_conv', name: 'Velocidades con factor unitario', gen: genFU },
    f_desp_vdt: { topic: 'f_despeje', name: 'Despeje: d, v y t', gen: genDespVDT },
    f_desp_acel: { topic: 'f_despeje', name: 'Despeje: aceleración', gen: genDespAcel },
    f_v: { topic: 'f_vel', name: 'Calcular la velocidad', gen: () => genMRU('v') },
    f_d: { topic: 'f_vel', name: 'Calcular la distancia', gen: () => genMRU('d') },
    f_t: { topic: 'f_vel', name: 'Calcular el tiempo', gen: () => genMRU('t') },
    f_a: { topic: 'f_acel', name: 'Calcular la aceleración', gen: () => genAccel('a') },
    f_vf: { topic: 'f_acel', name: 'Velocidad final', gen: () => genAccel('vf') },
    f_vi: { topic: 'f_acel', name: 'Velocidad inicial', gen: () => genAccel('vi') },
    f_ta: { topic: 'f_acel', name: 'Tiempo con aceleración', gen: () => genAccel('t') },
    f_ond_conc: { topic: 'f_ondas', name: 'Conceptos de ondas', gen: genOndConc },
    f_ond_tf: { topic: 'f_ondas', name: 'Frecuencia y periodo', gen: genOndTF },
    f_ond_snd: { topic: 'f_ondas', name: 'Velocidad del sonido', gen: genOndSnd }
  };
  const DIAG = ['f_r3', 'f_hmin', 'f_fu', 'f_desp_vdt', 'f_desp_acel', 'f_v', 'f_t', 'f_d', 'f_a', 'f_vf'];
  const SIM = { f_conv: ['f_r3', 'f_hmin', 'f_fu', 'f_fu'], f_vel: ['f_v', 'f_d', 'f_t', 'f_t'], f_acel: ['f_a', 'f_vf', 'f_vi', 'f_ta'] };

  global.Brujula.addExercises('fis', { ERR, SUBS });
  global.Brujula.subject('fis', { diag: DIAG, sim: SIM });
  global.FisKit = { show, U, toSI, fromSI, FU, fuChainHTML, frac, sol, convLine };
})(typeof window !== 'undefined' ? window : globalThis);
