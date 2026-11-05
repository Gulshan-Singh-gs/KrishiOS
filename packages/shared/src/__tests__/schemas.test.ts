import { describe, it, expect } from 'vitest';
import {
  CropScanResultSchema,
  IrrigationScheduleSchema,
  MandiArbitrageQuoteSchema,
  VoiceIntentPayloadSchema,
} from '../schemas';

describe('Task 1.2: Zod Domain Schemas Verification', () => {
  // ==========================================
  // Test Data Collections (10 Valid, 10 Malformed)
  // ==========================================
  const validScans = [
    {
      id: 'scan-001',
      crop: 'cotton',
      pathogen: 'Bacterial Blight',
      confidence: 0.94,
      shannonEntropy: 0.12,
      uncertaintyFlag: false,
      treatmentRecommendations: [
        {
          type: 'chemical',
          title: 'Copper Oxychloride Spray',
          instructions: 'Spray 500g in 200L water per acre',
          dosage: '2.5g/L',
        },
      ],
      timestamp: '2026-11-03T10:00:00.000Z',
    },
    {
      id: 'scan-002',
      crop: 'mustard',
      pathogen: 'Alternaria Blight',
      confidence: 0.88,
      shannonEntropy: 0.25,
      uncertaintyFlag: false,
      timestamp: '2026-11-03T11:30:00.000Z',
    },
    {
      id: 'scan-003',
      crop: 'rice',
      pathogen: 'Blast (Magnaporthe oryzae)',
      confidence: 0.61,
      shannonEntropy: 0.48,
      uncertaintyFlag: true,
      uncertaintyReason: 'UNCERTAIN_IMAGE_QUALITY',
      heatmapBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==',
      timestamp: '2026-11-03T12:00:00.000Z',
    },
  ];

  const malformedScans = [
    {
      // Missing pathogen
      id: 'scan-bad-1',
      crop: 'cotton',
      confidence: 0.95,
      shannonEntropy: 0.1,
      uncertaintyFlag: false,
      timestamp: '2026-11-03T10:00:00.000Z',
    },
    {
      // Confidence > 1
      id: 'scan-bad-2',
      crop: 'wheat',
      pathogen: 'Yellow Rust',
      confidence: 1.45,
      shannonEntropy: 0.2,
      uncertaintyFlag: false,
      timestamp: '2026-11-03T10:00:00.000Z',
    },
    {
      // Negative Shannon entropy
      id: 'scan-bad-3',
      crop: 'mustard',
      pathogen: 'White Rust',
      confidence: 0.8,
      shannonEntropy: -0.1,
      uncertaintyFlag: false,
      timestamp: '2026-11-03T10:00:00.000Z',
    },
  ];

  const validSchedules = [
    {
      id: 'irrig-001',
      plotId: 'plot-alpha',
      crop: 'wheat',
      growthStage: 'mid_season',
      et0: 4.8,
      kc: 1.15,
      etc: 5.52,
      soilMoistureCurrent: 42.5,
      soilMoistureDeficit: 22.0,
      effectiveRainfall: 0,
      recommendedLitersPerHectare: 220000,
      recommendedDurationMinutes: 180,
      timestamp: '2026-11-03T06:00:00.000Z',
    },
    {
      id: 'irrig-002',
      plotId: 'plot-beta',
      crop: 'cotton',
      growthStage: 'development',
      et0: 6.2,
      kc: 0.75,
      etc: 4.65,
      soilMoistureCurrent: 55.0,
      soilMoistureDeficit: 15.5,
      effectiveRainfall: 5.0,
      recommendedLitersPerHectare: 105000,
      recommendedDurationMinutes: 90,
      nextRunAt: '2026-11-04T06:00:00.000Z',
      timestamp: '2026-11-03T06:00:00.000Z',
    },
  ];

  const malformedSchedules = [
    {
      // Negative ET0
      id: 'irrig-bad-1',
      plotId: 'plot-1',
      crop: 'rice',
      growthStage: 'initial',
      et0: -2.5,
      kc: 1.05,
      etc: 2.5,
      soilMoistureCurrent: 60,
      soilMoistureDeficit: 10,
      recommendedLitersPerHectare: 100000,
      recommendedDurationMinutes: 60,
      timestamp: '2026-11-03T06:00:00.000Z',
    },
    {
      // Invalid growthStage enum
      id: 'irrig-bad-2',
      plotId: 'plot-2',
      crop: 'mustard',
      growthStage: 'flowering_unknown',
      et0: 3.5,
      kc: 1.0,
      etc: 3.5,
      soilMoistureCurrent: 50,
      soilMoistureDeficit: 10,
      recommendedLitersPerHectare: 100000,
      recommendedDurationMinutes: 60,
      timestamp: '2026-11-03T06:00:00.000Z',
    },
    {
      // Soil moisture current > 100%
      id: 'irrig-bad-3',
      plotId: 'plot-3',
      crop: 'wheat',
      growthStage: 'late_season',
      et0: 3.0,
      kc: 0.65,
      etc: 1.95,
      soilMoistureCurrent: 125,
      soilMoistureDeficit: 0,
      recommendedLitersPerHectare: 0,
      recommendedDurationMinutes: 0,
      timestamp: '2026-11-03T06:00:00.000Z',
    },
  ];

  const validQuotes = [
    {
      mandiId: 'mandi-kharar',
      marketName: 'Kharar',
      state: 'Punjab',
      district: 'SAS Nagar',
      commodity: 'Cotton',
      modalPrice: 7200,
      distanceKm: 24.3,
      haversineKm: 19.0,
      tortuosity: 1.28,
      haulageRatePerKm: 3.5,
      transportDeduction: 85.05,
      mandiFeePerQuintal: 10.0,
      grossValue: 7200,
      netRealizableValue: 7104.95,
      netProfitPerQuintal: 254.95,
      arrivalDate: '2026-11-03',
      timestamp: '2026-11-03T08:30:00.000Z',
    },
    {
      mandiId: 'mandi-khanna',
      marketName: 'Khanna',
      state: 'Punjab',
      district: 'Ludhiana',
      commodity: 'Wheat',
      modalPrice: 2450,
      distanceKm: 65.2,
      haversineKm: 50.9,
      tortuosity: 1.28,
      haulageRatePerKm: 3.5,
      transportDeduction: 228.2,
      mandiFeePerQuintal: 15.0,
      grossValue: 2450,
      netRealizableValue: 2206.8,
      netProfitPerQuintal: 120.5,
      arrivalDate: '2026-11-03',
      timestamp: '2026-11-03T09:00:00.000Z',
    },
    {
      mandiId: 'mandi-rupnagar',
      marketName: 'Rupnagar',
      state: 'Punjab',
      district: 'Rupnagar',
      commodity: 'Mustard',
      modalPrice: 5650,
      distanceKm: 15.5,
      haversineKm: 12.1,
      tortuosity: 1.28,
      haulageRatePerKm: 3.5,
      transportDeduction: 54.25,
      mandiFeePerQuintal: 5.0,
      grossValue: 5650,
      netRealizableValue: 5590.75,
      netProfitPerQuintal: 190.75,
      arrivalDate: '2026-11-03',
      timestamp: '2026-11-03T09:15:00.000Z',
    },
  ];

  const malformedQuotes = [
    {
      // Negative modal price
      mandiId: 'mandi-bad-1',
      marketName: 'Rupnagar',
      state: 'Punjab',
      district: 'Rupnagar',
      commodity: 'Wheat',
      modalPrice: -2200,
      distanceKm: 15.0,
      haversineKm: 12.0,
      transportDeduction: 50,
      grossValue: 2200,
      netRealizableValue: 2150,
      netProfitPerQuintal: 50,
      arrivalDate: '2026-11-03',
      timestamp: '2026-11-03T08:00:00.000Z',
    },
    {
      // Negative distanceKm
      mandiId: 'mandi-bad-2',
      marketName: 'Kurali',
      state: 'Punjab',
      district: 'SAS Nagar',
      commodity: 'Mustard',
      modalPrice: 5400,
      distanceKm: -12.5,
      haversineKm: 10.0,
      transportDeduction: 40,
      grossValue: 5400,
      netRealizableValue: 5360,
      netProfitPerQuintal: 60,
      arrivalDate: '2026-11-03',
      timestamp: '2026-11-03T08:00:00.000Z',
    },
  ];

  const validVoiceIntents = [
    {
      queryId: 'voice-001',
      rawText: 'Kharar mandi mein narma ka kya rate chal raha hai?',
      detectedDialect: 'hinglish',
      intent: 'MANDI_PRICE_QUERY',
      confidence: 0.96,
      extractedEntities: {
        mandi: 'Kharar',
        commodity: 'Cotton',
      },
      synthesizedResponse: 'Kharar mandi mein narma ka modal rate ₹7,200 prat quintal hai.',
      timestamp: '2026-11-03T14:00:00.000Z',
    },
    {
      queryId: 'voice-002',
      rawText: 'Sarson de patte te kaale dhabbe dikh rahe ne, kee karaan?',
      detectedDialect: 'punjabi_english',
      intent: 'CROP_DISEASE_DIAGNOSIS',
      confidence: 0.92,
      extractedEntities: {
        crop: 'mustard',
      },
      timestamp: '2026-11-03T14:05:00.000Z',
    },
  ];

  const malformedVoiceIntents = [
    {
      // Invalid intent enum
      queryId: 'voice-bad-1',
      rawText: 'Test text',
      detectedDialect: 'hinglish',
      intent: 'BUY_TRACTOR_LOAN',
      confidence: 0.8,
      timestamp: '2026-11-03T14:00:00.000Z',
    },
    {
      // Confidence > 1
      queryId: 'voice-bad-2',
      rawText: 'Watering schedule needed',
      detectedDialect: 'english',
      intent: 'IRRIGATION_QUERY',
      confidence: 1.5,
      timestamp: '2026-11-03T14:00:00.000Z',
    },
  ];

  // ==========================================
  // CropScanResult Tests
  // ==========================================
  describe('CropScanResultSchema', () => {
    it.each(validScans)('should validate valid scan %j', (payload) => {
      const result = CropScanResultSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it.each(malformedScans)('should reject malformed scan %j', (payload) => {
      const result = CropScanResultSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  // ==========================================
  // IrrigationSchedule Tests
  // ==========================================
  describe('IrrigationScheduleSchema', () => {
    it.each(validSchedules)('should validate valid schedule %j', (payload) => {
      const result = IrrigationScheduleSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it.each(malformedSchedules)('should reject malformed schedule %j', (payload) => {
      const result = IrrigationScheduleSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  // ==========================================
  // MandiArbitrageQuote Tests
  // ==========================================
  describe('MandiArbitrageQuoteSchema', () => {
    it.each(validQuotes)('should validate valid quote %j', (payload) => {
      const result = MandiArbitrageQuoteSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it.each(malformedQuotes)('should reject malformed quote %j', (payload) => {
      const result = MandiArbitrageQuoteSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  // ==========================================
  // VoiceIntentPayload Tests
  // ==========================================
  describe('VoiceIntentPayloadSchema', () => {
    it.each(validVoiceIntents)('should validate valid voice intent %j', (payload) => {
      const result = VoiceIntentPayloadSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it.each(malformedVoiceIntents)('should reject malformed voice intent %j', (payload) => {
      const result = VoiceIntentPayloadSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it('summarizes 10 valid and 10 malformed test payloads total', () => {
      // 3 + 2 + 3 + 2 = 10 valid payloads
      expect(validScans.length + validSchedules.length + validQuotes.length + validVoiceIntents.length).toBe(10);
      // 3 + 3 + 2 + 2 = 10 malformed payloads
      expect(malformedScans.length + malformedSchedules.length + malformedQuotes.length + malformedVoiceIntents.length).toBe(10);
    });
  });

  // ==========================================
  // Phase 1 Canonical 16 Domain Entities Tests
  // ==========================================
  describe('Phase 1: Full 16 Canonical Domain Entities Verification', () => {
    it('validates FarmerSchema', async () => {
      const { FarmerSchema } = await import('../schemas');
      const valid = {
        id: 'farmer-101',
        phone: '+919876543210',
        name: 'Harpreet Singh',
        dialect: 'punjabi',
        village: 'Khanna Khurd',
        district: 'Ludhiana',
        state: 'Punjab',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const parsed = FarmerSchema.parse(valid);
      expect(parsed.schemaVersion).toBe(1);
      expect(parsed.name).toBe('Harpreet Singh');

      expect(() => FarmerSchema.parse({ ...valid, phone: '123' })).toThrow();
    });

    it('validates CropProfileSchema', async () => {
      const { CropProfileSchema } = await import('../schemas');
      const valid = {
        id: 'crop-profile-wheat',
        cropType: 'wheat',
        botanicalName: 'Triticum aestivum',
        standardSeason: 'rabi',
        faoCropCoefficients: { initial: 0.3, development: 0.7, mid_season: 1.15, late_season: 0.4 },
        optimalSoilPhRange: [6.0, 7.5],
        rootDepthRangeMm: [600, 1200],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(CropProfileSchema.parse(valid).botanicalName).toBe('Triticum aestivum');
      expect(() => CropProfileSchema.parse({ ...valid, optimalSoilPhRange: [6.0] })).toThrow();
    });

    it('validates CropPlotSchema', async () => {
      const { CropPlotSchema } = await import('../schemas');
      const valid = {
        id: 'plot-alpha-1',
        farmerId: 'farmer-101',
        plotName: 'North Field 4A',
        crop: 'cotton',
        sowingDate: '2026-05-15',
        growthStage: 'mid_season',
        areaHectares: 2.5,
        soilType: 'alluvial',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(CropPlotSchema.parse(valid).areaHectares).toBe(2.5);
      expect(() => CropPlotSchema.parse({ ...valid, areaHectares: -1 })).toThrow();
    });

    it('validates CropVarietySchema', async () => {
      const { CropVarietySchema } = await import('../schemas');
      const valid = {
        id: 'var-hd-3086',
        cropType: 'wheat',
        varietyName: 'HD 3086 (Pusa Gautami)',
        durationDays: 140,
        droughtTolerance: 'high',
        createdAt: new Date().toISOString(),
      };
      expect(CropVarietySchema.parse(valid).durationDays).toBe(140);
      expect(() => CropVarietySchema.parse({ ...valid, droughtTolerance: 'extreme' })).toThrow();
    });

    it('validates DiseaseCatalogEntrySchema', async () => {
      const { DiseaseCatalogEntrySchema } = await import('../schemas');
      const valid = {
        id: 'dis-wheat-yellow-rust',
        cropType: 'wheat',
        pathogen: 'Yellow Rust',
        scientificName: 'Puccinia striiformis',
        symptoms: ['Yellow stripes of pustules on leaves'],
        organicTreatments: [{ type: 'organic', title: 'Trichoderma spray', instructions: 'Apply early' }],
        chemicalTreatments: [{ type: 'chemical', title: 'Propiconazole 25% EC', instructions: 'Spray 0.1%' }],
        severityScale: 'severe',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(DiseaseCatalogEntrySchema.parse(valid).pathogen).toBe('Yellow Rust');
      expect(() => DiseaseCatalogEntrySchema.parse({ ...valid, symptoms: [] })).toThrow();
    });

    it('validates IrrigationProfileSchema', async () => {
      const { IrrigationProfileSchema } = await import('../schemas');
      const valid = {
        id: 'irrig-prof-1',
        farmerId: 'farmer-101',
        plotId: 'plot-alpha-1',
        systemType: 'drip',
        pumpDischargeRateLpm: 450,
        pumpHorsePower: 7.5,
        applicationEfficiencyPercent: 90,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(IrrigationProfileSchema.parse(valid).applicationEfficiencyPercent).toBe(90);
      expect(() => IrrigationProfileSchema.parse({ ...valid, applicationEfficiencyPercent: 120 })).toThrow();
    });

    it('validates SoilProfileSchema', async () => {
      const { SoilProfileSchema } = await import('../schemas');
      const valid = {
        id: 'soil-prof-1',
        soilType: 'clay_loam',
        fieldCapacityPercent: 32,
        permanentWiltingPointPercent: 15,
        bulkDensityGcm3: 1.35,
        infiltrationRateMmHr: 12,
        createdAt: new Date().toISOString(),
      };
      expect(SoilProfileSchema.parse(valid).fieldCapacityPercent).toBe(32);
      expect(() => SoilProfileSchema.parse({ ...valid, fieldCapacityPercent: -5 })).toThrow();
    });

    it('validates MandiSchema', async () => {
      const { MandiSchema } = await import('../schemas');
      const valid = {
        id: 'mandi-khanna',
        marketName: 'Khanna Grain Market',
        state: 'Punjab',
        district: 'Ludhiana',
        latitude: 30.705,
        longitude: 76.221,
        marketType: 'APMC_PRINCIPAL',
        standardMandiFeePercent: 1.5,
        createdAt: new Date().toISOString(),
      };
      expect(MandiSchema.parse(valid).marketName).toBe('Khanna Grain Market');
      expect(() => MandiSchema.parse({ ...valid, latitude: 120 })).toThrow();
    });

    it('validates MarketPriceSchema', async () => {
      const { MarketPriceSchema } = await import('../schemas');
      const valid = {
        id: 'price-khanna-wheat-today',
        mandiId: 'mandi-khanna',
        commodity: 'Wheat',
        arrivalDate: '2026-11-05',
        minPrice: 2400,
        maxPrice: 2650,
        modalPrice: 2525,
        source: 'AGMARKNET',
        createdAt: new Date().toISOString(),
      };
      expect(MarketPriceSchema.parse(valid).modalPrice).toBe(2525);
      expect(() => MarketPriceSchema.parse({ ...valid, modalPrice: -100 })).toThrow();
    });

    it('validates SyncMutationSchema', async () => {
      const { SyncMutationSchema } = await import('../schemas');
      const valid = {
        id: 'sync-mut-001',
        mutationUuid: '123e4567-e89b-12d3-a456-426614174000',
        entityType: 'cropPlot',
        entityId: 'plot-alpha-1',
        operation: 'CREATE',
        payload: { plotName: 'Field 1' },
        sequenceNumber: 1,
        retryCount: 0,
        status: 'queued',
        clientTimestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(SyncMutationSchema.parse(valid).operation).toBe('CREATE');
      expect(() => SyncMutationSchema.parse({ ...valid, mutationUuid: 'not-a-uuid' })).toThrow();
    });

    it('validates DatasetManifestSchema', async () => {
      const { DatasetManifestSchema } = await import('../schemas');
      const valid = {
        id: 'manifest-mandi-punjab-202611',
        datasetId: 'mandi-prices-punjab',
        version: '1.0.0',
        source: 'Agmarknet Daily Batch',
        sourceDate: '2026-11-05',
        retrievalTimestamp: new Date().toISOString(),
        partitionKey: 'punjab-all-20261105',
        recordCount: 1450,
        sha256Checksum: 'a'.repeat(64),
        format: 'compressed_json',
        downloadUrl: 'https://cdn.krishios.dev/datasets/punjab-20261105.json.gz',
        validationStatus: 'verified',
        createdAt: new Date().toISOString(),
      };
      expect(DatasetManifestSchema.parse(valid).recordCount).toBe(1450);
      expect(() => DatasetManifestSchema.parse({ ...valid, sha256Checksum: 'invalid' })).toThrow();
    });

    it('validates ModelManifestSchema', async () => {
      const { ModelManifestSchema } = await import('../schemas');
      const valid = {
        id: 'model-cotton-blight-v1',
        modelId: 'cotton-blight-quant',
        version: '1.0.0',
        crop: 'cotton',
        format: 'tflite',
        sha256: 'b'.repeat(64),
        inputShape: [224, 224, 3],
        labelsVersion: '1.0.0',
        labels: ['healthy', 'bacterial_blight', 'leaf_curl'],
        validationStatus: 'approved',
        minimumAppVersion: '1.0.0',
        createdAt: new Date().toISOString(),
      };
      expect(ModelManifestSchema.parse(valid).inputShape).toEqual([224, 224, 3]);
      expect(() => ModelManifestSchema.parse({ ...valid, sha256: 'short' })).toThrow();
    });
  });
});
