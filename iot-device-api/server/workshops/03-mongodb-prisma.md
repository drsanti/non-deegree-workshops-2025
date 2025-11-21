# Workshop 3: MongoDB & Prisma ORM Fundamentals

**Duration:** 45-60 minutes  
**Level:** Beginner to Intermediate

## Introduction

In this workshop, you'll learn about MongoDB (a NoSQL database) and Prisma ORM (Object-Relational Mapping). You'll understand how to define database schemas, work with MongoDB through Prisma, and perform database operations.

## What You'll Learn

- Understand NoSQL databases and MongoDB
- Learn Prisma schema definition
- Understand Prisma Client generation
- Work with MongoDB through Prisma
- Learn about embedded documents in MongoDB

## Prerequisites

- Completed Workshop 1 (Setup & Environment)
- Completed Workshop 2 (Project Architecture)
- Basic understanding of databases (tables, records, queries)

## Step-by-Step Instructions

### Step 1: Understanding MongoDB Basics

MongoDB is a **NoSQL** (Not Only SQL) document database. Unlike relational databases:

**Relational Database (SQL):**
- Data in tables with rows and columns
- Fixed schema
- Relationships via foreign keys
- Example: MySQL, PostgreSQL

**MongoDB (NoSQL):**
- Data in collections with documents
- Flexible schema
- Embedded documents or references
- Example: MongoDB, CouchDB

**Key MongoDB Concepts:**

1. **Database** - Container for collections (like `non-degree-db`)
2. **Collection** - Like a table (e.g., `devices`, `device_data_history`)
3. **Document** - Like a row (JSON-like object)
4. **Field** - Like a column (key-value pair)
5. **ObjectId** - Unique identifier (like primary key)

### Step 2: Exploring the Prisma Schema

Open `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

model Device {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String
  type      String   // 'sensor' | 'controller'
  status    String   // 'online' | 'offline'
  lastUpdate DateTime @default(now())
  data      Json     // Embedded document: { temperature, humidity, power }

  @@map("devices")
}

model DeviceDataHistory {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  deviceId    String   @db.ObjectId
  timestamp   DateTime @default(now())
  temperature Float
  humidity    Float
  power       String // 'on' | 'off'

  @@index([deviceId])
  @@index([deviceId, timestamp])
  @@map("device_data_history")
}
```

**Schema Components:**

1. **Generator** - Tells Prisma to generate JavaScript client
2. **Datasource** - Database connection configuration
3. **Model** - Represents a collection in MongoDB
4. **Fields** - Properties of the model
5. **Attributes** - Special annotations (`@id`, `@default`, `@map`)

### Step 3: Understanding Model Fields

Let's break down the `Device` model:

```prisma
model Device {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  //        ^type    ^attributes
}
```

**Field Syntax:**
- `id` - Field name
- `String` - Type (String, Int, Float, Boolean, DateTime, Json)
- `@id` - Primary key
- `@default(auto())` - Auto-generate value
- `@map("_id")` - MongoDB field name (MongoDB uses `_id` for primary key)
- `@db.ObjectId` - MongoDB-specific type

**Common Field Types:**
- `String` - Text data
- `Int` - Integer numbers
- `Float` - Decimal numbers
- `Boolean` - true/false
- `DateTime` - Date and time
- `Json` - Flexible JSON data

### Step 4: Understanding Embedded Documents

MongoDB allows storing nested documents. In our schema:

```prisma
data      Json     // Embedded document: { temperature, humidity, power }
```

**What this means:**
- `data` is stored as a JSON object inside the device document
- No separate collection needed
- Fast to read (all data in one document)
- Good for data that's always accessed together

**Example document in MongoDB:**
```json
{
  "_id": "67890abcdef1234567890123",
  "name": "Temperature Sensor",
  "type": "sensor",
  "status": "online",
  "lastUpdate": ISODate("2024-01-01T00:00:00Z"),
  "data": {
    "temperature": 22.5,
    "humidity": 45.0,
    "power": "on"
  }
}
```

