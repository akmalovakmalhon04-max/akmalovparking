import React, { useState } from 'react';
import { ArrowLeft, Check, Lock, Coins, Zap, Shield, Gauge, Compass } from 'lucide-react';
import { CarConfig, Language } from '../types';
import { CARS_DATA } from '../game/carsData';
import { translations } from '../i18n/translations';
import { audio } from '../utils/audio';

interface GarageModalProps {
  coins: number;
  ownedCarIds: string[];
  selectedCarId: string;
  language: Language;
  onSelectCar: (carId: string) => void;
  onBuyCar: (car: CarConfig) => boolean;
  onClose: () => void;
}

export const GarageModal: React.FC<GarageModalProps> = ({
  coins,
  ownedCarIds,
  selectedCarId,
  language,
  onSelectCar,
  onBuyCar,
  onClose,
}) => {
  const t = translations[language];
  const [activeCarIndex, setActiveCarIndex] = useState(() => {
    const idx = CARS_DATA.findIndex((c) => c.id === selectedCarId);
    return idx !== -1 ? idx : 0;
  });

  const [notification, setNotification] = useState<string | null>(null);

  const car = CARS_DATA[activeCarIndex];
  const isOwned = ownedCarIds.includes(car.id);
  const isSelected = selectedCarId === car.id;
  const canAfford = coins >= car.price;

  const handleBuy = () => {
    if (!canAfford) {
      audio.playCrash();
      setNotification(t.notEnoughCoins);
      setTimeout(() => setNotification(null), 2500);
      return;
    }
    const success = onBuyCar(car);
    if (success) {
      audio.playCoin();
      setNotification(t.purchasedSuccess);
      setTimeout(() => setNotification(null), 2500);
    }
  };

  const handleSelect = () => {
    audio.playClick();
    onSelectCar(car.id);
  };

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
          {t.garageTitle}
        </h2>

        {/* Coins indicator */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-900/80 border border-amber-500/40 text-amber-300 font-display font-bold shadow-md">
          <Coins className="w-5 h-5 text-amber-400" />
          <span className="text-base">{coins.toLocaleString()}</span>
        </div>
      </div>

      {/* Main Garage Showcase Area */}
      <div className="max-w-4xl mx-auto w-full my-auto py-4 flex flex-col md:flex-row items-center gap-6">
        {/* Car Visual Card */}
        <div className="w-full md:w-1/2 flex flex-col items-center">
          <div className="relative w-full aspect-video max-w-md rounded-3xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-700/80 p-6 flex flex-col items-center justify-center shadow-2xl overflow-hidden">
            {/* Ambient car color glow */}
            <div
              className="absolute w-44 h-44 rounded-full blur-3xl opacity-35"
              style={{ backgroundColor: car.primaryColor }}
            />

            {/* Stylized Vehicle Silhouette & Badges */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className="w-24 h-12 rounded-xl mb-4 border-2 border-white/40 shadow-xl flex items-center justify-center font-display font-black text-xs uppercase tracking-widest text-white"
                style={{ backgroundColor: car.primaryColor }}
              >
                {car.modelType}
              </div>

              <h3 className="font-display font-black text-2xl sm:text-3xl text-white text-center">
                {car.name}
              </h3>

              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs uppercase font-semibold text-slate-400">Class</span>
                <span className="text-xs font-bold text-sky-400 uppercase">{car.modelType}</span>
              </div>
            </div>

            {/* Status indicator on car card */}
            <div className="absolute top-4 right-4">
              {isSelected ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> {t.selected}
                </span>
              ) : isOwned ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-500/40">
                  Owned
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> {t.locked}
                </span>
              )}
            </div>
          </div>

          {/* Quick Notification Message */}
          {notification && (
            <div className="mt-3 px-4 py-1.5 rounded-xl bg-sky-500/20 border border-sky-500 text-sky-300 text-xs font-bold animate-pulse">
              {notification}
            </div>
          )}

          {/* Action Button: BUY or SELECT */}
          <div className="w-full max-w-md mt-4">
            {isSelected ? (
              <button
                disabled
                className="w-full py-3.5 rounded-2xl bg-emerald-600/50 border border-emerald-500 text-emerald-200 font-display font-black text-lg flex items-center justify-center gap-2 cursor-default"
              >
                <Check className="w-5 h-5" />
                <span>{t.selected}</span>
              </button>
            ) : isOwned ? (
              <button
                onClick={handleSelect}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-display font-black text-lg tracking-wider shadow-lg shadow-sky-500/30 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span>{t.select}</span>
              </button>
            ) : (
              <button
                onClick={handleBuy}
                className={`w-full py-3.5 rounded-2xl font-display font-black text-lg tracking-wider shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 ${
                  canAfford
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-amber-500/30'
                    : 'bg-slate-800 border border-slate-700 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Coins className="w-5 h-5 text-amber-300" />
                <span>
                  {t.buy} ({car.price.toLocaleString()} {t.coins})
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Panel */}
        <div className="w-full md:w-1/2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
          <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400">
            Performance Specifications
          </h4>

          {/* Speed */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-sky-400" /> {t.speed}
              </span>
              <span className="text-white font-display">{car.stats.speed} / 10</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
              <div
                className="h-full bg-sky-400 rounded-full transition-all duration-300"
                style={{ width: `${(car.stats.speed / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Acceleration */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" /> {t.acceleration}
              </span>
              <span className="text-white font-display">{car.stats.acceleration} / 10</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${(car.stats.acceleration / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Handling */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-400" /> {t.handling}
              </span>
              <span className="text-white font-display">{car.stats.handling} / 10</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${(car.stats.handling / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Braking */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-rose-400" /> {t.braking}
              </span>
              <span className="text-white font-display">{car.stats.braking} / 10</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
              <div
                className="h-full bg-rose-400 rounded-full transition-all duration-300"
                style={{ width: `${(car.stats.braking / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Horizontal Car Selector Carousel */}
      <div className="max-w-4xl mx-auto w-full pt-2">
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 px-1">
          {CARS_DATA.map((item, idx) => {
            const owned = ownedCarIds.includes(item.id);
            const selected = selectedCarId === item.id;
            const active = idx === activeCarIndex;

            return (
              <button
                key={item.id}
                onClick={() => {
                  audio.playClick();
                  setActiveCarIndex(idx);
                }}
                className={`flex-shrink-0 w-28 sm:w-32 p-2.5 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all ${
                  active
                    ? 'border-sky-500 bg-sky-500/15 shadow-md shadow-sky-500/20 scale-105'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div
                  className="w-5 h-5 rounded-full border border-white/50"
                  style={{ backgroundColor: item.primaryColor }}
                />
                <span className="text-xs font-bold truncate max-w-full text-white">
                  {item.name}
                </span>

                <div className="flex items-center text-[10px] font-semibold text-slate-400">
                  {selected ? (
                    <span className="text-emerald-400 font-bold">{t.selected}</span>
                  ) : owned ? (
                    <span className="text-sky-400">Owned</span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-300">
                      <Lock className="w-3 h-3" /> {item.price === 0 ? t.free : `${item.price}`}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
