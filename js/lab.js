/* Brújula — laboratorio de interactivos */
(function (global) {
  'use strict';
  const M = '−';
  const f = (n) => Gen.fmt(n);
  const sup = (e) => '<sup>' + f(e) + '</sup>';
  const h = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; };
  const stepper = (id, label, val) => `<div class="stepper" data-id="${id}"><span class="lbl">${label}</span><button type="button" data-d="-1" aria-label="menos">−</button><output>${f(val)}</output><button type="button" data-d="1" aria-label="más">+</button></div>`;
  function bindSteppers(root, state, limits, onChange) {
    root.querySelectorAll('.stepper').forEach((st) => {
      const id = st.dataset.id;
      st.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
        const [lo, hi] = limits[id];
        state[id] = Math.max(lo, Math.min(hi, state[id] + Number(b.dataset.d)));
        st.querySelector('output').textContent = f(state[id]);
        onChange();
      }));
    });
  }

  const LAB = {};

  /* ---------- Recta numérica ---------- */
  LAB.recta = {
    title: 'Caminar en la recta', topic: 'enteros',
    desc: 'Elige el punto de partida, la operación y el número. Observa hacia dónde caminas.',
    mount(el) {
      const st = { a: -4, op: -1, b: -6 };
      el.innerHTML = `<div class="lab-ctrl">${stepper('a', 'Empiezo en', st.a)}
        <div class="seg" role="group" aria-label="operación"><button type="button" data-op="1">+ sumar</button><button type="button" data-op="-1">− restar</button></div>
        ${stepper('b', 'El número', st.b)}</div>
        <div class="lab-expr mono" aria-live="polite"></div><div class="recta-wrap"><svg class="recta" viewBox="0 0 640 120" role="img" aria-label="recta numérica"></svg></div><div class="lab-note"></div>
        <button type="button" class="btn ghost sm rnd">Otro al azar</button>`;
      const svg = el.querySelector('svg'), expr = el.querySelector('.lab-expr'), note = el.querySelector('.lab-note');
      const segBtns = el.querySelectorAll('[data-op]');
      const X = (v) => 20 + (v + 20) * 15;
      function draw() {
        segBtns.forEach((b) => b.classList.toggle('on', Number(b.dataset.op) === st.op));
        const res = st.a + st.op * st.b;
        const bTxt = st.b < 0 ? '(' + f(st.b) + ')' : '(' + f(st.b) + ')';
        expr.innerHTML = f(st.a) + (st.op > 0 ? ' + ' : ' ' + M + ' ') + bTxt + ' = <b>' + f(res) + '</b>';
        let g = '<line x1="10" y1="70" x2="630" y2="70" class="axis"/>';
        for (let v = -20; v <= 20; v++) {
          const x = X(v); const big = v % 5 === 0;
          g += `<line x1="${x}" y1="${big ? 62 : 66}" x2="${x}" y2="${big ? 78 : 74}" class="tick"/>`;
          if (big) g += `<text x="${x}" y="96" class="tl">${f(v)}</text>`;
        }
        const x1 = X(st.a), x2 = X(Math.max(-20, Math.min(20, res)));
        const up = Math.min(55, 12 + Math.abs(x2 - x1) / 4);
        g += `<path d="M${x1},62 Q${(x1 + x2) / 2},${62 - up} ${x2},62" class="arc"/>`;
        g += `<circle cx="${x1}" cy="70" r="6" class="pstart"/><circle cx="${x2}" cy="70" r="6" class="pend"/>`;
        if (Math.abs(res) > 20) g += `<text x="320" y="20" class="tl">(el resultado se sale de la recta)</text>`;
        svg.innerHTML = g;
        const mira = st.b >= 0 ? 'derecha' : 'izquierda';
        const camina = st.op > 0 ? 'de frente' : 'de espaldas';
        const dir = (st.b >= 0) === (st.op > 0) ? 'derecha' : 'izquierda';
        note.innerHTML = `El número ${f(st.b)} es ${st.b >= 0 ? 'positivo' : 'negativo'} → miras a la <b>${mira}</b>. La operación es ${st.op > 0 ? 'suma' : 'resta'} → caminas <b>${camina}</b>. Avanzas ${Math.abs(st.b)} hacia la <b>${dir}</b>.`;
      }
      segBtns.forEach((b) => b.addEventListener('click', () => { st.op = Number(b.dataset.op); draw(); }));
      bindSteppers(el, st, { a: [-15, 15], b: [-15, 15] }, draw);
      el.querySelector('.rnd').addEventListener('click', () => {
        st.a = Gen.R(-10, 10); st.b = Gen.R(-10, 10) || -3; st.op = Math.random() < 0.6 ? -1 : 1;
        el.querySelector('[data-id=a] output').textContent = f(st.a); el.querySelector('[data-id=b] output').textContent = f(st.b); draw();
      });
      draw();
    }
  };

  /* ---------- Fichas ---------- */
  LAB.fichas = {
    title: 'Fichas que se anulan', topic: 'enteros',
    desc: 'Cada pareja + y − vale cero. Agrega o quita fichas y observa el valor.',
    mount(el) {
      const st = { pos: 2, neg: 0, ch: null };
      const CH = [[2, '-', -3], [-4, '-', -6], [3, '-', 5], [-2, '+', -3], [5, '+', -7], [-1, '-', -4]];
      el.innerHTML = `<div class="lab-row"><button type="button" class="btn sm" data-a="p+">Poner +</button><button type="button" class="btn sm" data-a="n+">Poner −</button><button type="button" class="btn ghost sm" data-a="p-">Quitar +</button><button type="button" class="btn ghost sm" data-a="n-">Quitar −</button><button type="button" class="btn ghost sm" data-a="z">Agregar pareja cero</button><button type="button" class="btn ghost sm" data-a="r">Vaciar</button></div>
        <div class="chips" aria-live="polite"></div><div class="lab-expr"></div>
        <div class="lab-challenge"><button type="button" class="btn ghost sm" data-a="c">Dame un reto</button><div class="ch-txt"></div></div>`;
      const chips = el.querySelector('.chips'), val = el.querySelector('.lab-expr'), chTxt = el.querySelector('.ch-txt');
      function draw() {
        const pairs = Math.min(st.pos, st.neg);
        let html = '';
        for (let i = 0; i < pairs; i++) html += '<span class="pair"><span class="chip pos">+</span><span class="chip neg">−</span></span>';
        for (let i = pairs; i < st.pos; i++) html += '<span class="chip pos">+</span>';
        for (let i = pairs; i < st.neg; i++) html += '<span class="chip neg">−</span>';
        chips.innerHTML = html || '<span class="muted">Sin fichas (vale 0)</span>';
        const v = st.pos - st.neg;
        val.innerHTML = `${st.pos} positivas, ${st.neg} negativas${pairs ? ' · ' + pairs + ' pareja' + (pairs > 1 ? 's' : '') + ' cero' : ''} → valor <b>${f(v)}</b>`;
        if (st.ch) {
          const [a, op, b] = st.ch; const r = op === '+' ? a + b : a - b;
          chTxt.innerHTML = `Representa <b>${f(a)} ${op === '+' ? '+' : M} (${f(b)})</b>: empieza con ${f(a)} y ${op === '+' ? 'pon' : 'quita'} ${Math.abs(b)} ficha${Math.abs(b) > 1 ? 's' : ''} ${b < 0 ? '−' : '+'}. ` + (v === r && st.done ? '<span class="good">¡Exacto! Vale ' + f(r) + '.</span>' : (!st.started ? '' : ''));
        }
      }
      el.querySelectorAll('[data-a]').forEach((b) => b.addEventListener('click', () => {
        const a = b.dataset.a;
        if (a === 'p+') st.pos++; if (a === 'n+') st.neg++;
        if (a === 'p-') { if (st.pos > 0) st.pos--; else { chTxt.innerHTML = 'No hay fichas + para quitar. Agrega una pareja cero primero.'; return; } }
        if (a === 'n-') { if (st.neg > 0) st.neg--; else { chTxt.innerHTML = 'No hay fichas − para quitar. Agrega una pareja cero primero.'; return; } }
        if (a === 'z') { st.pos++; st.neg++; }
        if (a === 'r') { st.pos = 0; st.neg = 0; }
        if (a === 'c') { st.ch = Gen.pick(CH); const s0 = st.ch[0]; st.pos = s0 > 0 ? s0 : 0; st.neg = s0 < 0 ? -s0 : 0; st.done = false; }
        if (st.ch && a !== 'c') { const [x, op, y] = st.ch; st.done = (st.pos - st.neg) === (op === '+' ? x + y : x - y); }
        draw();
      }));
      draw();
    }
  };

  /* ---------- Punto decimal / notación científica ---------- */
  LAB.punto = {
    title: 'Mover el punto', topic: 'nc',
    desc: 'Mueve el punto. El exponente se ajusta solo para que el valor no cambie (la balanza).',
    mount(el) {
      const st = { s0: '0.00081', e: 0 };
      const POOL = ['0.00081', '9763000', '3205', '0.0000019', '1807000', '0.00027', '150000000', '0.000006', '4725000000', '0.05', '602000', '0.0034'];
      el.innerHTML = `<div class="lab-expr">Número original: <b class="orig mono"></b></div>
        <div class="dial mono" aria-live="polite"></div>
        <div class="lab-row center"><button type="button" class="btn" data-m="1">← punto a la izquierda</button><button type="button" class="btn" data-m="-1">punto a la derecha →</button></div>
        <div class="lab-note"></div><div class="lab-row"><button type="button" class="btn ghost sm" data-r>Otro número</button></div>`;
      const dial = el.querySelector('.dial'), note = el.querySelector('.lab-note');
      function draw() {
        el.querySelector('.orig').textContent = Gen.groupInt(st.s0);
        const coef = Gen.shiftDec(st.s0, -st.e); const c = Gen.parseNum(coef);
        const okN = c >= 1 && c < 10;
        dial.innerHTML = `<span class="coef ${okN ? 'good' : ''}">${coef}</span> × 10<sup class="${st.e > 0 ? 'epos' : st.e < 0 ? 'eneg' : ''}">${f(st.e)}</sup>`;
        const big = Gen.parseNum(st.s0) >= 10;
        note.innerHTML = okN
          ? `<span class="good">Coeficiente entre 1 y 10.</span> El número original es <b>${big ? 'grande' : 'chiquito'}</b> y el exponente quedó <b>${st.e > 0 ? 'positivo' : st.e < 0 ? 'negativo' : 'cero'}</b>. ${st.e === 0 ? '' : 'Dio ' + Math.abs(st.e) + ' salto' + (Math.abs(st.e) > 1 ? 's' : '') + '.'}`
          : (c >= 10 ? 'El coeficiente todavía es 10 o más: mueve el punto a la izquierda (se achica y el exponente sube).' : 'El coeficiente es menor que 1: mueve el punto a la derecha (crece y el exponente baja).');
      }
      el.querySelectorAll('[data-m]').forEach((b) => b.addEventListener('click', () => { st.e += Number(b.dataset.m); st.e = Math.max(-15, Math.min(15, st.e)); draw(); }));
      el.querySelector('[data-r]').addEventListener('click', () => { let n; do { n = Gen.pick(POOL); } while (n === st.s0); st.s0 = n; st.e = 0; draw(); });
      draw();
    }
  };

  /* ---------- Escalera de potencias de 10 ---------- */
  LAB.escalera = {
    title: 'Escalera de potencias de 10', topic: 'posicional',
    desc: 'Sube y baja escalones. Cada escalón multiplica o divide entre 10.',
    mount(el) {
      const st = { n: 3 };
      el.innerHTML = `<div class="lab-ctrl">${stepper('n', 'Exponente', st.n)}</div><div class="esc"></div><div class="lab-note"></div>`;
      const esc = el.querySelector('.esc'), note = el.querySelector('.lab-note');
      function draw() {
        let html = '';
        for (let k = 6; k >= -6; k--) {
          const val = Gen.shiftDec('1', k);
          html += `<div class="step ${k === st.n ? 'on' : ''}" style="--i:${6 - k}"><span>10<sup>${f(k)}</sup></span><span class="mono">${Gen.groupInt(val)}</span></div>`;
        }
        esc.innerHTML = html;
        note.innerHTML = st.n > 0 ? `10<sup>${st.n}</sup> = 1 seguido de <b>${st.n}</b> cero${st.n > 1 ? 's' : ''}.` : st.n === 0 ? '10<sup>0</sup> = 1. Es el punto de partida.' : `10<sup>${f(st.n)}</sup>: el 1 queda en el lugar <b>${-st.n}</b> después del punto.`;
      }
      bindSteppers(el, st, { n: [-6, 6] }, draw); draw();
    }
  };

  /* ---------- Expansor de potencias ---------- */
  LAB.expansor = {
    title: 'Expansor de potencias', topic: 'exponentes',
    desc: 'Elige la operación y los exponentes. Observa todas las letras y cuéntalas.',
    mount(el) {
      const st = { mode: 'prod', m: 3, n: 4 };
      el.innerHTML = `<div class="seg" role="group"><button type="button" data-mode="prod">a<sup>m</sup>·a<sup>n</sup></button><button type="button" data-mode="quot">a<sup>m</sup> ÷ a<sup>n</sup></button><button type="button" data-mode="pow">(a<sup>m</sup>)<sup>n</sup></button></div>
        <div class="lab-ctrl">${stepper('m', 'm', st.m)}${stepper('n', 'n', st.n)}</div><div class="lab-expr mono"></div><div class="expand"></div><div class="lab-note"></div>`;
      const ex = el.querySelector('.lab-expr'), box = el.querySelector('.expand'), note = el.querySelector('.lab-note');
      const L = (cls) => `<span class="lt ${cls || ''}">a</span>`;
      function draw() {
        el.querySelectorAll('[data-mode]').forEach((b) => b.classList.toggle('on', b.dataset.mode === st.mode));
        const { m, n } = st;
        if (st.mode === 'prod') {
          ex.innerHTML = `a${sup(m)} · a${sup(n)} = a${sup(m + n)}`;
          box.innerHTML = `<div class="grp">${L('c1').repeat(m)}</div><span class="op">·</span><div class="grp">${L('c2').repeat(n)}</div>`;
          note.innerHTML = `Cuenta las letras: ${m} + ${n} = <b>${m + n}</b>. En la multiplicación <b>se suman</b>.`;
        } else if (st.mode === 'quot') {
          const c = Math.min(m, n), r = m - n;
          const top = L('c1 x').repeat(c) + L('c1').repeat(m - c), bot = L('c2 x').repeat(c) + L('c2').repeat(n - c);
          ex.innerHTML = `a${sup(m)} ÷ a${sup(n)} = a${sup(r)}` + (r < 0 ? ` = 1/a${sup(-r)}` : r === 0 ? ' = 1' : '');
          box.innerHTML = `<div class="fracbox"><div class="grp">${top}</div><div class="bar"></div><div class="grp">${bot || '1'}</div></div>`;
          note.innerHTML = `Se tachan ${c} pareja${c > 1 ? 's' : ''}. ` + (r > 0 ? `Sobran ${r} arriba → a${sup(r)}.` : r < 0 ? `Sobran ${-r} abajo → 1/a${sup(-r)} = a${sup(r)}.` : 'No sobra nada → 1 = a<sup>0</sup>.') + ` Arriba menos abajo: ${m} ${M} ${n} = <b>${f(r)}</b>.`;
        } else {
          ex.innerHTML = `(a${sup(m)})${sup(n)} = a${sup(m * n)}`;
          let g = ''; for (let i = 0; i < n; i++) g += `<div class="grp">${L('c' + ((i % 2) + 1)).repeat(m)}</div>`;
          box.innerHTML = g;
          note.innerHTML = `${n} grupos de ${m} letras: ${n} × ${m} = <b>${m * n}</b>. En potencia de potencia <b>se multiplican</b>.`;
        }
      }
      el.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => { st.mode = b.dataset.mode; draw(); }));
      bindSteppers(el, st, { m: [1, 7], n: [1, 7] }, draw); draw();
    }
  };

  /* ---------- −a^n contra (−a)^n ---------- */
  LAB.signo = {
    title: '−3² contra (−3)²', topic: 'exponente',
    desc: '¿El signo queda dentro de la potencia? Cambia la escritura y los números.',
    mount(el) {
      const st = { par: 0, a: 3, n: 2 };
      el.innerHTML = `<div class="seg" role="group"><button type="button" data-p="0">−a<sup>n</sup></button><button type="button" data-p="1">(−a)<sup>n</sup></button></div>
        <div class="lab-ctrl">${stepper('a', 'a', st.a)}${stepper('n', 'n', st.n)}</div><div class="big-expr mono"></div><div class="lab-note"></div>`;
      const be = el.querySelector('.big-expr'), note = el.querySelector('.lab-note');
      function draw() {
        el.querySelectorAll('[data-p]').forEach((b) => b.classList.toggle('on', Number(b.dataset.p) === st.par));
        const { a, n } = st;
        if (st.par) {
          const v = Math.pow(-a, n);
          be.innerHTML = `<span class="inpow">(${M}${a})</span><sup>${n}</sup> = ${Array(n).fill('(' + M + a + ')').join('')} = <b>${f(v)}</b>`;
          note.innerHTML = `El paréntesis mete el menos dentro de la potencia. ${n} negativos → ${n % 2 ? 'impar → negativo' : 'par → positivo'}.`;
        } else {
          const v = -Math.pow(a, n);
          be.innerHTML = `${M}<span class="inpow">${a}</span><sup>${n}</sup> = ${M}(${Array(n).fill(a).join('·')}) = <b>${f(v)}</b>`;
          note.innerHTML = `Sin paréntesis el exponente solo toca al ${a} (marcado). El menos espera afuera: el resultado siempre es negativo.`;
        }
      }
      el.querySelectorAll('[data-p]').forEach((b) => b.addEventListener('click', () => { st.par = Number(b.dataset.p); draw(); }));
      bindSteppers(el, st, { a: [2, 6], n: [1, 5] }, draw); draw();
    }
  };

  global.LAB = LAB;
})(window);
