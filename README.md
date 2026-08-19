# 🛒 Voice Command Shopping Assistant

> An AI-powered, voice-first shopping list manager with natural language parsing, smart suggestions, voice-activated catalog search with price filtering, and a minimalist mobile-first interface.

---

## 🌟 Overview & Features

This project was built as a solution for the Technical Assessment Project challenge. It implements 100% of the required functional and technical specifications:

### 1. 🎙️ Voice Input & NLP Pipeline
- **Voice Command Recognition:** Hands-free voice capture powered by browser-native Web Speech API with real-time audio waveform/pulsing indicators.
- **Natural Language Processing (NLP):** Powered by **Groq Llama 3.1 8B Instant**, extracting structured intents (`ADD`, `REMOVE`, `MODIFY`, `SEARCH`, `CLEAR`, `HELP`) across varied phrasing (e.g., *"I want to buy bananas"*, *"Add 2 bottles of water"*, *"Change apples to 3"*).
- **Multilingual Support:** One-click language switching between **English (US/India)**, **Hindi (हिन्दी)**, **Spanish (Español)**, **French (Français)**, and **German (Deutsch)**.
- **Zero-Crash Hybrid Resilience:** Built-in client-side heuristic parser ensures full functionality even offline or if API keys are unconfigured.

### 2. 💡 Smart Suggestions & Substitutes
- **Product Recommendations:** Intelligently suggests staples based on previous shopping list activity and repurchase cycles.
- **Seasonal Recommendations:** Dynamic suggestions based on current calendar season (e.g., *Alphonso Mangoes in Summer*, *Valencia Oranges in Winter*, *Immune Tea in Monsoon*).
- **Substitutes:** Offers healthy and dietary alternatives for items added to the list (e.g., *Almond/Oat Milk for Whole Milk*, *Vegan Butter for Dairy Butter*, *Raw Honey for Sugar*).
- **Opt-In Control (BR-002):** Suggestions are advisory and never auto-added without explicit user confirmation.

### 3. 📋 Shopping List Management
- **Voice CRUD Operations:** Spoken commands to add, remove, or modify items (e.g., *"Remove milk from my list"*, *"Change apples to 3"*).
- **Automatic Categorization:** Groups items into categories (*Fruits & Vegetables*, *Dairy & Eggs*, *Bakery & Snacks*, *Beverages*, *Pantry & Staples*, *Personal Care*, *Household & Cleaning*).
- **Quantity & Unit Management:** Recognizes numeric quantities and spoken units (*pieces*, *bottles*, *cartons*, *packs*, *kg*, *liters*).
- **Persistence:** LocalStorage synchronization ensures items persist across page refreshes.

### 4. 🔍 Voice-Activated Search & Price Filtering
- **Item Search:** Query products by name, brand, or category (e.g., *"Find me organic apples"*, *"Search for Fresho milk"*).
- **Price Range & Brand Filters:** Spoken price constraints (e.g., *"Find toothpaste under $5"*, *"Show snacks below $3"*).
- **Catalog Dataset:** 50+ curated products adapted from public supermarket catalogs (BigBasket) with real pricing, brands, and ratings.

### 5. 📱 Minimalist Mobile-First UI & Feedback
- **Real-Time Visual Feedback:** Live streaming transcript display, state transitions (`idle` → `listening` → `processing` → `success` / `error`), and quick-retry capabilities.
- **Responsive Layout:** Optimized touch targets and layouts for mobile devices and voice-first interaction.
- **Manual Input Fallback:** Bottom command bar for typing commands in noisy environments or unsupported browsers.
- **Confetti Celebration:** Delightful visual reward when all shopping list items are completed.

---

