// 关卡生成器：把 10 个 ChapterTemplate × 10 关 = 100 个 Level3D 生成出来。
// 配置完全确定（不依赖 Math.random），刷新后稳定不变。

import { CHAPTERS_3D, levelNumberInChapter } from './chapters3d';
import type { Level3D } from './levels3d';
import { TEMPLATES } from './levelTemplates3d';

export function generateAllLevels(): Level3D[] {
  const out: Level3D[] = [];
  for (const chapter of CHAPTERS_3D) {
    const tpl = TEMPLATES[chapter.id - 1];
    for (let n = 1; n <= 10; n++) {
      const id = (chapter.id - 1) * 10 + n;
      const kind = tpl.kindByLevel?.[n - 1] ?? tpl.primaryKind;
      const roadLength = tpl.roadLength(n);
      const finishZ = tpl.finishZ(n);
      const cones = tpl.conesPattern?.(n) ?? [];
      const checkpoints = tpl.checkpointsPattern?.(n) ?? [];
      const titleSeed = tpl.baseTitles[n - 1] ?? `第 ${id} 关`;
      const title = `${titleSeed}`;
      const mission = tpl.baseMission(n);
      const summary = tpl.baseSummary(n);
      const learningGoal = tpl.baseLearningGoal;

      out.push({
        id,
        name: title,
        mission,
        learningGoal,
        summary,
        kind,
        roadLength,
        finishZ,
        cones,
        checkpoints,
      });
    }
  }
  return out;
}

// 给定全局关卡 id（1..100）找 chapter 内的序号 + 章节
export function explodeLevelId(levelId: number): { chapterId: number; n: number } {
  const safe = Math.min(100, Math.max(1, levelId));
  const chapterId = Math.ceil(safe / 10);
  const n = levelNumberInChapter(safe);
  return { chapterId, n };
}
