import { ParsedIntent, ParsedItemEntity } from '@/types';
import { resolveGroceryItem, correctTranscriptPhonetics, HOMOPHONE_MAP } from './phoneticMatcher';
import { normalizeText } from './fuzzyMatch';
import { KNOWN_GROCERY_SET } from './groceryOntology';

const numberWordMap: Record<string, number> = {
  one: 1, a: 1, an: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
  nine: 9, ten: 10, eleven: 11, twelve: 12, dozen: 12, 'half a dozen': 6,
};

// Build comprehensive grocery keywords set from Ontology + Staples
const GROCERY_KEYWORDS = new Set<string>([
  'apple', 'apples', 'banana', 'bananas', 'milk', 'eggs', 'egg', 'bread', 'breads',
  'juice', 'water', 'potato', 'potatoes', 'tomato', 'tomatoes', 'onion', 'onions',
  'garlic', 'ginger', 'mango', 'mangoes', 'orange', 'oranges', 'pear', 'pears',
  'lemon', 'lemons', 'lime', 'limes', 'avocado', 'avocados', 'kiwi', 'kiwis',
  'melon', 'watermelon', 'cantaloupe', 'nectarine', 'peach', 'peaches', 'pineapple',
  'plum', 'plums', 'pomegranate', 'grapefruit', 'satsumas', 'sour cream', 'sour milk',
  'yoghurt', 'yogurt', 'oat milk', 'soy milk', 'oatghurt', 'soyghurt', 'asparagus',
  'aubergine', 'cabbage', 'carrots', 'carrot', 'cucumber', 'leek', 'leeks', 'mushroom',
  'mushrooms', 'pepper', 'peppers', 'beet', 'zucchini', 'toothpaste', 'soap', 'doodh',
  'chawal', 'palak', 'anda', 'ande', 'kela', 'pani', 'paani', 'makhan', 'ghee', 'sugar',
  'salt', 'oil', 'tea', 'coffee', 'rice', 'flour', 'cheese', 'butter', 'cookies',
  'chips', 'pasta', 'sauce', 'honey', 'jam', 'shampoo', 'detergent', 'meat', 'chicken',
  'adrak', 'pyaz', 'alu', 'aalu', 'atta', 'dahi', 'paneer', 'namak', 'chini', 'cheeni',
  'dal', 'daal', 'turmeric', 'haldi', 'jeera', 'masala', 'biscuit', 'biscuits'
]);

// Include all items from the grocery ontology
KNOWN_GROCERY_SET.forEach((item) => GROCERY_KEYWORDS.add(item));


const ACTION_KEYWORDS = new Set([
  'add', 'buy', 'need', 'get', 'want', 'put', 'bring', 'remove', 'delete', 'take off',
  'drop', 'cut', 'change', 'update', 'make', 'set', 'modify', 'find', 'search',
  'look for', 'show', 'filter', 'clear', 'empty', 'reset', 'help', 'list', 'cart',
  'jodo', 'daalo', 'hatao', 'dhundo', 'khojo', 'badlo', 'lao', 'agrega', 'buscar',
  'quitar', 'eliminar', 'supprimer', 'ajouter', 'kaufen', 'hinzufügen'
]);

const ITEM_TRANSLATIONS: Record<string, string> = {
  doodh: 'milk', dudh: 'milk', kela: 'bananas', pani: 'water', paani: 'water',
  aalu: 'potatoes', alu: 'potatoes', pyaz: 'onions', piaz: 'onions',
  adrak: 'ginger', lahsun: 'garlic', dahi: 'yogurt', makhan: 'butter',
  atta: 'flour', chawal: 'rice', cheeni: 'sugar', chini: 'sugar', namak: 'salt',
  leche: 'milk', pan: 'bread', manzana: 'apples', manzanas: 'apples', agua: 'water',
  platano: 'bananas', plátano: 'bananas',
  lait: 'milk', pain: 'bread', pomme: 'apples', pommes: 'apples', eau: 'water',
  banane: 'bananas', bananes: 'bananas',
  milch: 'milk', brot: 'bread', apfel: 'apples', äpfel: 'apples', wasser: 'water',
  bananen: 'bananas',
};

