/**
 * Daily routine — vertical timeline.
 *
 * The rail fills as the section passes through the viewport; each entry lights
 * its node once revealed (handled by the shared reveal observer).
 */

import { $, esc, html, clamp, rafThrottle } from '../utils/dom.js';
import { icons } from '../utils/icons.js';
import { routine } from '../data/site.js';
import { renderLeaf } from './Decor.js';

/** Icon per time of day, in the same order as the routine data. */
const STEP_ICONS = [icons.sun, icons.bowl, icons.leafIcon, icons.zzz, icons.home];

export function renderTimeline() {
  return `
    <section class="section routine" id="routine" aria-labelledby="routine-title">
      ${renderLeaf('bl')}

      <div class="shell shell--narrow">
        <div class="section__head">
          <p class="eyebrow" data-reveal>A day in the life</p>
          <h2 id="routine-title" data-reveal style="--reveal-delay:80ms">
            From first chirp <span class="text-gradient">to last cuddle</span>
          </h2>
        </div>

        <ol class="timeline" data-timeline>
          <span class="timeline__progress" data-timeline-progress aria-hidden="true"></span>

          ${html(
            routine.map(
              (step, i) => `
            <li class="tl-item" data-reveal="left" style="--reveal-delay:${i * 80}ms">
              <span class="tl-item__dot" aria-hidden="true">${STEP_ICONS[i] || icons.star}</span>
              <p class="tl-item__time">${esc(step.time)}</p>
              <h3 class="tl-item__title">${esc(step.title)}</h3>
              <p class="tl-item__body">${esc(step.body)}</p>
            </li>`
            )
          )}
        </ol>
      </div>
    </section>`;
}

export function initTimeline() {
  const list = $('[data-timeline]');
  const bar = $('[data-timeline-progress]');
  if (!list || !bar) return;

  const update = rafThrottle(() => {
    const rect = list.getBoundingClientRect();
    const viewportAnchor = window.innerHeight * 0.62;

    // 0 when the top of the list reaches the anchor line, 1 when the bottom does.
    const progress = clamp((viewportAnchor - rect.top) / rect.height, 0, 1);
    bar.style.setProperty('--progress', progress.toFixed(4));
  });

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
}
