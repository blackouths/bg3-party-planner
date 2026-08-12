import type { MagicItem } from './types';
import itemsData from '../data/items.json';
import consumablesData from '../data/consumables.json';

// The scraped magic-item database (see scripts/scrape-items.mjs) plus
// planned consumables (elixirs, weapon coatings).
export const ITEMS = [
  ...(itemsData as unknown as MagicItem[]),
  ...(consumablesData as unknown as MagicItem[]),
];

export const itemById = new Map<string, MagicItem>(
  ITEMS.map((item) => [item.id, item]),
);

export function getItem(id: string | undefined): MagicItem | undefined {
  return id ? itemById.get(id) : undefined;
}
