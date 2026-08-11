import { Fragment, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { GlossaryEntry } from '../model/types';
import { lookupTerm } from '../model/glossaryIndex';

// Renders text with recognized glossary terms wrapped in a hover tooltip
// (e.g. "Psychic Leech" shows the passive's full description). `terms` names
// which glossary entries to link — items carry a scraped list, prose callers
// can use detectTerms(). The tooltip renders into document.body with fixed
// positioning so it is never clipped by scrollable containers, and flips
// below the term near the top of the viewport.
export default function EffectText({ text, terms }: { text: string; terms: string[] }) {
  const parts = useMemo(() => splitByTerms(text, terms), [text, terms]);

  return (
    <>
      {parts.map((part, i) =>
        part.term ? (
          <Term key={i} text={part.text} term={part.term} />
        ) : (
          <Fragment key={i}>{part.text}</Fragment>
        ),
      )}
    </>
  );
}

const TIP_WIDTH = 320;

function Term({ text, term }: { text: string; term: GlossaryEntry }) {
  const anchor = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; below: boolean } | null>(null);

  const show = () => {
    const rect = anchor.current?.getBoundingClientRect();
    if (!rect) return;
    // Clamp horizontally to the viewport; flip below if near the top.
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - TIP_WIDTH - 8));
    const below = rect.top < 160;
    setPos({ left, top: below ? rect.bottom + 6 : rect.top - 6, below });
  };
  const hide = () => setPos(null);

  return (
    <span
      ref={anchor}
      className="term"
      tabIndex={0}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {text}
      {pos &&
        createPortal(
          <span
            className={pos.below ? 'term-tip term-tip-below' : 'term-tip'}
            role="tooltip"
            style={{ left: pos.left, top: pos.top }}
          >
            <span className="term-tip-head">
              {term.name}
              <span className="term-tip-type">{term.type}</span>
            </span>
            {term.description}
          </span>,
          document.body,
        )}
    </span>
  );
}

interface Part {
  text: string;
  term?: GlossaryEntry;
}

// Split `text` around occurrences of the item's known glossary terms.
// Longest terms match first so "Psychic Leech" wins over a nested "Leech".
function splitByTerms(text: string, termNames: string[]): Part[] {
  const terms = termNames
    .map((n) => ({ name: n, entry: lookupTerm(n) }))
    .filter((t) => t.entry)
    .sort((a, b) => b.name.length - a.name.length);
  if (terms.length === 0) return [{ text }];

  const pattern = terms
    .map((t) => t.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  const re = new RegExp(`\\b(${pattern})\\b`, 'gi');

  const parts: Part[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index) });
    parts.push({ text: m[0], term: lookupTerm(m[0]) });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}
