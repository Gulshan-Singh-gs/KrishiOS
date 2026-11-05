import {
  pgTable,
  text,
  varchar,
  doublePrecision,
  timestamp,
  boolean,
  integer,
  jsonb,
  date,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ====================================================
// 1. Farmers Table
// ====================================================
export const farmers = pgTable(
  'farmers',
  {
    id: text('id').primaryKey(),
    phone: varchar('phone', { length: 20 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    dialect: varchar('dialect', { length: 32 }).default('hinglish').notNull(),
    latitude: doublePrecision('latitude'),
    longitude: doublePrecision('longitude'),
    village: varchar('village', { length: 255 }),
    district: varchar('district', { length: 255 }),
    state: varchar('state', { length: 255 }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex('farmers_phone_idx').on(table.phone),
  ]
);

// ====================================================
// 2. Crop Plots Table
// ====================================================
export const cropPlots = pgTable(
  'crop_plots',
  {
    id: text('id').primaryKey(),
    farmerId: text('farmer_id')
      .notNull()
      .references(() => farmers.id, { onDelete: 'cascade' }),
    plotName: varchar('plot_name', { length: 255 }).notNull(),
    crop: varchar('crop', { length: 64 }).notNull(),
    sowingDate: date('sowing_date').notNull(),
    growthStage: varchar('growth_stage', { length: 64 }).notNull(),
    areaHectares: doublePrecision('area_hectares').notNull(),
    soilType: varchar('soil_type', { length: 64 }),
    latitude: doublePrecision('latitude'),
    longitude: doublePrecision('longitude'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('crop_plots_farmer_id_idx').on(table.farmerId),
    index('crop_plots_crop_idx').on(table.crop),
  ]
);

// ====================================================
// 3. Disease Scans Table
// ====================================================
export const diseaseScans = pgTable(
  'disease_scans',
  {
    id: text('id').primaryKey(),
    farmerId: text('farmer_id')
      .notNull()
      .references(() => farmers.id, { onDelete: 'cascade' }),
    plotId: text('plot_id').references(() => cropPlots.id, { onDelete: 'set null' }),
    crop: varchar('crop', { length: 64 }).notNull(),
    pathogen: varchar('pathogen', { length: 255 }).notNull(),
    confidence: doublePrecision('confidence').notNull(),
    shannonEntropy: doublePrecision('shannon_entropy').notNull(),
    uncertaintyFlag: boolean('uncertainty_flag').default(false).notNull(),
    uncertaintyReason: text('uncertainty_reason'),
    imageUrl: text('image_url'),
    treatmentPlan: jsonb('treatment_plan'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('disease_scans_farmer_id_idx').on(table.farmerId),
    index('disease_scans_crop_pathogen_idx').on(table.crop, table.pathogen),
    index('disease_scans_created_at_idx').on(table.createdAt),
  ]
);

// ====================================================
// 4. Irrigation Logs Table
// ====================================================
export const irrigationLogs = pgTable(
  'irrigation_logs',
  {
    id: text('id').primaryKey(),
    plotId: text('plot_id')
      .notNull()
      .references(() => cropPlots.id, { onDelete: 'cascade' }),
    et0: doublePrecision('et0').notNull(),
    kc: doublePrecision('kc').notNull(),
    etc: doublePrecision('etc').notNull(),
    soilMoisture: doublePrecision('soil_moisture').notNull(),
    soilMoistureDeficit: doublePrecision('soil_moisture_deficit').notNull(),
    recommendedLiters: doublePrecision('recommended_liters').notNull(),
    actualLiters: doublePrecision('actual_liters'),
    durationMinutes: integer('duration_minutes').notNull(),
    scheduledFor: timestamp('scheduled_for', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('irrigation_logs_plot_id_idx').on(table.plotId),
    index('irrigation_logs_created_at_idx').on(table.createdAt),
  ]
);

// ====================================================
// 5. Mandi Prices Table (with composite indexes)
// ====================================================
export const mandiPrices = pgTable(
  'mandi_prices',
  {
    id: text('id').primaryKey(),
    commodity: varchar('commodity', { length: 128 }).notNull(),
    state: varchar('state', { length: 128 }).notNull(),
    district: varchar('district', { length: 128 }).notNull(),
    market: varchar('market', { length: 255 }).notNull(),
    minPrice: doublePrecision('min_price').notNull(),
    maxPrice: doublePrecision('max_price').notNull(),
    modalPrice: doublePrecision('modal_price').notNull(),
    arrivalDate: date('arrival_date').notNull(),
    source: varchar('source', { length: 64 }).default('agmarknet').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    // Composite indexes required by specifications: commodity, state, and timestamp
    index('mandi_prices_commodity_state_time_idx').on(
      table.commodity,
      table.state,
      table.createdAt
    ),
    index('mandi_prices_state_district_market_idx').on(
      table.state,
      table.district,
      table.market
    ),
    index('mandi_prices_commodity_arrival_idx').on(
      table.commodity,
      table.arrivalDate
    ),
  ]
);

// ====================================================
// 6. Sync Audit Logs Table
// ====================================================
export const syncAuditLogs = pgTable(
  'sync_audit_logs',
  {
    id: text('id').primaryKey(),
    farmerId: text('farmer_id').notNull(),
    mutationUuid: text('mutation_uuid').notNull(),
    entityType: varchar('entity_type', { length: 64 }).notNull(),
    entityId: text('entity_id').notNull(),
    operation: varchar('operation', { length: 16 }).notNull(),
    sequenceNumber: integer('sequence_number').notNull(),
    payload: jsonb('payload'),
    status: varchar('status', { length: 32 }).default('processed').notNull(),
    clientTimestamp: timestamp('client_timestamp', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex('sync_audit_mutation_idx').on(table.mutationUuid),
    index('sync_audit_farmer_idx').on(table.farmerId, table.createdAt),
  ]
);

// ====================================================
// 7. Dataset Manifests Table
// ====================================================
export const datasetManifests = pgTable(
  'dataset_manifests',
  {
    id: text('id').primaryKey(),
    datasetId: varchar('dataset_id', { length: 128 }).notNull(),
    version: varchar('version', { length: 64 }).notNull(),
    source: varchar('source', { length: 128 }).notNull(),
    sourceDate: date('source_date').notNull(),
    partitionKey: varchar('partition_key', { length: 128 }).notNull(),
    recordCount: integer('record_count').notNull(),
    sha256Checksum: varchar('sha256_checksum', { length: 64 }).notNull(),
    format: varchar('format', { length: 32 }).notNull(),
    downloadUrl: text('download_url').notNull(),
    validationStatus: varchar('validation_status', { length: 32 }).default('verified').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex('dataset_manifest_partition_idx').on(table.partitionKey, table.version),
  ]
);


