# Workshop 7: Error Handling & Validation

**Duration:** 45-60 minutes  
**Level:** Intermediate

## Introduction

In this workshop, you'll learn how to handle errors gracefully in your WebSocket client application. You'll implement message validation, handle server errors, create user-friendly error displays, and use error boundaries for React error handling.

## What You'll Learn

- Handling error messages from server
- Validating incoming messages
- Creating user-friendly error displays
- Implementing error boundaries
- Logging errors for debugging
- Recovering from errors

## Prerequisites

Before starting, you should have:
- Completed Workshop 6 (Connection Management)
- Understanding of error handling in JavaScript
- Knowledge of TypeScript type guards
- Understanding of React error boundaries

## Step-by-Step Instructions

### Step 1: Understanding Error Messages

The server sends error messages when something goes wrong:

```json
{
  "type": "error",
  "message": "Device not found",
  "timestamp": 1234567890123
}
```

### Step 2: Handling Error Messages

Process error messages from the server:

```typescript
case "error":
  console.error("Server error:", message.message);
  // Show error to user
  setError(message.message);
  break;
```

### Step 3: Message Validation

Validate incoming messages before processing:

```typescript
const isValidMessage = (data: unknown): data is ServerMessage => {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  
  if (!("type" in data) || typeof data.type !== "string") {
    return false;
  }
  
  if (!("timestamp" in data) || typeof data.timestamp !== "number") {
    return false;
  }
  
  return true;
};

ws.onmessage = (event: MessageEvent) => {
  try {
    const data = JSON.parse(event.data);
    
    if (!isValidMessage(data)) {
      console.error("Invalid message format:", data);
      return;
    }
    
    handleMessage(data as ServerMessage);
  } catch (error) {
    console.error("Error parsing message:", error);
    // Handle parse error
  }
};
```

### Step 4: Type-Specific Validation

Validate specific message types:

```typescript
const isValidDeviceListMessage = (msg: any): msg is DeviceListMessage => {
  return (
    msg.type === "device-list" &&
    Array.isArray(msg.devices) &&
    msg.devices.every((d: any) => 
      typeof d.id === "string" &&
      typeof d.name === "string" &&
      typeof d.type === "string" &&
      typeof d.status === "string"
    )
  );
};
```

### Step 5: Error State Management

Store errors in state:

```typescript
const [errors, setErrors] = useState<string[]>([]);

const addError = (error: string) => {
  setErrors((prev) => [...prev, error]);
  // Auto-remove after 5 seconds
  setTimeout(() => {
    setErrors((prev) => prev.filter((e) => e !== error));
  }, 5000);
};
```

### Step 6: Displaying Errors

Create error display component:

```typescript
{errors.length > 0 && (
  <Box p="3" style={{ background: "var(--red-2)", borderRadius: "var(--radius-2)" }}>
    {errors.map((error, index) => (
      <Text key={index} color="red" size="2">
        {error}
      </Text>
    ))}
  </Box>
)}
```

### Step 7: Error Boundaries

Wrap components in error boundary:

```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

## Code Examples

### Complete Error Handler

```typescript
const [errors, setErrors] = useState<Array<{ id: string; message: string; timestamp: number }>>([]);

const handleError = (message: string) => {
  const error = {
    id: Date.now().toString(),
    message,
    timestamp: Date.now(),
  };
  
  setErrors((prev) => [...prev, error]);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    setErrors((prev) => prev.filter((e) => e.id !== error.id));
  }, 5000);
};

const handleMessage = (message: ServerMessage) => {
  switch (message.type) {
    case "error":
      handleError(message.message);
      break;
    // ... other cases
  }
};
```

### Message Validation with Type Guards

```typescript
function isServerMessage(data: unknown): data is ServerMessage {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  
  const obj = data as Record<string, unknown>;
  
  if (typeof obj.type !== "string" || typeof obj.timestamp !== "number") {
    return false;
  }
  
  // Validate specific message types
  switch (obj.type) {
    case "device-list":
      return Array.isArray(obj.devices);
    case "sensor-data":
      return (
        typeof obj.deviceId === "string" &&
        typeof obj.deviceName === "string" &&
        typeof obj.data === "object"
      );
    case "error":
      return typeof obj.message === "string";
    default:
      return false;
  }
}
```

### Error Toast Component

```typescript
interface ErrorToastProps {
  error: string;
  onDismiss: () => void;
}

function ErrorToast({ error, onDismiss }: ErrorToastProps) {
  return (
    <Box
      p="3"
      style={{
        background: "var(--red-2)",
        borderRadius: "var(--radius-2)",
        border: "1px solid var(--red-6)",
      }}
    >
      <Flex align="center" justify="between">
        <Text color="red" size="2">
          {error}
        </Text>
        <Button variant="ghost" size="1" onClick={onDismiss}>
          ×
        </Button>
      </Flex>
    </Box>
  );
}
```

### Error Boundary Implementation

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    // Could send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p="5">
          <Heading color="red">Something went wrong</Heading>
          <Text>{this.state.error?.message}</Text>
          <Button onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
```

## Explanations

### Why Validate Messages?

**Security:**
- Prevents malicious data injection
- Ensures data structure matches expectations
- Catches malformed messages early

**Reliability:**
- Prevents crashes from unexpected data
- Provides clear error messages
- Helps with debugging

### Why Use Type Guards?

TypeScript type guards:
- Provide type safety at runtime
- Enable type narrowing
- Catch type errors early
- Improve code reliability

### Error State Management

Store errors in state:
- Allows UI to display errors
- Can show multiple errors
- Auto-dismiss after timeout
- User can manually dismiss

### Error Boundaries

React error boundaries:
- Catch errors in component tree
- Prevent entire app from crashing
- Show fallback UI
- Log errors for debugging

## Common Pitfalls

1. **Not validating messages:**
   - Always validate before processing
   - Use type guards for type safety
   - Handle validation errors gracefully

2. **Swallowing errors:**
   - Always log errors
   - Show user-friendly messages
   - Don't silently fail

3. **Too many error toasts:**
   - Limit number of visible errors
   - Group similar errors
   - Auto-dismiss after timeout

4. **Not handling parse errors:**
   - Wrap JSON.parse in try-catch
   - Validate before parsing
   - Show helpful error messages

## Exercises

1. **Add error categories:**
   - Categorize errors (network, validation, server)
   - Show different UI for different categories
   - Filter errors by category

2. **Add error persistence:**
   - Store errors in localStorage
   - Show error history
   - Allow clearing error history

3. **Add error reporting:**
   - Send errors to logging service
   - Include context information
   - Track error frequency

## Summary

In this workshop, you've learned to:

✅ Handle error messages from server  
✅ Validate incoming messages  
✅ Create user-friendly error displays  
✅ Implement error boundaries  
✅ Log errors for debugging  
✅ Recover from errors gracefully  

**Key Takeaways:**
- Always validate messages before processing
- Use TypeScript type guards for type safety
- Show user-friendly error messages
- Use error boundaries to catch React errors
- Log errors for debugging
- Auto-dismiss errors after timeout

## Next Steps

- **Workshop 8:** Custom React Hooks for WebSocket
- Practice with different error scenarios
- Implement error tracking
- Review error handling best practices

