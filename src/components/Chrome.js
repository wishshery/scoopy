/**
 * Page chrome — preloader, scroll progress bar, and the floating control dock.
 * These sit outside the document flow and are shared across every section.
 */

import { $, rafThrottle, clamp } from '../utils/dom.js';
import { icons } from '../utils/icons.js';

/* The preloader itself is static markup in index.html so it paints before this
   bundle loads; only its dismissal is handled here. */

export function renderProgress() {
  return `
    <div class="progress" aria-hidden="true">
      <div class="progress__bar" data-progress-bar></div>
    </div>`;
}

export function renderDock() {
  return `
    <div class="dock">
      <button
        class="dock__btn dock__btn--sound"
        type="button"
        data-sound-toggle
        aria-pressed="false"
        data-tip="Play bird song"
        aria-label="Play gentle bird song"
      >
        <span data-when="off" aria-hidden="true">${icons.volumeOff}</span>
        <span data-when="on" aria-hidden="true">${icons.volumeOn}</span>
      </button>

      <button
        class="dock__btn dock__btn--top"
        type="button"
        data-back-to-top
        data-tip="Back to top"
        aria-label="Back to top"
      >${icons.arrowUp}</button>
    </div>`;
}

/** Drive the scroll progress bar and the visibility of the back-to-top button. */
export function initChrome() {
  const bar = $('[data-progress-bar]');
  const topButton = $('[data-back-to-top]');

  const update = rafThrottle(() => {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? clamp(window.scrollY / scrollable, 0, 1) : 0;

    bar?.style.setProperty('--scroll', progress.toFixed(4));
    topButton?.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.8);
  });

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();

  topButton?.addEventListener('click', () => {
    // `scroll-behavior: smooth` on <html> handles the easing; the reduced-motion
    // media query in animations.css turns it into an instant jump when asked.
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Move focus somewhere sensible so keyboard users are not stranded.
    document.getElementById('top')?.focus({ preventScroll: true });
  });
}

/** Fade the preloader out once the page is ready, then run a callback. */
export function dismissPreloader(onDone) {
  const preloader = $('[data-preloader]');

  const finish = () => {
    preloader?.classList.add('is-done');
    // Remove from the a11y tree immediately; the node is dropped after the fade.
    preloader?.setAttribute('aria-hidden', 'true');
    setTimeout(() => preloader?.remove(), 900);
    onDone?.();
  };

  // Wait for the hero image (and everything else already requested) to settle,
  // but never hold the page hostage — 2.2s is the hard ceiling.
  if (document.readyState === 'complete') {
    setTimeout(finish, 260);
  } else {
    let done = false;
    const once = () => {
      if (done) return;
      done = true;
      setTimeout(finish, 260);
    };
    window.addEventListener('load', once, { once: true });
    setTimeout(once, 2200);
  }
}
