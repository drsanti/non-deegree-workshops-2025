/**
 * Example 6: Error Handling
 *
 * This example demonstrates comprehensive error handling patterns,
 * including handling not found errors, validation errors, database
 * errors, and best practices for error handling.
 *
 * Run with: tsx examples/06-error-handling.ts
 */

import * as dotenv from "dotenv";
import { deviceService } from "../src/services/device.service.js";
import { deviceDataService } from "../src/services/deviceData.service.js";
import { prisma } from "../src/prisma/client.js";
import { CreateDeviceRequest } from "../src/types.js";

// Load environment variables
dotenv.config();

async function main() {
  console.log("=== Error Handling Example ===\n");

  try {
    // Error handling: Not found
    console.log('1. Handling "Not Found" errors...');
    const nonExistentId = "000000000000000000000000";
    const device = await deviceService.getDeviceById(nonExistentId);
    if (!device) {
      console.log("✅ Correctly handled: Device not found (returned null)");
      console.log("   Best practice: Check for null and return 404 in API");
    }
    console.log("");

    // Error handling: Delete non-existent device
    console.log("2. Handling delete of non-existent device...");
    const deleted = await deviceService.deleteDevice(nonExistentId);
    if (!deleted) {
      console.log("✅ Correctly handled: Delete failed (returned false)");
      console.log(
        "   Best practice: Return false and let route handler return 404"
      );
    }
    console.log("");

    // Error handling: Database errors
    console.log("3. Handling database errors...");
    try {
      // Try to create device with invalid data (missing required fields)
      // Note: Prisma will validate, but we can catch errors
      await prisma.device.create({
        data: {
          name: "",
          type: "invalid-type" as any, // Invalid type
          status: "online",
          data: {},
        },
      });
    } catch (error: any) {
      console.log("✅ Caught database error:", error.code || error.message);
      console.log(
        "   Best practice: Catch and handle Prisma errors gracefully"
      );
    }
    console.log("");

    // Error handling: Try-catch pattern
    console.log("4. Using try-catch for error handling...");
    async function safeOperation(
      operation: () => Promise<any>,
      errorMessage: string
    ) {
      try {
        return await operation();
      } catch (error) {
        console.error(
          `   ❌ ${errorMessage}:`,
          error instanceof Error ? error.message : String(error)
        );
        return null;
      }
    }

    const result = await safeOperation(
      () => deviceService.getDeviceById("invalid-id"),
      "Failed to get device"
    );
    console.log("✅ Safe operation pattern prevents crashes");
    console.log("");

    // Error handling: Validation errors
    console.log("5. Handling validation errors...");
    try {
      // This would fail validation in API layer
      // Here we demonstrate the concept
      const invalidDevice: CreateDeviceRequest = {
        name: "", // Empty name (invalid)
        type: "sensor",
      };
      const created = await deviceService.createDevice(invalidDevice);
      console.log("   Created device (validation would happen in API layer)");
    } catch (error) {
      console.log("✅ Validation error caught");
    }
    console.log("");

    // Error handling: Error logging
    console.log("6. Error logging best practices...");
    async function operationWithLogging() {
      try {
        await deviceService.getDeviceById("invalid");
      } catch (error) {
        // Log full error for debugging
        console.error("   Error logged:", {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString(),
        });
        // Return user-friendly message
        throw new Error("Device not found");
      }
    }

    try {
      await operationWithLogging();
    } catch (error) {
      console.log(
        "✅ Error logged with context, user-friendly message returned"
      );
    }
    console.log("");

    // Error handling: Graceful degradation
    console.log("7. Graceful degradation pattern...");
    async function getDeviceWithFallback(deviceId: string) {
      try {
        const device = await deviceService.getDeviceById(deviceId);
        if (device) {
          return device;
        }
        // Fallback: Return default device
        console.log("   Device not found, using fallback");
        return {
          id: "default",
          name: "Default Device",
          type: "sensor" as const,
          status: "offline" as const,
          lastUpdate: Date.now(),
          data: { temperature: 20, humidity: 40, power: "off" as const },
        };
      } catch (error) {
        console.log("   Error occurred, using fallback");
        return null;
      }
    }

    const deviceWithFallback = await getDeviceWithFallback("non-existent");
    if (deviceWithFallback) {
      console.log("✅ Graceful degradation: Returned fallback device");
    }
    console.log("");

    // Error handling: Retry pattern
    console.log("8. Retry pattern for transient errors...");
    async function retryOperation<T>(
      operation: () => Promise<T>,
      maxRetries: number = 3,
      delay: number = 1000
    ): Promise<T | null> {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await operation();
        } catch (error) {
          if (attempt === maxRetries) {
            console.log(`   ❌ Failed after ${maxRetries} attempts`);
            return null;
          }
          console.log(
            `   ⚠️  Attempt ${attempt} failed, retrying in ${delay}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
      return null;
    }

    const retryResult = await retryOperation(
      () => deviceService.getDeviceById("non-existent"),
      3,
      500
    );
    console.log("✅ Retry pattern demonstrated");
    console.log("");

    // Error handling: Error types
    console.log("9. Handling different error types...");
    class NotFoundError extends Error {
      constructor(message: string) {
        super(message);
        this.name = "NotFoundError";
      }
    }

    class ValidationError extends Error {
      constructor(message: string) {
        super(message);
        this.name = "ValidationError";
      }
    }

    function handleError(error: unknown) {
      if (error instanceof NotFoundError) {
        console.log("   ✅ Handled NotFoundError: Return 404");
        return { status: 404, message: error.message };
      } else if (error instanceof ValidationError) {
        console.log("   ✅ Handled ValidationError: Return 400");
        return { status: 400, message: error.message };
      } else {
        console.log("   ✅ Handled Unknown Error: Return 500");
        return { status: 500, message: "Internal server error" };
      }
    }

    const error1 = new NotFoundError("Device not found");
    handleError(error1);
    console.log("");

    console.log("=== Example completed successfully ===");
    console.log("\n💡 Key Takeaways:");
    console.log("   - Always check for null/undefined returns");
    console.log("   - Use try-catch for operations that can fail");
    console.log("   - Log errors with context for debugging");
    console.log("   - Return user-friendly error messages");
    console.log("   - Implement graceful degradation where possible");
    console.log("   - Use custom error types for better handling");
  } catch (error) {
    console.error("❌ Unexpected error occurred:", error);
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
