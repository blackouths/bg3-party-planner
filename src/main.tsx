import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { usePartyStore } from './store/partyStore';
import {
  clearShareCodeFromUrl, decodeParty, readShareCodeFromUrl,
} from './model/share';

// A share link (#p=...) overrides the locally saved party, then the hash is
// cleared so subsequent edits autosave locally as usual.
const code = readShareCodeFromUrl();
if (code) {
  const shared = decodeParty(code);
  if (shared) usePartyStore.getState().setParty(shared);
  clearShareCodeFromUrl();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
