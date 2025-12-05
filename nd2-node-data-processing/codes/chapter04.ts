/**
 * Chapter 4: Moving Averages and Basic Smoothing
 *
 * This file demonstrates:
 * - Simple Moving Average (SMA)
 * - Weighted Moving Average (WMA)
 * - Exponential Moving Average (EMA)
 * - Window size effects
 * - Application to sensor data
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

interface SignalData {
  time: number[];
  clean: number[];
  noisy: number[];
}

interface SmoothedResult {
  name: string;
  values: number[];
  params: string;
}

// ============================================================================
// Signal Generation
// ============================================================================

/**
 * Generate test signal with noise
 */
function generateNoisySignal(length: number, samplingRate: number, noiseLevel: number = 0.5): SignalData {
  const time: number[] = [];
  const clean: number[] = [];
  const noisy: number[] = [];

  for (let i = 0; i < length; i++) {
    const t = i / samplingRate;
    time.push(t);

    // Multi-frequency signal
    const signal =
      2.0 * Math.sin(2 * Math.PI * 1 * t) + 1.0 * Math.sin(2 * Math.PI * 3 * t) + 0.5 * Math.sin(2 * Math.PI * 7 * t);

    clean.push(signal);

    // Add Gaussian noise
    const noise =
      (Math.random() - 0.5) * 2 * noiseLevel + (Math.random() + Math.random() + Math.random() - 1.5) * noiseLevel;
    noisy.push(signal + noise);
  }

  return { time, clean, noisy };
}

/**
 * Generate temperature sensor data with realistic noise
 */
function generateTemperatureSensorData(length: number, samplingRate: number): SignalData {
  const time: number[] = [];
  const clean: number[] = [];
  const noisy: number[] = [];

  for (let i = 0; i < length; i++) {
    const t = i / samplingRate;
    time.push(t);

    // Slow temperature variation
    const temp = 22 + 3 * Math.sin(2 * Math.PI * 0.1 * t) + 1.5 * Math.sin(2 * Math.PI * 0.3 * t);
    clean.push(temp);

    // Add sensor noise
    const noise = (Math.random() + Math.random() - 1) * 0.3; // Smaller noise for temperature
    noisy.push(temp + noise);
  }

  return { time, clean, noisy };
}

// ============================================================================
// Moving Average Implementations
// ============================================================================

/**
 * Simple Moving Average (SMA)
 */
function simpleMovingAverage(data: number[], windowSize: number): number[] {
  const result: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < windowSize - 1) {
      // Not enough data yet, use available points
      const sum = data.slice(0, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / (i + 1));
    } else {
      // Full window available
      const window = data.slice(i - windowSize + 1, i + 1);
      const sum = window.reduce((a, b) => a + b, 0);
      result.push(sum / windowSize);
    }
  }

  return result;
}

/**
 * Weighted Moving Average (WMA) - Linear weights
 */
function weightedMovingAverage(data: number[], windowSize: number): number[] {
  const result: number[] = [];

  // Create linear weights (most recent has highest weight)
  const weights: number[] = [];
  let weightSum = 0;
  for (let w = 1; w <= windowSize; w++) {
    weights.push(w);
    weightSum += w;
  }

  for (let i = 0; i < data.length; i++) {
    if (i < windowSize - 1) {
      // Not enough data, use SMA
      const sum = data.slice(0, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / (i + 1));
    } else {
      // Full window available
      let weightedSum = 0;
      for (let w = 0; w < windowSize; w++) {
        weightedSum += data[i - windowSize + 1 + w] * weights[w];
      }
      result.push(weightedSum / weightSum);
    }
  }

  return result;
}

/**
 * Exponential Moving Average (EMA)
 */
function exponentialMovingAverage(data: number[], windowSize: number): number[] {
  const result: number[] = [];
  const alpha = 2 / (windowSize + 1); // Smoothing factor

  // Initialize with first value
  result.push(data[0]);

  for (let i = 1; i < data.length; i++) {
    const ema = alpha * data[i] + (1 - alpha) * result[i - 1];
    result.push(ema);
  }

  return result;
}

// ============================================================================
// Performance Metrics
// ============================================================================

/**
 * Calculate lag (in samples) between two signals
 */
