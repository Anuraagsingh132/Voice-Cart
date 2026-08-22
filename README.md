# 🛒 Voice Cart — AI Voice-First Shopping Assistant

> ## 🎯 Technical Assessment Alignment
>
> This project was designed around a software-engineering assessment for a **Voice Command Shopping Assistant**. The implementation focuses on the requested core experience: voice commands, flexible NLP, multilingual input, smart suggestions, shopping-list management, voice search, responsive UI feedback, hosting, tests, and clear technical documentation.
>
> ### Assessment Requirement → Implementation
>
> | Assessment requirement | Voice Cart implementation | Status |
> |---|---|:---:|
> | Voice command recognition | Web Speech API + continuous listening workflow | ✅ |
> | Natural-language flexibility | Compound parsing, normalization, fuzzy matching, LLM-assisted parsing | ✅ |
> | Multilingual support | English, Hindi, Spanish, French, German command examples / selector | ✅ |
> | Product recommendations | Smart suggestion engine with history-oriented and contextual signals | ✅ |
> | Seasonal recommendations | `seasonal.json` + seasonal suggestion logic | ✅ |
> | Product substitutes | `substitutes.json` + dietary / plant-based suggestions | ✅ |
> | Add / remove / modify | Deterministic shopping-list action engine | ✅ |
> | Automatic categorization | Department/category classification | ✅ |
> | Quantity management | Quantity + unit extraction and list updates | ✅ |
> | Voice-activated search | Spoken search with structured filters | ✅ |
> | Brand / price filtering | Brand and price constraints in search flow | ✅ |
> | Minimalist UI | Responsive dashboard with category-grouped list | ✅ |
> | Real-time visual feedback | Transcript, processing state, execution confirmation | ✅ |
> | Mobile / voice-oriented UX | Responsive layout and central microphone interaction | ✅ |
> | Hosted application | Vercel deployment / live demo URL | ✅ |
> | Production-quality code | Typed Next.js/TypeScript structure + modular components | ✅ |
> | Basic error handling | Fallback NLP path, resilience tests, timeout handling | ✅ |
> | Loading states | Voice processing / search / command status feedback | ✅ |
> | Documentation | README + `APPROACH.md` + automated tests | ✅ |
>
> **Important:** The ML recommendation architecture later in this README is an **extension design**, not a claim that a trained production recommendation model is already deployed. Current recommendations are primarily deterministic/rule-driven with an ML-ready architecture.


