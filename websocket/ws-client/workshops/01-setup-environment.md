# Workshop 1: Setup Environment & Basic WebSocket Connection

**Duration:** 30-45 minutes  
**Level:** Beginner

## Introduction

In this workshop, you'll learn how to set up the WebSocket client development environment and create your first WebSocket connection. You'll understand the project structure, install dependencies, and build a simple connection status indicator.

## What You'll Learn

- Understanding the project structure
- Installing dependencies with npm
- Creating a basic WebSocket connection
- Tracking connection status
- Building a simple React component with Radix UI

## Prerequisites

Before starting, you should have:
- Basic understanding of React and TypeScript
- Node.js v18 or higher installed
- A code editor (VS Code recommended)
- The WebSocket server running (see ws-server README)

## Step-by-Step Instructions

### Step 1: Navigate to Project Directory

1. **Open your terminal/command prompt**
2. **Navigate to the client directory:**
   ```bash
   cd websocket/ws-client
   ```

**Why:** We need to be in the project directory to run commands that affect this specific project.

### Step 2: Install Project Dependencies

The `package.json` file lists all the libraries our project needs. Let's install them:

```bash
npm install
```

**What happens:**
- npm reads `package.json`
- Downloads all dependencies listed in `dependencies` and `devDependencies`
- Creates a `node_modules` folder with all packages
- Creates `package-lock.json` to lock versions

**Key dependencies:**
- `react` & `react-dom` - React framework for building UIs
- `@radix-ui/themes` - Accessible UI component library
- `@radix-ui/react-icons` - Icon library
- `vite` - Fast build tool and dev server

**Dev dependencies:**
- `typescript` - TypeScript compiler
- `@vitejs/plugin-react` - Vite plugin for React

### Step 3: Understanding the Project Structure

Let's explore the project structure:

```
websocket/ws-client/
├── src/
│   ├── App.tsx              # Main application component
│   ├── Example.tsx          # Example selector component
│   ├── main.tsx            # React entry point
│   ├── types.ts            # TypeScript type definitions
│   ├── App.css             # Global styles
│   ├── components/         # Reusable components
│   │   └── DeviceCard.tsx
│   └── examples/           # Workshop examples
│       └── Example01.tsx   # This workshop's example
├── workshops/              # Workshop documentation
│   └── 01-setup-environment.md
├── package.json            # Project dependencies
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

### Step 4: Understanding WebSocket Connection

A WebSocket connection allows bidirectional communication between client and server. Unlike HTTP, WebSocket maintains an open connection for real-time data exchange.

**WebSocket States:**
- `CONNECTING` (0) - Connection is being established
- `OPEN` (1) - Connection is open and ready
- `CLOSING` (2) - Connection is closing
- `CLOSED` (3) - Connection is closed

### Step 5: Creating a Basic WebSocket Connection

Let's create a simple component that connects to the WebSocket server:

```typescript
import { useState, useEffect, useRef } from "react";
import { Box, Text, Badge } from "@radix-ui/themes";

const WS_URL = "ws://localhost:7890";

function Example01() {
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Create WebSocket connection
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    // Handle connection open
    ws.onopen = () => {
      setStatus("connected");
    };

    // Handle connection close
    ws.onclose = () => {
      setStatus("disconnected");
    };

    // Handle errors
    ws.onerror = () => {
      setStatus("disconnected");
    };

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, []);

  return (
    <Box p="5">
      <Text size="4" weight="bold" mb="3">Connection Status</Text>
      <Badge color={status === "connected" ? "green" : "red"}>
        {status}
      </Badge>
    </Box>
  );
}
```

**Key Concepts:**
- `useState` - Manages component state (connection status)
- `useRef` - Stores WebSocket instance without causing re-renders
- `useEffect` - Handles side effects (connection setup/cleanup)
- Event handlers (`onopen`, `onclose`, `onerror`) - React to connection events

### Step 6: Understanding the Code

**useState Hook:**
```typescript
const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected");
```
- Creates state variable `status` with initial value "disconnected"
- `setStatus` function updates the state
- TypeScript ensures only valid status values

**useRef Hook:**
```typescript
const wsRef = useRef<WebSocket | null>(null);
```
- Stores WebSocket instance
- Doesn't trigger re-renders when updated
- Persists across renders but doesn't reset on re-render

**useEffect Hook:**
```typescript
useEffect(() => {
  // Setup code
  return () => {
    // Cleanup code
  };
}, []);
```
- Runs after component mounts
- Empty dependency array `[]` means it runs once
- Return function is cleanup (runs on unmount)

### Step 7: Testing the Connection

1. **Make sure the WebSocket server is running:**
   ```bash
   cd ../ws-server
   npm start
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser** to `http://localhost:5173`

