# Workshop 5: TypeScript in Backend Development

**Duration:** 45-60 minutes  
**Level:** Intermediate

## Introduction

In this workshop, you'll learn how TypeScript enhances backend development. You'll understand type definitions, interfaces, type safety, and common TypeScript patterns used in API development.

## What You'll Learn

- Understand TypeScript benefits in backend
- Learn type definitions and interfaces
- Work with type safety
- Understand generic types
- Learn about type guards and assertions

## Prerequisites

- Completed Workshop 1-4
- Basic JavaScript knowledge
- Understanding of objects and functions

## Step-by-Step Instructions

### Step 1: Why TypeScript for Backends?

**JavaScript Issues:**
```javascript
// Runtime error - property doesn't exist
const device = { name: "Sensor" };
console.log(device.nam);  // undefined (typo!)

// Wrong type passed
function createDevice(data) {
  return data.name.toUpperCase();
}
createDevice({ name: 123 });  // Runtime error!
```

**TypeScript Benefits:**
```typescript
// Compile-time error - caught before running
const device: Device = { name: "Sensor" };
console.log(device.nam);  // Error: Property 'nam' does not exist

// Type checking
function createDevice(data: CreateDeviceRequest): Device {
  return data.name.toUpperCase();  // TypeScript knows name is string
}
createDevice({ name: 123 });  // Error: Type 'number' is not assignable to type 'string'
```

**Key Advantages:**
- **Catch errors early** - Before code runs
- **Better IDE support** - Autocomplete and refactoring
- **Self-documenting** - Types describe what code expects
- **Safer refactoring** - TypeScript ensures consistency

### Step 2: Understanding Type Definitions

From `src/types.ts`:

```typescript
// Type aliases - create new names for types
export type DeviceType = 'sensor' | 'controller';
export type DeviceStatus = 'online' | 'offline';
export type PowerStatus = 'on' | 'off';

// Union types - value can be one of several types
type Status = 'online' | 'offline';

// Interfaces - define object shapes
export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  lastUpdate: number;
  data: DeviceData;
}
```

**Type vs Interface:**
- **Type** - Can represent primitives, unions, intersections
- **Interface** - Only for object shapes, can be extended

### Step 3: Working with Interfaces

Interfaces define contracts:

```typescript
// Define what a device looks like
interface Device {
  id: string;
  name: string;
  type: 'sensor' | 'controller';
}

// Function must accept Device
function getDeviceName(device: Device): string {
  return device.name;  // TypeScript knows 'name' exists
}

// TypeScript enforces the contract
const device: Device = {
  id: "123",
  name: "Sensor",
  type: "sensor"
  // Missing fields = compile error
};
```

### Step 4: Optional and Required Properties

```typescript
interface CreateDeviceRequest {
  name: string;           // Required
  type: DeviceType;       // Required
  status?: DeviceStatus;  // Optional (notice ?)
  data?: DeviceData;      // Optional
}

// All valid:
createDevice({ name: "Sensor", type: "sensor" });
createDevice({ name: "Sensor", type: "sensor", status: "online" });
createDevice({ name: "Sensor", type: "sensor", status: "online", data: {...} });
```

### Step 5: Type Safety with Prisma

Prisma generates types from your schema:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Prisma knows the Device model structure
const device = await prisma.device.create({
  data: {
    name: "Sensor",
    type: "sensor",
    // TypeScript autocomplete shows available fields
    // TypeScript error if field doesn't exist
  }
});

// device is typed as Prisma.Device
// TypeScript knows all fields and their types
console.log(device.id);        // string
console.log(device.lastUpdate); // Date
```

### Step 6: Type Transformations

Converting between Prisma types and API types:

```typescript
// Prisma returns: { id: string, lastUpdate: Date, ... }
// API needs: { id: string, lastUpdate: number, ... }

function prismaDeviceToDevice(prismaDevice: any): Device {
  return {
    id: prismaDevice.id,
    name: prismaDevice.name,
    type: prismaDevice.type as 'sensor' | 'controller',
    status: prismaDevice.status as 'online' | 'offline',
    lastUpdate: prismaDevice.lastUpdate.getTime(),  // Date → number
    data: {
      temperature: prismaDevice.data.temperature,
      humidity: prismaDevice.data.humidity,
      power: prismaDevice.data.power as 'on' | 'off',
    },
  };
}
```

**Why transform:**
- API consumers expect specific formats
- Dates as timestamps (numbers) are easier in JSON
- Type safety ensures correct transformation

### Step 7: Type Assertions

When you know more than TypeScript:

```typescript
// Type assertion - tell TypeScript the type
const data = prismaDevice.data as DeviceData;

// Type guard - runtime check
function isDeviceData(obj: any): obj is DeviceData {
  return (
    typeof obj.temperature === 'number' &&
    typeof obj.humidity === 'number' &&
    (obj.power === 'on' || obj.power === 'off')
  );
}

if (isDeviceData(someData)) {
  // TypeScript now knows someData is DeviceData
  console.log(someData.temperature);
}
```

### Step 8: Generic Types

Reusable type patterns:

```typescript
// Generic function - works with any type
function getById<T>(id: string, model: string): Promise<T | null> {
  // Implementation
}

// Usage with specific types
const device = await getById<Device>("123", "device");
const history = await getById<DeviceDataHistory>("456", "history");
```

**Generic constraints:**
```typescript
// T must have an 'id' property
function findById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find(item => item.id === id);
}
```

### Step 9: Utility Types

TypeScript provides helpful utility types:

```typescript
interface Device {
  id: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
}

// Partial - all properties optional
type PartialDevice = Partial<Device>;
// { id?: string, name?: string, ... }

