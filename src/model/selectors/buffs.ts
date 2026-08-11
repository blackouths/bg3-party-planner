import type { Character, ParsedEffect, Party } from '../types';
import { BUFF_BY_ID } from '../../data/buffs';

// All structured effects granted by a character's selected permanent buffs:
// fixed effects from the data file plus resolved ability picks (Ethel's Hair,
// Mirror of Loss).
export function buffEffects(character: Character): ParsedEffect[] {
  const effects: ParsedEffect[] = [];
  for (const sel of character.buffs) {
    const buff = BUFF_BY_ID.get(sel.id);
    if (!buff) continue;
    if (buff.effects) effects.push(...buff.effects);
    if (buff.abilityPick && sel.ability) {
      effects.push({
        kind: 'abilityBonus',
        ability: sel.ability,
        value: buff.abilityPick.value,
      });
    }
  }
  return effects;
}

export interface BuffConflict {
  buffId: string;
  name: string;
  kind: 'party-unique' | 'mutex';
  members: string[];
}

// Honor Mode sanity checks: party-unique buffs claimed by 2+ members, and
// mutually-exclusive buffs selected on the same character.
export function partyBuffConflicts(party: Party): BuffConflict[] {
  const conflicts: BuffConflict[] = [];
  const holders = new Map<string, string[]>();

  party.members.forEach((m, i) => {
    if (!m) return;
    const who = m.name || `Slot ${i + 1}`;
    const ids = new Set(m.buffs.map((b) => b.id));

    for (const id of ids) {
      const list = holders.get(id) ?? [];
      list.push(who);
      holders.set(id, list);

      // Per-character mutex (e.g. Paid the Price vs Volo's Ersatz Eye).
      const buff = BUFF_BY_ID.get(id);
      for (const other of buff?.mutexWith ?? []) {
        if (ids.has(other) && id < other) {
          conflicts.push({
            buffId: id,
            name: `${buff!.name} + ${BUFF_BY_ID.get(other)?.name}`,
            kind: 'mutex',
            members: [who],
          });
        }
      }
    }
  });

  for (const [id, members] of holders) {
    const buff = BUFF_BY_ID.get(id);
    if (buff?.partyUnique && members.length > 1) {
      conflicts.push({ buffId: id, name: buff.name, kind: 'party-unique', members });
    }
  }
  return conflicts;
}
