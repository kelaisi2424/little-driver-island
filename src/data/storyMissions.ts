// v1.8 剧情任务生成器：为 100 关每关生成"剧情皮肤"。
// 不重写关卡数据 —— 复用 Level3D，只加 NPC 对话/任务名称。
// 每关 1-2 句对话，5 岁孩子能听懂。
//
// v1.9：增加 gameplayType + missionParams，让 3D 玩法跟着剧情真改变。

import { getLevel3D, type Level3D } from './levels3d';
import {
  STORY_CHAPTERS,
  getStoryChapter,
  type StoryChapter,
  type NpcDef,
} from './storyChapters';
import type { GameplayType, MissionParams } from '../three/missionObjectives';

export interface StoryMission {
  levelId: number;            // 1-100 → 复用 Level3D
  chapterId: number;          // 1-10
  chapterTitle: string;       // "幼儿园早晨"
  missionTitle: string;       // 关卡剧情名（覆盖 level.name）
  location: string;           // 文字位置 "幼儿园门口"
  npc: NpcDef;
  /** NPC 任务前对话（1 句） */
  introDialog: string;
  /** 任务目标，孩子能看懂的简单一行 */
  objectiveText: string;
  /** NPC 任务后对话（1 句感谢） */
  successDialog: string;
  /** 学习点，藏在 NPC 一句话里 */
  learningPoint: string;
  /** 奖励文案 */
  rewardText: string;
  /** 关卡末关：是否触发剧情节点（解锁下一章） */
  isChapterEnd: boolean;
  /** v1.9：玩法类型 */
  gameplayType: GameplayType;
  /** v1.9：玩法参数 */
  missionParams: MissionParams;
}

// =====================================================================
// 章节内对话变体（每章 5-8 个变体，10 关循环采样，避免重复感）
// =====================================================================

interface DialogPack {
  intro: string[];
  success: string[];
  location: string;
  rewardLine: string;
}

