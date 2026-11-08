// LocalStorage Persistence and Initial Seed Data

const STORAGE_KEYS = {
  MEDICINES: 'elderly_care_medicines_v2',
  DIET_PLAN: 'elderly_care_diet_v2',
  ACTIVITIES: 'elderly_care_activities_v2',
  WATER_INTAKE: 'elderly_care_water_v2',
  CAREGIVER: 'elderly_care_caregiver_v2',
  VITALS: 'elderly_care_vitals_v2',
  LOGS: 'elderly_care_logs_v2',
  SETTINGS: 'elderly_care_settings_v2',
};

const DEFAULT_MEDICINES = [
  {
    id: 'med-1',
    name: 'Aspirin (Cardio)',
    dosage: '100 mg (1 Tablet)',
    time: '08:00',
    slot: 'Morning',
    instructions: 'Take with 1 full glass of water after breakfast',
    color: '#ef4444', // Red capsule
    iconType: 'pill',
    status: 'pending', // 'pending' | 'taken' | 'snoozed' | 'missed'
    takenAt: null,
    missedCount: 0,
  },
  {
    id: 'med-2',
    name: 'Metformin',
    dosage: '500 mg (1 Tablet)',
    time: '13:00',
    slot: 'Afternoon',
    instructions: 'Take during or immediately after lunch',
    color: '#3b82f6', // Blue tablet
    iconType: 'tablet',
    status: 'pending',
    takenAt: null,
    missedCount: 0,
  },
  {
    id: 'med-3',
    name: 'Multivitamin Syrup',
    dosage: '10 ml (2 Spoons)',
    time: '17:30',
    slot: 'Evening',
    instructions: 'Take after evening tea',
    color: '#10b981', // Green syrup
    iconType: 'syrup',
    status: 'pending',
    takenAt: null,
    missedCount: 0,
  },
  {
    id: 'med-4',
    name: 'Atorvastatin',
    dosage: '10 mg (1 Tablet)',
    time: '20:00',
    slot: 'Night',
    instructions: 'Take 30 minutes before bedtime',
    color: '#8b5cf6', // Purple pill
    iconType: 'pill',
    status: 'pending',
    takenAt: null,
    missedCount: 0,
  },
];

const DEFAULT_DIET_PLAN = [
  {
    id: 'diet-1',
    meal: 'Breakfast',
    time: '08:30 AM',
    items: ['Oatmeal with warm almond milk & raisins', '1 Boiled egg / Paneer slice', '1 Apple or Banana'],
    note: 'Low sodium, heart healthy',
    completed: true,
  },
  {
    id: 'diet-2',
    meal: 'Lunch',
    time: '01:30 PM',
    items: ['Steamed Brown Rice / Whole wheat rotis (2)', 'Yellow Dal Curry & Spinach (Palak)', 'Cucumber & Tomato salad with lemon juice'],
    note: 'High fiber, easy digestion',
    completed: false,
  },
  {
    id: 'diet-3',
    meal: 'Evening Snack',
    time: '05:00 PM',
    items: ['Warm Herbal Green Tea', '4 Soaked Almonds & 2 Walnuts', 'Light roasted makhana (foxnuts)'],
    note: 'Good for brain & heart health',
    completed: false,
  },
  {
    id: 'diet-4',
    meal: 'Dinner',
    time: '07:30 PM',
    items: ['Light vegetable soup (Carrot & Pumpkin)', 'Grilled Tofu / Khichdi', 'Warm Golden Turmeric Milk before sleep'],
    note: 'Eat at least 2 hours before sleeping',
    completed: false,
  },
];

const DEFAULT_ACTIVITIES = [
  { id: 'act-1', name: 'Morning Gentle Walk', time: '07:00 AM', duration: '25 mins', completed: true, icon: 'walk' },
  { id: 'act-2', name: 'Morning Blood Pressure Check', time: '08:15 AM', duration: '5 mins', completed: true, icon: 'heart' },
  { id: 'act-3', name: 'Eye & Neck Stretching Exercises', time: '11:00 AM', duration: '15 mins', completed: false, icon: 'eye' },
  { id: 'act-4', name: 'Afternoon Hydration & Breathing', time: '03:30 PM', duration: '10 mins', completed: false, icon: 'wind' },
  { id: 'act-5', name: 'Night Sugar Level Check', time: '09:00 PM', duration: '5 mins', completed: false, icon: 'drop' },
];

