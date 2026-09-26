import { describe, expect, it } from 'vitest';
import { fromTuple, TYPE, type CardTuple } from './card';
import { defaultQuery, matchSetcode, normalize, search } from './search';

const rows: CardTuple[] = [
  [14558127, '灰流丽', '①：这个效果在对方回合也能发动。', 11, 0, [0x33], TYPE.MONSTER | TYPE.EFFECT | TYPE.TUNER, 0, 1800, 3, 0x10, 0x04],
  [89631139, '青眼白龙', '以高攻击力著称的传说之龙。', 11, 0, [0xdd], TYPE.MONSTER | TYPE.NORMAL, 3000, 2500, 8, 0x2000, 0x10],
  [89631140, '青眼白龙', '以高攻击力著称的传说之龙。', 11, 89631139, [0xdd], TYPE.MONSTER | TYPE.NORMAL, 3000, 2500, 8, 0x2000, 0x10],
  [83764718, '死者苏生', '以自己或者对方的墓地1只怪兽为对象才能发动。', 11, 0, [], TYPE.SPELL, 0, 0, 0, 0, 0],
  [55101, '真青眼', '', 11, 0, [0x10dd], TYPE.MONSTER | TYPE.EFFECT, 0, 0, 4, 0x2000, 0x10],
];
const cards = rows.map(fromTuple);

describe('search', () => {
  it('matches name and hides alt arts by default', () => {
    const r = search(cards, { ...defaultQuery(), text: '青眼' });
    expect(r.map((c) => c.id)).toEqual([89631139, 55101]);
  });

  it('ranks name matches above text matches', () => {
    const r = search(cards, { ...defaultQuery(), text: '龙' });
    expect(r[0].id).toBe(89631139);
  });

  it('filters by kind and stats', () => {
    expect(search(cards, { ...defaultQuery(), kind: 'spell' }).map((c) => c.id)).toEqual([83764718]);
    expect(search(cards, { ...defaultQuery(), atkMin: 2000 }).map((c) => c.id)).toEqual([89631139]);
    expect(search(cards, { ...defaultQuery(), subtype: TYPE.TUNER }).map((c) => c.id)).toEqual([14558127]);
  });

  it('finds by id', () => {
    expect(search(cards, { ...defaultQuery(), text: '83764718' })[0].id).toBe(83764718);
  });

  it('applies banlist status filter', () => {
    const r = search(cards, { ...defaultQuery(), limit: 1 }, { name: 'x', cards: { 83764718: 1 } });
    expect(r.map((c) => c.id)).toEqual([83764718]);
  });
});

describe('matchSetcode', () => {
  it('follows ygopro sub-archetype rules', () => {
    const [, blueEyes, , , trueBlueEyes] = cards;
    expect(matchSetcode(blueEyes, 0xdd)).toBe(true);
    expect(matchSetcode(trueBlueEyes, 0xdd)).toBe(true);
    expect(matchSetcode(blueEyes, 0x10dd)).toBe(false);
  });
});

describe('normalize', () => {
  it('folds width, case and separators', () => {
    expect(normalize('ＡＢＣ・d-e　f')).toBe('abcdef');
  });
});
