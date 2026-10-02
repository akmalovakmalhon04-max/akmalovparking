/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { GameState, GameOverReason, InputState, PlayerSaveData, Language, Theme, GraphicsQuality, CameraViewMode, TransmissionMode } from './types';
import { CARS_DATA } from './game/carsData';
import { getLevelData } from './game/levelsData';
import { SaveManager } from './utils/saveManager';
import { audio } from './utils/audio';
import { translations } from './i18n/translations';
import { GameCanvas } from './game/GameCanvas';
import { HUD } from './components/HUD';
import { MobileControls } from './components/MobileControls';
import { SideMirrorsOverlay } from './components/SideMirrorsOverlay';
import { MainMenu } from './components/MainMenu';
import { GarageModal } from './components/GarageModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { SettingsModal } from './components/SettingsModal';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { FirstTimeModal } from './components/FirstTimeModal';
import { JailModal } from './components/JailModal';

export default function App() {
  // 1. Player Data state
  const [saveData, setSaveData] = useState<PlayerSaveData>(() => SaveManager.load());

  // 2. Active Game State
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [selectedLevelNum, setSelectedLevelNum] = useState<number>(() => saveData.currentLevel);

  // Active level data
  const levelData = useMemo(() => getLevelData(selectedLevelNum), [selectedLevelNum]);

  // Active car data
  const selectedCar = useMemo(() => {
    const found = CARS_DATA.find((c) => c.id === saveData.selectedCarId);
    return found || CARS_DATA[0];
  }, [saveData.selectedCarId]);

  // 3. Gameplay Realtime state
  const [remainingTime, setRemainingTime] = useState<number>(levelData.timeLimit);
  const [speedKmh, setSpeedKmh] = useState<number>(0);
  const [alignmentPercent, setAlignmentPercent] = useState<number>(0);
  const [isReversing, setIsReversing] = useState<boolean>(false);
  const [cameraResetTrigger, setCameraResetTrigger] = useState<number>(0);
  const [resetTrigger, setResetTrigger] = useState<number>(0);

  // Game over details
  const [gameOverReason, setGameOverReason] = useState<GameOverReason>('crash');
  const [crashedObstacle, setCrashedObstacle] = useState<string>('');

  // Level complete details
  const [winTimeTaken, setWinTimeTaken] = useState<number>(0);

  // Speeding radar & fine alerts
  const [fineToast, setFineToast] = useState<string | null>(null);
  const [cameraFlash, setCameraFlash] = useState<boolean>(false);
  const lastSpeedFineTimeRef = useRef<number>(0);

  // 4. Camera View & Mirrors state
  const [cameraViewMode, setCameraViewMode] = useState<CameraViewMode>('third_person');
  const [sideMirrorsEnabled, setSideMirrorsEnabled] = useState<boolean>(() => saveData.sideMirrorsEnabled ?? false);

  // 5. Transmission & Gear state (Avtomat AT vs Mexanika MT)
  const [transmissionMode, setTransmissionMode] = useState<TransmissionMode>(() => saveData.transmissionMode ?? 'automatic');
  const [manualGear, setManualGear] = useState<number>(1);
  const [turnSignal, setTurnSignal] = useState<'none' | 'left' | 'right' | 'hazard'>('none');

  // 6. Input State
  const [inputState, setInputState] = useState<InputState>({
    gas: false,
    reverse: false,
    steerLeft: false,
    steerRight: false,
    handbrake: false,
    steerValue: 0,
    gear: transmissionMode === 'manual' ? manualGear : undefined,
    turnSignal: 'none',
  });

  // Keep inputState gear and turnSignal synced
  useEffect(() => {
    setInputState((prev) => ({
      ...prev,
      gear: transmissionMode === 'manual' ? manualGear : undefined,
      turnSignal,
    }));
  }, [transmissionMode, manualGear, turnSignal]);

  // 5. Unpaid Fine 5-minute Countdown Timer (300 seconds -> Jail)
  useEffect(() => {
    if (!saveData.unpaidFine) return;

    const interval = setInterval(() => {
      setSaveData((prev) => {
        if (!prev.unpaidFine) return prev;
        const remaining = prev.unpaidFine.remainingSeconds - 1;

        if (remaining <= 0) {
          // 5 MINUTES EXPIRED! POLICE ARREST & SEND TO JAIL FOR 1.5 MINUTES (90 SECONDS)
          audio.playPoliceSiren();
          const updated = {
            ...prev,
            unpaidFine: null,
            jailTimeRemaining: 90, // 1.5 minutes
          };
          SaveManager.save(updated);
          return updated;
        }

        const updated = {
          ...prev,
          unpaidFine: {
            ...prev.unpaidFine,
            remainingSeconds: remaining,
          },
        };
        SaveManager.save(updated);
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [saveData.unpaidFine]);

  // Apply theme to document element
  useEffect(() => {
    if (saveData.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.className = 'overflow-hidden select-none bg-slate-950 text-white font-sans antialiased';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = 'overflow-hidden select-none bg-slate-100 text-slate-900 font-sans antialiased';
    }
  }, [saveData.theme]);

  // Sync audio system settings
  useEffect(() => {
    audio.setSettings(
      saveData.soundEnabled,
      saveData.musicEnabled,
      saveData.vibrationEnabled,
      saveData.soundVolume,
      saveData.musicVolume
    );
  }, [
    saveData.soundEnabled,
    saveData.musicEnabled,
    saveData.vibrationEnabled,
    saveData.soundVolume,
    saveData.musicVolume,
  ]);

  // Reset level timer when starting or switching level
  useEffect(() => {
    setRemainingTime(levelData.timeLimit);
    setInputState({
      gas: false,
      reverse: false,
      steerLeft: false,
      steerRight: false,
      handbrake: false,
      steerValue: 0,
      gear: transmissionMode === 'manual' ? manualGear : undefined,
      turnSignal: 'none',
    });
  }, [selectedLevelNum, levelData, transmissionMode, manualGear]);

  // In-Game Countdown Timer
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          // TIME UP!
          setGameOverReason('timeout');
          setGameState('GAME_OVER');
          audio.playGameOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  // Keyboard controls listener (PC WASD / Arrows / Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Pause shortcut
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (gameState === 'PLAYING') {
          setGameState('PAUSED');
          audio.playClick();
          return;
        } else if (gameState === 'PAUSED') {
          setGameState('PLAYING');
          audio.playClick();
          return;
        }
      }

      // Quick restart shortcut (R key)
      if ((e.key === 'r' || e.key === 'R') && gameState === 'PLAYING') {
        restartLevel();
        return;
      }

      // Camera view toggle: 1-litso / 3-litso (C key)
      if (e.key === 'c' || e.key === 'C') {
        setCameraViewMode((prev) => (prev === 'first_person' ? 'third_person' : 'first_person'));
        audio.playClick();
        return;
      }

      // Side mirrors toggle: Bokovoy (M key)
      if (e.key === 'm' || e.key === 'M') {
        setSideMirrorsEnabled((prev) => {
          const next = !prev;
          SaveManager.save({ ...saveData, sideMirrorsEnabled: next });
          return next;
        });
        audio.playClick();
        return;
      }

      // Transmission toggle: Avtomat / Mexanika (T key)
      if (e.key === 't' || e.key === 'T') {
        setTransmissionMode((prev) => {
          const next = prev === 'automatic' ? 'manual' : 'automatic';
          SaveManager.save({ ...saveData, transmissionMode: next });
          return next;
        });
        audio.playClick();
        return;
      }

      // Manual Gear shifting shortcuts (E: Up, Q: Down, 0: N, X: R, 1-5: Gears)
      if (transmissionMode === 'manual') {
        if (e.key === 'e' || e.key === 'E') {
          setManualGear((prev) => Math.min(5, prev + 1));
          audio.playClick();
          return;
        }
        if (e.key === 'q' || e.key === 'Q') {
          setManualGear((prev) => Math.max(-1, prev - 1));
          audio.playClick();
          return;
        }
        if (e.key >= '1' && e.key <= '5') {
          setManualGear(parseInt(e.key, 10));
          audio.playClick();
          return;
        }
        if (e.key === '0' || e.key === 'n' || e.key === 'N') {
          setManualGear(0);
          audio.playClick();
          return;
        }
        if (e.key === 'x' || e.key === 'X') {
          setManualGear(-1);
          audio.playClick();
          return;
        }
      }

      if (gameState !== 'PLAYING') return;

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          setInputState((prev) => ({ ...prev, gas: true }));
          break;
        case 'KeyS':
        case 'ArrowDown':
          setInputState((prev) => ({ ...prev, reverse: true }));
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setInputState((prev) => ({ ...prev, steerLeft: true }));
          break;
        case 'KeyD':
        case 'ArrowRight':
          setInputState((prev) => ({ ...prev, steerRight: true }));
          break;
        case 'Space':
          setInputState((prev) => ({ ...prev, handbrake: true }));
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (gameState !== 'PLAYING') return;

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          setInputState((prev) => ({ ...prev, gas: false }));
          break;
        case 'KeyS':
        case 'ArrowDown':
          setInputState((prev) => ({ ...prev, reverse: false }));
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setInputState((prev) => ({ ...prev, steerLeft: false }));
          break;
        case 'KeyD':
        case 'ArrowRight':
          setInputState((prev) => ({ ...prev, steerRight: false }));
          break;
        case 'Space':
          setInputState((prev) => ({ ...prev, handbrake: false }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Restart current level (re-spawns car at startPos, resets timer and physics)
  const restartLevel = useCallback(() => {
    setRemainingTime(levelData.timeLimit);
    setInputState({
      gas: false,
      reverse: false,
      steerLeft: false,
      steerRight: false,
      handbrake: false,
      steerValue: 0,
      gear: transmissionMode === 'manual' ? 1 : undefined,
      turnSignal: 'none',
    });
    setManualGear(1);
    setSpeedKmh(0);
    setAlignmentPercent(0);
    setIsReversing(false);
    setResetTrigger((prev) => prev + 1);
    setCameraResetTrigger((prev) => prev + 1);
    setGameState('PLAYING');
    audio.startEngine();
  }, [levelData, transmissionMode]);

  // Collision callback from canvas
  const handleCrash = useCallback((obstacle: string) => {
    setCrashedObstacle(obstacle);
    setGameOverReason('crash');
    setGameState('GAME_OVER');
  }, []);

  // Win callback from canvas
  const handleWin = useCallback((timeTaken: number) => {
    setWinTimeTaken(timeTaken);

    // Calculate score & rewards
    const timeBonus = Math.max(0, Math.round(((levelData.timeLimit - timeTaken) / levelData.timeLimit) * 50));
    const perfectBonus = 30;
    const totalCoinsEarned = levelData.baseReward + timeBonus + perfectBonus;

    const timeRatio = timeTaken / levelData.timeLimit;
    const stars = timeRatio < 0.4 ? 3 : timeRatio < 0.75 ? 2 : 1;

    setSaveData((prev) => {
      const nextLevel = Math.min(100, selectedLevelNum + 1);
      const updatedUnlocked = prev.unlockedLevels.includes(nextLevel)
        ? prev.unlockedLevels
        : [...prev.unlockedLevels, nextLevel];

      const currentScore = prev.levelScores[selectedLevelNum];
      const bestTime = currentScore ? Math.min(currentScore.bestTime, timeTaken) : timeTaken;
      const bestStars = currentScore ? Math.max(currentScore.stars, stars) : stars;

      const updated = {
        ...prev,
        coins: prev.coins + totalCoinsEarned,
        unlockedLevels: updatedUnlocked,
        levelScores: {
          ...prev.levelScores,
          [selectedLevelNum]: {
            stars: bestStars,
            timeTaken,
            bestTime,
          },
        },
      };

      SaveManager.save(updated);
      return updated;
    });

    setGameState('LEVEL_COMPLETE');
  }, [levelData, selectedLevelNum]);

  // Progress update tick from canvas & speed limit radar check
  const handleCanvasTick = useCallback((speed: number, alignment: number, reversing: boolean) => {
    setSpeedKmh(speed);
    setAlignmentPercent(alignment);
    setIsReversing(reversing);

    const speedLimit = levelData.speedLimit || 60;
    const now = performance.now();

    // Check Speed Limit Exceeded (e.g. > 60 KM/H)
    if (speed > speedLimit && now - lastSpeedFineTimeRef.current > 4000) {
      lastSpeedFineTimeRef.current = now;

      // Trigger radar flash & audio
      setCameraFlash(true);
      setTimeout(() => setCameraFlash(false), 220);
      audio.playRadarFlash();

      const fineAmount = 10;
      const t = translations[saveData.language];

      if (saveData.coins >= fineAmount) {
        // Player has money -> Immediately deduct 10 coins
        setSaveData((prev) => {
          const updated = {
            ...prev,
            coins: Math.max(0, prev.coins - fineAmount),
          };
          SaveManager.save(updated);
          return updated;
        });
        setFineToast(`${t.speedLimitExceeded} (-${fineAmount} ${t.coins})`);
        setTimeout(() => setFineToast(null), 3500);
      } else {
        // Player has no money -> 5-minute countdown (300 seconds) issued!
        setSaveData((prev) => {
          if (prev.unpaidFine) return prev; // already pending
          const updated = {
            ...prev,
            unpaidFine: { amount: fineAmount, remainingSeconds: 300 },
          };
          SaveManager.save(updated);
          return updated;
        });
        setFineToast(t.unpaidFineWarning);
        setTimeout(() => setFineToast(null), 4000);
      }
    }
  }, [levelData, saveData.language, saveData.coins]);

  // Pay unpaid fine manually
  const handlePayFine = () => {
    if (!saveData.unpaidFine || saveData.coins < saveData.unpaidFine.amount) return;
    audio.playCoin();
    setSaveData((prev) => {
      if (!prev.unpaidFine) return prev;
      const updated = {
        ...prev,
        coins: prev.coins - prev.unpaidFine.amount,
        unpaidFine: null,
      };
      SaveManager.save(updated);
      return updated;
    });
    const t = translations[saveData.language];
    setFineToast(t.finePaid);
    setTimeout(() => setFineToast(null), 3000);
  };

  // Jail completion handler (1.5 minutes served)
  const handleJailSentenceComplete = () => {
    audio.playWin();
    setSaveData((prev) => {
      const updated = {
        ...prev,
        jailTimeRemaining: 0,
      };
      SaveManager.save(updated);
      return updated;
    });
    const t = translations[saveData.language];
    setFineToast(t.jailSentenceServed);
    setTimeout(() => setFineToast(null), 4000);
  };

  // Bail out of jail with 10 coins
  const handleBailOut = () => {
    if (saveData.coins < 10) return;
    audio.playCoin();
    setSaveData((prev) => {
      const updated = {
        ...prev,
        coins: prev.coins - 10,
        jailTimeRemaining: 0,
      };
      SaveManager.save(updated);
      return updated;
    });
  };

  // Garage actions
  const handleBuyCar = useCallback((car: typeof CARS_DATA[0]) => {
    if (saveData.coins < car.price) return false;

    setSaveData((prev) => {
      const updated = {
        ...prev,
        coins: prev.coins - car.price,
        ownedCars: [...prev.ownedCars, car.id],
        selectedCarId: car.id,
      };
      SaveManager.save(updated);
      return updated;
    });
    return true;
  }, [saveData.coins]);

  const handleSelectCar = useCallback((carId: string) => {
    setSaveData((prev) => {
      const updated = {
        ...prev,
        selectedCarId: carId,
      };
      SaveManager.save(updated);
      return updated;
    });
  }, []);

  // Settings actions
  const handleUpdateLanguage = (lang: Language) => {
    setSaveData((prev) => {
      const updated = { ...prev, language: lang };
      SaveManager.save(updated);
      return updated;
    });
  };

  const handleUpdateTheme = (theme: Theme) => {
    setSaveData((prev) => {
      const updated = { ...prev, theme };
      SaveManager.save(updated);
      return updated;
    });
  };

  const handleToggleTheme = () => {
    handleUpdateTheme(saveData.theme === 'dark' ? 'light' : 'dark');
  };

  const handleCycleLanguage = () => {
    const langs: Language[] = ['en', 'ru', 'uz'];
    const nextIdx = (langs.indexOf(saveData.language) + 1) % langs.length;
    handleUpdateLanguage(langs[nextIdx]);
  };

  const handleUpdateSound = (enabled: boolean, vol?: number) => {
    setSaveData((prev) => {
      const updated = {
        ...prev,
        soundEnabled: enabled,
        soundVolume: vol !== undefined ? vol : prev.soundVolume,
      };
      SaveManager.save(updated);
      return updated;
    });
  };

  const handleUpdateMusic = (enabled: boolean, vol?: number) => {
    setSaveData((prev) => {
      const updated = {
        ...prev,
        musicEnabled: enabled,
        musicVolume: vol !== undefined ? vol : prev.musicVolume,
      };
      SaveManager.save(updated);
      return updated;
    });
  };

  const handleUpdateVibration = (enabled: boolean) => {
    setSaveData((prev) => {
      const updated = { ...prev, vibrationEnabled: enabled };
      SaveManager.save(updated);
      return updated;
    });
  };

  const handleUpdateGraphics = (quality: GraphicsQuality) => {
    setSaveData((prev) => {
      const updated = { ...prev, graphicsQuality: quality };
      SaveManager.save(updated);
      return updated;
    });
  };

  const handleResetProgress = () => {
    const fresh = SaveManager.resetProgress({
      language: saveData.language,
      theme: saveData.theme,
      soundEnabled: saveData.soundEnabled,
      musicEnabled: saveData.musicEnabled,
      vibrationEnabled: saveData.vibrationEnabled,
      graphicsQuality: saveData.graphicsQuality,
    });
    setSaveData(fresh);
    setSelectedLevelNum(1);
  };

  // First time modal complete
  const handleFirstTimeComplete = (lang: Language, theme: Theme) => {
    setSaveData((prev) => {
      const updated = {
        ...prev,
        language: lang,
        theme,
        hasCompletedFirstTimeSetup: true,
      };
      SaveManager.save(updated);
      return updated;
    });
  };

  // Camera toggle handler (1-litso vs 3-litso)
  const handleToggleCameraView = useCallback(() => {
    setCameraViewMode((prev) => (prev === 'first_person' ? 'third_person' : 'first_person'));
    audio.playClick();
  }, []);

  // Side mirrors toggle handler (Bokovoy oynalar)
  const handleToggleSideMirrors = useCallback(() => {
    setSideMirrorsEnabled((prev) => {
      const next = !prev;
      SaveManager.save({ ...saveData, sideMirrorsEnabled: next });
      return next;
    });
    audio.playClick();
  }, [saveData]);

  // Transmission mode toggle handler (Avtomat AT vs Mexanika MT)
  const handleToggleTransmissionMode = useCallback(() => {
    setTransmissionMode((prev) => {
      const next = prev === 'automatic' ? 'manual' : 'automatic';
      SaveManager.save({ ...saveData, transmissionMode: next });
      return next;
    });
    audio.playClick();
  }, [saveData]);

  // Shift gear handler for manual mode
  const handleShiftGear = useCallback((gear: number) => {
    setManualGear(gear);
    audio.playClick();
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WebGL Canvas Layer (Always rendered for seamless transitions) */}
      <GameCanvas
        levelData={levelData}
        carConfig={selectedCar}
        inputState={inputState}
        graphicsQuality={saveData.graphicsQuality}
        isPaused={gameState !== 'PLAYING'}
        onCrash={handleCrash}
        onWin={handleWin}
        onTick={handleCanvasTick}
        cameraResetTrigger={cameraResetTrigger}
        resetTrigger={resetTrigger}
        cameraViewMode={cameraViewMode}
      />

      {/* SIDE MIRRORS OVERLAY (Bokovoy ko‘zgular) */}
      {gameState === 'PLAYING' && (
        <SideMirrorsOverlay
          enabled={sideMirrorsEnabled}
          steerAngle={inputState.steerValue || (inputState.steerLeft ? 0.4 : inputState.steerRight ? -0.4 : 0)}
          speedKmh={speedKmh}
          isReversing={isReversing}
          alignmentPercent={alignmentPercent}
          language={saveData.language}
          onToggle={handleToggleSideMirrors}
        />
      )}

      {/* IN-GAME HUD & MOBILE CONTROLS */}
      {gameState === 'PLAYING' && (
        <>
          <HUD
            level={selectedLevelNum}
            totalLevels={100}
            remainingTime={remainingTime}
            coins={saveData.coins}
            speedKmh={speedKmh}
            alignmentPercent={alignmentPercent}
            isReversing={isReversing}
            language={saveData.language}
            speedLimit={levelData.speedLimit || 60}
            unpaidFine={saveData.unpaidFine}
            fineToast={fineToast}
            cameraFlash={cameraFlash}
            cameraViewMode={cameraViewMode}
            sideMirrorsEnabled={sideMirrorsEnabled}
            turnSignal={turnSignal}
            transmissionMode={transmissionMode}
            manualGear={manualGear}
            onPause={() => {
              audio.playClick();
              setGameState('PAUSED');
            }}
            onResetCamera={() => {
              audio.playClick();
              setCameraResetTrigger((prev) => prev + 1);
            }}
            onRestart={() => {
              audio.playClick();
              restartLevel();
            }}
            onPayFine={handlePayFine}
            onToggleCameraView={handleToggleCameraView}
            onToggleSideMirrors={handleToggleSideMirrors}
            onSetTurnSignal={setTurnSignal}
            onToggleTransmissionMode={handleToggleTransmissionMode}
            onShiftGear={handleShiftGear}
          />

          <MobileControls
            inputState={inputState}
            onInputChange={setInputState}
            language={saveData.language}
            transmissionMode={transmissionMode}
            manualGear={manualGear}
            onShiftGear={handleShiftGear}
            cameraViewMode={cameraViewMode}
            onToggleCameraView={handleToggleCameraView}
            onRestart={() => {
              audio.playClick();
              restartLevel();
            }}
          />
        </>
      )}

      {/* MAIN MENU */}
      {gameState === 'MENU' && (
        <MainMenu
          selectedCar={selectedCar}
          coins={saveData.coins}
          unlockedLevelsCount={saveData.unlockedLevels.length}
          totalLevels={100}
          language={saveData.language}
          theme={saveData.theme}
          onPlay={() => {
            audio.playClick();
            restartLevel();
          }}
          onOpenGarage={() => {
            audio.playClick();
            setGameState('GARAGE');
          }}
          onOpenLevelSelect={() => {
            audio.playClick();
            setGameState('LEVEL_SELECT');
          }}
          onOpenSettings={() => {
            audio.playClick();
            setGameState('SETTINGS');
          }}
          onToggleTheme={handleToggleTheme}
          onCycleLanguage={handleCycleLanguage}
        />
      )}

      {/* GARAGE MODAL */}
      {gameState === 'GARAGE' && (
        <GarageModal
          coins={saveData.coins}
          ownedCarIds={saveData.ownedCars}
          selectedCarId={saveData.selectedCarId}
          language={saveData.language}
          onSelectCar={handleSelectCar}
          onBuyCar={handleBuyCar}
          onClose={() => {
            audio.playClick();
            setGameState('MENU');
          }}
        />
      )}

      {/* LEVEL SELECT MODAL */}
      {gameState === 'LEVEL_SELECT' && (
        <LevelSelectModal
          unlockedLevels={saveData.unlockedLevels}
          levelScores={saveData.levelScores}
          currentLevel={selectedLevelNum}
          language={saveData.language}
          onSelectLevel={(lvl) => {
            setSelectedLevelNum(lvl);
            restartLevel();
          }}
          onClose={() => {
            audio.playClick();
            setGameState('MENU');
          }}
        />
      )}

      {/* SETTINGS MODAL */}
      {gameState === 'SETTINGS' && (
        <SettingsModal
          language={saveData.language}
          theme={saveData.theme}
          soundEnabled={saveData.soundEnabled}
          soundVolume={saveData.soundVolume}
          musicEnabled={saveData.musicEnabled}
          musicVolume={saveData.musicVolume}
          vibrationEnabled={saveData.vibrationEnabled}
          graphicsQuality={saveData.graphicsQuality}
          transmissionMode={transmissionMode}
          sideMirrorsEnabled={sideMirrorsEnabled}
          onUpdateLanguage={handleUpdateLanguage}
          onUpdateTheme={handleUpdateTheme}
          onUpdateSound={handleUpdateSound}
          onUpdateMusic={handleUpdateMusic}
          onUpdateVibration={handleUpdateVibration}
          onUpdateGraphics={handleUpdateGraphics}
          onUpdateTransmissionMode={handleToggleTransmissionMode}
          onUpdateSideMirrors={handleToggleSideMirrors}
          onResetProgress={handleResetProgress}
          onClose={() => {
            audio.playClick();
            setGameState('MENU');
          }}
        />
      )}

      {/* PAUSE MODAL */}
      {gameState === 'PAUSED' && (
        <PauseModal
          language={saveData.language}
          onResume={() => {
            audio.playClick();
            setGameState('PLAYING');
          }}
          onRestart={() => {
            audio.playClick();
            restartLevel();
          }}
          onOpenSettings={() => {
            audio.playClick();
            setGameState('SETTINGS');
          }}
          onMainMenu={() => {
            audio.playClick();
            setGameState('MENU');
          }}
        />
      )}

      {/* GAME OVER MODAL */}
      {gameState === 'GAME_OVER' && (
        <GameOverModal
          reason={gameOverReason}
          obstacleName={crashedObstacle}
          language={saveData.language}
          onRetry={() => {
            audio.playClick();
            restartLevel();
          }}
          onLevelSelect={() => {
            audio.playClick();
            setGameState('LEVEL_SELECT');
          }}
          onMainMenu={() => {
            audio.playClick();
            setGameState('MENU');
          }}
        />
      )}

      {/* LEVEL COMPLETE MODAL */}
      {gameState === 'LEVEL_COMPLETE' && (
        <LevelCompleteModal
          level={selectedLevelNum}
          timeTaken={winTimeTaken}
          timeLimit={levelData.timeLimit}
          baseReward={levelData.baseReward}
          language={saveData.language}
          onNextLevel={() => {
            audio.playClick();
            if (selectedLevelNum < 100) {
              setSelectedLevelNum((prev) => prev + 1);
            }
            restartLevel();
          }}
          onReplay={() => {
            audio.playClick();
            restartLevel();
          }}
          onLevelSelect={() => {
            audio.playClick();
            setGameState('LEVEL_SELECT');
          }}
          onMainMenu={() => {
            audio.playClick();
            setGameState('MENU');
          }}
        />
      )}

      {/* FIRST TIME ONBOARDING MODAL (Language & Theme selection) */}
      {!saveData.hasCompletedFirstTimeSetup && (
        <FirstTimeModal onComplete={handleFirstTimeComplete} />
      )}

      {/* POLICE JAIL MODAL (1.5 MINUTES / 90 SECONDS SENTENCE) */}
      {saveData.jailTimeRemaining > 0 && (
        <JailModal
          jailTimeRemaining={saveData.jailTimeRemaining}
          playerCoins={saveData.coins}
          language={saveData.language}
          onBailOut={handleBailOut}
          onSentenceComplete={handleJailSentenceComplete}
        />
      )}
    </main>
  );
}
