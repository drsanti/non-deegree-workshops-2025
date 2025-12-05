/**
 * Chapter 8: Vibration Analysis for Predictive Maintenance
 *
 * This file demonstrates:
 * - Simulation of motor vibration (healthy and faulty conditions)
 * - Bearing fault frequency calculations
 * - FFT-based fault detection
 * - Frequency spectrum comparison (healthy vs faulty)
 * - Identification of bearing defects through frequency analysis
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import * as vega from "vega";
import * as vegaLite from "vega-lite";
import FFT from "fft.js";

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Type Definitions
// ============================================================================

interface BearingGeometry {
  numberOfBalls: number; // Nb
  ballDiameter: number; // d (mm)
  pitchDiameter: number; // D (mm)
  contactAngle: number; // β (degrees)
}

interface BearingFaultFrequencies {
  rotationFreq: number; // fs
  bpfo: number; // Ball Pass Frequency Outer Race
  bpfi: number; // Ball Pass Frequency Inner Race
  bsf: number; // Ball Spin Frequency
  ftf: number; // Fundamental Train Frequency (cage)
}

interface VibrationData {
  time: number[];
  vibration: number[];
  samplingRate: number;
  condition: string;
}

interface FFTResult {
  frequencies: number[];
  magnitudes: number[];
  condition: string;
}

// ============================================================================
// Bearing Fault Frequency Calculations
// ============================================================================

/**
 * Calculate bearing fault frequencies from geometry
 */
function calculateBearingFrequencies(rpm: number, bearing: BearingGeometry): BearingFaultFrequencies {
  const rotationFreq = rpm / 60; // Convert RPM to Hz
  const beta = (bearing.contactAngle * Math.PI) / 180; // Convert to radians
  const ratio = bearing.ballDiameter / bearing.pitchDiameter;

  // Ball Pass Frequency Outer Race
  const bpfo = (bearing.numberOfBalls * rotationFreq * (1 - ratio * Math.cos(beta))) / 2;

  // Ball Pass Frequency Inner Race
  const bpfi = (bearing.numberOfBalls * rotationFreq * (1 + ratio * Math.cos(beta))) / 2;

  // Ball Spin Frequency
  const bsf =
    (bearing.pitchDiameter * rotationFreq * (1 - Math.pow(ratio * Math.cos(beta), 2))) / (2 * bearing.ballDiameter);

  // Fundamental Train Frequency (cage)
  const ftf = (rotationFreq * (1 - ratio * Math.cos(beta))) / 2;

  return {
    rotationFreq,
    bpfo,
    bpfi,
    bsf,
    ftf,
  };
}

// ============================================================================
// Vibration Signal Generation
// ============================================================================

/**
 * Generate healthy motor vibration signature
 */
function generateHealthyVibration(
  duration: number,
  samplingRate: number,
  frequencies: BearingFaultFrequencies
): VibrationData {
  const length = Math.floor(duration * samplingRate);
  const time: number[] = [];
  const vibration: number[] = [];

  const f1x = frequencies.rotationFreq; // 1× rotation
  const f2x = 2 * frequencies.rotationFreq; // 2× harmonic
  const f3x = 3 * frequencies.rotationFreq; // 3× harmonic

  for (let i = 0; i < length; i++) {
    const t = i / samplingRate;
    time.push(t);

    // Healthy machine characteristics:
    // - Dominant 1× component (rotation)
    // - Small 2× and 3× harmonics
    // - Very small bearing frequencies (normal operation)
    // - Background noise
    const value =
      2.0 * Math.sin(2 * Math.PI * f1x * t) + // Rotation (dominant)
      0.3 * Math.sin(2 * Math.PI * f2x * t) + // 2× harmonic
      0.15 * Math.sin(2 * Math.PI * f3x * t) + // 3× harmonic
      0.05 * Math.sin(2 * Math.PI * frequencies.bpfo * t) + // Normal BPFO
      0.05 * Math.sin(2 * Math.PI * frequencies.bpfi * t) + // Normal BPFI
      0.2 * (Math.random() - 0.5); // Random noise

    vibration.push(value);
  }

  return {
    time,
    vibration,
    samplingRate,
    condition: "Healthy",
  };
}

/**
 * Generate faulty motor vibration with bearing outer race defect
 */
