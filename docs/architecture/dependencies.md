# Dependency Inventory

| Package | Workspace | Version | Purpose & Runtime Justification |
| :--- | :--- | :--- | :--- |
| `zod` | `@krishios/shared` | `^3.24.2` | Strict schema validation, runtime contract checking, and TypeScript type inference. Zero dependencies. |
| `dexie` | `@krishios/web` | `^4.0.11` | IndexedDB abstraction layer providing transactional offline storage, indices, and schema migrations. |
| `react`, `react-dom` | `@krishios/web` | `^19.0.0` | UI component tree, responsive rendering, and local state reactivity. |
| `@capacitor/core`, `@capacitor/android`, `@capacitor/camera`, `@capacitor/geolocation` | `@krishios/web` | `^7.0.0` | Bridge to native Android APIs (Camera for leaf scans, GPS for local Mandi distance) with Web fallback. |
| `@tensorflow/tfjs-core`, `@tensorflow/tfjs-tflite` | `@krishios/web` | `^4.22.0` / `0.0.1-alpha.10` | WebAssembly/WebGL accelerated client-side inference for TFLite models in Web Workers. |
| `vite-plugin-pwa` | `@krishios/web` | `^0.21.1` | Service Worker generation, asset precaching, and offline web application lifecycle management. |
| `hono` | `@krishios/api` | `^4.7.1` | Ultrafast, lightweight web framework designed for Cloudflare Workers edge runtime. |
| `drizzle-orm`, `drizzle-kit` | `@krishios/api` | `^0.39.3` / `^0.30.4` | TypeScript-first ORM and schema migration manager for central PostgreSQL (Neon). |
| `@neondatabase/serverless` | `@krishios/api` | `^0.10.4` | Serverless PostgreSQL driver with connection pooling over WebSockets for Cloudflare Workers. |
| `vitest` | All | `^3.0.5` | Fast ESM unit and integration testing runner across workspace packages. |

