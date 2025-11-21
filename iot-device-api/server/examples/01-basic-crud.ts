/**
 * Example 1: Basic CRUD Operations
 *
 * This example demonstrates how to perform Create, Read, Update, and Delete
 * operations on IoT devices using the device service.
 *
 * Run with: tsx examples/01-basic-crud.ts
 */

import dotenv from "dotenv";
import { deviceService } from "../src/services/device.service.js";
import { CreateDeviceRequest } from "../src/types.js";

// Load environment variables
dotenv.config();

async function main() {
  console.log("=== Basic CRUD Operations Example ===\n");

  try {
    // CREATE: Create a new device
    console.log("1. Creating a new device...");
    const newDevice: CreateDeviceRequest = {
      name: "Temperature Sensor 001",
      type: "sensor",
      status: "online",
      data: {
        temperature: 22.5,
        humidity: 45.0,
        power: "on",
      },
    };

    const createdDevice = await deviceService.createDevice(newDevice);
    console.log("✅ Device created:", {
      id: createdDevice.id,
      name: createdDevice.name,
      type: createdDevice.type,
      status: createdDevice.status,
    });
    console.log("");

    // READ: Get device by ID
    console.log("2. Reading device by ID...");
    const deviceById = await deviceService.getDeviceById(createdDevice.id);
    if (deviceById) {
      console.log("✅ Device found:", {
        id: deviceById.id,
        name: deviceById.name,
        data: deviceById.data,
        lastUpdate: new Date(deviceById.lastUpdate).toISOString(),
      });
    } else {
      console.log("❌ Device not found");
    }
    console.log("");

    // READ: Get all devices
    console.log("3. Reading all devices...");
    const allDevices = await deviceService.getAllDevices();
    console.log(`✅ Found ${allDevices.length} device(s)`);
    allDevices.forEach((device, index) => {
      console.log(
        `   ${index + 1}. ${device.name} (${device.type}) - ${device.status}`
      );
    });
    console.log("");

    // UPDATE: Update device name and status
    console.log("4. Updating device...");
    const updatedDevice = await deviceService.updateDevice(createdDevice.id, {
      name: "Updated Temperature Sensor 001",
      status: "offline",
    });
    if (updatedDevice) {
      console.log("✅ Device updated:", {
        id: updatedDevice.id,
        name: updatedDevice.name,
        status: updatedDevice.status,
      });
    }
    console.log("");

    // UPDATE: Update device sensor data
    console.log("5. Updating device sensor data...");
    const deviceWithNewData = await deviceService.updateDeviceData(
      createdDevice.id,
      {
        data: {
          temperature: 25.5,
          humidity: 50.0,
          power: "off",
        },
      }
    );
    if (deviceWithNewData) {
      console.log("✅ Device data updated:", {
        id: deviceWithNewData.id,
        data: deviceWithNewData.data,
      });
    }
    console.log("");

    // UPDATE: Update device status only
    console.log("6. Updating device status...");
    const deviceWithNewStatus = await deviceService.updateDeviceStatus(
      createdDevice.id,
      {
        status: "online",
      }
    );
    if (deviceWithNewStatus) {
      console.log("✅ Device status updated:", {
        id: deviceWithNewStatus.id,
        status: deviceWithNewStatus.status,
      });
    }
    console.log("");

    // DELETE: Delete the device
    console.log("7. Deleting device...");
    const deleted = await deviceService.deleteDevice(createdDevice.id);
    if (deleted) {
      console.log("✅ Device deleted successfully");
    } else {
      console.log("❌ Failed to delete device");
    }
    console.log("");

    // Verify deletion
    console.log("8. Verifying deletion...");
    const deletedDevice = await deviceService.getDeviceById(createdDevice.id);
    if (!deletedDevice) {
      console.log("✅ Device successfully deleted (not found)");
    } else {
      console.log("❌ Device still exists");
    }
    console.log("");

    // Error handling: Try to get non-existent device
    console.log("9. Error handling: Getting non-existent device...");
    const nonExistent = await deviceService.getDeviceById(
      "000000000000000000000000"
    );
    if (!nonExistent) {
      console.log("✅ Correctly returned null for non-existent device");
    }
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
