/* Brújula — núcleo: utilidades compartidas por todos los módulos (números, formato, lectura de respuestas) */
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

  const ok = (note) => ({ ok: true, err: null, note: note || null });
  const bad = (err) => ({ ok: false, err });
  // Compara con tolerancia relativa (física: respuestas con redondeo)
  const near = (a, b, tol) => eqRel(a, b, tol === undefined ? 0.01 : tol) || (Math.abs(b) < 1e-9 && Math.abs(a) < 1e-9);
  // Redondea para mostrar: 2 decimales si hace falta, sin ceros de más
  const r2 = (x, d) => round(x, d === undefined ? 2 : d);

  const Kit = { M, R, pick, shuffle, sgn, round, eqRel, near, r2, groupInt, fmt, par, sup, pw, nc, shiftDec, parseNum, parseIntSafe, ok, bad };
  global.Kit = Kit;
  if (typeof module !== 'undefined' && module.exports) module.exports = Kit;
})(typeof window !== 'undefined' ? window : globalThis);
