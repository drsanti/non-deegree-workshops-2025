# Workshop 8: Custom React Hooks for WebSocket

**Duration:** 60-75 minutes  
**Level:** Advanced

## Introduction

In this workshop, you'll learn how to create custom React hooks to encapsulate WebSocket logic, making it reusable across components. You'll build hooks for connection management, device data, and message handling.

## What You'll Learn

- Creating custom React hooks
- Encapsulating WebSocket logic in hooks
- Building reusable hooks for device data
- Creating hooks for message handling
- Sharing state between components with hooks
- Testing custom hooks

## Prerequisites

Before starting, you should have:
- Completed Workshop 7 (Error Handling)
- Deep understanding of React hooks
- Knowledge of custom hook patterns
- Understanding of hook dependencies

## Step-by-Step Instructions

### Step 1: Understanding Custom Hooks

Custom hooks are functions that start with "use" and can call other hooks:

```typescript
function useWebSocket(url: string) {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  // ... hook logic ...
  return { status, sendMessage };
}
```

### Step 2: Creating useWebSocket Hook

Create a hook for WebSocket connection:

```typescript
function useWebSocket(url: string) {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const wsRef = useRef<WebSocket | null>(null);
  const messageHandlersRef = useRef<Map<string, (message: ServerMessage) => void>>(new Map());

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setStatus("connected");
    ws.onclose = () => setStatus("disconnected");
    ws.onerror = () => setStatus("error");

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as ServerMessage;
        messageHandlersRef.current.forEach((handler) => handler(message));
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    return () => {
      ws.close();
    };
  }, [url]);

  const sendMessage = useCallback((message: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const onMessage = useCallback((type: string, handler: (message: ServerMessage) => void) => {
    messageHandlersRef.current.set(type, handler);
    return () => {
      messageHandlersRef.current.delete(type);
    };
  }, []);

  return { status, sendMessage, onMessage };
}
```

### Step 3: Creating useDeviceData Hook

Create a hook for managing device data:

```typescript
function useDeviceData() {
  const [devices, setDevices] = useState<Map<string, Device>>(new Map());

  const updateDevice = useCallback((deviceId: string, updates: Partial<Device>) => {
    setDevices((prev) => {
      const newDevices = new Map(prev);
      const device = newDevices.get(deviceId);
      if (device) {
        newDevices.set(deviceId, { ...device, ...updates });
      }
      return newDevices;
    });
  }, []);

  const setDeviceList = useCallback((deviceList: Device[]) => {
    const deviceMap = new Map<string, Device>();
    deviceList.forEach((device) => {
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
  }, []);

  return { devices, updateDevice, setDeviceList };
}
```

### Step 4: Combining Hooks

Combine hooks to create a complete solution:

```typescript
function useIoTDevices(url: string) {
  const { status, sendMessage, onMessage } = useWebSocket(url);
  const { devices, updateDevice, setDeviceList } = useDeviceData();

  useEffect(() => {
    const unsubscribe = onMessage("device-list", (message) => {
      if (message.type === "device-list") {
        setDeviceList(message.devices.map((d) => ({ ...d, data: { temperature: 0, humidity: 0, power: "off" } })));
      }
    });

    return unsubscribe;
  }, [onMessage, setDeviceList]);

  useEffect(() => {
    const unsubscribe = onMessage("sensor-data", (message) => {
      if (message.type === "sensor-data") {
        updateDevice(message.deviceId, {
          data: message.data,
          lastUpdate: message.timestamp,
          status: "online",
        });
      }
    });

    return unsubscribe;
  }, [onMessage, updateDevice]);

  const sendCommand = useCallback((deviceId: string, command: string, value?: number) => {
    sendMessage({
      type: "device-command",
      deviceId,
      command: command as any,
      value,
      timestamp: Date.now(),
    });
  }, [sendMessage]);

  return { status, devices, sendCommand };
}
```

### Step 5: Using Custom Hooks in Components

Use the custom hook in components:

```typescript
function DeviceDashboard() {
  const { status, devices, sendCommand } = useIoTDevices("ws://localhost:7890");

  return (
    <Box>
      <Text>Status: {status}</Text>
      {Array.from(devices.values()).map((device) => (
        <DeviceCard
          key={device.id}
          device={device}
          onCommand={sendCommand}
        />
      ))}
    </Box>
  );
}
```

## Code Examples

### Complete useWebSocket Hook

