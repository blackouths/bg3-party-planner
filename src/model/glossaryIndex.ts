import type { GlossaryEntry } from './types';
import glossaryData from '../data/glossary.json';

// Scraped glossary of passives / spells / actions, keyed by lowercased name.
export const GLOSSARY = glossaryData as unknown as Record<string, GlossaryEntry>;

export function lookupTerm(name: string): GlossaryEntry | undefined {
  return GLOSSARY[name.trim().toLowerCase()];
}
