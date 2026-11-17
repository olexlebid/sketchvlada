import { $, $$, RM, state } from './utils.js';

// Duplicate marquee content for an endless loop
export function initMarquee() {
  const mq = $('#marq'); mq.innerHTML += mq.innerHTML;
}

// Pause CSS loops on hidden tabs
export function initVisibilityPause() {
  document.addEventListener('visibilitychange', () => document.body.classList.toggle('paused', document.hidden));
}

// Reduced motion, live in both directions
export function initReducedMotion({ heroP, finalP, floats, drawLines, finishPaint, applyJ }) {
  function pinFinal() {
    $$('.rv').forEach(el => el.classList.add('in', 'done'));
    $$('[data-count]').forEach(el => el.textContent = el.dataset.count + (el.dataset.suffix || ''));
    heroP.setT(1); finalP.setT(1);
    floats.forEach(el => el.style.transform = 'rotate(var(--rot))');
    $$('[data-magnetic]').forEach(el => el.style.transform = '');
    drawLines();
    finishPaint();
  }
  RM.addEventListener('change', e => {
    state.reduced = e.matches;
    if (state.reduced) pinFinal(); else { drawLines(); heroP.kick(); }
    applyJ();
  });
  if (state.reduced) pinFinal();
}
