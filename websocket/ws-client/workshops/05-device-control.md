# Workshop 5: Device Control - Sending Device Commands

**Duration:** 45-60 minutes  
**Level:** Intermediate

## Introduction

In this workshop, you'll learn how to send commands to IoT devices through the WebSocket connection. You'll implement device control interfaces, validate commands, and handle command responses from the server.

## What You'll Learn

- Sending device-command messages
- Command validation
- Building device control UI
- Handling command responses
- Error handling for failed commands

## Prerequisites

Before starting, you should have:
- Completed Workshop 4 (Real-time Sensor Data)
- Understanding of form handling in React
- Knowledge of input validation
- WebSocket server running via Docker with devices that accept commands (see `websocket/ws-server-docker/README.md`)

## Step-by-Step Instructions

### Step 1: Understanding Device Commands

Devices accept three types of commands:

```typescript
type DeviceCommand = "toggle-power" | "set-temperature" | "set-humidity";
```

**Command Message Format:**
```json
{
  "type": "device-command",
  "deviceId": "device-001",
  "command": "toggle-power",
  "value": null,
  "timestamp": 1234567890123
}
```

### Step 2: Creating Command Handler

Create a function to send commands:

```typescript
const sendCommand = (
  deviceId: string,
  command: "toggle-power" | "set-temperature" | "set-humidity",
  value?: number
): void => {
  if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
    wsRef.current.send(
      JSON.stringify({
        type: "device-command",
        deviceId,
        command,
        value,
        timestamp: Date.now(),
      })
    );
  } else {
    console.error("WebSocket is not connected");
  }
};
```

### Step 3: Toggle Power Command

Implement power toggle button:

```typescript
const handleTogglePower = (deviceId: string) => {
  sendCommand(deviceId, "toggle-power");
};
```

### Step 4: Set Temperature Command

Create form for setting temperature:

```typescript
const handleSetTemperature = (e: FormEvent<HTMLFormElement>, deviceId: string) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  const temp = parseFloat(formData.get("temperature") as string);
  
  if (!isNaN(temp) && temp >= 0 && temp <= 50) {
    sendCommand(deviceId, "set-temperature", temp);
  } else {
    alert("Temperature must be between 0 and 50°C");
  }
};
```

### Step 5: Set Humidity Command

Similar to temperature, but with different range:

```typescript
const handleSetHumidity = (e: FormEvent<HTMLFormElement>, deviceId: string) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  const humidity = parseFloat(formData.get("humidity") as string);
  
  if (!isNaN(humidity) && humidity >= 0 && humidity <= 100) {
    sendCommand(deviceId, "set-humidity", humidity);
  } else {
    alert("Humidity must be between 0 and 100%");
  }
};
```

### Step 6: Disable Controls for Offline Devices

Only allow commands when device is online:

```typescript
<Button
  onClick={() => handleTogglePower(device.id)}
  disabled={device.status !== "online"}
>
  Toggle Power
</Button>
```

### Step 7: Handling Command Responses

Server responds with device-status or error messages:

```typescript
case "device-status":
  // Device status updated after command
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

case "error":
  // Command failed
  console.error("Command error:", message.message);
  // Show error to user
  break;
```

## Code Examples

### Complete Command Handler

```typescript
const sendCommand: DeviceCommandHandler = (
  deviceId: string,
  command: "toggle-power" | "set-temperature" | "set-humidity",
  value?: number
): void => {
  if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
    const commandMessage: DeviceCommandMessage = {
      type: "device-command",
      deviceId,
      command,
      value,
      timestamp: Date.now(),
    };
    wsRef.current.send(JSON.stringify(commandMessage));
  } else {
    console.error("WebSocket is not connected");
    // Could show user-friendly error message
  }
};
```

### Device Control Component

