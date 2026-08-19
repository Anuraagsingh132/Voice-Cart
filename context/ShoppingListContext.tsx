'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ListItem, ParsedIntent, Product, Suggestion } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { categorizeItem } from '@/lib/categorize';
import { findBestMatch } from '@/lib/fuzzyMatch';
import { generateSmartSuggestions } from '@/lib/suggestions';
import { searchProducts } from '@/lib/search';

interface SearchResultState {
  isActive: boolean;
  query: string;
  filters?: {
    brand?: string | null;
    priceMax?: number | null;
    priceMin?: number | null;
    size?: string | null;
  };
  results: Product[];
  totalMatches: number;
}

interface ShoppingListContextType {
  items: ListItem[];
  history: string[];
  suggestions: Suggestion[];
  searchState: SearchResultState;
  dismissedSuggestions: string[];
  addItem: (name: string, quantity?: number, unit?: string, brand?: string) => { success: boolean; item: ListItem; isNew: boolean };
  removeItem: (query: string) => { success: boolean; removedName?: string; message?: string };
  modifyItem: (query: string, newQty: number, newUnit?: string) => { success: boolean; modifiedItem?: ListItem; message?: string };
  toggleCheckItem: (id: string) => void;
  deleteItemById: (id: string) => void;
  clearList: () => void;
  acceptSuggestion: (suggestion: Suggestion) => void;
  dismissSuggestion: (id: string) => void;
  executeSearch: (query: string, filters?: { brand?: string | null; priceMax?: number | null; priceMin?: number | null; size?: string | null }) => void;
  clearSearch: () => void;
  processParsedIntent: (intent: ParsedIntent) => { success: boolean; message: string; type: string };
}

const ShoppingListContext = createContext<ShoppingListContextType | undefined>(undefined);

