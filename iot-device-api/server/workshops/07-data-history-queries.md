# Workshop 7: Device Data History & Advanced Queries

**Duration:** 45-60 minutes  
**Level:** Intermediate to Advanced

## Introduction

In this workshop, you'll learn how to store and query time-series sensor data. You'll understand indexing, date range queries, pagination, and optimization strategies for historical data.

## What You'll Learn

- Store time-series sensor data
- Query data with filters (time range, limits)
- Understand indexing for performance
- Implement pagination concepts
- Work with timestamps and dates

## Prerequisites

- Completed Workshop 1-6
- Understanding of database queries
- Basic knowledge of time-series data

## Step-by-Step Instructions

### Step 1: Understanding Time-Series Data

Time-series data is data collected over time:
- Sensor readings every few seconds
- Temperature measurements hourly
- Device status changes

**Characteristics:**
- **Append-only** - New data added, old data rarely changes
- **Time-ordered** - Always sorted by timestamp
- **High volume** - Many records per device
- **Query patterns** - Often by time range

### Step 2: Creating History Entries

From `src/services/deviceData.service.ts`:

```typescript
async createDeviceDataHistory(
  deviceId: string,
  data: CreateDeviceDataHistoryRequest
): Promise<DeviceDataHistory> {
  const history = await prisma.deviceDataHistory.create({
    data: {
      deviceId,
      temperature: data.temperature,
      humidity: data.humidity,
      power: data.power,
      timestamp: new Date(),  // Current time
    },
  });

  return {
    id: history.id,
    deviceId: history.deviceId,
    timestamp: history.timestamp.getTime(),  // Convert to number
    temperature: history.temperature,
    humidity: history.humidity,
    power: history.power as 'on' | 'off',
  };
}
```

**Key points:**
- Each entry has a timestamp
- Linked to device via `deviceId`
- Stores sensor values at that moment
- Returns transformed data

### Step 3: Querying with Filters

Query history with time range:

```typescript
async getDeviceDataHistory(query: DeviceDataHistoryQuery): Promise<DeviceDataHistory[]> {
  const where: any = {
    deviceId: query.deviceId,
  };

  // Add time range filter if provided
  if (query.startTime || query.endTime) {
    where.timestamp = {};
    if (query.startTime) {
      where.timestamp.gte = query.startTime;  // Greater than or equal
    }
    if (query.endTime) {
      where.timestamp.lte = query.endTime;    // Less than or equal
    }
  }

  const history = await prisma.deviceDataHistory.findMany({
    where,
    orderBy: { timestamp: 'desc' },  // Most recent first
    take: query.limit || 100,        // Limit results
  });

  return history.map(transformHistory);
}
```

**Filter operators:**
- `gte` - Greater than or equal (>=)
- `lte` - Less than or equal (<=)
- `gt` - Greater than (>)
- `lt` - Less than (<)
- `equals` - Exact match (=)

### Step 4: Understanding Indexes

From `prisma/schema.prisma`:

```prisma
model DeviceDataHistory {
  // ... fields ...
  
  @@index([deviceId])
  @@index([deviceId, timestamp])
}
```

**What indexes do:**
- Create data structures for fast lookups
- Like an index in a book
- Trade storage for query speed

**Our indexes:**
1. `deviceId` - Fast lookup by device
2. `deviceId, timestamp` - Fast lookup by device with time sorting

**Why compound index:**
- Queries often filter by device AND time
- Compound index supports both conditions
- More efficient than separate indexes

### Step 5: Getting Latest Reading

```typescript
async getLatestDeviceDataHistory(deviceId: string): Promise<DeviceDataHistory | null> {
  const history = await prisma.deviceDataHistory.findFirst({
    where: { deviceId },
    orderBy: { timestamp: 'desc' },  // Most recent first
  });

  if (!history) {
    return null;
  }

  return transformHistory(history);
}
```

**Key points:**
- `findFirst` gets one result
- `orderBy: 'desc'` gets most recent
- Returns null if no history exists

### Step 6: Pagination Concepts

For large datasets, limit results:

```typescript
// Limit number of results
const history = await prisma.deviceDataHistory.findMany({
  where: { deviceId },
  take: 100,  // Maximum 100 records
  orderBy: { timestamp: 'desc' },
});

// Skip and take (offset pagination)
const history = await prisma.deviceDataHistory.findMany({
  where: { deviceId },
  skip: 0,    // Skip first 0 records
  take: 100,  // Take next 100 records
  orderBy: { timestamp: 'desc' },
});
```

**Pagination strategies:**
- **Limit only** - Simple, fast
- **Skip + Take** - Offset pagination (can be slow for large offsets)
- **Cursor-based** - Use last ID/timestamp (better for large datasets)

## Code Examples

### Complete History Service

