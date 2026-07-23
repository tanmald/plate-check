// Test user detection and mock data
// Test users (by email) will get mock data instead of database data

export const TEST_USER_EMAIL = 'test@platecheck.app';

export function isTestUser(email: string | undefined): boolean {
  if (!email) return false;
  return email === TEST_USER_EMAIL || email.endsWith('@test.platecheck.app');
}

// Mock data for test users
export const mockMeals = [
  {
    id: "1",
    type: "breakfast" as const,
    name: "Oatmeal with berries",
    time: "8:30 AM",
    score: 92,
    foods: ["Oats", "Blueberries", "Almonds", "Honey"],
    feedback: "Perfect match with your breakfast template!",
  },
  {
    id: "2",
    type: "lunch" as const,
    name: "Grilled chicken salad",
    time: "12:45 PM",
    score: 78,
    foods: ["Chicken breast", "Mixed greens", "Tomatoes", "Caesar dressing"],
    feedback: "Good protein choice. Consider olive oil instead of Caesar.",
  },
  {
    id: "3",
    type: "snack" as const,
    name: "Greek yogurt",
    time: "3:30 PM",
    score: 88,
    foods: ["Greek yogurt", "Granola"],
    feedback: "Great snack!",
  },
];

export const mockPlan = {
  id: "mock-plan-id",
  name: "Weight Management Plan",
  uploadedAt: "Dec 28, 2025",
  source: "Dr. Smith Nutrition Clinic",
  templates: [
    {
      id: "0",
      type: "fasting",
      icon: "💧",
      name: "Upon Waking",
      options: [],
      requiredFoods: ["Water"],
      allowedFoods: ["Lemon water", "Herbal tea"],
      optionalAddons: [],
      calories: "",
      protein: "",
      isOptional: false,
      isPreWorkout: false,
      scheduledTime: "6:00 AM",
      referencesMeal: null,
      snackTimeCategory: null,
    },
    {
      id: "1",
      type: "breakfast",
      icon: "🌅",
      name: "Breakfast",
      options: [
        { number: 1, description: "Oatmeal with berries and nuts", foods: ["Oatmeal", "Berries", "Almonds"] },
        { number: 2, description: "Eggs with whole wheat toast", foods: ["Eggs", "Whole wheat toast", "Avocado"] },
      ],
      requiredFoods: ["Whole grains", "Protein source", "Fruit"],
      allowedFoods: ["Oatmeal", "Eggs", "Greek yogurt", "Berries", "Whole wheat toast"],
      optionalAddons: ["Coffee", "Honey"],
      calories: "350-450",
      protein: "20-30g",
      isOptional: false,
      isPreWorkout: false,
      scheduledTime: "8:00 AM",
      referencesMeal: null,
      snackTimeCategory: null,
    },
    {
      id: "2",
      type: "snack",
      icon: "🍎",
      name: "Morning Snack",
      options: [],
      requiredFoods: ["Fruit or nuts"],
      allowedFoods: ["Apple", "Almonds", "Greek yogurt"],
      optionalAddons: [],
      calories: "100-150",
      protein: "5-10g",
      isOptional: true,
      isPreWorkout: false,
      scheduledTime: "10:30 AM",
      referencesMeal: null,
      snackTimeCategory: "morning",
    },
    {
      id: "3",
      type: "lunch",
      icon: "☀️",
      name: "Lunch",
      options: [
        { number: 1, description: "Grilled chicken with quinoa and vegetables", foods: ["Chicken", "Quinoa", "Broccoli", "Spinach"] },
        { number: 2, description: "Fish with brown rice and salad", foods: ["Fish", "Brown rice", "Mixed greens", "Tomatoes"] },
      ],
      requiredFoods: ["Lean protein", "Vegetables", "Complex carbs"],
      allowedFoods: ["Chicken", "Fish", "Salad greens", "Quinoa", "Brown rice"],
      optionalAddons: ["Olive oil dressing"],
      calories: "450-550",
      protein: "30-40g",
      isOptional: false,
      isPreWorkout: false,
      scheduledTime: "12:30 PM",
      referencesMeal: null,
      snackTimeCategory: null,
    },
    {
      id: "4",
      type: "snack",
      icon: "💪",
      name: "Pre-Workout",
      options: [],
      requiredFoods: ["Quick energy source"],
      allowedFoods: ["Banana", "Peanut butter", "Dark chocolate"],
      optionalAddons: [],
      calories: "150-200",
      protein: "5-10g",
      isOptional: false,
      isPreWorkout: true,
      scheduledTime: "4:00 PM",
      referencesMeal: null,
      snackTimeCategory: "afternoon",
    },
    {
      id: "5",
      type: "dinner",
      icon: "🌙",
      name: "Dinner",
      options: [],
      requiredFoods: ["Lean protein", "Vegetables"],
      allowedFoods: ["Salmon", "Chicken", "Tofu", "Broccoli", "Spinach"],
      optionalAddons: ["Legumes"],
      calories: "400-500",
      protein: "25-35g",
      isOptional: false,
      isPreWorkout: false,
      scheduledTime: "7:00 PM",
      referencesMeal: "Lunch",
      snackTimeCategory: null,
    },
    {
      id: "6",
      type: "snack",
      icon: "🍎",
      name: "Evening Snack",
      options: [],
      requiredFoods: ["Protein or fruit"],
      allowedFoods: ["Greek yogurt", "Nuts", "Apple", "Protein bar"],
      optionalAddons: [],
      calories: "100-150",
      protein: "10-15g",
      isOptional: true,
      isPreWorkout: false,
      scheduledTime: "9:00 PM",
      referencesMeal: null,
      snackTimeCategory: "evening",
    },
  ],
};

