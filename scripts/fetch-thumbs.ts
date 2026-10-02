/**
 * 下载卡图并压缩成导出图片用的缩略图，随网站一起发布到 thumbs/{id}.jpg。
 *
 * 公共图床不允许跨域读取图片，导出图片时没法把它们画进 canvas；
 * 和网站同源的缩略图则没有这个限制。
 *
 * 用法：node scripts/fetch-thumbs.ts            （需先运行 npm run data）
 * 环境变量：
 *   THUMB_SOURCES  逗号分隔的图床地址模板，{id} 为卡号（默认 momobako，失败再用 ygoprodeck）
 *   THUMB_LIMIT    本次最多下载多少张（调试用）
 *
 * 已下载的图保存在 data/thumbs/（CI 用 actions/cache 缓存），之后只下载新卡。
 * 下载失败的卡记在 data/thumbs/missing.json，7 天内不再重试。
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'data', 'thumbs');
const MISSING_FILE = join(OUT, 'missing.json');

// 与 src/lib/deckImage.ts 的卡片尺寸一致（96×140，按 2 倍清晰度）
const WIDTH = 192;
const HEIGHT = 280;
const CONCURRENCY = 8;
const RETRY_AFTER_DAYS = 7;

const SOURCES = (process.env.THUMB_SOURCES ?? 'https://cdn.233.momobako.com/ygopro/pics/{id}.jpg,https://images.ygoprodeck.com/images/cards/{id}.jpg')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const LIMIT = Number(process.env.THUMB_LIMIT ?? Infinity);
const USER_AGENT = 'ygo-deck thumbnail builder (+https://github.com/AobaRino/ygo-deck)';

async function download(id: number): Promise<Buffer | null> {
  for (const tpl of SOURCES) {
    try {
      const res = await fetch(tpl.replace('{id}', String(id)), {
        headers: { 'user-agent': USER_AGENT },
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) continue;
      return Buffer.from(await res.arrayBuffer());
    } catch {
      /* 换下一个图床 */
    }
  }
  return null;
}

async function main() {
  const cardsFile = join(ROOT, 'public', 'data', 'cards.json');
  if (!existsSync(cardsFile)) throw new Error('找不到 public/data/cards.json，请先运行 npm run data');
  const ids: number[] = (JSON.parse(readFileSync(cardsFile, 'utf8')) as [number][]).map((c) => c[0]);

  mkdirSync(OUT, { recursive: true });
  const missing: Record<string, number> = existsSync(MISSING_FILE) ? JSON.parse(readFileSync(MISSING_FILE, 'utf8')) : {};
  const retryBefore = Date.now() - RETRY_AFTER_DAYS * 86400_000;

  const lacking = ids.filter((id) => !existsSync(join(OUT, `${id}.jpg`)));
  const todo = lacking.filter((id) => !(missing[id] > retryBefore)).slice(0, LIMIT);
  console.log(`共 ${ids.length} 张卡，已有缩略图 ${ids.length - lacking.length} 张，本次下载 ${todo.length} 张`);

  // 只要有下载任务就让 CI 保存缓存（即使中途超时，已下载的也能留到下次）
  if (todo.length && process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, 'changed=true\n');

  let done = 0;
  let saved = 0;
  let next = 0;
  const started = Date.now();
  const worker = async () => {
    while (next < todo.length) {
      const id = todo[next++];
      const raw = await download(id);
      if (raw) {
        try {
          const jpg = await sharp(raw).resize(WIDTH, HEIGHT, { fit: 'cover', position: 'top' }).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
          writeFileSync(join(OUT, `${id}.jpg`), jpg);
          delete missing[id];
          saved++;
        } catch {
          missing[id] = Date.now();
        }
      } else {
        missing[id] = Date.now();
      }
      if (++done % 500 === 0) console.log(`  ${done}/${todo.length}（${((Date.now() - started) / 1000).toFixed(0)} 秒）`);
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  writeFileSync(MISSING_FILE, JSON.stringify(missing));
  console.log(`完成：新增 ${saved} 张，缺图 ${Object.keys(missing).length} 张`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
