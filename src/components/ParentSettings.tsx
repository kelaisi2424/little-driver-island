import { useState } from 'react';
import type { ParentConfig } from '../types';
import { isVoiceSupported, speak } from '../utils/speech';
import { resetTodayCount, getTodayCount } from '../utils/storage';

interface ParentSettingsProps {
  config: ParentConfig;
  onSave: (next: ParentConfig) => void;
  onBack: () => void;
}

const TASK_COUNT_OPTIONS = [3, 4, 5];
const DAILY_LIMIT_OPTIONS = [1, 2, 3];

export default function ParentSettings({
  config,
  onSave,
  onBack,
}: ParentSettingsProps) {
  const [draft, setDraft] = useState<ParentConfig>(config);
  const [todayCount, setTodayCount] = useState<number>(() => getTodayCount());
  const voiceOk = isVoiceSupported();

  const save = () => {
    onSave(draft);
    onBack();
  };

  const handleVoiceTest = () => {
    speak('你好，我是小小司机的语音老师。');
  };

  const handleResetCount = () => {
    resetTodayCount();
    setTodayCount(0);
  };

  return (
    <div className="parent-page">
      <h2>家长设置</h2>

      <div className="parent-card">
        <h3>每局任务数量</h3>
        <div className="task-count-row">
          {TASK_COUNT_OPTIONS.map((n) => (
            <div
              key={n}
              className={`count-pill ${draft.totalTasks === n ? 'active' : ''}`}
              onClick={() => setDraft({ ...draft, totalTasks: n })}
            >
              {n} 个
            </div>
          ))}
        </div>
        <p>建议每局 5 个，约 3 分钟。</p>
      </div>

      <div className="parent-card">
        <h3>每天最多玩几局</h3>
        <div className="task-count-row">
          {DAILY_LIMIT_OPTIONS.map((n) => (
            <div
              key={n}
              className={`count-pill ${draft.dailyLimit === n ? 'active' : ''}`}
              onClick={() => setDraft({ ...draft, dailyLimit: n })}
            >
              {n} 局
            </div>
          ))}
        </div>
        <p>
          今日已玩 {todayCount} 局。
          {todayCount > 0 && (
            <button
              className="link-btn inline"
              onClick={handleResetCount}
              type="button"
            >
              重置今天
            </button>
          )}
        </p>
      </div>

      <div className="parent-card">
        <h3>儿童语音播报</h3>
        <label className="voice-toggle">
          <input
            type="checkbox"
            checked={draft.voiceEnabled}
            disabled={!voiceOk}
            onChange={(e) =>
              setDraft({ ...draft, voiceEnabled: e.target.checked })
            }
          />
          <span>开启语音提示</span>
        </label>
        {voiceOk ? (
          <p>
            使用浏览器自带语音合成（Web Speech API），无需联网下载。
            <button
              className="link-btn inline"
              onClick={handleVoiceTest}
              type="button"
            >
              测试一下
            </button>
          </p>
        ) : (
          <p>当前浏览器不支持语音合成，可以关闭此选项。</p>
        )}
      </div>

      <div className="parent-card">
        <h3>休息提醒文字</h3>
        <textarea
          className="parent-textarea"
          value={draft.reminder}
          onChange={(e) => setDraft({ ...draft, reminder: e.target.value })}
          maxLength={80}
        />
        <p>每局结束时显示在休息页。</p>
      </div>

      <div className="parent-card">
        <h3>关于本游戏</h3>
        <ul className="parent-info-list">
          <li>无广告</li>
          <li>无充值</li>
          <li>无排行榜</li>
          <li>无抽奖、无诱导分享</li>
          <li>每天有局数限制，自动提醒休息</li>
          <li>贴纸只展示，不刺激、不分稀有度</li>
        </ul>
      </div>

      <div className="btn-row" style={{ marginTop: 'auto', paddingTop: 18 }}>
        <button className="btn btn-ghost" onClick={onBack}>取消</button>
        <button className="btn btn-secondary" onClick={save}>保存</button>
      </div>
    </div>
  );
}
