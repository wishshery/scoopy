/**
 * Gallery — masonry grid of tiles that open the lightbox.
 *
 * Tile composition adapts to how many photos exist:
 *   - With a single photo, the different framings produced by the image pipeline
 *     are shown as separate tiles, so the grid has real variety from one source.
 *   - Once several photos are available, each gets its own tile and the framings
 *     rotate to keep the masonry columns visually uneven (which is the point).
 */

import { esc, html } from '../utils/dom.js';
import { icons } from '../utils/icons.js';
import { renderMedia } from './Media.js';
import { renderLeaf } from './Decor.js';

const ROTATION = ['portrait', 'square', 'wide', 'natural'];

/**
 * Build the tile list from the photo manifest.
 * Each tile records which photo and framing it shows so the lightbox can open
 * the full-size version.
 */
export function buildTiles(photos) {
  if (photos.length === 0) return [];

  if (photos.length === 1) {
    const photo = photos[0];
    return ['portrait', 'wide', 'square', 'natural']
      .filter((framing) => photo.variants[framing])
      .map((framing, i) => ({ photo, framing, index: i }));
  }

  return photos.map((photo, i) => ({
    photo,
    framing: ROTATION[i % ROTATION.length],
    index: i,
  }));
}

export function renderGallery(photos) {
  const tiles = buildTiles(photos);

  return `
    <section class="section gallery" id="gallery" aria-labelledby="gallery-title">
      ${renderLeaf('tl')}

      <div class="shell">
        <div class="section__head section__head--center">
          <p class="eyebrow" data-reveal>The gallery</p>
          <h2 id="gallery-title" data-reveal style="--reveal-delay:80ms">
            Every feather <span class="text-gradient">tells a story</span>
          </h2>
          <p class="lede" data-reveal style="--reveal-delay:160ms" >
            Select any photograph to view it full screen.
          </p>
        </div>

        <div class="masonry" data-gallery>
          ${html(
            tiles.map(
              (tile, i) => `
            <button
              class="tile"
              type="button"
              data-tile="${i}"
              aria-label="View photograph: ${esc(tile.photo.caption || tile.photo.alt)}"
            >
              ${renderMedia(tile.photo, {
                framing: tile.framing,
                sizes: '(max-width: 560px) 92vw, (max-width: 1000px) 46vw, 31vw',
                className: 'tile__media',
              })}
              <span class="tile__veil">
                <span class="tile__caption">${esc(tile.photo.caption || tile.photo.alt)}</span>
                <span class="tile__zoom" aria-hidden="true">${icons.expand}</span>
              </span>
            </button>`
            )
          )}
        </div>

        <p class="gallery__note" data-reveal>
          ${
            photos.length === 1
              ? 'One portrait, four ways of looking at him.'
              : `${photos.length} photographs, and counting.`
          }
        </p>
      </div>
    </section>`;
}
