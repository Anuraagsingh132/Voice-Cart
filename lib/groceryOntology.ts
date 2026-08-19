/**
 * Comprehensive Grocery Ontology & Lexical Knowledge Base
 * Covers Global, Indian, Western, Asian, and Mediterranean groceries with
 * multilingual mappings (English, Hindi, Spanish, French, German) and
 * common acoustic speech-to-text homophone corrections.
 */

export interface GroceryItemDefinition {
  canonicalName: string;
  category: string;
  defaultUnit: string;
  aliases: string[];
  phoneticMatches: string[];
}

export const GROCERY_ONTOLOGY: GroceryItemDefinition[] = [
  // Fruits & Vegetables
  {
    canonicalName: 'Leek',
    category: 'Fruits & Vegetables',
    defaultUnit: 'pieces',
    aliases: ['leeks', 'green leek', 'wild leek', 'poireau', 'puerro', 'lauch'],
    phoneticMatches: ['leak', 'leaks', 'leke', 'lique', 'lic'],
  },
  {
    canonicalName: 'Ginger',
    category: 'Fruits & Vegetables',
    defaultUnit: 'pieces',
    aliases: ['adrak', 'fresh ginger', 'ginger root', 'jengibre', 'gingembre', 'ingwer'],
    phoneticMatches: ['adventure', 'adrak', 'adrakh', 'ginjer', 'gingr', 'adreck'],
  },
  {
    canonicalName: 'Garlic',
    category: 'Fruits & Vegetables',
    defaultUnit: 'pieces',
    aliases: ['lahsun', 'garlic cloves', 'garlic bulb', 'ajo', 'ail', 'knoblauch'],
    phoneticMatches: ['lehsun', 'lahsan', 'garlik', 'garlick'],
  },
  {
    canonicalName: 'Onion',
    category: 'Fruits & Vegetables',
    defaultUnit: 'kg',
    aliases: ['onions', 'red onion', 'white onion', 'yellow onion', 'pyaz', 'kanda', 'cebolla', 'oignon', 'zwiebel'],
    phoneticMatches: ['piaz', 'piyaz', 'unions', 'unyon', 'onionz'],
  },
  {
    canonicalName: 'Potato',
    category: 'Fruits & Vegetables',
    defaultUnit: 'kg',
    aliases: ['potatoes', 'russet potato', 'baby potato', 'aalu', 'alu', 'batata', 'patata', 'pomme de terre', 'kartoffel'],
    phoneticMatches: ['aloo', 'allu', 'potatos', 'potatoe', 'potahto'],
  },
  {
    canonicalName: 'Tomato',
    category: 'Fruits & Vegetables',
    defaultUnit: 'kg',
    aliases: ['tomatoes', 'cherry tomatoes', 'roma tomato', 'tamatar', 'tomate'],
    phoneticMatches: ['tamatr', 'tomatos', 'tomatoe', 'tomahto'],
  },
  {
    canonicalName: 'Apple',
    category: 'Fruits & Vegetables',
    defaultUnit: 'pieces',
    aliases: ['apples', 'red apple', 'green apple', 'gala apple', 'fuji apple', 'seb', 'manzana', 'pomme', 'apfel'],
    phoneticMatches: ['aple', 'aples', 'appl', 'saeb'],
  },
  {
    canonicalName: 'Banana',
    category: 'Fruits & Vegetables',
    defaultUnit: 'dozen',
    aliases: ['bananas', 'ripe bananas', 'kela', 'platano', 'plátano', 'banane'],
    phoneticMatches: ['banan', 'bannana', 'kayla', 'kelaa'],
  },
  {
    canonicalName: 'Mango',
    category: 'Fruits & Vegetables',
    defaultUnit: 'pieces',
    aliases: ['mangoes', 'alphonso mango', 'aam', 'mango'],
    phoneticMatches: ['mangos', 'aam', 'mangoo'],
  },
  {
    canonicalName: 'Avocado',
    category: 'Fruits & Vegetables',
    defaultUnit: 'pieces',
    aliases: ['avocados', 'hass avocado', 'aguacate', 'avocat'],
    phoneticMatches: ['avacado', 'avocato', 'advocado', 'avocadoes'],
  },
  {
    canonicalName: 'Spinach',
    category: 'Fruits & Vegetables',
    defaultUnit: 'bunches',
    aliases: ['baby spinach', 'palak', 'espinaca', 'épinards', 'spinat'],
    phoneticMatches: ['paalak', 'spinich', 'spinnach'],
  },
  {
    canonicalName: 'Coriander / Cilantro',
    category: 'Fruits & Vegetables',
    defaultUnit: 'bunches',
    aliases: ['cilantro', 'coriander leaves', 'dhaniya', 'hara dhaniya', 'cilantro fresco', 'coriandre'],
    phoneticMatches: ['dhania', 'dhanya', 'corriander', 'cilentro'],
  },
  {
    canonicalName: 'Carrot',
    category: 'Fruits & Vegetables',
    defaultUnit: 'kg',
    aliases: ['carrots', 'baby carrots', 'gajar', 'zanahoria', 'carotte', 'karotte'],
    phoneticMatches: ['gaajar', 'carot', 'karrot', 'carrets'],
  },
  {
    canonicalName: 'Cucumber',
    category: 'Fruits & Vegetables',
    defaultUnit: 'pieces',
    aliases: ['cucumbers', 'english cucumber', 'kheera', 'pepino', 'concombre', 'gurke'],
    phoneticMatches: ['khira', 'khera', 'cucamber', 'qcucumber'],
  },
  {
    canonicalName: 'Lemon',
    category: 'Fruits & Vegetables',
    defaultUnit: 'pieces',
    aliases: ['lemons', 'nimbu', 'limon', 'limón', 'citron', 'zitrone'],
    phoneticMatches: ['nembu', 'nimboo', 'lemonz'],
  },
  {
    canonicalName: 'Bell Pepper / Capsicum',
    category: 'Fruits & Vegetables',
    defaultUnit: 'pieces',
    aliases: ['capsicum', 'bell pepper', 'green pepper', 'shimla mirch', 'pimiento', 'poivron', 'paprika'],
    phoneticMatches: ['peppers', 'capsicum', 'simla mirch'],
  },

  // Dairy & Eggs
  {
    canonicalName: 'Milk',
    category: 'Dairy & Eggs',
    defaultUnit: 'liters',
    aliases: ['whole milk', 'skim milk', 'toned milk', 'cow milk', 'doodh', 'dudh', 'leche', 'lait', 'milch'],
    phoneticMatches: ['malk', 'melk', 'milck', 'dood', 'dud'],
  },
  {
    canonicalName: 'Eggs',
    category: 'Dairy & Eggs',
    defaultUnit: 'dozen',
    aliases: ['egg', 'brown eggs', 'white eggs', 'free range eggs', 'anda', 'ande', 'huevos', 'oeufs', 'eier'],
    phoneticMatches: ['egs', 'eegs', 'aande', 'undaa', 'undae'],
  },
  {
    canonicalName: 'Butter',
    category: 'Dairy & Eggs',
    defaultUnit: 'packs',
    aliases: ['salted butter', 'unsalted butter', 'amul butter', 'makhan', 'mantequilla', 'beurre'],
    phoneticMatches: ['buttr', 'makkhan', 'maakhan', 'batter'],
  },
  {
    canonicalName: 'Cheese',
    category: 'Dairy & Eggs',
    defaultUnit: 'packs',
    aliases: ['cheddar cheese', 'mozzarella', 'parmesan', 'cheese slices', 'queso', 'fromage', 'käse'],
    phoneticMatches: ['cheez', 'cheeze', 'chiz'],
  },
  {
    canonicalName: 'Paneer (Cottage Cheese)',
    category: 'Dairy & Eggs',
    defaultUnit: 'packs',
    aliases: ['paneer', 'cottage cheese', 'fresh paneer', 'amul paneer'],
    phoneticMatches: ['panir', 'pneer'],
  },
  {
    canonicalName: 'Curd / Yogurt',
    category: 'Dairy & Eggs',
    defaultUnit: 'packs',
    aliases: ['curd', 'yogurt', 'yoghurt', 'greek yogurt', 'dahi', 'dahi cup', 'yogur', 'yaourt', 'joghurt'],
    phoneticMatches: ['dhai', 'dahee', 'yougurt', 'yogart'],
  },
  {
    canonicalName: 'Ghee',
    category: 'Dairy & Eggs',
    defaultUnit: 'bottles',
    aliases: ['clarified butter', 'desi ghee', 'pure ghee', 'cow ghee'],
    phoneticMatches: ['ghi', 'ghey', 'gi'],
  },

  // Pantry & Staples
  {
    canonicalName: 'Cooking Oil',
    category: 'Pantry & Staples',
    defaultUnit: 'liters',
    aliases: ['oil', 'vegetable oil', 'olive oil', 'sunflower oil', 'mustard oil', 'tel', 'sarson ka tel', 'aceite', 'huile', 'öl'],
    phoneticMatches: ['telugu', 'tail', 'tel', 'tael', 'oyle'],
  },
  {
    canonicalName: 'Wheat Flour (Atta)',
    category: 'Pantry & Staples',
    defaultUnit: 'kg',
    aliases: ['atta', 'flour', 'wheat flour', 'chakki atta', 'aashirvaad atta', 'harina', 'farine', 'mehl'],
    phoneticMatches: ['flower', 'flouer', 'aata', 'aatha'],
  },
  {
    canonicalName: 'Rice',
    category: 'Pantry & Staples',
    defaultUnit: 'kg',
    aliases: ['basmati rice', 'brown rice', 'white rice', 'chawal', 'arroz', 'riz', 'reis'],
    phoneticMatches: ['chaawal', 'chaval', 'ryce', 'ris'],
  },
  {
    canonicalName: 'Lentils / Dal',
    category: 'Pantry & Staples',
    defaultUnit: 'kg',
    aliases: ['dal', 'daal', 'toor dal', 'moong dal', 'masoor dal', 'chana dal', 'lentils', 'lentejas', 'lentilles', 'linsen'],
    phoneticMatches: ['dall', 'dhal', 'toll dal', 'tur dal'],
  },
  {
    canonicalName: 'Sugar',
    category: 'Pantry & Staples',
    defaultUnit: 'kg',
    aliases: ['white sugar', 'brown sugar', 'cane sugar', 'cheeni', 'shakkar', 'azúcar', 'sucre', 'zucker'],
    phoneticMatches: ['chini', 'shakar', 'shugar', 'sugr'],
  },
  {
    canonicalName: 'Salt',
    category: 'Pantry & Staples',
    defaultUnit: 'packs',
    aliases: ['table salt', 'sea salt', 'rock salt', 'namak', 'tata salt', 'sal', 'sel', 'salz'],
    phoneticMatches: ['namaak', 'solt', 'saalt'],
  },
  {
    canonicalName: 'Pasta',
    category: 'Pantry & Staples',
    defaultUnit: 'packs',
    aliases: ['spaghetti', 'penne', 'macaroni', 'fusilli', 'noodles', 'maggie', 'maggi'],
    phoneticMatches: ['pastaa', 'nodles', 'noodle', 'maggy'],
  },

  // Bakery & Snacks
  {
    canonicalName: 'Bread',
    category: 'Bakery & Snacks',
    defaultUnit: 'packs',
    aliases: ['white bread', 'brown bread', 'whole wheat bread', 'multigrain bread', 'pav', 'pan', 'pain', 'brot'],
    phoneticMatches: ['breadth', 'bred', 'breat', 'bredd', 'paav'],
  },
  {
    canonicalName: 'Biscuits / Cookies',
    category: 'Bakery & Snacks',
    defaultUnit: 'packs',
    aliases: ['cookies', 'biscuit', 'biscuits', 'parle-g', 'marie gold', 'oreo', 'galletas', 'kekse'],
    phoneticMatches: ['biskit', 'biscits', 'cookis', 'cookey'],
  },
  {
    canonicalName: 'Potato Chips',
    category: 'Bakery & Snacks',
    defaultUnit: 'packs',
    aliases: ['chips', 'crisps', 'lays', 'kurkure', 'nachos', 'patatas fritas'],
    phoneticMatches: ['chipz', 'cheeps', 'chpis'],
  },
  {
    canonicalName: 'Oats / Cereal',
    category: 'Bakery & Snacks',
    defaultUnit: 'packs',
    aliases: ['oats', 'rolled oats', 'quaker oats', 'corn flakes', 'cereals', 'cereal', 'muesli'],
    phoneticMatches: ['serial', 'cerial', 'ots', 'oat'],
  },

  // Beverages
  {
    canonicalName: 'Tea / Chai',
    category: 'Beverages',
    defaultUnit: 'packs',
    aliases: ['tea', 'black tea', 'green tea', 'chai', 'chai patti', 'tata tea', 'té', 'thé', 'tee'],
    phoneticMatches: ['chay', 'chaai', 'tea bags', 'te'],
  },
  {
    canonicalName: 'Coffee',
    category: 'Beverages',
    defaultUnit: 'packs',
    aliases: ['instant coffee', 'nescafe', 'bru coffee', 'espresso', 'café', 'kaffee'],
    phoneticMatches: ['koffee', 'caffee', 'kafi'],
  },
  {
    canonicalName: 'Water',
    category: 'Beverages',
    defaultUnit: 'bottles',
    aliases: ['mineral water', 'bottled water', 'sparkling water', 'pani', 'paani', 'agua', 'eau', 'wasser'],
    phoneticMatches: ['watar', 'watter', 'paani', 'paney'],
  },
  {
    canonicalName: 'Fruit Juice',
    category: 'Beverages',
    defaultUnit: 'bottles',
    aliases: ['juice', 'orange juice', 'apple juice', 'mango juice', 'real juice', 'tropicana', 'zumo', 'jus', 'saft'],
    phoneticMatches: ['jooce', 'juce', 'joose'],
  },

  // Personal Care
  {
    canonicalName: 'Toothpaste',
    category: 'Personal Care',
    defaultUnit: 'packs',
    aliases: ['colgate', 'sensodyne', 'close up', 'pepsodent', 'dentífrico', 'dentifrice', 'zahnpasta'],
    phoneticMatches: ['tooth paste', 'tutpaste', 'toothpast'],
  },
  {
    canonicalName: 'Bath Soap',
    category: 'Personal Care',
    defaultUnit: 'packs',
    aliases: ['soap', 'body soap', 'dove soap', 'dettol soap', 'lux', 'jabón', 'savon', 'seife'],
    phoneticMatches: ['sope', 'sop', 'sabun', 'saabun'],
  },
  {
    canonicalName: 'Shampoo',
    category: 'Personal Care',
    defaultUnit: 'bottles',
    aliases: ['hair shampoo', 'head and shoulders', 'dove shampoo', 'pantene', 'champú'],
    phoneticMatches: ['shampu', 'shampooo', 'shampoe'],
  },

  // Household & Cleaning
  {
    canonicalName: 'Laundry Detergent',
    category: 'Household & Cleaning',
    defaultUnit: 'packs',
    aliases: ['detergent', 'washing powder', 'surf excel', 'tide', 'ariel', 'detergente', 'lessive', 'waschmittel'],
    phoneticMatches: ['detrgent', 'surf', 'washing powder'],
  },
  {
    canonicalName: 'Dishwashing Liquid',
    category: 'Household & Cleaning',
    defaultUnit: 'bottles',
    aliases: ['dish soap', 'dishwash gel', 'vim gel', 'pronto', 'lavavajillas', 'spülmittel'],
    phoneticMatches: ['dishwash', 'dish wash', 'vim'],
  },
];

/**
 * Quick lookup set of known grocery terms for instant validation
 */
export const KNOWN_GROCERY_SET = new Set<string>();

GROCERY_ONTOLOGY.forEach((item) => {
  KNOWN_GROCERY_SET.add(item.canonicalName.toLowerCase());
  item.aliases.forEach((a) => KNOWN_GROCERY_SET.add(a.toLowerCase()));
  item.phoneticMatches.forEach((p) => KNOWN_GROCERY_SET.add(p.toLowerCase()));
});
