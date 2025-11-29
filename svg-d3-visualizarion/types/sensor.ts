/**
 * TypeScript type definitions for IoT sensor data
 */

export type SensorType = 'temperature' | 'humidity' | 'pressure' | 'light' | 'motion' | 'air_quality';

export interface SensorReading {
  timestamp: Date;
  value: number;
  unit: string;
  sensorId: string;
  sensorType: SensorType;
}

export interface SensorMetadata {
  id: string;
  name: string;
  type: SensorType;
  unit: string;
  location: string;
  minValue: number;
  maxValue: number;
  lastUpdated: Date;
}

export interface TimeSeriesData {
  sensorId: string;
  sensorType: SensorType;
  readings: Array<{
    timestamp: Date;
    value: number;
  }>;
}

export interface SensorDataPoint {
  timestamp: Date;
  value: number;
}

export interface DashboardSensor {
  metadata: SensorMetadata;
  currentValue: number;
  timeSeries: SensorDataPoint[];
  status: 'active' | 'inactive' | 'error';
}

