/** 卡片数据加载（静态 JSON，由 scripts/build-data.ts 生成） */
import { fromTuple, type Card, type CardTuple } from './card';

export interface Banlist {
  name: string;
  cards: Record<string, number>;
}

export interface DataMeta {
  source: string;
  cardCount: number;
  shardCount: number;
  banlists: number;
  builtAt: string;
}

let dataBase: string | null = null;
const base = () => (dataBase ??= new URL('data/', document.baseURI).href);

/** 嵌入组件从脚本自身位置推导数据地址，保证跨站嵌入时也能找到数据 */
export function setDataBase(url: string) {
  dataBase = url.endsWith('/') ? url : url + '/';
}

const cache = new Map<string, Promise<unknown>>();

function getJson<T>(path: string): Promise<T> {
  let p = cache.get(path);
  if (!p) {
    p = fetch(base() + path).then((r) => {
      if (!r.ok) throw new Error(`加载 ${path} 失败：HTTP ${r.status}`);
      return r.json();
    });
    p.catch(() => cache.delete(path));
    cache.set(path, p);
  }
  return p as Promise<T>;
}

export const loadMeta = () => getJson<DataMeta>('meta.json');

const cardMap = new Map<number, Card>();
let fullLoaded: Promise<Card[]> | null = null;

/** 全量卡片（组卡器用，约 1.2MB gzip） */
export function loadAllCards(): Promise<Card[]> {
  fullLoaded ??= getJson<CardTuple[]>('cards.json').then((rows) => {
    const cards = rows.map(fromTuple);
    for (const c of cards) cardMap.set(c.id, c);
    return cards;
  });
  return fullLoaded;
}

/** 只加载指定 id 所在的分片（分享页、嵌入组件用） */
export async function loadCards(ids: Iterable<number>): Promise<Map<number, Card>> {
  const want = [...new Set(ids)];
  const missing = want.filter((id) => !cardMap.has(id));
  if (missing.length) {
    const meta = await loadMeta();
    const shards = [...new Set(missing.map((id) => id % meta.shardCount))];
    await Promise.all(
      shards.map(async (s) => {
        const rows = await getJson<CardTuple[]>(`shards/${s}.json`);
        for (const r of rows) if (!cardMap.has(r[0])) cardMap.set(r[0], fromTuple(r));
      }),
    );
  }
  return cardMap;
}

export const getCard = (id: number) => cardMap.get(id);

export const loadBanlists = () => getJson<Banlist[]>('lflist.json');

export async function loadSetnames(): Promise<Map<number, string>> {
  const rows = await getJson<[number, string][]>('setnames.json');
  return new Map(rows);
}
