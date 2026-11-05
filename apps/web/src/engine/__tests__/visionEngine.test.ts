import { describe, it, expect } from 'vitest';
import {
  calculateNormalizedShannonEntropy,
  calculateLaplacianVariance,
  runPathogenDiagnostics,
} from '../visionEngine';

describe('Task 2.1: Vision Engine & Uncertainty Quantification Verification', () => {
  const WIDTH = 224;
  const HEIGHT = 224;

  // Generate synthetic 224x224 grayscale test patterns
  function createSharpTexture(): number[] {
    const data = new Array<number>(WIDTH * HEIGHT);
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        // High frequency alternating checker / gradient pattern
        data[y * WIDTH + x] = (x % 4 < 2 && y % 4 < 2) ? 230 : 25;
      }
    }
    return data;
  }

  function createBlurredTexture(): number[] {
    const data = new Array<number>(WIDTH * HEIGHT);
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        // Flat, smooth low-frequency surface (out-of-focus blur)
        data[y * WIDTH + x] = 128 + Math.sin(x / 50) * 3;
      }
    }
    return data;
  }

  it('computes exact Normalized Shannon Entropy bounded between 0 and 1', () => {
    // 1-hot (zero uncertainty)
    const zeroEntropy = calculateNormalizedShannonEntropy([1.0, 0.0, 0.0]);
    expect(zeroEntropy).toBe(0);

    // Uniform distribution across 3 classes (maximum uncertainty = 1.0)
    const maxEntropy = calculateNormalizedShannonEntropy([1 / 3, 1 / 3, 1 / 3]);
    expect(maxEntropy).toBeCloseTo(1.0, 2);

    // Skewed high confidence
    const lowEntropy = calculateNormalizedShannonEntropy([0.92, 0.05, 0.03]);
    expect(lowEntropy).toBeLessThan(0.35);
  });

  it('computes Laplacian variance correctly discriminating sharp edges from blur', () => {
    const sharp = createSharpTexture();
    const blurred = createBlurredTexture();

    const sharpVar = calculateLaplacianVariance(sharp, WIDTH, HEIGHT);
    const blurVar = calculateLaplacianVariance(blurred, WIDTH, HEIGHT);

    expect(sharpVar).toBeGreaterThan(500); // High edge frequency
    expect(blurVar).toBeLessThan(10); // Extremely smooth, blurry
  });

  it('Scenario 1: High-confidence leaf diagnosis passes with 0 uncertainty flags', () => {
    const startTime = performance.now();
    const sharpPixels = createSharpTexture();

    const result = runPathogenDiagnostics({
      crop: 'cotton',
      probabilities: [0.03, 0.94, 0.03], // Bacterial blight top class
      imagePixels: {
        grayscale: sharpPixels,
        width: WIDTH,
        height: HEIGHT,
      },
    });

    const duration = performance.now() - startTime;

    expect(duration).toBeLessThan(150); // < 150ms verification criterion
    expect(result.crop).toBe('cotton');
    expect(result.pathogen).toContain('Bacterial Blight');
    expect(result.confidence).toBe(0.94);
    expect(result.shannonEntropy).toBeLessThan(0.45);
    expect(result.uncertaintyFlag).toBe(false);
    expect(result.treatmentRecommendations.length).toBeGreaterThan(0);
  });

  it('Scenario 2: Uniform noise tensor triggers UNCERTAIN_IMAGE_QUALITY warning (H(p) > 0.45)', () => {
    const startTime = performance.now();
    const sharpPixels = createSharpTexture();

    const result = runPathogenDiagnostics({
      crop: 'mustard',
      probabilities: [0.34, 0.33, 0.33], // High uncertainty noise
      imagePixels: {
        grayscale: sharpPixels,
        width: WIDTH,
        height: HEIGHT,
      },
    });

    const duration = performance.now() - startTime;

    expect(duration).toBeLessThan(150);
    expect(result.shannonEntropy).toBeGreaterThan(0.45);
    expect(result.uncertaintyFlag).toBe(true);
    expect(result.uncertaintyReason).toBe('UNCERTAIN_IMAGE_QUALITY');
  });

  it('Scenario 3: Low-variance blurred tensor triggers blur uncertainty warning', () => {
    const startTime = performance.now();
    const blurredPixels = createBlurredTexture();

    const result = runPathogenDiagnostics({
      crop: 'rice',
      probabilities: [0.1, 0.85, 0.05], // Good probability, but blurred capture
      imagePixels: {
        grayscale: blurredPixels,
        width: WIDTH,
        height: HEIGHT,
      },
      blurVarianceThreshold: 80.0,
    });

    const duration = performance.now() - startTime;

    expect(duration).toBeLessThan(150);
    expect(result.uncertaintyFlag).toBe(true);
    expect(result.uncertaintyReason).toContain('BLUR_DETECTED');
  });
});

