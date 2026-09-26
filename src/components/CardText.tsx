import {
  LINK_MARKERS,
  attributeLabel,
  isLink,
  isMonster,
  isPendulum,
  levelLabel,
  otLabel,
  raceLabel,
  statLabel,
  typeLabel,
  type Card,
} from '../lib/card';

interface Props {
  card: Card;
  setnames?: Map<number, string>;
  /** 当前禁卡表中的数量限制 */
  limit?: number;
}

const LIMIT_TEXT: Record<number, string> = { 0: '禁止', 1: '限制', 2: '准限制' };

export default function CardText({ card, setnames, limit }: Props) {
  const archetypes = setnames ? card.setcodes.map((c) => setnames.get(c)).filter((n): n is string => !!n) : [];
  const limitText = limit !== undefined ? LIMIT_TEXT[limit] : '';

  return (
    <div className="ygo-text">
      <h3>{card.name}</h3>
      <div className="ygo-text-tags">
        <span>{typeLabel(card)}</span>
        {isMonster(card) && (
          <>
            <span>{attributeLabel(card)}</span>
            <span>{raceLabel(card)}族</span>
            <span>{levelLabel(card)}</span>
          </>
        )}
        {limitText && <span className="ygo-banned">{limitText}</span>}
      </div>
      {isMonster(card) && (
        <div className="ygo-text-stats">
          <span>ATK {statLabel(card.atk)}</span>
          {isLink(card) ? (
            <span className="ygo-markers" aria-label="连接箭头">
              {LINK_MARKERS.map((m, i) => (
                <i key={i} className={m === 0 ? 'center' : card.def & m ? 'on' : undefined} />
              ))}
            </span>
          ) : (
            <span>DEF {statLabel(card.def)}</span>
          )}
          {isPendulum(card) && (
            <span>
              刻度 {card.lscale}/{card.rscale}
            </span>
          )}
        </div>
      )}
      <p className="ygo-text-desc">{card.desc}</p>
      <div className="ygo-text-meta">
        <span>卡号 {card.id}</span>
        {card.alias !== 0 && <span>同名 {card.alias}</span>}
        <span>{otLabel(card.ot)}</span>
        {archetypes.length > 0 && <span>字段：{archetypes.join('、')}</span>}
      </div>
    </div>
  );
}
