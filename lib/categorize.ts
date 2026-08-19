const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Fruits & Vegetables': [
    'apple', 'apples', 'banana', 'bananas', 'orange', 'oranges', 'mango', 'mangoes',
    'watermelon', 'spinach', 'tomato', 'tomatoes', 'potato', 'potatoes', 'onion', 'onions',
    'lemon', 'lemons', 'carrot', 'carrots', 'cucumber', 'berry', 'berries', 'strawberry',
    'avocado', 'lettuce', 'garlic', 'ginger', 'chili', 'cilantro', 'broccoli', 'grapes',
    'fruit', 'fruits', 'vegetable', 'vegetables', 'greens', 'salad', 'palak', 'alu', 'pyaz'
  ],
  'Dairy & Eggs': [
    'milk', 'doodh', 'cheese', 'paneer', 'butter', 'makhan', 'ghee', 'yogurt', 'curd', 'dahi',
    'egg', 'eggs', 'anda', 'ande', 'cream', 'almond milk', 'oat milk', 'soy milk', 'whey',
    'mayo', 'mayonnaise'
  ],
  'Bakery & Snacks': [
    'bread', 'roti', 'toast', 'sourdough', 'croissant', 'bagel', 'bun', 'buns',
    'cookie', 'cookies', 'biscuit', 'biscuits', 'chip', 'chips', 'crisps', 'snack', 'snacks',
    'oats', 'cereal', 'chocolate', 'chocolates', 'candy', 'peanuts', 'peanut butter', 'cake',
    'muffin', 'lays', 'kurkure', 'popcorn'
  ],
  'Beverages': [
    'water', 'pani', 'juice', 'soda', 'coke', 'pepsi', 'coffee', 'chai', 'tea', 'espresso',
    'green tea', 'herbal tea', 'beer', 'wine', 'drink', 'beverage', 'hot chocolate', 'cocoa',
    'tropicana', 'smoothie', 'sparkling water'
  ],
  'Pantry & Staples': [
    'rice', 'chawal', 'pasta', 'noodle', 'noodles', 'spaghetti', 'flour', 'atta', 'sugar',
    'chini', 'salt', 'namak', 'oil', 'olive oil', 'cooking oil', 'tel', 'spice', 'spices',
    'sauce', 'pasta sauce', 'ketchup', 'honey', 'dal', 'lentils', 'beans', 'chickpeas',
    'masala', 'turmeric', 'haldi', 'stevia'
  ],
  'Personal Care': [
    'toothpaste', 'toothbrush', 'soap', 'body wash', 'shampoo', 'conditioner', 'lotion',
    'sunscreen', 'deodorant', 'perfume', 'razor', 'colgate', 'sensodyne', 'dove', 'dettol',
    'face wash', 'hand wash', 'sanitizer', 'cream', 'serum', 'tissue', 'tissues'
  ],
  'Household & Cleaning': [
    'detergent', 'surf', 'surf excel', 'tide', 'dish soap', 'vim', 'cleaner', 'lizol',
    'floor cleaner', 'sponge', 'paper towel', 'trash bag', 'garbage bag', 'bleach',
    'harpic', 'mop', 'broom'
  ],
};

/**
 * Automatically categorize an item name into one of the standard supermarket categories.
 */
export function categorizeItem(itemName: string): string {
  if (!itemName || typeof itemName !== 'string') return 'Pantry & Staples';

  const normalized = itemName.toLowerCase().trim();

  // 1. Direct whole word / phrase check
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (normalized === kw || normalized.startsWith(`${kw} `) || normalized.endsWith(` ${kw}`) || normalized.includes(` ${kw} `)) {
        return category;
      }
    }
  }

  // 2. Substring containment check
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (normalized.includes(kw)) {
        return category;
      }
    }
  }

  return 'Pantry & Staples';
}
