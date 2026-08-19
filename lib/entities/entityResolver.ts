import { CANONICAL_GROCERY_ONTOLOGY, CanonicalGroceryItem, ONTOLOGY_INDEX } from '@/lib/ontology/groceryOntology';
import { getLocalePhoneticKey } from './localePhonetics';
import { HOMOPHONE_MAP } from '@/lib/phoneticMatcher';
import { levenshteinDistance, normalizeText } from '@/lib/fuzzyMatch';
import { LRUCache } from '@/lib/resilience/lruCache';
import { CanonicalEntity } from '@/types/schema';

const entityResolutionCache = new LRUCache<string, CanonicalEntity>(1000);

const CROSS_LINGUAL_FALLBACK_TRANSLATIONS: Record<string, string> = {
  doodh: 'Milk', dudh: 'Milk', kela: 'Banana', pani: 'Water', paani: 'Water',
  aalu: 'Potato', alu: 'Potato', pyaz: 'Onion', piaz: 'Onion',
  adrak: 'Ginger', lahsun: 'Garlic', dahi: 'Curd / Yogurt', makhan: 'Butter',
  atta: 'Wheat Flour (Atta)', chawal: 'Rice', cheeni: 'Sugar', chini: 'Sugar', namak: 'Salt',
  leche: 'Milk', pan: 'Bread', manzana: 'Apple', manzanas: 'Apple', agua: 'Water',
  platano: 'Banana', plátano: 'Banana',
  lait: 'Milk', pain: 'Bread', pomme: 'Apple', pommes: 'Apple', eau: 'Water',
  banane: 'Banana', bananes: 'Banana',
  milch: 'Milk', brot: 'Bread', apfel: 'Apple', äpfel: 'Apple', wasser: 'Water',
  bananen: 'Banana',
};

