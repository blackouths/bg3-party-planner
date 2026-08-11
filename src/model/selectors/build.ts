import type { Character, SkillName } from '../types';
import { CLASSES, featLevelsFor } from '../../data/classes';
import { BACKGROUNDS } from '../../data/backgrounds';
import { RACES } from '../../data/races';
import { SKILL_NAMES } from '../../data/skills';

// Total feat slots unlocked by current class levels (class L4/8/12; Fighter
// also 6, Rogue also 10 — per class level, not character level).
export function featSlots(character: Character): number {
  let slots = 0;
  for (const cl of character.classes) {
    if (!cl.class) continue;
    slots += featLevelsFor(cl.class).filter((lvl) => lvl <= (cl.level || 0)).length;
  }
  return slots;
}

// Skill proficiencies granted automatically (background + race), not counted
// against the pick budget.
export function fixedSkillGrants(character: Character): SkillName[] {
  const fixed = new Set<SkillName>();
  for (const s of BACKGROUNDS[character.background] ?? []) fixed.add(s);
  for (const s of RACES[character.race]?.skillGrants ?? []) fixed.add(s);
  return [...fixed];
}

export interface SkillBudget {
  budget: number;              // number of user picks allowed
  allowed: SkillName[];        // pickable skills
  anyAllowed: boolean;         // true when at least one pick source is unrestricted
}

// Pick budget: starting-class choices + Human versatility + Skilled feats (×3).
// Allowed list is the class list; any unrestricted source opens all skills.
export function skillBudget(character: Character): SkillBudget {
  const startClass = CLASSES[character.classes[0]?.class ?? ''];
  const classChoices = startClass?.skillChoices;
  const bonusPicks = RACES[character.race]?.bonusSkillChoices ?? 0;
  const skilledPicks =
    3 * character.feats.filter((f) => f.name === 'Skilled').length;

  const budget = (classChoices?.count ?? 0) + bonusPicks + skilledPicks;
  const anyAllowed =
    classChoices?.from === 'any' || bonusPicks > 0 || skilledPicks > 0;
  const allowed = anyAllowed
    ? SKILL_NAMES
    : (classChoices?.from as SkillName[] | undefined) ?? [];

  return { budget, allowed, anyAllowed };
}
