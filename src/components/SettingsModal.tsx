import React, { useState } from 'react';
import { ArrowLeft, Volume2, VolumeX, Music, Smartphone, Monitor, Trash2, Sun, Moon, Globe, AlertTriangle, Sliders, Eye } from 'lucide-react';
import { GraphicsQuality, Language, Theme, TransmissionMode } from '../types';
import { translations } from '../i18n/translations';
import { audio } from '../utils/audio';

interface SettingsModalProps {
  language: Language;
  theme: Theme;
  soundEnabled: boolean;
  soundVolume: number;
  musicEnabled: boolean;
  musicVolume: number;
  vibrationEnabled: boolean;
  graphicsQuality: GraphicsQuality;
  transmissionMode?: TransmissionMode;
  sideMirrorsEnabled?: boolean;
  onUpdateLanguage: (lang: Language) => void;
  onUpdateTheme: (theme: Theme) => void;
  onUpdateSound: (enabled: boolean, vol?: number) => void;
  onUpdateMusic: (enabled: boolean, vol?: number) => void;
  onUpdateVibration: (enabled: boolean) => void;
  onUpdateGraphics: (quality: GraphicsQuality) => void;
  onUpdateTransmissionMode?: (mode: TransmissionMode) => void;
  onUpdateSideMirrors?: (enabled: boolean) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  language,
  theme,
  soundEnabled,
  soundVolume,
  musicEnabled,
  musicVolume,
  vibrationEnabled,
  graphicsQuality,
  transmissionMode = 'automatic',
  sideMirrorsEnabled = false,
  onUpdateLanguage,
  onUpdateTheme,
  onUpdateSound,
  onUpdateMusic,
  onUpdateVibration,
  onUpdateGraphics,
  onUpdateTransmissionMode,
  onUpdateSideMirrors,
  onResetProgress,
  onClose,
}) => {
  const t = translations[language];
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const confirmReset = () => {
    audio.playClick();
    onResetProgress();
    setShowResetConfirm(false);
    setResetMessage(t.resetDoneMsg);
    setTimeout(() => setResetMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl text-white select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <button
            onClick={() => {
              audio.playClick();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-all text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.back}</span>
          </button>

          <h2 className="font-display font-black text-xl tracking-wider text-white">
            {t.settingsTitle}
          </h2>

          <div className="w-12" />
        </div>

        {/* 1. Language */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-sky-400" /> {t.language}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'en' as Language, label: 'English', flag: '🇬🇧' },
              { id: 'ru' as Language, label: 'Русский', flag: '🇷🇺' },
              { id: 'uz' as Language, label: 'O‘zbekcha', flag: '🇺🇿' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  audio.playClick();
                  onUpdateLanguage(item.id);
                }}
                className={`py-2 px-1.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                  language === item.id
                    ? 'border-sky-500 bg-sky-500/20 text-white shadow-md shadow-sky-500/20'
                    : 'border-slate-800 bg-slate-850 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>{item.flag}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Theme (Dark / Light) */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-400" /> Theme
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                audio.playClick();
                onUpdateTheme('dark');
              }}
              className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                theme === 'dark'
                  ? 'border-sky-500 bg-sky-500/20 text-white shadow-md'
                  : 'border-slate-800 bg-slate-850 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Moon className="w-4 h-4 text-sky-400" />
              <span>{t.darkMode}</span>
            </button>

            <button
              onClick={() => {
                audio.playClick();
                onUpdateTheme('light');
              }}
              className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                theme === 'light'
                  ? 'border-sky-500 bg-sky-500/20 text-white shadow-md'
                  : 'border-slate-800 bg-slate-850 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-400" />
              <span>{t.lightMode}</span>
            </button>
          </div>
        </div>

        {/* 3. Audio & Haptics */}
        <div className="bg-slate-850/80 border border-slate-800 p-4 rounded-2xl flex flex-col gap-3">
          {/* Sound FX */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              {t.soundEffects}
            </span>
            <button
              onClick={() => {
                audio.playClick();
                onUpdateSound(!soundEnabled);
              }}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Music */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Music className="w-4 h-4 text-sky-400" />
              {t.music}
            </span>
            <button
              onClick={() => {
                audio.playClick();
                onUpdateMusic(!musicEnabled);
              }}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                musicEnabled ? 'bg-sky-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                  musicEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Vibration */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-purple-400" />
              {t.vibration}
            </span>
            <button
              onClick={() => {
                audio.playClick();
                onUpdateVibration(!vibrationEnabled);
              }}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                vibrationEnabled ? 'bg-purple-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                  vibrationEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 4. Graphics Quality */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5 text-emerald-400" /> {t.graphicsQuality}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'low' as GraphicsQuality, label: 'Low', desc: 'Fast' },
              { id: 'med' as GraphicsQuality, label: 'Medium', desc: 'Balanced' },
              { id: 'high' as GraphicsQuality, label: 'High', desc: 'Ultra 3D' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  audio.playClick();
                  onUpdateGraphics(item.id);
                }}
                className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center transition-all ${
                  graphicsQuality === item.id
                    ? 'border-emerald-500 bg-emerald-500/20 text-white shadow-md'
                    : 'border-slate-800 bg-slate-850 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="text-xs font-bold">{item.label}</span>
                <span className="text-[10px] text-slate-500">{item.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 5. Transmission Mode (Avtomat AT vs Mexanika MT) */}
        {onUpdateTransmissionMode && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" /> {t.transmission}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  audio.playClick();
                  onUpdateTransmissionMode('automatic');
                }}
                className={`py-2 px-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                  transmissionMode === 'automatic'
                    ? 'border-indigo-500 bg-indigo-500/20 text-white shadow-md'
                    : 'border-slate-800 bg-slate-850 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="text-xs font-bold">{t.automatic}</span>
                <span className="text-[10px] text-slate-500">D / R / P</span>
              </button>
              <button
                onClick={() => {
                  audio.playClick();
                  onUpdateTransmissionMode('manual');
                }}
                className={`py-2 px-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                  transmissionMode === 'manual'
                    ? 'border-indigo-500 bg-indigo-500/20 text-white shadow-md'
                    : 'border-slate-800 bg-slate-850 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="text-xs font-bold">{t.manual}</span>
                <span className="text-[10px] text-slate-500">R / N / 1 - 5</span>
              </button>
            </div>
          </div>
        )}

        {/* 6. Side Mirrors Toggle (Bokovoy oynalar) */}
        {onUpdateSideMirrors && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-850 border border-slate-800">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Eye className="w-4 h-4 text-teal-400" />
              {t.sideMirrors}
            </span>
            <button
              onClick={() => {
                audio.playClick();
                onUpdateSideMirrors(!sideMirrorsEnabled);
              }}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                sideMirrorsEnabled ? 'bg-teal-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                  sideMirrorsEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        )}

        {/* 5. Reset Progress */}
        <div className="pt-2 border-t border-slate-800">
          {resetMessage && (
            <div className="mb-3 p-2 text-center text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/50 rounded-xl">
              {resetMessage}
            </div>
          )}

          {!showResetConfirm ? (
            <button
              onClick={() => {
                audio.playClick();
                setShowResetConfirm(true);
              }}
              className="w-full py-2.5 rounded-xl border border-rose-500/40 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t.resetProgress}</span>
            </button>
          ) : (
            <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/60 flex flex-col gap-2.5 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{t.resetConfirmTitle}</span>
              </div>
              <p className="text-[11px] text-slate-300">{t.resetConfirmMsg}</p>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold"
                >
                  {t.no}
                </button>
                <button
                  onClick={confirmReset}
                  className="py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30"
                >
                  {t.yes}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
