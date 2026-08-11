import type { Ability, Character, SkillName } from '../types';
import { ABILITIES } from '../types';
import { CLASSES } from '../../data/classes';
import { RACES } from '../../data/races';
import { SKILL_ABILITY, SKILL_NAMES } from '../../data/skills';
import { resolveAbilities, abilityModifiers } from './abilities';
import { equippedItems, gearEffects } from './gear';
import { fixedSkillGrants } from './build';
import { buffEffects } from './buffs';

export function totalLevel(character: Character): number {
  return character.classes.reduce((sum, cl) => sum + (cl.level || 0), 0);
}

// BG3 proficiency bonus: +2 (L1-4), +3 (L5-8), +4 (L9-12).
export function proficiencyBonus(character: Character): number {
  return 2 + Math.floor((Math.min(totalLevel(character), 12) - 1) / 4);
}

// HP: level 1 uses the starting class's max hit die; every later level uses the
// class-of-that-level's average roll. CON modifier applies per level.
// (Hill Dwarf / Tough feat bonuses are a future refinement.)
export function maxHP(character: Character): number {
  const scores = resolveAbilities(character);
  const conMod = Math.floor((scores.CON - 10) / 2);
  let hp = 0;
  let first = true;
  for (const cl of character.classes) {
    const die = CLASSES[cl.class]?.hitDie ?? 8;
    for (let i = 0; i < (cl.level || 0); i++) {
      hp += (first ? die : Math.floor(die / 2) + 1) + conMod;
      first = false;
    }
  }
  // Tough: +2 HP per character level.
  if (character.feats.some((f) => f.name === 'Tough')) {
    hp += 2 * totalLevel(character);
  }
  return Math.max(hp, 1);
}

// Approximate AC. Uses equipped armour base (by proficiency category) or
// unarmoured 10 + DEX, plus a shield and any flat acBonus gear effects.
export function armourClass(character: Character): number {
  const scores = resolveAbilities(character);
  const dexMod = Math.floor((scores.DEX - 10) / 2);
  const items = equippedItems(character);

  let ac = 10 + dexMod; // unarmoured default
  const chest = items.find((i) => i.slot === 'Chest');
  const base = chest?.requirements?.armourClass
    ? parseInt(chest.requirements.armourClass, 10)
    : NaN;
  if (chest && !Number.isNaN(base)) {
    const prof = chest.requirements?.proficiency ?? '';
    if (prof.startsWith('Heavy')) ac = base;
    else if (prof.startsWith('Medium')) ac = base + Math.min(dexMod, 2);
    else ac = base + dexMod; // Light armour / clothing
  }

  if (items.some((i) => i.slot === 'Shield')) ac += 2; // base shield
  for (const e of gearEffects(character)) if (e.kind === 'acBonus') ac += e.value;

  return ac;
}

export function initiative(character: Character): number {
  const scores = resolveAbilities(character);
  const alert = character.feats.some((f) => f.name === 'Alert') ? 5 : 0;
  return Math.floor((scores.DEX - 10) / 2) + alert;
}

export interface SkillResult {
  skill: SkillName;
  ability: Ability;
  proficient: boolean;
  modifier: number;
}

export function resolveSkills(character: Character): SkillResult[] {
  const mods = abilityModifiers(resolveAbilities(character));
  const pb = proficiencyBonus(character);
  // User picks + automatic grants from background and race.
  const profSet = new Set(character.skillProficiencies);
  for (const s of fixedSkillGrants(character)) profSet.add(s);
  const gearBonus: Partial<Record<SkillName, number>> = {};
  for (const e of [...gearEffects(character), ...buffEffects(character)]) {
    if (e.kind === 'skillBonus') {
      gearBonus[e.skill] = (gearBonus[e.skill] ?? 0) + e.value;
    }
  }

  return SKILL_NAMES.map((skill) => {
    const ability = SKILL_ABILITY[skill];
    const proficient = profSet.has(skill);
    const modifier =
      mods[ability] + (proficient ? pb : 0) + (gearBonus[skill] ?? 0);
    return { skill, ability, proficient, modifier };
  });
}

export function resolveSaves(character: Character): Record<Ability, number> {
  const mods = abilityModifiers(resolveAbilities(character));
  const pb = proficiencyBonus(character);
  // Saving-throw proficiency comes from the STARTING class only (5e/BG3 rule),
  // plus any ability chosen via the Resilient feat.
  const startClass = character.classes[0]?.class;
  const saveProfs = new Set(CLASSES[startClass]?.saveProficiencies ?? []);
  for (const f of character.feats) {
    if (f.name === 'Resilient' && f.abilities?.[0]) saveProfs.add(f.abilities[0]);
  }

  let flatAll = 0;
  const perAbility: Partial<Record<Ability, number>> = {};
  for (const e of [...gearEffects(character), ...buffEffects(character)]) {
    if (e.kind === 'saveBonus') {
      if (e.ability === 'all') flatAll += e.value;
      else perAbility[e.ability] = (perAbility[e.ability] ?? 0) + e.value;
    }
  }

  const result = {} as Record<Ability, number>;
  for (const a of ABILITIES) {
    result[a] =
      mods[a] + (saveProfs.has(a) ? pb : 0) + flatAll + (perAbility[a] ?? 0);
  }
  return result;
}

export function movementSpeedM(character: Character): number {
  return RACES[character.race]?.speedM ?? 9;
}

export function darkvisionM(character: Character): number {
  return RACES[character.race]?.darkvisionM ?? 0;
}
