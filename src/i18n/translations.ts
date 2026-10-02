import { Language } from '../types';

export interface Translations {
  // Common / Navigation
  play: string;
  settings: string;
  garage: string;
  language: string;
  darkMode: string;
  lightMode: string;
  back: string;
  close: string;
  coins: string;
  level: string;
  levels: string;
  time: string;
  start: string;
  pause: string;
  resume: string;
  restart: string;
  nextLevel: string;
  replay: string;
  mainMenu: string;
  select: string;
  selected: string;
  buy: string;
  locked: string;
  free: string;
  yes: string;
  no: string;
  cancel: string;
  confirm: string;

  // First time modal
  welcomeTitle: string;
  welcomeSubtitle: string;
  selectLanguageTitle: string;
  selectThemeTitle: string;
  continueBtn: string;

  // Settings
  settingsTitle: string;
  soundEffects: string;
  music: string;
  vibration: string;
  graphicsQuality: string;
  graphicsLow: string;
  graphicsMed: string;
  graphicsHigh: string;
  resetProgress: string;
  resetConfirmTitle: string;
  resetConfirmMsg: string;
  resetDoneMsg: string;

  // Garage
  garageTitle: string;
  speed: string;
  acceleration: string;
  handling: string;
  braking: string;
  notEnoughCoins: string;
  purchasedSuccess: string;

  // HUD & Controls
  gearD: string;
  gearR: string;
  gearP: string;
  kmh: string;
  parkingAlignment: string;
  gasPedal: string;
  brakePedal: string;
  reversePedal: string;
  steerLeft: string;
  steerRight: string;
  touchRotateHint: string;

  // Game Results
  perfectParking: string;
  levelCompleteTitle: string;
  timeTaken: string;
  baseReward: string;
  timeBonus: string;
  totalReward: string;
  starsEarned: string;

  // Game Over
  gameOverTitle: string;
  timeUp: string;
  timeUpDesc: string;
  crashTitle: string;
  crashDesc: string;
  wrongParkingTitle: string;
  wrongParkingDesc: string;
  retry: string;
  levelSelect: string;

  // Level selection
  levelSelectTitle: string;
  allLevels: string;
  page: string;

  // Instructions
  instructionPark: string;

  // Speed Limit, Fines & Police Jail
  speedLimit: string;
  speedLimitExceeded: string;
  finePaid: string;
  unpaidFineWarning: string;
  payFineNow: string;
  jailTitle: string;
  jailDesc: string;
  jailTimeRemaining: string;
  jailSentenceServed: string;
  bailOut: string;

  // Camera Views, Mirrors & Transmission
  firstPersonView: string;
  thirdPersonView: string;
  cameraToggle: string;
  sideMirrors: string;
  turnLeft: string;
  turnRight: string;
  hazardLights: string;
  transmission: string;
  automatic: string;
  manual: string;
  gearLabel: string;
  shiftUp: string;
  shiftDown: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    play: 'PLAY',
    settings: 'SETTINGS',
    garage: 'GARAGE',
    language: 'LANGUAGE',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    back: 'Back',
    close: 'Close',
    coins: 'Coins',
    level: 'Level',
    levels: 'Levels',
    time: 'Time',
    start: 'Start',
    pause: 'Pause',
    resume: 'Resume',
    restart: 'Restart',
    nextLevel: 'Next Level',
    replay: 'Replay',
    mainMenu: 'Main Menu',
    select: 'Select',
    selected: 'Selected',
    buy: 'Buy',
    locked: 'Locked',
    free: 'FREE',
    yes: 'Yes',
    no: 'No',
    cancel: 'Cancel',
    confirm: 'Confirm',

    welcomeTitle: 'WELCOME TO 3D PARKING MASTER',
    welcomeSubtitle: 'Please choose your language and visual theme to begin your driving adventure.',
    selectLanguageTitle: 'Select Language',
    selectThemeTitle: 'Select Appearance Theme',
    continueBtn: 'Continue',

