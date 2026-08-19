'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ListItem, ParsedIntent, Product, Suggestion } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { generateSmartSuggestions } from '@/lib/suggestions';
import { searchProducts } from '@/lib/search';
import { voiceOrchestrator } from '@/lib/orchestration/voiceOrchestrator';
import { eventStore } from '@/lib/events/eventStore';
import { projectShoppingList } from '@/lib/events/projections';
import { CommandResult, CommandSource } from '@/types/schema';

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
  aggregateVersion: number;
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
  undoLastCommand: () => Promise<CommandResult>;
  executeOrchestratedCommand: (text: string, locale?: string, source?: CommandSource) => Promise<CommandResult>;
  acceptSuggestion: (suggestion: Suggestion) => void;
  dismissSuggestion: (id: string) => void;
  executeSearch: (query: string, filters?: { brand?: string | null; priceMax?: number | null; priceMin?: number | null; size?: string | null }) => void;
  showAllProducts: () => void;
  clearSearch: () => void;
  processParsedIntent: (intent: ParsedIntent) => { success: boolean; message: string; type: string };
}



const ShoppingListContext = createContext<ShoppingListContextType | undefined>(undefined);

export function ShoppingListProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useLocalStorage<ListItem[]>('shopping_list_items', []);
  const [aggregateVersion, setAggregateVersion] = useState<number>(1);
  const [history, setHistory] = useLocalStorage<string[]>('shopping_list_history', []);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);
  const [searchState, setSearchState] = useState<SearchResultState>({
    isActive: false,
    query: '',
    results: [],
    totalMatches: 0,
  });

  // Re-sync with Event Store on mount
  useEffect(() => {
    const projection = voiceOrchestrator.getLiveProjection();
    if (projection.items.length > 0 || eventStore.getEvents().length > 0) {
      setItems(projection.items);
      setAggregateVersion(projection.version);
    }
  }, [setItems]);

  const recordHistory = useCallback(
    (name: string) => {
      const clean = name.trim();
      setHistory((prev) => {
        const filtered = prev.filter((h) => h.toLowerCase() !== clean.toLowerCase());
        return [clean, ...filtered].slice(0, 20);
      });
    },
    [setHistory]
  );

  // Synchronize aggregate state from orchestrator output
  const applyOrchestratedOutput = useCallback(
    (projection: any) => {
      setItems(projection.items);
      setAggregateVersion(projection.version);
      projection.items.forEach((it: ListItem) => recordHistory(it.name));
    },
    [setItems, recordHistory]
  );

  // 1. EXECUTE ORCHESTRATED COMMAND (Unified Fast Path & Resilient Gateway)
  const executeOrchestratedCommand = useCallback(
    async (text: string, locale = 'en-US', source: CommandSource = 'text_manual'): Promise<CommandResult> => {
      const output = await voiceOrchestrator.orchestrate({
        transcript: text,
        locale,
        source,
        aggregate_id: 'list_default',
        aggregate_version: aggregateVersion,
      });


      applyOrchestratedOutput(output.projection);

      if (output.command.action === 'SEARCH') {
        const query = output.command.entities[0]?.name || text;
        const searchRes = searchProducts(query, {
          brand: output.command.filters?.brand ?? undefined,
          priceMax: output.command.filters?.priceMax ?? undefined,
          priceMin: output.command.filters?.priceMin ?? undefined,
          size: output.command.filters?.size ?? undefined,
        });
        setSearchState({
          isActive: true,
          query,
          filters: output.command.filters,
          results: searchRes.results,
          totalMatches: searchRes.totalMatches,
        });
      }

      return output.result;
    },
    [aggregateVersion, applyOrchestratedOutput]
  );

  // 2. COMPENSATING UNDO
  const undoLastCommand = useCallback(async (): Promise<CommandResult> => {
    return executeOrchestratedCommand('undo', 'en-US', 'system_undo');
  }, [executeOrchestratedCommand]);

  // 3. ADD ITEM (Deterministic fast path via orchestrator)
  const addItem = useCallback(
    (name: string, quantity = 1, unit = 'pieces', brand?: string) => {
      const clean = name.trim();
      const commandText = `add ${quantity} ${unit !== 'pieces' ? `${unit} ` : ''}${clean}${brand ? ` by ${brand}` : ''}`;
      
      // Synchronous optimistic execution
      const output = voiceOrchestrator.orchestrate({
        transcript: commandText,
        source: 'text_manual',
        aggregate_version: aggregateVersion,
      });

      // Handle async resolution
      output.then((res) => applyOrchestratedOutput(res.projection));

      const newItem: ListItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: clean,
        quantity,
        unit,
        category: 'Pantry & Staples',
        checked: false,
        addedAt: Date.now(),
        brand,
      };

      return { success: true, item: newItem, isNew: true };
    },
    [aggregateVersion, applyOrchestratedOutput]
  );

  // 4. REMOVE ITEM
  const removeItem = useCallback(
    (query: string) => {
      executeOrchestratedCommand(`remove ${query}`);
      return { success: true, removedName: query, message: `Removed ${query}` };
    },
    [executeOrchestratedCommand]
  );

  // 5. MODIFY ITEM
  const modifyItem = useCallback(
    (query: string, newQty: number, newUnit?: string) => {
      executeOrchestratedCommand(`change ${query} to ${newQty} ${newUnit || 'pieces'}`);
      return { success: true, message: `Updated ${query} to ${newQty}` };
    },
    [executeOrchestratedCommand]
  );

  // 6. TOGGLE CHECK
  const toggleCheckItem = useCallback(
    (id: string) => {
      eventStore.appendEvent({
        event_id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        command_id: `cmd-${Date.now()}`,
        aggregate_id: 'list_default',
        aggregate_version: aggregateVersion + 1,
        type: 'ITEM_CHECKED',
        payload: { item_id: id },
        timestamp: Date.now(),
        metadata: {
          source: 'text_manual',
          route: 'deterministic_fast_path',
          locale: 'en-US',
          request_id: 'req-check',
          trace_id: 'tr-check',
        },
      });
      const projection = projectShoppingList(eventStore.getEvents());
      applyOrchestratedOutput(projection);
    },
    [aggregateVersion, applyOrchestratedOutput]
  );

  // 7. DELETE ITEM BY ID
  const deleteItemById = useCallback(
    (id: string) => {
      const it = items.find((i) => i.id === id);
      if (it) {
        removeItem(it.name);
      }
    },
    [items, removeItem]
  );

  // 8. CLEAR LIST
  const clearList = useCallback(() => {
    executeOrchestratedCommand('clear list');
  }, [executeOrchestratedCommand]);

  // 9. ACCEPT / DISMISS SUGGESTION
  const acceptSuggestion = useCallback(
    (suggestion: Suggestion) => {
      executeOrchestratedCommand(`add 1 ${suggestion.unit || 'pieces'} of ${suggestion.item}`);
      setDismissedSuggestions((prev) => [...prev, suggestion.id]);
    },
    [executeOrchestratedCommand]
  );

  const dismissSuggestion = useCallback((id: string) => {
    setDismissedSuggestions((prev) => [...prev, id]);
  }, []);

  // 10. SEARCH CATALOG
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

  const showAllProducts = useCallback(() => {
    const searchRes = searchProducts('');
    setSearchState((prev) => {
      // Toggle off if already viewing All Items
      if (prev.isActive && prev.query === 'All Items') {
        return {
          isActive: false,
          query: '',
          results: [],
          totalMatches: 0,
        };
      }
      return {
        isActive: true,
        query: 'All Items',
        results: searchRes.results,
        totalMatches: searchRes.totalMatches,
      };
    });
  }, []);

  const clearSearch = useCallback(() => {
    setSearchState({
      isActive: false,
      query: '',
      results: [],
      totalMatches: 0,
    });
  }, []);

  // 11. SUGGESTIONS
  const suggestions = useMemo(() => {
    const rawSuggestions = generateSmartSuggestions(items, history);
    return rawSuggestions.filter((s) => !dismissedSuggestions.includes(s.id));
  }, [items, history, dismissedSuggestions]);

  // 12. PARSED INTENT FALLBACK WRAPPER
  const processParsedIntent = useCallback(
    (parsed: ParsedIntent): { success: boolean; message: string; type: string } => {
      const actionText = parsed.rawQuery || parsed.explanation || 'add items';
      executeOrchestratedCommand(actionText);
      return { success: true, message: parsed.explanation || 'Command executed', type: 'success' };
    },
    [executeOrchestratedCommand]
  );

  const contextValue = useMemo(
    () => ({
      items,
      aggregateVersion,
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
      undoLastCommand,
      executeOrchestratedCommand,
      acceptSuggestion,
      dismissSuggestion,
      executeSearch,
      showAllProducts,
      clearSearch,
      processParsedIntent,
    }),
    [
      items,
      aggregateVersion,
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
      undoLastCommand,
      executeOrchestratedCommand,
      acceptSuggestion,
      dismissSuggestion,
      executeSearch,
      showAllProducts,
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