const DIALOG_PACKS: Record<number, DialogPack> = {
  1: {
    location: '驾驶学校门口',
    rewardLine: '小司机证更近了一步',
    intro: [
      '今天先学慢慢起步，按住油门看车子动起来。',
      '掌握方向盘最重要，遇到弯就轻轻打方向。',
      '看到终点线慢慢减速，安全停下来。',
      '路上要看清楚前方，不要心急。',
      '先开一段直路，习惯一下油门和刹车。',
      '试试连续小弯道，不要碰到边线。',
      '记得用刹车把车稳稳停下来。',
      '这次试试一气呵成开到终点。',
    ],
    success: [
      '太棒了，你越开越稳啦！',
      '车子开得很顺畅，进步好快。',
      '看，按部就班就能很安全。',
      '保持这种感觉，继续练。',
      '完美！下次再练一段更长的路。',
      '小司机证又近一步啦。',
      '这次开得真平稳，给你点赞。',
      '今天表现真棒！',
    ],
  },
  2: {
    location: '幼儿园门口',
    rewardLine: '幼儿园小朋友安全到啦',
    intro: [
      '小朋友要去幼儿园啦，请你帮忙送他们过去。',
      '路上要慢一点，孩子们才不害怕。',
      '看到前面的玩具路锥要绕开。',
      '今天人比较多，开慢一点更安全。',
      '小朋友坐在车里，开车要稳稳的。',
      '小朋友们想看看窗外，慢慢开吧。',
      '幼儿园快到了，注意停车位置。',
      '前面是小朋友最爱玩的地方，慢一点。',
    ],
    success: [
      '谢谢你，小朋友们安全到啦！',
      '你开车又稳又慢，孩子们都开心。',
      '太好啦，老师们也夸你。',
      '小朋友们在挥手谢谢呢！',
      '送达成功，给你一颗星星。',
      '安全送到！老师也很满意。',
      '你今天真是大功臣！',
      '小朋友们说还要坐你的车。',
    ],
  },
  3: {
    location: '熊猫修车厂',
    rewardLine: '修车厂老板很满意',
    intro: [
      '请把这袋零件送到修车位。',
      '前面是工具堆，慢慢绕过去。',
      '修车厂的过道窄，开车要小心。',
      '有几个轮胎堆着，别撞到。',
      '修车厂里今天有点忙，小心障碍。',
      '把这几桶机油慢慢运过来。',
      '前面那个 P 是要停进去的车位。',
      '货送到指定位置就完成啦。',
    ],
    success: [
      '谢谢，你帮我大忙了！',
      '老顾客都说你认真。',
      '这下修车厂井井有条啦。',
      '太好啦，工具到位了。',
      '老板要给你颁发"小帮手"奖。',
      '你的车开得真整齐！',
      '这一趟跑得真快又稳。',
      '辛苦啦小司机，喝口水休息一下。',
    ],
  },
  4: {
    location: '雨中市区',
    rewardLine: '雨天驾驶得到表扬',
    intro: [
      '今天下雨啦，路面湿滑要慢一点。',
      '前面有个大水坑，慢慢绕过去。',
      '雨天看不太清楚，开慢一点。',
      '听到雨声了吗？要更小心哦。',
      '地上很滑，刹车要提前一点。',
      '车灯要打开，让别人看见你。',
      '过水坑别开太快，会溅到行人。',
      '雨天最要紧的就是慢。',
    ],
    success: [
      '雨天开得这么稳，真厉害！',
      '看，慢一点就更安全。',
      '完成了！全身没湿一点。',
      '这场雨被你完美应对啦。',
      '镇长给你点赞！',
      '雨天表现满分。',
      '下次再下雨我也叫你。',
      '今天你最棒。',
    ],
  },
  5: {
    location: '交警岗',
    rewardLine: '交规小卫士',
    intro: [
      '红灯亮了要停下来等等。',
      '看到斑马线，别人要先走。',
      '路口慢一点看清楚再过。',
      '黄灯亮了准备停下来。',
      '交警在前方指挥，听他的。',
      '看见小朋友要让一让。',
      '红绿灯三色你都认识对吧？',
      '路口先看左右再走。',
    ],
    success: [
      '红绿灯遵守得很好！',
      '太守规矩啦，是个交规小卫士。',
      '看你这么懂事，交警也笑了。',
      '小朋友学交规要学你这样。',
      '一次都没闯红灯，棒！',
      '我把这枚徽章送给你。',
      '安全过路口，最重要！',
      '今天的表现完美。',
    ],
  },
  6: {
    location: '小狐狸超市',
    rewardLine: '超市送货员',
    intro: [
      '请把这箱红色货物送到红色小屋。',
      '今天要按数字 1 号车道送过去。',
      '货物比较多，慢慢送。',
      '路线要走对，别送错地方。',
      '颜色要看清楚再走。',
      '前面有 3 个停靠点，按顺序到。',
      '这次试试连续两个颜色路线。',
      '超市门口停车要稳。',
    ],
    success: [
      '送货完成，谢谢小司机！',
      '我的客人都收到啦。',
      '颜色路线走得真准。',
      '这一趟超快又稳。',
      '今天你是最棒的送货员。',
      '老板给你"金牌送货员"！',
      '客人都夸你，要常来。',
      '辛苦了，喝杯果汁吧。',
    ],
  },
  7: {
    location: '巴士站',
    rewardLine: '巴士司机的好帮手',
    intro: [
      '今天你来开巴士，按站点接小朋友。',
      '到站要慢慢停下来。',
      '小朋友上车后才能走。',
      '一站一站接，不要漏掉。',
      '到了就停，别忘了招手。',
      '路上要稳稳的，小朋友要坐好。',
      '幼儿园是终点站，最后到。',
      '车上人多了，开慢一点更稳。',
    ],
    success: [
      '小朋友们一个不少，棒！',
      '巴士司机的好帮手！',
      '到站准时，孩子们都开心。',
      '一路上稳稳当当，太靠谱了。',
      '今天的车票统一谢谢你。',
      '老师在幼儿园等着夸你呢。',
      '今天你是巴士小队长。',
      '辛苦啦，明天再来一趟。',
    ],
  },
  8: {
    location: '山路公园',
    rewardLine: '山路探险家',
    intro: [
      '山路有点弯，慢慢开。',
      '前方有大树，要绕开。',
      '弯道很多，方向要稳。',
      '山里风景不错，但别分心。',
      '山路有点窄，小心边缘。',
      '上坡的时候油门要均匀。',
      '看到小动物记得让一让。',
      '山顶就是终点，加油！',
    ],
    success: [
      '山路也难不倒你！',
      '完美收官，景色真美。',
      '这一段你开得真稳。',
      '山路探险家就是你！',
      '小鸟说你比它飞得还稳。',
      '弯弯山路你都没怕。',
      '风景看见了吗？很美吧。',
      '辛苦了，下山慢慢回家。',
    ],
  },
  9: {
    location: '汽车城中心',
    rewardLine: '汽车城功臣',
    intro: [
      '今天有大任务，多个目标一起完成。',
      '看清地图再出发，别走错。',
      '路上有路锥也有红绿灯。',
      '行人多，要让让。',
      '中途记得停在指定位置。',
      '一会要绕路，一会要停车，挺考验的。',
      '汽车城所有人都看着你呢。',
      '认真听指挥，慢慢做。',
    ],
    success: [
      '太了不起了，汽车城功臣！',
      '这么大的任务都完成了！',
      '市长决定给你颁奖。',
      '所有人为你鼓掌！',
      '你是真正的小司机榜样。',
      '汽车城以你为荣。',
      '今天的任务无懈可击。',
      '小司机里你最强！',
    ],
  },
  10: {
    location: '驾驶毕业典礼',
    rewardLine: '安全驾驶小达人',
    intro: [
      '毕业关到啦，看你这一路学到了什么。',
      '综合考验：障碍 + 红绿灯 + 停车。',
      '稳稳地一项一项完成。',
      '今天最重要的是安全。',
      '所有的本领都用上了。',
      '校长在终点等你。',
      '不要急，一步一步来。',
      '相信自己，你练了 100 关！',
    ],
    success: [
      '恭喜毕业！安全驾驶小达人！',
      '你长大了，可以独立开车啦。',
      '校长把毕业证给你！',
      '所有 NPC 都来祝贺你。',
      '汽车城从此有了新司机。',
      '你已经是小达人啦！',
      '今天起，你的故事开始了。',
      '继续加油，未来还有更多冒险。',
    ],
  },
};

