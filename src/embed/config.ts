import { setDataBase } from '../lib/data';
import { setImageSources } from '../lib/images';

/** 脚本所在目录即站点根目录：数据与组卡器都相对于它 */
export const BUILDER_URL = new URL(/* @vite-ignore */ '.', import.meta.url).href;

setDataBase(new URL('data/', BUILDER_URL).href);

/** 页面可以在加载脚本前设置 window.YGO_DECK_IMAGE_SOURCES 覆盖卡图地址 */
const custom = (globalThis as { YGO_DECK_IMAGE_SOURCES?: string[] }).YGO_DECK_IMAGE_SOURCES;
if (Array.isArray(custom)) setImageSources(custom);
