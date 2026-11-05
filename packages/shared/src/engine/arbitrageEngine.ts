import type {
  MandiArbitrageQuote,
  DistanceCalculationType,
} from '../schemas.js';
import { MandiArbitrageQuoteSchema } from '../schemas.js';

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export type VehicleType =
  | 'small_commercial_vehicle' // e.g. Tata Ace / Bolero Pik-Up (~15-20 quintals)
  | 'tractor_trolley' // Standard rural tractor trolley (~40-60 quintals)
  | 'medium_truck' // 6-wheeler (~100-150 quintals)
  | 'custom';

export interface VehicleCostProfile {
  type: VehicleType;
  capacityQuintals: number;
  costPerKm: number; // Round-trip tariff per km (INR/km)
  loadingUnloadingCostTotal?: number; // Total loading/unloading labor charge
}

export const STANDARD_VEHICLE_PROFILES: Record<VehicleType, VehicleCostProfile> = {
  small_commercial_vehicle: {
    type: 'small_commercial_vehicle',
    capacityQuintals: 20,
    costPerKm: 14.0,
    loadingUnloadingCostTotal: 250,
  },
  tractor_trolley: {
    type: 'tractor_trolley',
    capacityQuintals: 50,
    costPerKm: 22.0,
    loadingUnloadingCostTotal: 500,
  },
  medium_truck: {
    type: 'medium_truck',
    capacityQuintals: 120,
    costPerKm: 38.0,
    loadingUnloadingCostTotal: 1200,
  },
  custom: {
    type: 'custom',
    capacityQuintals: 50,
    costPerKm: 18.0,
    loadingUnloadingCostTotal: 400,
  },
};

export interface RawMandiQuote {
  mandiId: string;
  marketName: string;
  state: string;
  district: string;
  commodity: string;
  modalPrice: number; // INR per quintal
  minPrice?: number;
  maxPrice?: number;
  location: GeoLocation;
  knownRoadDistanceKm?: number; // Verified road route distance if available
  mandiFeeFixed?: number; // Fixed market cess
  mandiFeePercent?: number; // e.g. 1.0% APMC market committee cess
  arrivalDate: string; // YYYY-MM-DD
}

export interface ArbitrageEngineOptions {
  farmerLocation: GeoLocation;
  quantityQuintals: number;
  quotes: RawMandiQuote[];
  vehicleProfile?: VehicleCostProfile;
  costPerKm?: number; // Overrides vehicle cost per km
  tortuosity?: number; // Default 1.28 for rural secondary road networks
  baselineMandiId?: string; // Optional baseline mandi ID to compute spread
  maxFreshnessDays?: number; // Stale limit in days (default 3 days / 72 hours)
}

export interface ArbitrageRankedResult {
  quote: MandiArbitrageQuote;
  totalRevenueGross: number; // P_modal * Q
  totalHaulageCost: number; // 2 * d * C_km
  totalMandiFee: number;
  netRealizableValueTotal: number; // NRV in INR
  netProfitTotal: number; // Comparative margin over baseline
  isOptimal: boolean;
  isStale: boolean;
  freshnessDays: number;
  requiredTrips: number;
}

const EARTH_RADIUS_KM = 6371.0;
export const DEFAULT_RURAL_TORTUOSITY = 1.28;

/**
 * Calculates Great-Circle spherical distance between two points using the Haversine formula.
 */
