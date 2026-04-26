import { useEffect, useMemo, useState } from 'react';
import type { TaskType } from '../../types';
import { pickRandom, randomInt, shuffle } from '../../utils/random';
import { randomSuccess } from '../../utils/messages';
import { playSound } from '../../utils/sound';
import { speak } from '../../utils/speech';
import CarSvg from '../CarSvg';

interface TaskModalProps {
  task: TaskType;
  learningMode: boolean;
  onComplete: () => void;
}

type Choice = {
  label: string;
  emoji: string;
  correct: boolean;
  hint: string;
};

type Light = 'red' | 'yellow' | 'green';

const LIGHT_LABELS: Record<Light, string> = {
  red: '红灯',
  yellow: '黄灯',
  green: '绿灯',
};

const TRAFFIC_ANSWERS: Record<Light, string> = {
  red: '停下来',
  yellow: '等一等',
  green: '往前开',
};

const COLOR_OPTIONS = [
  { name: '红色', color: '#ff5252', hint: '红色像苹果一样' },
  { name: '蓝色', color: '#4a90e2', hint: '蓝色像天空一样' },
  { name: '黄色', color: '#ffd166', hint: '黄色像香蕉一样' },
  { name: '绿色', color: '#5cd684', hint: '绿色像树叶一样' },
];

function titleForTask(task: TaskType, light?: Light): string {
  if (task === 'traffic-light' || task === 'red-light') {
    return `前面是${light ? LIGHT_LABELS[light] : '红绿灯'}啦！`;
  }
  if (task === 'parking') return '到停车场啦！';
  if (task === 'color-repair') return '洗车店冒泡泡啦！';
  if (task === 'seatbelt') return '上车先坐好！';
  return '前面有斑马线！';
}

