/**
 * 卡片数据构建脚本
 *
 * 用法：
 *   node scripts/build-data.ts          使用本地缓存 / 仓库自带数据构建
 *   node scripts/build-data.ts --fetch  先从上游下载最新数据再构建
 *
 * 数据来源优先级：
 *   1. data/cache/cards.cdb   —— 上游 YGOPro 简中卡片库（mycard/ygopro-database），--fetch 时下载
 *   2. Database/cards.db      —— 仓库里保留的旧数据（2020 年，CardInfo 表结构）
 *
 * 输出到 public/data/：
 *   cards.json        全量卡片（组卡器搜索用）
 *   shards/{n}.json   按 id % SHARD_COUNT 分片（分享页 / 嵌入组件只按需加载卡组用到的卡）
 *   setnames.json     字段（系列）名称
 *   lflist.json       禁限卡表
 *   meta.json         数据版本信息
 */
import { DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = join(ROOT, 'data', 'cache');
const OUT = join(ROOT, 'public', 'data');
const SHARD_COUNT = 128;

const UPSTREAM = {
  'cards.cdb': 'https://raw.githubusercontent.com/mycard/ygopro-database/master/locales/zh-CN/cards.cdb',
  'strings.conf': 'https://raw.githubusercontent.com/mycard/ygopro-database/master/locales/zh-CN/strings.conf',
  'lflist.conf': 'https://raw.githubusercontent.com/mycard/ygopro/master/lflist.conf',
};

const TYPE_TOKEN = 0x4000;

/** 卡片元组：[id, name, desc, ot, alias, setcodes, type, atk, def, level, race, attribute] */
type CardTuple = [number, string, string, number, number, number[], number, number, number, number, number, number];

async function fetchUpstream(): Promise<void> {
  mkdirSync(CACHE, { recursive: true });
  for (const [file, url] of Object.entries(UPSTREAM)) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      writeFileSync(join(CACHE, file), buf);
      console.log(`下载完成 ${file} (${(buf.length / 1024).toFixed(0)} KB)`);
    } catch (e) {
      console.warn(`下载 ${file} 失败，将使用本地数据：${(e as Error).message}`);
    }
  }
}

/** 64 位 setcode 拆成最多 4 个 16 位字段代码 */
function splitSetcode(sc: bigint): number[] {
  const out: number[] = [];
  for (let i = 0n; i < 4n; i++) {
    const v = Number((sc >> (i * 16n)) & 0xffffn);
    if (v) out.push(v);
  }
  return out;
}

const num = (v: unknown): number => (typeof v === 'bigint' ? Number(v) : Number(v ?? 0));

function readCards(): { cards: CardTuple[]; source: string } {
  const cdb = join(CACHE, 'cards.cdb');
  const legacy = join(ROOT, 'Database', 'cards.db');
  const useCdb = existsSync(cdb);
  const file = useCdb ? cdb : legacy;
  const db = new DatabaseSync(file, { readOnly: true });
  const sql = useCdb
    ? `SELECT d.id, t.name, t.desc, d.ot, d.alias, d.setcode, d.type, d.atk, d.def, d.level, d.race, d.attribute
       FROM datas d JOIN texts t ON d.id = t.id ORDER BY d.id`
    : `SELECT Id, Name, Desc, Ot, Alias, SetCode, Type, Atk, Def, Level, Race, Attribute FROM CardInfo ORDER BY Id`;
  const stmt = db.prepare(sql);
  stmt.setReadBigInts(true);
  const cards: CardTuple[] = [];
  for (const r of stmt.all() as Record<string, unknown>[]) {
    const v = Object.values(r);
    const type = num(v[6]);
    if (type & TYPE_TOKEN) continue; // 衍生物不能放进卡组
    cards.push([
      num(v[0]),
      String(v[1] ?? ''),
      String(v[2] ?? '').replace(/\r\n/g, '\n'),
      num(v[3]),
      num(v[4]),
      splitSetcode(BigInt(v[5] as bigint)),
      type,
      num(v[7]),
      num(v[8]),
      num(v[9]),
      num(v[10]),
      num(v[11]),
    ]);
  }
  db.close();
  return { cards, source: useCdb ? 'mycard/ygopro-database (zh-CN)' : 'Database/cards.db (legacy)' };
}

function readText(file: string): string | null {
  for (const p of [join(CACHE, file), join(ROOT, 'data', file)]) {
    if (existsSync(p)) return readFileSync(p, 'utf8');
  }
  return null;
}

function parseSetnames(text: string | null): [number, string][] {
  if (!text) return [];
  const out: [number, string][] = [];
  for (const line of text.split(/\r?\n/)) {
    const m = /^!setname\s+0x([0-9a-f]+)\s+([^\t]+)/i.exec(line);
    if (m) out.push([parseInt(m[1], 16), m[2].trim()]);
  }
  return out;
}

interface Banlist { name: string; cards: Record<string, number> }

function parseLflist(text: string | null): Banlist[] {
  if (!text) return [];
  const lists: Banlist[] = [];
  let cur: Banlist | null = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    if (line.startsWith('!')) {
      cur = { name: line.slice(1).trim(), cards: {} };
      lists.push(cur);
      continue;
    }
    const m = /^(\d+)\s+(\d+)/.exec(line);
    if (m && cur) cur.cards[String(Number(m[1]))] = Number(m[2]);
  }
  return lists;
}

async function main() {
  if (process.argv.includes('--fetch')) await fetchUpstream();

  const { cards, source } = readCards();
  const setnames = parseSetnames(readText('strings.conf'));
  const lflist = parseLflist(readText('lflist.conf'));

  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(join(OUT, 'shards'), { recursive: true });

  const json = (v: unknown) => JSON.stringify(v);
  writeFileSync(join(OUT, 'cards.json'), json(cards));
  const shards: CardTuple[][] = Array.from({ length: SHARD_COUNT }, () => []);
  for (const c of cards) shards[c[0] % SHARD_COUNT].push(c);
  shards.forEach((s, i) => writeFileSync(join(OUT, 'shards', `${i}.json`), json(s)));
  writeFileSync(join(OUT, 'setnames.json'), json(setnames));
  writeFileSync(join(OUT, 'lflist.json'), json(lflist));

  const meta = {
    source,
    cardCount: cards.length,
    shardCount: SHARD_COUNT,
    banlists: lflist.length,
    builtAt: new Date().toISOString(),
  };
  writeFileSync(join(OUT, 'meta.json'), json(meta));
  console.log(`卡片数据构建完成：${cards.length} 张（来源：${source}），${setnames.length} 个字段，${lflist.length} 个禁卡表`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
