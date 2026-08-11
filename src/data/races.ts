import type { SkillName } from '../model/types';

export interface RaceInfo {
  name: string;
  speedM: number;         // movement speed in metres
  darkvisionM: number;    // 0 = none
  size: 'Small' | 'Medium';
  subraces?: string[];
  skillGrants?: SkillName[];   // fixed proficiencies (e.g. Elf Perception)
  bonusSkillChoices?: number;  // extra free picks (Human versatility)
}

// Core BG3 races. Ability boosts in BG3 are player-assigned (stored on the
// Character as abilityBoosts), so they are not fixed here.
export const RACES: Record<string, RaceInfo> = {
  Human: {
    name: 'Human', speedM: 9, darkvisionM: 0, size: 'Medium',
    bonusSkillChoices: 1,
  },
  Elf: {
    name: 'Elf', speedM: 9, darkvisionM: 12, size: 'Medium',
    subraces: ['High Elf', 'Wood Elf'],
    skillGrants: ['Perception'],
  },
  Drow: {
    name: 'Drow', speedM: 9, darkvisionM: 24, size: 'Medium',
    subraces: ['Lolth-Sworn Drow', 'Seldarine Drow'],
    skillGrants: ['Perception'],
  },
  'Half-Elf': {
    name: 'Half-Elf', speedM: 9, darkvisionM: 12, size: 'Medium',
    subraces: ['High Half-Elf', 'Wood Half-Elf', 'Drow Half-Elf'],
  },
  Dwarf: {
    name: 'Dwarf', speedM: 9, darkvisionM: 12, size: 'Medium',
    subraces: ['Gold Dwarf', 'Shield Dwarf', 'Duergar'],
  },
  Halfling: {
    name: 'Halfling', speedM: 9, darkvisionM: 0, size: 'Small',
    subraces: ['Lightfoot Halfling', 'Strongheart Halfling'],
  },
  Gnome: {
    name: 'Gnome', speedM: 7.5, darkvisionM: 0, size: 'Small',
    subraces: ['Forest Gnome', 'Rock Gnome', 'Deep Gnome'],
  },
  Tiefling: {
    name: 'Tiefling', speedM: 9, darkvisionM: 12, size: 'Medium',
    subraces: ['Asmodeus Tiefling', 'Mephistopheles Tiefling', 'Zariel Tiefling'],
  },
  'Half-Orc': { name: 'Half-Orc', speedM: 9, darkvisionM: 12, size: 'Medium' },
  Githyanki: { name: 'Githyanki', speedM: 9, darkvisionM: 0, size: 'Medium' },
  Dragonborn: {
    name: 'Dragonborn', speedM: 9, darkvisionM: 0, size: 'Medium',
    subraces: [
      'Black Dragonborn', 'Blue Dragonborn', 'Brass Dragonborn', 'Bronze Dragonborn',
      'Copper Dragonborn', 'Gold Dragonborn', 'Green Dragonborn', 'Red Dragonborn',
      'Silver Dragonborn', 'White Dragonborn',
    ],
  },
};

export const RACE_NAMES = Object.keys(RACES);
