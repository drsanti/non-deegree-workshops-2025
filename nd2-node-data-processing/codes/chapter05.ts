/**
 * Chapter 5: Digital Filters - Part 1 (Low-Pass Filters)
 *
 * This file demonstrates:
 * - Butterworth low-pass filter implementation
 * - Simple RC low-pass filter
 * - Filter design with different cutoff frequencies
 * - Frequency response visualization
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
 * Generate test signal with noise
 */
function generateTestSignal(
  length: number,
  samplingRate: number
): { time: number[]; clean: number[]; noisy: number[] } {
  const time: number[] = [];
  const clean: number[] = [];
  const noisy: number[] = [];

  for (let i = 0; i < length; i++) {
    const t = i / samplingRate;
    time.push(t);

    // Low-frequency signal components
    const signal = 2.0 * Math.sin(2 * Math.PI * 2 * t) + 1.5 * Math.sin(2 * Math.PI * 5 * t);

    clean.push(signal);

    // Add high-frequency noise
    const noise =
      0.5 * Math.sin(2 * Math.PI * 30 * t) + 0.3 * Math.sin(2 * Math.PI * 50 * t) + 0.2 * ((Math.random() - 0.5) * 2);

    noisy.push(signal + noise);
  }

  return { time, clean, noisy };
}

// ============================================================================
// Filter Implementations
// ============================================================================

/**
 * Design 1st order Butterworth low-pass filter
 */
function designButterworthLPF1(cutoffFreq: number, samplingRate: number): FilterCoefficients {
  const fc = cutoffFreq / samplingRate; // Normalized cutoff frequency
  const wc = Math.tan(Math.PI * fc); // Pre-warp frequency

  const a0 = 1 + wc;
  const b0 = wc / a0;
  const b1 = wc / a0;
  const a1 = (wc - 1) / a0;

  return {
    b: [b0, b1],
    a: [1, -a1],
  };
}

/**
 * Design 2nd order Butterworth low-pass filter
 */
function designButterworthLPF2(cutoffFreq: number, samplingRate: number): FilterCoefficients {
  const fc = cutoffFreq / samplingRate;
  const wc = Math.tan(Math.PI * fc);
  const wc2 = wc * wc;
  const sqrt2 = Math.sqrt(2);

  const k = 1 + sqrt2 * wc + wc2;
  const b0 = wc2 / k;
  const b1 = (2 * wc2) / k;
  const b2 = wc2 / k;
  const a1 = (2 * wc2 - 2) / k;
  const a2 = (1 - sqrt2 * wc + wc2) / k;

  return {
    b: [b0, b1, b2],
    a: [1, a1, a2], // Note: we'll negate a1, a2 in the filter application
  };
}

/**
 * Design 4th order Butterworth low-pass filter (two biquad sections)
 * Returns two different 2nd order sections with proper pole placement
 */
function designButterworthLPF4(cutoffFreq: number, samplingRate: number): [FilterCoefficients, FilterCoefficients] {
  const fc = cutoffFreq / samplingRate;
  const wc = Math.tan(Math.PI * fc);
  const wc2 = wc * wc;

  // First biquad (Q = 0.5412)
  const q1 = 0.54119610014619;
  const k1 = 1 + wc / q1 + wc2;
  const section1: FilterCoefficients = {
    b: [wc2 / k1, (2 * wc2) / k1, wc2 / k1],
    a: [1, (2 * wc2 - 2) / k1, (1 - wc / q1 + wc2) / k1],
  };

  // Second biquad (Q = 1.3066)
  const q2 = 1.3065629648763766;
  const k2 = 1 + wc / q2 + wc2;
  const section2: FilterCoefficients = {
    b: [wc2 / k2, (2 * wc2) / k2, wc2 / k2],
    a: [1, (2 * wc2 - 2) / k2, (1 - wc / q2 + wc2) / k2],
  };

  return [section1, section2];
}

/**
 * Simple RC low-pass filter (1st order)
 */
function designRCFilter(cutoffFreq: number, samplingRate: number): FilterCoefficients {
  const dt = 1 / samplingRate;
  const RC = 1 / (2 * Math.PI * cutoffFreq);
  const alpha = dt / (RC + dt);

  return {
    b: [alpha],
    a: [1, -(1 - alpha)],
  };
}

/**
 * Apply IIR filter to signal using Direct Form II
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

    // Feedforward (numerator) - b coefficients
    for (let i = 0; i < b.length && i < xHistory.length; i++) {
      y += b[i] * xHistory[i];
    }

    // Feedback (denominator) - a coefficients (skip a[0] which is 1)
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
 * Cascade two filters (for 4th order)
 */