export function ShoppingListProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useLocalStorage<ListItem[]>('shopping_list_items', []);
  const [history, setHistory] = useLocalStorage<string[]>('shopping_list_history', []);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);
  const [searchState, setSearchState] = useState<SearchResultState>({
    isActive: false,
    query: '',
    results: [],
    totalMatches: 0,
  });

  // Track shopping history whenever an item is added
  const recordHistory = useCallback(
    (name: string) => {
      const clean = name.trim();
      setHistory((prev) => {
        const filtered = prev.filter((h) => h.toLowerCase() !== clean.toLowerCase());
        return [clean, ...filtered].slice(0, 20); // Keep last 20
      });
    },
    [setHistory]
  );

  // 1. ADD ITEM
  const addItem = useCallback(
    (name: string, quantity = 1, unit = 'pieces', brand?: string) => {
      if (!name || !name.trim()) {
        return { success: false, item: {} as ListItem, isNew: false };
      }

      const cleanName = name.trim();
      const category = categorizeItem(cleanName);

      // Check if item already exists in list (fuzzy matching)
      const existingMatch = findBestMatch(cleanName, items, (i) => i.name, 0.75);

      if (existingMatch) {
        // Increment quantity of existing item
        const updatedItems = items.map((item) => {
          if (item.id === existingMatch.item.id) {
            const updatedQty = item.quantity + (quantity || 1);
            return {
              ...item,
              quantity: updatedQty,
              unit: unit && unit !== 'pieces' ? unit : item.unit,
              checked: false, // uncheck if re-added
            };
          }
          return item;
        });

        setItems(updatedItems);
        recordHistory(existingMatch.item.name);
        return {
          success: true,
          item: {
            ...existingMatch.item,
            quantity: existingMatch.item.quantity + (quantity || 1),
          },
          isNew: false,
        };
      }

      // Add as new item
      const newItem: ListItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: cleanName,
        quantity: Math.max(1, quantity),
        unit: unit || 'pieces',
        category,
        checked: false,
        addedAt: Date.now(),
        brand,
      };

      setItems((prev) => [newItem, ...prev]);
      recordHistory(cleanName);
      return { success: true, item: newItem, isNew: true };
    },
    [items, setItems, recordHistory]
  );

  // 2. REMOVE ITEM (by name / voice query)
  const removeItem = useCallback(
    (query: string) => {
      if (!query || !query.trim() || items.length === 0) {
        return { success: false, message: 'No items on your list to remove' };
      }

      const match = findBestMatch(query, items, (i) => i.name, 0.5);

      if (!match) {
        return {
          success: false,
          message: `"${query}" was not found on your shopping list.`,
        };
      }

      setItems((prev) => prev.filter((i) => i.id !== match.item.id));
      return {
        success: true,
        removedName: match.item.name,
        message: `Removed ${match.item.name} from your list.`,
      };
    },
    [items, setItems]
  );

  // 3. MODIFY ITEM (by name / voice query)
  const modifyItem = useCallback(
    (query: string, newQty: number, newUnit?: string) => {
      if (!query || !query.trim() || items.length === 0) {
        return { success: false, message: 'Shopping list is empty' };
      }

      const match = findBestMatch(query, items, (i) => i.name, 0.5);

      if (!match) {
        return {
          success: false,
          message: `Could not find "${query}" to update on your list.`,
        };
      }

      const safeQty = Math.max(1, newQty);
      const updated = {
        ...match.item,
        quantity: safeQty,
        unit: newUnit && newUnit !== 'pieces' ? newUnit : match.item.unit,
      };

      setItems((prev) => prev.map((i) => (i.id === match.item.id ? updated : i)));
      return {
        success: true,
        modifiedItem: updated,
        message: `Updated ${match.item.name} to ${safeQty} ${updated.unit}.`,
      };
    },
    [items, setItems]
  );

  // 4. TOGGLE CHECK ITEM
  const toggleCheckItem = useCallback(
    (id: string) => {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
      );
    },
    [setItems]
  );

  // 5. DELETE ITEM BY ID
  const deleteItemById = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((i) => i.id !== id));
    },
    [setItems]
  );

  // 6. CLEAR LIST
  const clearList = useCallback(() => {
    setItems([]);
  }, [setItems]);

  // 7. ACCEPT SUGGESTION (Opt-in add)
  const acceptSuggestion = useCallback(
    (suggestion: Suggestion) => {
      addItem(suggestion.item, 1, suggestion.unit || 'pieces');
      setDismissedSuggestions((prev) => [...prev, suggestion.id]);
    },
    [addItem]
  );

  // 8. DISMISS SUGGESTION
  const dismissSuggestion = useCallback((id: string) => {
    setDismissedSuggestions((prev) => [...prev, id]);
  }, []);

  // 9. SEARCH CATALOG
  const executeSearch = useCallback(
    (
      query: string,
      filters?: {
        brand?: string | null;
        priceMax?: number | null;
        priceMin?: number | null;
        size?: string | null;
      }
    ) => {
      const searchRes = searchProducts(query, {
        brand: filters?.brand ?? undefined,
        priceMax: filters?.priceMax ?? undefined,
        priceMin: filters?.priceMin ?? undefined,
        size: filters?.size ?? undefined,
      });

      setSearchState({
        isActive: true,
        query,
        filters,
        results: searchRes.results,
        totalMatches: searchRes.totalMatches,
      });
    },
    []
  );

  const clearSearch = useCallback(() => {
    setSearchState({
      isActive: false,
      query: '',
      results: [],
      totalMatches: 0,
    });
  }, []);

  // 10. DYNAMIC SUGGESTIONS COMPUTATION
  const suggestions = useMemo(() => {
    const rawSuggestions = generateSmartSuggestions(items, history);
    return rawSuggestions.filter((s) => !dismissedSuggestions.includes(s.id));
  }, [items, history, dismissedSuggestions]);

  // 11. PROCESS PARSED INTENT (Unified Voice Action Router)
  const processParsedIntent = useCallback(
    (parsed: ParsedIntent): { success: boolean; message: string; type: string } => {
      switch (parsed.intent) {
        case 'ADD': {
          const itemsToAdd =
            parsed.items && parsed.items.length > 0
              ? parsed.items
              : parsed.item
              ? [
                  {
                    item: parsed.item,
                    quantity: parsed.quantity || 1,
                    unit: parsed.unit || 'pieces',
                    brand: parsed.filters?.brand || undefined,
                  },
                ]
              : [];

          if (itemsToAdd.length === 0) {
            return {
              success: false,
              message: 'Could not identify item name to add.',
              type: 'error',
            };
          }

          const addedSummaries: string[] = [];
          for (const it of itemsToAdd) {
            const result = addItem(
              it.item,
              it.quantity || 1,
              it.unit || 'pieces',
              it.brand || undefined
            );
            addedSummaries.push(
              `${result.item.quantity} ${result.item.unit !== 'pieces' ? `${result.item.unit} ` : ''}${result.item.name}`
            );
          }

          const feedbackMsg =
            itemsToAdd.length === 1
              ? `Added ${addedSummaries[0]}`
              : `Added ${addedSummaries.join(' and ')}`;

          return { success: true, message: feedbackMsg, type: 'success' };
        }

        case 'REMOVE': {
          const itemsToRemove =
            parsed.items && parsed.items.length > 0
              ? parsed.items.map((i) => i.item)
              : parsed.item
              ? [parsed.item]
              : [];

          if (itemsToRemove.length === 0) {
            return {
              success: false,
              message: 'Please specify which item to remove.',
              type: 'error',
            };
          }

          const msgs: string[] = [];
          let anySuccess = false;
          for (const it of itemsToRemove) {
            const result = removeItem(it);
            if (result.message) msgs.push(result.message);
            if (result.success) anySuccess = true;
          }

          return {
            success: anySuccess,
            message: msgs.join('. '),
            type: anySuccess ? 'success' : 'warning',
          };
        }

        case 'MODIFY': {
          const target = parsed.targetItem || parsed.item;
          if (!target) {
            return {
              success: false,
              message: 'Please specify which item to update.',
              type: 'error',
            };
          }
          const result = modifyItem(target, parsed.quantity || 1, parsed.unit || 'pieces');
          return {
            success: result.success,
            message: result.message || `Updated ${target}`,
            type: result.success ? 'success' : 'warning',
          };
        }

        case 'SEARCH': {
          const query = parsed.item || parsed.rawQuery || '';
          executeSearch(query, parsed.filters);
          const priceCeiling = parsed.filters?.priceMax ? ` under $${parsed.filters.priceMax}` : '';
          const brandText = parsed.filters?.brand ? ` by ${parsed.filters.brand}` : '';
          return {
            success: true,
            message: `Searching for "${query}"${brandText}${priceCeiling}...`,
            type: 'search',
          };
        }

        case 'CLEAR': {
          clearList();
          return { success: true, message: 'Cleared your entire shopping list.', type: 'info' };
        }

        case 'HELP': {
          return {
            success: true,
            message: 'Try saying: "Add milk", "2 bottles of water", "Change apples to 5", "Find toothpaste under $5", or "Remove eggs"',
            type: 'info',
          };
        }

        default: {
          return {
            success: false,
            message: `I didn't quite catch that. Try saying "Add [item]" or "Find [product]".`,
            type: 'error',
          };
        }
      }
    },
    [addItem, removeItem, modifyItem, executeSearch, clearList]
  );

  const contextValue = useMemo(
    () => ({
      items,
      history,
      suggestions,
      searchState,
      dismissedSuggestions,
      addItem,
      removeItem,
      modifyItem,
      toggleCheckItem,
      deleteItemById,
      clearList,
      acceptSuggestion,
      dismissSuggestion,
      executeSearch,
      clearSearch,
      processParsedIntent,
    }),
    [
      items,
      history,
      suggestions,
      searchState,
      dismissedSuggestions,
      addItem,
      removeItem,
      modifyItem,
      toggleCheckItem,
      deleteItemById,
      clearList,
      acceptSuggestion,
      dismissSuggestion,
      executeSearch,
      clearSearch,
      processParsedIntent,
    ]
  );

  return (
    <ShoppingListContext.Provider value={contextValue}>
      {children}
    </ShoppingListContext.Provider>
  );
}

export function useShoppingList() {
  const context = useContext(ShoppingListContext);
  if (!context) {
    throw new Error('useShoppingList must be used within a ShoppingListProvider');
  }
  return context;
}