const DEFAULT_WATER = {
  currentGlasses: 4,
  targetGlasses: 8,
  glassSizeMl: 250,
  history: [
    { time: '07:30 AM', amountMl: 250 },
    { time: '09:00 AM', amountMl: 250 },
    { time: '11:30 AM', amountMl: 250 },
    { time: '01:15 PM', amountMl: 250 },
  ],
};

const DEFAULT_CAREGIVER = {
  name: 'Sarah Jenkins',
  relation: 'Daughter / Primary Caregiver',
  phone: '+1 (555) 382-9102',
  whatsapp: '+15553829102',
  email: 'sarah.jenkins@familycare.org',
  notifyOnMissed: true,
  missedThreshold: 2, // 2 missed reminders trigger alert
  autoSmsSimulated: true,
};

const DEFAULT_VITALS = {
  bpLogs: [
    { id: 'bp-1', date: '2026-09-23 08:30 AM', sys: 122, dia: 80, pulse: 72, note: 'Fasting morning check', category: 'Normal' },
    { id: 'bp-2', date: '2026-09-24 08:15 AM', sys: 126, dia: 82, pulse: 74, note: 'Felt calm and comfortable', category: 'Normal' },
  ],
  sugarLogs: [
    { id: 's-1', date: '2026-09-23 08:00 AM', level: 108, type: 'Fasting', note: 'Before breakfast', category: 'Normal' },
    { id: 's-2', date: '2026-09-23 02:30 PM', level: 142, type: 'Post-Meal', note: '2 hours after lunch', category: 'Normal' },
    { id: 's-3', date: '2026-09-24 08:00 AM', level: 112, type: 'Fasting', note: 'Before breakfast', category: 'Normal' },
  ],
  weight: 68.5, // kg
};

const DEFAULT_LOGS = [
  {
    id: 'log-1',
    timestamp: '2026-09-24 08:02 AM',
    type: 'MEDICINE_TAKEN',
    title: 'Aspirin (Cardio) Taken',
    detail: 'Elderly confirmed morning pill on time.',
    severity: 'success',
  },
  {
    id: 'log-2',
    timestamp: '2026-09-23 08:15 PM',
    type: 'MEDICINE_SNOOZED',
    title: 'Atorvastatin Snoozed (10 mins)',
    detail: 'Reminder snoozed once, confirmed 10 minutes later.',
    severity: 'warning',
  },
];

const DEFAULT_SETTINGS = {
  mode: 'elderly', // 'elderly' | 'caregiver'
  fontSize: 'large', // 'normal' | 'large' | 'extra-large'
  voiceEnabled: true,
  soundEnabled: true,
  autoSpeakReminders: true,
  highContrast: false,
};

// Helper methods for LocalStorage
export const getStoredData = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return defaultValue;
  }
};

export const setStoredData = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
};

export const loadInitialState = () => ({
  medicines: getStoredData(STORAGE_KEYS.MEDICINES, DEFAULT_MEDICINES),
  dietPlan: getStoredData(STORAGE_KEYS.DIET_PLAN, DEFAULT_DIET_PLAN),
  activities: getStoredData(STORAGE_KEYS.ACTIVITIES, DEFAULT_ACTIVITIES),
  water: getStoredData(STORAGE_KEYS.WATER_INTAKE, DEFAULT_WATER),
  caregiver: getStoredData(STORAGE_KEYS.CAREGIVER, DEFAULT_CAREGIVER),
  vitals: getStoredData(STORAGE_KEYS.VITALS, DEFAULT_VITALS),
  logs: getStoredData(STORAGE_KEYS.LOGS, DEFAULT_LOGS),
  settings: getStoredData(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS),
});

export { STORAGE_KEYS };
