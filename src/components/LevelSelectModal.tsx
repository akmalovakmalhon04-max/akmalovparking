import React, { useState } from 'react';
import { ArrowLeft, Lock, Star, Timer, Coins } from 'lucide-react';
import { Language, LevelResult } from '../types';
import { translations } from '../i18n/translations';
import { audio } from '../utils/audio';

interface LevelSelectModalProps {
  unlockedLevels: number[];
  levelScores: Record<number, LevelResult>;
  currentLevel: number;
  language: Language;
  onSelectLevel: (levelNum: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  unlockedLevels,
  levelScores,
  currentLevel,
  language,
  onSelectLevel,
  onClose,
}) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<number>(0); // 0: 1-20, 1: 21-40, 2: 41-60, 3: 61-80, 4: 81-100

  const tabs = [
    { label: '1 - 20', start: 1, end: 20 },
    { label: '21 - 40', start: 21, end: 40 },
    { label: '41 - 60', start: 41, end: 60 },
    { label: '61 - 80', start: 61, end: 80 },
    { label: '81 - 100', start: 81, end: 100 },
  ];

  const currentTab = tabs[activeTab];
  const levelItems = [];
  for (let lvl = currentTab.start; lvl <= currentTab.end; lvl++) {
    const isUnlocked = unlockedLevels.includes(lvl);
    const score = levelScores[lvl];
    const timeLimit = 90 + (lvl - 1) * 5;
    const baseReward = 100 + (lvl - 1) * 20;

    levelItems.push({
      lvl,
      isUnlocked,
      stars: score ? score.stars : 0,
      bestTime: score ? score.bestTime : null,
      timeLimit,
      baseReward,
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-between p-4 sm:p-6 bg-slate-950/90 backdrop-blur-xl text-white select-none overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
        <button
          onClick={() => {
            audio.playClick();
            onClose();
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all shadow-md active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-bold">{t.back}</span>
        </button>

        <h2 className="font-display font-black text-xl sm:text-2xl tracking-wider text-white">
          {t.levelSelectTitle}
        </h2>

        <div className="text-xs text-slate-400 font-semibold">
          {unlockedLevels.length} / 100 Unlocked
        </div>
      </div>

      {/* Tab Switcher (1-20, 21-40, ...) */}
      <div className="max-w-4xl mx-auto w-full my-3 flex items-center justify-center gap-1.5 overflow-x-auto py-1">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => {
              audio.playClick();
              setActiveTab(idx);
            }}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === idx
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 20 Levels Grid */}
      <div className="max-w-4xl mx-auto w-full flex-1 my-auto py-2">
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 sm:gap-3.5">
          {levelItems.map((item) => {
            const isCurrent = item.lvl === currentLevel;

            return (
              <button
                key={item.lvl}
                disabled={!item.isUnlocked}
                onClick={() => {
                  if (item.isUnlocked) {
                    audio.playClick();
                    onSelectLevel(item.lvl);
                  }
                }}
                className={`aspect-square rounded-2xl p-2 sm:p-3 border-2 flex flex-col items-center justify-between transition-all relative ${
                  item.isUnlocked
                    ? isCurrent
                      ? 'border-emerald-400 bg-emerald-500/20 shadow-lg shadow-emerald-500/30 scale-102'
                      : 'border-slate-700/80 bg-slate-900/80 hover:bg-slate-800/90 hover:border-sky-500/80 shadow-md active:scale-95'
                    : 'border-slate-800/60 bg-slate-950/60 text-slate-600 opacity-60 cursor-not-allowed'
                }`}
              >
                {/* Level Number */}
                <div className="w-full flex justify-between items-center">
                  <span className="font-display font-black text-base sm:text-xl text-white">
                    {item.lvl}
                  </span>
                  {!item.isUnlocked && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                </div>

                {/* Stars / Lock display */}
                <div className="my-auto flex items-center gap-0.5">
                  {item.isUnlocked ? (
                    item.stars > 0 ? (
                      [1, 2, 3].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= item.stars
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      ))
                    ) : (
                      <span className="text-[10px] text-sky-400 font-bold uppercase">Ready</span>
                    )
                  ) : (
                    <span className="text-[10px] text-slate-600 font-bold uppercase">{t.locked}</span>
                  )}
                </div>

                {/* Time & reward hint */}
                <div className="w-full flex items-center justify-between text-[9px] text-slate-400 font-semibold border-t border-slate-800/80 pt-1">
                  <span className="flex items-center gap-0.5">
                    <Timer className="w-2.5 h-2.5 text-slate-400" /> {item.timeLimit}s
                  </span>
                  <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                    <Coins className="w-2.5 h-2.5" /> +{item.baseReward}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer hint */}
      <div className="text-center text-xs text-slate-500 py-2">
        Complete each level to unlock the next challenge and earn coins!
      </div>
    </div>
  );
};
