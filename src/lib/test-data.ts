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
  name: "Weight Management Plan",
  uploadedAt: "Dec 28, 2025",
  source: "Dr. Smith Nutrition Clinic",
  templates: [
    {
      id: "1",
      type: "breakfast",
      icon: "🌅",
      name: "Breakfast",
      requiredFoods: ["Whole grains", "Protein source", "Fruit"],
      allowedFoods: ["Oatmeal", "Eggs", "Greek yogurt", "Berries", "Whole wheat toast"],
      calories: "350-450",
      protein: "20-30g",
    },
    {
      id: "2",
      type: "lunch",
      icon: "☀️",
      name: "Lunch",
      requiredFoods: ["Lean protein", "Vegetables", "Complex carbs"],
      allowedFoods: ["Chicken", "Fish", "Salad greens", "Quinoa", "Brown rice"],
      calories: "450-550",
      protein: "30-40g",
    },
    {
      id: "3",
      type: "dinner",
      icon: "🌙",
      name: "Dinner",
      requiredFoods: ["Lean protein", "Vegetables"],
      allowedFoods: ["Salmon", "Chicken", "Tofu", "Broccoli", "Spinach"],
      calories: "400-500",
      protein: "25-35g",
    },
    {
      id: "4",
      type: "snack",
      icon: "🍎",
      name: "Snacks",
      requiredFoods: ["Protein or fruit"],
      allowedFoods: ["Greek yogurt", "Nuts", "Apple", "Protein bar"],
      calories: "150-200",
      protein: "10-15g",
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

// Mock data matching Edge Function response format (AnalyzeMealResponse)
export const mockAnalysisResult = {
  score: 78,
  detectedFoods: [
    { name: "Grilled chicken breast", matched: true, confidence: 0.95, category: "Protein" },
    { name: "Brown rice", matched: true, confidence: 0.92, category: "Carbs" },
    { name: "Steamed broccoli", matched: true, confidence: 0.88, category: "Vegetables" },
    { name: "Caesar dressing", matched: false, confidence: 0.85, category: "Sauce" },
  ],
  feedback: "Great protein choice! The chicken and rice match your lunch template. Consider using olive oil instead of Caesar dressing for better plan adherence.",
  confidence: "high" as const,
  suggestedSwaps: [
    { original: "Caesar dressing", suggested: "Olive oil & lemon", reason: "Lower sodium, fits plan" },
  ],
};

// Legacy format for backward compatibility (deprecated - use mockAnalysisResult)
export const mockMealResult = {
  score: 78,
  status: "On plan" as const,
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
      type: "breakfast",
      icon: "🌅",
      name: "Breakfast",
      requiredFoods: ["Whole grains", "Protein source", "Fruit"],
      allowedFoods: ["Oatmeal", "Eggs", "Greek yogurt", "Berries", "Whole wheat toast"],
      calories: "350-450",
      protein: "20-30g",
    },
    {
      id: "2",
      type: "lunch",
      icon: "☀️",
      name: "Lunch",
      requiredFoods: ["Lean protein", "Vegetables", "Complex carbs"],
      allowedFoods: ["Chicken", "Fish", "Salad greens", "Quinoa", "Brown rice"],
      calories: "450-550",
      protein: "30-40g",
    },
    {
      id: "3",
      type: "dinner",
      icon: "🌙",
      name: "Dinner",
      requiredFoods: ["Lean protein", "Vegetables"],
      allowedFoods: ["Salmon", "Chicken", "Tofu", "Broccoli", "Spinach"],
      calories: "400-500",
      protein: "25-35g",
    },
    {
      id: "4",
      type: "snack",
      icon: "🍎",
      name: "Snacks",
      requiredFoods: ["Protein or fruit"],
      allowedFoods: ["Greek yogurt", "Nuts", "Apple", "Protein bar"],
      calories: "150-200",
      protein: "10-15g",
    },
  ],
  confidence: "high" as const,
  warnings: [],
};

export const mockProfile = {
  id: "test-user-id",
  email: TEST_USER_EMAIL,
  full_name: "Test User",
  avatar_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
