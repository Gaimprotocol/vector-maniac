// Fake multiplayer player profiles for arena mode
// Creates the illusion of playing against real players

import { ArenaDifficulty } from './types';

export type PlayStyle = 'aggressive' | 'defensive' | 'tactical' | 'chaotic' | 'sniper' | 'rusher';

export interface PlayerProfile {
  username: string;
  tag: string; // Short tag like clan tags
  level: number;
  wins: number;
  playStyle: PlayStyle;
  country: string; // Country code for flag
  shipPreference: string[]; // Preferred ship IDs
  
  // Behavior modifiers (affect AI)
  aggressiveness: number; // 0-1: how often they chase
  patience: number; // 0-1: how long they wait before attacking
  accuracy: number; // 0-1: aim accuracy
  dodgeSkill: number; // 0-1: how well they evade
  adaptability: number; // 0-1: how quickly they change tactics
}

// Realistic gaming usernames with various styles
const USERNAMES = {
  // Pro-style names
  pro: [
    'TenZ', 'shroud', 's1mple', 'ZywOo', 'NiKo', 'dev1ce', 'Faker',
    'Stewie2K', 'coldzera', 'kennyS', 'GuardiaN', 'olof', 'flusha',
    'ScreaM', 'rain', 'electronic', 'Twistzz', 'EliGE', 'NAF',
  ],
  
  // Japanese/Korean style
  asian: [
    'Yuki_Wolf', 'SakuraBlade', 'NeonSamurai', 'KazeNoKo', 'RyuMaster',
    'TsukiHunter', 'HikariX', 'AkiraStorm', 'KenjiPro', 'YamatoAce',
    'ShogunX', 'NinjaKira', 'DragonKim', 'LeeSpeed', 'ParkFlash',
  ],
  
  // Meme/casual names
  casual: [
    'xX_NoScope_Xx', 'PotatoAim42', 'CouchWarrior', 'LagMaster3000',
    'DefinitelyNotABot', 'YourMomsHero', 'CampingKing', 'AFK_Andy',
    'RageQuitter99', 'SaltLord', 'EzGameEzLife', 'TouchGrass',
    'ImNotCheating', 'TrustMeBro', 'SendHelp', 'WhoNeedsSkill',
  ],
  
  // Tech/number style
  tech: [
    'Vector_01', 'Null_Ptr', 'Sys.Admin', 'Root_Access', 'Kernel32',
    'Hex0x00', 'Binary_King', 'Quantum_X', 'Cyber_Flux', 'NeonByte',
    'DataStream', 'Pixel_Core', 'Glitch_404', 'Synth_Wave', 'Grid_Lock',
    'Zero_Cool', 'Crash_OVR', 'Buffer_', 'Stack_Flow', 'Git_Push',
  ],
  
  // Intimidating names  
  intimidating: [
    'DeathVector', 'VoidHunter', 'SoulReaper', 'ShadowKiller', 'DarkMatter',
    'Annihilator', 'Destroyer99', 'FearMeNow', 'NightTerror', 'ChaosAgent',
    'ApexPredator', 'LethalForce', 'SilentDeath', 'PhantomStrike', 'DoomBringer',
    'Executioner', 'WrathOfGod', 'EndGame', 'FinalBoss', 'Unstoppable',
  ],
  
  // Normal/generic names
  normal: [
    'Alex_Gaming', 'MaxPower', 'StarPlayer', 'ProGamer123', 'GamerzUnited',
    'NightOwl', 'StormRider', 'BlazeFire', 'IcePhoenix', 'ThunderBolt',
    'CosmicRay', 'SolarFlare', 'LunarEclipse', 'NovaBlast', 'MeteorShower',
    'ArcticWolf', 'DesertEagle', 'JungleCat', 'OceanWave', 'MountainKing',
  ],
  
  // Numbers/letters combo
  alphanumeric: [
    'xK1LL3Rx', 'Pr0_Sn1p3r', 'N00bSlay3r', 'H4CK3R_MAN', 'L33T_SK1LLZ',
    'R4G3_QU1T', 'G4M3R_G0D', 'MVP_2024', 'ACE_777', 'CLUTCH_K1NG',
    'W1NN3R_', 'B0SS_M4N', 'SP33D_D3M0N', '1337_H4X0R', 'SK1LL_1SSU3',
  ],
};

