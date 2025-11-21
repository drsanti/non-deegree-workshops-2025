# Workshop 6: Device Management - CRUD Operations

**Duration:** 45-60 minutes  
**Level:** Intermediate

## Introduction

In this workshop, you'll learn how to implement CRUD (Create, Read, Update, Delete) operations for device management. You'll understand the service layer pattern, data transformations, and how to handle different types of updates.

## What You'll Learn

- Implement Create operations
- Implement Read operations (single and list)
- Implement Update operations
- Implement Delete operations
- Understand service layer pattern

## Prerequisites

- Completed Workshop 1-5
- Understanding of async/await
- Familiarity with database operations

## Step-by-Step Instructions

### Step 1: Understanding CRUD

CRUD stands for:
- **Create** - Add new records
- **Read** - Retrieve records
- **Update** - Modify existing records
- **Delete** - Remove records

These are the fundamental operations for any data management system.

### Step 2: Create Operation

Creating a new device:

```typescript
async createDevice(data: CreateDeviceRequest): Promise<Device> {
  const defaultData: DeviceData = {
    temperature: 20,
    humidity: 40,
    power: 'off',
  };

  const deviceData = data.data || defaultData;

  const device = await prisma.device.create({
    data: {
      name: data.name,
      type: data.type,
      status: data.status || 'online',
      data: deviceData as any,
    },
  });

  return prismaDeviceToDevice(device);
}
```

**Key points:**
- Provide default values for optional fields
- Prisma creates the document in MongoDB
- Transform Prisma model to API model
- Return the created device

### Step 3: Read Operations

**Get all devices:**
```typescript
async getAllDevices(): Promise<Device[]> {
  const devices = await prisma.device.findMany({
    orderBy: { lastUpdate: 'desc' },
  });
  return devices.map(prismaDeviceToDevice);
}
```

**Get single device:**
```typescript
async getDeviceById(id: string): Promise<Device | null> {
  const device = await prisma.device.findUnique({
    where: { id },
  });
  return device ? prismaDeviceToDevice(device) : null;
}
```

**Differences:**
- `findMany()` - Returns array (empty if none)
- `findUnique()` - Returns single or null
- Both transform results before returning

### Step 4: Update Operations

**Full update (PUT):**
```typescript
async updateDevice(id: string, data: UpdateDeviceRequest): Promise<Device | null> {
  const updateData: any = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.data !== undefined) {
    updateData.data = data.data as any;
  }
  updateData.lastUpdate = new Date();

  const device = await prisma.device.update({
    where: { id },
    data: updateData,
  });

  return prismaDeviceToDevice(device);
}
```

**Partial update (PATCH):**
```typescript
async updateDeviceStatus(
  id: string,
  status: UpdateDeviceStatusRequest
): Promise<Device | null> {
  const device = await prisma.device.update({
    where: { id },
    data: {
      status: status.status,
      lastUpdate: new Date(),
    },
  });

  return prismaDeviceToDevice(device);
}
```

**Key differences:**
- Full update can change any field
- Partial update changes specific fields
- Both update `lastUpdate` timestamp

### Step 5: Delete Operation

```typescript
async deleteDevice(id: string): Promise<boolean> {
  try {
    await prisma.device.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    return false;
  }
}
```

**Error handling:**
- Returns `true` if deleted successfully
- Returns `false` if device doesn't exist
- Catches Prisma errors gracefully

### Step 6: Data Transformation

Converting Prisma models to API models:

```typescript
function prismaDeviceToDevice(prismaDevice: any): Device {
  const data = typeof prismaDevice.data === 'string' 
    ? JSON.parse(prismaDevice.data) 
    : prismaDevice.data;
  
  return {
    id: prismaDevice.id,
    name: prismaDevice.name,
    type: prismaDevice.type as 'sensor' | 'controller',
    status: prismaDevice.status as 'online' | 'offline',
    lastUpdate: prismaDevice.lastUpdate.getTime(),  // Date → number
    data: {
      temperature: data.temperature,
      humidity: data.humidity,
      power: data.power as 'on' | 'off',
    },
  };
}
```

**Why transform:**
- Prisma returns Date objects, API needs timestamps
- Prisma JSON might be string, API needs object
- Consistent API response format

## Code Examples

### Complete Service Implementation

