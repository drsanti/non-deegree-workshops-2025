/**
 * Example 5: Batch Operations
 *
 * This example demonstrates batch operations and bulk data handling,
 * including creating multiple devices, batch history entries, and
 * updating multiple devices efficiently.
 *
 * Run with: tsx examples/05-batch-operations.ts
 */

import * as dotenv from "dotenv";
import { deviceService } from "../src/services/device.service.js";
import {
  deviceDataService,
  DeviceDataHistory,
} from "../src/services/deviceData.service.js";
import { CreateDeviceRequest, Device } from "../src/types.js";

// Load environment variables
dotenv.config();

async function main() {
  console.log("=== Batch Operations Example ===\n");

  try {
    // Batch create: Create multiple devices
    console.log("1. Creating multiple devices in batch...");
    const devicesToCreate: CreateDeviceRequest[] = [
      { name: "Batch Sensor 1", type: "sensor", status: "online" },
      { name: "Batch Sensor 2", type: "sensor", status: "online" },
      { name: "Batch Sensor 3", type: "sensor", status: "offline" },
      { name: "Batch Controller 1", type: "controller", status: "online" },
      { name: "Batch Controller 2", type: "controller", status: "online" },
    ];

    const startTime = Date.now();
    const createdDevices: Device[] = [];

    // Sequential creation
    for (const deviceData of devicesToCreate) {
      const device = await deviceService.createDevice(deviceData);
      createdDevices.push(device);
    }

    const sequentialTime = Date.now() - startTime;
    console.log(
      `✅ Created ${createdDevices.length} devices sequentially in ${sequentialTime}ms`
    );
    console.log("");

    // Parallel creation (faster)
    console.log("2. Creating devices in parallel...");
    const parallelStartTime = Date.now();
    const parallelDevices = await Promise.all(
      devicesToCreate.map((deviceData) =>
        deviceService.createDevice(deviceData)
      )
    );
    const parallelTime = Date.now() - parallelStartTime;
    console.log(
      `✅ Created ${parallelDevices.length} devices in parallel in ${parallelTime}ms`
    );
    console.log(
      `   Speed improvement: ${(
        (sequentialTime / parallelTime - 1) *
        100
      ).toFixed(1)}% faster\n`
    );

    // Use the sequentially created devices for rest of example
    const devices = createdDevices;

    // Batch history entries for a device
    console.log("3. Creating batch history entries...");
    const targetDevice = devices[0];
    const historyCount = 10;
    const historyStartTime = Date.now();

    // Create history entries in parallel
    const historyPromises: Promise<DeviceDataHistory>[] = [];
    for (let i = 0; i < historyCount; i++) {
      historyPromises.push(
        deviceDataService.createDeviceDataHistory(targetDevice.id, {
          temperature: 20 + Math.random() * 5,
          humidity: 40 + Math.random() * 10,
          power: i % 2 === 0 ? "on" : "off",
        })
      );
    }

    const historyEntries = await Promise.all(historyPromises);
    const historyTime = Date.now() - historyStartTime;
    console.log(
      `✅ Created ${historyEntries.length} history entries in ${historyTime}ms`
    );
    console.log(
      `   Average: ${(historyTime / historyCount).toFixed(2)}ms per entry`
    );
    console.log("");

    // Batch update: Update multiple devices
    console.log("4. Updating multiple devices...");
    const updateStartTime = Date.now();
    const updatePromises = devices.map((device, index) =>
      deviceService.updateDevice(device.id, {
        status: index % 2 === 0 ? "online" : "offline",
      })
    );
    const updatedDevices = await Promise.all(updatePromises);
    const updateTime = Date.now() - updateStartTime;
    console.log(
      `✅ Updated ${updatedDevices.length} devices in ${updateTime}ms`
    );
    updatedDevices.forEach((device, index) => {
      if (device) {
        console.log(`   ${index + 1}. ${device.name} - ${device.status}`);
      }
    });
    console.log("");

    // Batch data update: Update sensor data for multiple devices
    console.log("5. Updating sensor data for multiple devices...");
    const dataUpdatePromises = devices
      .filter((d) => d.type === "sensor")
      .map((device) =>
        deviceService.updateDeviceData(device.id, {
          data: {
            temperature: 22 + Math.random() * 3,
            humidity: 45 + Math.random() * 5,
            power: "on",
          },
        })
      );
    const dataUpdated = await Promise.all(dataUpdatePromises);
    console.log(`✅ Updated sensor data for ${dataUpdated.length} sensors`);
    dataUpdated.forEach((device, index) => {
      if (device) {
        console.log(
          `   ${index + 1}. ${
            device.name
          } - Temp: ${device.data.temperature.toFixed(1)}°C`
        );
      }
    });
    console.log("");

    // Performance comparison: Sequential vs Parallel
    console.log("6. Performance comparison...");
    const testDevice = devices[0];
    const testCount = 5;

    // Sequential
    const seqStart = Date.now();
    for (let i = 0; i < testCount; i++) {
      await deviceDataService.createDeviceDataHistory(testDevice.id, {
        temperature: 20,
        humidity: 40,
        power: "on",
      });
    }
    const seqTime = Date.now() - seqStart;

    // Parallel
    const parStart = Date.now();
    await Promise.all(
      Array(testCount)
        .fill(0)
        .map(() =>
          deviceDataService.createDeviceDataHistory(testDevice.id, {
            temperature: 20,
            humidity: 40,
            power: "on",
          })
        )
    );
    const parTime = Date.now() - parStart;

    console.log(`   Sequential: ${seqTime}ms for ${testCount} operations`);
    console.log(`   Parallel: ${parTime}ms for ${testCount} operations`);
    console.log(`   Speedup: ${(seqTime / parTime).toFixed(2)}x faster`);
    console.log("");

    // Clean up: Delete all created devices
    console.log("7. Cleaning up...");
    const deleteStartTime = Date.now();
    await Promise.all(
      devices.map((device) => deviceService.deleteDevice(device.id))
    );
    const deleteTime = Date.now() - deleteStartTime;
    console.log(`✅ Deleted ${devices.length} devices in ${deleteTime}ms`);
    console.log("");

    console.log("=== Example completed successfully ===");
    console.log("\n💡 Key Takeaways:");
    console.log(
      "   - Parallel operations are much faster for independent tasks"
    );
    console.log("   - Use Promise.all() for batch operations");
    console.log("   - Consider database connection limits when batching");
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
