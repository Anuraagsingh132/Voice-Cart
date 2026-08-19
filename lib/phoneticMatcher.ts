import { GROCERY_ONTOLOGY, GroceryItemDefinition } from './groceryOntology';
import { levenshteinDistance, normalizeText } from './fuzzyMatch';

/**
 * Soundex algorithm for acoustic phonetic encoding
 */
export function soundex(str: string): string {
  if (!str) return '';
  const s = str.toUpperCase().replace(/[^A-Z]/g, '');
  if (!s) return '';

  const firstChar = s[0];
  const mappings: Record<string, string> = {
    B: '1', F: '1', P: '1', V: '1',
    C: '2', G: '2', J: '2', K: '2', Q: '2', S: '2', X: '2', Z: '2',
    D: '3', T: '3',
    L: '4',
    M: '5', N: '5',
    R: '6',
  };

  let result = firstChar;
  let prevCode = mappings[firstChar] || '0';

  for (let i = 1; i < s.length; i++) {
    const char = s[i];
    const code = mappings[char] || '0';

    if (code !== '0' && code !== prevCode) {
      result += code;
    }
    prevCode = code;
    if (result.length === 4) break;
  }

  return result.padEnd(4, '0');
}

/**
 * Known homophones and speech recognition acoustic misclassifications.
 */
export const HOMOPHONE_MAP: Record<string, string> = {
  leak: 'Leek',
  leaks: 'Leek',
  adventure: 'Ginger',
  advent: 'Ginger',
  telugu: 'Cooking Oil',
  tail: 'Cooking Oil',
  flower: 'Wheat Flour (Atta)',
  serial: 'Oats / Cereal',
  bury: 'Berries',
  meet: 'Meat',
  peace: 'Peas',
  beat: 'Beetroot',
  chilly: 'Chili',
  chilli: 'Chili',
  cheep: 'Chips',
  cheeps: 'Chips',
  breads: 'Bread',
  breadth: 'Bread',
  x: 'Eggs',
  ex: 'Eggs',
  eg: 'Eggs',
  egg: 'Eggs',

  bred: 'Bread',
};


/**
 * Resolves a word or short phrase against the grocery ontology using:
 * 1. Direct homophone map
 * 2. Exact alias/canonical match
 * 3. Exact word boundary match
 * 4. Soundex + Levenshtein distance
 */
export function resolveGroceryItem(query: string): {
  matched: boolean;
  item?: GroceryItemDefinition;
  resolvedName: string;
  confidence: number;
} {
  if (!query || !query.trim()) {
    return { matched: false, resolvedName: query, confidence: 0 };
  }

  const clean = query.trim().toLowerCase();
  const normalized = normalizeText(clean);

  // 1. Direct homophone map
  if (HOMOPHONE_MAP[clean] || HOMOPHONE_MAP[normalized]) {
    const targetName = HOMOPHONE_MAP[clean] || HOMOPHONE_MAP[normalized];
    const itemDef = GROCERY_ONTOLOGY.find(
      (g) => g.canonicalName.toLowerCase() === targetName.toLowerCase()
    );
    return {
      matched: true,
      item: itemDef,
      resolvedName: itemDef ? itemDef.canonicalName : targetName,
      confidence: 0.95,
    };
  }

  // 2. Exact match in canonical names or aliases or phonetic matches
  for (const item of GROCERY_ONTOLOGY) {
    if (normalizeText(item.canonicalName) === normalized || item.canonicalName.toLowerCase() === clean) {
      return { matched: true, item, resolvedName: item.canonicalName, confidence: 1.0 };
    }
    for (const alias of item.aliases) {
      if (normalizeText(alias) === normalized || alias.toLowerCase() === clean) {
        return { matched: true, item, resolvedName: item.canonicalName, confidence: 0.98 };
      }
    }
    for (const phonetic of item.phoneticMatches) {
      if (normalizeText(phonetic) === normalized || phonetic.toLowerCase() === clean) {
        return { matched: true, item, resolvedName: item.canonicalName, confidence: 0.92 };
      }
    }
  }

  // 3. Exact word boundary match in canonical names or aliases
  for (const item of GROCERY_ONTOLOGY) {
    const normCanonical = normalizeText(item.canonicalName);
    const words = normCanonical.split(/\s+/);
    if (words.includes(normalized)) {
      return { matched: true, item, resolvedName: item.canonicalName, confidence: 0.9 };
    }
    for (const alias of item.aliases) {
      const aliasWords = normalizeText(alias).split(/\s+/);
      if (aliasWords.includes(normalized)) {
        return { matched: true, item, resolvedName: item.canonicalName, confidence: 0.88 };
      }
    }
  }

  // 4. Soundex + Levenshtein similarity search
  const querySoundex = soundex(normalized);
  let bestCandidate: GroceryItemDefinition | null = null;
  let bestScore = 0;

  for (const item of GROCERY_ONTOLOGY) {
    const candidatesToScore = [item.canonicalName, ...item.aliases, ...item.phoneticMatches];
    for (const candidate of candidatesToScore) {
      const normCand = normalizeText(candidate);
      const candSoundex = soundex(normCand);

      const maxLen = Math.max(normalized.length, normCand.length);
      if (maxLen === 0) continue;
      const distance = levenshteinDistance(normalized, normCand);
      const levScore = 1 - distance / maxLen;

      let score = levScore;
      if (querySoundex === candSoundex) {
        score = Math.min(1.0, score + 0.2);
      }

      if (score > bestScore && score >= 0.7) {
        bestScore = score;
        bestCandidate = item;
      }
    }
  }

  if (bestCandidate && bestScore >= 0.7) {
    return {
      matched: true,
      item: bestCandidate,
      resolvedName: bestCandidate.canonicalName,
      confidence: bestScore,
    };
  }

  return {
    matched: false,
    resolvedName: query,
    confidence: 0,
  };
}

/**
 * Pre-cleans transcript with known phonetic speech mistakes before intent parsing
 */
export function correctTranscriptPhonetics(transcript: string): string {
  if (!transcript) return '';
  let text = transcript;

  // Replace multi-word homophones first
  text = text.replace(/\btooth paste\b/gi, 'toothpaste');
  text = text.replace(/\bdish wash\b/gi, 'dish soap');
  text = text.replace(/\bwashing powder\b/gi, 'detergent');

  // Replace single word homophones
  const words = text.split(/\s+/);
  const correctedWords = words.map((w) => {
    const cleanWord = normalizeText(w);
    if (HOMOPHONE_MAP[cleanWord]) {
      return HOMOPHONE_MAP[cleanWord];
    }
    return w;
  });

  return correctedWords.join(' ');
}