```typescript
export const deviceService = {
  // Create
  async createDevice(data: CreateDeviceRequest): Promise<Device> {
    // Implementation
  },

  // Read
  async getAllDevices(): Promise<Device[]> {
    // Implementation
  },

  async getDeviceById(id: string): Promise<Device | null> {
    // Implementation
  },

  // Update
  async updateDevice(id: string, data: UpdateDeviceRequest): Promise<Device | null> {
    // Implementation
  },

  async updateDeviceStatus(id: string, status: UpdateDeviceStatusRequest): Promise<Device | null> {
    // Implementation
  },

  async updateDeviceData(id: string, data: UpdateDeviceDataRequest): Promise<Device | null> {
    // Implementation
  },

  // Delete
  async deleteDevice(id: string): Promise<boolean> {
    // Implementation
  },
};
```

### Route Integration

```typescript
// Create
fastify.post('/api/devices', async (request, reply) => {
  const device = await deviceService.createDevice(request.body as any);
  return reply.code(201).send(device);
});

// Read all
fastify.get('/api/devices', async (_request, reply) => {
  const devices = await deviceService.getAllDevices();
  return reply.code(200).send(devices);
});

// Read one
fastify.get('/api/devices/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const device = await deviceService.getDeviceById(id);
  if (!device) {
    return reply.code(404).send({ error: 'Device not found' });
  }
  return reply.code(200).send(device);
});

// Update
fastify.put('/api/devices/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const device = await deviceService.updateDevice(id, request.body as any);
  if (!device) {
    return reply.code(404).send({ error: 'Device not found' });
  }
  return reply.code(200).send(device);
});

// Delete
fastify.delete('/api/devices/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const deleted = await deviceService.deleteDevice(id);
  if (!deleted) {
    return reply.code(404).send({ error: 'Device not found' });
  }
  return reply.code(200).send({ message: 'Device deleted successfully' });
});
```

## Explanations

### Service Layer Pattern

**Benefits:**
- **Reusability** - Services can be used by routes, jobs, CLI tools
- **Testability** - Test business logic without HTTP layer
- **Separation** - Business logic separate from HTTP concerns
- **Maintainability** - Changes to HTTP don't affect business logic

### Create vs Update

**Create:**
- Generates new ID
- Sets initial timestamps
- May have default values
- Returns 201 (Created)

**Update:**
- Requires existing ID
- Updates timestamps
- Only changes provided fields
- Returns 200 (OK)

### Partial vs Full Update

**Full update (PUT):**
- Client sends all fields
- Server replaces entire record
- Missing fields might be set to defaults

**Partial update (PATCH):**
- Client sends only changed fields
- Server updates only those fields
- Other fields remain unchanged

### Error Handling

**Not found errors:**
```typescript
const device = await getDeviceById(id);
if (!device) {
  return reply.code(404).send({ error: 'Device not found' });
}
```

**Database errors:**
```typescript
try {
  await prisma.device.delete({ where: { id } });
} catch (error) {
  // Handle Prisma errors
  return false;
}
```

## Common Pitfalls

1. **Not handling null returns:**
   ```typescript
   // ❌ Bad: Might be null
   const device = await getDeviceById(id);
   return device.name;
   
   // ✅ Good: Check for null
   const device = await getDeviceById(id);
   if (!device) {
     return reply.code(404).send({ error: 'Not found' });
   }
   return device.name;
   ```

2. **Forgetting to transform data:**
   ```typescript
   // ❌ Bad: Returns Prisma model
   return await prisma.device.findUnique({ where: { id } });
   
   // ✅ Good: Transform to API model
   const device = await prisma.device.findUnique({ where: { id } });
   return device ? prismaDeviceToDevice(device) : null;
   ```

3. **Not updating timestamps:**
   ```typescript
   // ❌ Bad: Forgets to update timestamp
   await prisma.device.update({
     where: { id },
     data: { status: 'offline' }
   });
   
   // ✅ Good: Updates timestamp
   await prisma.device.update({
     where: { id },
     data: {
       status: 'offline',
       lastUpdate: new Date()
     }
   });
   ```

## Summary

In this workshop, you've learned:

✅ Create operations with defaults  
✅ Read operations (single and list)  
✅ Update operations (full and partial)  
✅ Delete operations with error handling  
✅ Service layer pattern  
✅ Data transformation  

**Key Takeaways:**
- **CRUD is fundamental:** All data operations follow this pattern
- **Service layer abstracts logic:** Reusable and testable
- **Transform data consistently:** Prisma models → API models
- **Handle errors gracefully:** Return appropriate status codes
- **Update timestamps:** Track when records change

## Next Steps

- **Workshop 7:** Device Data History & Advanced Queries
- Practice implementing CRUD for a new resource
- Study error handling patterns
- Read Prisma CRUD documentation