```typescript
interface DeviceControlsProps {
  device: Device;
  onCommand: DeviceCommandHandler;
}

function DeviceControls({ device, onCommand }: DeviceControlsProps) {
  const isOnline = device.status === "online";

  const handleTogglePower = () => {
    onCommand(device.id, "toggle-power");
  };

  const handleSetTemperature = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const temp = parseFloat(formData.get("temperature") as string);
    
    if (!isNaN(temp) && temp >= 0 && temp <= 50) {
      onCommand(device.id, "set-temperature", temp);
    }
  };

  return (
    <Flex direction="column" gap="3">
      <Button
        onClick={handleTogglePower}
        disabled={!isOnline}
        color={device.data.power === "on" ? "red" : "green"}
      >
        {device.data.power === "on" ? "Turn Off" : "Turn On"}
      </Button>

      <form onSubmit={handleSetTemperature}>
        <Flex gap="2">
          <TextField.Root
            type="number"
            name="temperature"
            min="0"
            max="50"
            step="0.1"
            defaultValue={device.data.temperature.toFixed(1)}
            disabled={!isOnline}
          />
          <Button type="submit" disabled={!isOnline}>
            Set Temp
          </Button>
        </Flex>
      </form>
    </Flex>
  );
}
```

### Command Validation

```typescript
const validateCommand = (
  command: string,
  value?: number
): { valid: boolean; error?: string } => {
  if (command === "set-temperature") {
    if (value === undefined) {
      return { valid: false, error: "Temperature value is required" };
    }
    if (value < 0 || value > 50) {
      return { valid: false, error: "Temperature must be between 0 and 50°C" };
    }
  }
  
  if (command === "set-humidity") {
    if (value === undefined) {
      return { valid: false, error: "Humidity value is required" };
    }
    if (value < 0 || value > 100) {
      return { valid: false, error: "Humidity must be between 0 and 100%" };
    }
  }
  
  return { valid: true };
};
```

## Explanations

### Why Check Connection State?

Before sending commands, always verify the connection:

```typescript
if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
  // Send command
}
```

This prevents errors and provides better user feedback.

### Command Validation

Validate commands on the client side:
- **Immediate feedback:** User knows if input is invalid
- **Reduced server load:** Invalid commands never sent
- **Better UX:** Clear error messages

Server should also validate for security.

### Disable Controls for Offline Devices

Only allow commands when device is online:

```typescript
disabled={device.status !== "online"}
```

This prevents sending commands to devices that can't respond.

### Handling Command Responses

Commands may result in:
- **device-status message:** Command succeeded, device updated
- **error message:** Command failed, reason provided
- **No response:** Connection issue or timeout

Handle all cases appropriately.

## Common Pitfalls

1. **Not validating input:**
   - Always validate before sending
   - Check number ranges
   - Handle NaN and undefined values

2. **Sending to offline devices:**
   - Check device status first
   - Disable controls for offline devices
   - Show clear feedback

3. **Not handling errors:**
   - Listen for error messages
   - Show user-friendly error messages
   - Log errors for debugging

4. **Race conditions:**
   - Don't send multiple commands rapidly
   - Wait for response before sending next
   - Use loading states

## Exercises

1. **Add command confirmation:**
   - Show confirmation dialog for critical commands
   - Add undo functionality
   - Track command history

2. **Add command queuing:**
   - Queue commands when device is offline
   - Send queued commands when device comes online
   - Show queued commands in UI

3. **Add command feedback:**
   - Show loading state while command is processing
   - Display success/error messages
   - Animate UI changes

## Summary

In this workshop, you've learned to:

✅ Send device-command messages  
✅ Validate commands before sending  
✅ Build device control UI components  
✅ Handle command responses  
✅ Disable controls for offline devices  
✅ Provide user feedback for commands  

**Key Takeaways:**
- Always validate commands on the client
- Check connection state before sending
- Disable controls for offline devices
- Handle both success and error responses
- Provide clear user feedback

## Next Steps

- **Workshop 6:** Connection Management & Reconnection
- Practice with different command types
- Add command history tracking
- Review form handling best practices

