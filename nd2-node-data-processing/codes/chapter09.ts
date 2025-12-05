/**
 * Chapter 9: Real-Time Data Processing and Streaming
 *
 * This file demonstrates:
 * - Simulated sensor data streaming
 * - Circular buffer implementation
 * - Sliding window processing
 * - Real-time IIR filtering
 * - Continuous FFT analysis with overlapping windows
 * - Memory-efficient buffer management
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import * as vega from "vega";
import * as vegaLite from "vega-lite";
import FFT from "fft.js";
import { createCanvas } from "canvas";

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Type Definitions
// ============================================================================

interface FilterCoefficients {
  b: number[];
  a: number[];
}

interface FilterState {
  x: number[];
  y: number[];
}

interface StreamingSample {
  index: number;
  time: number;
  raw: number;
  filtered: number;
}

interface FFTSnapshot {
  windowIndex: number;
  centerTime: number;
  frequencies: number[];
  magnitudes: number[];
}

// ============================================================================
// Circular Buffer Implementation
// ============================================================================

class CircularBuffer {
  private buffer: number[];
  private writeIndex: number = 0;
  private count: number = 0;

  constructor(private capacity: number) {
    this.buffer = new Array(capacity).fill(0);
  }

  push(value: number): void {
    this.buffer[this.writeIndex] = value;
    this.writeIndex = (this.writeIndex + 1) % this.capacity;
    if (this.count < this.capacity) this.count++;
  }

  getWindow(size: number): number[] | null {
    if (size > this.count) return null;

    const window = new Array(size);
    let readIndex = (this.writeIndex - size + this.capacity) % this.capacity;

    for (let i = 0; i < size; i++) {
      window[i] = this.buffer[readIndex];
      readIndex = (readIndex + 1) % this.capacity;
    }

    return window;
  }

  isFull(): boolean {
    return this.count === this.capacity;
  }

  getCount(): number {
    return this.count;
  }
}

// ============================================================================
// Real-Time Filter
// ============================================================================

/**
 * Design 2nd order Butterworth low-pass filter
 */
function designButterworthLPF(cutoffFreq: number, samplingRate: number): FilterCoefficients {
  const fc = cutoffFreq / samplingRate;
  const wc = Math.tan(Math.PI * fc);
  const wc2 = wc * wc;
  const sqrt2 = Math.sqrt(2);
  const k = 1 + sqrt2 * wc + wc2;

  return {
    b: [wc2 / k, (2 * wc2) / k, wc2 / k],
    a: [1, (2 * wc2 - 2) / k, (1 - sqrt2 * wc + wc2) / k],
  };
}

/**
 * Initialize filter state
 */
function initializeFilterState(coeffs: FilterCoefficients): FilterState {
  return {
    x: new Array(coeffs.b.length).fill(0),
    y: new Array(coeffs.a.length).fill(0),
  };
}

/**
 * Process single sample through IIR filter (real-time)
 */
function filterSample(input: number, state: FilterState, coeffs: FilterCoefficients): number {
  const { b, a } = coeffs;

  // Shift input history
  for (let i = state.x.length - 1; i > 0; i--) {
    state.x[i] = state.x[i - 1];
  }
  state.x[0] = input;

  // Calculate output
  let output = 0;
  for (let i = 0; i < b.length; i++) {
    output += b[i] * state.x[i];
  }
  for (let i = 1; i < a.length; i++) {
    output -= a[i] * state.y[i];
  }

  // Shift output history
  for (let i = state.y.length - 1; i > 0; i--) {
    state.y[i] = state.y[i - 1];
  }
  state.y[0] = output;

  return output;
}

// ============================================================================
// Sensor Simulator
// ============================================================================

/**
 * Simulate sensor data stream with TIME-VARYING frequency components
 * for better spectrogram visualization
 */
class SensorSimulator {
  private sampleIndex: number = 0;
  private samplingRate: number;

  constructor(samplingRate: number) {
    this.samplingRate = samplingRate;
  }

