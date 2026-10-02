import React from 'react';
import {
  Pause,
  RotateCcw,
  Coins,
  ShieldAlert,
  Timer as TimerIcon,
  Eye,
  Video,
  Sliders,
  ChevronUp,
  ChevronDown,
  Gauge,
} from 'lucide-react';
import { CameraViewMode, Language, TransmissionMode } from '../types';
import { translations } from '../i18n/translations';

interface HUDProps {
  level: number;
  totalLevels: number;
  remainingTime: number;
  coins: number;
  speedKmh: number;
  alignmentPercent: number;
  isReversing: boolean;
  language: Language;
  speedLimit?: number;
  unpaidFine?: { amount: number; remainingSeconds: number } | null;
  fineToast?: string | null;
  cameraFlash?: boolean;
  cameraViewMode: CameraViewMode;
  sideMirrorsEnabled: boolean;
  turnSignal: 'none' | 'left' | 'right' | 'hazard';
  transmissionMode: TransmissionMode;
  manualGear: number;
  onPause: () => void;
  onResetCamera: () => void;
  onRestart: () => void;
  onPayFine?: () => void;
  onToggleCameraView: () => void;
  onToggleSideMirrors: () => void;
  onSetTurnSignal: (sig: 'none' | 'left' | 'right' | 'hazard') => void;
  onToggleTransmissionMode: () => void;
  onShiftGear: (gear: number) => void;
}

