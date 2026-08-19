import { ListItem, Suggestion } from '@/types';
import substitutesData from '@/data/substitutes.json';
import seasonalData from '@/data/seasonal.json';
import { categorizeItem } from './categorize';

type SeasonName = 'spring' | 'summer' | 'monsoon' | 'winter' | 'fall';

/**
 * Get current season based on month (Northern Hemisphere / Subcontinent)
 */
export function getCurrentSeason(): SeasonName {
  const month = new Date().getMonth(); // 0 = Jan, 11 = Dec
  if (month === 11 || month === 0 || month === 1) return 'winter'; // Dec, Jan, Feb
  if (month === 2 || month === 3) return 'spring'; // Mar, Apr
  if (month === 4 || month === 5) return 'summer'; // May, Jun
  if (month === 6 || month === 7 || month === 8) return 'monsoon'; // Jul, Aug, Sep
  return 'fall'; // Oct, Nov
}

/**
 * Generates dynamic smart suggestions combining:
 * 1. Product substitutes for items currently in list
 * 2. Seasonal recommendations for the current time of year
 * 3. Repurchase / history recommendations from recent activity
 */
export function generateSmartSuggestions(
  currentItems: ListItem[],
  itemHistory: string[] = []
): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const currentItemNames = new Set(currentItems.map((i) => i.name.toLowerCase().trim()));
  const addedSuggestionItems = new Set<string>();

  // 1. SUBSTITUTE SUGGESTIONS (High value when user adds a common item)
  const substitutesMap = substitutesData as Record<
    string,
    { name: string; reason: string; item: string; category: string }[]
  >;

  for (const listItem of currentItems) {
    const normName = listItem.name.toLowerCase().trim();

    for (const [key, subs] of Object.entries(substitutesMap)) {
      if (normName.includes(key) || key.includes(normName)) {
        for (const sub of subs) {
          const subNorm = sub.name.toLowerCase();
          if (!currentItemNames.has(subNorm) && !addedSuggestionItems.has(subNorm)) {
            suggestions.push({
              id: `sub-${key}-${sub.name.replace(/\s+/g, '-').toLowerCase()}`,
              type: 'substitute',
              title: `Alternative for ${listItem.name}`,
              item: sub.name,
              category: sub.category || categorizeItem(sub.name),
              reason: sub.reason,
              sourceItemId: listItem.id,
              badgeColor: 'amber',
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
    { item: string; category: string; reason: string }[]
  >)[currentSeason] || [];

  for (const s of seasonalCatalog) {
    const sNorm = s.item.toLowerCase();
    if (!currentItemNames.has(sNorm) && !addedSuggestionItems.has(sNorm)) {
      suggestions.push({
        id: `season-${s.item.replace(/\s+/g, '-').toLowerCase()}`,
        type: 'seasonal',
        title: `In Season (${currentSeason.toUpperCase()})`,
        item: s.item,
        category: s.category || categorizeItem(s.item),
        reason: s.reason,
        badgeColor: 'emerald',
      });
      addedSuggestionItems.add(sNorm);
    }
  }

  // 3. REPURCHASE / HISTORY RECOMMENDATIONS
  // Default common staples if user history is young
  const defaultFrequentStaples = [
    { item: 'Farm Fresh Whole Milk', reason: 'You regularly buy milk every few days' },
    { item: 'Farm Fresh Brown Eggs (Pack of 12)', reason: 'Weekly staple recommendation' },
    { item: 'Artisan Whole Wheat Sourdough Bread', reason: 'Frequently purchased breakfast item' },
    { item: 'Organic Robusta Bananas', reason: 'Top healthy fruit staple' },
  ];

  // If we have history of removed/completed items not currently on list:
  const historyStaples = itemHistory.length > 0
    ? itemHistory.map((name) => ({
        item: name,
        reason: `Based on your recent shopping list history`,
      }))
    : defaultFrequentStaples;

  for (const h of historyStaples) {
    const hNorm = h.item.toLowerCase();
    if (!currentItemNames.has(hNorm) && !addedSuggestionItems.has(hNorm)) {
      suggestions.push({
        id: `hist-${h.item.replace(/\s+/g, '-').toLowerCase()}`,
        type: 'history',
        title: 'Frequent Favorite',
        item: h.item,
        category: categorizeItem(h.item),
        reason: h.reason,
        badgeColor: 'sky',
      });
      addedSuggestionItems.add(hNorm);
      if (suggestions.length >= 8) break;
    }
  }

  return suggestions.slice(0, 6); // Keep clean and minimalist
}
