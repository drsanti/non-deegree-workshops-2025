# Workshop 6: Connection Management & Reconnection

**Duration:** 60-75 minutes  
**Level:** Intermediate to Advanced

## Introduction

In this workshop, you'll learn how to manage WebSocket connection lifecycle, implement automatic reconnection logic, handle connection errors gracefully, and ensure proper cleanup to prevent memory leaks.

## What You'll Learn

- Managing connection state lifecycle
- Implementing automatic reconnection
- Handling connection errors
- Proper cleanup on component unmount
- Handling React Strict Mode
- Connection retry strategies

## Prerequisites

Before starting, you should have:
- Completed Workshop 5 (Device Control)
- Understanding of React lifecycle
- Knowledge of setTimeout/clearTimeout
- Understanding of React Strict Mode behavior

## Step-by-Step Instructions

### Step 1: Understanding Connection States

WebSocket connections have several states:

```typescript
type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";
```

**State Transitions:**
- `disconnected` → `connecting` → `connected`
- `connected` → `disconnected` (normal close)
- `connected` → `error` → `disconnected` (error close)
- `error` → `connecting` (reconnection attempt)

### Step 2: Implementing Reconnection Logic

Create reconnection with exponential backoff:

```typescript
const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const reconnectAttempts = useRef<number>(0);
const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 1000; // 1 second

const reconnect = () => {
  if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
    console.error("Max reconnection attempts reached");
    return;
  }

  const delay = INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttempts.current);
  reconnectAttempts.current++;

  reconnectTimeoutRef.current = setTimeout(() => {
    connectWebSocket();
  }, delay);
};
```

### Step 3: Handling Connection Close

Detect if close was intentional or due to error:

```typescript
ws.onclose = (event: CloseEvent) => {
  // 1000 = Normal Closure, 1001 = Going Away
  // 1006 = Abnormal Closure (connection lost)
  if (event.code === 1006 || (event.code !== 1000 && event.code !== 1001)) {
    setConnectionStatus("error");
    // Attempt reconnection
    reconnect();
  } else {
    setConnectionStatus("disconnected");
  }
};
```

### Step 4: Preventing Reconnection During Cleanup

Use a flag to prevent reconnection during cleanup:

```typescript
const isCleaningUpRef = useRef<boolean>(false);

useEffect(() => {
  isCleaningUpRef.current = false;
  
  // ... connection setup ...
  
  return () => {
    isCleaningUpRef.current = true;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
  };
}, []);
```

### Step 5: Handling React Strict Mode

React Strict Mode causes double-invocation of effects. Handle this:

```typescript
const isMountedRef = useRef<boolean>(false);
const mountTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

useEffect(() => {
  mountTimeoutRef.current = setTimeout(() => {
    isMountedRef.current = true;
  }, 100);

  connectWebSocket();

  return () => {
    if (!isMountedRef.current) {
      // This is likely Strict Mode cleanup - skip it
      if (mountTimeoutRef.current) {
        clearTimeout(mountTimeoutRef.current);
      }
      return;
    }
    // Real unmount - clean up properly
    cleanup();
  };
}, []);
```

### Step 6: Resetting Reconnection Attempts

Reset attempts on successful connection:

```typescript
ws.onopen = () => {
  setConnectionStatus("connected");
  reconnectAttempts.current = 0; // Reset on successful connection
  if (reconnectTimeoutRef.current) {
    clearTimeout(reconnectTimeoutRef.current);
    reconnectTimeoutRef.current = null;
  }
};
```

### Step 7: Connection State Management

Create a centralized connection function:

```typescript
const connectWebSocket = (): void => {
  if (isCleaningUpRef.current) {
    return;
  }

  // Close existing connection if any
  if (wsRef.current) {
    wsRef.current.onclose = null;
    wsRef.current.onerror = null;
    wsRef.current.onmessage = null;
    wsRef.current.onopen = null;
    wsRef.current.close();
    wsRef.current = null;
  }

  try {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      if (isCleaningUpRef.current) {
        ws.close();
        return;
      }
      setConnectionStatus("connected");
      reconnectAttempts.current = 0;
    };

    ws.onclose = (event: CloseEvent) => {
      if (isCleaningUpRef.current) {
        return;
      }
      // Handle reconnection...
    };

    // ... other handlers ...
  } catch (error) {
    if (!isCleaningUpRef.current) {
      reconnect();
    }
  }
};
```

## Code Examples

### Complete Connection Manager

