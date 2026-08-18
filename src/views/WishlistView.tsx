import { useMemo, useState } from 'react';
import type { MagicItem } from '../model/types';
import { usePartyStore } from '../store/partyStore';
import { ITEMS, getItem } from '../model/itemIndex';
import { GEAR_SLOTS } from '../data/gearSlots';
import EffectText from '../components/EffectText';

const ACT_GROUPS = ['Act 1', 'Act 2', 'Act 3', 'No location data'] as const;

interface Row {
  item: MagicItem;
  wishlisted: boolean;
  equippedBy: string[];
}

export default function WishlistView() {
  const party = usePartyStore((s) => s.party);
  const toggleWishlist = usePartyStore((s) => s.toggleWishlist);
  const [includeEquipped, setIncludeEquipped] = useState(true);
  const [query, setQuery] = useState('');

  const wishlist = party.wishlist ?? [];

  // itemId -> member names who have it equipped.
  const equippedBy = useMemo(() => {
    const map = new Map<string, string[]>();
    party.members.forEach((m, i) => {
      if (!m) return;
      const who = m.name || `Slot ${i + 1}`;
      for (const def of GEAR_SLOTS) {
        const id = m.equipment[def.slot];
        if (!id) continue;
        const list = map.get(id) ?? [];
        if (!list.includes(who)) list.push(who);
        map.set(id, list);
      }
    });
    return map;
  }, [party.members]);

  const rows: Row[] = useMemo(() => {
    const ids = new Set(wishlist);
    if (includeEquipped) for (const id of equippedBy.keys()) ids.add(id);
    return [...ids]
      .map((id) => getItem(id))
      .filter((i): i is MagicItem => !!i)
      .map((item) => ({
        item,
        wishlisted: wishlist.includes(item.id),
        equippedBy: equippedBy.get(item.id) ?? [],
      }));
  }, [wishlist, equippedBy, includeEquipped]);

  // Quick-add search across the full database.
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return ITEMS.filter(
      (i) => i.name.toLowerCase().includes(q) && !wishlist.includes(i.id),
    ).slice(0, 8);
  }, [query, wishlist]);

  return (
    <div className="view">
      <section className="panel">
        <h3>
          Item Plan
          <span className="count">
            {wishlist.length} wishlisted · grouped by act with pickup locations
          </span>
        </h3>

        <div className="wishlist-controls">
          <label className="wishlist-toggle">
            <input
              type="checkbox"
              checked={includeEquipped}
              onChange={(e) => setIncludeEquipped(e.target.checked)}
            />
            Include gear equipped on builds (full pickup route)
          </label>
          <div className="wishlist-add">
            <input
              className="picker-search"
              placeholder="Quick-add an item to the wishlist…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div className="wishlist-add-results">
                {searchResults.map((i) => (
                  <button
                    key={i.id}
                    className="chooser-option"
                    onClick={() => { toggleWishlist(i.id); setQuery(''); }}
                  >
                    {i.name}
                    <span className="chooser-sub">{i.itemType}{i.source.act ? ` · ${i.source.act}` : ''}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {rows.length === 0 && (
          <p className="muted">
            Nothing planned yet. Star items (☆) in the Gear picker or quick-add
            them above to build the party's pickup list.
          </p>
        )}

        {ACT_GROUPS.map((act) => {
          const group = rows
            .filter((r) => (r.item.source.act ?? 'No location data') === act)
            .sort((a, b) => a.item.name.localeCompare(b.item.name));
          if (group.length === 0) return null;
          return (
            <div key={act} className="wishlist-act">
              <h4 className="buff-act-head">{act} <span className="count">{group.length} items</span></h4>
              {group.map(({ item, wishlisted, equippedBy: holders }) => (
                <div key={item.id} className="wishlist-row">
                  <div className="wishlist-row-head">
                    <span className={`dot rarity-${item.rarity.replace(/\s/g, '').toLowerCase()}`} />
                    <span className="item-name">{item.name}</span>
                    <span className="wishlist-type">{item.itemType}</span>
                    {holders.length > 0 && (
                      <span className="wishlist-holder">→ {holders.join(', ')}</span>
                    )}
                    {wishlisted ? (
                      <button
                        className="link-btn"
                        title="Remove from wishlist"
                        onClick={() => toggleWishlist(item.id)}
                      >
                        ✕
                      </button>
                    ) : (
                      <span className="wishlist-type" title="Listed because it's equipped on a build">equipped</span>
                    )}
                  </div>
                  {item.effectsText.length > 0 && (
                    <div className="wishlist-effects">
                      <EffectText
                        text={item.effectsText.slice(0, 2).join(' • ')}
                        terms={item.terms ?? []}
                      />
                    </div>
                  )}
                  {item.source.where && (
                    <div className="item-source">
                      {item.source.where}
                      {item.source.location ? ` — ${item.source.location}` : ''}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </section>
    </div>
  );
}
