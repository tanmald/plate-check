// Maps ingredient names (lowercase) to shopping categories
// Used as fallback when the Edge Function doesn't return a category

export const CATEGORIES = [
  "Fish & Seafood",
  "Meat",
  "Vegetables",
  "Fruit",
  "Dairy",
  "Grains & Legumes",
  "Condiments & Herbs",
  "Other",
] as const;

export type IngredientCategory = typeof CATEGORIES[number];

const CATEGORY_KEYWORDS: Record<IngredientCategory, string[]> = {
  "Fish & Seafood": ["salmon", "cod", "tuna", "shrimp", "prawn", "fish", "octopus", "squid", "trout", "sea bream", "sea bass", "sardine", "sole", "mussel", "clam"],
  "Meat": ["chicken", "turkey", "beef", "pork", "lamb", "meat", "burger", "steak", "breast", "thigh", "rib", "fillet", "meatball", "sausage", "bacon"],
  "Vegetables": ["broccoli", "spinach", "zucchini", "courgette", "carrot", "onion", "garlic", "tomato", "pepper", "cucumber", "lettuce", "arugula", "rocket", "beet", "beetroot", "pumpkin", "squash", "eggplant", "aubergine", "mushroom", "chard", "turnip", "peas", "green bean", "celery"],
  "Fruit": ["banana", "apple", "orange", "lemon", "pear", "grape", "strawberry", "raspberry", "blueberry", "mango", "pineapple", "melon", "kiwi", "plum", "cherry", "cherry tomato"],
  "Dairy": ["milk", "cheese", "yogurt", "yoghurt", "butter", "cream", "burrata", "mozzarella", "ricotta", "cottage cheese", "kefir", "parmesan"],
  "Grains & Legumes": ["quinoa", "rice", "oats", "bread", "pasta", "chickpea", "lentil", "beans", "peas", "couscous", "bulgur", "wheat", "corn", "amaranth", "flour"],
  "Condiments & Herbs": ["olive oil", "salt", "pepper", "garlic", "onion", "basil", "cilantro", "coriander", "parsley", "oregano", "thyme", "rosemary", "vinegar", "mustard", "sauce", "lemon", "ginger", "saffron", "paprika", "cinnamon", "honey"],
  "Other": [],
};

export function guessCategory(ingredientName: string): IngredientCategory {
  const lower = ingredientName.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as [IngredientCategory, string[]][]) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category;
    }
  }
  return "Other";
}

// Category sort order for display
export const CATEGORY_ORDER: IngredientCategory[] = [
  "Fish & Seafood",
  "Meat",
  "Vegetables",
  "Fruit",
  "Dairy",
  "Grains & Legumes",
  "Condiments & Herbs",
  "Other",
];

// Category emoji icons
export const CATEGORY_ICONS: Record<IngredientCategory, string> = {
  "Fish & Seafood": "🐟",
  "Meat": "🥩",
  "Vegetables": "🥦",
  "Fruit": "🍎",
  "Dairy": "🧀",
  "Grains & Legumes": "🌾",
  "Condiments & Herbs": "🧄",
  "Other": "🛒",
};
