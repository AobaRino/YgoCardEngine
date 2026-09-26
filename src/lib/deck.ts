/** 卡组模型、校验与各种分享格式（YDK / ydke:// / 分享链接） */
import { baseId, isExtra, type Card } from './card';
import type { Banlist } from './data';

export type Zone = 'main' | 'extra' | 'side';
export const ZONES: Zone[] = ['main', 'extra', 'side'];
export const ZONE_LABELS: Record<Zone, string> = { main: '主卡组', extra: '额外卡组', side: '副卡组' };

export interface Deck {
  name: string;
  main: number[];
  extra: number[];
  side: number[];
}

export const emptyDeck = (name = ''): Deck => ({ name, main: [], extra: [], side: [] });

export const deckSize = (d: Deck) => d.main.length + d.extra.length + d.side.length;

export const allIds = (d: Deck) => [...d.main, ...d.extra, ...d.side];

/** 往卡组里加卡时自动决定放主卡组还是额外卡组 */
export const defaultZone = (c: Card): Zone => (isExtra(c) ? 'extra' : 'main');

export const LIMITS = { mainMin: 40, mainMax: 60, extraMax: 15, sideMax: 15, copies: 3 };

export interface DeckIssue {
  level: 'error' | 'warn';
  message: string;
}

export function copyLimit(card: Card, banlist?: Banlist | null): number {
  if (!banlist) return LIMITS.copies;
  const v = banlist.cards[baseId(card)] ?? banlist.cards[card.id];
  return v ?? LIMITS.copies;
}

/** 统计同名卡（异画算同一张）在卡组中的总数量 */
export function countCopies(deck: Deck, card: Card, lookup: (id: number) => Card | undefined): number {
  const base = baseId(card);
  let n = 0;
  for (const id of allIds(deck)) {
    const c = lookup(id);
    if (c ? baseId(c) === base : id === base) n++;
  }
  return n;
}

export function validateDeck(
  deck: Deck,
  lookup: (id: number) => Card | undefined,
  banlist?: Banlist | null,
): DeckIssue[] {
  const issues: DeckIssue[] = [];
  const { main, extra, side } = deck;
  if (main.length < LIMITS.mainMin) issues.push({ level: 'warn', message: `主卡组不足 ${LIMITS.mainMin} 张（当前 ${main.length}）` });
  if (main.length > LIMITS.mainMax) issues.push({ level: 'error', message: `主卡组超过 ${LIMITS.mainMax} 张（当前 ${main.length}）` });
  if (extra.length > LIMITS.extraMax) issues.push({ level: 'error', message: `额外卡组超过 ${LIMITS.extraMax} 张（当前 ${extra.length}）` });
  if (side.length > LIMITS.sideMax) issues.push({ level: 'error', message: `副卡组超过 ${LIMITS.sideMax} 张（当前 ${side.length}）` });

  const counts = new Map<number, { card: Card; n: number }>();
  const unknown = new Set<number>();
  for (const id of allIds(deck)) {
    const c = lookup(id);
    if (!c) {
      unknown.add(id);
      continue;
    }
    const b = baseId(c);
    const e = counts.get(b);
    if (e) e.n++;
    else counts.set(b, { card: c, n: 1 });
  }
  for (const { card, n } of counts.values()) {
    const limit = copyLimit(card, banlist);
    if (n > limit) {
      const why = limit === 0 ? '禁止卡' : limit < LIMITS.copies ? `限制 ${limit} 张` : `最多 ${limit} 张`;
      issues.push({ level: 'error', message: `「${card.name}」${n} 张，${why}` });
    }
  }
  for (const id of main) {
    const c = lookup(id);
    if (c && isExtra(c)) issues.push({ level: 'error', message: `「${c.name}」是额外卡组怪兽，不能放在主卡组` });
  }
  for (const id of extra) {
    const c = lookup(id);
    if (c && !isExtra(c)) issues.push({ level: 'error', message: `「${c.name}」不能放在额外卡组` });
  }
  if (unknown.size) issues.push({ level: 'warn', message: `${unknown.size} 种卡片不在数据库中：${[...unknown].slice(0, 5).join(', ')}` });
  return issues;
}

// ---------------------------------------------------------------- YDK

export function toYdk(deck: Deck): string {
  const lines = ['#created by ygo-deck', '#main', ...deck.main.map(String), '#extra', ...deck.extra.map(String), '!side', ...deck.side.map(String)];
  return lines.join('\n') + '\n';
}

export function parseYdk(text: string, name = ''): Deck {
  const deck = emptyDeck(name);
  let zone: Zone = 'main';
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const lower = line.toLowerCase();
    if (lower.startsWith('#main')) zone = 'main';
    else if (lower.startsWith('#extra')) zone = 'extra';
    else if (lower.startsWith('!side')) zone = 'side';
    else if (/^\d+/.test(line)) deck[zone].push(parseInt(line, 10));
  }
  return deck;
}

// ---------------------------------------------------------------- ydke://

function idsToBase64(ids: number[]): string {
  const bytes = new Uint8Array(ids.length * 4);
  const view = new DataView(bytes.buffer);
  ids.forEach((id, i) => view.setUint32(i * 4, id, true));
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function base64ToIds(s: string): number[] {
  const norm = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(norm + '='.repeat((4 - (norm.length % 4)) % 4));
  const view = new DataView(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) view.setUint8(i, bin.charCodeAt(i));
  const ids: number[] = [];
  for (let i = 0; i + 4 <= bin.length; i += 4) ids.push(view.getUint32(i, true));
  return ids;
}

export function toYdke(deck: Deck): string {
  return `ydke://${idsToBase64(deck.main)}!${idsToBase64(deck.extra)}!${idsToBase64(deck.side)}!`;
}

export function parseYdke(s: string, name = ''): Deck {
  const body = s.trim().replace(/^ydke:\/\//i, '');
  const [main = '', extra = '', side = ''] = body.split('!');
  return { name, main: base64ToIds(main), extra: base64ToIds(extra), side: base64ToIds(side) };
}

// ---------------------------------------------------------------- 分享链接

/** 卡组 → URL 参数（放在 hash 中，静态托管即可，无需后端） */
export function deckToParams(deck: Deck): URLSearchParams {
  const p = new URLSearchParams();
  p.set('deck', toYdke(deck));
  if (deck.name) p.set('name', deck.name);
  return p;
}

export function deckFromParams(p: URLSearchParams): Deck | null {
  const code = p.get('deck');
  if (!code) return null;
  try {
    return parseYdke(code, p.get('name') ?? '');
  } catch {
    return null;
  }
}

/** 识别用户粘贴的任意格式：ydke://、YDK 文本、分享链接、纯 id 列表 */
export function parseAny(text: string, name = ''): Deck | null {
  const t = text.trim();
  if (!t) return null;
  const ydke = /ydke:\/\/[A-Za-z0-9+/=_-]*![A-Za-z0-9+/=_-]*![A-Za-z0-9+/=_-]*!?/.exec(t);
  if (ydke) {
    try {
      return parseYdke(ydke[0], name);
    } catch {
      /* 继续尝试其它格式 */
    }
  }
  const hash = t.indexOf('#');
  if (/^https?:\/\//i.test(t) && hash >= 0) {
    const q = t.slice(hash + 1).replace(/^\/?[^?]*\?/, '');
    const d = deckFromParams(new URLSearchParams(q));
    if (d) return d;
  }
  if (/#main|#extra|!side/i.test(t) || /^\s*\d{4,}\s*$/m.test(t)) {
    const d = parseYdk(t, name);
    if (deckSize(d)) return d;
  }
  return null;
}
