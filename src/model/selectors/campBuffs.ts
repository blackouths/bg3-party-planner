import type { Character, ParsedEffect } from '../types';
import { CAMP_BUFF_BY_ID } from '../../data/campBuffs';

// Structured effects from planned camp casts, with upcast scaling resolved
// (Aid at slot level N grants its base HP plus hpPerLevel per level above min).
export function campBuffEffects(character: Character): ParsedEffect[] {
  const effects: ParsedEffect[] = [];
  // Tolerate pre-v4 state (mid-HMR or stale imports) where the field is absent.
  for (const sel of character.campBuffs ?? []) {
    const buff = CAMP_BUFF_BY_ID.get(sel.id);
    if (!buff) continue;
    for (const e of buff.effects ?? []) {
      if (e.kind === 'maxHpBonus' && buff.upcast && sel.upcastLevel) {
        const extra =
          Math.max(0, Math.min(sel.upcastLevel, buff.upcast.maxLevel) - buff.upcast.minLevel) *
          buff.upcast.hpPerLevel;
        effects.push({ kind: 'maxHpBonus', value: e.value + extra });
      } else {
        effects.push(e);
      }
    }
  }
  return effects;
}
