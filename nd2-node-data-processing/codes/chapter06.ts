/**
 * Chapter 6: Digital Filters - Part 2 (High-Pass and Band-Pass)
 *
 * This file demonstrates:
 * - High-pass filters for DC removal and drift compensation
 * - Band-pass filters for frequency range isolation
 * - Notch filters for power line interference removal
 * - Filter comparison and frequency response analysis
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

interface FilterCoefficients {
  b: number[]; // Feedforward coefficients
  a: number[]; // Feedback coefficients
}

interface FrequencyResponse {
  frequencies: number[];
  magnitude: number[];
  magnitudeDB: number[];
  phase: number[];
}

// ============================================================================
// Signal Generation
// ============================================================================

/**
 * Generate test signal with DC offset, drift, and various frequency components
 */
function generateTestSignal(
  length: number,
  samplingRate: number
): { time: number[]; signal: number[]; components: { [key: string]: number[] } } {
  const time: number[] = [];
  const signal: number[] = [];
  const dc: number[] = [];
  const drift: number[] = [];
  const lowFreq: number[] = [];
  const midFreq: number[] = [];
  const highFreq: number[] = [];
  const powerLineNoise: number[] = [];

  for (let i = 0; i < length; i++) {
    const t = i / samplingRate;
    time.push(t);

    // DC offset
    const dcComponent = 2.0;
    dc.push(dcComponent);

    // Low-frequency drift (0.1 Hz)
    const driftComponent = 0.5 * Math.sin(2 * Math.PI * 0.1 * t);
    drift.push(driftComponent);

    // Low-frequency signal (2 Hz) - should be removed by high-pass
    const lowComponent = 0.8 * Math.sin(2 * Math.PI * 2 * t);
    lowFreq.push(lowComponent);

    // Mid-frequency signal (15 Hz) - should pass through band-pass
    const midComponent = 1.5 * Math.sin(2 * Math.PI * 15 * t);
    midFreq.push(midComponent);

    // High-frequency signal (50 Hz) - varies by filter
    const highComponent = 0.6 * Math.sin(2 * Math.PI * 50 * t);
    highFreq.push(highComponent);

    // Power line interference (60 Hz)
    const noiseComponent = 0.4 * Math.sin(2 * Math.PI * 60 * t);
    powerLineNoise.push(noiseComponent);

    signal.push(dcComponent + driftComponent + lowComponent + midComponent + highComponent + noiseComponent);
  }

  return {
    time,
    signal,
    components: {
      dc,
      drift,
      lowFreq,
      midFreq,
      highFreq,
      powerLineNoise,
    },
  };
}

// ============================================================================
// Filter Implementations
// ============================================================================

/**
 * Design 1st order Butterworth high-pass filter
 */
function designButterworthHPF1(cutoffFreq: number, samplingRate: number): FilterCoefficients {
  const fc = cutoffFreq / samplingRate;
  const wc = Math.tan(Math.PI * fc);
  const k = 1 + wc;

  return {
    b: [1 / k, -1 / k],
    a: [1, (wc - 1) / k],
  };
}

/**
 * Design 2nd order Butterworth high-pass filter
 */
function designButterworthHPF2(cutoffFreq: number, samplingRate: number): FilterCoefficients {
  const fc = cutoffFreq / samplingRate;
  const wc = Math.tan(Math.PI * fc);
  const wc2 = wc * wc;
  const sqrt2 = Math.sqrt(2);
  const k = 1 + sqrt2 * wc + wc2;

  return {
    b: [1 / k, -2 / k, 1 / k],
    a: [1, (2 * wc2 - 2) / k, (1 - sqrt2 * wc + wc2) / k],
  };
}

/**
 * Design 2nd order band-pass filter
 */
function designBandPassFilter(f1: number, f2: number, samplingRate: number): FilterCoefficients {
  const fc = Math.sqrt(f1 * f2); // Center frequency
  const BW = f2 - f1; // Bandwidth
  const Q = fc / BW; // Quality factor

  const fn = fc / samplingRate;
  const wc = Math.tan(Math.PI * fn);
  const wc2 = wc * wc;
  const k = 1 + wc / Q + wc2;

  return {
    b: [wc / Q / k, 0, -(wc / Q) / k],
    a: [1, (2 * wc2 - 2) / k, (1 - wc / Q + wc2) / k],
  };
}

