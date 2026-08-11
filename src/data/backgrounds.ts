import type { SkillName } from '../model/types';

// BG3 backgrounds and the two skill proficiencies each grants.
export const BACKGROUNDS: Record<string, SkillName[]> = {
  Acolyte: ['Insight', 'Religion'],
  Charlatan: ['Deception', 'Sleight of Hand'],
  Criminal: ['Deception', 'Stealth'],
  Entertainer: ['Acrobatics', 'Performance'],
  'Folk Hero': ['Animal Handling', 'Survival'],
  'Guild Artisan': ['Insight', 'Persuasion'],
  'Haunted One': ['Medicine', 'Intimidation'], // Dark Urge only
  Noble: ['History', 'Persuasion'],
  Outlander: ['Athletics', 'Survival'],
  Sage: ['Arcana', 'History'],
  Sailor: ['Athletics', 'Perception'],
  Soldier: ['Athletics', 'Intimidation'],
  Urchin: ['Sleight of Hand', 'Stealth'],
};

export const BACKGROUND_NAMES = Object.keys(BACKGROUNDS);
