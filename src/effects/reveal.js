/**
 * Scroll-triggered reveals.
 *
 * A single IntersectionObserver watches every `[data-reveal]` element and adds
 * `.is-revealed` when it enters the viewport, then stops observing it — reveals
 * happen once, and the observer sheds work as the visitor scrolls.
 *
 * Elements are also revealed unconditionally if the observer is unavailable or
 * reduced motion is preferred, so content is never left invisible.
 */

import { $$ } from '../utils/dom.js';
import { prefersReducedMotion, onMotionPreferenceChange } from '../utils/motion.js';

export function initReveal(scope = document) {
  const elements = $$('[data-reveal]', scope);
  if (elements.length === 0) return () => {};

  const revealAll = () => elements.forEach((el) => el.classList.add('is-revealed'));

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealAll();
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    },
    {
      // Fire slightly before the element is fully in view so the motion is
      // already settling by the time the visitor is looking at it.
      rootMargin: '0px 0px -12% 0px',
      threshold: 0.12,
    }
  );

  elements.forEach((el) => observer.observe(el));

  // If the visitor turns reduced motion on mid-session, stop animating and show
  // everything that is still pending.
  const off = onMotionPreferenceChange((reduced) => {
    if (!reduced) return;
    observer.disconnect();
    revealAll();
  });

  return () => {
    observer.disconnect();
    off();
  };
}
