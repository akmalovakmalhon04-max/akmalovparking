import React from 'react';
import { Eye, ShieldAlert, Sparkles, X } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface SideMirrorsOverlayProps {
  enabled: boolean;
  steerAngle: number;
  speedKmh: number;
  isReversing: boolean;
  alignmentPercent: number;
  language: Language;
  onToggle: () => void;
}

export const SideMirrorsOverlay: React.FC<SideMirrorsOverlayProps> = ({
  enabled,
  steerAngle,
  speedKmh,
  isReversing,
  alignmentPercent,
  language,
  onToggle,
}) => {
  if (!enabled) return null;

  const t = translations[language];

  // Dynamic parallax offset based on vehicle steering
  const steerNorm = Math.max(-1, Math.min(1, steerAngle / 0.5));
  const leftOffsetX = -steerNorm * 22;
  const rightOffsetX = -steerNorm * 22;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 select-none overflow-hidden flex flex-col justify-between p-2 sm:p-4">
      {/* Top Center: Cabin Interior Rear-View Mirror */}
      <div className="w-full flex justify-center pointer-events-auto">
        <div className="relative w-64 sm:w-80 h-16 sm:h-20 bg-slate-950/90 rounded-2xl border-2 border-slate-700 shadow-[0_10px_30px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col items-center justify-between p-1.5 backdrop-blur-md">
          {/* Mirror Bezel & Label */}
          <div className="w-full flex items-center justify-between px-2 pt-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-sky-400" />
              {language === 'uz' ? 'Salon Ko‘zgusi' : language === 'ru' ? 'Зеркало заднего вида' : 'Rearview Mirror'}
            </span>
            <button
              onClick={onToggle}
              title="Close mirrors"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Simulated Convex Rear Horizon & Guide Lines */}
          <div className="relative w-full h-10 sm:h-12 bg-gradient-to-b from-sky-950/60 via-slate-900 to-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
            {/* Horizon Line */}
            <div className="absolute inset-x-0 top-1/2 h-px bg-slate-700/60" />

            {/* Rear Trajectory Lines */}
            <div
              className="absolute inset-0 flex items-center justify-center transition-transform duration-75"
              style={{ transform: `translateX(${leftOffsetX * 0.5}px)` }}
            >
              {/* Dynamic parking guide overlay */}
              <div className="w-36 h-full flex flex-col justify-between py-1">
                <div className="w-full h-1 bg-rose-500/80 rounded-full shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                <div className="w-4/5 mx-auto h-0.5 bg-amber-400/80 rounded-full" />
                <div className="w-3/5 mx-auto h-0.5 bg-emerald-400/80 rounded-full" />
              </div>
            </div>

            {/* Reversing Sensor Indicator */}
            {isReversing && (
              <div className="absolute bottom-1 px-2 py-0.5 rounded bg-rose-500/90 text-white font-mono text-[9px] font-black tracking-wider uppercase animate-pulse">
                R-SENSOR ACTIVE
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Middle Sides: Left and Right Automotive Side Mirrors (Bokovoy) */}
      <div className="w-full flex justify-between items-center px-1 sm:px-3 pointer-events-none">
        {/* LEFT SIDE MIRROR */}
        <div className="pointer-events-auto relative w-32 sm:w-44 h-24 sm:h-32 bg-slate-950/95 rounded-r-3xl rounded-l-xl border-2 border-slate-700 shadow-2xl p-2 flex flex-col justify-between backdrop-blur-md">
          {/* Header */}
          <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            <span>{language === 'uz' ? 'Chap Bokovoy' : language === 'ru' ? 'Левое Зеркало' : 'Left Mirror'}</span>
            <span className="text-sky-400 text-[10px]">L</span>
          </div>

          {/* Mirror Glass */}
          <div className="relative w-full flex-1 bg-gradient-to-tr from-slate-900 via-sky-950/40 to-slate-800 rounded-r-2xl rounded-l-lg border border-slate-700/60 overflow-hidden flex items-center justify-center">
            {/* Convex reflection lines */}
            <div
              className="absolute inset-0 flex flex-col justify-around px-2 transition-transform duration-75"
              style={{ transform: `translateX(${leftOffsetX}px)` }}
            >
              <div className="w-full h-px bg-slate-600/50" />
              <div className="w-3/4 h-px bg-slate-600/40" />
              <div className="w-1/2 h-0.5 bg-emerald-400/60 shadow-[0_0_4px_rgba(52,211,153,0.6)]" />
            </div>

            {/* Vehicle side edge silhouette */}
            <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-slate-600 to-transparent opacity-80" />

            {/* Blind spot warning LED icon */}
            <div className="absolute top-1 left-1.5 flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isReversing ? 'bg-amber-400 animate-ping' : 'bg-slate-700'}`} />
            </div>
          </div>

          {/* Distance guide */}
          <div className="flex justify-between items-center text-[8px] font-mono text-slate-400 mt-0.5">
            <span>WIDE VIEW</span>
            <span className={alignmentPercent > 80 ? 'text-emerald-400 font-bold' : ''}>{alignmentPercent}%</span>
          </div>
        </div>

        {/* RIGHT SIDE MIRROR */}
        <div className="pointer-events-auto relative w-32 sm:w-44 h-24 sm:h-32 bg-slate-950/95 rounded-l-3xl rounded-r-xl border-2 border-slate-700 shadow-2xl p-2 flex flex-col justify-between backdrop-blur-md">
          {/* Header */}
          <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="text-sky-400 text-[10px]">R</span>
            <span>{language === 'uz' ? 'O‘ng Bokovoy' : language === 'ru' ? 'Правое Зеркало' : 'Right Mirror'}</span>
          </div>

          {/* Mirror Glass */}
          <div className="relative w-full flex-1 bg-gradient-to-tl from-slate-900 via-sky-950/40 to-slate-800 rounded-l-2xl rounded-r-lg border border-slate-700/60 overflow-hidden flex items-center justify-center">
            {/* Convex reflection lines */}
            <div
              className="absolute inset-0 flex flex-col justify-around px-2 transition-transform duration-75 items-end"
              style={{ transform: `translateX(${rightOffsetX}px)` }}
            >
              <div className="w-full h-px bg-slate-600/50" />
              <div className="w-3/4 h-px bg-slate-600/40" />
              <div className="w-1/2 h-0.5 bg-emerald-400/60 shadow-[0_0_4px_rgba(52,211,153,0.6)]" />
            </div>

            {/* Vehicle side edge silhouette */}
            <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-slate-600 to-transparent opacity-80" />

            {/* Blind spot warning LED icon */}
            <div className="absolute top-1 right-1.5 flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isReversing ? 'bg-amber-400 animate-ping' : 'bg-slate-700'}`} />
            </div>
          </div>

          {/* Distance guide */}
          <div className="flex justify-between items-center text-[8px] font-mono text-slate-400 mt-0.5">
            <span className={alignmentPercent > 80 ? 'text-emerald-400 font-bold' : ''}>{alignmentPercent}%</span>
            <span>WIDE VIEW</span>
          </div>
        </div>
      </div>

      {/* Bottom spacing placeholder so it doesn't block pedals */}
      <div className="h-1" />
    </div>
  );
};