// Clan/team tags
const TAGS = [
  'TSM', 'FaZe', 'NRG', 'C9', 'G2', '100T', 'TL', 'EG', 'NaVi', 'FNATIC',
  'OG', 'T1', 'DRX', 'PRX', 'LOUD', 'SEN', 'XSET', 'NIP', 'VP', 'BIG',
  'ENCE', 'COL', 'mouz', 'VIT', 'AST', 'FNC', 'KC', 'TH', 'ZETA', 'DFM',
  // Fun tags
  'YT', 'TTV', 'BTW', 'GG', 'EZ', 'OP', 'RNG', 'AFK', 'GIT', 'SQL',
  'NULL', 'VOID', 'APEX', 'GOAT', 'ACE', 'MVP', 'PRO', 'NOOB', 'BOSS',
];

// Country codes for variety
const COUNTRIES = [
  'US', 'CA', 'BR', 'UK', 'DE', 'FR', 'ES', 'IT', 'PL', 'RU',
  'KR', 'JP', 'CN', 'AU', 'SE', 'NO', 'DK', 'FI', 'NL', 'BE',
  'TR', 'UA', 'AR', 'MX', 'CL', 'PE', 'TH', 'VN', 'PH', 'ID',
];

// Playstyle descriptions for behavior
const PLAYSTYLE_BEHAVIORS: Record<PlayStyle, {
  aggressiveness: [number, number];
  patience: [number, number];
  accuracy: [number, number];
  dodgeSkill: [number, number];
  adaptability: [number, number];
  behaviorWeights: Record<string, number>;
}> = {
  aggressive: {
    aggressiveness: [0.7, 1.0],
    patience: [0.1, 0.3],
    accuracy: [0.4, 0.7],
    dodgeSkill: [0.3, 0.6],
    adaptability: [0.2, 0.5],
    behaviorWeights: { chase: 0.6, evade: 0.1, strafe: 0.2, cover: 0.1 },
  },
  defensive: {
    aggressiveness: [0.2, 0.4],
    patience: [0.6, 0.9],
    accuracy: [0.5, 0.8],
    dodgeSkill: [0.6, 0.9],
    adaptability: [0.4, 0.7],
    behaviorWeights: { chase: 0.1, evade: 0.4, strafe: 0.2, cover: 0.3 },
  },
  tactical: {
    aggressiveness: [0.4, 0.6],
    patience: [0.5, 0.8],
    accuracy: [0.6, 0.9],
    dodgeSkill: [0.5, 0.8],
    adaptability: [0.7, 1.0],
    behaviorWeights: { chase: 0.25, evade: 0.25, strafe: 0.25, cover: 0.25 },
  },
  chaotic: {
    aggressiveness: [0.3, 0.9],
    patience: [0.1, 0.5],
    accuracy: [0.3, 0.6],
    dodgeSkill: [0.4, 0.8],
    adaptability: [0.1, 0.4],
    behaviorWeights: { chase: 0.35, evade: 0.25, strafe: 0.3, cover: 0.1 },
  },
  sniper: {
    aggressiveness: [0.2, 0.5],
    patience: [0.7, 1.0],
    accuracy: [0.8, 1.0],
    dodgeSkill: [0.3, 0.6],
    adaptability: [0.3, 0.6],
    behaviorWeights: { chase: 0.1, evade: 0.3, strafe: 0.1, cover: 0.5 },
  },
  rusher: {
    aggressiveness: [0.8, 1.0],
    patience: [0.0, 0.2],
    accuracy: [0.3, 0.5],
    dodgeSkill: [0.5, 0.8],
    adaptability: [0.1, 0.3],
    behaviorWeights: { chase: 0.7, evade: 0.05, strafe: 0.2, cover: 0.05 },
  },
};

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateUsername(): { username: string; style: string } {
  const styles = Object.keys(USERNAMES) as (keyof typeof USERNAMES)[];
  const style = pickRandom(styles);
  const username = pickRandom(USERNAMES[style]);
  
  // Sometimes add numbers
  const addNumbers = Math.random() < 0.3;
  const finalUsername = addNumbers 
    ? `${username}${Math.floor(Math.random() * 999)}`
    : username;
  
  return { username: finalUsername, style };
}

