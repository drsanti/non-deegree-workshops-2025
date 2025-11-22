# Workshop 4: Real-time Sensor Data Updates

**Duration:** 45-60 minutes  
**Level:** Intermediate

## Introduction

In this workshop, you'll learn how to handle real-time sensor data updates from IoT devices. You'll update device data as it arrives, visualize sensor readings with color coding, and create a live dashboard that updates automatically.

## What You'll Learn

- Handling sensor-data messages
- Updating device data in real-time
- State management for multiple devices
- Visualizing sensor data with color coding
- Building a live sensor dashboard

## Prerequisites

Before starting, you should have:
- Completed Workshop 3 (Device List Handling)
- Understanding of React state updates
- Knowledge of conditional rendering
- WebSocket server running via Docker with devices sending sensor data (see `websocket/ws-server-docker/README.md`)

## Step-by-Step Instructions

### Step 1: Understanding Sensor Data Messages

The server sends sensor-data messages periodically (every 3 seconds by default):

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

### Step 2: Updating Device Data

Update device data when sensor-data message arrives:

```typescript
case "sensor-data":
  setDevices((prev) => {
    const newDevices = new Map(prev);
    const device = newDevices.get(message.deviceId);
    if (device) {
      newDevices.set(message.deviceId, {
        ...device,
        data: message.data,
        lastUpdate: message.timestamp,
        status: "online", // Sensor data means device is online
      });
    }
    return newDevices;
  });
  break;
```

### Step 3: Color Coding Sensor Values

Create functions to determine colors based on sensor values:

```typescript
const getTemperatureColor = (temp: number): "red" | "blue" | "green" => {
  if (temp > 27) return "red";   // Hot
  if (temp < 18) return "blue";  // Cold
  return "green";                 // Normal
};

const getHumidityColor = (humidity: number): "orange" | "gray" | "green" => {
  if (humidity > 70) return "orange"; // High
  if (humidity < 30) return "gray";   // Low
  return "green";                     // Normal
};
```

### Step 4: Displaying Sensor Data

Create a component to display sensor readings:

```typescript
<Flex direction="column" gap="2">
  <Flex align="center" justify="between">
    <Text>Temperature</Text>
    <Text color={getTemperatureColor(device.data.temperature)}>
      {device.data.temperature.toFixed(1)}°C
    </Text>
  </Flex>
  <Flex align="center" justify="between">
    <Text>Humidity</Text>
    <Text color={getHumidityColor(device.data.humidity)}>
      {device.data.humidity.toFixed(1)}%
    </Text>
  </Flex>
  <Flex align="center" justify="between">
    <Text>Power</Text>
    <Badge color={device.data.power === "on" ? "green" : "red"}>
      {device.data.power.toUpperCase()}
    </Badge>
  </Flex>
</Flex>
```

### Step 5: Formatting Timestamps

Show when data was last updated:

```typescript
const formatTimestamp = (timestamp?: number): string => {
  if (!timestamp) return "Never";
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
};
```

### Step 6: Handling Missing Data

Provide defaults for devices without data yet:

```typescript
const temperature = device.data?.temperature ?? 0;
const humidity = device.data?.humidity ?? 0;
const power = device.data?.power ?? "off";
```

## Code Examples

### Complete Sensor Data Handler

```typescript
const handleMessage = (message: ServerMessage) => {
  switch (message.type) {
    case "sensor-data":
      setDevices((prev) => {
        const newDevices = new Map(prev);
        const device = newDevices.get(message.deviceId);
        
        if (device) {
          newDevices.set(message.deviceId, {
            ...device,
            data: message.data,
            lastUpdate: message.timestamp,
            status: "online",
          });
        }
        
        return newDevices;
      });
      break;
  }
};
```

### Sensor Data Display Component

