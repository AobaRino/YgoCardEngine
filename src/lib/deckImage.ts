/**
 * 把卡组画成一张分享图片（canvas），带扫码打开卡组的二维码。
 *
 * 卡图需要图床返回 CORS 头才能画进 canvas 并导出；拿不到时退化为文字卡面，
 * 保证总能生成图片。
 */
import { encode } from 'uqr';
import { frameKind, isLink, isMonster, isSpell, isTrap, statLabel, type Card } from './card';
import type { Banlist } from './data';
import { ZONES, ZONE_LABELS, copyLimit, type Deck } from './deck';
import { imageUrls } from './images';

export interface DeckImageOptions {
  lookup: (id: number) => Card | undefined;
  banlist?: Banlist | null;
  /** 二维码指向的地址；不传则不画二维码 */
  url?: string;
  /** 页脚显示的站点名 */
  siteLabel?: string;
  /** 卡图加载进度 */
  onProgress?: (loaded: number, total: number) => void;
  scale?: number;
}

const FRAME_COLORS: Record<string, string> = {
  normal: '#d9b36b',
  effect: '#c9793b',
  ritual: '#6c8fd0',
  fusion: '#9860b8',
  synchro: '#d8d8d8',
  xyz: '#2b2b2b',
  link: '#2f6fb5',
  token: '#9a9a9a',
  spell: '#1d9a8a',
  trap: '#b8457e',
};

const FONT = `"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", "Source Han Sans SC", system-ui, sans-serif`;

// 版式（CSS 像素，实际按 scale 放大）
const PAD = 32;
const COLS = 10;
const CW = 96;
const CH = Math.round((CW * 86) / 59);
const GAP = 6;
const GRID_W = COLS * CW + (COLS - 1) * GAP;
const WIDTH = PAD * 2 + GRID_W;
const HEADER_H = 92;
const LABEL_H = 30;
const SECTION_GAP = 18;
const QR_SIZE = 190;
const FOOTER_H = QR_SIZE + 40;

// ---------------------------------------------------------------- 卡图加载

function loadImage(url: string, timeout = 10000): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    const timer = setTimeout(() => {
      img.src = '';
      resolve(null);
    }, timeout);
    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };
    img.src = url;
  });
}

/**
 * 依次尝试各个图床。页面上的 <img> 是不带 CORS 请求的，浏览器缓存的响应可能缺少 CORS 头，
 * 所以失败后再带一个查询参数绕开缓存重试一次。
 */
async function loadCardImage(id: number): Promise<HTMLImageElement | null> {
  for (const url of imageUrls(id)) {
    const img = (await loadImage(url)) ?? (await loadImage(url + (url.includes('?') ? '&' : '?') + 'cors=1'));
    if (img) return img;
  }
  return null;
}

async function loadAll(ids: number[], onProgress?: (n: number, total: number) => void) {
  const unique = [...new Set(ids)];
  const result = new Map<number, HTMLImageElement | null>();
  let done = 0;
  let next = 0;
  onProgress?.(0, unique.length);
  const worker = async () => {
    while (next < unique.length) {
      const id = unique[next++];
      result.set(id, await loadCardImage(id));
      onProgress?.(++done, unique.length);
    }
  };
  await Promise.all(Array.from({ length: Math.min(8, unique.length) }, worker));
  return result;
}

