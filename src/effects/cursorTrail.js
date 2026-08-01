/**
 * Feather trail that follows the cursor.
 *
 * Uses a small pre-allocated pool of DOM nodes recycled round-robin — no
 * create/destroy churn, and the node count stays fixed no matter how fast the
 * pointer moves. Each feather is animated purely with transform and opacity.
 *
 * Skipped on touch devices and when reduced motion is preferred.
 */

import { rand } from '../utils/dom.js';
import { onTick, prefersReducedMotion, hasFinePointer, isLowPowerDevice } from '../utils/motion.js';

const FEATHER_SVG = `
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M12 1c-3 3.5-5 7.5-5 11.5 0 3 1.2 5.6 2.6 7.6l-1.5 2.3a.8.8 0 0 0 1.3.9l1.6-2.4 1.6 2.4a.8.8 0 0 0 1.3-.9l-1.5-2.3c1.4-2 2.6-4.6 2.6-7.6C17 8.5 15 4.5 12 1z"/>
  </svg>`;

export function initCursorTrail(layer) {
  if (!layer || prefersReducedMotion || !hasFinePointer) return () => {};

  const POOL_SIZE = isLowPowerDevice ? 10 : 18;
  /** Minimum pointer travel (px) before another feather is dropped. */
  const SPAWN_DISTANCE = 34;

  const pool = Array.from({ length: POOL_SIZE }, () => {
    const node = document.createElement('span');
    node.className = 'trail-feather';
    node.innerHTML = FEATHER_SVG;
    node.style.opacity = '0';
    layer.appendChild(node);
    return { node, life: 0, ttl: 1, x: 0, y: 0, vx: 0, vy: 0, rot: 0, spin: 0, scale: 1, hue: 42 };
  });

  let cursor = { x: 0, y: 0 };
  let lastSpawn = { x: 0, y: 0 };
  let cursorSeen = false;
  let cursorIndex = 0;

  function spawn(x, y) {
    const f = pool[cursorIndex];
    cursorIndex = (cursorIndex + 1) % pool.length;

    f.x = x;
    f.y = y;
    f.vx = rand(-26, 26);
    f.vy = rand(14, 46);
    f.rot = rand(0, 360);
    f.spin = rand(-90, 90);
    f.scale = rand(0.55, 1.05);
    f.hue = rand(30, 50);
    f.life = 0;
    f.ttl = rand(0.9, 1.5);
    f.node.style.color = `hsl(${f.hue}, 96%, 58%)`;
  }

  const onPointerMove = (event) => {
    cursor = { x: event.clientX, y: event.clientY };

    if (!cursorSeen) {
      cursorSeen = true;
      lastSpawn = { ...cursor };
      return;
    }

    const dx = cursor.x - lastSpawn.x;
    const dy = cursor.y - lastSpawn.y;

    if (Math.hypot(dx, dy) >= SPAWN_DISTANCE) {
      spawn(cursor.x, cursor.y);
      lastSpawn = { ...cursor };
    }
  };

  window.addEventListener('pointermove', onPointerMove, { passive: true });

  const stopTick = onTick((delta) => {
    for (const f of pool) {
      if (f.life >= f.ttl) {
        if (f.node.style.opacity !== '0') f.node.style.opacity = '0';
        continue;
      }

      f.life += delta;
      const t = Math.min(f.life / f.ttl, 1);

      f.x += f.vx * delta;
      f.y += f.vy * delta;
      f.vy += 42 * delta; // gentle gravity
      f.vx *= 1 - 0.6 * delta; // air resistance
      f.rot += f.spin * delta;

      f.node.style.opacity = String((1 - t) * 0.85);
      f.node.style.transform = `translate3d(${f.x}px, ${f.y}px, 0) rotate(${f.rot}deg) scale(${
        f.scale * (1 - t * 0.35)
      })`;
    }
  });

  return () => {
    stopTick();
    window.removeEventListener('pointermove', onPointerMove);
    pool.forEach((f) => f.node.remove());
  };
}
