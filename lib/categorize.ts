import { GROCERY_ONTOLOGY } from './groceryOntology';

// 8 Standard Supermarket Aisles
export const SUPERMARKET_CATEGORIES = [
  'Fruits & Vegetables',
  'Dairy & Eggs',
  'Bakery & Snacks',
  'Pantry & Staples',
  'Beverages',
  'Personal Care',
  'Household & Cleaning',
  'Spices & Condiments',
] as const;

export type SupermarketCategory = typeof SUPERMARKET_CATEGORIES[number];

const PRIORITY_CATEGORIES: { category: SupermarketCategory; keywords: string[] }[] = [
  {
    category: 'Beverages',
    keywords: [
      'juice', 'drink', 'beverage', 'tea', 'coffee', 'water', 'soda', 'coke',
      'pepsi', 'smoothie', 'espresso', 'cocoa', 'hot chocolate', 'chai', 'pani', 'paani'
    ],
  },
  {
    category: 'Bakery & Snacks',
    keywords: [
      'chips', 'crisps', 'bread', 'toast', 'sourdough', 'biscuit', 'biscuits',
      'cookie', 'cookies', 'croissant', 'bagel', 'bun', 'buns', 'snack', 'snacks',
      'oats', 'cereal', 'chocolate', 'chocolates', 'popcorn', 'muffin', 'cake', 'pav'
    ],
  },
  {
    category: 'Personal Care',
    keywords: [
      'toothpaste', 'toothbrush', 'body wash', 'hand wash', 'soap', 'shampoo',
      'conditioner', 'lotion', 'sunscreen', 'deodorant', 'face wash', 'sanitizer',
      'colgate', 'sensodyne', 'dove', 'dettol', 'sabun'
    ],
  },
  {
    category: 'Household & Cleaning',
    keywords: [
      'detergent', 'dish soap', 'floor cleaner', 'cleaner', 'surf excel', 'tide',
      'vim', 'lizol', 'paper towel', 'trash bag', 'bleach', 'sponge', 'washing powder'
    ],
  },
  {
    category: 'Dairy & Eggs',
    keywords: [
      'milk', 'cheese', 'butter', 'ghee', 'yogurt', 'curd', 'egg', 'eggs',
      'paneer', 'cream', 'doodh', 'makhan', 'dahi', 'anda', 'ande',
      'almond milk', 'oat milk', 'soy milk', 'cottage cheese'
    ],
  },
  {
    category: 'Spices & Condiments',
    keywords: [
      'salt', 'pepper', 'turmeric', 'haldi', 'chili powder', 'mirch', 'jeera',
      'cumin', 'garam masala', 'cinnamon', 'cardamom', 'elaichi', 'ketchup',
      'mayonnaise', 'mustard', 'sauce', 'vinegar', 'soy sauce', 'namak'
    ],
  },
  {
    category: 'Fruits & Vegetables',
    keywords: [
      'apple', 'apples', 'banana', 'bananas', 'orange', 'oranges', 'mango', 'mangoes',
      'watermelon', 'spinach', 'tomato', 'tomatoes', 'potato', 'potatoes', 'onion', 'onions',
      'lemon', 'lemons', 'carrot', 'carrots', 'cucumber', 'berry', 'berries', 'strawberry',
      'avocado', 'lettuce', 'garlic', 'ginger', 'chili', 'cilantro', 'broccoli', 'grapes',
      'fruit', 'fruits', 'vegetable', 'vegetables', 'greens', 'salad', 'palak', 'alu', 'pyaz',
      'leek', 'leeks', 'adrak', 'lahsun', 'gajar', 'kheera', 'nimbu', 'kela', 'seb', 'aam'
    ],
  },
  {
    category: 'Pantry & Staples',
    keywords: [
      'rice', 'pasta', 'spaghetti', 'noodles', 'oil', 'flour', 'atta',
      'sugar', 'honey', 'dal', 'lentils', 'beans', 'chawal', 'chini',
      'tel', 'sarson', 'olive oil', 'cooking oil', 'toor dal', 'moong dal'
    ],
  },
];

/**
 * Categorizes an item name into one of the supermarket aisles.
 */
export function categorizeItem(itemName: string): string {
  if (!itemName || typeof itemName !== 'string') return 'Pantry & Staples';

  const normalized = itemName.toLowerCase().trim();
  const words = normalized.split(/[\s,.-]+/).filter(Boolean);

  // 1. Direct match from Grocery Ontology
  for (const item of GROCERY_ONTOLOGY) {
    if (
      normalized === item.canonicalName.toLowerCase() ||
      item.aliases.some((a) => normalized === a.toLowerCase() || words.includes(a.toLowerCase()))
    ) {
      return item.category;
    }
  }

  // 2. Exact word match in priority categories
  for (const group of PRIORITY_CATEGORIES) {
    for (const kw of group.keywords) {
      if (kw.includes(' ')) {
        if (normalized.includes(kw)) return group.category;
      } else {
        if (words.includes(kw)) return group.category;
      }
    }
  }

  // 3. Substring matching in priority order
  for (const group of PRIORITY_CATEGORIES) {
    for (const kw of group.keywords) {
      if (normalized.includes(kw)) {
        return group.category;
      }
    }
  }

  return 'Pantry & Staples';
}