// ---------------------------------------------------------------- 绘制

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** 按宽度折行，超出行数时末尾加省略号 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const ch of text) {
    if (ctx.measureText(line + ch).width > maxWidth && line) {
      lines.push(line);
      line = ch;
      if (lines.length === maxLines) break;
    } else {
      line += ch;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  if (lines.length === maxLines && lines.join('').length < [...text].length) {
    let last = lines[maxLines - 1];
    while (last && ctx.measureText(last + '…').width > maxWidth) last = last.slice(0, -1);
    lines[maxLines - 1] = last + '…';
  }
  return lines;
}

/** indent：左上角有禁限角标时，卡名第一行让出位置 */
function drawTextFace(ctx: CanvasRenderingContext2D, card: Card | undefined, id: number, x: number, y: number, indent: number) {
  const frame = card ? frameKind(card) : 'effect';
  ctx.fillStyle = FRAME_COLORS[frame];
  ctx.fillRect(x, y, CW, CH);
  const p = 6;
  // 卡名
  ctx.font = `600 12px ${FONT}`;
  const lines = wrapText(ctx, card?.name ?? String(id), CW - p * 2 - 6, 3);
  if (indent) {
    const name = card?.name ?? String(id);
    const first = wrapText(ctx, name, CW - p * 2 - 6 - indent, 1)[0].replace(/…$/, '');
    lines.splice(0, lines.length, first, ...wrapText(ctx, name.slice(first.length), CW - p * 2 - 6, 2));
  }
  const nameH = lines.length * 15 + 6;
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillRect(x + p, y + p, CW - p * 2, nameH);
  ctx.fillStyle = '#111';
  ctx.textBaseline = 'top';
  lines.forEach((l, i) => ctx.fillText(l, x + p + 3 + (i === 0 ? indent : 0), y + p + 4 + i * 15));
  // 卡图区域
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(x + p, y + p + nameH + 4, CW - p * 2, CH - nameH - p * 2 - 26);
  // 攻守
  if (card && isMonster(card)) {
    ctx.font = `700 11px ${FONT}`;
    ctx.fillStyle = frame === 'xyz' ? '#eee' : '#111';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'alphabetic';
    const stats = statLabel(card.atk) + (isLink(card) ? ` / L${card.level}` : ` / ${statLabel(card.def)}`);
    ctx.fillText(stats, x + CW - p, y + CH - p - 2);
    ctx.textAlign = 'left';
  }
}

function drawLimit(ctx: CanvasRenderingContext2D, limit: number, x: number, y: number) {
  const r = 11;
  const cx = x + r + 4;
  const cy = y + r + 4;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = limit === 0 ? '#d92d20' : limit === 1 ? '#e8590c' : '#e8a200';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#fff';
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = `700 13px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(limit), cx, cy + 1);
  ctx.textAlign = 'left';
}

function drawCard(
  ctx: CanvasRenderingContext2D,
  id: number,
  x: number,
  y: number,
  images: Map<number, HTMLImageElement | null>,
  opts: DeckImageOptions,
) {
  const card = opts.lookup(id);
  const limit = card ? copyLimit(card, opts.banlist) : 3;
  ctx.save();
  roundRect(ctx, x, y, CW, CH, 5);
  ctx.clip();
  const img = images.get(id);
  if (img) ctx.drawImage(img, x, y, CW, CH);
  else drawTextFace(ctx, card, id, x, y, limit < 3 ? 22 : 0);
  ctx.restore();
  ctx.save();
  roundRect(ctx, x + 0.5, y + 0.5, CW - 1, CH - 1, 5);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
  if (limit < 3) drawLimit(ctx, limit, x, y);
}

/** 区域内的卡片位置：主卡组每行 10 张；额外/副卡组超过 10 张时压成一行（与 YGOPro 一致） */
function layoutZone(count: number, compressRow: boolean): { pos: [number, number][]; height: number } {
  if (!count) return { pos: [], height: 0 };
  if (compressRow) {
    const step = count > COLS ? (GRID_W - CW) / (count - 1) : CW + GAP;
    return { pos: Array.from({ length: count }, (_, i) => [i * step, 0]), height: CH };
  }
  const rows = Math.ceil(count / COLS);
  return {
    pos: Array.from({ length: count }, (_, i) => [(i % COLS) * (CW + GAP), Math.floor(i / COLS) * (CH + GAP)]),
    height: rows * CH + (rows - 1) * GAP,
  };
}

function drawQr(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number) {
  // 图片在屏幕上扫，几乎不会污损，用最低纠错等级换更少、更大的模块
  const qr = encode(text, { ecc: 'L', border: 2 });
  const cell = size / qr.size;
  ctx.fillStyle = '#fff';
  roundRect(ctx, x - 6, y - 6, size + 12, size + 12, 8);
  ctx.fill();
  ctx.fillStyle = '#000';
  qr.data.forEach((row, r) =>
    row.forEach((dark, c) => {
      // 稍微多画一点，避免相邻模块之间出现缝隙
      if (dark) ctx.fillRect(x + c * cell, y + r * cell, cell + 0.3, cell + 0.3);
    }),
  );
}

export interface DeckImageResult {
  canvas: HTMLCanvasElement;
  /** 没能画出卡图（用文字卡面代替）的卡片种类数 */
  missingImages: number;
}

export async function renderDeckImage(deck: Deck, opts: DeckImageOptions): Promise<DeckImageResult> {
  const scale = opts.scale ?? 2;
  const images = await loadAll([...deck.main, ...deck.extra, ...deck.side], opts.onProgress);

  const zones = ZONES.filter((z) => deck[z].length).map((z) => ({ zone: z, ...layoutZone(deck[z].length, z !== 'main') }));
  const bodyH = zones.reduce((h, z) => h + LABEL_H + z.height + SECTION_GAP, 0);
  const height = PAD + HEADER_H + bodyH + FOOTER_H + PAD / 2;

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);

  // 背景
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, '#171a23');
  bg.addColorStop(1, '#232838');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, WIDTH, height);

  // 标题
  let y = PAD;
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#f2f4f8';
  ctx.font = `700 32px ${FONT}`;
  ctx.fillText(wrapText(ctx, deck.name || '未命名卡组', GRID_W, 1)[0], PAD, y);

  const stats = { m: 0, s: 0, t: 0 };
  for (const id of deck.main) {
    const c = opts.lookup(id);
    if (!c) continue;
    if (isMonster(c)) stats.m++;
    else if (isSpell(c)) stats.s++;
    else if (isTrap(c)) stats.t++;
  }
  const sub = [
    `主卡组 ${deck.main.length} · 额外 ${deck.extra.length} · 副卡组 ${deck.side.length}`,
    `怪兽 ${stats.m} / 魔法 ${stats.s} / 陷阱 ${stats.t}`,
    opts.banlist ? `禁卡表 ${opts.banlist.name}` : '',
  ].filter(Boolean);
  ctx.fillStyle = '#a3acbd';
  ctx.font = `400 16px ${FONT}`;
  ctx.fillText(sub.join('　｜　'), PAD, y + 46);
  y += HEADER_H;

  // 各区域
  for (const z of zones) {
    ctx.fillStyle = '#dfe3ea';
    ctx.font = `600 17px ${FONT}`;
    ctx.textBaseline = 'top';
    ctx.fillText(`${ZONE_LABELS[z.zone]}  ${deck[z.zone].length}`, PAD, y + 4);
    y += LABEL_H;
    deck[z.zone].forEach((id, i) => drawCard(ctx, id, PAD + z.pos[i][0], y + z.pos[i][1], images, opts));
    y += z.height + SECTION_GAP;
  }

  // 页脚：二维码 + 说明
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(PAD, y, GRID_W, 1);
  const fy = y + 22;
  if (opts.url) drawQr(ctx, opts.url, WIDTH - PAD - QR_SIZE - 6, fy + 6, QR_SIZE);
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#f2f4f8';
  ctx.font = `600 20px ${FONT}`;
  ctx.fillText(opts.url ? '扫码查看完整卡组，可直接导入' : '游戏王卡组', PAD, fy + 30);
  ctx.fillStyle = '#a3acbd';
  ctx.font = `400 15px ${FONT}`;
  if (opts.siteLabel) ctx.fillText(opts.siteLabel, PAD, fy + 66);
  ctx.fillText(new Date().toLocaleDateString('zh-CN'), PAD, fy + 92);

  return { canvas, missingImages: [...images.values()].filter((i) => !i).length };
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: 'image/png' | 'image/jpeg', quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('图片生成失败'))), type, quality),
  );
}
