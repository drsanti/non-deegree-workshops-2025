# IoT Device Monitor Client

A React application built with Vite and Radix UI that connects to the Real-time IoT Server to monitor and control IoT devices in real-time. This project includes 10 progressive workshops with interactive examples demonstrating WebSocket client development concepts.

## Features

- **10 Progressive Workshops** - Learn WebSocket client development from basics to advanced
- **Interactive Examples** - Each workshop includes a working React component example
- Real-time sensor data visualization from multiple IoT devices
- Device status monitoring (online/offline) with visual indicators
- Device control interface (toggle power, set temperature/humidity)
- Automatic reconnection on disconnect with exponential backoff
- Responsive dashboard UI with expandable device cards
- Color-coded sensor readings with threshold indicators
- Connection status indicator showing connection state and client count
- Modern UI built with Radix UI components
- Type-safe TypeScript implementation

## Installation

```bash
npm install
```

## Usage

Start the development server:

```bash
npm run dev
```

The application will open in your browser at `http://localhost:5173`.

Make sure the Real-time IoT Server is running on `ws://localhost:7890` before starting the client. 

**To start the WebSocket Server:**
1. Navigate to `websocket/ws-server-docker`
2. Create a `.env` file with your device configuration
3. Run `docker-compose up -d`

See [`websocket/ws-server-docker/README.md`](../ws-server-docker/README.md) for detailed setup instructions.

### Using the Workshops

The application includes an interactive example selector that allows you to switch between 10 different workshop examples:

1. **Example 1: Basic WebSocket Connection** - Learn how to establish a WebSocket connection
2. **Example 2: Basic Messaging** - Send and receive messages through WebSocket
3. **Example 3: Device List Handling** - Manage and display device lists
4. **Example 4: Real-time Sensor Data** - Handle real-time sensor data updates
5. **Example 5: Device Control** - Send commands to control devices
6. **Example 6: Connection Management** - Implement reconnection and connection lifecycle
7. **Example 7: Error Handling** - Handle errors and validate messages
8. **Example 8: Custom Hooks** - Create reusable WebSocket hooks
9. **Example 9: Advanced Features** - Message queuing, optimistic updates, and more
10. **Example 10: Best Practices** - Production-ready patterns and practices

Use the dropdown selector in the header to switch between examples, or use the Previous/Next buttons in the footer.

### Workshop Documentation

Each workshop includes detailed documentation in the `workshops/` directory:
- `01-setup-environment.md` - Project setup and basic connection
- `02-basic-messaging.md` - Sending and receiving messages
- `03-device-list-handling.md` - Managing device state
- `04-real-time-sensor-data.md` - Real-time data updates
- `05-device-control.md` - Device command interface
- `06-connection-management.md` - Connection lifecycle and reconnection
- `07-error-handling.md` - Error handling and validation
- `08-custom-hooks.md` - Creating reusable React hooks
- `09-advanced-features.md` - Advanced WebSocket features
- `10-best-practices.md` - Production-ready practices

Each workshop includes step-by-step instructions, code examples, explanations, and exercises.

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Features Overview

### Dashboard Header
The application header displays:
- **Title**: "IoT Device Monitor"
- **Connection Status**: Visual indicator with icon and status text
  - 🟢 Connected (green) - Successfully connected to server
  - 🔴 Disconnected (red) - Connection lost
  - 🟠 Error (orange) - Connection error
- **Client Count**: Badge showing the number of connected clients

### Device Cards
Each IoT device is displayed as an expandable card showing:
- Device name and ID
- Device status badge (online/offline)
- Current sensor readings with color coding:
  - **Temperature**: 
    - 🔴 Red (>27°C) - Hot
    - 🟢 Green (18-27°C) - Normal
    - 🔵 Blue (<18°C) - Cold
  - **Humidity**: 
    - 🟠 Orange (>70%) - High
    - 🟢 Green (30-70%) - Normal
    - ⚫ Gray (<30%) - Low
  - **Power**: 
    - 🟢 Green (ON)
    - 🔴 Red (OFF)
- Power toggle button (enabled only when device is online)
- Expandable controls section for setting temperature and humidity

### Real-time Updates
- Sensor data updates automatically every 3 seconds from the server
- All connected clients receive updates simultaneously
- No page refresh required
- Device cards update in real-time with new sensor readings

### Device Controls
When a device card is expanded:
- **Toggle Power**: Button to turn devices on/off (enabled only when online)
- **Set Temperature**: Form input with validation (0-50°C, step 0.1)
- **Set Humidity**: Form input with validation (0-100%, step 0.1)
- **Last Update**: Timestamp showing when the device last sent data

### Connection Management
- Automatic connection on app load
- Automatic reconnection on disconnect (retries every 3 seconds)
- Connection status indicator in header
- Proper cleanup on component unmount
- Handles React Strict Mode properly to avoid duplicate connections

## WebSocket Communication

### Connection
- Default connection URL: `ws://localhost:7890`
- Automatic connection on app load
- Reconnection interval: 3 seconds on disconnect/error

### Message Format

### Client to Server

#### Device Command
```json
{
  "type": "device-command",
  "deviceId": "device-001",
  "command": "toggle-power",
  "value": null,
  "timestamp": 1234567890123
}
```

