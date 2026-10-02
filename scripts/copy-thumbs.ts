/** 构建后把 data/thumbs 里的缩略图复制到 dist/thumbs（没有缩略图时跳过，导出图片会退回图床 / 文字卡面） */
import { cpSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'data', 'thumbs');
const DEST = join(ROOT, 'dist', 'thumbs');

if (existsSync(SRC)) {
  cpSync(SRC, DEST, { recursive: true, filter: (p) => !p.endsWith('missing.json') });
  console.log(`已复制缩略图 ${readdirSync(DEST).length} 张到 dist/thumbs`);
} else {
  console.log('没有 data/thumbs，跳过缩略图（可运行 npm run thumbs 生成）');
}
