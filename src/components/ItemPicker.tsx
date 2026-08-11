import { useMemo, useState } from 'react';
import type { Act, EquipSlot, MagicItem, Rarity } from '../model/types';
import { ITEMS } from '../model/itemIndex';
import EffectText from './EffectText';

const ACTS: (Act | 'All Acts')[] = ['All Acts', 'Act 1', 'Act 2', 'Act 3'];

const RARITY_ORDER: Record<Rarity, number> = {
  Legendary: 0, 'Very Rare': 1, Rare: 2, Uncommon: 3, Common: 4, Story: 5,
};
const RARITIES: (Rarity | 'All')[] = [
  'All', 'Legendary', 'Very Rare', 'Rare', 'Uncommon', 'Common',
];
const MAX_RESULTS = 120;

export default function ItemPicker({
  accepts, label, onPick, onClose,
}: {
  accepts: EquipSlot;
  label: string;
  onPick: (itemId: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [rarity, setRarity] = useState<Rarity | 'All'>('All');
  const [act, setAct] = useState<Act | 'All Acts'>('All Acts');

  const pool = useMemo(
    () => ITEMS.filter((i) => i.slot === accepts),
    [accepts],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pool
      .filter((i) => rarity === 'All' || i.rarity === rarity)
      .filter((i) => act === 'All Acts' || i.source.act === act)
      .filter((i) => {
        if (!q) return true;
        return (
          i.name.toLowerCase().includes(q) ||
          i.effectsText.some((e) => e.toLowerCase().includes(q)) ||
          i.source.where.toLowerCase().includes(q)
        );
      })
      .sort((a, b) =>
        RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity] ||
        a.name.localeCompare(b.name),
      );
  }, [pool, query, rarity, act]);

  const shown = results.slice(0, MAX_RESULTS);

  return (
    <div className="picker">
      <div className="picker-head">
        <h3>Choose {label} <span className="count">{results.length} items</span></h3>
        <button className="link-btn" onClick={onClose}>close</button>
      </div>

      <div className="picker-controls">
        <input
          className="picker-search"
          autoFocus
          placeholder="Search name, effect, or location…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={act} onChange={(e) => setAct(e.target.value as Act | 'All Acts')}>
          {ACTS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={rarity} onChange={(e) => setRarity(e.target.value as Rarity | 'All')}>
          {RARITIES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className="picker-list">
        {shown.map((item) => (
          <ItemRow key={item.id} item={item} onPick={() => onPick(item.id)} />
        ))}
        {results.length > MAX_RESULTS && (
          <p className="muted picker-more">
            Showing {MAX_RESULTS} of {results.length}. Refine your search to narrow.
          </p>
        )}
        {results.length === 0 && <p className="muted">No matching items.</p>}
      </div>
    </div>
  );
}

function ItemRow({ item, onPick }: { item: MagicItem; onPick: () => void }) {
  return (
    <div
      className="item-row"
      role="button"
      tabIndex={0}
      onClick={onPick}
      onKeyDown={(e) => { if (e.key === 'Enter') onPick(); }}
    >
      <div className="item-row-head">
        <span className="item-name">{item.name}</span>
        <span className="item-row-badges">
          {item.source.act && <span className="act-chip">{item.source.act}</span>}
          <span className={`rarity rarity-${item.rarity.replace(/\s/g, '').toLowerCase()}`}>
            {item.rarity}
          </span>
        </span>
      </div>
      {item.effectsText.length > 0 && (
        <div className="item-effects">
          {item.effectsText.slice(0, 3).map((line, i) => (
            <span key={i}>
              {i > 0 && ' • '}
              <EffectText text={line} item={item} />
            </span>
          ))}
        </div>
      )}
      {item.source.where && (
        <div className="item-source">
          {item.source.where}
          {item.source.location ? ` — ${item.source.location}` : ''}
        </div>
      )}
    </div>
  );
}
