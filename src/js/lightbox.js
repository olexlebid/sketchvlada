import { $, $$ } from './utils.js';

// Gallery lightbox + original review screenshots
export function initLightbox() {
  const lb = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  const WORKS = $$('#gallery .work').map(f => ({ src: $('img', f).src, alt: $('img', f).alt, cap: $('figcaption b', f).textContent + ', ' + $('figcaption span', f).textContent }));
  // BASE_URL keeps the paths valid when the site is served from a sub-path (GitHub Pages)
  const REV = [1, 2, 3, 4, 5, 6].map(n => `${import.meta.env.BASE_URL}images/review-0${n}.avif`).map((f, i) => ({ src: f, alt: 'Скриншот оригінального повідомлення', cap: $$('.review footer b')[i].textContent + ', оригінальне повідомлення' }));
  let set = WORKS, idx = 0, opener = null;
  function show(i) { idx = (i + set.length) % set.length; const it = set[idx]; lbImg.src = it.src; lbImg.alt = it.alt; lbCap.textContent = it.cap; }
  function openLb(s, i, from) { set = s; opener = from; show(i); lb.showModal(); }
  $$('#gallery [data-lb]').forEach(b => b.addEventListener('click', () => openLb(WORKS, +b.dataset.lb, b)));
  $$('[data-rv]').forEach(b => b.addEventListener('click', () => openLb(REV, +b.dataset.rv, b)));
  $('#lbPrev').addEventListener('click', () => show(idx - 1));
  $('#lbNext').addEventListener('click', () => show(idx + 1));
  $('#lbClose').addEventListener('click', () => lb.close());
  lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', e => { if (e.key === 'ArrowRight') show(idx + 1); if (e.key === 'ArrowLeft') show(idx - 1); });
  lb.addEventListener('close', () => { if (opener) opener.focus(); });
}
