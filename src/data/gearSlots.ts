import type { EquipSlot, GearSlotInstance } from '../model/types';

// The concrete equip slots a character has, in display order, and which
// item EquipSlot each accepts from the item database.
export interface GearSlotDef {
  slot: GearSlotInstance;
  label: string;
  accepts: EquipSlot;
}

export const GEAR_SLOTS: GearSlotDef[] = [
  { slot: 'Head', label: 'Head', accepts: 'Head' },
  { slot: 'Cloak', label: 'Cloak', accepts: 'Cloak' },
  { slot: 'Amulet', label: 'Amulet', accepts: 'Amulet' },
  { slot: 'Chest', label: 'Armour', accepts: 'Chest' },
  { slot: 'Gloves', label: 'Gloves', accepts: 'Gloves' },
  { slot: 'Boots', label: 'Boots', accepts: 'Boots' },
  { slot: 'Ring1', label: 'Ring 1', accepts: 'Ring' },
  { slot: 'Ring2', label: 'Ring 2', accepts: 'Ring' },
  { slot: 'MeleeMain', label: 'Melee (main)', accepts: 'MeleeWeapon' },
  { slot: 'MeleeOff', label: 'Melee (off)', accepts: 'MeleeWeapon' },
  { slot: 'RangedMain', label: 'Ranged', accepts: 'RangedWeapon' },
  { slot: 'Shield', label: 'Shield', accepts: 'Shield' },
];