export const mockWeeklyData = [
  { day: "Monday", shortDay: "Mon", score: 88, mealsLogged: 4 },
  { day: "Tuesday", shortDay: "Tue", score: 75, mealsLogged: 4 },
  { day: "Wednesday", shortDay: "Wed", score: 92, mealsLogged: 4 },
  { day: "Thursday", shortDay: "Thu", score: 68, mealsLogged: 3 },
  { day: "Friday", shortDay: "Fri", score: 45, mealsLogged: 2 },
  { day: "Saturday", shortDay: "Sat", score: 82, mealsLogged: 4 },
  { day: "Sunday", shortDay: "Sun", score: 85, mealsLogged: 3, isToday: true },
];

export const mockDailyStats = {
  dailyScore: 85,
  streak: 7,
  weeklyAverage: 82,
  mealsLogged: 2,
  totalMeals: 4,
};

export const mockAdherenceByMealType = [
  { type: "breakfast" as const, averageScore: 92, mealsLogged: 6 },
  { type: "lunch" as const, averageScore: 78, mealsLogged: 6 },
  { type: "dinner" as const, averageScore: 71, mealsLogged: 5 },
  { type: "snack" as const, averageScore: 85, mealsLogged: 4 },
];

export const mockPreviousWeekAverage = 78;

// Mock data matching Edge Function response format (AnalyzeMealResponse)
export const mockAnalysisResult = {
  score: 80,
  detectedFoods: [
    { name: "Grilled chicken breast", matched: true, matchType: "required" as const, confidence: 0.95, category: "Protein" },
    { name: "Brown rice", matched: true, matchType: "allowed" as const, confidence: 0.92, category: "Carbs" },
    { name: "Steamed broccoli", matched: true, matchType: "required" as const, confidence: 0.88, category: "Vegetables" },
    { name: "Caesar dressing", matched: false, matchType: "off_plan" as const, confidence: 0.85, category: "Sauce" },
  ],
  missingRequired: ["Lean protein"],
  feedback: "Great protein choice! The chicken and rice match your lunch template. Consider using olive oil instead of Caesar dressing for better plan adherence.",
  confidence: "high" as const,
  suggestedSwaps: [
    { original: "Caesar dressing", suggested: ["Olive oil & lemon", "Balsamic vinegar"], reason: "Lower sodium, fits plan" },
  ],
};

// Legacy format for backward compatibility (deprecated - use mockAnalysisResult)
export const mockMealResult = {
  score: 78,
  status: "Aligned" as const,
  confidence: "high" as const,
  detectedFoods: [
    { name: "Grilled chicken breast", matched: true, category: "Protein" },
    { name: "Brown rice", matched: true, category: "Carbs" },
    { name: "Steamed broccoli", matched: true, category: "Vegetables" },
    { name: "Caesar dressing", matched: false, category: "Sauce" },
  ],
  feedback: "Great protein choice! The chicken and rice match your lunch template. Consider using olive oil instead of Caesar dressing for better plan adherence.",
  suggestions: [
    { food: "Caesar dressing", replacement: "Olive oil & lemon", reason: "Lower sodium, fits plan" },
  ],
};

