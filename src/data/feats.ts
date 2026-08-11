import type { Ability } from '../model/types';

export interface FeatInfo {
  name: string;
  description: string;
  // Ability picks the feat grants (+1 each). ASI = 2 picks (repeat = +2);
  // half-feats = 1 pick. `from` restricts the options where BG3 does.
  abilityPicks?: number;
  from?: Ability[];
  repeatable?: boolean;
}

// BG3's feat list (Patch 8). Descriptions abridged; mechanical effects the
// engine models: ability picks, Alert (+5 init), Tough (+2 HP/level),
// Resilient (save proficiency), Skilled (+3 skill proficiencies).
export const FEATS: FeatInfo[] = [
  { name: 'Ability Improvement', description: 'Increase one ability by 2, or two abilities by 1 (max 20).', abilityPicks: 2, repeatable: true },
  { name: 'Actor', description: 'Charisma +1; Proficiency doubled for Deception and Performance.', abilityPicks: 1, from: ['CHA'] },
  { name: 'Alert', description: '+5 bonus to Initiative; cannot be Surprised.' },
  { name: 'Athlete', description: 'Strength or Dexterity +1; standing up from Prone costs less movement; jump distance +50%.', abilityPicks: 1, from: ['STR', 'DEX'] },
  { name: 'Charger', description: 'Gain Charge weapon actions after Dashing.' },
  { name: 'Crossbow Expert', description: 'No Disadvantage on crossbow shots in melee; piercing shots against nearby targets.' },
  { name: 'Defensive Duellist', description: 'Reaction: add Proficiency Bonus to AC against a melee attack while wielding a finesse weapon.' },
  { name: 'Dual Wielder', description: 'Fight with two non-light weapons; +1 AC while dual wielding.' },
  { name: 'Dungeon Delver', description: 'Advantage on detecting and saving against traps; resistance to trap damage.' },
  { name: 'Durable', description: 'Constitution +1; regain full HP on Short Rest.', abilityPicks: 1, from: ['CON'] },
  { name: 'Elemental Adept', description: 'Chosen element ignores resistance; damage rolls of 1 become 2.', repeatable: true },
  { name: 'Great Weapon Master', description: 'Bonus-action attack on kill/crit; -5 attack for +10 damage with heavy weapons.' },
  { name: 'Heavily Armoured', description: 'Strength +1; gain Heavy Armour proficiency.', abilityPicks: 1, from: ['STR'] },
  { name: 'Heavy Armour Master', description: 'Strength +1; incoming non-magical damage reduced by 3 in heavy armour.', abilityPicks: 1, from: ['STR'] },
  { name: 'Lightly Armoured', description: 'Strength or Dexterity +1; gain Light Armour proficiency.', abilityPicks: 1, from: ['STR', 'DEX'] },
  { name: 'Lucky', description: '3 Luck Points: advantage on rolls or force enemy re-rolls.' },
  { name: 'Mage Slayer', description: 'Attack casters as a reaction; advantage on saves vs. spells cast within melee range.' },
  { name: 'Magic Initiate: Bard', description: 'Learn two Bard cantrips and a level 1 Bard spell.' },
  { name: 'Magic Initiate: Cleric', description: 'Learn two Cleric cantrips and a level 1 Cleric spell.' },
  { name: 'Magic Initiate: Druid', description: 'Learn two Druid cantrips and a level 1 Druid spell.' },
  { name: 'Magic Initiate: Sorcerer', description: 'Learn two Sorcerer cantrips and a level 1 Sorcerer spell.' },
  { name: 'Magic Initiate: Warlock', description: 'Learn two Warlock cantrips and a level 1 Warlock spell.' },
  { name: 'Magic Initiate: Wizard', description: 'Learn two Wizard cantrips and a level 1 Wizard spell.' },
  { name: 'Martial Adept', description: 'Learn two Battle Master manoeuvres and gain a superiority die.' },
  { name: 'Medium Armour Master', description: 'No Stealth disadvantage in medium armour; Dex AC bonus cap raised to +3.' },
  { name: 'Mobile', description: 'Movement speed +3 m; Dash over difficult terrain freely; avoid opportunity attacks from targets you attacked.' },
  { name: 'Moderately Armoured', description: 'Strength or Dexterity +1; gain Medium Armour and Shield proficiency.', abilityPicks: 1, from: ['STR', 'DEX'] },
  { name: 'Performer', description: 'Charisma +1; gain Musical Instrument proficiency.', abilityPicks: 1, from: ['CHA'] },
  { name: 'Polearm Master', description: 'Bonus attack with polearm butt; opportunity attacks when enemies enter your reach.' },
  { name: 'Resilient', description: '+1 to a chosen ability and gain Saving Throw proficiency in it.', abilityPicks: 1, repeatable: true },
  { name: 'Ritual Caster', description: 'Learn two ritual spells.' },
  { name: 'Savage Attacker', description: 'Roll melee weapon damage twice, use the higher result.' },
  { name: 'Sentinel', description: 'Opportunity attacks stop movement; react to attacks on nearby allies.' },
  { name: 'Sharpshooter', description: 'No high-ground penalty; -5 attack for +10 damage with ranged weapons.' },
  { name: 'Shield Master', description: '+2 to Dexterity saves with a shield; block spell damage with your shield.' },
  { name: 'Skilled', description: 'Gain Proficiency in three skills of your choice.', repeatable: true },
  { name: 'Spell Sniper', description: 'Learn a cantrip; spell attacks crit on 19-20.' },
  { name: 'Tavern Brawler', description: 'Strength or Constitution +1; Strength modifier added twice to unarmed/improvised attacks.', abilityPicks: 1, from: ['STR', 'CON'] },
  { name: 'Tough', description: 'Maximum HP increased by 2 per level.' },
  { name: 'War Caster', description: 'Advantage on Concentration saves; cast Shocking Grasp as an opportunity attack.' },
  { name: 'Weapon Master', description: 'Strength or Dexterity +1; gain proficiency with four weapons.', abilityPicks: 1, from: ['STR', 'DEX'] },
];

export const FEAT_BY_NAME = new Map(FEATS.map((f) => [f.name, f]));
