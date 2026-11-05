import { describe, it, expect } from 'vitest';
import { parseVoiceQuery } from '../dialectParser.js';
import type { VoiceIntent } from '../../schemas.js';

interface UtteranceTestCase {
  id: number;
  utterance: string;
  expectedIntent: VoiceIntent;
  expectedCommodity?: string;
  expectedMandi?: string;
}

describe('Task 2.4: Vernacular Dialect Normalizer & Intent Parser Verification', () => {
  const UTTERANCE_TEST_CASES: UtteranceTestCase[] = [
    {
      id: 1,
      utterance: 'Kharar mandi mein narma ka kya rate chal raha hai?',
      expectedIntent: 'MANDI_PRICE_QUERY',
      expectedCommodity: 'Cotton',
      expectedMandi: 'Kharar',
    },
    {
      id: 2,
      utterance: 'Sarson de patte te kaale dhabbe dikh rahe ne, kee karaan?',
      expectedIntent: 'CROP_DISEASE_DIAGNOSIS',
      expectedCommodity: 'Mustard',
    },
    {
      id: 3,
      utterance: 'Kanak nu dooja paani kadon launa chaahida hai?',
      expectedIntent: 'IRRIGATION_QUERY',
      expectedCommodity: 'Wheat',
    },
    {
      id: 4,
      utterance: 'Kal mausam kaisa rahega, kya baarish hone wali hai?',
      expectedIntent: 'WEATHER_FORECAST',
    },
    {
      id: 5,
      utterance: 'Khanna mandi vich gehun da modal bhav dasso ji',
      expectedIntent: 'MANDI_PRICE_QUERY',
      expectedCommodity: 'Wheat',
      expectedMandi: 'Khanna',
    },
    {
      id: 6,
      utterance: 'Jhona de khet vich paani kinna khada rakhna hai?',
      expectedIntent: 'IRRIGATION_QUERY',
      expectedCommodity: 'Rice',
    },
    {
      id: 7,
      utterance: 'Rupnagar mandi ch kapaas da rate kinna chal reha?',
      expectedIntent: 'MANDI_PRICE_QUERY',
      expectedCommodity: 'Cotton',
      expectedMandi: 'Rupnagar',
    },
    {
      id: 8,
      utterance: 'Cotton leaf curl virus ho gaya hai, kaunsi spray karein?',
      expectedIntent: 'CROP_DISEASE_DIAGNOSIS',
      expectedCommodity: 'Cotton',
    },
    {
      id: 9,
      utterance: 'Mustard crop mein white rust bimari ke lakshan hain',
      expectedIntent: 'CROP_DISEASE_DIAGNOSIS',
      expectedCommodity: 'Mustard',
    },
    {
      id: 10,
      utterance: 'Ajj Ludhiana mandi vich sarson da bhav ki hai?',
      expectedIntent: 'MANDI_PRICE_QUERY',
      expectedCommodity: 'Mustard',
      expectedMandi: 'Ludhiana',
    },
    {
      id: 11,
      utterance: 'Rice blast rogg de layi kehra bio-fungicide use kariye?',
      expectedIntent: 'CROP_DISEASE_DIAGNOSIS',
      expectedCommodity: 'Rice',
    },
    {
      id: 12,
      utterance: 'Tubewell motor kitne ghante chalana chahiye aaj?',
      expectedIntent: 'IRRIGATION_QUERY',
    },
    {
      id: 13,
      utterance: 'Kurali mandi mein wheat ka rate kya hai?',
      expectedIntent: 'MANDI_PRICE_QUERY',
      expectedCommodity: 'Wheat',
      expectedMandi: 'Kurali',
    },
    {
      id: 14,
      utterance: 'Patiala mandi vich narma da taja bhav ki hai?',
      expectedIntent: 'MANDI_PRICE_QUERY',
      expectedCommodity: 'Cotton',
      expectedMandi: 'Patiala',
    },
    {
      id: 15,
      utterance: 'Sarson te chitta rogg (white rust) aa gaya, ilaaj dasso',
      expectedIntent: 'CROP_DISEASE_DIAGNOSIS',
      expectedCommodity: 'Mustard',
    },
    {
      id: 16,
      utterance: 'Wheat flag leaf pe yellow rust dikh rahi hai',
      expectedIntent: 'CROP_DISEASE_DIAGNOSIS',
      expectedCommodity: 'Wheat',
    },
    {
      id: 17,
      utterance: 'Rajpura mandi vich dhaan da bhav kinna hai?',
      expectedIntent: 'MANDI_PRICE_QUERY',
      expectedCommodity: 'Rice',
      expectedMandi: 'Rajpura',
    },
    {
      id: 18,
      utterance: 'Weather report kya hai kal ke liye, kya aandhi aayegi?',
      expectedIntent: 'WEATHER_FORECAST',
    },
    {
      id: 19,
      utterance: 'Dhan ke khet mein kitna paani lagana padega?',
      expectedIntent: 'IRRIGATION_QUERY',
      expectedCommodity: 'Rice',
    },
    {
      id: 20,
      utterance: 'Samrala mandi ch sarson da mull ki chalda paya?',
      expectedIntent: 'MANDI_PRICE_QUERY',
      expectedCommodity: 'Mustard',
      expectedMandi: 'Samrala',
    },
    {
      id: 21,
      utterance: 'Kapas ke patte peele pad rahe hain aur mud rahe hain',
      expectedIntent: 'CROP_DISEASE_DIAGNOSIS',
      expectedCommodity: 'Cotton',
    },
    {
      id: 22,
      utterance: 'Doraha mandi mein gehun ka kya bhav hai aaj?',
      expectedIntent: 'MANDI_PRICE_QUERY',
      expectedCommodity: 'Wheat',
      expectedMandi: 'Doraha',
    },
    {
      id: 23,
      utterance: 'Kal barsaat paindi sambhavna hai ki nahi?',
      expectedIntent: 'WEATHER_FORECAST',
    },
    {
      id: 24,
      utterance: 'Kanak di fasal nu paani lagana hai, pump runtime schedule do',
      expectedIntent: 'IRRIGATION_QUERY',
      expectedCommodity: 'Wheat',
    },
    {
      id: 25,
      utterance: 'Sirhind mandi vich jhona da ki rate hai?',
      expectedIntent: 'MANDI_PRICE_QUERY',
      expectedCommodity: 'Rice',
      expectedMandi: 'Sirhind',
    },
  ];

  it('contains exactly 25 code-switched Hinglish and Punjabi-English test utterances', () => {
    expect(UTTERANCE_TEST_CASES.length).toBe(25);
  });

  describe('100% Extraction Accuracy Verification across all 25 Utterances', () => {
    it.each(UTTERANCE_TEST_CASES)(
      'Case #$id: "$utterance"',
      ({ utterance, expectedIntent, expectedCommodity, expectedMandi }) => {
        const payload = parseVoiceQuery(utterance);

        // Assert Intent classification
        expect(payload.intent).toBe(expectedIntent);

        // Assert Commodity extraction if present
        if (expectedCommodity) {
          expect(payload.extractedEntities.commodity).toBe(expectedCommodity);
        }

        // Assert Mandi extraction if present
        if (expectedMandi) {
          expect(payload.extractedEntities.mandi).toBe(expectedMandi);
        }
      }
    );
  });

  it('gracefully integrates LLM JSON structured responses when available', () => {
    const raw = 'Kharar mandi mein narma ka kya rate hai?';
    const mockLlmJson = {
      intent: 'MANDI_PRICE_QUERY',
      confidence: 0.98,
      extractedEntities: {
        commodity: 'Cotton',
        mandi: 'Kharar',
        quantityQuintals: 30,
      },
    };

    const payload = parseVoiceQuery(raw, mockLlmJson);
    expect(payload.intent).toBe('MANDI_PRICE_QUERY');
    expect(payload.confidence).toBe(0.98);
    expect(payload.extractedEntities.commodity).toBe('Cotton');
    expect(payload.extractedEntities.mandi).toBe('Kharar');
    expect(payload.extractedEntities.quantityQuintals).toBe(30);
  });
});

