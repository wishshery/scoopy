/**
 * Personality — interactive trait cards.
 *
 * Each card tracks the pointer and moves a soft radial spotlight to follow it.
 * The handler is attached once on the container (event delegation) rather than
 * per card, and writes only CSS custom properties so no layout is triggered.
 */

import { $$, esc, html, rafThrottle } from '../utils/dom.js';
import { icons } from '../utils/icons.js';
import { personality } from '../data/site.js';
import { renderLeaf } from './Decor.js';
import { hasFinePointer } from '../utils/motion.js';

export function renderPersonality() {
  return `
    <section class="section personality" id="personality" aria-labelledby="personality-title">
      ${renderLeaf('tr')}

      <div class="shell">
        <div class="section__head section__head--center">
          <p class="eyebrow" data-reveal>Six ways to describe him</p>
          <h2 id="personality-title" data-reveal style="--reveal-delay:80ms">
            A personality far too large <span class="text-gradient">for one small bird</span>
          </h2>
        </div>

        <ul class="trait-grid" data-trait-grid>
          ${html(
            personality.map(
              (trait, i) => `
            <li class="trait" data-reveal="zoom" style="--reveal-delay:${i * 90}ms" tabindex="0">
              <span class="trait__num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
              <span class="trait__icon" aria-hidden="true">${icons[trait.icon] || icons.sparkle}</span>
              <h3 class="trait__title">${esc(trait.title)}</h3>
              <p class="trait__body">${esc(trait.body)}</p>
            </li>`
            )
          )}
        </ul>
      </div>
    </section>`;
}

export function initPersonality() {
  // Pointer spotlight is a hover affordance — skip it entirely on touch.
  if (!hasFinePointer) return;

  const cards = $$('[data-trait-grid] .trait');

  const move = rafThrottle((card, x, y) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${x - rect.left}px`);
    card.style.setProperty('--my', `${y - rect.top}px`);
  });

  cards.forEach((card) => {
    card.addEventListener('pointermove', (event) => move(card, event.clientX, event.clientY), {
      passive: true,
    });

    // Reset so the next hover starts from the card's own centre, not a stale point.
    card.addEventListener('pointerleave', () => {
      card.style.removeProperty('--mx');
      card.style.removeProperty('--my');
    });
  });
}
