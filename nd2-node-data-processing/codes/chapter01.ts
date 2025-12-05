/**
 * Chapter 1: Introduction to IoT Sensor Data & Data Generation
 *
 * This file demonstrates:
 * - TypeScript interfaces for sensor data
 * - Synthetic sensor data generation
 * - Different sensor types with realistic characteristics
 * - Time-series data visualization using Vega-Lite
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

/**
 * Single sensor reading with timestamp
 */
interface SensorReading {
  timestamp: number; // Unix timestamp in milliseconds
  value: number; // Sensor value
  unit: string; // Unit of measurement
}

/**
 * Sensor metadata information
 */
interface SensorInfo {
  id: string; // Unique sensor identifier
  type: string; // Sensor type (temperature, humidity, vibration, etc.)
  location: string; // Physical location of the sensor
  samplingRate: number; // Samples per second (Hz)
}

/**
 * Complete sensor data structure
 */
interface SensorData {
  info: SensorInfo;
  readings: SensorReading[];
}

/**
 * Data point for visualization
 */
interface VisualizationData {
  time: string; // ISO timestamp string
  value: number;
  sensor: string; // Sensor name for grouping
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate random value following normal distribution (Box-Muller transform)
 */
function randomNormal(mean: number = 0, stdDev: number = 1): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
}

/**
 * Generate timestamp array
 */
function generateTimestamps(startTime: number, duration: number, samplingRate: number): number[] {
  const timestamps: number[] = [];
  const interval = 1000 / samplingRate; // milliseconds between samples
  const numSamples = Math.floor(duration * samplingRate);

  for (let i = 0; i < numSamples; i++) {
    timestamps.push(startTime + i * interval);
  }

  return timestamps;
}

// ============================================================================
// Sensor Data Generators
// ============================================================================

/**
 * Generate temperature sensor data
 * Simulates a temperature sensor with slow variations and thermal noise
 */
function generateTemperatureData(
  startTime: number,
  duration: number,
  samplingRate: number = 1 // 1 Hz (one sample per second)
): SensorData {
  const timestamps = generateTimestamps(startTime, duration, samplingRate);
  const readings: SensorReading[] = [];

  // Base temperature with slow sinusoidal variation (simulating day/night cycle)
  const baseTemp = 22.0; // 22°C
  const amplitude = 3.0; // ±3°C variation
  const period = duration / 2; // Half cycle over the duration

  timestamps.forEach((timestamp, index) => {
    const time = index / samplingRate;
    // Sinusoidal variation + Gaussian noise
    const variation = amplitude * Math.sin((2 * Math.PI * time) / period);
    const noise = randomNormal(0, 0.1); // Small thermal noise
    const value = baseTemp + variation + noise;

    readings.push({
      timestamp,
      value: parseFloat(value.toFixed(2)),
      unit: "°C",
    });
  });

  return {
    info: {
      id: "TEMP-001",
      type: "Temperature",
      location: "Room A - Production Floor",
      samplingRate,
    },
    readings,
  };
}

/**
 * Generate humidity sensor data
 * Humidity often correlates with temperature
 */
function generateHumidityData(startTime: number, duration: number, samplingRate: number = 1): SensorData {
  const timestamps = generateTimestamps(startTime, duration, samplingRate);
  const readings: SensorReading[] = [];

  const baseHumidity = 45.0; // 45% RH
  const amplitude = 10.0; // ±10% variation
  const period = duration / 2;

  timestamps.forEach((timestamp, index) => {
    const time = index / samplingRate;
    // Inverse correlation with temperature (simplified)
    const variation = -amplitude * Math.sin((2 * Math.PI * time) / period);
    const noise = randomNormal(0, 0.5);
    const value = Math.max(0, Math.min(100, baseHumidity + variation + noise));

    readings.push({
      timestamp,
      value: parseFloat(value.toFixed(1)),
      unit: "%RH",
    });
  });

  return {
    info: {
      id: "HUM-001",
      type: "Humidity",
      location: "Room A - Production Floor",
      samplingRate,
    },
    readings,
  };
}

/**
 * Generate pressure sensor data
 * Simulates pneumatic system pressure
 */
