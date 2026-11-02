/* Brújula — aplicación */
(function () {
  'use strict';
  const { TOPICS, KINDS, PLAN } = Content;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const strip = (html) => { const d = document.createElement('div'); d.innerHTML = html.replace(/<sup>/g, '^').replace(/<\/span><span>/g, ' / '); return d.textContent.replace(/\s+/g, ' ').trim(); };
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const fdate = (t) => new Date(t).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  /* ================= ALMACENAMIENTO ================= */
  const KEY = 'brujula.v1';
  const Store = {
    d: null,
    blank() { return { v: 1, created: Date.now(), attempts: [], ratings: {}, views: {}, diag: null, sims: [], days: [], notes: '', settings: { theme: 'auto', ses: 'autonoma' }, lastExport: null }; },
    load() {
      try { const raw = localStorage.getItem(KEY); this.d = raw ? Object.assign(this.blank(), JSON.parse(raw)) : this.blank(); }
      catch (e) { this.d = this.blank(); this.broken = true; }
      this.d.settings = Object.assign({ theme: 'auto', ses: 'autonoma' }, this.d.settings || {});
    },
    save() { try { localStorage.setItem(KEY, JSON.stringify(this.d)); this.broken = false; } catch (e) { this.broken = true; toast('No se pudo guardar en este dispositivo. Exporta un respaldo.'); } },
    markDay() { const t = today(); if (!this.d.days.includes(t)) { this.d.days.push(t); } },
    addAttempt(a) { this.d.attempts.push(a); this.markDay(); this.save(); },
    rate(id, v, meta) { this.d.ratings[id] = Object.assign({ v, t: Date.now() }, meta); this.markDay(); this.save(); }
  };
  Store.load();

  // Almacenamiento persistente
  const persist = { asked: false, granted: null };
  async function askPersist() {
    if (!navigator.storage || !navigator.storage.persist) { persist.granted = null; return; }
    try { persist.granted = await navigator.storage.persisted(); if (!persist.granted) persist.granted = await navigator.storage.persist(); } catch (e) { persist.granted = null; }
  }
  askPersist();

  /* ================= TEMA VISUAL ================= */
  function applyTheme() { const t = Store.d.settings.theme; if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t); }
  applyTheme();

  /* ================= UTILIDADES UI ================= */
  let toastT;
  function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 3200); }
  const kindTag = (k) => `<span class="tag k-${k}">${KINDS[k].name}</span>`;
  function mastery(topic) {
    const at = Store.d.attempts.filter((a) => a.topic === topic && a.mode !== 'detective').slice(-10);
    if (at.length < 3) return null;
    return at.filter((a) => a.ok).length / at.length;
  }
  function dots(topic) {
    const m = mastery(topic); const n = m === null ? 0 : Math.round(m * 5);
    let s = '<span class="dots" title="' + (m === null ? 'Sin práctica todavía' : 'Últimos intentos: ' + Math.round(m * 100) + '% correctos') + '">';
    for (let i = 0; i < 5; i++) s += '<i class="' + (i < n ? 'on' : '') + '"></i>';
    return s + '</span>';
  }
  const ratingBar = (id, meta) => {
    const r = Store.d.ratings[id];
    return `<div class="rate" data-rid="${id}" data-meta='${esc(JSON.stringify(meta))}'><span>¿Te ayudó?</span>
      <button type="button" data-v="si" class="${r && r.v === 'si' ? 'on' : ''}">Sí</button>
      <button type="button" data-v="mas" class="${r && r.v === 'mas' ? 'on' : ''}">Más o menos</button>
      <button type="button" data-v="no" class="${r && r.v === 'no' ? 'on' : ''}">No</button></div>`;
  };
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.rate button'); if (!b) return;
    const box = b.closest('.rate'); const meta = JSON.parse(box.dataset.meta);
    Store.rate(box.dataset.rid, b.dataset.v, meta);
    $$('button', box).forEach((x) => x.classList.toggle('on', x === b));
    toast('Anotado. Así sabremos qué explicaciones te funcionan.');
  });

  /* ================= ROUTER ================= */
  const routes = [];
  const route = (re, fn) => routes.push([re, fn]);
  let cleanup = null;
  function render() {
    if (cleanup) { cleanup(); cleanup = null; }
    const hash = location.hash.replace(/^#/, '') || '/';
    const main = $('#main');
    let matched = false;
    for (const [re, fn] of routes) {
      const m = hash.match(re);
      if (m) {
        matched = true; main.innerHTML = '';
        try { const r = fn(main, ...m.slice(1)); if (typeof r === 'function') cleanup = r; }
        catch (err) { showError(err, hash); }
        break;
      }
    }
    if (!matched) main.innerHTML = '<h1>Página no encontrada</h1><p><a class="btn" href="#/">Ir al inicio</a></p>';
    $$('.nav a').forEach((a) => { const t = a.getAttribute('href').slice(1); a.classList.toggle('on', t === '/' ? hash === '/' : hash.startsWith(t)); });
    window.scrollTo(0, 0);
    const h1 = $('#main h1'); if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
  }
  window.addEventListener('hashchange', render);

  /* Si algo falla, mostrarlo en pantalla en lugar de dejarla en blanco */
  const VERSION = '2.0.1';
  function showError(err, where) {
    try { console.error(err); } catch (e) { }
    const main = $('#main'); if (!main) return;
    const msg = (err && (err.message || err.reason || String(err))) || 'Error desconocido';
    const stack = err && err.stack ? String(err.stack).split('\n').slice(0, 3).join(' | ') : '';
    main.innerHTML = `<h1>Algo salió mal</h1><p>Esta pantalla no se pudo mostrar. Tu avance no se perdió.</p>
      <div class="card"><p class="small">Si se repite, toma captura de esta pantalla y compártela:</p>
      <p class="small mono" style="word-break:break-word">v${VERSION} · ${esc(where || location.hash)} · ${esc(msg)}<br>${esc(stack)}<br>${esc(navigator.userAgent)}</p></div>
      <div class="row wrap gap"><a class="btn" href="#/">Ir al inicio</a><button type="button" class="btn ghost" onclick="location.reload()">Recargar</button></div>`;
  }
  window.addEventListener('error', (e) => { if (!$('#main') || $('#main').children.length === 0) showError(e.error || e.message, 'global'); else toast('Ocurrió un error: ' + (e.message || '')); });
  window.addEventListener('unhandledrejection', (e) => { toast('Ocurrió un error: ' + ((e.reason && e.reason.message) || '')); });

  /* ================= INICIO ================= */
  function planStatus(key) {
    const d = Store.d;
    if (key === 'diag') return !!d.diag;
    if (key === 'sim') return d.sims.length > 0;
    if (key === 'det') return d.attempts.filter((a) => a.mode === 'detective').length >= 6;
    if (key === 'rep') return d.attempts.filter((a) => a.mode === 'repaso').length >= 8;
    const [k, topic] = key.split(':');
    if (k === 'lens') return Object.values(d.ratings).some((r) => r.topic === topic) || Object.keys(d.views).some((id) => (Content.lens(id) || {}).topic === topic);
    if (k === 'prac') return d.attempts.filter((a) => a.topic === topic && a.mode === 'practica').length >= 8;
    return false;
  }
  route(/^\/$/, (el) => {
    const d = Store.d;
    const needBackup = d.attempts.length > 0 && (!d.lastExport || Date.now() - d.lastExport > 2 * 864e5);
    el.innerHTML = `
      <header class="hero"><h1>Hola</h1><p class="muted">Explora cada tema de varias formas y quédate con la que mejor te funcione.</p></header>
      ${needBackup ? `<div class="banner warn"><div><b>Guarda un respaldo.</b> Tu avance vive solo en este dispositivo.</div><a class="btn sm" href="#/respaldo">Respaldar</a></div>` : ''}
      ${Store.broken ? `<div class="banner warn">Este navegador no está guardando datos (¿modo incógnito?). Lee <a href="#/respaldo">cómo cuidar tus datos</a>.</div>` : ''}
      <section class="card ses"><span>¿Cómo practicas hoy?</span><div class="seg" role="group"><button type="button" data-ses="autonoma">Por mi cuenta</button><button type="button" data-ses="acompanada">Con tutor</button></div></section>
      <section><h2>Plan hasta el martes</h2><div class="plan">${PLAN.map((p) => `<div class="card"><h3>${p.day}</h3><ul class="checks">${p.items.map((i) => `<li class="${planStatus(i.key) ? 'done' : ''}"><a href="${i.href}">${i.t}</a></li>`).join('')}</ul></div>`).join('')}</div></section>
      <section><h2>Temas del examen</h2><div class="grid">${TOPICS.filter((t) => t.kind === 'tema').map(topicCard).join('')}</div></section>
      <section><h2>Bases que conviene tener firmes</h2><div class="grid">${TOPICS.filter((t) => t.kind === 'fund').map(topicCard).join('')}</div></section>
      <section class="stats card"><div><b>${d.days.length}</b><span>día${d.days.length === 1 ? '' : 's'} de práctica</span></div><div><b>${d.attempts.length}</b><span>ejercicios</span></div><div><b>${Object.keys(d.ratings).length}</b><span>explicaciones valoradas</span></div></section>`;
    const sesBtns = $$('[data-ses]', el);
    const upd = () => sesBtns.forEach((b) => b.classList.toggle('on', b.dataset.ses === Store.d.settings.ses));
    sesBtns.forEach((b) => b.addEventListener('click', () => { Store.d.settings.ses = b.dataset.ses; Store.save(); upd(); }));
    upd();
  });
  function topicCard(t) {
    return `<a class="card topic" href="#/tema/${t.id}"><div class="row"><h3>${t.title}</h3>${dots(t.id)}</div><p class="muted">${t.summary}</p><div class="kinds">${[...new Set(t.lenses.map((l) => l.kind))].map(kindTag).join('')}${t.videos.length ? kindTag('video') : ''}</div></a>`;
  }

  /* ================= TEMAS ================= */
  route(/^\/temas$/, (el) => {
    el.innerHTML = `<h1>Temas</h1><p class="muted">Cada tema tiene varias explicaciones distintas. Valora cada una: así sabremos qué forma de explicar te funciona mejor.</p>
      <h2>Temas del examen</h2><div class="grid">${TOPICS.filter((t) => t.kind === 'tema').map(topicCard).join('')}</div>
      <h2>Bases</h2><div class="grid">${TOPICS.filter((t) => t.kind === 'fund').map(topicCard).join('')}</div>`;
  });
  function videoGroups(t) {
    const groups = []; t.videos.forEach((v) => { let g = groups.find((x) => x.st === (v.st || 'Videos')); if (!g) { g = { st: v.st || 'Videos', vs: [] }; groups.push(g); } g.vs.push(v); });
    return groups.map((g) => `<h3 class="vgroup">${g.st}</h3><div class="videos">${g.vs.map((v) => {
      const vid = 'v:' + t.id + ':' + v.url.replace(/^https?:\/\/(www\.)?/, '').slice(0, 80);
      return `<div class="card video"><a href="${v.url}" target="_blank" rel="noopener" data-vid="${esc(vid)}"><b>${v.title}</b><span class="muted">${v.ch}</span>${v.v ? '<span class="tag">directo</span>' : ''}</a>${ratingBar(vid, { kind: 'video', topic: t.id, title: v.ch + ': ' + v.title })}</div>`;
    }).join('')}</div>`).join('');
  }
  route(/^\/tema\/(\w+)(?:\/(.+))?$/, (el, id, focusLens) => {
    const t = Content.byId(id); if (!t) { el.innerHTML = '<p>No encontrado.</p>'; return; }
    const pre = t.prereq.map((p) => Content.byId(p));
    el.innerHTML = `<a class="back" href="#/temas">← Temas</a><h1>${t.title}</h1><p class="muted">${t.summary}</p>
      <div class="row wrap gap">${dots(t.id)}<a class="btn" href="#/practica/${t.id}">Practicar</a>${t.lab.map((l) => `<a class="btn ghost" href="#/lab/${l}">${LAB[l].title}</a>`).join('')}</div>
      ${pre.length ? `<div class="banner info"><div>Si algo de aquí se complica, puede venir de una base: ${pre.map((p) => `<a href="#/tema/${p.id}">${p.title}</a>`).join(' · ')}</div></div>` : ''}
      <h2>Explicaciones</h2><p class="muted small">Abre las que quieras, en el orden que quieras. Al final de cada una, dinos si te ayudó.</p>
      <div class="lenses">${t.lenses.map((l) => `<details class="lens card" id="lens-${l.id}" data-lid="${l.id}"${l.id === focusLens ? ' open' : ''}><summary>${kindTag(l.kind)}<span class="lt-title">${l.title}</span>${Store.d.ratings[l.id] ? '<span class="rated">valorada</span>' : ''}</summary><div class="lens-body">${l.html}${tryBoxHTML(l, t.id)}${ratingBar(l.id, { kind: l.kind, topic: t.id, title: l.title })}</div></details>`).join('')}</div>
      <h2>Videos</h2><p class="muted small">Distintos profes, distintas formas de explicar, ordenados por subtema. Los marcados con <span class="tag">directo</span> abren un video específico; los de “Más canales” abren una búsqueda en ese canal.</p>
      ${videoGroups(t)}`;
    $$('details.lens', el).forEach((d) => d.addEventListener('toggle', () => { if (d.open) { const id = d.dataset.lid; Store.d.views[id] = (Store.d.views[id] || 0) + 1; Store.markDay(); Store.save(); } }));
    $$('[data-vid]', el).forEach((a) => a.addEventListener('click', () => { const id = a.dataset.vid; Store.d.views[id] = (Store.d.views[id] || 0) + 1; Store.save(); }));
    if (focusLens) { const d = $('#lens-' + focusLens, el); if (d) setTimeout(() => d.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60); }
  });

  /* ================= MOTOR DE EJERCICIOS ================= */
  function inputHTML(it) {
    const pm = (target) => `<button type="button" class="pm" data-target="${target}" aria-label="cambiar signo">±</button>`;
    if (it.type === 'num') return `<div class="answer"><input class="ans" id="in-v" inputmode="decimal" autocomplete="off" aria-label="respuesta" placeholder="Tu respuesta">${pm('in-v')}</div>`;
    if (it.type === 'exp') return `<div class="answer expans">${it.fields.map((l, i) => `<span class="expin"><span class="base">${l}</span><input class="sup-in" id="in-e${i}" inputmode="decimal" autocomplete="off" aria-label="exponente de ${l}">${pm('in-e' + i)}</span>`).join('')}</div><p class="hint">Escribe el exponente de cada letra.</p>`;
    if (it.type === 'nc') return `<div class="answer ncans"><input class="ans" id="in-c" inputmode="decimal" autocomplete="off" aria-label="coeficiente" placeholder="coeficiente"><span> × 10</span><span class="expin"><input class="sup-in" id="in-e" inputmode="decimal" autocomplete="off" aria-label="exponente">${pm('in-e')}</span></div>`;
    if (it.type === 'mc') return `<div class="mc">${it.options.map((o, i) => `<button type="button" class="opt" data-i="${i}">${o}</button>`).join('')}</div>`;
    return '';
  }
  function readInput(root, it) {
    if (it.type === 'num') return { v: $('#in-v', root).value };
    if (it.type === 'exp') return { e: it.fields.map((_, i) => $('#in-e' + i, root).value) };
    if (it.type === 'nc') return { c: $('#in-c', root).value, e: $('#in-e', root).value };
    if (it.type === 'mc') { const s = $('.opt.sel', root); return { choice: s ? Number(s.dataset.i) : null }; }
  }
  const inputText = (it, inp) => it.type === 'num' ? inp.v : it.type === 'exp' ? it.fields.map((l, i) => l + '^' + inp.e[i]).join(' ') : it.type === 'nc' ? inp.c + ' × 10^' + inp.e : (inp.choice !== null ? strip(it.options[inp.choice]) : '');
  function wireInputs(root, onEnter) {
    $$('.pm', root).forEach((b) => b.addEventListener('click', () => {
      const i = $('#' + b.dataset.target, root); const v = i.value.trim();
      i.value = v.startsWith('-') || v.startsWith('−') ? v.slice(1) : '−' + v; i.focus();
    }));
    $$('.opt', root).forEach((b) => b.addEventListener('click', () => { $$('.opt', root).forEach((x) => x.classList.remove('sel')); b.classList.add('sel'); }));
    $$('input', root).forEach((i) => i.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); onEnter(); } }));
    const first = $('input', root); if (first && window.matchMedia('(pointer:fine)').matches) first.focus();
  }
  function errBox(r, it) {
    const E = Gen.ERR[r.err] || Gen.ERR.GENERIC;
    const L = E.lens ? Content.lens(E.lens) : null;
    const fromBase = L && Content.byId(L.topic).kind === 'fund' && L.topic !== it.topic;
    return `<div class="fb bad"><b>${E.t}</b><p>${E.m}</p>${L ? `<a class="lnk" href="#/tema/${L.topic}/${L.id}">${fromBase ? 'Repasa la base: ' : 'Ver explicación: '}${L.title} →</a>` : ''}</div>`;
  }

  /* ---------- Sesión de práctica (retroalimentación inmediata) ---------- */
  function pickSub(topic, only) {
    const subs = only ? [only] : Content.byId(topic).subs;
    const w = subs.map((s) => {
      const at = Store.d.attempts.filter((a) => a.sub === s).slice(-6);
      const er = at.length ? at.filter((a) => !a.ok).length / at.length : 0.5;
      return 1 + 3 * er;
    });
    let r = Math.random() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < subs.length; i++) { r -= w[i]; if (r <= 0) return subs[i]; }
    return subs[subs.length - 1];
  }
  route(/^\/practica$/, (el) => {
    el.innerHTML = `<h1>Práctica</h1><p class="muted">Cada respuesta incorrecta te dice <b>qué tipo de error</b> fue y te lleva a la explicación que lo resuelve. Los ejercicios se ajustan: aparece más lo que más cuesta.</p>
      <h2>Temas del examen</h2><div class="grid">${TOPICS.filter((t) => t.kind === 'tema').map(pracCard).join('')}</div>
      <h2>Bases</h2><div class="grid">${TOPICS.filter((t) => t.kind === 'fund').map(pracCard).join('')}</div>
      <h2>Entrenamientos especiales</h2><div class="grid">
        <a class="card topic" href="#/practica/errores"><h3>Repaso de mis errores</h3><p class="muted small">Una ronda armada con lo que más te ha costado últimamente.</p></a>
        <a class="card topic" href="#/detective"><h3>Detective de errores</h3><p class="muted small">Ejercicios ya resueltos con un paso equivocado. ¿Lo encuentras?</p></a>
        <a class="card topic" href="#/diagnostico"><h3>Diagnóstico corto</h3><p class="muted small">12 ejercicios para saber por dónde empezar.</p></a>
        <a class="card topic" href="#/simulacro"><h3>Simulacro de examen</h3><p class="muted small">15 ejercicios con calificación sobre 10.</p></a></div>`;
  });
  function pracCard(t) {
    const n = Store.d.attempts.filter((a) => a.topic === t.id).length;
    return `<a class="card topic" href="#/practica/${t.id}"><div class="row"><h3>${t.title}</h3>${dots(t.id)}</div><p class="muted small">${n} ejercicio${n === 1 ? '' : 's'} hechos</p></a>`;
  }
  function practiceSession(el, P) {
    const S = { n: 0, ok: 0, streak: 0, best: 0, total: 8, marks: [] };
    el.innerHTML = `<a class="back" href="#/practica">← Práctica</a><h1>${P.title}</h1>${P.intro || ''}${P.chips || ''}
      <div class="progress"><div class="marks"></div><span class="streak"></span></div><div id="stage"></div>`;
    const stage = $('#stage', el);
    function next() {
      if (S.n >= S.total) return summary();
      const it = Gen.make(P.pick()); const t0 = Date.now();
      stage.innerHTML = `<div class="card item"><div class="prompt">${it.prompt}</div>${inputHTML(it)}<div class="row gap mt"><button type="button" class="btn" id="chk">Revisar</button><button type="button" class="btn ghost sm" id="skip">No sé</button></div><div id="fb"></div></div>`;
      const go = () => {
        const inp = readInput(stage, it); const r = it.check(inp);
        if (r.err === 'INVALID') { $('#fb', stage).innerHTML = `<div class="fb neutral">${Gen.ERR.INVALID.m}</div>`; return; }
        finish(it, inp, r, t0);
      };
      $('#chk', stage).addEventListener('click', go);
      $('#skip', stage).addEventListener('click', () => finish(it, null, { ok: false, err: 'SKIP' }, t0));
      wireInputs(stage, go);
    }
    function finish(it, inp, r, t0) {
      S.n++; if (r.ok) { S.ok++; S.streak++; S.best = Math.max(S.best, S.streak); } else S.streak = 0;
      S.marks.push(r.ok);
      Store.addAttempt({ id: uid(), t: Date.now(), topic: it.topic, sub: it.sub, ok: r.ok, err: r.err, mode: P.mode, ses: Store.d.settings.ses, ms: Date.now() - t0, q: strip(it.prompt).slice(0, 140), a: inp ? inputText(it, inp) : '(no sé)' });
      $('.marks', el).innerHTML = S.marks.map((m) => `<i class="${m ? 'ok' : 'no'}"></i>`).join('') + '<i></i>'.repeat(Math.max(0, S.total - S.marks.length));
      $('.streak', el).textContent = S.streak >= 3 ? S.streak + ' seguidas' : '';
      const card = $('.item', stage);
      $$('input,.opt,.pm,#chk,#skip', card).forEach((x) => (x.disabled = true));
      const sol = `<details class="sol"><summary>Ver solución paso a paso</summary>${it.solution}</details>`;
      $('#fb', stage).innerHTML = (r.ok
        ? `<div class="fb good"><b>Correcto</b>${r.note ? '<p>' + r.note + '</p>' : ''}</div>`
        : r.err === 'SKIP' ? `<div class="fb neutral"><b>Respuesta:</b> <span class="mono">${it.answerText}</span></div>` : errBox(r, it) + `<p class="muted small">Respuesta correcta: <span class="mono">${it.answerText}</span></p>`)
        + sol + `<div class="row mt"><button type="button" class="btn" id="nx">${S.n >= S.total ? 'Ver resumen' : 'Siguiente'}</button></div>`;
      if (r.ok) card.classList.add('pulse');
      $('#nx', stage).addEventListener('click', next); $('#nx', stage).focus();
    }
    function summary() {
      const errs = Store.d.attempts.slice(-S.total).filter((a) => !a.ok && a.err && Gen.ERR[a.err]).map((a) => a.err);
      const uniq = [...new Set(errs)];
      stage.innerHTML = `<div class="card"><h2>${S.ok} de ${S.total}</h2><p class="muted">${S.best >= 3 ? 'Mejor racha: ' + S.best + ' seguidas. ' : ''}${S.ok >= 7 ? 'Muy bien.' : S.ok >= 5 ? 'Vas bien; repasa lo de abajo.' : 'Vale la pena revisar las explicaciones de abajo antes de seguir.'}</p>
        ${uniq.length ? '<h3>Lo que más conviene repasar</h3><ul class="links">' + uniq.map((e) => { const E = Gen.ERR[e]; const L = E.lens && Content.lens(E.lens); return `<li><b>${E.t}</b>${L ? ` — <a href="#/tema/${L.topic}/${L.id}">${L.title}</a>` : ''}</li>`; }).join('') + '</ul>' : ''}
        <div class="row gap mt wrap"><button type="button" class="btn" id="again">Otra ronda</button>${P.explHref ? `<a class="btn ghost" href="${P.explHref}">Explicaciones</a>` : ''}</div></div>`;
      $('#again', stage).addEventListener('click', () => { S.n = 0; S.ok = 0; S.streak = 0; S.marks = []; $('.marks', el).innerHTML = ''; next(); });
    }
    next();
  }
  // Errores recientes: qué tipos de ejercicio conviene repasar
  function recentErrorSubs() {
    const w = {};
    Store.d.attempts.slice(-60).forEach((a) => { if (!a.ok && a.sub && Gen.SUBS[a.sub] && a.mode !== 'detective') w[a.sub] = (w[a.sub] || 0) + (a.err === 'SKIP' ? 1 : 2); });
    return w;
  }
  function weightedPick(w) {
    const keys = Object.keys(w); let r = Math.random() * keys.reduce((s, k) => s + w[k], 0);
    for (const k of keys) { r -= w[k]; if (r <= 0) return k; }
    return keys[keys.length - 1];
  }
  route(/^\/practica\/errores$/, (el) => {
    let w = recentErrorSubs(); const empty = !Object.keys(w).length;
    if (empty) { w = {}; Object.values(Gen.SIM).flat().forEach((k) => { w[k] = 1; }); }
    const top = Object.entries(w).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k]) => Gen.SUBS[k].name);
    practiceSession(el, {
      title: 'Repaso de mis errores', mode: 'repaso', pick: () => weightedPick(w), explHref: '#/temas',
      intro: `<p class="muted">${empty ? 'Todavía no hay errores registrados, así que esta ronda mezcla los tres temas.' : 'Esta ronda se arma con lo que más te ha costado últimamente: ' + top.join(' · ') + '.'}</p>`
    });
  });
  route(/^\/practica\/(\w+)(?:\/(\w+))?$/, (el, topic, only) => {
    const t = Content.byId(topic); if (!t) return;
    practiceSession(el, {
      title: t.title, mode: 'practica', pick: () => pickSub(topic, only), explHref: '#/tema/' + topic,
      chips: `<div class="chipsel" role="group" aria-label="tipo de ejercicio"><a class="pill ${!only ? 'on' : ''}" href="#/practica/${topic}">Mezcla</a>${t.subs.map((s) => `<a class="pill ${only === s ? 'on' : ''}" href="#/practica/${topic}/${s}">${Gen.SUBS[s].name}</a>`).join('')}</div>`
    });
  });

  /* ---------- Pruébalo: 3 ejercicios al final de cada explicación ---------- */
  function lensTryStats(lid) { const at = Store.d.attempts.filter((a) => a.mode === 'lens' && a.lens === lid); return at.length ? { ok: at.filter((a) => a.ok).length, n: at.length } : null; }
  function tryBoxHTML(l, topic) {
    const st = lensTryStats(l.id);
    return `<div class="tryit" data-lid="${l.id}" data-kind="${l.kind}" data-topic="${topic}"><div class="row wrap gap"><button type="button" class="btn sm" data-try>Pruébalo: 3 ejercicios</button><span class="small muted">${st ? 'Llevas ' + st.ok + ' de ' + st.n + ' con esta explicación' : 'Comprueba si esta forma de explicar te funciona'}</span></div></div>`;
  }
  function miniTry(box) {
    const lid = box.dataset.lid, kind = box.dataset.kind, topic = box.dataset.topic;
    const subs = (Content.LENS_SUBS && Content.LENS_SUBS[lid]) || Content.byId(topic).subs;
    const N = 3; let k = 0, okc = 0;
    function step() {
      if (k >= N) {
        box.innerHTML = `<div class="fb ${okc >= 2 ? 'good' : 'neutral'}"><b>${okc} de ${N}</b><p>${okc === N ? 'Esta explicación te funcionó muy bien.' : okc >= 2 ? 'Vas bien con esta explicación.' : 'Quizá otra explicación de este tema te funcione mejor. Prueba una de otro tipo.'}</p></div><button type="button" class="btn ghost sm mt" data-try>Otra vez</button>`;
        $('[data-try]', box).addEventListener('click', () => { k = 0; okc = 0; step(); });
        return;
      }
      const it = Gen.make(Gen.pick(subs)); const t0 = Date.now();
      box.innerHTML = `<div class="item mini"><p class="small muted">${k + 1} de ${N}</p><div class="prompt">${it.prompt}</div>${inputHTML(it)}<div class="row gap mt"><button type="button" class="btn sm" data-chk>Revisar</button><button type="button" class="btn ghost sm" data-skip>No sé</button></div><div data-fb></div></div>`;
      const done = (inp, r) => {
        if (r.ok) okc++;
        Store.addAttempt({ id: uid(), t: Date.now(), topic: it.topic, sub: it.sub, ok: r.ok, err: r.err, mode: 'lens', lens: lid, kind, ses: Store.d.settings.ses, ms: Date.now() - t0, q: strip(it.prompt).slice(0, 140), a: inp ? inputText(it, inp) : '(no sé)' });
        $$('input,.opt,.pm,[data-chk],[data-skip]', box).forEach((x) => (x.disabled = true));
        $('[data-fb]', box).innerHTML = (r.ok ? `<div class="fb good"><b>Correcto</b></div>` : (r.err === 'SKIP' ? '' : errBox(r, it)) + `<p class="small muted">Respuesta: <span class="mono">${it.answerText}</span></p><details class="sol"><summary>Ver solución</summary>${it.solution}</details>`) + `<button type="button" class="btn sm mt" data-nx>${k + 1 >= N ? 'Ver resultado' : 'Siguiente'}</button>`;
        $('[data-nx]', box).addEventListener('click', () => { k++; step(); });
      };
      const go = () => { const inp = readInput(box, it); const r = it.check(inp); if (r.err === 'INVALID') { $('[data-fb]', box).innerHTML = `<div class="fb neutral">${Gen.ERR.INVALID.m}</div>`; return; } done(inp, r); };
      $('[data-chk]', box).addEventListener('click', go);
      $('[data-skip]', box).addEventListener('click', () => done(null, { ok: false, err: 'SKIP' }));
      wireInputs(box, go);
    }
    step();
  }
  document.addEventListener('click', (e) => { const b = e.target.closest('.tryit [data-try]'); if (b && !b.closest('.tryit').dataset.running) { const box = b.closest('.tryit'); box.dataset.running = '1'; miniTry(box); } });

  /* ---------- Detective de errores ---------- */
  route(/^\/detective$/, (el) => {
    const counts = {}; Store.d.attempts.slice(-80).forEach((a) => { if (!a.ok && a.err) counts[a.err] = (counts[a.err] || 0) + 1; });
    const S = { n: 0, ok: 0, hint: 0, total: 6, marks: [] };
    el.innerHTML = `<a class="back" href="#/practica">← Práctica</a><h1>Detective de errores</h1>
      <p class="muted">Cada ejercicio ya está resuelto, pero en algún paso hubo una equivocación. Como un error <b>se arrastra</b> a los pasos que siguen, el resultado final también queda mal. Tu misión: encontrar <b>dónde empieza</b> el error.</p>
      <div class="progress"><div class="marks"></div></div><div id="stage"></div>`;
    const stage = $('#stage', el);
    const drawMarks = () => { $('.marks', el).innerHTML = S.marks.map((m) => `<i class="${m === 2 ? 'ok' : m === 1 ? 'mid' : 'no'}"></i>`).join('') + '<i></i>'.repeat(Math.max(0, S.total - S.marks.length)); };
    function next() {
      if (S.n >= S.total) {
        stage.innerHTML = `<div class="card"><h2>${S.ok} de ${S.total} a la primera</h2><p class="muted">${S.hint ? S.hint + ' más con una pista. ' : ''}${S.ok >= 5 ? 'Tienes buen ojo.' : 'Revisa las explicaciones de los errores que se te pasaron.'}</p><div class="row gap mt wrap"><button type="button" class="btn" id="again">Otra ronda</button><a class="btn ghost" href="#/practica/errores">Repaso de mis errores</a></div></div>`;
        $('#again', stage).addEventListener('click', () => { S.n = 0; S.ok = 0; S.hint = 0; S.marks = []; $('.marks', el).innerHTML = ''; next(); });
        return;
      }
      const it = Detective.make(counts); const t0 = Date.now(); const picks = [];
      stage.innerHTML = `<div class="card item"><p class="small muted">Ejercicio</p><p class="expr det-expr">${it.prompt}</p><p><b>¿En qué paso empieza el error?</b></p>
        <p class="hint">Ojo: los pasos de después también pueden verse mal, porque arrastran el error.</p>
        <ol class="det-steps">${it.steps.map((s, i) => `<li><button type="button" class="det-step" data-i="${i}"><span class="det-n">${i + 1}</span><span class="det-txt">${s}</span></button></li>`).join('')}</ol><div id="fb"></div></div>`;
      const btn = (i) => $(`.det-step[data-i="${i}"]`, stage);
      function finish(found) {
        const first = found && picks.length === 1;
        S.n++; if (first) S.ok++; else if (found) S.hint++;
        S.marks.push(first ? 2 : found ? 1 : 0); drawMarks();
        Store.addAttempt({ id: uid(), t: Date.now(), topic: it.topic, sub: 'detective', ok: first, found, err: null, det: it.err, mode: 'detective', ses: Store.d.settings.ses, ms: Date.now() - t0, q: strip(it.prompt).slice(0, 140), a: 'pasos ' + picks.map((p) => p + 1).join(', ') });
        $$('.det-step', stage).forEach((x) => {
          x.disabled = true; const xi = Number(x.dataset.i);
          if (xi === it.wrong) { x.classList.add('is-wrong'); $('.det-txt', x).insertAdjacentHTML('beforeend', ' <span class="det-lbl">aquí empieza</span>'); }
          else if (xi > it.wrong) { x.classList.add('drag'); $('.det-txt', x).insertAdjacentHTML('beforeend', ' <span class="det-lbl">arrastra el error</span>'); }
          else x.classList.add('fine');
        });
        const E = Gen.ERR[it.err] || Gen.ERR.GENERIC; const L = E.lens && Content.lens(E.lens);
        $('#fb', stage).innerHTML = `<div class="fb ${first ? 'good' : found ? 'neutral' : 'bad'}"><b>${first ? '¡Lo encontraste a la primera!' : found ? '¡Lo encontraste con la pista!' : 'El error empezaba en el paso ' + (it.wrong + 1)}</b><p><b>${E.t}.</b> ${E.m}</p><p>Así debía quedar: ${it.fix}</p>${L ? `<a class="lnk" href="#/tema/${L.topic}/${L.id}">Ver explicación: ${L.title} →</a>` : ''}</div><div class="row mt"><button type="button" class="btn" id="nx">${S.n >= S.total ? 'Ver resumen' : 'Siguiente'}</button></div>`;
        $('#nx', stage).addEventListener('click', next); $('#nx', stage).focus();
      }
      $$('.det-step', stage).forEach((b) => b.addEventListener('click', () => {
        const i = Number(b.dataset.i); picks.push(i);
        if (i === it.wrong) return finish(true);
        if (picks.length >= 2) return finish(false);
        b.disabled = true;
        if (i > it.wrong) {
          b.classList.add('drag');
          $('#fb', stage).innerHTML = `<div class="fb neutral"><b>Casi.</b> Ese paso sí quedó mal, pero solo <b>arrastra</b> un error que viene de antes. ¿En qué paso empezó? Tienes otra oportunidad.</div>`;
        } else {
          b.classList.add('fine');
          $('#fb', stage).innerHTML = `<div class="fb neutral"><b>Ese paso está bien.</b> El error empieza más abajo. Tienes otra oportunidad.</div>`;
        }
      }));
    }
    next();
  });

  /* ---------- Diagnóstico y simulacro (sin retroalimentación inmediata) ---------- */
  function runTest(el, opts) {
    const items = opts.subs.map((s) => Gen.make(s));
    const res = []; let i = 0; const t0 = Date.now(); let timer = null;
    const stage = $('#stage', el);
    if (opts.timer) { const tEl = $('.timer', el); timer = setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); tEl.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }, 1000); }
    function show() { try { showInner(); } catch (err) { if (timer) clearInterval(timer); showError(err, opts.mode); } }
    function showInner() {
      if (i >= items.length) { if (timer) clearInterval(timer); return opts.done(items, res, Date.now() - t0); }
      const it = items[i]; const ti = Date.now();
      $('.marks', el).innerHTML = items.map((_, k) => `<i class="${k < i ? 'fill' : k === i ? 'cur' : ''}"></i>`).join('');
      stage.innerHTML = `<div class="card item"><p class="muted small">${i + 1} de ${items.length}</p><div class="prompt">${it.prompt}</div>${inputHTML(it)}<div class="row gap mt"><button type="button" class="btn" id="nx">${i === items.length - 1 ? 'Terminar' : 'Siguiente'}</button><button type="button" class="btn ghost sm" id="skip">No sé</button></div><div id="fb"></div></div>`;
      const go = (skip) => {
        const inp = skip ? null : readInput(stage, it);
        const r = skip ? { ok: false, err: 'SKIP' } : it.check(inp);
        if (!skip && r.err === 'INVALID') { $('#fb', stage).innerHTML = `<div class="fb neutral">${Gen.ERR.INVALID.m} O elige “No sé”.</div>`; return; }
        res.push({ it, inp, r });
        Store.addAttempt({ id: uid(), t: Date.now(), topic: it.topic, sub: it.sub, ok: r.ok, err: r.err, mode: opts.mode, ses: Store.d.settings.ses, ms: Date.now() - ti, q: strip(it.prompt).slice(0, 140), a: inp ? inputText(it, inp) : '(no sé)' });
        i++; show();
      };
      $('#nx', stage).addEventListener('click', () => go(false));
      $('#skip', stage).addEventListener('click', () => go(true));
      wireInputs(stage, () => go(false));
    }
    show();
    return () => { if (timer) clearInterval(timer); };
  }
  function reviewList(res) {
    return '<div class="review">' + res.map(({ it, inp, r }, k) => {
      const E = r.ok ? null : (Gen.ERR[r.err] || (r.err === 'SKIP' ? { t: 'Sin responder', lens: null } : Gen.ERR.GENERIC));
      const L = E && E.lens ? Content.lens(E.lens) : null;
      return `<div class="rv ${r.ok ? 'ok' : 'no'}"><div class="rv-n">${k + 1}</div><div><div class="prompt sm">${it.prompt}</div>
        <p class="small">Tu respuesta: <span class="mono">${inp ? esc(inputText(it, inp)) : '—'}</span>${r.ok ? ' ✓' : ` · Correcta: <span class="mono">${it.answerText}</span>`}</p>
        ${E ? `<p class="small"><b>${E.t}</b>${L ? ` · <a href="#/tema/${L.topic}/${L.id}">${L.title}</a>` : ''}</p>` : ''}
        <details class="sol"><summary>Solución</summary>${it.solution}</details></div></div>`;
    }).join('') + '</div>';
  }
  route(/^\/diagnostico$/, (el) => {
    const prev = Store.d.diag;
    el.innerHTML = `<a class="back" href="#/practica">← Práctica</a><h1>Diagnóstico corto</h1>
      <p class="muted">12 ejercicios rápidos de los tres temas y sus bases. No cuenta como calificación: sirve para saber por dónde empezar. Si no sabes uno, elige “No sé”, también es información útil.</p>
      ${prev ? `<p class="small muted">Último diagnóstico: ${fdate(prev.t)} · ${prev.score} de ${prev.total}</p>` : ''}
      <button type="button" class="btn" id="start">Empezar</button><div class="progress"><div class="marks"></div></div><div id="stage"></div>`;
    let stop = null;
    $('#start', el).addEventListener('click', (e) => {
      e.target.remove();
      stop = runTest(el, {
        subs: Gen.DIAG, mode: 'diag', done: (items, res) => {
          const by = {}; res.forEach(({ it, r }) => { by[it.topic] = by[it.topic] || { ok: 0, n: 0, errs: [] }; by[it.topic].n++; if (r.ok) by[it.topic].ok++; else if (r.err) by[it.topic].errs.push(r.err); });
          const score = res.filter((x) => x.r.ok).length;
          Store.d.diag = { t: Date.now(), score, total: res.length, by }; Store.save();
          const order = ['enteros', 'posicional', 'exponente', 'signos', 'exponentes', 'nc'];
          const weak = order.filter((tp) => by[tp] && by[tp].ok < by[tp].n);
          $('#stage', el).innerHTML = `<div class="card"><h2>${score} de ${res.length}</h2>
            <table class="tbl">${order.filter((tp) => by[tp]).map((tp) => `<tr><td><a href="#/tema/${tp}">${Content.byId(tp).title}</a></td><td>${by[tp].ok} / ${by[tp].n}</td></tr>`).join('')}</table>
            ${weak.length ? `<h3>Sugerencia de ruta</h3><ol class="links">${weak.map((tp) => `<li><a href="#/tema/${tp}">${Content.byId(tp).title}</a>${Content.byId(tp).kind === 'fund' ? ' <span class="tag">base</span>' : ''}</li>`).join('')}</ol>` : '<p>Todo correcto. Ve directo al simulacro.</p>'}
            <h3>Revisión</h3>${reviewList(res)}</div>`;
        }
      });
    });
    return () => stop && stop();
  });
  route(/^\/simulacro$/, (el) => {
    const sims = Store.d.sims;
    el.innerHTML = `<a class="back" href="#/practica">← Práctica</a><h1>Simulacro de examen</h1>
      <p class="muted">15 ejercicios: 5 de regla de los signos, 5 de leyes de los exponentes y 5 de notación científica, como en un examen. Las respuestas se revisan al final. Ten cuaderno y lápiz a la mano.</p>
      ${sims.length ? `<p class="small muted">Simulacros anteriores: ${sims.slice(-5).map((s) => s.grade.toFixed(1)).join(' · ')}</p>` : ''}
      <button type="button" class="btn" id="start">Empezar</button><div class="progress"><div class="marks"></div><span class="timer mono"></span></div><div id="stage"></div>`;
    let stop = null;
    $('#start', el).addEventListener('click', (e) => {
      e.target.remove();
      const subs = Gen.shuffle(Object.values(Gen.SIM).flat());
      stop = runTest(el, {
        subs, mode: 'sim', timer: true, done: (items, res, ms) => {
          const ok = res.filter((x) => x.r.ok).length; const grade = Math.round((ok / res.length) * 100) / 10;
          const by = {}; res.forEach(({ it, r }) => { by[it.topic] = by[it.topic] || { ok: 0, n: 0 }; by[it.topic].n++; if (r.ok) by[it.topic].ok++; });
          Store.d.sims.push({ t: Date.now(), ok, total: res.length, grade, ms, by, ses: Store.d.settings.ses }); Store.save();
          $('#stage', el).innerHTML = `<div class="card"><h2 class="grade ${grade >= 8 ? 'good' : ''}">${grade.toFixed(1)}</h2><p class="muted">${ok} de ${res.length} · ${Math.round(ms / 60000)} min</p>
            <table class="tbl">${Object.keys(by).map((tp) => `<tr><td><a href="#/tema/${tp}">${Content.byId(tp).title}</a></td><td>${by[tp].ok} / ${by[tp].n}</td><td><a class="small" href="#/practica/${tp}">practicar</a></td></tr>`).join('')}</table>
            <h3>Revisión</h3>${reviewList(res)}<div class="row gap mt"><a class="btn" href="#/simulacro" onclick="setTimeout(()=>dispatchEvent(new HashChangeEvent('hashchange')),0)">Otro simulacro</a></div></div>`;
        }
      });
    });
    return () => stop && stop();
  });

  /* ================= LABORATORIO ================= */
  route(/^\/lab$/, (el) => {
    el.innerHTML = `<h1>Laboratorio</h1><p class="muted">Herramientas para mover, ver y probar. No hay respuestas incorrectas aquí.</p><div class="grid">${Object.entries(LAB).map(([id, l]) => `<a class="card topic" href="#/lab/${id}"><h3>${l.title}</h3><p class="muted small">${l.desc}</p></a>`).join('')}</div>`;
  });
  route(/^\/lab\/(\w+)$/, (el, id) => {
    const l = LAB[id]; if (!l) return;
    const t = Content.byId(l.topic);
    const rid = 'lab:' + id;
    el.innerHTML = `<a class="back" href="#/lab">← Laboratorio</a><h1>${l.title}</h1><p class="muted">${l.desc}</p><div class="card lab" id="labroot"></div>${ratingBar(rid, { kind: 'visual', topic: l.topic, title: 'Laboratorio: ' + l.title })}<p class="small mt">Relacionado: <a href="#/tema/${t.id}">${t.title}</a></p>`;
    l.mount($('#labroot', el)); Store.d.views[rid] = (Store.d.views[rid] || 0) + 1; Store.save();
  });

  /* ================= MÁS ================= */
  route(/^\/mas$/, (el) => {
    el.innerHTML = `<h1>Más</h1><div class="grid">
      <a class="card topic" href="#/simulacro"><h3>Simulacro de examen</h3><p class="muted small">15 ejercicios con calificación sobre 10.</p></a>
      <a class="card topic" href="#/diagnostico"><h3>Diagnóstico corto</h3><p class="muted small">Para saber por dónde empezar.</p></a>
      <a class="card topic" href="#/respaldo"><h3>Mis datos y respaldo</h3><p class="muted small">Cómo conservar tu avance.</p></a>
      <a class="card topic" href="#/tutor"><h3>Panel del tutor</h3><p class="muted small">Qué explicaciones funcionan y qué errores se repiten.</p></a>
      <a class="card topic" href="#/informe"><h3>Informe para adecuar material</h3><p class="muted small">Resumen imprimible: qué le funciona, qué le cuesta y recomendaciones.</p></a></div>
      <h2>Apariencia</h2><div class="seg" role="group"><button type="button" data-th="auto">Automático</button><button type="button" data-th="light">Claro</button><button type="button" data-th="dark">Oscuro</button></div>
      <div id="install" class="mt"></div><p class="small muted mt">Versión ${VERSION}</p>`;
    const btns = $$('[data-th]', el); const upd = () => btns.forEach((b) => b.classList.toggle('on', b.dataset.th === Store.d.settings.theme));
    btns.forEach((b) => b.addEventListener('click', () => { Store.d.settings.theme = b.dataset.th; Store.save(); applyTheme(); upd(); })); upd();
    installUI($('#install', el));
  });

  /* ================= RESPALDO ================= */
  function download(name, text, type) {
    const blob = new Blob([text], { type }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
  }
  const csvCell = (v) => { const s = v === null || v === undefined ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  function exportJSON() { const d = Store.d; d.lastExport = Date.now(); Store.save(); download('brujula-respaldo-' + today() + '.json', JSON.stringify(d, null, 1), 'application/json'); toast('Respaldo descargado. Guárdalo en un lugar seguro.'); }
  function exportCSV() {
    const rows = [['fecha', 'tema', 'tipo', 'modo', 'sesion', 'correcto', 'error', 'segundos', 'ejercicio', 'respuesta']];
    Store.d.attempts.forEach((a) => rows.push([new Date(a.t).toISOString(), a.topic, Gen.SUBS[a.sub] ? Gen.SUBS[a.sub].name : a.sub, a.mode, a.ses, a.ok ? 'sí' : 'no', a.err ? (Gen.ERR[a.err] ? Gen.ERR[a.err].t : a.err) : '', Math.round((a.ms || 0) / 1000), a.q, a.a]));
    download('brujula-intentos-' + today() + '.csv', '﻿' + rows.map((r) => r.map(csvCell).join(',')).join('\n'), 'text/csv');
    const r2 = [['fecha', 'tema', 'tipo_explicacion', 'explicacion', 'valoracion', 'veces_abierta']];
    Object.entries(Store.d.ratings).forEach(([id, r]) => r2.push([new Date(r.t).toISOString(), r.topic, KINDS[r.kind] ? KINDS[r.kind].name : r.kind, r.title, { si: 'me ayudó', mas: 'más o menos', no: 'no me ayudó' }[r.v], Store.d.views[id] || 0]));
    setTimeout(() => download('brujula-valoraciones-' + today() + '.csv', '﻿' + r2.map((r) => r.map(csvCell).join(',')).join('\n'), 'text/csv'), 400);
  }
  function importJSON(file) {
    const fr = new FileReader();
    fr.onload = () => {
      try {
        const inc = JSON.parse(fr.result); if (!inc || !Array.isArray(inc.attempts)) throw new Error('formato');
        const d = Store.d; const ids = new Set(d.attempts.map((a) => a.id));
        inc.attempts.forEach((a) => { if (!ids.has(a.id)) d.attempts.push(a); });
        d.attempts.sort((a, b) => a.t - b.t);
        Object.entries(inc.ratings || {}).forEach(([k, r]) => { if (!d.ratings[k] || d.ratings[k].t < r.t) d.ratings[k] = r; });
        Object.entries(inc.views || {}).forEach(([k, v]) => { d.views[k] = Math.max(d.views[k] || 0, v); });
        const st = new Set(d.sims.map((s) => s.t)); (inc.sims || []).forEach((s) => { if (!st.has(s.t)) d.sims.push(s); }); d.sims.sort((a, b) => a.t - b.t);
        if (inc.diag && (!d.diag || inc.diag.t > d.diag.t)) d.diag = inc.diag;
        d.days = [...new Set(d.days.concat(inc.days || []))].sort();
        if (inc.notes && inc.notes !== d.notes) d.notes = d.notes ? d.notes + '\n\n' + inc.notes : inc.notes;
        Store.save(); toast('Respaldo importado y combinado con lo que ya había.'); render();
      } catch (e) { toast('Ese archivo no parece un respaldo de Brújula.'); }
    };
    fr.readAsText(file);
  }
  route(/^\/respaldo$/, (el) => {
    const d = Store.d;
    el.innerHTML = `<h1>Mis datos y respaldo</h1>
      <div class="card"><h2>Dónde se guarda tu avance</h2><p>Todo lo que haces aquí se guarda <b>solo en este dispositivo y en este navegador</b>. No se envía a ningún servidor. Eso lo hace privado, pero también significa que <b>si se borran los datos del navegador, se pierde el avance</b>, a menos que tengas un respaldo.</p>
      <p class="small" id="pst"></p></div>
      <div class="card"><h2>Reglas para no perder tus datos</h2><ol class="rules">
        <li><b>Instala la app</b> en la pantalla de inicio (abajo están los pasos). En iPhone y iPad es indispensable: Safari puede borrar los datos de una página web que no se abre en 7 días, pero no los de una app instalada.</li>
        <li><b>Usa siempre el mismo navegador</b> en cada dispositivo. Chrome y Safari no comparten datos entre sí.</li>
        <li><b>No uses modo incógnito ni privado.</b> Ahí todo se borra al cerrar la pestaña.</li>
        <li><b>No borres “cookies y datos de sitios”</b>. Si limpias el historial, desmarca esa casilla. Las apps de “limpieza” o “liberar espacio” del celular también pueden borrarlos.</li>
        <li><b>Descarga un respaldo al terminar cada sesión</b> con el botón de abajo y guárdalo en tu Drive, correo o una carpeta. Basta con el más reciente.</li>
        <li><b>Celular y laptop guardan avances separados.</b> Para juntarlos: descarga el respaldo en uno e impórtalo en el otro. Se combinan sin duplicar.</li>
      </ol></div>
      <div class="card"><h2>Respaldo</h2><p class="small muted">${d.attempts.length} ejercicios · ${Object.keys(d.ratings).length} valoraciones · ${d.sims.length} simulacros${d.lastExport ? ' · último respaldo: ' + fdate(d.lastExport) : ' · sin respaldo todavía'}</p>
        <div class="row wrap gap"><button type="button" class="btn" id="exj">Descargar respaldo</button><label class="btn ghost"><input type="file" accept=".json,application/json" id="imp" hidden>Importar respaldo</label><button type="button" class="btn ghost" id="exc">Descargar tablas (CSV)</button></div>
        <p class="small muted mt">El respaldo (.json) sirve para restaurar o pasar el avance a otro dispositivo. Las tablas (.csv) se abren en Excel o Google Sheets.</p></div>
      <div class="card"><h2>Instalar como app</h2><div id="install"></div>
        <ul class="small"><li><b>Android (Chrome):</b> menú ⋮ → “Instalar app” o “Agregar a pantalla principal”.</li><li><b>iPhone/iPad (Safari):</b> botón Compartir → “Agregar a inicio”.</li><li><b>Laptop (Chrome o Edge):</b> ícono de instalar en la barra de dirección, o menú → “Instalar Brújula”.</li></ul></div>
      <details class="card"><summary>Borrar todo el avance de este dispositivo</summary><p class="small">Descarga un respaldo antes. Esta acción no se puede deshacer.</p><button type="button" class="btn danger sm" id="wipe">Borrar todo</button></details>`;
    const pst = $('#pst', el);
    (async () => {
      let txt = '';
      if (persist.granted === true) txt = '✓ Este navegador marcó tus datos como <b>persistentes</b>: no los borrará por falta de espacio.';
      else if (persist.granted === false) txt = 'El navegador todavía no garantiza conservar los datos. Instalar la app ayuda a que lo haga.';
      else txt = 'Este navegador no informa si conservará los datos. Sigue las reglas de abajo y respalda seguido.';
      try { if (navigator.storage && navigator.storage.estimate) { const e = await navigator.storage.estimate(); txt += ' Espacio usado: ' + Math.max(1, Math.round((e.usage || 0) / 1024)) + ' KB.'; } } catch (e) { }
      pst.innerHTML = txt;
    })();
    $('#exj', el).addEventListener('click', exportJSON);
    $('#exc', el).addEventListener('click', exportCSV);
    $('#imp', el).addEventListener('change', (e) => { if (e.target.files[0]) importJSON(e.target.files[0]); });
    $('#wipe', el).addEventListener('click', () => { if (confirm('¿Seguro? Se borrará todo el avance de este dispositivo.')) { Store.d = Store.blank(); Store.save(); toast('Avance borrado.'); render(); } });
    installUI($('#install', el));
  });

  /* ================= INSTALACIÓN ================= */
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; const s = $('#install'); if (s) installUI(s); });
  function installUI(slot) {
    if (!slot) return;
    const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    if (standalone) { slot.innerHTML = '<p class="small good">✓ Estás usando la app instalada.</p>'; return; }
    if (deferredPrompt) {
      slot.innerHTML = '<button type="button" class="btn">Instalar Brújula</button>';
      $('button', slot).addEventListener('click', async () => { deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; installUI(slot); askPersist(); });
    } else slot.innerHTML = '<p class="small muted">Sigue los pasos de tu dispositivo:</p>';
  }

  /* ================= ANÁLISIS (panel e informe) ================= */
  const EXAM = ['signos', 'exponentes', 'nc'];
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const solving = (a) => a.mode !== 'detective';
  function dayKey(t) { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  const dayLabel = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' }); };
  function evolution(A) {
    const days = [...new Set(A.filter(solving).map((a) => dayKey(a.t)))].sort();
    const series = EXAM.map((tp) => ({ tp, name: Content.byId(tp).title, pts: days.map((dk) => { const at = A.filter((a) => solving(a) && a.topic === tp && dayKey(a.t) === dk); return at.length >= 3 ? { dk, v: pct(at.filter((a) => a.ok).length, at.length), n: at.length } : null; }) }));
    return { days, series };
  }
  function evoChart(ev) {
    const W = 560, H = 230, pl = 36, pr = 92, pt = 14, pb = 30;
    const n = ev.days.length; const X = (i) => pl + (n === 1 ? (W - pl - pr) / 2 : (i * (W - pl - pr)) / (n - 1)); const Y = (v) => pt + ((100 - v) * (H - pt - pb)) / 100;
    let g = '';
    [0, 50, 80, 100].forEach((v) => { g += `<line x1="${pl}" x2="${W - pr}" y1="${Y(v)}" y2="${Y(v)}" class="${v === 80 ? 'goal' : 'grid'}"/><text x="${pl - 6}" y="${Y(v) + 4}" class="ax" text-anchor="end">${v}%</text>`; });
    g += `<text x="${pl + 4}" y="${Y(80) - 5}" class="ax">meta: 8</text>`;
    ev.days.forEach((dk, i) => { g += `<text x="${X(i)}" y="${H - 8}" class="ax" text-anchor="middle">${dayLabel(dk)}</text>`; });
    const lastY = [];
    ev.series.forEach((s, si) => {
      const pts = s.pts.map((p, i) => (p ? [X(i), Y(p.v), p] : null)).filter(Boolean);
      if (!pts.length) return;
      if (pts.length > 1) g += `<polyline class="ln s${si + 1}" points="${pts.map((p) => p[0] + ',' + p[1]).join(' ')}"/>`;
      pts.forEach(([x, y, p]) => { g += `<circle class="pt s${si + 1}" cx="${x}" cy="${y}" r="5" data-tip="${esc(s.name + ' · ' + dayLabel(p.dk) + ': ' + p.v + '% de ' + p.n)}"/>`; });
      const [lx, ly] = pts[pts.length - 1]; let yy = ly; while (lastY.some((v) => Math.abs(v - yy) < 13)) yy += 13; lastY.push(yy);
      g += `<text x="${lx + 9}" y="${yy + 4}" class="dl">${s.name.split(' ').slice(-1)[0]}</text>`;
    });
    const legend = ev.series.map((s, si) => `<span><i class="sw s${si + 1}"></i>${s.name}</span>`).join('');
    const rows = ev.days.map((dk, i) => `<tr><td>${dayLabel(dk)}</td>${ev.series.map((s) => `<td>${s.pts[i] ? s.pts[i].v + '% <span class="muted small">(' + s.pts[i].n + ')</span>' : '—'}</td>`).join('')}</tr>`).join('');
    return `<div class="viz"><div class="legend">${legend}</div><div class="viz-wrap"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Porcentaje de aciertos por día en cada tema">${g}</svg><div class="tip" hidden></div></div>
      <details class="mt"><summary>Ver como tabla</summary><div class="scroll"><table class="tbl"><tr><th>Día</th>${ev.series.map((s) => `<th>${s.name}</th>`).join('')}</tr>${rows}</table></div></details></div>`;
  }
  function wireTips(root) {
    $$('.viz-wrap', root).forEach((w) => {
      const tip = $('.tip', w);
      const show = (c) => { const r = c.getBoundingClientRect(), wr = w.getBoundingClientRect(); tip.textContent = c.dataset.tip; tip.hidden = false; const hw = tip.offsetWidth / 2; tip.style.left = Math.min(wr.width - hw, Math.max(hw, r.left - wr.left + r.width / 2)) + 'px'; tip.style.top = (r.top - wr.top - 8) + 'px'; };
      $$('[data-tip]', w).forEach((c) => { c.addEventListener('mouseenter', () => show(c)); c.addEventListener('click', () => show(c)); c.addEventListener('mouseleave', () => { tip.hidden = true; }); });
    });
  }
  const RATE_SCORE = { si: 1, mas: 0.5, no: 0 };
  function kindStats(d) {
    const R = Object.values(d.ratings);
    return Object.keys(KINDS).map((k) => {
      const r = R.filter((x) => x.kind === k);
      const tr = d.attempts.filter((a) => a.mode === 'lens' && a.kind === k);
      const rs = r.length ? r.reduce((s, x) => s + (RATE_SCORE[x.v] || 0), 0) / r.length : null;
      const ts = tr.length ? tr.filter((a) => a.ok).length / tr.length : null;
      const parts = [rs, ts].filter((x) => x !== null);
      return { k, r, si: r.filter((x) => x.v === 'si').length, mas: r.filter((x) => x.v === 'mas').length, no: r.filter((x) => x.v === 'no').length, tn: tr.length, tok: tr.filter((a) => a.ok).length, score: parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : null };
    });
  }
  function errorTrend(A) {
    const S = A.filter((a) => solving(a) && !a.ok && a.err && Gen.ERR[a.err] && !['INVALID', 'SKIP', 'GENERIC'].includes(a.err));
    const mid = Math.floor(A.length / 2); const first = A.slice(0, mid), second = A.slice(mid);
    const c = {}; S.forEach((a) => { c[a.err] = (c[a.err] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1]).map(([e, n]) => ({ e, n, a1: first.filter((a) => a.err === e).length, a2: second.filter((a) => a.err === e).length, recent: A.slice(-30).filter((a) => a.err === e).length }));
  }
  const trendTxt = (t) => (t.a1 + t.a2 < 3 ? '' : t.a2 < t.a1 ? '<span class="good">bajando</span>' : t.a2 > t.a1 ? '<span class="warn-t">subiendo</span>' : 'igual');

  /* ================= PANEL DEL TUTOR ================= */
  route(/^\/tutor$/, (el) => {
    const d = Store.d; const A = d.attempts; const AS = A.filter(solving);
    const bar = (p, label) => `<div class="hbar"><span style="--p:${p}%"></span><em>${label}</em></div>`;
    const topicRows = TOPICS.map((t) => {
      const at = AS.filter((a) => a.topic === t.id); const ok = at.filter((a) => a.ok).length;
      const last = at.slice(-10); const lok = last.filter((a) => a.ok).length;
      return at.length ? `<tr><td>${t.title}${t.kind === 'fund' ? ' <span class="tag">base</span>' : ''}</td><td>${at.length}</td><td>${bar(pct(ok, at.length), pct(ok, at.length) + '%')}</td><td>${bar(pct(lok, last.length), pct(lok, last.length) + '%')}</td></tr>` : '';
    }).join('');
    const ev = evolution(A);
    const tr = errorTrend(A);
    const errRows = tr.map((t) => `<tr><td><b>${Gen.ERR[t.e].t}</b><br><span class="small muted">${Gen.ERR[t.e].m}</span></td><td>${t.n}</td><td>${t.recent}</td><td>${trendTxt(t) || '—'}</td></tr>`).join('');
    const ks = kindStats(d).filter((x) => x.r.length || x.tn);
    const kindRows = ks.map((x) => `<tr><td>${kindTag(x.k)}<br><span class="small muted">${KINDS[x.k].hint}</span></td><td>${x.r.length ? `<div class="stack"><span class="s-si" style="flex:${x.si}">${x.si || ''}</span><span class="s-mas" style="flex:${x.mas}">${x.mas || ''}</span><span class="s-no" style="flex:${x.no}">${x.no || ''}</span></div>` : '—'}</td><td>${x.tn ? bar(pct(x.tok, x.tn), pct(x.tok, x.tn) + '% de ' + x.tn) : '—'}</td></tr>`).join('');
    const lensIds = [...new Set(Object.keys(d.ratings).concat(A.filter((a) => a.mode === 'lens').map((a) => a.lens)))];
    const lensRows = lensIds.map((id) => {
      const r = d.ratings[id]; const L = Content.lens(id); const st = lensTryStats(id);
      const title = (r && r.title) || (L && L.title) || id; const kind = (r && r.kind) || (L && L.kind);
      return `<tr><td>${esc(title)}</td><td>${KINDS[kind] ? KINDS[kind].name : ''}</td><td class="${r ? 'v-' + r.v : ''}">${r ? { si: 'Sí', mas: 'Más o menos', no: 'No' }[r.v] : '—'}</td><td>${st ? st.ok + '/' + st.n : '—'}</td><td>${d.views[id] || 0}</td></tr>`;
    }).join('');
    const DT = A.filter((a) => a.mode === 'detective'); const dc = {};
    DT.forEach((a) => { dc[a.det] = dc[a.det] || { n: 0, ok: 0, hint: 0 }; dc[a.det].n++; if (a.ok) dc[a.det].ok++; else if (a.found) dc[a.det].hint++; });
    const detRows = Object.entries(dc).sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n).map(([e, v]) => `<tr><td>${Gen.ERR[e] ? Gen.ERR[e].t : e}</td><td>${v.ok} de ${v.n}${v.hint ? ` <span class="small muted">(+${v.hint} con pista)</span>` : ''}</td></tr>`).join('');
    const sesStat = (s) => { const at = AS.filter((a) => a.ses === s); return at.length ? pct(at.filter((a) => a.ok).length, at.length) + '% de ' + at.length : '—'; };
    const simRows = d.sims.map((s) => `<tr><td>${fdate(s.t)}</td><td><b>${s.grade.toFixed(1)}</b></td><td>${Object.entries(s.by).map(([tp, v]) => Content.byId(tp).title.split(' ').slice(-1)[0] + ' ' + v.ok + '/' + v.n).join(' · ')}</td><td>${Math.round(s.ms / 60000)} min</td><td>${s.ses === 'acompanada' ? 'con tutor' : 'por su cuenta'}</td></tr>`).join('');
    const avgMs = (t) => { const at = AS.filter((a) => a.topic === t && a.ms); return at.length ? Math.round(at.reduce((x, a) => x + a.ms, 0) / at.length / 1000) : null; };
    el.innerHTML = `<h1>Panel del tutor</h1><p class="muted">Resumen del avance guardado en este dispositivo. Para ver el de otro dispositivo, importa su respaldo en <a href="#/respaldo">Mis datos</a>.</p>
      <div class="stats card"><div><b>${d.days.length}</b><span>días</span></div><div><b>${AS.length}</b><span>ejercicios</span></div><div><b>${pct(AS.filter((a) => a.ok).length, AS.length)}%</b><span>correctos</span></div><div><b>${d.sims.length ? d.sims[d.sims.length - 1].grade.toFixed(1) : '—'}</b><span>último simulacro</span></div></div>
      <div class="row wrap gap"><a class="btn" href="#/informe">Ver informe imprimible</a></div>
      <div class="card"><h2>Evolución por día</h2><p class="small muted">Porcentaje de aciertos de cada tema del examen por día (solo días con 3 o más ejercicios del tema). La línea punteada es la meta de 8.</p>${ev.days.length && ev.series.some((s) => s.pts.some(Boolean)) ? evoChart(ev) : '<p class="muted">Aparecerá cuando haya práctica de los temas del examen.</p>'}</div>
      <div class="card"><h2>Por tema</h2>${topicRows ? `<div class="scroll"><table class="tbl"><tr><th>Tema</th><th>Ejercicios</th><th>Acierto total</th><th>Últimos 10</th></tr>${topicRows}</table></div>` : '<p class="muted">Sin ejercicios todavía.</p>'}
        <p class="small muted">Por su cuenta: ${sesStat('autonoma')} · Con tutor: ${sesStat('acompanada')}</p>
        <p class="small muted">Tiempo promedio por ejercicio: ${TOPICS.map((t) => { const m = avgMs(t.id); return m ? t.title + ' ' + m + ' s' : null; }).filter(Boolean).join(' · ') || '—'}</p></div>
      <div class="card"><h2>Errores que se repiten</h2>${errRows ? `<div class="scroll"><table class="tbl"><tr><th>Tipo de error</th><th>Total</th><th>Últimos 30</th><th>Tendencia</th></tr>${errRows}</table></div><p class="small muted">La tendencia compara la primera mitad de los ejercicios con la segunda.</p>` : '<p class="muted">Sin errores registrados.</p>'}</div>
      <div class="card"><h2>Qué tipo de explicación le funciona</h2><p class="small muted">Dos medidas: lo que ella dice (valoración) y lo que logra justo después (acierto en “Pruébalo”). Cuando no coinciden, pesa más el acierto.</p>${kindRows ? `<div class="scroll"><table class="tbl"><tr><th>Tipo</th><th>Sí · Más o menos · No</th><th>Acierto al probarla</th></tr>${kindRows}</table></div>` : '<p class="muted">Todavía no hay valoraciones ni pruebas.</p>'}
        ${lensRows ? `<details class="mt"><summary>Ver cada explicación</summary><div class="scroll"><table class="tbl"><tr><th>Explicación</th><th>Tipo</th><th>¿Ayudó?</th><th>Pruébalo</th><th>Abierta</th></tr>${lensRows}</table></div></details>` : ''}</div>
      <div class="card"><h2>Detective de errores</h2>${detRows ? `<p class="small muted">Cuántas veces encontró a la primera dónde empieza cada error escondido. Los que menos reconoce, primero.</p><div class="scroll"><table class="tbl"><tr><th>Error escondido</th><th>Lo encontró</th></tr>${detRows}</table></div>` : '<p class="muted">Todavía no usa el Detective.</p>'}</div>
      <div class="card"><h2>Diagnóstico y simulacros</h2>${d.diag ? `<p>Diagnóstico (${fdate(d.diag.t)}): <b>${d.diag.score} de ${d.diag.total}</b> — ${Object.entries(d.diag.by).map(([tp, v]) => Content.byId(tp).title + ' ' + v.ok + '/' + v.n).join(' · ')}</p>` : '<p class="muted">Diagnóstico pendiente.</p>'}
        ${simRows ? `<div class="scroll"><table class="tbl"><tr><th>Fecha</th><th>Calif.</th><th>Por tema</th><th>Tiempo</th><th>Sesión</th></tr>${simRows}</table></div>` : '<p class="muted">Sin simulacros.</p>'}</div>
      <div class="card"><h2>Notas del tutor</h2><textarea id="notes" rows="5" placeholder="Observaciones, acuerdos, qué funcionó en la sesión…">${esc(d.notes || '')}</textarea><p class="small muted">Se guardan en este dispositivo y viajan en el respaldo.</p></div>
      <div class="row wrap gap"><button type="button" class="btn" id="exc">Descargar tablas (CSV)</button><button type="button" class="btn ghost" id="exj">Descargar respaldo</button></div>`;
    let nt; $('#notes', el).addEventListener('input', (e) => { clearTimeout(nt); nt = setTimeout(() => { Store.d.notes = e.target.value; Store.save(); }, 400); });
    $('#exc', el).addEventListener('click', exportCSV); $('#exj', el).addEventListener('click', exportJSON);
    wireTips(el);
  });

  /* ================= INFORME PARA ADECUAR MATERIAL ================= */
  route(/^\/informe$/, (el) => {
    const d = Store.d; const A = d.attempts; const AS = A.filter(solving);
    if (AS.length < 5) { el.innerHTML = `<a class="back noprint" href="#/tutor">← Panel del tutor</a><h1>Informe</h1><p class="muted">Hace falta un poco más de práctica (al menos 5 ejercicios) para generar el informe.</p>`; return; }
    const first = Math.min(...A.map((a) => a.t)), last = Math.max(...A.map((a) => a.t));
    // Fortalezas y dificultades por tipo de ejercicio
    const bySub = {}; AS.forEach((a) => { if (!Gen.SUBS[a.sub]) return; bySub[a.sub] = bySub[a.sub] || { n: 0, ok: 0, last: [] }; bySub[a.sub].n++; if (a.ok) bySub[a.sub].ok++; bySub[a.sub].last.push(a.ok); });
    const subList = Object.entries(bySub).map(([s, v]) => ({ s, n: v.n, p: pct(v.ok, v.n), lp: pct(v.last.slice(-5).filter(Boolean).length, Math.min(5, v.last.length)) }));
    const strong = subList.filter((x) => x.n >= 4 && x.lp >= 80).sort((a, b) => b.lp - a.lp);
    const weak = subList.filter((x) => x.n >= 3 && x.lp < 60).sort((a, b) => a.lp - b.lp);
    const ks = kindStats(d).filter((x) => x.score !== null).sort((a, b) => b.score - a.score);
    const tr = errorTrend(A).filter((t) => t.recent >= 1 || t.n >= 3);
    const liked = Object.values(d.ratings).filter((r) => r.v === 'si').map((r) => r.title);
    const disliked = Object.values(d.ratings).filter((r) => r.v === 'no').map((r) => r.title);
    const sesStat = (s) => { const at = AS.filter((a) => a.ses === s); return at.length >= 5 ? { p: pct(at.filter((a) => a.ok).length, at.length), n: at.length } : null; };
    const sa = sesStat('autonoma'), sc = sesStat('acompanada');
    const recs = [];
    if (ks.length) recs.push(Content.KIND_RECS[ks[0].k]);
    if (ks.length > 1 && ks[ks.length - 1].score < 0.5) recs.push('Usar con menos frecuencia el enfoque “' + KINDS[ks[ks.length - 1].k].name + '”, o solo como complemento.');
    tr.slice(0, 5).forEach((t) => { if (Content.ERR_RECS[t.e]) recs.push(Content.ERR_RECS[t.e]); });
    if (sa && sc && Math.abs(sa.p - sc.p) >= 15) recs.push(sc.p > sa.p ? 'Rinde notablemente mejor acompañada: conviene que las sesiones de temas nuevos sean con tutor y la práctica de consolidación por su cuenta.' : 'Rinde igual o mejor por su cuenta: dar espacio para practicar sola y usar las sesiones con tutor para revisar errores.');
    const simTxt = d.sims.length ? d.sims.map((s) => s.grade.toFixed(1)).join(' → ') : 'sin simulacros';
    el.innerHTML = `<div class="noprint row wrap gap"><a class="back" href="#/tutor">← Panel del tutor</a><button type="button" class="btn sm" onclick="window.print()">Imprimir o guardar PDF</button></div>
      <article class="report">
      <h1>Informe de aprendizaje</h1><p class="muted">Matemáticas · regla de los signos, leyes de los exponentes y notación científica<br>Del ${new Date(first).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })} al ${new Date(last).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })} · ${d.days.length} día${d.days.length === 1 ? '' : 's'} · ${AS.length} ejercicios · simulacros: ${simTxt}</p>
      <h2>1. Cómo aprende mejor</h2>
      ${ks.length ? `<ol>${ks.map((x) => `<li><b>${KINDS[x.k].name}</b> (${KINDS[x.k].hint.toLowerCase()}) — ${x.r.length ? 'valoración: ' + x.si + ' sí, ' + x.mas + ' más o menos, ' + x.no + ' no' : 'sin valoraciones'}${x.tn ? '; acierto justo después: ' + pct(x.tok, x.tn) + '% de ' + x.tn : ''}</li>`).join('')}</ol>` : '<p class="muted">Aún sin datos suficientes de valoraciones.</p>'}
      ${liked.length ? `<p><b>Explicaciones que le ayudaron:</b> ${liked.map(esc).join(' · ')}</p>` : ''}
      ${disliked.length ? `<p><b>Explicaciones que no le ayudaron:</b> ${disliked.map(esc).join(' · ')}</p>` : ''}
      ${sa || sc ? `<p><b>Por su cuenta:</b> ${sa ? sa.p + '% de aciertos (' + sa.n + ')' : 'pocos datos'} · <b>Con tutor:</b> ${sc ? sc.p + '% (' + sc.n + ')' : 'pocos datos'}</p>` : ''}
      <h2>2. Lo que ya domina</h2>
      ${strong.length ? `<ul>${strong.map((x) => `<li>${Gen.SUBS[x.s].name} — ${x.lp}% en los últimos 5 (${x.n} en total)</li>`).join('')}</ul>` : '<p class="muted">Todavía ningún tipo de ejercicio con dominio consistente.</p>'}
      <h2>3. Lo que todavía cuesta</h2>
      ${weak.length ? `<ul>${weak.map((x) => `<li>${Gen.SUBS[x.s].name} — ${x.lp}% en los últimos intentos (${x.n} en total)</li>`).join('')}</ul>` : '<p class="muted">Sin dificultades marcadas en este momento.</p>'}
      ${tr.length ? `<p><b>Errores frecuentes:</b></p><table class="tbl"><tr><th>Error</th><th>Veces</th><th>Tendencia</th></tr>${tr.map((t) => `<tr><td>${Gen.ERR[t.e].t}</td><td>${t.n}</td><td>${trendTxt(t) || '—'}</td></tr>`).join('')}</table>` : ''}
      <h2>4. Recomendaciones para adecuar material</h2>
      ${recs.length ? `<ul>${[...new Set(recs)].map((r) => `<li>${r}</li>`).join('')}</ul>` : '<p class="muted">Se generarán con más datos.</p>'}
      ${d.notes ? `<h2>5. Notas del tutor</h2><p style="white-space:pre-wrap">${esc(d.notes)}</p>` : ''}
      <p class="small muted mt">Generado por Brújula v${VERSION} el ${new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}. Las recomendaciones son automáticas a partir de los datos: úsalas como punto de partida.</p>
      </article>`;
  });

  /* ================= ARRANQUE ================= */
  render();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => { });
  }
})();