function pickFromPack(pack: DialogPack, n: number, key: 'intro' | 'success'): string {
  const list = pack[key];
  const idx = (n - 1) % list.length;
  return list[idx];
}

// =====================================================================
// 关卡 → 任务标题：故事化重命名（不改 level.name 本身）
// =====================================================================

const TITLE_PREFIX: Record<number, string[]> = {
  1: ['启程', '直线练习', '小弯练习', '油门刹车', '看远再开', '稳稳到终点', '熟练挑战', '加速一段', '路线练习', '驾驶学校毕业'],
  2: ['送第一位', '陪小朋友', '一路顺风', '园门口', '小司机出动', '幼儿园路上', '小心慢行', '安全护送', '热闹早晨', '幼儿园达人'],
  3: ['送轮胎', '找零件', '修车位 1', '修车位 2', '过工具堆', '运机油', '清理过道', '维修小帮手', '错综复杂', '修车厂之星'],
  4: ['第一阵雨', '雨中绕坑', '湿滑路', '小心刹车', '雨天慢行', '夜雨驾驶', '路灯亮起', '雨水让行', '湿滑组合', '镇长奖励'],
  5: ['认识红灯', '绿灯通过', '小斑马线', '路口左右', '让小朋友', '黄灯准备', '复杂路口', '十字判断', '车流让行', '交规小卫士'],
  6: ['红色货箱', '蓝色货物', '黄色 1 号', '颜色组合', '数字 2 号', '送到 3 号', '快速送货', '错综路线', '彩色路线', '金牌送货员'],
  7: ['第一站', '第二站', '第三站', '第四站', '第五站', '雨中接送', '人多站', '慢慢停', '终点幼儿园', '巴士小队长'],
  8: ['进山入口', '一弯', '两弯', '小树林', '陡坡', '风景区', '小动物路', '云雾道', '山顶最近', '山路探险家'],
  9: ['市民求助', '消防出动', '医院送药', '彩色派送', '巴士接驳', '雨中救援', '交警协调', '综合 1', '综合 2', '汽车城功臣'],
  10: ['毕业准备', '综合 1', '综合 2', '综合 3', '组合任务', '终极停车', '终极避障', '终极路线', '终极路口', '安全驾驶小达人'],
};

