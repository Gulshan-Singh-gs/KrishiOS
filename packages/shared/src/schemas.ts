import { z } from 'zod';

// ==========================================
// Base Enums & Core Primitives
// ==========================================

export const CropTypeEnum = z.enum(['cotton', 'rice', 'mustard', 'wheat', 'other']);
export type CropType = z.infer<typeof CropTypeEnum>;

export const GrowthStageEnum = z.enum([
  'initial',
  'development',
  'mid_season',
  'late_season',
]);
export type GrowthStage = z.infer<typeof GrowthStageEnum>;

export const DialectEnum = z.enum([
  'hinglish',
  'punjabi_english',
  'hindi',
  'punjabi',
  'english',
]);
export type Dialect = z.infer<typeof DialectEnum>;

export const VoiceIntentEnum = z.enum([
  'CROP_DISEASE_DIAGNOSIS',
  'IRRIGATION_QUERY',
  'MANDI_PRICE_QUERY',
  'WEATHER_FORECAST',
  'GENERAL_AGRONOMIC',
  'UNKNOWN',
]);
export type VoiceIntent = z.infer<typeof VoiceIntentEnum>;
export type VoiceIntentType = VoiceIntent;

export const SoilTypeEnum = z.enum([
  'alluvial',
  'black_cotton',
  'sandy_loam',
  'clay_loam',
  'clay',
  'loam',
  'silt_loam',
  'other',
]);
export type SoilType = z.infer<typeof SoilTypeEnum>;

export const IrrigationSystemEnum = z.enum([
  'drip',
  'sprinkler',
  'flood',
  'furrow',
  'basin',
]);
export type IrrigationSystemType = z.infer<typeof IrrigationSystemEnum>;

export const DistanceCalculationTypeEnum = z.enum([
  'road_network',
  'haversine_approximation',
]);
export type DistanceCalculationType = z.infer<typeof DistanceCalculationTypeEnum>;

export const OutboxOperationEnum = z.enum(['CREATE', 'UPDATE', 'DELETE']);
export type OutboxOperation = z.infer<typeof OutboxOperationEnum>;

export const OutboxStatusEnum = z.enum(['queued', 'syncing', 'failed', 'synced']);
export type OutboxStatus = z.infer<typeof OutboxStatusEnum>;

// ==========================================
// 1. Farmer Schema & Contract
// ==========================================