export function generatePlayerProfile(difficulty: ArenaDifficulty): PlayerProfile {
  const { username } = generateUsername();
  
  // Tag probability varies
  const hasTag = Math.random() < 0.6;
  const tag = hasTag ? pickRandom(TAGS) : '';
  
  // Level based on difficulty
  const levelRanges: Record<ArenaDifficulty, [number, number]> = {
    bronze: [1, 30],
    silver: [20, 60],
    gold: [50, 120],
    diamond: [100, 250],
  };
  const [minLevel, maxLevel] = levelRanges[difficulty];
  const level = Math.floor(randomInRange(minLevel, maxLevel));
  
  // Wins based on level (roughly)
  const wins = Math.floor(level * randomInRange(5, 15));
  
  // Pick a playstyle (weighted by difficulty)
  const playStyles: PlayStyle[] = ['aggressive', 'defensive', 'tactical', 'chaotic', 'sniper', 'rusher'];
  const playStyle = pickRandom(playStyles);
  
  const behaviors = PLAYSTYLE_BEHAVIORS[playStyle];
  
  // Scale stats by difficulty
  const difficultyMultiplier: Record<ArenaDifficulty, number> = {
    bronze: 0.5,
    silver: 0.7,
    gold: 0.85,
    diamond: 1.0,
  };
  const mult = difficultyMultiplier[difficulty];
  
  return {
    username,
    tag,
    level,
    wins,
    playStyle,
    country: pickRandom(COUNTRIES),
    shipPreference: [], // Will be filled when creating opponent
    aggressiveness: randomInRange(...behaviors.aggressiveness) * mult + (1 - mult) * 0.3,
    patience: randomInRange(...behaviors.patience),
    accuracy: randomInRange(...behaviors.accuracy) * mult + (1 - mult) * 0.2,
    dodgeSkill: randomInRange(...behaviors.dodgeSkill) * mult,
    adaptability: randomInRange(...behaviors.adaptability),
  };
}

export function getDisplayName(profile: PlayerProfile): string {
  if (profile.tag) {
    return `[${profile.tag}] ${profile.username}`;
  }
  return profile.username;
}

export function getPlayStyleBehaviorWeights(playStyle: PlayStyle): Record<string, number> {
  return PLAYSTYLE_BEHAVIORS[playStyle].behaviorWeights;
}

// Pre-generated "famous" players that appear occasionally
export const FAMOUS_PLAYERS: PlayerProfile[] = [
  {
    username: 'VectorGod',
    tag: 'PRO',
    level: 999,
    wins: 50000,
    playStyle: 'tactical',
    country: 'KR',
    shipPreference: ['omega_prime'],
    aggressiveness: 0.6,
    patience: 0.8,
    accuracy: 0.95,
    dodgeSkill: 0.9,
    adaptability: 0.95,
  },
  {
    username: 'n0sc0p3_qu33n',
    tag: 'TTV',
    level: 420,
    wins: 13337,
    playStyle: 'sniper',
    country: 'US',
    shipPreference: ['vector_1'],
    aggressiveness: 0.3,
    patience: 0.9,
    accuracy: 0.98,
    dodgeSkill: 0.5,
    adaptability: 0.4,
  },
  {
    username: 'SpeedDemon',
    tag: 'FaZe',
    level: 666,
    wins: 25000,
    playStyle: 'rusher',
    country: 'BR',
    shipPreference: ['photon_edge'],
    aggressiveness: 1.0,
    patience: 0.0,
    accuracy: 0.6,
    dodgeSkill: 0.95,
    adaptability: 0.2,
  },
];