  generateSample(): number {
    const t = this.sampleIndex / this.samplingRate;

    // Create interesting time-frequency features like the example:
    // 1. Multiple frequency chirps (diagonal lines)
    // 2. Transient bursts (vertical lines)
    // 3. Background activity

    let signal = 0;

    // Chirp 1: 5 Hz -> 30 Hz (main diagonal sweep)
    const chirp1_f0 = 5;
    const chirp1_f1 = 30;
    const chirp1_rate = (chirp1_f1 - chirp1_f0) / 5.0; // 5 second duration
    const chirp1_phase = 2 * Math.PI * (chirp1_f0 * t + 0.5 * chirp1_rate * t * t);
    signal += 3.0 * Math.sin(chirp1_phase);

    // Chirp 2: 10 Hz -> 35 Hz (secondary sweep)
    const chirp2_f0 = 10;
    const chirp2_f1 = 35;
    const chirp2_rate = (chirp2_f1 - chirp2_f0) / 5.0;
    const chirp2_phase = 2 * Math.PI * (chirp2_f0 * t + 0.5 * chirp2_rate * t * t);
    signal += 1.5 * Math.sin(chirp2_phase);

    // Transient bursts at specific times (vertical features)
    const burstTimes = [0.8, 1.6, 2.4, 3.2, 4.0];
    const burstDuration = 0.15;

    for (const burstTime of burstTimes) {
      const dt = t - burstTime;
      if (dt >= 0 && dt < burstDuration) {
        // Broadband burst (multiple frequencies)
        const envelope = Math.exp(-30 * dt);
        signal += 2.0 * envelope * Math.sin(2 * Math.PI * 20 * dt);
        signal += 1.5 * envelope * Math.sin(2 * Math.PI * 40 * dt);
        signal += 1.0 * envelope * Math.sin(2 * Math.PI * 60 * dt);
      }
    }

    // Add broadband noise to fill the background (multi-frequency noise)
    let noise = 0;
    // Generate noise across multiple frequency bands for realistic spectrogram texture
    for (let f = 5; f <= 50; f += 5) {
      noise += 0.15 * (Math.random() - 0.5) * Math.sin(2 * Math.PI * f * t + Math.random() * 2 * Math.PI);
    }

    // Add white noise component
    noise += 0.3 * (Math.random() - 0.5);

    const value = signal + noise;

    this.sampleIndex++;
    return value;
  }
  getTime(): number {
    return this.sampleIndex / this.samplingRate;
  }

  getSampleIndex(): number {
    return this.sampleIndex;
  }
}

// ============================================================================
// Real-Time Processor
// ============================================================================

class RealtimeProcessor {
  private rawBuffer: CircularBuffer;
  private filteredBuffer: CircularBuffer;
  private filterState: FilterState;
  private filterCoeffs: FilterCoefficients;
  private windowSize: number;
  private hopSize: number;
  private samplesProcessed: number = 0;
  private fftSnapshots: FFTSnapshot[] = [];

  constructor(bufferSize: number, filterCoeffs: FilterCoefficients, windowSize: number, hopSize: number) {
    this.rawBuffer = new CircularBuffer(bufferSize);
    this.filteredBuffer = new CircularBuffer(bufferSize);
    this.filterCoeffs = filterCoeffs;
    this.filterState = initializeFilterState(filterCoeffs);
    this.windowSize = windowSize;
    this.hopSize = hopSize;
  }

  processSample(raw: number, time: number): { filtered: number; fftReady: boolean } {
    // Apply real-time filter
    const filtered = filterSample(raw, this.filterState, this.filterCoeffs);

    // Store in both buffers
    this.rawBuffer.push(raw);
    this.filteredBuffer.push(filtered);
    this.samplesProcessed++;

    // Check if it's time for FFT (every hop samples)
    const fftReady = this.samplesProcessed % this.hopSize === 0 && this.rawBuffer.isFull();

    if (fftReady) {
      this.performFFT(time);
    }

    return { filtered, fftReady };
  }

