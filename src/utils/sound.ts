// 音效预留接口。第一版不发声，后续可在此接入 Audio 或 WebAudio。
// 使用方式: playSound('success')

export type SoundName =
  | 'success'
  | 'fail'
  | 'click'
  | 'star'
  | 'engine';

export function playSound(_name: SoundName): void {
  // TODO: 接入音效文件后实现
}

export function preloadSounds(_names: SoundName[]): void {
  // TODO: 预加载音效
}