function generateFaultyVibration(
  duration: number,
  samplingRate: number,
  frequencies: BearingFaultFrequencies
): VibrationData {
  const length = Math.floor(duration * samplingRate);
  const time: number[] = [];
  const vibration: number[] = [];

  const f1x = frequencies.rotationFreq;
  const f2x = 2 * frequencies.rotationFreq;
  const f3x = 3 * frequencies.rotationFreq;

  for (let i = 0; i < length; i++) {
    const t = i / samplingRate;
    time.push(t);

    // Faulty bearing (outer race defect) characteristics:
    // - Increased 1× component (imbalance from wear)
    // - Elevated 2× and 3× harmonics
    // - Strong BPFO and its harmonics (2×BPFO, 3×BPFO)
    // - Sidebands around BPFO (modulation)
    // - Higher noise floor
    const value =
      2.5 * Math.sin(2 * Math.PI * f1x * t) + // Increased rotation
      0.6 * Math.sin(2 * Math.PI * f2x * t) + // Increased 2× harmonic
      0.4 * Math.sin(2 * Math.PI * f3x * t) + // Increased 3× harmonic
      1.8 * Math.sin(2 * Math.PI * frequencies.bpfo * t) + // Strong BPFO (fault)
      0.9 * Math.sin(2 * Math.PI * (2 * frequencies.bpfo) * t) + // 2×BPFO
      0.5 * Math.sin(2 * Math.PI * (3 * frequencies.bpfo) * t) + // 3×BPFO
      0.4 * Math.sin(2 * Math.PI * (frequencies.bpfo - f1x) * t) + // Lower sideband
      0.4 * Math.sin(2 * Math.PI * (frequencies.bpfo + f1x) * t) + // Upper sideband
      0.15 * Math.sin(2 * Math.PI * frequencies.bpfi * t) + // BPFI (slightly elevated)
      0.4 * (Math.random() - 0.5); // Higher noise floor

    vibration.push(value);
  }

  return {
    time,
    vibration,
    samplingRate,
    condition: "Faulty (BPFO)",
  };
}

/**
 * Generate imbalanced motor vibration
 */
function generateImbalancedVibration(
  duration: number,
  samplingRate: number,
  frequencies: BearingFaultFrequencies
): VibrationData {
  const length = Math.floor(duration * samplingRate);
  const time: number[] = [];
  const vibration: number[] = [];

  const f1x = frequencies.rotationFreq;
  const f2x = 2 * frequencies.rotationFreq;

  for (let i = 0; i < length; i++) {
    const t = i / samplingRate;
    time.push(t);

    // Imbalance characteristics:
    // - Very strong 1× component
    // - Minimal harmonics
    const value =
      4.5 * Math.sin(2 * Math.PI * f1x * t) + // Very high 1×
      0.4 * Math.sin(2 * Math.PI * f2x * t) + // Small 2×
      0.05 * Math.sin(2 * Math.PI * frequencies.bpfo * t) +
      0.05 * Math.sin(2 * Math.PI * frequencies.bpfi * t) +
      0.25 * (Math.random() - 0.5);

    vibration.push(value);
  }

  return {
    time,
    vibration,
    samplingRate,
    condition: "Imbalance",
  };
}

/**
 * Generate misaligned motor vibration
 */
function generateMisalignedVibration(
  duration: number,
  samplingRate: number,
  frequencies: BearingFaultFrequencies
): VibrationData {
  const length = Math.floor(duration * samplingRate);
  const time: number[] = [];
  const vibration: number[] = [];

  const f1x = frequencies.rotationFreq;
  const f2x = 2 * frequencies.rotationFreq;
  const f3x = 3 * frequencies.rotationFreq;

  for (let i = 0; i < length; i++) {
    const t = i / samplingRate;
    time.push(t);

    // Misalignment characteristics:
    // - Elevated 2× component (dominant)
    // - Strong 3× component
    const value =
      1.5 * Math.sin(2 * Math.PI * f1x * t) + // Moderate 1×
      3.5 * Math.sin(2 * Math.PI * f2x * t) + // Very high 2× (misalignment signature)
      2.0 * Math.sin(2 * Math.PI * f3x * t) + // High 3×
      0.05 * Math.sin(2 * Math.PI * frequencies.bpfo * t) +
      0.05 * Math.sin(2 * Math.PI * frequencies.bpfi * t) +
      0.3 * (Math.random() - 0.5);

    vibration.push(value);
  }

  return {
    time,
    vibration,
    samplingRate,
    condition: "Misalignment",
  };
}

// ============================================================================
// FFT Analysis
// ============================================================================

/**
 * Apply Hann window
 */
function applyHannWindow(signal: number[]): number[] {
  const N = signal.length;
  const windowed = new Array(N);

  for (let i = 0; i < N; i++) {
    const window = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (N - 1)));
    windowed[i] = signal[i] * window;
  }

  return windowed;
}

