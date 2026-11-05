import React, { useState } from 'react';
import {
  parseVernacularVoiceQuery,
  type Dialect,
  type VoiceIntentPayload,
} from '@krishios/shared';
import type { ActiveTab } from './Navbar';

interface VoiceAssistantTabProps {
  onNavigate: (tab: ActiveTab) => void;
}

const SAMPLE_VOICE_QUERIES = [
  {
    dialect: 'punjabi' as Dialect,
    label: 'Punjabi (Mandi Query)',
    query: 'Kanak da bhav dasso Khanna mandi vich',
  },
  {
    dialect: 'punjabi' as Dialect,
    label: 'Punjabi (Disease Query)',
    query: 'Kapas de patte te pila teela lag gya hai',
  },
  {
    dialect: 'hinglish' as Dialect,
    label: 'Hinglish (Irrigation Query)',
    query: 'Wheat crop me kitna paani lagana hai aaj',
  },
  {
    dialect: 'hindi' as Dialect,
    label: 'Hindi (Weather Query)',
    query: 'Ludhiana me kal barish hogi kya',
  },
  {
    dialect: 'english' as Dialect,
    label: 'English (General Query)',
    query: 'Check modal price for Mustard in Samrala',
  },
];

export const VoiceAssistantTab: React.FC<VoiceAssistantTabProps> = ({ onNavigate }) => {
  const [selectedDialect, setSelectedDialect] = useState<Dialect>('punjabi');
  const [queryInput, setQueryInput] = useState('Kanak da bhav dasso Khanna mandi vich');
  const [parsedIntent, setParsedIntent] = useState<VoiceIntentPayload | null>(() => {
    return parseVernacularVoiceQuery('Kanak da bhav dasso Khanna mandi vich', 'punjabi');
  });
  const [isListening, setIsListening] = useState(false);

  const handleExecuteParse = (text: string, dialect = selectedDialect) => {
    const result = parseVernacularVoiceQuery(text, dialect);
    setParsedIntent(result);
  };

  const handleSimulateMicrophone = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      handleExecuteParse(queryInput, selectedDialect);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Vernacular Voice Intelligence</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Deterministic agricultural lexicon intent parsing for Punjabi, Hinglish, Hindi, and English executing directly on-device without cloud round-trip delay.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input & Speech Controls */}
        <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 shadow space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-200 uppercase tracking-wider">
              1. Voice Input / Lexicon Query
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-neutral-400">Dialect:</span>
              <select
                value={selectedDialect}
                onChange={(e) => setSelectedDialect(e.target.value as Dialect)}
                className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
              >
                <option value="punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
                <option value="hinglish">Hinglish (हिंग्लिश)</option>
                <option value="hindi">Hindi (हिन्दी)</option>
                <option value="english">Indian English</option>
              </select>
            </div>
          </div>

          {/* Text Area */}
          <div>
            <textarea
              rows={3}
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Speak or type vernacular query here..."
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <button
              onClick={handleSimulateMicrophone}
              disabled={isListening}
              className={`flex-1 py-3 px-4 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow transition ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <span>{isListening ? '🎙️ Listening to Rural Dialect...' : '🎤 Capture Voice Query'}</span>
            </button>
            <button
              onClick={() => handleExecuteParse(queryInput, selectedDialect)}
              className="py-3 px-4 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs sm:text-sm border border-neutral-700 transition"
            >
              Parse Query
            </button>
          </div>

          {/* Preset Sample Queries */}
          <div className="pt-2">
            <span className="text-xs text-neutral-400 block mb-2 font-medium">Quick Dialect Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_VOICE_QUERIES.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedDialect(item.dialect);
                    setQueryInput(item.query);
                    handleExecuteParse(item.query, item.dialect);
                  }}
                  className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs border border-neutral-700/60 transition"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Parsed Intent & Extracted Agricultural Entities */}
        <div className="space-y-4">
          {parsedIntent ? (
            <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 shadow space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div>
                  <span className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
                    Local Intent Classifier
                  </span>
                  <h2 className="text-lg font-bold text-white mt-0.5">{parsedIntent.intent}</h2>
                </div>
                <div className="text-right">
                  <span className="text-xs text-neutral-400 block">Dialect Match</span>
                  <span className="text-sm font-bold text-emerald-400 uppercase">
                    {parsedIntent.detectedDialect} ({Math.round(parsedIntent.confidence * 100)}%)
                  </span>
                </div>
              </div>

              {/* Extracted Entities Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                  Extracted Agronomic Entities
                </span>
                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-neutral-500 block">Commodity:</span>
                    <span className="text-neutral-200 font-bold">
                      {parsedIntent.extractedEntities.commodity || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Mandi / Market:</span>
                    <span className="text-neutral-200 font-bold">
                      {parsedIntent.extractedEntities.mandi || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Crop Type:</span>
                    <span className="text-neutral-200 font-bold">
                      {parsedIntent.extractedEntities.crop || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Growth Stage:</span>
                    <span className="text-neutral-200 font-bold">
                      {parsedIntent.extractedEntities.growthStage || '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Trigger */}
              <div className="pt-2">
                {parsedIntent.intent === 'MANDI_PRICE_QUERY' ? (
                  <button
                    onClick={() => onNavigate('mandi')}
                    className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow transition"
                  >
                    Open Mandi Arbitrage for {parsedIntent.extractedEntities.commodity || 'Commodity'} →
                  </button>
                ) : parsedIntent.intent === 'IRRIGATION_QUERY' ? (
                  <button
                    onClick={() => onNavigate('irrigation')}
                    className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow transition"
                  >
                    Calculate Irrigation Schedule →
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigate('scanner')}
                    className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm shadow transition"
                  >
                    Diagnose Foliar Pathogen →
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-neutral-900 border border-neutral-800 text-center text-neutral-500 text-sm">
              Capture or type a vernacular agricultural inquiry to view real-time intent extraction.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

