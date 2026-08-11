// ============================================================================
// bg3.wiki magic-item scraper.
//
// Pulls the `equipment` (962) and `weapons` (437) Cargo tables plus
// `item_locations` (1308) via Special:CargoExport (the arbitrary cargoquery
// API is permission-blocked, but the export special page returns clean JSON),
// normalizes everything into MagicItem[] matching src/model/types.ts, parses a
// structured subset of effects, and writes src/data/items.json.
//
// Run:  npm run scrape
// ============================================================================

import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { LOCATION_ACT_OVERRIDES } from './location-acts.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'src', 'data');
const OUT_FILE = join(OUT_DIR, 'items.json');
const GLOSSARY_FILE = join(OUT_DIR, 'glossary.json');

const BASE = 'https://bg3.wiki/wiki/Special:CargoExport';
const PAGE_SIZE = 500;

// ---------------------------------------------------------------------------
// Fetch helper: paginated CargoExport with field aliases so JSON keys are clean.
// `fields` is an array of "column=alias" strings.
// ---------------------------------------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runSequential(thunks) {
  const out = [];
  for (const t of thunks) out.push(await t());
  return out;
}

// The "List of magic items in Act X" pages transclude one
// {{Item location table|<Location>}} per section — giving us location -> act.
async function fetchActLocations() {
  const pages = [
    ['List_of_magic_items_in_Act_One', 'Act 1'],
    ['List_of_magic_items_in_Act_Two', 'Act 2'],
    ['List_of_magic_items_in_Act_Three', 'Act 3'],
  ];
  const locToAct = new Map();
  for (const [page, act] of pages) {
    const url = `https://bg3.wiki/w/index.php?title=${page}&action=raw`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'BG3PartyPlanner/0.1 (personal project scraper)' },
    });
    if (!res.ok) throw new Error(`${page}: HTTP ${res.status}`);
    const text = await res.text();
    const re = /\{\{Item location table\|([^}]+)\}\}/g;
    let m;
    while ((m = re.exec(text))) {
      const loc = m[1].trim();
      if (!locToAct.has(loc)) locToAct.set(loc, act);
    }
    console.log(`  ${act}: ${[...locToAct.values()].filter((a) => a === act).length} locations`);
    await sleep(200);
  }
  return locToAct;
}

// Fetch one page, retrying with exponential backoff on rate-limit / 5xx.
async function fetchPage(url, table, offset) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'BG3PartyPlanner/0.1 (personal project scraper)' },
    });
    if (res.status === 429 || res.status >= 500) {
      const wait = 1000 * 2 ** attempt;
      process.stdout.write(`  ${table} @${offset}: HTTP ${res.status}, retrying in ${wait}ms\n`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) throw new Error(`${table} @${offset}: HTTP ${res.status}`);
    return res.json();
  }
  throw new Error(`${table} @${offset}: exhausted retries`);
}

