// Shared helpers and media-query state
export const doc = document.documentElement;
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (p, e0, e1) => { const t = clamp((p - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
export const easeOut = t => 1 - Math.pow(1 - t, 3);
export const RM = matchMedia('(prefers-reduced-motion: reduce)');
export const FINE = matchMedia('(hover: hover) and (pointer: fine)');
// Mutable reduced-motion flag shared by all modules (updated live in motion.js)
export const state = { reduced: RM.matches };