Available commands:
- `toggle-power` - Toggle device power on/off (no value required)
- `set-temperature` - Set temperature value (requires `value` parameter: 0-50)
- `set-humidity` - Set humidity value (requires `value` parameter: 0-100)

All commands include a `timestamp` field automatically.

### Server to Client

The client handles the following message types:

#### Device List
```json
{
  "type": "device-list",
  "devices": [...],
  "timestamp": 1234567890123
}
```
Received on initial connection to populate the device list.

#### Sensor Data
```json
{
  "type": "sensor-data",
  "deviceId": "device-001",
  "deviceName": "Temperature Sensor",
  "data": {
    "temperature": 25.5,
    "humidity": 60.2,
    "power": "on"
  },
  "timestamp": 1234567890123
}
```
Received every 3 seconds (configurable on server) for each device.

#### Device Status
```json
{
  "type": "device-status",
  "deviceId": "device-001",
  "deviceName": "Temperature Sensor",
  "status": "online",
  "data": {...},
  "timestamp": 1234567890123
}
```
Received when device status changes.

#### Connection Status
```json
{
  "type": "connection-status",
  "message": "Client connected",
  "clientCount": 2,
  "timestamp": 1234567890123
}
```
Received when clients connect/disconnect to update the client count.

#### Error
```json
{
  "type": "error",
  "message": "Device not found",
  "timestamp": 1234567890123
}
```
Received when an error occurs on the server.

## Configuration

To change the WebSocket server URL, edit the example files in `src/examples/` or `src/App.tsx`:

```typescript
const WS_URL = 'ws://localhost:7890'
```

Change this to match your Real-time IoT Server URL if running on a different host or port.

### Switching Between App and Examples

To switch between the full application (`App.tsx`) and the workshop examples (`Example.tsx`), edit `src/main.tsx`:

```typescript
// For workshop examples (current)
import Example from "./Example.tsx";
<Example />

// For full application
import App from "./App.tsx";
<App />
```

## Technologies

- **React 18** - UI framework with hooks
- **TypeScript** - Type-safe JavaScript with strict mode
- **Vite** - Build tool and dev server
- **Radix UI** - Accessible UI component library
  - `@radix-ui/themes` - Theme system and components (Card, Flex, Text, Button, etc.)
  - `@radix-ui/react-icons` - Icon library
- **WebSocket API** - Real-time bidirectional communication

## Project Structure

```
websocket/ws-client/
├── src/
│   ├── App.tsx              # Main application component (full IoT dashboard)
│   ├── Example.tsx          # Example selector component (current entry point)
│   ├── main.tsx             # React entry point
│   ├── types.ts             # TypeScript type definitions
│   ├── App.css              # Global styles
│   ├── components/
│   │   └── DeviceCard.tsx   # Device display component
│   └── examples/
│       ├── Example01.tsx    # Basic WebSocket connection
│       ├── Example02.tsx    # Basic messaging
│       ├── Example03.tsx    # Device list handling
│       ├── Example04.tsx    # Real-time sensor data
│       ├── Example05.tsx    # Device control
│       ├── Example06.tsx    # Connection management
│       ├── Example07.tsx    # Error handling
│       ├── Example08.tsx    # Custom hooks
│       ├── Example09.tsx    # Advanced features
│       ├── Example10.tsx    # Best practices
│       └── index.ts         # Barrel export for examples
└── workshops/
    ├── 01-setup-environment.md
    ├── 02-basic-messaging.md
    ├── 03-device-list-handling.md
    ├── 04-real-time-sensor-data.md
    ├── 05-device-control.md
    ├── 06-connection-management.md
    ├── 07-error-handling.md
    ├── 08-custom-hooks.md
    ├── 09-advanced-features.md
    └── 10-best-practices.md
```

## Browser Support

Modern browsers with WebSocket and ES6+ support:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## TypeScript

The client is fully written in TypeScript with:
- **Strict type checking** enabled
- **Type-safe** component props and function signatures
- **Shared type definitions** for WebSocket messages (matching server types)
- **IntelliSense** support for better developer experience

### Key Types

- `Device` - Device information structure
- `DeviceData` - Sensor data (temperature, humidity, power)
- `ServerMessage` - Union type for all server-to-client messages
- `ConnectionStatus` - Connection state type ('connected' | 'disconnected' | 'error')
- `DeviceCommandHandler` - Type-safe command handler function

## Development

```bash
# Run development server with hot reload
npm run dev

# Type check without building
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

## UI Design

- **Dark gradient background** (blue-gray theme)
- **Responsive layout** with flexbox
- **Expandable device cards** for better organization
- **Color-coded indicators** for quick status recognition
- **Smooth animations** and transitions
- **Accessible components** via Radix UI

## Learning Path

The workshops are designed to be completed in order:

1. **Beginner (Workshops 1-3)**: Learn the basics of WebSocket connections, messaging, and device management
2. **Intermediate (Workshops 4-6)**: Handle real-time data, device control, and connection management
3. **Advanced (Workshops 7-10)**: Error handling, custom hooks, advanced features, and production practices

Each workshop builds on concepts from previous ones, providing a comprehensive learning experience for WebSocket client development.

