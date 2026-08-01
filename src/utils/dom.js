/**
 * Tiny DOM helpers shared by every component.
 *
 * Components are plain functions that return an HTML string (rendered once at
 * startup) and optionally export an `init` that wires up behaviour afterwards.
 * That keeps markup declarative without pulling in a framework.
 */

export const $ = (selector, scope = document) => scope.querySelector(selector);
export const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

/**
 * Escape a string for safe interpolation into an HTML template.
 * All site copy flows through here so a stray `<` in a caption can never
 * break the document or inject markup.
 */
export function esc(value) {
  return String(value ?? '')
    .replace(/&(?![a-zA-Z]+;|#\d+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Join template fragments, dropping null/undefined/false entries. */
export const html = (parts) => parts.filter(Boolean).join('');

/**
 * Resolve a path from `public/` against the deployment base.
 *
 * Vite rewrites asset URLs it finds in HTML and CSS, but not paths built as
 * strings at runtime. Without this, `media/photo.jpg` resolves relative to the
 * current document — correct at `/scoopy/`, broken at `/scoopy` (no trailing
 * slash) and on any nested route.
 */
export const asset = (path) => `${import.meta.env.BASE_URL}${String(path).replace(/^\/+/, '')}`;

/** Clamp a number into a range. */
export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** Linear interpolation — used to smooth pointer and scroll driven values. */
export const lerp = (from, to, amount) => from + (to - from) * amount;

/** Map a value from one range to another, clamped to the output range. */
export function mapRange(value, inMin, inMax, outMin, outMax) {
  if (inMax === inMin) return outMin;
  const t = clamp((value - inMin) / (inMax - inMin), 0, 1);
  return outMin + t * (outMax - outMin);
}

/** Random float in [min, max). */
export const rand = (min, max) => min + Math.random() * (max - min);

/** Random integer in [min, max]. */
export const randInt = (min, max) => Math.floor(rand(min, max + 1));

/** Pick a random element of an array. */
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Trailing-edge throttle built on requestAnimationFrame.
 * Guarantees the callback runs at most once per frame, which is what we want
 * for scroll and pointermove handlers.
 */
export function rafThrottle(fn) {
  let frame = null;
  let lastArgs = null;

  return (...args) => {
    lastArgs = args;
    if (frame !== null) return;
    frame = requestAnimationFrame(() => {
      frame = null;
      fn(...lastArgs);
    });
  };
}
