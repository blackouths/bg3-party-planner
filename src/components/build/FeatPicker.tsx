import type { Ability, Character, FeatSelection } from '../../model/types';
import { ABILITIES } from '../../model/types';
import { usePartyStore } from '../../store/partyStore';
import { FEATS, FEAT_BY_NAME } from '../../data/feats';
import { featSlots } from '../../model/selectors';

export default function FeatPicker({ member, slot }: { member: Character; slot: number }) {
  const updateMember = usePartyStore((s) => s.updateMember);
  const slots = featSlots(member);
  const taken = new Set(
    member.feats
      .filter((f) => !FEAT_BY_NAME.get(f.name)?.repeatable)
      .map((f) => f.name),
  );

  const setFeat = (i: number, name: string) => {
    const feats: (FeatSelection | undefined)[] = [...member.feats];
    feats[i] = name ? { name } : undefined;
    updateMember(slot, { feats: compact(feats, slots) });
  };

  const setAbility = (i: number, pickIndex: number, ability: string) => {
    const feats: (FeatSelection | undefined)[] = [...member.feats];
    const current = feats[i];
    if (!current) return;
    const info = FEAT_BY_NAME.get(current.name);
    const abilities = [...(current.abilities ?? [])];
    abilities[pickIndex] = ability as Ability;
    feats[i] = { ...current, abilities: abilities.slice(0, info?.abilityPicks ?? 0) };
    updateMember(slot, { feats: compact(feats, slots) });
  };

  if (slots === 0) {
    return (
      <section className="panel">
        <h3>Feats <span className="count">0 slots</span></h3>
        <p className="hint">Feat slots unlock at class levels 4, 8 and 12 (Fighter 6, Rogue 10).</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <h3>Feats <span className="count">{member.feats.filter((f) => f?.name).length}/{slots} chosen</span></h3>
      {Array.from({ length: slots }, (_, i) => {
        const sel = member.feats[i];
        const info = sel ? FEAT_BY_NAME.get(sel.name) : undefined;
        return (
          <div key={i} className="feat-row">
            <select value={sel?.name ?? ''} onChange={(e) => setFeat(i, e.target.value)}>
              <option value="">— feat —</option>
              {FEATS.map((f) => (
                <option
                  key={f.name}
                  value={f.name}
                  disabled={f.name !== sel?.name && taken.has(f.name)}
                >
                  {f.name}
                </option>
              ))}
            </select>

            {info?.abilityPicks &&
              Array.from({ length: info.abilityPicks }, (_, p) => (
                <select
                  key={p}
                  value={sel?.abilities?.[p] ?? ''}
                  onChange={(e) => setAbility(i, p, e.target.value)}
                >
                  <option value="">+1 …</option>
                  {(info.from ?? ABILITIES).map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              ))}

            {info && <span className="feat-desc">{info.description}</span>}
          </div>
        );
      })}
    </section>
  );
}

// Keep entries positional (slot i ↔ feats[i]); placeholder empties in the
// middle are kept, trailing empties trimmed.
function compact(feats: (FeatSelection | undefined)[], slots: number): FeatSelection[] {
  const out: FeatSelection[] = [];
  for (let i = 0; i < Math.min(feats.length, slots); i++) {
    out.push(feats[i] ?? { name: '' });
  }
  while (out.length && !out[out.length - 1].name) out.pop();
  return out;
}
