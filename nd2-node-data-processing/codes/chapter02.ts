/**
 * Chapter 2: Data Sampling and Time-Series Fundamentals
 *
 * This file demonstrates:
 * - Nyquist-Shannon sampling theorem
 * - Effects of different sampling rates
 * - Aliasing demonstration
 * - Regular vs. irregular sampling
 * - Time-series data structures and analysis
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

interface TimeSeriesPoint {
  time: number; // Time in seconds
  value: number; // Signal value
  label: string; // For grouping in visualization
}

interface SampledSignal {
  name: string;
  samplingRate: number;
  points: TimeSeriesPoint[];
}

interface SignalStats {
  name: string;
  samplingRate: number;
  numSamples: number;
  avgInterval: number;
  jitter: number; // Standard deviation of intervals
}

// ============================================================================
// Signal Generation
// ============================================================================

/**
 * Generate a continuous signal with multiple frequency components
 * This represents the "true" continuous signal we want to sample
 */
function generateContinuousSignal(
  duration: number,
  resolution: number = 10000 // High resolution for "continuous" signal
): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = [];
  const dt = duration / resolution;

  // Signal with multiple frequency components:
  // - 2 Hz fundamental
  // - 5 Hz second harmonic
  // - 15 Hz high frequency component

  for (let i = 0; i < resolution; i++) {
    const t = i * dt;
    const f1 = 2; // 2 Hz
    const f2 = 5; // 5 Hz
    const f3 = 15; // 15 Hz

    const value =
      1.0 * Math.sin(2 * Math.PI * f1 * t) +
      0.5 * Math.sin(2 * Math.PI * f2 * t) +
      0.3 * Math.sin(2 * Math.PI * f3 * t);

    points.push({
      time: t,
      value,
      label: "Continuous Signal",
    });
  }

  return points;
}

/**
 * Sample a continuous signal at a specific rate
 */
function sampleSignal(continuousSignal: TimeSeriesPoint[], samplingRate: number, label: string): SampledSignal {
  const duration = continuousSignal[continuousSignal.length - 1].time;
  const samplingInterval = 1 / samplingRate;
  const points: TimeSeriesPoint[] = [];

  let currentTime = 0;
  while (currentTime <= duration) {
    // Find closest point in continuous signal
    const idx = Math.round((currentTime / duration) * (continuousSignal.length - 1));
    const value = continuousSignal[idx].value;

    points.push({
      time: currentTime,
      value,
      label,
    });

    currentTime += samplingInterval;
  }

  return {
    name: label,
    samplingRate,
    points,
  };
}

/**
 * Generate irregular sampling pattern (event-driven or adaptive)
 */
function generateIrregularSampling(
  continuousSignal: TimeSeriesPoint[],
  avgRate: number,
  variability: number = 0.3
): SampledSignal {
  const duration = continuousSignal[continuousSignal.length - 1].time;
  const avgInterval = 1 / avgRate;
  const points: TimeSeriesPoint[] = [];

  let currentTime = 0;
  while (currentTime <= duration) {
    // Find closest point in continuous signal
    const idx = Math.round((currentTime / duration) * (continuousSignal.length - 1));
    const value = continuousSignal[idx].value;

    points.push({
      time: currentTime,
      value,
      label: "Irregular Sampling",
    });

    // Variable interval
    const randomFactor = 1 + variability * (Math.random() * 2 - 1);
    currentTime += avgInterval * randomFactor;
  }

  return {
    name: "Irregular Sampling",
    samplingRate: avgRate,
    points,
  };
}

/**
 * Calculate statistics for sampled signal
 */
function calculateSamplingStats(signal: SampledSignal): SignalStats {
  const intervals: number[] = [];

  for (let i = 1; i < signal.points.length; i++) {
    intervals.push(signal.points[i].time - signal.points[i - 1].time);
  }

  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

  // Calculate jitter (standard deviation of intervals)
  const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
  const jitter = Math.sqrt(variance);

  return {
    name: signal.name,
    samplingRate: signal.samplingRate,
    numSamples: signal.points.length,
    avgInterval,
    jitter,
  };
}

// ============================================================================
// Visualization Functions
// ============================================================================

/**
 * Create visualization comparing different sampling rates
 */
