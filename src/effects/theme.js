/**
 * Light / dark theme toggle.
 *
 * The choice is persisted in localStorage. Until the visitor expresses one, the
 * site follows the operating system preference (handled in CSS, and mirrored
 * here so the toggle's label stays accurate).
 *
 * The inline script in index.html applies the stored theme before first paint,
 * which is what prevents a flash of the wrong theme.
 */

import { $ } from '../utils/dom.js';

const STORAGE_KEY = 'scoopy:theme';

const systemQuery = window.matchMedia('(prefers-color-scheme: dark)');

function storedTheme() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    // Private browsing or blocked storage — fall back to the system preference.
    return null;
  }
}

function activeTheme() {
  return document.documentElement.dataset.theme || (systemQuery.matches ? 'dark' : 'light');
}

function apply(theme) {
  const root = document.documentElement;

  // Suppress per-element transitions for one frame so the whole page changes
  // together instead of different components crossfading at different rates.
  document.body.classList.add('is-theme-switching');
  root.dataset.theme = theme;
  root.style.colorScheme = theme;

  requestAnimationFrame(() =>
    requestAnimationFrame(() => document.body.classList.remove('is-theme-switching'))
  );

  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* storage unavailable — the theme still applies for this session */
  }
}

export function initTheme() {
  const buttons = [$('[data-theme-toggle]')].filter(Boolean);
  if (buttons.length === 0) return;

  const sync = () => {
    const theme = activeTheme();
    buttons.forEach((button) => {
      button.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      );
      button.setAttribute('aria-pressed', String(theme === 'dark'));
    });
  };

  buttons.forEach((button) =>
    button.addEventListener('click', () => {
      apply(activeTheme() === 'dark' ? 'light' : 'dark');
      sync();
    })
  );

  // Track the OS while the visitor has not made an explicit choice.
  systemQuery.addEventListener('change', () => {
    if (!storedTheme()) sync();
  });

  sync();
}