/**
 * Design 2nd order notch filter
 */
function designNotchFilter(notchFreq: number, samplingRate: number, Q: number = 10): FilterCoefficients {
  const fn = notchFreq / samplingRate;
  const wn = Math.tan(Math.PI * fn);
  const wn2 = wn * wn;
  const k = 1 + wn / Q + wn2;

  return {
    b: [(1 + wn2) / k, (2 * (wn2 - 1)) / k, (1 + wn2) / k],
    a: [1, (2 * (wn2 - 1)) / k, (1 - wn / Q + wn2) / k],
  };
}

/**
 * Apply IIR filter to signal
 */
function applyIIRFilter(signal: number[], coeffs: FilterCoefficients): number[] {
  const output: number[] = [];
  const { b, a } = coeffs;
  const xHistory: number[] = [];
  const yHistory: number[] = [];

  for (let n = 0; n < signal.length; n++) {
    xHistory.unshift(signal[n]);
    if (xHistory.length > b.length) xHistory.pop();

    let y = 0;

    // Feedforward
    for (let i = 0; i < b.length && i < xHistory.length; i++) {
      y += b[i] * xHistory[i];
    }

    // Feedback
    for (let i = 1; i < a.length && i - 1 < yHistory.length; i++) {
      y -= a[i] * yHistory[i - 1];
    }

    output.push(y);
    yHistory.unshift(y);
    if (yHistory.length >= a.length) yHistory.pop();
  }

  return output;
}

/**
 * Calculate frequency response of filter
 */
function calculateFrequencyResponse(
  coeffs: FilterCoefficients,
  samplingRate: number,
  numPoints: number = 500
): FrequencyResponse {
  const frequencies: number[] = [];
  const magnitude: number[] = [];
  const magnitudeDB: number[] = [];
  const phase: number[] = [];

  const { b, a } = coeffs;

  for (let i = 0; i < numPoints; i++) {
    const freq = (i / numPoints) * (samplingRate / 2);
    frequencies.push(freq);

    const omega = (2 * Math.PI * freq) / samplingRate;

    let numReal = 0,
      numImag = 0;
    let denReal = 0,
      denImag = 0;

    for (let k = 0; k < b.length; k++) {
      numReal += b[k] * Math.cos(-k * omega);
      numImag += b[k] * Math.sin(-k * omega);
    }

    for (let k = 0; k < a.length; k++) {
      denReal += a[k] * Math.cos(-k * omega);
      denImag += a[k] * Math.sin(-k * omega);
    }

    const denMag = denReal * denReal + denImag * denImag;
    const hReal = (numReal * denReal + numImag * denImag) / denMag;
    const hImag = (numImag * denReal - numReal * denImag) / denMag;

    const mag = Math.sqrt(hReal * hReal + hImag * hImag);
    magnitude.push(mag);
    magnitudeDB.push(20 * Math.log10(mag + 1e-10));
    phase.push(Math.atan2(hImag, hReal) * (180 / Math.PI));
  }

  return { frequencies, magnitude, magnitudeDB, phase };
}

// ============================================================================
// Visualization Functions
// ============================================================================

/**
 * Create filter comparison visualization
 */
