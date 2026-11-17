import { $, state } from './utils.js';

// "Paint the sketch" interaction: brush reveals the colour image through a mask canvas
export function initPaint() {
  const paint = $('#paint'), stage = $('#paintStage'), cv = $('#paintCv'), brush = $('#brush');
  const covBar = $('#covBar'), covPct = $('#covPct');
  const pctx = cv.getContext('2d');
  const mask = document.createElement('canvas'), mctx = mask.getContext('2d');
  const colorImg = new Image();
  colorImg.decoding = 'async';
  colorImg.src = $('.paint__base').currentSrc || $('.paint__base').src;
  const GX = 16, GY = 11; const cells = new Uint8Array(GX * GY); let painted = 0, done = false, pDirty = false, pRaf = null, last = null;
  function pResize() {
    const r = stage.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1);
    cv.width = mask.width = Math.round(r.width * d); cv.height = mask.height = Math.round(r.height * d);
    pDirty = true; pFrame();
  }
  function pFrame() {
    if (pRaf !== null) return;
    pRaf = requestAnimationFrame(() => {
      pRaf = null; if (!pDirty) return; pDirty = false;
      pctx.globalCompositeOperation = 'source-over';
      pctx.clearRect(0, 0, cv.width, cv.height);
      pctx.drawImage(mask, 0, 0);
      pctx.globalCompositeOperation = 'source-in';
      if (colorImg.complete && colorImg.naturalWidth) {
        // cover-fit the colour image exactly like the base image
        const iw = colorImg.naturalWidth, ih = colorImg.naturalHeight, s = Math.max(cv.width / iw, cv.height / ih);
        pctx.drawImage(colorImg, (cv.width - iw * s) / 2, (cv.height - ih * s) / 2, iw * s, ih * s);
      }
    });
  }
  colorImg.onload = () => { pDirty = true; pFrame(); };
  function dab(x, y) {
    const d = cv.width / stage.clientWidth, R = Math.max(34, stage.clientWidth * .065) * d;
    const g = mctx.createRadialGradient(x * d, y * d, 0, x * d, y * d, R);
    g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.6, 'rgba(0,0,0,.9)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    mctx.fillStyle = g; mctx.beginPath(); mctx.arc(x * d, y * d, R, 0, Math.PI * 2); mctx.fill();
    // coverage by grid cells under the brush
    const cw = stage.clientWidth / GX, chh = stage.clientHeight / GY, rr = R / d * .7;
    for (let gy = 0; gy < GY; gy++) for (let gx = 0; gx < GX; gx++) {
      const i = gy * GX + gx; if (cells[i]) continue;
      const cx = (gx + .5) * cw, cy = (gy + .5) * chh;
      if ((cx - x) ** 2 + (cy - y) ** 2 < rr * rr) { cells[i] = 1; painted++; }
    }
    const cov = painted / cells.length;
    covBar.style.setProperty('--cov', Math.min(1, cov / .6).toFixed(3));
    covPct.textContent = Math.min(100, Math.round(cov / .6 * 100)) + '%';
    pDirty = true; pFrame();
    if (cov >= .6) finishPaint();
  }
  function stroke(x, y) {
    if (last) {
      const dx = x - last.x, dy = y - last.y, dist = Math.hypot(dx, dy), n = Math.ceil(dist / 14);
      for (let i = 1; i <= n; i++) dab(last.x + dx * i / n, last.y + dy * i / n);
    } else dab(x, y);
    last = { x, y };
  }
  function finishPaint() {
    if (done) return; done = true;
    covBar.style.setProperty('--cov', 1); covPct.textContent = '100%';
    paint.classList.add('is-done', 'is-started');
  }
  stage.addEventListener('pointermove', e => {
    const r = stage.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    brush.style.transform = `translate(${x}px,${y}px)`;
    if (done) return;
    if (e.pointerType === 'mouse' || e.buttons) { paint.classList.add('is-started'); stroke(x, y); }
  });
  stage.addEventListener('pointerdown', e => { if (done) return; last = null; const r = stage.getBoundingClientRect(); paint.classList.add('is-started'); stroke(e.clientX - r.left, e.clientY - r.top); });
  stage.addEventListener('pointerleave', () => { last = null; });
  stage.addEventListener('pointerup', () => { last = null; });
  $('#paintAll').addEventListener('click', () => {
    if (state.reduced) return finishPaint();
    // sweep the brush across in rows, like a stylus filling the sketch
    paint.classList.add('is-started');
    const W = stage.clientWidth, H = stage.clientHeight, rows = 5; let i = 0; const total = 46;
    (function sw() {
      if (done) return;
      const row = Math.floor(i / (total / rows)), t = (i % (total / rows)) / (total / rows);
      const x = row % 2 ? W * (1 - t) : W * t, y = H * (row + .5) / rows;
      last = null; dab(x, y); i++;
      if (i < total) requestAnimationFrame(sw); else finishPaint();
    })();
  });
  new ResizeObserver(pResize).observe(stage);
  return { finishPaint };
}
