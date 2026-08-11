import type { Character, SkillName } from '../../model/types';
import { usePartyStore } from '../../store/partyStore';
import { SKILL_NAMES, SKILL_ABILITY } from '../../data/skills';
import { fixedSkillGrants, skillBudget } from '../../model/selectors';

export default function SkillPicker({ member, slot }: { member: Character; slot: number }) {
  const updateMember = usePartyStore((s) => s.updateMember);
  const fixed = new Set(fixedSkillGrants(member));
  const { budget, allowed } = skillBudget(member);
  const allowedSet = new Set(allowed);
  // Drop user picks that duplicate fixed grants from budget accounting.
  const picks = member.skillProficiencies.filter((s) => !fixed.has(s));
  const left = budget - picks.length;

  const toggle = (skill: SkillName) => {
    const has = picks.includes(skill);
    if (!has && left <= 0) return;
    const next = has ? picks.filter((s) => s !== skill) : [...picks, skill];
    updateMember(slot, { skillProficiencies: next });
  };

  return (
    <section className="panel">
      <h3>
        Skill Proficiencies
        <span className="count">{left} left</span>
      </h3>
      <div className="skill-pick-grid">
        {SKILL_NAMES.map((skill) => {
          const isFixed = fixed.has(skill);
          const checked = isFixed || picks.includes(skill);
          const disabled = isFixed || (!checked && (left <= 0 || !allowedSet.has(skill)));
          return (
            <label
              key={skill}
              className={`skill-pick ${checked ? 'on' : ''} ${disabled && !isFixed ? 'dim' : ''}`}
              title={isFixed ? 'Granted by background/race' : undefined}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => toggle(skill)}
              />
              {skill}
              <span className="skill-pick-ab">{SKILL_ABILITY[skill]}</span>
              {isFixed && <span className="skill-fixed">auto</span>}
            </label>
          );
        })}
      </div>
    </section>
  );
}
