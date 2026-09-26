import { useEffect, useMemo, useRef, useState } from 'react';
import CardImage from '../components/CardImage';
import { ATTRIBUTES, RACES, TYPE, attributeLabel, isLink, isMonster, levelLabel, raceLabel, statLabel, typeLabel } from '../lib/card';
import { defaultQuery, search, type Kind, type SearchQuery, type SortKey } from '../lib/search';
import { DRAG_TYPE, readDrag, writeDrag } from './drag';
import { addCard, removeAt, select, selectBanlist, useLimitOf, useStore } from './store';

const PAGE = 60;

const KINDS: [Kind, string][] = [
  ['all', '全部'],
  ['monster', '怪兽'],
  ['spell', '魔法'],
  ['trap', '陷阱'],
];

const SUBTYPES: Record<Kind, [number, string][]> = {
  all: [],
  monster: [
    [TYPE.NORMAL, '通常'],
    [TYPE.EFFECT, '效果'],
    [TYPE.RITUAL, '仪式'],
    [TYPE.FUSION, '融合'],
    [TYPE.SYNCHRO, '同调'],
    [TYPE.XYZ, '超量'],
    [TYPE.LINK, '连接'],
    [TYPE.PENDULUM, '灵摆'],
    [TYPE.TUNER, '调整'],
    [TYPE.FLIP, '反转'],
    [TYPE.SPIRIT, '灵魂'],
    [TYPE.UNION, '同盟'],
    [TYPE.GEMINI, '二重'],
    [TYPE.TOON, '卡通'],
    [TYPE.SPSUMMON, '特殊召唤'],
  ],
  spell: [
    [TYPE.QUICKPLAY, '速攻'],
    [TYPE.CONTINUOUS, '永续'],
    [TYPE.EQUIP, '装备'],
    [TYPE.FIELD, '场地'],
    [TYPE.RITUAL, '仪式'],
  ],
  trap: [
    [TYPE.CONTINUOUS, '永续'],
    [TYPE.COUNTER, '反击'],
  ],
};

const SORTS: [SortKey, string][] = [
  ['relevance', '相关度'],
  ['id', '卡号'],
  ['name', '名称'],
  ['level', '等级'],
  ['atk', '攻击力'],
  ['def', '守备力'],
];

const numOrNull = (v: string) => (v.trim() === '' ? null : Number(v));

function Range({ label, min, max, step, onMin, onMax }: { label: string; min: number | null; max: number | null; step?: number; onMin: (v: number | null) => void; onMax: (v: number | null) => void }) {
  return (
    <label>
      {label}
      <span className="range">
        <input className="input" type="number" step={step} placeholder="最小" value={min ?? ''} onChange={(e) => onMin(numOrNull(e.target.value))} />
        <input className="input" type="number" step={step} placeholder="最大" value={max ?? ''} onChange={(e) => onMax(numOrNull(e.target.value))} />
      </span>
    </label>
  );
}

