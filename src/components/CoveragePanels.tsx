import { usePartyStore } from '../store/partyStore';
import {
  dialogueTagCoverage, partySkillCoverage, utilitySpellCoverage,
} from '../model/selectors';

const fmt = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

export default function CoveragePanels() {
  const party = usePartyStore((s) => s.party);
  const hasMembers = party.members.some((m) => m != null);

  const tags = dialogueTagCoverage(party);
  const skills = partySkillCoverage(party);
  const spells = utilitySpellCoverage(party);

  if (!hasMembers) {
    return (
      <section className="coverage-placeholder">
        <p className="muted">Add a character to see party coverage.</p>
      </section>
    );
  }

  const coveredTags = tags.filter((t) => t.covered).length;

  return (
    <div className="coverage">
      <section className="panel">
        <h3>Dialogue Tags <span className="count">{coveredTags}/{tags.length}</span></h3>
        <div className="tag-cloud">
          {tags.map((t) => (
            <span
              key={t.tag}
              className={t.covered ? 'tag tag-on' : 'tag tag-off'}
              title={t.by.join(', ')}
            >
              {t.tag}
            </span>
          ))}
        </div>
      </section>

      <section className="panel">
        <h3>Skills <span className="count">party best</span></h3>
        <div className="skill-grid">
          {skills.map((s) => (
            <div key={s.skill} className={s.best > 0 ? 'skill-row' : 'skill-row skill-weak'}>
              <span className="skill-name">{s.skill}</span>
              <span className="skill-mod">{fmt(s.best)}</span>
              <span className="skill-by">{s.by ?? ''}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h3>Utility Spells</h3>
        <ul className="check-list">
          {spells.map((s) => (
            <li key={s.spell} className={s.covered ? 'check on' : 'check off'}>
              <span className="check-mark">{s.covered ? '✓' : '✗'}</span>
              <span>{s.spell}</span>
              {s.by[0] && <span className="check-by">{s.by[0].name} ({s.by[0].via})</span>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
