# Master Frontend Generation Prompt

> **Instructions for the user:** Copy and paste the entire prompt below into your AI design tool (e.g., v0.dev, Claude 3.5 Sonnet, Bolt.new, Lovable, or ChatGPT). It contains all the context, contracts, types, and component specifications needed to generate a visually stunning, production-grade UI that drops directly into our Next.js project.

---

```markdown
# Role & Objective
You are an expert Principal Frontend Engineer and UI/UX Designer specializing in Next.js 14 (App Router), React 18, TypeScript, and Tailwind CSS.
Your task is to build a modern, minimalist, production-grade frontend UI for a **Voice Command Shopping Assistant** web application.

---

## 🎨 Design Philosophy & Aesthetic
- **Visual Style:** Minimalist, clean, premium modern aesthetic (inspired by Linear, Apple Health, and Notion).
- **Color Palette:**
  - Primary / Accent: Emerald / Mint (`emerald-500`, `emerald-600`, `teal-500`)
  - Background: Subtle clean mesh gradient (`from-emerald-50/40 via-slate-50 to-neutral-100`)
  - Surface Cards: Translucent white with backdrop blur (`bg-white/90 backdrop-blur-md border border-neutral-200/80 shadow-sm`)
  - Text: High contrast typography (`text-neutral-900` for titles, `text-neutral-500` for captions)
- **Ergonomics:** Mobile-first layout with generous touch targets (min 44px-56px for buttons).
- **Micro-interactions:** Smooth hover effects, active scale-down (`active:scale-95`), pulsating audio waveform animations during listening, and sleek badge transitions.

---

## 🏗️ Tech Stack & Constraints
- **Framework:** Next.js 14+ (App Router) with React 18
- **Language:** TypeScript (Strict, 100% typed, no `any`)
- **Styling:** Tailwind CSS + `clsx` / `tailwind-merge`
- **Icons:** `lucide-react`
- **Effects:** `canvas-confetti` (for celebration when list is fully completed)

---

## 📦 Data Contracts & TypeScript Types (`types/index.ts`)

```typescript
export type IntentType = 'ADD' | 'REMOVE' | 'MODIFY' | 'SEARCH' | 'CLEAR' | 'HELP' | 'UNKNOWN';

export interface SearchFilters {
  brand?: string | null;
  priceMax?: number | null;
  priceMin?: number | null;
  size?: string | null;
  category?: string | null;
}

