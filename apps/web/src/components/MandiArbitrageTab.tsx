import React, { useState, useMemo } from 'react';
import {
  rankMandiArbitrage,
  STANDARD_VEHICLE_PROFILES,
  type VehicleType,
  type RawMandiQuote,
} from '@krishios/shared';
import { localDb } from '../db/localDb';

const SAMPLE_PUNJAB_MANDIS: RawMandiQuote[] = [
  {
    mandiId: 'mandi-khanna',
    marketName: 'Khanna (Asia’s Largest Grain Mandi)',
    state: 'Punjab',
    district: 'Ludhiana',
    commodity: 'Wheat',
    modalPrice: 2540,
    minPrice: 2420,
    maxPrice: 2610,
    location: { latitude: 30.705, longitude: 76.221 },
    knownRoadDistanceKm: 28.5,
    mandiFeePercent: 1.5,
    arrivalDate: '2026-11-05',
  },
  {
    mandiId: 'mandi-samrala',
    marketName: 'Samrala Mandi',
    state: 'Punjab',
    district: 'Ludhiana',
    commodity: 'Wheat',
    modalPrice: 2470,
    location: { latitude: 30.838, longitude: 76.192 },
    mandiFeePercent: 1.5,
    arrivalDate: '2026-11-05',
  },
  {
    mandiId: 'mandi-sirhind',
    marketName: 'Sirhind Mandi',
    state: 'Punjab',
    district: 'Fatehgarh Sahib',
    commodity: 'Wheat',
    modalPrice: 2490,
    location: { latitude: 30.643, longitude: 76.388 },
    knownRoadDistanceKm: 34.0,
    mandiFeePercent: 1.5,
    arrivalDate: '2026-11-04',
  },
  {
    mandiId: 'mandi-doraha',
    marketName: 'Doraha Mandi',
    state: 'Punjab',
    district: 'Ludhiana',
    commodity: 'Wheat',
    modalPrice: 2430,
    location: { latitude: 30.806, longitude: 76.035 },
    mandiFeePercent: 1.5,
    arrivalDate: '2026-11-05',
  },
  {
    mandiId: 'mandi-ludhiana',
    marketName: 'Ludhiana New Grain Market',
    state: 'Punjab',
    district: 'Ludhiana',
    commodity: 'Wheat',
    modalPrice: 2510,
    location: { latitude: 30.901, longitude: 75.857 },
    knownRoadDistanceKm: 42.0,
    mandiFeePercent: 1.5,
    arrivalDate: '2026-11-05',
  },
  {
    mandiId: 'mandi-malerkotla',
    marketName: 'Malerkotla Grain Yard',
    state: 'Punjab',
    district: 'Malerkotla',
    commodity: 'Wheat',
    modalPrice: 2460,
    location: { latitude: 30.528, longitude: 75.894 },
    mandiFeePercent: 1.5,
    arrivalDate: '2026-11-03',
  },
];