export const HUD: React.FC<HUDProps> = ({
  level,
  totalLevels,
  remainingTime,
  coins,
  speedKmh,
  alignmentPercent,
  isReversing,
  language,
  speedLimit = 60,
  unpaidFine,
  fineToast,
  cameraFlash,
  cameraViewMode,
  sideMirrorsEnabled,
  transmissionMode,
  manualGear,
  onPause,
  onResetCamera,
  onRestart,
  onPayFine,
  onToggleCameraView,
  onToggleSideMirrors,
  onToggleTransmissionMode,
  onShiftGear,
}) => {
  const t = translations[language];

  // Format time MM:SS
  const mins = Math.floor(Math.max(0, remainingTime) / 60);
  const secs = Math.floor(Math.max(0, remainingTime) % 60);
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const isLowTime = remainingTime <= 15;

  // Active gear label
  const displayedGear =
    transmissionMode === 'manual'
      ? manualGear === -1
        ? 'R'
        : manualGear === 0
        ? 'N'
        : String(manualGear)
      : speedKmh < 0.2
      ? t.gearP
      : isReversing
      ? t.gearR
      : t.gearD;

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-2 sm:p-4 select-none z-10">
      {/* 1. TOP BAR */}
      <div className="flex items-center justify-between gap-2 w-full flex-wrap sm:flex-nowrap">
        {/* Top Left: Level Badge & Unstuck / Quick Respawn */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Level Badge */}
          <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 shadow-lg px-3 py-1.5 rounded-2xl flex items-center gap-1.5">
            <span className="text-[11px] uppercase font-semibold tracking-wider text-slate-400">
              {t.level}
            </span>
            <span className="font-display text-base sm:text-lg font-bold text-white">
              {level} <span className="text-xs font-normal text-slate-400">/ {totalLevels}</span>
            </span>
          </div>

          {/* Quick Respawn / Unstuck Car Button */}
          <button
            onClick={onRestart}
            title={language === 'uz' ? 'Qayta boshlash / Spawn va Vaqt (R)' : language === 'ru' ? 'Рестарт / Спавн и Время (R)' : 'Restart Spawn & Time (R)'}
            className="h-9 sm:h-10 px-2.5 sm:px-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/70 text-amber-300 hover:text-amber-200 backdrop-blur-md flex items-center gap-1.5 font-bold text-xs shadow-md active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4 text-amber-400 animate-spin-once" />
            <span className="font-display uppercase tracking-wider">{t.restart}</span>
            <span className="hidden sm:inline text-[10px] bg-amber-500/30 px-1 py-0.2 rounded font-mono">R</span>
          </button>
        </div>

        {/* Top Center: Timer */}
        <div className="flex flex-col items-center mx-auto sm:mx-0">
          <div
            className={`px-3.5 py-1 rounded-2xl border backdrop-blur-md shadow-lg flex items-center gap-2 transition-all ${
              isLowTime
                ? 'bg-rose-950/85 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-slate-900/85 border-slate-700/60 text-white'
            }`}
          >
            <TimerIcon className={`w-4 h-4 ${isLowTime ? 'text-rose-400 animate-spin' : 'text-amber-400'}`} />
            <span className="font-display font-black text-xl sm:text-2xl tracking-wider">
              {formattedTime}
            </span>
          </div>
        </div>

        {/* Top Right: Features (Coins, 1-litso/3-litso, Bokovoy, AT/MT, Pause) */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          {/* Coins Badge */}
          <div className="bg-slate-900/85 backdrop-blur-md border border-amber-500/40 shadow-lg px-2.5 sm:px-3 py-1.5 rounded-2xl flex items-center gap-1.5 text-amber-400">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="font-display font-bold text-xs sm:text-sm text-amber-300">
              {coins.toLocaleString()}
            </span>
          </div>

          {/* Camera View Toggle: 1-litso vs 3-litso (C key) */}
          <button
            onClick={onToggleCameraView}
            title={language === 'uz' ? 'Kamera ko‘rinishini o‘zgartirish: 1-litso / 3-litso (C tugmasi)' : 'Toggle Camera View: 1st person / 3rd person (C)'}
            className={`h-9 sm:h-10 px-2.5 sm:px-3 rounded-2xl backdrop-blur-md border flex items-center gap-1.5 font-bold text-xs shadow-md active:scale-95 transition-all ${
              cameraViewMode === 'first_person'
                ? 'bg-sky-600 border-sky-400 text-white shadow-sky-500/40'
                : 'bg-slate-900/85 hover:bg-slate-800 border-slate-700/60 text-slate-300 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4 text-sky-400" />
            <span className="font-display uppercase tracking-wider text-[11px]">
              {cameraViewMode === 'first_person'
                ? language === 'uz'
                  ? '1-Litso'
                  : '1-Лицо'
                : language === 'uz'
                ? '3-Litso'
                : '3-Лицо'}
            </span>
            <span className="text-[10px] bg-black/40 px-1 py-0.2 rounded font-mono">C</span>
          </button>

          {/* Side Mirrors Toggle: Bokovoy (M key) */}
          <button
            onClick={onToggleSideMirrors}
            title={language === 'uz' ? 'Bokovoy oynalarni yoqish/o‘chirish (M)' : 'Toggle Side Mirrors (M)'}
            className={`h-9 sm:h-10 px-2.5 sm:px-3 rounded-2xl backdrop-blur-md border flex items-center gap-1.5 font-bold text-xs shadow-md active:scale-95 transition-all ${
              sideMirrorsEnabled
                ? 'bg-teal-600 border-teal-400 text-white shadow-teal-500/40'
                : 'bg-slate-900/85 hover:bg-slate-800 border-slate-700/60 text-slate-300 hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4 text-teal-400" />
            <span className="hidden sm:inline font-display uppercase tracking-wider text-[11px]">
              {language === 'uz' ? 'Bokovoy' : language === 'ru' ? 'Зеркала' : 'Mirrors'}
            </span>
            <span className="text-[10px] bg-black/40 px-1 py-0.2 rounded font-mono">M</span>
          </button>

          {/* Transmission Mode Toggle: Avtomat (AT) vs Mexanika (MT) (T key) */}
          <button
            onClick={onToggleTransmissionMode}
            title={language === 'uz' ? 'Transmissiya: Avtomat (AT) / Mexanika (MT) (T tugmasi)' : 'Toggle Transmission: AT / MT (T)'}
            className={`h-9 sm:h-10 px-2.5 sm:px-3 rounded-2xl backdrop-blur-md border flex items-center gap-1.5 font-bold text-xs shadow-md active:scale-95 transition-all ${
              transmissionMode === 'manual'
                ? 'bg-indigo-600 border-indigo-400 text-white shadow-indigo-500/40'
                : 'bg-slate-900/85 hover:bg-slate-800 border-slate-700/60 text-slate-300 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span className="font-display font-bold text-xs uppercase">
              {transmissionMode === 'manual' ? 'MT' : 'AT'}
            </span>
            <span className="text-[10px] bg-black/40 px-1 py-0.2 rounded font-mono">T</span>
          </button>

          {/* Pause Button */}
          <button
            onClick={onPause}
            title={t.pause}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md border border-slate-700/60 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-md active:scale-95"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. CAMERA RADAR FLASH OVERLAY */}
      {cameraFlash && (
        <div className="absolute inset-0 bg-white pointer-events-none z-50 animate-out fade-out duration-300" />
      )}

      {/* 3. ALERTS & NOTIFICATIONS (Over-speeding, Unpaid Fine Countdown) */}
      <div className="w-full flex flex-col items-center gap-1.5 pointer-events-none mt-1 z-30">
        {/* Active Fine Toast Alert */}
        {fineToast && (
          <div className="pointer-events-auto bg-rose-600/95 border-2 border-rose-300 text-white px-4 py-2 rounded-2xl shadow-[0_0_30px_rgba(225,29,72,0.8)] flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wider animate-bounce">
            <ShieldAlert className="w-5 h-5 text-white" />
            <span>{fineToast}</span>
          </div>
        )}

        {/* Unpaid Fine 5-minute Countdown Banner (300 seconds -> Jail) */}
        {unpaidFine && (
          <div className="pointer-events-auto bg-amber-950/95 border-2 border-amber-500 text-amber-200 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-pulse">
            <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <span className="font-display font-black text-amber-300 uppercase tracking-wide">
                {t.unpaidFineWarning}
              </span>
              <div className="text-[12px] text-amber-400 font-mono font-bold mt-0.5">
                {Math.floor(unpaidFine.remainingSeconds / 60)}:
                {String(unpaidFine.remainingSeconds % 60).padStart(2, '0')}{' '}
                <span className="text-[10px] text-amber-300">
                  {language === 'uz' ? 'ichida to‘lanmasa qamoq jazosi!' : 'before police arrest!'}
                </span>
              </div>
            </div>
            {onPayFine && coins >= unpaidFine.amount && (
              <button
                onClick={onPayFine}
                className="ml-2 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold shadow-md active:scale-95 transition-all"
              >
                {t.payFineNow}
              </button>
            )}
          </div>
        )}

        {/* Target Instruction Pill */}
        {!fineToast && !unpaidFine && (
          <div className="bg-slate-950/75 backdrop-blur-sm border border-slate-800 px-3.5 py-1 rounded-full text-xs text-slate-300 max-w-sm text-center truncate">
            {t.instructionPark}
          </div>
        )}
      </div>

      {/* 4. MANUAL TRANSMISSION (MEXANIKA) GEAR SHIFTER OVERLAY */}
      {transmissionMode === 'manual' && (
        <div className="pointer-events-auto w-full flex justify-center mb-1 z-30">
          <div className="bg-slate-950/90 backdrop-blur-md border border-indigo-500/50 px-3 py-1.5 rounded-2xl shadow-xl flex items-center gap-2">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              {language === 'uz' ? 'Mexanika' : 'Manual'}:
            </span>

            {/* Gear Down Button */}
            <button
              onClick={() => onShiftGear(Math.max(-1, manualGear - 1))}
              title="Shift Down (Q / Ctrl)"
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold active:scale-90"
            >
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Direct Gear Selector Buttons: [R] [N] [1] [2] [3] [4] [5] */}
            {[-1, 0, 1, 2, 3, 4, 5].map((g) => (
              <button
                key={g}
                onClick={() => onShiftGear(g)}
                className={`w-7 h-7 rounded-lg font-display font-black text-xs transition-all active:scale-90 ${
                  manualGear === g
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50 scale-105'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700/50'
                }`}
              >
                {g === -1 ? 'R' : g === 0 ? 'N' : g}
              </button>
            ))}

            {/* Gear Up Button */}
            <button
              onClick={() => onShiftGear(Math.min(5, manualGear + 1))}
              title="Shift Up (E / Shift)"
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold active:scale-90"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 5. CENTER DASHBOARD: SPEED LIMIT SIGN (60), SPEEDOMETER, GEAR & ALIGNMENT */}
      <div className="w-full flex items-end justify-center pb-1 pointer-events-none z-20">
        <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800/80 px-3.5 sm:px-6 py-2 rounded-2xl shadow-2xl flex items-center gap-3 sm:gap-6">
          {/* Speed Limit Road Sign (European Circular Red-bordered Sign with 60) */}
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 flex items-center justify-center shadow-lg transition-transform ${
                speedKmh > speedLimit
                  ? 'border-red-600 bg-red-100 scale-110 shadow-red-500/60 animate-pulse'
                  : 'border-red-600 bg-white'
              }`}
              title={`${t.speedLimit}: ${speedLimit} ${t.kmh}`}
            >
              <span className="font-display font-black text-base sm:text-xl text-black leading-none">
                {speedLimit}
              </span>
            </div>
            <span className="text-[8px] uppercase font-bold tracking-wider text-slate-400 mt-0.5">
              LIMIT
            </span>
          </div>

          <div className="w-px h-8 bg-slate-700/50" />

          {/* Speedometer (KM/H) */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`font-display font-black text-2xl sm:text-3xl tracking-tight leading-none transition-colors ${
                  speedKmh > speedLimit ? 'text-rose-500 animate-pulse' : 'text-white'
                }`}
              >
                {Math.round(speedKmh)}
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
                {t.kmh}
              </span>
            </div>

            <div className="w-px h-8 bg-slate-700/50" />

            {/* Active Gear */}
            <div className="flex flex-col items-center">
              <span
                className={`font-display font-black text-xl sm:text-2xl leading-none ${
                  displayedGear === 'R' || displayedGear === t.gearR
                    ? 'text-rose-400'
                    : displayedGear === 'P' || displayedGear === t.gearP
                    ? 'text-amber-400'
                    : displayedGear === 'N'
                    ? 'text-sky-400'
                    : 'text-emerald-400'
                }`}
              >
                {displayedGear}
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
                {transmissionMode === 'manual' ? 'MT' : 'GEAR'}
              </span>
            </div>
          </div>

          <div className="w-px h-8 bg-slate-700/50" />

          {/* Alignment Meter (Parking Accuracy) */}
          <div className="flex flex-col w-20 sm:w-28">
            <div className="flex justify-between items-center text-[9px] uppercase font-bold tracking-wider text-slate-300 mb-1">
              <span>{t.parkingAlignment}</span>
              <span className={alignmentPercent >= 90 ? 'text-emerald-400 font-black' : 'text-slate-400'}>
                {alignmentPercent}%
              </span>
            </div>
            <div className="w-full h-2 sm:h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
              <div
                className={`h-full rounded-full transition-all duration-150 ${
                  alignmentPercent >= 90
                    ? 'bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                    : alignmentPercent > 50
                    ? 'bg-amber-400'
                    : 'bg-slate-600'
                }`}
                style={{ width: `${alignmentPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
