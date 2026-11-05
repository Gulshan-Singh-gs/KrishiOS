import type {
  CropType,
  GrowthStage,
  IrrigationSchedule,
} from '../schemas.js';
import { IrrigationScheduleSchema } from '../schemas.js';

export interface WeatherTelemetry {
  tempMeanC: number;
  tempMaxC?: number;
  tempMinC?: number;
  relativeHumidityPercent?: number; // Mean relative humidity (0 - 100)
  relativeHumidityMaxPercent?: number; // RH max (0 - 100)
  relativeHumidityMinPercent?: number; // RH min (0 - 100)
  windSpeed2mMs: number; // Wind speed at 2m height in m/s
  netRadiationMjM2Day: number; // Rn in MJ/m^2/day
  solarRadiationMjM2Day?: number; // Rs in MJ/m^2/day (used if Rn is not directly measured)
  soilHeatFluxG?: number; // G in MJ/m^2/day (default 0 for daily intervals)
  elevationMeters?: number; // Altitude z in meters
  precipitationMm?: number; // Rainfall in mm
}

export interface SoilTelemetry {
  currentMoisturePercent: number; // e.g. 40%
  fieldCapacityPercent: number; // e.g. 60%
  permanentWiltingPointPercent?: number; // e.g. 20%
  rootZoneDepthMm?: number; // e.g. 600 mm
  isSensorMeasured?: boolean; // Distinguish modelled soil moisture from actual sensor measurements
}

export interface IrrigationEngineInput {
  plotId: string;
  crop: CropType;
  growthStage: GrowthStage;
  weather: WeatherTelemetry;
  soil: SoilTelemetry;
  fieldAreaHectares?: number; // default 1 ha
  pumpFlowRateLitersPerMin?: number; // default 500 L/min (~5 HP tubewell)
  applicationEfficiencyPercent?: number; // default 80% (drip ~90%, sprinkler ~75%, flood ~60%)
}

export interface HydrologicalDiagnosticResult {
  schedule: IrrigationSchedule;
  et0: number; // mm/day
  etc: number; // mm/day
  soilWaterDeficitMm: number; // mm
  recommendedNetDepthMm: number; // mm
  recommendedGrossDepthMm: number; // mm
  estimatedNetVolumeLiters: number; // Liters
  estimatedGrossVolumeLiters: number; // Liters
  pumpRuntimeMinutes: number; // minutes
  inputCompleteness: 'complete' | 'partially_estimated' | 'fallback_defaults';
  confidenceScore: number; // 0.0 to 1.0
  assumptions: string[];
}

/**
 * Standard FAO-56 Crop Coefficients (Kc) for staple Indian agricultural crops.
 */
export const FAO56_CROP_COEFFICIENTS: Record<
  CropType,
  Record<GrowthStage, number>
> = {
  cotton: {
    initial: 0.35,
    development: 0.75,
    mid_season: 1.18,
    late_season: 0.65,
  },
  mustard: {
    initial: 0.35,
    development: 0.70,
    mid_season: 1.10,
    late_season: 0.35,
  },
  rice: {
    initial: 1.05,
    development: 1.10,
    mid_season: 1.20,
    late_season: 0.90,
  },
  wheat: {
    initial: 0.30,
    development: 0.70,
    mid_season: 1.15,
    late_season: 0.40,
  },
  other: {
    initial: 0.40,
    development: 0.70,
    mid_season: 1.05,
    late_season: 0.50,
  },
};

/**
 * Calculates Saturation Vapour Pressure e0(T) in kPa for temperature T in Celsius.
 * FAO-56 Eq. 11
 */
export function calculateSaturationVaporPressure(tempC: number): number {
  return 0.6108 * Math.exp((17.27 * tempC) / (tempC + 237.3));
}
export const saturationVapourPressure = calculateSaturationVaporPressure;

/**
 * Computes slope of saturation vapour pressure curve Delta in kPa/°C.
 * FAO-56 Eq. 13
 */
export function slopeOfVapourPressureCurve(tempC: number): number {
  const e0 = calculateSaturationVaporPressure(tempC);
  return (4098 * e0) / Math.pow(tempC + 237.3, 2);
}

/**
 * Computes atmospheric pressure P in kPa at altitude z in meters.
 * FAO-56 Eq. 7
 */
export function atmosphericPressure(elevationMeters = 0): number {
  return 101.3 * Math.pow((293 - 0.0065 * elevationMeters) / 293, 5.26);
}