export const MandiArbitrageTab: React.FC = () => {
  const [commodity, setCommodity] = useState('Wheat');
  const [quantityQuintals, setQuantityQuintals] = useState<number>(40);
  const [vehicleType, setVehicleType] = useState<VehicleType>('tractor_trolley');
  const [farmerCoords] = useState({ latitude: 30.75, longitude: 76.15 });
  const [cachedSuccessMsg, setCachedSuccessMsg] = useState<string | null>(null);

  const vehicleProfile = STANDARD_VEHICLE_PROFILES[vehicleType];

  // Dynamically compute ranked arbitrage quotes locally
  const rankedResults = useMemo(() => {
    // Generate adjusted commodity rates for demonstration
    const adjustedQuotes: RawMandiQuote[] = SAMPLE_PUNJAB_MANDIS.map((m) => {
      let multiplier = 1.0;
      if (commodity === 'Cotton') multiplier = 2.85;
      else if (commodity === 'Mustard') multiplier = 2.15;
      else if (commodity === 'Rice') multiplier = 1.45;

      return {
        ...m,
        commodity,
        modalPrice: Math.round(m.modalPrice * multiplier),
      };
    });

    return rankMandiArbitrage({
      farmerLocation: farmerCoords,
      quantityQuintals,
      quotes: adjustedQuotes,
      vehicleProfile,
    });
  }, [commodity, quantityQuintals, vehicleProfile, farmerCoords]);

  const handleCacheQuote = async (quote: (typeof rankedResults)[0]['quote']) => {
    const id = `${quote.commodity}_${quote.mandiId}_${quote.arrivalDate}`;
    await localDb.cachedMandiPrices.put({
      ...quote,
      id,
      cachedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000 * 3).toISOString(),
    });
    setCachedSuccessMsg(`Quote for ${quote.marketName} cached to offline database!`);
    setTimeout(() => setCachedSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Mandi Market Intelligence & Net Realization</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Computes true farmer net realization (NRV) factoring round-trip transport haulage, road network vs geodesic fallbacks, vehicle capacity limits, and APMC market fees.
        </p>
      </div>

      {cachedSuccessMsg && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-sm">
          ✓ {cachedSuccessMsg}
        </div>
      )}

      {/* Control Panel */}
      <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 shadow-md grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Commodity Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1">
            Agricultural Commodity
          </label>
          <select
            value={commodity}
            onChange={(e) => setCommodity(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="Wheat">Wheat (Kanak / गेहूँ)</option>
            <option value="Cotton">Cotton (Narma / कपास)</option>
            <option value="Rice">Rice (Paddy / धान)</option>
            <option value="Mustard">Mustard (Sarson / सरसों)</option>
          </select>
        </div>

        {/* Quantity Input */}
        <div>
          <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1">
            Produce Lot Size (Quintals)
          </label>
          <input
            type="number"
            min="1"
            max="1000"
            value={quantityQuintals}
            onChange={(e) => setQuantityQuintals(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
          />
          <p className="text-[11px] text-neutral-400 mt-1">1 Quintal = 100 kg (~{quantityQuintals * 100} kg total)</p>
        </div>

        {/* Transport Vehicle */}
        <div>
          <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1">
            Transport Logistics Model
          </label>
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value as VehicleType)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="small_commercial_vehicle">Tata Ace / Pik-Up (Cap: 20 qtl, ₹14/km)</option>
            <option value="tractor_trolley">Tractor Trolley (Cap: 50 qtl, ₹22/km)</option>
            <option value="medium_truck">Medium Commercial Truck (Cap: 120 qtl, ₹38/km)</option>
          </select>
        </div>
      </div>

      {/* Mandatory Regulatory Disclaimer */}
      <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-start space-x-2">
        <span className="text-base">⚠️</span>
        <div>
          <span className="font-semibold">Statutory Market Disclaimer:</span> Mandi rates displayed are reported daily modal prices from market committees. They represent historical trade benchmarks and do not constitute a guaranteed settlement price.
        </div>
      </div>

      {/* Ranked Market Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
          <span>Ranked by Farmer Net Realization Value (NRV) descending</span>
          <span>{rankedResults.length} surrounding markets analyzed</span>
        </div>

        {rankedResults.map((item, idx) => {
          const { quote, netProfitTotal, isOptimal, isStale } = item;
          return (
            <div
              key={quote.mandiId}
              className={`p-4 rounded-xl border transition ${
                isOptimal
                  ? 'bg-neutral-900 border-emerald-500 shadow-lg shadow-emerald-950/20'
                  : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Left Info */}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-neutral-400">#{idx + 1}</span>
                    <h3 className="text-base font-bold text-white">{quote.marketName}</h3>
                    {isOptimal && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-900 text-emerald-300 border border-emerald-700">
                        ⭐ Most Profitable Market
                      </span>
                    )}
                    {isStale && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-900 text-amber-300 border border-amber-700">
                        Stale Rate
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 mt-1">
                    <span>📍 {quote.district}, {quote.state}</span>
                    <span>•</span>
                    <span>
                      🛣️ {quote.distanceKm} km (
                      <span className="italic">
                        {quote.distanceType === 'road_network' ? 'Road Network Route' : 'Haversine Approx ×1.28'}
                      </span>
                      )
                    </span>
                    <span>•</span>
                    <span>📅 Reported: {quote.arrivalDate}</span>
                  </div>
                </div>

                {/* Right Financials */}
                <div className="flex items-center justify-between sm:justify-end gap-6 sm:text-right border-t sm:border-t-0 border-neutral-800 pt-3 sm:pt-0">
                  <div>
                    <div className="text-xs text-neutral-400">Reported Modal Price</div>
                    <div className="text-base font-semibold text-neutral-200">₹{quote.modalPrice}/qtl</div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-400">Est. Net Take-Home (NRV)</div>
                    <div className="text-lg font-extrabold text-emerald-400">
                      ₹{quote.netRealizableValue}
                      <span className="text-xs text-neutral-400 font-normal">/qtl</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-400">Total Margin</div>
                    <div className={`text-sm font-bold ${netProfitTotal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {netProfitTotal >= 0 ? `+₹${netProfitTotal}` : `-₹${Math.abs(netProfitTotal)}`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost Deductions Breakdown Bar */}
              <div className="mt-3 pt-3 border-t border-neutral-800/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-neutral-400">
                <div>
                  Gross Value: <span className="text-neutral-200 font-medium">₹{item.totalRevenueGross}</span>
                </div>
                <div>
                  Transport Haulage: <span className="text-rose-400 font-medium">-₹{item.totalHaulageCost}</span> ({item.requiredTrips} trips)
                </div>
                <div>
                  APMC Cess / Fees: <span className="text-rose-400 font-medium">-₹{item.totalMandiFee}</span>
                </div>
                <div className="text-right">
                  <button
                    onClick={() => handleCacheQuote(quote)}
                    className="text-emerald-400 hover:text-emerald-300 font-medium underline"
                  >
                    Save for Offline
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
