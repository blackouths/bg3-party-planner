import { usePartyStore } from '../store/partyStore';
import PartySlot from '../components/PartySlot';
import CoveragePanels from '../components/CoveragePanels';

export default function PartyView() {
  const party = usePartyStore((s) => s.party);
  const addMember = usePartyStore((s) => s.addMember);

  return (
    <div className="view">
      <div className="party-grid">
        {party.members.map((member, slot) => (
          <div key={slot} className="party-slot">
            {member ? (
              <PartySlot member={member} slot={slot} />
            ) : (
              <button className="slot-empty" onClick={() => addMember(slot)}>
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
