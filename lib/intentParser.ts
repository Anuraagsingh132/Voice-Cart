import { ParsedIntent } from '@/types';

/**
 * Intelligent client-side heuristic NLP fallback parser.
 * Handles English and multilingual commands if API is unavailable or unconfigured.
 */
export function parseIntentClientFallback(transcript: string): ParsedIntent {
  const clean = (transcript || '').toLowerCase().trim();

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

    // Extract price ceiling (e.g. "under $5", "below 5", "less than 10 dollars", "under 5")
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

    // Extract brand if common
    let brand: string | null = null;
    const brands = ['Fresho', 'Amul', 'Colgate', 'Sensodyne', 'Britannia', 'Dove', 'Dettol', 'Oatly', 'Silk', 'Lays', 'Barilla'];
    for (const b of brands) {
      if (new RegExp(`\\b${b}\\b`, 'i').test(queryBody)) {
        brand = b;
        break;
      }
    }

    // Clean query text
    const cleanItem = queryBody.replace(/\b(organic|fresh|under|for|me)\b/gi, '').trim() || queryBody;

    return {
      intent: 'SEARCH',
      item: cleanItem.replace(/^(me\s+)/i, '').trim(),
      filters: {
        priceMax,
        priceMin,
        brand,
      },
      confidence: 0.85,
      rawQuery: transcript,
      explanation: `Search for ${cleanItem} with price/brand filters`,
    };
  }

  // 4. MODIFY INTENT
  // e.g. "Change apples to 3", "make bananas 5", "update milk to 2", "change quantity of eggs to 12"
  const modifyPattern = /^(change|update|make|set|modify|badlo)\s*(the\s*(?:quantity\s*(?:of)?)?)?\s*(.+?)\s*(?:to|as|into|=)\s*(\d+)\s*(.*)$/i;
  const modMatch = clean.match(modifyPattern);
  if (modMatch) {
    const itemRaw = modMatch[3].trim();
    const qty = parseInt(modMatch[4], 10) || 1;
    const unit = modMatch[5]?.trim() || 'pieces';

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
  // e.g. "Remove milk from my list", "delete apples", "take off bread", "hata do doodh"
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

  // 6. ADD INTENT (Default action for varied shopping phrases)
  // e.g. "Add milk", "I need apples", "I want to buy bananas", "Buy 5 oranges", "Add 2 bottles of water", "doodh jod do"
  let phrase = clean;

  // Strip prefix noise like "I want to buy", "I need to get", "please add", "add", "buy", "put"
  phrase = phrase
    .replace(/^(please\s+)?(add|buy|get|purchase|put|need|want|i\s+need\s+(?:to\s+buy\s+)?|i\s+want\s+(?:to\s+buy\s+)?|bring|jodo|daalo|lao|agregar)\s+/i, '')
    .replace(/\s+(to|on|into)\s+(my\s+)?(shopping\s+)?(list|cart)$/i, '')
    .trim();

  // Extract quantity & unit: e.g. "2 bottles of water", "5 oranges", "1 kg apples"
  let quantity = 1;
  let unit = 'pieces';
  let extractedItem = phrase;

  const numberWordMap: Record<string, number> = {
    one: 1, a: 1, an: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
    nine: 9, ten: 10, eleven: 11, twelve: 12, dozen: 12, 'half a dozen': 6,
  };

  // Check for leading numeric or word quantity
  const qtyMatch = phrase.match(/^(\d+(?:\.\d+)?|one|a|an|two|three|four|five|six|seven|eight|nine|ten|twelve|dozen)\s+(bottles?|packs?|cartons?|cans?|boxes?|bags?|bunches?|kg|grams?|liters?|pcs?|pieces?)?\s*(?:of\s+)?(.+)$/i);

  if (qtyMatch) {
    const qtyStr = qtyMatch[1].toLowerCase();
    const parsedNum = numberWordMap[qtyStr] !== undefined ? numberWordMap[qtyStr] : parseFloat(qtyStr);
    quantity = isNaN(parsedNum) ? 1 : parsedNum;
    unit = qtyMatch[2] ? normalizeUnit(qtyMatch[2]) : 'pieces';
    extractedItem = qtyMatch[3].trim();
  } else {
    // Check if starts with just a number: "5 oranges"
    const simpleQtyMatch = phrase.match(/^(\d+)\s+(.+)$/);
    if (simpleQtyMatch) {
      quantity = parseInt(simpleQtyMatch[1], 10);
      extractedItem = simpleQtyMatch[2].trim();
    }
  }

  // Final cleanup of item name
  extractedItem = extractedItem.replace(/^(some|any|a|an)\s+/i, '').trim();

  if (!extractedItem || extractedItem.length < 2) {
    return {
      intent: 'UNKNOWN',
      confidence: 0.2,
      rawQuery: transcript,
      explanation: 'Could not detect item name in voice input',
    };
  }

  return {
    intent: 'ADD',
    item: capitalize(extractedItem),
    quantity,
    unit,
    confidence: 0.85,
    rawQuery: transcript,
    explanation: `Add ${quantity} ${unit} of ${capitalize(extractedItem)} to shopping list`,
  };
}

/**
 * Main intent parsing entry point.
 * Calls Groq backend API route, falling back to client-side heuristics seamlessly.
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
      // If Groq returned not-configured or unknown, use heuristic fallback
    }
  } catch (error) {
    console.warn('Backend Groq API unreachable, utilizing client NLP heuristics:', error);
  }

  // Fallback to client-side regex + heuristic NLP
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
  if (u === 'kg' || u === 'kgs') return 'kg';
  if (u.startsWith('gram')) return 'grams';
  if (u.startsWith('liter') || u === 'l') return 'liters';
  return 'pieces';
}
