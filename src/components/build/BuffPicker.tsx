import type { Ability, Character } from '../../model/types';
import { ABILITIES } from '../../model/types';
import { usePartyStore } from '../../store/partyStore';
import { PERMANENT_BUFFS, BUFF_BY_ID, type PermanentBuff } from '../../data/buffs';
import { partyBuffConflicts } from '../../model/selectors';

const ACTS = ['Act 1', 'Act 2', 'Act 3'] as const;

export default function BuffPicker({ member, slot }: { member: Character; slot: number }) {
  const party = usePartyStore((s) => s.party);
  const updateMember = usePartyStore((s) => s.updateMember);

  const selected = new Map(member.buffs.map((b) => [b.id, b]));
  const conflicts = partyBuffConflicts(party);

  // Party-unique buffs already claimed by OTHER members.
  const claimedElsewhere = new Map<string, string>();
  party.members.forEach((m, i) => {
    if (!m || i === slot) return;
    const who = m.name || `Slot ${i + 1}`;
    for (const b of m.buffs) {
      if (BUFF_BY_ID.get(b.id)?.partyUnique && !claimedElsewhere.has(b.id)) {
        claimedElsewhere.set(b.id, who);
      }
    }
  });

  const toggle = (buff: PermanentBuff) => {
    const has = selected.has(buff.id);
    const buffs = has
      ? member.buffs.filter((b) => b.id !== buff.id)
      : [...member.buffs, { id: buff.id }];
    updateMember(slot, { buffs });
  };

  const setAbility = (buffId: string, ability: string) => {
    const buffs = member.buffs.map((b) =>
      b.id === buffId ? { ...b, ability: (ability || undefined) as Ability | undefined } : b,
    );
    updateMember(slot, { buffs });
  };

  return (
    <section className="panel">
      <h3>
        Permanent Buffs
        <span className="count">{member.buffs.length} taken</span>
      </h3>

      {conflicts.length > 0 && (
        <div className="conflict-banner buff-conflicts">
          {conflicts.map((c, i) => (
            <span key={i} className="conflict-item">
              {c.kind === 'party-unique'
                ? `⚑ ${c.name} is one-per-run (${c.members.join(', ')})`
                : `✕ ${c.name} are mutually exclusive (${c.members[0]})`}
            </span>
          ))}
        </div>
      )}

      {ACTS.map((act) => (
        <div key={act} className="buff-act">
          <h4 className="buff-act-head">{act}</h4>
          {PERMANENT_BUFFS.filter((b) => b.act === act).map((buff) => {
            const sel = selected.get(buff.id);
            const originLocked =
              buff.requiresOrigin && member.origin !== buff.requiresOrigin;
            const mutexBlocked =
              !sel && (buff.mutexWith ?? []).some((id) => selected.has(id));
            const takenBy = claimedElsewhere.get(buff.id);
            return (
              <div key={buff.id} className={`buff-row ${sel ? 'on' : ''}`}>
                <label className={originLocked || mutexBlocked ? 'buff-label dim' : 'buff-label'}>
                  <input
                    type="checkbox"
                    checked={!!sel}
                    disabled={originLocked || mutexBlocked}
                    onChange={() => toggle(buff)}
                  />
                  <span className="buff-name">{buff.name}</span>
                  {buff.partyUnique && (
                    <span className="buff-chip" title="Only one character per playthrough">unique</span>
                  )}
                  {takenBy && (
                    <span className="buff-chip buff-warn" title={`Already taken by ${takenBy}`}>
                      {takenBy} has it
                    </span>
                  )}
                  {originLocked && (
                    <span className="buff-chip">{buff.requiresOrigin} only</span>
                  )}
                </label>

                {sel && buff.abilityPick && (
                  <select
                    className="buff-ability"
                    value={sel.ability ?? ''}
                    onChange={(e) => setAbility(buff.id, e.target.value)}
                  >
                    <option value="">{buff.abilityPick.label} …</option>
                    {ABILITIES.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                )}

                <div className="buff-desc">
                  {buff.description}
                  <span className="buff-source"> — {buff.source}</span>
                  {buff.note && <span className="buff-note"> {buff.note}</span>}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </section>
  );
}