/**
 * Computes psychrometric constant gamma in kPa/°C.
 * FAO-56 Eq. 8
 */
export function psychrometricConstant(elevationMeters = 0): number {
  const p = atmosphericPressure(elevationMeters);
  return 0.000665 * p;
}

/**
 * Calculates Actual Vapour Pressure (ea) in kPa based on available relative humidity data.
 * Adheres to FAO-56 Equations 17, 18, and 19.
 */
export function calculateActualVaporPressure(params: {
  tempMeanC?: number;
  tempMaxC?: number;
  tempMinC?: number;
  relativeHumidityPercent?: number;
  relativeHumidityMaxPercent?: number;
  relativeHumidityMinPercent?: number;
}): number {
  const {
    tempMeanC = 25,
    tempMaxC,
    tempMinC,
    relativeHumidityPercent,
    relativeHumidityMaxPercent,
    relativeHumidityMinPercent,
  } = params;

  if (
    tempMaxC !== undefined &&
    tempMinC !== undefined &&
    relativeHumidityMaxPercent !== undefined &&
    relativeHumidityMinPercent !== undefined
  ) {
    const e0_min = calculateSaturationVaporPressure(tempMinC);
    const e0_max = calculateSaturationVaporPressure(tempMaxC);
    return (
      (e0_min * (relativeHumidityMaxPercent / 100) +
        e0_max * (relativeHumidityMinPercent / 100)) /
      2
    );
  }

  if (tempMinC !== undefined && relativeHumidityMaxPercent !== undefined) {
    const e0_min = calculateSaturationVaporPressure(tempMinC);
    return e0_min * (relativeHumidityMaxPercent / 100);
  }

  let es: number;
  if (tempMaxC !== undefined && tempMinC !== undefined) {
    es =
      (calculateSaturationVaporPressure(tempMaxC) +
        calculateSaturationVaporPressure(tempMinC)) /
      2;
  } else {
    es = calculateSaturationVaporPressure(tempMeanC);
  }

  if (relativeHumidityPercent !== undefined) {
    return es * (Math.max(0, Math.min(100, relativeHumidityPercent)) / 100);
  }

  // FAO-56 default assumption when RH is completely absent: estimate from Tmin dew point ~ 50%
  return es * 0.5;
}

/**
 * Calculates Vapor Pressure Deficit (VPD = es - ea) in kPa.
 */
export function calculateVaporPressureDeficit(es: number, ea: number): number {
  return Math.max(0, Number((es - ea).toFixed(4)));
}

/**
 * Calculates Net Radiation (Rn) from incoming solar radiation (Rs) if not directly supplied.
 * FAO-56 Eq. 38 simplified daily approximation: Rn ≈ (1 - albedo) * Rs - Rnl
 */
export function calculateNetRadiation(
  solarRadiationMjM2Day: number,
  albedo = 0.23
): number {
  // Typical shortwave net radiation minus longwave loss
  return Math.max(0, Number(((1 - albedo) * solarRadiationMjM2Day - 2.5).toFixed(3)));
}

/**
 * Calculates Reference Evapotranspiration (ET0) in mm/day using the exact FAO-56 Penman-Monteith equation.
 * FAO-56 Eq. 6
 */
export function calculateReferenceEvapotranspiration(
  weather: WeatherTelemetry
): number {
  const {
    tempMeanC,
    tempMaxC,
    tempMinC,
    relativeHumidityPercent,
    relativeHumidityMaxPercent,
    relativeHumidityMinPercent,
    windSpeed2mMs,
    netRadiationMjM2Day,
    solarRadiationMjM2Day,
    soilHeatFluxG = 0,
    elevationMeters = 100,
  } = weather;

  const tMean = tempMeanC;
  const rn =
    netRadiationMjM2Day ??
    (solarRadiationMjM2Day !== undefined
      ? calculateNetRadiation(solarRadiationMjM2Day)
      : 15.0);
  const g = soilHeatFluxG;
  const u2 = Math.max(0.1, windSpeed2mMs);

  let es: number;
  if (tempMaxC !== undefined && tempMinC !== undefined) {
    es =
      (calculateSaturationVaporPressure(tempMaxC) +
        calculateSaturationVaporPressure(tempMinC)) /
      2;
  } else {
    es = calculateSaturationVaporPressure(tMean);
  }

  const ea = calculateActualVaporPressure({
    tempMeanC,
    tempMaxC,
    tempMinC,
    relativeHumidityPercent,
    relativeHumidityMaxPercent,
    relativeHumidityMinPercent,
  });

  const delta = slopeOfVapourPressureCurve(tMean);
  const gamma = psychrometricConstant(elevationMeters);

  const radiationTerm = 0.408 * delta * (rn - g);
  const windTerm = gamma * (900 / (tMean + 273)) * u2 * (es - ea);
  const numerator = radiationTerm + windTerm;
  const denominator = delta + gamma * (1 + 0.34 * u2);

  const et0 = numerator / denominator;
  return Math.max(0, Number(et0.toFixed(3)));
}
export const calculateFAO56ET0 = calculateReferenceEvapotranspiration;

