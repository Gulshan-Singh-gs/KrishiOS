import type {
  CropType,
  CropScanResult,
  TreatmentRecommendation,
} from '@krishios/shared';
import { CropScanResultSchema } from '@krishios/shared';

export interface PathogenClassDefinition {
  label: string;
  name: string;
  organicTreatment: TreatmentRecommendation;
  chemicalTreatment: TreatmentRecommendation;
}

export const CROP_PATHOGEN_REGISTRY: Record<
  CropType,
  PathogenClassDefinition[]
> = {
  cotton: [
    {
      label: 'healthy',
      name: 'Healthy Foliage',
      organicTreatment: {
        type: 'cultural',
        title: 'Nutrient Maintenance',
        instructions: 'Maintain balanced N-P-K and regular scouting.',
      },
      chemicalTreatment: {
        type: 'cultural',
        title: 'Preventative Spray',
        instructions: 'No chemical intervention required.',
      },
    },
    {
      label: 'bacterial_blight',
      name: 'Bacterial Blight (Xanthomonas citri pv. malvacearum)',
      organicTreatment: {
        type: 'organic',
        title: 'Pseudomonas fluorescens Spray',
        instructions: 'Apply 10g/L foliar spray during early hours.',
        dosage: '10g/L',
      },
      chemicalTreatment: {
        type: 'chemical',
        title: 'Copper Oxychloride + Streptocycline',
        instructions: 'Spray 500g Copper Oxychloride + 20g Streptocycline in 200L water per acre.',
        dosage: '2.5g/L + 100ppm',
      },
    },
    {
      label: 'leaf_curl',
      name: 'Cotton Leaf Curl Virus (CLCuV)',
      organicTreatment: {
        type: 'organic',
        title: 'Neem Seed Kernel Extract (NSKE 5%)',
        instructions: 'Spray to suppress whitefly (Bemisia tabaci) vector.',
        dosage: '50ml/L',
      },
      chemicalTreatment: {
        type: 'chemical',
        title: 'Diafenthiuron 50% WP',
        instructions: 'Spray 250g in 200L water per acre to manage vector populations.',
        dosage: '1.25g/L',
      },
    },
  ],
  mustard: [
    {
      label: 'healthy',
      name: 'Healthy Mustard Leaf',
      organicTreatment: {
        type: 'cultural',
        title: 'Good Canopy Aeration',
        instructions: 'Maintain spacing to avoid microclimate humidity.',
      },
      chemicalTreatment: {
        type: 'cultural',
        title: 'Preventative Scouting',
        instructions: 'No chemical intervention required.',
      },
    },
    {
      label: 'alternaria_blight',
      name: 'Alternaria Leaf Spot (Alternaria brassicae)',
      organicTreatment: {
        type: 'organic',
        title: 'Trichoderma viride Bio-fungicide',
        instructions: 'Apply 5g/L foliar spray at symptom onset.',
        dosage: '5g/L',
      },
      chemicalTreatment: {
        type: 'chemical',
        title: 'Mancozeb 75% WP',
        instructions: 'Spray 600g in 200L water per acre at 15-day intervals.',
        dosage: '2.5g/L',
      },
    },
    {
      label: 'white_rust',
      name: 'White Rust (Albugo candida)',
      organicTreatment: {
        type: 'organic',
        title: 'Fermented Garlic-Chilli Extract',
        instructions: 'Apply 10% botanical extract spray at morning hours.',
        dosage: '100ml/L',
      },
      chemicalTreatment: {
        type: 'chemical',
        title: 'Metalaxyl 8% + Mancozeb 64% WP',
        instructions: 'Spray 500g in 200L water per acre at initial pustule formation.',
        dosage: '2g/L',
      },
    },
  ],
  rice: [
    {
      label: 'healthy',
      name: 'Healthy Rice Leaf',
      organicTreatment: {
        type: 'cultural',
        title: 'Water Depth Regulation',
        instructions: 'Maintain 3-5 cm water layer in paddy plots.',
      },
      chemicalTreatment: {
        type: 'cultural',
        title: 'Monitoring',
        instructions: 'No chemical intervention required.',
      },
    },
    {
      label: 'blast',
      name: 'Rice Blast (Magnaporthe oryzae)',
      organicTreatment: {
        type: 'organic',
        title: 'Pseudomonas fluorescens liquid formulation',
        instructions: 'Seed treatment (10ml/kg) and foliar spray at tillering.',
        dosage: '5ml/L',
      },
      chemicalTreatment: {
        type: 'chemical',
        title: 'Tricyclazole 75% WP',
        instructions: 'Spray 120g in 200L water per acre at first sign of spindle lesions.',
        dosage: '0.6g/L',
      },
    },
    {
      label: 'bacterial_blight',
      name: 'Bacterial Leaf Blight (Xanthomonas oryzae)',
      organicTreatment: {
        type: 'organic',
        title: 'Fresh Cow Dung Slurry Supernatant',
        instructions: 'Filter 5% slurry and spray twice at 10-day intervals.',
        dosage: '50ml/L',
      },
      chemicalTreatment: {
        type: 'chemical',
        title: 'Streptocycline + Copper Sulphate',
        instructions: 'Spray 30g Streptocycline + 300g Copper Sulphate in 200L water per acre.',
        dosage: '0.15g/L + 1.5g/L',
      },
    },
  ],
  wheat: [
    {
      label: 'healthy',
      name: 'Healthy Wheat Flag Leaf',
      organicTreatment: {
        type: 'cultural',
        title: 'Canopy Nutrition',
        instructions: 'Apply recommended split Nitrogen doses.',
      },
      chemicalTreatment: {
        type: 'cultural',
        title: 'Scouting',
        instructions: 'No chemical intervention required.',
      },
    },
    {
      label: 'yellow_rust',
      name: 'Stripe / Yellow Rust (Puccinia striiformis)',
      organicTreatment: {
        type: 'cultural',
        title: 'Resistant Cultivars',
        instructions: 'Early sowing of resistant varieties (e.g. PBW-725, HD-3086).',
      },
      chemicalTreatment: {
        type: 'chemical',
        title: 'Propiconazole 25% EC',
        instructions: 'Spray 200ml in 200L water per acre immediately upon yellow stripe detection.',
        dosage: '1ml/L',
      },
    },
  ],
  other: [
    {
      label: 'general_foliar_infection',
      name: 'Foliar Spot / Infection',
      organicTreatment: {
        type: 'organic',
        title: 'Neem-based Biofungicide',
        instructions: 'Apply 3ml/L foliar spray.',
        dosage: '3ml/L',
      },
      chemicalTreatment: {
        type: 'chemical',
        title: 'Broad Spectrum Fungicide (Mancozeb)',
        instructions: 'Apply 2g/L foliar spray.',
        dosage: '2g/L',
      },
    },
  ],
};

