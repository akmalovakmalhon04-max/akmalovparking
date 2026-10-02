export type Language = 'en' | 'ru' | 'uz';
export type Theme = 'dark' | 'light';
export type GraphicsQuality = 'low' | 'med' | 'high';

export type GameState =
  | 'MENU'
  | 'PLAYING'
  | 'PAUSED'
  | 'GAME_OVER'
  | 'LEVEL_COMPLETE'
  | 'GARAGE'
  | 'LEVEL_SELECT'
  | 'SETTINGS';

export type GameOverReason = 'crash' | 'timeout' | 'wrong_parking';

export interface CarStats {
  speed: number;       // 1 - 10
  acceleration: number;// 1 - 10
  handling: number;    // 1 - 10
  braking: number;     // 1 - 10
}

export type CarModelType =
  | 'hatchback'
  | 'sedan'
  | 'coupe'
  | 'suv'
  | 'muscle'
  | 'electric'
  | 'supercar'
  | 'drift'
  | 'formula'
  | 'hypercar';

export interface CarConfig {
  id: string;
  name: string;
  price: number;
  stats: CarStats;
  modelType: CarModelType;
  primaryColor: string;
  secondaryColor: string;
  rimColor: string;
  accentColor: string;
  dimensions: {
    width: number;
    length: number;
    height: number;
  };
}

export interface Obstacle {
  id: string;
  type: 'wall' | 'cone' | 'barrier' | 'pillar' | 'curb' | 'dumpster';
  x: number;
  z: number;
  rotation?: number;
  width: number;
  length: number;
  height?: number;
}

export interface ParkedCar {
  id: string;
  modelType: CarModelType;
  color: string;
  x: number;
  z: number;
  rotation: number;
  width: number;
  length: number;
}

export type LevelTheme =
  | 'day_lot'
  | 'underground'
  | 'night_city'
  | 'supermarket'
  | 'office'
  | 'slalom';

export interface LevelData {
  levelNumber: number;
  theme: LevelTheme;
  timeLimit: number; // In seconds
  baseReward: number; // Coins
  startPos: {
    x: number;
    z: number;
    rotation: number; // In radians
  };
  targetPos: {
    x: number;
    z: number;
    rotation: number; // Target orientation in radians
    width: number;
    length: number;
  };
  obstacles: Obstacle[];
  parkedCars: ParkedCar[];
  decorations?: {
    streetlights?: { x: number; z: number }[];
    trees?: { x: number; z: number }[];
  };
  boundary: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
  speedLimit?: number; // Speed limit in KM/H (e.g. 60)
  descriptionKey?: string;
}

export interface LevelResult {
  stars: number;
  timeTaken: number;
  bestTime: number;
}

export interface UnpaidFine {
  amount: number;
  remainingSeconds: number; // 300 seconds (5 minutes) countdown
}

export type CameraViewMode = 'first_person' | 'third_person';
export type TransmissionMode = 'automatic' | 'manual';

export interface PlayerSaveData {
  version: number;
  coins: number;
  currentLevel: number;
  unlockedLevels: number[];
  levelScores: Record<number, LevelResult>;
  ownedCars: string[];
  selectedCarId: string;
  language: Language;
  theme: Theme;
  soundEnabled: boolean;
  soundVolume: number;
  musicEnabled: boolean;
  musicVolume: number;
  vibrationEnabled: boolean;
  graphicsQuality: GraphicsQuality;
  hasCompletedFirstTimeSetup: boolean;
  unpaidFine: UnpaidFine | null;
  jailTimeRemaining: number; // 90 seconds (1.5 minutes) when imprisoned
  transmissionMode: TransmissionMode; // 'automatic' or 'manual'
  sideMirrorsEnabled: boolean;
}

export interface InputState {
  gas: boolean;
  reverse: boolean;
  steerLeft: boolean;
  steerRight: boolean;
  handbrake: boolean;
  steerValue: number; // -1 to 1 (for analog / virtual wheel)
  gear?: number; // Manual mode: -1 = R, 0 = N, 1 = 1st, 2 = 2nd, 3 = 3rd, 4 = 4th, 5 = 5th. In Automatic mode: undefined
  turnSignal?: 'none' | 'left' | 'right' | 'hazard';
}
