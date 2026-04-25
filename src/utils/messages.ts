import { pickRandom } from './random';

// 通用鼓励语 - 答对任务时显示
export const SUCCESS_MESSAGES: readonly string[] = [
  '做得好！',
  '小司机真棒！',
  '太厉害啦！',
  '答对啦！',
  '完美！',
  '你真聪明！',
  '加油，小司机！',
  '安全驾驶很重要！',
  '真有礼貌！',
  '好样的！',
];

// 鼓励 emoji
export const SUCCESS_EMOJIS: readonly string[] = ['⭐️', '🌟', '🎉', '🏆', '👏'];

export function randomSuccess(): string {
  return pickRandom(SUCCESS_MESSAGES);
}

export function randomSuccessEmoji(): string {
  return pickRandom(SUCCESS_EMOJIS);
}
