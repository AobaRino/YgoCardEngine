/** 组卡器全局状态（zustand） */
import { create } from 'zustand';
import { baseId, compareCards, type Card } from '../lib/card';
import { loadAllCards, loadBanlists, loadMeta, loadSetnames, type Banlist, type DataMeta } from '../lib/data';
import { copyLimit, countCopies, defaultZone, emptyDeck, LIMITS, type Deck, type Zone } from '../lib/deck';
import { loadDraft, loadPrefs, saveDraft, savePrefs } from '../lib/storage';

interface State {
  loading: boolean;
  error: string;
  cards: Card[];
  cardMap: Map<number, Card>;
  meta: DataMeta | null;
  banlists: Banlist[];
  setnames: Map<number, string>;
  banlistName: string;
  deck: Deck;
  /** 当前卡组对应的本地保存记录 */
  savedId: string | undefined;
  /** 详情面板中的卡片 */
  selected: number | null;
  toast: string;
}

export const useStore = create<State>(() => {
  const draft = loadDraft();
  return {
    loading: true,
    error: '',
    cards: [],
    cardMap: new Map(),
    meta: null,
    banlists: [],
    setnames: new Map(),
    banlistName: '',
    deck: draft ? { name: draft.name, main: draft.main, extra: draft.extra, side: draft.side } : emptyDeck(),
    savedId: draft?.savedId,
    selected: null,
    toast: '',
  };
});

const get = useStore.getState;
const set = useStore.setState;

export const lookup = (id: number) => get().cardMap.get(id);
export const selectBanlist = (s: State) => s.banlists.find((b) => b.name === s.banlistName) ?? null;
export const currentBanlist = () => selectBanlist(get());
export const limitOf = (c: Card) => copyLimit(c, currentBanlist());

/** 订阅禁卡表变化的 limitOf，组件里用它保证切换禁卡表后重新渲染 */
export function useLimitOf() {
  const banlist = useStore(selectBanlist);
  return (c: Card) => copyLimit(c, banlist);
}

let started = false;
export async function init() {
  if (started) return;
  started = true;
  try {
    const [cards, banlists, setnames, meta] = await Promise.all([loadAllCards(), loadBanlists(), loadSetnames(), loadMeta()]);
    const pref = loadPrefs().banlist;
    set({
      cards,
      cardMap: new Map(cards.map((c) => [c.id, c])),
      banlists,
      setnames,
      meta,
      banlistName: pref !== undefined && (pref === '' || banlists.some((b) => b.name === pref)) ? pref : (banlists[0]?.name ?? ''),
    });
  } catch (e) {
    set({ error: (e as Error).message });
  } finally {
    set({ loading: false });
  }
}

export function setBanlist(name: string) {
  set({ banlistName: name });
  savePrefs({ banlist: name });
}

function updateDeck(fn: (d: Deck) => Deck, savedId = get().savedId) {
  const deck = fn(get().deck);
  set({ deck, savedId });
  saveDraft({ ...deck, savedId });
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;
export function toast(msg: string) {
  set({ toast: msg });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => set({ toast: '' }), 2000);
}

export const select = (id: number | null) => set({ selected: id });

/** 加卡；超出数量限制时提示并拒绝。成功时返回卡片所在区域 */
export function addCard(id: number, zone?: Zone): Zone | null {
  const card = lookup(id);
  if (!card) return null;
  const { deck } = get();
  const target: Zone = zone === 'side' ? 'side' : defaultZone(card);
  const limit = limitOf(card);
  if (countCopies(deck, card, lookup) >= limit) {
    toast(limit === 0 ? `「${card.name}」是禁止卡` : `「${card.name}」最多 ${limit} 张`);
    return null;
  }
  const max = target === 'main' ? LIMITS.mainMax : target === 'extra' ? LIMITS.extraMax : LIMITS.sideMax;
  if (deck[target].length >= max) {
    toast(`已达到上限 ${max} 张`);
    return null;
  }
  updateDeck((d) => ({ ...d, [target]: [...d[target], id] }));
  return target;
}

export function removeAt(zone: Zone, index: number) {
  updateDeck((d) => ({ ...d, [zone]: d[zone].filter((_, i) => i !== index) }));
}

/** 从卡组中移除一张同名卡（优先主/额外，其次副卡组） */
export function removeOne(id: number) {
  const card = lookup(id);
  const base = card ? baseId(card) : id;
  const { deck } = get();
  for (const z of ['main', 'extra', 'side'] as Zone[]) {
    let i = deck[z].lastIndexOf(id);
    if (i < 0) i = deck[z].findLastIndex((x) => { const c = lookup(x); return (c ? baseId(c) : x) === base; });
    if (i >= 0) return removeAt(z, i);
  }
}

/** 拖动：在卡组区域之间移动或调整顺序 */
export function moveCard(from: Zone, index: number, to: Zone, toIndex?: number) {
  const id = get().deck[from][index];
  if (id === undefined) return;
  const card = lookup(id);
  if (to !== 'side' && card && defaultZone(card) !== to) {
    toast(to === 'extra' ? '只有融合/同调/超量/连接怪兽能放进额外卡组' : '额外卡组怪兽不能放进主卡组');
    return;
  }
  updateDeck((d) => {
    const next = { ...d, main: [...d.main], extra: [...d.extra], side: [...d.side] };
    next[from].splice(index, 1);
    let at = toIndex ?? next[to].length;
    if (from === to && toIndex !== undefined && toIndex > index) at--;
    next[to].splice(Math.max(0, Math.min(at, next[to].length)), 0, id);
    return next;
  });
}

export function sortDeck() {
  const cmp = (a: number, b: number) => {
    const ca = lookup(a);
    const cb = lookup(b);
    return ca && cb ? compareCards(ca, cb) : a - b;
  };
  updateDeck((d) => ({ ...d, main: [...d.main].sort(cmp), extra: [...d.extra].sort(cmp), side: [...d.side].sort(cmp) }));
}

export function setDeck(deck: Deck, savedId?: string) {
  updateDeck(() => ({ name: deck.name, main: [...deck.main], extra: [...deck.extra], side: [...deck.side] }), savedId);
}

export const renameDeck = (name: string) => updateDeck((d) => ({ ...d, name }));
export const markSaved = (id: string) => updateDeck((d) => d, id);
export const clearSavedId = () => updateDeck((d) => d, undefined);
