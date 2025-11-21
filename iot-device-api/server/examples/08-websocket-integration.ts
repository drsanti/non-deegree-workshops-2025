/**
 * Example 8: WebSocket Integration
 *
 * This example demonstrates how to integrate the REST API with a WebSocket server.
 * It shows how to make HTTP requests from Node.js to persist WebSocket data,
 * update device status, and handle errors in integration scenarios.
 *
 * Note: This example simulates WebSocket server behavior. In a real scenario,
 * this code would run in the WebSocket server to persist data via the REST API.
 *
 * Run with: tsx examples/08-websocket-integration.ts
 */

import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const API_BASE = process.env.API_BASE_URL || "http://localhost:3000";

// Simulated WebSocket device data
interface SimulatedDevice {
  id: string;
  name: string;
  type: "sensor" | "controller";
  status: "online" | "offline";
  data: {
    temperature: number;
    humidity: number;
    power: "on" | "off";
  };
}

// Helper function to make API requests
async function apiRequest(
  method: string,
  endpoint: string,
  body?: any
): Promise<any> {
  const url = `${API_BASE}${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `API Error: ${response.status} - ${JSON.stringify(data)}`
      );
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Request failed: ${error.message}`);
    }
    throw error;
  }
}

// Simulate WebSocket server behavior
class SimulatedWebSocketServer {
  private devices: Map<string, SimulatedDevice> = new Map();

  // Initialize devices from API
  async initializeDevices() {
    console.log("1. Initializing devices from API...");
    try {
      const devices = await apiRequest("GET", "/api/devices");
      devices.forEach((device: any) => {
        this.devices.set(device.id, {
          id: device.id,
          name: device.name,
          type: device.type,
          status: device.status,
          data: device.data,
        });
      });
      console.log(`✅ Loaded ${this.devices.size} devices from API`);
    } catch (error) {
      console.error("❌ Failed to load devices:", error);
      throw error;
    }
  }

  // Simulate receiving sensor data (like from WebSocket)
  async receiveSensorData(
    deviceId: string,
    data: { temperature: number; humidity: number; power: "on" | "off" }
  ) {
    console.log(`\n📡 Received sensor data for device ${deviceId}:`, data);

    // Update local state (WebSocket server maintains state)
    const device = this.devices.get(deviceId);
    if (device) {
      device.data = data;
      device.status = "online";
    }

    // Broadcast to WebSocket clients (simulated)
    console.log("   📢 Broadcasting to WebSocket clients...");

    // Persist to database via REST API (non-blocking)
    this.persistSensorData(deviceId, data).catch((error) => {
      console.error("   ⚠️  Failed to persist (non-critical):", error);
      // Don't crash WebSocket if API fails
    });
  }

  // Persist sensor data to database via API
  private async persistSensorData(
    deviceId: string,
    data: { temperature: number; humidity: number; power: "on" | "off" }
  ) {
    try {
      // Update device current data
      await apiRequest("PATCH", `/api/devices/${deviceId}/data`, {
        data,
      });

      // Create history entry
      await apiRequest("POST", `/api/devices/${deviceId}/history`, data);

      console.log("   ✅ Data persisted to database");
    } catch (error) {
      console.error("   ❌ Failed to persist:", error);
      throw error;
    }
  }

  // Handle device status change
  async handleDeviceStatusChange(
    deviceId: string,
    status: "online" | "offline"
  ) {
    console.log(`\n🔄 Device ${deviceId} status changed to: ${status}`);

    // Update local state
    const device = this.devices.get(deviceId);
    if (device) {
      device.status = status;
    }

    // Broadcast to WebSocket clients (simulated)
    console.log("   📢 Broadcasting status change...");

    // Persist to database
    try {
      await apiRequest("PATCH", `/api/devices/${deviceId}/status`, { status });
      console.log("   ✅ Status persisted to database");
    } catch (error) {
      console.error("   ❌ Failed to persist status:", error);
    }
  }

  // Get device from local state
  getDevice(deviceId: string): SimulatedDevice | undefined {
    return this.devices.get(deviceId);
  }

