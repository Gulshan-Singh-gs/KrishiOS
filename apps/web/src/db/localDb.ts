import Dexie, { type Table } from 'dexie';
import type {
  Farmer,
  CropPlot,
  CropScan,
  DiseaseCatalogEntry,
  IrrigationProfile,
  IrrigationSchedule,
  MandiArbitrageQuote,
  DatasetManifest,
  ModelManifest,
  OutboxOperation,
  OutboxStatus,
} from '@krishios/shared';

export interface LocalScanRecord extends CropScan {
  synced: boolean;
  localCreatedAt: string;
}

export interface CachedMandiPriceRecord extends MandiArbitrageQuote {
  id: string; // Unique cached composite key: `${commodity}_${mandiId}_${arrivalDate}`
  cachedAt: string;
  expiresAt: string;
}

export interface CachedWeatherRecord {
  id: string; // e.g. `${latitude.toFixed(2)}_${longitude.toFixed(2)}_${date}`
  latitude: number;
  longitude: number;
  date: string;
  tempMeanC: number;
  tempMaxC?: number;
  tempMinC?: number;
  relativeHumidityPercent?: number;
  windSpeed2mMs: number;
  netRadiationMjM2Day: number;
  precipitationMm?: number;
  cachedAt: string;
  expiresAt: string;
}

export interface IrrigationQueueRecord extends IrrigationSchedule {
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  scheduledFor: string;
  createdAt: string;
}

export interface SyncOutboxRecord {
  id: string;
  mutationUuid: string;
  entityType:
    | 'farmer'
    | 'cropPlot'
    | 'cropScan'
    | 'irrigationProfile'
    | 'irrigationSchedule'
    | 'mandiQuote'
    | 'general';
  entityId: string;
  operation: OutboxOperation;
  payload: Record<string, unknown>;
  schemaVersion: number;
  sequenceNumber: number;
  retryCount: number;
  maxRetries: number;
  nextRetryAt?: string;
  lastError?: string;
  status: OutboxStatus;
  clientTimestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyncConflictRecord {
  id: string;
  mutationUuid: string;
  entityType: string;
  entityId: string;
  localPayload: Record<string, unknown>;
  serverPayload: Record<string, unknown>;
  resolution: 'client_wins' | 'server_wins' | 'manual_review';
  resolvedAt?: string;
  createdAt: string;
}

export interface AppMetadataRecord {
  key: string;
  value: unknown;
  updatedAt: string;
}

/**
 * KrishiOS Enterprise Client Database (Dexie.js v2)
 * Complete offline persistence layer adhering to Phase 2 specification.
 */
export class KrishiLocalDatabase extends Dexie {
  farmers!: Table<Farmer, string>;
  cropPlots!: Table<CropPlot, string>;
  localScans!: Table<LocalScanRecord, string>;
  cachedDiseases!: Table<DiseaseCatalogEntry, string>;
  cachedMandiPrices!: Table<CachedMandiPriceRecord, string>;
  cachedWeather!: Table<CachedWeatherRecord, string>;
  irrigationProfiles!: Table<IrrigationProfile, string>;
  irrigationQueue!: Table<IrrigationQueueRecord, string>;
  syncOutbox!: Table<SyncOutboxRecord, string>;
  syncConflicts!: Table<SyncConflictRecord, string>;
  datasetManifests!: Table<DatasetManifest, string>;
  modelManifests!: Table<ModelManifest, string>;
  appMetadata!: Table<AppMetadataRecord, string>;

  constructor(dbName = 'KrishiOS_OfflineDB') {
    super(dbName);

    // Schema Version 1 (Baseline)
    this.version(1).stores({
      localScans: 'id, crop, pathogen, uncertaintyFlag, timestamp, synced',
      cachedMandiPrices: 'id, mandiId, commodity, state, cachedAt',
      irrigationQueue: 'id, plotId, scheduledFor, status, createdAt',
      syncOutbox: 'id, entityType, status, retryCount, createdAt',
    });

    // Schema Version 2 (Comprehensive 13-store Enterprise Suite with migrations)
    this.version(2)
      .stores({
        farmers: 'id, phone, name, state, createdAt',
        cropPlots: 'id, farmerId, crop, sowingDate, createdAt',
        localScans: 'id, crop, pathogen, timestamp, synced',
        cachedDiseases: 'id, cropType, pathogen, severityScale',
        cachedMandiPrices: 'id, mandiId, commodity, state, cachedAt, expiresAt',
        cachedWeather: 'id, date, cachedAt, expiresAt',
        irrigationProfiles: 'id, farmerId, plotId, systemType',
        irrigationQueue: 'id, plotId, scheduledFor, status, createdAt',
        syncOutbox: 'id, mutationUuid, entityType, status, sequenceNumber, retryCount, createdAt',
        syncConflicts: 'id, mutationUuid, entityType, entityId, createdAt',
        datasetManifests: 'id, datasetId, partitionKey, version, createdAt',
        modelManifests: 'id, modelId, crop, version, validationStatus',
        appMetadata: 'key, updatedAt',
      })
      .upgrade((tx) => {
        // Safe migration logic: seed essential metadata if upgrading from v1
        return tx
          .table('appMetadata')
          .add({
            key: 'schema_migrated_v2',
            value: true,
            updatedAt: new Date().toISOString(),
          })
          .catch(() => {});
      });
  }

