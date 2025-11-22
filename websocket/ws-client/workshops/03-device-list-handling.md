# Workshop 3: Device List Handling

**Duration:** 45-60 minutes  
**Level:** Beginner to Intermediate

## Introduction

In this workshop, you'll learn how to handle device list messages from the WebSocket server. You'll manage device state with React hooks, display devices in a list, and update the UI when new devices are added or removed.

## What You'll Learn

- Receiving device-list messages
- Managing device state with React hooks
- Using Map for efficient device storage
- Displaying device information
- Handling device updates

## Prerequisites

Before starting, you should have:
- Completed Workshop 2 (Basic Messaging)
- Understanding of React state management
- Knowledge of JavaScript Map data structure
- WebSocket server running via Docker with devices configured (see `websocket/ws-server-docker/README.md`)

## Step-by-Step Instructions

### Step 1: Understanding Device List Message

The server sends a device-list message when:
- A client first connects
- Devices are added or removed
- Client requests the device list

**Message Format:**
```json
{
  "type": "device-list",
  "devices": [
    {
      "id": "device-001",
      "name": "Temperature Sensor",
      "type": "sensor",
      "status": "online",
      "lastUpdate": 1234567890123
    }
  ],
  "timestamp": 1234567890123
}
```

### Step 2: Storing Devices in State

Use a Map for efficient device lookups:

```typescript
const [devices, setDevices] = useState<Map<string, Device>>(new Map());
```

**Why Map instead of Array?**
- O(1) lookup by device ID
- Easy to update individual devices
- Efficient for frequent updates

### Step 3: Handling Device List Message

Process the device-list message:

```typescript
const handleMessage = (message: ServerMessage) => {
  switch (message.type) {
    case "device-list":
      const deviceMap = new Map<string, Device>();
      message.devices.forEach((device) => {
        deviceMap.set(device.id, {
          ...device,
          data: {
            temperature: 0,
            humidity: 0,
            power: "off",
          },
        });
      });
      setDevices(deviceMap);
      break;
  }
};
```

### Step 4: Displaying Device List

Render devices from the Map:

```typescript
<Flex direction="column" gap="3">
  {Array.from(devices.values()).map((device) => (
    <Card key={device.id}>
      <Heading>{device.name}</Heading>
      <Text size="1">{device.id}</Text>
      <Badge color={device.status === "online" ? "green" : "red"}>
        {device.status}
      </Badge>
    </Card>
  ))}
</Flex>
```

### Step 5: Updating Individual Devices

When receiving sensor-data or device-status messages, update specific devices:

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
        status: "online",
      });
    }
    return newDevices;
  });
  break;
```

### Step 6: Handling Empty Device List

Show a message when no devices are available:

```typescript
{devices.size === 0 ? (
  <Box p="6" style={{ textAlign: "center" }}>
    <Text color="gray">No devices available</Text>
  </Box>
) : (
  // Render device list
)}
```

## Code Examples

### Complete Device List Handler

```typescript
const handleMessage = (message: ServerMessage) => {
  switch (message.type) {
    case "device-list":
      // Replace entire device list
      const deviceMap = new Map<string, Device>();
      message.devices.forEach((device) => {
        deviceMap.set(device.id, {
          ...device,
          data: {
            temperature: 0,
            humidity: 0,
            power: "off",
          },
        });
      });
      setDevices(deviceMap);
      break;

    case "sensor-data":
      // Update device sensor data
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

    case "device-status":
      // Update device status
      setDevices((prev) => {
        const newDevices = new Map(prev);
        const device = newDevices.get(message.deviceId);
        if (device) {
          newDevices.set(message.deviceId, {
            ...device,
            status: message.status,
            data: message.data,
            lastUpdate: message.timestamp,
          });
        }
        return newDevices;
      });
      break;
  }
};
```

### Device Card Component

```typescript
interface DeviceCardProps {
  device: Device;
}

function DeviceCard({ device }: DeviceCardProps) {
  return (
    <Card>
      <Flex direction="column" gap="2">
        <Heading size="4">{device.name}</Heading>
        <Text size="1" color="gray">{device.id}</Text>
        <Badge color={device.status === "online" ? "green" : "red"}>
          {device.status}
        </Badge>
        <Text size="2">
          Type: {device.type}
        </Text>
        {device.lastUpdate && (
          <Text size="1" color="gray">
            Last update: {new Date(device.lastUpdate).toLocaleTimeString()}
          </Text>
        )}
      </Flex>
    </Card>
  );
}
```

## Explanations

### Why Use Map for Devices?

**Advantages:**
- Fast lookups: O(1) by device ID
- Easy updates: `map.set(id, device)`
- Maintains insertion order (in modern JavaScript)
- Efficient for frequent updates

**When to use Array:**
- Need to sort devices
- Need array methods (filter, map, reduce)
- Simple list without frequent lookups

### Immutable Updates with Map

Always create a new Map when updating:

```typescript
// ✅ Correct - creates new Map
setDevices((prev) => {
  const newDevices = new Map(prev);
  newDevices.set(id, updatedDevice);
  return newDevices;
});

// ❌ Wrong - mutates existing Map
const newDevices = devices;
newDevices.set(id, updatedDevice);
setDevices(newDevices);
```

### Converting Map to Array

Use `Array.from()` to render:

```typescript
Array.from(devices.values())  // Get all devices
Array.from(devices.keys())    // Get all device IDs
Array.from(devices.entries()) // Get [id, device] pairs
```

### Device State Initialization

Initialize devices with default data:

```typescript
deviceMap.set(device.id, {
  ...device,
  data: {
    temperature: 0,
    humidity: 0,
    power: "off",
  },
});
```

This ensures devices always have data structure, even before sensor updates arrive.

## Common Pitfalls

1. **Mutating Map directly:**
   - Always create a new Map
   - Use functional setState updates
   - Spread existing Map: `new Map(prev)`

2. **Not handling missing devices:**
   - Check if device exists before updating
   - Handle cases where device ID doesn't exist
   - Show appropriate error messages

3. **Stale closures:**
   - Use functional setState: `setDevices((prev) => ...)`
   - Don't rely on devices variable in callbacks
   - Use refs for values that don't trigger re-renders

4. **Memory leaks:**
   - Clear devices on disconnect
   - Remove devices when they're deleted
   - Limit device history if storing old data

## Exercises

1. **Add device filtering:**
   - Filter by device type (sensor/controller)
   - Filter by status (online/offline)
   - Add search by device name

2. **Add device sorting:**
   - Sort by name alphabetically
   - Sort by last update time
   - Sort by status

3. **Add device statistics:**
   - Count online vs offline devices
   - Count by device type
   - Show total devices

## Summary

In this workshop, you've learned to:

✅ Receive device-list messages  
✅ Store devices in a Map for efficient lookups  
✅ Display device information in the UI  
✅ Update individual devices from sensor data  
✅ Handle device status changes  
✅ Manage device state immutably  

**Key Takeaways:**
- Map is efficient for device storage and lookups
- Always create new Map instances for updates
- Initialize devices with default data structure
- Handle cases where devices might not exist
- Use functional setState for Map updates

## Next Steps

- **Workshop 4:** Real-time Sensor Data Updates
- Practice updating devices from different message types
- Experiment with device filtering and sorting
- Review React state management best practices

