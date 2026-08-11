import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Ability, Character, GearSlotInstance, Party } from '../model/types';

// A blank level-1 character occupying a party slot.
export function createEmptyCharacter(id?: string): Character {
  const baseAbilities: Record<Ability, number> = {
    STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8,
  };
  return {
    id: id ?? newCharId(),
    origin: 'Tav',
    name: '',
    race: '',
    background: '',
    classes: [{ class: '', level: 1 }],
    baseAbilities,
    abilityBoosts: [],
    skillProficiencies: [],
    feats: [],
    buffs: [],
    spells: { known: [], prepared: [] },
    equipment: {},
  };
}

// Collision-safe across reloads (ids are persisted with the party).
function newCharId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? `char-${crypto.randomUUID().slice(0, 8)}`
    : `char-${Math.random().toString(36).slice(2, 10)}`;
}

const EMPTY_PARTY: Party = { members: [null, null, null, null] };

interface PartyState {
  party: Party;
  activeSlot: number; // which slot the Build/Gear views are editing
  setActiveSlot: (slot: number) => void;
  setParty: (party: Party) => void;
  resetParty: () => void;
  addMember: (slot: number) => void;
  removeMember: (slot: number) => void;
  updateMember: (slot: number, patch: Partial<Character>) => void;
  equipItem: (slot: number, gearSlot: GearSlotInstance, itemId: string) => void;
  unequipItem: (slot: number, gearSlot: GearSlotInstance) => void;
}

export const usePartyStore = create<PartyState>()(
  persist(
    (set) => ({
      party: EMPTY_PARTY,
      activeSlot: 0,

      setActiveSlot: (slot) => set({ activeSlot: slot }),

      setParty: (party) => set({ party }),

      resetParty: () => set({ party: EMPTY_PARTY, activeSlot: 0 }),

      addMember: (slot) =>
        set((state) => {
          const members = [...state.party.members];
          if (!members[slot]) members[slot] = createEmptyCharacter();
          return { party: { members } };
        }),

      removeMember: (slot) =>
        set((state) => {
          const members = [...state.party.members];
          members[slot] = null;
          return { party: { members } };
        }),

      updateMember: (slot, patch) =>
        set((state) => {
          const members = [...state.party.members];
          const current = members[slot];
          if (current) members[slot] = { ...current, ...patch };
          return { party: { members } };
        }),

      equipItem: (slot, gearSlot, itemId) =>
        set((state) => {
          const members = [...state.party.members];
          const current = members[slot];
          if (current) {
            members[slot] = {
              ...current,
              equipment: { ...current.equipment, [gearSlot]: itemId },
            };
          }
          return { party: { members } };
        }),

      unequipItem: (slot, gearSlot) =>
        set((state) => {
          const members = [...state.party.members];
          const current = members[slot];
          if (current) {
            const equipment = { ...current.equipment };
            delete equipment[gearSlot];
            members[slot] = { ...current, equipment };
          }
          return { party: { members } };
        }),
    }),
    {
      name: 'bg3-party-planner',
      version: 3,
      partialize: (state) => ({ party: state.party }),
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as { party?: Party };
        if (state?.party?.members) {
          for (const m of state.party.members) {
            if (!m) continue;
            if (version < 2) {
              // v1 stored feats as string[]; v2 uses FeatSelection objects.
              m.feats = (m.feats as unknown[]).map((f) =>
                typeof f === 'string' ? { name: f } : (f as Character['feats'][number]),
              );
            }
            if (version < 3) {
              // v3 added permanent buffs.
              m.buffs = m.buffs ?? [];
            }
          }
        }
        return state as { party: Party };
      },
    },
  ),
);
