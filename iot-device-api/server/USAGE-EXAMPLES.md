# API Usage Examples

This document provides practical examples for using the IoT Device Management API. All examples assume the server is running on `http://localhost:3000`.

## Table of Contents

- [API Usage Examples](#api-usage-examples)
  - [Table of Contents](#table-of-contents)
  - [Health Check](#health-check)
    - [Check Server Status](#check-server-status)
  - [Device Management](#device-management)
    - [Get All Devices](#get-all-devices)
    - [Get Device by ID](#get-device-by-id)
    - [Create Device](#create-device)
    - [Update Device](#update-device)
    - [Update Device Status](#update-device-status)
    - [Update Device Data](#update-device-data)
    - [Delete Device](#delete-device)
  - [Device Data History](#device-data-history)
    - [Get Device History](#get-device-history)
    - [Create History Entry](#create-history-entry)
    - [Get Latest Reading](#get-latest-reading)
  - [Complete Workflow Example](#complete-workflow-example)
  - [Using with JavaScript/TypeScript](#using-with-javascripttypescript)
    - [Fetch API Example](#fetch-api-example)
  - [Error Handling](#error-handling)
  - [Notes](#notes)

## Health Check

### Check Server Status

```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": 1703123456789
}
```

## Device Management

### Get All Devices

Retrieve a list of all IoT devices.

```bash
curl http://localhost:3000/api/devices
```

**Response:**
```json
[
  {
    "id": "67890abcdef1234567890123",
    "name": "Temperature Sensor",
    "type": "sensor",
    "status": "online",
    "lastUpdate": 1703123456789,
    "data": {
      "temperature": 22.5,
      "humidity": 45.0,
      "power": "on"
    }
  },
  {
    "id": "67890abcdef1234567890124",
    "name": "Smart Thermostat",
    "type": "controller",
    "status": "online",
    "lastUpdate": 1703123456790,
    "data": {
      "temperature": 21.0,
      "humidity": 50.0,
      "power": "on"
    }
  }
]
```

### Get Device by ID

Retrieve a specific device by its ID.

```bash
curl http://localhost:3000/api/devices/67890abcdef1234567890123
```

**Response:**
```json
{
  "id": "67890abcdef1234567890123",
  "name": "Temperature Sensor",
  "type": "sensor",
  "status": "online",
  "lastUpdate": 1703123456789,
  "data": {
    "temperature": 22.5,
    "humidity": 45.0,
    "power": "on"
  }
}
```

**Error Response (404):**
```json
{
  "error": "Device not found"
}
```

### Create Device

Create a new IoT device.

```bash
curl -X POST http://localhost:3000/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Humidity Monitor",
    "type": "sensor",
    "status": "online",
    "data": {
      "temperature": 20.0,
      "humidity": 40.0,
      "power": "on"
    }
  }'
```

**Minimal Request (with defaults):**
```bash
curl -X POST http://localhost:3000/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Sensor",
    "type": "sensor"
  }'
```

**Response (201):**
```json
{
  "id": "67890abcdef1234567890125",
  "name": "Humidity Monitor",
  "type": "sensor",
  "status": "online",
  "lastUpdate": 1703123456800,
  "data": {
    "temperature": 20.0,
    "humidity": 40.0,
    "power": "off"
  }
}
```

### Update Device

Update device properties (name, type, status, or data).

```bash
curl -X PUT http://localhost:3000/api/devices/67890abcdef1234567890123 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Temperature Sensor",
    "type": "sensor",
    "status": "online"
  }'
```

**Response:**
```json
{
  "id": "67890abcdef1234567890123",
  "name": "Updated Temperature Sensor",
  "type": "sensor",
  "status": "online",
  "lastUpdate": 1703123456900,
  "data": {
    "temperature": 22.5,
    "humidity": 45.0,
    "power": "on"
  }
}
```

### Update Device Status

Update only the device status (online/offline).

```bash
curl -X PATCH http://localhost:3000/api/devices/67890abcdef1234567890123/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "offline"
  }'
```

**Response:**
```json
{
  "id": "67890abcdef1234567890123",
  "name": "Temperature Sensor",
  "type": "sensor",
  "status": "offline",
  "lastUpdate": 1703123457000,
  "data": {
    "temperature": 22.5,
    "humidity": 45.0,
    "power": "on"
  }
}
```

### Update Device Data

Update only the sensor data (temperature, humidity, power).

```bash
curl -X PATCH http://localhost:3000/api/devices/67890abcdef1234567890123/data \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "temperature": 25.5,
      "humidity": 55.0,
      "power": "on"
    }
  }'
```

**Response:**
```json
{
  "id": "67890abcdef1234567890123",
  "name": "Temperature Sensor",
  "type": "sensor",
  "status": "online",
  "lastUpdate": 1703123457100,
  "data": {
    "temperature": 25.5,
    "humidity": 55.0,
    "power": "on"
  }
}
```

### Delete Device

Delete a device from the system.

```bash
curl -X DELETE http://localhost:3000/api/devices/67890abcdef1234567890123
```

**Response (200):**
```json
{
  "message": "Device deleted successfully"
}
```

**Error Response (404):**
```json
{
  "error": "Device not found"
}
```

## Device Data History

### Get Device History

Retrieve historical sensor readings for a device.

**Get all history (default limit: 100):**
```bash
curl http://localhost:3000/api/devices/67890abcdef1234567890123/history
```

**Get history with time range:**
```bash
curl "http://localhost:3000/api/devices/67890abcdef1234567890123/history?startTime=2024-01-01T00:00:00Z&endTime=2024-01-31T23:59:59Z"
```

**Get history with limit:**
```bash
curl "http://localhost:3000/api/devices/67890abcdef1234567890123/history?limit=50"
```

**Get history with all parameters:**
```bash
curl "http://localhost:3000/api/devices/67890abcdef1234567890123/history?startTime=2024-01-01T00:00:00Z&endTime=2024-01-31T23:59:59Z&limit=100"
```

**Response:**
```json
[
  {
    "id": "67890abcdef1234567890126",
    "deviceId": "67890abcdef1234567890123",
    "timestamp": 1703123456789,
    "temperature": 22.5,
    "humidity": 45.0,
    "power": "on"
  },
  {
    "id": "67890abcdef1234567890127",
    "deviceId": "67890abcdef1234567890123",
    "timestamp": 1703123456788,
    "temperature": 22.3,
    "humidity": 44.8,
    "power": "on"
  }
]
```

### Create History Entry

Log a new sensor reading for a device.

```bash
curl -X POST http://localhost:3000/api/devices/67890abcdef1234567890123/history \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 23.0,
    "humidity": 46.5,
    "power": "on"
  }'
```

**Response (201):**
```json
{
  "id": "67890abcdef1234567890128",
  "deviceId": "67890abcdef1234567890123",
  "timestamp": 1703123457200,
  "temperature": 23.0,
  "humidity": 46.5,
  "power": "on"
}
```

**Error Response (404) - Device not found:**
```json
{
  "error": "Device not found"
}
```

### Get Latest Reading

Get the most recent sensor reading for a device.

```bash
curl http://localhost:3000/api/devices/67890abcdef1234567890123/history/latest
```

**Response:**
```json
{
  "id": "67890abcdef1234567890128",
  "deviceId": "67890abcdef1234567890123",
  "timestamp": 1703123457200,
  "temperature": 23.0,
  "humidity": 46.5,
  "power": "on"
}
```

**Error Response (404) - No history found:**
```json
{
  "error": "No history found for device"
}
```

## Complete Workflow Example

Here's a complete example of creating a device, updating it, logging history, and querying it:

```bash
# 1. Create a new device
DEVICE_ID=$(curl -s -X POST http://localhost:3000/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Sensor",
    "type": "sensor",
    "status": "online"
  }' | jq -r '.id')

echo "Created device: $DEVICE_ID"

# 2. Update device data
curl -X PATCH http://localhost:3000/api/devices/$DEVICE_ID/data \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "temperature": 22.0,
      "humidity": 45.0,
      "power": "on"
    }
  }'

# 3. Log sensor readings
curl -X POST http://localhost:3000/api/devices/$DEVICE_ID/history \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 22.5,
    "humidity": 46.0,
    "power": "on"
  }'

curl -X POST http://localhost:3000/api/devices/$DEVICE_ID/history \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 23.0,
    "humidity": 47.0,
    "power": "on"
  }'

# 4. Get device history
curl http://localhost:3000/api/devices/$DEVICE_ID/history

# 5. Get latest reading
curl http://localhost:3000/api/devices/$DEVICE_ID/history/latest

# 6. Update device status
curl -X PATCH http://localhost:3000/api/devices/$DEVICE_ID/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "offline"
  }'

# 7. Get updated device
curl http://localhost:3000/api/devices/$DEVICE_ID
```

## Using with JavaScript/TypeScript

### Fetch API Example

```javascript
const API_BASE = 'http://localhost:3000';

// Get all devices
async function getAllDevices() {
  const response = await fetch(`${API_BASE}/api/devices`);
  return await response.json();
}

// Create device
async function createDevice(deviceData) {
  const response = await fetch(`${API_BASE}/api/devices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(deviceData)
  });
  return await response.json();
}

// Update device data
async function updateDeviceData(deviceId, data) {
  const response = await fetch(`${API_BASE}/api/devices/${deviceId}/data`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data })
  });
  return await response.json();
}

// Log sensor reading
async function logSensorReading(deviceId, reading) {
  const response = await fetch(`${API_BASE}/api/devices/${deviceId}/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reading)
  });
  return await response.json();
}

// Usage
(async () => {
  // Create a device
  const device = await createDevice({
    name: 'My Sensor',
    type: 'sensor',
    status: 'online'
  });
  
  console.log('Created device:', device.id);
  
  // Log readings every 5 seconds
  setInterval(async () => {
    const reading = {
      temperature: 20 + Math.random() * 5,
      humidity: 40 + Math.random() * 10,
      power: 'on'
    };
    
    await logSensorReading(device.id, reading);
    console.log('Logged reading:', reading);
  }, 5000);
})();
```

## Error Handling

All endpoints may return error responses:

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "body should have required property 'name'"
}
```

**404 Not Found:**
```json
{
  "error": "Device not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to fetch devices"
}
```

## Notes

- All timestamps are in milliseconds (Unix timestamp)
- Device IDs are MongoDB ObjectIds (24-character hex strings)
- The `power` field accepts only `"on"` or `"off"` values
- The `status` field accepts only `"online"` or `"offline"` values
- The `type` field accepts only `"sensor"` or `"controller"` values
- Time range queries use ISO 8601 format (e.g., `2024-01-01T00:00:00Z`)
- History query limit defaults to 100, maximum is 1000