  private performFFT(centerTime: number): void {
    // Use raw signal for FFT (not filtered) for better spectrogram
    const window = this.rawBuffer.getWindow(this.windowSize);
    if (!window) return;

    // Apply Hann window
    const windowed = window.map((val, i) => val * 0.5 * (1 - Math.cos((2 * Math.PI * i) / (this.windowSize - 1))));

    // Perform FFT
    const fft = new FFT(this.windowSize);
    const out = fft.createComplexArray();
    fft.realTransform(out, windowed);
    fft.completeSpectrum(out);

    // Calculate magnitudes
    const frequencies: number[] = [];
    const magnitudes: number[] = [];

    for (let i = 0; i < this.windowSize / 2; i++) {
      const freq = (i * 200) / this.windowSize; // Assuming 200 Hz sampling
      const real = out[2 * i];
      const imag = out[2 * i + 1];
      const magnitude = (Math.sqrt(real * real + imag * imag) / this.windowSize) * 2;

      frequencies.push(freq);
      magnitudes.push(magnitude);
    }

    this.fftSnapshots.push({
      windowIndex: Math.floor(this.samplesProcessed / this.hopSize),
      centerTime,
      frequencies,
      magnitudes,
    });

    // Debug: Print first FFT snapshot details
    if (this.fftSnapshots.length === 1) {
      console.log("\n  [DEBUG] First FFT Snapshot:");
      const targetFreqs = [5, 15, 25, 35, 45];
      targetFreqs.forEach((targetFreq) => {
        const idx = frequencies.findIndex((f) => Math.abs(f - targetFreq) < 1);
        if (idx >= 0) {
          console.log(`    ${targetFreq} Hz: magnitude = ${magnitudes[idx].toFixed(6)}`);
        }
      });
    }
  }

  getFFTSnapshots(): FFTSnapshot[] {
    return this.fftSnapshots;
  }
}

// ============================================================================
// Simulation
// ============================================================================

/**
 * Run streaming simulation
 */
function runStreamingSimulation(
  duration: number,
  samplingRate: number
): { samples: StreamingSample[]; fftSnapshots: FFTSnapshot[] } {
  const totalSamples = Math.floor(duration * samplingRate);
  const samples: StreamingSample[] = [];

  // Setup
  const sensor = new SensorSimulator(samplingRate);
  const filterCoeffs = designButterworthLPF(30, samplingRate); // 30 Hz cutoff
  const windowSize = 256;
  const hopSize = 16; // 93.75% overlap for very smooth spectrogram
  const bufferSize = 512; // Smaller than total samples to ensure filling

  const processor = new RealtimeProcessor(bufferSize, filterCoeffs, windowSize, hopSize);

  console.log("  Real-time processing configuration:");
  console.log(`    Buffer size: ${bufferSize} samples`);
  console.log(`    Window size: ${windowSize} samples (${((windowSize / samplingRate) * 1000).toFixed(0)} ms)`);
  console.log(`    Hop size: ${hopSize} samples (${((hopSize / samplingRate) * 1000).toFixed(0)} ms)`);
  console.log(`    Overlap: ${(100 * (1 - hopSize / windowSize)).toFixed(1)}%`);
  console.log(`    Expected FFT snapshots: ~${Math.floor((totalSamples - windowSize) / hopSize)}`);
  console.log(`    Filter: Butterworth LPF, fc=${filterCoeffs.b.length - 1}th order, 30 Hz cutoff\n`);

  // Process stream
  for (let i = 0; i < totalSamples; i++) {
    const raw = sensor.generateSample();
    const time = sensor.getTime();
    const result = processor.processSample(raw, time);

    samples.push({
      index: i,
      time: time,
      raw: raw,
      filtered: result.filtered,
    });
  }

  console.log(`  ✓ Processed ${totalSamples} samples`);
  console.log(`  ✓ Generated ${processor.getFFTSnapshots().length} FFT snapshots\n`);

  return {
    samples,
    fftSnapshots: processor.getFFTSnapshots(),
  };
}

// ============================================================================
// Visualization Functions
// ============================================================================

/**
 * Create streaming time-series visualization
 */
