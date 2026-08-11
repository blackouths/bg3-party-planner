# BG3 Party Planner — Honor Mode

A party planner for Baldur's Gate 3 Honor Mode runs: plan your four-character
party, deep-build each member, assign gear from the full magic-item database,
and track the single-run decisions (unique items, one-per-run permanent buffs)
that matter when you only get one save.

## Features

- **Party view** — 4 party slots with live coverage panels: dialogue tags
  (race/class/deity/origin), party-best skill modifiers, and utility-spell
  coverage (Speak with Dead, Revivify, Fly...) merged from classes, gear,
  and permanent buffs.
- **Build editor** — BG3-exact point-buy (27 points), racial +2/+1, full
  multiclassing with all Patch 8 subclasses, skill proficiencies with real
  class/background budgets, all ~41 feats (ASI/half-feat ability picks feed
  the math), and a live character sheet (HP, AC, initiative, saves, per-class
  spell DCs).
- **Gear view** — 1,132 magic items scraped from bg3.wiki with rarity, slot,
  effects, act, and where-to-find (with map coordinates); searchable picker
  with act/rarity filters; hover tooltips explaining effect terms (2,652-entry
  glossary); party-wide unique-item conflict detection.
- **Permanent buffs** — all 30 acquirable permanent bonuses (Auntie Ethel's
  Hair, Awakened, Mirror of Loss, Sweet Stone Features...) with one-per-run
  conflict warnings, origin locks, and stat effects wired into the engine.
- **Persistence & sharing** — autosaves to localStorage; share a full party
  as a compact URL.

## Development

```bash
npm install
npm run dev      # dev server on :5173
npm run build    # type-check + production build
npm run scrape   # regenerate src/data/items.json + glossary.json from bg3.wiki
```

Stack: Vite + React + TypeScript + Zustand. Game data is scraped from
[bg3.wiki](https://bg3.wiki) (CC BY-SA) at build time into committed JSON —
the app has no runtime dependency on the wiki. Be gentle with `npm run scrape`;
the wiki rate-limits aggressively.
