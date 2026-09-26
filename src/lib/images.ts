/**
 * 卡图地址。图片体积太大，不放进仓库，运行时从公共图床加载；
 * 按顺序尝试，全部失败时组件会退化为文字卡面。
 *
 * 构建时可用环境变量 VITE_CARD_IMAGES 覆盖（逗号分隔，{id} 为卡片 id），
 * 嵌入组件也可通过 image-sources 属性覆盖。
 */
const DEFAULT_SOURCES = [
  'https://cdn.233.momobako.com/ygopro/pics/{id}.jpg',
  'https://images.ygoprodeck.com/images/cards/{id}.jpg',
];

function fromEnv(): string[] | null {
  const v = import.meta.env?.VITE_CARD_IMAGES as string | undefined;
  return v ? v.split(',').map((s) => s.trim()).filter(Boolean) : null;
}

let sources: string[] = fromEnv() ?? DEFAULT_SOURCES;

export function setImageSources(list: string[]) {
  if (list.length) sources = list;
}

export function imageUrls(id: number): string[] {
  return sources.map((s) => s.replace('{id}', String(id)));
}

/** 记住加载失败的地址，避免同一张卡反复请求失败的图床 */
const failed = new Set<string>();
export const markFailed = (url: string) => failed.add(url);
export const firstImage = (id: number, skip = 0): string | null =>
  imageUrls(id).filter((u) => !failed.has(u))[skip] ?? null;
