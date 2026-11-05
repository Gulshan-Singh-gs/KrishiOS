# ADR 001: Client-First Computation & Zero-Cost Infrastructure

## Status
Accepted

## Context
Rural agricultural users frequently operate under intermittent, high-latency, or completely disconnected 2G/3G/4G network conditions in India. Server-centric architectures with round-trip API calls for leaf disease inference, mandi price lookups, and irrigation scheduling fail completely in field conditions and incur compounding cloud infrastructure costs.

## Decision
1. **Deterministic Edge Computation:** All mathematical, agronomic (FAO-56), and financial (NRV) algorithms are implemented in pure TypeScript and packaged into `@krishios/shared`. They execute locally without network calls.
2. **IndexedDB as Source of Truth:** Dexie.js v2 serves as the local database with an outbox pattern for queued mutations.
3. **Public Data as Static CDN Datasets:** Rather than hosting a persistent database for market rates and weather forecasts, GitHub Actions runs scheduled batch pipelines, producing compressed, SHA-256 verified JSON partitions distributed via static CDN/Pages.
4. **Minimal Gateway:** The Cloudflare Worker gateway is kept strictly minimal, handling only authentication, signed sync, and controlled cloud AI fallbacks.

## Consequences
- Guaranteed offline utility for all core farmer tasks.
- Highly resilient to network drops.
- Eliminates recurring server and database compute bills.
- Requires strict schema versioning and local data migration strategies.

