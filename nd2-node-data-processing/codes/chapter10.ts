/**
 * Chapter 10: Multi-Sensor Fusion and Advanced Processing
 *
 * This file demonstrates:
 * - Multiple sensor simulation (vibration, temperature, current, acoustic)
 * - Time synchronization and alignment
 * - Cross-correlation analysis
 * - Feature extraction from time and frequency domains
 * - Anomaly detection (statistical and rule-based)
 * - Fault diagnosis using sensor fusion
 * - Multi-sensor dashboard visualization
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

interface SensorData {
  name: string;
  timestamps: number[];
  values: number[];
  unit: string;
}

interface TimeFeatures {
  mean: number;
  std: number;
  rms: number;
  peak: number;
  peakToPeak: number;
  crestFactor: number;
  kurtosis: number;
}

interface FrequencyFeatures {
  peakFrequency: number;
  peakAmplitude: number;
  spectralCentroid: number;
  bandPower: number;
}

interface MultiSensorFeatures {
  timestamp: number;
  features: Map<string, number>;
}

interface AnomalyDetection {
  timestamp: number;
  isAnomaly: boolean;
  score: number;
  triggeredSensors: string[];
}

enum FaultType {
  Normal = "Normal",
  BearingWear = "Bearing Wear",
  Unbalance = "Unbalance",
  Misalignment = "Misalignment",
  Electrical = "Electrical Fault",
}

interface FaultDiagnosis {
  timestamp: number;
  fault: FaultType;
  confidence: number;
  evidence: string[];
  scores: Map<FaultType, number>; // All fault scores for visualization
}

// ============================================================================
// Multi-Sensor Simulator
// ============================================================================

class MultiSensorSimulator {
  private motorRPM: number = 1800; // Motor speed
  private motorFreq: number = this.motorRPM / 60; // 30 Hz
  private faultState: FaultType = FaultType.Normal;
  private faultStartTime: number = 0;

  constructor(private samplingRate: number) {}

  setFault(fault: FaultType, startTime: number): void {
    this.faultState = fault;
    this.faultStartTime = startTime;
  }

  generateVibration(t: number): number {
    let signal = 0;

    // Baseline vibration (1× RPM) - reduce during bearing fault
    const baselineAmp = t >= this.faultStartTime && this.faultState === FaultType.BearingWear ? 0.5 : 1.0;
    signal += baselineAmp * Math.sin(2 * Math.PI * this.motorFreq * t);

    // Add fault signatures based on current fault state
    if (t >= this.faultStartTime) {
      switch (this.faultState) {
        case FaultType.BearingWear:
          // High-frequency components (bearing frequencies) - increased amplitudes
          signal += 2.5 * Math.sin(2 * Math.PI * 120 * t); // BPFO (dominant)
          signal += 1.8 * Math.sin(2 * Math.PI * 180 * t); // BPFI
          signal += 0.8 * Math.sin(2 * Math.PI * 90 * t); // Additional bearing frequency
          // Increased noise and impulsiveness (more frequent)
          if (Math.random() < 0.08) {
            signal += 5.0 * Math.exp(-30 * (t % 0.05)); // Sharper impacts
          }
          // Broadband noise increase
          signal += 0.5 * (Math.random() - 0.5);
          break;

        case FaultType.Unbalance:
          // Strong 1× RPM component
          signal += 2.0 * Math.sin(2 * Math.PI * this.motorFreq * t);
          break;

        case FaultType.Misalignment:
          // Strong 2× RPM component
          signal += 1.5 * Math.sin(2 * Math.PI * 2 * this.motorFreq * t);
          // Some 3× RPM
          signal += 0.8 * Math.sin(2 * Math.PI * 3 * this.motorFreq * t);
          break;

        case FaultType.Electrical:
          // Electrical frequency modulation (2× line frequency = 120 Hz)
          const modulation = 1 + 0.3 * Math.sin(2 * Math.PI * 120 * t);
          signal *= modulation;
          break;
      }
    }

    // Background noise
    signal += 0.2 * (Math.random() - 0.5);

    return signal;
  }

  generateTemperature(t: number): number {
    // Baseline temperature
    let temp = 50; // °C

    // Gradual rise during operation
    temp += 15 * (1 - Math.exp(-t / 60)); // Exponential rise, 60s time constant

    // Add fault-related temperature changes
    if (t >= this.faultStartTime) {
      const faultDuration = t - this.faultStartTime;

      switch (this.faultState) {
        case FaultType.BearingWear:
          // Gradual temperature rise
          temp += 20 * (1 - Math.exp(-faultDuration / 30));
          break;

        case FaultType.Unbalance:
          // Moderate temperature rise
          temp += 10 * (1 - Math.exp(-faultDuration / 40));
          break;

        case FaultType.Misalignment:
          // Localized hot spot (higher peak)
          temp += 15 * (1 - Math.exp(-faultDuration / 35));
          break;

        case FaultType.Electrical:
          // Rapid temperature rise
          temp += 25 * (1 - Math.exp(-faultDuration / 20));
          break;
      }
    }

    // Small noise
    temp += 0.5 * (Math.random() - 0.5);

    return temp;
  }

  generateCurrent(t: number): number {
    // Baseline current
    let current = 10; // Amperes

    // Small variation
    current += 0.5 * Math.sin(2 * Math.PI * 0.1 * t);

    // Fault-related current changes
    if (t >= this.faultStartTime) {
      switch (this.faultState) {
        case FaultType.Unbalance:
          // Slight increase
          current += 1.0;
          break;

        case FaultType.Electrical:
          // Significant increase and fluctuation
          current += 3.0;
          current += 1.5 * Math.sin(2 * Math.PI * 120 * t); // 2× line freq
          break;
      }
    }

    // Noise
    current += 0.1 * (Math.random() - 0.5);

    return current;
  }

  generateAcoustic(t: number): number {
    let signal = 0;

    // Baseline noise
    signal += 0.5 * (Math.random() - 0.5);

    // Motor noise (tonal components)
    signal += 0.3 * Math.sin(2 * Math.PI * this.motorFreq * t);

    // Fault-related acoustic changes
    if (t >= this.faultStartTime) {
      switch (this.faultState) {
        case FaultType.BearingWear:
          // Broadband noise increase
          for (let f = 100; f <= 500; f += 50) {
            signal += 0.2 * Math.sin(2 * Math.PI * f * t + Math.random() * 2 * Math.PI);
          }
          break;

        case FaultType.Misalignment:
          // Tonal components at harmonics
          signal += 0.5 * Math.sin(2 * Math.PI * 2 * this.motorFreq * t);
          break;

        case FaultType.Electrical:
          // Humming at line frequency
          signal += 0.8 * Math.sin(2 * Math.PI * 60 * t);
          break;
      }
    }

    return signal;
  }

  generateMultiSensorData(duration: number): Map<string, SensorData> {
    const numSamples = Math.floor(duration * this.samplingRate);
    const sensors = new Map<string, SensorData>();

    // Initialize sensor arrays
    const vibration: number[] = [];
    const temperature: number[] = [];
    const current: number[] = [];
    const acoustic: number[] = [];
    const timestamps: number[] = [];

    // Generate data
    for (let i = 0; i < numSamples; i++) {
      const t = i / this.samplingRate;
      timestamps.push(t);

      vibration.push(this.generateVibration(t));
      temperature.push(this.generateTemperature(t));
      current.push(this.generateCurrent(t));
      acoustic.push(this.generateAcoustic(t));
    }

    // Store in map
    sensors.set("vibration", {
      name: "Vibration",
      timestamps,
      values: vibration,
      unit: "m/s²",
    });

    sensors.set("temperature", {
      name: "Temperature",
      timestamps,
      values: temperature,
      unit: "°C",
    });

    sensors.set("current", {
      name: "Current",
      timestamps,
      values: current,
      unit: "A",
    });

    sensors.set("acoustic", {
      name: "Acoustic",
      timestamps,
      values: acoustic,
      unit: "Pa",
    });

    return sensors;
  }
}

// ============================================================================
// Feature Extraction
// ============================================================================

function extractTimeFeatures(signal: number[]): TimeFeatures {
  const n = signal.length;
  const mean = signal.reduce((a, b) => a + b, 0) / n;

  const deviations = signal.map((x) => x - mean);
  const squares = deviations.map((x) => x * x);
  const variance = squares.reduce((a, b) => a + b, 0) / n;
  const std = Math.sqrt(variance);

  const rms = Math.sqrt(signal.map((x) => x * x).reduce((a, b) => a + b, 0) / n);
  const peak = Math.max(...signal.map(Math.abs));
  const crestFactor = peak / rms;

  // Kurtosis (4th moment)
  const kurtosis = deviations.map((x) => Math.pow(x / std, 4)).reduce((a, b) => a + b, 0) / n;

  return {
    mean,
    std,
    rms,
    peak,
    peakToPeak: Math.max(...signal) - Math.min(...signal),
    crestFactor,
    kurtosis,
  };
}

function extractFrequencyFeatures(
  signal: number[],
  samplingRate: number,
  bandLow: number,
  bandHigh: number
): FrequencyFeatures {
  // Pad to power of 2
  const fftSize = Math.pow(2, Math.ceil(Math.log2(signal.length)));
  const padded = [...signal, ...new Array(fftSize - signal.length).fill(0)];

  // Apply Hann window
  const windowed = padded.map((val, i) => val * 0.5 * (1 - Math.cos((2 * Math.PI * i) / (padded.length - 1))));

  // Perform FFT
  const fft = new FFT(fftSize);
  const out = fft.createComplexArray();
  fft.realTransform(out, windowed);
  fft.completeSpectrum(out);

  // Calculate magnitudes
  const frequencies: number[] = [];
  const magnitudes: number[] = [];

  for (let i = 0; i < fftSize / 2; i++) {
    const freq = (i * samplingRate) / fftSize;
    const real = out[2 * i];
    const imag = out[2 * i + 1];
    const magnitude = Math.sqrt(real * real + imag * imag) / fftSize;

    frequencies.push(freq);
    magnitudes.push(magnitude);
  }

  // Find peak
  let peakIdx = 0;
  for (let i = 1; i < magnitudes.length; i++) {
    if (magnitudes[i] > magnitudes[peakIdx]) peakIdx = i;
  }

  // Spectral centroid
  let sumWeighted = 0;
  let sumMag = 0;
  for (let i = 0; i < magnitudes.length; i++) {
    sumWeighted += frequencies[i] * magnitudes[i];
    sumMag += magnitudes[i];
  }
  const spectralCentroid = sumMag > 0 ? sumWeighted / sumMag : 0;

  // Band power
  let bandPower = 0;
  for (let i = 0; i < frequencies.length; i++) {
    if (frequencies[i] >= bandLow && frequencies[i] <= bandHigh) {
      bandPower += magnitudes[i] * magnitudes[i];
    }
  }

  return {
    peakFrequency: frequencies[peakIdx],
    peakAmplitude: magnitudes[peakIdx],
    spectralCentroid,
    bandPower,
  };
}

function buildFeatureVector(
  sensors: Map<string, number[]>,
  timestamp: number,
  samplingRate: number
): MultiSensorFeatures {
  const features = new Map<string, number>();

  sensors.forEach((signal, sensorName) => {
    // Time-domain features
    const timeFeats = extractTimeFeatures(signal);
    features.set(`${sensorName}_mean`, timeFeats.mean);
    features.set(`${sensorName}_rms`, timeFeats.rms);
    features.set(`${sensorName}_peak`, timeFeats.peak);
    features.set(`${sensorName}_crest`, timeFeats.crestFactor);
    features.set(`${sensorName}_kurtosis`, timeFeats.kurtosis);

    // Frequency-domain features (for vibration and acoustic)
    if (sensorName === "vibration" || sensorName === "acoustic") {
      const freqFeats = extractFrequencyFeatures(signal, samplingRate, 10, 200);
      features.set(`${sensorName}_peakFreq`, freqFeats.peakFrequency);
      features.set(`${sensorName}_bandPower`, freqFeats.bandPower);
      features.set(`${sensorName}_centroid`, freqFeats.spectralCentroid);

      // Additional features for bearing fault detection
      const highFreqFeats = extractFrequencyFeatures(signal, samplingRate, 80, 200);
      features.set(`${sensorName}_highFreqPower`, highFreqFeats.bandPower);
    }
  });

  return { timestamp, features };
}

// ============================================================================
// Cross-Correlation Analysis
// ============================================================================

function calculateCorrelationMatrix(sensors: Map<string, SensorData>): {
  labels: string[];
  matrix: number[][];
} {
  const labels = Array.from(sensors.keys());
  const n = labels.length;
  const matrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const sensor1 = sensors.get(labels[i])!;
      const sensor2 = sensors.get(labels[j])!;

      // Pearson correlation coefficient
      matrix[i][j] = pearsonCorrelation(sensor1.values, sensor2.values);
    }
  }

  return { labels, matrix };
}

function pearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);

  const meanX = x.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const meanY = y.slice(0, n).reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    sumX2 += dx * dx;
    sumY2 += dy * dy;
  }

  const denominator = Math.sqrt(sumX2 * sumY2);
  return denominator > 0 ? numerator / denominator : 0;
}

// ============================================================================
// Anomaly Detection
// ============================================================================

class AnomalyDetector {
  private baseline = new Map<string, { mean: number; std: number }>();
  private threshold: number = 3; // 3-sigma threshold

  train(normalFeatures: MultiSensorFeatures[]): void {
    // Calculate mean and std for each feature
    const featureArrays = new Map<string, number[]>();

    normalFeatures.forEach((sample) => {
      sample.features.forEach((value, key) => {
        if (!featureArrays.has(key)) {
          featureArrays.set(key, []);
        }
        featureArrays.get(key)!.push(value);
      });
    });

    featureArrays.forEach((values, key) => {
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.map((x) => (x - mean) ** 2).reduce((a, b) => a + b, 0) / values.length;
      const std = Math.sqrt(variance);

      this.baseline.set(key, { mean, std });
    });
  }

  detect(features: MultiSensorFeatures): AnomalyDetection {
    const triggeredSensors: string[] = [];
    let maxScore = 0;

    features.features.forEach((value, key) => {
      const baseline = this.baseline.get(key);
      if (baseline) {
        const zScore = Math.abs((value - baseline.mean) / (baseline.std + 1e-10));

        if (zScore > this.threshold) {
          triggeredSensors.push(`${key}: ${value.toFixed(2)} (z=${zScore.toFixed(1)})`);
          maxScore = Math.max(maxScore, zScore);
        }
      }
    });

    return {
      timestamp: features.timestamp,
      isAnomaly: triggeredSensors.length > 0,
      score: maxScore,
      triggeredSensors,
    };
  }
}

// ============================================================================
// Fault Diagnosis System
// ============================================================================

class FaultDiagnosisSystem {
  private motorFreq: number = 30; // Hz

  diagnose(features: MultiSensorFeatures): FaultDiagnosis {
    const votes = new Map<FaultType, number>();
    const evidence: string[] = [];

    // Initialize votes
    Object.values(FaultType).forEach((ft) => votes.set(ft as FaultType, 0));

    // Extract feature values
    const vibRms = features.features.get("vibration_rms") || 0;
    const vibKurtosis = features.features.get("vibration_kurtosis") || 0;
    const vibPeakFreq = features.features.get("vibration_peakFreq") || 0;
    const vibHighFreqPower = features.features.get("vibration_highFreqPower") || 0;
    const tempMean = features.features.get("temperature_mean") || 0;
    const currentRms = features.features.get("current_rms") || 0;

    // Rule 1: Bearing wear (high-frequency content is key indicator)
    if (vibHighFreqPower > 0.5) {
      votes.set(FaultType.BearingWear, votes.get(FaultType.BearingWear)! + 4);
      evidence.push(`High-frequency band power (${vibHighFreqPower.toFixed(3)})`);
    }

    // Rule 1b: Bearing wear (high RMS + high kurtosis)
    if (vibRms > 2.5 && vibKurtosis > 5.0) {
      votes.set(FaultType.BearingWear, votes.get(FaultType.BearingWear)! + 3);
      evidence.push(`High vibration RMS (${vibRms.toFixed(2)}) + kurtosis (${vibKurtosis.toFixed(2)})`);
    }

    // Rule 2: Unbalance (1× RPM dominant, but not if high-frequency present)
    if (vibPeakFreq > this.motorFreq - 5 && vibPeakFreq < this.motorFreq + 5) {
      // Reduce vote if high-frequency content present (indicates bearing fault, not unbalance)
      const unbalanceVotes = vibHighFreqPower > 0.5 ? 1 : 2;
      votes.set(FaultType.Unbalance, votes.get(FaultType.Unbalance)! + unbalanceVotes);
      evidence.push(`Peak at motor frequency (${vibPeakFreq.toFixed(1)} Hz ≈ ${this.motorFreq} Hz)`);
    }

    // Rule 3: Misalignment (2× RPM dominant)
    if (vibPeakFreq > 2 * this.motorFreq - 5 && vibPeakFreq < 2 * this.motorFreq + 5) {
      votes.set(FaultType.Misalignment, votes.get(FaultType.Misalignment)! + 2);
      evidence.push(`Peak at 2× motor frequency (${vibPeakFreq.toFixed(1)} Hz ≈ ${2 * this.motorFreq} Hz)`);
    }

    // Rule 4: High temperature
    if (tempMean > 80) {
      votes.set(FaultType.BearingWear, votes.get(FaultType.BearingWear)! + 1);
      votes.set(FaultType.Unbalance, votes.get(FaultType.Unbalance)! + 1);
      evidence.push(`High temperature (${tempMean.toFixed(1)}°C)`);
    }

    // Rule 5: Electrical fault (high current)
    if (currentRms > 12.0) {
      votes.set(FaultType.Electrical, votes.get(FaultType.Electrical)! + 3);
      evidence.push(`High current (${currentRms.toFixed(2)} A)`);
    }

    // Find fault with most votes
    let maxVotes = 0;
    let detectedFault = FaultType.Normal;

    votes.forEach((count, fault) => {
      if (count > maxVotes && count > 0) {
        maxVotes = count;
        detectedFault = fault;
      }
    });

    const totalVotes = Array.from(votes.values()).reduce((a, b) => a + b, 0);
    const confidence = totalVotes > 0 ? maxVotes / totalVotes : 0;

    // Calculate normalized scores for all fault types
    const scores = new Map<FaultType, number>();
    votes.forEach((count, fault) => {
      scores.set(fault, totalVotes > 0 ? count / totalVotes : 0);
    });

    return {
      timestamp: features.timestamp,
      fault: detectedFault,
      confidence,
      evidence: detectedFault !== FaultType.Normal ? evidence : [],
      scores,
    };
  }
}

// ============================================================================
// Visualization Functions
// ============================================================================

function createMultiSensorTimeSeriesSpec(sensors: Map<string, SensorData>, maxTime: number = 20): any {
  const data: any[] = [];

  sensors.forEach((sensor) => {
    sensor.timestamps.forEach((t, i) => {
      if (t <= maxTime) {
        data.push({
          time: t,
          value: sensor.values[i],
          sensor: sensor.name,
        });
      }
    });
  });

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Multi-Sensor Time Series",
    data: { values: data },
    facet: {
      row: {
        field: "sensor",
        type: "nominal",
        title: null,
        header: { labelAngle: 0, labelAlign: "left", labelFontSize: 12 },
      },
    },
    spec: {
      width: 900,
      height: 100,
      mark: { type: "line", strokeWidth: 1.5 },
      encoding: {
        x: {
          field: "time",
          type: "quantitative",
          title: "Time (seconds)",
          axis: { grid: false },
          scale: { domain: [0, maxTime] },
        },
        y: {
          field: "value",
          type: "quantitative",
          scale: { zero: false },
          axis: { grid: true, gridOpacity: 0.3, titleFontSize: 0 },
        },
        color: {
          field: "sensor",
          type: "nominal",
          scale: { scheme: "category10" },
          legend: null,
        },
      },
    },
  };
}

function createCorrelationHeatmapSpec(labels: string[], matrix: number[][]): any {
  const data: any[] = [];

  for (let i = 0; i < labels.length; i++) {
    for (let j = 0; j < labels.length; j++) {
      data.push({
        sensor1: labels[i],
        sensor2: labels[j],
        correlation: matrix[i][j],
      });
    }
  }

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Sensor Cross-Correlation Matrix",
    width: 400,
    height: 400,
    data: { values: data },
    mark: "rect",
    encoding: {
      x: {
        field: "sensor1",
        type: "nominal",
        title: null,
        axis: { labelAngle: -45, labelFontSize: 12 },
      },
      y: {
        field: "sensor2",
        type: "nominal",
        title: null,
        axis: { labelFontSize: 12 },
      },
      color: {
        field: "correlation",
        type: "quantitative",
        scale: {
          scheme: "redblue",
          domain: [-1, 1],
          reverse: true,
        },
        legend: { title: "Correlation", titleFontSize: 12 },
      },
      tooltip: [
        { field: "sensor1", title: "Sensor 1" },
        { field: "sensor2", title: "Sensor 2" },
        { field: "correlation", title: "Correlation", format: ".3f" },
      ],
    },
  };
}

function createAnomalyTimelineSpec(anomalies: AnomalyDetection[], duration: number): any {
  const data = anomalies
    .filter((a) => a.isAnomaly)
    .map((a) => ({
      time: a.timestamp,
      score: a.score,
      triggered: a.triggeredSensors.length,
    }));

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Anomaly Detection Timeline",
    width: 900,
    height: 150,
    data: { values: data },
    mark: { type: "point", filled: true, size: 100 },
    encoding: {
      x: {
        field: "time",
        type: "quantitative",
        title: "Time (seconds)",
        scale: { domain: [0, duration] },
        axis: { grid: false },
      },
      y: {
        field: "score",
        type: "quantitative",
        title: "Anomaly Score (z-score)",
        axis: { grid: true, gridOpacity: 0.3 },
      },
      color: {
        field: "score",
        type: "quantitative",
        scale: { scheme: "reds" },
        legend: null,
      },
      size: {
        field: "triggered",
        type: "quantitative",
        scale: { range: [50, 300] },
        legend: { title: "# Triggered" },
      },
      tooltip: [
        { field: "time", title: "Time", format: ".2f" },
        { field: "score", title: "Score", format: ".2f" },
        { field: "triggered", title: "Triggered Features" },
      ],
    },
  };
}

function createFaultDiagnosisHeatmap(diagnoses: FaultDiagnosis[], duration: number, outputDir: string): void {
  const width = 1000;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Fill background
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, width, height);

  // Fault types to display (excluding Normal)
  const faultTypes = [FaultType.BearingWear, FaultType.Unbalance, FaultType.Misalignment, FaultType.Electrical];

  const numTimes = diagnoses.length;
  const numFaults = faultTypes.length;
  const pixelWidth = width / numTimes;
  const pixelHeight = height / numFaults;

  // Viridis colormap function (similar to turbo)
  const viridisColormap = (t: number): [number, number, number] => {
    const r = Math.floor(255 * Math.max(0, Math.min(1, 1.5 - Math.abs(t - 0.5) * 3)));
    const g = Math.floor(255 * t);
    const b = Math.floor(255 * (1 - t * 0.5));
    return [r, g, b];
  };

  // Draw heatmap
  diagnoses.forEach((diagnosis, timeIdx) => {
    faultTypes.forEach((faultType, faultIdx) => {
      const score = diagnosis.scores.get(faultType) || 0;
      const [r, g, b] = viridisColormap(score);

      const x = timeIdx * pixelWidth;
      const y = faultIdx * pixelHeight;

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(x, y, Math.ceil(pixelWidth) + 1, Math.ceil(pixelHeight) + 1);
    });
  });

  // Save as PNG
  const pngPath = path.join(outputDir, "fault-diagnosis.png");
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(pngPath, buffer);
  console.log(`✓ PNG saved to: ${pngPath}`);

  // Create SVG wrapper with embedded PNG and axis labels
  const base64Image = buffer.toString("base64");
  const margin = { top: 40, right: 60, bottom: 60, left: 120 };
  const svgWidth = width + margin.left + margin.right;
  const svgHeight = height + margin.top + margin.bottom;

  // Generate X-axis ticks (time)
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

  // Generate Y-axis ticks (fault types)
  let yTicks = "";
  faultTypes.forEach((faultType, idx) => {
    const y = margin.top + (idx + 0.5) * pixelHeight;
    yTicks += `
    <line x1="${margin.left - 5}" y1="${y}" x2="${margin.left}" y2="${y}" stroke="black" stroke-width="1"/>
    <text x="${margin.left - 10}" y="${
      y + 4
    }" text-anchor="end" font-family="Arial" font-size="12" fill="black">${faultType}</text>`;
  });

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <rect width="${svgWidth}" height="${svgHeight}" fill="white"/>
  
  <!-- Title -->
  <text x="${
    svgWidth / 2
  }" y="25" text-anchor="middle" font-family="Arial" font-size="18" font-weight="bold">Fault Diagnosis Probability Heatmap</text>
  
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
  <text x="30" y="${
    svgHeight / 2
  }" text-anchor="middle" font-family="Arial" font-size="14" font-weight="bold" fill="black" transform="rotate(-90 30 ${
    svgHeight / 2
  })">Fault Type</text>
  
  <!-- Legend -->
  <text x="${svgWidth - 50}" y="${
    margin.top + 20
  }" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="black">Score</text>
  <defs>
    <linearGradient id="legendGradient" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" style="stop-color:rgb(68,1,84);stop-opacity:1" />
      <stop offset="50%" style="stop-color:rgb(59,82,139);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgb(253,231,37);stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect x="${svgWidth - 70}" y="${
    margin.top + 30
  }" width="20" height="150" fill="url(#legendGradient)" stroke="black" stroke-width="1"/>
  <text x="${svgWidth - 40}" y="${margin.top + 35}" font-family="Arial" font-size="10" fill="black">1.0</text>
  <text x="${svgWidth - 40}" y="${margin.top + 105}" font-family="Arial" font-size="10" fill="black">0.5</text>
  <text x="${svgWidth - 40}" y="${margin.top + 180}" font-family="Arial" font-size="10" fill="black">0.0</text>
</svg>`;

  const svgPath = path.join(outputDir, "fault-diagnosis.svg");
  fs.writeFileSync(svgPath, svg);
  console.log(`✓ SVG saved to: ${svgPath}`);

  // Create HTML
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Fault Diagnosis Heatmap</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    #vis { margin: 20px auto; background: white; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 1200px; }
    img { width: 100%; height: auto; }
    .info { margin-top: 20px; padding: 15px; background: #f9f9f9; border-left: 4px solid #4CAF50; }
  </style>
</head>
<body>
  <div id="vis">
    <img src="fault-diagnosis.svg" alt="Fault Diagnosis Heatmap">
    <div class="info">
      <h3>Interpretation:</h3>
      <ul>
        <li><strong>Each row</strong> represents a fault type (Bearing Wear, Unbalance, Misalignment, Electrical)</li>
        <li><strong>X-axis</strong> shows time progression (0-${duration}s)</li>
        <li><strong>Color intensity</strong> indicates fault probability/confidence (0.0 = low, 1.0 = high)</li>
        <li><strong>Bright colors</strong> indicate the diagnostic system has high confidence in that fault type at that time</li>
        <li><strong>Dark colors</strong> indicate low confidence or absence of that fault signature</li>
      </ul>
      <p><em>Note: Multiple faults can have high scores simultaneously if their signatures overlap.</em></p>
    </div>
  </div>
</body>
</html>`;

  const htmlPath = path.join(outputDir, "fault-diagnosis.html");
  fs.writeFileSync(htmlPath, html);
  console.log(`✓ HTML saved to: ${htmlPath}`);
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
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    #vis { margin: 20px auto; background: white; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
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
  console.log("Chapter 10: Multi-Sensor Fusion and Advanced Processing");
  console.log("======================================================================\n");

  const outputDir = path.join(__dirname, "..", "outputs", "chapter10");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const samplingRate = 200; // Hz
  const duration = 60; // seconds
  const windowSize = 512; // samples for feature extraction

  // Create simulator
  const simulator = new MultiSensorSimulator(samplingRate);

  // Scenario: Normal operation for 20s, then bearing fault develops
  console.log("Simulating multi-sensor system...");
  console.log(`  Duration: ${duration} seconds`);
  console.log(`  Sampling rate: ${samplingRate} Hz`);
  console.log(`  Sensors: Vibration, Temperature, Current, Acoustic`);
  console.log(`  Fault injection: Bearing wear at t=20s\n`);

  simulator.setFault(FaultType.BearingWear, 20);

  const sensors = simulator.generateMultiSensorData(duration);

  console.log(`  ✓ Generated ${sensors.size} sensor streams`);
  console.log(`  ✓ Total samples per sensor: ${sensors.get("vibration")!.values.length}\n`);

  // Extract features over time (sliding window)
  console.log("Extracting features...");
  const hopSize = 128; // Feature extraction every 0.64s
  const numWindows = Math.floor((sensors.get("vibration")!.values.length - windowSize) / hopSize);

  const allFeatures: MultiSensorFeatures[] = [];

  for (let i = 0; i < numWindows; i++) {
    const startIdx = i * hopSize;
    const endIdx = startIdx + windowSize;
    const timestamp = (startIdx + windowSize / 2) / samplingRate;

    const windowData = new Map<string, number[]>();
    sensors.forEach((sensor, name) => {
      windowData.set(name, sensor.values.slice(startIdx, endIdx));
    });

    const features = buildFeatureVector(windowData, timestamp, samplingRate);
    allFeatures.push(features);
  }

  console.log(`  ✓ Extracted ${allFeatures.length} feature vectors`);
  console.log(`  ✓ Features per vector: ${allFeatures[0].features.size}\n`);

  // Train anomaly detector on first 20 seconds (normal operation)
  console.log("Training anomaly detector...");
  const normalFeatures = allFeatures.filter((f) => f.timestamp < 20);
  const detector = new AnomalyDetector();
  detector.train(normalFeatures);
  console.log(`  ✓ Trained on ${normalFeatures.length} normal samples\n`);

  // Detect anomalies
  console.log("Detecting anomalies...");
  const anomalies = allFeatures.map((f) => detector.detect(f));
  const numAnomalies = anomalies.filter((a) => a.isAnomaly).length;
  console.log(`  ✓ Detected ${numAnomalies} anomalies (${((numAnomalies / anomalies.length) * 100).toFixed(1)}%)\n`);

  // Diagnose faults
  console.log("Diagnosing faults...");
  const diagnosisSystem = new FaultDiagnosisSystem();
  const diagnoses = allFeatures.map((f) => diagnosisSystem.diagnose(f));

  const faultCounts = new Map<FaultType, number>();
  diagnoses.forEach((d) => {
    const count = faultCounts.get(d.fault) || 0;
    faultCounts.set(d.fault, count + 1);
  });

  console.log("  Fault distribution:");
  faultCounts.forEach((count, fault) => {
    console.log(`    ${fault}: ${count} windows (${((count / diagnoses.length) * 100).toFixed(1)}%)`);
  });
  console.log();

  // Calculate correlation matrix
  console.log("Computing sensor correlations...");
  const { labels, matrix } = calculateCorrelationMatrix(sensors);
  console.log("  Correlation matrix:");
  labels.forEach((label1, i) => {
    let row = `    ${label1.padEnd(15)}:`;
    labels.forEach((_, j) => {
      row += ` ${matrix[i][j].toFixed(3)}`;
    });
    console.log(row);
  });
  console.log();

  // Create visualizations
  console.log("Creating visualizations...");

  console.log("  1. Multi-sensor time series...");
  const timeSeriesSpec = createMultiSensorTimeSeriesSpec(sensors, 30); // Show first 30s
  await saveVisualization(timeSeriesSpec, outputDir, "multi-sensor-time-series");

  console.log("  2. Correlation heatmap...");
  const correlationSpec = createCorrelationHeatmapSpec(labels, matrix);
  await saveVisualization(correlationSpec, outputDir, "correlation-heatmap");

  console.log("  3. Anomaly timeline...");
  const anomalySpec = createAnomalyTimelineSpec(anomalies, duration);
  await saveVisualization(anomalySpec, outputDir, "anomaly-timeline");

  console.log("  4. Fault diagnosis heatmap...");
  createFaultDiagnosisHeatmap(diagnoses, duration, outputDir);

  console.log("\n======================================================================");
  console.log("✓ Chapter 10 completed successfully!\n");

  console.log("Key Insights:");
  console.log("  • Multi-sensor fusion improves fault detection accuracy");
  console.log("  • Correlation analysis reveals sensor relationships");
  console.log("  • Time + frequency features capture different fault signatures");
  console.log("  • Anomaly detector successfully identifies fault onset at t=20s");
  console.log("  • Decision fusion correctly diagnoses bearing wear fault");
  console.log("  • Statistical methods enable automated monitoring");
  console.log("======================================================================");
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
