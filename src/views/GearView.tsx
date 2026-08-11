import { useState } from 'react';
import type { GearSlotInstance } from '../model/types';
import { usePartyStore } from '../store/partyStore';
import { GEAR_SLOTS } from '../data/gearSlots';
import { getItem } from '../model/itemIndex';
import { partyGearConflicts, maxHP, armourClass } from '../model/selectors';
import ItemPicker from '../components/ItemPicker';

export default function GearView() {
  const party = usePartyStore((s) => s.party);
  const activeSlot = usePartyStore((s) => s.activeSlot);
  const setActiveSlot = usePartyStore((s) => s.setActiveSlot);
  const equipItem = usePartyStore((s) => s.equipItem);
  const unequipItem = usePartyStore((s) => s.unequipItem);

  const [picking, setPicking] = useState<GearSlotInstance | null>(null);
  const member = party.members[activeSlot];
  const conflicts = partyGearConflicts(party);

  return (
    <div className="view">
      <div className="member-tabs">
        {party.members.map((m, slot) => (
          <button
            key={slot}
            className={slot === activeSlot ? 'member-tab member-tab-active' : 'member-tab'}
            onClick={() => { setActiveSlot(slot); setPicking(null); }}
          >
            {m ? m.name || `Slot ${slot + 1}` : `Slot ${slot + 1}`}
          </button>
        ))}
      </div>

      {conflicts.length > 0 && (
        <div className="conflict-banner">
          <strong>⚠ Unique-item conflicts:</strong>
          {conflicts.map((c) => (
            <span key={c.itemId} className="conflict-item">
              {c.name} ({c.holders.map((h) => `${h.member}·${h.gearSlot}`).join(', ')})
            </span>
          ))}
        </div>
      )}

      {!member ? (
        <p className="muted">This slot is empty. Add a character in the Party tab.</p>
      ) : (
        <div className="gear-layout">
          <div className="gear-slots">
            <div className="gear-summary">
              <span>{member.name || 'Unnamed'}</span>
              <span>HP {maxHP(member)}</span>
              <span>AC {armourClass(member)}</span>
            </div>
            {GEAR_SLOTS.map((def) => {
              const item = getItem(member.equipment[def.slot]);
              const active = picking === def.slot;
              return (
                <div key={def.slot} className={active ? 'gear-slot-row active' : 'gear-slot-row'}>
                  <span className="gear-slot-label">{def.label}</span>
                  {item ? (
                    <button className="gear-equipped" onClick={() => setPicking(def.slot)}>
                      <span className={`dot rarity-${item.rarity.replace(/\s/g, '').toLowerCase()}`} />
                      {item.name}
                    </button>
                  ) : (
                    <button className="gear-empty-slot" onClick={() => setPicking(def.slot)}>
                      empty
                    </button>
                  )}
                  {item && (
                    <button
                      className="link-btn"
                      onClick={() => unequipItem(activeSlot, def.slot)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="gear-picker">
            {picking ? (
              <ItemPicker
                accepts={GEAR_SLOTS.find((g) => g.slot === picking)!.accepts}
                label={GEAR_SLOTS.find((g) => g.slot === picking)!.label}
                onPick={(itemId) => { equipItem(activeSlot, picking, itemId); setPicking(null); }}
                onClose={() => setPicking(null)}
              />
            ) : (
              <p className="muted">Select a slot on the left to browse items.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