    settingsTitle: 'SETTINGS',
    soundEffects: 'Sound Effects (SFX)',
    music: 'Background Music',
    vibration: 'Haptic Vibration',
    graphicsQuality: 'Graphics Quality',
    graphicsLow: 'Low (Smooth FPS)',
    graphicsMed: 'Medium (Balanced)',
    graphicsHigh: 'High (Ultra 3D)',
    resetProgress: 'Reset Progress',
    resetConfirmTitle: 'Reset All Progress?',
    resetConfirmMsg: 'Are you sure? All your unlocked levels, coins, and purchased cars will be permanently wiped.',
    resetDoneMsg: 'Progress has been reset.',

    garageTitle: 'VEHICLE GARAGE',
    speed: 'Top Speed',
    acceleration: 'Acceleration',
    handling: 'Handling',
    braking: 'Braking Force',
    notEnoughCoins: 'Not enough coins!',
    purchasedSuccess: 'Car unlocked successfully!',

    gearD: 'D',
    gearR: 'R',
    gearP: 'P',
    kmh: 'KM/H',
    parkingAlignment: 'Alignment',
    gasPedal: 'GAS',
    brakePedal: 'BRAKE',
    reversePedal: 'REV',
    steerLeft: '◄',
    steerRight: '►',
    touchRotateHint: 'Drag screen to rotate camera',

    perfectParking: 'PERFECT PARKING!',
    levelCompleteTitle: 'LEVEL COMPLETE!',
    timeTaken: 'Time Elapsed',
    baseReward: 'Base Reward',
    timeBonus: 'Time Bonus',
    totalReward: 'Total Coins',
    starsEarned: 'Rating',

    gameOverTitle: 'GAME OVER',
    timeUp: 'TIME UP!',
    timeUpDesc: 'You ran out of time! Plan your route faster.',
    crashTitle: 'YOU CRASHED!',
    crashDesc: 'Collision detected! Avoid parked cars and barriers.',
    wrongParkingTitle: 'WRONG PARKING!',
    wrongParkingDesc: 'Vehicle is not properly aligned inside the designated spot.',
    retry: 'Retry',
    levelSelect: 'Level Select',

    levelSelectTitle: 'SELECT LEVEL',
    allLevels: 'Levels 1 - 100',
    page: 'Page',
    instructionPark: 'Park neatly inside the glowing green spot and hold the brakes!',

    speedLimit: 'SPEED LIMIT',
    speedLimitExceeded: 'SPEED LIMIT EXCEEDED! (60 KM/H)',
    finePaid: 'Traffic fine paid: -10 Coins',
    unpaidFineWarning: 'UNPAID FINE: 10 Coins! Pay within 5:00 or face Jail!',
    payFineNow: 'Pay Fine (10 Coins)',
    jailTitle: 'POLICE ARREST - JAIL CELL',
    jailDesc: 'You failed to pay your traffic speeding fine within 5 minutes! You must serve 90 seconds (1.5 min) in custody.',
    jailTimeRemaining: 'Sentence remaining:',
    jailSentenceServed: 'Sentence served! You have been released from jail.',
    bailOut: 'Bail Out (10 Coins)',