```typescript
function useWebSocketConnection(url: string) {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef<number>(0);
  const isCleaningUpRef = useRef<boolean>(false);

  const connect = useCallback(() => {
    if (isCleaningUpRef.current) return;

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (isCleaningUpRef.current) {
          ws.close();
          return;
        }
        setStatus("connected");
        reconnectAttempts.current = 0;
      };

      ws.onclose = (event) => {
        if (isCleaningUpRef.current) return;

        if (event.code === 1006) {
          setStatus("error");
          reconnect();
        } else {
          setStatus("disconnected");
        }
      };

      ws.onerror = () => {
        if (!isCleaningUpRef.current) {
          setStatus("error");
        }
      };

      ws.onmessage = (event) => {
        // Handle messages
      };
    } catch (error) {
      if (!isCleaningUpRef.current) {
        setStatus("error");
        reconnect();
      }
    }
  }, [url]);

  const reconnect = useCallback(() => {
    if (isCleaningUpRef.current) return;
    if (reconnectAttempts.current >= 5) return;

    const delay = 1000 * Math.pow(2, reconnectAttempts.current);
    reconnectAttempts.current++;

    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, [connect]);

  useEffect(() => {
    connect();
    return () => {
      isCleaningUpRef.current = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { status, ws: wsRef.current };
}
```

### Reconnection with Exponential Backoff

```typescript
const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000]; // 1s, 2s, 4s, 8s, 16s

const reconnect = () => {
  const attempt = reconnectAttempts.current;
  if (attempt >= RECONNECT_DELAYS.length) {
    console.error("Max reconnection attempts reached");
    return;
  }

  const delay = RECONNECT_DELAYS[attempt];
  reconnectAttempts.current++;

  reconnectTimeoutRef.current = setTimeout(() => {
    connectWebSocket();
  }, delay);
};
```

## Explanations

### Why Exponential Backoff?

Exponential backoff prevents overwhelming the server:
- **Attempt 1:** Wait 1 second
- **Attempt 2:** Wait 2 seconds
- **Attempt 3:** Wait 4 seconds
- **Attempt 4:** Wait 8 seconds
- **Attempt 5:** Wait 16 seconds

This gives the server time to recover and reduces unnecessary load.

### Why Check isCleaningUp?

Prevents reconnection attempts during cleanup:
- Component unmounting shouldn't trigger reconnection
- Prevents memory leaks
- Avoids race conditions

### Why Handle Strict Mode?

React Strict Mode in development:
- Runs effects twice to detect side effects
- First run is cleanup, second is real mount
- Use flags to distinguish between them

### Close Codes

WebSocket close codes indicate reason:
- **1000:** Normal closure
- **1001:** Going away (page navigation)
- **1006:** Abnormal closure (connection lost)
- **Other codes:** Various error conditions

## Common Pitfalls

1. **Memory leaks:**
   - Always clear timeouts in cleanup
   - Remove event handlers before closing
   - Set cleanup flags before operations

2. **Infinite reconnection:**
   - Set maximum reconnection attempts
   - Use exponential backoff
   - Allow user to stop reconnection

3. **Stale closures:**
   - Use refs for values that don't trigger re-renders
   - Use functional setState
   - Don't rely on state in cleanup

4. **Race conditions:**
   - Check cleanup flags before operations
   - Verify WebSocket instance before use
   - Clear previous connections before new ones

## Exercises

1. **Add reconnection status:**
   - Show reconnection attempt count
   - Display next reconnection time
   - Allow manual reconnection trigger

2. **Add connection quality:**
   - Track message latency
   - Show connection quality indicator
   - Alert on poor connection

3. **Add connection options:**
   - Allow disabling auto-reconnect
   - Configurable reconnection delays
   - Manual connection control

## Summary

In this workshop, you've learned to:

✅ Manage connection lifecycle  
✅ Implement automatic reconnection  
✅ Handle connection errors gracefully  
✅ Clean up resources properly  
✅ Handle React Strict Mode  
✅ Use exponential backoff for reconnection  

**Key Takeaways:**
- Always clean up timeouts and connections
- Use refs to track cleanup state
- Implement exponential backoff for reconnection
- Handle React Strict Mode double-invocation
- Check connection state before operations
- Prevent reconnection during cleanup

## Next Steps

- **Workshop 7:** Error Handling & Validation
- Practice with different reconnection strategies
- Test connection recovery scenarios
- Review React cleanup best practices

