/** 组卡器全局状态（Svelte 5 runes） */
import { baseId, compareCards, type Card } from '../lib/card';
import { loadAllCards, loadBanlists, loadMeta, loadSetnames, type Banlist, type DataMeta } from '../lib/data';
import { copyLimit, countCopies, defaultZone, emptyDeck, LIMITS, type Deck, type Zone } from '../lib/deck';
import { loadDraft, loadPrefs, saveDraft, savePrefs } from '../lib/storage';

/** 只读的大数据用 $state.raw，避免给上万张卡建深层代理 */
class DataStore {
  cards = $state.raw<Card[]>([]);
  cardMap = $state.raw(new Map<number, Card>());
  meta = $state.raw<DataMeta | null>(null);
  banlists = $state.raw<Banlist[]>([]);
  setnames = $state.raw(new Map<number, string>());
}
export const db = new DataStore();

export const app = $state({
  loading: true,
  error: '',
  banlistName: '',
  deck: emptyDeck(),
  /** 当前卡组对应的本地保存记录 */
  savedId: undefined as string | undefined,
  /** 详情面板中的卡片 */
  selected: null as number | null,
  toast: '',
});

export const lookup = (id: number) => db.cardMap.get(id);
export const currentBanlist = () => db.banlists.find((b) => b.name === app.banlistName) ?? null;
export const limitOf = (c: Card) => copyLimit(c, currentBanlist());

export async function init() {
  const draft = loadDraft();
  if (draft) {
    app.deck = { name: draft.name, main: draft.main, extra: draft.extra, side: draft.side };
    app.savedId = draft.savedId;
  }
  try {
    const [cards, banlists, setnames, meta] = await Promise.all([loadAllCards(), loadBanlists(), loadSetnames(), loadMeta()]);
    db.cardMap = new Map(cards.map((c) => [c.id, c]));
    db.cards = cards;
    db.banlists = banlists;
    db.setnames = setnames;
    db.meta = meta;
    const pref = loadPrefs().banlist;
    app.banlistName = pref !== undefined && (pref === '' || banlists.some((b) => b.name === pref)) ? pref : (banlists[0]?.name ?? '');
  } catch (e) {
    app.error = (e as Error).message;
  } finally {
    app.loading = false;
  }
}

export function setBanlist(name: string) {
  app.banlistName = name;
  savePrefs({ banlist: name });
}

function persist() {
  saveDraft({ ...$state.snapshot(app.deck), savedId: app.savedId });
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;
export function toast(msg: string) {
  app.toast = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (app.toast = ''), 2000);
}

/** 加卡；超出数量限制时提示并拒绝 */
export function addCard(id: number, zone?: Zone): boolean {
  const card = lookup(id);
  if (!card) return false;
  const target: Zone = zone === 'side' ? 'side' : defaultZone(card);
  const limit = limitOf(card);
  if (countCopies(app.deck, card, lookup) >= limit) {
    toast(limit === 0 ? `「${card.name}」是禁止卡` : `「${card.name}」最多 ${limit} 张`);
    return false;
  }
  const max = target === 'main' ? LIMITS.mainMax : target === 'extra' ? LIMITS.extraMax : LIMITS.sideMax;
  if (app.deck[target].length >= max) {
    toast(`已达到上限 ${max} 张`);
    return false;
  }
  app.deck[target].push(id);
  persist();
  return true;
}

export function removeAt(zone: Zone, index: number) {
  app.deck[zone].splice(index, 1);
  persist();
}

/** 从卡组中移除一张同名卡（优先主/额外，其次副卡组） */
export function removeOne(id: number) {
  const card = lookup(id);
  const base = card ? baseId(card) : id;
  for (const z of ['main', 'extra', 'side'] as Zone[]) {
    let i = app.deck[z].lastIndexOf(id);
    if (i < 0) i = app.deck[z].findLastIndex((x) => (lookup(x) ? baseId(lookup(x)!) : x) === base);
    if (i >= 0) {
      removeAt(z, i);
      return;
    }
  }
}

/** 拖动：在卡组区域之间移动或调整顺序 */
export function moveCard(from: Zone, index: number, to: Zone, toIndex?: number) {
  const id = app.deck[from][index];
  const card = lookup(id);
  if (id === undefined) return;
  if (to !== 'side' && card && defaultZone(card) !== to) {
    toast(to === 'extra' ? '只有融合/同调/超量/连接怪兽能放进额外卡组' : '额外卡组怪兽不能放进主卡组');
    return;
  }
  app.deck[from].splice(index, 1);
  let at = toIndex ?? app.deck[to].length;
  if (from === to && toIndex !== undefined && toIndex > index) at--;
  app.deck[to].splice(Math.max(0, Math.min(at, app.deck[to].length)), 0, id);
  persist();
}

export function sortDeck() {
  const cmp = (a: number, b: number) => {
    const ca = lookup(a);
    const cb = lookup(b);
    return ca && cb ? compareCards(ca, cb) : a - b;
  };
  app.deck.main.sort(cmp);
  app.deck.extra.sort(cmp);
  app.deck.side.sort(cmp);
  persist();
}

export function setDeck(deck: Deck, savedId?: string) {
  app.deck = { name: deck.name, main: [...deck.main], extra: [...deck.extra], side: [...deck.side] };
  app.savedId = savedId;
  persist();
}

export function renameDeck(name: string) {
  app.deck.name = name;
  persist();
}

export function markSaved(id: string) {
  app.savedId = id;
  persist();
}
