/**
 * Application entry point.
 *
 * The page is composed once from component render functions, injected into the
 * document, and then each behaviour module is initialised against the resulting
 * DOM. Rendering is a single write, so the browser lays out the page once.
 */

import './styles/index.css';

import { photos } from './data/media.generated.js';
import { meta, social } from './data/site.js';
import { $ } from './utils/dom.js';

import { renderNav, initNav } from './components/Nav.js';
import { renderHero, playHeroIntro } from './components/Hero.js';
import { renderAbout } from './components/About.js';
import { renderPersonality, initPersonality } from './components/Personality.js';
import { renderTimeline, initTimeline } from './components/Timeline.js';
import { renderGallery, buildTiles } from './components/Gallery.js';
import { renderLightbox, initLightbox } from './components/Lightbox.js';
import { renderFacts, initCounters } from './components/Facts.js';
import { renderSpotlight } from './components/Spotlight.js';
import { renderMemoryWall } from './components/MemoryWall.js';
import { renderQuotes } from './components/Quotes.js';
import { renderFollow } from './components/Follow.js';
import { renderFooter } from './components/Footer.js';
import { renderProgress, renderDock, initChrome, dismissPreloader } from './components/Chrome.js';
import { initMediaFades } from './components/Media.js';

import { initAmbient } from './effects/ambient.js';
import { initCursorTrail } from './effects/cursorTrail.js';
import { initParallax } from './effects/parallax.js';
import { initReveal } from './effects/reveal.js';
import { initTheme } from './effects/theme.js';
import { initAudio } from './effects/audio.js';

/** The photo marked `feature: true` in photos.meta.json, else the first one. */
function featurePhoto(list) {
  return list.find((photo) => photo.feature) || list[0] || null;
}

function render(root) {
  const hero = featurePhoto(photos);

  root.innerHTML = [
    renderProgress(),
    '<div class="ambient" aria-hidden="true"><canvas class="ambient__canvas" data-ambient></canvas></div>',
    '<div class="trail-layer" aria-hidden="true" data-trail></div>',
    renderNav(),
    '<main id="main">',
    renderHero(hero),
    renderAbout(hero),
    renderPersonality(),
    renderTimeline(),
    renderGallery(photos),
    renderSpotlight(photos),
    renderFacts(),
    renderQuotes(),
    renderMemoryWall(photos),
    renderFollow(),
    '</main>',
    renderFooter(),
    renderDock(),
    renderLightbox(),
  ].join('');
}

function boot() {
  const root = $('#app');
  if (!root) return;

  // The preloader is markup in index.html so it paints before this script runs;
  // it lives outside #app and is removed once everything is ready.
  render(root);

  /* --- Behaviour --------------------------------------------------------- */

  initTheme();
  initNav();
  initChrome();
  initMediaFades();
  initReveal();
  initParallax();
  initPersonality();
  initTimeline();
  initCounters();
  initLightbox(buildTiles(photos));
  initAudio();

  initAmbient($('[data-ambient]'));
  initCursorTrail($('[data-trail]'));

  // Anything that should only run once the splash has cleared.
  dismissPreloader(() => {
    playHeroIntro();
    document.body.dataset.ready = 'true';
  });
}

// The module is deferred, so the DOM is already parsed by the time this runs —
// but guard anyway in case the script is ever moved into <head> without defer.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

// Surface the site's identity for anyone poking at the console.
console.info(
  `%c${meta.name} %c— ${meta.tagline}\n${social.instagram.url}`,
  'font-weight:700;color:#f5a600',
  'color:#888'
);
