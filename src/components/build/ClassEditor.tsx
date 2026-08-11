import type { Character } from '../../model/types';
import { usePartyStore } from '../../store/partyStore';
import { CLASSES, CLASS_NAMES } from '../../data/classes';
import { totalLevel } from '../../model/selectors';

export default function ClassEditor({ member, slot }: { member: Character; slot: number }) {
  const updateMember = usePartyStore((s) => s.updateMember);
  const total = totalLevel(member);
  const usedClasses = new Set(member.classes.map((c) => c.class).filter(Boolean));

  const patch = (i: number, changes: Partial<Character['classes'][number]>) => {
    const classes = member.classes.map((c, j) => (j === i ? { ...c, ...changes } : c));
    updateMember(slot, { classes });
  };

  const remove = (i: number) => {
    const classes = member.classes.filter((_, j) => j !== i);
    updateMember(slot, { classes: classes.length ? classes : [{ class: '', level: 1 }] });
  };

  const addClass = () => {
    updateMember(slot, { classes: [...member.classes, { class: '', level: 1 }] });
  };

  return (
    <section className="panel">
      <h3>
        Classes
        <span className="count">level {total}/12{member.classes.length > 1 ? ' · multiclass' : ''}</span>
      </h3>

      {member.classes.map((cl, i) => {
        const info = CLASSES[cl.class];
        const showSubclass = info && (cl.level || 0) >= info.subclassLevel;
        const maxLevel = (cl.level || 0) + (12 - total);
        return (
          <div key={i} className="class-row">
            <select
              value={cl.class}
              onChange={(e) => patch(i, { class: e.target.value, subclass: undefined })}
            >
              <option value="">— class —</option>
              {CLASS_NAMES.map((c) => (
                <option key={c} value={c} disabled={c !== cl.class && usedClasses.has(c)}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={cl.level}
              onChange={(e) => patch(i, { level: Number(e.target.value) })}
            >
              {Array.from({ length: 12 }, (_, n) => n + 1).map((n) => (
                <option key={n} value={n} disabled={n > maxLevel}>{n}</option>
              ))}
            </select>

            {showSubclass && (
              <select
                value={cl.subclass ?? ''}
                onChange={(e) => patch(i, { subclass: e.target.value || undefined })}
              >
                <option value="">— subclass —</option>
                {info.subclasses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
            {info && !showSubclass && (
              <span className="subclass-hint">subclass at level {info.subclassLevel}</span>
            )}

            {member.classes.length > 1 && (
              <button className="link-btn" onClick={() => remove(i)}>✕</button>
            )}
          </div>
        );
      })}

      {total < 12 && member.classes.every((c) => c.class) && (
        <button className="add-class-btn" onClick={addClass}>+ Add class (multiclass)</button>
      )}
      {member.classes[0] && CLASSES[member.classes[0].class] && (
        <p className="hint">
          Saving throws from starting class: {CLASSES[member.classes[0].class].saveProficiencies.join(', ')}
        </p>
      )}
    </section>
  );
}