/**
 * Perform FFT analysis
 */
function performFFT(vibration: number[], samplingRate: number, condition: string): FFTResult {
  // Find next power of 2
  const fftSize = Math.pow(2, Math.ceil(Math.log2(vibration.length)));

  // Apply window
  const windowed = applyHannWindow(vibration);

  // Zero-pad
  const input = new Array(fftSize).fill(0);
  for (let i = 0; i < windowed.length; i++) {
    input[i] = windowed[i];
  }

  // Perform FFT
  const fft = new FFT(fftSize);
  const out = fft.createComplexArray();
  fft.realTransform(out, input);
  fft.completeSpectrum(out);

  // Calculate magnitudes
  const frequencies: number[] = [];
  const magnitudes: number[] = [];

  for (let i = 0; i < fftSize / 2; i++) {
    const freq = (i * samplingRate) / fftSize;
    const real = out[2 * i];
    const imag = out[2 * i + 1];
    const magnitude = (Math.sqrt(real * real + imag * imag) / fftSize) * 2;

    frequencies.push(freq);
    magnitudes.push(magnitude);
  }

  return { frequencies, magnitudes, condition };
}

// ============================================================================
// Visualization Functions
// ============================================================================

/**
 * Create time domain comparison
 */
function createTimeComparisonSpec(healthy: VibrationData, faulty: VibrationData): any {
  const vizData: any[] = [];

  // Show first 0.2 seconds
  const maxTime = 0.2;

  healthy.time.forEach((t, i) => {
    if (t <= maxTime) {
      vizData.push({
        time: t,
        vibration: healthy.vibration[i],
        condition: "Healthy",
      });
    }
  });

  faulty.time.forEach((t, i) => {
    if (t <= maxTime) {
      vizData.push({
        time: t,
        vibration: faulty.vibration[i],
        condition: "Faulty",
      });
    }
  });

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Vibration Time Domain: Healthy vs Faulty",
    width: 800,
    height: 400,
    data: { values: vizData },
    mark: { type: "line", strokeWidth: 1.5 },
    encoding: {
      x: {
        field: "time",
        type: "quantitative",
        title: "Time (seconds)",
        scale: { domain: [0, maxTime] },
        axis: { grid: true, tickCount: 10 },
      },
      y: {
        field: "vibration",
        type: "quantitative",
        title: "Vibration Amplitude (mm/s)",
        axis: { grid: true, gridOpacity: 0.3 },
      },
      color: {
        field: "condition",
        type: "nominal",
        title: "Condition",
        scale: {
          domain: ["Healthy", "Faulty"],
          range: ["#4CAF50", "#F44336"],
        },
      },
      opacity: {
        field: "condition",
        type: "nominal",
        scale: {
          domain: ["Healthy", "Faulty"],
          range: [0.6, 1],
        },
        legend: null,
      },
    },
  };
}

/**
 * Create frequency domain comparison with fault frequency markers
 */
