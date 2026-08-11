import { useState } from 'react';
import type { Act } from '../model/types';
import { BOSSES } from '../data/bosses';

const ACTS: (Act | 'All Acts')[] = ['All Acts', 'Act 1', 'Act 2', 'Act 3'];

export default function BossesView() {
  const [act, setAct] = useState<Act | 'All Acts'>('All Acts');
  const bosses = BOSSES.filter((b) => act === 'All Acts' || b.act === act);

  return (
    <div className="view">
      <section className="panel">
        <h3>
          Honour Mode Bosses
          <span className="count">Legendary Actions &amp; fight tips</span>
        </h3>
        <div className="boss-filter">
          {ACTS.map((a) => (
            <button
              key={a}
              className={a === act ? 'member-tab member-tab-active' : 'member-tab'}
              onClick={() => setAct(a)}
            >
              {a}
            </button>
          ))}
        </div>
        <div className="boss-grid">
          {bosses.map((boss) => (
            <div key={boss.id} className="boss-card">
              <div className="boss-head">
                <strong>{boss.name}</strong>
                <span className="act-chip">{boss.act}</span>
              </div>
              <div className="boss-location">{boss.location}</div>
              <div className="boss-legendary">⚡ {boss.legendary}</div>
              <div className="boss-tips">{boss.tips}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
