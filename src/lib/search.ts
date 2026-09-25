/** 卡片检索 */
import { baseId, isAltArt, isMonster, isSpell, isTrap, isLink, type Card } from './card';
import type { Banlist } from './data';

export type Kind = 'all' | 'monster' | 'spell' | 'trap';
export type SortKey = 'relevance' | 'id' | 'name' | 'level' | 'atk' | 'def';

export interface SearchQuery {
  text: string;
  kind: Kind;
  /** 必须具备的类型位（如 效果、同调、速攻…），0 表示不限 */
  subtype: number;
  attribute: number;
  race: number;
  levelMin: number | null;
  levelMax: number | null;
  atkMin: number | null;
  atkMax: number | null;
  defMin: number | null;
  defMax: number | null;
  /** 字段代码（同名字段可能有多个代码，满足其一即可），空数组表示不限 */
  setcodes: number[];
  /** 禁限状态：-1 不限，0 禁止，1 限制，2 准限制 */
  limit: number;
  /** 地区：0 不限，1 OCG，2 TCG，8 简中 */
  ot: number;
  altArt: boolean;
  sort: SortKey;
}

export const defaultQuery = (): SearchQuery => ({
  text: '',
  kind: 'all',
  subtype: 0,
  attribute: 0,
  race: 0,
  levelMin: null,
  levelMax: null,
  atkMin: null,
  atkMax: null,
  defMin: null,
  defMax: null,
  setcodes: [],
  limit: -1,
  ot: 0,
  altArt: false,
  sort: 'relevance',
});

/** 统一全角/半角、大小写，去掉中点、连字符、空格等常见分隔符 */
export function normalize(s: string): string {
  return s.normalize('NFKC').toLowerCase().replace(/[\s·・‧•\-－_「」『』]/g, '');
}

const normCache = new WeakMap<Card, { name: string; desc: string }>();
function norm(c: Card) {
  let n = normCache.get(c);
  if (!n) {
    n = { name: normalize(c.name), desc: normalize(c.desc) };
    normCache.set(c, n);
  }
  return n;
}

/** ygopro 字段匹配规则：低 12 位相同，且高 4 位子字段满足包含关系 */
export function matchSetcode(card: Card, setcode: number): boolean {
  const type = setcode & 0xfff;
  const sub = setcode & 0xf000;
  return card.setcodes.some((sc) => (sc & 0xfff) === type && (sc & sub) === sub);
}

const inRange = (v: number, min: number | null, max: number | null) =>
  (min === null || v >= min) && (max === null || v <= max);

export function search(cards: Card[], q: SearchQuery, banlist?: Banlist | null): Card[] {
  const terms = q.text.split(/\s+/).map(normalize).filter(Boolean);
  const scored: { c: Card; score: number }[] = [];

  for (const c of cards) {
    if (!q.altArt && isAltArt(c)) continue;
    if (q.kind === 'monster' && !isMonster(c)) continue;
    if (q.kind === 'spell' && !isSpell(c)) continue;
    if (q.kind === 'trap' && !isTrap(c)) continue;
    if (q.subtype && (c.type & q.subtype) !== q.subtype) continue;
    if (q.ot && !(c.ot & q.ot)) continue;
    if (q.setcodes.length && !q.setcodes.some((sc) => matchSetcode(c, sc))) continue;
    if (q.attribute || q.race || q.levelMin !== null || q.levelMax !== null || q.atkMin !== null || q.atkMax !== null || q.defMin !== null || q.defMax !== null) {
      if (!isMonster(c)) continue;
      if (q.attribute && !(c.attribute & q.attribute)) continue;
      if (q.race && !(c.race & q.race)) continue;
      if (!inRange(c.level, q.levelMin, q.levelMax)) continue;
      if (!inRange(c.atk, q.atkMin, q.atkMax)) continue;
      if ((q.defMin !== null || q.defMax !== null) && (isLink(c) || !inRange(c.def, q.defMin, q.defMax))) continue;
    }
    if (q.limit >= 0) {
      const l = banlist?.cards[baseId(c)] ?? banlist?.cards[c.id] ?? 3;
      if (l !== q.limit) continue;
    }

    let score = 0;
    if (terms.length) {
      const n = norm(c);
      let ok = true;
      for (const t of terms) {
        if (String(c.id) === t) score += 100;
        else if (n.name === t) score += 50;
        else if (n.name.startsWith(t)) score += 20;
        else if (n.name.includes(t)) score += 10;
        else if (n.desc.includes(t)) score += 1;
        else {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
    }
    scored.push({ c, score });
  }

  const byKey: Record<SortKey, (a: Card, b: Card) => number> = {
    relevance: () => 0,
    id: (a, b) => a.id - b.id,
    name: (a, b) => a.name.localeCompare(b.name, 'zh'),
    level: (a, b) => b.level - a.level,
    atk: (a, b) => b.atk - a.atk,
    def: (a, b) => b.def - a.def,
  };
  const cmp = byKey[q.sort];
  scored.sort((a, b) => (q.sort === 'relevance' ? b.score - a.score : 0) || cmp(a.c, b.c) || a.c.id - b.c.id);
  return scored.map((s) => s.c);
}