function createFrequencyComparisonSpec(
  healthyFFT: FFTResult,
  faultyFFT: FFTResult,
  frequencies: BearingFaultFrequencies,
  maxFreq: number = 300
): any {
  const vizData: any[] = [];

  // Add healthy data
  healthyFFT.frequencies.forEach((freq, i) => {
    if (freq > 0 && freq <= maxFreq) {
      vizData.push({
        frequency: freq,
        magnitude: healthyFFT.magnitudes[i],
        condition: "Healthy",
      });
    }
  });

  // Add faulty data
  faultyFFT.frequencies.forEach((freq, i) => {
    if (freq > 0 && freq <= maxFreq) {
      vizData.push({
        frequency: freq,
        magnitude: faultyFFT.magnitudes[i],
        condition: "Faulty",
      });
    }
  });

  // Fault frequency markers
  const markers = [
    { freq: frequencies.rotationFreq, label: "1×" },
    { freq: 2 * frequencies.rotationFreq, label: "2×" },
    { freq: 3 * frequencies.rotationFreq, label: "3×" },
    { freq: frequencies.bpfo, label: "BPFO" },
    { freq: 2 * frequencies.bpfo, label: "2×BPFO" },
    { freq: frequencies.bpfi, label: "BPFI" },
    { freq: frequencies.ftf, label: "FTF" },
  ];

  const markerData: any[] = [];
  markers.forEach((m) => {
    if (m.freq <= maxFreq) {
      markerData.push({ frequency: m.freq, label: m.label });
    }
  });

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Frequency Spectrum: Healthy vs Faulty (Bearing Defect)",
    width: 800,
    height: 500,
    layer: [
      {
        data: { values: vizData },
        mark: { type: "line", strokeWidth: 2 },
        encoding: {
          x: {
            field: "frequency",
            type: "quantitative",
            title: "Frequency (Hz)",
            scale: { domain: [0, maxFreq] },
            axis: { grid: true, tickCount: 15 },
          },
          y: {
            field: "magnitude",
            type: "quantitative",
            title: "Magnitude (mm/s)",
            axis: { grid: true, gridOpacity: 0.3 },
          },
          color: {
            field: "condition",
            type: "nominal",
            title: "Condition",
            scale: {
              domain: ["Healthy", "Faulty"],
              range: ["#4CAF50", "#F44336"],
            },
            legend: {
              orient: "top-left",
              titleFontSize: 12,
              labelFontSize: 11,
            },
          },
          opacity: {
            field: "condition",
            type: "nominal",
            scale: {
              domain: ["Healthy", "Faulty"],
              range: [0.5, 1],
            },
            legend: null,
          },
        },
      },
      {
        data: { values: markerData },
        mark: {
          type: "rule",
          strokeDash: [4, 4],
          color: "#FF9800",
          strokeWidth: 1.5,
        },
        encoding: {
          x: { field: "frequency", type: "quantitative" },
        },
      },
      {
        data: { values: markerData },
        mark: {
          type: "text",
          align: "center",
          baseline: "bottom",
          dy: -5,
          fontSize: 10,
          color: "#FF9800",
          fontWeight: "bold",
        },
        encoding: {
          x: { field: "frequency", type: "quantitative" },
          y: { value: 10 },
          text: { field: "label", type: "nominal" },
        },
      },
    ],
  };
}

/**
 * Create multi-condition comparison
 */
