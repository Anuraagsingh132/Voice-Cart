import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { ParsedIntent } from '@/types';
import { correctTranscriptPhonetics, resolveGroceryItem } from '@/lib/phoneticMatcher';

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

    const preCleaned = correctTranscriptPhonetics(transcript);

    const systemPrompt = `You are an expert AI assistant for a Voice Command Shopping List application.
Your job is to parse spoken voice commands into clean, structured JSON representing grocery shopping actions.

CRITICAL GROCERY PHONETIC & MULTILINGUAL CORRECTION RULES:
1. Speech-to-text often mishears accented, multilingual, or fast grocery names into non-grocery words:
   - "adventure" / "advent" / "adrak" -> "Ginger"
   - "telugu" / "tail" / "tel" -> "Cooking Oil"
   - "leak" / "leaks" -> "Leek"
   - "flower" / "flouer" / "atta" -> "Flour" (or "Wheat Flour (Atta)")
   - "serial" -> "Cereal"
   - "breadth" / "bred" / "pav" -> "Bread"
   - "malk" / "melk" / "doodh" / "dudh" -> "Milk"
   - "ande" / "anda" / "huevos" / "oeufs" -> "Eggs"
   - "kela" / "platano" / "banan" -> "Bananas"
   - "pani" / "paani" / "agua" -> "Water"
   - "pyaz" / "piaz" / "cebolla" -> "Onions"
   - "aalu" / "alu" / "patata" -> "Potatoes"
   - "tamatar" / "tomate" -> "Tomatoes"
   - "dahi" / "curd" -> "Yogurt"
   - "paneer" / "panir" -> "Paneer"

2. RESIDUAL SPEECH & NON-GROCERY FILTER (CRITICAL):
   If the spoken phrase is casual conversation, general questions, noise, or unrelated to groceries (e.g. "what time is it", "who are you", "yeah I saw that", "why these", "hello", "okay bye", "turn on lights", "great job"):
   You MUST return:
   {
     "intent": "UNKNOWN",
     "confidence": 0,
     "explanation": "Filtered background talk / non-grocery speech"
   }
   NEVER convert random words like "adventure", "telugu", "movie", "weather" into an ADD item unless explicitly commanded as a grocery context.

3. SUPPORTED INTENTS:
   - "ADD": Add one or more grocery items (e.g., "Add 2 leeks and ginger", "5 eggs and two breads", "get milk and bananas").
   - "REMOVE": Delete item(s) (e.g., "Remove milk from list", "delete eggs").
   - "MODIFY": Update quantity/unit (e.g., "Change apples to 5", "make milk 2 liters").
   - "SEARCH": Search catalog (e.g., "Find toothpaste under $5", "look for organic milk").
   - "CLEAR": Clear whole shopping list (e.g., "clear list", "empty cart").
   - "HELP": Voice help (e.g., "what commands can I say").
   - "UNKNOWN": Non-shopping speech or ungrounded input.

JSON OUTPUT SCHEMA:
{
  "intent": "ADD" | "REMOVE" | "MODIFY" | "SEARCH" | "CLEAR" | "HELP" | "UNKNOWN",
  "items": [
    {
      "item": string,           // Standardized grocery name (e.g. "Leek", "Ginger", "Eggs", "Milk")
      "quantity": number,       // Parsed quantity (default 1)
      "unit": string,           // "pieces", "bottles", "packs", "kg", "liters", "dozen", "bunches", "cans", "boxes"
      "brand": string | null
    }
  ],
  "item": string | null,        // Primary item name summary
  "quantity": number,           // First item quantity
  "unit": string,               // First item unit
  "targetItem": string | null,  // For MODIFY
  "filters": {
    "brand": string | null,
    "priceMax": number | null,
    "priceMin": number | null,
    "size": string | null,
    "category": string | null
  },
  "confidence": number,
  "explanation": string
}

Return ONLY valid JSON.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Language: ${language}\nSpoken command: "${preCleaned}"`,
        },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.05,
      max_tokens: 450,
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

    // Secondary Grounding Pass: Verify and clean item names against ontology
    if (parsed.intent === 'ADD' && parsed.items && parsed.items.length > 0) {
      for (const it of parsed.items) {
        const resolution = resolveGroceryItem(it.item);
        if (resolution.matched) {
          it.item = resolution.resolvedName;
        }
      }
      parsed.item = parsed.items.map((i) => i.item).join(', ');
    } else if (parsed.intent === 'ADD' && parsed.item) {
      const resolution = resolveGroceryItem(parsed.item);
      if (resolution.matched) {
        parsed.item = resolution.resolvedName;
        if (parsed.items && parsed.items[0]) {
          parsed.items[0].item = resolution.resolvedName;
        }
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