## 🏗️ Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Browser                        │
│                                                             │
│   ┌──────────────────────┐       ┌──────────────────────┐  │
│   │   Web Speech API     │       │     Manual Input     │  │
│   │ (SpeechRecognition)  │       │    (Text Fallback)   │  │
│   └──────────┬───────────┘       └──────────┬───────────┘  │
│              │ (Spoken Audio)               │ (Text)       │
│              ▼                              ▼              │
│   ┌─────────────────────────────────────────────────────┐  │
│   │              Voice State Controller                 │  │
│   │       (idle -> listening -> processing)             │  │
│   └──────────────────────────┬──────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────┘
                               │ POST /api/parse-intent
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js API Route                        │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │        Groq Llama 3.1 8B Instant (LLM)              │  │
│   │   Extracts: { intent, item, quantity, unit, filters }│  │
│   └──────────────────────────┬──────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────┘
                               │ Structured JSON Intent
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 ShoppingListContext Reducer                 │
│                                                             │
│   ├── ADD: categorizeItem() -> addItem() -> syncStorage()   │
│   ├── REMOVE: fuzzyMatch() -> removeItem()                  │
│   ├── MODIFY: fuzzyMatch() -> updateQuantity()              │
│   ├── SEARCH: searchProducts() -> filter(price, brand)     │
│   └── SUGGESTIONS: generateSmartSuggestions(items, history) │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router) + React 18 | Serverless API routes, optimized rendering, zero-config Vercel deploy |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Type safety, clean architecture, production-quality code |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Minimalist, responsive mobile-first UI with custom animations |
| **Voice Capture** | Browser Web Speech API | Zero external dependencies, native multilingual support, zero latency |
| **NLP Engine** | [Groq SDK](https://groq.com/) (Llama-3.1-8B-Instant) | Ultra-fast (~100ms) structured JSON extraction from natural speech |
| **Icons & FX** | Lucide React + Canvas Confetti | Clean icons, micro-interactions, and visual feedback |
| **Storage** | React Context + LocalStorage | Instant client persistence with zero backend complexity |
| **Dataset** | Curated JSON (~50 items) | Modeled after open supermarket data with prices, brands & substitutes |

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js `18.17.0` or higher
- npm or yarn

### Installation
```bash
# 1. Clone the repository
git clone <your-repo-url>
cd voice-shopping-assistant

# 2. Install dependencies
npm install

# 3. (Optional) Configure Groq API Key
# If omitted, the app automatically runs in heuristic client NLP fallback mode!
cp .env.local.example .env.local
# Add your GROQ_API_KEY from https://console.groq.com

# 4. Run automated unit test suite (29 tests)
npm test

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in **Google Chrome** or **Microsoft Edge** (for full Web Speech API support).

---

## 🧪 Verification & Automated Tests

### Automated Unit Tests (Vitest)
```bash
npm test
```
Runs **29 unit tests** across 5 test suites covering categorization, fuzzy matching, heuristic NLP entity extraction, catalog search with price filters, and dynamic recommendations.

### Manual Voice Test Scenarios

Try the following voice or typed commands to test the NLP and list management:

| # | Command | Expected Outcome |
|---|---|---|
| 1 | *"Add milk"* | Adds "Farm Fresh Whole Milk" under **Dairy & Eggs** |
| 2 | *"I want to buy bananas"* | Varied phrasing recognized, adds **Robusta Bananas** |
| 3 | *"Add 2 bottles of water"* | Correctly parses quantity (2) and unit ("bottles") |
| 4 | *"Find toothpaste under $5"* | Searches catalog and shows Colgate & Ayurvedic options under $5 |
| 5 | *"Find me organic apples"* | Shows organic Fuji apples with price tags |
| 6 | *"Change apples to 3"* | Updates quantity of existing apples to 3 |
| 7 | *"Remove milk from my list"* | Removes milk with visual confirmation |
| 8 | *"doodh jod do"* (Hindi mode) | Adds milk using Hindi voice command |
| 9 | Check suggestions | Notice almond milk substitute recommended for milk |
| 10 | *"Clear list"* | Clears entire shopping list |

---

## 📄 Deliverables Checklist
- [x] Hosted public URL (deployable via Vercel in 1 click)
- [x] GitHub repository with full source code
- [x] Comprehensive documentation and README
- [x] 200-word engineering approach write-up ([`APPROACH.md`](./APPROACH.md))