function createSamplingComparisonSpec(continuous: TimeSeriesPoint[], samples: SampledSignal[]): vegaLite.TopLevelSpec {
  // Prepare data - include continuous signal (sampled for visualization)
  const vizData: any[] = [];

  // Add continuous signal (every 50th point for clarity)
  continuous
    .filter((_, i) => i % 50 === 0)
    .forEach((point) => {
      vizData.push({
        time: point.time,
        value: point.value,
        signal: "Continuous (Reference)",
        type: "line",
      });
    });

  // Add sampled signals
  samples.forEach((signal) => {
    signal.points.forEach((point) => {
      vizData.push({
        time: point.time,
        value: point.value,
        signal: signal.name,
        type: "point",
      });
    });
  });

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Chapter 2: Sampling Rate Comparison - Nyquist Theorem Demonstration",
    data: { values: vizData },
    width: 800,
    height: 150,
    facet: {
      row: {
        field: "signal",
        type: "nominal",
        title: null,
      },
    },
    spec: {
      layer: [
        {
          mark: { type: "line", strokeWidth: 1, opacity: 0.7 },
          encoding: {
            x: {
              field: "time",
              type: "quantitative",
              title: "Time (seconds)",
              scale: { domain: [0, 2] },
            },
            y: {
              field: "value",
              type: "quantitative",
              title: "Signal Value",
              scale: { domain: [-2, 2] },
            },
            color: {
              field: "signal",
              type: "nominal",
              legend: null,
            },
          },
          transform: [{ filter: "datum.type === 'line'" }],
        },
        {
          mark: { type: "point", size: 60, filled: true },
          encoding: {
            x: {
              field: "time",
              type: "quantitative",
            },
            y: {
              field: "value",
              type: "quantitative",
            },
            color: {
              field: "signal",
              type: "nominal",
              legend: null,
            },
          },
          transform: [{ filter: "datum.type === 'point'" }],
        },
      ],
    },
  };
}

/**
 * Create aliasing demonstration visualization
 */
function createAliasingDemoSpec(continuous: TimeSeriesPoint[], undersampled: SampledSignal): vegaLite.TopLevelSpec {
  const vizData: any[] = [];

  // Continuous signal
  continuous
    .filter((_, i) => i % 20 === 0)
    .forEach((point) => {
      vizData.push({
        time: point.time,
        value: point.value,
        type: "True Signal",
      });
    });

  // Under-sampled points
  undersampled.points.forEach((point) => {
    vizData.push({
      time: point.time,
      value: point.value,
      type: "Sampled Points",
    });
  });

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Aliasing Effect: Under-sampling Causes High Frequencies to Appear as Low Frequencies",
    data: { values: vizData },
    width: 800,
    height: 400,
    layer: [
      {
        mark: { type: "line", strokeWidth: 2, color: "steelblue" },
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
        transform: [{ filter: "datum.type === 'True Signal'" }],
      },
      {
        mark: { type: "point", size: 100, color: "red", filled: true },
        encoding: {
          x: { field: "time", type: "quantitative" },
          y: { field: "value", type: "quantitative" },
        },
        transform: [{ filter: "datum.type === 'Sampled Points'" }],
      },
      {
        mark: { type: "line", strokeDash: [5, 5], strokeWidth: 1, color: "red" },
        encoding: {
          x: { field: "time", type: "quantitative" },
          y: { field: "value", type: "quantitative" },
        },
        transform: [{ filter: "datum.type === 'Sampled Points'" }],
      },
    ],
  };
}

/**
 * Create regular vs irregular sampling comparison
 */
function createRegularVsIrregularSpec(regular: SampledSignal, irregular: SampledSignal): vegaLite.TopLevelSpec {
  const vizData: any[] = [];

  regular.points.forEach((point) => {
    vizData.push({
      time: point.time,
      value: point.value,
      type: "Regular Sampling",
    });
  });

  irregular.points.forEach((point) => {
    vizData.push({
      time: point.time,
      value: point.value,
      type: "Irregular Sampling",
    });
  });

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Regular vs. Irregular Sampling Comparison",
    data: { values: vizData },
    width: 800,
    height: 300,
    facet: {
      row: {
        field: "type",
        type: "nominal",
        title: null,
      },
    },
    spec: {
      layer: [
        {
          mark: { type: "line", strokeWidth: 1.5 },
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
            color: {
              field: "type",
              type: "nominal",
              legend: null,
            },
          },
        },
        {
          mark: { type: "point", size: 60, filled: true },
          encoding: {
            x: { field: "time", type: "quantitative" },
            y: { field: "value", type: "quantitative" },
            color: {
              field: "type",
              type: "nominal",
              legend: null,
            },
          },
        },
      ],
    },
  };
}

/**
 * Save chart as both SVG and HTML
 */
