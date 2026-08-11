// Master lists for the party coverage panels (modelled on EIP's planner).

// Dialogue tags that can unlock unique dialogue options. A party "covers" a tag
// if any member's race/subrace/class/subclass/origin/background matches it.
export const DIALOGUE_TAGS: string[] = [
  // Origins / companions
  'Astarion', 'Gale', 'Karlach', "Lae'zel", 'Shadowheart', 'Wyll',
  'Dark Urge', 'Halsin', 'Jaheira', 'Minsc', 'Minthara',
  // Races & subraces
  'Human', 'Elf', 'High Elf', 'Wood Elf', 'Drow', 'Half-Elf', 'Half-Orc',
  'Dwarf', 'Gold Dwarf', 'Shield Dwarf', 'Duergar', 'Deep Gnome',
  'Forest Gnome', 'Rock Gnome', 'Gnome', 'Halfling', 'Lightfoot Halfling',
  'Strongheart Halfling', 'Tiefling', 'Zariel Tiefling',
  'Mephistopheles Tiefling', 'Dragonborn', 'Githyanki',
  // Classes
  'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 'Paladin',
  'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard',
  // Subclass / oath flavour
  'Berserker', 'Oath of Devotion', 'Oath of the Ancients', 'Oath of Vengeance',
  'Oathbreaker', 'Draconic Bloodline', 'Great Old One', 'The Fiend', 'Archfey',
  // Backgrounds / factions
  'Baldurian', 'Lolth-Sworn', 'Underdark',
  // Deities (typically via Cleric/companion)
  'Selune', 'Shar', 'Lolth', 'Mystra', 'Bahamut', 'Tiamat', 'Helm', 'Ilmater',
  'Lathander', 'Tempus', 'Tyr', 'Oghma', 'Corellon Larethian', 'Mielikki',
  'Moradin', 'Garl Glittergold', 'Yondalla', 'Gruumsh', 'Kelemvor', 'Tymora',
  'Talos', 'Seldarine',
];

// Key utility spells a well-rounded party wants access to.
export const UTILITY_SPELLS: string[] = [
  'Speak with Dead', 'Speak with Animals', 'Guidance', 'Resistance',
  'Detect Thoughts', 'Feather Fall', 'Enhance Leap', 'Fly',
  'Misty Step', 'Lesser Restoration', 'Revivify', 'Longstrider',
];

// Consumables / tools worth carrying (checked manually by the player for now).
export const PREP_ITEMS: string[] = [
  'Shovel', "Thieves' Tools", 'Trap Disarm Kit', 'Scroll of Revivify',
  'Healing Potions', ' Smokepowder / barrels',
];