function generatePressureData(
  startTime: number,
  duration: number,
  samplingRate: number = 10 // 10 Hz - faster response
): SensorData {
  const timestamps = generateTimestamps(startTime, duration, samplingRate);
  const readings: SensorReading[] = [];

  const basePressure = 100.0; // 100 PSI
  const amplitude = 5.0;

  timestamps.forEach((timestamp, index) => {
    const time = index / samplingRate;
    // Step changes simulating valve operations
    const stepPattern = Math.floor(time / 10) % 2 === 0 ? 1 : -1;
    const variation = amplitude * stepPattern;
    const noise = randomNormal(0, 0.3);
    const value = basePressure + variation + noise;

    readings.push({
      timestamp,
      value: parseFloat(value.toFixed(2)),
      unit: "PSI",
    });
  });

  return {
    info: {
      id: "PRES-001",
      type: "Pressure",
      location: "Pneumatic Line 1",
      samplingRate,
    },
    readings,
  };
}

/**
 * Generate vibration sensor data (accelerometer)
 * High-frequency data typical for machine monitoring
 */
function generateVibrationData(
  startTime: number,
  duration: number,
  samplingRate: number = 100 // 100 Hz - high frequency
): SensorData {
  const timestamps = generateTimestamps(startTime, duration, samplingRate);
  const readings: SensorReading[] = [];

  // Simulate motor vibration with multiple frequency components
  const baseFreq = 25; // 25 Hz (1500 RPM motor)
  const harmonic2 = 50; // Second harmonic

  timestamps.forEach((timestamp, index) => {
    const time = index / samplingRate;

    // Multi-frequency vibration pattern
    const fundamental = 0.5 * Math.sin(2 * Math.PI * baseFreq * time);
    const harmonic = 0.2 * Math.sin(2 * Math.PI * harmonic2 * time);
    const noise = randomNormal(0, 0.1);
    const value = fundamental + harmonic + noise;

    readings.push({
      timestamp,
      value: parseFloat(value.toFixed(3)),
      unit: "g",
    });
  });

  return {
    info: {
      id: "VIB-001",
      type: "Vibration",
      location: "Motor Bearing - Machine 3",
      samplingRate,
    },
    readings,
  };
}

/**
 * Generate current sensor data
 * Monitors electrical current in a motor
 */
function generateCurrentData(startTime: number, duration: number, samplingRate: number = 10): SensorData {
  const timestamps = generateTimestamps(startTime, duration, samplingRate);
  const readings: SensorReading[] = [];

  const baseCurrent = 15.0; // 15 A nominal load
  const amplitude = 3.0;

  timestamps.forEach((timestamp, index) => {
    const time = index / samplingRate;
    // Current spikes when load increases
    const loadChange = amplitude * Math.sin((2 * Math.PI * time) / (duration / 3));
    const noise = randomNormal(0, 0.2);
    const value = Math.max(0, baseCurrent + loadChange + noise);

    readings.push({
      timestamp,
      value: parseFloat(value.toFixed(2)),
      unit: "A",
    });
  });

  return {
    info: {
      id: "CURR-001",
      type: "Current",
      location: "Motor 3 - Phase A",
      samplingRate,
    },
    readings,
  };
}

// ============================================================================
// Visualization
// ============================================================================

/**
 * Create Vega-Lite specification for multi-sensor visualization
 */
function createVegaLiteSpec(data: VisualizationData[]): vegaLite.TopLevelSpec {
  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Chapter 1: IoT Sensor Data - Multiple Sensor Types",
    data: { values: data },
    width: 800,
    height: 600,
    mark: {
      type: "line",
      point: false,
      strokeWidth: 1.5,
    },
    encoding: {
      x: {
        field: "time",
        type: "temporal",
        title: "Time",
        axis: { format: "%H:%M:%S" },
      },
      y: {
        field: "value",
        type: "quantitative",
        title: "Sensor Value",
        scale: { zero: false },
      },
      color: {
        field: "sensor",
        type: "nominal",
        title: "Sensor Type",
        scale: {
          scheme: "category10",
        },
      },
      row: {
        field: "sensor",
        type: "nominal",
        title: null,
      },
    },
    resolve: {
      scale: { y: "independent" },
    },
  };
}

/**
 * Save Vega-Lite chart as SVG
 */
