// Web Speech API 封装：儿童语音提示。
// 第一版用浏览器自带语音合成，不依赖任何外部音频文件。
// 后续如需替换为真实童声，把 speak() 内部实现换掉即可，调用方不变。

let voiceEnabled = true;
let cachedVoice: SpeechSynthesisVoice | null = null;

export function isVoiceSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function setVoiceEnabled(enabled: boolean): void {
  voiceEnabled = enabled;
  if (!enabled) stopSpeaking();
}

export function getVoiceEnabled(): boolean {
  return voiceEnabled;
}

function pickChineseVoice(): SpeechSynthesisVoice | null {
  if (!isVoiceSupported()) return null;
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  // 偏好中文女声
  const preferred =
    voices.find((v) => /zh.*female/i.test(v.name)) ||
    voices.find((v) => v.lang.toLowerCase().startsWith('zh-cn')) ||
    voices.find((v) => v.lang.toLowerCase().startsWith('zh')) ||
    null;
  cachedVoice = preferred;
  return preferred;
}

// 浏览器有时第一次 getVoices 返回空，需要等 voiceschanged 事件
if (typeof window !== 'undefined' && isVoiceSupported()) {
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    cachedVoice = null;
    pickChineseVoice();
  });
}

export interface SpeakOptions {
  rate?: number;   // 语速，默认 0.9（慢一点适合小朋友）
  pitch?: number;  // 音调，默认 1.2（稍微高一点像孩子童声）
  volume?: number; // 音量
  interrupt?: boolean; // 是否打断之前的朗读，默认 true
}

export function speak(text: string, opts: SpeakOptions = {}): void {
  if (!voiceEnabled) return;
  if (!isVoiceSupported() || !text) return;
  try {
    const synth = window.speechSynthesis;
    if (opts.interrupt !== false) synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'zh-CN';
    utter.rate = opts.rate ?? 0.9;
    utter.pitch = opts.pitch ?? 1.2;
    utter.volume = opts.volume ?? 1;
    const voice = pickChineseVoice();
    if (voice) utter.voice = voice;
    synth.speak(utter);
  } catch {
    // 静默失败，不影响游戏
  }
}

export function stopSpeaking(): void {
  if (!isVoiceSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* noop */
  }
}

// 在用户首次点击时调用一次，可以"解锁" iOS Safari 的语音合成。
export function primeVoice(): void {
  if (!voiceEnabled || !isVoiceSupported()) return;
  try {
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    window.speechSynthesis.speak(u);
  } catch {
    /* noop */
  }
}
