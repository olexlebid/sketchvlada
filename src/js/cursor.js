import { $, $$, FINE, state } from './utils.js';

// Magnetic buttons + cursor ring (fine pointers only)
export function initCursor() {
  const cur = $('#cursor');
  if (!FINE.matches) return;
  let cx = -100, cy = -100, tx = -100, ty = -100, cRaf = null;
  const cLoop = () => { cRaf = null; cx += (tx - cx) * .2; cy += (ty - cy) * .2; cur.style.transform = `translate(${cx.toFixed(1)}px,${cy.toFixed(1)}px)`; if (Math.abs(tx - cx) > .2 || Math.abs(ty - cy) > .2) cRaf = requestAnimationFrame(cLoop); };
  addEventListener('pointermove', e => {
    if (state.reduced || e.pointerType !== 'mouse') return;
    tx = e.clientX; ty = e.clientY; cur.classList.add('on');
    const t = e.target;
    cur.classList.toggle('big', !!t.closest('a,button,summary'));
    cur.classList.toggle('hide', !!t.closest('#paintStage,input,textarea'));
    if (cRaf === null) cRaf = requestAnimationFrame(cLoop);
  }, { passive: true });
  document.addEventListener('pointerleave', () => cur.classList.remove('on'));
  $$('[data-magnetic]').forEach(el => {
    el.addEventListener('pointermove', e => {
      if (state.reduced) return;
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * .22).toFixed(1)}px,${((e.clientY - r.top - r.height / 2) * .3).toFixed(1)}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}
