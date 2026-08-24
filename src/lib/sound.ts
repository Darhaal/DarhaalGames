'use client';

/**
 * Minimalist sound system with no audio files: short synthesized cues
 * via WebAudio. Volume comes from settings (localStorage dg_volume).
 */

type SfxName = 'click' | 'success' | 'error' | 'win' | 'lose' | 'notify';

// Signal notes: [frequency Hz, duration s, start offset s]
const PATTERNS: Record<SfxName, Array<[number, number, number]>> = {
  click:   [[600, 0.05, 0]],
  success: [[523, 0.09, 0], [784, 0.12, 0.09]],
  error:   [[220, 0.15, 0], [180, 0.2, 0.12]],
  win:     [[523, 0.12, 0], [659, 0.12, 0.12], [784, 0.12, 0.24], [1047, 0.25, 0.36]],
  lose:    [[330, 0.2, 0], [262, 0.25, 0.18], [196, 0.35, 0.4]],
  notify:  [[880, 0.08, 0], [880, 0.08, 0.14]],
};

let ctx: AudioContext | null = null;

function getVolume(): number {
  if (typeof window === 'undefined') return 0;
  const saved = localStorage.getItem('dg_volume');
  const v = saved === null ? 80 : Number(saved);
  return isNaN(v) ? 0.8 : Math.max(0, Math.min(1, v / 100));
}

/** Play a short sound cue (silently ignores any failure) */
export function playSfx(name: SfxName) {
  try {
    if (typeof window === 'undefined') return;
    const volume = getVolume();
    if (volume <= 0) return;

    if (!ctx) ctx = new AudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    for (const [freq, dur, offset] of PATTERNS[name]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;

      // Soft envelope to avoid clicks
      gain.gain.setValueAtTime(0, now + offset);
      gain.gain.linearRampToValueAtTime(0.25 * volume, now + offset + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + dur);

      osc.connect(gain).connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + dur + 0.02);
    }
  } catch {
    // Audio unavailable (no interaction / browser policy) — silently skip
  }
}
