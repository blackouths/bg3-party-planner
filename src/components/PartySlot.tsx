import type { Character } from '../model/types';
import { ABILITIES } from '../model/types';
import { usePartyStore } from '../store/partyStore';
import { resolveCharacter } from '../model/selectors';

const fmt = (n: number) => (n >= 0 ? `+${n}` : `${n}`);
const sign = (n: number) => (n < 0 ? 'mod-neg' : 'mod-pos');

// Read-only party-slot card: a compact character sheet. All editing happens
// in the Build tab; this view just shows the outcome.
export default function PartySlot({ member, slot }: { member: Character; slot: number }) {
  const removeMember = usePartyStore((s) => s.removeMember);
  const r = resolveCharacter(member);

  const classLine = member.classes
    .filter((c) => c.class)
    .map((c) => `${c.subclass ? `${c.subclass} ` : ''}${c.class} ${c.level}`)
    .join(' / ');
  const subtitle = [member.subrace ?? member.race, classLine]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="slot-filled party-sheet">
      <div className="slot-head">
        <strong className="party-sheet-name">{member.name || 'Unnamed'}</strong>
        <button className="link-btn" onClick={() => removeMember(slot)}>clear</button>
      </div>
      <div className="sheet-sub">{subtitle || 'No build yet — set one up in the Build tab'}</div>

      <div className="sheet-stats">
        <Stat label="HP" value={r.hp} />
        <Stat label="AC" value={r.ac} />
        <Stat label="Initiative" value={fmt(r.initiative)} />
        <Stat label="Prof." value={fmt(r.proficiencyBonus)} />
        <Stat label="Speed" value={`${r.speedM}m`} />
        <Stat label="Darkvision" value={r.darkvisionM ? `${r.darkvisionM}m` : '—'} />
      </div>

      <div className="sheet-abilities">
        {ABILITIES.map((a) => (
          <div key={a} className="sheet-ability">
            <span className="sheet-ability-name">{a}</span>
            <span className="sheet-ability-score">{r.abilities[a]}</span>
            <span className="sheet-ability-mod">{fmt(r.modifiers[a])}</span>
          </div>
        ))}
      </div>

      <div className="sheet-section">
        <h4>Saving Throws</h4>
        <div className="sheet-saves">
          {ABILITIES.map((a) => (
            <span key={a} className="sheet-save">
              {a} <b className={sign(r.saves[a])}>{fmt(r.saves[a])}</b>
            </span>
          ))}
        </div>
      </div>

      <div className="sheet-section">
        <h4>Skills</h4>
        <div className="sheet-skills">
          {r.skills.map((s) => (
            <div key={s.skill} className={s.proficient ? 'sheet-skill prof' : 'sheet-skill'}>
              <span>{s.skill}</span>
              <b className={sign(s.modifier)}>{fmt(s.modifier)}</b>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="stat">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