export function calculateHaversineDistanceKm(
  coord1: GeoLocation,
  coord2: GeoLocation
): number {
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const lat1Rad = (coord1.latitude * Math.PI) / 180;
  const lat2Rad = (coord2.latitude * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  return Number(distance.toFixed(3));
}

/**
 * Deduplicates raw market quotes by mandiId, retaining the latest arrival record.
 */
export function deduplicateMandiQuotes(quotes: RawMandiQuote[]): RawMandiQuote[] {
  const map = new Map<string, RawMandiQuote>();
  for (const q of quotes) {
    if (!q.mandiId || q.modalPrice <= 0) continue;
    const existing = map.get(q.mandiId);
    if (!existing || new Date(q.arrivalDate) > new Date(existing.arrivalDate)) {
      map.set(q.mandiId, q);
    }
  }
  return Array.from(map.values());
}

/**
 * Computes Net Realizable Value (NRV) and ranks surrounding Mandis.
 */
export function rankMandiArbitrage(
  options: ArbitrageEngineOptions
): ArbitrageRankedResult[] {
  const {
    farmerLocation,
    quantityQuintals,
    quotes,
    vehicleProfile = STANDARD_VEHICLE_PROFILES.small_commercial_vehicle,
    costPerKm: customCostPerKm,
    tortuosity = DEFAULT_RURAL_TORTUOSITY,
    baselineMandiId,
    maxFreshnessDays = 3,
  } = options;

  if (quantityQuintals <= 0 || !quotes || quotes.length === 0) {
    return [];
  }

  // Deduplicate and filter invalid quotes
  const cleanQuotes = deduplicateMandiQuotes(quotes);
  if (cleanQuotes.length === 0) {
    return [];
  }

  const effectiveCostPerKm = customCostPerKm ?? vehicleProfile.costPerKm;
  const vehicleCapacity = Math.max(1, vehicleProfile.capacityQuintals);
  const tripsRequired = Math.ceil(quantityQuintals / vehicleCapacity);
  const now = new Date();

  const computedList = cleanQuotes.map((item) => {
    const haversineKm = calculateHaversineDistanceKm(farmerLocation, item.location);
    const hasRoad = item.knownRoadDistanceKm !== undefined && item.knownRoadDistanceKm > 0;
    const roadDistanceKm = hasRoad
      ? Number(item.knownRoadDistanceKm!.toFixed(2))
      : Number((haversineKm * tortuosity).toFixed(2));
    const distanceType: DistanceCalculationType = hasRoad
      ? 'road_network'
      : 'haversine_approximation';

    // Round-trip transport cost for required vehicle trips
    const trips = options.vehicleProfile ? tripsRequired : 1;
    const loadingFee = options.vehicleProfile?.loadingUnloadingCostTotal
      ? options.vehicleProfile.loadingUnloadingCostTotal * trips
      : 0;
    const totalTransportCost = Number(
      (2 * roadDistanceKm * effectiveCostPerKm * trips + loadingFee).toFixed(2)
    );
    const transportDeductionPerQuintal = Number(
      (totalTransportCost / quantityQuintals).toFixed(2)
    );

    // Mandi fee deduction
    let totalMandiFee = 0;
    if (item.mandiFeeFixed) {
      totalMandiFee += item.mandiFeeFixed;
    }
    if (item.mandiFeePercent) {
      const grossLotValue = item.modalPrice * quantityQuintals;
      totalMandiFee += (grossLotValue * item.mandiFeePercent) / 100;
    }
    totalMandiFee = Number(totalMandiFee.toFixed(2));
    const mandiFeePerQuintal = Number((totalMandiFee / quantityQuintals).toFixed(2));

    // Gross and Net values
    const grossValueTotal = Number((item.modalPrice * quantityQuintals).toFixed(2));
    const netRealizableValueTotal = Number(
      (grossValueTotal - totalTransportCost - totalMandiFee).toFixed(2)
    );
    const netRealizableValuePerQuintal = Number(
      (netRealizableValueTotal / quantityQuintals).toFixed(2)
    );

    // Freshness check
    const arrivalTime = new Date(item.arrivalDate);
    const ageMs = Math.max(0, now.getTime() - arrivalTime.getTime());
    const freshnessDays = Math.round(ageMs / (1000 * 60 * 60 * 24));
    const isStale = freshnessDays > maxFreshnessDays;

    return {
      raw: item,
      haversineKm,
      roadDistanceKm,
      distanceType,
      totalTransportCost,
      transportDeductionPerQuintal,
      totalMandiFee,
      mandiFeePerQuintal,
      grossValueTotal,
      netRealizableValueTotal,
      netRealizableValuePerQuintal,
      freshnessDays,
      isStale,
      tripsRequired,
    };
  });

  // Determine baseline value for profit comparison
  let baselineNRVPerQuintal: number;
  if (baselineMandiId) {
    const foundBaseline = computedList.find((c) => c.raw.mandiId === baselineMandiId);
    baselineNRVPerQuintal = foundBaseline
      ? foundBaseline.netRealizableValuePerQuintal
      : Math.min(...computedList.map((c) => c.netRealizableValuePerQuintal));
  } else {
    // Default baseline is the geographically closest Mandi
    const closest = [...computedList].sort((a, b) => a.haversineKm - b.haversineKm)[0]!;
    baselineNRVPerQuintal = closest.netRealizableValuePerQuintal;
  }

  // Rank by Net Realizable Value descending
  computedList.sort((a, b) => b.netRealizableValueTotal - a.netRealizableValueTotal);
  const bestNRV = computedList[0]?.netRealizableValueTotal ?? 0;

  return computedList.map((item) => {
    const netProfitPerQuintal = Number(
      (item.netRealizableValuePerQuintal - baselineNRVPerQuintal).toFixed(2)
    );
    const netProfitTotal = Number((netProfitPerQuintal * quantityQuintals).toFixed(2));

    const quoteRecord: MandiArbitrageQuote = {
      schemaVersion: 1,
      mandiId: item.raw.mandiId,
      marketName: item.raw.marketName,
      state: item.raw.state,
      district: item.raw.district,
      commodity: item.raw.commodity,
      modalPrice: item.raw.modalPrice,
      distanceKm: item.roadDistanceKm,
      distanceType: item.distanceType,
      haversineKm: item.haversineKm,
      tortuosity,
      haulageRatePerKm: effectiveCostPerKm,
      transportDeduction: item.transportDeductionPerQuintal,
      mandiFeePerQuintal: item.mandiFeePerQuintal,
      grossValue: item.raw.modalPrice,
      netRealizableValue: item.netRealizableValuePerQuintal,
      netProfitPerQuintal,
      arrivalDate: item.raw.arrivalDate,
      isPriceGuaranteed: false,
      disclaimer:
        'Reported modal prices are indicative market benchmarks and do not constitute a guaranteed settlement quote.',
      timestamp: new Date().toISOString(),
    };

    const validatedQuote = MandiArbitrageQuoteSchema.parse(quoteRecord);

    return {
      quote: validatedQuote,
      totalRevenueGross: item.grossValueTotal,
      totalHaulageCost: item.totalTransportCost,
      totalMandiFee: item.totalMandiFee,
      netRealizableValueTotal: item.netRealizableValueTotal,
      netProfitTotal,
      isOptimal: item.netRealizableValueTotal === bestNRV,
      isStale: item.isStale,
      freshnessDays: item.freshnessDays,
      requiredTrips: item.tripsRequired,
    };
  });
}
