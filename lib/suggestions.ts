import { ListItem, Suggestion } from '@/types';
import substitutesData from '@/data/substitutes.json';
import seasonalData from '@/data/seasonal.json';
import productsData from '@/data/products.json';
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

function findProductMeta(name: string) {
  const p = (productsData as any[]).find(
    (item) => item.name.toLowerCase() === name.toLowerCase() ||
             item.name.toLowerCase().includes(name.toLowerCase()) ||
             name.toLowerCase().includes(item.name.toLowerCase())
  );
  return {
    image: p?.image || '',
    description: p?.description || '',
    price: p?.price,
    unit: p?.unit,
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
