/**
 * Chapter 7: Fast Fourier Transform (FFT) Analysis
 *
 * This file demonstrates:
 * - Time domain signal generation with multiple frequency components
 * - FFT implementation using fft.js library
 * - Frequency domain analysis and visualization
 * - Power Spectral Density (PSD) calculation
 * - Practical applications for IoT sensor data
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

interface SignalData {
  time: number[];
  signal: number[];
  samplingRate: number;
}

interface FFTResult {
  frequencies: number[];
  magnitudes: number[];
  phases: number[];
  psd: number[];
  psdDB: number[];
}

// ============================================================================
// Signal Generation
// ============================================================================

/**
 * Generate test signal with multiple frequency components
 * Simulates a typical sensor signal with:
 * - Low-frequency drift
 * - Motor rotation frequency and harmonics
 * - Power line interference
 * - High-frequency noise
 */
function generateMultiFrequencySignal(duration: number, samplingRate: number): SignalData {
  const length = Math.floor(duration * samplingRate);
  const time: number[] = [];
  const signal: number[] = [];

  // Frequency components (Hz)
  const f1 = 5; // Low-frequency component (machine vibration)
  const f2 = 25; // Motor rotation (1500 RPM = 25 Hz)
  const f3 = 50; // 2nd harmonic of motor
  const f4 = 60; // Power line interference
  const f5 = 75; // 3rd harmonic
  const f6 = 120; // High-frequency component

  console.log("  Signal components:");
  console.log(`    5 Hz: Machine vibration (amplitude 1.5)`);
  console.log(`    25 Hz: Motor rotation at 1500 RPM (amplitude 2.0)`);
  console.log(`    50 Hz: 2nd harmonic (amplitude 0.8)`);
  console.log(`    60 Hz: Power line noise (amplitude 0.3)`);
  console.log(`    75 Hz: 3rd harmonic (amplitude 0.4)`);
  console.log(`    120 Hz: High-freq component (amplitude 0.2)`);

  for (let i = 0; i < length; i++) {
    const t = i / samplingRate;
    time.push(t);

    // Composite signal with different amplitudes
    const value =
      1.5 * Math.sin(2 * Math.PI * f1 * t) + // Low-frequency
      2.0 * Math.sin(2 * Math.PI * f2 * t) + // Fundamental (motor)
      0.8 * Math.sin(2 * Math.PI * f3 * t) + // 2nd harmonic
      0.3 * Math.sin(2 * Math.PI * f4 * t) + // Power line noise
      0.4 * Math.sin(2 * Math.PI * f5 * t) + // 3rd harmonic
      0.2 * Math.sin(2 * Math.PI * f6 * t) + // High-frequency
      0.1 * (Math.random() - 0.5); // White noise

    signal.push(value);
  }

  return { time, signal, samplingRate };
}

// ============================================================================
// FFT Analysis
// ============================================================================

/**
 * Apply Hann window to reduce spectral leakage
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
 * Perform FFT and calculate frequency domain data
 */