  // Get all devices
  getAllDevices(): SimulatedDevice[] {
    return Array.from(this.devices.values());
  }
}

async function main() {
  console.log("=== WebSocket Integration Example ===\n");
  console.log(`API Base URL: ${API_BASE}\n`);

  // Check if server is running
  try {
    await apiRequest("GET", "/health");
    console.log("✅ API server is running\n");
  } catch (error) {
    console.error("❌ API server is not running or not accessible");
    console.error("   Please start the server with: npm run dev");
    process.exit(1);
  }

  try {
    // Create a device first (for demonstration)
    console.log("2. Creating a device for integration test...");
    const testDevice = await apiRequest("POST", "/api/devices", {
      name: "WebSocket Integration Test Sensor",
      type: "sensor",
      status: "online",
    });
    console.log("✅ Device created:", testDevice.id);
    const deviceId = testDevice.id;
    console.log("");

    // Simulate WebSocket server
    const wsServer = new SimulatedWebSocketServer();
    await wsServer.initializeDevices();
    console.log("");

    // Simulate receiving sensor data
    console.log("3. Simulating WebSocket sensor data reception...");
    await wsServer.receiveSensorData(deviceId, {
      temperature: 22.5,
      humidity: 45.0,
      power: "on",
    });
    console.log("");

    // Wait a bit to show async behavior
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulate more sensor readings
    console.log("4. Simulating multiple sensor readings...");
    for (let i = 0; i < 3; i++) {
      await wsServer.receiveSensorData(deviceId, {
        temperature: 20 + Math.random() * 5,
        humidity: 40 + Math.random() * 10,
        power: i % 2 === 0 ? "on" : "off",
      });
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    console.log("");

    // Verify data was persisted
    console.log("5. Verifying data was persisted...");
    const deviceFromAPI = await apiRequest("GET", `/api/devices/${deviceId}`);
    console.log("✅ Device data from API:", {
      name: deviceFromAPI.name,
      data: deviceFromAPI.data,
    });

    const history = await apiRequest("GET", `/api/devices/${deviceId}/history`);
    console.log(`✅ Found ${history.length} history entries in database`);
    console.log("");

    // Simulate device status change
    console.log("6. Simulating device status change...");
    await wsServer.handleDeviceStatusChange(deviceId, "offline");
    await new Promise((resolve) => setTimeout(resolve, 500));
    await wsServer.handleDeviceStatusChange(deviceId, "online");
    console.log("");

    // Verify status was persisted
    console.log("7. Verifying status was persisted...");
    const updatedDevice = await apiRequest("GET", `/api/devices/${deviceId}`);
    console.log("✅ Device status from API:", updatedDevice.status);
    console.log("");

    // Demonstrate error handling (non-blocking)
    console.log("8. Demonstrating non-blocking error handling...");
    console.log("   Simulating API failure scenario...");

    // This won't crash the WebSocket server
    wsServer
      .receiveSensorData("non-existent-id", {
        temperature: 20,
        humidity: 40,
        power: "on",
      })
      .catch(() => {
        console.log("   ✅ WebSocket continues even if API fails");
      });
    console.log("");

    // Clean up
    console.log("9. Cleaning up...");
    await apiRequest("DELETE", `/api/devices/${deviceId}`);
    console.log("✅ Device deleted");
    console.log("");

    console.log("=== Example completed successfully ===");
    console.log("\n💡 Key Takeaways:");
    console.log("   - WebSocket server maintains real-time state");
    console.log("   - API calls should be non-blocking");
    console.log("   - Don't crash WebSocket if API fails");
    console.log("   - Use async/await with error handling");
    console.log("   - Initialize devices from API on startup");
  } catch (error) {
    console.error("❌ Error occurred:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      if (error.message.includes("fetch")) {
        console.error("\n💡 Tip: Make sure the API server is running:");
        console.error("   npm run dev");
      }
    }
    process.exit(1);
  }
}

// Run the example
main();
