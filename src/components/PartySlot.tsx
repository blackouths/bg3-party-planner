import type { Character } from '../model/types';
import { usePartyStore } from '../store/partyStore';
import { RACES, RACE_NAMES } from '../data/races';
import { CLASS_NAMES } from '../data/classes';
import { maxHP, armourClass, totalLevel } from '../model/selectors';

export default function PartySlot({ member, slot }: { member: Character; slot: number }) {
  const updateMember = usePartyStore((s) => s.updateMember);
  const removeMember = usePartyStore((s) => s.removeMember);

  const primary = member.classes[0] ?? { class: '', level: 1 };
  const subraces = RACES[member.race]?.subraces ?? [];

  const setClass = (patch: Partial<typeof primary>) => {
    const classes = [...member.classes];
    classes[0] = { ...primary, ...patch };
    updateMember(slot, { classes });
  };

  return (
    <div className="slot-filled">
      <div className="slot-head">
        <input
          className="slot-name"
          placeholder="Name"
          value={member.name}
          onChange={(e) => updateMember(slot, { name: e.target.value })}
        />
        <button className="link-btn" onClick={() => removeMember(slot)}>clear</button>
      </div>

      <label className="field">
        <span>Race</span>
        <select
          value={member.race}
          onChange={(e) => updateMember(slot, { race: e.target.value, subrace: undefined })}
        >
          <option value="">—</option>
          {RACE_NAMES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </label>

      {subraces.length > 0 && (
        <label className="field">
          <span>Subrace</span>
          <select
            value={member.subrace ?? ''}
            onChange={(e) => updateMember(slot, { subrace: e.target.value || undefined })}
          >
            <option value="">—</option>
            {subraces.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      )}

      <label className="field">
        <span>Class</span>
        <select value={primary.class} onChange={(e) => setClass({ class: e.target.value })}>
          <option value="">—</option>
          {CLASS_NAMES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>

      <label className="field">
        <span>Level</span>
        <select
          value={primary.level}
          onChange={(e) => setClass({ level: Number(e.target.value) })}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </label>

      <div className="slot-stats">
        <span>Lv {totalLevel(member)}</span>
        <span>HP {maxHP(member)}</span>
        <span>AC {armourClass(member)}</span>
      </div>
    </div>
  );
}