function performFFT(signal: number[], samplingRate: number): FFTResult {
  // Find next power of 2 for FFT size
  const fftSize = Math.pow(2, Math.ceil(Math.log2(signal.length)));

  console.log(`  FFT size: ${fftSize} (zero-padded from ${signal.length})`);

  // Apply window function
  const windowed = applyHannWindow(signal);

  // Prepare FFT input (zero-pad if needed)
  const input = new Array(fftSize).fill(0);
  for (let i = 0; i < windowed.length; i++) {
    input[i] = windowed[i];
  }

  // Create FFT instance
  const fft = new FFT(fftSize);

  // Allocate output array
  const out = fft.createComplexArray();

  // Perform FFT
  fft.realTransform(out, input);
  fft.completeSpectrum(out);

  // Calculate magnitudes, phases, and PSD
  const frequencies: number[] = [];
  const magnitudes: number[] = [];
  const phases: number[] = [];
  const psd: number[] = [];
  const psdDB: number[] = [];

  const nyquist = samplingRate / 2;
  const freqResolution = samplingRate / fftSize;

  console.log(`  Frequency resolution: ${freqResolution.toFixed(3)} Hz`);
  console.log(`  Nyquist frequency: ${nyquist} Hz`);

  // Process only positive frequencies (up to Nyquist)
  for (let i = 0; i < fftSize / 2; i++) {
    const freq = (i * samplingRate) / fftSize;
    const real = out[2 * i];
    const imag = out[2 * i + 1];

    // Magnitude (normalized by FFT size)
    const magnitude = Math.sqrt(real * real + imag * imag) / fftSize;

    // Phase (in degrees)
    const phase = (Math.atan2(imag, real) * 180) / Math.PI;

    // Power Spectral Density
    const power = (real * real + imag * imag) / (fftSize * samplingRate);
    const powerDB = power > 0 ? 10 * Math.log10(power) : -100;

    frequencies.push(freq);
    magnitudes.push(magnitude * 2); // Multiply by 2 for one-sided spectrum
    phases.push(phase);
    psd.push(power);
    psdDB.push(powerDB);
  }

  return { frequencies, magnitudes, phases, psd, psdDB };
}

/**
 * Find peaks in the frequency spectrum
 */
function findPeaks(
  frequencies: number[],
  magnitudes: number[],
  threshold: number = 0.1
): Array<{ frequency: number; magnitude: number }> {
  const peaks: Array<{ frequency: number; magnitude: number }> = [];

  for (let i = 1; i < magnitudes.length - 1; i++) {
    // Check if it's a local maximum above threshold
    if (magnitudes[i] > threshold && magnitudes[i] > magnitudes[i - 1] && magnitudes[i] > magnitudes[i + 1]) {
      peaks.push({
        frequency: frequencies[i],
        magnitude: magnitudes[i],
      });
    }
  }

  // Sort by magnitude (descending)
  peaks.sort((a, b) => b.magnitude - a.magnitude);

  return peaks;
}

// ============================================================================
// Visualization Functions
// ============================================================================

/**
 * Create time domain visualization
 */
function createTimeDomainSpec(signalData: SignalData): any {
  const vizData: any[] = [];

  // Show first 0.5 seconds for clarity
  const maxTime = Math.min(0.5, signalData.time[signalData.time.length - 1]);

  signalData.time.forEach((t, i) => {
    if (t <= maxTime) {
      vizData.push({
        time: t,
        amplitude: signalData.signal[i],
      });
    }
  });

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Time Domain Signal (First 0.5 Seconds)",
    width: 800,
    height: 300,
    data: { values: vizData },
    mark: { type: "line", color: "#2196F3", strokeWidth: 1.5 },
    encoding: {
      x: {
        field: "time",
        type: "quantitative",
        title: "Time (seconds)",
        scale: { domain: [0, maxTime] },
        axis: { grid: true, tickCount: 10 },
      },
      y: {
        field: "amplitude",
        type: "quantitative",
        title: "Signal Amplitude",
        axis: { grid: true, tickCount: 10, gridOpacity: 0.3 },
      },
    },
  };
}

/**
 * Create frequency domain (FFT magnitude) visualization
 */
function createFrequencyDomainSpec(fftResult: FFTResult, maxFreq: number = 150): any {
  const vizData: any[] = [];

  fftResult.frequencies.forEach((freq, i) => {
    if (freq <= maxFreq && freq > 0) {
      // Skip DC component
      vizData.push({
        frequency: freq,
        magnitude: fftResult.magnitudes[i],
      });
    }
  });

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Frequency Domain (FFT Magnitude Spectrum)",
    width: 800,
    height: 400,
    data: { values: vizData },
    mark: { type: "line", color: "#00C853", strokeWidth: 2, point: false },
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
        title: "Magnitude",
        axis: { grid: true, tickCount: 10, gridOpacity: 0.3 },
      },
    },
  };
}

