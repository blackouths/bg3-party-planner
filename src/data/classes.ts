import type { Ability, SkillName } from '../model/types';

export interface ClassInfo {
  name: string;
  hitDie: number;                       // d6/d8/d10/d12
  saveProficiencies: [Ability, Ability];
  spellcastingAbility?: Ability;        // for spell save DC / attack
  subclasses: string[];
  subclassLevel: number;                // class level at which subclass is chosen
  skillChoices: { count: number; from: SkillName[] | 'any' };
  // Utility spells this class reliably brings to a party, for coverage hints.
  // Conservative on purpose — coverage is a planning aid, not a full spell list.
  utilitySpells?: string[];
}

const ALL = 'any' as const;

export const CLASSES: Record<string, ClassInfo> = {
  Barbarian: {
    name: 'Barbarian', hitDie: 12, saveProficiencies: ['STR', 'CON'],
    subclasses: ['Berserker', 'Wildheart', 'Wild Magic', 'Giant'],
    subclassLevel: 3,
    skillChoices: { count: 2, from: ['Animal Handling', 'Athletics', 'Intimidation', 'Nature', 'Perception', 'Survival'] },
  },
  Bard: {
    name: 'Bard', hitDie: 8, saveProficiencies: ['DEX', 'CHA'],
    spellcastingAbility: 'CHA',
    subclasses: ['College of Lore', 'College of Valour', 'College of Swords', 'College of Glamour'],
    subclassLevel: 3,
    skillChoices: { count: 3, from: ALL },
    utilitySpells: ['Speak with Dead', 'Guidance'],
  },
  Cleric: {
    name: 'Cleric', hitDie: 8, saveProficiencies: ['WIS', 'CHA'],
    spellcastingAbility: 'WIS',
    subclasses: ['Life Domain', 'Light Domain', 'Trickery Domain', 'Knowledge Domain', 'Nature Domain', 'Tempest Domain', 'War Domain', 'Death Domain'],
    subclassLevel: 1,
    skillChoices: { count: 2, from: ['History', 'Insight', 'Medicine', 'Persuasion', 'Religion'] },
    utilitySpells: ['Guidance', 'Resistance', 'Speak with Dead', 'Lesser Restoration', 'Revivify'],
  },
  Druid: {
    name: 'Druid', hitDie: 8, saveProficiencies: ['INT', 'WIS'],
    spellcastingAbility: 'WIS',
    subclasses: ['Circle of the Land', 'Circle of the Moon', 'Circle of the Spores', 'Circle of Stars'],
    subclassLevel: 2,
    skillChoices: { count: 2, from: ['Arcana', 'Animal Handling', 'Insight', 'Medicine', 'Nature', 'Perception', 'Religion', 'Survival'] },
    utilitySpells: ['Speak with Animals', 'Enhance Leap', 'Lesser Restoration'],
  },
  Fighter: {
    name: 'Fighter', hitDie: 10, saveProficiencies: ['STR', 'CON'],
    subclasses: ['Battle Master', 'Eldritch Knight', 'Champion', 'Arcane Archer'],
    subclassLevel: 3,
    skillChoices: { count: 2, from: ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival'] },
  },
  Monk: {
    name: 'Monk', hitDie: 8, saveProficiencies: ['STR', 'DEX'],
    subclasses: ['Way of the Open Hand', 'Way of Shadow', 'Way of the Four Elements', 'Way of the Drunken Master'],
    subclassLevel: 3,
    skillChoices: { count: 2, from: ['Acrobatics', 'Athletics', 'History', 'Insight', 'Religion', 'Stealth'] },
  },
  Paladin: {
    name: 'Paladin', hitDie: 10, saveProficiencies: ['WIS', 'CHA'],
    spellcastingAbility: 'CHA',
    subclasses: ['Oath of Devotion', 'Oath of the Ancients', 'Oath of Vengeance', 'Oath of the Crown'],
    subclassLevel: 1,
    skillChoices: { count: 2, from: ['Athletics', 'Insight', 'Intimidation', 'Medicine', 'Persuasion', 'Religion'] },
    utilitySpells: ['Lesser Restoration'],
  },
  Ranger: {
    name: 'Ranger', hitDie: 10, saveProficiencies: ['STR', 'DEX'],
    spellcastingAbility: 'WIS',
    subclasses: ['Beast Master', 'Hunter', 'Gloom Stalker', 'Swarmkeeper'],
    subclassLevel: 3,
    skillChoices: { count: 3, from: ['Animal Handling', 'Athletics', 'Insight', 'Investigation', 'Nature', 'Perception', 'Stealth', 'Survival'] },
    utilitySpells: ['Speak with Animals', 'Longstrider'],
  },
  Rogue: {
    name: 'Rogue', hitDie: 8, saveProficiencies: ['DEX', 'INT'],
    subclasses: ['Thief', 'Arcane Trickster', 'Assassin', 'Swashbuckler'],
    subclassLevel: 3,
    skillChoices: { count: 4, from: ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Performance', 'Persuasion', 'Sleight of Hand', 'Stealth'] },
  },
  Sorcerer: {
    name: 'Sorcerer', hitDie: 6, saveProficiencies: ['CON', 'CHA'],
    spellcastingAbility: 'CHA',
    subclasses: ['Draconic Bloodline', 'Wild Magic', 'Storm Sorcery', 'Shadow Magic'],
    subclassLevel: 1,
    skillChoices: { count: 2, from: ['Arcana', 'Deception', 'Insight', 'Intimidation', 'Persuasion', 'Religion'] },
    utilitySpells: ['Feather Fall', 'Enhance Leap', 'Fly', 'Misty Step'],
  },
  Warlock: {
    name: 'Warlock', hitDie: 8, saveProficiencies: ['WIS', 'CHA'],
    spellcastingAbility: 'CHA',
    subclasses: ['The Fiend', 'The Great Old One', 'Archfey', 'Hexblade'],
    subclassLevel: 1,
    skillChoices: { count: 2, from: ['Arcana', 'Deception', 'History', 'Intimidation', 'Investigation', 'Nature', 'Religion'] },
    utilitySpells: ['Detect Thoughts', 'Fly'],
  },
  Wizard: {
    name: 'Wizard', hitDie: 6, saveProficiencies: ['INT', 'WIS'],
    spellcastingAbility: 'INT',
    subclasses: ['Abjuration', 'Conjuration', 'Divination', 'Enchantment', 'Evocation', 'Illusion', 'Necromancy', 'Transmutation', 'Bladesinging'],
    subclassLevel: 2,
    skillChoices: { count: 2, from: ['Arcana', 'History', 'Insight', 'Investigation', 'Medicine', 'Religion'] },
    utilitySpells: ['Feather Fall', 'Fly', 'Detect Thoughts', 'Longstrider', 'Misty Step'],
  },
};

export const CLASS_NAMES = Object.keys(CLASSES);

// Feat slots granted by a class at its own class levels.
export function featLevelsFor(className: string): number[] {
  const base = [4, 8, 12];
  if (className === 'Fighter') return [4, 6, 8, 12];
  if (className === 'Rogue') return [4, 8, 10, 12];
  return base;
}
