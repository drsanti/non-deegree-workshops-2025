/**
 * Chapter 3: Noise and Signal Characteristics
 *
 * This file demonstrates:
 * - Different types of noise (white, pink, uniform, impulse)
 * - Signal-to-Noise Ratio (SNR) calculation
 * - Statistical noise analysis
 * - Outlier detection methods
 * - Realistic noisy sensor signal generation
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import * as vega from "vega";
import * as vegaLite from "vega-lite";

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Type Definitions
// ============================================================================

interface NoiseStats {
  mean: number;
  stdDev: number;
  variance: number;
  rms: number;
  min: number;
  max: number;
  peakToPeak: number;
}

interface SignalWithNoise {
  time: number[];
  signal: number[];
  noise: number[];
  noisy: number[];
  snr: number;
  noiseType: string;
}

interface OutlierResult {
  indices: number[];
  values: number[];
  method: string;
}

// ============================================================================
// Noise Generation Functions
// ============================================================================

/**
 * Generate white (Gaussian) noise
 */
function generateWhiteNoise(length: number, mean: number = 0, stdDev: number = 1): number[] {
  const noise: number[] = [];

  for (let i = 0; i < length; i++) {
    // Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    noise.push(mean + z * stdDev);
  }

  return noise;
}

/**
 * Generate uniform noise
 */
function generateUniformNoise(length: number, min: number = -1, max: number = 1): number[] {
  const noise: number[] = [];

  for (let i = 0; i < length; i++) {
    noise.push(min + Math.random() * (max - min));
  }

  return noise;
}

/**
 * Generate pink (1/f) noise using the Voss-McCartney algorithm
 */
function generatePinkNoise(length: number, amplitude: number = 1): number[] {
  const noise: number[] = [];
  const numOctaves = 16;
  const octaves: number[] = new Array(numOctaves).fill(0);

  for (let i = 0; i < length; i++) {
    let sum = 0;

    // Update random octaves
    for (let j = 0; j < numOctaves; j++) {
      if (i % Math.pow(2, j) === 0) {
        octaves[j] = Math.random() * 2 - 1;
      }
      sum += octaves[j];
    }

    noise.push((sum / numOctaves) * amplitude);
  }

  return noise;
}

/**
 * Generate impulse (salt-and-pepper) noise
 */
function generateImpulseNoise(length: number, probability: number = 0.02, amplitude: number = 5): number[] {
  const noise: number[] = new Array(length).fill(0);

  for (let i = 0; i < length; i++) {
    if (Math.random() < probability) {
      // Random positive or negative impulse
      noise[i] = (Math.random() < 0.5 ? 1 : -1) * amplitude;
    }
  }

  return noise;
}

/**
 * Generate drift noise (low-frequency trend)
 */
function _generateDriftNoise(length: number, amplitude: number = 0.5, frequency: number = 0.1): number[] {
  const noise: number[] = [];

  for (let i = 0; i < length; i++) {
    const t = i / length;
    // Combination of slow sine wave and random walk
    const drift = amplitude * Math.sin(2 * Math.PI * frequency * t);
    const randomWalk = amplitude * 0.3 * (Math.random() - 0.5);
    noise.push(drift + randomWalk);
  }

  return noise;
}

// ============================================================================
// Signal Generation
// ============================================================================

/**
 * Generate clean test signal (combination of sine waves)
 */
function generateCleanSignal(length: number, samplingRate: number): { time: number[]; signal: number[] } {
  const time: number[] = [];
  const signal: number[] = [];

  for (let i = 0; i < length; i++) {
    const t = i / samplingRate;
    time.push(t);

    // Multi-component signal
    const f1 = 2; // 2 Hz
    const f2 = 5; // 5 Hz
    const value = 2.0 * Math.sin(2 * Math.PI * f1 * t) + 1.0 * Math.sin(2 * Math.PI * f2 * t);

    signal.push(value);
  }

  return { time, signal };
}

/**
 * Add noise to signal
 */
function addNoiseToSignal(signal: number[], noise: number[]): number[] {
  return signal.map((s, i) => s + noise[i]);
}

// ============================================================================
// Statistical Analysis
// ============================================================================

/**
 * Calculate noise statistics
 */