### Step 5: Understanding Indexes

Indexes improve query performance:

```prisma
@@index([deviceId])
@@index([deviceId, timestamp])
```

**What indexes do:**
- Create data structures for fast lookups
- Like an index in a book - helps find pages quickly
- Trade-off: Slightly slower writes, much faster reads

**Our indexes:**
1. `deviceId` - Fast lookup by device
2. `deviceId, timestamp` - Fast lookup by device with time sorting

### Step 6: Working with Prisma Client

After generating the client, you can use it:

```typescript
import { prisma } from './prisma/client.js';

// Create a device
const device = await prisma.device.create({
  data: {
    name: "Temperature Sensor",
    type: "sensor",
    status: "online",
    data: {
      temperature: 20,
      humidity: 40,
      power: "off"
    }
  }
});

// Find all devices
const devices = await prisma.device.findMany();

// Find one device
const device = await prisma.device.findUnique({
  where: { id: "67890abcdef1234567890123" }
});

// Update a device
const updated = await prisma.device.update({
  where: { id: "67890abcdef1234567890123" },
  data: { status: "offline" }
});

// Delete a device
await prisma.device.delete({
  where: { id: "67890abcdef1234567890123" }
});
```

### Step 7: Understanding CRUD Operations

**Create:**
```typescript
await prisma.device.create({
  data: { /* device data */ }
});
```

**Read:**
```typescript
// Find many
await prisma.device.findMany();

// Find one
await prisma.device.findUnique({ where: { id } });

// Find first matching
await prisma.device.findFirst({ where: { status: "online" } });
```

**Update:**
```typescript
await prisma.device.update({
  where: { id },
  data: { /* fields to update */ }
});
```

**Delete:**
```typescript
await prisma.device.delete({
  where: { id }
});
```

### Step 8: Querying with Filters

Prisma supports powerful querying:

```typescript
// Filter by status
const onlineDevices = await prisma.device.findMany({
  where: { status: "online" }
});

// Filter with multiple conditions
const sensors = await prisma.device.findMany({
  where: {
    type: "sensor",
    status: "online"
  }
});

// Sort results
const sortedDevices = await prisma.device.findMany({
  orderBy: { lastUpdate: 'desc' }
});

// Limit results
const recentDevices = await prisma.device.findMany({
  take: 10,
  orderBy: { lastUpdate: 'desc' }
});
```

### Step 9: Working with History Data

The `DeviceDataHistory` model shows time-series data:

```typescript
// Create history entry
await prisma.deviceDataHistory.create({
  data: {
    deviceId: "67890abcdef1234567890123",
    temperature: 22.5,
    humidity: 45.0,
    power: "on",
    timestamp: new Date()
  }
});

// Query with date range
const history = await prisma.deviceDataHistory.findMany({
  where: {
    deviceId: "67890abcdef1234567890123",
    timestamp: {
      gte: new Date("2024-01-01"),
      lte: new Date("2024-01-31")
    }
  },
  orderBy: { timestamp: 'desc' },
  take: 100
});
```

## Code Examples

### Complete Service Method Example

From `src/services/device.service.ts`:

```typescript
async createDevice(data: CreateDeviceRequest): Promise<Device> {
  const defaultData: DeviceData = {
    temperature: 20,
    humidity: 40,
    power: 'off',
  };

  const deviceData = data.data || defaultData;

  // Prisma create operation
  const device = await prisma.device.create({
    data: {
      name: data.name,
      type: data.type,
      status: data.status || 'online',
      data: deviceData as any,  // Json type accepts any object
    },
  });

  // Transform Prisma model to API model
  return prismaDeviceToDevice(device);
}
```

### Query with Indexes

The indexes we defined help with these queries:

```typescript
// Uses deviceId index
const history = await prisma.deviceDataHistory.findMany({
  where: { deviceId: "67890abcdef1234567890123" }
});

// Uses compound index (deviceId, timestamp)
const sortedHistory = await prisma.deviceDataHistory.findMany({
  where: { deviceId: "67890abcdef1234567890123" },
  orderBy: { timestamp: 'desc' }
});
```