async function saveChartAsSVG(spec: vegaLite.TopLevelSpec, outputPath: string): Promise<void> {
  // Compile Vega-Lite to Vega
  const vegaSpec = vegaLite.compile(spec).spec;

  // Create a Vega view
  const view = new vega.View(vega.parse(vegaSpec), { renderer: "none" });

  // Generate SVG
  const svg = await view.toSVG();

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write to file
  fs.writeFileSync(outputPath, svg);
  console.log(`✓ Chart saved to: ${outputPath}`);
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log("=".repeat(70));
  console.log("Chapter 1: Introduction to IoT Sensor Data & Data Generation");
  console.log("=".repeat(70));
  console.log();

  const startTime = Date.now();
  const duration = 60; // 60 seconds of data

  console.log("Generating synthetic sensor data...\n");

  // Generate data for different sensor types
  const tempData = generateTemperatureData(startTime, duration, 1);
  const humidityData = generateHumidityData(startTime, duration, 1);
  const pressureData = generatePressureData(startTime, duration, 10);
  const vibrationData = generateVibrationData(startTime, duration, 100);
  const currentData = generateCurrentData(startTime, duration, 10);

  // Display sensor information
  const allSensors = [tempData, humidityData, pressureData, vibrationData, currentData];

  allSensors.forEach((sensor) => {
    console.log(`Sensor: ${sensor.info.type} (${sensor.info.id})`);
    console.log(`  Location: ${sensor.info.location}`);
    console.log(`  Sampling Rate: ${sensor.info.samplingRate} Hz`);
    console.log(`  Total Readings: ${sensor.readings.length}`);
    console.log(
      `  Value Range: ${Math.min(...sensor.readings.map((r) => r.value)).toFixed(2)} - ${Math.max(
        ...sensor.readings.map((r) => r.value)
      ).toFixed(2)} ${sensor.readings[0].unit}`
    );
    console.log();
  });

  // Prepare data for visualization (sample every Nth point for clarity)
  console.log("Preparing visualization data...");
  const vizData: VisualizationData[] = [];

  // Sample temperature and humidity (all points, low frequency)
  tempData.readings.forEach((reading) => {
    vizData.push({
      time: new Date(reading.timestamp).toISOString(),
      value: reading.value,
      sensor: `Temperature (${reading.unit})`,
    });
  });

  humidityData.readings.forEach((reading) => {
    vizData.push({
      time: new Date(reading.timestamp).toISOString(),
      value: reading.value,
      sensor: `Humidity (${reading.unit})`,
    });
  });

  // Sample pressure (every 5th point)
  pressureData.readings
    .filter((_, i) => i % 5 === 0)
    .forEach((reading) => {
      vizData.push({
        time: new Date(reading.timestamp).toISOString(),
        value: reading.value,
        sensor: `Pressure (${reading.unit})`,
      });
    });

  // Sample vibration (every 50th point - too high frequency for clear viz)
  vibrationData.readings
    .filter((_, i) => i % 50 === 0)
    .forEach((reading) => {
      vizData.push({
        time: new Date(reading.timestamp).toISOString(),
        value: reading.value,
        sensor: `Vibration (${reading.unit})`,
      });
    });

  // Sample current (every 3rd point)
  currentData.readings
    .filter((_, i) => i % 3 === 0)
    .forEach((reading) => {
      vizData.push({
        time: new Date(reading.timestamp).toISOString(),
        value: reading.value,
        sensor: `Current (${reading.unit})`,
      });
    });

  console.log(`Total visualization points: ${vizData.length}\n`);

  // Create and save visualization
  console.log("Creating Vega-Lite visualization...");
  const spec = createVegaLiteSpec(vizData);

  // Ensure chapter-specific output directory exists
  const outputDir = path.join(__dirname, "..", "outputs", "chapter01");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, "sensors.svg");

  await saveChartAsSVG(spec, outputPath);

  // Also create an HTML file for easy viewing
  const htmlPath = path.join(outputDir, "sensors.html");
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Chapter 1: IoT Sensor Data</title>
  <script src="https://cdn.jsdelivr.net/npm/vega@5"></script>
  <script src="https://cdn.jsdelivr.net/npm/vega-lite@5"></script>
  <script src="https://cdn.jsdelivr.net/npm/vega-embed@6"></script>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    #vis { width: 100%; }
  </style>
</head>
<body>
  <h1>Chapter 1: IoT Sensor Data - Multiple Sensor Types</h1>
  <div id="vis"></div>
  <script type="text/javascript">
    const spec = ${JSON.stringify(spec, null, 2)};
    vegaEmbed('#vis', spec);
  </script>
</body>
</html>`;
  fs.writeFileSync(htmlPath, htmlContent);
  console.log(`✓ HTML viewer saved to: ${htmlPath}`);

  console.log();
  console.log("=".repeat(70));
  console.log("✓ Chapter 1 completed successfully!");
  console.log(`✓ Open ${htmlPath} in a browser to view the chart`);
  console.log("=".repeat(70));
}

// Run the main function
main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