function createFilterComparisonSpec(responses: { name: string; response: FrequencyResponse }[]): vegaLite.TopLevelSpec {
  const vizData: any[] = [];

  responses.forEach((r) => {
    r.response.frequencies.forEach((freq, i) => {
      vizData.push({
        frequency: freq,
        magnitude: r.response.magnitudeDB[i],
        filter: r.name,
      });
    });
  });

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Filter Frequency Response Comparison",
    data: { values: vizData },
    width: 800,
    height: 400,
    layer: [
      {
        mark: { type: "rule", strokeDash: [4, 4], color: "gray", opacity: 0.5 },
        encoding: {
          y: { datum: -3 },
        },
      },
      {
        mark: { type: "line", strokeWidth: 3, clip: true },
        encoding: {
          x: {
            field: "frequency",
            type: "quantitative",
            title: "Frequency (Hz)",
            scale: { type: "log", domain: [0.1, 100], nice: false, padding: 0 },
            axis: { grid: true, tickCount: 20, gridOpacity: 0.3, domain: true },
          },
          y: {
            field: "magnitude",
            type: "quantitative",
            title: "Magnitude (dB)",
            scale: { domain: [-60, 10], nice: false, padding: 0 },
            axis: { grid: true, tickCount: 14, gridOpacity: 0.3, domain: true },
          },
          color: {
            field: "filter",
            type: "nominal",
            title: "Filter Type",
            scale: {
              domain: ["High-Pass (fc=5 Hz)", "Band-Pass (10-30 Hz)", "Notch (60 Hz, Q=10)"],
              range: ["#E91E63", "#9C27B0", "#FF9800"],
            },
            legend: {
              orient: "right",
              titleFontSize: 12,
              labelFontSize: 11,
            },
          },
        },
      },
    ],
  };
}

/**
 * Create time domain filtering results (showing first 0.5 seconds for clarity)
 */
function createTimeComparisonSpec(
  time: number[],
  signals: { name: string; values: number[] }[]
): vegaLite.TopLevelSpec {
  const vizData: any[] = [];

  signals.forEach((sig) => {
    time.forEach((t, i) => {
      if (t <= 0.5) {
        // Only show first 0.5 seconds for clarity
        vizData.push({
          time: t,
          value: sig.values[i],
          signal: sig.name,
        });
      }
    });
  });

  // Create grid lines
  const gridLines: any[] = [];
  for (let t = 0; t <= 0.5; t += 0.05) {
    gridLines.push({ time: t });
  }

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Filter Effects in Time Domain (First 0.5 Seconds)",
    width: 800,
    height: 400,
    layer: [
      {
        data: { values: gridLines },
        mark: { type: "rule", strokeDash: [2, 2], color: "#e0e0e0", size: 1 },
        encoding: {
          x: {
            field: "time",
            type: "quantitative",
            scale: { domain: [0, 0.5], nice: false, padding: 0 },
          },
        },
      },
      {
        data: { values: vizData },
        mark: { type: "line", clip: true },
        encoding: {
          x: {
            field: "time",
            type: "quantitative",
            title: "Time (seconds)",
            scale: { domain: [0, 0.5], nice: false, padding: 0 },
            axis: { grid: false, tickCount: 10, domain: true },
          },
          y: {
            field: "value",
            type: "quantitative",
            title: "Signal Value",
            axis: { grid: true, tickCount: 10, gridOpacity: 0.3 },
          },
          color: {
            field: "signal",
            type: "nominal",
            title: "Signal Type",
            scale: {
              domain: ["Original", "High-Pass", "Band-Pass", "Notch"],
              range: ["#9E9E9E", "#E91E63", "#9C27B0", "#FF9800"],
            },
            legend: {
              orient: "right",
              titleFontSize: 12,
              labelFontSize: 11,
            },
          },
          strokeWidth: {
            field: "signal",
            type: "nominal",
            scale: {
              domain: ["Original", "High-Pass", "Band-Pass", "Notch"],
              range: [1, 3, 3, 3],
            },
            legend: null,
          },
          opacity: {
            field: "signal",
            type: "nominal",
            scale: {
              domain: ["Original", "High-Pass", "Band-Pass", "Notch"],
              range: [0.3, 1, 1, 1],
            },
            legend: null,
          },
        },
      },
    ],
  };
}

/**
 * Generate simple signal for notch filter demonstration
 */