function createStreamingTimeSeriesSpec(samples: StreamingSample[], maxTime: number = 2): any {
  const vizData: any[] = [];

  samples.forEach((s) => {
    if (s.time <= maxTime) {
      vizData.push({ time: s.time, value: s.raw, signal: "Raw" });
      vizData.push({ time: s.time, value: s.filtered, signal: "Filtered" });
    }
  });

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Real-Time Streaming Data (First 2 Seconds)",
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
        field: "value",
        type: "quantitative",
        title: "Signal Amplitude",
        axis: { grid: true, gridOpacity: 0.3 },
      },
      color: {
        field: "signal",
        type: "nominal",
        title: "Signal Type",
        scale: {
          domain: ["Raw", "Filtered"],
          range: ["#9E9E9E", "#2196F3"],
        },
        legend: { orient: "top-left" },
      },
      opacity: {
        field: "signal",
        type: "nominal",
        scale: {
          domain: ["Raw", "Filtered"],
          range: [0.4, 1],
        },
        legend: null,
      },
    },
  };
}

/**
 * Create sliding window FFT evolution visualization
 */
function createSlidingWindowFFTSpec(fftSnapshots: FFTSnapshot[], maxFreq: number = 80): any {
  // Show first few FFT snapshots
  const snapshotsToShow = Math.min(5, fftSnapshots.length);
  const vizData: any[] = [];

  for (let i = 0; i < snapshotsToShow; i++) {
    const snapshot = fftSnapshots[i];
    snapshot.frequencies.forEach((freq, j) => {
      if (freq > 0 && freq <= maxFreq) {
        vizData.push({
          frequency: freq,
          magnitude: snapshot.magnitudes[j],
          window: `Window ${i + 1} (t=${snapshot.centerTime.toFixed(2)}s)`,
        });
      }
    });
  }

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Sliding Window FFT Evolution (First 5 Windows)",
    width: 800,
    height: 450,
    data: { values: vizData },
    mark: { type: "line", strokeWidth: 2 },
    encoding: {
      x: {
        field: "frequency",
        type: "quantitative",
        title: "Frequency (Hz)",
        scale: { domain: [0, maxFreq] },
        axis: { grid: true, tickCount: 16 },
      },
      y: {
        field: "magnitude",
        type: "quantitative",
        title: "Magnitude",
        axis: { grid: true, gridOpacity: 0.3 },
      },
      color: {
        field: "window",
        type: "nominal",
        title: "FFT Window",
        scale: {
          scheme: "category10",
        },
        legend: { orient: "top-left" },
      },
    },
  };
}

// ============================================================================
// Canvas-based Spectrogram Rendering
// ============================================================================

/**
 * Generate turbo colormap value
 */
function turboColormap(t: number): [number, number, number] {
  // Turbo colormap approximation (0-1 input, RGB 0-255 output)
  t = Math.max(0, Math.min(1, t));
  const r = Math.max(
    0,
    Math.min(255, Math.round(34.61 + t * (1172.33 - t * (10793.56 - t * (33300.12 - t * (38394.49 - t * 14825.05))))))
  );
  const g = Math.max(
    0,
    Math.min(255, Math.round(23.31 + t * (557.33 + t * (1225.33 - t * (3574.96 - t * (1073.77 + t * 707.56))))))
  );
  const b = Math.max(
    0,
    Math.min(255, Math.round(27.2 + t * (3211.1 - t * (15327.97 - t * (27814.0 - t * (22569.18 - t * 6838.66))))))
  );
  return [r, g, b];
}