function calculateNoiseStats(noise: number[]): NoiseStats {
  const n = noise.length;
  const mean = noise.reduce((sum, val) => sum + val, 0) / n;

  const squaredDiffs = noise.map((val) => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / n;
  const stdDev = Math.sqrt(variance);

  const rms = Math.sqrt(noise.map((val) => val * val).reduce((sum, val) => sum + val, 0) / n);

  const min = Math.min(...noise);
  const max = Math.max(...noise);
  const peakToPeak = max - min;

  return { mean, stdDev, variance, rms, min, max, peakToPeak };
}

/**
 * Calculate Signal-to-Noise Ratio (SNR) in dB
 */
function calculateSNR(signal: number[], noise: number[]): number {
  const signalPower = signal.map((s) => s * s).reduce((sum, val) => sum + val, 0) / signal.length;
  const noisePower = noise.map((n) => n * n).reduce((sum, val) => sum + val, 0) / noise.length;

  if (noisePower === 0) return Infinity;

  const snr = 10 * Math.log10(signalPower / noisePower);
  return snr;
}

// ============================================================================
// Outlier Detection
// ============================================================================

/**
 * Detect outliers using the 3-sigma rule
 */
function detectOutliers3Sigma(data: number[], threshold: number = 3): OutlierResult {
  const stats = calculateNoiseStats(data);
  const indices: number[] = [];
  const values: number[] = [];

  data.forEach((val, idx) => {
    if (Math.abs(val - stats.mean) > threshold * stats.stdDev) {
      indices.push(idx);
      values.push(val);
    }
  });

  return { indices, values, method: `3-Sigma (threshold: ${threshold}σ)` };
}

/**
 * Detect outliers using IQR method
 */
function detectOutliersIQR(data: number[]): OutlierResult {
  const sorted = [...data].sort((a, b) => a - b);
  const n = sorted.length;

  const q1 = sorted[Math.floor(n * 0.25)];
  const q3 = sorted[Math.floor(n * 0.75)];
  const iqr = q3 - q1;

  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  const indices: number[] = [];
  const values: number[] = [];

  data.forEach((val, idx) => {
    if (val < lowerBound || val > upperBound) {
      indices.push(idx);
      values.push(val);
    }
  });

  return { indices, values, method: "IQR (Interquartile Range)" };
}

// ============================================================================
// Visualization Functions
// ============================================================================

/**
 * Create visualization comparing different noise types
 */
function createNoiseTypesSpec(samplingRate: number): vegaLite.TopLevelSpec {
  const length = 500;
  const time = Array.from({ length }, (_, i) => i / samplingRate);

  const whiteNoise = generateWhiteNoise(length, 0, 0.5);
  const pinkNoise = generatePinkNoise(length, 0.5);
  const uniformNoise = generateUniformNoise(length, -0.5, 0.5);
  const impulseNoise = generateImpulseNoise(length, 0.02, 2);

  const vizData: any[] = [];

  time.forEach((t, i) => {
    vizData.push({ time: t, value: whiteNoise[i], type: "White Noise (Gaussian)" });
    vizData.push({ time: t, value: pinkNoise[i], type: "Pink Noise (1/f)" });
    vizData.push({ time: t, value: uniformNoise[i], type: "Uniform Noise" });
    vizData.push({ time: t, value: impulseNoise[i], type: "Impulse Noise" });
  });

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Chapter 3: Different Types of Noise",
    data: { values: vizData },
    width: 800,
    height: 150,
    facet: {
      row: { field: "type", type: "nominal", title: null },
    },
    spec: {
      mark: { type: "line", strokeWidth: 0.5 },
      encoding: {
        x: {
          field: "time",
          type: "quantitative",
          title: "Time (seconds)",
          scale: { domain: [0, 5] },
        },
        y: {
          field: "value",
          type: "quantitative",
          title: "Amplitude",
        },
        color: {
          field: "type",
          type: "nominal",
          legend: null,
        },
      },
    },
  };
}

/**
 * Create SNR comparison visualization
 */
function createSNRComparisonSpec(cleanSig: SignalWithNoise, signals: SignalWithNoise[]): vegaLite.TopLevelSpec {
  const vizData: any[] = [];

  // Add clean signal
  cleanSig.time.forEach((t, i) => {
    vizData.push({
      time: t,
      value: cleanSig.signal[i],
      type: "Clean Signal",
      snr: "∞ dB",
    });
  });

  // Add noisy signals
  signals.forEach((sig) => {
    sig.time.forEach((t, i) => {
      vizData.push({
        time: t,
        value: sig.noisy[i],
        type: `SNR: ${sig.snr.toFixed(1)} dB`,
        snr: `${sig.snr.toFixed(1)} dB`,
      });
    });
  });

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Signal-to-Noise Ratio (SNR) Comparison",
    data: { values: vizData },
    facet: {
      row: { field: "type", type: "nominal", title: null },
    },
    spec: {
      width: 800,
      height: 400,
      mark: { type: "line", strokeWidth: 1.5 },
      encoding: {
        x: {
          field: "time",
          type: "quantitative",
          title: "Time (seconds)",
          scale: { domain: [0, 5] },
          axis: { grid: true, tickCount: 10 },
        },
        y: {
          field: "value",
          type: "quantitative",
          title: "Signal Value",
          axis: { grid: true },
        },
        color: {
          field: "type",
          type: "nominal",
          legend: null,
        },
      },
    },
    resolve: {
      scale: { y: "independent" },
    },
  };
}

