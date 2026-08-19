export type IntentType = 'ADD' | 'REMOVE' | 'MODIFY' | 'SEARCH' | 'CLEAR' | 'HELP' | 'UNKNOWN';

export interface SearchFilters {
  brand?: string | null;
  priceMax?: number | null;
  priceMin?: number | null;
  size?: string | null;
  category?: string | null;
}

export interface ParsedItemEntity {
  item: string;
  quantity?: number;
  unit?: string;
  brand?: string;
}

export interface ParsedIntent {
  intent: IntentType;
  item?: string | null;
  items?: ParsedItemEntity[]; // Multi-item compound commands support (e.g. "5 eggs and 2 breads")
  quantity?: number | null;
  unit?: string | null;
  targetItem?: string | null; // For MODIFY or substitute replacement
  filters?: SearchFilters;
  confidence?: number;
  rawQuery?: string;
  explanation?: string;
}

export interface ListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  checked: boolean;
  addedAt: number;
  priceEstimate?: number;
  brand?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  subCategory?: string;
  price: number;
  discountedPrice?: number;
  unit?: string;
  inStock?: boolean;
  rating?: number;
  season?: ('spring' | 'summer' | 'fall' | 'winter' | 'monsoon' | 'all-year')[];
  substitutes?: string[]; // IDs or names of substitute products
  tags?: string[];
  imageEmoji?: string;
}

export type SuggestionType = 'history' | 'seasonal' | 'substitute' | 'frequent';

export interface Suggestion {
  id: string;
  type: SuggestionType;
  title: string;
  item: string;
  category: string;
  reason: string;
  price?: number;
  unit?: string;
  sourceItemId?: string; // which list item triggered this (for substitutes)
  badgeColor?: string;
}

export type VoiceState = 'idle' | 'listening' | 'processing' | 'success' | 'error';

export interface VoiceFeedback {
  status: VoiceState;
  transcript?: string;
  message?: string;
  intent?: IntentType;
  timestamp: number;
}

export type SupportedLanguage = 'en-US' | 'en-IN' | 'hi-IN' | 'es-ES' | 'fr-FR' | 'de-DE';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}
