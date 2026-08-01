/**
 * "Scoopy's Song" — an original piece, synthesised live in the browser.
 *
 * Nothing is loaded from disk: the melody, harmony and bass are generated with
 * oscillators and envelopes, run through a synthesised reverb. That keeps the
 * page weightless, lets the arrangement vary each time through, and means there
 * is no recording to license.
 *
 * Musically: D major, 72bpm, an eight-bar progression with a sixteen-bar melody
 * over it. The arrangement thins out on alternating passes so the loop breathes
 * rather than repeating flatly.
 */

/* --- Note helpers --------------------------------------------------------- */

/** Equal temperament, A4 = 440Hz (MIDI 69). */
const midiToFreq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

const BPM = 72;
const SECONDS_PER_BEAT = 60 / BPM;
const BEATS_PER_BAR = 4;

/* --- The composition ------------------------------------------------------ */

/**
 * Eight-bar progression: D - Bm - G - A - D - F#m - G - A.
 * `pad` are the voicing's MIDI notes, `bass` the root beneath them.
 */
const PROGRESSION = [
  { pad: [50, 54, 57, 62], bass: 38 }, // D
  { pad: [47, 50, 54, 59], bass: 35 }, // Bm
  { pad: [43, 47, 50, 55], bass: 31 }, // G
  { pad: [45, 49, 52, 57], bass: 33 }, // A
  { pad: [50, 54, 57, 62], bass: 38 }, // D
  { pad: [42, 45, 49, 54], bass: 30 }, // F#m
  { pad: [43, 47, 50, 55], bass: 31 }, // G
  { pad: [45, 49, 52, 57], bass: 33 }, // A
];

/**
 * The tune, as [bar, beat within bar, MIDI note, duration in beats].
 * Sixteen bars: it plays through the progression twice, answering itself the
 * second time rather than repeating.
 */
const MELODY = [
  // Bars 1-4 — the statement
  [0, 0, 69, 1], [0, 1, 74, 1], [0, 2, 78, 1.5], [0, 3.5, 76, 0.5],
  [1, 0, 74, 1], [1, 1, 78, 1], [1, 2, 83, 2],
  [2, 0, 81, 1.5], [2, 1.5, 79, 0.5], [2, 2, 78, 2],
  [3, 0, 76, 1], [3, 1, 78, 1], [3, 2, 76, 1], [3, 3, 73, 1],

  // Bars 5-8 — settling back down
  [4, 0, 74, 2], [4, 2, 69, 2],
  [5, 0, 73, 1], [5, 1, 76, 1], [5, 2, 78, 2],
  [6, 0, 71, 1], [6, 1, 74, 1], [6, 2, 79, 2],
  [7, 0, 78, 1], [7, 1, 76, 1], [7, 2, 74, 2],

  // Bars 9-12 — the answer, lifted an octave in places
  [8, 0, 81, 1], [8, 1, 86, 1], [8, 2, 83, 2],
  [9, 0, 78, 1], [9, 1, 83, 1], [9, 2, 81, 1], [9, 3, 78, 1],
  [10, 0, 79, 1.5], [10, 1.5, 81, 0.5], [10, 2, 83, 2],
  [11, 0, 81, 1], [11, 1, 78, 1], [11, 2, 76, 2],

  // Bars 13-16 — resolving home
  [12, 0, 74, 1], [12, 1, 78, 1], [12, 2, 81, 2],
  [13, 0, 78, 1], [13, 1, 76, 1], [13, 2, 73, 2],
  [14, 0, 71, 1], [14, 1, 74, 1], [14, 2, 78, 1], [14, 3, 76, 1],
  [15, 0, 74, 4],
];

const TOTAL_BARS = 16;
const TOTAL_BEATS = TOTAL_BARS * BEATS_PER_BAR;

/* --- Reverb --------------------------------------------------------------- */

/**
 * Build an impulse response from exponentially decaying noise.
 * A real hall recording would be a large download; this is a couple of lines of
 * maths and is more than convincing for a soft ambient wash.
 */
function makeReverbImpulse(ctx, duration = 2.6, decay = 2.4) {
  const rate = ctx.sampleRate;
  const length = Math.floor(rate * duration);
  const impulse = ctx.createBuffer(2, length, rate);

  for (let channel = 0; channel < 2; channel += 1) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }

  return impulse;
}

/* --- Voices ---------------------------------------------------------------
   Each voice creates its nodes, schedules its own envelope, and stops itself.
   Nothing is pooled: the browser reclaims an OscillatorNode once it has ended,
   and at this note density that costs nothing. */

/** Warm sustained chord tone — two detuned saws through a moving lowpass. */
function padVoice(ctx, dest, freq, time, dur) {
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  filter.type = 'lowpass';
  filter.Q.value = 0.7;
  filter.frequency.setValueAtTime(500, time);
  filter.frequency.linearRampToValueAtTime(1150, time + dur * 0.5);
  filter.frequency.linearRampToValueAtTime(600, time + dur);

  const attack = 0.9;
  const release = 1.3;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.045, time + attack);
  gain.gain.setValueAtTime(0.045, time + Math.max(attack, dur - release));
  gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

  filter.connect(gain).connect(dest);

  // Detuning the pair by a few cents gives the chord movement and width.
  [-6, 6].forEach((cents) => {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    osc.detune.value = cents;
    osc.connect(filter);
    osc.start(time);
    osc.stop(time + dur + 0.1);
  });
}