## Explanations

### Why NoSQL for IoT Data?

**Flexibility:**
- IoT devices have varying data structures
- Easy to add new fields without migrations
- JSON documents match JavaScript objects

**Performance:**
- Fast writes for time-series data
- Embedded documents reduce joins
- Horizontal scaling (sharding)

**Schema Evolution:**
- Add fields without altering existing documents
- Backward compatible changes
- No downtime for schema changes

### Why Prisma?

**Type Safety:**
- TypeScript types generated from schema
- Compile-time error checking
- IDE autocomplete

**Developer Experience:**
- Simple, intuitive API
- Good documentation
- Works with multiple databases

**Migration Management:**
- Schema versioning
- Safe migrations
- Rollback support

### Embedded vs Referenced Documents

**Embedded (our `data` field):**
```json
{
  "id": "...",
  "data": { "temperature": 22.5, "humidity": 45 }
}
```

**Pros:**
- Fast reads (one query)
- Atomic updates
- Good for small, frequently accessed data

**Cons:**
- Document size limits (16MB in MongoDB)
- Duplication if shared across documents

**Referenced (our `deviceId` in history):**
```json
// Device document
{ "id": "device123", "name": "Sensor" }

// History document
{ "deviceId": "device123", "temperature": 22.5 }
```

**Pros:**
- No duplication
- Independent updates
- Good for large or shared data

**Cons:**
- Requires joins/lookups
- More queries needed
- Consistency concerns

### Why Indexes Matter

Without indexes, MongoDB scans all documents (full collection scan).

**Without index:**
- Query time: O(n) - checks every document
- 1 million documents = 1 million checks

**With index:**
- Query time: O(log n) - binary search
- 1 million documents = ~20 checks

**Trade-off:**
- Indexes use storage space
- Slower writes (must update index)
- Faster reads (can use index)

## Common Pitfalls

1. **Forgetting to generate Prisma client:**
   ```bash
   # After schema changes, always run:
   npm run prisma:generate
   ```

2. **Not pushing schema to database:**
   ```bash
   # After schema changes, push to database:
   npm run prisma:push
   ```

3. **Using wrong field types:**
   ```typescript
   // ❌ Wrong: Prisma expects Date object
   timestamp: "2024-01-01"
   
   // ✅ Correct: Use Date object
   timestamp: new Date("2024-01-01")
   ```

4. **Forgetting ObjectId conversion:**
   ```typescript
   // MongoDB uses ObjectId, but Prisma handles conversion
   // Just use string in your code
   where: { id: "67890abcdef1234567890123" }
   ```

5. **Not handling JSON field properly:**
   ```typescript
   // Json type stores as-is, but retrieve may be string
   const data = typeof device.data === 'string' 
     ? JSON.parse(device.data) 
     : device.data;
   ```

## Summary

In this workshop, you've learned:

✅ MongoDB basics (collections, documents, ObjectIds)  
✅ Prisma schema syntax and structure  
✅ Model definition and field types  
✅ Embedded documents in MongoDB  
✅ Indexes and their importance  
✅ Prisma Client API and operations  
✅ CRUD operations (Create, Read, Update, Delete)  
✅ Querying with filters and sorting  

**Key Takeaways:**
- **MongoDB is document-based:** Flexible schema, JSON-like documents
- **Prisma provides type safety:** TypeScript types from schema
- **Embedded documents:** Good for small, related data
- **Indexes improve performance:** Especially for time-series queries
- **Prisma Client:** Simple API for database operations

## Next Steps

- **Workshop 4:** Fastify Framework & REST API Design
- Try Prisma Studio: `npm run prisma:studio`
- Experiment with queries in the service files
- Read [Prisma MongoDB documentation](https://www.prisma.io/docs/concepts/database-connectors/mongodb)
- Explore [MongoDB documentation](https://docs.mongodb.com/)

