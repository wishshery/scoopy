/**
 * Scroll parallax.
 *
 * Any element carrying `data-parallax="<strength>"` (or containing a
 * `[data-parallax-target]`) has a `--parallax-y` custom property written to it
 * as the page scrolls. CSS consumes that value in a `translate3d`, so the work
 * stays on the compositor.
 *
 * Elements are only updated while they are near the viewport, tracked with an
 * IntersectionObserver so off-screen sections cost nothing per frame.
 */

import { $$, rafThrottle, clamp } from '../utils/dom.js';
import { prefersReducedMotion } from '../utils/motion.js';

export function initParallax() {
  if (prefersReducedMotion) return () => {};

  const hosts = $$('[data-parallax]');
  if (hosts.length === 0) return () => {};

  const items = hosts.map((host) => ({
    host,
    // Prefer an inner target so the container itself can keep normal flow.
    target: host.querySelector('[data-parallax-target]') || host,
    strength: Number(host.dataset.parallax) || 0.15,
    active: false,
  }));

  const visibility = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const item = items.find((candidate) => candidate.host === entry.target);
        if (item) item.active = entry.isIntersecting;
      });
    },
    { rootMargin: '20% 0px 20% 0px' }
  );

  items.forEach((item) => visibility.observe(item.host));

  const update = rafThrottle(() => {
    const viewportH = window.innerHeight;

    for (const item of items) {
      if (!item.active) continue;

      const rect = item.host.getBoundingClientRect();
      // -1 when the element sits below the fold, +1 when it has scrolled above.
      const centreOffset = (rect.top + rect.height / 2 - viewportH / 2) / viewportH;
      const shift = clamp(centreOffset, -1.4, 1.4) * item.strength * viewportH * -0.5;

      item.target.style.setProperty('--parallax-y', shift.toFixed(2));
    }
  });

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();

  return () => {
    visibility.disconnect();
    window.removeEventListener('scroll', update);
    window.removeEventListener('resize', update);
  };
}
