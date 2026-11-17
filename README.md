# Sketch Vlada School: головна сторінка

Vite + vanilla JS. Без фреймворків. Візуально й за поведінкою збігається з `_original/index.html`.

## Запуск

Потрібен Node 18+.

```bash
npm install
npm run dev
```

Сайт відкриється на http://localhost:5173. Dev-сервер слухає всі інтерфейси (`host: true`), тож у тій самій Wi-Fi мережі його можна відкрити з телефона за адресою `Network`, яку покаже Vite.

## Скрипти

- `npm run dev`: dev-сервер
- `npm run build`: збірка в `dist/`
- `npm run preview`: локальний перегляд збірки

## Структура

- `index.html`: розмітка, meta, JSON-LD, інлайн SVG-фільтр `#lineart`
- `src/main.js`: точка входу (стилі й модулі, порядок ініціалізації як в оригіналі)
- `src/styles/`: `tokens.css`, `base.css`, `fonts.css`, `sections/*.css`, `responsive.css`
- `src/js/`: модулі (perspective, nav, reveal, catalog, journey, paint, lightbox, cursor, motion, utils)
- `public/images/`, `public/fonts/`: картинки та self-hosted шрифти (woff2, кирилиця + латиниця)
- `_original/index.html`: оригінал для порівняння
