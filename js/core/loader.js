/* Brújula — núcleo: carga las asignaturas listadas en modules/modules.json y después arranca la app */
(function () {
  'use strict';
  const V = window.BRUJULA_VERSION || '0';
  const main = () => document.getElementById('main');
  function fail(msg) {
    const m = main(); if (!m) return;
    m.innerHTML = '<h1>No se pudo cargar</h1><p>' + msg + '</p><p class="small muted">Si estás probando en tu computadora, ábrela con un servidor local (por ejemplo <span class="mono">py -m http.server</span>) en lugar de doble clic.</p><p><button class="btn" onclick="location.reload()">Recargar</button></p>';
  }
  function load(src) {
    return new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = src + '?v=' + V;
      s.onload = res; s.onerror = () => rej(new Error('No se encontró ' + src));
      document.body.appendChild(s);
    });
  }
  async function boot() {
    let list;
    try {
      const r = await fetch('modules/modules.json?v=' + V, { cache: 'no-cache' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      list = (await r.json()).modules || [];
    } catch (e) { return fail('No se encontró la lista de asignaturas (modules/modules.json).'); }
    window.BRUJULA_MODULES = list;
    for (const mod of list) {
      for (const f of mod.files) {
        try { await load('modules/' + mod.folder + '/' + f); }
        catch (e) { console.error(e); if (main()) main().insertAdjacentHTML('afterbegin', '<p class="banner warn">No se pudo cargar parte de ' + mod.folder + '.</p>'); }
      }
    }
    try { await load('js/app.js'); } catch (e) { fail('No se encontró la aplicación (js/app.js).'); }
  }
  boot();
})();
