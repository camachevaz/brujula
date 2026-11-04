/* Brújula — sonidos de fondo para concentrarse.
   Todo se genera en el navegador (Web Audio): no descarga archivos y funciona sin internet.
   El ruido se calcula en tiempo real (AudioWorklet), muestra por muestra: no hay un fragmento que se repita,
   así que no hay uniones ni cambios de volumen. Si el navegador no tiene AudioWorklet, se usa un fragmento
   largo en bucle con una unión de potencia constante.
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

  /* ---------- Generador común (se usa dentro del AudioWorklet y en el respaldo) ---------- */
  const GEN_SRC = `
  function makeGen(kind, sr) {
    const ch = [0, 1].map(() => ({ p: [0, 0, 0, 0, 0, 0, 0], br: 0, dk: 0, dl: 1, da: 0 }));
    const w = { pos: 0, len: 1, peak: 0.4 };
    const nextWave = () => { w.pos = 0; w.len = Math.floor(sr * (7 + Math.random() * 4)); w.peak = 0.33 + Math.random() * 0.14; };
    nextWave();
    const white = () => Math.random() * 2 - 1;
    function pink(s) {   // filtro de Paul Kellet
      const x = white(), p = s.p;
      p[0] = 0.99886 * p[0] + x * 0.0555179; p[1] = 0.99332 * p[1] + x * 0.0750759; p[2] = 0.969 * p[2] + x * 0.153852;
      p[3] = 0.8665 * p[3] + x * 0.3104856; p[4] = 0.55 * p[4] + x * 0.5329522; p[5] = -0.7616 * p[5] - x * 0.016898;
      const y = (p[0] + p[1] + p[2] + p[3] + p[4] + p[5] + p[6] + x * 0.5362) * 0.11; p[6] = x * 0.115926; return y;
    }
    function brown(s) { s.br = (s.br + 0.02 * white()) / 1.02; return s.br * 3.5; }
    const dropRate = 55 / sr;
    function rain(s) {
      let y = pink(s) * 0.45;
      if (s.dk <= 0 && Math.random() < dropRate) { s.dl = Math.floor(sr * (0.004 + Math.random() * 0.02)); s.dk = s.dl; s.da = 0.08 + Math.random() * Math.random() * 0.5; }
      if (s.dk > 0) { y += white() * s.da * Math.exp(-6 * (s.dl - s.dk) / s.dl); s.dk--; }
      return y;
    }
    // Llena out (arreglo de canales) con n muestras
    return function fill(out, n) {
      for (let i = 0; i < n; i++) {
        let env = 1, foam = 0;
        if (kind === 'olas') {
          const x = w.pos / w.len; const r = x < w.peak ? Math.sin((x / w.peak) * Math.PI / 2) : Math.cos(((x - w.peak) / (1 - w.peak)) * Math.PI / 2);
          env = 0.18 + 0.82 * r * r; foam = Math.pow(r, 6); if (++w.pos >= w.len) nextWave();
        }
        for (let c = 0; c < out.length; c++) {
          const s = ch[c] || ch[0]; let y;
          if (kind === 'blanco') y = white() * 0.35;
          else if (kind === 'rosa') y = pink(s);
          else if (kind === 'cafe') y = brown(s);
          else if (kind === 'lluvia') y = rain(s);
          else y = brown(s) * env * 0.9 + pink(s) * foam * 0.35;
          out[c][i] = y;
        }
      }
    };
  }`;
  const WORKLET = GEN_SRC + `
  class BrujulaNoise extends AudioWorkletProcessor {
    constructor(o) { super(); this.fill = makeGen(o.processorOptions.kind, sampleRate); }
    process(inputs, outputs) { const out = outputs[0]; this.fill(out, out[0].length); return true; }
  }
  registerProcessor('brujula-noise', BrujulaNoise);`;
  const makeGen = new Function(GEN_SRC + '; return makeGen;')();

  let ctx = null, master = null, current = null, chain = null, vol = 0.5, token = 0;
  const workletReady = new WeakMap(); const cache = {}; const listeners = [];
  const emit = () => listeners.forEach((f) => { try { f(); } catch (e) { } });
  const curve = (v) => Math.pow(Math.max(0, Math.min(1, v)), 2) * 0.9;   // el oído percibe el volumen en forma no lineal

  function ensure() {
    if (!ctx) {
      const AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC(); master = ctx.createGain(); master.gain.value = curve(vol); master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function loadWorklet(c) {
    if (!c.audioWorklet || typeof AudioWorkletNode === 'undefined') return Promise.resolve(false);
    if (!workletReady.has(c)) {
      const url = URL.createObjectURL(new Blob([WORKLET], { type: 'application/javascript' }));
      workletReady.set(c, c.audioWorklet.addModule(url).then(() => true, () => false));
    }
    return workletReady.get(c);
  }
  // Respaldo: fragmento largo en bucle; la unión usa curvas de potencia constante (no baja el volumen)
  function loopBuffer(c, id) {
    const key = id + c.sampleRate; if (cache[key]) return cache[key];
    const sr = c.sampleRate, secs = id === 'olas' ? 40 : 24, n = Math.floor(sr * secs), f = Math.floor(sr * 0.5);
    const raw = [new Float32Array(n), new Float32Array(n)]; makeGen(id, sr)(raw, n);
    const b = c.createBuffer(2, n - f, sr);
    raw.forEach((a, ch) => {
      for (let i = 0; i < f; i++) { const k = i / f; a[i] = a[i] * Math.sin(k * Math.PI / 2) + a[n - f + i] * Math.cos(k * Math.PI / 2); }
      b.getChannelData(ch).set(a.subarray(0, n - f));
    });
    return (cache[key] = b);
  }
  // Construye la cadena de un sonido en el contexto c, conectada a dest. Devuelve {stop, g}
  async function graph(c, id, dest, opts) {
    const useWorklet = !(opts && opts.noWorklet) && await loadWorklet(c);
    let src;
    if (useWorklet) src = new AudioWorkletNode(c, 'brujula-noise', { numberOfInputs: 0, numberOfOutputs: 1, outputChannelCount: [2], processorOptions: { kind: id } });
    else { src = c.createBufferSource(); src.buffer = loopBuffer(c, id); src.loop = true; src.start(); }
    const g = c.createGain(); g.gain.value = 0;
    let last = src;
    if (id === 'lluvia') { const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 350; const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 7500; src.connect(hp); hp.connect(lp); last = lp; }
    if (id === 'olas') { const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400; src.connect(lp); last = lp; }
    last.connect(g); g.connect(dest);
    g.gain.setTargetAtTime(1, c.currentTime, 0.35);
    return {
      g, worklet: useWorklet,
      stop() {
        try { g.gain.cancelScheduledValues(c.currentTime); g.gain.setTargetAtTime(0, c.currentTime, 0.15); } catch (e) { }
        setTimeout(() => { try { if (src.stop) src.stop(); src.disconnect(); g.disconnect(); } catch (e) { } }, 900);
      }
    };
  }

  const Sonido = {
    SOUNDS,
    supported: () => !!(global.AudioContext || global.webkitAudioContext),
    play(id) {
      if (!SOUNDS[id] || !ensure()) return false;
      if (current === id) return true;
      if (chain) { chain.stop(); chain = null; }
      current = id; emit();
      const my = ++token;
      graph(ctx, id, master).then((c) => { if (my !== token) c.stop(); else chain = c; }, () => { if (my === token) { current = null; emit(); } });
      return true;
    },
    stop() { token++; if (chain) chain.stop(); chain = null; current = null; emit(); },
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
    onchange(fn) { listeners.push(fn); },
    _graph: graph   // para pruebas
  };
  global.Sonido = Sonido;
})(window);
