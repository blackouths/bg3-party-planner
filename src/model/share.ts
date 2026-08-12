import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';
import type { Character, Party } from './types';
import { createEmptyCharacter } from '../store/partyStore';

// Versioned payload so future schema changes can migrate old links.
const VERSION = 1;

export function encodeParty(party: Party): string {
  return compressToEncodedURIComponent(JSON.stringify({ v: VERSION, party }));
}

export function buildShareUrl(party: Party): string {
  return `${location.origin}${location.pathname}#p=${encodeParty(party)}`;
}

// Returns the party encoded in a share code, or null if invalid/corrupt.
export function decodeParty(code: string): Party | null {
  try {
    const json = decompressFromEncodedURIComponent(code);
    if (!json) return null;
    const payload = JSON.parse(json);
    if (payload?.v !== VERSION || !Array.isArray(payload?.party?.members)) return null;

    const members = payload.party.members
      .slice(0, 4)
      .map((m: unknown) => sanitizeMember(m));
    while (members.length < 4) members.push(null);
    return { members };
  } catch {
    return null;
  }
}

// Merge an untrusted member object over a fresh character so missing or
// malformed fields fall back to sane defaults.
function sanitizeMember(raw: unknown): Character | null {
  if (!raw || typeof raw !== 'object') return null;
  const m = raw as Partial<Character>;
  const base = createEmptyCharacter(typeof m.id === 'string' ? m.id : undefined);
  return {
    ...base,
    ...(typeof m.origin === 'string' && { origin: m.origin }),
    ...(typeof m.name === 'string' && { name: m.name }),
    ...(typeof m.race === 'string' && { race: m.race }),
    ...(typeof m.subrace === 'string' && { subrace: m.subrace }),
    ...(typeof m.background === 'string' && { background: m.background }),
    ...(typeof m.deity === 'string' && { deity: m.deity }),
    classes: Array.isArray(m.classes) && m.classes.length ? m.classes : base.classes,
    baseAbilities: { ...base.baseAbilities, ...(m.baseAbilities ?? {}) },
    abilityBoosts: Array.isArray(m.abilityBoosts) ? m.abilityBoosts : [],
    skillProficiencies: Array.isArray(m.skillProficiencies) ? m.skillProficiencies : [],
    // Accept v1 links where feats were plain strings.
    feats: Array.isArray(m.feats)
      ? (m.feats as unknown[]).map((f) =>
          typeof f === 'string' ? { name: f } : (f as Character['feats'][number]),
        ).filter((f) => f && typeof f.name === 'string')
      : [],
    buffs: Array.isArray(m.buffs)
      ? (m.buffs as Character['buffs']).filter((b) => b && typeof b.id === 'string')
      : [],
    spells: {
      known: Array.isArray(m.spells?.known) ? m.spells.known : [],
      prepared: Array.isArray(m.spells?.prepared) ? m.spells.prepared : [],
    },
    equipment: m.equipment && typeof m.equipment === 'object' ? m.equipment : {},
  };
}

// Reads a share code from the URL hash (#p=...), if present.
export function readShareCodeFromUrl(): string | null {
  const match = location.hash.match(/^#p=(.+)$/);
  return match ? match[1] : null;
}

export function clearShareCodeFromUrl(): void {
  history.replaceState(null, '', location.pathname + location.search);
}
