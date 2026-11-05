import type {
  CropType,
  Dialect,
  VoiceIntent,
  VoiceIntentPayload,
  ExtractedEntities,
} from '../schemas.js';
import { VoiceIntentPayloadSchema } from '../schemas.js';

// ====================================================
// 1. Phonetic & Agronomic Vernacular Lexicon
// ====================================================

export interface CommodityLexiconEntry {
  canonicalName: string;
  cropType: CropType;
  variants: RegExp[];
}

export const COMMODITY_LEXICON: CommodityLexiconEntry[] = [
  {
    canonicalName: 'Cotton',
    cropType: 'cotton',
    variants: [
      /\b(kapaas|kapas|kapash|narma|cotton|कपास|नरमा|ਕਪਾਹ|ਨਰਮਾ)\b/i,
      /\b(leaf\s*curl|whitefly)\b/i,
    ],
  },
  {
    canonicalName: 'Mustard',
    cropType: 'mustard',
    variants: [
      /\b(sarson|sarsonn|sarso|saron|sarhon|toria|raida|mustard|canola|सरसों|ਸਰ੍ਹੋਂ|ਸਰੋਂ)\b/i,
      /\b(white\s*rust|alternaria)\b/i,
    ],
  },
  {
    canonicalName: 'Rice',
    cropType: 'rice',
    variants: [
      /\b(jhona|jhhona|dhan|dhaan|chawal|chawalan|paddy|rice|धान|चावल|ਝੋਨਾ|ਚਾਵਲ)\b/i,
      /\b(blast|leaf\s*blight)\b/i,
    ],
  },
  {
    canonicalName: 'Wheat',
    cropType: 'wheat',
    variants: [
      /\b(kanak|kanakk|gehun|gehu|gahu|wheat|गेहूं|ਗੇਹੂੰ|ਕਣਕ)\b/i,
      /\b(yellow\s*rust|stripe\s*rust)\b/i,
    ],
  },
];

export const MANDI_LOCATIONS = [
  'Kharar',
  'Kurali',
  'Rupnagar',
  'Ropar',
  'Morinda',
  'Khanna',
  'Samrala',
  'Ludhiana',
  'Sirhind',
  'Fatehgarh Sahib',
  'Rajpura',
  'Patiala',
  'Nabha',
  'Mohali',
  'Doraha',
  'Bathinda',
  'Mansa',
  'Abohar',
  'Malout',
  'Jalandhar',
  'Amritsar',
  'Moga',
  'Barnala',
  'Sangrur',
  'Faridkot',
  'Fazilka',
  'Hoshiarpur',
];

// Regex matching for intents
const INTENT_PATTERNS: Record<VoiceIntent, RegExp[]> = {
  MANDI_PRICE_QUERY: [
    /\b(bhav|bhaav|rate|ret|keemat|kimat|mull|mool|price|prices)\b/i,
    /\b(mandi|mandi\s*bhav|mandi\s*rate|dana\s*mandi|wholesale)\b/i,
    /\b(ਭਾਅ|ਰੇਟ|ਕੀਮਤ|ਮੰਡੀ|ਮੁੱਲ|भाव|रेट|कीमत|मंडी)\b/i,
  ],
  CROP_DISEASE_DIAGNOSIS: [
    /\b(rog|rogg|bimari|dhabbe|dhabba|peele|kaale|patte|pattiyan|sundi|keeda|keede|fungus|rust|blight|curl|pest|infection|spray|ilaaj|treatment)\b/i,
    /\b(ਬਿਮਾਰੀ|ਧੱਬੇ|ਪੱਤੇ|ਕੀੜਾ|ਸੁੰਡੀ|ਇਲਾਜ|रोग|बीमारी|धब्बे|पत्ते|कीड़ा|इल्ली|इलाज)\b/i,
  ],
  IRRIGATION_QUERY: [
    /\b(paani|pani|sinchai|motor|tubewell|tewal|pump|water|watering|irrigation|runtime|schedule|ghante|dooja\s*paani|kadon\s*launa)\b/i,
    /\b(ਪਾਣੀ|ਸਿੰਚਾਈ|ਟਿਊਬਵੈੱਲ|ਮੋਟਰ|पानी|सिंचाई|मोटर|पंप)\b/i,
  ],
  WEATHER_FORECAST: [
    /\b(mausam|mosam|baarish|barish|barsaat|meenh|meen|rain|weather|forecast|hawa|aandhi|badal|toofan|dhoop)\b/i,
    /\b(ਮੀਂਹ|ਮੌਸਮ|ਬਰਸਾਤ|ਹਵਾ|ਬੱਦਲ|मौसम|बारिश|बरसात|आंधी|तूफान|धूप)\b/i,
  ],
  GENERAL_AGRONOMIC: [
    /\b(khad|urea|dap|fertilizer|beej|seed|sowing|variety|subsidy|kheti)\b/i,
    /\b(ਖਾਦ|ਬੀਜ|ਖੇਤੀ|खाद|बीज|खेती)\b/i,
  ],
  UNKNOWN: [],
};

// Dialect markers
const PUNJABI_MARKERS = [
  /\b(vich|ch|de|di|da|ne|nu|kee|kadon|launa|dasso|kinna|paindi|aa\s*gaya|chalda|paya|ji|sade|tuhanu|haanji)\b/i,
  /[\u0A00-\u0A7F]/, // Gurmukhi Unicode Block
];

const HINDI_MARKERS = [
  /\b(mein|ka|ki|ke|kya|hai|hain|kaisa|rahega|chahiye|karein|wali|raha|padega|hoga)\b/i,
  /[\u0900-\u097F]/, // Devanagari Unicode Block
];

