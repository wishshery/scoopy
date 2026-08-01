/**
 * Hero — full-viewport introduction.
 *
 * The headline is split into masked lines that slide up in sequence once the
 * preloader clears. Clouds are generated with randomised speeds so the drift
 * never looks looped.
 */

import { $$, esc, html, rand, randInt } from '../utils/dom.js';
import { icons } from '../utils/icons.js';
import { meta } from '../data/site.js';
import { renderMedia } from './Media.js';
import { renderQrCard } from './QrCard.js';
import { prefersReducedMotion } from '../utils/motion.js';

/** A soft multi-lobed cloud shape. */
const cloudSvg = `
  <svg viewBox="0 0 200 70" fill="currentColor" aria-hidden="true" focusable="false">
    <ellipse cx="60" cy="45" rx="46" ry="22"/>
    <ellipse cx="100" cy="32" rx="38" ry="26"/>
    <ellipse cx="140" cy="45" rx="42" ry="21"/>
  </svg>`;

function renderClouds(count = 4) {
  return html(
    Array.from({ length: count }, (_, i) => {
      const width = randInt(140, 300);
      const top = randInt(6, 42);
      const duration = randInt(70, 130);
      const delay = -randInt(0, duration);
      return `<div class="cloud" style="width:${width}px;top:${top}%;animation-duration:${duration}s;animation-delay:${delay}s;opacity:${rand(
        0.25,
        0.55
      ).toFixed(2)}" aria-hidden="true">${cloudSvg}</div>`;
    })
  );
}

/**
 * @param {object} heroPhoto the photo to use as the backdrop
 */
export function renderHero(heroPhoto) {
  return `
    <section class="hero" id="top" data-parallax="0.1">
      <div class="hero__sky" aria-hidden="true"></div>
      <div class="hero__clouds" aria-hidden="true">${renderClouds()}</div>

      <div class="hero__figure" data-parallax-target>
        ${
          heroPhoto
            ? renderMedia(heroPhoto, {
                framing: 'natural',
                /* The hero is `object-fit: cover` in a full-viewport box. On a
                   portrait screen the photo is cropped hard from the sides, so
                   the width actually painted is far larger than the viewport —
                   `100vw` there would pick a file several times too small and
                   render soft. Tall viewports get the full-resolution file. */
                sizes: '(max-aspect-ratio: 3/4) 1280px, 100vw',
                eager: true,
                fill: true,
                className: 'hero__media',
              })
            : ''
        }
      </div>

      <!-- Same card as the Follow section, so visitors can scan without
           scrolling. Rendered from the shared component to keep them identical. -->
      ${renderQrCard({
        className: 'qr--hero',
        eager: true,
        extraAttrs: 'data-hero-el style="--reveal-delay:760ms"',
      })}

      <div class="hero__inner">
        <p class="hero__badge" data-hero-el style="--reveal-delay:120ms">
          <b aria-hidden="true">${icons.feather}</b>
          <span>${esc(meta.species)}</span>
        </p>

        <h1 class="hero__title" data-hero-title>
          <span class="line-mask" style="--reveal-delay:200ms"><span>Meet</span></span>
          <span class="line-mask" style="--reveal-delay:320ms"><span><em>${esc(meta.name)}</em></span></span>
        </h1>

        <p class="hero__sub" data-hero-el style="--reveal-delay:520ms">${esc(meta.tagline)}</p>

        <div class="hero__actions" data-hero-el style="--reveal-delay:640ms">
          <a class="btn btn--pulse" href="#about">
            <span>Meet the bird</span>
            ${icons.arrowRight}
          </a>
          <a class="btn btn--ghost" href="#gallery">See the gallery</a>
        </div>
      </div>

      <a class="hero__cue" href="#about" aria-label="Scroll to Scoopy's story">
        <span class="hero__cue-track" aria-hidden="true"></span>
        <span>Scroll</span>
      </a>
    </section>`;
}

/**
 * Play the entrance sequence. Called once the preloader has finished so the
 * animation is never wasted behind a splash screen.
 */
export function playHeroIntro() {
  const targets = [...$$('.hero [data-hero-el]'), ...$$('.hero .line-mask')];

  if (prefersReducedMotion) {
    targets.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  // Two frames: one for the elements to exist in their hidden state, one to
  // flip the class so the transition actually runs.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => targets.forEach((el) => el.classList.add('is-revealed')))
  );
}

/* The hidden/revealed states for `[data-hero-el]` live in hero.css — nothing
   needs wiring up here beyond the intro playback above. */