function generateNotchTestSignal(
  length: number,
  samplingRate: number
): { time: number[]; clean: number[]; noisy: number[] } {
  const time: number[] = [];
  const clean: number[] = [];
  const noisy: number[] = [];

  for (let i = 0; i < length; i++) {
    const t = i / samplingRate;
    time.push(t);

    // Clean signal: 10 Hz sine wave
    const cleanSignal = 1.5 * Math.sin(2 * Math.PI * 10 * t);
    clean.push(cleanSignal);

    // Add 60 Hz power line noise
    const noise60Hz = 0.8 * Math.sin(2 * Math.PI * 60 * t);
    noisy.push(cleanSignal + noise60Hz);
  }

  return { time, clean, noisy };
}

/**
 * Create detailed notch filter analysis
 */
function createNotchAnalysisSpec(time: number[], signals: { name: string; values: number[] }[]): vegaLite.TopLevelSpec {
  const vizData: any[] = [];

  signals.forEach((sig) => {
    time.forEach((t, i) => {
      vizData.push({
        time: t,
        value: sig.values[i],
        signal: sig.name,
      });
    });
  });

  // Create grid lines for 0.6 seconds (6 cycles of 10 Hz)
  const gridLines: any[] = [];
  for (let t = 0; t <= 0.6; t += 0.05) {
    gridLines.push({ time: t });
  }

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Notch Filter Effect: Removing 60 Hz Power Line Noise (6 Cycles of 10 Hz Signal)",
    width: 800,
    height: 400,
    layer: [
      {
        data: { values: gridLines },
        mark: { type: "rule", strokeDash: [2, 2], color: "#e0e0e0", size: 1 },
        encoding: {
          x: {
            field: "time",
            type: "quantitative",
            scale: { domain: [0, 0.6], nice: false, padding: 0 },
          },
        },
      },
      {
        data: { values: vizData },
        mark: { type: "line", clip: true },
        encoding: {
          x: {
            field: "time",
            type: "quantitative",
            title: "Time (seconds)",
            scale: { domain: [0, 0.6], nice: false, padding: 0 },
            axis: { grid: false, tickCount: 12, domain: true },
          },
          y: {
            field: "value",
            type: "quantitative",
            title: "Signal Value",
            axis: { grid: true, tickCount: 10, gridOpacity: 0.3 },
          },
          color: {
            field: "signal",
            type: "nominal",
            title: "Signal",
            scale: {
              domain: ["With 60 Hz Noise", "After Notch Filter"],
              range: ["#FF5252", "#00C853"],
            },
            legend: {
              orient: "right",
              titleFontSize: 12,
              labelFontSize: 11,
            },
          },
          strokeWidth: {
            field: "signal",
            type: "nominal",
            scale: {
              domain: ["With 60 Hz Noise", "After Notch Filter"],
              range: [2, 4],
            },
            legend: null,
          },
          opacity: {
            field: "signal",
            type: "nominal",
            scale: {
              domain: ["With 60 Hz Noise", "After Notch Filter"],
              range: [0.6, 1],
            },
            legend: null,
          },
        },
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

  const outputDir = path.join(__dirname, "..", "outputs", "chapter06");
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
  console.log("Chapter 6: Digital Filters - Part 2 (High-Pass and Band-Pass)");
  console.log("=".repeat(70));
  console.log();

  const samplingRate = 200; // 200 Hz
  const duration = 5; // 5 seconds
  const length = samplingRate * duration;

  // Generate test signal
  console.log("Generating test signal...");
  const { time, signal, components } = generateTestSignal(length, samplingRate);
  console.log(`  DC offset: 2.0`);
  console.log(`  Drift: 0.1 Hz`);
  console.log(`  Low-freq: 2 Hz`);
  console.log(`  Mid-freq: 15 Hz (target for band-pass)`);
  console.log(`  High-freq: 50 Hz`);
  console.log(`  Power line: 60 Hz (target for notch)`);
  console.log();

  // Design filters
  console.log("Designing filters:");
  console.log();

  const hpFilter = designButterworthHPF2(5, samplingRate);
  console.log(`  High-Pass Filter (fc=5 Hz):`);
  console.log(`    Removes DC offset and low-frequency drift`);
  console.log(`    Coefficients: b=${hpFilter.b.map((v) => v.toFixed(4)).join(", ")}`);
  console.log();

  const bpFilter = designBandPassFilter(10, 30, samplingRate);
  console.log(`  Band-Pass Filter (10-30 Hz):`);
  console.log(`    Center frequency: ${Math.sqrt(10 * 30).toFixed(1)} Hz`);
  console.log(`    Bandwidth: ${30 - 10} Hz`);
  console.log(`    Q factor: ${(Math.sqrt(10 * 30) / (30 - 10)).toFixed(2)}`);
  console.log();

  const notchFilter = designNotchFilter(60, samplingRate, 10);
  console.log(`  Notch Filter (60 Hz, Q=10):`);
  console.log(`    Removes power line interference`);
  console.log(`    Coefficients: b=${notchFilter.b.map((v) => v.toFixed(4)).join(", ")}`);
  console.log();

  // Apply filters
  console.log("Applying filters...");
  console.log();

  const hpFiltered = applyIIRFilter(signal, hpFilter);
  const bpFiltered = applyIIRFilter(signal, bpFilter);
  const notchFiltered = applyIIRFilter(signal, notchFilter);

  console.log(
    `  High-pass output range: [${Math.min(...hpFiltered).toFixed(2)}, ${Math.max(...hpFiltered).toFixed(2)}]`
  );
  console.log(
    `  Band-pass output range: [${Math.min(...bpFiltered).toFixed(2)}, ${Math.max(...bpFiltered).toFixed(2)}]`
  );
  console.log(
    `  Notch output range: [${Math.min(...notchFiltered).toFixed(2)}, ${Math.max(...notchFiltered).toFixed(2)}]`
  );
  console.log();

  // Calculate frequency responses
  console.log("Calculating frequency responses...");
  console.log();

  const hpResponse = calculateFrequencyResponse(hpFilter, samplingRate);
  const bpResponse = calculateFrequencyResponse(bpFilter, samplingRate);
  const notchResponse = calculateFrequencyResponse(notchFilter, samplingRate);

  console.log(`  Frequency response calculated for all filters`);
  console.log();

  // Create visualizations
  console.log("Creating visualizations...");
  console.log();

  console.log("  1. Filter frequency responses...");
  const freqSpec = createFilterComparisonSpec([
    { name: "High-Pass (fc=5 Hz)", response: hpResponse },
    { name: "Band-Pass (10-30 Hz)", response: bpResponse },
    { name: "Notch (60 Hz)", response: notchResponse },
  ]);
  await saveChart(freqSpec, "filter-responses");

  console.log("  2. Time domain comparison...");
  const timeSpec = createTimeComparisonSpec(time, [
    { name: "Original", values: signal },
    { name: "High-Pass", values: hpFiltered },
    { name: "Band-Pass", values: bpFiltered },
    { name: "Notch", values: notchFiltered },
  ]);
  await saveChart(timeSpec, "time-domain-comparison");

  console.log("  3. Notch filter detailed analysis...");
  // Generate clean signal specifically for notch demonstration
  // Show 6 cycles of 10 Hz signal = 0.6 seconds
  const notchTestLength = Math.floor(samplingRate * 0.6);
  const {
    time: notchTime,
    clean: cleanSignal10Hz,
    noisy: noisySignal,
  } = generateNotchTestSignal(notchTestLength, samplingRate);
  const notchFilteredClean = applyIIRFilter(noisySignal, notchFilter);

  const notchSpec = createNotchAnalysisSpec(notchTime, [
    { name: "With 60 Hz Noise", values: noisySignal },
    { name: "After Notch Filter", values: notchFilteredClean },
  ]);
  await saveChart(notchSpec, "notch-filter-analysis");

  console.log();
  console.log("=".repeat(70));
  console.log("✓ Chapter 6 completed successfully!");
  console.log();
  console.log("Key Insights:");
  console.log("  • High-pass filters remove DC offset and drift");
  console.log("  • Band-pass filters isolate specific frequency ranges");
  console.log("  • Notch filters eliminate specific interference (e.g., 60 Hz)");
  console.log("  • Filter selection depends on signal characteristics");
  console.log("  • Cascading filters combines their effects");
  console.log("=".repeat(70));
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
