/**
 * Gentle ambient bird song.
 *
 * The chirps are synthesised with the Web Audio API rather than loaded as a
 * media file: it costs no bandwidth, never repeats identically, and sidesteps
 * any licensing question about a recording.
 *
 * Sound is OFF by default and only ever starts from a click, which respects both
 * browser autoplay policy and the visitor.
 */

import { $, rand, randInt } from '../utils/dom.js';

/**
 * One chirp: a short frequency sweep through a bandpass filter, with a fast
 * attack and a soft exponential decay. Small random variation in pitch, length
 * and sweep direction keeps successive chirps from sounding mechanical.
 */
function chirp(ctx, destination, time) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  const base = rand(1500, 3100);
  const sweep = rand(0.55, 1.9);
  const duration = rand(0.07, 0.17);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(base, time);
  osc.frequency.exponentialRampToValueAtTime(base * sweep, time + duration);

  filter.type = 'bandpass';
  filter.frequency.value = base * 1.1;
  filter.Q.value = 4;

  const peak = rand(0.05, 0.12);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(peak, time + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

  osc.connect(filter).connect(gain).connect(destination);
  osc.start(time);
  osc.stop(time + duration + 0.05);
}

export function initAudio() {
  const button = $('[data-sound-toggle]');
  if (!button) return;

  let ctx = null;
  let master = null;
  let timer = null;
  let on = false;

  /** Schedule the next burst of one to three chirps at a natural interval. */
  function scheduleBurst() {
    if (!on || !ctx) return;

    const now = ctx.currentTime;
    const notes = randInt(1, 3);

    for (let i = 0; i < notes; i += 1) {
      chirp(ctx, master, now + i * rand(0.09, 0.22));
    }

    timer = setTimeout(scheduleBurst, rand(1800, 5200));
  }

  async function start() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return false;

      ctx = new AudioCtx();
      master = ctx.createGain();
      master.gain.value = 0.0001;
      master.connect(ctx.destination);
    }

    // Browsers start the context suspended until a user gesture resumes it.
    if (ctx.state === 'suspended') await ctx.resume();

    on = true;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.6);

    scheduleBurst();
    return true;
  }

  function stop() {
    on = false;
    clearTimeout(timer);
    timer = null;

    if (ctx && master) {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    }
  }

  function setPressed(value) {
    button.setAttribute('aria-pressed', String(value));
    button.dataset.tip = value ? 'Mute bird song' : 'Play bird song';
    button.setAttribute('aria-label', value ? 'Mute bird song' : 'Play gentle bird song');
  }

  button.addEventListener('click', async () => {
    if (on) {
      stop();
      setPressed(false);
      return;
    }

    const started = await start();
    setPressed(started);

    if (!started) {
      button.disabled = true;
      button.dataset.tip = 'Audio unavailable';
    }
  });

  // Pause the chirping when the tab is not being looked at.
  document.addEventListener('visibilitychange', () => {
    if (!on) return;
    if (document.hidden) {
      clearTimeout(timer);
      timer = null;
    } else {
      scheduleBurst();
    }
  });

  setPressed(false);
}
