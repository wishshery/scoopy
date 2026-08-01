/**
 * Responsive picture element.
 *
 * Renders AVIF -> WebP -> JPEG sources with a blurred LQIP as the placeholder
 * background, so images fade in from a colour-correct blur instead of a blank
 * box. Intrinsic width/height are always emitted to prevent layout shift.
 */

import { esc } from '../utils/dom.js';

/**
 * @param {object} photo   an entry from media.generated.js
 * @param {object} options
 * @param {string} [options.framing='natural']  which crop to use
 * @param {string} [options.sizes]  the `sizes` attribute
 * @param {boolean} [options.eager] load immediately instead of lazily
 * @param {string} [options.className] extra classes on the wrapper
 * @param {string} [options.ratio] CSS aspect-ratio override for the wrapper
 * @param {boolean} [options.fill] stretch to the parent's size instead of
 *   reserving an intrinsic aspect ratio (used by the full-bleed hero)
 */
export function renderMedia(photo, options = {}) {
  const {
    framing = 'natural',
    sizes = '100vw',
    eager = false,
    className = '',
    ratio,
    alt,
    fill = false,
  } = options;

  const variant = photo.variants[framing] || photo.variants.natural;
  const box = fill
    ? 'height:100%;width:100%'
    : `aspect-ratio:${esc(ratio || `${variant.width} / ${variant.height}`)}`;

  return `
    <div class="media ${esc(className)}" style="${box};background-image:url('${photo.lqip}')">
      <picture>
        <source type="image/avif" srcset="${esc(variant.srcset.avif)}" sizes="${esc(sizes)}">
        <source type="image/webp" srcset="${esc(variant.srcset.webp)}" sizes="${esc(sizes)}">
        <img
          src="${esc(variant.src)}"
          srcset="${esc(variant.srcset.jpg)}"
          sizes="${esc(sizes)}"
          width="${variant.width}"
          height="${variant.height}"
          alt="${esc(alt ?? photo.alt)}"
          loading="${eager ? 'eager' : 'lazy'}"
          decoding="async"
          ${eager ? 'fetchpriority="high"' : ''}
        >
      </picture>
    </div>`;
}

/**
 * Add `is-loaded` to every image once it has decoded, which triggers the CSS
 * fade-and-settle. Images already complete when this runs (from cache) are
 * marked immediately.
 */
export function initMediaFades(scope = document) {
  const images = scope.querySelectorAll('.media img');

  images.forEach((img) => {
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add('is-loaded');
      return;
    }
    img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
    // If a source fails, still reveal the element so the slot is not left blank.
    img.addEventListener('error', () => img.classList.add('is-loaded'), { once: true });
  });
}
