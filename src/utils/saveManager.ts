import { PlayerSaveData } from '../types';

const SAVE_KEY = '3d_parking_master_save_v1';

export const DEFAULT_SAVE_DATA: PlayerSaveData = {
  version: 1,
  coins: 0,
  currentLevel: 1,
  unlockedLevels: [1],
  levelScores: {},
  ownedCars: ['car_hatchback'],
  selectedCarId: 'car_hatchback',
  language: 'uz', // default initial language or will be prompted
  theme: 'dark',
  soundEnabled: true,
  soundVolume: 0.8,
  musicEnabled: true,
  musicVolume: 0.5,
  vibrationEnabled: true,
  graphicsQuality: 'high',
  hasCompletedFirstTimeSetup: false,
  unpaidFine: null,
  jailTimeRemaining: 0,
  transmissionMode: 'automatic',
  sideMirrorsEnabled: true,
};

export class SaveManager {
  public static load(): PlayerSaveData {
    try {
      const dataStr = localStorage.getItem(SAVE_KEY);
      if (!dataStr) {
        return { ...DEFAULT_SAVE_DATA };
      }
      const parsed = JSON.parse(dataStr);
      // Merge with default to guarantee all fields exist even if save was from older version
      return {
        ...DEFAULT_SAVE_DATA,
        ...parsed,
        unlockedLevels: Array.isArray(parsed.unlockedLevels) && parsed.unlockedLevels.length > 0
          ? parsed.unlockedLevels
          : [1],
        ownedCars: Array.isArray(parsed.ownedCars) && parsed.ownedCars.length > 0
          ? parsed.ownedCars
          : ['car_hatchback'],
      };
    } catch (e) {
      console.error('Failed to load save data, resetting to defaults', e);
      return { ...DEFAULT_SAVE_DATA };
    }
  }

  public static save(data: PlayerSaveData): void {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save data to localStorage', e);
    }
  }

  public static resetProgress(currentSettings?: Partial<PlayerSaveData>): PlayerSaveData {
    const fresh: PlayerSaveData = {
      ...DEFAULT_SAVE_DATA,
      hasCompletedFirstTimeSetup: true,
      ...(currentSettings || {}),
      coins: 0,
      currentLevel: 1,
      unlockedLevels: [1],
      levelScores: {},
      ownedCars: ['car_hatchback'],
      selectedCarId: 'car_hatchback',
    };
    this.save(fresh);
    return fresh;
  }
}