/**
 * Computes Normalized Shannon Entropy:
 * H(p) = - (1 / ln(K)) * sum(p_i * ln(p_i))
 * Bounded strictly within [0.0, 1.0].
 */
export function calculateNormalizedShannonEntropy(probabilities: number[]): number {
  const K = probabilities.length;
  if (K <= 1) return 0;

  let sum = 0;
  for (const p of probabilities) {
    if (p > 1e-12) {
      sum += p * Math.log(p);
    }
  }

  const entropy = -sum / Math.log(K);
  // Ensure strict bounding against floating point inaccuracies
  return Math.max(0, Math.min(1, Number(entropy.toFixed(4))));
}

/**
 * Computes Laplacian Variance for 2D grayscale image pixels (blur detection).
 * Low variance indicates smooth, blurred, out-of-focus capture.
 */
export function calculateLaplacianVariance(
  grayscale: number[],
  width: number,
  height: number
): number {
  if (width < 3 || height < 3 || grayscale.length !== width * height) {
    return 0;
  }

  // Discrete Laplacian 3x3 kernel:
  // [ 0,  1,  0]
  // [ 1, -4,  1]
  // [ 0,  1,  0]
  let laplacianSum = 0;
  let laplacianSqSum = 0;
  let count = 0;

  for (let y = 1; y < height - 1; y++) {
    const rowOffset = y * width;
    const topOffset = (y - 1) * width;
    const bottomOffset = (y + 1) * width;

    for (let x = 1; x < width - 1; x++) {
      const center = grayscale[rowOffset + x]!;
      const up = grayscale[topOffset + x]!;
      const down = grayscale[bottomOffset + x]!;
      const left = grayscale[rowOffset + (x - 1)]!;
      const right = grayscale[rowOffset + (x + 1)]!;

      const lap = up + down + left + right - 4 * center;
      laplacianSum += lap;
      laplacianSqSum += lap * lap;
      count++;
    }
  }

  if (count === 0) return 0;
  const mean = laplacianSum / count;
  const variance = laplacianSqSum / count - mean * mean;
  return Math.max(0, variance);
}

