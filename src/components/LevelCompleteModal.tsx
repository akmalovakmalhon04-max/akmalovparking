import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowRight, RotateCcw, Grid, Home, Star, Coins, Timer, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { audio } from '../utils/audio';

interface LevelCompleteModalProps {
  level: number;
  timeTaken: number;
  timeLimit: number;
  baseReward: number;
  language: Language;
  onNextLevel: () => void;
  onReplay: () => void;
  onLevelSelect: () => void;
  onMainMenu: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  level,
  timeTaken,
  timeLimit,
  baseReward,
  language,
  onNextLevel,
  onReplay,
  onLevelSelect,
  onMainMenu,
}) => {
  const t = translations[language];

  // Calculate bonuses & stars
  const timeBonus = Math.max(0, Math.round(((timeLimit - timeTaken) / timeLimit) * 50));
  const perfectBonus = 30;
  const totalCoins = baseReward + timeBonus + perfectBonus;

  // Stars: based on remaining time
  const timeRatio = timeTaken / timeLimit;
  const stars = timeRatio < 0.4 ? 3 : timeRatio < 0.75 ? 2 : 1;

  // Trigger celebration confetti
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#38bdf8', '#fbbf24', '#f43f5e'],
      });
      setTimeout(() => {
        audio.playCoin();
      }, 400);
    } catch {
      // Safe fallback
    }
  }, []);

  // Format time MM:SS
  const mins = Math.floor(timeTaken / 60);
  const secs = Math.floor(timeTaken % 60);
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none text-white">
      <div className="w-full max-w-sm bg-slate-900 border border-emerald-500/50 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col items-center gap-4 text-center animate-in zoom-in-95 duration-200">
        {/* Banner */}
        <div className="flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.perfectParking}</span>
          </div>

          <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
            {t.levelCompleteTitle}
          </h2>
          <span className="text-xs text-slate-400 font-semibold mt-0.5">
            Level {level} Passed
          </span>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-2 my-1">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`p-2 rounded-2xl border ${
                s <= stars
                  ? 'border-amber-400/80 bg-amber-500/20 text-amber-400 scale-110 shadow-lg shadow-amber-500/30'
                  : 'border-slate-800 bg-slate-850 text-slate-600'
              } transition-all`}
            >
              <Star className={`w-6 h-6 ${s <= stars ? 'fill-amber-400' : ''}`} />
            </div>
          ))}
        </div>

        {/* Score Details Breakdown */}
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2.5 text-xs">
          {/* Time Elapsed */}
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Timer className="w-3.5 h-3.5 text-sky-400" /> {t.timeTaken}
            </span>
            <span className="font-display font-bold text-white text-sm">{formattedTime}</span>
          </div>

          {/* Base Reward */}
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">{t.baseReward}</span>
            <span className="font-display font-bold text-amber-300">+{baseReward}</span>
          </div>

          {/* Speed & Perfect Bonus */}
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">{t.timeBonus} & Perfect</span>
            <span className="font-display font-bold text-emerald-400">+{timeBonus + perfectBonus}</span>
          </div>

          <div className="w-full h-px bg-slate-800 my-0.5" />

          {/* Total Reward */}
          <div className="flex items-center justify-between font-bold text-sm">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Coins className="w-4 h-4 text-amber-400" /> {t.totalReward}
            </span>
            <span className="font-display font-black text-xl text-amber-300">
              +{totalCoins}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-2.5 mt-1">
          {/* Next Level */}
          <button
            onClick={() => {
              audio.playClick();
              onNextLevel();
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-display font-black text-lg tracking-wider shadow-lg shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>{t.nextLevel}</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Secondary Actions */}
          <div className="grid grid-cols-3 gap-2">
            {/* Replay */}
            <button
              onClick={() => {
                audio.playClick();
                onReplay();
              }}
              title={t.replay}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white font-bold text-xs active:scale-95 transition-all flex flex-col items-center justify-center gap-1"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>{t.replay}</span>
            </button>

            {/* Level Select */}
            <button
              onClick={() => {
                audio.playClick();
                onLevelSelect();
              }}
              title={t.levelSelect}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white font-bold text-xs active:scale-95 transition-all flex flex-col items-center justify-center gap-1"
            >
              <Grid className="w-4 h-4 text-sky-400" />
              <span className="truncate max-w-full px-1">{t.levels}</span>
            </button>

            {/* Main Menu */}
            <button
              onClick={() => {
                audio.playClick();
                onMainMenu();
              }}
              title={t.mainMenu}
              className="py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs active:scale-95 transition-all flex flex-col items-center justify-center gap-1"
            >
              <Home className="w-4 h-4" />
              <span className="truncate max-w-full px-1">{t.mainMenu}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
