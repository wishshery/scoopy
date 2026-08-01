/**
 * Footer — the closing note.
 */

import { esc } from '../utils/dom.js';
import { icons } from '../utils/icons.js';
import { footer, meta, social } from '../data/site.js';

export function renderFooter() {
  const year = new Date().getFullYear();

  // Note: footer.message carries a typographic entity on purpose, so it is
  // inserted as markup rather than run through esc().

  return `
    <footer class="footer">
      <div class="footer__bg" aria-hidden="true"></div>

      <div class="shell">
        <div class="footer__mark" aria-hidden="true">${icons.feather}</div>

        <p class="footer__message" data-reveal>${footer.message}</p>
        <p class="footer__signature" data-reveal style="--reveal-delay:120ms">${esc(footer.signature)}</p>

        <div class="footer__social" data-reveal style="--reveal-delay:180ms">
          <a
            href="${esc(social.instagram.url)}"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Scoopy on Instagram (opens in a new tab)"
          >${icons.instagram}</a>
        </div>

        <div class="footer__rule" role="presentation"></div>

        <p class="footer__fine">
          &copy; ${year} ${esc(meta.name)} the ${esc(meta.species)} &middot;
          <a href="${esc(social.instagram.url)}" target="_blank" rel="noopener noreferrer">${esc(
            social.instagram.handle
          )}</a>
        </p>
      </div>
    </footer>`;
}
