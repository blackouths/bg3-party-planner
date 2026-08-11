// ============================================================================
// Core domain types for the BG3 Party Planner (Honor Mode).
// See memory: data-architecture. Rules data is static; Character/Party is user state.
// ============================================================================

// ---------- Primitives ----------

export type Ability = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

export const ABILITIES: Ability[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

export type SkillName =
  | 'Acrobatics' | 'Animal Handling' | 'Arcana' | 'Athletics' | 'Deception'
  | 'History' | 'Insight' | 'Intimidation' | 'Investigation' | 'Medicine'
  | 'Nature' | 'Perception' | 'Performance' | 'Persuasion' | 'Religion'
  | 'Sleight of Hand' | 'Stealth' | 'Survival';

export type Rarity =
  | 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Legendary' | 'Story';

export type Act = 'Act 1' | 'Act 2' | 'Act 3';

// The physical inventory slots a character equips into. Weapons/rings have two
// instances each (handled at the Character.equipment level).
export type EquipSlot =
  | 'MeleeWeapon' | 'RangedWeapon' | 'Shield'
  | 'Head' | 'Cloak' | 'Chest' | 'Gloves' | 'Boots'
  | 'Amulet' | 'Ring' | 'Instrument';

// Concrete slot instances a Character equips into (two rings, main/off hand).
export type GearSlotInstance =
  | 'MeleeMain' | 'MeleeOff' | 'RangedMain' | 'RangedOff' | 'Shield'
  | 'Head' | 'Cloak' | 'Chest' | 'Gloves' | 'Boots'
  | 'Amulet' | 'Ring1' | 'Ring2' | 'Instrument';

// ---------- Magic items (scraped from bg3.wiki -> src/data/items.json) ----------

// Machine-readable subset of an item's effects, used for scoring & coverage.
// Everything not modeled here stays as prose in MagicItem.effectsText.
export type ParsedEffect =
  | { kind: 'acBonus'; value: number }
  | { kind: 'abilitySet'; ability: Ability; value: number }
  | { kind: 'abilityBonus'; ability: Ability; value: number }
  | { kind: 'saveBonus'; ability: Ability | 'all'; value: number }
  | { kind: 'skillBonus'; skill: SkillName; value: number }
  | { kind: 'resistance'; damage: string }
  | { kind: 'grantsSpell'; spell: string; recharge: 'short' | 'long' | 'none' }
  | { kind: 'advantage'; on: string };

export interface ItemSource {
  act?: Act;
  where: string;        // "Carried by Commander Zhalk on the Nautiloid"
  location?: string;    // "Nautiloid  X:-53 Y:-391"
  missable?: boolean;
}

export interface MagicItem {
  id: string;           // slug of the wiki page name
  name: string;
  slot: EquipSlot;
  itemType: string;     // "Heavy Armour", "Longsword", "Hand Crossbow", "Rings"...
  rarity: Rarity;
  weightKg?: number;
  price?: number;
  requirements?: {
    proficiency?: string;   // "Heavy Armour" / "Medium Armour" / "Shields"
    strength?: number;      // some heavy armour has a STR requirement
    class?: string[];
    armourClass?: string;   // raw base AC for armour, e.g. "14" (informational)
  };
  // Present on weapons (slot MeleeWeapon/RangedWeapon).
  weapon?: {
    category: string;       // simple | martial
    handedness: string;     // one-handed | two-handed | versatile
    meleeOrRanged: string;  // melee | ranged
    damage: string;
    damageType: string;
    finesse: boolean;
  };
  effectsText: string[];    // human-readable, verbatim from wiki (always shown)
  effects: ParsedEffect[];  // structured subset, for scoring & coverage
  terms?: string[];         // glossary terms referenced (for hover tooltips)
  source: ItemSource;
  wikiUrl?: string;
}

// A glossary entry (passive / spell / weapon action) for effect tooltips.
export interface GlossaryEntry {
  name: string;
  type: 'passive' | 'spell' | 'action';
  description: string;
  recharge?: string;
}

// ---------- Character & Party (user-authored state) ----------

export interface ClassLevel {
  class: string;
  subclass?: string;
  level: number;        // levels invested in THIS class; sum across entries <= 12
}

export interface AbilityBoost {
  ability: Ability;
  value: number;
  origin: 'race' | 'feat' | 'asi' | 'item';
}

// A chosen feat. `abilities` holds the +1 picks for ASI (two picks, may repeat
// for +2) and half-feats (one pick); empty/absent for feats with no ability choice.
export interface FeatSelection {
  name: string;
  abilities?: Ability[];
}

// A selected permanent buff (see data/buffs.ts). `ability` is the chosen
// ability for buffs with a player-chosen bonus (Ethel's Hair, Mirror of Loss).
export interface BuffSelection {
  id: string;
  ability?: Ability;
}

export interface Character {
  id: string;
  origin: string;                 // Tav / Dark Urge / Shadowheart / ...
  name: string;
  race: string;
  subrace?: string;
  background: string;
  classes: ClassLevel[];          // ordered; first entry is the starting class
  baseAbilities: Record<Ability, number>;  // point-buy result, pre-race
  abilityBoosts: AbilityBoost[];  // racial +2/+1, feats/ASI (item boosts derived, not stored)
  skillProficiencies: SkillName[];
  feats: FeatSelection[];
  buffs: BuffSelection[];       // permanent bonuses (Zaith'isk, Ethel's hair...)
  spells: { known: string[]; prepared: string[] };
  equipment: Partial<Record<GearSlotInstance, string>>; // GearSlotInstance -> MagicItem.id
}

export interface Party {
  members: (Character | null)[];  // fixed length 4
}
