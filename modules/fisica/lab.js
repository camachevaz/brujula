/* Brújula · Física — laboratorio */
(function (global) {
  'use strict';
  const { fmt, round } = global.Kit; const { show, frac, FU } = global.FisKit;
  const stepper = (id, label, val, unit) => `<div class="stepper" data-id="${id}"><span class="lbl">${label}</span><button type="button" data-d="-1" aria-label="menos">−</button><output>${fmt(val)}</output><button type="button" data-d="1" aria-label="más">+</button>${unit ? `<span class="lbl">${unit}</span>` : ''}</div>`;
  function bindSteppers(root, st, lim, step, onChange) {
    root.querySelectorAll('.stepper').forEach((s) => {
      const id = s.dataset.id;
      s.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
        st[id] = round(Math.max(lim[id][0], Math.min(lim[id][1], st[id] + Number(b.dataset.d) * (step[id] || 1))), 2);
        s.querySelector('output').textContent = fmt(st[id]); onChange();
      }));
    });
  }
  const LAB = {};

  /* ---------- Triángulo d · v · t ---------- */
  LAB.f_tri = {
    title: 'Triángulo d · v · t', topic: 'f_despeje',
    desc: 'Toca la letra que buscas. El triángulo te dice si se multiplica o se divide.',
    mount(el) {
      const st = { hide: 't', d: 120, v: 40, t: 3 };
      el.innerHTML = `<div class="seg" role="group" aria-label="¿qué buscas?"><button type="button" data-h="d">Busco d</button><button type="button" data-h="v">Busco v</button><button type="button" data-h="t">Busco t</button></div>
        <div class="tri-lab"><svg viewBox="0 0 220 170" class="tri big"><path d="M110 10 L210 160 L10 160 Z" class="tri-b"/><line x1="49" y1="100" x2="171" y2="100" class="tri-b"/><line x1="110" y1="100" x2="110" y2="160" class="tri-b"/>
        <g data-l="d"><rect x="80" y="55" width="60" height="40" rx="8" class="tri-cover"/><text x="110" y="84" class="tri-t">d</text></g>
        <g data-l="v"><rect x="48" y="112" width="56" height="40" rx="8" class="tri-cover"/><text x="76" y="141" class="tri-t">v</text></g>
        <g data-l="t"><rect x="116" y="112" width="56" height="40" rx="8" class="tri-cover"/><text x="144" y="141" class="tri-t">t</text></g></svg>
        <div><p class="big-expr mono" id="triF"></p><p class="lab-note" id="triN"></p></div></div>
        <div class="lab-ctrl">${stepper('d', 'd', st.d, 'km')}${stepper('v', 'v', st.v, 'km/h')}${stepper('t', 't', st.t, 'h')}</div><p class="lab-expr" id="triEx"></p>`;
      const F = { d: 'd = v · t', v: 'v = ' + frac('d', 't'), t: 't = ' + frac('d', 'v') };
      const N = { d: 'Tapaste d: v y t quedan <b>lado a lado</b> → se multiplican.', v: 'Tapaste v: d queda <b>arriba</b> de t → se divide.', t: 'Tapaste t: d queda <b>arriba</b> de v → se divide.' };
      function draw() {
        el.querySelectorAll('[data-h]').forEach((b) => b.classList.toggle('on', b.dataset.h === st.hide));
        el.querySelectorAll('g[data-l]').forEach((g) => g.classList.toggle('covered', g.dataset.l === st.hide));
        el.querySelector('#triF').innerHTML = F[st.hide]; el.querySelector('#triN').innerHTML = N[st.hide];
        el.querySelectorAll('.stepper').forEach((s) => { s.style.opacity = s.dataset.id === st.hide ? '.35' : '1'; s.querySelectorAll('button').forEach((b) => (b.disabled = s.dataset.id === st.hide)); });
        let txt;
        if (st.hide === 'd') txt = `d = (${fmt(st.v)} km/h)(${fmt(st.t)} h) = <b>${show(st.v * st.t)} km</b>`;
        else if (st.hide === 'v') txt = `v = ${fmt(st.d)} km ÷ ${fmt(st.t)} h = <b>${show(st.d / st.t)} km/h</b>`;
        else txt = `t = ${fmt(st.d)} km ÷ ${fmt(st.v)} km/h = <b>${show(st.d / st.v)} h</b>`;
        el.querySelector('#triEx').innerHTML = txt;
      }
      el.querySelectorAll('[data-h]').forEach((b) => b.addEventListener('click', () => { st.hide = b.dataset.h; draw(); }));
      el.querySelectorAll('g[data-l]').forEach((g) => g.addEventListener('click', () => { st.hide = g.dataset.l; draw(); }));
      bindSteppers(el, st, { d: [10, 900], v: [5, 200], t: [0.5, 12] }, { d: 10, v: 5, t: 0.5 }, draw); draw();
    }
  };

  /* ---------- Pista: uniforme contra acelerado ---------- */
  LAB.f_pista = {
    title: 'Pista: uniforme contra acelerado', topic: 'f_acel',
    desc: 'Arriba, velocidad constante; abajo, con aceleración. Mira dónde está cada uno segundo a segundo.',
    mount(el) {
      const st = { v: 5, vi: 0, a: 2, T: 6 };
      el.innerHTML = `<div class="lab-ctrl">${stepper('v', 'Uniforme v', st.v, 'm/s')}</div><div class="lab-ctrl">${stepper('vi', 'Acelerado vi', st.vi, 'm/s')}${stepper('a', 'a', st.a, 'm/s²')}</div>
        <div class="pista"><svg viewBox="0 0 380 180" id="pSvg" role="img" aria-label="posiciones en la pista"></svg></div><div class="scroll"><table class="tbl c" id="pTbl"></table></div><p class="lab-note" id="pNote"></p>`;
      function draw() {
        const T = st.T; const dU = (t) => st.v * t, dA = (t) => st.vi * t + st.a * t * t / 2, vA = (t) => st.vi + st.a * t;
        const maxD = Math.max(dU(T), dA(T), 1); const X = (d) => 16 + (d / maxD) * 344;
        let g = '<text x="16" y="20" class="pl">Uniforme (velocidad constante)</text><line x1="16" y1="50" x2="360" y2="50" class="pt-line"/><text x="16" y="108" class="pl">Acelerado</text><line x1="16" y1="138" x2="360" y2="138" class="pt-line"/>';
        for (let t = 0; t <= T; t++) {
          g += `<circle cx="${X(dU(t))}" cy="50" r="8" class="pu" style="--d:${t * 0.15}s"/><text x="${X(dU(t))}" y="74" class="pl c">${t}</text>`;
          g += `<circle cx="${X(dA(t))}" cy="138" r="8" class="pa" style="--d:${t * 0.15}s"/><text x="${X(dA(t))}" y="162" class="pl c">${t}</text>`;
        }
        el.querySelector('#pSvg').innerHTML = g;
        const rows = [...Array(T + 1).keys()];
        el.querySelector('#pTbl').innerHTML = `<tr><th>t (s)</th>${rows.map((t) => `<th>${t}</th>`).join('')}</tr><tr><td>Uniforme: d (m)</td>${rows.map((t) => `<td>${show(dU(t))}</td>`).join('')}</tr><tr><td>Acelerado: v (m/s)</td>${rows.map((t) => `<td>${show(vA(t))}</td>`).join('')}</tr><tr><td>Acelerado: d (m)</td>${rows.map((t) => `<td>${show(dA(t))}</td>`).join('')}</tr>`;
        el.querySelector('#pNote').innerHTML = st.a > 0 ? `En el acelerado la velocidad sube ${fmt(st.a)} m/s cada segundo: a los ${T} s va a ${fmt(st.vi)} + ${fmt(st.a)} × ${T} = <b>${show(vA(T))} m/s</b> (vf = vi + a·t).` : st.a < 0 ? `Con aceleración negativa la velocidad baja: a los ${T} s va a <b>${show(vA(T))} m/s</b>.` : 'Con a = 0, el “acelerado” también es uniforme: los puntos quedan igual de separados.';
      }
      bindSteppers(el, st, { v: [1, 20], vi: [0, 15], a: [-2, 6] }, { v: 1, vi: 1, a: 0.5 }, draw); draw();
    }
  };

  /* ---------- Factor unitario con unidades que se tachan ---------- */
  LAB.f_fu = {
    title: 'Factor unitario: ¿se tachan?', topic: 'f_conv',
    desc: 'Elige la conversión y voltea los factores. Si una unidad no se tacha, el resultado sale mal.',
    mount(el) {
      const keys = Object.keys(FU).filter((k) => FU[k].length === 2);
      const st = { key: keys[0], v: 90, flip: [false, false] };
      el.innerHTML = `<div class="seg" role="group" aria-label="conversión">${keys.map((k) => `<button type="button" data-k="${k}">${k.replace('>', ' → ')}</button>`).join('')}</div>
        <div class="lab-ctrl">${stepper('v', 'Valor', st.v, '')}</div><div class="fu-big" id="fuL"></div>
        <div class="lab-row"><button type="button" class="btn ghost sm" data-f="0">Voltear 1.er factor</button><button type="button" class="btn ghost sm" data-f="1">Voltear 2.º factor</button></div><p class="lab-note" id="fuN"></p>`;
      const unitPart = (s) => s.replace(/^[\d.,]+\s*/, '');
      function draw() {
        el.querySelectorAll('[data-k]').forEach((b) => b.classList.toggle('on', b.dataset.k === st.key));
        const [from, to] = st.key.split('>'); const [d0, t0] = from.split('/'); const ch = FU[st.key];
        const facs = ch.map((c, i) => (st.flip[i] ? [c[1], c[0], 1 / c[2]] : c));
        // ¿qué se tacha?
        const top = [d0], bot = [t0]; facs.forEach((c) => { top.push(unitPart(c[0])); bot.push(unitPart(c[1])); });
        const cancel = (u) => top.filter((x) => x === u).length && bot.filter((x) => x === u).length;
        const mark = (s, isTop) => { const u = unitPart(s); const n = s.slice(0, s.length - u.length); return n + (cancel(u) ? `<s>${u}</s>` : `<span class="bad-u">${u}</span>`); };
        const res = st.v * facs.reduce((p, c) => p * c[2], 1); const okAll = !st.flip[0] && !st.flip[1];
        el.querySelector('#fuL').innerHTML = `${fmt(st.v)} ${frac(cancel(d0) ? `<s>${d0}</s>` : `<span class="bad-u">${d0}</span>`, cancel(t0) ? `<s>${t0}</s>` : `<span class="bad-u">${t0}</span>`)} ${facs.map((c) => '× (' + frac(mark(c[0], true), mark(c[1], false)) + ')').join(' ')} = <b>${show(res)}</b> ${okAll ? to : '<span class="bad-u">?</span>'}`;
        el.querySelector('#fuN').innerHTML = okAll ? `Todas las unidades viejas se tachan y queda <b>${to}</b>. ${st.v} ${from} = <b>${show(res)} ${to}</b>.` : 'Hay unidades en rojo que <b>no se tachan</b>: el factor está volteado y el resultado no tiene sentido. Vuelve a voltearlo.';
      }
      el.querySelectorAll('[data-k]').forEach((b) => b.addEventListener('click', () => { st.key = b.dataset.k; st.flip = [false, false]; draw(); }));
      el.querySelectorAll('[data-f]').forEach((b) => b.addEventListener('click', () => { const i = Number(b.dataset.f); st.flip[i] = !st.flip[i]; draw(); }));
      bindSteppers(el, st, { v: [1, 300] }, { v: 5 }, draw); draw();
    }
  };

  global.Brujula.addLabs('fis', LAB);
})(window);
