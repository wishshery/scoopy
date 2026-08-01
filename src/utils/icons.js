/**
 * Inline SVG icon set.
 *
 * Icons are inlined rather than loaded as a sprite or font: there are few of
 * them, they inherit `currentColor` for free, and it removes a network request
 * from the critical path.
 */

const svg = (paths, { viewBox = '0 0 24 24', fill = 'none' } = {}) =>
  `<svg viewBox="${viewBox}" fill="${fill}" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`;

export const icons = {
  /** Stylised parrot head — the site mark. */
  parrot: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M15.6 2.6c-3.6 0-6.5 2.8-6.5 6.3 0 1 .2 1.9.6 2.7l-4.5 6.2c-.5.7-.3 1.6.4 2.1.6.4 1.5.3 2-.3l4.4-6c.6.2 1.2.3 1.9.3 3.6 0 6.5-2.8 6.5-6.3 0-2.7-1.7-5-4.8-5zm.7 4.6a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2z"/><path d="M9.7 11.6 4 13.4c-.8.2-1 1.3-.3 1.8l2.6 1.9z" opacity=".55"/></svg>`,

  feather: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M20.2 3.8c-2-2-6-1.4-9 1.6L5.8 10.8c-1.9 1.9-2.4 4.4-2 6.4l-1.9 1.9a1 1 0 1 0 1.4 1.4l1.9-1.9c2 .4 4.5-.1 6.4-2l5.4-5.4c3-3 3.6-7 1.2-9.4zM9.6 15.9c-.9.9-2 1.4-3 1.5l7-7c.4-.4.4-1 0-1.4s-1-.4-1.4 0l-7 7c.1-1 .6-2.1 1.5-3l5.4-5.4c2.3-2.3 5.1-2.8 6.2-1.7 1.1 1.1.6 3.9-1.7 6.2z"/></svg>`,

  compass: svg('<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>'),
  sparkle: svg('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3 9 9M15 15l2.7 2.7M17.7 6.3 15 9M9 15l-2.7 2.7"/><circle cx="12" cy="12" r="2.6"/>'),
  note: svg('<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.6"/><circle cx="16.5" cy="16" r="2.6"/>'),
  claw: svg('<path d="M12 3v10M12 13 7 20M12 13l5 7M12 13H4.5M12 13h7.5"/>'),
  apple: svg('<path d="M12 8c-1.2-1.3-3-1.6-4.4-.7C5.7 8.5 5 11 5.8 13.6c.8 2.6 2.7 5.4 4.6 5.4.8 0 1.1-.4 1.6-.4s.8.4 1.6.4c1.9 0 3.8-2.8 4.6-5.4.8-2.6.1-5.1-1.8-6.3-1.4-.9-3.2-.6-4.4.7z"/><path d="M12 8c.3-1.7 1.5-3 3.2-3.4"/>'),
  heart: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 20.4 4.6 13a4.9 4.9 0 0 1 0-6.9 4.7 4.7 0 0 1 6.7 0l.7.7.7-.7a4.7 4.7 0 0 1 6.7 0 4.9 4.9 0 0 1 0 6.9z"/></svg>`,

  sun: svg('<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7"/>'),
  moon: svg('<path d="M20.5 14.4A8.6 8.6 0 0 1 9.6 3.5a8.6 8.6 0 1 0 10.9 10.9z"/>'),

  bowl: svg('<path d="M3.5 10.5h17a8.5 8.5 0 0 1-17 0z"/><path d="M8 7c0-1.5 1-2.5 2-3M12.5 6.5c0-1.2.8-2 1.6-2.5"/>'),
  leafIcon: svg('<path d="M4 20c8 1 15-4 16-16-2 0-12-.5-14 6-.8 2.6.3 4.6 2 6z"/><path d="M4 20 12 12"/>'),
  zzz: svg('<path d="M4 6h7l-7 8h7M14 12h6l-6 6h6"/>'),
  home: svg('<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>'),

  arrowDown: svg('<path d="M12 4v15M6 13.5 12 20l6-6.5"/>'),
  arrowUp: svg('<path d="M12 20V5M6 10.5 12 4l6 6.5"/>'),
  arrowRight: svg('<path d="M4 12h15M13.5 6l6 6-6 6"/>'),
  chevronLeft: svg('<path d="M14.5 5 8 12l6.5 7"/>'),
  chevronRight: svg('<path d="M9.5 5 16 12l-6.5 7"/>'),
  close: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  expand: svg('<path d="M9 4H4v5M15 4h5v5M15 20h5v-5M9 20H4v-5"/>'),
  menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),

  volumeOn: svg('<path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z"/><path d="M16 9a4.2 4.2 0 0 1 0 6M18.8 6.5a8 8 0 0 1 0 11"/>'),
  volumeOff: svg('<path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z"/><path d="m16.5 9.5 5 5M21.5 9.5l-5 5"/>'),

  star: svg('<path d="m12 3.6 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.8l5.9-.9z"/>'),
  camera: svg('<path d="M3 8.5h3.5L8 6h8l1.5 2.5H21v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><circle cx="12" cy="13" r="3.4"/>'),
  qr: svg('<path d="M4 4h5v5H4zM15 4h5v5h-5zM4 15h5v5H4z"/><path d="M15 15h2v2h-2zM19 15h1M15 19h2M19 19h1"/>'),

  instagram: svg(
    '<rect x="3" y="3" width="18" height="18" rx="5.2"/><circle cx="12" cy="12" r="4.1"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/>'
  ),
};

export default icons;
