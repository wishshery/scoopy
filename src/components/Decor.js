/**
 * Decorative section furniture — tropical leaves and gradient orbs.
 * Purely presentational, so everything here is `aria-hidden`.
 */

/** A monstera-ish frond with a split blade. */
const LEAF_SVG = `
  <svg viewBox="0 0 200 200" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M100 8c-8 30-38 44-58 66-22 24-28 60-6 84 24 26 66 22 90-4 22-24 32-62 30-96-1-22-22-38-56-50z"/>
    <path d="M100 8c0 60-4 120-14 184" fill="none" stroke="var(--bg)" stroke-width="5" stroke-linecap="round" opacity=".65"/>
    <path d="M92 60 52 44M96 96 44 84M100 132 52 130M104 62l40-12M104 98l44-8M104 134l40 2" fill="none" stroke="var(--bg)" stroke-width="4" stroke-linecap="round" opacity=".5"/>
  </svg>`;

/**
 * @param {'tl'|'tr'|'bl'|'br'} corner
 */
export function renderLeaf(corner = 'tl') {
  return `<div class="leaf leaf--${corner}" aria-hidden="true">${LEAF_SVG}</div>`;
}

/**
 * A drifting gradient orb.
 * @param {object} options
 * @param {'sun'|'ember'|'emerald'|'sky'} options.tone
 * @param {string} options.style inline positioning/size
 */
export function renderOrb({ tone = 'sun', style = '' } = {}) {
  return `<div class="orb orb--${tone}" style="${style}" aria-hidden="true"></div>`;
}
