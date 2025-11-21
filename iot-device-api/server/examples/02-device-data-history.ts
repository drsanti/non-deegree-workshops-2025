/**
 * Example 2: Device Data History Operations
 *
 * This example demonstrates how to work with device data history,
 * including creating history entries, querying with time ranges,
 * and getting the latest readings.
 *
 * Run with: tsx examples/02-device-data-history.ts
 */

import * as dotenv from "dotenv";
import { deviceService } from "../src/services/device.service.js";
import {
  deviceDataService,
  DeviceDataHistory,
} from "../src/services/deviceData.service.js";
import { CreateDeviceRequest } from "../src/types.js";

// Load environment variables
dotenv.config();

async function main() {
  console.log("=== Device Data History Operations Example ===\n");

  try {
    // First, create a device to work with
    console.log("1. Creating a device for history tracking...");
    const device = await deviceService.createDevice({
      name: "History Test Sensor",
      type: "sensor",
      status: "online",
    });
    console.log("✅ Device created:", device.id);
    console.log("");

    // Create multiple history entries
    console.log("2. Creating history entries...");
    const historyEntries: DeviceDataHistory[] = [];
    const now = new Date();

    for (let i = 0; i < 5; i++) {
      const timestamp = new Date(now.getTime() - i * 60000); // 1 minute apart
      const entry = await deviceDataService.createDeviceDataHistory(device.id, {
        temperature: 20 + Math.random() * 5,
        humidity: 40 + Math.random() * 10,
        power: i % 2 === 0 ? "on" : "off",
      });
      historyEntries.push(entry);
      console.log(
        `   Entry ${i + 1}: ${new Date(
          entry.timestamp
        ).toISOString()} - Temp: ${entry.temperature.toFixed(1)}°C`
      );
    }
    console.log(`✅ Created ${historyEntries.length} history entries\n`);

    // Get all history for the device
    console.log("3. Getting all history entries...");
    const allHistory = await deviceDataService.getDeviceDataHistory({
      deviceId: device.id,
    });
    console.log(`✅ Found ${allHistory.length} history entries`);
    allHistory.forEach((entry, index) => {
      console.log(
        `   ${index + 1}. ${new Date(
          entry.timestamp
        ).toISOString()} - Temp: ${entry.temperature.toFixed(
          1
        )}°C, Humidity: ${entry.humidity.toFixed(1)}%, Power: ${entry.power}`
      );
    });
    console.log("");

    // Get history with time range
    console.log("4. Getting history with time range...");
    const startTime = new Date(now.getTime() - 10 * 60000); // 10 minutes ago
    const endTime = new Date(now.getTime() + 60000); // 1 minute from now
    const filteredHistory = await deviceDataService.getDeviceDataHistory({
      deviceId: device.id,
      startTime,
      endTime,
    });
    console.log(`✅ Found ${filteredHistory.length} entries in time range`);
    console.log(`   From: ${startTime.toISOString()}`);
    console.log(`   To: ${endTime.toISOString()}`);
    console.log("");

    // Get history with limit
    console.log("5. Getting history with limit...");
    const limitedHistory = await deviceDataService.getDeviceDataHistory({
      deviceId: device.id,
      limit: 3,
    });
    console.log(`✅ Found ${limitedHistory.length} entries (limited to 3)`);
    limitedHistory.forEach((entry, index) => {
      console.log(
        `   ${index + 1}. ${new Date(
          entry.timestamp
        ).toISOString()} - Temp: ${entry.temperature.toFixed(1)}°C`
      );
    });
    console.log("");

    // Get latest reading
    console.log("6. Getting latest reading...");
    const latest = await deviceDataService.getLatestDeviceDataHistory(
      device.id
    );
    if (latest) {
      console.log("✅ Latest reading:", {
        timestamp: new Date(latest.timestamp).toISOString(),
        temperature: latest.temperature.toFixed(1) + "°C",
        humidity: latest.humidity.toFixed(1) + "%",
        power: latest.power,
      });
    } else {
      console.log("❌ No history found");
    }
    console.log("");

    // Demonstrate pagination concept
    console.log("7. Demonstrating pagination...");
    const pageSize = 2;
    const page1 = await deviceDataService.getDeviceDataHistory({
      deviceId: device.id,
      limit: pageSize,
    });
    console.log(`✅ Page 1 (${page1.length} entries):`);
    page1.forEach((entry, index) => {
      console.log(
        `   ${index + 1}. ${new Date(entry.timestamp).toISOString()}`
      );
    });
    console.log("");

    // Clean up: Delete the device
    console.log("8. Cleaning up...");
    await deviceService.deleteDevice(device.id);
    console.log("✅ Device deleted");
    console.log("");

    console.log("=== Example completed successfully ===");
  } catch (error) {
    console.error("❌ Error occurred:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Stack trace:", error.stack);
    }
    process.exit(1);
  } finally {
    // Disconnect Prisma client
    const { prisma } = await import("../src/prisma/client.js");
    await prisma.$disconnect();
  }
}

// Run the example
main();
