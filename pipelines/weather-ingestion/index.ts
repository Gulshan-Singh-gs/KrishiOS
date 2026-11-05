import crypto from 'node:crypto';
import zlib from 'node:zlib';
import type { DatasetManifest } from '@krishios/shared';
import { DatasetManifestSchema } from '@krishios/shared';
import { calculateReferenceEvapotranspiration, type WeatherTelemetry } from '@krishios/shared';

export interface RegionalWeatherPartition {
  regionKey: string;
  date: string;
  telemetry: WeatherTelemetry & { et0: number };
}

export function normalizeWeatherForecast(
  raw: {
    region: string;
    date: string;
    tempMax: number;
    tempMin: number;
    humidity: number;
    windSpeed: number;
    radiationMj?: number;
    rainfallMm?: number;
    elevation?: number;
  }
): RegionalWeatherPartition {
  const tempMean = (raw.tempMax + raw.tempMin) / 2;
  const netRadiation = raw.radiationMj ?? 18.0;

  const telemetry: WeatherTelemetry = {
    tempMeanC: Number(tempMean.toFixed(1)),
    tempMaxC: raw.tempMax,
    tempMinC: raw.tempMin,
    relativeHumidityPercent: raw.humidity,
    windSpeed2mMs: raw.windSpeed,
    netRadiationMjM2Day: netRadiation,
    elevationMeters: raw.elevation ?? 200,
    precipitationMm: raw.rainfallMm ?? 0,
  };

  const et0 = calculateReferenceEvapotranspiration(telemetry);

  return {
    regionKey: raw.region,
    date: raw.date,
    telemetry: {
      ...telemetry,
      et0,
    },
  };
}

export function publishWeatherPartition(
  partitions: RegionalWeatherPartition[],
  sourceDate = new Date().toISOString().slice(0, 10),
  cdnBaseUrl = 'https://cdn.krishios.dev/weather'
): {
  compressedBuffer: Buffer;
  sha256Checksum: string;
  manifest: DatasetManifest;
} {
  const jsonStr = JSON.stringify(partitions);
  const compressedBuffer = zlib.gzipSync(Buffer.from(jsonStr, 'utf-8'));
  const sha256Checksum = crypto.createHash('sha256').update(compressedBuffer).digest('hex');

  const manifestRecord: DatasetManifest = {
    id: `manifest_weather_${sourceDate}`,
    schemaVersion: 1,
    datasetId: 'weather-forecast-regional',
    version: '1.0.0',
    source: 'IMD / Open-Meteo Aggregator',
    sourceDate,
    retrievalTimestamp: new Date().toISOString(),
    partitionKey: 'weather-india-composite',
    recordCount: partitions.length,
    sha256Checksum,
    format: 'compressed_json',
    downloadUrl: `${cdnBaseUrl}/${sourceDate}.json.gz`,
    validationStatus: 'verified',
    createdAt: new Date().toISOString(),
  };

  return {
    compressedBuffer,
    sha256Checksum,
    manifest: DatasetManifestSchema.parse(manifestRecord),
  };
}

