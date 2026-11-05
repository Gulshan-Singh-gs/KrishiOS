import React, { useState, useMemo } from 'react';
import {
  diagnoseHydrologicalBalance,
  type CropType,
  type GrowthStage,
} from '@krishios/shared';
import { localDb } from '../db/localDb';

export const IrrigationTab: React.FC = () => {
  const [crop, setCrop] = useState<CropType>('wheat');
  const [growthStage, setGrowthStage] = useState<GrowthStage>('mid_season');
  const [fieldAreaHectares, setFieldAreaHectares] = useState<number>(1.5);
  const [pumpFlowRateLpm, setPumpFlowRateLpm] = useState<number>(500);

  // Weather Telemetry
  const [tempMaxC, setTempMaxC] = useState<number>(31.0);
  const [tempMinC, setTempMinC] = useState<number>(18.0);
  const tempMeanC = Number(((tempMaxC + tempMinC) / 2).toFixed(1));
  const [humidity, setHumidity] = useState<number>(55);
  const [windSpeed, setWindSpeed] = useState<number>(2.2);
  const [radiationMj, setRadiationMj] = useState<number>(19.5);
  const [rainfallMm, setRainfallMm] = useState<number>(0);

  // Soil Telemetry
  const [currentMoisture, setCurrentMoisture] = useState<number>(32);
  const [fieldCapacity, setFieldCapacity] = useState<number>(45);
  const [rootDepthMm, setRootDepthMm] = useState<number>(600);
  const [isSensorMeasured, setIsSensorMeasured] = useState<boolean>(false);

  const [scheduleSuccess, setScheduleSuccess] = useState<string | null>(null);

  // Execute full FAO-56 Penman-Monteith Diagnostic Model
  const diagnosis = useMemo(() => {
    return diagnoseHydrologicalBalance({
      plotId: 'plot-alpha-1',
      crop,
      growthStage,
      weather: {
        tempMeanC,
        tempMaxC,
        tempMinC,
        relativeHumidityPercent: humidity,
        windSpeed2mMs: windSpeed,
        netRadiationMjM2Day: radiationMj,
        precipitationMm: rainfallMm,
        elevationMeters: 220, // Typical Punjab plain elevation
      },
      soil: {
        currentMoisturePercent: currentMoisture,
        fieldCapacityPercent: fieldCapacity,
        rootZoneDepthMm: rootDepthMm,
        isSensorMeasured,
      },
      fieldAreaHectares,
      pumpFlowRateLitersPerMin: pumpFlowRateLpm,
      applicationEfficiencyPercent: 80, // High-efficiency furrow/border
    });
  }, [
    crop,
    growthStage,
    tempMeanC,
    tempMaxC,
    tempMinC,
    humidity,
    windSpeed,
    radiationMj,
    rainfallMm,
    currentMoisture,
    fieldCapacity,
    rootDepthMm,
    isSensorMeasured,
    fieldAreaHectares,
    pumpFlowRateLpm,
  ]);

  const handleQueueSchedule = async () => {
    const id = `sched_${Date.now()}`;
    const scheduledFor = new Date(Date.now() + 86400000).toISOString();

    // 1. Add to local Dexie irrigation queue
    await localDb.irrigationQueue.add({
      ...diagnosis.schedule,
      id,
      status: 'pending',
      scheduledFor,
      createdAt: new Date().toISOString(),
    });

    // 2. Enqueue mutation in outbox for synchronization
    await localDb.enqueueMutation(
      'irrigationSchedule',
      id,
      'CREATE',
      diagnosis.schedule
    );

    setScheduleSuccess(`Irrigation queued offline! Recommended pump runtime: ${diagnosis.pumpRuntimeMinutes} minutes.`);
    setTimeout(() => setScheduleSuccess(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">FAO-56 Agro-Hydrological Engine</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Full Penman-Monteith reference evapotranspiration, phenological crop coefficient curves (Kc), root-zone depletion, and tubewell pump discharge runtimes calculated deterministically.
        </p>
      </div>

      {scheduleSuccess && (
        <div className="p-3 rounded-lg bg-blue-950/80 border border-blue-700 text-blue-300 text-sm">
          💧 {scheduleSuccess}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Inputs (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Crop & Field Parameters */}
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 shadow">
            <h2 className="text-sm font-bold text-neutral-200 uppercase tracking-wider mb-3">
              1. Crop & Plot Parameters
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Crop Type</label>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value as CropType)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                >
                  <option value="wheat">Wheat (गेहूँ)</option>
                  <option value="cotton">Cotton (कपास)</option>
                  <option value="rice">Rice (धान)</option>
                  <option value="mustard">Mustard (सरसों)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">Growth Stage</label>
                <select
                  value={growthStage}
                  onChange={(e) => setGrowthStage(e.target.value as GrowthStage)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                >
                  <option value="initial">Initial Stage (Kc = 0.30-0.35)</option>
                  <option value="development">Crop Development (Kc = 0.70-0.75)</option>
                  <option value="mid_season">Mid-Season Peak (Kc = 1.10-1.20)</option>
                  <option value="late_season">Late Season / Maturity (Kc = 0.40)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">Plot Area (ha)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={fieldAreaHectares}
                  onChange={(e) => setFieldAreaHectares(parseFloat(e.target.value) || 1)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">Pump Flow Rate (L/min)</label>
                <input
                  type="number"
                  step="50"
                  min="50"
                  value={pumpFlowRateLpm}
                  onChange={(e) => setPumpFlowRateLpm(parseInt(e.target.value) || 500)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Meteorological Conditions */}
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 shadow">
            <h2 className="text-sm font-bold text-neutral-200 uppercase tracking-wider mb-3">
              2. Meteorological Telemetry (IMD / Local In-Situ)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Tmax (°C)</label>
                <input
                  type="number"
                  value={tempMaxC}
                  onChange={(e) => setTempMaxC(parseFloat(e.target.value))}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-white"
                />
              </div>
              <div>
                <label className="text-neutral-400 block mb-1">Tmin (°C)</label>
                <input
                  type="number"
                  value={tempMinC}
                  onChange={(e) => setTempMinC(parseFloat(e.target.value))}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-white"
                />
              </div>
              <div>
                <label className="text-neutral-400 block mb-1">Rel. Humidity (%)</label>
                <input
                  type="number"
                  value={humidity}
                  onChange={(e) => setHumidity(parseFloat(e.target.value))}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-white"
                />
              </div>
              <div>
                <label className="text-neutral-400 block mb-1">Wind 2m (m/s)</label>
                <input
                  type="number"
                  step="0.1"
                  value={windSpeed}
                  onChange={(e) => setWindSpeed(parseFloat(e.target.value))}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-white"
                />
              </div>
              <div>
                <label className="text-neutral-400 block mb-1">Net Rad. (MJ/m²)</label>
                <input
                  type="number"
                  step="0.5"
                  value={radiationMj}
                  onChange={(e) => setRadiationMj(parseFloat(e.target.value))}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-white"
                />
              </div>
              <div>
                <label className="text-neutral-400 block mb-1">Rainfall (mm)</label>
                <input
                  type="number"
                  value={rainfallMm}
                  onChange={(e) => setRainfallMm(parseFloat(e.target.value))}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-white"
                />
              </div>
            </div>
          </div>

          {/* Soil Status */}
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 shadow">
            <h2 className="text-sm font-bold text-neutral-200 uppercase tracking-wider mb-3">
              3. Soil Moisture & Root-Zone Dynamics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Current Soil Moisture ({currentMoisture}%)</label>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={currentMoisture}
                  onChange={(e) => setCurrentMoisture(parseInt(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
              <div>
                <label className="text-neutral-400 block mb-1">Field Capacity ({fieldCapacity}%)</label>
                <input
                  type="range"
                  min="20"
                  max="60"
                  value={fieldCapacity}
                  onChange={(e) => setFieldCapacity(parseInt(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
              <div>
                <label className="text-neutral-400 block mb-1">Root Depth (mm)</label>
                <input
                  type="number"
                  step="50"
                  value={rootDepthMm}
                  onChange={(e) => setRootDepthMm(parseInt(e.target.value) || 500)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-white"
                />
              </div>
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <input
                type="checkbox"
                id="sensorCheck"
                checked={isSensorMeasured}
                onChange={(e) => setIsSensorMeasured(e.target.checked)}
                className="rounded accent-blue-500"
              />
              <label htmlFor="sensorCheck" className="text-xs text-neutral-300">
                Data verified by physical in-situ capacitive soil sensor (vs hydrological estimate)
              </label>
            </div>
          </div>
        </div>

        {/* Right Diagnostic Results Card */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-neutral-900 border border-blue-900/60 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Hydrological Delivery
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                Confidence: {Math.round(diagnosis.confidenceScore * 100)}%
              </span>
            </div>

            {/* Calculated Values */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <span className="text-xs text-neutral-400">Reference ET (ET0):</span>
                <span className="text-sm font-bold text-white">{diagnosis.et0} mm/day</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <span className="text-xs text-neutral-400">Crop Coefficient (Kc):</span>
                <span className="text-sm font-bold text-white">{diagnosis.schedule.kc}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <span className="text-xs text-neutral-400">Crop Evapotranspiration (ETc):</span>
                <span className="text-sm font-bold text-blue-400">{diagnosis.etc} mm/day</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <span className="text-xs text-neutral-400">Soil Moisture Deficit:</span>
                <span className="text-sm font-bold text-amber-400">{diagnosis.soilWaterDeficitMm} mm</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <span className="text-xs text-neutral-400">Recommended Depth:</span>
                <span className="text-base font-extrabold text-emerald-400">
                  {diagnosis.recommendedNetDepthMm} mm
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <span className="text-xs text-neutral-400">Total Irrigation Volume:</span>
                <span className="text-sm font-bold text-white">
                  {diagnosis.estimatedNetVolumeLiters.toLocaleString()} Liters
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">Tubewell Run Duration:</span>
                <span className="text-lg font-black text-blue-400">
                  {Math.floor(diagnosis.pumpRuntimeMinutes / 60)}h {diagnosis.pumpRuntimeMinutes % 60}m
                </span>
              </div>
            </div>

            {/* Queue Button */}
            <button
              onClick={handleQueueSchedule}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition"
            >
              Queue Irrigation Schedule Offline
            </button>
          </div>

          {/* Model Assumptions Note */}
          <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
            <span className="font-semibold text-neutral-300">Model Assumptions & Scientific Standards:</span>
            {diagnosis.assumptions.length > 0 ? (
              diagnosis.assumptions.map((a, i) => <p key={i}>• {a}</p>)
            ) : (
              <p>• Full meteorological parameter coverage; zero empirical fallback estimators active.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
