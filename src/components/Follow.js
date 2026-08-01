/**
 * Follow — Instagram invitation with a scannable QR code.
 *
 * The QR image is deliberately kept on a white plate in both themes: scanners
 * rely on the light quiet zone around the code, and inverting it hurts read rates.
 */

import { esc } from '../utils/dom.js';
import { icons } from '../utils/icons.js';
import { social } from '../data/site.js';
import { renderOrb } from './Decor.js';
import { renderQrCard } from './QrCard.js';

export function renderFollow() {
  const { instagram } = social;

  return `
    <section class="section follow" id="follow" aria-labelledby="follow-title">
      ${renderOrb({ tone: 'ember', style: 'width:32vw;height:32vw;top:-10%;right:-8%;opacity:.45;' })}

      <div class="shell follow__grid">
        <div class="follow__copy">
          <p class="eyebrow" data-reveal>${esc(instagram.eyebrow)}</p>
          <h2 id="follow-title" data-reveal style="--reveal-delay:80ms">${esc(instagram.heading)}</h2>

          <a
            class="follow__handle"
            href="${esc(instagram.url)}"
            target="_blank"
            rel="noopener noreferrer"
            data-reveal
            style="--reveal-delay:160ms"
          >${esc(instagram.handle)}</a>

          <p class="follow__text" data-reveal style="--reveal-delay:220ms">${esc(instagram.text)}</p>

          <div class="follow__actions" data-reveal style="--reveal-delay:300ms">
            <a
              class="btn btn--ig"
              href="${esc(instagram.url)}"
              target="_blank"
              rel="noopener noreferrer"
            >
              ${icons.instagram}
              <span>Follow on Instagram</span>
            </a>
          </div>
        </div>

        ${renderQrCard({ extraAttrs: 'data-parallax="0.06" data-parallax-target data-reveal="zoom"' })}
      </div>
    </section>`;
}
