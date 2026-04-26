import { useState } from 'react';
import type { ParentConfig } from '../types';
import { isVoiceSupported, speak } from '../utils/speech';
import { getDailyUsage, loadLearningRecords, resetDailyUsage } from '../utils/storage';

interface ParentSettingsProps {
  config: ParentConfig;
  onSave: (next: ParentConfig) => void;
  onBack: () => void;
}

const MINUTES_OPTIONS = [10, 15, 20];
const REST_OPTIONS = [3, 5, 8];

export default function ParentSettings({ config, onSave, onBack }: ParentSettingsProps) {
  const [draft, setDraft] = useState<ParentConfig>(config);
  const [usage, setUsage] = useState(() => getDailyUsage());
  const [records] = useState(() => loadLearningRecords().slice(0, 5));
  const voiceOk = isVoiceSupported();

  const save = () => {
    onSave(draft);
    onBack();
  };

  const handleVoiceTest = () => {
    speak('你好，我是小司机的语音老师。');
  };

  const handleResetUsage = () => {
    resetDailyUsage();
    setUsage(getDailyUsage());
  };

  return (
    <main className="parent-page">
      <h2>家长设置</h2>

      <div className="parent-card">
        <h3>每天最多玩多久</h3>
        <div className="task-count-row">
          {MINUTES_OPTIONS.map((n) => (
            <div
              key={n}
              className={`count-pill ${draft.dailyMinutes === n ? 'active' : ''}`}
              onClick={() => setDraft({ ...draft, dailyMinutes: n })}
            >
              {n} 分钟
            </div>
          ))}
        </div>
        <p>
          今天已玩 {Math.floor(usage.seconds / 60)} 分钟 · {usage.completedLevels} 关。
          {usage.seconds > 0 && (
            <button
              className="link-btn inline"
              onClick={handleResetUsage}
              type="button"
            >
              重置今天
            </button>
          )}
        </p>
      </div>

      <div className="parent-card">
        <h3>连续多少关后强制休息</h3>
        <div className="task-count-row">
          {REST_OPTIONS.map((n) => (
            <div
              key={n}
              className={`count-pill ${draft.restAfterLevels === n ? 'active' : ''}`}
              onClick={() => setDraft({ ...draft, restAfterLevels: n })}
            >
              {n} 关
            </div>
          ))}
        </div>
        <p>休息页至少停留 20 秒，保护眼睛。</p>
      </div>

      <div className="parent-card">
        <h3>挑战模式</h3>
        <label className="voice-toggle">
          <input
            type="checkbox"
            checked={draft.challengeEnabled !== false}
            onChange={(e) => setDraft({ ...draft, challengeEnabled: e.target.checked })}
          />
          <span>在首页显示"挑战闯关"入口</span>
        </label>
        <p>
          挑战模式适合大一点的孩子，包含限时、避障、精准停车等目标，按表现拿 1-3 颗星。
          关闭后首页只显示"轻松练习"，原有的 100 关进度不变。
        </p>
      </div>

      <div className="parent-card">
        <h3>儿童语音播报</h3>
        <label className="voice-toggle">
          <input
            type="checkbox"
            checked={draft.voiceEnabled}
            disabled={!voiceOk}
            onChange={(e) => setDraft({ ...draft, voiceEnabled: e.target.checked })}
          />
          <span>开启语音提示</span>
        </label>
        {voiceOk ? (
          <p>
            使用浏览器自带语音合成，无需联网。
            <button className="link-btn inline" onClick={handleVoiceTest} type="button">
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
        <p>每次强制休息时显示。</p>
      </div>

      {records.length > 0 && (
        <div className="parent-card">
          <h3>最近学习记录</h3>
          <ul className="parent-info-list">
            {records.map((r, i) => (
              <li key={i}>
                {r.date} 第 {r.level} 关：{r.summary}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="parent-card">
        <h3>关于本游戏</h3>
        <ul className="parent-info-list">
          <li>无广告</li>
          <li>无充值</li>
          <li>无排行榜</li>
          <li>无抽奖、无诱导分享</li>
          <li>每天有时长限制，自动提醒休息</li>
          <li>贴纸只展示，不刺激、不分稀有度</li>
        </ul>
      </div>

      <div className="btn-row" style={{ marginTop: 'auto', paddingTop: 18 }}>
        <button className="btn btn-ghost" onClick={onBack}>取消</button>
        <button className="btn btn-secondary" onClick={save}>保存</button>
      </div>
    </main>
  );
}
