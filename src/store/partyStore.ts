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
    campBuffs: [],
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

const EMPTY_PARTY: Party = { members: [null, null, null, null], wishlist: [] };

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
  toggleWishlist: (itemId: string) => void;
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
          return { party: { ...state.party, members } };
        }),

      removeMember: (slot) =>
        set((state) => {
          const members = [...state.party.members];
          members[slot] = null;
          return { party: { ...state.party, members } };
        }),

      updateMember: (slot, patch) =>
        set((state) => {
          const members = [...state.party.members];
          const current = members[slot];
          if (current) members[slot] = { ...current, ...patch };
          return { party: { ...state.party, members } };
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
          return { party: { ...state.party, members } };
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
          return { party: { ...state.party, members } };
        }),

      toggleWishlist: (itemId) =>
        set((state) => {
          const list = state.party.wishlist ?? [];
          const wishlist = list.includes(itemId)
            ? list.filter((id) => id !== itemId)
            : [...list, itemId];
          return { party: { ...state.party, wishlist } };
        }),
    }),
    {
      name: 'bg3-party-planner',
      version: 4,
      partialize: (state) => ({ party: state.party }),
      // Normalize on every rehydrate: guarantees array/object fields exist even
      // if storage drifted (e.g. persisted mid-HMR before a migration bumped).
      merge: (persisted, current) => {
        const p = persisted as { party?: Party } | undefined;
        if (p?.party) p.party.wishlist = p.party.wishlist ?? [];
        if (p?.party?.members) {
          for (const m of p.party.members) {
            if (!m) continue;
            m.feats = m.feats ?? [];
            m.buffs = m.buffs ?? [];
            m.campBuffs = m.campBuffs ?? [];
            m.abilityBoosts = m.abilityBoosts ?? [];
            m.skillProficiencies = m.skillProficiencies ?? [];
            m.spells = m.spells ?? { known: [], prepared: [] };
            m.equipment = m.equipment ?? {};
          }
        }
        return { ...current, ...p };
      },
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
            if (version < 4) {
              // v4 added camp-cast buffs.
              m.campBuffs = m.campBuffs ?? [];
            }
          }
        }
        return state as { party: Party };
      },
    },
  ),
);