export default function TaskModal({
  task,
  learningMode,
  onComplete,
}: TaskModalProps) {
  const [hint, setHint] = useState('');
  const [done, setDone] = useState(false);
  const [selected, setSelected] = useState<string | number | null>(null);
  const light = useMemo<Light>(() => {
    if (task === 'red-light') return 'red';
    return pickRandom(['red', 'yellow', 'green'] as const);
  }, [task]);
  const parkingTarget = useMemo(() => randomInt(1, 5), [task]);
  const colorTarget = useMemo(() => pickRandom(COLOR_OPTIONS), [task]);
  const colorOrder = useMemo(() => shuffle(COLOR_OPTIONS), [task]);

  useEffect(() => {
    const title = titleForTask(task, light);
    speak(title);
  }, [task, light]);

  const finish = (message: string) => {
    setDone(true);
    setHint(message);
    playSound('success');
    playSound('star');
    speak(message);
    window.setTimeout(onComplete, 1050);
  };

  const miss = (message: string) => {
    setHint(message);
    playSound('fail');
    speak(message);
  };

  const checkChoice = (choice: Choice) => {
    playSound('click');
    setSelected(choice.label);
    if (choice.correct) {
      finish(choice.hint);
    } else {
      miss(choice.hint);
    }
  };

  const renderTraffic = () => {
    const choices: Choice[] = [
      {
        label: '停下来',
        emoji: '🛑',
        correct: TRAFFIC_ANSWERS[light] === '停下来',
        hint: light === 'red' ? '做得好，红灯要停下来！' : `${LIGHT_LABELS[light]}不是停下来哦，再看看。`,
      },
      {
        label: '等一等',
        emoji: '⏸️',
        correct: TRAFFIC_ANSWERS[light] === '等一等',
        hint: light === 'yellow' ? '做得好，黄灯要等一等！' : `${LIGHT_LABELS[light]}不用选这个哦。`,
      },
      {
        label: '往前开',
        emoji: '🚗',
        correct: TRAFFIC_ANSWERS[light] === '往前开',
        hint: light === 'green' ? '做得好，绿灯可以往前开！' : '再想想，红灯和黄灯不能急着开哦。',
      },
    ];

    return (
      <>
        <div className="modal-traffic" aria-label={LIGHT_LABELS[light]}>
          <span className={light === 'red' ? 'on' : ''} />
          <span className={light === 'yellow' ? 'on' : ''} />
          <span className={light === 'green' ? 'on' : ''} />
        </div>
        <div className="modal-choice-row">
          {choices.map((choice) => (
            <button
              className={`modal-choice ${selected === choice.label ? 'picked' : ''}`}
              key={choice.label}
              onClick={() => checkChoice(choice)}
              type="button"
              disabled={done}
            >
              <span aria-hidden>{choice.emoji}</span>
              {choice.label}
            </button>
          ))}
        </div>
      </>
    );
  };

  const renderParking = () => (
    <>
      <p className="modal-task-line">把小车停到 {parkingTarget} 号车位。</p>
      <div className="modal-parking-lot">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            className={`modal-spot ${selected === n ? 'picked' : ''} ${done && n === parkingTarget ? 'correct' : ''}`}
            key={n}
            onClick={() => {
              playSound('click');
              setSelected(n);
              if (n === parkingTarget) {
                finish(`停好啦，${parkingTarget} 号车位找对了！`);
              } else {
                miss(`这是 ${n} 号，我们要找 ${parkingTarget} 号哦。`);
              }
            }}
            disabled={done}
            type="button"
          >
            <span>{n}</span>
          </button>
        ))}
      </div>
    </>
  );

  const renderColor = () => (
    <>
      <p className="modal-task-line">找到{colorTarget.name}小车去洗车。</p>
      <div className="modal-car-grid">
        {colorOrder.map((item) => (
          <button
            className={`modal-car-choice ${done && item.name === colorTarget.name ? 'washed' : ''}`}
            key={item.name}
            onClick={() => {
              playSound('click');
              if (item.name === colorTarget.name) {
                finish(`泡泡洗干净啦，${colorTarget.name}小车找对了！`);
              } else {
                miss(`再看看，${colorTarget.hint}。`);
              }
            }}
            disabled={done}
            type="button"
          >
            <CarSvg color={item.color} size={86} />
          </button>
        ))}
      </div>
    </>
  );

  const renderSimple = () => {
    const choices: Choice[] =
      task === 'seatbelt'
        ? [
            { label: '系好安全带', emoji: '🔒', correct: true, hint: '真棒，安全带系好再出发！' },
            { label: '还没系好', emoji: '🙈', correct: false, hint: '先系好安全带，小身体坐稳稳。' },
          ]
        : [
            { label: '停下让一让', emoji: '🙋', correct: true, hint: '做得好，过马路要让一让！' },
            { label: '直接开过去', emoji: '💨', correct: false, hint: '再想想，斑马线前要停下来。' },
          ];

    return (
      <div className="modal-choice-row two">
        {choices.map((choice) => (
          <button
            className={`modal-choice ${selected === choice.label ? 'picked' : ''}`}
            key={choice.label}
            onClick={() => checkChoice(choice)}
            type="button"
            disabled={done}
          >
            <span aria-hidden>{choice.emoji}</span>
            {choice.label}
          </button>
        ))}
      </div>
    );
  };

  const content = (() => {
    if (task === 'traffic-light' || task === 'red-light') return renderTraffic();
    if (task === 'parking') return renderParking();
    if (task === 'color-repair') return renderColor();
    return renderSimple();
  })();

  return (
    <div className="task-modal-backdrop">
      <div className={`task-modal ${done ? 'done' : ''}`}>
        <div className="modal-title">{titleForTask(task, light)}</div>
        {learningMode && (
          <p className="modal-learn">
            慢慢来，我会告诉你怎么做。
          </p>
        )}
        {content}
        {hint && <div className={`modal-hint ${done ? 'good' : ''}`}>{hint}</div>}
        {done && <div className="modal-stars" aria-hidden>⭐ 🌟 ⭐</div>}
      </div>
    </div>
  );
}
