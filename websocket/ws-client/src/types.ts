// Device types - matching server types
export type DeviceType = 'sensor' | 'controller';
export type DeviceStatus = 'online' | 'offline';
export type PowerStatus = 'on' | 'off';

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
  lastUpdate?: number;
  data: DeviceData;
}

// WebSocket message types
export type MessageType =
  | 'device-list'
  | 'sensor-data'
  | 'device-status'
  | 'device-command'
  | 'request-device-list'
  | 'connection-status'
  | 'error';

// Base message interface
interface BaseMessage {
  type: MessageType;
  timestamp: number;
}

// Device list message (server to client)
export interface DeviceListMessage extends BaseMessage {
  type: 'device-list';
  devices: Array<{
    id: string;
    name: string;
    type: DeviceType;
    status: DeviceStatus;
    lastUpdate: number;
  }>;
}

// Sensor data message (server to client)
export interface SensorDataMessage extends BaseMessage {
  type: 'sensor-data';
  deviceId: string;
  deviceName: string;
  data: DeviceData;
}

// Device status message (server to client)
export interface DeviceStatusMessage extends BaseMessage {
  type: 'device-status';
  deviceId: string;
  deviceName: string;
  status: DeviceStatus;
  data: DeviceData;
}

// Connection status message (server to client)
export interface ConnectionStatusMessage extends BaseMessage {
  type: 'connection-status';
  message: string;
  clientCount: number;
}

// Error message (server to client)
export interface ErrorMessage extends BaseMessage {
  type: 'error';
  message: string;
}

// Device command message (client to server)
export interface DeviceCommandMessage extends BaseMessage {
  type: 'device-command';
  deviceId: string;
  command: 'toggle-power' | 'set-temperature' | 'set-humidity';
  value?: number;
}

// Request device list message (client to server)
export interface RequestDeviceListMessage extends BaseMessage {
  type: 'request-device-list';
}

// Union type for all server-to-client messages
export type ServerMessage =
  | DeviceListMessage
  | SensorDataMessage
  | DeviceStatusMessage
  | ConnectionStatusMessage
  | ErrorMessage;

// Union type for all client-to-server messages
export type ClientMessage = DeviceCommandMessage | RequestDeviceListMessage;

// Connection status type for UI
export type ConnectionStatus = 'connected' | 'disconnected' | 'error';

// Device command function type
export type DeviceCommandHandler = (
  deviceId: string,
  command: 'toggle-power' | 'set-temperature' | 'set-humidity',
  value?: number
) => void;

