/**
 * Photo of the Day.
 *
 * Picks a photo deterministically from the day's date, so the featured image
 * rotates once every 24 hours and stays consistent for everyone viewing on the
 * same day (no flicker on reload, no server needed).
 */

import { esc } from '../utils/dom.js';
import { icons } from '../utils/icons.js';
import { renderMedia } from './Media.js';
import { renderOrb } from './Decor.js';

/** Day index since the epoch — changes at local midnight. */
function dayIndex(date = new Date()) {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor(local.getTime() / 86_400_000);
}

export function pickPhotoOfTheDay(photos, date = new Date()) {
  if (photos.length === 0) return null;
  return photos[dayIndex(date) % photos.length];
}

export function renderSpotlight(photos) {
  const photo = pickPhotoOfTheDay(photos);
  if (!photo) return '';

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return `
    <section class="section spotlight" aria-labelledby="spotlight-title">
      ${renderOrb({ tone: 'ember', style: 'width:30vw;height:30vw;top:10%;left:-10%;opacity:.5;' })}

      <div class="shell">
        <div class="spotlight__card" data-reveal="zoom">
          <!-- Framing and box ratio match, so the photo is never cropped twice. -->
          ${renderMedia(photo, {
            framing: 'square',
            sizes: '(max-width: 900px) 90vw, 48vw',
            className: 'spotlight__media',
            ratio: '1 / 1',
          })}

          <div class="spotlight__copy">
            <p class="spotlight__ribbon">${icons.star}<span>Photo of the day</span></p>
            <h2 id="spotlight-title" class="spotlight__title">
              ${esc(photo.caption || 'Today&rsquo;s Scoopy')}
            </h2>
            <p class="spotlight__text">${esc(photo.alt)}</p>
            <p class="spotlight__date">${esc(today)}</p>
          </div>
        </div>
      </div>
    </section>`;
}