// Mock data matching Edge Function response format (ParsePlanResponse)
export const mockParsePlanResponse = {
  planId: "mock-plan-id",
  planName: "Weight Management Plan",
  mealTemplates: [
    {
      id: "1",
      type: "fasting",
      icon: "💧",
      name: "Upon Waking",
      options: [],
      requiredFoods: ["Water"],
      allowedFoods: ["Lemon water", "Herbal tea"],
      optionalAddons: [],
      calories: "",
      protein: "",
      isOptional: false,
      isPreWorkout: false,
      scheduledTime: "6:00 AM",
      referencesMeal: null,
      snackTimeCategory: null,
    },
    {
      id: "2",
      type: "breakfast",
      icon: "🌅",
      name: "Breakfast",
      options: [
        { number: 1, description: "Oatmeal with berries and nuts", foods: ["Oatmeal", "Berries", "Almonds"] },
        { number: 2, description: "Eggs with whole wheat toast", foods: ["Eggs", "Whole wheat toast", "Avocado"] },
      ],
      requiredFoods: ["Whole grains", "Protein source", "Fruit"],
      allowedFoods: ["Oatmeal", "Eggs", "Greek yogurt", "Berries", "Whole wheat toast"],
      optionalAddons: ["Coffee", "Honey"],
      calories: "350-450",
      protein: "20-30g",
      isOptional: false,
      isPreWorkout: false,
      scheduledTime: "8:00 AM",
      referencesMeal: null,
      snackTimeCategory: null,
    },
    {
      id: "3",
      type: "lunch",
      icon: "☀️",
      name: "Lunch",
      options: [
        { number: 1, description: "Grilled chicken with quinoa", foods: ["Chicken", "Quinoa", "Vegetables"] },
        { number: 2, description: "Fish with brown rice", foods: ["Fish", "Brown rice", "Salad greens"] },
      ],
      requiredFoods: ["Lean protein", "Vegetables", "Complex carbs"],
      allowedFoods: ["Chicken", "Fish", "Salad greens", "Quinoa", "Brown rice"],
      optionalAddons: ["Olive oil dressing"],
      calories: "450-550",
      protein: "30-40g",
      isOptional: false,
      isPreWorkout: false,
      scheduledTime: "12:30 PM",
      referencesMeal: null,
      snackTimeCategory: null,
    },
    {
      id: "4",
      type: "snack",
      icon: "💪",
      name: "Pre-Workout",
      options: [],
      requiredFoods: ["Quick energy source"],
      allowedFoods: ["Banana", "Peanut butter", "Dark chocolate"],
      optionalAddons: [],
      calories: "150-200",
      protein: "5-10g",
      isOptional: false,
      isPreWorkout: true,
      scheduledTime: "4:00 PM",
      referencesMeal: null,
      snackTimeCategory: "afternoon",
    },
    {
      id: "5",
      type: "dinner",
      icon: "🌙",
      name: "Dinner",
      options: [],
      requiredFoods: ["Lean protein", "Vegetables"],
      allowedFoods: ["Salmon", "Chicken", "Tofu", "Broccoli", "Spinach"],
      optionalAddons: ["Legumes"],
      calories: "400-500",
      protein: "25-35g",
      isOptional: false,
      isPreWorkout: false,
      scheduledTime: "7:00 PM",
      referencesMeal: "Lunch",
      snackTimeCategory: null,
    },
    {
      id: "6",
      type: "snack",
      icon: "🍎",
      name: "Evening Snack",
      options: [],
      requiredFoods: ["Protein or fruit"],
      allowedFoods: ["Greek yogurt", "Nuts", "Apple"],
      optionalAddons: [],
      calories: "100-150",
      protein: "10-15g",
      isOptional: true,
      isPreWorkout: false,
      scheduledTime: "9:00 PM",
      referencesMeal: null,
      snackTimeCategory: "evening",
    },
  ],
  confidence: "high" as const,
  warnings: [],
};

// ─── Weekly Meal Plan mock data ───────────────────────────────────────────────