/**
 * Create outlier detection visualization
 */
function createOutlierDetectionSpec(time: number[], signal: number[], outliers: OutlierResult): vegaLite.TopLevelSpec {
  const vizData: any[] = [];

  // Add all points
  time.forEach((t, i) => {
    const isOutlier = outliers.indices.includes(i);
    vizData.push({
      time: t,
      value: signal[i],
      type: isOutlier ? "Outlier" : "Normal",
    });
  });

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: `Outlier Detection: ${outliers.method} (${outliers.indices.length} outliers detected)`,
    data: { values: vizData },
    width: 800,
    height: 400,
    layer: [
      {
        mark: { type: "line", strokeWidth: 1, color: "steelblue" },
        encoding: {
          x: {
            field: "time",
            type: "quantitative",
            title: "Time (seconds)",
          },
          y: {
            field: "value",
            type: "quantitative",
            title: "Signal Value",
          },
        },
      },
      {
        mark: { type: "point", size: 80, filled: true },
        encoding: {
          x: { field: "time", type: "quantitative" },
          y: { field: "value", type: "quantitative" },
          color: {
            field: "type",
            type: "nominal",
            scale: {
              domain: ["Normal", "Outlier"],
              range: ["steelblue", "red"],
            },
            legend: { title: "Point Type" },
          },
        },
        transform: [{ filter: "datum.type === 'Outlier'" }],
      },
    ],
  };
}

/**
 * Save chart as both SVG and HTML
 */
