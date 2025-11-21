# Workshop 9: Advanced Features

**Duration:** 60-75 minutes  
**Level:** Advanced

## Introduction

In this workshop, you'll learn advanced WebSocket client features including message queuing when disconnected, connection status broadcasting, performance optimization, and handling multiple device management scenarios.

## What You'll Learn

- Message queuing when disconnected
- Connection status broadcasting
- Performance optimization techniques
- Handling multiple devices efficiently
- Optimistic UI updates
- Debouncing and throttling

## Prerequisites

Before starting, you should have:
- Completed Workshop 8 (Custom Hooks)
- Understanding of performance optimization
- Knowledge of debouncing/throttling
- Understanding of message queuing patterns

## Step-by-Step Instructions

### Step 1: Message Queuing

Queue messages when disconnected and send when reconnected:

```typescript
const messageQueue = useRef<ClientMessage[]>([]);

const sendMessage = useCallback((message: ClientMessage) => {
  if (wsRef.current?.readyState === WebSocket.OPEN) {
    wsRef.current.send(JSON.stringify(message));
  } else {
    // Queue message for later
    messageQueue.current.push(message);
  }
}, []);

// Send queued messages when connected
useEffect(() => {
  if (status === "connected" && messageQueue.current.length > 0) {
    messageQueue.current.forEach((message) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message));
      }
    });
    messageQueue.current = [];
  }
}, [status]);
```

### Step 2: Connection Status Broadcasting

Track and display connection status changes:

```typescript
const [connectionHistory, setConnectionHistory] = useState<Array<{
  status: ConnectionStatus;
  timestamp: number;
}>>([]);

useEffect(() => {
  setConnectionHistory((prev) => [
    ...prev,
    { status, timestamp: Date.now() },
  ]);
}, [status]);
```

### Step 3: Performance Optimization with React.memo

Memoize device cards to prevent unnecessary re-renders:

```typescript
const DeviceCard = React.memo(({ device, onCommand }: DeviceCardProps) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison
  return (
    prevProps.device.id === nextProps.device.id &&
    prevProps.device.status === nextProps.device.status &&
    prevProps.device.data.temperature === nextProps.device.data.temperature &&
    prevProps.device.data.humidity === nextProps.device.data.humidity
  );
});
```

### Step 4: Debouncing Sensor Updates

Debounce rapid sensor updates to reduce re-renders:

```typescript
const debouncedUpdate = useRef<ReturnType<typeof setTimeout> | null>(null);

const handleSensorData = (message: SensorDataMessage) => {
  if (debouncedUpdate.current) {
    clearTimeout(debouncedUpdate.current);
  }

  debouncedUpdate.current = setTimeout(() => {
    updateDevice(message.deviceId, {
      data: message.data,
      lastUpdate: message.timestamp,
    });
  }, 100); // Wait 100ms before updating
};
```

### Step 5: Optimistic UI Updates

Update UI immediately, then sync with server:

```typescript
const sendCommand = (deviceId: string, command: string, value?: number) => {
  // Optimistic update
  const device = devices.get(deviceId);
  if (device) {
    if (command === "toggle-power") {
      updateDevice(deviceId, {
        data: {
          ...device.data,
          power: device.data.power === "on" ? "off" : "on",
        },
      });
    }
  }

  // Send to server
  sendMessage({
    type: "device-command",
    deviceId,
    command,
    value,
    timestamp: Date.now(),
  });
};
```

### Step 6: Virtual Scrolling for Large Lists

