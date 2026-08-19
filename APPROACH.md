# Engineering Approach: Voice Command Shopping Assistant

The app uses the browser Web Speech API for transcription and sends the resulting text to a small Next.js API route. When `GROQ_API_KEY` is configured, Groq extracts structured shopping intents; a deterministic client parser remains available for common English, Hindi, Spanish, French, and German commands when the service is unavailable.

Shopping-list state and prior additions are stored in `localStorage`. New items are categorized with transparent rules, while opt-in suggestions combine the user’s own prior additions, the current season, and a curated substitute map. No sample purchase history is injected for a new user.

Search runs against a documented local catalog with name, brand, package-size, and price filtering. This deliberately avoids a retailer integration so the demo remains reproducible and free to run. The interface is mobile-first, shows live recognition/processing feedback, and includes typed input for browsers without speech recognition.

Trade-off: the catalog and recommendations are deterministic rather than personalized by a remote service; this keeps the take-home testable while making the boundary explicit.