async function saveChart(spec: vegaLite.TopLevelSpec, baseName: string): Promise<void> {
  const vegaSpec = vegaLite.compile(spec).spec;
  const view = new vega.View(vega.parse(vegaSpec), { renderer: "none" });
  const svg = await view.toSVG();

  const outputDir = path.join(__dirname, "..", "outputs", "chapter03");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const svgPath = path.join(outputDir, `${baseName}.svg`);
  fs.writeFileSync(svgPath, svg);
  console.log(`✓ SVG saved to: ${svgPath}`);

  const htmlPath = path.join(outputDir, `${baseName}.html`);
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${spec.title}</title>
  <script src="https://cdn.jsdelivr.net/npm/vega@5"></script>
  <script src="https://cdn.jsdelivr.net/npm/vega-lite@5"></script>
  <script src="https://cdn.jsdelivr.net/npm/vega-embed@6"></script>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    #vis { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
  </style>
</head>
<body>
  <div id="vis"></div>
  <script type="text/javascript">
    const spec = ${JSON.stringify(spec, null, 2)};
    vegaEmbed('#vis', spec);
  </script>
</body>
</html>`;
  fs.writeFileSync(htmlPath, htmlContent);
  console.log(`✓ HTML saved to: ${htmlPath}`);
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log("=".repeat(70));
  console.log("Chapter 3: Noise and Signal Characteristics");
  console.log("=".repeat(70));
  console.log();

  const samplingRate = 100; // 100 Hz
  const duration = 5; // 5 seconds
  const length = samplingRate * duration;

  // Generate clean signal
  console.log("Generating clean signal...");
  const { time, signal } = generateCleanSignal(length, samplingRate);
  console.log(`  Length: ${length} samples`);
  console.log(`  Duration: ${duration} seconds`);
  console.log(`  Sampling rate: ${samplingRate} Hz`);
  console.log();

  // Generate different types of noise
  console.log("Generating different noise types:");
  console.log();

  const whiteNoise = generateWhiteNoise(length, 0, 0.3);
  const whiteStats = calculateNoiseStats(whiteNoise);
  console.log("  White Noise (Gaussian):");
  console.log(`    Mean: ${whiteStats.mean.toFixed(4)}`);
  console.log(`    Std Dev: ${whiteStats.stdDev.toFixed(4)}`);
  console.log(`    RMS: ${whiteStats.rms.toFixed(4)}`);
  console.log();

  const pinkNoise = generatePinkNoise(length, 0.3);
  const pinkStats = calculateNoiseStats(pinkNoise);
  console.log("  Pink Noise (1/f):");
  console.log(`    Mean: ${pinkStats.mean.toFixed(4)}`);
  console.log(`    Std Dev: ${pinkStats.stdDev.toFixed(4)}`);
  console.log(`    RMS: ${pinkStats.rms.toFixed(4)}`);
  console.log();

  const uniformNoise = generateUniformNoise(length, -0.3, 0.3);
  const uniformStats = calculateNoiseStats(uniformNoise);
  console.log("  Uniform Noise:");
  console.log(`    Mean: ${uniformStats.mean.toFixed(4)}`);
  console.log(`    Std Dev: ${uniformStats.stdDev.toFixed(4)}`);
  console.log(`    Range: [${uniformStats.min.toFixed(2)}, ${uniformStats.max.toFixed(2)}]`);
  console.log();

  const impulseNoise = generateImpulseNoise(length, 0.02, 3);
  const impulseStats = calculateNoiseStats(impulseNoise);
  const numImpulses = impulseNoise.filter((n) => n !== 0).length;
  console.log("  Impulse Noise:");
  console.log(`    Number of impulses: ${numImpulses}`);
  console.log(`    Percentage: ${((numImpulses / length) * 100).toFixed(2)}%`);
  console.log(`    Peak-to-peak: ${impulseStats.peakToPeak.toFixed(2)}`);
  console.log();

  // Create signals with different SNR levels
  console.log("Creating signals with different SNR levels:");
  console.log();

  const cleanSignal: SignalWithNoise = {
    time,
    signal,
    noise: new Array(length).fill(0),
    noisy: signal,
    snr: Infinity,
    noiseType: "Clean",
  };

  const highSNR: SignalWithNoise = {
    time,
    signal,
    noise: generateWhiteNoise(length, 0, 0.2),
    noisy: [],
    snr: 0,
    noiseType: "High SNR",
  };
  highSNR.noisy = addNoiseToSignal(signal, highSNR.noise);
  highSNR.snr = calculateSNR(signal, highSNR.noise);

  const mediumSNR: SignalWithNoise = {
    time,
    signal,
    noise: generateWhiteNoise(length, 0, 0.5),
    noisy: [],
    snr: 0,
    noiseType: "Medium SNR",
  };
  mediumSNR.noisy = addNoiseToSignal(signal, mediumSNR.noise);
  mediumSNR.snr = calculateSNR(signal, mediumSNR.noise);

  const lowSNR: SignalWithNoise = {
    time,
    signal,
    noise: generateWhiteNoise(length, 0, 1.2),
    noisy: [],
    snr: 0,
    noiseType: "Low SNR",
  };
  lowSNR.noisy = addNoiseToSignal(signal, lowSNR.noise);
  lowSNR.snr = calculateSNR(signal, lowSNR.noise);

  console.log(`  High SNR: ${highSNR.snr.toFixed(1)} dB (Excellent quality)`);
  console.log(`  Medium SNR: ${mediumSNR.snr.toFixed(1)} dB (Good quality)`);
  console.log(`  Low SNR: ${lowSNR.snr.toFixed(1)} dB (Poor quality)`);
  console.log();

  // Generate signal with outliers
  console.log("Generating signal with outliers...");
  const signalWithOutliers = addNoiseToSignal(signal, whiteNoise);
  const outliers = generateImpulseNoise(length, 0.03, 4);
  const signalWithOutliersAndImpulses = signalWithOutliers.map((s, i) => s + outliers[i]);

  // Detect outliers
  const detected3Sigma = detectOutliers3Sigma(signalWithOutliersAndImpulses, 3);
  const detectedIQR = detectOutliersIQR(signalWithOutliersAndImpulses);

  console.log(`  3-Sigma method detected: ${detected3Sigma.indices.length} outliers`);
  console.log(`  IQR method detected: ${detectedIQR.indices.length} outliers`);
  console.log();

  // Create visualizations
  console.log("Creating visualizations...");
  console.log();

  console.log("  1. Noise types comparison...");
  const noiseTypesSpec = createNoiseTypesSpec(samplingRate);
  await saveChart(noiseTypesSpec, "noise-types");

  console.log("  2. SNR comparison...");
  const snrSpec = createSNRComparisonSpec(cleanSignal, [highSNR, mediumSNR, lowSNR]);
  await saveChart(snrSpec, "snr-comparison");

  console.log("  3. Outlier detection (3-Sigma)...");
  const outlierSpec = createOutlierDetectionSpec(time, signalWithOutliersAndImpulses, detected3Sigma);
  await saveChart(outlierSpec, "outlier-detection");

  console.log();
  console.log("=".repeat(70));
  console.log("✓ Chapter 3 completed successfully!");
  console.log();
  console.log("Key Insights:");
  console.log("  • White noise has Gaussian distribution (mean ≈ 0)");
  console.log("  • Pink noise has more low-frequency content");
  console.log("  • High SNR (>30 dB) enables accurate measurements");
  console.log("  • Outlier detection helps identify anomalies");
  console.log("  • Different noise types require different processing");
  console.log("=".repeat(70));
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
