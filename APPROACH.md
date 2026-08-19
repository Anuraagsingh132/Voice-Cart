# Engineering Approach: Voice Command Shopping Assistant

**Problem & Strategy:**
Building a reliable, hands-free shopping assistant requires low latency, natural conversational tolerance, and crisp visual feedback. I designed a voice-first architecture pairing the browser-native Web Speech API with Groq’s high-speed Llama-3.1-8B model for sub-second intent and entity extraction.

**Architecture & Implementation:**
1. **Speech & NLP Pipeline:** Spoken audio streams through the Web Speech API with real-time interim transcription and multilingual support (English, Hindi, Spanish, French, German). The serverless API route proxies commands to Groq Llama 3.1, extracting structured JSON intents (`ADD`, `REMOVE`, `MODIFY`, `SEARCH`) with quantity, units, and price filters. A resilient client-side heuristic fallback guarantees offline reliability.
2. **State & Smart Intelligence:** State is managed via React Context synchronized with `localStorage`. Item additions trigger automatic categorization (e.g., Produce, Dairy, Personal Care) and smart suggestions (seasonal produce, plant-based substitutes like almond milk, and purchase history favorites).
3. **Voice Search & UX:** Users can search and filter catalog items by brand, category, and price bounds (e.g., "toothpaste under $5"). The minimalist mobile-first UI features stateful micro-animations, loading indicators, and manual text fallback.

**Trade-offs:** Client-side storage and curated datasets enabled rapid delivery within the 8-hour budget while maintaining production-quality code.
