import type { Character, MagicItem, ParsedEffect, Party } from '../types';
import { getItem } from '../itemIndex';
import { CONSUMABLE_SLOTS } from '../../data/gearSlots';

// Resolve the concrete MagicItems a character has equipped.
export function equippedItems(character: Character): MagicItem[] {
  const items: MagicItem[] = [];
  for (const id of Object.values(character.equipment)) {
    const item = getItem(id);
    if (item) items.push(item);
  }
  return items;
}

// Flatten all parsed effects granted by a character's equipped gear.
export function gearEffects(character: Character): ParsedEffect[] {
  return equippedItems(character).flatMap((item) => item.effects);
}

export interface GearConflict {
  itemId: string;
  name: string;
  holders: { member: string; gearSlot: string }[];
}

// BG3 magic items are almost all unique per playthrough, so the same item
// equipped in two places is impossible in-game. Flag any itemId used more than
// once across the party (including twice on one character, e.g. both rings).
export function partyGearConflicts(party: Party): GearConflict[] {
  const uses = new Map<string, { member: string; gearSlot: string }[]>();

  party.members.forEach((member, i) => {
    if (!member) return;
    const who = member.name || `Slot ${i + 1}`;
    for (const [gearSlot, itemId] of Object.entries(member.equipment)) {
      if (!itemId) continue;
      // Elixirs/coatings are stockpileable — the whole party can run the same one.
      if (CONSUMABLE_SLOTS.has(gearSlot)) continue;
      const list = uses.get(itemId) ?? [];
      list.push({ member: who, gearSlot });
      uses.set(itemId, list);
    }
  });

  const conflicts: GearConflict[] = [];
  for (const [itemId, holders] of uses) {
    if (holders.length > 1) {
      conflicts.push({ itemId, name: getItem(itemId)?.name ?? itemId, holders });
    }
  }
  return conflicts;
}
