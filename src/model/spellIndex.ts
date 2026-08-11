import spellsData from '../data/spells.json';

// Scraped player-castable spells (see scripts note in scrape-items.mjs).
export interface SpellData {
  name: string;
  level: number;          // 0 = cantrip
  school: string;
  classes: string[];      // classes that learn it (empty = subclass/special)
  concentration: boolean;
  ritual: boolean;
  save?: string;
  damage?: string;
}

export const SPELLS = (spellsData as SpellData[]).filter((s) => s.level <= 6);

export const spellByName = new Map(SPELLS.map((s) => [s.name.toLowerCase(), s]));
