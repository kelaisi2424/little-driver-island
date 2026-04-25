// 交通安全题库：每个 quiz 对应一种 TaskType。
// 增加新场景：1) 在 types.ts 的 TaskType 加新值 2) 在 random.ts 的 ALL_TASK_TYPES 加新值 3) 在此处加 quiz 配置。
// QuizTask 组件统一渲染，scene 决定上方场景视觉。

import type { TaskType } from '../types';

export type SceneKind = 'crosswalk' | 'pedestrian' | 'red-light' | 'seatbelt';

export interface QuizOption {
  text: string;
  emoji: string;
  correct: boolean;
  hint?: string; // 选错时的温和提示
}

export interface SafetyQuiz {
  id: TaskType;
  scene: SceneKind;
  question: string;            // 主问题（每次都会朗读）
  options: QuizOption[];
  learningIntro: string;       // 学习模式开场解释
  learningIntroEmoji: string;  // 开场卡片大表情
  successDetail: string;       // 学习模式答对后追加说明
}

export const SAFETY_QUIZZES: Partial<Record<TaskType, SafetyQuiz>> = {
  crosswalk: {
    id: 'crosswalk',
    scene: 'crosswalk',
    question: '前面有斑马线，应该怎么做？',
    options: [
      { text: '减速停下，看一看', emoji: '🛑', correct: true },
      { text: '快速冲过去', emoji: '💨', correct: false, hint: '斑马线前要先停下来看一看哦' },
      { text: '一直按喇叭', emoji: '📢', correct: false, hint: '不能催，要让行人先走' },
    ],
    learningIntro: '看见地上的白色条纹了吗？这叫斑马线。汽车看到斑马线，要慢下来，让小朋友安全地过马路。',
    learningIntroEmoji: '🦓',
    successDetail: '斑马线前要停一停，你是文明小司机！',
  },
  pedestrian: {
    id: 'pedestrian',
    scene: 'pedestrian',
    question: '有小朋友要过马路，怎么办？',
    options: [
      { text: '让他先走', emoji: '🙋', correct: true },
      { text: '先开过去', emoji: '🚗', correct: false, hint: '我们要让行人先过马路哦' },
      { text: '按喇叭催', emoji: '📢', correct: false, hint: '不可以催别人哦，要耐心等' },
    ],
    learningIntro: '在路上走路的人叫行人。看到行人，要让他们先走。这样大家都能安安全全。',
    learningIntroEmoji: '🚶',
    successDetail: '让行人先走，你真是有礼貌的小司机！',
  },
  'red-light': {
    id: 'red-light',
    scene: 'red-light',
    question: '红灯亮了，可是路上没有车，怎么办？',
    options: [
      { text: '乖乖等红灯', emoji: '🛑', correct: true },
      { text: '快速开过去', emoji: '💨', correct: false, hint: '红灯一定要停哦，不能闯' },
    ],
    learningIntro: '红灯亮的时候，就算路上没有别的车，我们也要停下来等。这是规矩，规矩要遵守。',
    learningIntroEmoji: '🚦',
    successDetail: '不闯红灯，安全第一！',
  },
  seatbelt: {
    id: 'seatbelt',
    scene: 'seatbelt',
    question: '上车了，第一件事是什么？',
    options: [
      { text: '系好安全带', emoji: '🔒', correct: true },
      { text: '打开车窗', emoji: '🪟', correct: false, hint: '先系安全带，再做别的事' },
      { text: '玩玩具', emoji: '🧸', correct: false, hint: '上车要先系好安全带哦' },
    ],
    learningIntro: '上车的第一件事，是系好安全带。安全带就像一双手，紧紧抱住我们，让我们坐车更安全。',
    learningIntroEmoji: '🧷',
    successDetail: '系好安全带，安全又开心！',
  },
};

export function getQuiz(type: TaskType): SafetyQuiz | undefined {
  return SAFETY_QUIZZES[type];
}
