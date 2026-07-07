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
    { id: "we1", dayOfWeek: 0, mealType: "dinner", mealName: "Salmão grelhado com quinoa e brócolos", ingredients: ["salmão 200g", "quinoa 80g", "brócolos 150g", "azeite", "limão"] },
    { id: "we2", dayOfWeek: 1, mealType: "dinner", mealName: "Frango com batata-doce e espinafres", ingredients: ["peito de frango 200g", "batata-doce 200g", "espinafres", "alho", "azeite"] },
    { id: "we3", dayOfWeek: 2, mealType: "lunch", mealName: "Burrata com tomate e manjericão", ingredients: ["burrata 125g", "tomate 200g", "manjericão", "azeite", "flor de sal"] },
    { id: "we4", dayOfWeek: 2, mealType: "dinner", mealName: "Tofu grelhado com legumes salteados", ingredients: ["tofu firme 200g", "courgette", "pimentos vermelhos", "molho de soja", "gengibre"] },
    { id: "we5", dayOfWeek: 3, mealType: "dinner", mealName: "Bacalhau assado com grão", ingredients: ["bacalhau 200g", "grão de bico 150g", "cebola", "alho", "azeite", "coentros"] },
    { id: "we6", dayOfWeek: 4, mealType: "dinner", mealName: "Hambúrguer de peru na air fryer", ingredients: ["hambúrguer de peru 150g", "alface", "tomate", "pão integral"] },
    { id: "we7", dayOfWeek: 5, mealType: "lunch", mealName: "Salada de atum com ovo", ingredients: ["atum ao natural 120g", "ovo 2 un", "alface", "pepino", "tomate cherry", "azeite"] },
    { id: "we8", dayOfWeek: 5, mealType: "dinner", mealName: "Esparguete de courgette com pesto", ingredients: ["courgette 2 un", "pesto verde 50g", "parmesão", "tomate cherry"] },
  ],
};

// ─── Shopping List mock data ───────────────────────────────────────────────────

export const mockShoppingList = {
  id: "mock-shopping-list-id",
  weekStartDate: "2026-03-30",
  name: "Lista da semana",
  shareCode: "AB12CD",
  collaboratorIds: [],
};

export const mockShoppingItems = [
  // Peixe & Marisco
  { id: "si1", listId: "mock-shopping-list-id", name: "Salmão", category: "Peixe & Marisco", quantity: "200g", checked: false, sourceDays: ["Segunda"], sortOrder: 0 },
  { id: "si2", listId: "mock-shopping-list-id", name: "Bacalhau", category: "Peixe & Marisco", quantity: "200g", checked: false, sourceDays: ["Quinta"], sortOrder: 1 },
  { id: "si3", listId: "mock-shopping-list-id", name: "Atum ao natural", category: "Peixe & Marisco", quantity: "120g", checked: false, sourceDays: ["Sábado"], sortOrder: 2 },
  // Carnes
  { id: "si4", listId: "mock-shopping-list-id", name: "Peito de frango", category: "Carnes", quantity: "200g", checked: false, sourceDays: ["Terça"], sortOrder: 3 },
  { id: "si5", listId: "mock-shopping-list-id", name: "Hambúrguer de peru", category: "Carnes", quantity: "150g", checked: false, sourceDays: ["Sexta"], sortOrder: 4 },
  // Legumes
  { id: "si6", listId: "mock-shopping-list-id", name: "Brócolos", category: "Legumes", quantity: "150g", checked: false, sourceDays: ["Segunda"], sortOrder: 5 },
  { id: "si7", listId: "mock-shopping-list-id", name: "Batata-doce", category: "Legumes", quantity: "200g", checked: false, sourceDays: ["Terça"], sortOrder: 6 },
  { id: "si8", listId: "mock-shopping-list-id", name: "Espinafres", category: "Legumes", quantity: null, checked: false, sourceDays: ["Terça"], sortOrder: 7 },
  { id: "si9", listId: "mock-shopping-list-id", name: "Courgette", category: "Legumes", quantity: "3 un", checked: true, sourceDays: ["Quarta", "Sábado"], sortOrder: 8 },
  { id: "si10", listId: "mock-shopping-list-id", name: "Tomate", category: "Legumes", quantity: "500g", checked: false, sourceDays: ["Quarta", "Sexta", "Sábado"], sortOrder: 9 },
  // Leguminosas & Cereais
  { id: "si11", listId: "mock-shopping-list-id", name: "Quinoa", category: "Cereais & Leguminosas", quantity: "80g", checked: false, sourceDays: ["Segunda"], sortOrder: 10 },
  { id: "si12", listId: "mock-shopping-list-id", name: "Grão de bico", category: "Cereais & Leguminosas", quantity: "150g", checked: false, sourceDays: ["Quinta"], sortOrder: 11 },
  // Lacticínios
  { id: "si13", listId: "mock-shopping-list-id", name: "Burrata", category: "Lacticínios", quantity: "125g", checked: false, sourceDays: ["Quarta"], sortOrder: 12 },
  // Outros
  { id: "si14", listId: "mock-shopping-list-id", name: "Tofu firme", category: "Outros", quantity: "200g", checked: false, sourceDays: ["Quarta"], sortOrder: 13 },
  { id: "si15", listId: "mock-shopping-list-id", name: "Pão integral", category: "Outros", quantity: "1 un", checked: true, sourceDays: ["Sexta"], sortOrder: 14 },
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
