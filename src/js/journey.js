import { $, $$, doc, clamp, smooth, easeOut } from './utils.js';

// Scroll-scrubbed "from line to sketch" section, with a static fallback mode
export function initJourney() {
  const GATES = [
    '(max-width: 720px)',
    '(orientation: portrait) and (max-width: 1024px)',
    '(orientation: portrait) and (pointer: coarse)',
    '(orientation: landscape) and (pointer: coarse) and (max-height: 560px)',
    '(prefers-reduced-motion: reduce)'
  ];
  const MQLS = GATES.map(q => matchMedia(q));
  const jSec = $('#journey'), jFrame = $('#jframe'), stylus = $('#stylus'), rail = $('#railFill');
  const hudStep = $('#hudStep'), hudPct = $('#hudPct');
  const lineL = $('.jl--line'), toneL = $('.jl--tone'), colL = $('.jl--color');
  const bands = $$('.band').map(el => ({ el, a: +el.dataset.a, b: +el.dataset.b, op: -1, k: -1 }));
  const steps = ['01 / Лінія', '02 / Тон', '03 / Матеріал', '04 / Подача'];

  // split band text into words for the rise entrance (screen readers get the full sentence)
  $$('.band .split').forEach(p => {
    const txt = p.textContent.trim();
    const words = txt.split(/\s+/);
    p.textContent = '';
    const sr = document.createElement('span'); sr.className = 'sr'; sr.textContent = txt; p.appendChild(sr);
    const vis = document.createElement('span'); vis.setAttribute('aria-hidden', 'true');
    words.forEach((w, i) => {
      const s = document.createElement('span'); s.className = 'w'; s.textContent = w;
      s.style.setProperty('--th', (i / words.length * .55).toFixed(3));
      vis.appendChild(s); vis.appendChild(document.createTextNode(' '));
    });
    p.appendChild(vis);
  });

  let jOn = false, jRaf = null, jShown = -1, jTarget = 0, jCur = 0;
  function jProgress() {
    const r = jSec.getBoundingClientRect();
    const range = r.height - innerHeight;
    return range > 0 ? clamp(-r.top / range, 0, 1) : 0;
  }
  function jRender(p) {
    // line art grows from the vanishing point
    const r0 = 22 + smooth(p, 0, .2) * 128;
    if (Math.abs((lineL._r || -1) - r0) > .2) { lineL._r = r0; lineL.style.setProperty('--r0', r0.toFixed(2) + '%'); }
    const x1 = easeOut(clamp((p - .27) / .2, 0, 1)) * 100;
    const x2 = easeOut(clamp((p - .52) / .2, 0, 1)) * 100;
    if (Math.abs((toneL._x || -1) - x1) > .15) { toneL._x = x1; toneL.style.setProperty('--x1', x1.toFixed(2) + '%'); }
    if (Math.abs((colL._x || -1) - x2) > .15) { colL._x = x2; colL.style.setProperty('--x2', x2.toFixed(2) + '%'); }
    // stylus rides the active sweep edge
    const sweep = (p > .27 && p < .5) ? x1 : (p > .52 && p < .75) ? x2 : -1;
    const so = sweep > .5 && sweep < 99.5 ? 1 : 0;
    if (stylus._o !== so) { stylus._o = so; stylus.style.opacity = so; }
    if (so) { const px = jFrame.clientWidth * sweep / 100; stylus.style.setProperty('--sx', px.toFixed(1) + 'px'); }
    // rail + hud
    if (Math.abs((rail._p || -1) - p) > .002) { rail._p = p; rail.style.setProperty('--p', p.toFixed(4)); }
    const si = Math.min(3, Math.floor(p * 4));
    if (si !== jShown) { jShown = si; hudStep.textContent = steps[si]; }
    const pct = Math.round(p * 100) + '%';
    if (hudPct.textContent !== pct) hudPct.textContent = pct;
    // caption bands with smoothstep edges and assembly progress
    bands.forEach((bd, i) => {
      const { a, b } = bd, f = Math.min(.03, (b - a) / 4);
      const inE = i === 0 ? 1 : smooth(p, a, a + f);
      const outE = i === bands.length - 1 ? 0 : smooth(p, b - f, b);
      const op = inE * (1 - outE);
      if (Math.abs(bd.op - op) > .004) { bd.op = op; bd.el.style.opacity = op.toFixed(3); bd.el.style.visibility = op < .01 ? 'hidden' : 'visible'; }
      const k = i === 0 ? 1 : clamp((p - a) / Math.min(.09, (b - a) * .45), 0, 1);
      if (Math.abs(bd.k - k) > .008) { bd.k = k; bd.el.style.setProperty('--k', k.toFixed(3)); }
    });
  }
  function jLoop() {
    jRaf = null;
    jCur += (jTarget - jCur) * .14;
    if (Math.abs(jTarget - jCur) < .0004) jCur = jTarget;
    jRender(jCur);
    if (jCur !== jTarget) jRaf = requestAnimationFrame(jLoop);
  }
  function jScroll() { jTarget = jProgress(); if (jRaf === null) jRaf = requestAnimationFrame(jLoop); }
  function enableJ() {
    if (jOn) return; jOn = true;
    doc.classList.remove('static-journey');
    bands.forEach(b => { b.op = -1; b.k = -1; });
    addEventListener('scroll', jScroll, { passive: true });
    jCur = jTarget = jProgress(); jRender(jCur);
  }
  function disableJ() {
    if (!jOn && doc.classList.contains('static-journey')) return;
    jOn = false;
    removeEventListener('scroll', jScroll);
    if (jRaf !== null) { cancelAnimationFrame(jRaf); jRaf = null; }
    doc.classList.add('static-journey');
  }
  function applyJ() { if (MQLS.some(m => m.matches)) disableJ(); else enableJ(); }
  MQLS.forEach(m => m.addEventListener('change', applyJ));
  applyJ();
  return { applyJ };
}