```typescript
interface UseWebSocketReturn {
  status: ConnectionStatus;
  sendMessage: (message: ClientMessage) => void;
  onMessage: (type: string, handler: (message: ServerMessage) => void) => () => void;
}

function useWebSocket(url: string): UseWebSocketReturn {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const wsRef = useRef<WebSocket | null>(null);
  const messageHandlersRef = useRef<Map<string, (message: ServerMessage) => void>>(new Map());
  const isCleaningUpRef = useRef<boolean>(false);

  useEffect(() => {
    isCleaningUpRef.current = false;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!isCleaningUpRef.current) {
        setStatus("connected");
      }
    };

    ws.onclose = () => {
      if (!isCleaningUpRef.current) {
        setStatus("disconnected");
      }
    };

    ws.onerror = () => {
      if (!isCleaningUpRef.current) {
        setStatus("error");
      }
    };

    ws.onmessage = (event: MessageEvent) => {
      if (isCleaningUpRef.current) return;

      try {
        const message = JSON.parse(event.data) as ServerMessage;
        messageHandlersRef.current.forEach((handler) => handler(message));
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    return () => {
      isCleaningUpRef.current = true;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [url]);

  const sendMessage = useCallback((message: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        ...message,
        timestamp: Date.now(),
      }));
    }
  }, []);

  const onMessage = useCallback((type: string, handler: (message: ServerMessage) => void) => {
    messageHandlersRef.current.set(type, handler);
    return () => {
      messageHandlersRef.current.delete(type);
    };
  }, []);

  return { status, sendMessage, onMessage };
}
```

### useDeviceData Hook

```typescript
interface UseDeviceDataReturn {
  devices: Map<string, Device>;
  updateDevice: (deviceId: string, updates: Partial<Device>) => void;
  setDeviceList: (deviceList: Array<Omit<Device, "data"> & { data?: DeviceData }>) => void;
  getDevice: (deviceId: string) => Device | undefined;
}

function useDeviceData(): UseDeviceDataReturn {
  const [devices, setDevices] = useState<Map<string, Device>>(new Map());

  const updateDevice = useCallback((deviceId: string, updates: Partial<Device>) => {
    setDevices((prev) => {
      const newDevices = new Map(prev);
      const device = newDevices.get(deviceId);
      if (device) {
        newDevices.set(deviceId, { ...device, ...updates });
      }
      return newDevices;
    });
  }, []);

  const setDeviceList = useCallback((deviceList: Array<Omit<Device, "data"> & { data?: DeviceData }>) => {
    const deviceMap = new Map<string, Device>();
    deviceList.forEach((device) => {
      deviceMap.set(device.id, {
        ...device,
        data: device.data || {
          temperature: 0,
          humidity: 0,
          power: "off",
        },
      });
    });
    setDevices(deviceMap);
  }, []);

  const getDevice = useCallback((deviceId: string) => {
    return devices.get(deviceId);
  }, [devices]);

  return { devices, updateDevice, setDeviceList, getDevice };
}
```

## Explanations

### Why Custom Hooks?

**Reusability:**
- Share logic between components
- Avoid code duplication
- Consistent behavior

**Separation of Concerns:**
- Business logic separate from UI
- Easier to test
- Easier to maintain

**Composability:**
- Combine hooks to build complex features
- Build on existing hooks
- Create hook libraries

### Hook Dependencies

Always include dependencies in useEffect:

```typescript
useEffect(() => {
  // Effect code
}, [dependency1, dependency2]); // Include all dependencies
```

Missing dependencies can cause bugs and stale closures.

### Returning Cleanup Functions

Hooks can return cleanup functions:

```typescript
const onMessage = (type: string, handler: Function) => {
  // Register handler
  return () => {
    // Cleanup: unregister handler
  };
};
```

This allows components to clean up when unmounting.

### Using useCallback

Wrap functions returned from hooks with useCallback:

```typescript
const sendMessage = useCallback((message: ClientMessage) => {
  // Implementation
}, []); // Empty deps if function doesn't depend on state/props
```

This prevents unnecessary re-renders in child components.

## Common Pitfalls

1. **Missing dependencies:**
   - Include all dependencies in useEffect
   - Use ESLint rules to catch missing deps
   - Review dependency arrays carefully

2. **Stale closures:**
   - Use functional setState
   - Use refs for values that don't trigger re-renders
   - Be careful with closures in callbacks

3. **Infinite loops:**
   - Don't create new objects/arrays in dependencies
   - Use useMemo/useCallback appropriately
   - Check for circular dependencies

4. **Not cleaning up:**
   - Always return cleanup functions
   - Clear timeouts/intervals
   - Remove event listeners

## Exercises

1. **Add reconnection to useWebSocket:**
   - Implement automatic reconnection
   - Add reconnection options
   - Track reconnection attempts

2. **Create useDeviceCommand hook:**
   - Encapsulate command sending logic
   - Add command validation
   - Track command history

3. **Create useMessageQueue hook:**
   - Queue messages when disconnected
   - Send queued messages when connected
   - Handle message priorities

## Summary

In this workshop, you've learned to:

✅ Create custom React hooks  
✅ Encapsulate WebSocket logic in hooks  
✅ Build reusable hooks for device data  
✅ Combine hooks for complex features  
✅ Share state between components  
✅ Return cleanup functions from hooks  

**Key Takeaways:**
- Custom hooks start with "use"
- Encapsulate reusable logic in hooks
- Use useCallback for returned functions
- Always include dependencies in useEffect
- Return cleanup functions when needed
- Combine hooks to build complex features

## Next Steps

- **Workshop 9:** Advanced Features
- Practice creating more custom hooks
- Build a hook library
- Review React hooks best practices

