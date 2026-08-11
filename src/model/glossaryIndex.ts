import type { GlossaryEntry } from './types';
import glossaryData from '../data/glossary.json';

// Scraped glossary of passives / spells / actions, keyed by lowercased name.
export const GLOSSARY = glossaryData as unknown as Record<string, GlossaryEntry>;

export function lookupTerm(name: string): GlossaryEntry | undefined {
  return GLOSSARY[name.trim().toLowerCase()];
}

// Generic words that collide with glossary entries in prose ("opening volley",
// "charge-up turn", "Bone Shield", "fire resistance") — never auto-link these.
const DETECT_BLOCKLIST = new Set(['charge', 'resistance', 'shield', 'volley', 'duelling']);
const MIN_TERM_LENGTH = 6;

const detectCache = new Map<string, string[]>();

// Find glossary terms mentioned in arbitrary text (word-boundary matched).
// Used for hand-written prose like boss cards, where no per-item terms list
// exists. Results are memoized per text.
export function detectTerms(text: string): string[] {
  const cached = detectCache.get(text);
  if (cached) return cached;

  const found: string[] = [];
  for (const [key, entry] of Object.entries(GLOSSARY)) {
    if (key.length < MIN_TERM_LENGTH || DETECT_BLOCKLIST.has(key)) continue;
    const re = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (re.test(text)) found.push(entry.name);
  }
  detectCache.set(text, found);
  return found;
}
