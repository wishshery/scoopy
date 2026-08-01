/**
 * Fun facts — bento grid.
 *
 * Facts carrying a `count` render as an animated counter that runs once, the
 * first time the card enters the viewport.
 */

import { $$, esc, html } from '../utils/dom.js';
import { facts } from '../data/site.js';
import { renderOrb } from './Decor.js';
import { prefersReducedMotion } from '../utils/motion.js';

export function renderFacts() {
  return `
    <section class="section facts" id="facts" aria-labelledby="facts-title">
      <div class="facts__bg" aria-hidden="true"></div>
      ${renderOrb({ tone: 'sun', style: 'width:34vw;height:34vw;top:-8%;right:-6%;' })}
      ${renderOrb({ tone: 'emerald', style: 'width:28vw;height:28vw;bottom:-12%;left:-8%;animation-delay:-8s;' })}

      <div class="shell">
        <div class="section__head section__head--center">
          <p class="eyebrow" data-reveal>Fun facts</p>
          <h2 id="facts-title" data-reveal style="--reveal-delay:80ms">The official file on Scoopy</h2>
        </div>

        <div class="fact-grid">
          ${html(
            facts.map((fact, i) => {
              const wide = Boolean(fact.count);
              return `
            <article class="fact ${wide ? 'fact--wide' : ''}" data-reveal="zoom" style="--reveal-delay:${i * 80}ms">
              <p class="fact__label">${esc(fact.label)}</p>
              ${
                fact.count
                  ? `<p class="fact__counter">
                       <span
                         data-counter
                         data-from="${fact.count.from}"
                         data-to="${fact.count.to}"
                       >${fact.count.from}</span>
                       ${fact.note ? `<small>${esc(fact.note)}</small>` : ''}
                     </p>
                     <p class="fact__note">${esc(fact.value)}</p>`
                  : `<p class="fact__value">${
                      fact.italic ? `<em>${esc(fact.value)}</em>` : esc(fact.value)
                    }</p>`
              }
            </article>`;
            })
          )}
        </div>
      </div>
    </section>`;
}

/** Ease-out cubic — fast start, gentle settle. */
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

export function initCounters() {
  const nodes = $$('[data-counter]');
  if (nodes.length === 0) return;

  const run = (node) => {
    const from = Number(node.dataset.from || 0);
    const to = Number(node.dataset.to || 0);
    const duration = 1600;

    if (prefersReducedMotion) {
      node.textContent = String(to);
      return;
    }

    const start = performance.now();

    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      node.textContent = String(Math.round(from + (to - from) * easeOut(t)));
      if (t < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        run(entry.target);
        observer.unobserve(entry.target); // count once, not on every scroll past
      });
    },
    { threshold: 0.4 }
  );

  nodes.forEach((node) => observer.observe(node));
}
