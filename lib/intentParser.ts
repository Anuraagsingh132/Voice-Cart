import { ParsedIntent, ParsedItemEntity } from '@/types';

const numberWordMap: Record<string, number> = {
  one: 1, a: 1, an: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
  nine: 9, ten: 10, eleven: 11, twelve: 12, dozen: 12, 'half a dozen': 6,
};

/**
 * Phonetic/speech recognition normalizer for grocery terms
 */
function cleanPhoneticMistakes(text: string): string {
  return text
    .replace(/\bbreadth\b/gi, 'bread')
    .replace(/\bbreads\b/gi, 'bread')
    .replace(/\bbred\b/gi, 'bread')
    .replace(/\bmalk\b/gi, 'milk')
    .replace(/\bmelk\b/gi, 'milk')
    .replace(/\bwatar\b/gi, 'water')
    .replace(/\bbanan\b/gi, 'banana');
}

/**
 * Parse a single item clause into item name, quantity, and unit
 */
function parseSingleItemClause(clause: string): ParsedItemEntity | null {
  let clean = clause.trim();
  if (!clean) return null;

  // Clean leading noise words
  clean = clean
    .replace(/^(please\s+)?(i\s+want\s+(?:to\s+(?:buy|get)\s+)?|i\s+need\s+(?:to\s+(?:buy|get)\s+)?|put\s+|add\s+|buy\s+|get\s+|purchase\s+|need\s+|want\s+|bring\s+|jodo\s+|daalo\s+|lao\s+|agregar\s+)+/i, '')
    .replace(/\s+(to|on|into)\s+(my\s+)?(shopping\s+)?(list|cart)$/i, '')
    .trim();

  clean = cleanPhoneticMistakes(clean);

  let quantity = 1;
  let unit = 'pieces';
  let extractedItem = clean;

  // Pattern: "5 eggs", "2 bottles of water", "a loaf of bread", "two packs of chips"
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

  extractedItem = extractedItem.replace(/^(some|any|a|an|the)\s+/i, '').trim();

  if (!extractedItem || extractedItem.length < 2) return null;

  return {
    item: capitalize(extractedItem),
    quantity,
    unit,
  };
}

/**
 * Intelligent client-side heuristic NLP fallback parser.
 * Handles single and compound multi-item commands (e.g. "5 eggs and two breads").
 */
export function parseIntentClientFallback(transcript: string): ParsedIntent {
  const clean = cleanPhoneticMistakes((transcript || '').toLowerCase().trim());

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
  // e.g. "Find toothpaste under $5", "search for organic apples", "find milk", "look for Fresho"
  const searchPattern = /^(find|search|search for|look for|show me|filter|khojo|dhundo|buscar)\s+(.+)$/i;
  const searchMatch = clean.match(searchPattern);
  if (searchMatch) {
    let queryBody = searchMatch[2].trim();

    let priceMax: number | null = null;
    let priceMin: number | null = null;

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
    const brands = ['Fresho', 'Amul', 'Colgate', 'Sensodyne', 'Britannia', 'Dove', 'Dettol', 'Oatly', 'Silk', 'Lays', 'Barilla'];
    for (const b of brands) {
      if (new RegExp(`\\b${b}\\b`, 'i').test(queryBody)) {
        brand = b;
        break;
      }
    }

    const cleanItem = queryBody.replace(/\b(organic|fresh|under|for|me)\b/gi, '').trim() || queryBody;
    const finalItem = cleanItem.replace(/^(me\s+)/i, '').trim();

    return {
      intent: 'SEARCH',
      item: capitalize(finalItem),
      filters: {
        priceMax,
        priceMin,
        brand,
      },
      confidence: 0.85,
      rawQuery: transcript,
      explanation: `Search for ${finalItem} with price/brand filters`,
    };
  }

  // 4. MODIFY INTENT
  // e.g. "Change apples to 3", "make bananas 5", "update milk to 2 liters"
  const modifyPattern = /^(change|update|make|set|modify|badlo)\s*(?:the\s*(?:quantity\s*(?:of)?)?)?\s*(.+?)(?:\s+(?:to|as|into|=)\s+|\s+)(\d+)\s*(.*)$/i;
  const modMatch = clean.match(modifyPattern);
  if (modMatch) {
    const itemRaw = modMatch[2].trim();
    const qty = parseInt(modMatch[3], 10) || 1;
    const unit = modMatch[4]?.trim() || 'pieces';

    return {
      intent: 'MODIFY',
      item: capitalize(itemRaw),
      targetItem: itemRaw,
      quantity: qty,
      unit: unit || 'pieces',
      confidence: 0.9,
      rawQuery: transcript,
      explanation: `Change ${itemRaw} quantity to ${qty} ${unit}`,
    };
  }

  // 5. REMOVE INTENT
  // e.g. "Remove milk from my list", "delete apples", "take off bread"
  const removePattern = /^(remove|delete|take off|drop|cut|hatao|hata do|quitar|eliminar)\s+(.+?)(?:\s+(?:from|off)\s+(?:my\s+)?(?:list|cart))?$/i;
  const removeMatch = clean.match(removePattern);
  if (removeMatch) {
    const itemRaw = removeMatch[2].replace(/\b(from|off|my|the|list)\b/gi, '').trim();
    return {
      intent: 'REMOVE',
      item: capitalize(itemRaw),
      confidence: 0.9,
      rawQuery: transcript,
      explanation: `Remove ${itemRaw} from shopping list`,
    };
  }

  // 6. ADD INTENT & COMPOUND MULTI-ITEM DETECTION
  // e.g. "5 eggs and two breads", "Add milk and 2 apples", "doodh aur bread"
  let addPhrase = clean;
  addPhrase = addPhrase
    .replace(/^(please\s+)?(i\s+want\s+(?:to\s+(?:buy|get)\s+)?|i\s+need\s+(?:to\s+(?:buy|get)\s+)?|put\s+|add\s+|buy\s+|get\s+|purchase\s+|need\s+|want\s+|bring\s+|jodo\s+|daalo\s+|lao\s+|agregar\s+)+/i, '')
    .replace(/\s+(to|on|into)\s+(my\s+)?(shopping\s+)?(list|cart)$/i, '')
    .trim();

  // Split on compound conjunctions: "and", "aur", "plus", ",", "&"
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
    confidence: 0.2,
    rawQuery: transcript,
    explanation: 'Could not detect item name in voice input',
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