export class EntityResolver {
  public resolve(
    rawText: string,
    locale = 'en-US',
    quantity = 1,
    unit = 'pieces',
    brand?: string | null
  ): CanonicalEntity {
    let clean = (rawText || '').trim();
    // Strip conversational preambles, quantifiers & fillers
    clean = clean
      .replace(/^(?:(?:can|could|would|will)\s+you\s+(?:please\s+)?(?:add|put|get|buy|include|bring)?\s*)/i, '')
      .replace(/^(?:please\s+)?(?:i\s+(?:just\s+)?(?:want|need|would\s+like)\s+(?:to\s+(?:buy|get|add|put|include)\s+)?|put\s+|add\s+|buy\s+|get\s+|purchase\s+|need\s+|want\s+|bring\s+|include\s+|jodo\s+|daalo\s+|lao\s+|agrega\s+)+/i, '')
      .replace(/^(?:some|any|the|a|an|a\s+few\s+of|a\s+couple\s+of|a\s+little|a\s+few|of)\s+/i, '')
      .replace(/\s+(?:to|on|into|for)\s+(?:my|the|our)?\s*(?:shopping\s+)?(?:list|cart)$/i, '')
      .replace(/\s+please$/i, '')
      .trim();

    if (!clean) {
      return {
        canonical_id: 'grocery.unknown',
        name: 'Unknown Item',
        raw_name: rawText,
        quantity,
        unit,
        category: 'Pantry & Staples',
        confidence: 0,
      };
    }


    const cacheKey = `${locale}:${clean.toLowerCase()}:${unit}:${quantity}`;
    const cached = entityResolutionCache.get(cacheKey);
    if (cached) {
      return { ...cached, quantity, unit, brand: brand ?? cached.brand };
    }

    const normalized = normalizeText(clean);
    const cleanLower = clean.toLowerCase();

    // 1. Direct Homophone Check
    if (HOMOPHONE_MAP[cleanLower] || HOMOPHONE_MAP[normalized]) {
      const targetName = HOMOPHONE_MAP[cleanLower] || HOMOPHONE_MAP[normalized];
      const match = CANONICAL_GROCERY_ONTOLOGY.find(
        (g) => g.canonical.toLowerCase() === targetName.toLowerCase()
      );
      if (match) {
        const entity: CanonicalEntity = {
          canonical_id: match.id,
          name: match.canonical,
          raw_name: clean,
          quantity,
          unit: unit !== 'pieces' ? unit : match.default_unit,
          category: match.category,
          brand,
          confidence: 0.95,
        };
        entityResolutionCache.set(cacheKey, entity);
        return entity;
      }
    }

    // 2. Exact match in target locale name or direct canonical name
    for (const item of CANONICAL_GROCERY_ONTOLOGY) {
      if (item.canonical.toLowerCase() === cleanLower || normalizeText(item.canonical) === normalized) {
        const entity: CanonicalEntity = {
          canonical_id: item.id,
          name: item.canonical,
          raw_name: clean,
          quantity,
          unit: unit !== 'pieces' ? unit : item.default_unit,
          category: item.category,
          brand,
          confidence: 1.0,
        };
        entityResolutionCache.set(cacheKey, entity);
        return entity;
      }

      if (item.locale_names[locale] && normalizeText(item.locale_names[locale]) === normalized) {
        const entity: CanonicalEntity = {
          canonical_id: item.id,
          name: item.canonical,
          raw_name: clean,
          quantity,
          unit: unit !== 'pieces' ? unit : item.default_unit,
          category: item.category,
          brand,
          confidence: 0.98,
        };
        entityResolutionCache.set(cacheKey, entity);
        return entity;
      }
    }

    // 3. Exact alias match in ontology
    for (const item of CANONICAL_GROCERY_ONTOLOGY) {
      if (item.aliases.some((a) => normalizeText(a) === normalized || a.toLowerCase() === cleanLower)) {
        const entity: CanonicalEntity = {
          canonical_id: item.id,
          name: item.canonical,
          raw_name: clean,
          quantity,
          unit: unit !== 'pieces' ? unit : item.default_unit,
          category: item.category,
          brand,
          confidence: 0.95,
        };
        entityResolutionCache.set(cacheKey, entity);
        return entity;
      }
    }

    // 4. Locale-Aware Phonetic Match
    const queryPhoneticKey = getLocalePhoneticKey(normalized, locale);
    for (const item of CANONICAL_GROCERY_ONTOLOGY) {
      const itemPhoneticKeys = [
        getLocalePhoneticKey(item.canonical, locale),
        ...item.aliases.map((a) => getLocalePhoneticKey(a, locale)),
        ...item.phonetic_markers.map((p) => getLocalePhoneticKey(p, locale)),
      ];

      if (itemPhoneticKeys.includes(queryPhoneticKey)) {
        const entity: CanonicalEntity = {
          canonical_id: item.id,
          name: item.canonical,
          raw_name: clean,
          quantity,
          unit: unit !== 'pieces' ? unit : item.default_unit,
          category: item.category,
          brand,
          confidence: 0.9,
        };
        entityResolutionCache.set(cacheKey, entity);
        return entity;
      }
    }

    // 5. Cross-Lingual Translation (FALLBACK ONLY)
    if (CROSS_LINGUAL_FALLBACK_TRANSLATIONS[normalized] || CROSS_LINGUAL_FALLBACK_TRANSLATIONS[cleanLower]) {
      const translated =
        CROSS_LINGUAL_FALLBACK_TRANSLATIONS[normalized] ||
        CROSS_LINGUAL_FALLBACK_TRANSLATIONS[cleanLower];
      const match = CANONICAL_GROCERY_ONTOLOGY.find(
        (g) => g.canonical.toLowerCase() === translated.toLowerCase()
      );
      if (match) {
        const entity: CanonicalEntity = {
          canonical_id: match.id,
          name: match.canonical,
          raw_name: clean,
          quantity,
          unit: unit !== 'pieces' ? unit : match.default_unit,
          category: match.category,
          brand,
          confidence: 0.88,
        };
        entityResolutionCache.set(cacheKey, entity);
        return entity;
      }
    }

    // 6. Fuzzy Levenshtein Match against ontology
    let bestMatch: CanonicalGroceryItem | null = null;
    let highestScore = 0;

    for (const item of CANONICAL_GROCERY_ONTOLOGY) {
      const candidates = [item.canonical, ...item.aliases];
      for (const cand of candidates) {
        const normCand = normalizeText(cand);
        const maxLen = Math.max(normalized.length, normCand.length);
        if (maxLen === 0) continue;
        const dist = levenshteinDistance(normalized, normCand);
        const score = 1 - dist / maxLen;

        if (score > highestScore && score >= 0.72) {
          highestScore = score;
          bestMatch = item;
        }
      }
    }

    if (bestMatch && highestScore >= 0.72) {
      const entity: CanonicalEntity = {
        canonical_id: bestMatch.id,
        name: bestMatch.canonical,
        raw_name: clean,
        quantity,
        unit: unit !== 'pieces' ? unit : bestMatch.default_unit,
        category: bestMatch.category,
        brand,
        confidence: Math.round(highestScore * 100) / 100,
      };
      entityResolutionCache.set(cacheKey, entity);
      return entity;
    }

    // Fallback: Unknown entity
    const capitalizedName = clean
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');

    const entity: CanonicalEntity = {
      canonical_id: `grocery.custom.${normalized}`,
      name: capitalizedName,
      raw_name: clean,
      quantity,
      unit,
      category: 'Pantry & Staples',
      brand,
      confidence: 0.6,
    };
    return entity;
  }
}

export const entityResolver = new EntityResolver();
