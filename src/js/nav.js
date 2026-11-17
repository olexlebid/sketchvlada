import { $, $$ } from './utils.js';

// Nav background on scroll, hide on scroll-down, mobile menu, active section
export function initNav() {
  const nav = $('#nav'), burger = $('.burger'), mmenu = $('#mmenu');
  let lastY = 0;
  function onNavScroll() {
    const y = scrollY;
    nav.classList.toggle('is-solid', y > 20);
    const hide = y > lastY && y > 600 && !nav.classList.contains('menu-open');
    nav.classList.toggle('is-hidden', hide);
    lastY = y;
  }
  function setMenu(open) {
    nav.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
    if (open) nav.classList.add('is-solid'); else onNavScroll();
  }
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('menu-open')));
  mmenu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('menu-open')) { setMenu(false); burger.focus(); } });
  // active section in nav
  const navLinks = $$('.nav__links a');
  const secObs = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['catalog', 'journey', 'works', 'about', 'reviews', 'faq'].forEach(id => secObs.observe(document.getElementById(id)));
  return { onNavScroll };
}

// Sticky mobile CTA, hidden while hero/catalog/final/footer are on screen
export function initMobileCta(heroEl) {
  const mcta = $('#mcta');
  let ctaBlock = new Set();
  const ctaObs = new IntersectionObserver(es => { es.forEach(en => { en.isIntersecting ? ctaBlock.add(en.target) : ctaBlock.delete(en.target); }); mctaUpdate(); }, { threshold: 0 });
  [heroEl, $('#catalog'), $('#start'), $('.foot')].forEach(el => ctaObs.observe(el));
  function mctaUpdate() { mcta.classList.toggle('show', ctaBlock.size === 0); }
  return { mctaUpdate };
}
