import { describe, it, expect } from 'vitest';
import {
  calculateFAO56ET0,
  computeIrrigationSchedule,
  saturationVapourPressure,
  slopeOfVapourPressureCurve,
  atmosphericPressure,
  psychrometricConstant,
  FAO56_CROP_COEFFICIENTS,
} from '../irrigationEngine.js';

describe('Task 2.2: FAO-56 Penman-Monteith Agro-Hydrological Calculator Verification', () => {
  describe('FAO-56 Intermediate Thermodynamic Functions', () => {
    it('calculates saturation vapour pressure e0(T) matching FAO-56 Table 2.3', () => {
      // At T = 20°C, e0(20) = 2.338 kPa
      expect(saturationVapourPressure(20)).toBeCloseTo(2.338, 2);
      // At T = 30°C, e0(30) = 4.246 kPa
      expect(saturationVapourPressure(30)).toBeCloseTo(4.246, 2);
    });

    it('calculates slope of vapour pressure curve Delta matching FAO-56 Table 2.4', () => {
      // At T = 20°C, Delta = 0.145 kPa/°C
      expect(slopeOfVapourPressureCurve(20)).toBeCloseTo(0.145, 2);
      // At T = 30°C, Delta = 0.244 kPa/°C
      expect(slopeOfVapourPressureCurve(30)).toBeCloseTo(0.244, 2);
    });

    it('calculates atmospheric pressure and psychrometric constant gamma for elevation', () => {
      // Sea level z = 0 m: P = 101.3 kPa, gamma = 0.067 kPa/°C
      expect(atmosphericPressure(0)).toBeCloseTo(101.3, 1);
      expect(psychrometricConstant(0)).toBeCloseTo(0.0674, 3);

      // Elevation z = 100 m
      expect(atmosphericPressure(100)).toBeCloseTo(100.1, 1);
      expect(psychrometricConstant(100)).toBeCloseTo(0.0666, 3);
    });
  });

  describe('FAO-56 Standard Benchmark Datasets (Tolerance ± 0.05 mm/day)', () => {
    it('verifies ET0 against FAO-56 Example 18 (Brussels) within ± 0.05 mm/day', () => {
      // FAO-56 Example 18 (Brussels on 6 July):
      // Tmax = 21.5°C, Tmin = 12.3°C, Tmean = 16.9°C
      // RHmax = 84%, RHmin = 63%
      // u2 = 2.08 m/s, Rn = 13.28 MJ/m^2/day, z = 100 m
      // Official FAO-56 ET0 = 3.88 mm/day (rounded to 3.9 mm/day)
      const et0 = calculateFAO56ET0({
        tempMeanC: 16.9,
        tempMaxC: 21.5,
        tempMinC: 12.3,
        relativeHumidityMaxPercent: 84,
        relativeHumidityMinPercent: 63,
        windSpeed2mMs: 2.08,
        netRadiationMjM2Day: 13.28,
        elevationMeters: 100,
      });

      expect(Math.abs(et0 - 3.88)).toBeLessThanOrEqual(0.05);
    });

    it('verifies ET0 against Semi-Arid Benchmark within ± 0.05 mm/day', () => {
      // Semi-arid high-radiation benchmark:
      // Tmax = 35.0°C, Tmin = 22.0°C, Tmean = 28.5°C
      // RH = 40%, u2 = 2.5 m/s, Rn = 16.5 MJ/m^2/day, z = 200 m
      // Benchmark ET0 = 7.88 mm/day
      const et0 = calculateFAO56ET0({
        tempMeanC: 28.5,
        tempMaxC: 35.0,
        tempMinC: 22.0,
        relativeHumidityPercent: 40,
        windSpeed2mMs: 2.5,
        netRadiationMjM2Day: 16.5,
        elevationMeters: 200,
      });

      expect(Math.abs(et0 - 7.88)).toBeLessThanOrEqual(0.05);
    });
  });

  describe('End-to-End Irrigation Scheduling & Volumetric Delivery', () => {
    it('computes exact ETc = ET0 * Kc and recommended liters for mid-season Wheat', () => {
      const schedule = computeIrrigationSchedule({
        plotId: 'punjab-field-01',
        crop: 'wheat',
        growthStage: 'mid_season',
        weather: {
          tempMeanC: 22.0,
          relativeHumidityPercent: 50,
          windSpeed2mMs: 1.8,
          netRadiationMjM2Day: 13.0,
          elevationMeters: 250, // Punjab plains elevation
          precipitationMm: 0,
        },
        soil: {
          currentMoisturePercent: 35.0,
          fieldCapacityPercent: 55.0,
          rootZoneDepthMm: 600, // 60 cm root depth
        },
        fieldAreaHectares: 2.0,
        pumpFlowRateLitersPerMin: 500,
      });

      const expectedKc = FAO56_CROP_COEFFICIENTS.wheat.mid_season;
      expect(schedule.kc).toBe(expectedKc);
      expect(schedule.etc).toBeCloseTo(schedule.et0 * expectedKc, 2);

      // Deficit = (55 - 35) * 600 / 100 = 120 mm
      expect(schedule.soilMoistureDeficit).toBe(120);

      // Total net irrigation = etc + 120 mm
      const expectedNetMm = Number((schedule.etc + 120).toFixed(2));
      expect(schedule.recommendedLitersPerHectare).toBe(Math.round(expectedNetMm * 10000));

      // 2 hectares with 500 L/min pump
      const expectedTotalLiters = schedule.recommendedLitersPerHectare * 2.0;
      expect(schedule.recommendedDurationMinutes).toBe(Math.round(expectedTotalLiters / 500));
    });

    it('factors effective rainfall and reduces irrigation requirement accordingly', () => {
      const drySchedule = computeIrrigationSchedule({
        plotId: 'punjab-field-02',
        crop: 'mustard',
        growthStage: 'development',
        weather: {
          tempMeanC: 20.0,
          relativeHumidityPercent: 55,
          windSpeed2mMs: 1.5,
          netRadiationMjM2Day: 11.5,
          precipitationMm: 0,
        },
        soil: {
          currentMoisturePercent: 40,
          fieldCapacityPercent: 50,
          rootZoneDepthMm: 400,
        },
      });

      const rainySchedule = computeIrrigationSchedule({
        plotId: 'punjab-field-02',
        crop: 'mustard',
        growthStage: 'development',
        weather: {
          tempMeanC: 20.0,
          relativeHumidityPercent: 55,
          windSpeed2mMs: 1.5,
          netRadiationMjM2Day: 11.5,
          precipitationMm: 25.0, // 25 mm rainfall
        },
        soil: {
          currentMoisturePercent: 40,
          fieldCapacityPercent: 50,
          rootZoneDepthMm: 400,
        },
      });

      expect(rainySchedule.effectiveRainfall).toBeGreaterThan(15);
      expect(rainySchedule.recommendedLitersPerHectare).toBeLessThan(
        drySchedule.recommendedLitersPerHectare
      );
    });
  });
});
