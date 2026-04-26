import type { TaskType } from '../types';

export type SceneKind = 'crosswalk' | 'pedestrian' | 'red-light' | 'seatbelt';

export interface QuizOption {
  text: string;
  emoji: string;
  correct: boolean;
  hint?: string;
}

export interface SafetyQuiz {
  id: TaskType;
  scene: SceneKind;
  question: string;
  options: QuizOption[];
  learningIntro: string;
  learningIntroEmoji: string;
  successDetail: string;
}

export const SAFETY_QUIZZES: Partial<Record<TaskType, SafetyQuiz>> = {
  crosswalk: {
    id: 'crosswalk',
    scene: 'crosswalk',
    question: '前面有斑马线，要怎么做？',
    options: [
      { text: '停下看一看', emoji: '🛑', correct: true },
      { text: '直接开过去', emoji: '💨', correct: false, hint: '斑马线前要先停下来看一看哦' },
      { text: '一直按喇叭', emoji: '📢', correct: false, hint: '不能催，要让别人安全过马路' },
    ],
    learningIntro: '看见地上的白色条纹了吗？这叫斑马线。汽车看到斑马线，要慢下来，让大家安全过马路。',
    learningIntroEmoji: '🚸',
    successDetail: '斑马线前停一停，你是文明小司机！',
  },
  pedestrian: {
    id: 'pedestrian',
    scene: 'pedestrian',
    question: '有小朋友要过马路，怎么办？',
    options: [
      { text: '停下让一让', emoji: '🙋', correct: true },
      { text: '直接开过去', emoji: '🚗', correct: false, hint: '看到行人，要停下让一让哦' },
      { text: '按喇叭催', emoji: '📢', correct: false, hint: '不可以催别人，要耐心等一等' },
    ],
    learningIntro: '在路上走路的人叫行人。看到行人，我们要停下让一让，这样大家都安全。',
    learningIntroEmoji: '🚶',
    successDetail: '停下让一让，真有礼貌！',
  },
  'red-light': {
    id: 'red-light',
    scene: 'red-light',
    question: '红灯亮了，可是路上没有车，怎么办？',
    options: [
      { text: '等一等', emoji: '🛑', correct: true },
      { text: '直接开过去', emoji: '💨', correct: false, hint: '红灯一定要等哦，不能闯' },
    ],
    learningIntro: '红灯亮的时候，就算路上没有别的车，我们也要停下来等。这是保护自己的好办法。',
    learningIntroEmoji: '🚦',
    successDetail: '红灯等一等，安全第一！',
  },
  seatbelt: {
    id: 'seatbelt',
    scene: 'seatbelt',
    question: '上车啦，先做什么？',
    options: [
      { text: '系好安全带', emoji: '🔒', correct: true },
      { text: '还没系好', emoji: '🙈', correct: false, hint: '先系好安全带，再出发哦' },
    ],
    learningIntro: '上车第一件事，是系好安全带。安全带像一双手，帮我们坐得稳稳的。',
    learningIntroEmoji: '🧷',
    successDetail: '系好安全带，坐车更安全！',
  },
};

export function getQuiz(type: TaskType): SafetyQuiz | undefined {
  return SAFETY_QUIZZES[type];
}
