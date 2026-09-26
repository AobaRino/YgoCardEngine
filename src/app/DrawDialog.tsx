import { useState } from 'react';
import CardImage from '../components/CardImage';
import CardZoom from '../components/CardZoom';
import { shuffle } from '../lib/util';
import Modal from './Modal';
import { lookup, useLimitOf, useStore } from './store';

function deal(main: number[], second: boolean) {
  const pile = shuffle(main);
  const hand = pile.splice(0, second ? 6 : 5);
  return { pile, hand };
}

export default function DrawDialog({ onClose }: { onClose: () => void }) {
  const main = useStore((s) => s.deck.main);
  const setnames = useStore((s) => s.setnames);
  const limitOf = useLimitOf();
  const [second, setSecond] = useState(false);
  const [state, setState] = useState(() => deal(main, false));
  const [zoom, setZoom] = useState<number | null>(null);

  function drawOne() {
    const [next, ...rest] = state.pile;
    if (next !== undefined) setState({ pile: rest, hand: [...state.hand, next] });
  }

  return (
    <Modal title="试抽起手" onClose={onClose} wide>
      <div className="row">
        <label>
          <input
            type="checkbox"
            checked={second}
            onChange={(e) => {
              setSecond(e.target.checked);
              setState(deal(main, e.target.checked));
            }}
          />{' '}
          后攻（6 张）
        </label>
        <button className="btn primary" onClick={() => setState(deal(main, second))} disabled={!main.length}>
          重新洗切
        </button>
        <button className="btn" onClick={drawOne} disabled={!state.pile.length}>
          再抽一张
        </button>
        <span className="muted">卡组剩余 {state.pile.length}</span>
      </div>
      {state.hand.length ? (
        <div className="hand">
          {state.hand.map((id, i) => (
            <button key={i} className="ygo-deck-cell" onClick={() => setZoom(i)}>
              <CardImage id={id} card={lookup(id)} lazy={false} />
            </button>
          ))}
        </div>
      ) : (
        <p className="muted">主卡组是空的。</p>
      )}
      {zoom !== null && (
        <CardZoom ids={state.hand} index={zoom} onIndexChange={setZoom} lookup={lookup} setnames={setnames} limitOf={limitOf} onClose={() => setZoom(null)} />
      )}
    </Modal>
  );
}
