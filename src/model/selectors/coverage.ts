import type { Character, Party, SkillName } from '../types';
import { CLASSES } from '../../data/classes';
import { DIALOGUE_TAGS, UTILITY_SPELLS } from '../../data/coverage';
import { SKILL_NAMES } from '../../data/skills';
import { resolveSkills } from './stats';
import { gearEffects } from './gear';
import { buffEffects } from './buffs';

const members = (party: Party): Character[] =>
  party.members.filter((m): m is Character => m != null);

const displayName = (c: Character, i: number) => c.name || `Slot ${i + 1}`;

// Identity strings a character contributes to dialogue-tag coverage.
function candidates(c: Character): string[] {
  const out = [c.race, c.subrace, c.background, c.origin, c.deity];
  for (const cl of c.classes) {
    out.push(cl.class);
    if (cl.subclass) out.push(cl.subclass);
  }
  return out.filter(Boolean) as string[];
}

export interface TagCoverage {
  tag: string;
  covered: boolean;
  by: string[];
}

export function dialogueTagCoverage(party: Party): TagCoverage[] {
  const roster = members(party);
  return DIALOGUE_TAGS.map((tag) => {
    const re = new RegExp(`\\b${tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    const by: string[] = [];
    roster.forEach((c, i) => {
      if (candidates(c).some((cand) => re.test(cand))) by.push(displayName(c, i));
    });
    return { tag, covered: by.length > 0, by };
  });
}

export interface SkillCoverage {
  skill: SkillName;
  best: number;      // best party modifier
  by: string | null; // member with the best modifier
}

export function partySkillCoverage(party: Party): SkillCoverage[] {
  const roster = members(party);
  const perMember = roster.map((c, i) => ({
    name: displayName(c, i),
    skills: new Map(resolveSkills(c).map((s) => [s.skill, s.modifier])),
  }));

  return SKILL_NAMES.map((skill) => {
    let best = -Infinity;
    let by: string | null = null;
    for (const m of perMember) {
      const mod = m.skills.get(skill) ?? -Infinity;
      if (mod > best) { best = mod; by = m.name; }
    }
    return { skill, best: Number.isFinite(best) ? best : 0, by };
  });
}

export interface SpellCoverage {
  spell: string;
  covered: boolean;
  by: { name: string; via: 'known' | 'class' | 'gear' | 'buff' }[];
}

export function utilitySpellCoverage(party: Party): SpellCoverage[] {
  const roster = members(party);
  return UTILITY_SPELLS.map((spell) => {
    const by: { name: string; via: 'known' | 'class' | 'gear' | 'buff' }[] = [];
    roster.forEach((c, i) => {
      const name = displayName(c, i);
      // An explicitly picked spell is the strongest signal; class lists are a
      // "this class can bring it" heuristic used when nothing is picked.
      const fromKnown = c.spells.known.some(
        (n) => n.toLowerCase() === spell.toLowerCase(),
      );
      const fromClass = c.classes.some((cl) =>
        CLASSES[cl.class]?.utilitySpells?.includes(spell),
      );
      const fromGear = gearEffects(c).some(
        (e) => e.kind === 'grantsSpell' && e.spell === spell,
      );
      const fromBuff = buffEffects(c).some(
        (e) => e.kind === 'grantsSpell' && e.spell === spell,
      );
      if (fromKnown) by.push({ name, via: 'known' });
      else if (fromClass) by.push({ name, via: 'class' });
      else if (fromGear) by.push({ name, via: 'gear' });
      else if (fromBuff) by.push({ name, via: 'buff' });
    });
    return { spell, covered: by.length > 0, by };
  });
}