function calculateLag(original: number[], smoothed: number[]): number {
  // Find cross-correlation peak
  let maxCorr = -Infinity;
  let maxLag = 0;

  // Search for lag up to 50 samples
  for (let lag = 0; lag < Math.min(50, original.length / 4); lag++) {
    let corr = 0;
    const n = original.length - lag;

    for (let i = 0; i < n; i++) {
      corr += original[i] * smoothed[i + lag];
    }

    if (corr > maxCorr) {
      maxCorr = corr;
      maxLag = lag;
    }
  }

  return maxLag;
}

/**
 * Calculate Root Mean Square Error
 */
function calculateRMSE(signal1: number[], signal2: number[]): number {
  let sumSquaredError = 0;
  const n = Math.min(signal1.length, signal2.length);

  for (let i = 0; i < n; i++) {
    const error = signal1[i] - signal2[i];
    sumSquaredError += error * error;
  }

  return Math.sqrt(sumSquaredError / n);
}

/**
 * Calculate smoothness (inverse of variance of differences)
 */
function calculateSmoothness(data: number[]): number {
  const diffs: number[] = [];

  for (let i = 1; i < data.length; i++) {
    diffs.push(data[i] - data[i - 1]);
  }

  const mean = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  const variance = diffs.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / diffs.length;

  return 1 / (variance + 0.0001); // Add small value to avoid division by zero
}

// ============================================================================
// Visualization Functions
// ============================================================================

/**
 * Create comparison of moving average methods
 */