```typescript
interface SensorDataDisplayProps {
  data: DeviceData;
}

function SensorDataDisplay({ data }: SensorDataDisplayProps) {
  const tempColor = getTemperatureColor(data.temperature);
  const humidityColor = getHumidityColor(data.humidity);

  return (
    <Flex direction="column" gap="3">
      <Box p="2" style={{ background: "var(--gray-2)", borderRadius: "var(--radius-2)" }}>
        <Flex align="center" justify="between">
          <Text size="2" weight="medium">Temperature</Text>
          <Text size="3" weight="bold" color={tempColor} style={{ fontFamily: "monospace" }}>
            {data.temperature.toFixed(1)}°C
          </Text>
        </Flex>
      </Box>

      <Box p="2" style={{ background: "var(--gray-2)", borderRadius: "var(--radius-2)" }}>
        <Flex align="center" justify="between">
          <Text size="2" weight="medium">Humidity</Text>
          <Text size="3" weight="bold" color={humidityColor} style={{ fontFamily: "monospace" }}>
            {data.humidity.toFixed(1)}%
          </Text>
        </Flex>
      </Box>

      <Box p="2" style={{ background: "var(--gray-2)", borderRadius: "var(--radius-2)" }}>
        <Flex align="center" justify="between">
          <Text size="2" weight="medium">Power</Text>
          <Badge color={data.power === "on" ? "green" : "red"}>
            {data.power.toUpperCase()}
          </Badge>
        </Flex>
      </Box>
    </Flex>
  );
}
```

### Real-time Update Indicator

Show when data was last updated:

```typescript
{device.lastUpdate && (
  <Flex align="center" gap="2">
    <UpdateIcon />
    <Text size="1" color="gray">
      Updated: {formatTimestamp(device.lastUpdate)}
    </Text>
  </Flex>
)}
```

## Explanations

### Why Update Status to Online?

When sensor data arrives, it means the device is actively sending data, so it's online:

```typescript
status: "online", // Sensor data means device is online
```

This automatically updates device status without needing separate status messages.

### Color Coding Logic

**Temperature:**
- Red (>27°C): Hot - may need cooling
- Green (18-27°C): Normal range
- Blue (<18°C): Cold - may need heating

**Humidity:**
- Orange (>70%): High - may cause issues
- Green (30-70%): Normal range
- Gray (<30%): Low - may be too dry

These thresholds can be adjusted based on your use case.

### Immutable Updates

Always create new objects when updating:

```typescript
newDevices.set(message.deviceId, {
  ...device,              // Spread existing device
  data: message.data,     // Update data
  lastUpdate: message.timestamp,  // Update timestamp
  status: "online",       // Update status
});
```

### Handling Missing Devices

Check if device exists before updating:

```typescript
const device = newDevices.get(message.deviceId);
if (device) {
  // Update device
}
```

This prevents errors if sensor data arrives for unknown devices.

## Common Pitfalls

1. **Not handling missing data:**
   - Use nullish coalescing: `data?.temperature ?? 0`
   - Provide sensible defaults
   - Show "N/A" for missing values

2. **Stale data display:**
   - Always update from latest message
   - Don't cache old sensor values
   - Clear data when device goes offline

3. **Performance with many devices:**
   - Use React.memo for device cards
   - Limit re-renders with proper state structure
   - Consider virtualization for large lists

4. **Timestamp formatting:**
   - Handle undefined/null timestamps
   - Use consistent timezone
   - Show relative time for recent updates

## Exercises

1. **Add data history:**
   - Store last N sensor readings
   - Display simple line chart
   - Show min/max values

2. **Add alerts:**
   - Alert when temperature exceeds threshold
   - Alert when humidity is too high/low
   - Show alert badges on device cards

3. **Add data statistics:**
   - Calculate average temperature/humidity
   - Show data update frequency
   - Display data range

## Summary

In this workshop, you've learned to:

✅ Handle sensor-data messages  
✅ Update device data in real-time  
✅ Visualize sensor readings with color coding  
✅ Display live sensor dashboard  
✅ Format timestamps for display  
✅ Handle missing or default data  

**Key Takeaways:**
- Sensor data updates automatically mark devices as online
- Color coding helps users quickly identify issues
- Always handle missing data gracefully
- Update state immutably for React to detect changes
- Real-time updates create engaging user experience

## Next Steps

- **Workshop 5:** Device Control - Sending Device Commands
- Experiment with different color thresholds
- Add data visualization components
- Review React performance optimization techniques

