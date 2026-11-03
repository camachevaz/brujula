/* Brújula — núcleo: registro de asignaturas (módulos).
   Cada módulo se registra con Brujula.subject(id, {...}) y agrega temas, ejercicios, errores, laboratorio y detective.
   Los identificadores (temas, ejercicios, errores, explicaciones) deben ser únicos entre módulos. */
(function (global) {
  'use strict';
  const Kit = global.Kit;

  const KINDS = {
    historia: { name: 'Historia', hint: 'Una situación de la vida real' },
    visual: { name: 'Visual', hint: 'Verlo y manipularlo' },
    paso: { name: 'Paso a paso', hint: 'Un procedimiento con pasos fijos' },
    patron: { name: 'Patrón', hint: 'Descubrir la regla en una secuencia' },
    video: { name: 'Video', hint: 'Que alguien más lo explique' }
  };

  const Content = {
    TOPICS: [], KINDS, LENS_SUBS: {}, KIND_RECS: {}, ERR_RECS: {},
    byId: (id) => Content.TOPICS.find((t) => t.id === id),
    lens: (lid) => { for (const t of Content.TOPICS) { const l = t.lenses.find((x) => x.id === lid); if (l) return Object.assign({}, l, { topic: t.id }); } return null; }
  };

  const Gen = Object.assign({}, Kit, {
    ERR: {
      INVALID: { t: 'Respuesta incompleta', m: 'Escribe un número en cada casilla.', lens: null },
      GENERIC: { t: 'Todavía no', m: 'Revisa la solución paso a paso.', lens: null }
    },
    SUBS: {},
    make(sub) {
      const S = Gen.SUBS[sub]; const it = S.gen();
      it.sub = sub; it.topic = S.topic; it.subject = S.subject;
      it.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
      return it;
    }
  });

  const LAB = {};

  const Brujula = {
    subjects: {},
    order: [],
    subject(id, def) {
      if (!this.subjects[id]) { this.subjects[id] = { id, name: id, short: id, plan: [], diag: [], sim: {}, examTopics: [], exam: null, detective: null, intro: '' }; this.order.push(id); }
      if (def) Object.assign(this.subjects[id], def);
      return this.subjects[id];
    },
    list() { return this.order.map((id) => this.subjects[id]); },
    addTopics(sid, topics) { topics.forEach((t) => { t.subject = sid; Content.TOPICS.push(t); }); },
    addExercises(sid, def) {
      Object.assign(Gen.ERR, def.ERR || {});
      Object.keys(def.SUBS || {}).forEach((k) => { if (Gen.SUBS[k]) console.warn('Ejercicio duplicado', k); Gen.SUBS[k] = Object.assign({ subject: sid }, def.SUBS[k]); });
    },
    addLabs(sid, labs) { Object.keys(labs).forEach((k) => { LAB[k] = Object.assign(labs[k], { subject: sid }); }); },
    topicSubject(tid) { const t = Content.byId(tid); return t ? t.subject : null; }
  };

  global.Brujula = Brujula; global.Content = Content; global.Gen = Gen; global.LAB = LAB;
  if (typeof module !== 'undefined' && module.exports) module.exports = { Brujula, Content, Gen, LAB };
})(typeof window !== 'undefined' ? window : globalThis);
