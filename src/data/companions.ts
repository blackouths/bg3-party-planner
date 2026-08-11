import type { Ability, Character } from '../model/types';
import { ABILITIES } from '../model/types';

// Canonical companion starting builds (stats from the bg3.wiki creatures
// table; class/subclass/background from their companion pages). Subclass is
// set only where the class picks it at level 1.
export interface CompanionPreset {
  race: string;
  subrace?: string;
  background: string;
  class: string;
  subclass?: string;
  abilities: Record<Ability, number>; // final scores incl. the default +2/+1
}

export const COMPANION_PRESETS: Record<string, CompanionPreset> = {
  Astarion: {
    race: 'Elf', subrace: 'High Elf', background: 'Charlatan', class: 'Rogue',
    abilities: { STR: 8, DEX: 17, CON: 14, INT: 13, WIS: 13, CHA: 10 },
  },
  Gale: {
    race: 'Human', background: 'Sage', class: 'Wizard',
    abilities: { STR: 8, DEX: 13, CON: 15, INT: 17, WIS: 10, CHA: 12 },
  },
  Halsin: {
    race: 'Elf', subrace: 'Wood Elf', background: 'Outlander', class: 'Druid',
    abilities: { STR: 10, DEX: 14, CON: 14, INT: 8, WIS: 17, CHA: 12 },
  },
  Jaheira: {
    race: 'Half-Elf', subrace: 'High Half-Elf', background: 'Soldier', class: 'Druid',
    abilities: { STR: 10, DEX: 14, CON: 14, INT: 8, WIS: 17, CHA: 12 },
  },
  Karlach: {
    race: 'Tiefling', subrace: 'Zariel Tiefling', background: 'Outlander', class: 'Barbarian',
    abilities: { STR: 17, DEX: 13, CON: 15, INT: 8, WIS: 12, CHA: 10 },
  },
  "Lae'zel": {
    race: 'Githyanki', background: 'Soldier', class: 'Fighter',
    abilities: { STR: 17, DEX: 13, CON: 15, INT: 10, WIS: 12, CHA: 8 },
  },
  Minsc: {
    race: 'Human', background: 'Folk Hero', class: 'Ranger',
    abilities: { STR: 12, DEX: 17, CON: 13, INT: 8, WIS: 15, CHA: 10 },
  },
  Shadowheart: {
    race: 'Half-Elf', subrace: 'High Half-Elf', background: 'Acolyte',
    class: 'Cleric', subclass: 'Trickery Domain',
    abilities: { STR: 13, DEX: 13, CON: 14, INT: 10, WIS: 17, CHA: 8 },
  },
  Wyll: {
    race: 'Human', background: 'Folk Hero', class: 'Warlock', subclass: 'The Fiend',
    abilities: { STR: 8, DEX: 13, CON: 14, INT: 13, WIS: 10, CHA: 17 },
  },
  Minthara: {
    race: 'Drow', subrace: 'Lolth-Sworn Drow', background: 'Noble',
    class: 'Paladin', subclass: 'Oath of Vengeance',
    abilities: { STR: 16, DEX: 15, CON: 14, INT: 10, WIS: 12, CHA: 17 },
  },
};

// Split final scores into point-buy base + racial +2/+1 on the two highest
// stats (matching the in-game default distribution). Bases are clamped to the
// point-buy range; recruited-enemy companions (Minthara) exceed strict
// point-buy totals, which the planner tolerates.
export function presetPatch(preset: CompanionPreset): Partial<Character> {
  const sorted = [...ABILITIES].sort(
    (a, b) => preset.abilities[b] - preset.abilities[a],
  );
  const boost2 = sorted[0];
  const boost1 = sorted[1];

  const baseAbilities = {} as Record<Ability, number>;
  for (const a of ABILITIES) {
    const boost = a === boost2 ? 2 : a === boost1 ? 1 : 0;
    baseAbilities[a] = Math.min(15, Math.max(8, preset.abilities[a] - boost));
  }

  return {
    race: preset.race,
    subrace: preset.subrace,
    background: preset.background,
    classes: [{ class: preset.class, subclass: preset.subclass, level: 1 }],
    baseAbilities,
    abilityBoosts: [
      { ability: boost2, value: 2, origin: 'race' },
      { ability: boost1, value: 1, origin: 'race' },
    ],
    skillProficiencies: [],
    feats: [],
  };
}