function cascadeFilters(signal: number[], filter1: FilterCoefficients, filter2: FilterCoefficients): number[] {
  const intermediate = applyIIRFilter(signal, filter1);
  return applyIIRFilter(intermediate, filter2);
}

// ============================================================================
// Frequency Response Analysis
// ============================================================================

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
    const freq = (i / numPoints) * (samplingRate / 2); // 0 to Nyquist
    frequencies.push(freq);

    const omega = (2 * Math.PI * freq) / samplingRate;

    // Calculate H(e^jω) = B(e^jω) / A(e^jω)
    let numReal = 0,
      numImag = 0;
    let denReal = 0,
      denImag = 0;

    // Numerator
    for (let k = 0; k < b.length; k++) {
      numReal += b[k] * Math.cos(-k * omega);
      numImag += b[k] * Math.sin(-k * omega);
    }

    // Denominator
    for (let k = 0; k < a.length; k++) {
      denReal += a[k] * Math.cos(-k * omega);
      denImag += a[k] * Math.sin(-k * omega);
    }

    // Complex division
    const denMag = denReal * denReal + denImag * denImag;
    const hReal = (numReal * denReal + numImag * denImag) / denMag;
    const hImag = (numImag * denReal - numReal * denImag) / denMag;

    const mag = Math.sqrt(hReal * hReal + hImag * hImag);
    magnitude.push(mag);
    magnitudeDB.push(20 * Math.log10(mag + 1e-10)); // Avoid log(0)
    phase.push(Math.atan2(hImag, hReal) * (180 / Math.PI));
  }

  return { frequencies, magnitude, magnitudeDB, phase };
}

// ============================================================================
// Performance Metrics
// ============================================================================

/**
 * Calculate Signal-to-Noise Ratio improvement
 */
function calculateSNRImprovement(clean: number[], noisyBefore: number[], filtered: number[]): number {
  // Calculate noise power before and after
  let noisePowerBefore = 0;
  let noisePowerAfter = 0;

  for (let i = 0; i < clean.length; i++) {
    const noiseBefore = noisyBefore[i] - clean[i];
    const noiseAfter = filtered[i] - clean[i];
    noisePowerBefore += noiseBefore * noiseBefore;
    noisePowerAfter += noiseAfter * noiseAfter;
  }

  noisePowerBefore /= clean.length;
  noisePowerAfter /= clean.length;

  return 10 * Math.log10(noisePowerBefore / (noisePowerAfter + 1e-10));
}

// ============================================================================
// Visualization Functions
// ============================================================================

/**
 * Create frequency response visualization
 */
