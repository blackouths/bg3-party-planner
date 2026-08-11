import { useState } from 'react';
import PartyView from './views/PartyView';
import BuildView from './views/BuildView';
import GearView from './views/GearView';
import { usePartyStore } from './store/partyStore';
import { buildShareUrl } from './model/share';

type Tab = 'party' | 'build' | 'gear';

const TABS: { id: Tab; label: string }[] = [
  { id: 'party', label: 'Party' },
  { id: 'build', label: 'Build' },
  { id: 'gear', label: 'Gear' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('party');
  const [copied, setCopied] = useState(false);
  const party = usePartyStore((s) => s.party);
  const resetParty = usePartyStore((s) => s.resetParty);
  const hasMembers = party.members.some((m) => m != null);

  const share = async () => {
    const url = buildShareUrl(party);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard unavailable (permissions) — show the link for manual copy.
      window.prompt('Copy your share link:', url);
    }
  };

  const reset = () => {
    if (window.confirm('Start a new party? This clears the current one.')) {
      resetParty();
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title">
          <h1>BG3 Party Planner</h1>
          <span className="badge">Honor Mode</span>
        </div>
        <nav className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={t.id === tab ? 'tab tab-active' : 'tab'}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div className="header-actions">
          <button className="action-btn" onClick={share} disabled={!hasMembers}>
            {copied ? '✓ Copied!' : 'Share Party'}
          </button>
          <button className="action-btn action-danger" onClick={reset} disabled={!hasMembers}>
            New Party
          </button>
        </div>
      </header>

      <main className="app-main">
        {tab === 'party' && <PartyView />}
        {tab === 'build' && <BuildView />}
        {tab === 'gear' && <GearView />}
      </main>
    </div>
  );
}
