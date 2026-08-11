import type { Ability, Character } from '../types';
import { ABILITIES } from '../types';
import { gearEffects } from './gear';
import { buffEffects } from './buffs';

export type AbilityScores = Record<Ability, number>;

// Final ability scores, merging the three sources in the correct order:
//   base (point-buy) + boosts (race/feat/ASI) -> then item effects.
// Item `abilitySet` overrides (takes the higher of current vs set, as in-game),
// item `abilityBonus` adds on top.
export function resolveAbilities(character: Character): AbilityScores {
  const scores: AbilityScores = { ...character.baseAbilities };

  for (const boost of character.abilityBoosts) {
    scores[boost.ability] += boost.value;
  }

  // Feat ability picks: +1 per chosen entry (ASI stores two picks, half-feats one).
  for (const feat of character.feats) {
    for (const a of feat.abilities ?? []) scores[a] += 1;
  }

  // BG3 caps ability scores at 20 from levelling sources; permanent buffs
  // (Ethel's Hair, Mirror of Loss, Everlasting Vigour) and items can exceed it.
  for (const a of ABILITIES) scores[a] = Math.min(scores[a], 20);

  for (const e of buffEffects(character)) {
    if (e.kind === 'abilityBonus') scores[e.ability] += e.value;
  }

  const effects = gearEffects(character);
  for (const e of effects) {
    if (e.kind === 'abilitySet') {
      scores[e.ability] = Math.max(scores[e.ability], e.value);
    }
  }
  for (const e of effects) {
    if (e.kind === 'abilityBonus') {
      scores[e.ability] += e.value;
    }
  }

  return scores;
}

export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function abilityModifiers(scores: AbilityScores): Record<Ability, number> {
  const mods = {} as Record<Ability, number>;
  for (const a of ABILITIES) mods[a] = abilityModifier(scores[a]);
  return mods;
}