/**
 * Detects whether utterance is Hinglish, Punjabi-English, Hindi, Punjabi, or English.
 */
export function detectDialect(text: string): Dialect {
  let punjabiScore = 0;
  let hindiScore = 0;

  for (const regex of PUNJABI_MARKERS) {
    if (regex.test(text)) punjabiScore += 1;
  }

  for (const regex of HINDI_MARKERS) {
    if (regex.test(text)) hindiScore += 1;
  }

  const hasGurmukhi = /[\u0A00-\u0A7F]/.test(text);
  const hasDevanagari = /[\u0900-\u097F]/.test(text);

  if (hasGurmukhi && punjabiScore > hindiScore) return 'punjabi';
  if (hasDevanagari && hindiScore > punjabiScore) return 'hindi';
  if (punjabiScore > 0) return 'punjabi_english';
  if (hindiScore > 0) return 'hinglish';
  return 'english';
}

/**
 * Extracts agronomic entities (crop, commodity, mandi, location) using deterministic phonetic regex.
 */
export function extractEntitiesRegex(text: string): ExtractedEntities {
  const entities: ExtractedEntities = {};

  // 1. Crop & Commodity detection
  for (const entry of COMMODITY_LEXICON) {
    for (const pattern of entry.variants) {
      if (pattern.test(text)) {
        entities.crop = entry.cropType;
        entities.commodity = entry.canonicalName;
        break;
      }
    }
    if (entities.commodity) break;
  }

  // 2. Mandi / Location detection
  for (const mandi of MANDI_LOCATIONS) {
    const regex = new RegExp(`\\b${mandi}\\b`, 'i');
    if (regex.test(text)) {
      entities.mandi = mandi;
      entities.location = mandi;
      break;
    }
  }

  // 3. Quantity extraction (e.g. "50 quintal", "20 qtl")
  const quantityMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:quintal|qtl|bori|quintel|क्विंटल|ਕੁਇੰਟਲ)/i);
  if (quantityMatch && quantityMatch[1]) {
    entities.quantityQuintals = parseFloat(quantityMatch[1]);
  }

  return entities;
}

/**
 * Classifies query intent based on priority matching and keyword scoring.
 */
export function classifyIntentRegex(text: string): {
  intent: VoiceIntent;
  confidence: number;
} {
  // Priority 1: If question asks about price/bhav/rate in mandi
  const hasPriceKeywords = INTENT_PATTERNS.MANDI_PRICE_QUERY.some((r) => r.test(text));
  const hasDiseaseKeywords = INTENT_PATTERNS.CROP_DISEASE_DIAGNOSIS.some((r) => r.test(text));
  const hasIrrigationKeywords = INTENT_PATTERNS.IRRIGATION_QUERY.some((r) => r.test(text));
  const hasWeatherKeywords = INTENT_PATTERNS.WEATHER_FORECAST.some((r) => r.test(text));

  if (hasPriceKeywords) {
    return { intent: 'MANDI_PRICE_QUERY', confidence: 0.95 };
  }

  if (hasDiseaseKeywords) {
    return { intent: 'CROP_DISEASE_DIAGNOSIS', confidence: 0.94 };
  }

  if (hasIrrigationKeywords) {
    return { intent: 'IRRIGATION_QUERY', confidence: 0.93 };
  }

  if (hasWeatherKeywords) {
    return { intent: 'WEATHER_FORECAST', confidence: 0.95 };
  }

  if (INTENT_PATTERNS.GENERAL_AGRONOMIC.some((r) => r.test(text))) {
    return { intent: 'GENERAL_AGRONOMIC', confidence: 0.85 };
  }

  return { intent: 'UNKNOWN', confidence: 0.4 };
}

/**
 * Parses raw voice transcript and optional LLM JSON into a validated VoiceIntentPayload.
 * If LLM JSON is provided, attempts structured extraction and validates with fallback regex.
 */
export function parseVoiceQuery(
  rawText: string,
  llmJsonOutput?: string | Record<string, unknown>
): VoiceIntentPayload {
  const detectedDialect = detectDialect(rawText);
  let intent: VoiceIntent = 'UNKNOWN';
  let confidence = 0.5;
  let extractedEntities: ExtractedEntities = {};

  // Try parsing LLM output if provided
  if (llmJsonOutput) {
    try {
      const parsed =
        typeof llmJsonOutput === 'string'
          ? JSON.parse(llmJsonOutput)
          : llmJsonOutput;

      if (parsed.intent && typeof parsed.intent === 'string') {
        intent = parsed.intent as VoiceIntent;
      }
      if (typeof parsed.confidence === 'number') {
        confidence = parsed.confidence;
      }
      if (parsed.extractedEntities && typeof parsed.extractedEntities === 'object') {
        extractedEntities = { ...parsed.extractedEntities };
      }
    } catch {
      // Fallback directly to deterministic regex
    }
  }

  // If intent was not established or entities were missed by LLM, run fallback regex
  const regexClassification = classifyIntentRegex(rawText);
  if (intent === 'UNKNOWN' || confidence < 0.8) {
    intent = regexClassification.intent;
    confidence = regexClassification.confidence;
  }

  const regexEntities = extractEntitiesRegex(rawText);
  extractedEntities = {
    ...regexEntities,
    ...extractedEntities,
  };

  const payload: VoiceIntentPayload = {
    schemaVersion: 1,
    queryId: `voice_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    rawText,
    detectedDialect,
    intent,
    confidence: Number(confidence.toFixed(2)),
    extractedEntities,
    timestamp: new Date().toISOString(),
  };

  return VoiceIntentPayloadSchema.parse(payload);
}
export const parseVernacularVoiceQuery = parseVoiceQuery;