function createMultiConditionSpec(
  healthyFFT: FFTResult,
  imbalanceFFT: FFTResult,
  misalignFFT: FFTResult,
  faultyFFT: FFTResult,
  maxFreq: number = 200
): any {
  const vizData: any[] = [];

  [healthyFFT, imbalanceFFT, misalignFFT, faultyFFT].forEach((fft) => {
    fft.frequencies.forEach((freq, i) => {
      if (freq > 0 && freq <= maxFreq) {
        vizData.push({
          frequency: freq,
          magnitude: fft.magnitudes[i],
          condition: fft.condition,
        });
      }
    });
  });

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Fault Signature Comparison (All Conditions)",
    width: 800,
    height: 500,
    data: { values: vizData },
    mark: { type: "line", strokeWidth: 2 },
    encoding: {
      x: {
        field: "frequency",
        type: "quantitative",
        title: "Frequency (Hz)",
        scale: { domain: [0, maxFreq] },
        axis: { grid: true, tickCount: 10 },
      },
      y: {
        field: "magnitude",
        type: "quantitative",
        title: "Magnitude (mm/s)",
        axis: { grid: true, gridOpacity: 0.3 },
      },
      color: {
        field: "condition",
        type: "nominal",
        title: "Condition",
        scale: {
          domain: ["Healthy", "Imbalance", "Misalignment", "Faulty (BPFO)"],
          range: ["#4CAF50", "#2196F3", "#FF9800", "#F44336"],
        },
        legend: {
          orient: "top-left",
          titleFontSize: 12,
          labelFontSize: 11,
        },
      },
    },
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

async function saveVisualization(spec: any, outputDir: string, filename: string): Promise<void> {
  const vgSpec = vegaLite.compile(spec).spec;
  const view = new vega.View(vega.parse(vgSpec), { renderer: "none" });
  const svg = await view.toSVG();

  const svgPath = path.join(outputDir, `${filename}.svg`);
  fs.writeFileSync(svgPath, svg);
  console.log(`✓ SVG saved to: ${svgPath}`);

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${spec.title || filename}</title>
  <script src="https://cdn.jsdelivr.net/npm/vega@5"></script>
  <script src="https://cdn.jsdelivr.net/npm/vega-lite@5"></script>
  <script src="https://cdn.jsdelivr.net/npm/vega-embed@6"></script>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    #vis { margin: 20px auto; }
  </style>
</head>
<body>
  <div id="vis"></div>
  <script>
    const spec = ${JSON.stringify(spec, null, 2)};
    vegaEmbed('#vis', spec);
  </script>
</body>
</html>`;

  const htmlPath = path.join(outputDir, `${filename}.html`);
  fs.writeFileSync(htmlPath, html);
  console.log(`✓ HTML saved to: ${htmlPath}`);
}

// ============================================================================
// Main Program
// ============================================================================

async function main() {
  console.log("======================================================================");
  console.log("Chapter 8: Vibration Analysis for Predictive Maintenance");
  console.log("======================================================================\n");

  // Machine specifications
  const motorRPM = 1500;
  const bearing: BearingGeometry = {
    numberOfBalls: 8,
    ballDiameter: 12, // mm
    pitchDiameter: 60, // mm
    contactAngle: 0, // degrees (deep groove bearing)
  };

  // Calculate bearing fault frequencies
  console.log("Machine Specifications:");
  console.log(`  Motor speed: ${motorRPM} RPM`);
  console.log(
    `  Bearing: ${bearing.numberOfBalls} balls, ${bearing.ballDiameter}mm ball dia, ${bearing.pitchDiameter}mm pitch dia\n`
  );

  const frequencies = calculateBearingFrequencies(motorRPM, bearing);

  console.log("Calculated Fault Frequencies:");
  console.log(`  Rotation frequency (1×): ${frequencies.rotationFreq.toFixed(2)} Hz`);
  console.log(`  BPFO (outer race): ${frequencies.bpfo.toFixed(2)} Hz`);
  console.log(`  BPFI (inner race): ${frequencies.bpfi.toFixed(2)} Hz`);
  console.log(`  BSF (ball spin): ${frequencies.bsf.toFixed(2)} Hz`);
  console.log(`  FTF (cage): ${frequencies.ftf.toFixed(2)} Hz\n`);

  // Signal parameters
  const duration = 2; // seconds
  const samplingRate = 1000; // Hz
  const outputDir = path.join(__dirname, "..", "outputs", "chapter08");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate vibration signals
  console.log("Generating vibration signals...");
  console.log(`  Duration: ${duration} seconds`);
  console.log(`  Sampling rate: ${samplingRate} Hz\n`);

  const healthyData = generateHealthyVibration(duration, samplingRate, frequencies);
  const faultyData = generateFaultyVibration(duration, samplingRate, frequencies);
  const imbalanceData = generateImbalancedVibration(duration, samplingRate, frequencies);
  const misalignData = generateMisalignedVibration(duration, samplingRate, frequencies);

  console.log("  ✓ Healthy vibration generated");
  console.log("  ✓ Faulty vibration generated (BPFO defect)");
  console.log("  ✓ Imbalanced vibration generated");
  console.log("  ✓ Misaligned vibration generated\n");

  // Perform FFT analysis
  console.log("Performing FFT analysis...");
  const healthyFFT = performFFT(healthyData.vibration, samplingRate, "Healthy");
  const faultyFFT = performFFT(faultyData.vibration, samplingRate, "Faulty (BPFO)");
  const imbalanceFFT = performFFT(imbalanceData.vibration, samplingRate, "Imbalance");
  const misalignFFT = performFFT(misalignData.vibration, samplingRate, "Misalignment");
  console.log("  ✓ FFT completed for all conditions\n");

  // Create visualizations
  console.log("Creating visualizations...");

  console.log("  1. Time domain comparison (Healthy vs Faulty)...");
  const timeSpec = createTimeComparisonSpec(healthyData, faultyData);
  await saveVisualization(timeSpec, outputDir, "time-domain-comparison");

  console.log("  2. Frequency spectrum with fault markers...");
  const freqSpec = createFrequencyComparisonSpec(healthyFFT, faultyFFT, frequencies, 300);
  await saveVisualization(freqSpec, outputDir, "frequency-spectrum-comparison");

  console.log("  3. Multi-condition comparison...");
  const multiSpec = createMultiConditionSpec(healthyFFT, imbalanceFFT, misalignFFT, faultyFFT, 200);
  await saveVisualization(multiSpec, outputDir, "multi-condition-comparison");

  console.log("\n======================================================================");
  console.log("✓ Chapter 8 completed successfully!\n");
  console.log("Key Insights:");
  console.log("  • Bearing defects create distinct frequency signatures");
  console.log(`  • BPFO at ${frequencies.bpfo.toFixed(1)} Hz indicates outer race fault`);
  console.log("  • Fault severity shown by harmonics and sidebands");
  console.log("  • Imbalance shows strong 1× component");
  console.log("  • Misalignment shows elevated 2× and 3× harmonics");
  console.log("  • FFT enables early fault detection for predictive maintenance");
  console.log("======================================================================");
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
