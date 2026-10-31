/* Brújula — generadores de reactivos y detección de errores */
(function (global) {
  'use strict';
  const M = '−';
  const R = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sgn = () => (Math.random() < 0.5 ? -1 : 1);
  const round = (x, d = 10) => { const f = Math.pow(10, d); return Math.round(x * f) / f; };
  const eqRel = (a, b, tol = 1e-9) => {
    if (typeof a !== 'number' || typeof b !== 'number' || isNaN(a) || isNaN(b)) return false;
    if (a === b) return true;
    const d = Math.abs(a - b), s = Math.max(Math.abs(a), Math.abs(b));
    return d <= tol * s;
  };

  /* ---------- formato ---------- */
  const groupInt = (s) => { const [i, f] = s.split('.'); const g = i.replace(/\B(?=(\d{3})+(?!\d))/g, ','); return f !== undefined ? g + '.' + f : g; };
  function fmt(n) {
    if (Object.is(n, -0)) n = 0;
    n = round(n, 10);
    const neg = n < 0;
    const s = Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 10 });
    return (neg ? M : '') + s;
  }
  // número entre paréntesis como lo escribe la maestra: ( −8 )
  const par = (n) => '(' + fmt(n) + ')';
  const sup = (e) => '<sup>' + (typeof e === 'number' ? fmt(e) : e) + '</sup>';
  const pw = (b, e) => (e === 1 ? b : b + sup(e));
  const nc = (c, e) => fmt(c) + ' × 10' + sup(e);

  // Corre el punto decimal de una cadena positiva k lugares (k>0 derecha). Exacto.
  function shiftDec(s, k) {
    let [i, f = ''] = String(s).split('.');
    let digits = i + f; let pos = i.length + k;
    if (pos <= 0) { digits = '0'.repeat(1 - pos) + digits; pos = 1; }
    if (pos > digits.length) digits = digits + '0'.repeat(pos - digits.length);
    const ip = digits.slice(0, pos).replace(/^0+(?=\d)/, '');
    const fp = digits.slice(pos).replace(/0+$/, '');
    return fp ? ip + '.' + fp : ip;
  }

  function parseNum(raw) {
    if (raw === null || raw === undefined) return NaN;
    let s = String(raw).trim().replace(/[−–—]/g, '-').replace(/\s+/g, '');
    if (!s) return NaN;
    if (s.includes(',') && s.includes('.')) s = s.replace(/,/g, '');
    else if (s.includes(',')) {
      if (/^[+-]?\d{1,3}(,\d{3})+$/.test(s)) s = s.replace(/,/g, '');
      else s = s.replace(',', '.');
    }
    if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
    return parseFloat(s);
  }
  const parseIntSafe = (raw) => { const v = parseNum(raw); return Number.isInteger(v) ? v : NaN; };

  /* ---------- catálogo de errores ---------- */
  const ERR = {
    ABS_SUM: { t: 'Sumaste sin signos', m: 'Sumaste los números como si todos fueran positivos. Primero quita los paréntesis (decide el signo de cada número) y después agrupa positivos y negativos.', lens: 'signos-quitar' },
    MINUS_NEG: { t: 'Menos de un negativo', m: 'Cuando hay un menos antes de un número negativo, los dos signos se vuelven más: −(−8) = +8.', lens: 'enteros-var' },
    OP_IGNORED: { t: 'El signo de afuera también cuenta', m: 'El signo antes del paréntesis cambia al número: −(+6) = −6 y −(−6) = +6.', lens: 'signos-quitar' },
    SIGN_FLIP: { t: 'El número está bien, el signo no', m: 'La cantidad es correcta, pero el signo quedó al revés. El resultado lleva el signo del grupo que pesa más (positivos o negativos).', lens: 'signos-quitar' },
    MULT_SIGN: { t: 'Signo del resultado', m: 'Cuenta los factores negativos: si son pares, el resultado es positivo; si son impares, negativo.', lens: 'signos-mult' },
    ARITH: { t: 'Casi', m: 'El procedimiento va bien. Revisa la cuenta final (alinea los puntos si hay decimales).', lens: 'signos-decimales' },
    IMPL1: { t: 'La letra sola tiene exponente 1', m: 'k es lo mismo que k¹. Ese 1 también cuenta al sumar, restar o multiplicar exponentes.', lens: 'exp-uno' },
    PROD_MULT: { t: 'En la multiplicación se suman', m: 'Al multiplicar potencias de la misma base, los exponentes se suman, no se multiplican.', lens: 'exp-expand' },
    POT_SUM: { t: 'Potencia de potencia: se multiplican', m: '(a³)⁴ es a³ cuatro veces: a³·a³·a³·a³ = a¹². Los exponentes se multiplican.', lens: 'exp-expand' },
    QUOT_ORDER: { t: 'Arriba menos abajo', m: 'En la división el exponente es el de arriba menos el de abajo. Si abajo hay más, el resultado es negativo.', lens: 'exp-tachar' },
    QUOT_ADD: { t: 'En la división se restan', m: 'Al dividir potencias de la misma base, los exponentes se restan: arriba menos abajo.', lens: 'exp-tachar' },
    NEG_FRAC: { t: 'Al bajar, el menos desaparece', m: 'h⁻⁵ = 1/h⁵. El exponente negativo significa “va al otro piso”; una vez abajo ya no lleva el menos.', lens: 'exp-neg' },
    NEG_NUM: { t: 'Exponente negativo no es número negativo', m: 'h⁻⁵ no es −h⁵. El exponente negativo no cambia el signo; manda la potencia al denominador.', lens: 'exp-neg' },
    ZERO: { t: 'Exponente cero', m: 'Todo número (distinto de 0) elevado a la 0 vale 1. Por ejemplo m⁴/m⁴ = 1.', lens: 'exp-patron' },
    SQ_SIGN: { t: '¿El signo está dentro de la potencia?', m: 'En −3² solo el 3 se eleva: −(3·3) = −9. En (−3)² el paréntesis incluye el signo: (−3)(−3) = 9.', lens: 'exp-signo' },
    POW_MULT: { t: 'Elevar no es multiplicar por el exponente', m: '3⁴ = 3·3·3·3 = 81, no 3·4 = 12.', lens: 'exp-def' },
    DIR_PUNTO: { t: 'El punto se movió al revés', m: 'Multiplicar por 10, 100, 1000… hace más grande el número: el punto va a la derecha. Dividir lo hace más chico: va a la izquierda.', lens: 'pos-punto' },
    COUNT: { t: 'Un lugar de más o de menos', m: 'Cuenta saltos del punto, no ceros. Cada salto es un lugar.', lens: 'pos-punto' },
    NC_SIGN: { t: 'Signo del exponente', m: 'Número grande (10 o más) → exponente positivo. Número chiquito (empieza con 0.) → exponente negativo.', lens: 'nc-grande' },
    NC_NORM: { t: 'Falta acomodar el coeficiente', m: 'El valor es correcto, pero en notación científica el primer número va entre 1 y 10: una sola cifra (que no sea cero) antes del punto.', lens: 'nc-norm' },
    NC_COUNT: { t: 'Revisa cuántos saltos', m: 'El coeficiente está bien; el exponente quedó con un lugar de más o de menos. Cuenta saltos del punto, no ceros.', lens: 'nc-grande' },
    NC_EXP: { t: 'Revisa el exponente', m: 'El coeficiente está bien, pero el exponente no. Cuenta los saltos del punto y decide el signo: grande → +, chiquito → −.', lens: 'nc-grande' },
    NC_COEF: { t: 'Revisa el coeficiente', m: 'Las cifras deben ser las mismas del número original; solo cambia dónde va el punto.', lens: 'nc-grande' },
    NC_DIR: { t: 'El punto se movió al revés', m: 'Exponente positivo → número grande → punto a la derecha. Exponente negativo → número chiquito → punto a la izquierda.', lens: 'nc-grande' },
    NC_MULT_EXP: { t: 'Al multiplicar, los exponentes se suman', m: 'Coeficiente por coeficiente; los exponentes de 10 se suman (no se multiplican).', lens: 'nc-ops' },
    NC_DIV_INV: { t: 'El orden de la división', m: 'Divide el de arriba entre el de abajo, aunque el de arriba sea más chico. Si sale menor que 1 (como 0.25), después lo acomodas.', lens: 'nc-ops' },
    NC_DIV_EXP: { t: 'Al dividir, los exponentes se restan', m: 'Exponente de arriba menos exponente de abajo.', lens: 'nc-ops' },
    NC_EXP_SIGN: { t: 'Cuenta con exponentes negativos', m: 'Cuidado con los signos al operar exponentes: −6 − (−2) = −6 + 2 = −4. Es la misma regla de los signos.', lens: 'enteros-var' },
    NC_SUM_NOEQ: { t: 'Primero iguala los exponentes', m: 'Solo puedes sumar coeficientes cuando las potencias de 10 son iguales. Iguala primero, o pasa ambos a número normal, suma y regresa.', lens: 'nc-suma' },
    INVALID: { t: 'Respuesta incompleta', m: 'Escribe un número en cada casilla.', lens: null },
    GENERIC: { t: 'Todavía no', m: 'Revisa la solución paso a paso.', lens: null }
  };
  const ok = (note) => ({ ok: true, err: null, note: note || null });
  const bad = (err) => ({ ok: false, err });

  /* ---------- SIGNOS: suma y resta ---------- */
  // terms: [{op:'+'|'-'|null, v:Number, p:bool(paréntesis)}]
  function sumInfo(terms) {
    let correct = 0, abs = 0, minusNeg = 0, opIgn = 0, hasMN = false;
    terms.forEach((t) => {
      const s = t.op === '-' ? -1 : 1;
      correct += s * t.v; abs += Math.abs(t.v);
      if (t.op === '-' && t.v < 0) { minusNeg += t.v; hasMN = true; } else minusNeg += s * t.v;
      opIgn += t.p ? t.v : s * t.v;
    });
    return { correct: round(correct, 6), abs: round(abs, 6), minusNeg: hasMN ? round(minusNeg, 6) : null, opIgn: round(opIgn, 6) };
  }
  function renderTerms(terms) {
    return terms.map((t, i) => {
      const op = t.op === '-' ? ' ' + M + ' ' : (i === 0 ? '' : ' + ');
      if (t.p) return op + par(t.v);
      // sin paréntesis: el signo del número es el operador
      if (i === 0) return (t.v < 0 ? M : '') + fmt(Math.abs(t.v));
      return (t.v < 0 ? ' ' + M + ' ' : ' + ') + fmt(Math.abs(t.v));
    }).join('');
  }
  function noParenSteps(terms) {
    // reescritura sin paréntesis
    const eff = terms.map((t) => (t.op === '-' ? -t.v : t.v));
    return { eff, text: eff.map((v, i) => (i === 0 ? fmt(v) : (v < 0 ? ' ' + M + ' ' + fmt(-v) : ' + ' + fmt(v)))).join('') };
  }
  function groupSteps(eff) {
    const pos = round(eff.filter((v) => v > 0).reduce((a, b) => a + b, 0), 6);
    const neg = round(eff.filter((v) => v < 0).reduce((a, b) => a + b, 0), 6);
    return { pos, neg, res: round(pos + neg, 6) };
  }
  function checkSum(input, info) {
    const v = parseNum(input.v);
    if (isNaN(v)) return bad('INVALID');
    if (eqRel(v, info.correct) || (info.correct === 0 && v === 0)) return ok();
    if (info.abs !== Math.abs(info.correct) && eqRel(Math.abs(v), info.abs)) return bad('ABS_SUM');
    if (info.minusNeg !== null && info.minusNeg !== info.correct && eqRel(v, info.minusNeg)) return bad('MINUS_NEG');
    if (info.opIgn !== info.correct && eqRel(v, info.opIgn)) return bad('OP_IGNORED');
    if (info.correct !== 0 && eqRel(v, -info.correct)) return bad('SIGN_FLIP');
    if (Math.abs(v - info.correct) <= Math.max(2, Math.abs(info.correct) * 0.1) && Math.sign(v) === Math.sign(info.correct)) return bad('ARITH');
    return bad('GENERIC');
  }
  function sumItem(skill, sub, terms, intro) {
    const info = sumInfo(terms);
    const hasPar = terms.some((t) => t.p);
    const np = noParenSteps(terms);
    const g = groupSteps(np.eff);
    let sol = '';
    if (hasPar) sol += '<p><b>1. Quita los paréntesis</b> (signos iguales → +, diferentes → −):</p><p class="mono">' + np.text + '</p>';
    sol += '<p><b>' + (hasPar ? '2' : '1') + '. Agrupa:</b> positivos = ' + fmt(g.pos) + ' · negativos = ' + fmt(g.neg) + '</p>';
    sol += '<p><b>' + (hasPar ? '3' : '2') + '. Resta y pon el signo del grupo mayor:</b> ' + fmt(g.pos) + ' ' + M + ' ' + fmt(Math.abs(g.neg)) + ' = <b>' + fmt(info.correct) + '</b></p>';
    return {
      skill, sub, type: 'num',
      prompt: (intro ? '<p class="ctx">' + intro + '</p>' : '') + '<p class="expr">' + renderTerms(terms) + ' = ?</p>',
      answerText: fmt(info.correct), solution: sol,
      check: (inp) => checkSum(inp, info)
    };
  }
  function genCadena() {
    const n = R(4, 6), terms = [];
    for (let i = 0; i < n; i++) terms.push({ op: null, v: R(1, 20) * sgn(), p: false });
    return sumItem('signos', 'cadena', terms);
  }
  function parenTerms(n, decimals) {
    const terms = [];
    for (let i = 0; i < n; i++) {
      const mag = decimals ? R(5, 160) / 10 : R(1, 20);
      terms.push({ op: i === 0 ? null : (Math.random() < 0.5 ? '-' : '+'), v: mag * sgn(), p: true });
    }
    // garantiza al menos un "− (negativo)"
    if (!terms.some((t) => t.op === '-' && t.v < 0)) { const t = terms[R(1, n - 1)]; t.op = '-'; t.v = -Math.abs(t.v); }
    return terms;
  }
  const genParentesis = () => sumItem('signos', 'parentesis', parenTerms(R(4, 5), false));
  const genDecimales = () => {
    const terms = parenTerms(R(4, 5), false).map((t) => ({ ...t, v: round(Math.sign(t.v) * R(5, 160) / 10, 1) }));
    if (!terms.some((t) => t.op === '-' && t.v < 0)) { terms[1].op = '-'; terms[1].v = -Math.abs(terms[1].v); }
    return sumItem('signos', 'decimales', terms);
  };
  function genMenosNeg() {
    const a = R(2, 15), b = R(2, 15);
    const pattern = pick(['a-(-b)', '-a-(-b)', '(-a)-(b)', 'a-(-b)+(-c)', '(-a)-(-b)-(c)']);
    let terms;
    switch (pattern) {
      case 'a-(-b)': terms = [{ op: null, v: a, p: true }, { op: '-', v: -b, p: true }]; break;
      case '-a-(-b)': terms = [{ op: null, v: -a, p: true }, { op: '-', v: -b, p: true }]; break;
      case '(-a)-(b)': terms = [{ op: null, v: -a, p: true }, { op: '-', v: b, p: true }]; break;
      case 'a-(-b)+(-c)': terms = [{ op: null, v: a, p: true }, { op: '-', v: -b, p: true }, { op: '+', v: -R(2, 15), p: true }]; break;
      default: terms = [{ op: null, v: -a, p: true }, { op: '-', v: -b, p: true }, { op: '-', v: R(2, 15), p: true }];
    }
    const ctx = Math.random() < 0.35 ? 'Marcador: cada número es una diferencia de goles. Un “menos” anula lo que está dentro del paréntesis.' : null;
    return sumItem('enteros', 'menosneg', terms, ctx);
  }
  const genEnterosParen = () => { const it = sumItem('enteros', 'parentesis', parenTerms(R(3, 4), false)); return it; };

  function genMultDiv() {
    const n = R(3, 4); const f = [];
    for (let i = 0; i < n; i++) f.push(R(1, 9) * sgn());
    if (f.every((x) => x > 0)) f[R(0, n - 1)] *= -1;
    let P = f.reduce((a, b) => a * b, 1);
    let d = null;
    if (Math.random() < 0.5) {
      const cands = [2, 3, 4, 5, 6].filter((x) => P % x === 0);
      if (cands.length) { d = pick(cands) * sgn(); P = P / d; }
    }
    const negs = f.filter((x) => x < 0).length + (d !== null && d < 0 ? 1 : 0);
    const prompt = '<p class="expr">' + f.map(par).join('') + (d !== null ? ' ÷ ' + par(d) : '') + ' = ?</p>';
    const sol = '<p><b>1. Signo:</b> hay ' + negs + ' negativo' + (negs === 1 ? '' : 's') + ' → ' + (negs % 2 === 0 ? 'par → positivo' : 'impar → negativo') + '.</p>' +
      '<p><b>2. Números sin signo:</b> ' + f.map((x) => Math.abs(x)).join(' × ') + (d !== null ? ' ÷ ' + Math.abs(d) : '') + ' = ' + Math.abs(P) + '</p>' +
      '<p><b>Resultado:</b> ' + fmt(P) + '</p>';
    return {
      skill: 'signos', sub: 'multdiv', type: 'num', prompt, answerText: fmt(P), solution: sol,
      check: (inp) => {
        const v = parseNum(inp.v); if (isNaN(v)) return bad('INVALID');
        if (v === P) return ok();
        if (v === -P) return bad('MULT_SIGN');
        return bad('GENERIC');
      }
    };
  }

  /* ---------- VALOR POSICIONAL ---------- */
  function genMult10() {
    const base = String(round(R(11, 9999) / Math.pow(10, R(1, 3)), 3));
    const k = R(1, 4); const mult = Math.random() < 0.5;
    const pow = '1' + '0'.repeat(k);
    const ansStr = shiftDec(base, mult ? k : -k);
    const ans = parseNum(ansStr);
    const wrongDir = parseNum(shiftDec(base, mult ? -k : k));
    const offs = [parseNum(shiftDec(base, (mult ? k : -k) + 1)), parseNum(shiftDec(base, (mult ? k : -k) - 1))];
    const ctx = Math.random() < 0.3 ? (mult ? 'Una fábrica de chocolate empaca cajas iguales. Calcula:' : 'Se reparte en partes iguales. Calcula:') : null;
    return {
      skill: 'posicional', sub: 'mult10', type: 'num',
      prompt: (ctx ? '<p class="ctx">' + ctx + '</p>' : '') + '<p class="expr">' + groupInt(base) + (mult ? ' × ' : ' ÷ ') + groupInt(pow) + ' = ?</p>',
      answerText: groupInt(ansStr),
      solution: '<p>' + groupInt(pow) + ' tiene ' + k + ' cero' + (k > 1 ? 's' : '') + ' → el punto salta <b>' + k + '</b> lugar' + (k > 1 ? 'es' : '') + ' a la ' + (mult ? '<b>derecha</b> (multiplicar agranda)' : '<b>izquierda</b> (dividir achica)') + '.</p><p>' + groupInt(base) + ' → <b>' + groupInt(ansStr) + '</b></p>',
      check: (inp) => {
        const v = parseNum(inp.v); if (isNaN(v)) return bad('INVALID');
        if (eqRel(v, ans)) return ok();
        if (eqRel(v, wrongDir)) return bad('DIR_PUNTO');
        if (offs.some((o) => eqRel(v, o))) return bad('COUNT');
        return bad('GENERIC');
      }
    };
  }

  /* ---------- EXPONENTE (fundacional) ---------- */
  const LET = ['a', 'b', 'd', 'h', 'k', 'm', 'n', 'p', 'w', 'x', 'y', 't'];
  function expFieldsItem(skill, sub, prompt, letters, answers, solution, detect) {
    return {
      skill, sub, type: 'exp', prompt, fields: letters, correct: { e: answers.map(String) }, answerText: letters.map((l, i) => pw(l, answers[i])).join(''), answerHtml: true, solution,
      check: (inp) => {
        const vals = (inp.e || []).map(parseIntSafe);
        if (vals.length !== letters.length || vals.some((v) => isNaN(v))) return bad('INVALID');
        if (vals.every((v, i) => v === answers[i])) return ok();
        return bad((detect && detect(vals)) || 'GENERIC');
      }
    };
  }
  function genExpand() {
    const [A, B] = shuffle(LET).slice(0, 2);
    const na = R(2, 6); const nb = Math.random() < 0.5 ? 1 : R(2, 4);
    const seq = shuffle(Array(na).fill(A).concat(Array(nb).fill(B)));
    return expFieldsItem('exponente', 'expand',
      '<p>Escribe como potencia:</p><p class="expr">' + seq.join(' · ') + '</p>', [A, B], [na, nb],
      '<p>Cuenta cuántas veces aparece cada letra: ' + A + ' aparece ' + na + ' veces, ' + B + ' aparece ' + nb + (nb === 1 ? ' vez (exponente 1, que no se escribe)' : ' veces') + '.</p><p>Resultado: <b>' + pw(A, na) + pw(B, nb) + '</b></p>',
      (vals) => (nb === 1 && vals[1] === 0 ? 'IMPL1' : null));
  }
  function genSignoBase() {
    const a = R(2, 5), n = pick([2, 2, 3, 4]);
    const withPar = Math.random() < 0.5;
    const val = withPar ? Math.pow(-a, n) : -Math.pow(a, n);
    const prompt = '<p class="expr">' + (withPar ? '(' + M + a + ')' + sup(n) : M + a + sup(n)) + ' = ?</p>';
    const sol = withPar
      ? '<p>El paréntesis incluye el signo: se multiplica (' + M + a + ') ' + n + ' veces.</p><p>' + Array(n).fill('(' + M + a + ')').join('') + ' = <b>' + fmt(val) + '</b> (' + (n % 2 ? 'impar → negativo' : 'par → positivo') + ')</p>'
      : '<p>Sin paréntesis, el exponente solo toma al ' + a + '. El menos se queda afuera.</p><p>' + M + '(' + Array(n).fill(a).join('·') + ') = <b>' + fmt(val) + '</b></p>';
    return {
      skill: 'exponente', sub: 'signobase', type: 'num', prompt, answerText: fmt(val), solution: sol,
      check: (inp) => {
        const v = parseNum(inp.v); if (isNaN(v)) return bad('INVALID');
        if (v === val) return ok();
        if (v === -val) return bad('SQ_SIGN');
        if (Math.abs(v) === a * n) return bad('POW_MULT');
        return bad('GENERIC');
      }
    };
  }

  /* ---------- LEYES DE EXPONENTES ---------- */
  const fac = (L, e) => '(' + pw(L, e) + ')';
  function genProducto() {
    const L = pick(LET); const n = R(2, 4);
    const es = []; for (let i = 0; i < n; i++) es.push(R(2, 9));
    let ones = 0; if (Math.random() < 0.75) { es[R(0, n - 1)] = 1; ones = 1; }
    const sum = es.reduce((a, b) => a + b, 0);
    const prodE = es.reduce((a, b) => a * b, 1);
    return expFieldsItem('exponentes', 'producto', '<p>Responde en forma de potencia:</p><p class="expr">' + es.map((e) => fac(L, e)).join('') + '</p>', [L], [sum],
      '<p>Misma base, multiplicación → <b>se suman</b> los exponentes' + (ones ? ' (la ' + L + ' sola vale ' + L + '¹)' : '') + '.</p><p>' + es.join(' + ') + ' = ' + sum + ' → <b>' + pw(L, sum) + '</b></p>',
      (v) => (ones && v[0] === sum - ones ? 'IMPL1' : v[0] === prodE ? 'PROD_MULT' : null));
  }
  function genCociente() {
    const L = pick(LET);
    const top = Math.random() < 0.5 ? [R(2, 9)] : [R(1, 8), R(2, 8)];
    const bot = Math.random() < 0.6 ? [R(2, 12)] : [R(1, 6), R(2, 7)];
    const st = top.reduce((a, b) => a + b, 0), sb = bot.reduce((a, b) => a + b, 0);
    if (st === sb) bot[0] += 1;
    const sb2 = bot.reduce((a, b) => a + b, 0);
    const ans = st - sb2;
    const ones = top.filter((e) => e === 1).length + bot.filter((e) => e === 1).length;
    const pr = '<p>Responde en forma de potencia:</p><div class="frac expr"><span>' + top.map((e) => fac(L, e)).join('') + '</span><span>' + bot.map((e) => fac(L, e)).join('') + '</span></div>';
    return expFieldsItem('exponentes', 'cociente', pr, [L], [ans],
      '<p>Arriba: ' + top.join(' + ') + ' = ' + st + ' · Abajo: ' + bot.join(' + ') + ' = ' + sb2 + '</p><p>División → <b>arriba menos abajo</b>: ' + st + ' ' + M + ' ' + sb2 + ' = ' + fmt(ans) + ' → <b>' + pw(L, ans) + '</b>' + (ans < 0 ? ' (también se escribe 1/' + pw(L, -ans) + ')' : '') + '</p>',
      (v) => {
        if (v[0] === sb2 - st) return 'QUOT_ORDER';
        if (v[0] === st + sb2) return 'QUOT_ADD';
        if (ones) {
          const t1 = top.filter((e) => e !== 1).reduce((a, b) => a + b, 0), b1 = bot.filter((e) => e !== 1).reduce((a, b) => a + b, 0);
          if (v[0] === t1 - b1) return 'IMPL1';
        }
        return null;
      });
  }
  function genPotPot() {
    const L = pick(LET); const m = R(2, 9), n = R(2, 9);
    const ctx = Math.random() < 0.25 ? '<p class="ctx">Una poción se duplica en capas: escribe el resultado como potencia.</p>' : '';
    return expFieldsItem('exponentes', 'potpot', ctx + '<p class="expr">(' + pw(L, m) + ')' + sup(n) + '</p>', [L], [m * n],
      '<p>Potencia de una potencia → <b>se multiplican</b>: ' + m + ' × ' + n + ' = ' + (m * n) + ' → <b>' + pw(L, m * n) + '</b></p>',
      (v) => (v[0] === m + n ? 'POT_SUM' : null));
  }
  function genPotProd() {
    const k = R(2, 3); const ls = shuffle(LET).slice(0, k);
    const es = ls.map(() => R(2, 6)); const oneIdx = Math.random() < 0.7 ? R(0, k - 1) : -1;
    if (oneIdx >= 0) es[oneIdx] = 1;
    const n = R(2, 5);
    const ans = es.map((e) => e * n);
    return expFieldsItem('exponentes', 'potprod', '<p>Calcula:</p><p class="expr">(' + ls.map((l, i) => pw(l, es[i])).join('') + ')' + sup(n) + '</p>', ls, ans,
      '<p>El exponente de afuera <b>se reparte</b> a cada letra y se multiplica:</p><p>' + ls.map((l, i) => l + ': ' + es[i] + ' × ' + n + ' = ' + ans[i]).join(' · ') + '</p><p><b>' + ls.map((l, i) => pw(l, ans[i])).join('') + '</b></p>',
      (v) => {
        if (oneIdx >= 0 && (v[oneIdx] === 1 || v[oneIdx] === 0) && v.every((x, i) => i === oneIdx || x === ans[i])) return 'IMPL1';
        if (v.some((x, i) => x === es[i] + n && es[i] * n !== es[i] + n)) return 'POT_SUM';
        return null;
      });
  }
  function genMixto() {
    const L = pick(LET);
    if (Math.random() < 0.5) {
      const a = R(2, 7), b = R(2, 4), c = R(2, 6), d = R(2, 8);
      const ans = a * b - (c + d + 1);
      const pr = '<p>Responde en forma de potencia:</p><div class="frac expr"><span>(' + pw(L, a) + ')' + sup(b) + '</span><span>' + fac(L, c) + fac(L, d) + '(' + L + ')</span></div>';
      return expFieldsItem('exponentes', 'mixto', pr, [L], [ans],
        '<p>Arriba: (' + pw(L, a) + ')' + sup(b) + ' → ' + a + ' × ' + b + ' = ' + (a * b) + '</p><p>Abajo: ' + c + ' + ' + d + ' + <b>1</b> = ' + (c + d + 1) + ' (la ' + L + ' sola vale ' + L + '¹)</p><p>' + (a * b) + ' ' + M + ' ' + (c + d + 1) + ' = <b>' + pw(L, ans) + '</b></p>',
        (v) => (v[0] === a * b - (c + d) ? 'IMPL1' : v[0] === (c + d + 1) - a * b ? 'QUOT_ORDER' : v[0] === a + b - (c + d + 1) ? 'POT_SUM' : null));
    }
    const t = [1, R(2, 7), R(2, 6)], bo = [1, R(2, 5)];
    const st = t[0] + t[1] + t[2], sb = bo[0] + bo[1]; const ans = st - sb;
    const pr = '<p>Responde en forma de potencia:</p><div class="frac expr"><span>' + t.map((e) => fac(L, e)).join('') + '</span><span>' + bo.map((e) => fac(L, e)).join('') + '</span></div>';
    return expFieldsItem('exponentes', 'mixto', pr, [L], [ans],
      '<p>Arriba: 1 + ' + t[1] + ' + ' + t[2] + ' = ' + st + ' · Abajo: 1 + ' + bo[1] + ' = ' + sb + '</p><p>' + st + ' ' + M + ' ' + sb + ' = <b>' + pw(L, ans) + '</b></p>',
      (v) => (v[0] === (st - 1) - (sb - 1) && false ? 'IMPL1' : v[0] === sb - st ? 'QUOT_ORDER' : v[0] === (st - 1) - sb || v[0] === st - (sb - 1) ? 'IMPL1' : null));
  }
  function mcItem(skill, sub, prompt, options, correctIdx, errs, solution) {
    // options: html strings; errs: array of error codes per option (null for correct)
    const order = shuffle(options.map((_, i) => i));
    return {
      skill, sub, type: 'mc', prompt, options: order.map((i) => options[i]), correct: { choice: order.indexOf(correctIdx) }, answerText: options[correctIdx], answerHtml: true, solution,
      check: (inp) => {
        if (inp.choice === undefined || inp.choice === null) return bad('INVALID');
        const orig = order[inp.choice];
        if (orig === correctIdx) return ok();
        return bad(errs[orig] || 'GENERIC');
      }
    };
  }
  const fr = (n, d) => '<span class="ifrac"><span>' + n + '</span><span>' + d + '</span></span>';
  function genNegativo() {
    const L = pick(LET), n = R(2, 9);
    if (Math.random() < 0.6) {
      return mcItem('exponentes', 'negativo', '<p>Escribe en forma de fracción:</p><p class="expr">' + pw(L, -n) + ' = ?</p>',
        [fr(1, pw(L, n)), fr(1, pw(L, -n)), M + pw(L, n), pw(L, n)], 0, [null, 'NEG_FRAC', 'NEG_NUM', 'NEG_FRAC'],
        '<p>El exponente negativo manda la potencia al denominador y <b>ahí se vuelve positivo</b>: ' + pw(L, -n) + ' = ' + fr(1, pw(L, n)) + '</p>');
    }
    return mcItem('exponentes', 'negativo', '<p>Escribe con exponente:</p><p class="expr">' + fr(1, pw(L, n)) + ' = ?</p>',
      [pw(L, -n), M + pw(L, n), pw(L, n), fr(1, pw(L, -n))], 0, [null, 'NEG_NUM', 'NEG_FRAC', 'NEG_FRAC'],
      '<p>Para subir la potencia del denominador, su exponente cambia de signo: ' + fr(1, pw(L, n)) + ' = <b>' + pw(L, -n) + '</b></p>');
  }
  function genCero() {
    const L = pick(LET), n = R(2, 9);
    const asFrac = Math.random() < 0.5;
    const pr = asFrac ? '<p class="expr">' + fr(pw(L, n), pw(L, n)) + ' = ?</p>' : '<p class="expr">' + pw(L, 0) + ' = ?</p>';
    return mcItem('exponentes', 'cero', pr, ['1', '0', L, asFrac ? pw(L, n) : M + '1'], 0, [null, 'ZERO', 'ZERO', 'ZERO'],
      '<p>' + (asFrac ? n + ' ' + M + ' ' + n + ' = 0 → ' + pw(L, 0) + ' = ' : '') + 'Todo número distinto de cero elevado a la 0 vale <b>1</b>. (Algo dividido entre sí mismo es 1.)</p>');
  }

  /* ---------- NOTACIÓN CIENTÍFICA ---------- */
  function coefStr() {
    const extra = R(0, 3); let s = String(R(1, 9));
    if (extra) { let d = ''; for (let i = 0; i < extra; i++) d += R(0, 9); d = d.replace(/0+$/, ''); if (d) s += '.' + d; }
    return s;
  }
  const NC_CTX_BIG = [
    'Una canción acumuló esta cantidad de reproducciones:', 'Una fábrica de chocolate produjo en un año esta cantidad de barras:',
    'Distancia en kilómetros entre dos planetas:', 'Número aproximado de aficionados que vieron un torneo por televisión:', 'Granos de arena en una playa (estimado):'
  ];
  const NC_CTX_SMALL = [
    'Grosor en metros de una hoja de papel muy delgada:', 'Tamaño en metros de una célula:', 'Masa en gramos de una gota de poción:', 'Tamaño en milímetros de un virus:'
  ];
  function checkNC(inp, C, E, tolC) {
    const c = parseNum(inp.c), u = parseIntSafe(inp.e);
    if (isNaN(c) || isNaN(u)) return { r: bad('INVALID') };
    const t = tolC || 1e-9;
    const valOk = eqRel(c * Math.pow(10, u), C * Math.pow(10, E), Math.max(t, 1e-9));
    const norm = Math.abs(c) >= 1 && Math.abs(c) < 10;
    if (valOk && norm) return { r: ok() };
    return { c, u, valOk, norm };
  }
  function genANC() {
    const big = Math.random() < 0.5; const cs = coefStr(); const C = parseNum(cs);
    const E = big ? R(3, 12) : -R(2, 9);
    const dec = shiftDec(cs, E);
    const ctx = Math.random() < 0.35 ? pick(big ? NC_CTX_BIG : NC_CTX_SMALL) : null;
    return {
      skill: 'nc', sub: 'a_nc', type: 'nc', prompt: (ctx ? '<p class="ctx">' + ctx + '</p>' : '<p>Escribe en notación científica:</p>') + '<p class="expr">' + groupInt(dec) + '</p>',
      answerText: nc(C, E), answerHtml: true, correct: { c: String(C), e: String(E) },
      solution: '<p><b>1.</b> Punto después de la primera cifra que no es cero → <b>' + cs + '</b></p><p><b>2.</b> Saltos del punto: <b>' + Math.abs(E) + '</b></p><p><b>3.</b> El número original es ' + (big ? '<b>grande</b> → exponente positivo' : '<b>chiquito</b> (empieza con 0.) → exponente negativo') + '</p><p><b>' + nc(C, E) + '</b></p>',
      check: (inp) => {
        const k = checkNC(inp, C, E); if (k.r) return k.r;
        if (k.valOk && !k.norm) return bad('NC_NORM');
        if (eqRel(k.c, C) && k.u === -E) return bad('NC_SIGN');
        if (eqRel(k.c, C) && Math.abs(k.u - E) === 1) return bad('NC_COUNT');
        if (eqRel(k.c, C)) return bad('NC_EXP');
        return bad('NC_COEF');
      }
    };
  }
  function genADec() {
    const big = Math.random() < 0.5; const cs = coefStr(); const C = parseNum(cs);
    const E = big ? R(2, 9) : -R(1, 7);
    const ansS = shiftDec(cs, E); const ans = parseNum(ansS);
    return {
      skill: 'nc', sub: 'a_decimal', type: 'num', prompt: '<p>Escribe el número completo:</p><p class="expr">' + nc(C, E) + '</p>',
      answerText: groupInt(ansS),
      solution: '<p>Exponente ' + (E > 0 ? '<b>positivo</b> → el número debe quedar <b>grande</b> → punto a la derecha' : '<b>negativo</b> → el número debe quedar <b>chiquito</b> → punto a la izquierda') + ', ' + Math.abs(E) + ' saltos.</p><p>' + cs + ' → <b>' + groupInt(ansS) + '</b></p><p class="muted">Comprueba: ¿tu respuesta es ' + (E > 0 ? 'grande' : 'menor que 1') + '?</p>',
      check: (inp) => {
        const v = parseNum(inp.v); if (isNaN(v)) return bad('INVALID');
        if (eqRel(v, ans)) return ok();
        if (eqRel(v, C * Math.pow(10, -E))) return bad('NC_DIR');
        if (eqRel(v, C * Math.pow(10, E + 1)) || eqRel(v, C * Math.pow(10, E - 1))) return bad('COUNT');
        return bad('GENERIC');
      }
    };
  }
  function genNormalizar() {
    const cs = coefStr(); const C = parseNum(cs);
    const shift = pick([-2, -1, 1, 2]); // coef mostrado = C * 10^shift
    const shown = parseNum(shiftDec(cs, shift));
    const E = R(-8, 8); const Eshown = E - shift;
    return {
      skill: 'nc', sub: 'normalizar', type: 'nc', prompt: '<p>Acomoda en notación científica (coeficiente entre 1 y 10):</p><p class="expr">' + nc(shown, Eshown) + '</p>',
      answerText: nc(C, E), answerHtml: true, correct: { c: String(C), e: String(E) },
      solution: '<p>' + fmt(shown) + ' → ' + cs + ': el punto se movió ' + Math.abs(shift) + ' lugar' + (Math.abs(shift) > 1 ? 'es' : '') + '. El coeficiente se hizo ' + (shift > 0 ? 'más <b>chico</b>, así que el exponente <b>sube</b>' : 'más <b>grande</b>, así que el exponente <b>baja</b>') + ' ' + Math.abs(shift) + '.</p><p>' + fmt(Eshown) + (shift > 0 ? ' + ' : ' ' + M + ' ') + Math.abs(shift) + ' = ' + fmt(E) + ' → <b>' + nc(C, E) + '</b></p>',
      check: (inp) => {
        const k = checkNC(inp, C, E); if (k.r) return k.r;
        if (k.valOk && !k.norm) return bad('NC_NORM');
        if (eqRel(k.c, C) && k.u === Eshown - shift) return bad('NC_DIR');
        if (eqRel(k.c, C)) return bad('NC_EXP_SIGN');
        return bad('NC_COEF');
      }
    };
  }
  const oneDec = () => round(R(11, 99) / 10, 1);
  function normalize(c, e) { let k = 0; while (Math.abs(c) >= 10) { c /= 10; k++; } while (Math.abs(c) < 1 && c !== 0) { c *= 10; k--; } return [round(c, 8), e + k]; }
  function genMult() {
    const a = oneDec(), b = oneDec(), m = R(-9, 9), n = R(-9, 9);
    const p = round(a * b, 4); const [C, E] = normalize(p, m + n);
    return {
      skill: 'nc', sub: 'mult', type: 'nc', prompt: '<p class="expr">(' + nc(a, m) + ')(' + nc(b, n) + ')</p>', answerText: nc(C, E), answerHtml: true, correct: { c: String(C), e: String(E) },
      solution: '<p><b>1.</b> Coeficientes: ' + fmt(a) + ' × ' + fmt(b) + ' = ' + fmt(p) + '</p><p><b>2.</b> Exponentes se suman: ' + fmt(m) + ' + ' + par(n) + ' = ' + fmt(m + n) + '</p>' + (p >= 10 ? '<p><b>3.</b> Acomoda: ' + nc(p, m + n) + ' = <b>' + nc(C, E) + '</b></p>' : '<p><b>' + nc(C, E) + '</b></p>'),
      check: (inp) => {
        const k = checkNC(inp, C, E, 1e-6); if (k.r) return k.r;
        if (k.valOk && !k.norm) return ok('Correcto. Para dejarlo en notación científica, acomódalo: ' + nc(C, E));
        const coefOk = eqRel(k.c, p, 1e-6) || eqRel(k.c, C, 1e-6);
        if (coefOk && (k.u === m * n || k.u === m * n + (E - (m + n)))) return bad('NC_MULT_EXP');
        if (coefOk) return bad('NC_EXP_SIGN');
        return bad('GENERIC');
      }
    };
  }
  function genDiv() {
    let a, b, q, tries = 0;
    do {
      b = pick([1.2, 1.5, 2, 2.4, 2.5, 3, 4, 5, 6, 8]);
      q = Math.random() < 0.4 ? pick([0.2, 0.25, 0.4, 0.5, 0.6, 0.75, 0.8]) : round(R(11, 49) / 10, 1);
      a = round(q * b, 3); tries++;
    } while ((a < 1 || a >= 10) && tries < 100);
    const m = R(-9, 9) , n = R(-9, 9);
    const [C, E] = normalize(q, m - n);
    const inv = round(b / a, 6); const [Ci] = normalize(inv, 0);
    return {
      skill: 'nc', sub: 'div', type: 'nc', prompt: '<div class="frac expr"><span>' + nc(a, m) + '</span><span>' + nc(b, n) + '</span></div>', answerText: nc(C, E), answerHtml: true, correct: { c: String(C), e: String(E) },
      solution: '<p><b>1.</b> Arriba entre abajo: ' + fmt(a) + ' ÷ ' + fmt(b) + ' = ' + fmt(q) + '</p><p><b>2.</b> Exponentes, arriba menos abajo: ' + fmt(m) + ' ' + M + ' ' + par(n) + ' = ' + fmt(m - n) + '</p>' + (q < 1 ? '<p><b>3.</b> Acomoda: ' + nc(q, m - n) + ' = <b>' + nc(C, E) + '</b></p>' : '<p><b>' + nc(C, E) + '</b></p>'),
      check: (inp) => {
        const k = checkNC(inp, C, E, 0.006); if (k.r) return k.r;
        if (k.valOk && !k.norm) return ok('Correcto. Para dejarlo en notación científica, acomódalo: ' + nc(C, E));
        if (eqRel(k.c, inv, 0.006) || eqRel(k.c, Ci, 0.006)) return bad('NC_DIV_INV');
        const coefOk = eqRel(k.c, q, 0.006) || eqRel(k.c, C, 0.006);
        if (coefOk) {
          const adj = eqRel(k.c, C, 0.006) ? E - (m - n) : 0;
          if (k.u === m + n + adj) return bad('NC_DIV_EXP');
          if (k.u === n - m + adj) return bad('QUOT_ORDER');
          return bad('NC_EXP_SIGN');
        }
        return bad('GENERIC');
      }
    };
  }
  function genSuma() {
    const a = oneDec(), b = oneDec(), m = R(2, 7), d = R(1, 3), n = m - d;
    const neg = Math.random() < 0.3;
    const V = a * Math.pow(10, m) + (neg ? -1 : 1) * b * Math.pow(10, n);
    const E0 = Math.floor(Math.log10(V)); const C = round(V / Math.pow(10, E0), 8);
    const bShift = parseNum(shiftDec(String(b), -d));
    const wrongDir = round(a + (neg ? -1 : 1) * b * Math.pow(10, d), 6);
    const sign = neg ? ' ' + M + ' ' : ' + ';
    return {
      skill: 'nc', sub: 'suma', type: 'nc', prompt: '<p class="expr">' + nc(a, m) + sign + nc(b, n) + '</p>', answerText: nc(C, E0), answerHtml: true, correct: { c: String(C), e: String(E0) },
      solution: '<p><b>1.</b> Iguala al exponente mayor (' + m + '): ' + nc(b, n) + ' = ' + nc(bShift, m) + ' (el coeficiente se hace más chico, el punto va ' + d + ' a la izquierda).</p><p><b>2.</b> Suma coeficientes: ' + fmt(a) + sign + fmt(bShift) + ' = ' + fmt(round(a + (neg ? -1 : 1) * bShift, 8)) + '</p><p><b>Resultado:</b> ' + nc(C, E0) + '</p><p class="muted">Otro camino: ' + groupInt(shiftDec(String(a), m)) + sign + groupInt(shiftDec(String(b), n)) + ' = ' + fmt(V) + '</p>',
      check: (inp) => {
        const k = checkNC(inp, C, E0, 1e-6); if (k.r) return k.r;
        if (k.valOk && !k.norm) return ok('Correcto. Para dejarlo en notación científica, acomódalo: ' + nc(C, E0));
        if (eqRel(k.c, round(a + (neg ? -b : b), 4), 1e-6) && [m, n, m + n].includes(k.u)) return bad('NC_SUM_NOEQ');
        if (eqRel(k.c * Math.pow(10, k.u), wrongDir * Math.pow(10, m), 1e-6)) return bad('NC_DIR');
        return bad('GENERIC');
      }
    };
  }

  /* ---------- registro ---------- */
  const SUBS = {
    cadena: { topic: 'signos', name: 'Cadenas sin paréntesis', gen: genCadena },
    parentesis: { topic: 'signos', name: 'Con paréntesis', gen: genParentesis },
    decimales: { topic: 'signos', name: 'Decimales con signo', gen: genDecimales },
    multdiv: { topic: 'signos', name: 'Multiplicación y división', gen: genMultDiv },
    menosneg: { topic: 'enteros', name: 'Menos de un negativo', gen: genMenosNeg },
    eparentesis: { topic: 'enteros', name: 'Sumas con paréntesis', gen: genEnterosParen },
    mult10: { topic: 'posicional', name: '× y ÷ entre 10, 100, 1000', gen: genMult10 },
    expand: { topic: 'exponente', name: 'Contar factores', gen: genExpand },
    signobase: { topic: 'exponente', name: '−3² contra (−3)²', gen: genSignoBase },
    producto: { topic: 'exponentes', name: 'Producto (se suman)', gen: genProducto },
    cociente: { topic: 'exponentes', name: 'Cociente (se restan)', gen: genCociente },
    potpot: { topic: 'exponentes', name: 'Potencia de potencia', gen: genPotPot },
    potprod: { topic: 'exponentes', name: 'Potencia de un producto', gen: genPotProd },
    negativo: { topic: 'exponentes', name: 'Exponente negativo', gen: genNegativo },
    cero: { topic: 'exponentes', name: 'Exponente cero', gen: genCero },
    mixto: { topic: 'exponentes', name: 'Combinados', gen: genMixto },
    a_nc: { topic: 'nc', name: 'Número → notación científica', gen: genANC },
    a_decimal: { topic: 'nc', name: 'Notación científica → número', gen: genADec },
    normalizar: { topic: 'nc', name: 'Acomodar el coeficiente', gen: genNormalizar },
    mult: { topic: 'nc', name: 'Multiplicación', gen: genMult },
    div: { topic: 'nc', name: 'División', gen: genDiv },
    suma: { topic: 'nc', name: 'Suma y resta', gen: genSuma }
  };
  function make(sub) { const it = SUBS[sub].gen(); it.sub = sub; it.topic = SUBS[sub].topic; it.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7); return it; }

  const DIAG = ['cadena', 'parentesis', 'menosneg', 'decimales', 'signobase', 'producto', 'cociente', 'negativo', 'mult10', 'a_nc', 'a_decimal', 'div'];
  const SIM = {
    signos: ['cadena', 'parentesis', 'parentesis', 'decimales', 'multdiv'],
    exponentes: ['producto', 'cociente', 'potpot', 'potprod', 'mixto'],
    nc: ['a_nc', 'a_decimal', 'mult', 'div', 'suma']
  };

  const Gen = { R, pick, shuffle, round, eqRel, fmt, par, sup, pw, nc, shiftDec, groupInt, parseNum, parseIntSafe, ERR, SUBS, make, DIAG, SIM, M };
  if (typeof module !== 'undefined' && module.exports) module.exports = Gen; else global.Gen = Gen;
})(typeof window !== 'undefined' ? window : globalThis);
