import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { ParsedIntent } from '@/types';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transcript, language = 'en-US' } = body;

    if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
      return NextResponse.json(
        { error: 'Empty transcript provided' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;

    // If no Groq API Key is configured in environment, return a helpful notice
    if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GROQ_API_KEY') {
      return NextResponse.json(
        {
          error: 'GROQ_API_KEY_NOT_CONFIGURED',
          message: 'Groq API key not set in environment. Using client-side NLP parser.',
        },
        { status: 200 }
      );
    }

    const groq = new Groq({ apiKey });

    const systemPrompt = `You are a specialized AI assistant for a Voice Command Shopping List application.
Your job is to parse the user's spoken voice command into a structured JSON object representing their intent.

The user might speak in English, Hindi ("doodh jod do", "kela hatao"), Spanish ("agrega leche", "buscar pasta"), French, German, or mixed phrasing.
Translate the recognized item name into clear English or standard grocery terms.

SUPPORTED INTENTS:
- "ADD": User wants to add one or more items to their shopping list (e.g., "Add milk", "I need 2 bottles of water", "I want to buy bananas", "put eggs on the list", "doodh daalo").
- "REMOVE": User wants to remove/delete an item from list (e.g., "Remove milk from my list", "delete apples", "take out bread", "kela hatao").
- "MODIFY": User wants to change the quantity or unit of an existing item (e.g., "Change apples to 3", "make bananas 5", "update milk to 2 liters", "increase eggs to 12").
- "SEARCH": User wants to search for products or filter by brand/price (e.g., "Find me organic apples", "Find toothpaste under $5", "search for Fresho milk", "show gluten free snacks").
- "CLEAR": User wants to clear/empty the whole shopping list (e.g., "Clear my list", "empty cart", "delete everything").
- "HELP": User asks what commands they can say (e.g., "what can I do", "help me").
- "UNKNOWN": If the user's speech is completely unrelated or nonsensical.

JSON OUTPUT SCHEMA:
{
  "intent": "ADD" | "REMOVE" | "MODIFY" | "SEARCH" | "CLEAR" | "HELP" | "UNKNOWN",
  "item": string | null,         // Clean normalized item name (e.g. "Milk", "Organic Fuji Apples", "Toothpaste")
  "quantity": number,            // Numeric quantity (default 1 if unspecified)
  "unit": string,                // Standard unit: "pieces", "bottles", "kg", "grams", "liters", "packs", "cans", "boxes", "bunch", "carton"
  "targetItem": string | null,   // For MODIFY, the item to change
  "filters": {
    "brand": string | null,      // e.g., "Fresho", "Colgate", "Amul"
    "priceMax": number | null,   // Max price ceiling if mentioned (e.g., "under $5" -> 5)
    "priceMin": number | null,   // Min price floor if mentioned (e.g., "above $3" -> 3)
    "size": string | null,       // e.g., "1kg", "large", "500ml"
    "category": string | null    // e.g., "Dairy", "Produce", "Personal Care"
  },
  "confidence": number,          // Float between 0.0 and 1.0
  "explanation": string          // Brief 1-sentence explanation of what was extracted
}

CRITICAL RULES:
1. Return ONLY pure valid JSON without markdown wrapping or code fences.
2. For "Add 2 bottles of water" -> intent: "ADD", item: "Water", quantity: 2, unit: "bottles".
3. For "Find toothpaste under $5" -> intent: "SEARCH", item: "Toothpaste", filters: { priceMax: 5 }.
4. For "Change apples to 3" -> intent: "MODIFY", item: "Apples", quantity: 3.
5. For "I want to buy bananas" -> intent: "ADD", item: "Bananas", quantity: 1, unit: "bunch".
6. Always extract realistic numeric bounds for priceMax/priceMin when user says "under $X", "less than X", "cheaper than X", "between X and Y".`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Language: ${language}\nSpoken command: "${transcript}"`,
        },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    });

    const content = chatCompletion.choices[0]?.message?.content?.trim() || '{}';
    let parsed: ParsedIntent;

    try {
      parsed = JSON.parse(content);
    } catch {
      // Clean possible stray characters
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse JSON response from LLM');
      }
    }

    parsed.rawQuery = transcript;
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('API /api/parse-intent Error:', error);
    return NextResponse.json(
      {
        error: 'PARSING_FAILED',
        message: error?.message || 'Failed to process voice intent',
      },
      { status: 500 }
    );
  }
}