async function cargoExport(table, fields) {
  const rows = [];
  let offset = 0;
  for (;;) {
    const params = new URLSearchParams({
      tables: table,
      fields: fields.join(','),
      format: 'json',
      limit: String(PAGE_SIZE),
      offset: String(offset),
    });
    const page = await fetchPage(`${BASE}?${params.toString()}`, table, offset);
    rows.push(...page);
    process.stdout.write(`  ${table}: ${rows.length}\r`);
    if (page.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
    await sleep(200); // be polite between pages
  }
  process.stdout.write(`  ${table}: ${rows.length}\n`);
  return rows;
}

// ---------------------------------------------------------------------------
// Wikitext / HTML cleanup.
// ---------------------------------------------------------------------------
function decodeOnce(s) {
  return s
    .replace(/&amp;/g, '&')     // decode ampersand first so &amp;#91; -> &#91;
    .replace(/&#8239;/g, ' ')   // narrow no-break space
    .replace(/&#8203;/g, '')    // zero-width space
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&thinsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

// Fields are Wikitext but double-encoded HTML (e.g. "&lt;span&gt;...&amp;#8239;")
// wrapping icon <span>[[File:...]]</span> markup. Order of operations matters:
// decode -> strip HTML -> remove File icons (nested-bracket aware) -> resolve links.
function cleanWikitext(raw) {
  if (!raw) return '';
  let s = String(raw);
  for (let i = 0; i < 3; i++) { const d = decodeOnce(s); if (d === s) break; s = d; }
  // <br> -> newline; strip remaining HTML tags (icon <span> wrappers).
  s = s.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ' ');
  // Remove File/Image embeds, allowing one nested [[...]] (e.g. alt=[[Saving Throw]]).
  s = s.replace(/\[\[(?:File|Image):(?:[^[\]]|\[\[[^[\]]*\]\])*\]\]/gi, ' ');
  // Category links + stray tracking-category leaks from templates.
  s = s.replace(/\[\[Category:[^\]]*\]\]/gi, ' ');
  s = s.replace(/Category:Pages with[^.]*?(?=[A-Z][a-z])/g, ' ');
  // Resolve wikilinks: [[Page|text]] -> text, [[Page]] -> Page (loop for residuals).
  for (let i = 0; i < 3; i++) {
    const before = s;
    s = s.replace(/\[\[([^[\]|]*)\|([^[\]]*)\]\]/g, '$2').replace(/\[\[([^[\]]*)\]\]/g, '$1');
    if (s === before) break;
  }
  // Templates {{...}} (recharge/cost widgets).
  for (let i = 0; i < 5 && s.includes('{{'); i++) s = s.replace(/\{\{[^{}]*\}\}/g, ' ');
  // Bold/italic markup.
  s = s.replace(/'''?/g, '');
  // Editorial markers left by wiki templates.
  s = s.replace(/\[\s*verify\s*\]/gi, '').replace(/\[\s*citation needed\s*\]/gi, '');
  // Catch-all: strip any residual named entities the decoder didn't know
  // (e.g. &NoBreak;, a zero-width joiner used by wiki templates).
  s = s.replace(/&[a-zA-Z][a-zA-Z0-9]{1,12};/g, ' ');
  return s.replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').replace(/\n{2,}/g, '\n').trim();
}

// Decode entities without stripping markup — used to find [[links]] in raw.
function decodeAll(raw) {
  let s = String(raw || '');
  for (let i = 0; i < 3; i++) { const d = decodeOnce(s); if (d === s) break; s = d; }
  return s;
}

// Glossary lookup (lowercased name -> canonical name), populated in main().
const glossaryByName = new Map();

// Collect glossary terms referenced by an item: [[wikilinks]] in `special`
// plus entries from passive/action name lists. Filtered to known glossary names.
function extractTerms(...sources) {
  const found = new Map(); // canonicalName -> true, preserves first-seen order
  const consider = (raw) => {
    const t = cleanWikitext(raw);
    const hit = glossaryByName.get(t.toLowerCase());
    if (hit) found.set(hit, true);
  };
  for (const src of sources) {
    if (!src) continue;
    if (Array.isArray(src)) { src.forEach(consider); continue; }
    const s = decodeAll(src);
    const re = /\[\[(?!File:|Image:|Category:)([^[\]|]+)(?:\|[^[\]]*)?\]\]/gi;
    let m;
    while ((m = re.exec(s))) consider(m[1]);
  }
  return [...found.keys()];
}

// Split a `special` blob into individual effect lines (wiki uses * bullets).
function toEffectLines(raw) {
  const cleaned = cleanWikitext(raw);
  if (!cleaned) return [];
  return cleaned
    .split(/\n/)
    .map((l) => l.replace(/^[*•]+\s*/, '').trim())
    .filter(Boolean);
}

function splitList(raw) {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : String(raw).split(',');
  return arr.map((x) => cleanWikitext(x)).filter(Boolean);
}

// ---------------------------------------------------------------------------
// Mapping tables.
// ---------------------------------------------------------------------------
const RARITY = {
  common: 'Common', uncommon: 'Uncommon', rare: 'Rare',
  'very rare': 'Very Rare', legendary: 'Legendary', story: 'Story',
};

// equipment `type` -> our EquipSlot (values are the actual wiki `type` strings)
const EQUIP_SLOT = {
  'Light Armour': 'Chest', 'Medium Armour': 'Chest', 'Heavy Armour': 'Chest',
  'Clothing': 'Chest', 'Camp Clothing': 'Chest', 'Underwear': 'Chest',
  'Shields': 'Shield',
  'Helmets': 'Head', 'Headwear': 'Head',
  'Cloaks': 'Cloak',
  'Gloves': 'Gloves', 'Handwear': 'Gloves',
  'Boots': 'Boots', 'Footwear': 'Boots', 'Camp Shoes': 'Boots',
  'Amulets': 'Amulet',
  'Rings': 'Ring',
  'Musical Instruments': 'Instrument', 'Instruments': 'Instrument',
};

const ABILITY_WORD = {
  Strength: 'STR', Dexterity: 'DEX', Constitution: 'CON',
  Intelligence: 'INT', Wisdom: 'WIS', Charisma: 'CHA',
};

const SKILLS = [
  'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception',
  'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine',
  'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion',
  'Sleight of Hand', 'Stealth', 'Survival',
];

// Coverage-relevant utility spells worth detecting when granted by an item.
const COVERAGE_SPELLS = [
  'Speak with Dead', 'Speak with Animals', 'Guidance', 'Resistance',
  'Detect Thoughts', 'Feather Fall', 'Enhance Leap', 'Fly', 'Misty Step',
  'Lesser Restoration', 'Revivify', 'Longstrider', 'Darkvision', 'Invisibility',
];

function slugify(name) {
  return String(name).toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

const unmappedTypes = new Set();

// ---------------------------------------------------------------------------
// Structured-subset effect parsing. Heuristic regex over cleaned effect text.
// Anything not matched here stays as prose in effectsText.
// ---------------------------------------------------------------------------
function parseEffects(text, effectLines) {
  const effects = [];
  const seen = new Set();
  const push = (e) => {
    const key = JSON.stringify(e);
    if (!seen.has(key)) { seen.add(key); effects.push(e); }
  };

  const m1 = text.match(/Armou?r Class\s*\+\s*(\d+)/i);
  if (m1) push({ kind: 'acBonus', value: Number(m1[1]) });

  for (const [word, ab] of Object.entries(ABILITY_WORD)) {
    const set = text.match(new RegExp(`${word}\\s+(?:is\\s+)?set to\\s+(\\d+)`, 'i'));
    if (set) push({ kind: 'abilitySet', ability: ab, value: Number(set[1]) });
    const bonus = text.match(new RegExp(`\\b${word}\\s*\\+\\s*(\\d+)`, 'i'));
    if (bonus) push({ kind: 'abilityBonus', ability: ab, value: Number(bonus[1]) });
  }

  for (const skill of SKILLS) {
    const re = new RegExp(`${skill.replace(/ /g, '\\s')}\\s*\\+\\s*(\\d+)`, 'i');
    const m = text.match(re);
    if (m) push({ kind: 'skillBonus', skill, value: Number(m[1]) });
  }

  const sv = text.match(/Saving Throws?\s*\+\s*(\d+)/i);
  if (sv) push({ kind: 'saveBonus', ability: 'all', value: Number(sv[1]) });

  const resRe = /Resistance to\s+([A-Za-z]+)\s+damage/gi;
  let rm;
  while ((rm = resRe.exec(text))) push({ kind: 'resistance', damage: rm[1] });

  for (const spell of COVERAGE_SPELLS) {
    if (new RegExp(`\\b${spell.replace(/ /g, '\\s')}\\b`, 'i').test(text)) {
      let recharge = 'none';
      const near = effectLines.find((l) => l.includes(spell)) || '';
      const scope = /rest/i.test(near) ? near : text;
      if (/short rest/i.test(scope)) recharge = 'short';
      else if (/long rest/i.test(scope)) recharge = 'long';
      push({ kind: 'grantsSpell', spell, recharge });
    }
  }

  return effects;
}

// ---------------------------------------------------------------------------
// Normalizers.
// ---------------------------------------------------------------------------
// location name -> "Act 1|2|3", populated in main() from the act list pages.
let locToAct = new Map();

function buildSource(page, locMap) {
  const loc = locMap.get(page);
  if (!loc) return { where: '' };
  const source = { where: cleanWikitext(loc.whereText) };
  if (loc.location) {
    const rawPlace = String(loc.location).trim();
    const act = locToAct.get(rawPlace);
    if (act) source.act = act;
    const place = cleanWikitext(rawPlace);
    source.location = loc.x != null && loc.x !== ''
      ? `${place} (X:${loc.x} Y:${loc.y})`
      : place;
  }
  return source;
}

function normalizeEquipment(row, locMap) {
  const name = row.name || row.page;
  const slot = EQUIP_SLOT[row.type];
  if (!slot) unmappedTypes.add(`equip:${row.type}`);

  const effectLines = [
    ...splitList(row.passives),
    ...toEffectLines(row.special),
    ...(row.whereToFind ? [] : []),
  ].filter(Boolean);
  const effectText = effectLines.join(' • ');

  const requirements = {};
  if (row.proficiency) requirements.proficiency = row.proficiency;

  const terms = extractTerms(row.special, row.passives);
  const item = {
    id: slugify(row.page),
    name: cleanWikitext(name),
    slot: slot || 'Chest',
    itemType: row.type || '',
    rarity: RARITY[row.rarity] || 'Common',
    effectsText: effectLines,
    effects: parseEffects(effectText, effectLines),
    source: buildSource(row.page, locMap),
    wikiUrl: `https://bg3.wiki/wiki/${encodeURIComponent(row.page)}`,
  };
  if (terms.length) item.terms = terms;
  if (row.weightKg) item.weightKg = Number(row.weightKg);
  if (row.price) item.price = Number(row.price);
  if (row.ac) requirements.armourClass = row.ac; // informational
  if (Object.keys(requirements).length) item.requirements = requirements;
  return item;
}

function normalizeWeapon(row, locMap) {
  const name = row.name || row.page;
  const slot = row.meleeOrRanged === 'ranged' ? 'RangedWeapon' : 'MeleeWeapon';

  const effectLines = [
    ...splitList(row.weaponPassives),
    ...splitList(row.passivesMain),
    ...splitList(row.weaponActions),
    ...toEffectLines(row.special),
  ].filter(Boolean);
  const effectText = effectLines.join(' • ');

  const terms = extractTerms(
    row.special, row.weaponPassives, row.passivesMain,
    row.weaponActions, row.specialWeaponActions,
  );
  const item = {
    id: slugify(row.page),
    name: cleanWikitext(name),
    slot,
    itemType: row.type || (row.category ? `${row.category} weapon` : 'Weapon'),
    rarity: RARITY[row.rarity] || 'Common',
    effectsText: effectLines,
    effects: parseEffects(effectText, effectLines),
    terms: terms.length ? terms : undefined,
    source: buildSource(row.page, locMap),
    wikiUrl: `https://bg3.wiki/wiki/${encodeURIComponent(row.page)}`,
    weapon: {
      category: row.category || '',
      handedness: row.handedness || '',
      meleeOrRanged: row.meleeOrRanged || 'melee',
      damage: cleanWikitext(row.damage),
      damageType: row.damageType || '',
      finesse: row.finesse === '1' || row.finesse === true,
    },
  };
  if (row.weightKg) item.weightKg = Number(row.weightKg);
  if (row.price) item.price = Number(row.price);
  return item;
}

// ---------------------------------------------------------------------------
// Main.
// ---------------------------------------------------------------------------
async function main() {
  console.log('Scraping bg3.wiki Cargo tables via Special:CargoExport...');

  // Sequential to avoid the wiki's rate limiting (429s under parallel load).
  const [equipment, weapons, locations, gPassives, gSpells, gActions] =
    await runSequential([
    () => cargoExport('equipment', [
      '_pageName=page', 'name=name', 'type=type', 'rarity=rarity',
      'proficiency=proficiency', 'armour_class=ac', 'weight_kg=weightKg',
      'price=price', 'passives=passives', 'special=special',
      'where_to_find=whereToFind', 'legacy=legacy',
    ]),
    () => cargoExport('weapons', [
      '_pageName=page', 'name=name', 'type=type', 'category=category',
      'handedness=handedness', 'melee_or_ranged=meleeOrRanged', 'rarity=rarity',
      'damage=damage', 'damage_type=damageType', 'weight_kg=weightKg',
      'price=price', 'weapon_passives=weaponPassives',
      'passives_main_hand=passivesMain', 'weapon_actions=weaponActions',
      'special_weapon_actions=specialWeaponActions',
      'special=special', 'finesse=finesse', 'legacy=legacy',
    ]),
    () => cargoExport('item_locations', [
      '_pageName=page', 'description=whereText', 'location=location',
      'x=x', 'y=y',
    ]),
    () => cargoExport('passives', ['_pageName=page', 'name=name', 'description=description', 'brief=brief']),
    () => cargoExport('spells', ['_pageName=page', 'name=name', 'description=description']),
    () => cargoExport('actions', ['_pageName=page', 'name=name', 'description=description']),
  ]);

  console.log('Fetching act/location mapping...');
  locToAct = await fetchActLocations();
  // Fill gaps with the hand-curated map (scraped data wins on collision).
  for (const [loc, act] of Object.entries(LOCATION_ACT_OVERRIDES)) {
    if (!locToAct.has(loc)) locToAct.set(loc, act);
  }

  // Build location map (first location row per page).
  const locMap = new Map();
  for (const row of locations) {
    if (!locMap.has(row.page)) locMap.set(row.page, row);
  }

  // Build the glossary (passives > spells > actions priority; first-wins).
  const glossary = {};
  const addGlossary = (rows, type) => {
    for (const row of rows) {
      const name = cleanWikitext(row.name || row.page);
      if (!name) continue;
      const key = name.toLowerCase();
      if (glossary[key]) continue;
      const description = cleanWikitext(row.description) || cleanWikitext(row.brief);
      if (!description) continue;
      glossary[key] = { name, type, description };
      glossaryByName.set(key, name); // for extractTerms() filtering
    }
  };
  addGlossary(gPassives, 'passive');
  addGlossary(gSpells, 'spell');
  addGlossary(gActions, 'action');

  const INACCESSIBLE = new Set(['inaccessible', 'unobtainable']);
  const isPlayable = (row) => !INACCESSIBLE.has((row.legacy || '').toLowerCase());

  const items = [];
  for (const row of equipment) {
    if (!row.name && !row.page) continue;
    if (!isPlayable(row)) continue;
    items.push(normalizeEquipment(row, locMap));
  }
  for (const row of weapons) {
    if (!row.name && !row.page) continue;
    if (!isPlayable(row)) continue;
    items.push(normalizeWeapon(row, locMap));
  }

  // De-dupe by id (wiki variants can collide); keep first.
  const byId = new Map();
  for (const it of items) if (!byId.has(it.id)) byId.set(it.id, it);
  const final = [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(final, null, 2));
  await writeFile(GLOSSARY_FILE, JSON.stringify(glossary));

  // Summary.
  const byRarity = {};
  const bySlot = {};
  let withSource = 0, withEffects = 0;
  for (const it of final) {
    byRarity[it.rarity] = (byRarity[it.rarity] || 0) + 1;
    bySlot[it.slot] = (bySlot[it.slot] || 0) + 1;
    if (it.source.where) withSource++;
    if (it.effects.length) withEffects++;
  }
  const withTerms = final.filter((i) => i.terms?.length).length;
  const byAct = {};
  for (const it of final) {
    const a = it.source.act || 'unknown';
    byAct[a] = (byAct[a] || 0) + 1;
  }
  console.log('By act:', byAct);
  console.log(`\nWrote ${final.length} items -> ${OUT_FILE}`);
  console.log('By rarity:', byRarity);
  console.log('By slot:', bySlot);
  console.log(`With source/location: ${withSource}  |  With parsed effects: ${withEffects}  |  With glossary terms: ${withTerms}`);
  console.log(`Glossary: ${Object.keys(glossary).length} entries -> ${GLOSSARY_FILE}`);
  if (unmappedTypes.size) console.log('Unmapped types:', [...unmappedTypes]);
}

main().catch((e) => { console.error(e); process.exit(1); });
