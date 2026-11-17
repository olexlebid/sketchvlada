import { $, $$, clamp, lerp, easeOut, FINE, state } from './utils.js';

/* ---------- perspective room (the signature) ---------- */
export function Persp(canvas, opt) {
  const ctx = canvas.getContext('2d');
  const st = { w: 0, h: 0, dpr: 1, vp: { x: 0, y: 0 }, tg: { x: 0, y: 0 }, t: 0, raf: null, mouse: null, visible: true, t0: 0 };
  const note = opt.note || null;
  function base() { return opt.base(st.w, st.h); }
  function resize() {
    const r = canvas.getBoundingClientRect();
    st.dpr = Math.min(2, window.devicePixelRatio || 1);
    st.w = r.width; st.h = r.height;
    canvas.width = Math.round(st.w * st.dpr); canvas.height = Math.round(st.h * st.dpr);
    const b = base();
    if (!st.vp.x) { st.vp.x = b.x; st.vp.y = b.y; }
    st.tg.x = b.x; st.tg.y = b.y;
    draw(); kick();
  }
  function seg(x1, y1, x2, y2, f) { // draw from outer point (x1,y1) toward inner point (x2,y2), fraction f
    ctx.moveTo(x1, y1); ctx.lineTo(lerp(x1, x2, f), lerp(y1, y2, f));
  }
  function draw() {
    const { w, h, dpr, vp } = st;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const f = easeOut(clamp(st.t, 0, 1));
    const bw = w * opt.bw, bh = h * opt.bh;
    const x0 = vp.x - bw / 2, x1 = vp.x + bw / 2, y0 = vp.y - bh * .45, y1 = vp.y + bh * .55;
    ctx.lineWidth = 1;
    // floor and ceiling rays
    ctx.beginPath(); ctx.strokeStyle = 'rgba(92,198,220,.13)';
    const N = opt.rays;
    for (let i = 0; i <= N; i++) {
      const px = lerp(-w * .5, w * 1.5, i / N);
      const sB = (h - y1) / (h - vp.y);
      seg(px, h, lerp(px, vp.x, sB), y1, f);
      const sT = y0 / Math.max(1, vp.y);
      if (i % 2 === 0) seg(px, 0, lerp(px, vp.x, sT), y0, f);
    }
    ctx.stroke();
    // depth lines: floor horizontals + wall verticals
    ctx.beginPath(); ctx.strokeStyle = 'rgba(92,198,220,.11)';
    const M = opt.depth;
    for (let j = 1; j < M; j++) {
      const q = Math.pow(j / M, 1.8);
      const y = y1 + (h - y1) * q;
      const xl = x0 + (0 - x0) * q, xr = x1 + (w - x1) * q;
      const cx = (xl + xr) / 2;
      seg(xl, y, cx, y, f); seg(xr, y, cx, y, f);
      const ytL = y0 * (1 - q);
      seg(xl, y, xl, ytL, f); seg(xr, y, xr, ytL, f);
    }
    ctx.stroke();
    // room edges (strong)
    ctx.beginPath(); ctx.strokeStyle = 'rgba(92,198,220,.42)'; ctx.lineWidth = 1.2;
    seg(0, 0, x0, y0, f); seg(w, 0, x1, y0, f); seg(w, h, x1, y1, f); seg(0, h, x0, y1, f);
    ctx.stroke();
    // back wall
    if (f > .55) {
      const g = (f - .55) / .45;
      ctx.globalAlpha = g; ctx.beginPath(); ctx.strokeStyle = 'rgba(92,198,220,.34)';
      ctx.rect(x0, y0, bw, bh); ctx.stroke();
      // a doorway on the back wall to suggest an interior
      ctx.beginPath(); ctx.strokeStyle = 'rgba(92,198,220,.22)';
      const dw = bw * .22, dh = bh * .62, dx = x0 + bw * .62;
      ctx.rect(dx, y1 - dh, dw, dh); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    // construction rays in accent
    ctx.beginPath(); ctx.strokeStyle = 'rgba(255,196,59,.28)'; ctx.setLineDash([4, 6]);
    seg(w * opt.rayA, h, vp.x, vp.y, f); seg(w, h * .78, vp.x, vp.y, f);
    ctx.stroke(); ctx.setLineDash([]);
    // vanishing point mark
    ctx.globalAlpha = f;
    ctx.beginPath(); ctx.strokeStyle = '#FFC43B'; ctx.lineWidth = 1.4;
    ctx.arc(vp.x, vp.y, 6, 0, Math.PI * 2);
    ctx.moveTo(vp.x - 13, vp.y); ctx.lineTo(vp.x + 13, vp.y); ctx.moveTo(vp.x, vp.y - 13); ctx.lineTo(vp.x, vp.y + 13);
    ctx.stroke(); ctx.globalAlpha = 1;
    if (note) note.style.transform = `translate(${Math.round(vp.x + 16)}px,${Math.round(vp.y - 40)}px)`;
  }
  function loop(ts) {
    st.raf = null;
    if (!st.t0) st.t0 = ts;
    let moving = false;
    if (st.t < 1) { st.t = state.reduced ? 1 : Math.min(1, (ts - st.t0) / 1800); moving = true; }
    if (opt.drift && !state.reduced && !st.mouse) { // gentle drift on touch screens
      const b = base(); st.tg.x = b.x + Math.sin(ts / 3200) * st.w * .06; st.tg.y = b.y + Math.cos(ts / 4100) * st.h * .03; moving = true;
    }
    const k = state.reduced ? 1 : .085;
    const dx = st.tg.x - st.vp.x, dy = st.tg.y - st.vp.y;
    if (Math.abs(dx) > .3 || Math.abs(dy) > .3) { st.vp.x += dx * k; st.vp.y += dy * k; moving = true; }
    draw();
    if (moving && st.visible) kick();
  }
  function kick() { if (st.raf === null && st.visible) st.raf = requestAnimationFrame(loop); }
  function point(cx, cy) {
    const r = canvas.getBoundingClientRect();
    const b = base();
    const mx = cx - r.left, my = cy - r.top;
    st.mouse = true;
    st.tg.x = clamp(b.x + (mx - b.x) * opt.pull, st.w * .12, st.w * .88);
    st.tg.y = clamp(b.y + (my - b.y) * opt.pull, st.h * .16, st.h * .8);
    kick();
  }
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(es => { st.visible = es[0].isIntersecting; if (st.visible) kick(); }).observe(canvas);
  return { point, kick, resize, st, setT(v) { st.t = v; draw(); } };
}

// Hero + final CTA rooms, hero parallax and load choreography trigger
export function initPerspective() {
  const heroEl = $('#top');
  const heroP = Persp($('#heroPersp'), {
    note: $('#vpNote'), bw: .2, bh: .28, rays: 26, depth: 9, pull: .38, rayA: .2,
    drift: !FINE.matches,
    base: (w, h) => w > 900 ? { x: w * .5, y: h * .2 } : { x: w * .5, y: h * .8 }
  });
  const finalBtn = $('#finalBtn');
  const finalP = Persp($('#finalPersp'), {
    bw: .16, bh: .2, rays: 30, depth: 8, pull: .22, rayA: .3, drift: !FINE.matches,
    base: (w, h) => {
      const c = $('#finalPersp').getBoundingClientRect(), b = finalBtn.getBoundingClientRect();
      return { x: b.left - c.left + b.width / 2, y: b.top - c.top + b.height / 2 };
    }
  });
  finalP.setT(0);
  // final room draws itself when it scrolls into view
  new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { finalP.st.t0 = 0; finalP.st.t = 0.0001; finalP.kick(); o.disconnect(); } }, { threshold: .35 }).observe($('#start'));

  // hero visual parallax (floating cards follow the cursor too)
  const floats = $$('.float');
  let par = { x: 0, y: 0, tx: 0, ty: 0, raf: null };
  function parLoop() {
    par.raf = null;
    par.x += (par.tx - par.x) * .08; par.y += (par.ty - par.y) * .08;
    floats.forEach(el => {
      const d = +el.dataset.depth;
      el.style.transform = `translate3d(${(par.x * d * 14).toFixed(2)}px,${(par.y * d * 10).toFixed(2)}px,0) rotate(var(--rot))`;
    });
    if (Math.abs(par.tx - par.x) > .002 || Math.abs(par.ty - par.y) > .002) par.raf = requestAnimationFrame(parLoop);
  }
  floats.forEach(el => el.style.transform = 'rotate(var(--rot))');

  if (FINE.matches) {
    heroEl.addEventListener('pointermove', e => {
      if (state.reduced) return;
      heroP.point(e.clientX, e.clientY);
      const r = heroEl.getBoundingClientRect();
      par.tx = (e.clientX - r.left) / r.width - .5; par.ty = (e.clientY - r.top) / r.height - .5;
      if (par.raf === null) par.raf = requestAnimationFrame(parLoop);
    });
    $('#start').addEventListener('pointermove', e => { if (!state.reduced) finalP.point(e.clientX, e.clientY); });
  }
  requestAnimationFrame(() => requestAnimationFrame(() => heroEl.classList.add('is-on')));
  return { heroEl, heroP, finalP, floats };
}
