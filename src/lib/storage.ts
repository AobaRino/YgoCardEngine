/** 本地保存的卡组（仅存在当前浏览器；分享请用链接 / YDK） */
import type { Deck } from './deck';

export interface SavedDeck extends Deck {
  id: string;
  updatedAt: number;
}

const KEY = 'ygo-deck:decks';
const DRAFT_KEY = 'ygo-deck:draft';
const PREF_KEY = 'ygo-deck:prefs';

function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* 隐私模式等情况下存储不可用，忽略 */
  }
}

export const listDecks = (): SavedDeck[] => read<SavedDeck[]>(KEY, []).sort((a, b) => b.updatedAt - a.updatedAt);

export function saveDeck(deck: Deck, id?: string): SavedDeck {
  const decks = listDecks();
  const saved: SavedDeck = {
    ...deck,
    id: id ?? (crypto.randomUUID?.() ?? String(Date.now())),
    updatedAt: Date.now(),
  };
  write(KEY, [saved, ...decks.filter((d) => d.id !== saved.id)]);
  return saved;
}

export function deleteDeck(id: string) {
  write(KEY, listDecks().filter((d) => d.id !== id));
}

export const loadDraft = () => read<(Deck & { savedId?: string }) | null>(DRAFT_KEY, null);
export const saveDraft = (d: Deck & { savedId?: string }) => write(DRAFT_KEY, d);

export interface Prefs {
  banlist: string;
}
export const loadPrefs = () => read<Partial<Prefs>>(PREF_KEY, {});
export const savePrefs = (p: Partial<Prefs>) => write(PREF_KEY, { ...loadPrefs(), ...p });
