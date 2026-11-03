/* Brújula · Física — Detective de errores (basado en los errores reales del cuaderno) */
(function (global) {
  'use strict';
  const { R, pick, fmt, round } = global.Kit; const { show, frac } = global.FisKit;
  const mono = (x) => '<span class="mono">' + x + '</span>';
  const D = {};

  D.F_DESP = () => {
    const mi = R(8, 25), v = pick([4, 5, 6]); const d = mi * 1609.34; const t = d / v;
    return { topic: 'f_vel', err: 'F_DESP', prompt: `Un atleta recorre ${mi} mi a ${v} m/s. ¿Cuánto tarda (s)?`, wrong: 1,
      steps: [`Conversión: ${mi} mi × 1609.34 = ${show(d)} m`, 'Fórmula: ' + mono('t = v · d'), 'Sustitución: ' + mono(`t = (${v})(${show(d)})`), `Resultado: ${show(d * v)} s`],
      fix: mono('t = ' + frac('d', 'v')) + ' → t = ' + show(d) + ' ÷ ' + v + ' = ' + show(t) + ' s' };
  };
  D.F_DESP2 = () => {
    const v = R(5, 9), mn = R(2, 6); const t = mn * 60; const d = v * t;
    return { topic: 'f_vel', err: 'F_DESP', prompt: `Una mariposa vuela a ${v} m/s durante ${mn} min. ¿Qué distancia (m) recorre?`, wrong: 1,
      steps: [`Conversión: ${mn} min = ${t} s`, 'Fórmula: ' + mono('d = ' + frac('v', 't')), 'Sustitución: ' + mono(`d = ${v} ÷ ${t}`), `Resultado: ${show(v / t)} m`],
      fix: mono('d = v · t') + ' → (' + v + ')(' + t + ') = ' + fmt(d) + ' m' };
  };
  D.F_UNITS = () => {
    const vi = R(25, 35), vfk = R(130, 160), mn = pick([2.2, 2.5, 2.8, 3.2]); const vf = vfk / 3.6, t = mn * 60;
    return { topic: 'f_acel', err: 'F_UNITS', prompt: `Un móvil arranca a ${vi} m/s y en ${mn} min llega a ${vfk} km/h. Calcula su aceleración (m/s²).`, wrong: 2,
      steps: [`Datos: vi = ${vi} m/s, vf = ${vfk} km/h = ${show(vf)} m/s, t = ${mn} min`, 'Fórmula: ' + mono('a = ' + frac('vf − vi', 't')), 'Sustitución: ' + mono('a = ' + frac(show(vf) + ' − ' + vi, String(mn))), `Resultado: ${show((vf - vi) / mn)} m/s²`],
      fix: `El tiempo va en segundos: ${mn} min = ${show(t)} s → a = ${frac(show(vf - vi), show(t))} = ${show((vf - vi) / t)} m/s²` };
  };
  D.F_DIR = () => {
    const mi = R(1200, 3900);
    return { topic: 'f_regla3', err: 'F_DIR', prompt: `Convertir ${fmt(mi)} mi a km.`, wrong: 2,
      steps: ['1 mi — 1.609 km', `${fmt(mi)} mi — x`, `x = ${fmt(mi)} ÷ 1.609`, `x = ${show(mi / 1.609)} km`],
      fix: `El km es más chico que la milla, así que el número debe crecer: x = (${fmt(mi)})(1.609) = ${show(mi * 1.609)} km` };
  };
  D.F_FU_INV = () => {
    const v = R(45, 95);
    return { topic: 'f_conv', err: 'F_FU_INV', prompt: `Convertir ${v} m/s a km/h.`, wrong: 0,
      steps: ['Planteo: ' + `${v} ${frac('m', 's')} × (${frac('1000 km', '1 m')}) × (${frac('3600 s', '1 h')})`, `Multiplico: ${v} × 1000 × 3600 = ${fmt(v * 3600000)}`, `Resultado: ${fmt(v * 3600000)} km/h`],
      fix: `El metro estaba arriba, así que en el factor va abajo: ${frac('1 km', '1000 m')} → ${v} × 3600 ÷ 1000 = ${show(v * 3.6)} km/h` };
  };
  D.F_HMIN = () => {
    const h = R(1, 4), m = pick([18, 24, 26, 36, 42, 48]); const d = R(150, 420); const T = h + m / 60;
    return { topic: 'f_vel', err: 'F_HMIN', prompt: `Un auto recorre ${d} km en ${h} h ${m} min. ¿A qué velocidad va (km/h)?`, wrong: 1,
      steps: [`Datos: d = ${d} km, t = ${h} h ${m} min`, `Tiempo en horas: ${m} ÷ 60 = ${show(m / 60)} → t = ${show(m / 60)} h`, 'Sustitución: ' + mono(`v = ${d} ÷ ${show(m / 60)}`), `Resultado: ${show(d / (m / 60))} km/h`],
      fix: `Faltó sumar las horas: t = ${h} + ${show(m / 60)} = ${show(T)} h → v = ${d} ÷ ${show(T)} = ${show(d / T)} km/h` };
  };
  D.F_MAG = () => {
    const d = R(30, 60) * 100, vm = R(70, 95); const v = vm * 1609.34 / 3600; const t = d / v;
    return { topic: 'f_vel', err: 'F_MAG', prompt: `Un autobús recorre ${fmt(d)} m a ${vm} mi/h. ¿Cuánto tarda (s)?`, wrong: 3,
      steps: [`Conversión: ${vm} mi/h = ${show(v)} m/s`, 'Fórmula: ' + mono('t = ' + frac('d', 'v')), 'Sustitución: ' + mono(`t = ${fmt(d)} ÷ ${show(v)}`), `Resultado: ${show(t * 10)} s`],
      fix: `${fmt(d)} ÷ ${show(v)} = ${show(t)} s. Comprueba el tamaño: unos ${fmt(d)} m a ~${Math.round(v)} m/s son un par de minutos, no ${Math.round(t * 10 / 60)} min.` };
  };
  D.F_SWAP = () => {
    const vi = R(2, 10), vf = vi + R(10, 30), t = R(4, 12);
    return { topic: 'f_acel', err: 'F_SWAP', prompt: `Una motocicleta pasa de ${vi} m/s a ${vf} m/s en ${t} s. Calcula su aceleración.`, wrong: 1,
      steps: [`Datos: vi = ${vi} m/s, vf = ${vf} m/s, t = ${t} s`, 'Fórmula: ' + mono('a = ' + frac('vi − vf', 't')), 'Sustitución: ' + mono('a = ' + frac(vi + ' − ' + vf, String(t))), `Resultado: ${show((vi - vf) / t)} m/s²`],
      fix: `Es final menos inicial: a = ${frac(vf + ' − ' + vi, String(t))} = ${show((vf - vi) / t)} m/s² (acelera, debe ser positiva)` };
  };
  D.F_SIGN = () => {
    const vi = R(24, 34), a = R(2, 5), t = R(2, 4);
    return { topic: 'f_acel', err: 'F_SIGN', prompt: `Al entrar a una curva a ${vi} m/s, un conductor frena con una aceleración de −${a} m/s². ¿Qué velocidad tiene ${t} s después?`, wrong: 2,
      steps: [`Datos: vi = ${vi} m/s, a = −${a} m/s², t = ${t} s`, 'Fórmula: ' + mono('vf = vi + a·t'), 'Sustitución: ' + mono(`vf = ${vi} + (${a})(${t})`), `Resultado: ${vi + a * t} m/s`],
      fix: `La aceleración es negativa: vf = ${vi} + (−${a})(${t}) = ${vi} − ${a * t} = ${vi - a * t} m/s (frena, debe bajar)` };
  };
  D.F_OUT = () => {
    const a = pick([0.2, 0.4, 0.5]), mn = R(2, 6); const t = mn * 60; const vf = a * t;
    return { topic: 'f_acel', err: 'F_OUT', prompt: `Una patineta parte del reposo con aceleración de ${a} m/s². ¿Qué velocidad (km/h) tiene a los ${mn} min?`, wrong: 3,
      steps: [`Conversión: ${mn} min = ${t} s`, 'Fórmula: ' + mono('vf = vi + a·t'), 'Sustitución: ' + mono(`vf = 0 + (${a})(${t}) = ${show(vf)}`), `Resultado: ${show(vf)} km/h`],
      fix: `${show(vf)} es m/s; falta convertir: ${show(vf)} × 3.6 = ${show(vf * 3.6)} km/h` };
  };
  D.F_ROUND = () => {
    const dm = R(92, 99); const mi = dm / 1609.34, h = 3.6 / 60;
    return { topic: 'f_conv', err: 'F_ROUND', prompt: `Una bicicleta recorre ${dm} m en 3.6 min. ¿Velocidad en mi/h?`, wrong: 0,
      steps: [`${dm} m ÷ 1609.34 = 0.05 mi`, '3.6 min ÷ 60 = 0.06 h', `v = 0.05 ÷ 0.06 = ${show(0.05 / 0.06)} mi/h`],
      fix: `${dm} ÷ 1609.34 = ${show(mi)} mi: se cortó a 0.05 y se perdió casi una centésima. Con todos los decimales: v = ${show(mi)} ÷ 0.06 = ${show(mi / h)} mi/h` };
  };
  D.F_DATA = () => {
    const a = pick([1.5, 2.5, 3]), t = R(4, 9);
    return { topic: 'f_acel', err: 'F_DATA', prompt: `Partiendo del reposo, un motociclista arranca con una aceleración de ${a} m/s². ¿Cuál es su velocidad (m/s) al cabo de ${t} s?`, wrong: 0,
      steps: [`Datos: vi = 0, vf = ${a} m/s, t = ${t} s`, 'Fórmula: ' + mono('a = ' + frac('vf − vi', 't')), 'Sustitución: ' + mono('a = ' + frac(a + ' − 0', String(t))), `Resultado: a = ${show(a / t)} m/s²`],
      fix: `${a} m/s² es la aceleración, no vf. Datos: vi = 0, a = ${a} m/s², t = ${t} s → vf = 0 + (${a})(${t}) = ${show(a * t)} m/s` };
  };
  D.F_DV = () => {
    const vi = R(8, 20), a = pick([1.5, 2, 3]), t = R(4, 10);
    return { topic: 'f_acel', err: 'F_DV', prompt: `Un auto va a ${vi} m/s y acelera ${a} m/s² durante ${t} s. ¿Qué velocidad final tiene?`, wrong: 1,
      steps: [`Datos: vi = ${vi} m/s, a = ${a} m/s², t = ${t} s`, 'Fórmula: ' + mono('vf = a·t'), 'Sustitución: ' + mono(`vf = (${a})(${t})`), `Resultado: ${show(a * t)} m/s`],
      fix: `No parte del reposo: vf = vi + a·t = ${vi} + ${show(a * t)} = ${show(vi + a * t)} m/s` };
  };

  const ERRKEY = (k) => k.replace(/\d+$/, '');
  function make(errCounts) {
    const keys = Object.keys(D);
    const w = keys.map((k) => 1 + 2 * Math.min(4, (errCounts && errCounts[ERRKEY(k)]) || 0));
    let r = Math.random() * w.reduce((a, b) => a + b, 0), k = keys[keys.length - 1];
    for (let i = 0; i < keys.length; i++) { r -= w[i]; if (r <= 0) { k = keys[i]; break; } }
    const it = D[k](); it.sentence = true; it.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6); return it;
  }
  global.Brujula.subject('fis', { detective: { make, kinds: Object.keys(D), D } });
})(window);
