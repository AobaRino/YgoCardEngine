/** 卡片模型与 YGOPro 数据位定义 */

export interface Card {
  id: number;
  name: string;
  desc: string;
  /** 卡片地区：1=OCG 2=TCG 4=自制 8=简中 */
  ot: number;
  /** 同名卡 / 异画卡指向的本体 id，没有为 0 */
  alias: number;
  setcodes: number[];
  type: number;
  atk: number;
  /** 连接怪兽的 def 字段保存连接箭头 */
  def: number;
  /** 等级 / 阶级 / 连接值 */
  level: number;
  lscale: number;
  rscale: number;
  race: number;
  attribute: number;
}

export type CardTuple = [number, string, string, number, number, number[], number, number, number, number, number, number];

export function fromTuple(t: CardTuple): Card {
  const rawLevel = t[9];
  return {
    id: t[0],
    name: t[1],
    desc: t[2],
    ot: t[3],
    alias: t[4],
    setcodes: t[5],
    type: t[6],
    atk: t[7],
    def: t[8],
    level: rawLevel & 0xff,
    lscale: (rawLevel >>> 24) & 0xff,
    rscale: (rawLevel >>> 16) & 0xff,
    race: t[10],
    attribute: t[11],
  };
}

export const TYPE = {
  MONSTER: 0x1,
  SPELL: 0x2,
  TRAP: 0x4,
  NORMAL: 0x10,
  EFFECT: 0x20,
  FUSION: 0x40,
  RITUAL: 0x80,
  TRAPMONSTER: 0x100,
  SPIRIT: 0x200,
  UNION: 0x400,
  GEMINI: 0x800,
  TUNER: 0x1000,
  SYNCHRO: 0x2000,
  TOKEN: 0x4000,
  QUICKPLAY: 0x10000,
  CONTINUOUS: 0x20000,
  EQUIP: 0x40000,
  FIELD: 0x80000,
  COUNTER: 0x100000,
  FLIP: 0x200000,
  TOON: 0x400000,
  XYZ: 0x800000,
  PENDULUM: 0x1000000,
  SPSUMMON: 0x2000000,
  LINK: 0x4000000,
} as const;

export const EXTRA_MASK = TYPE.FUSION | TYPE.SYNCHRO | TYPE.XYZ | TYPE.LINK;

/** 显示顺序即 ygopro 中的类型描述顺序 */
export const TYPE_LABELS: [number, string][] = [
  [TYPE.MONSTER, '怪兽'],
  [TYPE.SPELL, '魔法'],
  [TYPE.TRAP, '陷阱'],
  [TYPE.NORMAL, '通常'],
  [TYPE.EFFECT, '效果'],
  [TYPE.FUSION, '融合'],
  [TYPE.RITUAL, '仪式'],
  [TYPE.SPIRIT, '灵魂'],
  [TYPE.UNION, '同盟'],
  [TYPE.GEMINI, '二重'],
  [TYPE.TUNER, '调整'],
  [TYPE.SYNCHRO, '同调'],
  [TYPE.QUICKPLAY, '速攻'],
  [TYPE.CONTINUOUS, '永续'],
  [TYPE.EQUIP, '装备'],
  [TYPE.FIELD, '场地'],
  [TYPE.COUNTER, '反击'],
  [TYPE.FLIP, '反转'],
  [TYPE.TOON, '卡通'],
  [TYPE.XYZ, '超量'],
  [TYPE.PENDULUM, '灵摆'],
  [TYPE.SPSUMMON, '特殊召唤'],
  [TYPE.LINK, '连接'],
];

export const ATTRIBUTES: [number, string][] = [
  [0x01, '地'],
  [0x02, '水'],
  [0x04, '炎'],
  [0x08, '风'],
  [0x10, '光'],
  [0x20, '暗'],
  [0x40, '神'],
];

export const RACES: [number, string][] = [
  [0x1, '战士'],
  [0x2, '魔法师'],
  [0x4, '天使'],
  [0x8, '恶魔'],
  [0x10, '不死'],
  [0x20, '机械'],
  [0x40, '水'],
  [0x80, '炎'],
  [0x100, '岩石'],
  [0x200, '鸟兽'],
  [0x400, '植物'],
  [0x800, '昆虫'],
  [0x1000, '雷'],
  [0x2000, '龙'],
  [0x4000, '兽'],
  [0x8000, '兽战士'],
  [0x10000, '恐龙'],
  [0x20000, '鱼'],
  [0x40000, '海龙'],
  [0x80000, '爬虫类'],
  [0x100000, '念动力'],
  [0x200000, '幻神兽'],
  [0x400000, '创造神'],
  [0x800000, '幻龙'],
  [0x1000000, '电子界'],
  [0x2000000, '幻想魔'],
];