4. **Select Example 01** from the example selector

5. **Observe the connection status** - it should show "connected" (green badge)

### Step 8: Handling Connection States

Let's improve our component to show all connection states:

```typescript
const getStatusColor = (): "green" | "red" | "orange" => {
  switch (status) {
    case "connected":
      return "green";
    case "connecting":
      return "orange";
    case "disconnected":
      return "red";
  }
};
```

## Code Examples

### Complete Example Component

See `src/examples/Example01.tsx` for the complete implementation with:
- Connection status tracking
- Visual indicators with icons
- Proper cleanup
- Error handling

### WebSocket Connection Pattern

```typescript
// 1. Create connection
const ws = new WebSocket(WS_URL);

// 2. Set up event handlers
ws.onopen = () => {
  console.log("Connected!");
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Received:", data);
};

ws.onerror = (error) => {
  console.error("Error:", error);
};

ws.onclose = () => {
  console.log("Disconnected");
};

// 3. Send messages
ws.send(JSON.stringify({ type: "message", data: "Hello" }));

// 4. Clean up
ws.close();
```

## Explanations

### Why useRef for WebSocket?

- WebSocket instance doesn't need to trigger re-renders
- `useRef` persists across renders without causing updates
- Allows access to WebSocket in event handlers and cleanup

### Why useEffect for Connection?

- Side effects (like network connections) belong in `useEffect`
- Cleanup function ensures connection is closed on unmount
- Prevents memory leaks and connection issues

### Why TypeScript Types?

- Type safety prevents bugs
- Better IDE autocomplete
- Self-documenting code
- Catches errors at compile time

## Common Pitfalls

1. **Connection not working:**
   - Verify server is running on `ws://localhost:7890`
   - Check browser console for errors
   - Ensure no firewall blocking WebSocket connections

2. **Memory leaks:**
   - Always close WebSocket in cleanup function
   - Remove event handlers before closing
   - Don't create multiple connections

3. **State updates after unmount:**
   - Check if component is still mounted before `setStatus`
   - Use cleanup flags or refs to track mount state

4. **Type errors:**
   - Ensure types match between client and server
   - Check `types.ts` for correct message types

## Exercises

1. **Add a connection countdown:**
   - Show "Connecting..." for 2 seconds before showing status
   - Use `setTimeout` in `useEffect`

2. **Add connection retry:**
   - Automatically retry connection if it fails
   - Add a retry counter (max 3 attempts)

3. **Add connection time:**
   - Display how long the connection has been open
   - Use `Date.now()` to track connection time

## Summary

In this workshop, you've learned to:

✅ Understand the project structure  
✅ Install project dependencies  
✅ Create a basic WebSocket connection  
✅ Track connection status with React hooks  
✅ Build a simple UI component with Radix UI  
✅ Handle WebSocket lifecycle (open, close, error)  
✅ Clean up resources properly  

**Key Takeaways:**
- WebSocket provides real-time bidirectional communication
- React hooks (`useState`, `useRef`, `useEffect`) manage component state and side effects
- Always clean up WebSocket connections to prevent memory leaks
- TypeScript provides type safety for better code quality

## Next Steps

- **Workshop 2:** Basic Messaging - Sending and Receiving Messages
- Explore the `types.ts` file to understand message structures
- Read the [WebSocket API documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- Review the [React Hooks documentation](https://react.dev/reference/react)

