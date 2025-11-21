# Workshop 10: Best Practices & Production Ready

**Duration:** 60-75 minutes  
**Level:** Advanced

## Introduction

In this final workshop, you'll learn best practices for building production-ready WebSocket clients. You'll cover type safety, proper cleanup, memory leak prevention, testing strategies, and deployment considerations.

## What You'll Learn

- Type safety with TypeScript
- Proper resource cleanup
- Memory leak prevention
- Testing WebSocket clients
- Production deployment tips
- Performance monitoring
- Error tracking
- Security considerations

## Prerequisites

Before starting, you should have:
- Completed all previous workshops
- Understanding of production deployment
- Knowledge of testing strategies
- Understanding of security best practices

## Step-by-Step Instructions

### Step 1: Type Safety Best Practices

Use strict TypeScript configuration:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

Use discriminated unions for messages:

```typescript
type ServerMessage =
  | { type: "device-list"; devices: Device[]; timestamp: number }
  | { type: "sensor-data"; deviceId: string; data: DeviceData; timestamp: number }
  | { type: "error"; message: string; timestamp: number };

// TypeScript narrows type automatically
function handleMessage(message: ServerMessage) {
  switch (message.type) {
    case "device-list":
      // message.devices is available
      break;
    case "sensor-data":
      // message.deviceId and message.data are available
      break;
  }
}
```

### Step 2: Comprehensive Cleanup

Ensure all resources are cleaned up:

```typescript
useEffect(() => {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  const intervals: ReturnType<typeof setInterval>[] = [];
  const listeners: Array<() => void> = [];

  // Setup code
  const timeout = setTimeout(() => {}, 1000);
  timeouts.push(timeout);

  const interval = setInterval(() => {}, 1000);
  intervals.push(interval);

  const cleanup = subscribe(() => {});
  listeners.push(cleanup);

  return () => {
    // Cleanup all resources
    timeouts.forEach(clearTimeout);
    intervals.forEach(clearInterval);
    listeners.forEach((cleanup) => cleanup());
  };
}, []);
```

### Step 3: Memory Leak Prevention

Prevent common memory leaks:

```typescript
// ❌ Bad - creates new function on every render
useEffect(() => {
  ws.onmessage = (event) => {
    handleMessage(event.data);
  };
}, [handleMessage]); // handleMessage changes every render

// ✅ Good - stable reference
const handleMessage = useCallback((data: string) => {
  // Handle message
}, []);

useEffect(() => {
  ws.onmessage = (event) => {
    handleMessage(event.data);
  };
}, [handleMessage]); // handleMessage is stable
```

### Step 4: Error Tracking

Implement error tracking:

```typescript
const logError = (error: Error, context?: Record<string, unknown>) => {
  console.error("Error:", error, context);
  
  // Send to error tracking service (e.g., Sentry)
  if (window.Sentry) {
    window.Sentry.captureException(error, { extra: context });
  }
  
  // Or send to your logging service
  fetch("/api/logs", {
    method: "POST",
    body: JSON.stringify({ error: error.message, context }),
  });
};
```

### Step 5: Performance Monitoring

Monitor performance metrics:

```typescript
const usePerformanceMonitor = () => {
  useEffect(() => {
    const metrics = {
      messageCount: 0,
      averageLatency: 0,
      connectionUptime: 0,
    };

    const interval = setInterval(() => {
      // Send metrics to monitoring service
      fetch("/api/metrics", {
        method: "POST",
        body: JSON.stringify(metrics),
      });
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, []);
};
```

### Step 6: Security Best Practices

Implement security measures:

```typescript
// Validate all incoming messages
const validateMessage = (data: unknown): data is ServerMessage => {
  // Check message structure
  // Validate data types
  // Check for malicious content
  // Rate limit checks
  return isValid;
};

// Sanitize user input
const sanitizeInput = (input: string): string => {
  // Remove dangerous characters
  // Validate format
  // Limit length
  return sanitized;
};

// Use HTTPS/WSS in production
const WS_URL = process.env.NODE_ENV === "production"
  ? "wss://api.example.com"
  : "ws://localhost:7890";
```

## Code Examples

### Production-Ready WebSocket Hook

