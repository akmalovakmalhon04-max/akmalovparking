import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Disc,
  Video,
  RotateCcw,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { CameraViewMode, InputState, Language, TransmissionMode } from '../types';
import { translations } from '../i18n/translations';

interface MobileControlsProps {
  inputState: InputState;
  onInputChange: (updater: (prev: InputState) => InputState) => void;
  language: Language;
  transmissionMode?: TransmissionMode;
  manualGear?: number;
  onShiftGear?: (gear: number) => void;
  cameraViewMode?: CameraViewMode;
  onToggleCameraView?: () => void;
  onRestart?: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  inputState,
  onInputChange,
  language,
  transmissionMode = 'automatic',
  manualGear = 1,
  onShiftGear,
  cameraViewMode = 'third_person',
  onToggleCameraView,
  onRestart,
}) => {
  const t = translations[language];
  const [controlType, setControlType] = useState<'buttons' | 'wheel'>('buttons');

  // Steering wheel drag state
  const [wheelAngle, setWheelAngle] = useState(0);

  // Virtual Steering Wheel touch handler
  const handleWheelTouch = (e: React.TouchEvent | React.MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const angleRad = Math.atan2(clientY - cy, clientX - cx);
    let deg = (angleRad * 180) / Math.PI;

    // Clamp wheel rotation
    deg = Math.max(-100, Math.min(100, deg));
    setWheelAngle(deg);

    // Map -100..100 to -1..1 steerValue
    const norm = deg / 100;
    onInputChange((prev) => ({
      ...prev,
      steerValue: norm,
      steerLeft: norm < -0.15,
      steerRight: norm > 0.15,
    }));
  };

  const handleWheelRelease = () => {
    setWheelAngle(0);
    onInputChange((prev) => ({
      ...prev,
      steerValue: 0,
      steerLeft: false,
      steerRight: false,
    }));
  };

  const isManual = transmissionMode === 'manual';

  return (
    <div className="absolute inset-x-0 bottom-0 pointer-events-none p-2 sm:p-5 flex justify-between items-end z-20 select-none">
      {/* LEFT: Steering Controls & Quick Action Shortcuts */}
      <div className="pointer-events-auto flex flex-col items-center">
        {controlType === 'buttons' ? (
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Steer Left */}
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                onInputChange((prev) => ({ ...prev, steerLeft: true }));
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                onInputChange((prev) => ({ ...prev, steerLeft: false }));
              }}
              onPointerLeave={() => {
                onInputChange((prev) => ({ ...prev, steerLeft: false }));
              }}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center border-2 shadow-2xl transition-all active:scale-90 ${
                inputState.steerLeft
                  ? 'bg-sky-600 border-sky-400 text-white shadow-sky-500/50 scale-95'
                  : 'bg-slate-900/85 hover:bg-slate-800/90 border-slate-700 text-slate-300 backdrop-blur-md'
              }`}
            >
              <ArrowLeft className="w-7 h-7 sm:w-8 sm:h-8" />
            </button>

            {/* Steer Right */}
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                onInputChange((prev) => ({ ...prev, steerRight: true }));
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                onInputChange((prev) => ({ ...prev, steerRight: false }));
              }}
              onPointerLeave={() => {
                onInputChange((prev) => ({ ...prev, steerRight: false }));
              }}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center border-2 shadow-2xl transition-all active:scale-90 ${
                inputState.steerRight
                  ? 'bg-sky-600 border-sky-400 text-white shadow-sky-500/50 scale-95'
                  : 'bg-slate-900/85 hover:bg-slate-800/90 border-slate-700 text-slate-300 backdrop-blur-md'
              }`}
            >
              <ArrowRight className="w-7 h-7 sm:w-8 sm:h-8" />
            </button>
          </div>
        ) : (
          /* Virtual Steering Wheel */
          <div
            onTouchMove={handleWheelTouch}
            onTouchEnd={handleWheelRelease}
            onTouchCancel={handleWheelRelease}
            onMouseMove={(e) => {
              if (e.buttons === 1) handleWheelTouch(e);
            }}
            onMouseUp={handleWheelRelease}
            className="w-24 h-24 sm:w-30 sm:h-30 rounded-full border-4 border-slate-600/80 bg-slate-900/90 backdrop-blur-md flex items-center justify-center relative shadow-2xl cursor-grab active:cursor-grabbing touch-none"
            style={{
              transform: `rotate(${wheelAngle}deg)`,
              transition: wheelAngle === 0 ? 'transform 0.2s ease-out' : 'none',
            }}
          >
            <div className="w-full h-2.5 bg-slate-700 absolute" />
            <div className="h-full w-2.5 bg-slate-700 absolute" />
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-300">
              P
            </div>
          </div>
        )}

        {/* Small bottom buttons: Toggle wheel mode & quick unstuck */}
        <div className="flex items-center gap-2 mt-1.5">
          <button
            onClick={() => setControlType((prev) => (prev === 'buttons' ? 'wheel' : 'buttons'))}
            className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-900/70 border border-slate-700/60 text-slate-400 hover:text-white"
          >
            {controlType === 'buttons' ? 'Wheel' : 'Buttons'}
          </button>

          {onRestart && (
            <button
              onClick={onRestart}
              title="Respawn / Unstuck Car"
              className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/50 text-amber-300 flex items-center gap-1"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Reset</span>
            </button>
          )}

          {onToggleCameraView && (
            <button
              onClick={onToggleCameraView}
              title="Camera 1/3"
              className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-sky-500/20 border border-sky-500/50 text-sky-300 flex items-center gap-1"
            >
              <Video className="w-2.5 h-2.5" />
              <span>{cameraViewMode === 'first_person' ? '1L' : '3L'}</span>
            </button>
          )}
        </div>
      </div>

      {/* RIGHT: Pedals & (if Manual) Mobile Gear Shift Column */}
      <div className="pointer-events-auto flex items-end gap-2 sm:gap-3">
        {/* If Manual Transmission: On-screen Shifter column */}
        {isManual && onShiftGear && (
          <div className="flex flex-col items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-indigo-500/40 mr-1 shadow-lg">
            <button
              onClick={() => onShiftGear(Math.min(5, manualGear + 1))}
              className="w-10 h-10 rounded-lg bg-indigo-600 active:bg-indigo-500 text-white flex items-center justify-center shadow font-bold text-xs"
            >
              <ChevronUp className="w-5 h-5" />
            </button>

            <span className="font-display font-black text-sm text-indigo-300 my-0.5">
              {manualGear === -1 ? 'R' : manualGear === 0 ? 'N' : manualGear}
            </span>

            <button
              onClick={() => onShiftGear(Math.max(-1, manualGear - 1))}
              className="w-10 h-10 rounded-lg bg-indigo-600 active:bg-indigo-500 text-white flex items-center justify-center shadow font-bold text-xs"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Reverse Pedal (in automatic mode, or acts as reverse in manual R) */}
        {!isManual && (
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onInputChange((prev) => ({ ...prev, reverse: true }));
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              onInputChange((prev) => ({ ...prev, reverse: false }));
            }}
            onPointerLeave={() => {
              onInputChange((prev) => ({ ...prev, reverse: false }));
            }}
            className={`w-13 h-20 sm:w-16 sm:h-24 rounded-2xl flex flex-col items-center justify-center border-2 shadow-2xl transition-all active:scale-95 ${
              inputState.reverse
                ? 'bg-amber-600 border-amber-400 text-white shadow-amber-500/50 scale-95'
                : 'bg-slate-900/85 hover:bg-slate-850 border-slate-700/80 text-amber-300 backdrop-blur-md'
            }`}
          >
            <span className="font-display font-black text-xs sm:text-sm tracking-wider">
              {t.reversePedal}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">▼</span>
          </button>
        )}

        {/* Brake / Handbrake Pedal */}
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            onInputChange((prev) => ({ ...prev, handbrake: true }));
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            onInputChange((prev) => ({ ...prev, handbrake: false }));
          }}
          onPointerLeave={() => {
            onInputChange((prev) => ({ ...prev, handbrake: false }));
          }}
          className={`w-14 h-24 sm:w-18 sm:h-28 rounded-2xl flex flex-col items-center justify-center border-2 shadow-2xl transition-all active:scale-95 ${
            inputState.handbrake
              ? 'bg-rose-600 border-rose-400 text-white shadow-rose-500/50 scale-95'
              : 'bg-slate-900/85 hover:bg-slate-850 border-slate-700/80 text-rose-400 backdrop-blur-md'
          }`}
        >
          <span className="font-display font-black text-xs sm:text-base tracking-wider">
            {t.brakePedal}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">■</span>
        </button>

        {/* Gas / Accelerator Pedal */}
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            onInputChange((prev) => ({ ...prev, gas: true }));
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            onInputChange((prev) => ({ ...prev, gas: false }));
          }}
          onPointerLeave={() => {
            onInputChange((prev) => ({ ...prev, gas: false }));
          }}
          className={`w-15 h-28 sm:w-20 sm:h-34 rounded-2xl flex flex-col items-center justify-center border-2 shadow-2xl transition-all active:scale-95 ${
            inputState.gas
              ? 'bg-emerald-600 border-emerald-400 text-white shadow-emerald-500/50 scale-95'
              : 'bg-gradient-to-t from-slate-900/90 to-slate-800/90 hover:from-slate-850 hover:to-slate-750 border-slate-700/80 text-emerald-400 backdrop-blur-md'
          }`}
        >
          <span className="font-display font-black text-sm sm:text-xl tracking-wider">
            {t.gasPedal}
          </span>
          <span className="text-xs text-slate-400 mt-0.5">▲</span>
        </button>
      </div>
    </div>
  );
};
