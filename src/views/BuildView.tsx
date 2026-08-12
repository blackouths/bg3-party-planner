import { usePartyStore } from '../store/partyStore';
import { RACES, RACE_NAMES } from '../data/races';
import { BACKGROUND_NAMES } from '../data/backgrounds';
import { COMPANION_PRESETS, presetPatch } from '../data/companions';
import { DEITIES } from '../data/deities';
import AbilityEditor from '../components/build/AbilityEditor';
import ClassEditor from '../components/build/ClassEditor';
import SkillPicker from '../components/build/SkillPicker';
import FeatPicker from '../components/build/FeatPicker';
import SpellPicker from '../components/build/SpellPicker';
import BuffPicker from '../components/build/BuffPicker';
import CharacterSheet from '../components/build/CharacterSheet';

const ORIGINS = [
  'Tav', 'The Dark Urge', 'Astarion', 'Gale', 'Karlach', "Lae'zel",
  'Shadowheart', 'Wyll', 'Halsin', 'Jaheira', 'Minsc', 'Minthara',
];

export default function BuildView() {
  const party = usePartyStore((s) => s.party);
  const activeSlot = usePartyStore((s) => s.activeSlot);
  const setActiveSlot = usePartyStore((s) => s.setActiveSlot);
  const updateMember = usePartyStore((s) => s.updateMember);
  const member = party.members[activeSlot];

  return (
    <div className="view">
      <div className="member-tabs">
        {party.members.map((m, slot) => (
          <button
            key={slot}
            className={slot === activeSlot ? 'member-tab member-tab-active' : 'member-tab'}
            onClick={() => setActiveSlot(slot)}
          >
            {m ? m.name || `Slot ${slot + 1}` : `Slot ${slot + 1}`}
          </button>
        ))}
      </div>

      {!member ? (
        <p className="muted">This slot is empty. Add a character in the Party tab.</p>
      ) : (
        <div className="build-layout">
          <div className="build-editors">
            <section className="panel">
              <h3>Identity</h3>
              <div className="identity-grid">
                <label className="field">
                  <span>Name</span>
                  <input
                    className="slot-name"
                    value={member.name}
                    placeholder="Name"
                    onChange={(e) => updateMember(activeSlot, { name: e.target.value })}
                  />
                </label>
                <label className="field">
                  <span>Origin</span>
                  <select
                    value={member.origin}
                    onChange={(e) => updateMember(activeSlot, { origin: e.target.value })}
                  >
                    {ORIGINS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </label>
                {COMPANION_PRESETS[member.origin] && (
                  <button
                    className="action-btn preset-btn"
                    onClick={() => {
                      const preset = COMPANION_PRESETS[member.origin];
                      if (window.confirm(
                        `Apply ${member.origin}'s canonical build? This replaces race, class, background, abilities, skills, and feats.`,
                      )) {
                        updateMember(activeSlot, {
                          name: member.name || member.origin,
                          ...presetPatch(preset),
                        });
                      }
                    }}
                  >
                    Apply {member.origin} preset
                  </button>
                )}
                <label className="field">
                  <span>Race</span>
                  <select
                    value={member.race}
                    onChange={(e) =>
                      updateMember(activeSlot, { race: e.target.value, subrace: undefined })
                    }
                  >
                    <option value="">—</option>
                    {RACE_NAMES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </label>
                {(RACES[member.race]?.subraces?.length ?? 0) > 0 && (
                  <label className="field">
                    <span>Subrace</span>
                    <select
                      value={member.subrace ?? ''}
                      onChange={(e) =>
                        updateMember(activeSlot, { subrace: e.target.value || undefined })
                      }
                    >
                      <option value="">—</option>
                      {RACES[member.race]!.subraces!.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                )}
                <label className="field">
                  <span>Background</span>
                  <select
                    value={member.background}
                    onChange={(e) => updateMember(activeSlot, { background: e.target.value })}
                  >
                    <option value="">—</option>
                    {BACKGROUND_NAMES.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </label>
                {member.classes.some((c) => c.class === 'Cleric') && (
                  <label className="field">
                    <span>Deity</span>
                    <select
                      value={member.deity ?? ''}
                      onChange={(e) =>
                        updateMember(activeSlot, { deity: e.target.value || undefined })
                      }
                    >
                      <option value="">—</option>
                      {DEITIES.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </label>
                )}
              </div>
            </section>

            <ClassEditor member={member} slot={activeSlot} />
            <AbilityEditor member={member} slot={activeSlot} />
            <SkillPicker member={member} slot={activeSlot} />
            <FeatPicker member={member} slot={activeSlot} />
            <SpellPicker member={member} slot={activeSlot} />
            <BuffPicker member={member} slot={activeSlot} />
          </div>

          <CharacterSheet member={member} />
        </div>
      )}
    </div>
  );
}
