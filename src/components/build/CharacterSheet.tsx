import type { Character } from '../../model/types';
import { ABILITIES } from '../../model/types';
import { CLASSES } from '../../data/classes';
import { BUFF_BY_ID } from '../../data/buffs';
import { CAMP_BUFF_BY_ID } from '../../data/campBuffs';
import { resolveCharacter, equippedItems } from '../../model/selectors';

const fmt = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

export default function CharacterSheet({ member }: { member: Character }) {
  const r = resolveCharacter(member);
  const gear = equippedItems(member);

  const classLine = member.classes
    .filter((c) => c.class)
    .map((c) => `${c.subclass ? `${c.subclass} ` : ''}${c.class} ${c.level}`)
    .join(' / ');

  // Spellcasting per class with a casting ability.
  const casting = member.classes
    .filter((c) => c.class && CLASSES[c.class]?.spellcastingAbility)
    .map((c) => {
      const ability = CLASSES[c.class].spellcastingAbility!;
      const mod = r.modifiers[ability];
      return {
        cls: c.class,
        ability,
        dc: 8 + r.proficiencyBonus + mod,
        attack: r.proficiencyBonus + mod,
      };
    });

  return (
    <aside className="sheet">
      <div className="sheet-head">
        <strong>{member.name || 'Unnamed'}</strong>
        <span className="sheet-sub">
          {[member.subrace ?? member.race, classLine || null].filter(Boolean).join(' · ') || 'Level 1'}
        </span>
      </div>

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
              {a} <b>{fmt(r.saves[a])}</b>
            </span>
          ))}
        </div>
      </div>

      {casting.length > 0 && (
        <div className="sheet-section">
          <h4>Spellcasting</h4>
          {casting.map((c) => (
            <div key={c.cls} className="sheet-cast">
              {c.cls} ({c.ability}): DC {c.dc} · {fmt(c.attack)} attack
            </div>
          ))}
        </div>
      )}

      <div className="sheet-section">
        <h4>Skills</h4>
        <div className="sheet-skills">
          {r.skills.map((s) => (
            <div key={s.skill} className={s.proficient ? 'sheet-skill prof' : 'sheet-skill'}>
              <span>{s.skill}</span>
              <b>{fmt(s.modifier)}</b>
            </div>
          ))}
        </div>
      </div>

      {member.spells.known.length > 0 && (
        <div className="sheet-section">
          <h4>Known Spells <span className="count">{member.spells.known.length}</span></h4>
          <div className="sheet-spells">{member.spells.known.join(' · ')}</div>
        </div>
      )}

      {member.buffs.length > 0 && (
        <div className="sheet-section">
          <h4>Permanent Buffs</h4>
          {member.buffs.map((b) => {
            const buff = BUFF_BY_ID.get(b.id);
            if (!buff) return null;
            return (
              <div key={b.id} className="sheet-buff" title={buff.description}>
                ✦ {buff.name}
                {b.ability && buff.abilityPick && (
                  <span className="sheet-buff-pick"> ({buff.abilityPick.label} {b.ability})</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {member.campBuffs.length > 0 && (
        <div className="sheet-section">
          <h4>Camp Casts</h4>
          {member.campBuffs.map((b) => {
            const buff = CAMP_BUFF_BY_ID.get(b.id);
            if (!buff) return null;
            return (
              <div key={b.id} className="sheet-buff" title={buff.description}>
                ⛺ {buff.name}
                {b.upcastLevel && buff.upcast && b.upcastLevel > buff.upcast.minLevel && (
                  <span className="sheet-buff-pick"> (slot {b.upcastLevel})</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {gear.length > 0 && (
        <div className="sheet-section">
          <h4>Equipped</h4>
          {gear.map((g) => (
            <div key={g.id} className="sheet-gear">
              <span className={`dot rarity-${g.rarity.replace(/\s/g, '').toLowerCase()}`} />
              {g.name}
            </div>
          ))}
        </div>
      )}
    </aside>
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