async function saveSpectrogramImage(fftSnapshots: FFTSnapshot[], maxFreq: number, outputDir: string): Promise<void> {
  // Image dimensions
  const width = 1000;
  const height = 500;

  // Create canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Fill background
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);

  // Filter frequencies
  const freqs = fftSnapshots[0].frequencies.filter((f) => f > 0 && f <= maxFreq);
  const numFreqs = freqs.length;
  const numTimes = fftSnapshots.length;

  // Find dB range
  let minDB = Infinity;
  let maxDB = -Infinity;

  fftSnapshots.forEach((snapshot) => {
    snapshot.frequencies.forEach((freq, j) => {
      if (freq > 0 && freq <= maxFreq) {
        const mag = snapshot.magnitudes[j];
        if (mag > 0) {
          const db = 20 * Math.log10(mag);
          minDB = Math.min(minDB, db);
          maxDB = Math.max(maxDB, db);
        }
      }
    });
  });

  const dbRange = 40;
  const clippedMinDB = Math.max(minDB, maxDB - dbRange);

  // Draw spectrogram
  const pixelWidth = width / numTimes;
  const pixelHeight = height / numFreqs;

  fftSnapshots.forEach((snapshot, timeIdx) => {
    snapshot.frequencies.forEach((freq, freqIdx) => {
      if (freq > 0 && freq <= maxFreq) {
        const mag = snapshot.magnitudes[freqIdx];
        const db = mag > 0 ? 20 * Math.log10(mag) : clippedMinDB;
        const clippedDB = Math.max(clippedMinDB, Math.min(maxDB, db));

        // Normalize to 0-1
        const normalized = (clippedDB - clippedMinDB) / (maxDB - clippedMinDB);

        // Get color
        const [r, g, b] = turboColormap(normalized);

        // Draw pixel (flip y-axis so low freq at bottom)
        const x = timeIdx * pixelWidth;
        const y = height - (freqIdx / numFreqs) * height - pixelHeight;

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, y, Math.ceil(pixelWidth) + 1, Math.ceil(pixelHeight) + 1);
      }
    });
  });

  // Save as PNG
  const pngPath = path.join(outputDir, "spectrogram.png");
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(pngPath, buffer);
  console.log(`✓ PNG saved to: ${pngPath}`);

  // Create SVG wrapper with embedded PNG and axis labels
  const base64Image = buffer.toString("base64");
  const margin = { top: 40, right: 60, bottom: 60, left: 70 };
  const svgWidth = width + margin.left + margin.right;
  const svgHeight = height + margin.top + margin.bottom;

  // Calculate duration
  const duration = fftSnapshots[fftSnapshots.length - 1].centerTime;

  // Generate axis ticks
  let xTicks = "";
  for (let i = 0; i <= 10; i++) {
    const x = margin.left + (i / 10) * width;
    const value = ((i / 10) * duration).toFixed(1);
    xTicks += `
    <line x1="${x}" y1="${margin.top + height}" x2="${x}" y2="${
      margin.top + height + 5
    }" stroke="black" stroke-width="1"/>
    <text x="${x}" y="${
      margin.top + height + 20
    }" text-anchor="middle" font-family="Arial" font-size="12" fill="black">${value}</text>`;
  }

  let yTicks = "";
  for (let i = 0; i <= 5; i++) {
    const y = margin.top + height - (i / 5) * height;
    const value = ((i / 5) * maxFreq).toFixed(0);
    yTicks += `
    <line x1="${margin.left - 5}" y1="${y}" x2="${margin.left}" y2="${y}" stroke="black" stroke-width="1"/>
    <text x="${margin.left - 10}" y="${
      y + 4
    }" text-anchor="end" font-family="Arial" font-size="12" fill="black">${value}</text>`;
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <rect width="${svgWidth}" height="${svgHeight}" fill="white"/>
  
  <!-- Title -->
  <text x="${
    svgWidth / 2
  }" y="25" text-anchor="middle" font-family="Arial" font-size="18" font-weight="bold">Spectrogram (Time-Frequency Representation)</text>
  
  <!-- Image -->
  <image x="${margin.left}" y="${
    margin.top
  }" width="${width}" height="${height}" xlink:href="data:image/png;base64,${base64Image}"/>
  
  <!-- Axes -->
  <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${
    margin.top + height
  }" stroke="black" stroke-width="2"/>
  <line x1="${margin.left}" y1="${margin.top + height}" x2="${margin.left + width}" y2="${
    margin.top + height
  }" stroke="black" stroke-width="2"/>
  
  <!-- X-axis ticks and labels -->
  ${xTicks}
  <text x="${svgWidth / 2}" y="${
    svgHeight - 10
  }" text-anchor="middle" font-family="Arial" font-size="14" font-weight="bold" fill="black">Time (seconds)</text>
  
  <!-- Y-axis ticks and labels -->
  ${yTicks}
  <text x="20" y="${
    svgHeight / 2
  }" text-anchor="middle" font-family="Arial" font-size="14" font-weight="bold" fill="black" transform="rotate(-90 20 ${
    svgHeight / 2
  })">Frequency (Hz)</text>
