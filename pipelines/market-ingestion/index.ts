import crypto from 'node:crypto';
import zlib from 'node:zlib';
import type { MarketPrice, DatasetManifest } from '@krishios/shared';
import { MarketPriceSchema, DatasetManifestSchema } from '@krishios/shared';

export interface RawAgmarknetRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety?: string;
  grade?: string;
  arrival_date: string; // DD/MM/YYYY or YYYY-MM-DD
  min_price: number | string;
  max_price: number | string;
  modal_price: number | string;
}

export interface IngestionResult {
  partitionKey: string;
  recordCount: number;
  sha256Checksum: string;
  compressedBuffer: Buffer;
  manifest: DatasetManifest;
  normalizedRecords: MarketPrice[];
}

/**
 * Normalizes date format to standard ISO YYYY-MM-DD.
 */
export function normalizeDate(dateStr: string): string {
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [d, m, y] = parts;
      return `${y}-${m!.padStart(2, '0')}-${d!.padStart(2, '0')}`;
    }
  }
  return dateStr;
}

/**
 * Normalizes raw records into strictly validated MarketPrice domain entities.
 */
export function normalizeAgmarknetRecords(
  records: RawAgmarknetRecord[],
  sourceDate = new Date().toISOString().slice(0, 10)
): MarketPrice[] {
  const normalized: MarketPrice[] = [];

  for (const r of records) {
    const modalPrice = typeof r.modal_price === 'number' ? r.modal_price : parseFloat(r.modal_price);
    const minPrice = typeof r.min_price === 'number' ? r.min_price : parseFloat(r.min_price);
    const maxPrice = typeof r.max_price === 'number' ? r.max_price : parseFloat(r.max_price);

    if (isNaN(modalPrice) || modalPrice <= 0) continue;

    const arrivalDate = normalizeDate(r.arrival_date || sourceDate);
    const mandiSlug = `${r.state}_${r.district}_${r.market}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const id = `price_${mandiSlug}_${r.commodity.toLowerCase()}_${arrivalDate}`;

    const priceRecord: MarketPrice = {
      id,
      schemaVersion: 1,
      mandiId: `mandi_${mandiSlug}`,
      commodity: r.commodity.trim(),
      variety: r.variety?.trim(),
      grade: r.grade?.trim(),
      arrivalDate,
      minPrice: isNaN(minPrice) ? modalPrice : minPrice,
      maxPrice: isNaN(maxPrice) ? modalPrice : maxPrice,
      modalPrice,
      source: 'AGMARKNET',
      createdAt: new Date().toISOString(),
    };

    const validated = MarketPriceSchema.safeParse(priceRecord);
    if (validated.success) {
      normalized.push(validated.data);
    }
  }

  return normalized;
}

/**
 * Buckets records by state and commodity partition, compresses into gzip, and generates an immutable manifest.
 */
export function processAndPublishPartition(
  records: MarketPrice[],
  partitionKey: string,
  sourceDate = new Date().toISOString().slice(0, 10),
  cdnBaseUrl = 'https://cdn.krishios.dev/datasets'
): IngestionResult {
  const jsonString = JSON.stringify(records);
  const compressedBuffer = zlib.gzipSync(Buffer.from(jsonString, 'utf-8'));
  const sha256Checksum = crypto.createHash('sha256').update(compressedBuffer).digest('hex');

  const datasetId = `mandi-prices-${partitionKey}`;
  const manifestId = `manifest_${datasetId}_${sourceDate}`;
  const downloadUrl = `${cdnBaseUrl}/${partitionKey}/${sourceDate}.json.gz`;

  const manifestRecord: DatasetManifest = {
    id: manifestId,
    schemaVersion: 1,
    datasetId,
    version: '1.0.0',
    source: 'Agmarknet Daily Batch Ingestion',
    sourceDate,
    retrievalTimestamp: new Date().toISOString(),
    partitionKey,
    recordCount: records.length,
    sha256Checksum,
    format: 'compressed_json',
    downloadUrl,
    validationStatus: 'verified',
    createdAt: new Date().toISOString(),
  };

  const manifest = DatasetManifestSchema.parse(manifestRecord);

  return {
    partitionKey,
    recordCount: records.length,
    sha256Checksum,
    compressedBuffer,
    manifest,
    normalizedRecords: records,
  };
}

