/**
 * Motion preferences and a single shared animation loop.
 *
 * Every ambient effect subscribes to one rAF loop rather than starting its own,
 * so the page runs a single frame callback no matter how many effects are live.
 * The loop is paused automatically when the tab is hidden.
 */

const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

/** True when the visitor has asked the system to minimise animation. */
export let prefersReducedMotion = reduceQuery.matches;

const preferenceListeners = new Set();

reduceQuery.addEventListener('change', (event) => {
  prefersReducedMotion = event.matches;
  preferenceListeners.forEach((fn) => fn(prefersReducedMotion));
});

/** Run `fn` whenever the reduced-motion preference changes. */
export function onMotionPreferenceChange(fn) {
  preferenceListeners.add(fn);
  return () => preferenceListeners.delete(fn);
}

/**
 * A coarse pointer means touch: hover-driven and cursor-driven effects are
 * pointless there, and skipping them saves meaningful battery on phones.
 */
export const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

/** Rough proxy for a low-powered device — used to thin out particle counts. */
export const isLowPowerDevice =
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
  (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
  window.innerWidth < 700;

/* --- Shared ticker -------------------------------------------------------- */

const subscribers = new Set();
let running = false;
let lastTime = 0;

function frame(now) {
  if (!running) return;

  // Delta capped at ~3 frames so a backgrounded tab does not produce a huge jump.
  const delta = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  subscribers.forEach((fn) => fn(delta, now));

  if (subscribers.size > 0) {
    requestAnimationFrame(frame);
  } else {
    running = false;
  }
}

function start() {
  if (running || subscribers.size === 0) return;
  running = true;
  lastTime = performance.now();
  requestAnimationFrame(frame);
}

/**
 * Subscribe to the shared animation loop.
 * @param {(delta: number, now: number) => void} fn
 * @returns {() => void} unsubscribe
 */
export function onTick(fn) {
  subscribers.add(fn);
  start();
  return () => subscribers.delete(fn);
}

// Stop burning frames while the tab is in the background.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    running = false;
  } else {
    start();
  }
});