// Pick - select specific properties
type DeviceName = Pick<Device, 'name' | 'type'>;
// { name: string, type: DeviceType }

// Omit - exclude specific properties
type DeviceWithoutId = Omit<Device, 'id'>;
// { name: string, type: DeviceType, status: DeviceStatus }
```

## Code Examples

### Complete Type Definition Example

From `src/types.ts`:

```typescript
// Domain types
export type DeviceType = 'sensor' | 'controller';
export type DeviceStatus = 'online' | 'offline';
export type PowerStatus = 'on' | 'off';

// Data structures
export interface DeviceData {
  temperature: number;
  humidity: number;
  power: PowerStatus;
}

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  lastUpdate: number;
  data: DeviceData;
}

// Request/Response types
export interface CreateDeviceRequest {
  name: string;
  type: DeviceType;
  status?: DeviceStatus;
  data?: DeviceData;
}

export interface UpdateDeviceRequest {
  name?: string;
  type?: DeviceType;
  status?: DeviceStatus;
  data?: DeviceData;
}
```

### Type-Safe Service Method

```typescript
async getDeviceById(id: string): Promise<Device | null> {
  // TypeScript ensures return type matches
  const device = await prisma.device.findUnique({
    where: { id },
  });
  
  // Type guard
  if (!device) {
    return null;  // TypeScript knows this is Device | null
  }
  
  // Transform with type safety
  return prismaDeviceToDevice(device);  // Returns Device
}
```

### Type-Safe Route Handler

```typescript
fastify.get('/api/devices/:id', async (request, reply) => {
  // Type assertion for params
  const { id } = request.params as { id: string };
  
  // Service returns typed result
  const device: Device | null = await deviceService.getDeviceById(id);
  
  // TypeScript knows device might be null
  if (!device) {
    return reply.code(404).send({ error: 'Device not found' });
  }
  
  // TypeScript knows device is Device here
  return reply.code(200).send(device);
});
```

## Explanations

### Why Type Safety Matters

**Compile-time vs Runtime:**
- **Compile-time errors** - Caught by TypeScript before code runs
- **Runtime errors** - Happen when code executes, harder to debug

**Example:**
```typescript
// Compile-time (TypeScript catches this)
function getDeviceName(device: Device): string {
  return device.nam;  // Error: Property 'nam' does not exist
}

// Runtime (JavaScript, error happens when called)
function getDeviceName(device) {
  return device.nam;  // No error until function is called
}
```

### Type Inference

TypeScript can infer types automatically:

```typescript
// TypeScript infers: const name: string
const name = "Sensor";

// TypeScript infers: const count: number
const count = 42;

// TypeScript infers: const devices: Device[]
const devices = await deviceService.getAllDevices();
```

**When to be explicit:**
- Function parameters and return types
- Complex types that might be ambiguous
- Public APIs where types should be clear

### Union Types

Union types allow multiple possibilities:

```typescript
type DeviceType = 'sensor' | 'controller';

// TypeScript ensures only valid values
const type1: DeviceType = 'sensor';      // ✅ Valid
const type2: DeviceType = 'controller'; // ✅ Valid
const type3: DeviceType = 'actuator';   // ❌ Error
```

**Benefits:**
- Prevents invalid values
- IDE autocomplete shows options
- Refactoring is safer

### Type Guards

Runtime type checking:

```typescript
function isDevice(obj: any): obj is Device {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    obj.type === 'sensor' || obj.type === 'controller'
  );
}

// Usage
const data = JSON.parse(jsonString);
if (isDevice(data)) {
  // TypeScript now knows data is Device
  console.log(data.name);
}
```

## Common Pitfalls

1. **Using `any` too much:**
   ```typescript
   // ❌ Bad: Loses type safety
   function process(data: any) {
     return data.name;
   }
   
   // ✅ Good: Use proper types
   function process(data: Device) {
     return data.name;
   }
   ```

2. **Not handling null/undefined:**
   ```typescript
   // ❌ Bad: Might be null
   const device = await getDeviceById(id);
   console.log(device.name);  // Error if null
   
   // ✅ Good: Check for null
   const device = await getDeviceById(id);
   if (device) {
     console.log(device.name);
   }
   ```

3. **Type assertions without validation:**
   ```typescript
   // ❌ Bad: Assumes type without checking
   const data = request.body as DeviceData;
   
   // ✅ Good: Validate first
   if (isDeviceData(request.body)) {
     const data = request.body;  // TypeScript knows it's DeviceData
   }
   ```

4. **Forgetting return types:**
   ```typescript
   // ❌ Bad: Return type unclear
   async function getDevice(id: string) {
     return await prisma.device.findUnique({ where: { id } });
   }
   
   // ✅ Good: Explicit return type
   async function getDevice(id: string): Promise<Device | null> {
     return await prisma.device.findUnique({ where: { id } });
   }
   ```

## Summary

In this workshop, you've learned:

✅ TypeScript benefits for backend development  
✅ Type definitions and interfaces  
✅ Type safety with Prisma  
✅ Type transformations and assertions  
✅ Generic types  
✅ Utility types  
✅ Type guards  

**Key Takeaways:**
- **TypeScript catches errors early:** Before code runs
- **Types document code:** Self-documenting interfaces
- **Type safety prevents bugs:** Compile-time checking
- **Prisma generates types:** Automatic type safety for database
- **Type guards validate at runtime:** When types are uncertain

## Next Steps

- **Workshop 6:** Device Management - CRUD Operations
- Practice writing type definitions
- Experiment with utility types
- Read [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- Study type-safe patterns in the codebase

