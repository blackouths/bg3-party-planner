import type { Act, ParsedEffect } from '../model/types';

// Every unique acquirable permanent character bonus in BG3 (source: bg3.wiki
// "Permanent bonuses"). `partyUnique` = only one character per playthrough can
// have it — a real constraint for single-save Honor Mode planning.
export interface PermanentBuff {
  id: string;
  name: string;
  act: Act;
  description: string;
  source: string;               // how to unlock (abridged)
  partyUnique?: boolean;
  requiresOrigin?: string;      // only this origin can take it
  mutexWith?: string[];         // per-character mutually exclusive buff ids
  abilityPick?: { value: number; label: string }; // player-chosen ability bonus
  effects?: ParsedEffect[];     // fixed structured effects the engine applies
  note?: string;
}

export const PERMANENT_BUFFS: PermanentBuff[] = [
  // ---------------- Act One ----------------
  {
    id: 'ethels-hair', name: "Auntie Ethel's Hair", act: 'Act 1',
    description: '+1 to an ability score of choice. Can be raised above 20.',
    source: "Defeat Auntie Ethel during Save Mayrina and take the hag's deal to spare her life.",
    partyUnique: true,
    abilityPick: { value: 1, label: '+1' },
  },
  {
    id: 'awakened', name: 'Awakened', act: 'Act 1',
    description: 'Use all illithid powers as a bonus action.',
    source: "Succeed all three saving throws in the Zaith'isk at Crèche Y'llek (easier with the player character inside).",
    partyUnique: true,
    note: 'Failing Zaith\'isk saves inflicts permanent -2 INT/WIS/CON penalties instead.',
  },
  {
    id: 'booals-benediction', name: "BOOOAL's Benediction", act: 'Act 1',
    description: 'Advantage on attack rolls against Bleeding targets.',
    source: 'Sacrifice a companion to BOOOAL in The Festering Cove (or trick him via Persuasion).',
    note: 'Granted to all present party members; lost if all kuo-toa in the Cove die.',
  },
  {
    id: 'brand-absolute', name: 'Brand of the Absolute', act: 'Act 1',
    description: 'Enables bonuses from Absolute-marked equipment and unique dialogue with Absolute followers.',
    source: 'Let Gut brand the character in the Goblin Camp (later characters via Warlock Greez).',
  },
  {
    id: 'familiar-scratch', name: 'Find Familiar: Scratch', act: 'Act 1',
    description: 'Summon Scratch as a familiar; he can uncover buried treasure.',
    source: "Befriend Scratch, then play fetch when he offers his ball; keep Scratch's Ball in inventory.",
    partyUnique: true,
  },
  {
    id: 'familiar-quasit', name: 'Find Familiar: Cheeky Quasit', act: 'Act 1',
    description: 'Summon Shovel (or Basket, or Fork), the Cheeky Quasit.',
    source: 'Unique Scroll of Summon Quasit in the hidden area of the Apothecary\'s Cellar, Blighted Village.',
    partyUnique: true,
  },
  {
    id: 'instrument-proficiency', name: 'Instrument Proficiency', act: 'Act 1',
    description: 'Musical Instrument proficiency; busk for small amounts of gold.',
    source: "Pass a Performance check helping Alfira with her song in the Emerald Grove.",
    partyUnique: true,
    note: 'Redundant for Bards.',
  },
  {
    id: 'loviatars-love', name: "Loviatar's Love", act: 'Act 1',
    description: '+2 to attack rolls and Wisdom saving throws while at 30% HP or less.',
    source: 'Submit to Abdirak in the Shattered Sanctum and endure well.',
    partyUnique: true,
    note: 'Lost on character death — risky to rely on in Honor Mode.',
  },
  {
    id: 'necromancy-of-thay', name: 'Necromancy of Thay', act: 'Act 1',
    description: 'Forbidden Knowledge: +1 to Wisdom saving throws and ability checks; cast Speak with Dead once per long rest.',
    source: 'Turn all three pages of the Necromancy of Thay (Apothecary\'s Cellar, Blighted Village).',
    partyUnique: true,
    effects: [
      { kind: 'saveBonus', ability: 'WIS', value: 1 },
      { kind: 'grantsSpell', spell: 'Speak with Dead', recharge: 'long' },
    ],
  },
  {
    id: 'paid-the-price', name: 'Paid the Price', act: 'Act 1',
    description: '+1 Intimidation, but disadvantage on Perception checks and on attacks against hags. Permanently changes one eye.',
    source: "Accept Auntie Ethel's deal to remove the parasite at the Riverside Teahouse.",
    partyUnique: true,
    mutexWith: ['volos-eye'],
    effects: [{ kind: 'skillBonus', skill: 'Intimidation', value: 1 }],
    note: 'Generally a downgrade — listed for completeness.',
  },
  {
    id: 'survival-instinct', name: 'Survival Instinct', act: 'Act 1',
    description: 'Unique illithid power: infuse a creature with psionic force, healing it when it reaches 0 HP.',
    source: 'Complete Help Omeluum Investigate the Parasite in the Underdark.',
    partyUnique: true,
  },
  {
    id: 'volos-eye', name: "Volo's Ersatz Eye", act: 'Act 1',
    description: 'Permanent See Invisibility. Permanently changes the right eye.',
    source: "Rescue Volo from the Goblin Camp, then let him perform his experimental surgery at camp.",
    partyUnique: true,
    mutexWith: ['paid-the-price'],
  },

  // ---------------- Act Two ----------------
  {
    id: 'arabellas-entangle', name: "Arabella's Shadow Entangle", act: 'Act 2',
    description: 'Gain the ability to entangle an Undead or Shadow Creature.',
    source: "Tell Arabella about her parents' fate during Find Arabella's Parents.",
    partyUnique: true,
  },
  {
    id: 'improved-bardic', name: 'Improved Bardic Inspiration', act: 'Act 2',
    description: 'One extra, stronger (1d12) Bardic Inspiration charge per long rest.',
    source: 'As a Bard, speak with Alfira at Moonrise Towers at the end of Act Two (she must be alive).',
    partyUnique: true,
    note: 'Only a Bard can receive it.',
  },
  {
    id: 'githzerai-mind-barrier', name: 'Githzerai Mind Barrier', act: 'Act 2',
    description: 'Advantage on Intelligence saving throws.',
    source: 'Insert the Waking Mind into the Mind-Archive Interface in the Mind Flayer Colony; purge or consume the mind.',
    partyUnique: true,
    note: 'Lost on character death (presumably a bug).',
  },
  {
    id: 'consumed-shadow-weave', name: 'Consumed Shadow Weave', act: 'Act 2',
    description: 'An additional level 3 shadow spell slot per long rest.',
    source: 'Consume the Shadow Weave from a slain Thorm (Gerringothe, Malus, or Thisobald).',
    requiresOrigin: 'Gale',
    note: 'Origin Gale only.',
  },
  {
    id: 'everlasting-vigour', name: 'Potion of Everlasting Vigour', act: 'Act 2',
    description: '+2 Strength, can exceed 20. Survives respec.',
    source: 'Convince Astarion to bite Araj Oblodra in Moonrise Towers.',
    partyUnique: true,
    effects: [{ kind: 'abilityBonus', ability: 'STR', value: 2 }],
  },
  {
    id: 'slayer-form', name: 'Slayer Form', act: 'Act 2',
    description: 'Transform into the Slayer once per long rest.',
    source: "Kill Isobel / your lover / highest-approval companion during The Urge, or accept Bhaal's Chosen after defeating Orin.",
    requiresOrigin: 'The Dark Urge',
    note: 'The Dark Urge only.',
  },
  {
    id: 'summon-us', name: 'Summon Us', act: 'Act 2',
    description: 'Summon Us, an intellect devourer, as a familiar.',
    source: 'Save Us on the Nautiloid, then free it from its cage in the Mind Flayer Colony.',
    partyUnique: true,
  },

  // ---------------- Act Three ----------------
  {
    id: 'anointed-splendour', name: 'Anointed in Splendour', act: 'Act 3',
    description: '+2 bonus to all saving throws.',
    source: 'Offer enough gold for a blessing at the Stormshore Tabernacle (repeatable per character).',
    effects: [{ kind: 'saveBonus', ability: 'all', value: 2 }],
  },
  {
    id: 'partial-ceremorphosis', name: 'Partial Ceremorphosis', act: 'Act 3',
    description: 'Unlock tier 3 illithid powers, all tier 1 powers, and Fly. Irrevocable cosmetic change.',
    source: 'Consume the Astral-Touched Tadpole offered by the Emperor.',
    partyUnique: true,
    effects: [{ kind: 'grantsSpell', spell: 'Fly', recharge: 'none' }],
  },
  {
    id: 'danse-macabre', name: 'Danse Macabre', act: 'Act 3',
    description: 'Summon 4 ghouls to fight alongside you. Comes with a -5 CON curse removable via Remove Curse.',
    source: "Read The Tharchiate Codex (Ramazith's Tower vault), then the last page of Necromancy of Thay (DC 20 WIS save).",
    partyUnique: true,
    note: 'Requires the same character to hold Necromancy of Thay.',
  },
  {
    id: 'monks-hideous-laughter', name: "Monk's Hideous Laughter", act: 'Act 3',
    description: "Cast Tasha's Hideous Laughter once per long rest.",
    source: 'Carry the Sentient Amulet to the casket under the Open Hand Temple and accept the curse (Help the Cursed Monk).',
    partyUnique: true,
    note: 'The Sentient Amulet loses all its abilities.',
  },
  {
    id: 'mirror-of-loss', name: 'Mirror of Loss', act: 'Act 3',
    description: '+2 to a chosen ability score (up to 24).',
    source: 'Pass the DC 25 Religion prayer at the Mirror of Loss in the House of Grief, then sacrifice an ability (curse removable).',
    abilityPick: { value: 2, label: '+2' },
    note: 'Each character can use the mirror once.',
  },
  {
    id: 'patriars-memory', name: "Patriar's Memory", act: 'Act 3',
    description: '+1 Charisma (specific memory outcome at the Mirror of Loss).',
    source: 'Receive the Stelmane memory when sacrificing at the Mirror of Loss.',
    effects: [{ kind: 'abilityBonus', ability: 'CHA', value: 1 }],
    note: 'Random outcome; less likely after passing the prayer check.',
  },
  {
    id: 'slayer-knowledge', name: 'Slayer Knowledge', act: 'Act 3',
    description: 'Advantage against Slayer abilities (Dark Urge with Slayer Form also gains Piercing Growl).',
    source: "Rescue Volo near the Steel Watch Foundry, then read Irenicus's guidebook at camp.",
    partyUnique: true,
  },
  {
    id: 'sweet-stone-features', name: 'Sweet Stone Features', act: 'Act 3',
    description: '+1d4 bonus to attack rolls and saving throws.',
    source: 'Pay Boney 5,000 gold at the Circus of the Last Days for a statue of the chosen character.',
    partyUnique: true,
    note: 'Only one statue per party — one of the strongest single-character buffs.',
  },
  {
    id: 'tharchiate-blessing', name: 'The Tharchiate Codex: Blessing', act: 'Act 3',
    description: '20 temporary hit points after each long rest.',
    source: "Be the first character to read The Tharchiate Codex (Ramazith's Tower vault).",
    partyUnique: true,
  },
  {
    id: 'unstable-blood', name: 'Unstable Blood', act: 'Act 3',
    description: 'Your blood becomes flammable — blood surfaces you create explode on contact with fire.',
    source: 'Give blood to Araj Oblodra in Act 2, then help her again east of the Blushing Mermaid and drink her potion.',
    partyUnique: true,
  },
  {
    id: 'vampire-bite', name: 'Vampire (Bite)', act: 'Act 3',
    description: 'Gain Bite (Vampire Spawn) and access to the Circle of Bones buff.',
    source: 'Allow ascended, romanced Astarion to turn you into a vampire.',
    partyUnique: true,
    note: 'Requires romanced Vampire Ascendant Astarion.',
  },
  {
    id: 'vampire-ascendant', name: 'Vampire Ascendant', act: 'Act 3',
    description: 'Ascendant Bite, Misty Escape, and +1d10 necrotic on weapon and unarmed attacks.',
    source: "Defeat Cazador without killing his spawn, then let Astarion complete the ascension ritual.",
    requiresOrigin: 'Astarion',
    note: 'Astarion only.',
  },
];

export const BUFF_BY_ID = new Map(PERMANENT_BUFFS.map((b) => [b.id, b]));