  /**
   * Enqueue a pending mutation to the sync outbox with automatic UUID and sequencing.
   */
  async enqueueMutation(
    entityType: SyncOutboxRecord['entityType'],
    entityId: string,
    operation: OutboxOperation,
    payload: unknown,
    maxRetries = 5
  ): Promise<string> {
    const id = `outbox_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const mutationUuid =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-xxxx-4xxx-yxxx-${Math.random().toString(16).slice(2, 10)}`;
    const now = new Date().toISOString();

    // Determine current sequence number
    const count = await this.syncOutbox.count();
    const sequenceNumber = count + 1;

    const record: SyncOutboxRecord = {
      id,
      mutationUuid,
      entityType,
      entityId,
      operation,
      payload: (payload as Record<string, unknown>) ?? {},
      schemaVersion: 1,
      sequenceNumber,
      retryCount: 0,
      maxRetries,
      status: 'queued',
      clientTimestamp: now,
      createdAt: now,
      updatedAt: now,
    };

    await this.syncOutbox.add(record);
    return id;
  }

  /**
   * Retrieves pending outbox mutations ordered strictly chronologically (FIFO).
   */
  async getNextPendingMutations(limit = 50): Promise<SyncOutboxRecord[]> {
    return this.syncOutbox
      .where('status')
      .equals('queued')
      .sortBy('createdAt')
      .then((records) => records.slice(0, limit));
  }

  /**
   * Record mutation outcome with exponential backoff calculation.
   */
  async recordMutationOutcome(
    id: string,
    success: boolean,
    errorMessage?: string
  ): Promise<void> {
    const item = await this.syncOutbox.get(id);
    if (!item) return;

    const now = new Date();
    if (success) {
      await this.syncOutbox.update(id, {
        status: 'synced',
        retryCount: item.retryCount,
        lastError: undefined,
        updatedAt: now.toISOString(),
      });
    } else {
      const nextRetryCount = item.retryCount + 1;
      const isFailed = nextRetryCount >= item.maxRetries;
      // Exponential backoff: 2^retryCount * 1000ms (max 1 hour)
      const backoffMs = Math.min(3600000, Math.pow(2, nextRetryCount) * 1000);
      const nextRetryTime = new Date(now.getTime() + backoffMs).toISOString();

      await this.syncOutbox.update(id, {
        status: isFailed ? 'failed' : 'queued',
        retryCount: nextRetryCount,
        nextRetryAt: isFailed ? undefined : nextRetryTime,
        lastError: errorMessage,
        updatedAt: now.toISOString(),
      });
    }
  }

  /**
   * Cleans up successfully synced mutations.
   */
  async purgeSyncedMutations(): Promise<number> {
    const syncedIds = await this.syncOutbox
      .where('status')
      .equals('synced')
      .primaryKeys();

    await this.syncOutbox.bulkDelete(syncedIds);
    return syncedIds.length;
  }

  /**
   * Checks available browser storage quota and usage.
   */
  async checkStorageQuota(): Promise<{
    quotaBytes: number;
    usageBytes: number;
    usagePercentage: number;
    isPersistent: boolean;
  }> {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      const quota = estimate.quota || 0;
      const usage = estimate.usage || 0;
      const usagePercentage = quota > 0 ? Number(((usage / quota) * 100).toFixed(2)) : 0;
      const isPersistent = navigator.storage.persisted
        ? await navigator.storage.persisted()
        : false;

      return {
        quotaBytes: quota,
        usageBytes: usage,
        usagePercentage,
        isPersistent,
      };
    }

    return {
      quotaBytes: 0,
      usageBytes: 0,
      usagePercentage: 0,
      isPersistent: false,
    };
  }

  /**
   * Active Network Probe (distinguishes real server reachability from navigator.onLine)
   */
  async probeConnectivity(healthEndpoint = '/health', timeoutMs = 3000): Promise<boolean> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return false;
    }

    if (typeof fetch === 'undefined') {
      return true;
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(healthEndpoint, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timer);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Singleton offline database export
export const localDb = new KrishiLocalDatabase();
