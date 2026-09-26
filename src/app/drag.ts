/** 拖放数据：从搜索结果拖入卡组，或在卡组区域之间移动 */
import type { Zone } from '../lib/deck';

export const DRAG_TYPE = 'application/x-ygo-card';

export interface DragData {
  from: Zone | 'search';
  /** 在来源区域中的位置；来自搜索结果时为 -1 */
  index: number;
  id: number;
}

export function writeDrag(e: DragEvent, data: DragData) {
  if (!e.dataTransfer) return;
  e.dataTransfer.setData(DRAG_TYPE, JSON.stringify(data));
  e.dataTransfer.setData('text/plain', String(data.id));
  e.dataTransfer.effectAllowed = data.from === 'search' ? 'copy' : 'move';
}

export function readDrag(e: DragEvent): DragData | null {
  try {
    const raw = e.dataTransfer?.getData(DRAG_TYPE);
    return raw ? (JSON.parse(raw) as DragData) : null;
  } catch {
    return null;
  }
}
