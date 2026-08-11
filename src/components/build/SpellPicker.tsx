import { useMemo, useState } from 'react';
import type { Character } from '../../model/types';
import { usePartyStore } from '../../store/partyStore';
import { SPELLS, spellByName, type SpellData } from '../../model/spellIndex';
import { CLASS_NAMES } from '../../data/classes';
import EffectText from '../EffectText';

const LEVELS = ['All', 'Cantrip', '1', '2', '3', '4', '5', '6'] as const;
const MAX_RESULTS = 60;

export default function SpellPicker({ member, slot }: { member: Character; slot: number }) {
  const updateMember = usePartyStore((s) => s.updateMember);
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<(typeof LEVELS)[number]>('All');
  // Default the class filter to the character's first casting class, else All.
  const [cls, setCls] = useState<string>('All');

  const known = member.spells.known;
  const knownSet = useMemo(() => new Set(known.map((n) => n.toLowerCase())), [known]);
  const concentrationCount = known.filter(
    (n) => spellByName.get(n.toLowerCase())?.concentration,
  ).length;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SPELLS.filter((s) => {
      if (knownSet.has(s.name.toLowerCase())) return false;
      if (level !== 'All') {
        const lv = level === 'Cantrip' ? 0 : Number(level);
        if (s.level !== lv) return false;
      }
      if (cls !== 'All' && !s.classes.includes(cls)) return false;
      if (q && !s.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, level, cls, knownSet]);

  const add = (name: string) =>
    updateMember(slot, { spells: { ...member.spells, known: [...known, name] } });
  const remove = (name: string) =>
    updateMember(slot, {
      spells: { ...member.spells, known: known.filter((n) => n !== name) },
    });

  return (
    <section className="panel">
      <h3>
        Spells
        <span className="count">
          {known.length} known
          {concentrationCount > 1 && ` · ${concentrationCount} need concentration`}
        </span>
      </h3>

      {known.length > 0 && (
        <div className="known-spells">
          {known.map((name) => {
            const s = spellByName.get(name.toLowerCase());
            return (
              <span key={name} className="known-spell">
                <EffectText text={name} terms={[name]} />
                {s?.concentration && <span className="spell-chip" title="Concentration">C</span>}
                <button className="link-btn" onClick={() => remove(name)}>✕</button>
              </span>
            );
          })}
        </div>
      )}

      <div className="picker-controls">
        <input
          className="picker-search"
          placeholder="Search spells…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={level} onChange={(e) => setLevel(e.target.value as (typeof LEVELS)[number])}>
          {LEVELS.map((l) => <option key={l} value={l}>{l === 'All' ? 'All levels' : l}</option>)}
        </select>
        <select value={cls} onChange={(e) => setCls(e.target.value)}>
          <option value="All">All classes</option>
          {CLASS_NAMES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="spell-list">
        {results.slice(0, MAX_RESULTS).map((s) => (
          <SpellRow key={s.name} spell={s} onAdd={() => add(s.name)} />
        ))}
        {results.length > MAX_RESULTS && (
          <p className="muted picker-more">
            Showing {MAX_RESULTS} of {results.length}. Refine your search to narrow.
          </p>
        )}
        {results.length === 0 && <p className="muted">No matching spells.</p>}
      </div>
    </section>
  );
}

function SpellRow({ spell, onAdd }: { spell: SpellData; onAdd: () => void }) {
  return (
    <button className="spell-row" onClick={onAdd}>
      <span className="spell-name">
        <EffectText text={spell.name} terms={[spell.name]} />
      </span>
      <span className="spell-meta">
        {spell.level === 0 ? 'Cantrip' : `Lv ${spell.level}`} · {spell.school}
        {spell.concentration && <span className="spell-chip" title="Concentration">C</span>}
        {spell.ritual && <span className="spell-chip" title="Ritual">R</span>}
      </span>
      <span className="spell-extra">
        {spell.damage && `${spell.damage} `}
        {spell.save && `· ${spell.save} save`}
        {spell.classes.length > 0 && ` · ${spell.classes.join(', ')}`}
      </span>
    </button>
  );
}
