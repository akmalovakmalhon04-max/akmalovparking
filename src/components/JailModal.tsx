import React, { useEffect, useState } from 'react';
import { ShieldAlert, Timer, Unlock, AlertTriangle, Coins } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { audio } from '../utils/audio';

interface JailModalProps {
  jailTimeRemaining: number;
  playerCoins: number;
  language: Language;
  onBailOut: () => void;
  onSentenceComplete: () => void;
}

export const JailModal: React.FC<JailModalProps> = ({
  jailTimeRemaining,
  playerCoins,
  language,
  onBailOut,
  onSentenceComplete,
}) => {
  const t = translations[language];
  const [timeLeft, setTimeLeft] = useState(jailTimeRemaining);

  // Countdown timer in jail
  useEffect(() => {
    setTimeLeft(jailTimeRemaining);
  }, [jailTimeRemaining]);

  useEffect(() => {
    audio.playPoliceSiren();

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onSentenceComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onSentenceComplete]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const canBail = playerCoins >= 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl text-white select-none overflow-hidden">
      {/* Flashing Police Emergency Lights */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-600 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-red-600 blur-[120px] animate-pulse delay-500" />
      </div>

      {/* Jail Cell Prison Steel Bars Overlay */}
      <div className="absolute inset-0 pointer-events-none flex justify-around opacity-30">
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className="w-3.5 h-full bg-gradient-to-r from-slate-800 via-slate-600 to-slate-900 border-x border-slate-700/80 shadow-2xl"
          />
        ))}
      </div>

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/90 border-2 border-rose-500/70 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(244,63,94,0.3)] flex flex-col items-center text-center gap-5 animate-in zoom-in-95 duration-200">
        {/* Siren Badge */}
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border-2 border-rose-500/50 flex items-center justify-center shadow-lg shadow-rose-500/30">
          <ShieldAlert className="w-9 h-9 text-rose-400 animate-bounce" />
        </div>

        <div>
          <span className="text-xs uppercase font-black tracking-widest text-rose-400">
            POLICE DEPARTMENT
          </span>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-wider mt-1">
            {t.jailTitle}
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            {t.jailDesc}
          </p>
        </div>

        {/* Jail Sentence Timer */}
        <div className="w-full py-4 px-6 rounded-2xl bg-slate-950/80 border border-rose-500/40 flex flex-col items-center gap-1 shadow-inner">
          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
            <Timer className="w-3.5 h-3.5 text-rose-400" /> {t.jailTimeRemaining}
          </span>
          <span className="font-display font-black text-4xl sm:text-5xl text-rose-400 tracking-wider">
            {formattedTime}
          </span>
          <span className="text-[10px] text-slate-400 mt-1">
            1.5 {language === 'uz' ? 'daqiqa qamoq jazosi' : language === 'ru' ? 'минуты в заключении' : 'minutes sentence'}
          </span>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-2.5">
          {canBail ? (
            <button
              onClick={() => {
                audio.playClick();
                onBailOut();
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-display font-black text-base tracking-wider shadow-lg shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Coins className="w-5 h-5 text-amber-300" />
              <span>{t.bailOut}</span>
            </button>
          ) : (
            <div className="text-xs text-slate-400 italic">
              {language === 'uz'
                ? 'Jazo muddati tugagach avtomatik ozod qilinasiz...'
                : language === 'ru'
                ? 'Вы будете освобождены автоматически по истечении срока...'
                : 'You will be automatically released when the sentence expires...'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
