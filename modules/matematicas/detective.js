/* Brújula · Matemáticas — Detective de errores: soluciones con un paso equivocado */
(function (global) {
  'use strict';
  const G = Gen; const { R, pick, fmt, par, sup, pw, nc, shiftDec, groupInt, M } = G;
  const mono = (x) => '<span class="mono">' + x + '</span>';
  const sgn = () => (Math.random() < 0.5 ? -1 : 1);

  G.ERR.BAL = { t: 'La balanza al revés', m: 'Si el coeficiente se hace más chico, el exponente sube; si se hace más grande, el exponente baja. Lo que se quita de un lado se compensa del otro.', lens: 'nc-norm' };

  // Cada generador devuelve { topic, err, prompt, steps[], wrong, fix }
  const D = {};

  /* ----- signos ----- */
  function chain() {
    const t = [{ op: null, v: -R(2, 12) }, { op: '+', v: R(2, 12) }, { op: '-', v: -R(2, 12) }, { op: '+', v: -R(2, 12) }];
    if (Math.random() < 0.5) t.push({ op: '-', v: R(2, 12) });
    return t;
  }
  const showT = (t) => t.map((x, i) => (x.op === '-' ? ' ' + M + ' ' : i ? ' + ' : '') + par(x.v)).join('');
  const effOf = (t) => t.map((x) => (x.op === '-' ? -x.v : x.v));
  const showEff = (e) => e.map((v, i) => (i === 0 ? fmt(v) : (v < 0 ? ' ' + M + ' ' : ' + ') + fmt(Math.abs(v)))).join('');
  const grp = (e) => { const p = e.filter((v) => v > 0).reduce((a, b) => a + b, 0), n = e.filter((v) => v < 0).reduce((a, b) => a + b, 0); return { p, n: -n, r: p + n }; };
  D.ABS_SUM = () => {
    const t = chain(); const e = effOf(t); const abs = e.map(Math.abs); const g = grp(abs);
    return { topic: 'signos', err: 'ABS_SUM', prompt: showT(t), wrong: 0,
      steps: ['Quito paréntesis: ' + mono(showEff(abs)), 'Agrupo: positivos ' + g.p + ' · negativos 0', 'Resultado: ' + mono(fmt(g.r))],
      fix: 'Quito paréntesis: ' + mono(showEff(e)) + ' → resultado ' + mono(fmt(grp(e).r)) };
  };
  D.MINUS_NEG = () => {
    const a = R(3, 12), b = R(2, 12), c = R(2, 9);
    const t = [{ op: null, v: a }, { op: '-', v: -b }, { op: '+', v: -c }];
    const bad = [a, -b, -c]; const g = grp(bad); const e = effOf(t);
    return { topic: 'enteros', err: 'MINUS_NEG', prompt: showT(t), wrong: 0,
      steps: ['Quito paréntesis: ' + mono(showEff(bad)), 'Agrupo: positivos ' + g.p + ' · negativos ' + g.n, 'Resultado: ' + mono(fmt(g.r))],
      fix: M + '(' + M + b + ') = +' + b + ' → ' + mono(showEff(e)) + ' = ' + mono(fmt(grp(e).r)) };
  };
  D.SIGN_FLIP = () => {
    let t, e, g; do { t = chain(); e = effOf(t); g = grp(e); } while (g.r === 0);
    return { topic: 'signos', err: 'SIGN_FLIP', prompt: showT(t), wrong: 2,
      steps: ['Quito paréntesis: ' + mono(showEff(e)), 'Agrupo: positivos ' + g.p + ' · negativos ' + g.n, 'Resto ' + Math.max(g.p, g.n) + ' ' + M + ' ' + Math.min(g.p, g.n) + ' = ' + Math.abs(g.r) + ' → resultado ' + mono(fmt(-g.r))],
      fix: 'Gana el grupo ' + (g.r > 0 ? 'positivo' : 'negativo') + ' → ' + mono(fmt(g.r)) };
  };
  D.MULT_SIGN = () => {
    const f = [R(2, 6) * -1, R(2, 5), R(2, 4) * -1, R(2, 3) * -1]; const P = f.reduce((a, b) => a * b, 1);
    return { topic: 'signos', err: 'MULT_SIGN', prompt: f.map(par).join(''), wrong: 1,
      steps: ['Números sin signo: ' + f.map(Math.abs).join(' × ') + ' = ' + Math.abs(P), 'Hay 3 negativos → impar → resultado positivo', 'Resultado: ' + mono(fmt(-P))],
      fix: '3 negativos → impar → <b>negativo</b> → ' + mono(fmt(P)) };
  };

  /* ----- exponentes ----- */
  const L = () => pick(['a', 'b', 'k', 'm', 'x', 'y', 'w']);
  D.IMPL1 = () => {
    const x = L(), a = R(2, 8), b = R(2, 8);
    return { topic: 'exponentes', err: 'IMPL1', prompt: '(' + pw(x, a) + ')(' + x + ')(' + pw(x, b) + ')', wrong: 1,
      steps: ['Misma base y multiplicación → sumo exponentes', 'Sumo: ' + a + ' + ' + b + ' = ' + (a + b), 'Resultado: ' + pw(x, a + b)],
      fix: 'La ' + x + ' sola vale ' + pw(x, 1) + ': ' + a + ' + 1 + ' + b + ' = ' + (a + b + 1) + ' → ' + pw(x, a + b + 1) };
  };
  D.QUOT_ORDER = () => {
    const x = L(), a = R(2, 6), b = a + R(2, 6);
    return { topic: 'exponentes', err: 'QUOT_ORDER', prompt: '<span class="ifrac"><span>' + pw(x, a) + '</span><span>' + pw(x, b) + '</span></span>', wrong: 1,
      steps: ['Misma base y división → resto exponentes', 'Resto: ' + b + ' ' + M + ' ' + a + ' = ' + (b - a), 'Resultado: ' + pw(x, b - a)],
      fix: 'Arriba menos abajo: ' + a + ' ' + M + ' ' + b + ' = ' + fmt(a - b) + ' → ' + pw(x, a - b) };
  };
  D.POT_SUM = () => {
    const x = L(), a = R(2, 7), b = R(2, 6);
    return { topic: 'exponentes', err: 'POT_SUM', prompt: '(' + pw(x, a) + ')' + sup(b), wrong: 0,
      steps: ['Potencia de una potencia → sumo exponentes', a + ' + ' + b + ' = ' + (a + b), 'Resultado: ' + pw(x, a + b)],
      fix: 'Potencia de una potencia → <b>multiplico</b>: ' + a + ' × ' + b + ' = ' + a * b + ' → ' + pw(x, a * b) };
  };
  D.NEG_FRAC = () => {
    const x = L(), a = R(2, 5), b = a + R(2, 5);
    return { topic: 'exponentes', err: 'NEG_FRAC', prompt: '<span class="ifrac"><span>' + pw(x, a) + '</span><span>' + pw(x, b) + '</span></span>', wrong: 2,
      steps: ['Resto: ' + a + ' ' + M + ' ' + b + ' = ' + fmt(a - b), 'Queda ' + pw(x, a - b), 'Sin exponente negativo: <span class="ifrac"><span>1</span><span>' + pw(x, a - b) + '</span></span>'],
      fix: 'Al bajar, el menos desaparece: <span class="ifrac"><span>1</span><span>' + pw(x, b - a) + '</span></span>' };
  };
  D.NEG_NUM = () => {
    const n = R(3, 9), a = R(4, 9), b = a + R(2, 6), base = pick([2, 3, 5, 7, 9]);
    return { topic: 'exponentes', err: 'NEG_NUM', prompt: '<span class="ifrac"><span>' + pw(base, a) + '</span><span>' + pw(base, b) + '</span></span>', wrong: 1,
      steps: ['Resto: ' + a + ' ' + M + ' ' + b + ' = ' + fmt(a - b), 'Resultado: ' + M + pw(base, b - a)],
      fix: 'El exponente es negativo, no el número: ' + pw(base, a - b) + ' = <span class="ifrac"><span>1</span><span>' + pw(base, b - a) + '</span></span>' };
  };
  D.SQ_SIGN = () => {
    const a = R(2, 6);
    return { topic: 'exponente', err: 'SQ_SIGN', prompt: M + a + sup(2), wrong: 0,
      steps: [M + a + sup(2) + ' = (' + M + a + ')(' + M + a + ')', 'Menos por menos da más', 'Resultado: ' + (a * a)],
      fix: 'Sin paréntesis el 2 solo toca al ' + a + ': ' + M + '(' + a + '·' + a + ') = ' + M + a * a };
  };

  /* ----- notación científica ----- */
  const coef = () => { const d = R(1, 9) + '.' + R(1, 9) + (Math.random() < 0.5 ? R(1, 9) : ''); return d; };
  D.NC_SIGN = () => {
    const c = coef(), E = -R(3, 7); const dec = shiftDec(c, E);
    return { topic: 'nc', err: 'NC_SIGN', prompt: groupInt(dec) + ' en notación científica', wrong: 2,
      steps: ['Punto después de la primera cifra que no es cero: ' + mono(c), 'Cuento los saltos del punto: ' + Math.abs(E), 'Resultado: ' + nc(G.parseNum(c), -E)],
      fix: 'Es un número chiquito → exponente negativo: ' + nc(G.parseNum(c), E) };
  };
  D.NC_COUNT = () => {
    const c = coef(), E = -R(3, 7); const dec = shiftDec(c, E);
    return { topic: 'nc', err: 'NC_COUNT', prompt: groupInt(dec) + ' en notación científica', wrong: 1,
      steps: ['Punto después de la primera cifra que no es cero: ' + mono(c), 'Cuento los ceros después del punto: ' + (Math.abs(E) - 1), 'Resultado: ' + nc(G.parseNum(c), E + 1)],
      fix: 'Se cuentan <b>saltos</b> del punto, no ceros: ' + Math.abs(E) + ' → ' + nc(G.parseNum(c), E) };
  };
  D.NC_DIR = () => {
    const c = coef(), E = R(4, 7);
    return { topic: 'nc', err: 'NC_DIR', prompt: nc(G.parseNum(c), E) + ' como número completo', wrong: 1,
      steps: ['El exponente es ' + E + ': el punto se mueve ' + E + ' lugares', 'Muevo el punto a la izquierda', 'Resultado: ' + mono(shiftDec(c, -E))],
      fix: 'Exponente positivo → número grande → punto a la <b>derecha</b>: ' + mono(groupInt(shiftDec(c, E))) };
  };
  D.NC_DIV_INV = () => {
    const pairs = [[1.2, 4.8], [2, 8], [1.5, 6], [2.5, 7.5], [3, 9], [1.6, 6.4]];
    const [a, b] = pick(pairs); const m = R(-8, 8), n = R(-8, 8);
    const q = G.round(b / a, 4);
    return { topic: 'nc', err: 'NC_DIV_INV', prompt: '<span class="ifrac"><span>' + nc(a, m) + '</span><span>' + nc(b, n) + '</span></span>', wrong: 0,
      steps: ['Divido coeficientes: ' + fmt(b) + ' ÷ ' + fmt(a) + ' = ' + fmt(q), 'Exponentes, arriba menos abajo: ' + fmt(m) + ' ' + M + ' ' + par(n) + ' = ' + fmt(m - n), 'Resultado: ' + nc(q, m - n)],
      fix: 'Arriba entre abajo: ' + fmt(a) + ' ÷ ' + fmt(b) + ' = ' + fmt(G.round(a / b, 4)) + ' (luego se acomoda)' };
  };
  D.NC_EXP_SIGN = () => {
    const a = pick([8, 6, 9]), b = pick([2, 3]); const m = -R(4, 9), n = -R(1, 3);
    return { topic: 'nc', err: 'NC_EXP_SIGN', prompt: '<span class="ifrac"><span>' + nc(a, m) + '</span><span>' + nc(b, n) + '</span></span>', wrong: 1,
      steps: ['Divido coeficientes: ' + a + ' ÷ ' + b + ' = ' + fmt(G.round(a / b, 4)), 'Exponentes: ' + fmt(m) + ' ' + M + ' ' + par(n) + ' = ' + fmt(m + n), 'Resultado: ' + nc(G.round(a / b, 4), m + n)],
      fix: fmt(m) + ' ' + M + ' ' + par(n) + ' = ' + fmt(m) + ' + ' + Math.abs(n) + ' = ' + fmt(m - n) };
  };
  D.BAL = () => {
    const pairs = [[5.6, 6.1], [4.2, 3.5], [7.5, 2.4], [8.3, 1.9], [6.4, 2.5]];
    const [a, b] = pick(pairs); const m = -R(2, 6), n = -R(2, 6); const p = G.round(a * b, 4);
    return { topic: 'nc', err: 'BAL', prompt: '(' + nc(a, m) + ')(' + nc(b, n) + ')', wrong: 2,
      steps: ['Multiplico coeficientes: ' + fmt(a) + ' × ' + fmt(b) + ' = ' + fmt(p), 'Sumo exponentes: ' + fmt(m) + ' + ' + par(n) + ' = ' + fmt(m + n), 'Acomodo: ' + nc(p, m + n) + ' = ' + nc(G.round(p / 10, 5), m + n - 1)],
      fix: fmt(p) + ' → ' + fmt(G.round(p / 10, 5)) + ' se hizo más chico → el exponente <b>sube</b>: ' + nc(G.round(p / 10, 5), m + n + 1) };
  };
  D.NC_SUM_NOEQ = () => {
    const a = G.round(R(21, 89) / 10, 1), b = G.round(R(11, 49) / 10, 1), m = R(4, 7), d = R(1, 3);
    return { topic: 'nc', err: 'NC_SUM_NOEQ', prompt: nc(a, m) + ' + ' + nc(b, m - d), wrong: 0,
      steps: ['Sumo coeficientes: ' + fmt(a) + ' + ' + fmt(b) + ' = ' + fmt(G.round(a + b, 4)), 'Me quedo con el exponente mayor: ' + m, 'Resultado: ' + nc(G.round(a + b, 4), m)],
      fix: 'Primero igualo: ' + nc(b, m - d) + ' = ' + nc(G.parseNum(shiftDec(String(b), -d)), m) + ', luego sumo: ' + fmt(G.round(a + G.parseNum(shiftDec(String(b), -d)), 6)) + ' × 10' + sup(m) };
  };

  // Cada error se pesa por cuántas veces ella lo ha cometido; los demás aparecen menos.
  function make(errCounts) {
    const keys = Object.keys(D);
    const w = keys.map((k) => 1 + 2 * Math.min(4, (errCounts && errCounts[k]) || 0));
    let r = Math.random() * w.reduce((a, b) => a + b, 0), k = keys[keys.length - 1];
    for (let i = 0; i < keys.length; i++) { r -= w[i]; if (r <= 0) { k = keys[i]; break; } }
    const it = D[k]();
    it.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    return it;
  }
  global.Brujula.subject('mat', { detective: { make, kinds: Object.keys(D), D } });
})(window);
