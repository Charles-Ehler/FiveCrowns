// Small synthesized tones via the Web Audio API — no audio files, no new
// dependency. A single shared AudioContext is created lazily on first use
// (always from a user gesture, e.g. tapping "Next Round").
let ctx = null;

function getContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!ctx) ctx = new AudioContextClass();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function playTone(freq, startOffset, duration) {
  const audioCtx = getContext();
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  const start = audioCtx.currentTime + startOffset;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(0.15, start + 0.02);
  gain.gain.linearRampToValueAtTime(0, start + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export function playRoundComplete() {
  playTone(660, 0, 0.14);
}

export function playGameComplete() {
  playTone(523.25, 0, 0.16);
  playTone(659.25, 0.12, 0.16);
  playTone(783.99, 0.24, 0.28);
}
