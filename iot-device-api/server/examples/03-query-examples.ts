/**
 * Example 3: Query Examples
 *
 * This example demonstrates various query patterns and filters
 * for working with devices, including filtering by type, status,
 * sorting, and complex queries.
 *
 * Run with: tsx examples/03-query-examples.ts
 */

import * as dotenv from "dotenv";
import { prisma } from "../src/prisma/client.js";
import { deviceService } from "../src/services/device.service.js";
import { CreateDeviceRequest, Device } from "../src/types.js";

// Load environment variables
dotenv.config();

async function main() {
  console.log("=== Query Examples ===\n");

  try {
    // Create sample devices for demonstration
    console.log("1. Creating sample devices...");
    const devicesToCreate: CreateDeviceRequest[] = [
      { name: "Temperature Sensor A", type: "sensor", status: "online" },
      { name: "Temperature Sensor B", type: "sensor", status: "offline" },
      { name: "Smart Thermostat", type: "controller", status: "online" },
      { name: "Humidity Monitor", type: "sensor", status: "online" },
      { name: "AC Controller", type: "controller", status: "offline" },
    ];

    const createdDevices: Device[] = [];
    for (const deviceData of devicesToCreate) {
      const device = await deviceService.createDevice(deviceData);
      createdDevices.push(device);
      console.log(
        `   Created: ${device.name} (${device.type}) - ${device.status}`
      );
    }
    console.log(`✅ Created ${createdDevices.length} devices\n`);

    // Query 1: Get all devices
    console.log("2. Query: Get all devices");
    const allDevices = await deviceService.getAllDevices();
    console.log(`✅ Found ${allDevices.length} total devices\n`);

    // Query 2: Filter by type using Prisma directly
    console.log("3. Query: Filter by type (sensor)");
    const sensors = await prisma.device.findMany({
      where: {
        type: "sensor",
      },
    });
    console.log(`✅ Found ${sensors.length} sensors:`);
    sensors.forEach((device) => {
      console.log(`   - ${device.name} (${device.status})`);
    });
    console.log("");

    // Query 3: Filter by status
    console.log("4. Query: Filter by status (online)");
    const onlineDevices = await prisma.device.findMany({
      where: {
        status: "online",
      },
    });
    console.log(`✅ Found ${onlineDevices.length} online devices:`);
    onlineDevices.forEach((device) => {
      console.log(`   - ${device.name} (${device.type})`);
    });
    console.log("");

    // Query 4: Filter by multiple conditions
    console.log("5. Query: Filter by type AND status");
    const onlineSensors = await prisma.device.findMany({
      where: {
        type: "sensor",
        status: "online",
      },
    });
    console.log(`✅ Found ${onlineSensors.length} online sensors:`);
    onlineSensors.forEach((device) => {
      console.log(`   - ${device.name}`);
    });
    console.log("");

    // Query 5: Sort by name
    console.log("6. Query: Sort by name (ascending)");
    const sortedByName = await prisma.device.findMany({
      orderBy: {
        name: "asc",
      },
    });
    console.log("✅ Devices sorted by name:");
    sortedByName.forEach((device, index) => {
      console.log(`   ${index + 1}. ${device.name}`);
    });
    console.log("");

    // Query 6: Sort by lastUpdate (descending)
    console.log("7. Query: Sort by lastUpdate (descending)");
    const sortedByUpdate = await prisma.device.findMany({
      orderBy: {
        lastUpdate: "desc",
      },
      take: 3, // Limit to 3 most recent
    });
    console.log("✅ 3 most recently updated devices:");
    sortedByUpdate.forEach((device, index) => {
      console.log(
        `   ${index + 1}. ${
          device.name
        } - Updated: ${device.lastUpdate.toISOString()}`
      );
    });
    console.log("");

    // Query 7: Limit results
    console.log("8. Query: Limit results to 2 devices");
    const limited = await prisma.device.findMany({
      take: 2,
    });
    console.log(`✅ Limited to 2 devices:`);
    limited.forEach((device) => {
      console.log(`   - ${device.name}`);
    });
    console.log("");

    // Query 8: Skip and take (pagination)
    console.log("9. Query: Pagination (skip 2, take 2)");
    const paginated = await prisma.device.findMany({
      skip: 2,
      take: 2,
      orderBy: {
        name: "asc",
      },
    });
    console.log("✅ Page 2 (skip 2, take 2):");
    paginated.forEach((device, index) => {
      console.log(`   ${index + 1}. ${device.name}`);
    });
    console.log("");

    // Query 9: Count devices
    console.log("10. Query: Count devices by type");
    const sensorCount = await prisma.device.count({
      where: {
        type: "sensor",
      },
    });
    const controllerCount = await prisma.device.count({
      where: {
        type: "controller",
      },
    });
    console.log(`✅ Device counts:`);
    console.log(`   Sensors: ${sensorCount}`);
    console.log(`   Controllers: ${controllerCount}`);
    console.log("");

    // Query 10: Find first matching device
    console.log("11. Query: Find first online sensor");
    const firstOnlineSensor = await prisma.device.findFirst({
      where: {
        type: "sensor",
        status: "online",
      },
    });
    if (firstOnlineSensor) {
      console.log(`✅ First online sensor: ${firstOnlineSensor.name}`);
    } else {
      console.log("❌ No online sensors found");
    }
    console.log("");

    // Clean up: Delete all created devices
    console.log("12. Cleaning up...");
    for (const device of createdDevices) {
      await deviceService.deleteDevice(device.id);
    }
    console.log(`✅ Deleted ${createdDevices.length} devices`);
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
    await prisma.$disconnect();
  }
}

// Run the example
main();