/**
 * Calculates Crop Evapotranspiration under standard non-stressed conditions (ETc = ET0 * Kc).
 * FAO-56 Eq. 56
 */
export function calculateCropEvapotranspiration(et0: number, kc: number): number {
  return Math.max(0, Number((et0 * kc).toFixed(3)));
}

/**
 * Calculates Total Available Water (TAW) in the root zone in mm.
 * FAO-56 Eq. 82: TAW = 10 * (FC - PWP) * Zr
 * Where FC and PWP are expressed in % vol and Zr is in meters.
 */
export function calculateTotalAvailableWater(
  fieldCapacityPercent: number,
  wiltingPointPercent: number,
  rootZoneDepthMm: number
): number {
  const zrMeters = rootZoneDepthMm / 1000;
  const taw = 10 * (fieldCapacityPercent - wiltingPointPercent) * zrMeters;
  return Math.max(0, Number(taw.toFixed(2)));
}

/**
 * Calculates Readily Available Water (RAW) in mm.
 * FAO-56 Eq. 83: RAW = p * TAW
 */
export function calculateReadilyAvailableWater(
  tawMm: number,
  depletionFraction_p = 0.5
): number {
  return Math.max(0, Number((tawMm * depletionFraction_p).toFixed(2)));
}

/**
 * Calculates Root-Zone Soil Water Depletion (Dr) in mm.
 */
export function calculateRootZoneDepletion(
  currentMoisturePercent: number,
  fieldCapacityPercent: number,
  rootZoneDepthMm: number
): number {
  const shortfallPct = Math.max(0, fieldCapacityPercent - currentMoisturePercent);
  const rootDepthMeters = rootZoneDepthMm / 1000;
  // 10 * (% deficit) * Zr(m)
  return Math.max(0, Number((10 * shortfallPct * rootDepthMeters).toFixed(2)));
}

/**
 * Calculates Effective Precipitation using the USDA Soil Conservation Service formula.
 */
export function calculateEffectivePrecipitation(rainfallMm = 0): number {
  if (rainfallMm <= 0) return 0;
  if (rainfallMm <= 250) {
    return Math.max(0, Number(((rainfallMm * (125 - 0.2 * rainfallMm)) / 125).toFixed(2)));
  }
  return Number((125 + 0.1 * rainfallMm).toFixed(2));
}

/**
 * Calculates Net Irrigation Requirement (NIR) in mm.
 */
export function calculateNetIrrigationRequirement(
  etcMm: number,
  depletionMm: number,
  effectiveRainfallMm: number
): number {
  return Math.max(0, Number((etcMm + depletionMm - effectiveRainfallMm).toFixed(2)));
}

/**
 * Calculates Gross Irrigation Requirement (GIR) in mm accounting for irrigation application efficiency.
 * GIR = NIR / (Efficiency% / 100)
 */
export function calculateGrossIrrigationRequirement(
  netIrrigationMm: number,
  applicationEfficiencyPercent = 80
): number {
  const efficiencyFraction = Math.max(0.1, Math.min(1.0, applicationEfficiencyPercent / 100));
  return Math.max(0, Number((netIrrigationMm / efficiencyFraction).toFixed(2)));
}

/**
 * Calculates Required Pump Runtime in minutes.
 * Volume (L) = Depth (mm) * Area (ha) * 10,000 L/(ha*mm)
 * Duration (min) = Volume (L) / FlowRate (L/min)
 */
export function calculatePumpRuntime(
  grossIrrigationMm: number,
  areaHectares: number,
  pumpDischargeLpm: number
): number {
  if (pumpDischargeLpm <= 0 || areaHectares <= 0 || grossIrrigationMm <= 0) {
    return 0;
  }
  const totalVolumeLiters = grossIrrigationMm * areaHectares * 10000;
  return Math.round(totalVolumeLiters / pumpDischargeLpm);
}

/**
 * Complete Agro-Hydrological Calculator & Diagnostic Engine.
 */