/** Music-box style melody note: bright attack, quick natural decay. */
function pluckVoice(ctx, dest, freq, time, dur) {
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(4200, time);
  filter.frequency.exponentialRampToValueAtTime(900, time + dur);

  const peak = 0.15;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(peak, time + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + Math.max(dur, 0.35));

  filter.connect(gain).connect(dest);

  const fundamental = ctx.createOscillator();
  fundamental.type = 'triangle';
  fundamental.frequency.value = freq;
  fundamental.connect(filter);
  fundamental.start(time);
  fundamental.stop(time + dur + 0.4);

  // A quiet octave above adds the glassy "music box" shimmer.
  const shimmerGain = ctx.createGain();
  shimmerGain.gain.setValueAtTime(0.0001, time);
  shimmerGain.gain.exponentialRampToValueAtTime(peak * 0.3, time + 0.01);
  shimmerGain.gain.exponentialRampToValueAtTime(0.0001, time + Math.max(dur * 0.6, 0.25));
  shimmerGain.connect(dest);

  const shimmer = ctx.createOscillator();
  shimmer.type = 'sine';
  shimmer.frequency.value = freq * 2;
  shimmer.connect(shimmerGain);
  shimmer.start(time);
  shimmer.stop(time + dur + 0.4);
}

/** Soft sine root note underneath the chord. */
function bassVoice(ctx, dest, freq, time, dur) {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.1, time + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  gain.connect(dest);

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = freq;
  osc.connect(gain);
  osc.start(time);
  osc.stop(time + dur + 0.1);
}

/* --- Player --------------------------------------------------------------- */

/**
 * @param {AudioContext} ctx
 * @param {AudioNode} destination master gain to play into
 * @returns {{start: () => void, stop: () => void}}
 */
export function createSong(ctx, destination) {
  /* Dry signal and a reverb send, mixed into the destination. */
  const dry = ctx.createGain();
  dry.gain.value = 0.82;
  dry.connect(destination);

  const wet = ctx.createGain();
  wet.gain.value = 0.34;
  wet.connect(destination);

  const reverb = ctx.createConvolver();
  reverb.buffer = makeReverbImpulse(ctx);
  reverb.connect(wet);

  /** Voices play into both, so everything shares one reverb tail. */
  const bus = ctx.createGain();
  bus.connect(dry);
  bus.connect(reverb);

  let timer = null;
  let nextBeatTime = 0;
  let beat = 0;
  let pass = 0;

  /** How far ahead of the clock notes are queued, in seconds. */
  const SCHEDULE_AHEAD = 0.25;

  function scheduleBeat(absoluteBeat, time) {
    const beatInLoop = absoluteBeat % TOTAL_BEATS;
    const bar = Math.floor(beatInLoop / BEATS_PER_BAR);
    const beatInBar = beatInLoop % BEATS_PER_BAR;

    // Every other pass drops the melody, leaving pad, bass and birdsong. It
    // gives the loop an obvious "verse then breathe" shape.
    const melodyThisPass = pass % 2 === 0;

    // Chord change at the top of each bar.
    if (beatInBar === 0) {
      const chord = PROGRESSION[bar % PROGRESSION.length];
      const barSeconds = BEATS_PER_BAR * SECONDS_PER_BEAT;

      chord.pad.forEach((note, i) => {
        // Spreading entries slightly stops the chord sounding like a block.
        padVoice(ctx, bus, midiToFreq(note), time + i * 0.035, barSeconds);
      });

      bassVoice(ctx, bus, midiToFreq(chord.bass), time, barSeconds * 0.92);
    }

    if (melodyThisPass) {
      for (const [noteBar, noteBeat, midi, dur] of MELODY) {
        // A note belongs to the beat it starts within; off-beat notes (1.5, say)
        // are scheduled from beat 1 with the fractional part as an offset.
        if (noteBar !== bar || Math.floor(noteBeat) !== beatInBar) continue;

        pluckVoice(
          ctx,
          bus,
          midiToFreq(midi),
          time + (noteBeat % 1) * SECONDS_PER_BEAT,
          dur * SECONDS_PER_BEAT
        );
      }
    }
  }

  function tick() {
    while (nextBeatTime < ctx.currentTime + SCHEDULE_AHEAD) {
      scheduleBeat(beat, nextBeatTime);
      nextBeatTime += SECONDS_PER_BEAT;
      beat += 1;
      if (beat % TOTAL_BEATS === 0) pass += 1;
    }
  }

  return {
    start() {
      if (timer) return;
      // Small offset so the first chord is not scheduled in the past.
      nextBeatTime = ctx.currentTime + 0.12;
      timer = setInterval(tick, 25);
      tick();
    },
    stop() {
      clearInterval(timer);
      timer = null;
      beat = 0;
      pass = 0;
    },
  };
}

export { midiToFreq };
