import { CarConfig } from '../types';

export const CARS_DATA: CarConfig[] = [
  {
    id: 'car_hatchback',
    name: 'Spark Urban Mini',
    price: 0, // FREE
    modelType: 'hatchback',
    primaryColor: '#0284c7', // Bright Sky Blue
    secondaryColor: '#1e293b',
    rimColor: '#cbd5e1',
    accentColor: '#38bdf8',
    dimensions: { width: 1.8, length: 3.8, height: 1.4 },
    stats: {
      speed: 4,
      acceleration: 5,
      handling: 7,
      braking: 6,
    },
  },
  {
    id: 'car_sedan',
    name: 'Avanti Comfort Sedan',
    price: 500,
    modelType: 'sedan',
    primaryColor: '#10b981', // Emerald Green
    secondaryColor: '#0f172a',
    rimColor: '#e2e8f0',
    accentColor: '#34d399',
    dimensions: { width: 1.9, length: 4.4, height: 1.4 },
    stats: {
      speed: 5,
      acceleration: 5,
      handling: 6,
      braking: 6,
    },
  },
  {
    id: 'car_coupe',
    name: 'Falcon GT Coupe',
    price: 1500,
    modelType: 'coupe',
    primaryColor: '#e11d48', // Crimson Red
    secondaryColor: '#18181b',
    rimColor: '#71717a',
    accentColor: '#fb7185',
    dimensions: { width: 1.9, length: 4.3, height: 1.3 },
    stats: {
      speed: 6,
      acceleration: 7,
      handling: 7,
      braking: 7,
    },
  },
  {
    id: 'car_suv',
    name: 'Titan 4x4 Overland',
    price: 3000,
    modelType: 'suv',
    primaryColor: '#d97706', // Amber Bronze
    secondaryColor: '#27272a',
    rimColor: '#52525b',
    accentColor: '#f59e0b',
    dimensions: { width: 2.1, length: 4.6, height: 1.7 },
    stats: {
      speed: 5,
      acceleration: 6,
      handling: 5,
      braking: 8,
    },
  },
  {
    id: 'car_muscle',
    name: 'Interceptor V8 Muscle',
    price: 5000,
    modelType: 'muscle',
    primaryColor: '#7c3aed', // Purple Violet
    secondaryColor: '#1e1b4b',
    rimColor: '#f1f5f9',
    accentColor: '#a78bfa',
    dimensions: { width: 2.0, length: 4.7, height: 1.35 },
    stats: {
      speed: 7,
      acceleration: 8,
      handling: 6,
      braking: 6,
    },
  },
  {
    id: 'car_electric',
    name: 'Voltix Cyber EV',
    price: 8000,
    modelType: 'electric',
    primaryColor: '#06b6d4', // Neon Cyan
    secondaryColor: '#09090b',
    rimColor: '#22d3ee',
    accentColor: '#67e8f9',
    dimensions: { width: 1.95, length: 4.4, height: 1.35 },
    stats: {
      speed: 7,
      acceleration: 9,
      handling: 8,
      braking: 8,
    },
  },
  {
    id: 'car_supercar',
    name: 'Apex Superveloce',
    price: 12000,
    modelType: 'supercar',
    primaryColor: '#ea580c', // Fiery Orange
    secondaryColor: '#1c1917',
    rimColor: '#f97316',
    accentColor: '#fdba74',
    dimensions: { width: 2.05, length: 4.5, height: 1.2 },
    stats: {
      speed: 8,
      acceleration: 9,
      handling: 8,
      braking: 9,
    },
  },
  {
    id: 'car_drift',
    name: 'Silvia Drift King R',
    price: 18000,
    modelType: 'drift',
    primaryColor: '#ec4899', // Hot Pink
    secondaryColor: '#111827',
    rimColor: '#f43f5e',
    accentColor: '#f472b6',
    dimensions: { width: 1.9, length: 4.3, height: 1.3 },
    stats: {
      speed: 8,
      acceleration: 8,
      handling: 10,
      braking: 8,
    },
  },
  {
    id: 'car_formula',
    name: 'Monza Open-Wheel GP',
    price: 25000,
    modelType: 'formula',
    primaryColor: '#dc2626', // Rosso Racing
    secondaryColor: '#171717',
    rimColor: '#e5e5e5',
    accentColor: '#facc15',
    dimensions: { width: 1.9, length: 4.4, height: 1.0 },
    stats: {
      speed: 9,
      acceleration: 10,
      handling: 10,
      braking: 10,
    },
  },
  {
    id: 'car_hypercar',
    name: 'Phantom Gold Royale',
    price: 35000,
    modelType: 'hypercar',
    primaryColor: '#eab308', // Radiant Gold
    secondaryColor: '#09090b',
    rimColor: '#fde047',
    accentColor: '#fef08a',
    dimensions: { width: 2.1, length: 4.7, height: 1.15 },
    stats: {
      speed: 10,
      acceleration: 10,
      handling: 9,
      braking: 10,
    },
  },
];
