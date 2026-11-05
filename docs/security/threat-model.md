# Security Threat Model (STRIDE Methodology)

## 1. Trust Boundaries
- **Untrusted:** Client browser, Progressive Web App, Android WebView, Local Storage.
- **Semi-Trusted:** Static CDN distribution layer (Cloudflare Pages), Public Ingestion APIs (Agmarknet, Open-Meteo).
- **Trusted:** Minimal Cloudflare Worker Gateway, Central PostgreSQL (Neon), GitHub Actions CI/CD Pipeline Runners.

## 2. Threat Analysis & Mitigations

### 2.1 Spoofing & Broken Authentication
- **Threat:** Malicious actor invokes Gateway sync endpoints with fabricated `farmer_id`.
- **Mitigation:** Gateway cryptographically validates Supabase JWTs in the `Authorization: Bearer` header. The user ID is extracted strictly from the validated token claims (`sub`), never from client body attributes.

### 2.2 Tampering & Data Integrity
- **Threat:** Client alters local Mandi rate quotes and presents them as officially verified market benchmarks.
- **Mitigation:** Verification flags are never set by client mutations. Public dataset manifests include cryptographic SHA-256 digests generated in CI.

### 2.3 Repudiation & Auditability
- **Threat:** User disputes offline financial settlement or sync changes.
- **Mitigation:** Every mutation contains an immutable UUID, sequence counter, UTC client timestamp, and gateway receipt timestamp recorded in structured logs.

### 2.4 Information Disclosure & Privacy
- **Threat:** Farmer GPS coordinates, crop yields, or leaf images leaked via telemetry or logs.
- **Mitigation:** Coordinates are truncated to 2 decimal places (~1.1 km) before optional telemetry transmission. Raw images and voice audio are never uploaded unless the farmer explicitly requests an expert review.

### 2.5 Denial of Service & Abuse
- **Threat:** High-frequency script floods gateway sync or voice endpoints.
- **Mitigation:** Gateway applies IP and user-rate limits (Cloudflare Worker rate-limiting), strict payload body size caps (1MB), and schema validation using Zod before processing.

### 2.6 Elevation of Privilege
- **Threat:** Client requests privileged GitHub Actions workflow dispatch directly.
- **Mitigation:** Client never possesses GitHub Personal Access Tokens or API keys. All pipeline runs execute either on cron schedule or through authenticated gateway webhooks.

