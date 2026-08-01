/**
 * Ambient background canvas.
 *
 * Draws three families of decoration on one canvas:
 *   - soft glowing particles (slow, low opacity)
 *   - drifting feathers that rock as they fall
 *   - distant bird silhouettes crossing the viewport
 *
 * Everything shares a single rAF subscription and one 2D context. Counts scale
 * with viewport area and are cut on low-power devices. The whole effect is
 * skipped when the visitor prefers reduced motion.
 */

import { rand, randInt, clamp } from '../utils/dom.js';
import { onTick, prefersReducedMotion, isLowPowerDevice } from '../utils/motion.js';

/** Feather outline drawn as a path, in a -1..1 local space, scaled at draw time. */
function drawFeather(ctx, size) {
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.bezierCurveTo(size * 0.75, -size * 0.35, size * 0.5, size * 0.55, 0, size);
  ctx.bezierCurveTo(-size * 0.5, size * 0.55, -size * 0.75, -size * 0.35, 0, -size);
  ctx.closePath();
  ctx.fill();

  // Central shaft.
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.9);
  ctx.lineTo(0, size * 0.92);
  ctx.stroke();
}

/** A simple gliding bird: two swept wings meeting at the body. */
function drawBird(ctx, size, flap) {
  const lift = Math.sin(flap) * size * 0.45;
  ctx.beginPath();
  ctx.moveTo(-size, lift);
  ctx.quadraticCurveTo(-size * 0.4, -size * 0.32, 0, 0);
  ctx.quadraticCurveTo(size * 0.4, -size * 0.32, size, lift);
  ctx.stroke();
}

export function initAmbient(canvas) {
  if (!canvas || prefersReducedMotion) return () => {};

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return () => {};

  let width = 0;
  let height = 0;
  let dpr = 1;

  let particles = [];
  let feathers = [];
  let birds = [];

  /** Density multiplier — fewer entities on small or low-powered devices. */
  const density = isLowPowerDevice ? 0.45 : 1;

  const makeParticle = (seedY = null) => ({
    x: rand(0, width),
    y: seedY ?? rand(0, height),
    r: rand(0.9, 2.8),
    vx: rand(-6, 6),
    vy: rand(-16, -4),
    hue: rand(32, 52),
    alpha: rand(0.18, 0.5),
    phase: rand(0, Math.PI * 2),
  });

  const makeFeather = (seedY = null) => ({
    x: rand(-40, width + 40),
    y: seedY ?? rand(-height * 0.4, height),
    size: rand(7, 15),
    vy: rand(12, 30),
    drift: rand(-18, 18),
    rot: rand(0, Math.PI * 2),
    spin: rand(-0.5, 0.5),
    sway: rand(0.6, 1.4),
    phase: rand(0, Math.PI * 2),
    alpha: rand(0.2, 0.5),
    hue: rand(28, 48),
  });

  const makeBird = () => {
    const dir = Math.random() < 0.5 ? 1 : -1;
    return {
      dir,
      x: dir === 1 ? rand(-260, -60) : width + rand(60, 260),
      y: rand(height * 0.06, height * 0.55),
      size: rand(5, 11),
      speed: rand(26, 54),
      flap: rand(0, Math.PI * 2),
      flapRate: rand(3.2, 5.4),
      alpha: rand(0.1, 0.24),
      bob: rand(4, 12),
      phase: rand(0, Math.PI * 2),
    };
  };

  function resize() {
    dpr = clamp(window.devicePixelRatio || 1, 1, 2); // cap DPR — 3x costs a lot for blur
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Scale populations with viewport area so a 4K screen is not sparse and a
    // phone is not overloaded.
    const area = (width * height) / (1440 * 900);
    const particleCount = Math.round(clamp(46 * area, 18, 70) * density);
    const featherCount = Math.round(clamp(11 * area, 5, 16) * density);
    const birdCount = Math.round(clamp(4 * area, 2, 6) * density);

    particles = Array.from({ length: particleCount }, () => makeParticle());
    feathers = Array.from({ length: featherCount }, () => makeFeather());
    birds = Array.from({ length: birdCount }, () => makeBird());
  }

  function frame(delta) {
    ctx.clearRect(0, 0, width, height);

    /* --- Glowing particles ---------------------------------------------- */
    ctx.globalCompositeOperation = 'lighter';

    for (const p of particles) {
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.phase += delta * 1.6;

      // Recycle from the bottom once a particle floats off the top.
      if (p.y < -20) Object.assign(p, makeParticle(height + 20));
      if (p.x < -30) p.x = width + 30;
      if (p.x > width + 30) p.x = -30;

      const twinkle = 0.65 + Math.sin(p.phase) * 0.35;
      const radius = p.r * (1 + Math.sin(p.phase) * 0.12);

      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 5);
      glow.addColorStop(0, `hsla(${p.hue}, 100%, 68%, ${p.alpha * twinkle})`);
      glow.addColorStop(1, 'hsla(42, 100%, 60%, 0)');

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius * 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';

    /* --- Feathers -------------------------------------------------------- */
    for (const f of feathers) {
      f.phase += delta * f.sway;
      f.y += f.vy * delta;
      f.x += (f.drift + Math.sin(f.phase) * 22) * delta;
      f.rot += f.spin * delta;

      if (f.y > height + 40) Object.assign(f, makeFeather(-40));
      if (f.x < -60) f.x = width + 60;
      if (f.x > width + 60) f.x = -60;

      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rot + Math.sin(f.phase) * 0.28);
      ctx.fillStyle = `hsla(${f.hue}, 96%, 62%, ${f.alpha})`;
      ctx.strokeStyle = `hsla(${f.hue - 12}, 80%, 44%, ${f.alpha * 0.85})`;
      ctx.lineWidth = 0.8;
      drawFeather(ctx, f.size);
      ctx.restore();
    }

    /* --- Bird silhouettes ------------------------------------------------ */
    for (const b of birds) {
      b.x += b.speed * b.dir * delta;
      b.flap += b.flapRate * delta;
      b.phase += delta * 0.5;

      const offscreen = b.dir === 1 ? b.x > width + 300 : b.x < -300;
      if (offscreen) Object.assign(b, makeBird());

      ctx.save();
      ctx.translate(b.x, b.y + Math.sin(b.phase) * b.bob);
      ctx.scale(b.dir, 1);
      ctx.strokeStyle = `rgba(20, 45, 40, ${b.alpha})`;
      ctx.lineWidth = Math.max(1.1, b.size * 0.16);
      ctx.lineCap = 'round';
      drawBird(ctx, b.size, b.flap);
      ctx.restore();
    }
  }

  resize();
  const stopTick = onTick(frame);
  window.addEventListener('resize', resize, { passive: true });

  return () => {
    stopTick();
    window.removeEventListener('resize', resize);
  };
}
