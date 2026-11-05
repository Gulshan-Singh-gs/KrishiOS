import { describe, it, expect } from 'vitest';
import {
  calculateHaversineDistanceKm,
  rankMandiArbitrage,
  DEFAULT_RURAL_TORTUOSITY,
  type RawMandiQuote,
  type GeoLocation,
} from '../arbitrageEngine.js';

describe('Task 2.3: Spatial Mandi Price Arbitrage & Haversine Routing Verification', () => {
  // Farmer located in Morinda, Punjab
  const FARMER_LOCATION: GeoLocation = {
    latitude: 30.7938,
    longitude: 76.495,
  };

  // Mock dataset of 15 authentic Punjab Mandis
  const PUNJAB_15_MANDIS: RawMandiQuote[] = [
    {
      mandiId: 'mandi-morinda',
      marketName: 'Morinda',
      state: 'Punjab',
      district: 'Rupnagar',
      commodity: 'Cotton',
      modalPrice: 7050,
      location: { latitude: 30.7938, longitude: 76.495 },
      mandiFeeFixed: 20,
      arrivalDate: '2026-11-03',
    },
    {
      mandiId: 'mandi-kurali',
      marketName: 'Kurali',
      state: 'Punjab',
      district: 'SAS Nagar',
      commodity: 'Cotton',
      modalPrice: 7180,
      location: { latitude: 30.8286, longitude: 76.575 },
      mandiFeeFixed: 25,
      arrivalDate: '2026-11-03',
    },
    {
      mandiId: 'mandi-kharar',
      marketName: 'Kharar',
      state: 'Punjab',
      district: 'SAS Nagar',
      commodity: 'Cotton',
      modalPrice: 7360,
      location: { latitude: 30.7415, longitude: 76.6432 },
      mandiFeeFixed: 30,
      arrivalDate: '2026-11-03',
    },
    {
      mandiId: 'mandi-rupnagar',
      marketName: 'Rupnagar',
      state: 'Punjab',
      district: 'Rupnagar',
      commodity: 'Cotton',
      modalPrice: 7420,
      location: { latitude: 30.9664, longitude: 76.5331 },
      mandiFeeFixed: 30,
      arrivalDate: '2026-11-03',
    },
    {
      mandiId: 'mandi-chamkaur-sahib',
      marketName: 'Chamkaur Sahib',
      state: 'Punjab',
      district: 'Rupnagar',
      commodity: 'Cotton',
      modalPrice: 7120,
      location: { latitude: 30.8887, longitude: 76.4255 },
      mandiFeeFixed: 20,
      arrivalDate: '2026-11-03',
    },
    {
      mandiId: 'mandi-khanna',
      marketName: 'Khanna',
      state: 'Punjab',
      district: 'Ludhiana',
      commodity: 'Cotton',
      modalPrice: 7750, // Asia's largest grain market premium
      location: { latitude: 30.7042, longitude: 76.2167 },
      mandiFeeFixed: 50,
      arrivalDate: '2026-11-03',
    },
    {
      mandiId: 'mandi-samrala',
      marketName: 'Samrala',
      state: 'Punjab',
      district: 'Ludhiana',
      commodity: 'Cotton',
      modalPrice: 7290,
      location: { latitude: 30.8354, longitude: 76.1917 },
      mandiFeeFixed: 25,
      arrivalDate: '2026-11-03',
    },
    {
      mandiId: 'mandi-ludhiana',
      marketName: 'Ludhiana (Dana Mandi)',
      state: 'Punjab',
      district: 'Ludhiana',
      commodity: 'Cotton',
      modalPrice: 7520,
      location: { latitude: 30.901, longitude: 75.8573 },
      mandiFeeFixed: 40,
      arrivalDate: '2026-11-03',
    },
    {
      mandiId: 'mandi-sirhind',
      marketName: 'Sirhind',
      state: 'Punjab',
      district: 'Fatehgarh Sahib',
      commodity: 'Cotton',
      modalPrice: 7310,
      location: { latitude: 30.6416, longitude: 76.3861 },
      mandiFeeFixed: 30,
      arrivalDate: '2026-11-03',
    },
    {
      mandiId: 'mandi-fatehgarh-sahib',
      marketName: 'Fatehgarh Sahib',
      state: 'Punjab',
      district: 'Fatehgarh Sahib',
      commodity: 'Cotton',
      modalPrice: 7280,
      location: { latitude: 30.6432, longitude: 76.41 },
      mandiFeeFixed: 25,
      arrivalDate: '2026-11-03',
    },
    {
      mandiId: 'mandi-rajpura',
      marketName: 'Rajpura',
      state: 'Punjab',
      district: 'Patiala',
      commodity: 'Cotton',
      modalPrice: 7390,
      location: { latitude: 30.4839, longitude: 76.5939 },
      mandiFeeFixed: 35,
      arrivalDate: '2026-11-03',
    },
    {
      mandiId: 'mandi-patiala',
      marketName: 'Patiala',
      state: 'Punjab',
      district: 'Patiala',
      commodity: 'Cotton',
      modalPrice: 7410,
      location: { latitude: 30.3398, longitude: 76.3869 },
      mandiFeeFixed: 35,
      arrivalDate: '2026-11-03',
    },
    {
      mandiId: 'mandi-nabha',
      marketName: 'Nabha',
      state: 'Punjab',
      district: 'Patiala',
      commodity: 'Cotton',
      modalPrice: 7240,
      location: { latitude: 30.3742, longitude: 76.1528 },
      mandiFeeFixed: 25,
      arrivalDate: '2026-11-03',
    },
    {
      mandiId: 'mandi-mohali',
      marketName: 'Mohali',
      state: 'Punjab',
      district: 'SAS Nagar',
      commodity: 'Cotton',
      modalPrice: 7460,
      location: { latitude: 30.7046, longitude: 76.7179 },
      mandiFeeFixed: 30,
      arrivalDate: '2026-11-03',
    },
    {
      mandiId: 'mandi-doraha',
      marketName: 'Doraha',
      state: 'Punjab',
      district: 'Ludhiana',
      commodity: 'Cotton',
      modalPrice: 7330,
      location: { latitude: 30.8038, longitude: 76.0336 },
      mandiFeeFixed: 25,
      arrivalDate: '2026-11-03',
    },
  ];

  it('calculates spherical Haversine distances accurately', () => {
    // Morinda to itself
    const distZero = calculateHaversineDistanceKm(FARMER_LOCATION, FARMER_LOCATION);
    expect(distZero).toBe(0);

    // Morinda (30.7938, 76.4950) to Kurali (30.8286, 76.5750) is ~8.5 - 9.5 km
    const distKurali = calculateHaversineDistanceKm(
      FARMER_LOCATION,
      PUNJAB_15_MANDIS[1]!.location
    );
    expect(distKurali).toBeGreaterThan(8.0);
    expect(distKurali).toBeLessThan(10.0);

    // Morinda to Khanna (~30-33 km)
    const distKhanna = calculateHaversineDistanceKm(
      FARMER_LOCATION,
      PUNJAB_15_MANDIS[5]!.location
    );
    expect(distKhanna).toBeGreaterThan(28.0);
    expect(distKhanna).toBeLessThan(35.0);
  });

  it('ranks all 15 Punjab Mandis by Net Realizable Value (NRV) in descending order', () => {
    const QUANTITY_QUINTALS = 50; // 50 quintals load (typical 3-ton small commercial vehicle)
    const COST_PER_KM = 12.0; // ₹12/km round-trip haulage tariff

    const ranked = rankMandiArbitrage({
      farmerLocation: FARMER_LOCATION,
      quantityQuintals: QUANTITY_QUINTALS,
      quotes: PUNJAB_15_MANDIS,
      costPerKm: COST_PER_KM,
      tortuosity: DEFAULT_RURAL_TORTUOSITY,
    });

    expect(ranked.length).toBe(15);

    // Verify strict descending ordering of Net Realizable Value
    for (let i = 0; i < ranked.length - 1; i++) {
      expect(ranked[i]!.netRealizableValueTotal).toBeGreaterThanOrEqual(
        ranked[i + 1]!.netRealizableValueTotal
      );
    }

    // Only the first ranked item is optimal
    expect(ranked[0]!.isOptimal).toBe(true);
    expect(ranked[1]!.isOptimal).toBe(false);

    // Top ranked Mandi should be Khanna due to massive wholesale premium (₹7,750 modal)
    expect(ranked[0]!.quote.marketName).toBe('Khanna');
  });

  it('calculates exact net profit margins relative to the local baseline mandi', () => {
    const QUANTITY_QUINTALS = 40;
    const COST_PER_KM = 14.0;

    const ranked = rankMandiArbitrage({
      farmerLocation: FARMER_LOCATION,
      quantityQuintals: QUANTITY_QUINTALS,
      quotes: PUNJAB_15_MANDIS,
      costPerKm: COST_PER_KM,
      baselineMandiId: 'mandi-morinda',
    });

    // Local mandi (Morinda) baseline profit spread must be 0
    const morindaResult = ranked.find((r) => r.quote.mandiId === 'mandi-morinda')!;
    expect(morindaResult.quote.netProfitPerQuintal).toBe(0);
    expect(morindaResult.netProfitTotal).toBe(0);

    // Khanna arbitrage opportunity must yield positive net profit spread over local Morinda
    const khannaResult = ranked.find((r) => r.quote.mandiId === 'mandi-khanna')!;
    expect(khannaResult.quote.netProfitPerQuintal).toBeGreaterThan(500); // More than ₹500/quintal net gain!
    expect(khannaResult.netProfitTotal).toBeGreaterThan(20000); // > ₹20,000 extra net income for 40 quintals
  });

  it('validates deduction arithmetic: NRV = (P_modal * Q) - (2 * d_Haversine * tau * C_km) - F_mandi', () => {
    const quantity = 30;
    const costPerKm = 10;
    const tau = 1.28;

    const testQuote: RawMandiQuote = {
      mandiId: 'test-mandi',
      marketName: 'Test Market',
      state: 'Punjab',
      district: 'Rupnagar',
      commodity: 'Wheat',
      modalPrice: 2500,
      location: { latitude: 30.9, longitude: 76.6 },
      mandiFeeFixed: 100,
      arrivalDate: '2026-11-03',
    };

    const [result] = rankMandiArbitrage({
      farmerLocation: FARMER_LOCATION,
      quantityQuintals: quantity,
      quotes: [testQuote],
      costPerKm,
      tortuosity: tau,
    });

    const dH = calculateHaversineDistanceKm(FARMER_LOCATION, testQuote.location);
    const dRoute = Number((dH * tau).toFixed(2));
    const expectedHaulage = Number((2 * dRoute * costPerKm).toFixed(2));
    const expectedGross = 2500 * quantity;
    const expectedNRVTotal = Number((expectedGross - expectedHaulage - 100).toFixed(2));

    expect(result!.totalRevenueGross).toBe(expectedGross);
    expect(result!.totalHaulageCost).toBe(expectedHaulage);
    expect(result!.totalMandiFee).toBe(100);
    expect(result!.netRealizableValueTotal).toBe(expectedNRVTotal);
    expect(result!.quote.netRealizableValue).toBe(
      Number((expectedNRVTotal / quantity).toFixed(2))
    );
  });
});

