// Higher priority specific product indicators (e.g., "juice", "chips", "sauce", "tea", "coffee")
const PRIORITY_CATEGORIES: { category: string; keywords: string[] }[] = [
  {
    category: 'Beverages',
    keywords: [
      'juice', 'drink', 'beverage', 'tea', 'coffee', 'water', 'soda', 'coke',
      'pepsi', 'smoothie', 'espresso', 'cocoa', 'hot chocolate', 'chai', 'pani'
    ],
  },
  {
    category: 'Bakery & Snacks',
    keywords: [
      'chips', 'crisps', 'bread', 'toast', 'sourdough', 'biscuit', 'biscuits',
      'cookie', 'cookies', 'croissant', 'bagel', 'bun', 'buns', 'snack', 'snacks',
      'oats', 'cereal', 'chocolate', 'chocolates', 'popcorn', 'muffin', 'cake'
    ],
  },
  {
    category: 'Personal Care',
    keywords: [
      'toothpaste', 'toothbrush', 'body wash', 'hand wash', 'soap', 'shampoo',
      'conditioner', 'lotion', 'sunscreen', 'deodorant', 'face wash', 'sanitizer',
      'colgate', 'sensodyne', 'dove', 'dettol'
    ],
  },
  {
    category: 'Household & Cleaning',
    keywords: [
      'detergent', 'dish soap', 'floor cleaner', 'cleaner', 'surf excel', 'tide',
      'vim', 'lizol', 'paper towel', 'trash bag', 'bleach', 'sponge'
    ],
  },
  {
    category: 'Dairy & Eggs',
    keywords: [
      'milk', 'cheese', 'butter', 'ghee', 'yogurt', 'curd', 'egg', 'eggs',
      'paneer', 'cream', 'doodh', 'makhan', 'dahi', 'anda', 'ande',
      'almond milk', 'oat milk', 'soy milk'
    ],
  },
  {
    category: 'Pantry & Staples',
    keywords: [
      'rice', 'pasta', 'spaghetti', 'noodles', 'sauce', 'oil', 'flour', 'atta',
      'sugar', 'salt', 'honey', 'dal', 'lentils', 'beans', 'spices', 'masala',
      'chawal', 'chini', 'namak', 'tel', 'stevia'
    ],
  },
  {
    category: 'Fruits & Vegetables',
    keywords: [
      'apple', 'apples', 'banana', 'bananas', 'orange', 'oranges', 'mango', 'mangoes',
      'watermelon', 'spinach', 'tomato', 'tomatoes', 'potato', 'potatoes', 'onion', 'onions',
      'lemon', 'lemons', 'carrot', 'carrots', 'cucumber', 'berry', 'berries', 'strawberry',
      'avocado', 'lettuce', 'garlic', 'ginger', 'chili', 'cilantro', 'broccoli', 'grapes',
      'fruit', 'fruits', 'vegetable', 'vegetables', 'greens', 'salad', 'palak', 'alu', 'pyaz'
    ],
  },
];

/**
 * Automatically categorize an item name into one of the standard supermarket categories.
 */
export function categorizeItem(itemName: string): string {
  if (!itemName || typeof itemName !== 'string') return 'Pantry & Staples';

  const normalized = itemName.toLowerCase().trim();
  const words = normalized.split(/[\s,.-]+/).filter(Boolean);

  // 1. Exact or multi-word match in priority categories
  for (const group of PRIORITY_CATEGORIES) {
    for (const kw of group.keywords) {
      if (kw.includes(' ')) {
        if (normalized.includes(kw)) return group.category;
      } else {
        if (words.includes(kw)) return group.category;
      }
    }
  }

  // 2. Substring matching in priority order
  for (const group of PRIORITY_CATEGORIES) {
    for (const kw of group.keywords) {
      if (normalized.includes(kw)) {
        return group.category;
      }
    }
  }

  return 'Pantry & Staples';
}
