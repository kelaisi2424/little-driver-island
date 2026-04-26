import { useEffect, useMemo, useState } from 'react';
import type { ParentConfig } from '../../types';
import { useDragCar } from '../../hooks/useDragCar';
import { useGameLoop } from '../../hooks/useGameLoop';
import type { ColorName, DrivingEvent } from '../../utils/gameEvents';
import { COLOR_VALUES, createDrivingEvents, promptForEvent } from '../../utils/gameEvents';
import { playSound, getMuted, setMuted } from '../../utils/sound';
import { speak } from '../../utils/speech';
import Road from './Road';
import PlayerCar from './PlayerCar';
import RoadEvent from './RoadEvent';
import ChoicePopup from './ChoicePopup';
import FinishPanel from './FinishPanel';
import SoundToggle from './SoundToggle';

interface DrivingGameProps {
  config: ParentConfig;
  todayCount: number;
  onFinish: (stars: number) => void;
}

const CHECK_Y = 66;
const CAR_ZONE_Y = 74;
const SPEED = 0.024;

function laneFromCarX(x: number): number {
  if (x < 40) return 1;
  if (x < 61) return 2;
  return 3;
}

function colorFromCarX(x: number): ColorName {
  if (x < 37) return '红色';
  if (x < 50) return '蓝色';
  if (x < 63) return '黄色';
  return '绿色';
}

