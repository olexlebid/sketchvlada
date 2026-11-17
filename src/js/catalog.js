import { $, $$, state } from './utils.js';

// Course catalog filter with persona line
export function initCatalog() {
  const persona = $('#persona'), pText = $('p', persona);
  const P = {
    all: 'Усі курси школи. Ціна, старт і статус набору на кожній картці.',
    novice: 'Я ніколи не малювала, але дуже хочу. З чого почати, щоб зрозуміти, чи це моє?',
    more: 'Хочу навчитися з нуля і отримати повні знання, щоб на цьому заробляти.',
    pro: 'Я вже добре малюю. Хочу впевнено говорити із замовниками і не боятися складного.',
    model: 'Тут не малюємо, а моделюємо на ноутбуці, комп\'ютері чи iPad. Навички малювання не обов\'язкові.',
    promo: 'Як вести і просувати сторінку художника чи дизайнера в Instagram. Найкраще працює для новачків.'
  };
  const chips = $$('.chip'), cards = $$('.card');
  chips.forEach(ch => ch.addEventListener('click', () => {
    const f = ch.dataset.f;
    chips.forEach(c => c.setAttribute('aria-pressed', String(c === ch)));
    persona.classList.add('swap');
    setTimeout(() => { pText.textContent = P[f]; persona.classList.remove('swap'); }, state.reduced ? 0 : 180);
    let o = 0;
    cards.forEach(c => {
      const show = f === 'all' || c.dataset.cat.split(' ').includes(f);
      c.classList.remove('is-enter');
      c.classList.toggle('is-out', !show);
      if (show) { c.style.setProperty('--o', o++); void c.offsetWidth; c.classList.add('is-enter'); }
    });
  }));
}
