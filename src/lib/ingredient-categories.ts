// Maps ingredient names (lowercase) to shopping categories
// Used as fallback when the Edge Function doesn't return a category

export const CATEGORIES = [
  "Peixe & Marisco",
  "Carnes",
  "Legumes",
  "Fruta",
  "Lacticínios",
  "Cereais & Leguminosas",
  "Condimentos & Ervas",
  "Outros",
] as const;

export type IngredientCategory = typeof CATEGORIES[number];

const CATEGORY_KEYWORDS: Record<IngredientCategory, string[]> = {
  "Peixe & Marisco": ["salmão", "bacalhau", "atum", "camarão", "peixe", "polvo", "lulas", "truta", "dourada", "robalo", "sardinhas", "linguado"],
  "Carnes": ["frango", "peru", "vaca", "porco", "borrego", "carne", "hambúrguer", "bife", "peito", "coxa", "entrecosto", "filete", "almôndega"],
  "Legumes": ["brócolos", "espinafres", "courgette", "cenoura", "cebola", "alho", "tomate", "pimento", "pepino", "alface", "rúcula", "beterraba", "abóbora", "beringela", "cogumelos", "acelgas", "nabo", "ervilhas", "feijão verde", "aipo"],
  "Fruta": ["banana", "maçã", "laranja", "limão", "pera", "uva", "morango", "framboesa", "mirtilo", "manga", "ananás", "melão", "kiwi", "ameixa", "cereja", "tomate cherry"],
  "Lacticínios": ["leite", "queijo", "iogurte", "manteiga", "natas", "burrata", "mozzarella", "ricotta", "requeijão", "kefir", "parmesão"],
  "Cereais & Leguminosas": ["quinoa", "arroz", "aveia", "pão", "massa", "grão", "lentilhas", "feijão", "ervilhas", "cuscuz", "bulgur", "trigo", "milho", "amaranto", "farinha"],
  "Condimentos & Ervas": ["azeite", "sal", "pimenta", "alho", "cebola", "manjericão", "coentros", "salsa", "oregãos", "tomilho", "rosmaninho", "vinagre", "mostarda", "molho", "limão", "gengibre", "açafrão", "paprika", "canela", "mel"],
  "Outros": [],
};

export function guessCategory(ingredientName: string): IngredientCategory {
  const lower = ingredientName.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as [IngredientCategory, string[]][]) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category;
    }
  }
  return "Outros";
}

// Category sort order for display
export const CATEGORY_ORDER: IngredientCategory[] = [
  "Peixe & Marisco",
  "Carnes",
  "Legumes",
  "Fruta",
  "Lacticínios",
  "Cereais & Leguminosas",
  "Condimentos & Ervas",
  "Outros",
];

// Category emoji icons
export const CATEGORY_ICONS: Record<IngredientCategory, string> = {
  "Peixe & Marisco": "🐟",
  "Carnes": "🥩",
  "Legumes": "🥦",
  "Fruta": "🍎",
  "Lacticínios": "🧀",
  "Cereais & Leguminosas": "🌾",
  "Condimentos & Ervas": "🧄",
  "Outros": "🛒",
};