function canonicalizeCommand(text: string): string {
  let value = correctTranscriptPhonetics((text || '').toLowerCase().trim());
  value = value
    .replace(/^(.+?)\s+(?:jod|jodo)\s+do$/i, 'add $1')
    .replace(/^(.+?)\s+(?:hata|hatao)\s+do$/i, 'remove $1')
    .replace(/^(.+?)\s+(?:dhund|dhundo|khoj|khojo)\s+do$/i, 'search $1')
    .replace(/^(?:agrega|añade|anade|agregar)\s+/i, 'add ')
    .replace(/^(?:elimina|eliminar|quita|quitar)\s+/i, 'remove ')
    .replace(/^(?:busca|buscar)\s+/i, 'search ')
    .replace(/^(?:ajoute|ajouter)\s+/i, 'add ')
    .replace(/^(?:supprime|supprimer|enleve|enlève)\s+/i, 'remove ')
    .replace(/^(?:cherche|chercher)\s+/i, 'search ')
    .replace(/^(?:füge|fuge)\s+/i, 'add ')
    .replace(/\s+(?:hinzu|hinzufügen|hinzufugen)$/i, '')
    .replace(/^(?:suche|suchen)\s+/i, 'search ')
    .replace(/^(.+?)\s+(?:suche|suchen)$/i, 'search $1');

  value = value.replace(/\b(?:des|du|de|la|le|el|los|las)\b/gi, ' ').replace(/\s+/g, ' ').trim();
  return value.replace(/\b[^\s]+\b/g, (word) => ITEM_TRANSLATIONS[word] || word);
}

const COMMON_CATALOG_BRANDS = [
  'Amul', 'Colgate', 'Tropicana', 'Oatly', 'Alpro', 'Arla', 'Kelloggs',
  'Nestle', 'Dabur', 'Britannia', 'Patanjali', 'Tata', 'Godrej', 'Fortune',
  'Aashirvaad', 'Haldirams', 'Lays', 'Parle', 'Surf Excel', 'Dettol',
  'Cadbury', 'Kissan', 'Maggi', 'Brooke Bond', 'Lipton', 'Bru', 'Nescafe',
  'Coca-Cola', 'Pepsi', 'Sprite', 'Thums Up', 'Real', 'Minute Maid',
  'Saffola', 'Sunfeast', 'Mother Dairy', 'Gowardhan', 'Nivea', 'Dove',
  'Head & Shoulders', 'Oral-B', 'Sensodyne', 'Gillette', 'God Morgon',
  'Valio', 'Garant', 'ICA', 'Fuji', 'Royal Gala', 'Granny Smith'
];

function catalogBrands(): string[] {
  return COMMON_CATALOG_BRANDS;
}


const OBVIOUS_NON_SHOPPING = [
  /^(what|who|where|when|why|how)\s+(is|are|was|were|the|time|weather|you|your|these)/i,
  /^tell\s+me/i,
  /^turn\s+(on|off|up|down)/i,
  /^(hello|hey|hi|good\s+morning|good\s+night|good\s+evening)\b/i,
  /^(thank\s+you|thanks|bye|goodbye|see\s+you|ok\s+bye)\b/i,
  /^(yeah|yes|no|nope|sure|okay|ok)\b/i,
  /^(i\s+want\s+what\s+i\s+talk)/i,
  /^(generate\s+a\s+complete)/i,
];

/**
 * Intelligent filter that distinguishes genuine shopping commands from background residual chatter.
 */
export function isShoppingRelated(text: string): boolean {
  if (!text || text.trim().length < 2) return false;
  const clean = canonicalizeCommand(text);
  const words = clean.split(/[\s,.-]+/).filter(Boolean);

  // 1. Check for explicit rejection patterns
  for (const pattern of OBVIOUS_NON_SHOPPING) {
    if (pattern.test(clean)) return false;
  }

  // 2. Check for action verbs
  for (const word of words) {
    if (ACTION_KEYWORDS.has(word)) return true;
  }

  // 3. Check for multi-word action phrases
  if (/(?:look for|search for|take off|hata do|show me|want to buy|need to get|add to list)/i.test(clean)) {
    return true;
  }

  // 4. Check for known grocery items or ontology match
  for (const word of words) {
    if (GROCERY_KEYWORDS.has(word)) return true;
  }

  const resolution = resolveGroceryItem(clean);
  if (resolution.matched && resolution.confidence >= 0.7) {
    return true;
  }

  // 5. Check for quantity + grocery unit patterns (e.g. "2 bottles", "5 kg", "1 pack")
  if (/\d+\s*(?:bottles?|packs?|kg|liters?|boxes?|cartons?|cans?|loaves|pieces?)/i.test(clean)) {
    return true;
  }

  return false;
}