export default function DrivingGame({
  config,
  todayCount,
  onFinish,
}: DrivingGameProps) {
  const events = useMemo(
    () => createDrivingEvents(config.totalTasks),
    [config.totalTasks],
  );
  const drag = useDragCar({ minX: 28, maxX: 72, initialX: 50 });
  const [roadOffset, setRoadOffset] = useState(0);
  const [carX, setCarX] = useState(50);
  const [eventIndex, setEventIndex] = useState(0);
  const [eventY, setEventY] = useState(-22);
  const [stars, setStars] = useState(0);
  const [hint, setHint] = useState('左右拖动车，去对的地方。');
  const [popup, setPopup] = useState<null | {
    title: string;
    kind: 'traffic' | 'crosswalk';
  }>(null);
  const [paused, setPaused] = useState(false);
  const [bumping, setBumping] = useState(false);
  const [finished, setFinished] = useState(false);
  const [muted, setMutedState] = useState(() => getMuted());
  const [feedback, setFeedback] = useState<null | {
    kind: 'good' | 'careful';
    text: string;
  }>(null);

  const current = events[eventIndex];
  const running = Boolean(current) && !paused && !popup && !finished;

  useEffect(() => {
    const prompt = promptForEvent(current);
    setHint(prompt);
    speak(prompt);
  }, [current]);

  useGameLoop((delta) => {
    setRoadOffset((value) => (value + delta * 0.22) % 96);
    setCarX((value) => value + (drag.targetX - value) * 0.24);
    setEventY((value) => value + delta * SPEED);
  }, running);

  useEffect(() => {
    if (!drag.dragging) return;
    playSound('engine');
  }, [drag.dragging]);

  useEffect(() => {
    if (!current || paused || popup || finished) return;
    if (current.type === 'traffic' && eventY >= CHECK_Y) {
      if (current.light === 'red') {
        setPaused(true);
        setPopup({ title: '红灯亮啦！', kind: 'traffic' });
      } else {
        passEvent('绿灯，可以走！', true);
      }
    }

    if (current.type === 'crosswalk' && eventY >= CHECK_Y) {
      setPaused(true);
      setPopup({ title: '有人过马路啦！', kind: 'crosswalk' });
    }

    if (current.type === 'number-lane' && eventY >= CAR_ZONE_Y) {
      const lane = laneFromCarX(carX);
      const expectedIndex = (current.laneNumbers ?? []).indexOf(current.targetNumber ?? 1) + 1;
      if (lane === expectedIndex) {
        passEvent(`${current.targetNumber} 号车道找对啦！`, true);
      } else {
        softMiss(`再看看，我们要找 ${current.targetNumber} 号。`);
      }
    }

    if (current.type === 'color-garage' && eventY >= CAR_ZONE_Y) {
      const color = colorFromCarX(carX);
      if (color === current.targetColor) {
        passEvent(`泡泡洗干净啦，${current.targetColor}找对了！`, true);
      } else {
        const colorHint = current.targetColor === '红色' ? '红色像苹果一样，再找找。' : `再找找${current.targetColor}。`;
        softMiss(colorHint);
      }
    }

    if (current.type === 'roadblock' && eventY >= CAR_ZONE_Y) {
      if (carX > 42 && carX < 58) {
        softMiss('慢一点，注意安全。');
      } else {
        passEvent('绕开路障，真稳！', false);
      }
    }

    if (current.type === 'finish' && eventY >= CHECK_Y) {
      if (carX > 42 && carX < 58) {
        setFinished(true);
        setHint('停车成功！');
        playSound('complete');
        window.setTimeout(() => onFinish(stars), 1200);
      } else {
        setEventY(CHECK_Y);
        setHint('把车拖进 P 车位。');
      }
    }
  }, [carX, current, eventY, finished, onFinish, paused, popup, stars]);

  const nextEvent = () => {
    setEventIndex((index) => index + 1);
    setEventY(-22);
  };

  const passEvent = (message: string, earnStar: boolean) => {
    setPaused(true);
    setHint(message);
    setFeedback({ kind: 'good', text: earnStar ? '⭐ 做得好！' : '稳稳通过！' });
    playSound(earnStar ? 'success' : 'click');
    if (earnStar) setStars((value) => value + 1);
    window.setTimeout(() => {
      setFeedback(null);
      setPaused(false);
      nextEvent();
    }, 720);
  };

  const softMiss = (message: string) => {
    setPaused(true);
    setHint(message);
    setFeedback({ kind: 'careful', text: '慢一点' });
    setBumping(true);
    playSound('fail');
    window.setTimeout(() => setBumping(false), 420);
    window.setTimeout(() => {
      setFeedback(null);
      setPaused(false);
      setEventY(-10);
    }, 820);
  };

  const choosePopup = (value: string) => {
    if (!popup) return;
    if (popup.kind === 'traffic') {
      if (value === 'stop') {
        setPopup(null);
        passEvent('做得好，红灯要停下来！', true);
      } else {
        setHint('红灯要停下来哦。');
        playSound('fail');
      }
    }
    if (popup.kind === 'crosswalk') {
      if (value === 'yield') {
        setPopup(null);
        passEvent('停下让一让，真棒！', true);
      } else {
        setHint('斑马线前要让一让哦。');
        playSound('fail');
      }
    }
  };

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) playSound('click');
  };

  const targetLane = current?.type === 'number-lane'
    ? (current.laneNumbers ?? []).indexOf(current.targetNumber ?? 1) + 1
    : null;

  return (
    <div className="driving-game">
      <header className="runner-hud">
        <div>
          <strong>第 {Math.min(eventIndex + 1, events.length)} 站 / 共 {events.length} 站</strong>
          <span>今天 {todayCount} / {config.dailyLimit} 局</span>
        </div>
        <div className="runner-stars">{'⭐'.repeat(stars)}</div>
        <SoundToggle muted={muted} onToggle={toggleSound} />
      </header>

      <div className="runner-hint">{hint}</div>

      <Road
        roadOffset={roadOffset}
        onPointerDown={drag.onPointerDown}
        onPointerMove={drag.onPointerMove}
        onPointerUp={drag.onPointerUp}
        onPointerCancel={drag.onPointerCancel}
      >
        {current && (
          <RoadEvent
            event={current}
            y={eventY}
            targetLane={targetLane}
          />
        )}
        <PlayerCar x={carX} dragging={drag.dragging || running} bumping={bumping} />
        {feedback && (
          <div className={`drive-feedback ${feedback.kind}`}>
            {feedback.text}
          </div>
        )}
        {current?.type === 'color-garage' && eventY > 45 && eventY < 80 && (
          <div className="runner-target-color" style={{ background: COLOR_VALUES[current.targetColor ?? '红色'] }}>
            {current.targetColor}
          </div>
        )}
      </Road>

      {popup && (
        <ChoicePopup
          title={popup.title}
          hint={hint}
          options={
            popup.kind === 'traffic'
              ? [
                  { label: '停下来', value: 'stop' },
                  { label: '继续开', value: 'go' },
                ]
              : [
                  { label: '停下让一让', value: 'yield' },
                  { label: '直接开过去', value: 'go' },
                ]
          }
          onChoose={choosePopup}
        />
      )}

      {finished && <FinishPanel stars={stars} />}
    </div>
  );
}
