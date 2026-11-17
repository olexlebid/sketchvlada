import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/sections/nav.css';
import './styles/sections/hero.css';
import './styles/sections/marquee.css';
import './styles/sections/catalog.css';
import './styles/sections/journey.css';
import './styles/sections/school.css';
import './styles/sections/works.css';
import './styles/sections/about.css';
import './styles/sections/reviews.css';
import './styles/sections/faq.css';
import './styles/sections/final.css';
import './styles/sections/footer.css';
import './styles/sections/lightbox.css';
import './styles/sections/cursor.css';
import './styles/responsive.css';

import { doc } from './js/utils.js';
import { initPerspective } from './js/perspective.js';
import { initNav, initMobileCta } from './js/nav.js';
import { initReveal, initCounters, initDividerLines } from './js/reveal.js';
import { initCatalog } from './js/catalog.js';
import { initJourney } from './js/journey.js';
import { initPaint } from './js/paint.js';
import { initLightbox } from './js/lightbox.js';
import { initCursor } from './js/cursor.js';
import { initMarquee, initVisibilityPause, initReducedMotion } from './js/motion.js';

// Same init order as the original inline script
doc.classList.add('js');
const { heroEl, heroP, finalP, floats } = initPerspective();
const { onNavScroll } = initNav();
initReveal();
initCounters();
initCatalog();
const { applyJ } = initJourney();
const { drawLines } = initDividerLines();
const { mctaUpdate } = initMobileCta(heroEl);

let sRaf = null;
addEventListener('scroll', () => {
  if (sRaf !== null) return;
  sRaf = requestAnimationFrame(() => { sRaf = null; onNavScroll(); drawLines(); mctaUpdate(); });
}, { passive: true });
onNavScroll(); drawLines();

const { finishPaint } = initPaint();
initLightbox();
initCursor();
initMarquee();
initVisibilityPause();
initReducedMotion({ heroP, finalP, floats, drawLines, finishPaint, applyJ });
