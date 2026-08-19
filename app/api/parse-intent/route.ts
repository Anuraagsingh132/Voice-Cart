import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { ParsedIntent } from '@/types';

export const runtime = 'nodejs';

const VALID_INTENTS = new Set(['ADD', 'REMOVE', 'MODIFY', 'SEARCH', 'CLEAR', 'HELP', 'UNKNOWN']);

function isParsedIntent(value: unknown): value is ParsedIntent {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.intent !== 'string' || !VALID_INTENTS.has(candidate.intent)) return false;
  if (candidate.item != null && typeof candidate.item !== 'string') return false;
  if (candidate.quantity != null && (typeof candidate.quantity !== 'number' || !Number.isFinite(candidate.quantity))) return false;
  if (candidate.items != null && !Array.isArray(candidate.items)) return false;
  if (candidate.filters != null && typeof candidate.filters !== 'object') return false;
  return true;
}

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

    const groq = new Groq({ apiKey, timeout: 8000, maxRetries: 1 });

    const systemPrompt = `You are an expert AI assistant for a Voice Command Shopping List application.
Your job is to parse spoken voice commands into clean, structured JSON representing user intent.

The user might speak in English, Hindi ("doodh jod do", "kela aur bread"), Spanish ("agrega leche y pan"), French, German, or mixed phrases.
CRITICAL: Correct phonetic speech-to-text misspellings into standard grocery items:
- "breadth" / "bred" -> "Bread"
- "malk" / "melk" / "doodh" -> "Milk"
- "ande" / "egg" -> "Eggs"
- "banan" / "kela" -> "Bananas"
- "watar" / "pani" -> "Water"

SUPPORTED INTENTS:
- "ADD": User wants to add one or MORE items (e.g., "5 eggs and two breads", "Add milk, 2 apples and bread", "I want to buy bananas").
- "REMOVE": User wants to remove one or more items (e.g., "Remove milk from my list", "delete eggs and apples").
- "MODIFY": User wants to change quantity/unit (e.g., "Change apples to 3", "make bananas 5").
- "SEARCH": User wants to search/filter products (e.g., "Find me organic apples", "Find toothpaste under $5").
- "CLEAR": User wants to clear/empty the whole shopping list.
- "HELP": User asks what commands they can say.
- "UNKNOWN": Completely unrelated speech, casual conversation, or background talk.

RESIDUAL TALK FILTER (CRITICAL):
The microphone is always active. If the user says casual non-shopping conversation (e.g., "what time is it", "yeah I saw that", "how are you", "thank you", "okay bye", "turn up the TV", "hello", "yes", "no"):
You MUST return:
{
  "intent": "UNKNOWN",
  "confidence": 0,
  "explanation": "Filtered background talk"
}
Do NOT attempt to force non-shopping conversations into an ADD intent.

COMPOUND MULTI-ITEM SUPPORT (VERY IMPORTANT):
If the user mentions multiple items in a single sentence (e.g., "5 eggs and two breads", "milk and cookies", "add 2 waters, 5 apples, and a loaf of bread"):
You MUST populate the "items" array with individual objects for each item!

JSON OUTPUT SCHEMA:
{
  "intent": "ADD" | "REMOVE" | "MODIFY" | "SEARCH" | "CLEAR" | "HELP" | "UNKNOWN",
  "items": [
    {
      "item": string,           // Clean singular or standard grocery name (e.g. "Eggs", "Bread", "Whole Milk")
      "quantity": number,       // Parsed numeric quantity (e.g. 5, 2, 1)
      "unit": string,           // "pieces", "bottles", "packs", "kg", "liters", "cans", "boxes", "loaf"
      "brand": string | null
    }
  ],
  "item": string | null,        // Primary item or comma-separated summary (e.g. "Eggs, Bread")
  "quantity": number,           // First item quantity
  "unit": string,               // First item unit
  "targetItem": string | null,  // For MODIFY, the item to change
  "filters": {
    "brand": string | null,
    "priceMax": number | null,  // Max price ceiling if mentioned (e.g., "under $5" -> 5)
    "priceMin": number | null,
    "size": string | null,
    "category": string | null
  },
  "confidence": number,         // 0.0 to 1.0
  "explanation": string         // Summary message, e.g. "Add 5 Eggs and 2 Bread"
}

EXAMPLES:
1. "5 eggs and two breads" ->
   intent: "ADD",
   items: [
     {"item": "Eggs", "quantity": 5, "unit": "pieces"},
     {"item": "Bread", "quantity": 2, "unit": "pieces"}
   ],
   explanation: "Add 5 Eggs and 2 Bread"

2. "Add 2 bottles of water and milk" ->
   intent: "ADD",
   items: [
     {"item": "Water", "quantity": 2, "unit": "bottles"},
     {"item": "Milk", "quantity": 1, "unit": "pieces"}
   ]

3. "Find toothpaste under $5" ->
   intent: "SEARCH",
   item: "Toothpaste",
   filters: {"priceMax": 5}

Return ONLY pure valid JSON.`;

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
      max_tokens: 400,
      response_format: { type: 'json_object' },
    });

    const content = chatCompletion.choices[0]?.message?.content?.trim() || '{}';
    let parsed: ParsedIntent;

    try {
      parsed = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse JSON response from LLM');
      }
    }

    if (!isParsedIntent(parsed)) {
      return NextResponse.json(
        { error: 'INVALID_MODEL_RESPONSE', message: 'The command parser returned an invalid response.' },
        { status: 502 }
      );
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
