// v1.8 NPC 对话气泡：头像 + 名字 + 1-2 句台词。
// 5 岁孩子能秒看懂，按下播报语音（如果开启）。

import type { NpcDef } from '../../data/storyChapters';

interface NpcDialogProps {
  npc: NpcDef;
  text: string;
  /** 任务地点（小标签） */
  location?: string;
  /** 是否反向显示（NPC 在右） */
  flipped?: boolean;
  /** 大尺寸版（任务卡用） */
  size?: 'sm' | 'lg';
}

export default function NpcDialog({
  npc,
  text,
  location,
  flipped = false,
  size = 'lg',
}: NpcDialogProps) {
  return (
    <div className={`npc-dialog size-${size} ${flipped ? 'is-flipped' : ''}`}>
      <div className="npc-avatar" style={{ background: npc.bodyColor }}>
        <span className="npc-emoji">{npc.emoji}</span>
      </div>
      <div className="npc-bubble">
        <div className="npc-bubble-top">
          <strong className="npc-name">{npc.name}</strong>
          {location && <span className="npc-location">{location}</span>}
        </div>
        <p className="npc-text">{text}</p>
      </div>
    </div>
  );
}