function makeMissionTitle(chapterId: number, n: number): string {
  const list = TITLE_PREFIX[chapterId];
  return list?.[n - 1] ?? `任务 ${n}`;
}

// =====================================================================
// v1.9：levelId → gameplayType + missionParams
// L1-20 显式手工绑定；L21-100 走章节默认。
// =====================================================================

interface GameplayBinding {
  type: GameplayType;
  params: MissionParams;
}

/** 工具：将 cones 数组转为 puddles（雨天关） */
function conesToPuddles(level: Level3D) {
  return level.cones.map((c) => ({ x: c.x, z: c.z }));
}

/** 工具：将 checkpoints 转为 schoolPickup stops，颜色循环采样 */
function checkpointsToPassengerStops(level: Level3D) {
  const colors: Array<'red' | 'blue' | 'yellow' | 'green'> = ['red', 'blue', 'yellow', 'green'];
  return level.checkpoints.map((cp, i) => ({
    x: cp.x,
    z: cp.z,
    color: colors[i % colors.length],
  }));
}

/** 工具：将 checkpoints 转为 numberGates，数字按 1..N */
function checkpointsToNumberGates(level: Level3D) {
  return level.checkpoints.map((cp, i) => ({
    x: cp.x,
    z: cp.z,
    number: ((i % 5) + 1),
  }));
}

/** 工具：将 checkpoints 转为 colorGates */
function checkpointsToColorGates(level: Level3D) {
  const colors: Array<'red' | 'blue' | 'yellow' | 'green'> = ['red', 'blue', 'yellow', 'green'];
  return level.checkpoints.map((cp, i) => ({
    x: cp.x,
    z: cp.z,
    color: colors[i % colors.length],
  }));
}

/** 工具：在 finishZ 附近生成 4 栋彩色屋子（送货关） */
function makeDeliveryHouses(level: Level3D) {
  const z = level.finishZ + 4;
  return [
    { x: -3.0, z, color: 'red' as const },
    { x: -1.0, z, color: 'blue' as const },
    { x: 1.0,  z, color: 'yellow' as const },
    { x: 3.0,  z, color: 'green' as const },
  ];
}

