import type { Act } from '../model/types';

// Honour Mode bosses with their Legendary Actions (source: bg3.wiki
// "Legendary actions") and curated fight tips.
// Stats from the bg3.wiki `creatures` Cargo table (<Name>/Combat pages).
// HP is the base (Balanced) value — Honour Mode uses the Tactician ruleset,
// which raises many bosses' HP by roughly 30%.
export interface BossStats {
  level: number;
  hp: number;
  ac?: number;               // absent where the wiki has no value
  str: number; dex: number; con: number; int: number; wis: number; cha: number;
}

export interface BossInfo {
  id: string;
  name: string;
  act: Act;
  location: string;
  legendary: string;         // the Legendary Action, verbatim-ish from the wiki
  tips: string;              // curated Honor Mode advice
  stats?: BossStats;
  statsNote?: string;        // second phase / variant stat callout
}

export const BOSSES: BossInfo[] = [
  // ---------------- Act 1 ----------------
  {
    id: 'ethel', name: 'Auntie Ethel', act: 'Act 1', location: 'Overgrown Tunnel / Acrid Workshop',
    legendary: 'Weird Magic Surge — after a spell is cast, summons more illusory duplicates and shuffles herself among them.',
    tips: 'AoE damage reveals the real hag among duplicates. Bring force or radiant damage; do not burst her below ~20% before accepting or refusing her deal.',
    stats: { level: 5, hp: 112, ac: 17, str: 18, dex: 14, con: 16, int: 13, wis: 14, cha: 18 },
  },
  {
    id: 'grym', name: 'Grym', act: 'Act 1', location: 'Adamantine Forge',
    legendary: 'Adamantine Reverberation — when struck, doubles its movement and gains 10 temporary hit points.',
    tips: 'Only vulnerable while Superheated, and heavily resists everything except Bludgeoning — bring maces/hammers or use the forge hammer (lure it onto the mould platform). Fire resistance helps against the lava phase.',
    stats: { level: 10, hp: 300, ac: 18, str: 24, dex: 6, con: 24, int: 3, wis: 11, cha: 1 },
  },
  {
    id: 'inquisitor', name: "Inquisitor W'wargaz", act: 'Act 1', location: "Rosymorn Monastery — Inquisitor's Chamber",
    legendary: "Mind-Claw of Tu'narath — twice per round, summons a Mind-Claw after he or his allies are struck.",
    tips: 'Heavy psychic pressure in a small room. Kill the adjacent githyanki fast; psychic resistance and good INT saves blunt the Mind-Claws.',
    stats: { level: 6, hp: 112, ac: 17, str: 17, dex: 14, con: 15, int: 18, wis: 16, cha: 12 },
  },
  {
    id: 'phase-matriarch', name: 'Phase Spider Matriarch', act: 'Act 1', location: 'Whispering Depths',
    legendary: 'Gossamer Tomb — if her offspring is attacked, cocoons a character in web.',
    tips: 'Fight her on solid ground, not the webs. Kill eggs before the fight; a cocooned member is out until freed, which is deadly with permadeath.',
    stats: { level: 5, hp: 125, ac: 16, str: 16, dex: 19, con: 14, int: 6, wis: 12, cha: 6 },
  },

  // ---------------- Act 2 ----------------
  {
    id: 'yurgir', name: 'Yurgir', act: 'Act 2', location: 'Gauntlet of Shar',
    legendary: 'Blinding Ambush — blinds a Hunted creature when it attempts to attack or cast a spell.',
    tips: 'His opening volley can delete a squishy character. Talk him down (or turn him on his own merregons) if the party is not overwhelming; pre-position on the upper ledges before initiating.',
    stats: { level: 10, hp: 105, ac: 17, str: 22, dex: 16, con: 21, int: 15, wis: 15, cha: 16 },
  },
  {
    id: 'balthazar', name: 'Balthazar', act: 'Act 2', location: 'Gauntlet of Shar',
    legendary: 'The Dead Wastes — when a creature dies, creates necrotic miasma (heals undead 4d6, deals 4d6 Necrotic to the living). Also Spectral Aspect after being struck.',
    tips: 'Every death fuels his miasma — burst him down before clearing minions, or fight near the entrance and retreat from miasma zones. Necrotic resistance is gold here.',
    stats: { level: 8, hp: 91, ac: 15, str: 10, dex: 14, con: 16, int: 20, wis: 14, cha: 10 }, // AC from Fextralife
    statsNote: 'AC 17 if fought in the Shadowfell. Immune to Slashing/Piercing/Bludgeoning and Poison; resists Fire, Lightning, Psychic.',
  },
  {
    id: 'ketheric', name: 'Ketheric Thorm (+ Apostle of Myrkul)', act: 'Act 2', location: 'Moonrise Towers rooftop → Mind Flayer Colony',
    legendary: 'Hordestrike — strikes an enemy attacked by his minions under Deadly Orders. The Apostle: Gaze of the Dead when attacked.',
    tips: 'Two fights back-to-back with no long rest between phases — budget spell slots for the Apostle. Kill Necromites before they reach the Apostle to deny Bone Shield; radiant damage and necrotic resistance shine.',
    stats: { level: 11, hp: 145, ac: 22, str: 18, dex: 13, con: 17, int: 12, wis: 15, cha: 20 },
    statsNote: 'Apostle of Myrkul: 245 HP, AC 19 — STR 23 / DEX 12 / CON 22 / INT 15 / WIS 17 / CHA 21',
  },

  // ---------------- Act 3 ----------------
  {
    id: 'gortash', name: 'Enver Gortash', act: 'Act 3', location: "Wyrm's Rock Fortress",
    legendary: 'Tyrannical Branding — immediately Brands his attacker after being struck.',
    tips: 'Disarm or avoid the Steel Watcher traps flanking the throne room; lightning resistance trivializes most of the fight. Consider destroying the Steel Watch Foundry first to fight him without reinforcements.',
    stats: { level: 9, hp: 275, ac: 16, str: 14, dex: 20, con: 10, int: 20, wis: 16, cha: 18 },
  },
  {
    id: 'orin', name: 'Orin the Red', act: 'Act 3', location: 'Bhaal Temple',
    legendary: "Sanguine Lash after being attacked; Bhaal's Edict if she hasn't used her action and isn't duelling alone.",
    tips: "Her Unstoppable stacks absorb hits — many small attacks strip them faster than one big one. Accepting the solo duel removes Bhaal's Edict pressure but bets the run on one character.",
    stats: { level: 12, hp: 145, ac: 20, str: 18, dex: 22, con: 17, int: 14, wis: 16, cha: 19 },
    statsNote: 'Slayer Form: 175 HP, AC 18, STR 25',
  },
  {
    id: 'cazador', name: 'Cazador Szarr', act: 'Act 3', location: 'Szarr Palace ritual chamber',
    legendary: 'Vampiric Swarm — conjures a swarm of bats/rats once per round.',
    tips: 'Interrupt the ritual by moving Astarion off the platform or bursting Cazador in his mist phase. Radiant damage and Daylight hard-counter his vampire spawn.',
    stats: { level: 12, hp: 208, ac: 16, str: 18, dex: 18, con: 18, int: 17, wis: 15, cha: 18 },
  },
  {
    id: 'sarevok', name: 'Sarevok Anchev', act: 'Act 3', location: 'Murder Tribunal',
    legendary: 'Murderous Retort — immediately strikes back at his attacker.',
    tips: 'His greatsword crits hard and the Retort punishes melee — ranged attackers avoid the counterattack entirely. Winning his trial by words (Investigation/deception path) skips the fight.',
    stats: { level: 16, hp: 262, ac: 20, str: 20, dex: 20, con: 20, int: 16, wis: 14, cha: 15 },
  },
  {
    id: 'ansur', name: 'Ansur', act: 'Act 3', location: "The Dragon's Sanctum (under Wyrmway)",
    legendary: 'Draconic Wrath — retaliates against an attacker with his lightning breath.',
    tips: 'Stormheart Nova hits the whole arena — break line of sight behind the pillars on his charge-up turn or eat massive lightning damage. Lightning resistance turns the fight from lethal to routine.',
    stats: { level: 17, hp: 400, ac: 19, str: 25, dex: 10, con: 23, int: 16, wis: 15, cha: 19 },
  },
  {
    id: 'raphael', name: 'Raphael', act: 'Act 3', location: 'House of Hope',
    legendary: 'Beguiling Rebuke — beguiles your attacker and nearby allies; Soul Ascension when he or allies are attacked.',
    tips: 'Destroy the four soul pillars to shut down Soul Ascension before it snowballs. Fire resistance across the party matters — most incoming damage is fire. The whole House fights you on the way out.',
    stats: { level: 16, hp: 666, ac: 21, str: 18, dex: 16, con: 17, int: 14, wis: 16, cha: 19 },
    statsNote: 'Ascended (pillars up): STR 20',
  },
  {
    id: 'viconia', name: 'Viconia DeVir', act: 'Act 3', location: 'House of Grief',
    legendary: 'Sanctuary of Loss when an ally is struck; Heartwrench against Heartform Mapped creatures.',
    tips: 'A large cleric mob fight — AoE control (Hunger of Hadar, Spike Growth) wins it. Watch for her Sanctuary resets; focus her early to stop mass Command casts.',
    stats: { level: 11, hp: 124, ac: 20, str: 14, dex: 19, con: 10, int: 17, wis: 18, cha: 16 },
  },
  {
    id: 'netherbrain', name: 'The Netherbrain', act: 'Act 3', location: 'High Hall / Crown of Karsus',
    legendary: 'Karsite Grip — crushes a creature with Netherese energy, forking to three targets within 8 m.',
    tips: 'The final gauntlet: bring Misty Step/Fly for the platforming, Globe of Invulnerability or high saves for Karsite Grip, and remember there is no shop after the point of no return — stock consumables first.',
    stats: { level: 20, hp: 300, ac: 15, str: 16, dex: 10, con: 22, int: 28, wis: 21, cha: 24 },
  },
];