export function normalizeItemName(name: string): string {
  if (!name) return '';
  let clean = name.trim();

  // Strip leading stray unit words, transliteration fragments, or filler particles
  clean = clean
    .replace(/^(?:some|any|a|an|the|of|kilo|kilos|kg|litres?|liters?|grams?|packs?|bottles?|dozen|pieces?|pcs|loaves|loaf|box|boxes|can|cans|ek|do|ab|aur|bhi|chahiye|de|un|una|des|du|der|die|das)\s+/gi, '')
    .replace(/\s+(?:chahiye|do|daalo|jodo|lao|please|plz)$/gi, '')
    .trim();

  clean = clean
    .replace(/^(?:kilo|kilos|kg|litres?|liters?|grams?|packs?|bottles?|pieces?|pcs|ab|ek|aur)\s+/gi, '')
    .trim();

  const cleanLower = clean.toLowerCase();
  const normalized = normalizeText(cleanLower);

  if (HOMOPHONE_MAP[cleanLower] || HOMOPHONE_MAP[normalized]) {
    return HOMOPHONE_MAP[cleanLower] || HOMOPHONE_MAP[normalized];
  }

  return capitalize(clean);
}

/**
 * Parse a single item clause into item name, quantity, and unit
 */
function parseSingleItemClause(clause: string): ParsedItemEntity | null {
  let clean = clause.trim();
  if (!clean) return null;

  clean = clean
    .replace(/^(please\s+)?(i\s+want\s+(?:to\s+(?:buy|get)\s+)?|i\s+need\s+(?:to\s+(?:buy|get)\s+)?|put\s+|add\s+|buy\s+|get\s+|purchase\s+|need\s+|want\s+|bring\s+|jodo\s+|daalo\s+|lao\s+|agregar\s+)+/i, '')
    .replace(/\s+(to|on|into)\s+(my\s+)?(shopping\s+)?(list|cart)$/i, '')
    .trim();

  clean = correctTranscriptPhonetics(clean);

  let quantity = 1;
  let unit = 'pieces';
  let extractedItem = clean;

  const qtyMatch = clean.match(/^(\d+(?:\.\d+)?|one|a|an|two|three|four|five|six|seven|eight|nine|ten|twelve|dozen)\s+(bottles?|packs?|cartons?|cans?|boxes?|bags?|bunches?|kg|grams?|liters?|pcs?|pieces?|loaves|loaf)?\s*(?:of\s+)?(.+)$/i);

  if (qtyMatch) {
    const qtyStr = qtyMatch[1].toLowerCase();
    const parsedNum = numberWordMap[qtyStr] !== undefined ? numberWordMap[qtyStr] : parseFloat(qtyStr);
    quantity = isNaN(parsedNum) ? 1 : parsedNum;
    unit = qtyMatch[2] ? normalizeUnit(qtyMatch[2]) : 'pieces';
    extractedItem = qtyMatch[3].trim();
  } else {
    const simpleQtyMatch = clean.match(/^(\d+)\s+(.+)$/);
    if (simpleQtyMatch) {
      quantity = parseInt(simpleQtyMatch[1], 10);
      extractedItem = simpleQtyMatch[2].trim();
    }
  }

  const finalName = normalizeItemName(extractedItem);

  if (!finalName || finalName.length < 2) return null;

  return {
    item: finalName,
    quantity,
    unit,
  };
}

/**
 * Intelligent client-side heuristic NLP fallback parser.
 */
