import type { Character } from '../../model/types';
import { usePartyStore } from '../../store/partyStore';
import { CAMP_BUFFS, type CampBuff } from '../../data/campBuffs';

// Pre-adventure camp casts (a Cleric/Druid left at camp buffs the party
// before you head out — standard Honor Mode practice).
export default function CampBuffPicker({ member, slot }: { member: Character; slot: number }) {
  const updateMember = usePartyStore((s) => s.updateMember);
  const selected = new Map(member.campBuffs.map((b) => [b.id, b]));

  const toggle = (buff: CampBuff) => {
    const has = selected.has(buff.id);
    const campBuffs = has
      ? member.campBuffs.filter((b) => b.id !== buff.id)
      : [...member.campBuffs, {
          id: buff.id,
          ...(buff.upcast ? { upcastLevel: buff.upcast.maxLevel } : {}),
        }];
    updateMember(slot, { campBuffs });
  };

  const setUpcast = (id: string, level: number) => {
    updateMember(slot, {
      campBuffs: member.campBuffs.map((b) =>
        b.id === id ? { ...b, upcastLevel: level } : b,
      ),
    });
  };

  return (
    <section className="panel">
      <h3>
        Camp Casting
        <span className="count">{member.campBuffs.length} planned · until long rest</span>
      </h3>
      <p className="hint">
        Buffs a caster left at camp puts on this character before adventuring.
        Concentration spells are excluded — a camp caster can't reliably hold
        concentration all day.
      </p>

      {CAMP_BUFFS.map((buff) => {
        const sel = selected.get(buff.id);
        return (
          <div key={buff.id} className={`buff-row ${sel ? 'on' : ''}`}>
            <label className="buff-label">
              <input type="checkbox" checked={!!sel} onChange={() => toggle(buff)} />
              <span className="buff-name">{buff.name}</span>
              <span className="buff-chip">{buff.caster}</span>
            </label>
            {sel && buff.upcast && (
              <select
                className="buff-ability"
                value={sel.upcastLevel ?? buff.upcast.maxLevel}
                onChange={(e) => setUpcast(buff.id, Number(e.target.value))}
              >
                {Array.from(
                  { length: buff.upcast.maxLevel - buff.upcast.minLevel + 1 },
                  (_, i) => buff.upcast!.minLevel + i,
                ).map((lv) => (
                  <option key={lv} value={lv}>slot level {lv}</option>
                ))}
              </select>
            )}
            <div className="buff-desc">
              {buff.description}
              {buff.note && <span className="buff-note"> {buff.note}</span>}
            </div>
          </div>
        );
      })}
    </section>
  );
}
