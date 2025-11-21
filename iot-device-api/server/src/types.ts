// Device types
export type DeviceType = 'sensor' | 'controller';
export type DeviceStatus = 'online' | 'offline';
export type PowerStatus = 'on' | 'off';

// Device configuration
export interface DeviceConfig {
  id: string;
  name: string;
  type: DeviceType;
}

// Device sensor data
export interface DeviceData {
  temperature: number;
  humidity: number;
  power: PowerStatus;
}

// Full device information
export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  lastUpdate: number;
  data: DeviceData;
}

// Request/Response types for API
export interface CreateDeviceRequest {
  name: string;
  type: DeviceType;
  status?: DeviceStatus;
  data?: DeviceData;
}

export interface UpdateDeviceRequest {
  name?: string;
  type?: DeviceType;
  status?: DeviceStatus;
  data?: DeviceData;
}

export interface UpdateDeviceStatusRequest {
  status: DeviceStatus;
}

export interface UpdateDeviceDataRequest {
  data: DeviceData;
}

export interface CreateDeviceDataHistoryRequest {
  temperature: number;
  humidity: number;
  power: PowerStatus;
}

export interface DeviceDataHistoryQuery {
  deviceId: string;
  startTime?: Date;
  endTime?: Date;
  limit?: number;
}

