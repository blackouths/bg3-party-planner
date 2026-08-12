import type { ParsedEffect } from '../model/types';

// Long-duration (until long rest), non-concentration buffs that a caster
// left at camp can put on the party before adventuring — standard Honor Mode
// practice. Concentration spells are excluded: the camp caster would have to
// hold concentration all day, which is not a dependable plan.
export interface CampBuff {
  id: string;
  name: string;
  caster: string;             // who can supply it (class + spell level)
  description: string;
  effects?: ParsedEffect[];   // structured subset the engine applies
  upcast?: {                  // for scalable spells (Aid)
    minLevel: number;
    maxLevel: number;
    hpPerLevel: number;       // extra max HP per slot level above minLevel
  };
  note?: string;
}

export const CAMP_BUFFS: CampBuff[] = [
  {
    id: 'heroes-feast', name: "Heroes' Feast", caster: 'Cleric 6',
    description: '+12 maximum hit points, immunity to Poisoned and Frightened, and advantage on Wisdom saving throws until the next long rest.',
    effects: [{ kind: 'maxHpBonus', value: 12 }],
    note: 'The single best camp cast in the game — one level-6 slot buffs the whole party.',
  },
  {
    id: 'aid', name: 'Aid', caster: 'Cleric / Paladin 2',
    description: 'Increases current and maximum hit points of all nearby allies. +5 HP at level 2, +5 more per higher slot level.',
    effects: [{ kind: 'maxHpBonus', value: 5 }],
    upcast: { minLevel: 2, maxLevel: 6, hpPerLevel: 5 },
    note: 'Camp casters have spare high slots — cast at the highest level available.',
  },
  {
    id: 'warding-bond', name: 'Warding Bond', caster: 'Cleric 2',
    description: '+1 AC, +1 to saving throws, and resistance to all damage. The caster takes the same damage the warded creature suffers.',
    effects: [
      { kind: 'acBonus', value: 1 },
      { kind: 'saveBonus', ability: 'all', value: 1 },
      { kind: 'resistance', damage: 'All (shared with caster)' },
    ],
    note: 'One bond per camp caster — hirelings each maintain one. The camp caster CAN die from shared damage in Honor Mode; keep their HP topped up.',
  },
  {
    id: 'death-ward', name: 'Death Ward', caster: 'Cleric / Paladin 4',
    description: 'The first time the target would drop to 0 hit points, it drops to 1 instead. Lasts until long rest.',
    note: 'A free death save — quietly one of the strongest Honor Mode safety nets.',
  },
  {
    id: 'longstrider', name: 'Longstrider', caster: 'Druid / Ranger / Wizard 1 (ritual)',
    description: 'Movement speed +3 m until long rest.',
    effects: [{ kind: 'speedBonus', valueM: 3 }],
    note: 'Ritual — costs no spell slot. There is no reason not to have this on everyone.',
  },
  {
    id: 'freedom-of-movement', name: 'Freedom of Movement', caster: 'Cleric / Druid / Ranger 4',
    description: 'Immune to Difficult Terrain, and cannot be Paralysed or Restrained by hostile effects.',
    note: 'Hard-counters web, ice, vines, and hold effects.',
  },
  {
    id: 'protection-from-poison', name: 'Protection from Poison', caster: 'Cleric / Druid / Paladin / Ranger 2',
    description: 'Neutralises poison and grants resistance to Poison damage until long rest.',
    effects: [{ kind: 'resistance', damage: 'Poison' }],
  },
];

export const CAMP_BUFF_BY_ID = new Map(CAMP_BUFFS.map((b) => [b.id, b]));
