import { describe, it, expect } from 'vitest';
import {
  farmers,
  cropPlots,
  diseaseScans,
  irrigationLogs,
  mandiPrices,
} from '../schema';
import { getTableColumns } from 'drizzle-orm';

describe('Task 1.3: Drizzle ORM Schema Verification', () => {
  it('defines farmers table with correct columns and constraints', () => {
    const cols = getTableColumns(farmers);
    expect(cols.id).toBeDefined();
    expect(cols.phone).toBeDefined();
    expect(cols.name).toBeDefined();
    expect(cols.dialect).toBeDefined();
    expect(cols.latitude).toBeDefined();
    expect(cols.longitude).toBeDefined();
    expect(cols.createdAt).toBeDefined();
  });

  it('defines crop_plots table with farmer relation and plot details', () => {
    const cols = getTableColumns(cropPlots);
    expect(cols.id).toBeDefined();
    expect(cols.farmerId).toBeDefined();
    expect(cols.plotName).toBeDefined();
    expect(cols.crop).toBeDefined();
    expect(cols.sowingDate).toBeDefined();
    expect(cols.growthStage).toBeDefined();
    expect(cols.areaHectares).toBeDefined();
  });

  it('defines disease_scans table with entropy and uncertainty flag', () => {
    const cols = getTableColumns(diseaseScans);
    expect(cols.id).toBeDefined();
    expect(cols.farmerId).toBeDefined();
    expect(cols.crop).toBeDefined();
    expect(cols.pathogen).toBeDefined();
    expect(cols.confidence).toBeDefined();
    expect(cols.shannonEntropy).toBeDefined();
    expect(cols.uncertaintyFlag).toBeDefined();
    expect(cols.treatmentPlan).toBeDefined();
  });

  it('defines irrigation_logs table with ET0, Kc, and deficit metrics', () => {
    const cols = getTableColumns(irrigationLogs);
    expect(cols.id).toBeDefined();
    expect(cols.plotId).toBeDefined();
    expect(cols.et0).toBeDefined();
    expect(cols.kc).toBeDefined();
    expect(cols.etc).toBeDefined();
    expect(cols.soilMoisture).toBeDefined();
    expect(cols.soilMoistureDeficit).toBeDefined();
    expect(cols.recommendedLiters).toBeDefined();
    expect(cols.durationMinutes).toBeDefined();
  });

  it('defines mandi_prices table with composite pricing columns', () => {
    const cols = getTableColumns(mandiPrices);
    expect(cols.id).toBeDefined();
    expect(cols.commodity).toBeDefined();
    expect(cols.state).toBeDefined();
    expect(cols.district).toBeDefined();
    expect(cols.market).toBeDefined();
    expect(cols.minPrice).toBeDefined();
    expect(cols.maxPrice).toBeDefined();
    expect(cols.modalPrice).toBeDefined();
    expect(cols.arrivalDate).toBeDefined();
    expect(cols.source).toBeDefined();
  });
});

