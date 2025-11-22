# Workshop 9: Integration with WebSocket Server

**Duration:** 45-60 minutes  
**Level:** Intermediate to Advanced

## Introduction

In this workshop, you'll learn how the REST API integrates with the WebSocket server. You'll understand the relationship between real-time communication and persistent storage, and how to synchronize data between services.

## What You'll Learn

- Understand the relationship between REST API and WebSocket
- Integrate API calls from WebSocket server
- Persist real-time data to database
- Understand data flow between services
- Handle concurrent operations

## Prerequisites

- Completed Workshop 1-8
- Understanding of REST APIs
- Basic knowledge of WebSocket concept

## Step-by-Step Instructions

### Step 1: Understanding the Architecture

**Two Services:**
1. **WebSocket Server** - Real-time communication
2. **REST API Server** - Persistent storage

**Data Flow:**
```
IoT Device → WebSocket Server → REST API → MongoDB
                ↓
         Real-time updates to clients
```

**Why separate services:**
- **Separation of concerns** - Each service has one responsibility
- **Scalability** - Scale independently
- **Technology choice** - Best tool for each job

### Step 2: WebSocket Server Overview

The WebSocket server (available as Docker image, configured in `websocket/ws-server-docker/`):
- Maintains real-time connections
- Simulates IoT device data
- Broadcasts updates to connected clients
- Can call REST API to persist data

**To start the WebSocket server:**
```bash
cd websocket/ws-server-docker
# Create .env file with DEVICES configuration (see README.md)
docker-compose up -d
```

See [`websocket/ws-server-docker/README.md`](../../../websocket/ws-server-docker/README.md) for detailed setup instructions.

**Key responsibilities:**
- WebSocket connections
- Real-time data broadcasting
- Device simulation
- Client management

### Step 3: Making HTTP Requests from Node.js

To call the REST API from WebSocket server:

```typescript
import fetch from 'node-fetch';  // or use built-in fetch in Node 18+

// Create device via API
async function createDeviceInAPI(deviceData: DeviceConfig) {
  const response = await fetch('http://localhost:3000/api/devices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: deviceData.name,
      type: deviceData.type,
      status: 'online',
    }),
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  
  return await response.json();
}
```

**Key points:**
- Use `fetch` API (Node 18+) or `node-fetch`
- Set proper headers
- Handle errors
- Parse JSON response

### Step 4: Persisting WebSocket Data

When WebSocket receives sensor data, persist it:

```typescript
// In WebSocket server
ws.on('message', async (data) => {
  const message = JSON.parse(data.toString());
  
  if (message.type === 'sensor-data') {
    // Broadcast to clients (real-time)
    broadcast(message);
    
    // Persist to database (via REST API)
    try {
      await fetch(`http://localhost:3000/api/devices/${message.deviceId}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temperature: message.data.temperature,
          humidity: message.data.humidity,
          power: message.data.power,
        }),
      });
    } catch (error) {
      console.error('Failed to persist data:', error);
      // Don't fail WebSocket if API fails
    }
  }
});
```

### Step 5: Updating Device Status

When device status changes in WebSocket:

```typescript
// Device goes offline
async function handleDeviceOffline(deviceId: string) {
  // Update in WebSocket state
  const device = devices.get(deviceId);
  if (device) {
    device.status = 'offline';
  }
  
  // Persist to database
  await fetch(`http://localhost:3000/api/devices/${deviceId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'offline' }),
  });
}
```

### Step 6: Data Synchronization Patterns

**Pattern 1: WebSocket → API (Write)**
```
WebSocket receives data → Call API → Store in database
```

**Pattern 2: API → WebSocket (Read)**
```
Client queries API → Get from database → Return data
```

**Pattern 3: Bidirectional**
```
WebSocket updates → API stores → API notifies WebSocket → Broadcast
```

### Step 7: Handling Concurrent Operations

When multiple operations happen simultaneously:

```typescript
// Use Promise.all for parallel operations
async function syncDeviceData(deviceId: string, data: DeviceData) {
  const [deviceUpdate, historyEntry] = await Promise.all([
    // Update device current data
    fetch(`http://localhost:3000/api/devices/${deviceId}/data`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    }),
    
    // Create history entry
    fetch(`http://localhost:3000/api/devices/${deviceId}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  ]);
  
  return {
    device: await deviceUpdate.json(),
    history: await historyEntry.json(),
  };
}
```

## Code Examples

### Complete Integration Example

```typescript
// In WebSocket server
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000';

// Initialize devices from API
async function initializeDevices() {
  try {
    const response = await fetch(`${API_BASE}/api/devices`);
    const devices = await response.json();
    
    devices.forEach(device => {
      devicesMap.set(device.id, {
        id: device.id,
        name: device.name,
        type: device.type,
        status: device.status,
        data: device.data,
      });
    });
  } catch (error) {
    console.error('Failed to load devices from API:', error);
  }
}

// Persist sensor reading
async function persistSensorReading(deviceId: string, data: DeviceData) {
  try {
    await fetch(`${API_BASE}/api/devices/${deviceId}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Failed to persist reading:', error);
  }
}

// Update device status
async function updateDeviceStatus(deviceId: string, status: DeviceStatus) {
  try {
    await fetch(`${API_BASE}/api/devices/${deviceId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  } catch (error) {
    console.error('Failed to update status:', error);
  }
}
```

### Error Handling in Integration

```typescript
async function syncWithAPI(deviceId: string, data: any) {
  try {
    const response = await fetch(`${API_BASE}/api/devices/${deviceId}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }
    
    return await response.json();
  } catch (error) {
    // Log but don't crash WebSocket
    console.error('API sync failed:', error);
    // Optionally retry or queue for later
    return null;
  }
}
```

## Explanations

### Why Separate Services?

**WebSocket Server:**
- Optimized for real-time communication
- Maintains persistent connections
- Low latency for broadcasts
- Stateful (knows connected clients)

**REST API Server:**
- Optimized for data persistence
- Stateless (each request independent)
- Better for querying and filtering
- Can be cached

### Data Flow Patterns

**Real-time → Persistent:**
1. WebSocket receives sensor data
2. Broadcasts to connected clients (real-time)
3. Calls REST API to persist (async)
4. Database stores for later querying

**Persistent → Real-time:**
1. Client queries REST API
2. Gets historical data
3. WebSocket provides current state
4. Combined view for client

### Error Handling Strategy

**Don't block WebSocket:**
- API failures shouldn't stop real-time updates
- Log errors but continue operation
- Optionally retry or queue failed requests

**Graceful degradation:**
- WebSocket works even if API is down
- Real-time updates continue
- Persistence can be retried later

### Service Communication

**HTTP for integration:**
- Simple and standard
- Works across networks
- Easy to debug
- Can use load balancers

**Alternative: Message Queue:**
- For high-volume scenarios
- Better decoupling
- More complex setup
- Overkill for this use case

## Common Pitfalls

1. **Blocking WebSocket on API calls:**
   ```typescript
   // ❌ Bad: Blocks WebSocket
   ws.on('message', async (data) => {
     await persistToAPI(data);  // Waits for API
     broadcast(data);  // Delayed
   });
   
   // ✅ Good: Non-blocking
   ws.on('message', async (data) => {
     broadcast(data);  // Immediate
     persistToAPI(data).catch(console.error);  // Async, don't wait
   });
   ```

2. **Not handling API failures:**
   ```typescript
   // ❌ Bad: Crashes on API error
   await fetch(API_URL);
   
   // ✅ Good: Handle errors
   try {
     await fetch(API_URL);
   } catch (error) {
     console.error('API error:', error);
     // Continue operation
   }
   ```

3. **Synchronous API calls:**
   ```typescript
   // ❌ Bad: Blocks
   const result = await fetch(API_URL);
   broadcast(data);
   
   // ✅ Good: Parallel
   broadcast(data);
   persistToAPI(data);  // Fire and forget or await separately
   ```

## Summary

In this workshop, you've learned:

✅ Architecture of WebSocket + REST API  
✅ Making HTTP requests from Node.js  
✅ Persisting WebSocket data via API  
✅ Updating device status  
✅ Data synchronization patterns  
✅ Handling concurrent operations  
✅ Error handling in integration  

**Key Takeaways:**
- **Separate concerns:** WebSocket for real-time, API for persistence
- **Don't block real-time:** API calls should be async
- **Handle errors gracefully:** Don't crash WebSocket on API failures
- **Data flow:** Real-time → API → Database
- **Service independence:** Each service can work alone

## Next Steps

- **Workshop 10:** Advanced Topics & Best Practices
- Implement API integration in WebSocket server
- Study microservices communication patterns
- Read about event-driven architectures
- Explore message queue systems