```typescript
export const deviceDataService = {
  // Create history entry
  async createDeviceDataHistory(
    deviceId: string,
    data: CreateDeviceDataHistoryRequest
  ): Promise<DeviceDataHistory> {
    // Implementation
  },

  // Get history with filters
  async getDeviceDataHistory(
    query: DeviceDataHistoryQuery
  ): Promise<DeviceDataHistory[]> {
    const where: any = { deviceId: query.deviceId };

    if (query.startTime || query.endTime) {
      where.timestamp = {};
      if (query.startTime) where.timestamp.gte = query.startTime;
      if (query.endTime) where.timestamp.lte = query.endTime;
    }

    return await prisma.deviceDataHistory.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: query.limit || 100,
    });
  },

  // Get latest
  async getLatestDeviceDataHistory(
    deviceId: string
  ): Promise<DeviceDataHistory | null> {
    return await prisma.deviceDataHistory.findFirst({
      where: { deviceId },
      orderBy: { timestamp: 'desc' },
    });
  },
};
```

### Route Examples

```typescript
// Get history with query parameters
fastify.get('/api/devices/:id/history', async (request, reply) => {
  const { id } = request.params as { id: string };
  const query = request.query as {
    startTime?: string;
    endTime?: string;
    limit?: number;
  };

  const historyQuery = {
    deviceId: id,
    startTime: query.startTime ? new Date(query.startTime) : undefined,
    endTime: query.endTime ? new Date(query.endTime) : undefined,
    limit: query.limit,
  };

  const history = await deviceDataService.getDeviceDataHistory(historyQuery);
  return reply.code(200).send(history);
});

// Get latest reading
fastify.get('/api/devices/:id/history/latest', async (request, reply) => {
  const { id } = request.params as { id: string };
  const latest = await deviceDataService.getLatestDeviceDataHistory(id);
  
  if (!latest) {
    return reply.code(404).send({ error: 'No history found' });
  }
  
  return reply.code(200).send(latest);
});
```

## Explanations

### Why Time-Series Data is Different

**Append-heavy:**
- Mostly inserts, few updates
- Old data rarely changes
- Optimize for writes

**Time-ordered queries:**
- Always sorted by timestamp
- Range queries are common
- Indexes help significantly

**High volume:**
- Many records per device
- Need efficient storage
- Pagination is essential

### Index Performance

**Without index:**
```
Query: Find all history for device "123"
- Scans entire collection
- Checks every document
- 1 million documents = 1 million checks
```

**With index:**
```
Query: Find all history for device "123"
- Uses deviceId index
- Finds matching documents directly
- 1 million documents = ~20 checks
```

**Compound index benefits:**
- Supports queries on multiple fields
- Efficient for sorting
- Reduces need for multiple indexes

### Date Range Queries

**ISO 8601 format:**
```
2024-01-01T00:00:00Z
YYYY-MM-DDTHH:mm:ssZ
```

**Time zones:**
- Store in UTC
- Convert in API layer
- Consistent across systems

**Range operators:**
- `gte` - Include start time
- `lte` - Include end time
- `gt` - Exclude start time
- `lt` - Exclude end time

### Pagination Strategies

**Limit only:**
- Simple to implement
- Good for recent data
- No offset overhead

**Skip + Take:**
- Easy to understand
- Can be slow for large offsets
- Good for small datasets

**Cursor-based:**
- Fast regardless of position
- More complex to implement
- Better for large datasets

## Common Pitfalls

1. **Not using indexes:**
   ```typescript
   // ❌ Bad: No index on deviceId
   // Query will be slow
   
   // ✅ Good: Index defined in schema
   @@index([deviceId])
   ```

2. **Forgetting time zone:**
   ```typescript
   // ❌ Bad: Local time zone
   timestamp: new Date("2024-01-01")
   
   // ✅ Good: UTC
   timestamp: new Date("2024-01-01T00:00:00Z")
   ```

3. **No limit on queries:**
   ```typescript
   // ❌ Bad: Could return millions of records
   await prisma.deviceDataHistory.findMany({
     where: { deviceId }
   });
   
   // ✅ Good: Limit results
   await prisma.deviceDataHistory.findMany({
     where: { deviceId },
     take: 100
   });
   ```

4. **Inefficient date parsing:**
   ```typescript
   // ❌ Bad: String comparison
   where: { timestamp: query.startTime }
   
   // ✅ Good: Date object
   where: { timestamp: { gte: new Date(query.startTime) } }
   ```

## Summary

In this workshop, you've learned:

✅ Storing time-series data  
✅ Querying with time ranges  
✅ Using indexes for performance  
✅ Limiting and sorting results  
✅ Getting latest records  
✅ Pagination concepts  

**Key Takeaways:**
- **Time-series data is append-heavy:** Optimize for writes
- **Indexes are crucial:** Especially for time-range queries
- **Always limit results:** Prevent memory issues
- **Use UTC for timestamps:** Consistent across systems
- **Compound indexes help:** For multi-field queries

## Next Steps

- **Workshop 8:** Error Handling & Request Validation
- Experiment with different query patterns
- Study MongoDB query optimization
- Read about time-series databases
- Practice implementing pagination