/** 前 20 关的显式玩法绑定 */
function getExplicitBinding(levelId: number, level: Level3D): GameplayBinding | null {
  switch (levelId) {
    // L1-3: 简单开车
    case 1:
    case 2:
    case 3:
      return { type: 'simpleDrive', params: {} };

    // L4-5: 检查点（用 simpleDrive 的 checkpoint 路径，但确保 level 有 checkpoints）
    case 4:
    case 5:
      return { type: 'simpleDrive', params: {} };

    // L6-7: 数字车道
    case 6: {
      const gates = level.checkpoints.length > 0
        ? checkpointsToNumberGates(level)
        : [
            { x: -2.0, z: -28, number: 1 },
            { x: 0,    z: -45, number: 2 },
            { x: 2.0,  z: -62, number: 3 },
          ];
      return {
        type: 'numberLane',
        params: {
          targetNumbers: [2],
          numberGates: gates,
        },
      };
    }
    case 7: {
      const gates = level.checkpoints.length > 0
        ? checkpointsToNumberGates(level)
        : [
            { x: -2.0, z: -30, number: 1 },
            { x: 0,    z: -50, number: 2 },
            { x: 2.0,  z: -70, number: 3 },
          ];
      return {
        type: 'numberLane',
        params: { targetNumbers: [3], numberGates: gates },
      };
    }

    // L8: 停车
    case 8:
      return {
        type: 'parking',
        params: {
          parkingZoneX: 0,
          parkingZoneZ: level.finishZ + 1.5,
          parkingZoneRadius: 1.6,
          parkingHoldTime: 1.0,
          parkingMaxSpeed: 3.0,
        },
      };

    // L9: 红绿灯
    case 9:
      return {
        type: 'trafficRule',
        params: {
          trafficLights: [
            { z: -38, redPhase: 4, greenPhase: 4, cycleSeconds: 9 },
          ],
        },
      };

    // L10: 章节末停车（更难）
    case 10:
      return {
        type: 'parking',
        params: {
          parkingZoneX: 0,
          parkingZoneZ: level.finishZ + 1.5,
          parkingZoneRadius: 1.4,
          parkingHoldTime: 1.2,
          parkingMaxSpeed: 2.5,
        },
      };

    // L11-13: 接送小朋友
    case 11:
    case 12:
    case 13: {
      const stops = level.checkpoints.length > 0
        ? checkpointsToPassengerStops(level).slice(0, levelId - 10)
        : Array.from({ length: levelId - 10 }, (_, i) => ({
            x: i % 2 === 0 ? -1.8 : 1.8,
            z: -25 - i * 18,
            color: (['red', 'blue', 'yellow'] as const)[i] ?? 'green',
          }));
      return {
        type: 'schoolPickup',
        params: {
          passengerCount: levelId - 10,
          passengerStops: stops,
        },
      };
    }

    // L14-15: 送货
    case 14:
    case 15: {
      const target = levelId === 14 ? 'red' : 'blue';
      return {
        type: 'delivery',
        params: {
          targetColor: target,
          deliveryHouses: makeDeliveryHouses(level),
        },
      };
    }

    // L16-17: 修车厂送零件
    case 16:
      return {
        type: 'repairDelivery',
        params: { cargoEmoji: '🛞', cargoLabel: '轮胎', maxCollisions: 3 },
      };
    case 17:
      return {
        type: 'repairDelivery',
        params: { cargoEmoji: '🔧', cargoLabel: '工具', maxCollisions: 3 },
      };

    // L18: 斑马线让行
    case 18:
      return {
        type: 'pedestrianYield',
        params: { crosswalkZ: -28, yieldRadius: 5, pedestrianSpeed: 0.4 },
      };

    // L19: 雨天
    case 19: {
      const puddles = level.cones.length > 0
        ? conesToPuddles(level)
        : [
            { x: -1.4, z: -22 },
            { x: 1.6, z: -38 },
            { x: -0.8, z: -52 },
          ];
      return {
        type: 'rainyDrive',
        params: { puddles, maxPuddleSplash: 2 },
      };
    }

    // L20: 综合任务（接送 + 停车）
    case 20: {
      const stops = level.checkpoints.length > 0
        ? checkpointsToPassengerStops(level).slice(0, 2)
        : [
            { x: -2.0, z: -28, color: 'red' as const },
            { x: 2.0, z: -52, color: 'blue' as const },
          ];
      return {
        type: 'mixedMission',
        params: {
          subTypes: ['schoolPickup', 'parking'],
          passengerCount: 2,
          passengerStops: stops,
          parkingZoneX: 0,
          parkingZoneZ: level.finishZ + 1.5,
          parkingZoneRadius: 1.7,
          parkingHoldTime: 1.0,
          parkingMaxSpeed: 3.0,
        },
      };
    }
    default:
      return null;
  }
}

