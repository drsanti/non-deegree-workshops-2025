/**
 * Mock IoT sensor data generator
 */

import type { SensorMetadata, SensorDataPoint, DashboardSensor, SensorType } from '@/types/sensor';

const SENSOR_TYPES: SensorType[] = ['temperature', 'humidity', 'pressure', 'light', 'motion', 'air_quality'];

const SENSOR_CONFIGS: Record<SensorType, { unit: string; min: number; max: number; baseValue: number }> = {
  temperature: { unit: '°C', min: -10, max: 50, baseValue: 22 },
  humidity: { unit: '%', min: 0, max: 100, baseValue: 45 },
  pressure: { unit: 'hPa', min: 980, max: 1050, baseValue: 1013 },
  light: { unit: 'lux', min: 0, max: 1000, baseValue: 300 },
  motion: { unit: 'detected', min: 0, max: 1, baseValue: 0 },
  air_quality: { unit: 'AQI', min: 0, max: 500, baseValue: 50 },
};

/**
 * Generate a random value within sensor range with some variation
 */
function generateSensorValue(type: SensorType, baseValue: number): number {
  const config = SENSOR_CONFIGS[type];
  const variation = (config.max - config.min) * 0.1; // 10% variation
  const value = baseValue + (Math.random() - 0.5) * variation;
  return Math.max(config.min, Math.min(config.max, value));
}

/**
 * Generate time series data for a sensor
 */
export function generateTimeSeriesData(
  sensorId: string,
  sensorType: SensorType,
  hours: number = 24,
  intervalMinutes: number = 5
): SensorDataPoint[] {
  const config = SENSOR_CONFIGS[sensorType];
  const now = new Date();
  const dataPoints: SensorDataPoint[] = [];
  
  let currentValue = config.baseValue;
  
  for (let i = hours * 60; i >= 0; i -= intervalMinutes) {
    const timestamp = new Date(now.getTime() - i * 60 * 1000);
    currentValue = generateSensorValue(sensorType, currentValue);
    
    dataPoints.push({
      timestamp,
      value: currentValue,
    });
  }
  
  return dataPoints;
}

/**
 * Generate sensor metadata
 */
export function generateSensorMetadata(
  id: string,
  type: SensorType,
  location: string
): SensorMetadata {
  const config = SENSOR_CONFIGS[type];
  return {
    id,
    name: `${type.charAt(0).toUpperCase() + type.slice(1)} Sensor ${id.slice(-4)}`,
    type,
    unit: config.unit,
    location,
    minValue: config.min,
    maxValue: config.max,
    lastUpdated: new Date(),
  };
}

/**
 * Generate a new reading for a sensor (simulates real-time updates)
 */
export function generateNewReading(
  sensorType: SensorType,
  currentValue: number
): number {
  return generateSensorValue(sensorType, currentValue);
}

/**
 * Generate multiple sensors for dashboard
 */
export function generateDashboardSensors(count: number = 6): DashboardSensor[] {
  const locations = ['Room A', 'Room B', 'Outdoor', 'Basement', 'Attic', 'Garage'];
  const sensors: DashboardSensor[] = [];
  
  for (let i = 0; i < count; i++) {
    const sensorType = SENSOR_TYPES[i % SENSOR_TYPES.length];
    const sensorId = `sensor-${String(i + 1).padStart(3, '0')}`;
    const location = locations[i % locations.length];
    
    const metadata = generateSensorMetadata(sensorId, sensorType, location);
    const timeSeries = generateTimeSeriesData(sensorId, sensorType, 24, 5);
    const currentValue = timeSeries[timeSeries.length - 1]?.value || SENSOR_CONFIGS[sensorType].baseValue;
    
    sensors.push({
      metadata,
      currentValue,
      timeSeries,
      status: Math.random() > 0.1 ? 'active' : 'inactive',
    });
  }
  
  return sensors;
}

/**
 * Update sensor with new reading
 */
export function updateSensorReading(sensor: DashboardSensor): DashboardSensor {
  const newValue = generateNewReading(sensor.metadata.type, sensor.currentValue);
  const now = new Date();
  
  // Add new reading to time series (keep last 100 points)
  const updatedTimeSeries = [
    ...sensor.timeSeries.slice(-99),
    { timestamp: now, value: newValue },
  ];
  
  return {
    ...sensor,
    currentValue: newValue,
    timeSeries: updatedTimeSeries,
    metadata: {
      ...sensor.metadata,
      lastUpdated: now,
    },
  };
}