    firstPersonView: '1st Person Cockpit View (Press C)',
    thirdPersonView: '3rd Person Chase View (Press C)',
    cameraToggle: 'Camera View (C)',
    sideMirrors: 'Side Mirrors',
    turnLeft: 'Left Indicator',
    turnRight: 'Right Indicator',
    hazardLights: 'Hazard Lights',
    transmission: 'Transmission',
    automatic: 'Automatic (AT)',
    manual: 'Manual (MT)',
    gearLabel: 'Gear',
    shiftUp: 'Gear Up',
    shiftDown: 'Gear Down',
  },

  ru: {
    play: 'ИГРАТЬ',
    settings: 'НАСТРОЙКИ',
    garage: 'ГАРАЖ',
    language: 'ЯЗЫК',
    darkMode: 'Тёмная тема',
    lightMode: 'Светлая тема',
    back: 'Назад',
    close: 'Закрыть',
    coins: 'Монеты',
    level: 'Уровень',
    levels: 'Уровни',
    time: 'Время',
    start: 'Старт',
    pause: 'Пауза',
    resume: 'Продолжить',
    restart: 'Заново',
    nextLevel: 'Следующий уровень',
    replay: 'Повторить',
    mainMenu: 'Главное меню',
    select: 'Выбрать',
    selected: 'Выбрано',
    buy: 'Купить',
    locked: 'Заблокировано',
    free: 'БЕСПЛАТНО',
    yes: 'Да',
    no: 'Нет',
    cancel: 'Отмена',
    confirm: 'Подтвердить',

    welcomeTitle: 'ДОБРО ПОЖАЛОВАТЬ В 3D PARKING MASTER',
    welcomeSubtitle: 'Выберите язык и тему оформления для начала игры.',
    selectLanguageTitle: 'Выберите язык',
    selectThemeTitle: 'Выберите тему',
    continueBtn: 'Продолжить',

    settingsTitle: 'НАСТРОЙКИ',
    soundEffects: 'Звуковые эффекты',
    music: 'Фоновая музыка',
    vibration: 'Вибрация',
    graphicsQuality: 'Качество графики',
    graphicsLow: 'Низкое (Быстрое)',
    graphicsMed: 'Среднее (Баланс)',
    graphicsHigh: 'Высокое (Ультра 3D)',
    resetProgress: 'Сбросить прогресс',
    resetConfirmTitle: 'Вы уверены?',
    resetConfirmMsg: 'Весь ваш прогресс, монеты и купленные машины будут удалены. Продолжить?',
    resetDoneMsg: 'Прогресс сброшен.',

    garageTitle: 'АВТОГАРАЖ',
    speed: 'Скорость',
    acceleration: 'Разгон',
    handling: 'Управление',
    braking: 'Торможение',
    notEnoughCoins: 'Недостаточно монет!',
    purchasedSuccess: 'Машина успешно куплена!',

    gearD: 'D',
    gearR: 'R',
    gearP: 'P',
    kmh: 'КМ/Ч',
    parkingAlignment: 'Выравнивание',
    gasPedal: 'ГАЗ',
    brakePedal: 'ТОРМОЗ',
    reversePedal: 'НАЗАД',
    steerLeft: '◄',
    steerRight: '►',
    touchRotateHint: 'Проведите по экрану для вращения камеры',

    perfectParking: 'ИДЕАЛЬНАЯ ПАРКОВКА!',
    levelCompleteTitle: 'УРОВЕНЬ ПРОЙДЕН!',
    timeTaken: 'Затраченное время',
    baseReward: 'Награда за уровень',
    timeBonus: 'Бонус за скорость',
    totalReward: 'Всего монет',
    starsEarned: 'Звезды',

    gameOverTitle: 'ИГРА ОКОНЧЕНА',
    timeUp: 'ВРЕМЯ ВЫШЛО!',
    timeUpDesc: 'Время истекло! Постарайтесь припарковаться быстрее.',
    crashTitle: 'ВЫ РАЗБИЛИСЬ!',
    crashDesc: 'Произошло столкновение! Избегайте препятствий и стен.',
    wrongParkingTitle: 'НЕПРАВИЛЬНАЯ ПАРКОВКА!',
    wrongParkingDesc: 'Машина стоит неровно или выходит за пределы разметки.',
    retry: 'Повторить',
    levelSelect: 'Выбор уровня',

    levelSelectTitle: 'ВЫБОР УРОВНЯ',
    allLevels: 'Уровни 1 - 100',
    page: 'Страница',
    instructionPark: 'Припаркуйтесь точно в светящуюся зеленую зону и удерживайте тормоз!',

    speedLimit: 'ОГРАНИЧЕНИЕ СКОРОСТИ',
    speedLimitExceeded: 'ПРЕВЫШЕНИЕ СКОРОСТИ! (60 КМ/Ч)',
    finePaid: 'Штраф оплачен: -10 Монет',
    unpaidFineWarning: 'НЕОПЛАЧЕННЫЙ ШТРАФ: 10 Монет! Оплатите в течение 5:00 или вас арестуют!',
    payFineNow: 'Оплатить штраф (10 Монет)',
    jailTitle: 'ПОЛИЦЕЙСКИЙ АРЕСТ - ТЮРЬМА',
    jailDesc: 'Вы не оплатили штраф за превышение скорости в течение 5 минут! Вы приговорены к 90 секундам (1.5 мин) ареста.',
    jailTimeRemaining: 'Осталось в заключении:',
    jailSentenceServed: 'Срок отбыт! Вы освобождены из-под стражи.',
    bailOut: 'Выйти под залог (10 Монет)',

    firstPersonView: 'Вид от 1-го лица / Из салона (Кнопка C)',
    thirdPersonView: 'Вид от 3-го лица / Сзади (Кнопка C)',
    cameraToggle: 'Камера (C)',
    sideMirrors: 'Боковые зеркала',
    turnLeft: 'Левый поворотник',
    turnRight: 'Правый поворотник',
    hazardLights: 'Аварийка',
    transmission: 'Коробка передач',
    automatic: 'Автомат (АКПП)',
    manual: 'Механика (МКПП)',
    gearLabel: 'Передача',
    shiftUp: 'Передача вверх',
    shiftDown: 'Передача вниз',
  },

  uz: {
    play: 'O‘YINNI BOSHLASH',
    settings: 'SOZLAMALAR',
    garage: 'GARAJ',
    language: 'TIL',
    darkMode: 'Tungi rejim',
    lightMode: 'Kunduzgi rejim',
    back: 'Orqaga',
    close: 'Yopish',
    coins: 'Tangalar',
    level: 'Bosqich',
    levels: 'Bosqichlar',
    time: 'Vaqt',
    start: 'Boshlash',
    pause: 'Pauza',
    resume: 'Davom etish',
    restart: 'Qayta boshlash',
    nextLevel: 'Keyingi bosqich',
    replay: 'Qayta o‘ynash',
    mainMenu: 'Asosiy menyu',
    select: 'Tanlash',
    selected: 'Tanlangan',
    buy: 'Sotib olish',
    locked: 'Qulflangan',
    free: 'BEPUL',
    yes: 'Ha',
    no: 'Yo‘q',
    cancel: 'Bekor qilish',
    confirm: 'Tasdiqlash',

    welcomeTitle: '3D PARKING MASTERGA XUSH KELIBSIZ!',
    welcomeSubtitle: 'O‘yinni boshlashdan oldin o‘zingizga ma’qul til va ko‘rinish rejimini tanlang.',
    selectLanguageTitle: 'Tilni tanlang',
    selectThemeTitle: 'Rejimni tanlang',
    continueBtn: 'Davom etish',

    settingsTitle: 'SOZLAMALAR',
    soundEffects: 'Ovoz effektlari',
    music: 'Fon musiqasi',
    vibration: 'Vibratsiya',
    graphicsQuality: 'Grafika sifati',
    graphicsLow: 'Past (Tezkor)',
    graphicsMed: 'O‘rta (Optimal)',
    graphicsHigh: 'Yuqori (Ultra 3D)',
    resetProgress: 'Progressni tozalash',
    resetConfirmTitle: 'Haqiqatan ham o‘chirmoqchimisiz?',
    resetConfirmMsg: 'Barcha ochilgan bosqichlar, tangalar va sotib olingan mashinalar o‘chib ketadi. Rozimisiz?',
    resetDoneMsg: 'Barcha maʼlumotlar tozalandi.',

    garageTitle: 'MASHINALAR GARAJI',
    speed: 'Maksimal tezlik',
    acceleration: 'Tezlanish',
    handling: 'Boshqaruvchanlik',
    braking: 'Tormoz kuchi',
    notEnoughCoins: 'Tangalar yetarli emas!',
    purchasedSuccess: 'Mashina muvaffaqiyatli sotib olindi!',

    gearD: 'D',
    gearR: 'R',
    gearP: 'P',
    kmh: 'KM/SOAT',
    parkingAlignment: 'Joylashuv',
    gasPedal: 'GAZ',
    brakePedal: 'TORMOZ',
    reversePedal: 'ORQAGA',
    steerLeft: '◄',
    steerRight: '►',
    touchRotateHint: 'Kamerani aylantirish uchun ekranni suring',

    perfectParking: 'A’LO DARAJADA PARK QILINDI!',
    levelCompleteTitle: 'BOSQICH TUGATILDI!',
    timeTaken: 'Ketgan vaqt',
    baseReward: 'Bosqich yutug‘i',
    timeBonus: 'Vaqt bonusi',
    totalReward: 'Jami tangalar',
    starsEarned: 'Yulduzlar',

    gameOverTitle: 'O‘YIN TUGADI',
    timeUp: 'VAQT TUGADI!',
    timeUpDesc: 'Berilgan vaqt tugadi! Keyingi safar tezroq harakat qiling.',
    crashTitle: 'MASHINANI URIB OLDINGIZ!',
    crashDesc: 'To‘qnashuv sodir bo‘ldi! Boshqa mashinalar va to‘siqlardan ehtiyot bo‘ling.',
    wrongParkingTitle: 'NOTO‘G‘RI JOYLASHUV!',
    wrongParkingDesc: 'Mashina chiziqdan chiqib ketgan yoki noto‘g‘ri burchakda turibdi.',
    retry: 'Qaytadan urinish',
    levelSelect: 'Bosqichni tanlash',

    levelSelectTitle: 'BOSQICHNI TANLASH',
    allLevels: '1 - 100 Bosqichlar',
    page: 'Sahifa',
    instructionPark: 'Mashinani yashil maydonchaga to‘g‘ri joylashtirib, tormozni ushlab turing!',

    speedLimit: 'TEZLIK CHEKLOVI',
    speedLimitExceeded: 'TEZLIK CHEKLOVI BUZILDI! (60 KM/SOAT)',
    finePaid: 'Qoidabuzarlik jarimasi to‘landi: -10 Tanga',
    unpaidFineWarning: 'TO‘LANMAGAN JARIMA: 10 Tanga! 5:00 daqiqa ichida to‘lamasangiz qamoqqa olinasiz!',
    payFineNow: 'Jarimani to‘lash (10 Tanga)',
    jailTitle: 'POLIKSIYA QAMOQXONASI',
    jailDesc: 'Tezlik chegarasini oshirib, 5 daqiqa ichida 10 tanga jarimani to‘lamaganingiz sababli 90 soniya (1.5 daqiqa) qamoq jazosini o‘taysiz.',
    jailTimeRemaining: 'Qamoqda qolgan vaqt:',
    jailSentenceServed: 'Qamoq jazosi o‘tildi! Siz ozod qilindingiz.',
    bailOut: 'Kafolat puli bilan chiqish (10 Tanga)',

    firstPersonView: '1-Shaxs ko‘rinishi / Salon (C tugmasi)',
    thirdPersonView: '3-Shaxs ko‘rinishi / Orqadan (C tugmasi)',
    cameraToggle: 'Kamera (C)',
    sideMirrors: 'Bokovoy ko‘zgular',
    turnLeft: 'Chap povorotnik',
    turnRight: 'O‘ng povorotnik',
    hazardLights: 'Avariyniy',
    transmission: 'Uzatmalar qutisi',
    automatic: 'Avtomat (AT)',
    manual: 'Mexanika (MT)',
    gearLabel: 'Uzatma',
    shiftUp: 'Yuqori uzatma (+)',
    shiftDown: 'Quyi uzatma (-)',
  }
};