async function saveChart(spec: vegaLite.TopLevelSpec, baseName: string): Promise<void> {
  // Compile Vega-Lite to Vega
  const vegaSpec = vegaLite.compile(spec).spec;

  // Create a Vega view
  const view = new vega.View(vega.parse(vegaSpec), { renderer: "none" });

  // Generate SVG
  const svg = await view.toSVG();

  // Ensure chapter-specific output directory exists
  const outputDir = path.join(__dirname, "..", "outputs", "chapter02");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save SVG
  const svgPath = path.join(outputDir, `${baseName}.svg`);
  fs.writeFileSync(svgPath, svg);
  console.log(`✓ SVG saved to: ${svgPath}`);

  // Save HTML
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
  console.log("Chapter 2: Data Sampling and Time-Series Fundamentals");
  console.log("=".repeat(70));
  console.log();

  const duration = 2; // 2 seconds of signal

  // Generate continuous signal with multiple frequency components
  console.log("Generating continuous signal...");
  console.log("  Signal components:");
  console.log("    - 2 Hz (fundamental)");
  console.log("    - 5 Hz (second harmonic)");
  console.log("    - 15 Hz (high frequency component)");
  console.log("  Maximum frequency: 15 Hz");
  console.log("  Nyquist rate: 30 Hz (2 × 15 Hz)");
  console.log();

  const continuousSignal = generateContinuousSignal(duration);

  // Sample at different rates
  console.log("Sampling at different rates:");
  console.log();

  // Under-sampled (below Nyquist rate) - will show aliasing
  const underSampled = sampleSignal(continuousSignal, 10, "Under-sampled (10 Hz) - Aliasing!");
  console.log(`  ${underSampled.name}`);
  console.log(`    Sampling rate: ${underSampled.samplingRate} Hz (< Nyquist rate)`);
  console.log(`    Samples: ${underSampled.points.length}`);
  console.log(`    WARNING: Aliasing will occur!`);
  console.log();

  // Nyquist rate
  const nyquistSampled = sampleSignal(continuousSignal, 30, "Nyquist Rate (30 Hz)");
  console.log(`  ${nyquistSampled.name}`);
  console.log(`    Sampling rate: ${nyquistSampled.samplingRate} Hz (= Nyquist rate)`);
  console.log(`    Samples: ${nyquistSampled.points.length}`);
  console.log(`    Minimum rate for accurate reconstruction`);
  console.log();

  // Over-sampled (above Nyquist rate)
  const overSampled = sampleSignal(continuousSignal, 100, "Over-sampled (100 Hz)");
  console.log(`  ${overSampled.name}`);
  console.log(`    Sampling rate: ${overSampled.samplingRate} Hz (> Nyquist rate)`);
  console.log(`    Samples: ${overSampled.points.length}`);
  console.log(`    Excellent signal fidelity`);
  console.log();

  // Calculate statistics
  console.log("Sampling Statistics:");
  console.log();
  const signals = [underSampled, nyquistSampled, overSampled];
  signals.forEach((signal) => {
    const stats = calculateSamplingStats(signal);
    console.log(`  ${stats.name}:`);
    console.log(`    Samples: ${stats.numSamples}`);
    console.log(`    Avg interval: ${(stats.avgInterval * 1000).toFixed(2)} ms`);
    console.log(`    Jitter: ${(stats.jitter * 1000).toFixed(4)} ms`);
    console.log();
  });

  // Generate irregular sampling
  console.log("Generating irregular sampling pattern...");
  const irregularSampled = generateIrregularSampling(continuousSignal, 50, 0.3);
  const irregularStats = calculateSamplingStats(irregularSampled);
  console.log(`  Average rate: ${irregularStats.samplingRate} Hz`);
  console.log(`  Actual samples: ${irregularStats.numSamples}`);
  console.log(`  Avg interval: ${(irregularStats.avgInterval * 1000).toFixed(2)} ms`);
  console.log(`  Jitter: ${(irregularStats.jitter * 1000).toFixed(2)} ms (intentional variability)`);
  console.log();

  // Create regular sampling for comparison
  const regularSampled = sampleSignal(continuousSignal, 50, "Regular Sampling");

  // Create visualizations
  console.log("Creating visualizations...");
  console.log();

  // 1. Sampling rate comparison
  console.log("  1. Sampling rate comparison...");
  const samplingSpec = createSamplingComparisonSpec(continuousSignal, [underSampled, nyquistSampled, overSampled]);
  await saveChart(samplingSpec, "chapter02-sampling-rates");

  // 2. Aliasing demonstration
  console.log("  2. Aliasing demonstration...");
  const aliasingSpec = createAliasingDemoSpec(continuousSignal, underSampled);
  await saveChart(aliasingSpec, "chapter02-aliasing-demo");

  // 3. Regular vs irregular sampling
  console.log("  3. Regular vs. irregular sampling...");
  const regularVsIrregularSpec = createRegularVsIrregularSpec(regularSampled, irregularSampled);
  await saveChart(regularVsIrregularSpec, "chapter02-irregular-sampling");

  console.log();
  console.log("=".repeat(70));
  console.log("✓ Chapter 2 completed successfully!");
  console.log();
  console.log("Key Insights:");
  console.log("  • Under-sampling (< Nyquist rate) causes aliasing");
  console.log("  • Nyquist rate (30 Hz) is minimum for 15 Hz signal");
  console.log("  • Over-sampling provides better signal fidelity");
  console.log("  • Irregular sampling can reduce data volume");
  console.log("  • Regular sampling simplifies signal processing");
  console.log("=".repeat(70));
}

// Run the main function
main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
