/**
 * Example 7: Data Transformation
 *
 * This example demonstrates data transformation patterns,
 * including converting Prisma models to API models, date
 * conversions, JSON field handling, and type transformations.
 *
 * Run with: tsx examples/07-data-transformation.ts
 */

import * as dotenv from "dotenv";
import { prisma } from "../src/prisma/client.js";
import { deviceService } from "../src/services/device.service.js";
import { Device } from "../src/types.js";

// Load environment variables
dotenv.config();

async function main() {
  console.log("=== Data Transformation Example ===\n");

  try {
    // Create a device to work with
    console.log("1. Creating a device...");
    const device = await deviceService.createDevice({
      name: "Transformation Test Sensor",
      type: "sensor",
      status: "online",
    });
    console.log("✅ Device created:", device.id);
    console.log("");

    // Transformation: Prisma model to API model
    console.log("2. Transforming Prisma model to API model...");
    const prismaDevice = await prisma.device.findUnique({
      where: { id: device.id },
    });

    if (prismaDevice) {
      console.log("   Prisma model (raw):");
      console.log("   - lastUpdate type:", typeof prismaDevice.lastUpdate);
      console.log("   - lastUpdate value:", prismaDevice.lastUpdate);
      console.log("   - data type:", typeof prismaDevice.data);
      console.log("   - data value:", JSON.stringify(prismaDevice.data));

      // Transform to API model
      const apiDevice: Device = {
        id: prismaDevice.id,
        name: prismaDevice.name,
        type: prismaDevice.type as "sensor" | "controller",
        status: prismaDevice.status as "online" | "offline",
        lastUpdate: prismaDevice.lastUpdate.getTime(), // Date → number
        data: (typeof prismaDevice.data === "string"
          ? JSON.parse(prismaDevice.data)
          : prismaDevice.data) as Device["data"],
      };

      console.log("\n   API model (transformed):");
      console.log("   - lastUpdate type:", typeof apiDevice.lastUpdate);
      console.log("   - lastUpdate value:", apiDevice.lastUpdate);
      console.log("   - data type:", typeof apiDevice.data);
      console.log("   - data value:", JSON.stringify(apiDevice.data));
      console.log("✅ Transformation complete");
    }
    console.log("");

    // Transformation: Date to timestamp
    console.log("3. Date to timestamp conversion...");
    const now = new Date();
    const timestamp = now.getTime();
    const dateFromTimestamp = new Date(timestamp);

    console.log("   Original Date:", now.toISOString());
    console.log("   Timestamp (ms):", timestamp);
    console.log("   Date from timestamp:", dateFromTimestamp.toISOString());
    console.log(
      "   ✅ Dates match:",
      now.getTime() === dateFromTimestamp.getTime()
    );
    console.log("");

    // Transformation: JSON field handling
    console.log("4. JSON field handling...");
    const jsonData = {
      temperature: 22.5,
      humidity: 45.0,
      power: "on",
    };

    // Prisma stores JSON, but it might be string or object
    const storedData = await prisma.device.findUnique({
      where: { id: device.id },
      select: { data: true },
    });

    if (storedData) {
      console.log("   Stored data type:", typeof storedData.data);
      console.log("   Stored data:", JSON.stringify(storedData.data));

      // Handle both string and object
      const parsedData =
        typeof storedData.data === "string"
          ? JSON.parse(storedData.data)
          : storedData.data;

      console.log("   Parsed data type:", typeof parsedData);
      console.log("   Parsed data:", parsedData);
      console.log("   ✅ JSON field handled correctly");
    }
    console.log("");

    // Transformation: Type assertions
    console.log("5. Type assertions and conversions...");
    const deviceFromDb = await prisma.device.findUnique({
      where: { id: device.id },
    });

    if (deviceFromDb) {
      // Type assertion for enum-like strings
      const deviceType = deviceFromDb.type as "sensor" | "controller";
      const deviceStatus = deviceFromDb.status as "online" | "offline";

      console.log("   Original type (string):", typeof deviceFromDb.type);
      console.log("   Asserted type:", deviceType);
      console.log("   Original status (string):", typeof deviceFromDb.status);
      console.log("   Asserted status:", deviceStatus);
      console.log("   ✅ Type assertions applied");
    }
    console.log("");

    // Transformation: Array transformations
    console.log("6. Array transformations...");
    const allDevices = await prisma.device.findMany();
    console.log(`   Found ${allDevices.length} devices in database`);

    // Transform array of Prisma models to API models
    const apiDevices: Device[] = allDevices.map((prismaDevice) => {
      const data =
        typeof prismaDevice.data === "string"
          ? JSON.parse(prismaDevice.data)
          : prismaDevice.data;

      return {
        id: prismaDevice.id,
        name: prismaDevice.name,
        type: prismaDevice.type as "sensor" | "controller",
        status: prismaDevice.status as "online" | "offline",
        lastUpdate: prismaDevice.lastUpdate.getTime(),
        data: {
          temperature: data.temperature,
          humidity: data.humidity,
          power: data.power as "on" | "off",
        },
      };
    });

    console.log(`   Transformed ${apiDevices.length} devices to API format`);
    console.log("   ✅ Array transformation complete");
    console.log("");

    // Transformation: Selective field transformation
    console.log("7. Selective field transformation...");
    const deviceSummary = allDevices.map((d) => ({
      id: d.id,
      name: d.name,
      type: d.type,
      // Exclude data and lastUpdate for summary
    }));

    console.log("   Summary (selected fields only):");
    deviceSummary.forEach((summary) => {
      console.log(`   - ${summary.name} (${summary.type})`);
    });
    console.log("   ✅ Selective transformation complete");
    console.log("");

    // Transformation: Nested object transformation
    console.log("8. Nested object transformation...");
    const deviceWithNested = await prisma.device.findUnique({
      where: { id: device.id },
    });

    if (deviceWithNested) {
      const nestedData =
        typeof deviceWithNested.data === "string"
          ? JSON.parse(deviceWithNested.data)
          : deviceWithNested.data;

      // Transform nested data structure
      const transformedNested = {
        sensorReadings: {
          temperature: {
            value: nestedData.temperature,
            unit: "celsius",
          },
          humidity: {
            value: nestedData.humidity,
            unit: "percent",
          },
        },
        powerState: nestedData.power,
      };

      console.log(
        "   Original nested data:",
        JSON.stringify(nestedData, null, 2)
      );
      console.log(
        "   Transformed nested:",
        JSON.stringify(transformedNested, null, 2)
      );
      console.log("   ✅ Nested transformation complete");
    }
    console.log("");

    // Clean up
    console.log("9. Cleaning up...");
    await deviceService.deleteDevice(device.id);
    console.log("✅ Device deleted");
    console.log("");

    console.log("=== Example completed successfully ===");
    console.log("\n💡 Key Takeaways:");
    console.log("   - Always transform Prisma models to API models");
    console.log("   - Convert Date objects to timestamps for JSON");
    console.log("   - Handle JSON fields that might be strings");
    console.log("   - Use type assertions for enum-like values");
    console.log("   - Transform arrays using map()");
    console.log("   - Select only needed fields when possible");
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
