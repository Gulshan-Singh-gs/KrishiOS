import { describe, it, expect } from 'vitest';
import {
  normalizeAgmarknetRecords,
  processAndPublishPartition,
  type RawAgmarknetRecord,
} from '../index';

describe('Phase 3: Market Ingestion Pipeline Verification', () => {
  const sampleRaw: RawAgmarknetRecord[] = [
    {
      state: 'Punjab',
      district: 'Ludhiana',
      market: 'Khanna',
      commodity: 'Wheat',
      variety: 'Dara',
      grade: 'FAQ',
      arrival_date: '05/11/2026',
      min_price: '2400',
      max_price: '2600',
      modal_price: '2520',
    },
    {
      state: 'Punjab',
      district: 'Bathinda',
      market: 'Raman',
      commodity: 'Cotton',
      variety: 'American',
      grade: 'Medium',
      arrival_date: '2026-11-05',
      min_price: 6800,
      max_price: 7400,
      modal_price: 7150,
    },
    {
      // Malformed / non-positive price
      state: 'Punjab',
      district: 'Patiala',
      market: 'Nabha',
      commodity: 'Paddy',
      arrival_date: '2026-11-05',
      min_price: 0,
      max_price: 0,
      modal_price: 0,
    },
  ];

  it('normalizes raw market quotes into verified domain records and discards malformed entries', () => {
    const normalized = normalizeAgmarknetRecords(sampleRaw, '2026-11-05');
    expect(normalized.length).toBe(2);
    expect(normalized[0]?.commodity).toBe('Wheat');
    expect(normalized[0]?.modalPrice).toBe(2520);
    expect(normalized[0]?.arrivalDate).toBe('2026-11-05');
    expect(normalized[1]?.commodity).toBe('Cotton');
    expect(normalized[1]?.modalPrice).toBe(7150);
  });

  it('compresses partitioned records, computes SHA-256 digest, and produces compliant DatasetManifest', () => {
    const normalized = normalizeAgmarknetRecords(sampleRaw, '2026-11-05');
    const result = processAndPublishPartition(normalized, 'punjab-all', '2026-11-05');

    expect(result.recordCount).toBe(2);
    expect(result.sha256Checksum).toHaveLength(64);
    expect(result.compressedBuffer.length).toBeGreaterThan(0);
    expect(result.manifest.format).toBe('compressed_json');
    expect(result.manifest.sha256Checksum).toBe(result.sha256Checksum);
    expect(result.manifest.validationStatus).toBe('verified');
  });
});

