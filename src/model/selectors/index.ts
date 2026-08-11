import type { Character } from '../types';
import { resolveAbilities, abilityModifiers } from './abilities';
import {
  totalLevel, proficiencyBonus, maxHP, armourClass, initiative,
  resolveSkills, resolveSaves, movementSpeedM, darkvisionM,
} from './stats';

export * from './abilities';
export * from './stats';
export * from './coverage';
export * from './gear';
export * from './build';
export * from './buffs';

// One-shot resolution of a character's live sheet, for the Build view.
export function resolveCharacter(character: Character) {
  const abilities = resolveAbilities(character);
  return {
    abilities,
    modifiers: abilityModifiers(abilities),
    totalLevel: totalLevel(character),
    proficiencyBonus: proficiencyBonus(character),
    hp: maxHP(character),
    ac: armourClass(character),
    initiative: initiative(character),
    skills: resolveSkills(character),
    saves: resolveSaves(character),
    speedM: movementSpeedM(character),
    darkvisionM: darkvisionM(character),
  };
}

export type ResolvedCharacter = ReturnType<typeof resolveCharacter>;
