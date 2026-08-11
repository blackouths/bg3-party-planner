import type { MagicItem } from './types';
import itemsData from '../data/items.json';

// The scraped magic-item database (see scripts/scrape-items.mjs).
export const ITEMS = itemsData as unknown as MagicItem[];

export const itemById = new Map<string, MagicItem>(
  ITEMS.map((item) => [item.id, item]),
);

export function getItem(id: string | undefined): MagicItem | undefined {
  return id ? itemById.get(id) : undefined;
}