export const mockWeeklyPlan = {
  id: "mock-weekly-plan-id",
  weekStartDate: "2026-03-30",
  entries: [
    { id: "we1", dayOfWeek: 0, mealType: "dinner", mealName: "Grilled salmon with quinoa and broccoli", ingredients: ["salmon 200g", "quinoa 80g", "broccoli 150g", "olive oil", "lemon"] },
    { id: "we2", dayOfWeek: 1, mealType: "dinner", mealName: "Chicken with sweet potato and spinach", ingredients: ["chicken breast 200g", "sweet potato 200g", "spinach", "garlic", "olive oil"] },
    { id: "we3", dayOfWeek: 2, mealType: "lunch", mealName: "Burrata with tomato and basil", ingredients: ["burrata 125g", "tomato 200g", "basil", "olive oil", "sea salt"] },
    { id: "we4", dayOfWeek: 2, mealType: "dinner", mealName: "Grilled tofu with sautéed vegetables", ingredients: ["firm tofu 200g", "zucchini", "red peppers", "soy sauce", "ginger"] },
    { id: "we5", dayOfWeek: 3, mealType: "dinner", mealName: "Roasted cod with chickpeas", ingredients: ["cod 200g", "chickpeas 150g", "onion", "garlic", "olive oil", "cilantro"] },
    { id: "we6", dayOfWeek: 4, mealType: "dinner", mealName: "Air fryer turkey burger", ingredients: ["turkey burger 150g", "lettuce", "tomato", "whole wheat bun"] },
    { id: "we7", dayOfWeek: 5, mealType: "lunch", mealName: "Tuna salad with egg", ingredients: ["tuna in water 120g", "egg 2 units", "lettuce", "cucumber", "cherry tomato", "olive oil"] },
    { id: "we8", dayOfWeek: 5, mealType: "dinner", mealName: "Zucchini pasta with pesto", ingredients: ["zucchini 2 units", "green pesto 50g", "parmesan", "cherry tomato"] },
  ],
};

// ─── Shopping List mock data ───────────────────────────────────────────────────

export const mockShoppingList = {
  id: "mock-shopping-list-id",
  weekStartDate: "2026-03-30",
  name: "Weekly list",
  shareCode: "AB12CD",
  collaboratorIds: [],
};

export const mockShoppingItems = [
  // Fish & Seafood
  { id: "si1", listId: "mock-shopping-list-id", name: "Salmon", category: "Fish & Seafood", quantity: "200g", checked: false, sourceDays: ["Monday"], sortOrder: 0 },
  { id: "si2", listId: "mock-shopping-list-id", name: "Cod", category: "Fish & Seafood", quantity: "200g", checked: false, sourceDays: ["Thursday"], sortOrder: 1 },
  { id: "si3", listId: "mock-shopping-list-id", name: "Tuna in water", category: "Fish & Seafood", quantity: "120g", checked: false, sourceDays: ["Saturday"], sortOrder: 2 },
  // Meat
  { id: "si4", listId: "mock-shopping-list-id", name: "Chicken breast", category: "Meat", quantity: "200g", checked: false, sourceDays: ["Tuesday"], sortOrder: 3 },
  { id: "si5", listId: "mock-shopping-list-id", name: "Turkey burger", category: "Meat", quantity: "150g", checked: false, sourceDays: ["Friday"], sortOrder: 4 },
  // Vegetables
  { id: "si6", listId: "mock-shopping-list-id", name: "Broccoli", category: "Vegetables", quantity: "150g", checked: false, sourceDays: ["Monday"], sortOrder: 5 },
  { id: "si7", listId: "mock-shopping-list-id", name: "Sweet potato", category: "Vegetables", quantity: "200g", checked: false, sourceDays: ["Tuesday"], sortOrder: 6 },
  { id: "si8", listId: "mock-shopping-list-id", name: "Spinach", category: "Vegetables", quantity: null, checked: false, sourceDays: ["Tuesday"], sortOrder: 7 },
  { id: "si9", listId: "mock-shopping-list-id", name: "Zucchini", category: "Vegetables", quantity: "3 units", checked: true, sourceDays: ["Wednesday", "Saturday"], sortOrder: 8 },
  { id: "si10", listId: "mock-shopping-list-id", name: "Tomato", category: "Vegetables", quantity: "500g", checked: false, sourceDays: ["Wednesday", "Friday", "Saturday"], sortOrder: 9 },
  // Grains & Legumes
  { id: "si11", listId: "mock-shopping-list-id", name: "Quinoa", category: "Grains & Legumes", quantity: "80g", checked: false, sourceDays: ["Monday"], sortOrder: 10 },
  { id: "si12", listId: "mock-shopping-list-id", name: "Chickpeas", category: "Grains & Legumes", quantity: "150g", checked: false, sourceDays: ["Thursday"], sortOrder: 11 },
  // Dairy
  { id: "si13", listId: "mock-shopping-list-id", name: "Burrata", category: "Dairy", quantity: "125g", checked: false, sourceDays: ["Wednesday"], sortOrder: 12 },
  // Other
  { id: "si14", listId: "mock-shopping-list-id", name: "Firm tofu", category: "Other", quantity: "200g", checked: false, sourceDays: ["Wednesday"], sortOrder: 13 },
  { id: "si15", listId: "mock-shopping-list-id", name: "Whole wheat bread", category: "Other", quantity: "1 unit", checked: true, sourceDays: ["Friday"], sortOrder: 14 },
];

