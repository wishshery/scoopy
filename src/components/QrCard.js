/**
 * Instagram QR card.
 *
 * Shared by the hero and the Follow section so both render at identical size
 * and styling — there is one definition of what this card looks like.
 */

import { esc, asset } from '../utils/dom.js';
import { social } from '../data/site.js';

/**
 * @param {object} options
 * @param {string} [options.className] extra classes on the <figure>
 * @param {boolean} [options.eager] load the code immediately (the hero does)
 * @param {string} [options.extraAttrs] additional attributes on the <figure>
 */
export function renderQrCard({ className = '', eager = false, extraAttrs = '' } = {}) {
  const { instagram } = social;

  return `
    <figure class="qr ${esc(className)}" ${extraAttrs}>
      <a
        href="${esc(instagram.url)}"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open ${esc(instagram.handle)} on Instagram (opens in a new tab)"
      >
        <span class="qr__frame">
          <img
            src="${esc(asset(instagram.qr))}"
            width="1440"
            height="1440"
            alt="QR code linking to Scoopy's Instagram profile, ${esc(instagram.handle)}"
            loading="${eager ? 'eager' : 'lazy'}"
            decoding="async"
          >
          <span class="qr__scan" aria-hidden="true"></span>
          <span class="qr__corner qr__corner--tl" aria-hidden="true"></span>
          <span class="qr__corner qr__corner--tr" aria-hidden="true"></span>
          <span class="qr__corner qr__corner--bl" aria-hidden="true"></span>
          <span class="qr__corner qr__corner--br" aria-hidden="true"></span>
        </span>
      </a>
      <figcaption class="qr__label">${esc(instagram.qrLabel)}</figcaption>
    </figure>`;
}
