import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { KrishiLocalDatabase } from '../localDb';
import type { LocalScanRecord, CachedMandiPriceRecord, IrrigationQueueRecord } from '../localDb';

describe('Task 1.4: Offline-First Dexie.js Storage & Outbox Verification', () => {
  let db: KrishiLocalDatabase;

  beforeEach(() => {
    // Unique in-memory test database per run
    const testDbName = `test_krishios_${Date.now()}_${Math.random()}`;
    db = new KrishiLocalDatabase(testDbName);
  });

  afterEach(async () => {
    await db.delete();
  });

  describe('Local Crop Scans CRUD', () => {
    it('persists and retrieves offline foliar disease scans', async () => {
      const scan: LocalScanRecord = {
        id: 'scan-local-001',
        crop: 'cotton',
        pathogen: 'Bacterial Blight',
        confidence: 0.93,
        shannonEntropy: 0.15,
        uncertaintyFlag: false,
        treatmentRecommendations: [
          {
            type: 'organic',
            title: 'Neem Oil Spray',
            instructions: 'Apply 5ml/L at evening',
          },
        ],
        timestamp: '2026-11-03T09:00:00.000Z',
        localCreatedAt: '2026-11-03T09:00:00.000Z',
        synced: false,
      };

      await db.localScans.add(scan);
      const retrieved = await db.localScans.get('scan-local-001');

      expect(retrieved).toBeDefined();
      expect(retrieved?.pathogen).toBe('Bacterial Blight');
      expect(retrieved?.synced).toBe(false);

      // Update sync status
      await db.localScans.update('scan-local-001', { synced: true });
      const updated = await db.localScans.get('scan-local-001');
      expect(updated?.synced).toBe(true);
    });

    it('queries scans by uncertainty flag and crop type', async () => {
      await db.localScans.bulkAdd([
        {
          id: 'scan-c1',
          crop: 'cotton',
          pathogen: 'Healthy',
          confidence: 0.98,
          shannonEntropy: 0.05,
          uncertaintyFlag: false,
          treatmentRecommendations: [],
          timestamp: '2026-11-03T09:10:00.000Z',
          localCreatedAt: '2026-11-03T09:10:00.000Z',
          synced: true,
        },
        {
          id: 'scan-c2',
          crop: 'cotton',
          pathogen: 'Leaf Curl Virus',
          confidence: 0.52,
          shannonEntropy: 0.55,
          uncertaintyFlag: true,
          uncertaintyReason: 'UNCERTAIN_IMAGE_QUALITY',
          treatmentRecommendations: [],
          timestamp: '2026-11-03T09:12:00.000Z',
          localCreatedAt: '2026-11-03T09:12:00.000Z',
          synced: false,
        },
      ]);

      const uncertainScans = await db.localScans
        .filter((scan) => scan.uncertaintyFlag === true)
        .toArray();

      expect(uncertainScans.length).toBe(1);
      expect(uncertainScans[0]?.id).toBe('scan-c2');
    });
  });

  describe('Cached Mandi Prices', () => {
    it('stores wholesale Mandi rate quotes and filters by commodity', async () => {
      const quote: CachedMandiPriceRecord = {
        id: 'Wheat_mandi-khanna_2026-11-03',
        mandiId: 'mandi-khanna',
        marketName: 'Khanna',
        state: 'Punjab',
        district: 'Ludhiana',
        commodity: 'Wheat',
        modalPrice: 2420,
        distanceKm: 42.5,
        haversineKm: 33.2,
        tortuosity: 1.28,
        haulageRatePerKm: 3.5,
        transportDeduction: 148.75,
        mandiFeePerQuintal: 12.0,
        grossValue: 2420,
        netRealizableValue: 2259.25,
        netProfitPerQuintal: 159.25,
        arrivalDate: '2026-11-03',
        timestamp: '2026-11-03T08:00:00.000Z',
        cachedAt: '2026-11-03T08:05:00.000Z',
      };

      await db.cachedMandiPrices.put(quote);
      const cached = await db.cachedMandiPrices
        .where('commodity')
        .equals('Wheat')
        .toArray();

      expect(cached.length).toBe(1);
      expect(cached[0]?.marketName).toBe('Khanna');
      expect(cached[0]?.netRealizableValue).toBe(2259.25);
    });
  });

  describe('Irrigation Queue', () => {
    it('manages offline irrigation schedules and status transitions', async () => {
      const task: IrrigationQueueRecord = {
        id: 'irrig-task-01',
        plotId: 'plot-north-4',
        crop: 'mustard',
        growthStage: 'development',
        et0: 4.2,
        kc: 0.85,
        etc: 3.57,
        soilMoistureCurrent: 38.0,
        soilMoistureDeficit: 24.5,
        effectiveRainfall: 0,
        recommendedLitersPerHectare: 245000,
        recommendedDurationMinutes: 145,
        scheduledFor: '2026-11-04T05:00:00.000Z',
        status: 'pending',
        createdAt: '2026-11-03T18:00:00.000Z',
        timestamp: '2026-11-03T18:00:00.000Z',
      };

      await db.irrigationQueue.add(task);
      const pendingTasks = await db.irrigationQueue
        .where('status')
        .equals('pending')
        .toArray();

      expect(pendingTasks.length).toBe(1);
      expect(pendingTasks[0]?.plotId).toBe('plot-north-4');

      // Update to completed
      await db.irrigationQueue.update('irrig-task-01', { status: 'completed' });
      const completed = await db.irrigationQueue.get('irrig-task-01');
      expect(completed?.status).toBe('completed');
    });
  });

  describe('Sync Outbox Queue Ordering & Resilience', () => {
    it('maintains strict chronological ordering (FIFO) for pending outbox mutations', async () => {
      const id1 = await db.enqueueMutation(
        'crop_scan',
        'scan-101',
        'CREATE',
        { pathogen: 'White Rust' }
      );

      // Stagger slightly to guarantee timestamp ordering
      await new Promise((r) => setTimeout(r, 10));

      const id2 = await db.enqueueMutation(
        'irrigation_schedule',
        'irrig-202',
        'CREATE',
        { recommendedDurationMinutes: 60 }
      );

      await new Promise((r) => setTimeout(r, 10));

      const id3 = await db.enqueueMutation(
        'crop_scan',
        'scan-103',
        'UPDATE',
        { treatmentApplied: true }
      );

      const pending = await db.getNextPendingMutations(10);
      expect(pending.length).toBe(3);
      expect(pending[0]?.id).toBe(id1);
      expect(pending[1]?.id).toBe(id2);
      expect(pending[2]?.id).toBe(id3);
    });

    it('tracks retry count and marks mutation as failed when exceeding maxRetries', async () => {
      const id = await db.enqueueMutation(
        'crop_scan',
        'scan-err',
        'CREATE',
        { test: 123 },
        2 // maxRetries = 2
      );

      // 1st failure
      await db.recordMutationOutcome(id, false, 'Network 503 Service Unavailable');
      let item = await db.syncOutbox.get(id);
      expect(item?.retryCount).toBe(1);
      expect(item?.status).toBe('queued');
      expect(item?.lastError).toBe('Network 503 Service Unavailable');

      // 2nd failure -> reaches maxRetries
      await db.recordMutationOutcome(id, false, 'Network Timeout');
      item = await db.syncOutbox.get(id);
      expect(item?.retryCount).toBe(2);
      expect(item?.status).toBe('failed');
    });

    it('purges synced mutations cleanly', async () => {
      const id1 = await db.enqueueMutation('crop_scan', 'scan-s1', 'CREATE', {});
      const id2 = await db.enqueueMutation('crop_scan', 'scan-s2', 'CREATE', {});

      await db.recordMutationOutcome(id1, true); // marked synced

      const purged = await db.purgeSyncedMutations();
      expect(purged).toBe(1);

      const remaining = await db.syncOutbox.toArray();
      expect(remaining.length).toBe(1);
      expect(remaining[0]?.id).toBe(id2);
    });
  });

  describe('Phase 2 Dexie v2 Complete 13 Stores & Utilities', () => {
    it('initializes all 13 required stores successfully', async () => {
      expect(db.farmers).toBeDefined();
      expect(db.cropPlots).toBeDefined();
      expect(db.localScans).toBeDefined();
      expect(db.cachedDiseases).toBeDefined();
      expect(db.cachedMandiPrices).toBeDefined();
      expect(db.cachedWeather).toBeDefined();
      expect(db.irrigationProfiles).toBeDefined();
      expect(db.irrigationQueue).toBeDefined();
      expect(db.syncOutbox).toBeDefined();
      expect(db.syncConflicts).toBeDefined();
      expect(db.datasetManifests).toBeDefined();
      expect(db.modelManifests).toBeDefined();
      expect(db.appMetadata).toBeDefined();
    });

    it('persists and retrieves farmer and plot records', async () => {
      await db.farmers.add({
        id: 'f-1',
        schemaVersion: 1,
        phone: '9876543210',
        name: 'Sukhwinder',
        dialect: 'punjabi',
        state: 'Punjab',
        createdAt: '2026-11-05T00:00:00.000Z',
        updatedAt: '2026-11-05T00:00:00.000Z',
      });

      await db.cropPlots.add({
        id: 'plot-1',
        schemaVersion: 1,
        farmerId: 'f-1',
        plotName: 'East Plot',
        crop: 'rice',
        sowingDate: '2026-06-01',
        growthStage: 'mid_season',
        areaHectares: 1.5,
        createdAt: '2026-11-05T00:00:00.000Z',
        updatedAt: '2026-11-05T00:00:00.000Z',
      });

      const retrievedFarmer = await db.farmers.get('f-1');
      expect(retrievedFarmer?.name).toBe('Sukhwinder');

      const retrievedPlots = await db.cropPlots.where('farmerId').equals('f-1').toArray();
      expect(retrievedPlots.length).toBe(1);
      expect(retrievedPlots[0]?.plotName).toBe('East Plot');
    });

    it('executes checkStorageQuota without crashing', async () => {
      const quota = await db.checkStorageQuota();
      expect(typeof quota.quotaBytes).toBe('number');
      expect(typeof quota.usageBytes).toBe('number');
    });

    it('verifies active connectivity probe behavior', async () => {
      const isConnected = await db.probeConnectivity('/test-probe', 500);
      expect(typeof isConnected).toBe('boolean');
    });
  });
});