/** L21-100：按章节默认绑定 */
function getChapterDefaultBinding(level: Level3D): GameplayBinding {
  const chapterId = Math.ceil(level.id / 10);
  switch (chapterId) {
    case 3: // 修车厂
      return {
        type: 'repairDelivery',
        params: { cargoEmoji: '🔧', cargoLabel: '零件', maxCollisions: 3 },
      };
    case 4: // 雨天
      return {
        type: 'rainyDrive',
        params: {
          puddles: level.cones.length > 0 ? conesToPuddles(level) : [],
          maxPuddleSplash: 2,
        },
      };
    case 5: // 交通安全
      return {
        type: 'trafficRule',
        params: {
          trafficLights: [
            { z: level.finishZ + 30, redPhase: 4, greenPhase: 4, cycleSeconds: 9 },
            ...(level.id % 10 >= 5
              ? [{ z: level.finishZ + 60, redPhase: 4, greenPhase: 4, cycleSeconds: 9 }]
              : []),
          ],
        },
      };
    case 6: // 颜色路线
      return {
        type: 'colorRoute',
        params: {
          targetColor: (['red', 'blue', 'yellow', 'green'] as const)[level.id % 4],
          colorGates: level.checkpoints.length > 0
            ? checkpointsToColorGates(level)
            : [],
        },
      };
    case 7: // 巴士路线（多站点）
      return {
        type: 'multiStopRoute',
        params: {
          stops: level.checkpoints.length > 0
            ? level.checkpoints.map((cp) => ({ x: cp.x, z: cp.z }))
            : [],
        },
      };
    case 9: // 汽车城大任务
      return {
        type: 'mixedMission',
        params: {
          subTypes: ['trafficRule', 'parking'],
          trafficLights: [
            { z: level.finishZ + 35, redPhase: 4, greenPhase: 4, cycleSeconds: 9 },
          ],
          parkingZoneX: 0,
          parkingZoneZ: level.finishZ + 1.5,
          parkingZoneRadius: 1.7,
          parkingHoldTime: 1.0,
          parkingMaxSpeed: 3.0,
        },
      };
    case 10: // 毕业综合
      return {
        type: 'mixedMission',
        params: {
          subTypes: level.kind === 'parking'
            ? ['parking']
            : level.kind === 'cones'
              ? ['rainyDrive']
              : ['trafficRule'],
          puddles: level.cones.length > 0 ? conesToPuddles(level) : [],
          trafficLights: [
            { z: level.finishZ + 40, redPhase: 4, greenPhase: 4, cycleSeconds: 9 },
          ],
          parkingZoneX: 0,
          parkingZoneZ: level.finishZ + 1.5,
          parkingZoneRadius: 1.5,
          parkingHoldTime: 1.0,
          parkingMaxSpeed: 3.0,
        },
      };
    case 8: // 山路
    case 1:
    case 2:
    default:
      return { type: 'simpleDrive', params: {} };
  }
}

function getGameplayBinding(levelId: number, level: Level3D): GameplayBinding {
  const explicit = getExplicitBinding(levelId, level);
  if (explicit) return explicit;
  return getChapterDefaultBinding(level);
}

// =====================================================================
// 主入口：levelId → StoryMission
// =====================================================================

export function getStoryMission(levelId: number): StoryMission {
  const safe = Math.max(1, Math.min(100, levelId));
  const level: Level3D = getLevel3D(safe);
  const chapter: StoryChapter = getStoryChapter(Math.ceil(safe / 10));
  const n = ((safe - 1) % 10) + 1;
  const pack = DIALOG_PACKS[chapter.id];
  const binding = getGameplayBinding(safe, level);

  return {
    levelId: safe,
    chapterId: chapter.id,
    chapterTitle: chapter.title,
    missionTitle: makeMissionTitle(chapter.id, n),
    location: pack?.location ?? '汽车城',
    npc: chapter.npc,
    introDialog: pack ? pickFromPack(pack, n, 'intro') : level.mission,
    objectiveText: level.mission,
    successDialog: pack ? pickFromPack(pack, n, 'success') : '完成啦！',
    learningPoint: level.summary,
    rewardText: pack?.rewardLine ?? '继续前进',
    isChapterEnd: n === 10,
    gameplayType: binding.type,
    missionParams: binding.params,
  };
}

// 章节首关（用于地图展示当前主任务）
export function getChapterFirstMission(chapterId: number): StoryMission {
  return getStoryMission((chapterId - 1) * 10 + 1);
}

// 是否所有 100 关都生成成功（开发期校验）
export function validateStoryMissions(): boolean {
  for (let id = 1; id <= 100; id++) {
    const m = getStoryMission(id);
    if (!m.introDialog || !m.successDialog) {
      console.error('[storyMissions] missing dialog for level', id);
      return false;
    }
  }
  return true;
}

// 把所有可用 chapter 列出（地图位置展示用）
export { STORY_CHAPTERS, getStoryChapter };