</svg>`;

  const svgPath = path.join(outputDir, "spectrogram.svg");
  fs.writeFileSync(svgPath, svg);
  console.log(`✓ SVG saved to: ${svgPath}`);
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
  console.log("Chapter 9: Real-Time Data Processing and Streaming");
  console.log("======================================================================\n");

  // Simulation parameters
  const duration = 5; // seconds (reduced for denser spectrogram)
  const samplingRate = 200; // Hz
  const outputDir = path.join(__dirname, "..", "outputs", "chapter09");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log("Simulating sensor data stream...");
  console.log(`  Duration: ${duration} seconds`);
  console.log(`  Sampling rate: ${samplingRate} Hz`);
  console.log(`  Total samples: ${duration * samplingRate}\n`);

  // Run simulation
  const { samples, fftSnapshots } = runStreamingSimulation(duration, samplingRate);

  // Create visualizations
  console.log("Creating visualizations...");

  console.log("  1. Streaming time-series (raw vs filtered)...");
  const timeSpec = createStreamingTimeSeriesSpec(samples, 2);
  await saveVisualization(timeSpec, outputDir, "streaming-time-series");

  console.log("  2. Sliding window FFT evolution...");
  const fftSpec = createSlidingWindowFFTSpec(fftSnapshots, 80);
  await saveVisualization(fftSpec, outputDir, "sliding-window-fft");

  console.log("  3. Spectrogram (time-frequency)...");
  await saveSpectrogramImage(fftSnapshots, 50, outputDir);

  // Also create HTML wrapper with SVG (includes axis labels)
  const spectrogramHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Spectrogram (Time-Frequency Representation)</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1400px; margin: 0 auto; background: white; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; text-align: center; }
    .visualization { text-align: center; margin: 20px 0; }
    img { max-width: 100%; height: auto; border: 1px solid #ddd; }
    .info { margin-top: 20px; padding: 15px; background: #f8f9fa; border-left: 4px solid #007bff; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Spectrogram (Time-Frequency Representation)</h1>
    <div class="visualization">
      <img src="spectrogram.svg" alt="Spectrogram with axis labels">
    </div>
    <div class="info">
      <p><strong>Visualization Details:</strong></p>
      <ul>
        <li><strong>X-axis:</strong> Time (0.0 - 5.0 seconds) with tick marks every 0.5 seconds</li>
        <li><strong>Y-axis:</strong> Frequency (0 - 50 Hz) with tick marks every 10 Hz</li>
        <li><strong>Color:</strong> Magnitude (dB) - Turbo colormap (blue=low, red=high)</li>
        <li><strong>Features:</strong> Diagonal chirp sweeps (5→30 Hz & 10→35 Hz), Vertical transient bursts (at 0.8s, 1.6s, 2.4s, 3.2s, 4.0s), Background noise texture</li>
        <li><strong>Processing:</strong> 256-sample FFT windows, 93.75% overlap (16-sample hop), 31 time snapshots</li>
      </ul>
    </div>
  </div>
</body>
</html>`;
  fs.writeFileSync(path.join(outputDir, "spectrogram.html"), spectrogramHtml);
  console.log(`✓ HTML saved to: ${path.join(outputDir, "spectrogram.html")}`);

  console.log("\n======================================================================");
  console.log("✓ Chapter 9 completed successfully!\n");
  console.log("Key Insights:");
  console.log("  • Real-time filtering applied sample-by-sample (minimal latency)");
  console.log("  • Circular buffer enables efficient memory management");
  console.log("  • Sliding window FFT provides continuous frequency analysis");
  console.log("  • 75% overlap ensures smooth spectral evolution");
  console.log("  • Spectrogram visualizes time-varying frequency content");
  console.log("  • Processing is memory-efficient and suitable for embedded systems");
  console.log("======================================================================");
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
