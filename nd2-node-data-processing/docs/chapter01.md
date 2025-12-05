# Chapter 1: Introduction to IoT Sensor Data & Data Generation

## Overview

This chapter introduces the fundamentals of IoT (Internet of Things) and industrial sensor data processing. We'll explore different types of sensors commonly used in industrial applications and learn how to generate synthetic sensor data with realistic characteristics.

## Learning Objectives

By the end of this chapter, you will:
- Understand different types of IoT and industrial sensors
- Learn how to define TypeScript interfaces for sensor data
- Generate synthetic sensor data with realistic characteristics
- Create time-series data structures
- Visualize sensor data using Vega-Lite

## Types of Sensors

### 1. Temperature Sensors
- **Range**: -40°C to 125°C (typical)
- **Applications**: Environmental monitoring, HVAC systems, industrial processes
- **Characteristics**: Slow response, gradual changes, thermal noise

### 2. Humidity Sensors
- **Range**: 0% to 100% RH
- **Applications**: Climate control, agriculture, food storage
- **Characteristics**: Correlated with temperature, drift over time

### 3. Pressure Sensors
- **Range**: 0 to 1000+ PSI (depending on application)
- **Applications**: Pneumatic systems, hydraulics, altitude measurement
- **Characteristics**: Fast response, can be affected by temperature

### 4. Vibration Sensors (Accelerometers)
- **Range**: ±2g to ±16g (or more)
- **Applications**: Predictive maintenance, structural health monitoring
- **Characteristics**: High-frequency data, multiple axes (X, Y, Z)

### 5. Current Sensors
- **Range**: 0 to 100+ Amperes
- **Applications**: Motor monitoring, power consumption analysis
- **Characteristics**: Can indicate load changes, harmonics

### 6. Voltage Sensors
- **Range**: 0 to 600V (industrial)
- **Applications**: Power quality monitoring, electrical systems
- **Characteristics**: Relatively stable, can show power line noise

## Data Structure Design

### TypeScript Interfaces

We define clear interfaces for our sensor data:

```typescript
// Single sensor reading
interface SensorReading {
  timestamp: number;      // Unix timestamp in milliseconds
  value: number;          // Sensor value
  unit: string;           // Unit of measurement
}

// Sensor metadata
interface SensorInfo {
  id: string;             // Unique sensor identifier
  type: string;           // Sensor type (temperature, humidity, etc.)
  location: string;       // Physical location
  samplingRate: number;   // Samples per second (Hz)
}

// Complete sensor data
interface SensorData {
  info: SensorInfo;
  readings: SensorReading[];
}
```

## Synthetic Data Generation

### Why Synthetic Data?

1. **No External Dependencies**: Don't need real hardware or data files
2. **Reproducibility**: Can generate same data for testing
3. **Controlled Scenarios**: Can simulate specific conditions
4. **Educational**: Understand signal characteristics

### Generation Strategy

For each sensor type, we:
1. Define realistic value ranges
2. Add appropriate noise levels
3. Include temporal patterns (trends, cycles)
4. Use appropriate sampling rates

## Code Implementation

The `chapter01.ts` file demonstrates:
- Creating sensor data generators for different sensor types
- Implementing TypeScript interfaces
- Generating time-series data with realistic noise
- Using Vega-Lite to create visualizations
- Saving charts as SVG files

## Visualization

We create time-series line charts showing:
- Raw sensor readings over time
- Multiple sensor types on separate subplots
- Proper axes labels and titles
- Realistic signal characteristics

## Key Takeaways

1. **Sensor Diversity**: Different sensors have different characteristics
2. **Data Structure**: Well-defined interfaces make code maintainable
3. **Sampling Rate**: Critical parameter for data collection
4. **Noise**: All real sensors have noise - we simulate this
5. **Time-Series**: Sensor data is fundamentally time-based

## Next Steps

In Chapter 2, we'll dive deeper into sampling theory, the Nyquist theorem, and how sampling rates affect data quality.

## Running the Code

```bash
# Using npm script
npm run chapter01

# Or directly with tsx
tsx codes/chapter01.ts
```

The output visualizations will be saved to:
- `outputs/chapter01/sensors.svg`
- `outputs/chapter01/sensors.html`
