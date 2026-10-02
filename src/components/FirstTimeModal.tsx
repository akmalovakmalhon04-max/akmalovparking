import React, { useState } from 'react';
import { Check, Moon, Sun, Globe } from 'lucide-react';
import { Language, Theme } from '../types';
import { translations } from '../i18n/translations';
import { audio } from '../utils/audio';

interface FirstTimeModalProps {
  onComplete: (lang: Language, theme: Theme) => void;
}

export const FirstTimeModal: React.FC<FirstTimeModalProps> = ({ onComplete }) => {
  const [selectedLang, setSelectedLang] = useState<Language>('uz');
  const [selectedTheme, setSelectedTheme] = useState<Theme>('dark');

  const t = translations[selectedLang];

  const handleFinish = () => {
    audio.playClick();
    onComplete(selectedLang, selectedTheme);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 text-white animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 mb-3">
            <Globe className="w-8 h-8" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-black tracking-wide bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent">
            {t.welcomeTitle}
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            {t.welcomeSubtitle}
          </p>
        </div>

        {/* 1. Language Selection */}
        <div className="flex flex-col gap-2.5">
          <label className="text-xs uppercase font-bold tracking-wider text-slate-300">
            {t.selectLanguageTitle}
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'en' as Language, label: 'English', flag: '🇬🇧' },
              { id: 'ru' as Language, label: 'Русский', flag: '🇷🇺' },
              { id: 'uz' as Language, label: 'O‘zbekcha', flag: '🇺🇿' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  audio.playClick();
                  setSelectedLang(item.id);
                }}
                className={`py-3 px-2 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                  selectedLang === item.id
                    ? 'border-sky-500 bg-sky-500/15 text-white shadow-lg shadow-sky-500/20'
                    : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="text-2xl">{item.flag}</span>
                <span className="text-xs font-bold">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Theme Selection */}
        <div className="flex flex-col gap-2.5">
          <label className="text-xs uppercase font-bold tracking-wider text-slate-300">
            {t.selectThemeTitle}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                audio.playClick();
                setSelectedTheme('dark');
              }}
              className={`p-3.5 rounded-2xl border-2 flex items-center justify-center gap-2.5 transition-all ${
                selectedTheme === 'dark'
                  ? 'border-sky-500 bg-sky-500/15 text-white shadow-lg shadow-sky-500/20'
                  : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Moon className="w-5 h-5 text-sky-400" />
              <span className="font-bold text-sm">{t.darkMode}</span>
              {selectedTheme === 'dark' && <Check className="w-4 h-4 ml-auto text-sky-400" />}
            </button>

            <button
              onClick={() => {
                audio.playClick();
                setSelectedTheme('light');
              }}
              className={`p-3.5 rounded-2xl border-2 flex items-center justify-center gap-2.5 transition-all ${
                selectedTheme === 'light'
                  ? 'border-sky-500 bg-sky-500/15 text-white shadow-lg shadow-sky-500/20'
                  : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Sun className="w-5 h-5 text-amber-400" />
              <span className="font-bold text-sm">{t.lightMode}</span>
              {selectedTheme === 'light' && <Check className="w-4 h-4 ml-auto text-sky-400" />}
            </button>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleFinish}
          className="w-full py-4 mt-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-display font-black text-lg tracking-wider shadow-xl shadow-sky-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <span>{t.continueBtn}</span>
        </button>
      </div>
    </div>
  );
};
