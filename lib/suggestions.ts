import { ListItem, Suggestion } from '@/types';
import substitutesData from '@/data/substitutes.json';
import seasonalData from '@/data/seasonal.json';
import { categorizeItem } from './categorize';

type SeasonName = 'spring' | 'summer' | 'monsoon' | 'winter' | 'fall';

export function getCurrentSeason(): SeasonName {
  const month = new Date().getMonth(); // 0 = Jan, 11 = Dec
  if (month === 11 || month === 0 || month === 1) return 'winter';
  if (month === 2 || month === 3) return 'spring';
  if (month === 4 || month === 5) return 'summer';
  if (month === 6 || month === 7 || month === 8) return 'monsoon';
  return 'fall';
}

const SUGGESTION_META_MAP: Record<string, { image: string; description: string; price?: number; unit?: string }> = {
  'oatly oat milk': { image: '', description: 'Creamy plant-based oat milk', price: 3.49, unit: '1L' },
  'alpro fresh soy milk': { image: '', description: 'High-protein fresh soy milk', price: 2.99, unit: '1L' },
  'arla lactose medium fat milk': { image: '', description: 'Lactose-free dairy milk', price: 2.49, unit: '1L' },
  'oatly natural oatghurt': { image: '', description: 'Plant-based creamy oatghurt', price: 2.89, unit: '500g' },
  'alpro vanilla soyghurt': { image: '', description: 'Vanilla flavored plant-based soyghurt', price: 2.99, unit: '500g' },
  'royal gala': { image: '', description: 'Sweet crisp classic dessert apple', price: 1.99, unit: '1 kg' },
  'granny smith': { image: '', description: 'Crisp green tart baking apple', price: 2.19, unit: '1 kg' },
  'tropicana juice smooth': { image: '', description: '100% pure squeezed smooth orange juice', price: 3.99, unit: '1L' },
  'sweet potato': { image: '', description: 'Antioxidant rich sweet potato', price: 1.79, unit: '1 kg' },
  'red bell pepper': { image: '', description: 'Vitamin C rich sweet red bell pepper', price: 1.49, unit: 'pcs' },
  'yellow bell pepper': { image: '', description: 'Mild sweet yellow bell pepper', price: 1.49, unit: 'pcs' },
  'asparagus': { image: '', description: 'Fresh tender seasonal green asparagus', price: 3.49, unit: '500g' },
  'kiwi': { image: '', description: 'Fresh vitamin-rich green kiwi fruit', price: 0.89, unit: 'pcs' },
  'pineapple': { image: '', description: 'Sweet and juicy fresh tropical pineapple', price: 2.99, unit: 'pcs' },
  'watermelon': { image: '', description: 'Hydrating sweet summer watermelon', price: 4.99, unit: 'whole' },
  'mango': { image: '', description: 'Fragrant sweet tropical mangoes', price: 2.49, unit: 'pcs' },
  'cantaloupe': { image: '', description: 'Sweet aromatic cantaloupe melon', price: 3.29, unit: 'whole' },
  'peach': { image: '', description: 'Juicy summer sun-ripened stone peach', price: 2.29, unit: '500g' },
  'nectarine': { image: '', description: 'Smooth juicy summer nectarine', price: 2.29, unit: '500g' },
  'ginger': { image: '', description: 'Fresh warming organic ginger root', price: 1.19, unit: '250g' },
  'garlic': { image: '', description: 'Aromatic pungent culinary fresh garlic', price: 1.09, unit: 'pack' },
  'leek': { image: '', description: 'Fresh savory green leek stems', price: 1.69, unit: 'bunch' },
  'orange': { image: '', description: 'Sweet juicy vitamin C winter oranges', price: 2.19, unit: '1 kg' },
  'cabbage': { image: '', description: 'Crisp hearty fresh green cabbage head', price: 1.39, unit: 'head' },
};

function findProductMeta(name: string) {
  const lower = name.toLowerCase().trim();
  const direct = SUGGESTION_META_MAP[lower];
  if (direct) return direct;

  for (const [k, meta] of Object.entries(SUGGESTION_META_MAP)) {
    if (k.includes(lower) || lower.includes(k)) {
      return meta;
    }
  }

  return {
    image: '',
    description: '',
    price: undefined,
    unit: undefined,
  };
}




export function generateSmartSuggestions(
  currentItems: ListItem[],
  itemHistory: string[] = []
): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const currentItemNames = new Set(currentItems.map((i) => i.name.toLowerCase().trim()));
  const addedSuggestionItems = new Set<string>();

  // 1. SUBSTITUTE SUGGESTIONS
  const substitutesMap = substitutesData as Record<
    string,
    { name: string; type: string; reason: string }[]
  >;

  for (const listItem of currentItems) {
    const normName = listItem.name.toLowerCase().trim();

    for (const [key, subs] of Object.entries(substitutesMap)) {
      if (normName.includes(key) || key.includes(normName)) {
        for (const sub of subs) {
          const subNorm = sub.name.toLowerCase();
          if (!currentItemNames.has(subNorm) && !addedSuggestionItems.has(subNorm)) {
            const meta = findProductMeta(sub.name);
            suggestions.push({
              id: `sub-${key}-${sub.name.replace(/\s+/g, '-').toLowerCase()}`,
              type: 'substitute',
              title: `Alternative for ${listItem.name}`,
              item: sub.name,
              category: categorizeItem(sub.name),
              reason: sub.reason,
              sourceItemId: listItem.id,
              badgeColor: 'blue',
              image: meta.image,
              description: meta.description,
              price: meta.price,
              unit: meta.unit,
            });
            addedSuggestionItems.add(subNorm);
          }
        }
      }
    }
  }

  // 2. SEASONAL SUGGESTIONS
  const currentSeason = getCurrentSeason();
  const seasonalCatalog = (seasonalData as Record<
    string,
    { name: string; category: string; reason: string }[]
  >)[currentSeason] || [];

  for (const s of seasonalCatalog) {
    const sNorm = s.name.toLowerCase();
    if (!currentItemNames.has(sNorm) && !addedSuggestionItems.has(sNorm)) {
      const meta = findProductMeta(s.name);
      suggestions.push({
        id: `season-${s.name.replace(/\s+/g, '-').toLowerCase()}`,
        type: 'seasonal',
        title: `In Season (${currentSeason.toUpperCase()})`,
        item: s.name,
        category: s.category || categorizeItem(s.name),
        reason: s.reason,
        badgeColor: 'orange',
        image: meta.image,
        description: meta.description,
        price: meta.price,
        unit: meta.unit,
      });
      addedSuggestionItems.add(sNorm);
    }
  }

  // 3. REPURCHASE / HISTORY RECOMMENDATIONS
  const candidates = itemHistory.map(name => ({ name, reason: 'Previously added to your list' }));

  for (const c of candidates) {
    const cNorm = c.name.toLowerCase();
    if (!currentItemNames.has(cNorm) && !addedSuggestionItems.has(cNorm)) {
      const meta = findProductMeta(c.name);
      suggestions.push({
        id: `history-${c.name.replace(/\s+/g, '-').toLowerCase()}`,
        type: 'history',
        title: 'Frequent Favorite',
        item: c.name,
        category: categorizeItem(c.name),
        reason: c.reason,
        badgeColor: 'purple',
        image: meta.image,
        description: meta.description,
        price: meta.price,
        unit: meta.unit,
      });
      addedSuggestionItems.add(cNorm);
    }
  }

  return suggestions.slice(0, 8);
}
