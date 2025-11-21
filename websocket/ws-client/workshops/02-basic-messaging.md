# Workshop 2: Basic Messaging - Sending and Receiving Messages

**Duration:** 45-60 minutes  
**Level:** Beginner to Intermediate

## Introduction

In this workshop, you'll learn how to send and receive messages through a WebSocket connection. You'll understand message formats, implement message handlers, and build a simple chat-like interface for testing message exchange.

## What You'll Learn

- Understanding WebSocket message types
- Sending messages to the server
- Receiving and parsing server messages
- Implementing message handlers
- Building a message log interface

## Prerequisites

Before starting, you should have:
- Completed Workshop 1 (Basic WebSocket Connection)
- Understanding of JSON parsing
- Basic React state management knowledge
- WebSocket server running

## Step-by-Step Instructions

### Step 1: Understanding Message Format

WebSocket messages are sent as strings. For structured data, we use JSON:

**Client to Server:**
```json
{
  "type": "device-command",
  "deviceId": "device-001",
  "command": "toggle-power",
  "timestamp": 1234567890123
}
```

**Server to Client:**
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

### Step 2: Setting Up Message Handler

Create a function to handle incoming messages:

```typescript
const handleMessage = (event: MessageEvent) => {
  try {
    const message = JSON.parse(event.data);
    console.log("Received message:", message);
    
    // Handle different message types
    switch (message.type) {
      case "sensor-data":
        // Handle sensor data
        break;
      case "device-list":
        // Handle device list
        break;
      default:
        console.warn("Unknown message type:", message.type);
    }
  } catch (error) {
    console.error("Error parsing message:", error);
  }
};
```

### Step 3: Attaching Message Handler

Attach the handler to the WebSocket:

```typescript
useEffect(() => {
  const ws = new WebSocket(WS_URL);
  
  ws.onopen = () => {
    setStatus("connected");
  };
  
  // Attach message handler
  ws.onmessage = handleMessage;
  
  wsRef.current = ws;
  
  return () => {
    ws.close();
  };
}, []);
```

### Step 4: Sending Messages

Create a function to send messages:

```typescript
const sendMessage = (message: ClientMessage) => {
  if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
    const messageWithTimestamp = {
      ...message,
      timestamp: Date.now(),
    };
    wsRef.current.send(JSON.stringify(messageWithTimestamp));
  } else {
    console.error("WebSocket is not connected");
  }
};
```

### Step 5: Requesting Device List

Send a request to get the device list:

```typescript
const requestDeviceList = () => {
  sendMessage({
    type: "request-device-list",
    timestamp: Date.now(),
  });
};
```

### Step 6: Storing Messages

Use state to store received messages:

```typescript
const [messages, setMessages] = useState<ServerMessage[]>([]);

const handleMessage = (event: MessageEvent) => {
  try {
    const message = JSON.parse(event.data) as ServerMessage;
    setMessages((prev) => [...prev, message]);
  } catch (error) {
    console.error("Error parsing message:", error);
  }
};
```

### Step 7: Displaying Messages

Create a UI to display messages:

```typescript
<Box>
  <Heading>Message Log</Heading>
  {messages.map((msg, index) => (
    <Box key={index} p="2">
      <Text>{msg.type}</Text>
      <Text size="1" color="gray">
        {new Date(msg.timestamp).toLocaleTimeString()}
      </Text>
    </Box>
  ))}
</Box>
```

## Code Examples

### Complete Message Handler

```typescript
const handleMessage = (event: MessageEvent) => {
  if (isCleaningUpRef.current) return;
  
  try {
    const message = JSON.parse(event.data) as ServerMessage;
    
    switch (message.type) {
      case "device-list":
        console.log("Device list received:", message.devices);
        break;
      
      case "sensor-data":
        console.log("Sensor data:", message.deviceId, message.data);
        break;
      
      case "device-status":
        console.log("Device status:", message.deviceId, message.status);
        break;
      
      case "connection-status":
        console.log("Connection status:", message.clientCount);
        break;
      
      case "error":
        console.error("Server error:", message.message);
        break;
      
      default:
        console.warn("Unknown message type:", message);
    }
  } catch (error) {
    console.error("Error parsing message:", error);
  }
};
```

### Sending Different Message Types

```typescript
// Request device list
const requestDeviceList = () => {
  sendMessage({
    type: "request-device-list",
    timestamp: Date.now(),
  });
};

// Send device command
const sendDeviceCommand = (
  deviceId: string,
  command: "toggle-power" | "set-temperature" | "set-humidity",
  value?: number
) => {
  sendMessage({
    type: "device-command",
    deviceId,
    command,
    value,
    timestamp: Date.now(),
  });
};
```

## Explanations

### Why JSON for Messages?

- **Structured data:** Easy to parse and validate
- **Type safety:** Can use TypeScript types
- **Human readable:** Easy to debug
- **Standard format:** Works across languages

### Why Check readyState?

- WebSocket might not be connected yet
- Prevents errors when sending before connection
- `WebSocket.OPEN` (1) means connection is ready

### Why Store Messages in State?

- React re-renders when state changes
- UI updates automatically with new messages
- Can filter, search, or transform messages
- History of all received messages

### Message Validation

Always validate incoming messages:

```typescript
const isValidMessage = (data: unknown): data is ServerMessage => {
  if (typeof data !== "object" || data === null) return false;
  if (!("type" in data) || !("timestamp" in data)) return false;
  return true;
};
```

## Common Pitfalls

1. **Sending before connection:**
   - Always check `readyState === WebSocket.OPEN`
   - Queue messages if not connected
   - Show user-friendly error messages

2. **JSON parsing errors:**
   - Wrap in try-catch
   - Validate message structure
   - Handle malformed messages gracefully

3. **Memory leaks with messages:**
   - Limit message history size
   - Clear old messages periodically
   - Use pagination for large logs

4. **Type mismatches:**
   - Use TypeScript types from `types.ts`
   - Validate message structure
   - Handle unknown message types

## Exercises

1. **Add message filtering:**
   - Filter messages by type
   - Add search functionality
   - Show only recent messages

2. **Add message statistics:**
   - Count messages by type
   - Show message rate (messages/second)
   - Display total messages received

3. **Add message export:**
   - Export message log as JSON
   - Download as file
   - Clear message log button

## Summary

In this workshop, you've learned to:

✅ Understand WebSocket message formats  
✅ Send messages to the server  
✅ Receive and parse server messages  
✅ Implement message handlers  
✅ Store and display message history  
✅ Handle different message types  
✅ Validate incoming messages  

**Key Takeaways:**
- Messages are sent as JSON strings
- Always validate and parse messages safely
- Check connection state before sending
- Store messages in React state for UI updates
- Use TypeScript types for type safety

## Next Steps

- **Workshop 3:** Device List Handling
- Explore all message types in `types.ts`
- Test sending different command types
- Read the [WebSocket API documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

