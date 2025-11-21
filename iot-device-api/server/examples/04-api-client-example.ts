/**
 * Example 4: API Client Example
 *
 * This example demonstrates how to make HTTP requests to the API server
 * using the fetch API. This shows how external clients or services
 * can interact with the REST API.
 *
 * Note: Make sure the API server is running before executing this example.
 * Start it with: npm run dev
 *
 * Run with: tsx examples/04-api-client-example.ts
 */

import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const API_BASE = process.env.API_BASE_URL || "http://localhost:3000";

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

async function main() {
  console.log("=== API Client Example ===\n");
  console.log(`API Base URL: ${API_BASE}\n`);

  try {
    // Check if server is running
    console.log("1. Checking server health...");
    try {
      const health = await apiRequest("GET", "/health");
      console.log("✅ Server is running:", health);
    } catch (error) {
      console.error("❌ Server is not running or not accessible");
      console.error("   Please start the server with: npm run dev");
      process.exit(1);
    }
    console.log("");

    // Create a device
    console.log("2. Creating a device via API...");
    const newDevice = await apiRequest("POST", "/api/devices", {
      name: "API Test Sensor",
      type: "sensor",
      status: "online",
      data: {
        temperature: 22.5,
        humidity: 45.0,
        power: "on",
      },
    });
    console.log("✅ Device created:", {
      id: newDevice.id,
      name: newDevice.name,
      type: newDevice.type,
      status: newDevice.status,
    });
    const deviceId = newDevice.id;
    console.log("");

    // Get all devices
    console.log("3. Getting all devices...");
    const allDevices = await apiRequest("GET", "/api/devices");
    console.log(`✅ Found ${allDevices.length} device(s)`);
    allDevices.forEach((device: any, index: number) => {
      console.log(
        `   ${index + 1}. ${device.name} (${device.type}) - ${device.status}`
      );
    });
    console.log("");

    // Get device by ID
    console.log("4. Getting device by ID...");
    const device = await apiRequest("GET", `/api/devices/${deviceId}`);
    console.log("✅ Device details:", {
      id: device.id,
      name: device.name,
      data: device.data,
    });
    console.log("");

    // Update device
    console.log("5. Updating device...");
    const updatedDevice = await apiRequest("PUT", `/api/devices/${deviceId}`, {
      name: "Updated API Test Sensor",
      status: "offline",
    });
    console.log("✅ Device updated:", {
      id: updatedDevice.id,
      name: updatedDevice.name,
      status: updatedDevice.status,
    });
    console.log("");

    // Update device status
    console.log("6. Updating device status...");
    const statusUpdated = await apiRequest(
      "PATCH",
      `/api/devices/${deviceId}/status`,
      {
        status: "online",
      }
    );
    console.log("✅ Status updated:", statusUpdated.status);
    console.log("");

    // Update device data
    console.log("7. Updating device sensor data...");
    const dataUpdated = await apiRequest(
      "PATCH",
      `/api/devices/${deviceId}/data`,
      {
        data: {
          temperature: 25.5,
          humidity: 50.0,
          power: "off",
        },
      }
    );
    console.log("✅ Data updated:", dataUpdated.data);
    console.log("");

    // Create history entry
    console.log("8. Creating device data history entry...");
    const historyEntry = await apiRequest(
      "POST",
      `/api/devices/${deviceId}/history`,
      {
        temperature: 24.0,
        humidity: 48.0,
        power: "on",
      }
    );
    console.log("✅ History entry created:", {
      id: historyEntry.id,
      timestamp: new Date(historyEntry.timestamp).toISOString(),
      temperature: historyEntry.temperature,
    });
    console.log("");

    // Get device history
    console.log("9. Getting device history...");
    const history = await apiRequest("GET", `/api/devices/${deviceId}/history`);
    console.log(`✅ Found ${history.length} history entries`);
    history.forEach((entry: any, index: number) => {
      console.log(
        `   ${index + 1}. ${new Date(entry.timestamp).toISOString()} - Temp: ${
          entry.temperature
        }°C`
      );
    });
    console.log("");

    // Get latest reading
    console.log("10. Getting latest reading...");
    const latest = await apiRequest(
      "GET",
      `/api/devices/${deviceId}/history/latest`
    );
    console.log("✅ Latest reading:", {
      timestamp: new Date(latest.timestamp).toISOString(),
      temperature: latest.temperature,
      humidity: latest.humidity,
      power: latest.power,
    });
    console.log("");

    // Error handling: Try to get non-existent device
    console.log("11. Error handling: Getting non-existent device...");
    try {
      await apiRequest("GET", "/api/devices/000000000000000000000000");
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        console.log("✅ Correctly handled 404 error for non-existent device");
      } else {
        throw error;
      }
    }
    console.log("");

    // Delete device
    console.log("12. Deleting device...");
    const deleteResult = await apiRequest("DELETE", `/api/devices/${deviceId}`);
    console.log("✅ Device deleted:", deleteResult.message);
    console.log("");

    // Verify deletion
    console.log("13. Verifying deletion...");
    try {
      await apiRequest("GET", `/api/devices/${deviceId}`);
      console.log("❌ Device still exists (unexpected)");
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        console.log("✅ Device successfully deleted (404 as expected)");
      } else {
        throw error;
      }
    }
    console.log("");

    console.log("=== Example completed successfully ===");
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