```typescript
interface UseWebSocketOptions {
  url: string;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

function useWebSocket(options: UseWebSocketOptions) {
  const {
    url,
    reconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    onError,
    onConnect,
    onDisconnect,
  } = options;

  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCleaningUpRef = useRef<boolean>(false);
  const messageHandlersRef = useRef<Map<string, (message: ServerMessage) => void>>(new Map());

  const connect = useCallback(() => {
    if (isCleaningUpRef.current) return;

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (isCleaningUpRef.current) {
          ws.close();
          return;
        }
        setStatus("connected");
        reconnectAttemptsRef.current = 0;
        onConnect?.();
      };

      ws.onclose = (event) => {
        if (isCleaningUpRef.current) return;

        setStatus("disconnected");
        onDisconnect?.();

        if (reconnect && event.code !== 1000) {
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current++;
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, reconnectInterval);
          } else {
            onError?.(new Error("Max reconnection attempts reached"));
          }
        }
      };

      ws.onerror = (error) => {
        if (!isCleaningUpRef.current) {
          const err = new Error("WebSocket error");
          onError?.(err);
        }
      };

      ws.onmessage = (event) => {
        if (isCleaningUpRef.current) return;

        try {
          const message = JSON.parse(event.data) as ServerMessage;
          messageHandlersRef.current.forEach((handler) => handler(message));
        } catch (error) {
          onError?.(error as Error);
        }
      };
    } catch (error) {
      onError?.(error as Error);
    }
  }, [url, reconnect, reconnectInterval, maxReconnectAttempts, onError, onConnect, onDisconnect]);

  useEffect(() => {
    connect();
    return () => {
      isCleaningUpRef.current = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

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

  return { status, sendMessage, onMessage, reconnect: connect };
}
```

### Testing WebSocket Client

```typescript
// Mock WebSocket for testing
class MockWebSocket {
  readyState = WebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;

  send(data: string) {
    // Mock send
  }

  close() {
    this.readyState = WebSocket.CLOSED;
    this.onclose?.(new CloseEvent("close"));
  }

  simulateOpen() {
    this.readyState = WebSocket.OPEN;
    this.onopen?.(new Event("open"));
  }

  simulateMessage(data: ServerMessage) {
    this.onmessage?.(new MessageEvent("message", { data: JSON.stringify(data) }));
  }
}

// Test
describe("WebSocket Client", () => {
  it("should connect and receive messages", () => {
    const mockWs = new MockWebSocket();
    global.WebSocket = MockWebSocket as any;

    // Test connection and message handling
  });
});
```

## Explanations

### Why Strict TypeScript?

**Type Safety:**
- Catches errors at compile time
- Prevents runtime errors
- Better IDE support
- Self-documenting code

**Maintainability:**
- Easier refactoring
- Clear contracts
- Fewer bugs
- Better team collaboration

### Why Comprehensive Cleanup?

**Memory Leaks:**
- Prevents memory leaks
- Frees resources
- Avoids performance issues
- Better user experience

**Reliability:**
- Prevents race conditions
- Avoids stale closures
- Clean state transitions
- Predictable behavior

### Why Error Tracking?

**Debugging:**
- Track errors in production
- Understand user issues
- Fix bugs faster
- Improve reliability

**Monitoring:**
- Monitor error rates
- Track error trends
- Alert on critical errors
- Measure improvements

### Why Performance Monitoring?

**Optimization:**
- Identify bottlenecks
- Measure improvements
- Track performance trends
- Optimize user experience

**Scaling:**
- Understand load patterns
- Plan capacity
- Optimize resources
- Improve efficiency

## Common Pitfalls

1. **Not cleaning up:**
   - Always clean up resources
   - Use cleanup functions
   - Clear timeouts/intervals
   - Remove event listeners

2. **Memory leaks:**
   - Avoid closures over state
   - Use refs for stable values
   - Clean up subscriptions
   - Monitor memory usage

3. **Not handling errors:**
   - Always handle errors
   - Log errors properly
   - Show user-friendly messages
   - Track errors in production

4. **Security issues:**
   - Validate all input
   - Use HTTPS/WSS
   - Sanitize user data
   - Rate limit requests

## Exercises

1. **Add error tracking:**
   - Integrate error tracking service
   - Add error boundaries
   - Track error metrics

2. **Add performance monitoring:**
   - Track message latency
   - Monitor connection quality
   - Measure render performance

3. **Add security measures:**
   - Implement message validation
   - Add rate limiting
   - Sanitize user input

## Summary

In this workshop, you've learned to:

✅ Use strict TypeScript for type safety  
✅ Implement comprehensive cleanup  
✅ Prevent memory leaks  
✅ Test WebSocket clients  
✅ Deploy to production  
✅ Monitor performance  
✅ Track errors  
✅ Implement security measures  

**Key Takeaways:**
- Type safety prevents many bugs
- Always clean up resources
- Monitor performance and errors
- Test thoroughly before production
- Security is critical
- Document your code
- Follow best practices consistently

## Next Steps

- Deploy your application
- Set up monitoring and error tracking
- Write comprehensive tests
- Review and optimize performance
- Document your code
- Share your knowledge with others

Congratulations on completing all 10 workshops! You now have the knowledge to build production-ready WebSocket clients.

