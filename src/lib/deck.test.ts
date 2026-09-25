import { describe, expect, it } from 'vitest';
import { fromTuple, type Card, type CardTuple } from './card';
import { deckFromParams, deckToParams, parseAny, parseYdk, parseYdke, toYdk, toYdke, validateDeck, type Deck } from './deck';

const deck: Deck = { name: '测试', main: [14558127, 14558127, 89631139, 5000000], extra: [10000], side: [44330098] };

describe('ydke', () => {
  it('round-trips', () => {
    const code = toYdke(deck);
    expect(code.startsWith('ydke://')).toBe(true);
    expect(parseYdke(code, '测试')).toEqual(deck);
  });

  it('decodes a known code', () => {
    // 1 张 89631139（青眼白龙）
    expect(parseYdke('ydke://o6lXBQ==!!!').main).toEqual([89631139]);
  });
});

describe('ydk', () => {
  it('round-trips', () => {
    expect(parseYdk(toYdk(deck), '测试')).toEqual(deck);
  });

  it('handles CRLF, comments and leading zeros', () => {
    const d = parseYdk('#created by someone\r\n#main\r\n08903700\r\n#extra\r\n!side\r\n00001\r\n');
    expect(d.main).toEqual([8903700]);
    expect(d.side).toEqual([1]);
  });
});

describe('share params', () => {
  it('round-trips through URLSearchParams', () => {
    const p = new URLSearchParams(deckToParams(deck).toString());
    expect(deckFromParams(p)).toEqual(deck);
  });

  it('parseAny recognises every format', () => {
    const url = `https://example.com/#/view?${deckToParams(deck)}`;
    expect(parseAny(url)?.main).toEqual(deck.main);
    expect(parseAny(`分享给你：${toYdke(deck)} 好用`)?.extra).toEqual(deck.extra);
    expect(parseAny(toYdk(deck))?.side).toEqual(deck.side);
    expect(parseAny('随便写点什么')).toBeNull();
  });
});

describe('validateDeck', () => {
  const t = (id: number, type: number, alias = 0): CardTuple => [id, `卡${id}`, '', 3, alias, [], type, 0, 0, 4, 1, 1];
  const cards = new Map<number, Card>(
    [t(1, 0x21), t(2, 0x21 | 0x40), t(3, 0x2), t(4, 0x21, 1)].map((r) => [r[0], fromTuple(r)]),
  );
  const lookup = (id: number) => cards.get(id);

  it('counts alt arts as the same card', () => {
    const issues = validateDeck({ name: '', main: [1, 1, 4, 4], extra: [], side: [] }, lookup);
    expect(issues.some((i) => i.level === 'error' && i.message.includes('4 张'))).toBe(true);
  });

  it('applies banlist', () => {
    const issues = validateDeck({ name: '', main: [3], extra: [], side: [] }, lookup, { name: 'x', cards: { 3: 0 } });
    expect(issues.some((i) => i.message.includes('禁止卡'))).toBe(true);
  });

  it('rejects extra deck monsters in main deck', () => {
    const issues = validateDeck({ name: '', main: [2], extra: [1], side: [] }, lookup);
    expect(issues.filter((i) => i.level === 'error')).toHaveLength(2);
  });
});
