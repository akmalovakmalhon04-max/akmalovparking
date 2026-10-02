import React from 'react';
import { Play, Settings, Car, Grid, Moon, Sun, Globe, Coins, ShieldCheck } from 'lucide-react';
import { CarConfig, Language, Theme } from '../types';
import { translations } from '../i18n/translations';
import { audio } from '../utils/audio';

interface MainMenuProps {
  selectedCar: CarConfig;
  coins: number;
  unlockedLevelsCount: number;
  totalLevels: number;
  language: Language;
  theme: Theme;
  onPlay: () => void;
  onOpenGarage: () => void;
  onOpenLevelSelect: () => void;
  onOpenSettings: () => void;
  onToggleTheme: () => void;
  onCycleLanguage: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  selectedCar,
  coins,
  unlockedLevelsCount,
  totalLevels,
  language,
  theme,
  onPlay,
  onOpenGarage,
  onOpenLevelSelect,
  onOpenSettings,
  onToggleTheme,
  onCycleLanguage,
}) => {
  const t = translations[language];

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 sm:p-8 bg-gradient-to-b from-slate-950/80 via-slate-900/60 to-slate-950/90 backdrop-blur-sm select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full">
        {/* Branding & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
            <span className="font-display font-black text-2xl text-white">3D</span>
          </div>
          <div>
            <h1 className="font-display font-black text-xl sm:text-2xl tracking-wider text-white">
              PARKING <span className="text-sky-400">MASTER</span>
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100 Levels Ready</span>
            </div>
          </div>
        </div>

        {/* Quick Actions (Coins, Theme, Language) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Coins Badge */}
          <div className="px-3.5 py-2 rounded-2xl bg-slate-900/80 border border-amber-500/40 text-amber-300 font-display font-bold flex items-center gap-2 shadow-md">
            <Coins className="w-5 h-5 text-amber-400" />
            <span className="text-base sm:text-lg">{coins.toLocaleString()}</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => {
              audio.playClick();
              onToggleTheme();
            }}
            title={theme === 'dark' ? t.lightMode : t.darkMode}
            className="w-10 h-10 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-md active:scale-95"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-sky-400" />}
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => {
              audio.playClick();
              onCycleLanguage();
            }}
            title={t.language}
            className="h-10 px-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white flex items-center gap-1.5 transition-all shadow-md active:scale-95 text-xs font-bold uppercase tracking-wider"
          >
            <Globe className="w-4 h-4 text-sky-400" />
            <span>{language.toUpperCase()}</span>
          </button>
        </div>
      </div>

      {/* Middle Banner (Selected Car Card) */}
      <div className="my-auto max-w-md mx-auto w-full text-center flex flex-col items-center">
        <div className="bg-slate-900/85 backdrop-blur-md border border-slate-800/80 p-5 rounded-3xl shadow-2xl w-full flex flex-col items-center">
          <span className="text-xs uppercase font-bold tracking-widest text-sky-400 mb-1">
            Current Vehicle
          </span>
          <h2 className="font-display font-black text-2xl text-white">
            {selectedCar.name}
          </h2>

          {/* Color swatch & stats summary */}
          <div className="flex items-center gap-4 mt-3">
            <div
              className="w-6 h-6 rounded-full border-2 border-white/60 shadow-inner"
              style={{ backgroundColor: selectedCar.primaryColor }}
            />
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <span>SPD {selectedCar.stats.speed}</span>
              <span>•</span>
              <span>ACC {selectedCar.stats.acceleration}</span>
              <span>•</span>
              <span>HND {selectedCar.stats.handling}</span>
            </div>
          </div>

          {/* Quick change garage link */}
          <button
            onClick={() => {
              audio.playClick();
              onOpenGarage();
            }}
            className="mt-4 text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 hover:underline"
          >
            <Car className="w-4 h-4" />
            <span>{t.garage}</span>
          </button>
        </div>
      </div>

      {/* Bottom Main Navigation Menu */}
      <div className="max-w-md mx-auto w-full flex flex-col gap-3">
        {/* PLAY BUTTON */}
        <button
          onClick={() => {
            audio.playClick();
            onPlay();
          }}
          className="w-full py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white font-display font-black text-xl sm:text-2xl tracking-wider shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-3 transition-all active:scale-98"
        >
          <Play className="w-7 h-7 fill-white" />
          <span>{t.play}</span>
        </button>

        {/* Secondary Row: Levels, Garage, Settings */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* LEVEL SELECT */}
          <button
            onClick={() => {
              audio.playClick();
              onOpenLevelSelect();
            }}
            className="py-3.5 px-2 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white flex flex-col items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Grid className="w-5 h-5 text-sky-400" />
            <span className="text-xs font-bold tracking-wider truncate">{t.levels}</span>
            <span className="text-[10px] text-slate-400">{unlockedLevelsCount} / {totalLevels}</span>
          </button>

          {/* GARAGE */}
          <button
            onClick={() => {
              audio.playClick();
              onOpenGarage();
            }}
            className="py-3.5 px-2 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white flex flex-col items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Car className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold tracking-wider truncate">{t.garage}</span>
            <span className="text-[10px] text-slate-400">10 Cars</span>
          </button>

          {/* SETTINGS */}
          <button
            onClick={() => {
              audio.playClick();
              onOpenSettings();
            }}
            className="py-3.5 px-2 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white flex flex-col items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Settings className="w-5 h-5 text-slate-300" />
            <span className="text-xs font-bold tracking-wider truncate">{t.settings}</span>
            <span className="text-[10px] text-slate-400">Audio & UI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
