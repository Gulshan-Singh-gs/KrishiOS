# KrishiOS Architecture Specification (v1.0.1)

## 1. System Philosophy: Client-First, Edge-Assisted, Zero-Cost Base

KrishiOS is engineered to execute all deterministic agronomic and market computations directly on the farmer's device. The architecture guarantees offline autonomy, sub-second localized response times, and near-zero recurring operational infrastructure cost.

### Execution Boundaries
1. **Client Runtime (Browser / PWA / Android APK via Capacitor):**
   - Local offline persistence via IndexedDB (Dexie.js v2).
   - In-memory FAO-56 Penman-Monteith Evapotranspiration and Hydrological Balance calculation.
   - Mandi Net Realizable Value (NRV) calculation with configurable transport models and Haversine geodesic fallback.
   - Edge Computer Vision: Preprocessing, Laplacian blur detection, exposure luminance analysis, entropy-based uncertainty assessment, and TFLite inference via Web Workers.
   - Deterministic Vernacular Voice intent parsing and entity extraction for Punjabi, Hinglish, Hindi, and English.
   - Resilient Sync Outbox with exponential backoff and conflict resolution.

2. **Shared Data Pipeline (GitHub Actions):**
   - Scheduled batch ingestion of public commodity market prices (Agmarknet/e-NAM) and weather telemetry (IMD/Open-Meteo).
   - Normalization, geographical and commodity bucketing, deduplication.
   - Creation of immutable content-addressed datasets (SHA-256) and public versioned manifests.
   - Zero per-user server runtime; batch workloads are partitioned and shared across all farmers.

3. **Minimal Secure Gateway (Cloudflare Worker + Hono):**
   - Server-side JWT authentication and ownership validation.
   - Idempotent batch sync endpoint for durable records.
   - Controlled AI fallback for vernacular voice transcription when online.
   - Signed pre-upload URLs for private cloud storage (Supabase S3).