function createFrequencyResponseSpec(
  responses: { name: string; response: FrequencyResponse }[]
): vegaLite.TopLevelSpec {
  const vizData: any[] = [];

  responses.forEach((r) => {
    r.response.frequencies.forEach((freq, i) => {
      vizData.push({
        frequency: freq,
        magnitude: r.response.magnitudeDB[i],
        phase: r.response.phase[i],
        filter: r.name,
      });
    });
  });

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Filter Frequency Response (Magnitude)",
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
        mark: { type: "line", strokeWidth: 3, point: false, clip: true },
        encoding: {
          x: {
            field: "frequency",
            type: "quantitative",
            title: "Frequency (Hz)",
            scale: { type: "log", domain: [0.5, 100], nice: false, padding: 0 },
            axis: { grid: true, tickCount: 20, gridOpacity: 0.5, domain: true },
          },
          y: {
            field: "magnitude",
            type: "quantitative",
            title: "Magnitude (dB)",
            scale: { domain: [-60, 5], nice: false, padding: 0 },
            axis: { grid: true, tickCount: 13, gridOpacity: 0.5, domain: true },
          },
          color: {
            field: "filter",
            type: "nominal",
            title: "Filter Type",
            scale: {
              domain: ["1st Order (fc=10 Hz)", "2nd Order (fc=10 Hz)", "RC Filter (fc=10 Hz)"],
              range: ["#109bffff", "#ff7c09ff", "#02d602ff"],
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
 * Create time domain comparison
 */
function createTimeDomainSpec(time: number[], signals: { name: string; values: number[] }[]): vegaLite.TopLevelSpec {
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

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Time Domain: Low-Pass Filter Effect",
    data: { values: vizData },
    width: 800,
    height: 400,
    mark: { type: "line", strokeWidth: 2 },
    encoding: {
      x: {
        field: "time",
        type: "quantitative",
        title: "Time (seconds)",
        scale: { domain: [0, 5], nice: false },
        axis: { grid: true, tickCount: 25, gridOpacity: 0.3 },
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
          domain: ["Clean Signal", "Noisy Signal", "Filtered (fc=10 Hz)", "Filtered (fc=5 Hz)"],
          range: ["#0e0e0eff", "#00cc44ff", "#168fffff", "#ffda09ff"],
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
          domain: ["Clean Signal", "Noisy Signal", "Filtered (fc=10 Hz)", "Filtered (fc=5 Hz)"],
          range: [3, 1, 4, 4],
        },
        legend: null,
      },
      opacity: {
        field: "signal",
        type: "nominal",
        scale: {
          domain: ["Clean Signal", "Noisy Signal", "Filtered (fc=10 Hz)", "Filtered (fc=5 Hz)"],
          range: [0.85, 0.25, 1, 1],
        },
        legend: null,
      },
    },
  };
}

/**
 * Create filter order comparison
 */
function createFilterOrderComparisonSpec(
  time: number[],
  signals: { name: string; values: number[] }[]
): vegaLite.TopLevelSpec {
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

  // Create explicit grid lines
  const gridLines: any[] = [];
  for (let t = 0; t <= 3; t += 0.2) {
    gridLines.push({ time: t });
  }

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Filter Order Comparison (fc=10 Hz) - Higher Order = Sharper Cutoff",
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
            scale: { domain: [0, 3], nice: false, padding: 0 },
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
            scale: { domain: [0, 3], nice: false, padding: 0 },
            axis: { grid: false, tickCount: 16, domain: true },
          },
          y: {
            field: "value",
            type: "quantitative",
            title: "Signal Value",
            axis: { grid: true, tickCount: 10, gridOpacity: 0.4 },
          },
          color: {
            field: "signal",
            type: "nominal",
            title: "Filter Order",
            scale: {
              domain: ["Noisy Signal", "1st Order", "2nd Order", "4th Order"],
              range: ["#222222", "#ffcc00ff", "#0037ffff", "#ff0000ff"],
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
              domain: ["Noisy Signal", "1st Order", "2nd Order", "4th Order"],
              range: [1, 2, 3, 3],
            },
            legend: null,
          },
          opacity: {
            field: "signal",
            type: "nominal",
            scale: {
              domain: ["Noisy Signal", "1st Order", "2nd Order", "4th Order"],
              range: [0.3, 0.8, 0.9, 1],
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

  const outputDir = path.join(__dirname, "..", "outputs", "chapter05");
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
  console.log("Chapter 5: Digital Filters - Part 1 (Low-Pass Filters)");
  console.log("=".repeat(70));
  console.log();

  const samplingRate = 200; // 200 Hz
  const duration = 5; // 5 seconds
  const length = samplingRate * duration;

  // Generate test signal
  console.log("Generating test signal...");
  const { time, clean, noisy } = generateTestSignal(length, samplingRate);
  console.log(`  Signal components: 2 Hz, 5 Hz (should pass)`);
  console.log(`  Noise components: 12 Hz (near cutoff), 20 Hz, 40 Hz, random`);
  console.log(`  Cutoff frequency: 10 Hz`);
  console.log(`  Sampling rate: ${samplingRate} Hz`);
  console.log(`  Duration: ${duration} seconds`);
  console.log();

  // Design filters with different specifications
  console.log("Designing low-pass filters:");
  console.log();

  const filters: { [key: string]: FilterCoefficients } = {};

  // 1st order Butterworth
  filters["butter1_10Hz"] = designButterworthLPF1(10, samplingRate);
  console.log(`  1st order Butterworth (fc=10 Hz)`);
  console.log(`    Coefficients: b=${filters["butter1_10Hz"].b.map((v) => v.toFixed(4)).join(", ")}`);
  console.log(`    Coefficients: a=${filters["butter1_10Hz"].a.map((v) => v.toFixed(4)).join(", ")}`);
  console.log();

  // 2nd order Butterworth
  filters["butter2_10Hz"] = designButterworthLPF2(10, samplingRate);
  console.log(`  2nd order Butterworth (fc=10 Hz)`);
  console.log(`    Coefficients: b=${filters["butter2_10Hz"].b.map((v) => v.toFixed(4)).join(", ")}`);
  console.log();

  // 4th order (two different biquad sections)
  const [section1, section2] = designButterworthLPF4(10, samplingRate);
  filters["butter4_section1"] = section1;
  filters["butter4_section2"] = section2;
  console.log(`  4th order Butterworth (fc=10 Hz) - proper biquad cascade`);
  console.log(`    Section 1 (Q=0.541): b=${section1.b.map((v) => v.toFixed(4)).join(", ")}`);
  console.log(`    Section 2 (Q=1.307): b=${section2.b.map((v) => v.toFixed(4)).join(", ")}`);
  console.log();

  // RC filter
  filters["rc_10Hz"] = designRCFilter(10, samplingRate);
  console.log(`  RC Low-Pass Filter (fc=10 Hz)`);
  console.log(`    Coefficients: b=${filters["rc_10Hz"].b.map((v) => v.toFixed(4)).join(", ")}`);
  console.log();

  // Apply filters
  console.log("Applying filters to noisy signal:");
  console.log();

  const filtered1st = applyIIRFilter(noisy, filters["butter1_10Hz"]);
  const filtered2nd = applyIIRFilter(noisy, filters["butter2_10Hz"]);
  const filtered4th = cascadeFilters(noisy, filters["butter4_section1"], filters["butter4_section2"]);
  const filteredRC = applyIIRFilter(noisy, filters["rc_10Hz"]);
  const filtered5Hz = applyIIRFilter(noisy, designButterworthLPF2(5, samplingRate));

  // Calculate SNR improvements
  const snr1st = calculateSNRImprovement(clean, noisy, filtered1st);
  const snr2nd = calculateSNRImprovement(clean, noisy, filtered2nd);
  const snr4th = calculateSNRImprovement(clean, noisy, filtered4th);
  const snrRC = calculateSNRImprovement(clean, noisy, filteredRC);

  console.log(`  1st order Butterworth: SNR improvement = ${snr1st.toFixed(2)} dB`);
  console.log(`  2nd order Butterworth: SNR improvement = ${snr2nd.toFixed(2)} dB`);
  console.log(`  4th order Butterworth: SNR improvement = ${snr4th.toFixed(2)} dB`);
  console.log(`  RC filter: SNR improvement = ${snrRC.toFixed(2)} dB`);
  console.log();

  // Calculate frequency responses
  console.log("Calculating frequency responses...");
  console.log();

  const freqResp1st = calculateFrequencyResponse(filters["butter1_10Hz"], samplingRate);
  const freqResp2nd = calculateFrequencyResponse(filters["butter2_10Hz"], samplingRate);
  const freqRespRC = calculateFrequencyResponse(filters["rc_10Hz"], samplingRate);

  // Find -3dB points
  const find3dBPoint = (response: FrequencyResponse): number => {
    for (let i = 0; i < response.magnitudeDB.length; i++) {
      if (response.magnitudeDB[i] <= -3) {
        return response.frequencies[i];
      }
    }
    return -1;
  };

  console.log(`  1st order -3dB point: ${find3dBPoint(freqResp1st).toFixed(2)} Hz`);
  console.log(`  2nd order -3dB point: ${find3dBPoint(freqResp2nd).toFixed(2)} Hz`);
  console.log(`  RC filter -3dB point: ${find3dBPoint(freqRespRC).toFixed(2)} Hz`);
  console.log();

  // Create visualizations
  console.log("Creating visualizations...");
  console.log();

  console.log("  1. Frequency response...");
  const freqSpec = createFrequencyResponseSpec([
    { name: "1st Order (fc=10 Hz)", response: freqResp1st },
    { name: "2nd Order (fc=10 Hz)", response: freqResp2nd },
    { name: "RC Filter (fc=10 Hz)", response: freqRespRC },
  ]);
  await saveChart(freqSpec, "frequency-response");

  console.log("  2. Time domain filtering...");
  const timeSpec = createTimeDomainSpec(time, [
    { name: "Clean Signal", values: clean },
    { name: "Noisy Signal", values: noisy },
    { name: "Filtered (fc=10 Hz)", values: filtered2nd },
    { name: "Filtered (fc=5 Hz)", values: filtered5Hz },
  ]);
  await saveChart(timeSpec, "time-domain-filtering");

  console.log("  3. Filter order comparison...");
  const orderSpec = createFilterOrderComparisonSpec(time, [
    { name: "Noisy Signal", values: noisy },
    { name: "1st Order", values: filtered1st },
    { name: "2nd Order", values: filtered2nd },
    { name: "4th Order", values: filtered4th },
  ]);
  await saveChart(orderSpec, "filter-order-comparison");

  console.log();
  console.log("=".repeat(70));
  console.log("✓ Chapter 5 completed successfully!");
  console.log();
  console.log("Key Insights:");
  console.log("  • Higher order filters provide sharper cutoff");
  console.log("  • 2nd order Butterworth provides good balance");
  console.log("  • RC filter similar to 1st order Butterworth");
  console.log("  • Lower cutoff frequency = more smoothing + more lag");
  console.log("  • All filters introduce phase lag");
  console.log("=".repeat(70));
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
