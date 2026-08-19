# 🛒 Voice Cart — AI Voice-First Shopping Assistant

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2.35-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-37%2F37_Passing-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![Groq](https://img.shields.io/badge/Groq-Llama_3.1_8B_Instant-F05A28?style=for-the-badge)](https://groq.com/)
[![Dataset](https://img.shields.io/badge/Dataset-GroceryStoreDataset_(81_Classes)-059669?style=for-the-badge)](https://github.com/marcusclasesson/GroceryStoreDataset)

> **Voice Cart** is a voice-first, AI-powered shopping assistant that transforms spoken natural language into an organized, categorized shopping list with real-time feedback, intelligent plant-based substitutes, seasonal produce recommendations, and voice-driven catalog search.

---

## 🚀 Live Demo & Links
- **GitHub Repository:** [https://github.com/Anuraagsingh132/Voice-Cart.git](https://github.com/Anuraagsingh132/Voice-Cart.git)
- **Local Dev Server:** `http://localhost:3000`

---

## 🌟 Key Features & Innovations

### 1. 🎙️ Continuous Always-Active Voice Capture & Noise Gate
- **Always-Listening Mode:** The microphone stays active continuously in the background, eliminating the need to repeatedly press buttons before speaking.
- **Residual Chatter & Noise Filtering:** Built-in semantic gate automatically ignores casual background chatter (*"what's the time"*, *"yeah I spoke to him"*, *"turn on TV"*) while capturing genuine grocery commands without false alarms.
- **Demonstrable Real-Time Visual Feedback:** Displays live streaming speech with an animated typing cursor and distinct execution badges (*Spoken vs. Parsed vs. Executed*).

### 2. 🧠 Compound Multi-Item NLP & Phonetic Correction
- **Compound Commands:** Speaks multiple items in a single utterance (e.g. *"5 eggs and two breads"*, *"Add milk, 2 apples, and water"*) and correctly separates quantities, units, and categories.
- **Phonetic STT Normalization:** Automatically corrects common speech-to-text misspellings (e.g., *"breadth"* ➡️ *Bread*, *"malk/melk"* ➡️ *Milk*, *"watar"* ➡️ *Water*).
- **Dual-Engine Architecture:** Hybrid pipeline leveraging **Groq Llama 3.1 8B Instant** (~100ms latency) for rich phrasing and a local deterministic regex NLP fallback when offline.
- **Multilingual Support:** Supports English (US/India), Hindi (हिन्दी: *"doodh jod do"*), Spanish (*"agrega leche"*), French (*"ajouter du lait"*), and German (*"milch hinzufügen"*).

### 3. 📦 Real-World GroceryStoreDataset Integration
- **81 Authentic Product Classes:** Fully integrated [GroceryStoreDataset](https://github.com/marcusclasesson/GroceryStoreDataset) across Fruits, Vegetables, Dairy, Plant-based Milks, Yoghurts, and Juices.
- **Iconic Photographic Imagery & Descriptions:** Every product displays authentic photography with botanical and culinary descriptions directly from the dataset.

### 4. 💡 Dynamic Smart Recommendations & Substitutes
- **Explicit AI Reasoning:** Every suggestion card explicitly explains *why* it is recommended:
  - ☀️ **Peak Season:** Seasonal availability (e.g. *Watermelon in Summer*, *Valencia Oranges & Ginger in Winter*).
  - 🌱 **Healthy Swap:** Suggests dietary alternatives for active list items (e.g. *Oatly Oat Milk* or *Alpro Soy Milk* for *Arla Standard Milk*).
  - 🔄 **Shopping History:** Frequent staples based on recent user habits.
- **Opt-In Advisory Control:** Recommendations never force-add items; one tap allows adding or incrementing quantity.

### 5. 🔍 Voice-Activated Catalog Search & Price/Brand Filtering
- **Spoken Search:** Find items by keyword (e.g. *"Find organic apples"*, *"Search ginger"*).
- **Price Range & Brand Constraints:** Parses numeric constraints (e.g. *"Find juice under $5"*, *"Search Arla milk"*).
- **Interactive Search Tray:** Real-time matches with one-click `+ Add (+1)` quantity steppers and direct success indicators.

### 6. 🎨 Cohesive Design System & Responsive Layout
- **Unified Palette:** Emerald (`#059669`) for primary actions, Rose for active listening/danger, Amber for processing, and Neutral grays for resting states.
- **Quiet Tint Category System:** Distinct pastel pills across all 7 departments (*Fruits & Vegetables*, *Dairy & Eggs*, *Bakery & Snacks*, *Beverages*, *Pantry & Staples*, *Personal Care*, *Household & Cleaning*).
- **Widescreen Responsive Grid:** Fluid `max-w-7xl` container with responsive 2-column list item layouts that utilize full monitor width without empty side margins.

---

## 🏗️ Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT BROWSER                                 │
│                                                                             │
│   ┌───────────────────────────┐         ┌───────────────────────────────┐   │
│   │    Web Speech API Engine  │         │    Manual Command Capsule     │   │
│   │   (Always-Active Listener)│         │     (Keyboard / Touch Bar)    │   │
│   └─────────────┬─────────────┘         └───────────────┬───────────────┘   │
│                 │ (Audio Stream)                        │ (Text Command)    │
│                 ▼                                       ▼                   │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                 Semantic Relevance / Residual Noise Gate             │   │
│   │      isShoppingRelated(text) -> Rejects non-grocery chatter         │   │
│   └─────────────────────────────────────┬───────────────────────────────┘   │
└─────────────────────────────────────────┼───────────────────────────────────┘
                                          │ POST /api/parse-intent
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NEXT.JS BACKEND RUNTIME                           │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                 Groq Llama 3.1 8B Instant (LLM)                     │   │
│   │   Extracts: { intent, items: [ { item, qty, unit } ], filters }     │   │
│   │   Phonetic & Multi-Language Normalization                           │   │
│   └─────────────────────────────────────┬───────────────────────────────┘   │
│                                         │ (Fallback: Local Heuristic NLP)   │
└─────────────────────────────────────────┼───────────────────────────────────┘
                                          │ Structured JSON Intent
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SHOPPING LIST STATE ENGINE                          │
│                                                                             │
│   ├── ADD:       categorizeItem() ➡️ findBestMatch() ➡️ update/insert        │
│   ├── REMOVE:    fuzzyMatch() ➡️ filter()                                    │
│   ├── MODIFY:    fuzzyMatch() ➡️ updateQuantity()                            │
│   ├── SEARCH:    searchProducts() ➡️ applyFilters(priceMax, brand)           │
│   ├── RECS:      generateSmartSuggestions(items, history, currentSeason)    │
│   └── STORAGE:   LocalStorage Sync ➡️ Confetti Trigger on 100%               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```
├── app/
│   ├── api/parse-intent/route.ts  # Groq Llama 3.1 JSON parsing endpoint
│   ├── globals.css                # Tailwind utilities, mesh-bg & ripple animations
│   ├── icon.svg                   # Vector SVG App icon & favicon
│   ├── layout.tsx                 # Root layout & Inter font configuration
│   └── page.tsx                   # Main Dashboard UI & Controller
├── components/
│   ├── Header.tsx                 # Navigation bar with live background voice pill
│   ├── LanguageSelector.tsx       # Multilingual dropdown (EN, HI, ES, FR, DE)
│   ├── ListItem.tsx               # Animated checkbox, stepper & hover delete
│   ├── ManualInput.tsx            # Capsule text input with dynamic submit state
│   ├── SearchResults.tsx          # Catalog search tray with price & brand filters
│   ├── ShoppingList.tsx           # Category groups, progress bar & confetti
│   ├── Suggestions.tsx            # Snap carousel with explicit reasoning callouts
│   ├── VoiceButton.tsx            # 64px centerpiece with staggered ripple rings
│   ├── VoiceCommandGuide.tsx      # Modal cheat-sheet with phrasing examples
│   └── VoiceStatus.tsx            # Demonstrable streaming transcript & result banner
├── context/
│   └── ShoppingListContext.tsx    # State management, CRUD, search, and recs
├── data/
│   ├── products.json              # 81 GroceryStoreDataset items with images & text
│   ├── seasonal.json              # Seasonal produce mappings (Spring/Summer/Fall/Winter)
│   └── substitutes.json           # Dietary & plant-based substitute dictionary
├── hooks/
│   ├── useLocalStorage.ts         # Persistent browser storage synchronization
│   └── useSpeechRecognition.ts    # Robust continuous listening & auto-recovery
├── lib/
│   ├── categorize.ts              # Department rule-based categorization
│   ├── fuzzyMatch.ts              # Levenshtein distance & string similarity
│   ├── intentParser.ts            # Client NLP heuristics & residual chatter gate
│   ├── search.ts                  # Catalog query engine with price/brand filters
│   └── suggestions.ts             # Dynamic recommendations & substitute matcher
├── public/
│   └── dataset/                   # Iconic product photography assets
└── __tests__/                     # Vitest automated test suite (37 unit tests)
```

---

## 🧪 Verification & Automated Test Suite

The codebase features **37 unit tests** across 5 comprehensive test suites covering every critical requirement:

```bash
npm test
```

### Test Coverage Highlights:
- **`__tests__/intentParser.test.ts` (14 tests):** Single intent, compound multi-item extraction (*"5 eggs and two breads"*), phonetic mistranscriptions (*"breadth"* ➡️ *Bread*), and residual talk rejection.
- **`__tests__/search.test.ts` (6 tests):** Keyword matching, price ceilings (*"under $5"*), brand filters (*"Arla"*, *"Tropicana"*), and category searches.
- **`__tests__/suggestions.test.ts` (4 tests):** Plant-based substitute generation (*Whole Milk* ➡️ *Oat/Soy Milk*), seasonal picks, and duplicate prevention.
- **`__tests__/categorize.test.ts` (7 tests):** Automatic department categorization.
- **`__tests__/fuzzyMatch.test.ts` (6 tests):** Levenshtein distance and plural normalization.

---

## 🎙️ Demonstrable Voice Command Cheat Sheet

| Intent | Voice Command | NLP Execution Outcome |
|---|---|---|
| **Add Single** | *"Add 2 bottles of milk"* | Adds **Arla Standard Milk** (Qty: 2, Unit: bottles) under **Dairy & Eggs** |
| **Add Compound** | *"5 eggs and two breads"* | Separates into **Eggs × 5** and **Bread × 2** in respective categories |
| **Phonetic Fix** | *"Add two breadth and malk"* | Normalizes to **Bread × 2** and **Milk × 1** |
| **Modify Qty** | *"Change milk to 4"* | Updates existing Milk quantity to 4 |
| **Remove Item** | *"Remove bread from my list"* | Deletes Bread with visual execution banner |
| **Voice Search** | *"Find juice under $5"* | Opens Catalog Search tray filtered to juices $\le \$5$ |
| **Brand Search** | *"Search for Oatly"* | Displays Oatly Oat Milk and Oatghurt options |
| **Substitutes** | *(Add milk to list)* | Smart Suggestions carousel highlights **Oatly Oat Milk** (Healthy Swap) |
| **Multilingual** | *"doodh jod do"* (Hindi) | Correctly parses and adds Milk to Dairy department |
| **Noise Filter** | *"what is the weather today"* | Silently ignored as non-shopping background chatter |
| **Clear List** | *"Clear my shopping list"* | Empties list with confirmation |

---

## 💻 Local Setup & Installation

### Prerequisites
- Node.js `18.17.0` or higher
- npm or yarn

### Steps:
```bash
# 1. Clone the repository
git clone https://github.com/Anuraagsingh132/Voice-Cart.git
cd Voice-Cart

# 2. Install dependencies
npm install

# 3. (Optional) Configure Groq API Key
# If omitted, the application runs on the built-in Client NLP Heuristic Engine!
cp .env.local.example .env.local
# Add your GROQ_API_KEY from https://console.groq.com

# 4. Run automated test suite (37 tests)
npm test

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in **Google Chrome** or **Microsoft Edge** for Web Speech API support.

---

## 📜 Engineering Decisions & Compliance

For a detailed technical evaluation of trade-offs, architecture decisions, and requirement compliance, see [`APPROACH.md`](./APPROACH.md).