export const FarmerSchema = z.object({
  id: z.string().min(1),
  schemaVersion: z.number().int().positive().default(1),
  phone: z.string().min(10).max(15),
  name: z.string().min(1),
  dialect: DialectEnum.default('hinglish'),
  village: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Farmer = z.infer<typeof FarmerSchema>;

// ==========================================
// 2. CropProfile Schema
// ==========================================

export const CropProfileSchema = z.object({
  id: z.string().min(1),
  schemaVersion: z.number().int().positive().default(1),
  cropType: CropTypeEnum,
  botanicalName: z.string().min(1),
  standardSeason: z.enum(['kharif', 'rabi', 'zaid', 'perennial']),
  faoCropCoefficients: z.object({
    initial: z.number().positive(),
    development: z.number().positive(),
    mid_season: z.number().positive(),
    late_season: z.number().positive(),
  }),
  optimalSoilPhRange: z.tuple([z.number(), z.number()]),
  rootDepthRangeMm: z.tuple([z.number(), z.number()]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type CropProfile = z.infer<typeof CropProfileSchema>;

// ==========================================
// 3. CropPlot Schema
// ==========================================

export const CropPlotSchema = z.object({
  id: z.string().min(1),
  schemaVersion: z.number().int().positive().default(1),
  farmerId: z.string().min(1),
  plotName: z.string().min(1),
  crop: CropTypeEnum,
  varietyId: z.string().optional(),
  sowingDate: z.string().min(1), // YYYY-MM-DD
  growthStage: GrowthStageEnum,
  areaHectares: z.number().positive(),
  soilType: SoilTypeEnum.optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type CropPlot = z.infer<typeof CropPlotSchema>;

// ==========================================
// 4. CropVariety Schema
// ==========================================

export const CropVarietySchema = z.object({
  id: z.string().min(1),
  schemaVersion: z.number().int().positive().default(1),
  cropType: CropTypeEnum,
  varietyName: z.string().min(1),
  durationDays: z.number().int().positive(),
  maturityYieldPotentialQuintalPerHa: z.number().positive().optional(),
  droughtTolerance: z.enum(['low', 'moderate', 'high']),
  createdAt: z.string().datetime(),
});
export type CropVariety = z.infer<typeof CropVarietySchema>;

// ==========================================
// 5. DiseaseCatalogEntry & Treatments
// ==========================================

export const TreatmentRecommendationSchema = z.object({
  type: z.enum(['organic', 'chemical', 'cultural']),
  title: z.string().min(1),
  instructions: z.string().min(1),
  dosage: z.string().optional(),
});
export type TreatmentRecommendation = z.infer<typeof TreatmentRecommendationSchema>;

export const DiseaseCatalogEntrySchema = z.object({
  id: z.string().min(1),
  schemaVersion: z.number().int().positive().default(1),
  cropType: CropTypeEnum,
  pathogen: z.string().min(1),
  scientificName: z.string().min(1),
  symptoms: z.array(z.string()).min(1),
  organicTreatments: z.array(TreatmentRecommendationSchema),
  chemicalTreatments: z.array(TreatmentRecommendationSchema),
  culturalPractices: z.array(z.string()).default([]),
  severityScale: z.enum(['low', 'moderate', 'severe', 'critical']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type DiseaseCatalogEntry = z.infer<typeof DiseaseCatalogEntrySchema>;

// ==========================================
// 6. CropScan Schema
// ==========================================

export const CropScanSchema = z.object({
  id: z.string().min(1),
  schemaVersion: z.number().int().positive().default(1),
  farmerId: z.string().optional(),
  plotId: z.string().optional(),
  crop: CropTypeEnum,
  pathogen: z.string().min(1),
  confidence: z.number().min(0).max(1),
  shannonEntropy: z.number().min(0),
  uncertaintyFlag: z.boolean(),
  uncertaintyReason: z.string().optional(),
  treatmentRecommendations: z.array(TreatmentRecommendationSchema).default([]),
  heatmapBase64: z.string().optional(),
  imageUrl: z.string().optional(),
  timestamp: z.string().datetime(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
export type CropScan = z.infer<typeof CropScanSchema>;
export const CropScanResultSchema = CropScanSchema;
export type CropScanResult = CropScan;

// ==========================================
// 7. IrrigationProfile Schema
// ==========================================

export const IrrigationProfileSchema = z.object({
  id: z.string().min(1),
  schemaVersion: z.number().int().positive().default(1),
  farmerId: z.string().min(1),
  plotId: z.string().min(1),
  systemType: IrrigationSystemEnum,
  pumpDischargeRateLpm: z.number().positive(),
  pumpHorsePower: z.number().positive(),
  applicationEfficiencyPercent: z.number().min(10).max(100),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type IrrigationProfile = z.infer<typeof IrrigationProfileSchema>;

// ==========================================
// 8. IrrigationSchedule Schema
// ==========================================

export const IrrigationScheduleSchema = z.object({
  id: z.string().min(1),
  schemaVersion: z.number().int().positive().default(1),
  plotId: z.string().min(1),
  crop: CropTypeEnum,
  growthStage: GrowthStageEnum,
  et0: z.number().min(0),
  kc: z.number().positive(),
  etc: z.number().min(0),
  soilMoistureCurrent: z.number().min(0).max(100),
  soilMoistureDeficit: z.number().min(0),
  effectiveRainfall: z.number().min(0).default(0),
  recommendedLitersPerHectare: z.number().min(0),
  recommendedDurationMinutes: z.number().min(0),
  nextRunAt: z.string().datetime().optional(),
  timestamp: z.string().datetime(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
export type IrrigationSchedule = z.infer<typeof IrrigationScheduleSchema>;

// ==========================================
// 9. SoilProfile Schema
// ==========================================

export const SoilProfileSchema = z.object({
  id: z.string().min(1),
  schemaVersion: z.number().int().positive().default(1),
  plotId: z.string().optional(),
  soilType: SoilTypeEnum,
  fieldCapacityPercent: z.number().min(0).max(100),
  permanentWiltingPointPercent: z.number().min(0).max(100),
  bulkDensityGcm3: z.number().positive(),
  infiltrationRateMmHr: z.number().positive(),
  createdAt: z.string().datetime(),
});
export type SoilProfile = z.infer<typeof SoilProfileSchema>;

// ==========================================
// 10. Mandi Schema
// ==========================================

export const MandiSchema = z.object({
  id: z.string().min(1),
  schemaVersion: z.number().int().positive().default(1),
  marketName: z.string().min(1),
  state: z.string().min(1),
  district: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  marketType: z.enum(['APMC_PRINCIPAL', 'APMC_SUB_YARD', 'ENAM_INTEGRATED', 'RURAL_HAAT']),
  standardMandiFeePercent: z.number().min(0).max(10).default(1.0),
  createdAt: z.string().datetime(),
});
export type Mandi = z.infer<typeof MandiSchema>;

// ==========================================
// 11. MarketPrice Schema
// ==========================================

export const MarketPriceSchema = z.object({
  id: z.string().min(1),
  schemaVersion: z.number().int().positive().default(1),
  mandiId: z.string().min(1),
  commodity: z.string().min(1),
  variety: z.string().optional(),
  grade: z.string().optional(),
  arrivalDate: z.string().min(1), // YYYY-MM-DD
  minPrice: z.number().min(0),
  maxPrice: z.number().min(0),
  modalPrice: z.number().positive(),
  arrivalsTonnes: z.number().min(0).optional(),
  source: z.enum(['AGMARKNET', 'ENAM', 'STATE_PORTAL', 'FIELD_VERIFIED']),
  createdAt: z.string().datetime(),
});
export type MarketPrice = z.infer<typeof MarketPriceSchema>;

// ==========================================
// 12. MandiQuote / MandiArbitrageQuote Schema
// ==========================================

export const MandiArbitrageQuoteSchema = z.object({
  id: z.string().min(1).optional(),
  schemaVersion: z.number().int().positive().default(1),
  mandiId: z.string().min(1),
  marketName: z.string().min(1),
  state: z.string().min(1),
  district: z.string().min(1),
  commodity: z.string().min(1),
  modalPrice: z.number().positive(),
  distanceKm: z.number().min(0),
  distanceType: DistanceCalculationTypeEnum.default('haversine_approximation'),
  haversineKm: z.number().min(0),
  tortuosity: z.number().positive().default(1.28),
  haulageRatePerKm: z.number().min(0).default(3.5),
  transportDeduction: z.number().min(0),
  mandiFeePerQuintal: z.number().min(0).default(0),
  grossValue: z.number().positive(),
  netRealizableValue: z.number(),
  netProfitPerQuintal: z.number(),
  arrivalDate: z.string().min(1),
  isPriceGuaranteed: z.literal(false).default(false),
  disclaimer: z
    .string()
    .default(
      'Reported modal prices are indicative market benchmarks and do not constitute a guaranteed settlement quote.'
    ),
  timestamp: z.string().datetime(),
  createdAt: z.string().datetime().optional(),
});
export type MandiArbitrageQuote = z.infer<typeof MandiArbitrageQuoteSchema>;
export const MandiQuoteSchema = MandiArbitrageQuoteSchema;
export type MandiQuote = MandiArbitrageQuote;

// ==========================================
// 13. VoiceIntent Schema
// ==========================================

export const ExtractedEntitiesSchema = z.object({
  crop: CropTypeEnum.optional(),
  pathogen: z.string().optional(),
  mandi: z.string().optional(),
  location: z.string().optional(),
  commodity: z.string().optional(),
  quantityQuintals: z.number().positive().optional(),
  growthStage: GrowthStageEnum.optional(),
  date: z.string().optional(),
});
export type ExtractedEntities = z.infer<typeof ExtractedEntitiesSchema>;

export const VoiceIntentPayloadSchema = z.object({
  id: z.string().min(1).optional(),
  schemaVersion: z.number().int().positive().default(1),
  queryId: z.string().min(1),
  rawText: z.string().min(1),
  detectedDialect: DialectEnum,
  intent: VoiceIntentEnum,
  confidence: z.number().min(0).max(1),
  extractedEntities: ExtractedEntitiesSchema.default({}),
  synthesizedResponse: z.string().optional(),
  timestamp: z.string().datetime(),
  createdAt: z.string().datetime().optional(),
});
export type VoiceIntentPayload = z.infer<typeof VoiceIntentPayloadSchema>;
export const VoiceIntentSchema = VoiceIntentPayloadSchema;
export type VoiceIntentEntity = VoiceIntentPayload;
export type VoiceIntentRecord = VoiceIntentPayload;

// ==========================================
// 14. SyncMutation Schema
// ==========================================

export const SyncMutationSchema = z.object({
  id: z.string().min(1),
  schemaVersion: z.number().int().positive().default(1),
  mutationUuid: z.string().uuid(),
  entityType: z.enum([
    'farmer',
    'cropPlot',
    'cropScan',
    'irrigationProfile',
    'irrigationSchedule',
    'mandiQuote',
  ]),
  entityId: z.string().min(1),
  operation: OutboxOperationEnum,
  payload: z.record(z.unknown()),
  sequenceNumber: z.number().int().nonnegative(),
  retryCount: z.number().int().nonnegative().default(0),
  maxRetries: z.number().int().positive().default(5),
  status: OutboxStatusEnum.default('queued'),
  clientTimestamp: z.string().datetime(),
  syncedAt: z.string().datetime().optional(),
  lastError: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type SyncMutation = z.infer<typeof SyncMutationSchema>;

// ==========================================
// 15. DatasetManifest Schema
// ==========================================

export const DatasetManifestSchema = z.object({
  id: z.string().min(1),
  schemaVersion: z.number().int().positive().default(1),
  datasetId: z.string().min(1),
  version: z.string().min(1),
  source: z.string().min(1),
  sourceDate: z.string().min(1), // YYYY-MM-DD
  retrievalTimestamp: z.string().datetime(),
  partitionKey: z.string().min(1), // e.g. "punjab-wheat-2026-11"
  recordCount: z.number().int().nonnegative(),
  sha256Checksum: z.string().regex(/^[a-f0-9]{64}$/i),
  format: z.enum(['compressed_json', 'parquet', 'json']),
  downloadUrl: z.string().url(),
  validationStatus: z.enum(['verified', 'quarantined', 'failed']).default('verified'),
  createdAt: z.string().datetime(),
});
export type DatasetManifest = z.infer<typeof DatasetManifestSchema>;

// ==========================================
// 16. ModelManifest Schema
// ==========================================

export const ModelManifestSchema = z.object({
  id: z.string().min(1),
  schemaVersion: z.number().int().positive().default(1),
  modelId: z.string().min(1),
  version: z.string().min(1),
  crop: CropTypeEnum,
  format: z.enum(['tflite', 'onnx', 'wasm_bundle']),
  sha256: z.string().regex(/^[a-f0-9]{64}$/i),
  inputShape: z.tuple([z.number(), z.number(), z.number()]), // [224, 224, 3]
  labelsVersion: z.string().min(1),
  labels: z.array(z.string()).min(1),
  validationStatus: z.enum(['approved', 'testing', 'deprecated']).default('approved'),
  minimumAppVersion: z.string().min(1),
  createdAt: z.string().datetime(),
});
export type ModelManifest = z.infer<typeof ModelManifestSchema>;