/** 连接箭头，按 3x3 九宫格从左上到右下排列（中间为 0） */
export const LINK_MARKERS = [0x40, 0x80, 0x100, 0x8, 0, 0x20, 0x1, 0x2, 0x4];

export const isMonster = (c: Card) => (c.type & TYPE.MONSTER) !== 0;
export const isSpell = (c: Card) => (c.type & TYPE.SPELL) !== 0;
export const isTrap = (c: Card) => (c.type & TYPE.TRAP) !== 0;
export const isExtra = (c: Card) => isMonster(c) && (c.type & EXTRA_MASK) !== 0;
export const isLink = (c: Card) => (c.type & TYPE.LINK) !== 0;
export const isXyz = (c: Card) => (c.type & TYPE.XYZ) !== 0;
export const isPendulum = (c: Card) => (c.type & TYPE.PENDULUM) !== 0;

/** 异画卡：alias 指向本体且 id 很接近（ygopro 的判定规则） */
export const isAltArt = (c: Card) => c.alias !== 0 && Math.abs(c.id - c.alias) < 20;

/** 用于判断同名卡数量 / 禁限的本体 id */
export const baseId = (c: Card) => (c.alias && isAltArt(c) ? c.alias : c.id);

function labelsOf(value: number, table: [number, string][]): string[] {
  return table.filter(([bit]) => value & bit).map(([, l]) => l);
}

export const attributeLabel = (c: Card) => labelsOf(c.attribute, ATTRIBUTES).join('/');
export const raceLabel = (c: Card) => labelsOf(c.race, RACES).join('/');

export function typeLabel(c: Card): string {
  const parts = labelsOf(c.type, TYPE_LABELS);
  if (isMonster(c)) {
    // 怪兽：「效果/调整」这类子类型放前面，最后是「怪兽」
    return parts.filter((p) => p !== '怪兽').join('/') + '怪兽';
  }
  const kind = isSpell(c) ? '魔法' : '陷阱';
  const sub = parts.filter((p) => p !== kind);
  return (sub.length ? sub.join('/') : '通常') + kind;
}

export function statLabel(v: number): string {
  return v < 0 ? '?' : String(v);
}

export function levelLabel(c: Card): string {
  if (!isMonster(c)) return '';
  if (isLink(c)) return `LINK-${c.level}`;
  if (isXyz(c)) return `阶级 ${c.level}`;
  return `等级 ${c.level}`;
}

/** 卡框颜色分类，用于图片加载失败时的文字卡面和列表色块 */
export function frameKind(c: Card): string {
  if (isSpell(c)) return 'spell';
  if (isTrap(c)) return 'trap';
  if (c.type & TYPE.LINK) return 'link';
  if (c.type & TYPE.XYZ) return 'xyz';
  if (c.type & TYPE.SYNCHRO) return 'synchro';
  if (c.type & TYPE.FUSION) return 'fusion';
  if (c.type & TYPE.RITUAL) return 'ritual';
  if (c.type & TYPE.TOKEN) return 'token';
  if (c.type & TYPE.NORMAL) return 'normal';
  return 'effect';
}

export function otLabel(ot: number): string {
  const parts: string[] = [];
  if (ot & 1) parts.push('OCG');
  if (ot & 2) parts.push('TCG');
  if (ot & 8) parts.push('简中');
  if (ot & 4) parts.push('自制');
  return parts.join(' / ');
}

/** 卡组内排序：怪兽 → 魔法 → 陷阱；额外按融合/同调/超量/连接；同类按等级降序、名称、id */
export function compareCards(a: Card, b: Card): number {
  const rank = (c: Card) => {
    if (isMonster(c)) {
      if (c.type & TYPE.FUSION) return 10;
      if (c.type & TYPE.SYNCHRO) return 11;
      if (c.type & TYPE.XYZ) return 12;
      if (c.type & TYPE.LINK) return 13;
      return 0;
    }
    return isSpell(c) ? 20 : 30;
  };
  return rank(a) - rank(b) || b.level - a.level || a.name.localeCompare(b.name, 'zh') || a.id - b.id;
}
