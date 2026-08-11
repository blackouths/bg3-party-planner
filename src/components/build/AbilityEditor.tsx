import type { Ability, Character } from '../../model/types';
import { ABILITIES } from '../../model/types';
import { usePartyStore } from '../../store/partyStore';
import { resolveAbilities, abilityModifier } from '../../model/selectors';

// BG3 point-buy: 27 points, base scores 8-15 before racial boosts.
const COST: Record<number, number> = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
const POOL = 27;

const fmt = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

export default function AbilityEditor({ member, slot }: { member: Character; slot: number }) {
  const updateMember = usePartyStore((s) => s.updateMember);

  const spent = ABILITIES.reduce((sum, a) => sum + (COST[member.baseAbilities[a]] ?? 0), 0);
  const left = POOL - spent;
  const final = resolveAbilities(member);

  const racial2 = member.abilityBoosts.find((b) => b.origin === 'race' && b.value === 2)?.ability ?? '';
  const racial1 = member.abilityBoosts.find((b) => b.origin === 'race' && b.value === 1)?.ability ?? '';

  const setBase = (ability: Ability, next: number) => {
    if (next < 8 || next > 15) return;
    const delta = (COST[next] ?? 0) - (COST[member.baseAbilities[ability]] ?? 0);
    if (delta > left) return;
    updateMember(slot, {
      baseAbilities: { ...member.baseAbilities, [ability]: next },
    });
  };

  const setRacial = (value: 2 | 1, ability: string) => {
    const other = value === 2 ? racial1 : racial2;
    const boosts = member.abilityBoosts.filter((b) => b.origin !== 'race');
    if (ability && ability === other) return; // must differ
    if (ability) boosts.push({ ability: ability as Ability, value, origin: 'race' });
    const kept = value === 2 ? racial1 : racial2;
    if (kept) boosts.push({ ability: kept as Ability, value: value === 2 ? 1 : 2, origin: 'race' });
    updateMember(slot, { abilityBoosts: boosts });
  };

  return (
    <section className="panel">
      <h3>
        Abilities
        <span className="count">{left} points left</span>
      </h3>

      <div className="racial-row">
        <label>
          Racial +2
          <select value={racial2} onChange={(e) => setRacial(2, e.target.value)}>
            <option value="">—</option>
            {ABILITIES.map((a) => (
              <option key={a} value={a} disabled={a === racial1}>{a}</option>
            ))}
          </select>
        </label>
        <label>
          Racial +1
          <select value={racial1} onChange={(e) => setRacial(1, e.target.value)}>
            <option value="">—</option>
            {ABILITIES.map((a) => (
              <option key={a} value={a} disabled={a === racial2}>{a}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="ability-grid">
        {ABILITIES.map((a) => {
          const base = member.baseAbilities[a];
          return (
            <div key={a} className="ability-row">
              <span className="ability-name">{a}</span>
              <div className="ability-stepper">
                <button onClick={() => setBase(a, base - 1)} disabled={base <= 8}>−</button>
                <span className="ability-base">{base}</span>
                <button
                  onClick={() => setBase(a, base + 1)}
                  disabled={base >= 15 || (COST[base + 1] ?? 99) - (COST[base] ?? 0) > left}
                >
                  +
                </button>
              </div>
              <span className="ability-final">
                {final[a]} <span className="ability-mod">({fmt(abilityModifier(final[a]))})</span>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
