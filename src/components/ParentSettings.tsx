import { useState } from 'react';
import type { ParentConfig } from '../types';
import { isVoiceSupported, speak } from '../utils/speech';
import { getDailyUsage, loadLearningRecords, resetDailyUsage } from '../utils/storage';

interface ParentSettingsProps {
  config: ParentConfig;
  onSave: (next: ParentConfig) => void;
  onBack: () => void;
}

const DAILY_MINUTE_OPTIONS = [10, 15, 20];
const REST_AFTER_OPTIONS = [3, 5, 8];

export default function ParentSettings({ config, onSave, onBack }: ParentSettingsProps) {
  const [draft, setDraft] = useState(config);
  const [usage, setUsage] = useState(() => getDailyUsage());
  const records = loadLearningRecords().slice(0, 6);
  const voiceOk = isVoiceSupported();

  const resetToday = () => {
    resetDailyUsage();
    setUsage(getDailyUsage());
  };

  return (
    <main className="panel-screen parent-page">
      <header className="panel-header">
        <button onClick={onBack} type="button">返回</button>
        <h1>家长设置</h1>
        <span>长按入口</span>
      </header>

      <section className="parent-card">
        <h2>每天最多玩多久</h2>
        <div className="setting-pills">
          {DAILY_MINUTE_OPTIONS.map((minutes) => (
            <button
              key={minutes}
              className={draft.dailyMinutes === minutes ? 'active' : ''}
              onClick={() => setDraft({ ...draft, dailyMinutes: minutes })}
              type="button"
            >
              {minutes} 分钟
            </button>
          ))}
        </div>
        <p>今天已玩 {Math.floor(usage.seconds / 60)} 分钟，完成 {usage.completedLevels} 关。</p>
        <button className="small-text-btn" onClick={resetToday} type="button">重置今天记录</button>
      </section>

      <section className="parent-card">
        <h2>连续几关后休息</h2>
        <div className="setting-pills">
          {REST_AFTER_OPTIONS.map((count) => (
            <button
              key={count}
              className={draft.restAfterLevels === count ? 'active' : ''}
              onClick={() => setDraft({ ...draft, restAfterLevels: count })}
              type="button"
            >
              {count} 关
            </button>
          ))}
        </div>
        <p>到达后会进入 20 秒休息页，提醒喝水、看远处。</p>
      </section>

      <section className="parent-card">
        <h2>语音提示</h2>
        <label className="voice-row">
          <input
            type="checkbox"
            checked={draft.voiceEnabled}
            disabled={!voiceOk}
            onChange={(event) => setDraft({ ...draft, voiceEnabled: event.target.checked })}
          />
          <span>开启简单语音提示</span>
        </label>
        <button
          className="small-text-btn"
          onClick={() => speak('小小汽车驾驶大师，准备出发啦！')}
          type="button"
        >
          测试语音
        </button>
      </section>

      <section className="parent-card">
        <h2>学习记录</h2>
        {records.length === 0 ? (
          <p>还没有通关记录。</p>
        ) : (
          <ul className="learning-list">
            {records.map((record, index) => (
              <li key={`${record.date}-${record.level}-${index}`}>
                第 {record.level} 关：{record.summary}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="parent-card">
        <h2>安全说明</h2>
        <p>本游戏无广告、无充值、无排行榜、无抽奖、无金币雨。</p>
      </section>

      <div className="parent-actions">
        <button onClick={onBack} type="button">取消</button>
        <button className="master-start-btn" onClick={() => onSave(draft)} type="button">保存</button>
      </div>
    </main>
  );
}