function createMAComparisonSpec(signal: SignalData, smoothed: SmoothedResult[]): vegaLite.TopLevelSpec {
  const vizData: any[] = [];

  // Add noisy signal
  signal.time.forEach((t, i) => {
    vizData.push({ time: t, value: signal.noisy[i], type: "Noisy Signal" });
  });

  // Add clean signal
  signal.time.forEach((t, i) => {
    vizData.push({ time: t, value: signal.clean[i], type: "Clean Signal" });
  });

  // Add smoothed signals
  smoothed.forEach((s) => {
    signal.time.forEach((t, i) => {
      vizData.push({ time: t, value: s.values[i], type: s.name });
    });
  });

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Moving Average Methods Comparison",
    data: { values: vizData },
    facet: {
      row: { field: "type", type: "nominal", title: null },
    },
    spec: {
      width: 800,
      height: 200,
      mark: { type: "line", strokeWidth: 1.5 },
      encoding: {
        x: {
          field: "time",
          type: "quantitative",
          title: "Time (seconds)",
          axis: { grid: true },
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
 * Create window size comparison
 */
function createWindowSizeComparisonSpec(signal: SignalData, results: SmoothedResult[]): vegaLite.TopLevelSpec {
  const vizData: any[] = [];

  // Add noisy signal
  signal.time.forEach((t, i) => {
    vizData.push({ time: t, value: signal.noisy[i], type: "Noisy Signal", order: 0 });
  });

  // Add smoothed signals
  results.forEach((s, idx) => {
    signal.time.forEach((t, i) => {
      vizData.push({ time: t, value: s.values[i], type: s.name, order: idx + 1 });
    });
  });

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Window Size Effects on Smoothing",
    data: { values: vizData },
    width: 800,
    height: 400,
    mark: { type: "line", strokeWidth: 1.5 },
    encoding: {
      x: {
        field: "time",
        type: "quantitative",
        title: "Time (seconds)",
        axis: { grid: true },
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
        title: "Method",
        scale: {
          domain: ["Noisy Signal", "Small Window", "Medium Window", "Large Window"],
          range: ["#999999", "#1f77b4", "#ff7f0e", "#2ca02c"],
        },
      },
      order: {
        field: "order",
        type: "quantitative",
      },
    },
  };
}

/**
 * Save chart as both SVG and HTML
 */
async function saveChart(spec: vegaLite.TopLevelSpec, baseName: string): Promise<void> {
  const vegaSpec = vegaLite.compile(spec).spec;
  const view = new vega.View(vega.parse(vegaSpec), { renderer: "none" });
  const svg = await view.toSVG();

  const outputDir = path.join(__dirname, "..", "outputs", "chapter04");
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
  console.log("Chapter 4: Moving Averages and Basic Smoothing");
  console.log("=".repeat(70));
  console.log();

  const samplingRate = 50; // 50 Hz
  const duration = 10; // 10 seconds
  const length = samplingRate * duration;

  // Generate noisy signal
  console.log("Generating test signal with noise...");
  const signal = generateNoisySignal(length, samplingRate, 0.8);
  console.log(`  Samples: ${length}`);
  console.log(`  Duration: ${duration} seconds`);
  console.log(`  Sampling rate: ${samplingRate} Hz`);
  console.log();

  // Apply different moving averages with same window size
  console.log("Applying moving average methods (window size = 10):");
  console.log();

  const windowSize = 10;

  const sma = simpleMovingAverage(signal.noisy, windowSize);
  const wma = weightedMovingAverage(signal.noisy, windowSize);
  const ema = exponentialMovingAverage(signal.noisy, windowSize);

  const smoothedResults: SmoothedResult[] = [
    { name: `SMA (N=${windowSize})`, values: sma, params: `window=${windowSize}` },
    { name: `WMA (N=${windowSize})`, values: wma, params: `window=${windowSize}` },
    { name: `EMA (N=${windowSize})`, values: ema, params: `alpha=${(2 / (windowSize + 1)).toFixed(3)}` },
  ];

  // Calculate performance metrics
  smoothedResults.forEach((result) => {
    const lag = calculateLag(signal.clean, result.values);
    const rmse = calculateRMSE(signal.clean, result.values);
    const smoothness = calculateSmoothness(result.values);

    console.log(`  ${result.name}:`);
    console.log(`    Lag: ${lag} samples (${((lag / samplingRate) * 1000).toFixed(1)} ms)`);
    console.log(`    RMSE: ${rmse.toFixed(4)}`);
    console.log(`    Smoothness: ${smoothness.toFixed(2)}`);
    console.log();
  });

  // Compare different window sizes (SMA)
  console.log("Comparing window sizes (SMA):");
  console.log();

  const windowSizes = [5, 20, 50];
  const windowResults: SmoothedResult[] = [];

  windowSizes.forEach((ws) => {
    const smoothed = simpleMovingAverage(signal.noisy, ws);
    const lag = calculateLag(signal.clean, smoothed);
    const rmse = calculateRMSE(signal.clean, smoothed);

    const label = ws === 5 ? "Small Window" : ws === 20 ? "Medium Window" : "Large Window";

    windowResults.push({
      name: label,
      values: smoothed,
      params: `N=${ws}`,
    });

    console.log(`  ${label} (N=${ws}):`);
    console.log(`    Lag: ${lag} samples`);
    console.log(`    RMSE: ${rmse.toFixed(4)}`);
    console.log(`    Noise reduction: ${(100 * (1 - rmse)).toFixed(1)}%`);
    console.log();
  });

  // Temperature sensor example
  console.log("Temperature sensor smoothing example:");
  const tempData = generateTemperatureSensorData(length, samplingRate);
  const tempSmoothed = simpleMovingAverage(tempData.noisy, 15);
  const tempRMSE = calculateRMSE(tempData.clean, tempSmoothed);
  console.log(`  SMA (N=15) RMSE: ${tempRMSE.toFixed(4)}°C`);
  console.log(`  Noise reduction: ${(100 * (1 - tempRMSE / 0.3)).toFixed(1)}%`);
  console.log();

  // Create visualizations
  console.log("Creating visualizations...");
  console.log();

  console.log("  1. Moving average methods comparison...");
  const maSpec = createMAComparisonSpec(signal, smoothedResults);
  await saveChart(maSpec, "ma-methods-comparison");

  console.log("  2. Window size comparison...");
  const windowSpec = createWindowSizeComparisonSpec(signal, windowResults);
  await saveChart(windowSpec, "window-size-comparison");

  console.log();
  console.log("=".repeat(70));
  console.log("✓ Chapter 4 completed successfully!");
  console.log();
  console.log("Key Insights:");
  console.log("  • SMA provides best smoothing but highest lag");
  console.log("  • EMA has lowest lag with good smoothing");
  console.log("  • WMA balances between SMA and EMA");
  console.log("  • Larger windows = more smoothing + more lag");
  console.log("  • Window size choice depends on application");
  console.log("=".repeat(70));
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
