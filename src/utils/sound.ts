export type SoundName =
  | 'success'
  | 'fail'
  | 'click'
  | 'star'
  | 'engine'
  | 'horn'
  | 'complete';

let muted = false;
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (muted || typeof window === 'undefined') return null;
  try {
    const maybeWindow = window as typeof window & {
      webkitAudioContext?: typeof AudioContext;
    };
    const AudioCtor = maybeWindow.AudioContext || maybeWindow.webkitAudioContext;
    if (!AudioCtor) return null;
    if (!audioCtx) audioCtx = new AudioCtor();
    if (audioCtx.state === 'suspended') {
      void audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

function tone(
  frequency: number,
  duration = 0.12,
  type: OscillatorType = 'sine',
  volume = 0.045,
  delay = 0,
): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export function playSound(name: SoundName): void {
  if (muted) return;
  switch (name) {
    case 'click':
      tone(620, 0.07, 'triangle', 0.03);
      break;
    case 'horn':
      tone(330, 0.08, 'square', 0.035);
      tone(440, 0.09, 'square', 0.032, 0.09);
      break;
    case 'success':
      tone(660, 0.09, 'sine', 0.045);
      tone(880, 0.12, 'sine', 0.045, 0.09);
      break;
    case 'star':
      tone(880, 0.08, 'triangle', 0.04);
      tone(1180, 0.12, 'triangle', 0.035, 0.08);
      break;
    case 'complete':
      tone(523, 0.08, 'sine', 0.04);
      tone(659, 0.08, 'sine', 0.04, 0.08);
      tone(784, 0.16, 'sine', 0.04, 0.16);
      break;
    case 'engine':
      tone(120, 0.08, 'sawtooth', 0.018);
      break;
    case 'fail':
      tone(220, 0.11, 'sine', 0.025);
      break;
    default:
      break;
  }
}

export function preloadSounds(_names: SoundName[]): void {
  void getAudioContext();
}

export function setMuted(next: boolean): void {
  muted = next;
}

export function getMuted(): boolean {
  return muted;
}

export function toggleMuted(): boolean {
  muted = !muted;
  return muted;
}