export interface ParsedIntent {
  intent: IntentType;
  item?: string | null;
  quantity?: number | null;
  unit?: string | null;
  targetItem?: string | null;
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
  substitutes?: string[];
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
  sourceItemId?: string;
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
```

---

## 🔌 State & Hooks API Contracts

### 1. `useShoppingList()` Context Hook
Provides state & actions from `context/ShoppingListContext.tsx`:
- `items: ListItem[]` — Current items on the shopping list
- `suggestions: Suggestion[]` — Dynamic smart suggestions (substitutes, seasonal, repurchase)
- `searchState: { isActive: boolean; query: string; results: Product[]; totalMatches: number; filters?: SearchFilters }`
- `addItem(name: string, quantity?: number, unit?: string, brand?: string): { success: boolean; item: ListItem; isNew: boolean }`
- `removeItem(query: string): { success: boolean; removedName?: string; message?: string }`
- `modifyItem(query: string, newQty: number, newUnit?: string): { success: boolean; modifiedItem?: ListItem; message?: string }`
- `toggleCheckItem(id: string): void`
- `deleteItemById(id: string): void`
- `clearList(): void`
- `acceptSuggestion(suggestion: Suggestion): void`
- `dismissSuggestion(id: string): void`
- `executeSearch(query: string, filters?: SearchFilters): void`
- `clearSearch(): void`

### 2. `useSpeechRecognition()` Hook
Provides speech capture & state from `hooks/useSpeechRecognition.ts`:
- `voiceState: VoiceState` (`'idle' | 'listening' | 'processing' | 'success' | 'error'`)
- `transcript: string` — Final speech text
- `interimTranscript: string` — Live streaming interim text as user is speaking
- `feedback: VoiceFeedback` — Current action message or error details
- `isSupported: boolean` — Whether browser supports SpeechRecognition
- `language: SupportedLanguage` — Current speech locale code
- `setLanguage(lang: SupportedLanguage): void`
- `startListening(): void`
- `stopListening(): void`
- `resetState(): void`

---

## 🧩 Required Component Specifications

Please generate clean, complete, modern React components for all of the following:

### 1. `components/Header.tsx`
- **Props:** `{ currentLanguage: SupportedLanguage; onLanguageChange: (lang: SupportedLanguage) => void; onOpenGuide: () => void }`
- **Features:**
  - Modern shopping logo/icon with emerald gradient pill badge ("Voice Cart")
  - `LanguageSelector` dropdown component
  - "Voice Guide" help button with an icon to open the cheat sheet modal
  - Clean sticky/fixed top bar with subtle blur.

### 2. `components/LanguageSelector.tsx`
- **Props:** `{ currentLanguage: SupportedLanguage; onLanguageChange: (lang: SupportedLanguage) => void }`
- **Languages:**
  - 🇺🇸 English (US) (`en-US`)
  - 🇮🇳 English (India) (`en-IN`)
  - 🇮🇳 Hindi (हिन्दी) (`hi-IN`)
  - 🇪🇸 Spanish (Español) (`es-ES`)
  - 🇫🇷 French (Français) (`fr-FR`)
  - 🇩🇪 German (Deutsch) (`de-DE`)
- **Features:** Dropdown/select with flags, native language names, and clean rounded border.

### 3. `components/VoiceButton.tsx`
- **Props:** `{ voiceState: VoiceState; isSupported: boolean; onStart: () => void; onStop: () => void }`
- **Features:**
  - Centerpiece of the application (large 80px circular button).
  - **State `idle`:** Emerald gradient background (`from-emerald-600 to-teal-500`), mic icon, gentle hover elevation.
  - **State `listening`:** Crimson red gradient, pulsing audio radar rings (`animate-ping` / `animate-pulse`), glowing shadow, tap-to-stop.
  - **State `processing`:** Amber gradient with spinning loader icon (`Loader2`).
  - **State `unsupported`:** Disabled gray button with clear helper notice.
  - Dynamic status label below the button ("Tap mic and speak naturally", "Listening... Tap to stop", etc.).

### 4. `components/VoiceStatus.tsx`
- **Props:** `{ voiceState: VoiceState; interimTranscript: string; feedback: VoiceFeedback; onRetry?: () => void }`
- **Features:**
  - Shows real-time speech stream when user is talking (*"Live: I want to buy..."*).
  - Shows green success confirmation toast with checkmark and what was heard.
  - Shows red error toast with failure explanation and quick "Retry" button.
  - Smooth slide-in/fade-in transitions.

### 5. `components/ShoppingList.tsx`
- **Features:**
  - Category-grouped shopping list (`Fruits & Vegetables`, `Dairy & Eggs`, `Bakery & Snacks`, `Beverages`, `Pantry & Staples`, `Personal Care`, `Household & Cleaning`).
  - Progress header: total items count badge + completed items count ("3 of 5 items bought").
  - "Clear List" trash icon button.
  - Confetti burst celebration when all items in the list are checked!
  - Empty state with illustration and 3 clickable example voice prompts.

### 6. `components/ListItem.tsx`
- **Props:** `{ item: ListItem; onToggleCheck: (id: string) => void; onDelete: (id: string) => void; onModifyQty: (id: string, newQty: number) => void }`
- **Features:**
  - Checkbox with animated checkmark; strike-through and dimmed opacity when checked.
  - Category emoji (🍎, 🥛, 🍞, 🧃, 🍚, 🧴, 🧹).
  - Item title + category pill.
  - Inline quantity pill with touch `+` and `-` buttons (`"2 bottles"`, `"5 pieces"`).
  - Delete trash button with hover highlight.

### 7. `components/Suggestions.tsx`
- **Features:**
  - Card grid or horizontal shelf for Smart Suggestions.
  - 3 distinct badge types:
    - 🔄 **Substitute:** e.g., *"Almond Milk — Plant-based alternative for Whole Milk"*
    - 🌿 **Seasonal:** e.g., *"Alphonso Mangoes — Peak summer seasonal fruit"*
    - ⭐ **History Favorite:** e.g., *"Brown Eggs — Frequently purchased staple"*
  - Rationale text explaining why the item was suggested.
  - One-tap "+ Add to list" opt-in button (satisfying BR-002: never auto-added).
  - "x" Dismiss button.

### 8. `components/SearchResults.tsx`
- **Features:**
  - Active search results tray (displayed when user asks to search or filter products).
  - Displays search query and active filter pills (e.g., `Max Price: $5`, `Brand: Colgate`).
  - Product cards with emoji thumbnail, brand name, original price, discounted price, and rating.
  - "Add to List" button that flips to "✓ Added".
  - Close button to dismiss search tray.

### 9. `components/ManualInput.tsx`
- **Props:** `{ onProcessText: (text: string) => Promise<void> | void; isProcessing: boolean }`
- **Features:**
  - Sticky bottom keyboard entry bar for non-voice environments.
  - Placeholder: *"Or type a command... (e.g., 'Add 2 bottles of water', 'Find apples under $4')"*.
  - Send button with loading spinner when processing.

### 10. `components/VoiceCommandGuide.tsx`
- **Props:** `{ isOpen: boolean; onClose: () => void }`
- **Features:**
  - Modal overlay with categorized voice command cheat sheet:
    - ➕ Adding items & quantities (*"Add milk"*, *"2 bottles of water"*, *"Buy 5 oranges"*)
    - ➖ Removing items (*"Remove milk"*, *"Delete apples"*)
    - 🎚️ Modifying items (*"Change apples to 3"*, *"Make bananas 5"*)
    - 🔍 Search & Price filtering (*"Find toothpaste under $5"*, *"Search organic apples"*)
    - 🌐 Multilingual examples (*Hindi: "doodh jod do"*, *Spanish: "agrega leche"*)
  - "Got it!" dismiss button.

### 11. `app/page.tsx`
- **Features:**
  - Main container integrating `Header`, `VoiceButton`, `VoiceStatus`, `SearchResults`, `Suggestions`, `ShoppingList`, `ManualInput`, and `VoiceCommandGuide`.
  - Coordinates intent parsing via `parseIntent()` and executes actions on `useShoppingList()`.

---

## 🎯 Output Requirements
1. Output complete, fully implemented TSX and CSS code without placeholders or `// TODO` comments.
2. Use valid Tailwind CSS classes and ensure seamless responsive behavior across mobile (375px), tablet (768px), and desktop (1024px+).
3. Ensure every component matches the exact prop types and imports specified above so it drops directly into the Next.js project.
```