export function parseIntentClientFallback(transcript: string): ParsedIntent {
  const clean = canonicalizeCommand(transcript || '');

  // 0. RESIDUAL SPEECH FILTER GATE
  if (!isShoppingRelated(clean)) {
    return {
      intent: 'UNKNOWN',
      confidence: 0,
      rawQuery: transcript,
      explanation: 'Filtered non-shopping background talk',
    };
  }

  // 1. CLEAR LIST INTENT
  if (/^(clear|empty|delete all|remove all|reset)\s*(the|my)?\s*(list|cart|items)?$/i.test(clean)) {
    return {
      intent: 'CLEAR',
      confidence: 0.95,
      rawQuery: transcript,
      explanation: 'Clear entire shopping list',
    };
  }

  // 2. HELP INTENT
  if (/^(help|what can i say|how to use|commands|options)/i.test(clean)) {
    return {
      intent: 'HELP',
      confidence: 0.9,
      rawQuery: transcript,
      explanation: 'Show help and example voice commands',
    };
  }

  // 3. SEARCH & FILTER INTENT
  const searchPattern = /^(find|search|search for|look for|show me|filter|khojo|dhundo|buscar)\s+(.+)$/i;
  const searchMatch = clean.match(searchPattern);
  if (searchMatch) {
    let queryBody = searchMatch[2].trim();

    let priceMax: number | null = null;
    let priceMin: number | null = null;

    const rangeMatch = queryBody.match(/(?:between|from)\s*(?:\$|rs|inr)?\s*(\d+(?:\.\d+)?)\s*(?:and|to|-)\s*(?:\$|rs|inr)?\s*(\d+(?:\.\d+)?)/i);
    if (rangeMatch) {
      priceMin = parseFloat(rangeMatch[1]);
      priceMax = parseFloat(rangeMatch[2]);
      queryBody = queryBody.replace(rangeMatch[0], '').trim();
    }

    const underMatch = queryBody.match(/(?:under|below|less than|cheaper than|upto|up to)\s*(?:\$|rs|inr)?\s*(\d+(?:\.\d+)?)/i);
    if (underMatch) {
      priceMax = parseFloat(underMatch[1]);
      queryBody = queryBody.replace(underMatch[0], '').trim();
    }

    const aboveMatch = queryBody.match(/(?:above|more than|over|greater than)\s*(?:\$|rs|inr)?\s*(\d+(?:\.\d+)?)/i);
    if (aboveMatch) {
      priceMin = parseFloat(aboveMatch[1]);
      queryBody = queryBody.replace(aboveMatch[0], '').trim();
    }

    let brand: string | null = null;
    const brands = catalogBrands();
    for (const b of brands) {
      if (new RegExp(`\\b${b}\\b`, 'i').test(queryBody)) {
        brand = b;
        break;
      }
    }

    const sizeMatch = queryBody.match(/\b(\d+(?:\.\d+)?\s?(?:kg|g|grams?|ml|l|liters?|litres?|oz|lb|pack|packs|pieces?))\b/i);
    const size = sizeMatch ? sizeMatch[1].replace(/\s+/g, '') : null;
    if (sizeMatch) queryBody = queryBody.replace(sizeMatch[0], '').trim();

    const cleanItem = queryBody.replace(/\b(fresh|under|for|me)\b/gi, '').trim() || queryBody;
    const finalItem = normalizeItemName(cleanItem);

    return {
      intent: 'SEARCH',
      item: finalItem,
      filters: {
        priceMax,
        priceMin,
        brand,
        size,
      },
      confidence: 0.85,
      rawQuery: transcript,
      explanation: `Search for ${finalItem} with price/brand filters`,
    };
  }

  // 4. MODIFY INTENT
  const modifyPattern = /^(change|update|make|set|modify|badlo)\s*(?:the\s*(?:quantity\s*(?:of)?)?)?\s*(.+?)(?:\s+(?:to|as|into|=)\s+|\s+)(\d+)\s*(.*)$/i;
  const modMatch = clean.match(modifyPattern);
  if (modMatch) {
    const itemRaw = modMatch[2].trim();
    const resolved = normalizeItemName(itemRaw);
    const qty = parseInt(modMatch[3], 10) || 1;
    const unit = modMatch[4]?.trim() || 'pieces';

    return {
      intent: 'MODIFY',
      item: resolved,
      targetItem: resolved,
      quantity: qty,
      unit: unit || 'pieces',
      confidence: 0.9,
      rawQuery: transcript,
      explanation: `Change ${resolved} quantity to ${qty} ${unit}`,
    };
  }

  // 5. REMOVE INTENT
  const removePattern = /^(remove|delete|take off|drop|cut|hatao|hata do|quitar|eliminar)\s+(.+?)(?:\s+(?:from|off)\s+(?:my\s+)?(?:list|cart))?$/i;
  const removeMatch = clean.match(removePattern);
  if (removeMatch) {
    const itemRaw = removeMatch[2].replace(/\b(from|off|my|the|list)\b/gi, '').trim();
    const resolved = normalizeItemName(itemRaw);
    return {
      intent: 'REMOVE',
      item: resolved,
      confidence: 0.9,
      rawQuery: transcript,
      explanation: `Remove ${resolved} from shopping list`,
    };
  }

  // 6. ADD INTENT & COMPOUND MULTI-ITEM DETECTION
  let addPhrase = clean;
  addPhrase = addPhrase
    .replace(/^(please\s+)?(i\s+want\s+(?:to\s+(?:buy|get)\s+)?|i\s+need\s+(?:to\s+(?:buy|get)\s+)?|put\s+|add\s+|buy\s+|get\s+|purchase\s+|need\s+|want\s+|bring\s+|jodo\s+|daalo\s+|lao\s+|agregar\s+)+/i, '')
    .replace(/\s+(to|on|into)\s+(my\s+)?(shopping\s+)?(list|cart)$/i, '')
    .trim();

  const parts = addPhrase.split(/\s+(?:and|aur|plus|y|\&)\s+|\s*,\s*/i).map(p => p.trim()).filter(Boolean);

  if (parts.length > 1) {
    const parsedItems: ParsedItemEntity[] = [];
    for (const part of parts) {
      const parsed = parseSingleItemClause(part);
      if (parsed) {
        parsedItems.push(parsed);
      }
    }

    if (parsedItems.length > 0) {
      const itemNames = parsedItems.map(p => `${p.quantity && p.quantity > 1 ? `${p.quantity} ` : ''}${p.item}`).join(', ');
      return {
        intent: 'ADD',
        items: parsedItems,
        item: parsedItems.map(p => p.item).join(', '),
        quantity: parsedItems[0].quantity,
        unit: parsedItems[0].unit,
        confidence: 0.9,
        rawQuery: transcript,
        explanation: `Add ${itemNames} to shopping list`,
      };
    }
  }

  // Single item fallback
  const singleParsed = parseSingleItemClause(addPhrase);
  if (singleParsed) {
    return {
      intent: 'ADD',
      items: [singleParsed],
      item: singleParsed.item,
      quantity: singleParsed.quantity,
      unit: singleParsed.unit,
      confidence: 0.85,
      rawQuery: transcript,
      explanation: `Add ${singleParsed.quantity} ${singleParsed.unit} of ${singleParsed.item} to shopping list`,
    };
  }

  return {
    intent: 'UNKNOWN',
    confidence: 0,
    rawQuery: transcript,
    explanation: 'Could not detect valid grocery action',
  };
}

