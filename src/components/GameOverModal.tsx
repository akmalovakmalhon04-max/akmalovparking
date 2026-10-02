import React from 'react';
import { RotateCcw, Grid, Home, AlertOctagon, Timer, Car } from 'lucide-react';
import { GameOverReason, Language } from '../types';
import { translations } from '../i18n/translations';
import { audio } from '../utils/audio';

interface GameOverModalProps {
  reason: GameOverReason;
  obstacleName?: string;
  language: Language;
  onRetry: () => void;
  onLevelSelect: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  reason,
  obstacleName,
  language,
  onRetry,
  onLevelSelect,
  onMainMenu,
}) => {
  const t = translations[language];

  let title = t.crashTitle;
  let desc = t.crashDesc;
  let icon = <Car className="w-12 h-12 text-rose-500" />;

  if (reason === 'timeout') {
    title = t.timeUp;
    desc = t.timeUpDesc;
    icon = <Timer className="w-12 h-12 text-amber-500" />;
  } else if (reason === 'wrong_parking') {
    title = t.wrongParkingTitle;
    desc = t.wrongParkingDesc;
    icon = <AlertOctagon className="w-12 h-12 text-rose-500" />;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none text-white">
      <div className="w-full max-w-sm bg-slate-900 border border-rose-500/50 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col items-center gap-4 text-center animate-in zoom-in-95 duration-200">
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
          {icon}
        </div>

        <div>
          <span className="text-[11px] uppercase tracking-widest font-black text-rose-400">
            {t.gameOverTitle}
          </span>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white mt-0.5">
            {title}
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
            {desc}
          </p>
          {obstacleName && reason === 'crash' && (
            <div className="mt-2 text-[11px] font-bold text-rose-300/80 bg-rose-950/40 border border-rose-900/50 py-1 px-3 rounded-lg inline-block">
              {obstacleName}
            </div>
          )}
        </div>

        <div className="w-full flex flex-col gap-2.5 mt-2">
          {/* Retry Button */}
          <button
            onClick={() => {
              audio.playClick();
              onRetry();
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-display font-black text-lg tracking-wider shadow-lg shadow-rose-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>{t.retry}</span>
          </button>

          {/* Level Select */}
          <button
            onClick={() => {
              audio.playClick();
              onLevelSelect();
            }}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white font-display font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Grid className="w-4 h-4 text-sky-400" />
            <span>{t.levelSelect}</span>
          </button>

          {/* Main Menu */}
          <button
            onClick={() => {
              audio.playClick();
              onMainMenu();
            }}
            className="w-full py-3 rounded-2xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white font-display font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>{t.mainMenu}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