export interface DiagnosticsOptions {
  crop: CropType;
  probabilities: number[];
  imagePixels?: {
    grayscale: number[];
    width: number;
    height: number;
  };
  entropyThreshold?: number; // Default 0.45
  blurVarianceThreshold?: number; // Default 80.0
}

/**
 * Pure TypeScript Edge Phytopathology Diagnostic Engine.
 * Evaluates inference probabilities, calculates Shannon Entropy uncertainty,
 * detects tensor blur / low frequency variance, and outputs validated CropScanResult.
 */
export function runPathogenDiagnostics(options: DiagnosticsOptions): CropScanResult {
  const {
    crop,
    probabilities,
    imagePixels,
    entropyThreshold = 0.45,
    blurVarianceThreshold = 80.0,
  } = options;

  const registry = CROP_PATHOGEN_REGISTRY[crop] || CROP_PATHOGEN_REGISTRY.other;
  const shannonEntropy = calculateNormalizedShannonEntropy(probabilities);

  // Determine top predicted class index
  let maxIdx = 0;
  let maxProb = -1;
  for (let i = 0; i < probabilities.length; i++) {
    const p = probabilities[i]!;
    if (p > maxProb) {
      maxProb = p;
      maxIdx = i;
    }
  }

  const selectedPathogen = registry[maxIdx] || registry[0]!;
  let uncertaintyFlag = false;
  let uncertaintyReason: string | undefined;

  // 1. Shannon Entropy Uncertainty Check
  if (shannonEntropy > entropyThreshold) {
    uncertaintyFlag = true;
    uncertaintyReason = 'UNCERTAIN_IMAGE_QUALITY';
  }

  // 2. Laplacian Blur Check
  if (imagePixels) {
    const blurVariance = calculateLaplacianVariance(
      imagePixels.grayscale,
      imagePixels.width,
      imagePixels.height
    );

    if (blurVariance < blurVarianceThreshold) {
      uncertaintyFlag = true;
      uncertaintyReason = uncertaintyReason
        ? `${uncertaintyReason}_AND_BLUR_DETECTED`
        : 'BLUR_DETECTED';
    }
  }

  const recommendations: TreatmentRecommendation[] = [];
  if (selectedPathogen.label !== 'healthy') {
    recommendations.push(selectedPathogen.organicTreatment);
    recommendations.push(selectedPathogen.chemicalTreatment);
  } else {
    recommendations.push(selectedPathogen.organicTreatment);
  }

  const result: CropScanResult = {
    id: `scan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    schemaVersion: 1,
    crop,
    pathogen: selectedPathogen.name,
    confidence: Number(maxProb.toFixed(4)),
    shannonEntropy,
    uncertaintyFlag,
    uncertaintyReason,
    treatmentRecommendations: recommendations,
    timestamp: new Date().toISOString(),
  };

  // Validate output against shared Zod schema
  return CropScanResultSchema.parse(result);
}