export default function SearchPanel() {
  const cards = useStore((s) => s.cards);
  const setnames = useStore((s) => s.setnames);
  const loading = useStore((s) => s.loading);
  const selected = useStore((s) => s.selected);
  const banlist = useStore(selectBanlist);
  const limitOf = useLimitOf();

  const [q, setQ] = useState<SearchQuery>(defaultQuery);
  const [text, setText] = useState('');
  const [setnameInput, setSetnameInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [pageSize, setPageSize] = useState(PAGE);
  const [dropping, setDropping] = useState(false);
  const patch = (p: Partial<SearchQuery>) => {
    setQ((old) => ({ ...old, ...p }));
    setPageSize(PAGE);
  };

  // 输入防抖
  useEffect(() => {
    const t = setTimeout(() => patch({ text }), 150);
    return () => clearTimeout(t);
  }, [text]);

  const { setnameList, setnameByName } = useMemo(() => {
    const byName = new Map<string, number[]>();
    for (const [code, name] of setnames) byName.set(name, [...(byName.get(name) ?? []), code]);
    return { setnameList: [...byName.keys()], setnameByName: byName };
  }, [setnames]);

  useEffect(() => {
    patch({ setcodes: setnameByName.get(setnameInput.trim()) ?? [] });
  }, [setnameInput, setnameByName]);

  const results = useMemo(() => search(cards, q, banlist), [cards, q, banlist]);
  const shown = results.slice(0, pageSize);

  // 滚动到底部时加载更多
  const sentinel = useRef<HTMLLIElement>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setPageSize((n) => (n < results.length ? n + PAGE : n));
    });
    io.observe(el);
    return () => io.disconnect();
  }, [results]);

  function reset() {
    setQ(defaultQuery());
    setText('');
    setSetnameInput('');
    setPageSize(PAGE);
  }

  return (
    <div
      className={dropping ? 'search-panel dropping' : 'search-panel'}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes(DRAG_TYPE)) {
          e.preventDefault();
          setDropping(true);
        }
      }}
      onDragLeave={() => setDropping(false)}
      onDrop={(e) => {
        // 从卡组拖回搜索栏 = 移出卡组
        setDropping(false);
        const d = readDrag(e.nativeEvent);
        if (d && d.from !== 'search') {
          e.preventDefault();
          removeAt(d.from, d.index);
        }
      }}
    >
      <input className="input search" type="search" placeholder="搜索卡名 / 效果 / 卡号，空格分隔多个关键词" value={text} onChange={(e) => setText(e.target.value)} />
      <div className="kinds">
        {KINDS.map(([k, label]) => (
          <button key={k} className={q.kind === k ? 'seg on' : 'seg'} onClick={() => patch({ kind: k, subtype: 0 })}>
            {label}
          </button>
        ))}
        <button className="btn small" onClick={() => setShowFilters(!showFilters)}>
          筛选 {showFilters ? '▴' : '▾'}
        </button>
      </div>

      {showFilters && (
        <div className="filters">
          {SUBTYPES[q.kind].length > 0 && (
            <label>
              类型
              <select className="input" value={q.subtype} onChange={(e) => patch({ subtype: Number(e.target.value) })}>
                <option value={0}>不限</option>
                {SUBTYPES[q.kind].map(([bit, label]) => (
                  <option key={bit} value={bit}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            属性
            <select className="input" value={q.attribute} onChange={(e) => patch({ attribute: Number(e.target.value) })}>
              <option value={0}>不限</option>
              {ATTRIBUTES.map(([bit, label]) => (
                <option key={bit} value={bit}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            种族
            <select className="input" value={q.race} onChange={(e) => patch({ race: Number(e.target.value) })}>
              <option value={0}>不限</option>
              {RACES.map(([bit, label]) => (
                <option key={bit} value={bit}>
                  {label}族
                </option>
              ))}
            </select>
          </label>
          <label>
            字段
            <input className="input" list="ygo-setnames" placeholder="输入系列名" value={setnameInput} onChange={(e) => setSetnameInput(e.target.value)} />
            <datalist id="ygo-setnames">
              {setnameList.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </label>
          <Range label="等级/阶级/连接" min={q.levelMin} max={q.levelMax} onMin={(v) => patch({ levelMin: v })} onMax={(v) => patch({ levelMax: v })} />
          <Range label="攻击力" step={100} min={q.atkMin} max={q.atkMax} onMin={(v) => patch({ atkMin: v })} onMax={(v) => patch({ atkMax: v })} />
          <Range label="守备力" step={100} min={q.defMin} max={q.defMax} onMin={(v) => patch({ defMin: v })} onMax={(v) => patch({ defMax: v })} />
          <label>
            禁限
            <select className="input" value={q.limit} onChange={(e) => patch({ limit: Number(e.target.value) })}>
              <option value={-1}>不限</option>
              <option value={0}>禁止</option>
              <option value={1}>限制</option>
              <option value={2}>准限制</option>
            </select>
          </label>
          <label>
            地区
            <select className="input" value={q.ot} onChange={(e) => patch({ ot: Number(e.target.value) })}>
              <option value={0}>不限</option>
              <option value={1}>OCG</option>
              <option value={2}>TCG</option>
              <option value={8}>简中</option>
            </select>
          </label>
          <label>
            排序
            <select className="input" value={q.sort} onChange={(e) => patch({ sort: e.target.value as SortKey })}>
              {SORTS.map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="check">
            <input type="checkbox" checked={q.altArt} onChange={(e) => patch({ altArt: e.target.checked })} /> 显示异画卡
          </label>
          <button className="btn small" onClick={reset}>
            重置条件
          </button>
        </div>
      )}

      <div className="count muted">
        {loading ? '加载卡片数据…' : `共 ${results.length} 张`}
        <span className="hint">单击查看 · 双击或 + 加入卡组 · 可拖动</span>
      </div>

      <ul className="results">
        {shown.map((card) => (
          <li key={card.id} className={selected === card.id ? 'selected' : undefined} draggable onDragStart={(e) => writeDrag(e.nativeEvent, { from: 'search', index: -1, id: card.id })}>
            <button className="row" onClick={() => select(card.id)} onDoubleClick={() => addCard(card.id)}>
              <span className="thumb">
                <CardImage id={card.id} card={card} limit={limitOf(card)} />
              </span>
              <span className="info">
                <span className="name">{card.name}</span>
                <span className="line">
                  {typeLabel(card)}
                  {isMonster(card) && ` · ${attributeLabel(card)} · ${raceLabel(card)}`}
                </span>
                {isMonster(card) && (
                  <span className="line">
                    {levelLabel(card)} · {statLabel(card.atk)}
                    {isLink(card) ? '' : ` / ${statLabel(card.def)}`}
                  </span>
                )}
              </span>
            </button>
            <span className="add">
              <button className="btn small" title="加入主卡组 / 额外卡组" onClick={() => addCard(card.id)}>
                +
              </button>
              <button className="btn small" title="加入副卡组" onClick={() => addCard(card.id, 'side')}>
                副
              </button>
            </span>
          </li>
        ))}
        <li className="sentinel" ref={sentinel} />
      </ul>
    </div>
  );
}
