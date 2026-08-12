import { useState } from 'react';
import { usePartyStore } from '../store/partyStore';
import { COMPANION_PRESETS, presetPatch } from '../data/companions';
import PartySlot from '../components/PartySlot';
import CoveragePanels from '../components/CoveragePanels';

// Custom (non-preset) origins offered alongside the companions.
const CUSTOM_ORIGINS = ['Tav', 'The Dark Urge'];

export default function PartyView() {
  const party = usePartyStore((s) => s.party);
  const addMember = usePartyStore((s) => s.addMember);
  const updateMember = usePartyStore((s) => s.updateMember);
  const [choosing, setChoosing] = useState<number | null>(null);

  const pick = (slot: number, origin: string) => {
    addMember(slot);
    const preset = COMPANION_PRESETS[origin];
    updateMember(slot, {
      origin,
      ...(preset ? { name: origin, ...presetPatch(preset) } : {}),
    });
    setChoosing(null);
  };

  return (
    <div className="view">
      <div className="party-grid">
        {party.members.map((member, slot) => (
          <div key={slot} className="party-slot">
            {member ? (
              <PartySlot member={member} slot={slot} />
            ) : choosing === slot ? (
              <div className="slot-chooser">
                <div className="slot-chooser-head">
                  <span>Who joins?</span>
                  <button className="link-btn" onClick={() => setChoosing(null)}>cancel</button>
                </div>
                {CUSTOM_ORIGINS.map((o) => (
                  <button key={o} className="chooser-option chooser-custom" onClick={() => pick(slot, o)}>
                    {o} <span className="chooser-sub">custom build</span>
                  </button>
                ))}
                {Object.entries(COMPANION_PRESETS).map(([name, p]) => (
                  <button key={name} className="chooser-option" onClick={() => pick(slot, name)}>
                    {name}
                    <span className="chooser-sub">
                      {p.subrace ?? p.race} {p.class}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <button className="slot-empty" onClick={() => setChoosing(slot)}>
                + Empty Party Slot
              </button>
            )}
          </div>
        ))}
      </div>

      <CoveragePanels />
    </div>
  );
}
