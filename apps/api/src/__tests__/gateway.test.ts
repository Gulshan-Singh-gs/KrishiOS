import { describe, it, expect } from 'vitest';
import app from '../index';

describe('Phase 8: Minimal Secure Gateway Endpoint Verification', () => {
  it('GET /health returns 200 OK with runtime diagnostics', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('healthy');
    expect(body.version).toBe('1.0.1');
    expect(res.headers.get('x-frame-options')).toBe('DENY');
  });

  it('GET /api/v1/manifest returns dataset and model registries', async () => {
    const res = await app.request('/api/v1/manifest');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.appVersion).toBe('1.0.1');
    expect(body.datasets).toBeInstanceOf(Array);
  });

  it('GET /api/v1/datasets/:partition returns partition metadata', async () => {
    const res = await app.request('/api/v1/datasets/punjab-wheat');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.partitionKey).toBe('punjab-wheat');
    expect(body.format).toBe('compressed_json');
  });

  it('POST /api/v1/sync rejects unauthenticated requests', async () => {
    const res = await app.request('/api/v1/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mutations: [] }),
    });
    expect(res.status).toBe(401);
  });

  it('POST /api/v1/sync accepts authenticated batch mutations', async () => {
    // Generate valid base64 token with { sub: 'farmer-101' }
    const claims = btoa(JSON.stringify({ sub: 'farmer-101' }));
    const mockJwt = `header.${claims}.sig`;

    const res = await app.request('/api/v1/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mockJwt}`,
      },
      body: JSON.stringify({
        mutations: [
          {
            id: 'm-1',
            schemaVersion: 1,
            mutationUuid: '123e4567-e89b-12d3-a456-426614174000',
            entityType: 'cropPlot',
            entityId: 'p-1',
            operation: 'CREATE',
            payload: { name: 'North 1' },
            sequenceNumber: 1,
            retryCount: 0,
            status: 'queued',
            clientTimestamp: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.processedCount).toBe(1);
    expect(body.results[0]?.status).toBe('synced');
  });

  it('POST /api/v1/voice returns structured VoiceIntentPayload', async () => {
    const res = await app.request('/api/v1/voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rawQuery: 'Kanak da bhav dasso Khanna mandi vich',
        dialect: 'punjabi',
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.intent).toBe('MANDI_PRICE_QUERY');
    expect(body.detectedDialect).toBe('punjabi');
    expect(body.extractedEntities.commodity).toBe('Wheat');
  });

  it('POST /api/v1/storage/signed-upload requires auth and returns presigned URL', async () => {
    const claims = btoa(JSON.stringify({ sub: 'farmer-101' }));
    const mockJwt = `header.${claims}.sig`;

    const res = await app.request('/api/v1/storage/signed-upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mockJwt}`,
      },
      body: JSON.stringify({
        fileName: 'leaf_scan.jpg',
        contentType: 'image/jpeg',
        fileSizeBytes: 1048576,
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.signedUrl).toContain('farmer-101');
    expect(body.expiresInSeconds).toBe(300);
  });
});

