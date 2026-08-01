/**
 * Quotes — a quiet interlude between the heavier sections.
 */

import { esc, html } from '../utils/dom.js';
import { quotes } from '../data/site.js';

export function renderQuotes() {
  return `
    <section class="quotes" aria-label="Words about Scoopy">
      <div class="shell">
        <div class="quote-row">
          ${html(
            quotes.map(
              (quote, i) => `
            <figure class="quote" data-reveal style="--reveal-delay:${i * 140}ms">
              <blockquote>${esc(quote)}</blockquote>
              <span class="quote__rule" aria-hidden="true"></span>
            </figure>`
            )
          )}
        </div>
      </div>
    </section>`;
}