export function computeIrrigationSchedule(
  input: IrrigationEngineInput
): IrrigationSchedule {
  const diagnostic = diagnoseHydrologicalBalance(input);
  return diagnostic.schedule;
}

/**
 * Comprehensive Hydrological Diagnostic Analyzer.
 */
export function diagnoseHydrologicalBalance(
  input: IrrigationEngineInput
): HydrologicalDiagnosticResult {
  const {
    plotId,
    crop,
    growthStage,
    weather,
    soil,
    fieldAreaHectares = 1.0,
    pumpFlowRateLitersPerMin = 500,
    applicationEfficiencyPercent = 80,
  } = input;

  const assumptions: string[] = [];
  let confidenceScore = 1.0;
  let completeness: 'complete' | 'partially_estimated' | 'fallback_defaults' = 'complete';

  if (weather.tempMaxC === undefined || weather.tempMinC === undefined) {
    assumptions.push('Tmax/Tmin not provided; daily mean temperature utilized.');
    confidenceScore -= 0.15;
    completeness = 'partially_estimated';
  }

  if (weather.relativeHumidityPercent === undefined && weather.relativeHumidityMaxPercent === undefined) {
    assumptions.push('Relative humidity telemetry missing; standard rural mean 50% estimated.');
    confidenceScore -= 0.2;
    completeness = 'partially_estimated';
  }

  if (!soil.isSensorMeasured) {
    assumptions.push('Soil moisture derived from hydrological balance model rather than physical in-situ capacitive sensor.');
  }

  // 1. Reference Evapotranspiration ET0
  const et0 = calculateReferenceEvapotranspiration(weather);

  // 2. Phenological Crop Coefficient Kc
  const cropTable = FAO56_CROP_COEFFICIENTS[crop] || FAO56_CROP_COEFFICIENTS.other;
  const kc = cropTable[growthStage] || 1.0;

  // 3. Crop Evapotranspiration ETc
  const etc = calculateCropEvapotranspiration(et0, kc);

  // 4. Effective Precipitation
  const effectiveRainfall = calculateEffectivePrecipitation(weather.precipitationMm ?? 0);

  // 5. Root-zone Depletion
  const rootDepthMm = soil.rootZoneDepthMm || 500;
  const soilMoistureDeficit = calculateRootZoneDepletion(
    soil.currentMoisturePercent,
    soil.fieldCapacityPercent,
    rootDepthMm
  );

  // 6. Net & Gross Irrigation Requirements
  const netIrrigationMm = calculateNetIrrigationRequirement(etc, soilMoistureDeficit, effectiveRainfall);
  const grossIrrigationMm = calculateGrossIrrigationRequirement(netIrrigationMm, applicationEfficiencyPercent);

  // 7. Volumetric Depth
  const netVolumeLiters = Math.round(netIrrigationMm * 10000 * fieldAreaHectares);
  const grossVolumeLiters = Math.round(grossIrrigationMm * 10000 * fieldAreaHectares);

  // 8. Pump Runtime (calculated from delivery volume per input parameters)
  const deliveryMm = input.applicationEfficiencyPercent !== undefined ? grossIrrigationMm : netIrrigationMm;
  const pumpRuntimeMinutes = calculatePumpRuntime(
    deliveryMm,
    fieldAreaHectares,
    pumpFlowRateLitersPerMin
  );

  const schedule: IrrigationSchedule = {
    id: `irrig_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    schemaVersion: 1,
    plotId,
    crop,
    growthStage,
    et0,
    kc,
    etc,
    soilMoistureCurrent: soil.currentMoisturePercent,
    soilMoistureDeficit,
    effectiveRainfall,
    recommendedLitersPerHectare: Math.round(netIrrigationMm * 10000),
    recommendedDurationMinutes: pumpRuntimeMinutes,
    timestamp: new Date().toISOString(),
  };

  return {
    schedule: IrrigationScheduleSchema.parse(schedule),
    et0,
    etc,
    soilWaterDeficitMm: soilMoistureDeficit,
    recommendedNetDepthMm: netIrrigationMm,
    recommendedGrossDepthMm: grossIrrigationMm,
    estimatedNetVolumeLiters: netVolumeLiters,
    estimatedGrossVolumeLiters: grossVolumeLiters,
    pumpRuntimeMinutes,
    inputCompleteness: completeness,
    confidenceScore: Math.max(0.1, Number(confidenceScore.toFixed(2))),
    assumptions,
  };
}
