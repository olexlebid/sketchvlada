import { $$, clamp, easeOut, state } from './utils.js';

// Scroll reveals
export function initReveal() {
  const rvObs = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target; el.classList.add('in'); rvObs.unobserve(el);
    // retire the stagger delay once the entrance has played, so hovers never lag
    setTimeout(() => el.classList.add('done'), 1600);
  }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  $$('.rv').forEach(el => rvObs.observe(el));
}

// Number counters
export function initCounters() {
  const cntObs = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    cntObs.unobserve(en.target);
    const el = en.target, to = +el.dataset.count, suf = el.dataset.suffix || '';
    if (state.reduced) { el.textContent = to + suf; return; }
    const t0 = performance.now();
    (function tick(t) {
      const p = clamp((t - t0) / 1400, 0, 1);
      el.textContent = Math.round(to * easeOut(p)) + suf;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => cntObs.observe(el));
}

// Section divider lines draw with scroll
export function initDividerLines() {
  const draws = $$('[data-draw]');
  draws.forEach(p => { p.style.strokeDasharray = '1'; p.style.strokeDashoffset = '1'; });
  function drawLines() {
    draws.forEach(p => {
      const r = p.getBoundingClientRect();
      const v = state.reduced ? 0 : 1 - clamp((innerHeight - r.top) / (innerHeight * .7), 0, 1);
      if (Math.abs((p._v ?? 2) - v) > .003) { p._v = v; p.style.strokeDashoffset = v.toFixed(3); }
    });
  }
  return { drawLines };
}
