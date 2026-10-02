import React from 'react';
import { Play, RotateCcw, Settings, Home } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { audio } from '../utils/audio';

interface PauseModalProps {
  language: Language;
  onResume: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onMainMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  language,
  onResume,
  onRestart,
  onOpenSettings,
  onMainMenu,
}) => {
  const t = translations[language];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none text-white">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4 text-center">
        <h2 className="font-display font-black text-2xl sm:text-3xl tracking-wider text-sky-400">
          {t.pause.toUpperCase()}
        </h2>

        <div className="w-full flex flex-col gap-2.5 mt-2">
          {/* Resume */}
          <button
            onClick={() => {
              audio.playClick();
              onResume();
            }}
            className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-display font-black text-lg tracking-wider shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>{t.resume}</span>
          </button>

          {/* Restart */}
          <button
            onClick={() => {
              audio.playClick();
              onRestart();
            }}
            className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white font-display font-bold text-base active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5 text-amber-400" />
            <span>{t.restart}</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              audio.playClick();
              onOpenSettings();
            }}
            className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white font-display font-bold text-base active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Settings className="w-5 h-5 text-slate-300" />
            <span>{t.settings}</span>
          </button>

          {/* Main Menu */}
          <button
            onClick={() => {
              audio.playClick();
              onMainMenu();
            }}
            className="w-full py-3.5 rounded-2xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white font-display font-bold text-base active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            <span>{t.mainMenu}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