> **Speak naturally. Shop intelligently.**
>
> Voice Cart turns everyday spoken requests into a structured, searchable, and personalized shopping experience — with multilingual voice input, compound intent parsing, smart substitutions, seasonal recommendations, and an extensible ML recommendation layer.

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2.35-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-73%2F73_Passing-6E9F18?style=for-the-badge)](https://vitest.dev/)
[![Groq](https://img.shields.io/badge/Groq-Llama_3.3_70B_/_3.1_8B-F05A28?style=for-the-badge)](https://groq.com/)

[![Dataset](https://img.shields.io/badge/Dataset-BigBasket_(27k+_Products)-059669?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/License-MIT-informational?style=for-the-badge)](LICENSE)

**Live Demo:** https://voice-cart-one.vercel.app/  
**Repository:** https://github.com/Anuraagsingh132/Voice-Cart

---

## ⏱️ Designed for an 8-Hour Technical Assessment

The architecture prioritizes **maximum demonstrable functionality per unit of implementation effort**.

Instead of introducing unnecessary infrastructure, the project keeps the core experience lightweight:

```text
Browser
  │
  ├── Web Speech API
  ├── React / Next.js UI
  ├── Local state + LocalStorage
  ├── Deterministic NLP / fuzzy matching
  └── Optional Groq semantic parsing
             │
             ▼
       Structured intent
             │
             ▼
       Shopping actions
             │
             ├── categorization
             ├── quantities
             ├── search
             └── suggestions
```

This gives the reviewer a working end-to-end system without requiring a database, message queue, model-training pipeline, or complex cloud infrastructure for the assessment-sized scope.

### Why this trade-off?

The assessment explicitly values:

- problem-solving approach
- code quality
- working functionality
- documentation

The implementation therefore emphasizes **a complete vertical slice** over infrastructure complexity.

A production evolution path is documented separately rather than pretending that every future component is already live.

## ✨ Why Voice Cart?

Traditional shopping lists force people to stop what they are doing, open an app, find the right field, and type.

Voice Cart is designed around the opposite interaction:

> **Think → speak → understand → execute → recommend.**

A user can say:

> “Add five eggs, two breads, and some oat milk. Then find orange juice under five dollars.”

Voice Cart can transform that single request into multiple structured intents, update the list, search the catalog, and present relevant recommendations without requiring the user to navigate a complex UI.

### Product pillars

| Pillar | What Voice Cart does |
|---|---|
| 🎙️ Voice-first | Continuous speech capture, transcript feedback, and voice commands |
| 🧠 Intent-aware | Converts natural language into structured shopping actions |
| 🌎 Multilingual | English, Hindi, Spanish, French, and German command examples |
| 🛍️ Catalog-aware | Product lookup, brand matching, price constraints, and categories |
| 🤖 Recommendation-ready | Seasonal, substitution, history, and ML-inspired recommendation signals |
| ⚡ Resilient | Deterministic local fallback when the LLM path is unavailable |
| 🎨 UX-focused | Real-time execution states, category grouping, progress, and animated feedback |

---

## 🚀 Demo & Links

| Resource | Link |
|---|---|
| Live production app | https://voice-cart-one.vercel.app/ |
| GitHub repository | https://github.com/Anuraagsingh132/Voice-Cart |
| Local development | `http://localhost:3000` |

> **Note:** The current implementation is client-centric and designed to run without a persistent backend database. The architecture described below includes an extensible path toward production-scale personalization and recommendation infrastructure.

---

# 🌟 Feature Highlights

## 1. 🎙️ Continuous Voice Capture + Semantic Noise Gate

Voice Cart keeps the interaction lightweight by supporting continuous listening rather than requiring the user to repeatedly press a “record” button.

### Execution pipeline

```text
Microphone
   │
   ▼
Speech Recognition
   │
   ▼
Streaming Transcript
   │
   ▼
Shopping-Relevance Gate
   │
   ├── Non-shopping chatter ──► Ignore
   │
   └── Shopping command ──────► Parse intent
```

Examples that should be ignored:

- “What time is it?”
- “Yeah, I spoke to him.”
- “Turn on the TV.”

Examples that should execute:

- “Add milk.”
- “Remove bread.”
- “Find juice under five dollars.”

The UI exposes visible execution stages:

`Spoken → Parsed → Executed`

That makes the system easier to demo, debug, and reason about.

---

## 2. 🧠 Compound NLP + Phonetic Normalization

Voice Cart is designed for commands that are more natural than one-item-per-command interactions.

### Example

**Input**

> “Add 5 eggs and two breads, then search for juice under $5.”

**Structured interpretation**

```json
{
  "intents": [
    {
      "intent": "ADD_ITEM",
      "items": [
        { "item": "eggs", "qty": 5, "unit": "count" },
        { "item": "bread", "qty": 2, "unit": "count" }
      ]
    },
    {
      "intent": "SEARCH",
      "query": "juice",
      "filters": {
        "priceMax": 5
      }
    }
  ]
}
```

### Hybrid parsing strategy

```text
                    User utterance
                          │
                          ▼
                Normalization layer
                          │
             ┌────────────┴────────────┐
             │                         │
             ▼                         ▼
      Deterministic fast path     LLM semantic path
       regex / heuristics       Groq GPT OSS 20B/120B Cascade
             │                         │
             └────────────┬────────────┘
                          ▼
                 Canonical JSON intent
                          │
                          ▼
                   Action executor
```

The current project already includes a deterministic fallback, making the experience more resilient when the hosted LLM path is unavailable.

---

## 3. 🌎 Multilingual Voice Commands

The project includes multilingual command examples for:

- 🇺🇸 English
- 🇮🇳 Hindi
- 🇪🇸 Spanish
- 🇫🇷 French
- 🇩🇪 German

Example:

> “doodh jod do”

→ **Add milk**

The architecture can be extended with language-specific normalization dictionaries, locale-aware quantity parsing, and multilingual embeddings.

---

# 4. 📦 BigBasket Catalog Integration

Voice Cart integrates a massive **BigBasket Product Catalog** featuring over 27,000 grocery items, complete with detailed product imagery, brand data, categories, sub-categories, and price constraints.

Current product coverage includes comprehensive real-world items across areas such as:

- Fresh Fruits & Vegetables
- Dairy & Bakery
- Staples & Spices
- Snacks & Branded Foods
- Beverages
- Personal Care & Household

The catalog abstraction intentionally separates **product identity** from **spoken phrasing**, allowing “malk,” “melk,” “milk,” or similar variants to resolve toward the same canonical product concept and map perfectly into the 27,000+ item database.

---

# 5. 🤖 Smart Recommendations

Recommendations are intentionally advisory rather than destructive.

A suggestion can be triggered by multiple signals:

```text
                 ┌────────────────────┐
                 │ Current list       │
                 └─────────┬──────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
     Seasonality       Substitutes      History
          │                │                │
          └────────────────┼────────────────┘
                           ▼
                 Candidate generation
                           │
                           ▼
                    Ranking / scoring
                           │
                           ▼
                 Explainable suggestion
```

### Existing recommendation concepts

**☀️ Seasonal**
- Watermelon → summer
- Valencia oranges / ginger → winter-oriented examples

**🌱 Healthy or dietary substitutes**
- Dairy milk → oat milk / soy milk

**🔄 Shopping history**
- Frequently purchased staples can be resurfaced as recommendations

### Recommendation UX principle

> **Recommend, never silently add.**

The user remains in control with an explicit add/increment action.

---

# 6. 🧪 ML-Ready Recommendation Architecture

The current repository contains deterministic recommendation logic. The following layer is an **illustrative future architecture**, useful for demonstrating how Voice Cart could evolve into a machine-learning recommendation system without changing the product surface.

## Candidate features

For each `(user, product)` pair, a recommender could construct features such as:

```text
user_features
├── recent purchase frequency
├── category affinity
├── average basket size
├── preferred price band
├── preferred brands
└── dietary preferences

product_features
├── category
├── brand
├── price
├── seasonality
├── dietary tags
├── text embedding
└── co-purchase statistics

context_features
├── current list contents
├── day of week
├── month / season
├── current search query
└── current language
```

## Illustrative scoring function

A portfolio/demo implementation could expose a transparent scoring decomposition such as:

```text
recommendation_score =
    0.30 × history_affinity
  + 0.20 × co_purchase_score
  + 0.15 × category_affinity
  + 0.15 × semantic_similarity
  + 0.10 × seasonal_fit
  + 0.10 × price_fit
```

These weights are **illustrative design values, not measured production weights**.

### Candidate-generation pipeline

```text
                        Shopping list
                             │
                             ▼
                  Candidate retrieval
            ┌────────────────┼────────────────┐
            │                │                │
            ▼                ▼                ▼
        Substitute       Co-purchase      Semantic
         candidates       candidates       candidates
            │                │                │
            └────────────────┼────────────────┘
                             ▼
                       Feature builder
                             │
                             ▼
                      Ranking model
                             │
                             ▼
                   Explainability layer
                             │
                             ▼
                    Recommendation card
```

### Example ML evolution path

**V1 — Rules**
- Seasonal dictionaries
- Substitute maps
- Fuzzy matching

**V2 — Hybrid ranking**
- Rules + similarity score + purchase frequency
- Lightweight ranking model
- Feature-weighted explanations

**V3 — Learned personalization**
- Two-tower retrieval or embedding retrieval
- Learning-to-rank model
- Session/context features

**V4 — Feedback loop**
- Add / ignore / dismiss events
- Ranking evaluation
- Personalization updates

---

# 7. 🔍 Voice-Activated Catalog Search

Voice search supports commands such as:

> “Find organic apples.”

> “Find juice under five dollars.”

> “Search for Arla milk.”

The search pipeline can parse:

```text
query
brand
category
priceMax
priceMin
dietary constraint
```

Then apply those filters to the product catalog.

### Example

```json
{
  "intent": "SEARCH",
  "query": "juice",
  "filters": {
    "priceMax": 5
  }
}
```

The search tray surfaces matches with direct `+ Add` controls and quantity interaction.

---

# 8. 🎨 Design System

The UI uses a cohesive visual language:

```text
Emerald ───── primary action
Rose ──────── active listening / danger
Amber ─────── processing
Neutral ───── resting / background
```

Department styling is intentionally quieter than the primary interaction layer, helping the voice workflow remain the visual focus.

The layout is designed around a responsive `max-w-7xl` container with category-aware shopping-list organization.

---

# 🏗️ Architecture

## High-Level System Architecture

```text
┌────────────────────────────────────────────────────────────────────────────┐
│                            VOICE CART PLATFORM                             │
└────────────────────────────────────────────────────────────────────────────┘

     ┌────────────────────── USER INTERFACE ──────────────────────┐
     │                                                            │
     │  🎙 Voice        ⌨ Manual Input      🔎 Catalog Search     │
     │     │                  │                    │              │
     │     └──────────────────┼────────────────────┘              │
     │                        ▼                                   │
     │               Transcript / Command                         │
     │                        │                                   │
     └────────────────────────┼───────────────────────────────────┘
                              ▼
                    ┌───────────────────┐
                    │ Relevance / Noise │
                    │       Gate        │
                    └─────────┬─────────┘
                              │
                              ▼
              ┌────────────────────────────────┐
              │        INTENT ORCHESTRATOR     │
              │                                │
              │  deterministic parser          │
              │        +                       │
              │  Groq GPT OSS semantic parser cascade │
              └──────────────┬─────────────────┘
                             │
                             ▼
                    Structured JSON Intent
                             │
              ┌──────────────┼───────────────┐
              │              │               │
              ▼              ▼               ▼
        ADD / REMOVE      SEARCH          MODIFY
              │              │               │
              └──────────────┼───────────────┘
                             ▼
                  ┌────────────────────────┐
                  │ SHOPPING STATE ENGINE  │
                  │                        │
                  │ categorize             │
                  │ fuzzy match             │
                  │ quantity updates       │
                  │ persistence             │
                  └───────────┬────────────┘
                              │
                ┌─────────────┼──────────────────┐
                │             │                  │
                ▼             ▼                  ▼
           Product        Recommendation      UI state
           Catalog            Engine          + telemetry
                │             │                  │
                │      ┌──────┴───────┐          │
                │      │              │          │
                │   seasonal       history       │
                │   substitutes    signals       │
                │      │              │          │
                └──────┴──────┬───────┘          │
                              ▼                  │
                         Ranked recs ────────────┘
```

---

# 🔄 End-to-End Request Flow

```text
1. Speak
   │
   ▼
2. Web Speech API
   │
   ▼
3. Transcript normalization
   │
   ▼
4. Shopping relevance gate
   │
   ├── irrelevant → stop
   │
   └── relevant
         │
         ▼
5. Intent parser
   │
   ├── deterministic fast path
   │
   └── Groq GPT OSS fallback / semantic cascade
         │
         ▼
6. Canonical intent JSON
   │
   ▼
7. Shopping List State Engine
   │
   ├── add
   ├── remove
   ├── modify
   ├── search
   └── clear
         │
         ▼
8. Recommendation layer
   │
   ├── substitute
   ├── seasonal
   ├── history
   └── ML-ready ranking
         │
         ▼
9. Explainable UI card
   │
   ▼
10. User confirms / adds
```

---

# 🧩 Repository Structure

```text
Voice-Cart/
├── app/
│   ├── api/
│   │   └── parse-intent/
│   │       └── route.ts             # Groq intent parsing endpoint
│   ├── globals.css                  # Global styles and animations
│   ├── icon.svg                     # App icon / favicon
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Main dashboard controller
│
├── components/
│   ├── Header.tsx                   # Navigation + live voice status
│   ├── LanguageSelector.tsx         # EN / HI / ES / FR / DE
│   ├── ListItem.tsx                 # Item row, checkbox, stepper
│   ├── ManualInput.tsx              # Manual command capsule
│   ├── SearchResults.tsx            # Catalog search tray
│   ├── ShoppingList.tsx             # Grouped list + progress
│   ├── Suggestions.tsx              # Recommendation carousel
│   ├── VoiceButton.tsx              # Main microphone interaction
│   ├── VoiceCommandGuide.tsx        # Voice examples
│   └── VoiceStatus.tsx              # Transcript / execution state
│
├── context/
│   └── ShoppingListContext.tsx      # State, CRUD, search, recs
│
├── data/
│   ├── products.json                # 27k+ product catalog
│   ├── seasonal.json                # Seasonal mappings
│   └── substitutes.json             # Substitute rules
│
├── hooks/
│   ├── useLocalStorage.ts           # Persistence
│   └── useSpeechRecognition.ts      # Continuous listening
│
├── lib/
│   ├── categorize.ts                # Department classification
│   ├── fuzzyMatch.ts                # Similarity matching
│   ├── intentParser.ts              # NLP heuristics + relevance gate
│   ├── search.ts                    # Catalog search and filters
│   └── suggestions.ts               # Recommendation logic
│
├── public/
│   └── dataset/                     # Product imagery
│
├── __tests__/
│   └── *.test.ts                    # Vitest test suites
│
├── APPROACH.md
└── README.md
```

---

# 🧑💻 Reviewer Acceptance Walkthrough

A reviewer can validate the core assessment requirements in a few minutes.

### Test 1 — Basic voice add

Say:

> “Add 2 bottles of milk.”

Expected:

```text
Dairy & Eggs
└── Milk × 2 bottles
```

### Test 2 — Natural-language variation

Say:

> “I want to buy bananas.”

Expected:

```text
Bananas × 1
```

### Test 3 — Compound command

Say:

> “Add five eggs and two breads.”

Expected:

```text
Dairy & Eggs
└── Eggs × 5

Bakery & Snacks
└── Bread × 2
```

### Test 4 — Remove / modify

Say:

> “Change milk to 4.”

Then:

> “Remove bread from my list.”

Expected: the list updates deterministically and shows visual confirmation.

### Test 5 — Search constraints

Say:

> “Find juice under $5.”

Expected: the search tray opens with a price ceiling.

### Test 6 — Multilingual example

Say:

> “doodh jod do”

Expected: milk is recognized and added.

### Test 7 — Smart suggestion

Add a relevant product such as milk.

Expected: a substitute or contextual recommendation appears with an explanation and an explicit add action.

### Test 8 — Noise handling

Say:

> “What is the weather today?”

Expected: the command is ignored by the shopping relevance gate.

# 🧪 Testing & Reliability

The current project reports **73 passing unit tests** across 14 suites.


Run:

```bash
npm test
```

### Test coverage highlights

| Suite | Coverage |
|---|---|
| `intentParser.test.ts` | Single + compound commands, phonetic normalization, irrelevant chatter |
| `search.test.ts` | Keyword matching, price ceilings, brands, categories |
| `suggestions.test.ts` | Plant-based substitutes, seasonal picks, duplicates |
| `categorize.test.ts` | Department classification |
| `deterministicEngine.test.ts` | Fast-path routing and intent mapping |
| `orchestrator.test.ts` | End-to-end orchestration, telemetry, idempotent actions |
| `resilience.test.ts` | Fallbacks, duplicate prevention, timeout handling |

### Reliability strategy

```text
            External / probabilistic layer
                         │
                         ▼
                   LLM response
                         │
                 schema validation
                         │
                         ▼
                  canonical intent
                         │
                         ▼
                deterministic action
                         │
                         ▼
               idempotent state update
```

This is intentionally safer than allowing free-form model output to directly mutate UI state.

---

# 🛡️ Safety, Privacy & Trust

Voice assistants should optimize for convenience without sacrificing user control.

### Design principles

- **Explicit actions:** recommendations never silently add items.
- **Deterministic execution:** structured intents are validated before state mutation.
- **Graceful degradation:** local parsing can keep basic commands functional without the LLM path.
- **Minimal state footprint:** the current implementation emphasizes browser-local persistence.
- **Explainability:** recommendation cards can communicate the primary reason for a suggestion.
- **Clear execution states:** users can see whether something was merely spoken, parsed, or executed.

### Production-hardening opportunities

For a production deployment, consider:

```text
Authentication
    ↓
Per-user shopping state
    ↓
Consent / privacy controls
    ↓
Encrypted server-side storage
    ↓
Event pipeline with retention policy
    ↓
Model feature store
```

---

# 📈 Observability & Evaluation

A production-grade voice shopping assistant should measure more than page performance.

## Suggested product metrics

```text
Voice activation rate
Intent parse success rate
False-positive execution rate
Average commands per session
Add-to-list conversion
Recommendation acceptance rate
Recommendation dismissal rate
Search-to-add conversion
Average basket size
Repeat shopping frequency
```

## Suggested model metrics

```text
Intent accuracy
Entity extraction F1
Quantity extraction accuracy
Brand recognition accuracy
Search precision@K
Recommendation precision@K
Recommendation recall@K
NDCG@K
Calibration / confidence quality
```

## Illustrative internal dashboard

> The following values are **fictional example targets**, included only to demonstrate how the project could present ML/product KPIs. They are not claims about the current production deployment.

| Metric | Example target |
|---|---:|
| Intent parse success | 95%+ |
| Compound command accuracy | 92%+ |
| Search precision@5 | 90%+ |
| Recommendation acceptance | 18–25% |
| Voice false-positive rate | <2% |
| Median command-to-result latency | <700 ms |

---

# 🧠 Recommendation Feedback Loop

A stronger personalization system could learn from explicit and implicit signals.

```text
                  ┌─────────────────┐
                  │ Recommendation │
                  └────────┬────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
        Added           Dismissed         Ignored
          │                │                │
          └────────────────┼────────────────┘
                           ▼
                     Event stream
                           │
                           ▼
                    Feature builder
                           │
                           ▼
                  Offline evaluation
                           │
                           ▼
                    Model retraining
                           │
                           ▼
                    New ranker
                           │
                           ▼
                    Online serving
```

A future implementation could add:

- recommendation impressions
- positive / negative feedback
- session context
- product co-occurrence matrices
- semantic product embeddings
- personalized ranking
- A/B testing
- feature drift monitoring

---

# ⚡ Performance Strategy

Voice UX is highly latency-sensitive.

The system can be thought of as a latency budget:

```text
Speech recognition       → low hundreds of ms+
Transcript normalization → ~1–10 ms
Deterministic parsing     → ~1–20 ms
LLM parsing               → model/API dependent
State mutation            → ~1–10 ms
React re-render           → typically small
```

The key architectural choice is therefore:

> **Use deterministic logic for simple commands; reserve semantic model inference for ambiguous or richer language.**

This reduces unnecessary model calls while retaining natural-language flexibility.

---

# 🛠️ Local Setup

## Prerequisites

- Node.js `18.17.0` or newer
- npm or yarn
- Google Chrome or Microsoft Edge for Web Speech API support

## Installation

```bash
# Clone
git clone https://github.com/Anuraagsingh132/Voice-Cart.git

# Enter project
cd Voice-Cart

# Install dependencies
npm install

# Optional: configure Groq
cp .env.local.example .env.local

# Run tests
npm test

# Start development server
npm run dev
```

Open:

```text
http://localhost:3000
```

### Environment variables

```env
GROQ_API_KEY=your_key_here
```

Without the key, the project can fall back to its built-in client-side deterministic NLP path for supported commands.

---

# 🎙️ Voice Command Cheat Sheet

| Intent | Example command | Expected behavior |
|---|---|---|
| Add | “Add 2 bottles of milk” | Add milk × 2 |
| Compound add | “5 eggs and two breads” | Add eggs × 5 and bread × 2 |
| Phonetic normalization | “Add two breadth and malk” | Normalize toward bread + milk |
| Modify | “Change milk to 4” | Update milk quantity |
| Remove | “Remove bread from my list” | Remove bread |
| Voice search | “Find juice under $5” | Search juice with price ceiling |
| Brand search | “Search for Oatly” | Filter to matching brand/products |
| Substitute | “Add milk” | Show compatible plant-based alternatives |
| Multilingual | “doodh jod do” | Add milk |
| Noise gate | “What is the weather today?” | Ignore as non-shopping |
| Clear | “Clear my shopping list” | Empty list |

---

# 🧭 Roadmap

## ✅ Current

- [x] Continuous voice interaction
- [x] Compound multi-item commands
- [x] Phonetic normalization
- [x] Deterministic local fallback
- [x] Multilingual examples
- [x] Product catalog integration
- [x] Seasonal recommendations
- [x] Substitute recommendations
- [x] Voice search
- [x] Price / brand constraints
- [x] 73 automated tests


## 🔜 Near term

- [ ] Persistent user profiles
- [ ] Recommendation feedback events
- [ ] Semantic embeddings for product matching
- [ ] Explainable ranking scores
- [ ] Richer dietary and allergy filters
- [ ] Better multilingual entity normalization
- [ ] Performance telemetry dashboard

## 🚀 Future

- [ ] Learned-to-rank recommendation model
- [ ] Personalized co-purchase graph
- [ ] Two-tower retrieval architecture
- [ ] A/B testing platform
- [ ] Streaming event analytics
- [ ] Store-aware inventory / pricing
- [ ] Offline-first mobile experience
- [ ] Personalized meal-plan-to-cart generation

---

# 🏆 What Makes the Architecture Interesting?

Voice Cart is more than a speech-to-text demo.

It demonstrates the intersection of:

```text
Speech Interfaces
       +
Natural Language Understanding
       +
Deterministic Systems
       +
Search
       +
Recommendation Systems
       +
Personalization
       +
Explainable UX
       +
Resilient Frontend Architecture
```

The important engineering idea is the boundary between **probabilistic intelligence** and **deterministic execution**.

The LLM can interpret messy human language.

The state engine decides exactly what action is allowed.

That separation makes the experience easier to test, debug, explain, and eventually scale.

---

# 📐 Engineering Principles

### 1. Probabilistic in, deterministic out

```text
Natural language
      ↓
Probabilistic interpretation
      ↓
Validated schema
      ↓
Deterministic state transition
```

### 2. Fast path before expensive path

Simple commands should not require a full semantic inference request.

### 3. Recommendations remain advisory

AI should suggest; the user should decide.

### 4. Every recommendation needs a reason

Users trust recommendations more when the system explains whether the suggestion came from seasonality, substitution, history, similarity, or context.

### 5. Build for graceful failure

A dependency outage should reduce intelligence, not destroy the core shopping-list workflow.

---

# 📝 Assessment Approach — 200 Words Max

Voice Cart was implemented as a voice-first shopping assistant with a strong focus on a complete end-to-end user journey. The browser captures speech using the Web Speech API and shows the transcript and execution state in real time. A semantic relevance gate prevents unrelated background conversation from becoming shopping actions.

Natural-language commands are converted into structured intents using a hybrid strategy: deterministic parsing handles common commands quickly, while Groq GPT OSS 20B/120B Cascade can interpret richer phrasing. The resulting intent is validated and passed into a deterministic shopping-list state engine responsible for add, remove, modify, categorization, quantities, search, and persistence.

Smart suggestions combine seasonal rules, product substitutions, and shopping-history-oriented signals. Voice search supports product, brand, and price constraints. The UI is responsive and intentionally simple so the primary interaction remains voice-driven.

To keep the solution realistic for an 8-hour assessment, the implementation avoids unnecessary backend infrastructure while retaining clear extension points for authentication, persistent profiles, learned recommendation ranking, event analytics, and production observability.

# 📚 Engineering Notes

The detailed engineering trade-offs, implementation rationale, and requirement-compliance discussion are documented in [`APPROACH.md`](./APPROACH.md).

---

# 📦 Assessment Deliverables

### 1. Working application URL

**https://voice-cart-one.vercel.app/**

### 2. GitHub repository

**https://github.com/Anuraagsingh132/Voice-Cart**

### 3. Technical documentation

- `README.md` — architecture, features, setup, testing, assessment mapping
- `APPROACH.md` — engineering trade-offs and implementation rationale

### Reviewer checklist

```text
[✓] Working hosted application
[✓] GitHub source repository
[✓] Voice input
[✓] NLP / natural-language variation
[✓] Multilingual command support
[✓] Smart suggestions
[✓] Seasonal recommendations
[✓] Substitutes
[✓] Add / remove / modify
[✓] Categorization
[✓] Quantity parsing
[✓] Voice search
[✓] Price / brand filtering
[✓] Responsive UI
[✓] Real-time visual feedback
[✓] Tests
[✓] Error / fallback path
[✓] Documentation
```

# 🙌 Acknowledgements

- **Groq** for low-latency LLM inference
- **BigBasket** for the massive real-world product catalog integration
- **Next.js** and **React** for the application framework
- **Tailwind CSS** for styling
- **Vitest** for testing

---

# 📜 License

See the repository's [`LICENSE`](./LICENSE) file for the applicable license.

---

## ⭐ Final Takeaway

> **Voice Cart is a voice-first shopping assistant designed around a simple principle: make the interface disappear while keeping the system understandable.**

Speak naturally.  
Let the system structure the intent.  
Use deterministic logic to execute.  
Use recommendations to assist.  
Keep the user in control.