// ─── Profile ───────────────────────────────────────────────────────────────────

export const mockProfile = {
  id: "test-user-id",
  email: TEST_USER_EMAIL,
  full_name: "Test User",
  avatar_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// ─── Health tracking mock data ─────────────────────────────────────────────

function daysAgoIso(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

export const mockHealthDaily = {
  date: daysAgoIso(0),
  recoveryScore: 72,
  sleepScore: 81,
  strainScore: 45,
  hrvMs: 62,
  restingHr: 51,
  respiratoryRate: 14.2,
  wristTemp: 34.6,
  wristTempDelta: 0.1,
  spo2: 97,
  sleepStart: null as string | null,
  sleepEnd: null as string | null,
  sleepDurationMin: 445,
  sleepDeepMin: 82,
  sleepRemMin: 98,
  sleepCoreMin: 245,
  sleepAwakeMin: 20,
  sleepEfficiency: 0.96,
  steps: 8400,
  activeEnergyKcal: 420,
  exerciseMinutes: 28,
  standHours: 10,
  vo2Max: 44.2,
  workouts: [{ name: "Outdoor Run", duration: 32 }] as Array<Record<string, unknown>>,
  scoreDetail: null as Record<string, unknown> | null,
};

export const mockHealthTrends = [
  { ...mockHealthDaily, date: daysAgoIso(6), recoveryScore: 65, sleepScore: 70, strainScore: 60, hrvMs: 55, restingHr: 54, steps: 5200, activeEnergyKcal: 380, exerciseMinutes: 15 },
  { ...mockHealthDaily, date: daysAgoIso(5), recoveryScore: 70, sleepScore: 76, strainScore: 50, hrvMs: 59, restingHr: 52, steps: 7100, activeEnergyKcal: 410, exerciseMinutes: 20 },
  { ...mockHealthDaily, date: daysAgoIso(4), recoveryScore: 58, sleepScore: 62, strainScore: 78, hrvMs: 48, restingHr: 56, steps: 11200, activeEnergyKcal: 610, exerciseMinutes: 55 },
  { ...mockHealthDaily, date: daysAgoIso(3), recoveryScore: 75, sleepScore: 85, strainScore: 40, hrvMs: 64, restingHr: 50, steps: 6800, activeEnergyKcal: 390, exerciseMinutes: 18 },
  { ...mockHealthDaily, date: daysAgoIso(2), recoveryScore: 80, sleepScore: 88, strainScore: 35, hrvMs: 67, restingHr: 49, steps: 5900, activeEnergyKcal: 350, exerciseMinutes: 12 },
  { ...mockHealthDaily, date: daysAgoIso(1), recoveryScore: 66, sleepScore: 72, strainScore: 68, hrvMs: 56, restingHr: 53, steps: 9800, activeEnergyKcal: 520, exerciseMinutes: 40 },
  { ...mockHealthDaily, date: daysAgoIso(0) },
];

export const mockIngestToken = {
  tokenPrefix: "a1b2c3d4",
  createdAt: `${daysAgoIso(9)}T08:00:00.000Z`,
  lastUsedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
};
