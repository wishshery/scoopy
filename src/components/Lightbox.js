/**
 * Lightbox — full-screen photo viewer.
 *
 * Built on `<dialog showModal()>`, which gives focus trapping, inert background
 * content, Escape-to-close and correct screen-reader semantics for free.
 * Arrow keys and swipe gestures step between photos.
 */

import { $, esc } from '../utils/dom.js';
import { icons } from '../utils/icons.js';

export function renderLightbox() {
  return `
    <dialog class="lightbox" data-lightbox aria-label="Photo viewer">
      <div class="lightbox__inner">
        <button class="lightbox__btn lightbox__btn--close" type="button" data-lb-close aria-label="Close viewer">
          ${icons.close}
        </button>
        <button class="lightbox__btn lightbox__btn--prev" type="button" data-lb-prev aria-label="Previous photograph">
          ${icons.chevronLeft}
        </button>
        <button class="lightbox__btn lightbox__btn--next" type="button" data-lb-next aria-label="Next photograph">
          ${icons.chevronRight}
        </button>

        <div class="lightbox__stage">
          <img class="lightbox__img" data-lb-img alt="">
        </div>

        <div class="lightbox__meta">
          <p class="lightbox__caption" data-lb-caption></p>
          <p class="lightbox__count" data-lb-count aria-live="polite"></p>
        </div>
      </div>
    </dialog>`;
}

/**
 * @param {Array<{photo: object, framing: string}>} tiles the same tiles the gallery rendered
 */
export function initLightbox(tiles) {
  const dialog = $('[data-lightbox]');
  const grid = $('[data-gallery]');
  if (!dialog || !grid || tiles.length === 0) return;

  const img = $('[data-lb-img]', dialog);
  const caption = $('[data-lb-caption]', dialog);
  const count = $('[data-lb-count]', dialog);

  dialog.dataset.single = String(tiles.length === 1);

  let index = 0;
  /** The tile that opened the dialog, so focus can be returned to it. */
  let opener = null;

  /**
   * Swap in a photo. `direction` animates the outgoing image before replacing it.
   * @param {number} next
   * @param {'next'|'prev'|null} direction
   */
  function show(next, direction = null) {
    index = (next + tiles.length) % tiles.length;
    const { photo } = tiles[index];
    // Always display the uncropped frame in the viewer.
    const variant = photo.variants.natural;

    const apply = () => {
      img.src = variant.src;
      img.srcset = variant.srcset.jpg;
      img.sizes = '92vw';
      img.width = variant.width;
      img.height = variant.height;
      img.alt = photo.alt;

      caption.textContent = photo.caption || photo.alt;
      count.textContent = tiles.length > 1 ? `${index + 1} of ${tiles.length}` : '';

      img.classList.remove('is-leaving-next', 'is-leaving-prev');
      // Wait for decode so the fade-in never shows a partially painted image.
      img.decode?.().catch(() => {}).finally(() => img.classList.add('is-ready'));
    };

    if (direction) {
      img.classList.remove('is-ready');
      img.classList.add(direction === 'next' ? 'is-leaving-next' : 'is-leaving-prev');
      setTimeout(apply, 180);
    } else {
      img.classList.remove('is-ready');
      apply();
    }
  }

  function open(next, trigger) {
    opener = trigger;
    show(next);
    dialog.showModal();
    document.body.classList.add('is-locked');
  }

  function close() {
    dialog.close();
  }

  /* --- Wiring ------------------------------------------------------------ */

  grid.addEventListener('click', (event) => {
    const tile = event.target.closest('[data-tile]');
    if (!tile) return;
    open(Number(tile.dataset.tile), tile);
  });

  $('[data-lb-close]', dialog).addEventListener('click', close);
  $('[data-lb-next]', dialog).addEventListener('click', () => show(index + 1, 'next'));
  $('[data-lb-prev]', dialog).addEventListener('click', () => show(index - 1, 'prev'));

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      show(index + 1, 'next');
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      show(index - 1, 'prev');
    }
  });

  /* Clicking away from the photo closes the viewer. The inner panel fills the
     dialog, so `event.target === dialog` alone would never match — the empty
     regions of the layout have to be treated as backdrop too. */
  const backdropParts = new Set([dialog, $('.lightbox__inner', dialog), $('.lightbox__stage', dialog)]);

  dialog.addEventListener('click', (event) => {
    if (backdropParts.has(event.target)) close();
  });

  dialog.addEventListener('close', () => {
    document.body.classList.remove('is-locked');
    img.classList.remove('is-ready');
    opener?.focus();
    opener = null;
  });

  /* --- Swipe ------------------------------------------------------------- */

  let startX = null;

  dialog.addEventListener(
    'pointerdown',
    (event) => {
      startX = event.clientX;
    },
    { passive: true }
  );

  dialog.addEventListener(
    'pointerup',
    (event) => {
      if (startX === null) return;
      const dx = event.clientX - startX;
      startX = null;
      if (Math.abs(dx) < 60) return;
      show(dx < 0 ? index + 1 : index - 1, dx < 0 ? 'next' : 'prev');
    },
    { passive: true }
  );
}