Use virtualization for many devices:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualizedDeviceList({ devices }: { devices: Device[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: devices.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <DeviceCard device={devices[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Code Examples

### Complete Message Queue Implementation

```typescript
function useMessageQueue(ws: WebSocket | null, isConnected: boolean) {
  const queueRef = useRef<ClientMessage[]>([]);
  const maxQueueSize = 100;

  const enqueue = useCallback((message: ClientMessage) => {
    if (queueRef.current.length >= maxQueueSize) {
      console.warn("Message queue full, dropping oldest message");
      queueRef.current.shift();
    }
    queueRef.current.push(message);
  }, []);

  const flush = useCallback(() => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return;
    }

    while (queueRef.current.length > 0) {
      const message = queueRef.current.shift();
      if (message) {
        ws.send(JSON.stringify(message));
      }
    }
  }, [ws]);

  useEffect(() => {
    if (isConnected) {
      flush();
    }
  }, [isConnected, flush]);

  return { enqueue, flush, queueSize: queueRef.current.length };
}
```

### Performance-Optimized Device Updates

```typescript
function useOptimizedDeviceUpdates() {
  const [devices, setDevices] = useState<Map<string, Device>>(new Map());
  const updateBatchRef = useRef<Map<string, Partial<Device>>>(new Map());
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const batchUpdate = useCallback((deviceId: string, updates: Partial<Device>) => {
    const existing = updateBatchRef.current.get(deviceId) || {};
    updateBatchRef.current.set(deviceId, { ...existing, ...updates });

    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      setDevices((prev) => {
        const newDevices = new Map(prev);
        updateBatchRef.current.forEach((updates, id) => {
          const device = newDevices.get(id);
          if (device) {
            newDevices.set(id, { ...device, ...updates });
          }
        });
        updateBatchRef.current.clear();
        return newDevices;
      });
    }, 50); // Batch updates every 50ms
  }, []);

  return { devices, batchUpdate };
}
```

### Connection Quality Monitor

```typescript
function useConnectionQuality(ws: WebSocket | null) {
  const [latency, setLatency] = useState<number | null>(null);
  const [messageCount, setMessageCount] = useState<number>(0);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return;
    }

    pingIntervalRef.current = setInterval(() => {
      const startTime = Date.now();
      ws.send(JSON.stringify({ type: "ping", timestamp: startTime }));
    }, 5000);

    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
    };
  }, [ws]);

  const handlePong = useCallback((timestamp: number) => {
    const latency = Date.now() - timestamp;
    setLatency(latency);
  }, []);

  return { latency, messageCount, quality: latency ? (latency < 100 ? "excellent" : latency < 300 ? "good" : "poor") : null };
}
```

## Explanations

### Why Message Queuing?

**User Experience:**
- Commands work even when temporarily disconnected
- No lost commands during reconnection
- Seamless experience

**Reliability:**
- Important messages not lost
- Automatic retry on reconnect
- Queue size limits prevent memory issues

### Why Debounce Updates?

**Performance:**
- Reduces re-renders
- Smoother UI
- Less CPU usage

**User Experience:**
- Prevents flickering
- Smoother animations
- Better perceived performance

### Why Optimistic Updates?

**User Experience:**
- Immediate feedback
- Feels more responsive
- Better perceived performance

**Trade-offs:**
- May need to rollback on error
- Requires conflict resolution
- More complex state management

### Why Virtual Scrolling?

**Performance:**
- Only renders visible items
- Handles thousands of items
- Smooth scrolling

**Memory:**
- Lower memory usage
- Faster initial render
- Better for large lists

## Common Pitfalls

1. **Queue growing too large:**
   - Set maximum queue size
   - Drop old messages if needed
   - Monitor queue size

2. **Memory leaks:**
   - Clear timeouts/intervals
   - Limit queue size
   - Clean up on unmount

3. **Stale optimistic updates:**
   - Rollback on error
   - Sync with server state
   - Handle conflicts

4. **Over-optimization:**
   - Profile before optimizing
   - Measure actual impact
   - Don't optimize prematurely

## Exercises

1. **Add message priorities:**
   - Priority queue for messages
   - High priority messages first
   - Low priority messages can be dropped

2. **Add connection quality indicator:**
   - Show latency
   - Display connection quality
   - Alert on poor connection

3. **Add offline mode:**
   - Cache device state
   - Show offline indicator
   - Sync when reconnected

## Summary

In this workshop, you've learned to:

✅ Implement message queuing  
✅ Track connection status history  
✅ Optimize performance with memoization  
✅ Debounce rapid updates  
✅ Implement optimistic UI updates  
✅ Use virtual scrolling for large lists  

**Key Takeaways:**
- Message queuing improves reliability
- Debouncing reduces unnecessary re-renders
- Optimistic updates improve UX
- Virtual scrolling handles large lists
- Profile before optimizing
- Balance performance with complexity

## Next Steps

- **Workshop 10:** Best Practices & Production Ready
- Profile your application
- Test with many devices
- Review performance best practices

