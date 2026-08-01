/**
 * Visitor counter.
 *
 * The site is static, so the count is kept by Abacus (abacus.jasoncameron.dev),
 * a small open-source hit counter. It stores only a number against a key — no
 * cookie, no identifier, nothing about the visitor.
 *
 * Each browser is counted once per session: subsequent navigations in the same
 * tab read the total without incrementing it, so a refresh does not inflate the
 * figure.
 *
 * The counter is a decoration, not content. If the service is slow, blocked or
 * gone, the element simply stays hidden rather than showing a broken or zero
 * state.
 */

import { $ } from '../utils/dom.js';
import { prefersReducedMotion } from '../utils/motion.js';

const ENDPOINT = 'https://abacus.jasoncameron.dev';
const NAMESPACE = 'scoopsforoops-com';
const KEY = 'visits';
const SESSION_FLAG = 'scoopy:counted';

/** Ease-out cubic, matching the fun-facts counters. */
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

function animateTo(node, value) {
  const formatted = (n) => n.toLocaleString();

  if (prefersReducedMotion || value < 2) {
    node.textContent = formatted(value);
    return;
  }

  const duration = 1400;
  // Start close enough that large numbers still feel like they are counting up.
  const from = Math.max(0, Math.floor(value * 0.82));
  const start = performance.now();

  const step = (now) => {
    const t = Math.min((now - start) / duration, 1);
    node.textContent = formatted(Math.round(from + (value - from) * easeOut(t)));
    if (t < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}

/** Whether this tab has already been counted. */
function alreadyCounted() {
  try {
    return sessionStorage.getItem(SESSION_FLAG) === '1';
  } catch {
    return false; // storage blocked — fall back to counting the hit
  }
}

function markCounted() {
  try {
    sessionStorage.setItem(SESSION_FLAG, '1');
  } catch {
    /* storage blocked — harmless, the visit is just counted again next time */
  }
}

export async function initVisitorCounter() {
  const host = $('[data-visitors]');
  const value = $('[data-visitor-count]');
  if (!host || !value) return;

  // `hit` increments and returns the new total; `get` only reads.
  const action = alreadyCounted() ? 'get' : 'hit';
  const url = `${ENDPOINT}/${action}/${NAMESPACE}/${KEY}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    clearTimeout(timeout);

    if (!response.ok) throw new Error(`counter responded ${response.status}`);

    const data = await response.json();
    const count = Number(data?.value);
    if (!Number.isFinite(count) || count < 1) throw new Error('counter returned no value');

    if (action === 'hit') markCounted();

    host.hidden = false;
    animateTo(value, count);
  } catch {
    // Deliberately silent: a missing visitor count is not worth a console error
    // on someone's pet's website, and the element stays hidden.
  }
}