/**
 * Main intent parsing entry point.
 */
export async function parseIntent(
  transcript: string,
  language: string = 'en-US'
): Promise<ParsedIntent> {
  if (!transcript || !transcript.trim()) {
    return {
      intent: 'UNKNOWN',
      confidence: 0,
      rawQuery: '',
      explanation: 'Empty voice transcript',
    };
  }

  // Quick client residual filter check
  if (!isShoppingRelated(transcript)) {
    return {
      intent: 'UNKNOWN',
      confidence: 0,
      rawQuery: transcript,
      explanation: 'Filtered non-shopping background talk',
    };
  }

  try {
    const response = await fetch('/api/parse-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcript, language }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.intent && data.intent !== 'UNKNOWN') {
        return data as ParsedIntent;
      }
    }
  } catch (error) {
    console.warn('Backend Groq API unreachable, utilizing client NLP heuristics:', error);
  }

  return parseIntentClientFallback(transcript);
}

function capitalize(str: string): string {
  if (!str) return '';
  return str
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function normalizeUnit(unit: string): string {
  const u = unit.toLowerCase();
  if (u.startsWith('bottle')) return 'bottles';
  if (u.startsWith('pack')) return 'packs';
  if (u.startsWith('carton')) return 'cartons';
  if (u.startsWith('can')) return 'cans';
  if (u.startsWith('box')) return 'boxes';
  if (u.startsWith('bunch')) return 'bunches';
  if (u.startsWith('bag')) return 'bags';
  if (u.startsWith('loaf') || u.startsWith('loave')) return 'pieces';
  if (u === 'kg' || u === 'kgs') return 'kg';
  if (u.startsWith('gram')) return 'grams';
  if (u.startsWith('liter') || u === 'l') return 'liters';
  return 'pieces';
}