/**
 * Create Power Spectral Density visualization
 */
function createPSDSpec(fftResult: FFTResult, maxFreq: number = 150): any {
  const vizData: any[] = [];

  fftResult.frequencies.forEach((freq, i) => {
    if (freq <= maxFreq && freq > 0) {
      vizData.push({
        frequency: freq,
        psd: fftResult.psdDB[i],
      });
    }
  });

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Power Spectral Density (PSD)",
    width: 800,
    height: 400,
    data: { values: vizData },
    mark: { type: "line", color: "#FF6F00", strokeWidth: 2 },
    encoding: {
      x: {
        field: "frequency",
        type: "quantitative",
        title: "Frequency (Hz)",
        scale: { domain: [0, maxFreq] },
        axis: { grid: true, tickCount: 15 },
      },
      y: {
        field: "psd",
        type: "quantitative",
        title: "Power Spectral Density (dB/Hz)",
        axis: { grid: true, tickCount: 10, gridOpacity: 0.3 },
      },
    },
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Save Vega-Lite spec as SVG and HTML
 */
async function saveVisualization(spec: any, outputDir: string, filename: string): Promise<void> {
  // Compile Vega-Lite to Vega
  const vgSpec = vegaLite.compile(spec).spec;

  // Create Vega view
  const view = new vega.View(vega.parse(vgSpec), { renderer: "none" });

  // Generate SVG
  const svg = await view.toSVG();

  // Save SVG
  const svgPath = path.join(outputDir, `${filename}.svg`);
  fs.writeFileSync(svgPath, svg);
  console.log(`✓ SVG saved to: ${svgPath}`);

  // Create HTML wrapper
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
  console.log("Chapter 7: Fast Fourier Transform (FFT) Analysis");
  console.log("======================================================================\n");

  // Configuration
  const duration = 2; // seconds
  const samplingRate = 400; // Hz
  const outputDir = path.join(__dirname, "..", "outputs", "chapter07");

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate test signal
  console.log("Generating multi-frequency test signal...");
  console.log(`  Duration: ${duration} seconds`);
  console.log(`  Sampling rate: ${samplingRate} Hz`);
  const signalData = generateMultiFrequencySignal(duration, samplingRate);

  // Perform FFT
  console.log("\nPerforming FFT analysis...");
  const fftResult = performFFT(signalData.signal, samplingRate);

  // Find peaks
  console.log("\nDetected frequency peaks:");
  const peaks = findPeaks(fftResult.frequencies, fftResult.magnitudes, 0.15);
  peaks.slice(0, 10).forEach((peak, i) => {
    console.log(`  ${i + 1}. ${peak.frequency.toFixed(2)} Hz (magnitude: ${peak.magnitude.toFixed(3)})`);
  });

  // Create visualizations
  console.log("\nCreating visualizations...");

  console.log("  1. Time domain signal...");
  const timeDomainSpec = createTimeDomainSpec(signalData);
  await saveVisualization(timeDomainSpec, outputDir, "time-domain");

  console.log("  2. Frequency domain (FFT magnitude)...");
  const frequencyDomainSpec = createFrequencyDomainSpec(fftResult, 150);
  await saveVisualization(frequencyDomainSpec, outputDir, "frequency-domain");

  console.log("  3. Power Spectral Density (PSD)...");
  const psdSpec = createPSDSpec(fftResult, 150);
  await saveVisualization(psdSpec, outputDir, "power-spectral-density");

  console.log("\n======================================================================");
  console.log("✓ Chapter 7 completed successfully!\n");
  console.log("Key Insights:");
  console.log("  • FFT reveals frequency components hidden in time domain");
  console.log("  • Motor fundamental (25 Hz) and harmonics clearly visible");
  console.log("  • Power line interference (60 Hz) can be identified");
  console.log("  • PSD shows relative power distribution across frequencies");
  console.log("  • Frequency resolution depends on sampling rate and FFT size");
  console.log("======================================================================");
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
