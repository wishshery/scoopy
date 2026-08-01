/**
 * Site header — floating navigation.
 *
 * Behaviour: condenses into a glass pill after the hero, hides on scroll-down /
 * reappears on scroll-up, highlights the section currently in view, and collapses
 * into a disclosure menu on narrow screens.
 */

import { $, $$, esc, html, rafThrottle } from '../utils/dom.js';
import { icons } from '../utils/icons.js';
import { meta, navLinks, social } from '../data/site.js';

export function renderNav() {
  return `
    <header class="site-header" data-nav-header>
      <nav class="nav" aria-label="Primary">
        <a class="nav__brand" href="#top">
          <span class="nav__mark" aria-hidden="true">${icons.parrot}</span>
          <span>${esc(meta.name)}</span>
        </a>

        <ul class="nav__list" id="nav-menu">
          ${html(
            navLinks.map(
              (link) => `
            <li>
              <a class="nav__link" href="#${esc(link.id)}" data-nav-link><span>${esc(link.label)}</span></a>
            </li>`
            )
          )}
        </ul>

        <div class="nav__actions">
          <a
            class="icon-btn"
            href="${esc(social.instagram.url)}"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Scoopy on Instagram (opens in a new tab)"
          >${icons.instagram}</a>

          <button class="icon-btn" type="button" data-theme-toggle aria-label="Switch colour theme">
            <span class="icon-btn__swap">
              <span data-when="light">${icons.sun}</span>
              <span data-when="dark">${icons.moon}</span>
            </span>
          </button>

          <button
            class="icon-btn nav__toggle"
            type="button"
            data-nav-toggle
            aria-expanded="false"
            aria-controls="nav-menu"
            aria-label="Open menu"
          >${icons.menu}</button>
        </div>
      </nav>
    </header>`;
}

export function initNav() {
  const header = $('[data-nav-header]');
  const nav = $('.nav', header);
  const toggle = $('[data-nav-toggle]', header);
  const links = $$('[data-nav-link]', header);

  /* --- Mobile disclosure ------------------------------------------------- */

  const setMenu = (open) => {
    nav.dataset.open = String(open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  toggle.addEventListener('click', () => setMenu(nav.dataset.open !== 'true'));

  // Close the menu after navigating, and on Escape.
  links.forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.dataset.open === 'true') {
      setMenu(false);
      toggle.focus();
    }
  });

  /* --- Condense + hide-on-scroll ---------------------------------------- */

  let lastY = window.scrollY;

  const onScroll = rafThrottle(() => {
    const y = window.scrollY;

    header.classList.toggle('is-stuck', y > 40);

    // Never hide while the mobile menu is open, or near the very top.
    const menuOpen = nav.dataset.open === 'true';
    const scrollingDown = y > lastY && y > 400;
    header.classList.toggle('is-hidden', scrollingDown && !menuOpen);

    lastY = y;
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --- Scroll spy --------------------------------------------------------
     A single observer watching a band across the middle of the viewport; the
     topmost intersecting section wins. */

  const sections = navLinks
    .map((link) => document.getElementById(link.id))
    .filter(Boolean);

  const visible = new Set();

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      });

      const current = sections.find((section) => visible.has(section.id))?.id;

      links.forEach((link) => {
        const isCurrent = link.getAttribute('href') === `#${current}`;
        if (isCurrent) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
  );

  sections.forEach((section) => spy.observe(section));
}
