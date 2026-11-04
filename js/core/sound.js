/* Brújula — sonidos de fondo para concentrarse.
   Todo se genera en el navegador (Web Audio): no descarga archivos y funciona sin internet.
   El reproductor vive fuera de las pantallas, así que sigue sonando al cambiar de pantalla. */
(function (global) {
  'use strict';
  const SOUNDS = {
    blanco: { name: 'Ruido blanco', hint: 'Parejo, como una tele sin señal' },
    rosa: { name: 'Ruido rosa', hint: 'Más suave, como viento constante' },
    cafe: { name: 'Ruido café', hint: 'Grave, como un río lejano' },
    lluvia: { name: 'Lluvia', hint: 'Lluvia constante sobre el techo' },
    olas: { name: 'Olas', hint: 'Olas que van y vienen' }
  };
  let ctx = null, master = null, current = null, chain = null, vol = 0.5;
  const cache = {}; const listeners = [];
  const emit = () => listeners.forEach((f) => { try { f(); } catch (e) { } });

  function ensure() {
    if (!ctx) {
      const AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC(); master = ctx.createGain(); master.gain.value = curve(vol); master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  const curve = (v) => Math.pow(Math.max(0, Math.min(1, v)), 2) * 0.9;   // el oído percibe el volumen en forma no lineal

  /* ---------- generadores (cada canal con su propio ruido para que suene amplio) ---------- */
  function white(n) { const a = new Float32Array(n); for (let i = 0; i < n; i++) a[i] = Math.random() * 2 - 1; return a; }
  function pink(n) {   // filtro de Paul Kellet
    const a = new Float32Array(n); let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
      a[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
    }
    return a;
  }
  function brown(n) { const a = new Float32Array(n); let b = 0; for (let i = 0; i < n; i++) { b = (b + 0.02 * (Math.random() * 2 - 1)) / 1.02; a[i] = b * 3.5; } return a; }
  // Une el final con el principio para que el ciclo no se note
  function seam(a, sr) { const f = Math.floor(sr * 0.25); for (let i = 0; i < f; i++) { const k = i / f; a[i] = a[i] * k + a[a.length - f + i] * (1 - k); } return a.subarray(0, a.length - f); }
  function rain(n, sr) {
    const a = pink(n); for (let i = 0; i < n; i++) a[i] *= 0.45;
    const drops = Math.floor((n / sr) * 55);
    for (let d = 0; d < drops; d++) {
      const at = Math.floor(Math.random() * n); const len = Math.floor(sr * (0.004 + Math.random() * 0.02));
      const amp = 0.08 + Math.random() * Math.random() * 0.5;
      for (let i = 0; i < len && at + i < n; i++) a[at + i] += (Math.random() * 2 - 1) * amp * Math.exp(-6 * i / len);
    }
    return a;
  }
  function waves(n, sr) {
    const lo = brown(n), hi = pink(n); const a = new Float32Array(n);
    // Olas de distinta duración; el ciclo completo empieza y termina en calma
    const lens = [7.5, 9.5, 8, 10.5]; const tot = lens.reduce((x, y) => x + y, 0); const scale = (n / sr) / tot;
    let start = 0; const env = new Float32Array(n), foam = new Float32Array(n);
    lens.forEach((L, k) => {
      const len = Math.floor(L * scale * sr); const peak = [0.35, 0.42, 0.38, 0.45][k];
      for (let i = 0; i < len && start + i < n; i++) {
        const x = i / len; const rise = x < peak ? Math.sin((x / peak) * Math.PI / 2) : Math.cos(((x - peak) / (1 - peak)) * Math.PI / 2);
        env[start + i] = 0.18 + 0.82 * rise * rise; foam[start + i] = Math.pow(rise, 6);
      }
      start += len;
    });
    for (let i = 0; i < n; i++) a[i] = lo[i] * env[i] * 0.9 + hi[i] * foam[i] * 0.35;
    return a;
  }
  const GEN = { blanco: (n) => { const a = white(n); for (let i = 0; i < n; i++) a[i] *= 0.35; return a; }, rosa: pink, cafe: brown, lluvia: rain, olas: waves };
  const SECS = { blanco: 6, rosa: 8, cafe: 8, lluvia: 12, olas: 36 };

  function buffer(id) {
    if (cache[id]) return cache[id];
    const sr = ctx.sampleRate; const n = Math.floor(sr * SECS[id]);
    const ch = [0, 1].map(() => seam(GEN[id](n, sr), sr));
    const b = ctx.createBuffer(2, ch[0].length, sr); ch.forEach((c, i) => b.copyToChannel ? b.copyToChannel(c, i) : b.getChannelData(i).set(c));
    return (cache[id] = b);
  }
  function build(id) {
    const src = ctx.createBufferSource(); src.buffer = buffer(id); src.loop = true;
    const g = ctx.createGain(); g.gain.value = 0;
    let last = src;
    if (id === 'lluvia') { const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 350; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 7500; src.connect(hp); hp.connect(lp); last = lp; }
    if (id === 'olas') { const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400; src.connect(lp); last = lp; }
    last.connect(g); g.connect(master);
    src.start(ctx.currentTime, id === 'olas' ? 0 : Math.random() * 2);
    g.gain.setTargetAtTime(1, ctx.currentTime, 0.35);
    return { src, g };
  }
  function fadeOut(c) { if (!c) return; try { c.g.gain.cancelScheduledValues(ctx.currentTime); c.g.gain.setTargetAtTime(0, ctx.currentTime, 0.15); c.src.stop(ctx.currentTime + 0.8); } catch (e) { } }

  const Sonido = {
    SOUNDS,
    supported: () => !!(global.AudioContext || global.webkitAudioContext),
    play(id) { if (!SOUNDS[id] || !ensure()) return false; if (current === id && chain) return true; fadeOut(chain); chain = build(id); current = id; emit(); return true; },
    stop() { fadeOut(chain); chain = null; current = null; emit(); },
    toggle(id) { if (current) this.stop(); else this.play(id); },
    playing: () => current,
    setVolume(v) { vol = v; if (master) master.gain.setTargetAtTime(curve(v), ctx.currentTime, 0.05); },
    volume: () => vol,
    // Aviso suave al terminar un bloque: dos notas
    chime() {
      if (!ensure()) return;
      [[660, 0], [880, 0.28]].forEach(([f, d]) => {
        const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = f;
        const t = ctx.currentTime + d; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.22, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
        o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 1.3);
      });
    },
    onchange(fn) { listeners.push(fn); }
  };
  global.Sonido = Sonido;
})(window);
