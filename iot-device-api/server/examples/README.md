# Examples

This directory contains runnable TypeScript examples that demonstrate various aspects of the IoT Device Management API server. Each example is a standalone file that can be executed using `tsx`.

## Prerequisites

Before running the examples, ensure:

1. **MongoDB is running:**
   ```bash
   docker-compose up -d
   ```

2. **Prisma schema is pushed:**
   ```bash
   npm run prisma:push
   ```

3. **Dependencies are installed:**
   ```bash
   npm install
   ```

4. **Environment variables are configured:**
   - Ensure `.env` file exists with `DATABASE_URL` and `PORT`

## Running Examples

All examples can be run using `tsx`:

```bash
tsx examples/01-basic-crud.ts
```

Or use npm scripts (if added to package.json):

```bash
npm run example:01
```

## Example Files

### [01-basic-crud.ts](./01-basic-crud.ts)
**Basic CRUD Operations**

Demonstrates Create, Read, Update, and Delete operations on IoT devices.

**What it shows:**
- Creating a device
- Reading devices (all and by ID)
- Updating device properties
- Updating device status
- Updating device sensor data
- Deleting a device
- Error handling

**Run:**
```bash
tsx examples/01-basic-crud.ts
```

---

### [02-device-data-history.ts](./02-device-data-history.ts)
**Device Data History Operations**

Demonstrates working with device data history, including time-series data.

**What it shows:**
- Creating history entries
- Querying history with time ranges
- Getting latest readings
- Pagination concepts
- Limiting results

**Run:**
```bash
tsx examples/02-device-data-history.ts
```

---

### [03-query-examples.ts](./03-query-examples.ts)
**Query Examples**

Shows various query patterns and filters for working with devices.

**What it shows:**
- Filtering by device type
- Filtering by status
- Sorting results
- Limiting results
- Pagination (skip/take)
- Counting devices
- Finding first matching device

**Run:**
```bash
tsx examples/03-query-examples.ts
```

---

### [04-api-client-example.ts](./04-api-client-example.ts)
**API Client Example**

Demonstrates making HTTP requests to the API server using the fetch API.

**What it shows:**
- Making GET requests
- Making POST requests
- Making PUT/PATCH requests
- Making DELETE requests
- Handling API responses
- Error handling

**Note:** Requires the API server to be running (`npm run dev`)

**Run:**
```bash
# In one terminal: npm run dev
# In another terminal:
tsx examples/04-api-client-example.ts
```

---

### [05-batch-operations.ts](./05-batch-operations.ts)
**Batch Operations**

Shows batch operations and bulk data handling.

**What it shows:**
- Creating multiple devices
- Batch history entries
- Updating multiple devices
- Sequential vs parallel operations
- Performance comparisons

**Run:**
```bash
tsx examples/05-batch-operations.ts
```

---

### [06-error-handling.ts](./06-error-handling.ts)
**Error Handling**

Demonstrates comprehensive error handling patterns.

**What it shows:**
- Handling not found errors
- Handling validation errors
- Handling database errors
- Try-catch patterns
- Error logging
- Graceful degradation
- Retry patterns
- Custom error types

**Run:**
```bash
tsx examples/06-error-handling.ts
```

---

### [07-data-transformation.ts](./07-data-transformation.ts)
**Data Transformation**

Shows data transformation patterns between Prisma models and API models.

**What it shows:**
- Prisma model to API model conversion
- Date to timestamp conversion
- JSON field handling
- Type assertions
- Array transformations
- Selective field transformation
- Nested object transformation

**Run:**
```bash
tsx examples/07-data-transformation.ts
```

---

### [08-websocket-integration.ts](./08-websocket-integration.ts)
**WebSocket Integration**

Demonstrates integrating the REST API with a WebSocket server.

**What it shows:**
- Making API calls from Node.js
- Persisting WebSocket data
- Updating device status
- Non-blocking error handling
- Simulated WebSocket server behavior

**Note:** Requires the API server to be running (`npm run dev`)

**Run:**
```bash
# In one terminal: npm run dev
# In another terminal:
tsx examples/08-websocket-integration.ts
```

## Example Structure

Each example follows a similar structure:

```typescript
/**
 * Example description
 * 
 * Run with: tsx examples/XX-example-name.ts
 */

import dotenv from 'dotenv';
// ... other imports

// Load environment variables
dotenv.config();

async function main() {
  // Example code here
}

main();
```

## Common Patterns

### Error Handling

All examples include error handling:

```typescript
try {
  // Operations
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
} finally {
  // Cleanup (disconnect Prisma)
  await prisma.$disconnect();
}
```

### Cleanup

Examples clean up created resources:

```typescript
// Delete created devices
await deviceService.deleteDevice(deviceId);
```

### Output

Examples provide clear, formatted output:

```typescript
console.log('✅ Operation successful');
console.log('❌ Operation failed');
console.log('⚠️  Warning message');
```

## Tips

1. **Run examples in order** - Later examples may build on concepts from earlier ones
2. **Read the code** - Examples are well-commented to explain what's happening
3. **Modify and experiment** - Try changing the examples to see what happens
4. **Check server logs** - If using API examples, check the server terminal for logs
5. **Database state** - Examples clean up, but you can check Prisma Studio: `npm run prisma:studio`

## Troubleshooting

### "Cannot find module" errors
- Ensure dependencies are installed: `npm install`
- Ensure Prisma client is generated: `npm run prisma:generate`

### "Connection refused" errors
- Check MongoDB is running: `docker-compose ps`
- Verify DATABASE_URL in `.env` is correct

### API examples fail
- Ensure API server is running: `npm run dev`
- Check API server is on the correct port (default: 3000)
- Verify API_BASE_URL if using custom port

### "Device not found" errors
- Some examples create and delete devices
- Run examples in order
- Check database with Prisma Studio if needed

## Next Steps

After running the examples:

1. **Modify the examples** - Change parameters and see what happens
2. **Combine concepts** - Mix patterns from different examples
3. **Read the source code** - Understand how services work
4. **Check the workshops** - Learn more in the `workshops/` directory
5. **Build your own** - Create new examples for your use cases

## Related Documentation

- [Workshops](../WORKSOPS.md) - Comprehensive learning workshops
- [Usage Examples](../USAGE-EXAMPLES.md) - API usage examples with curl
- [README](../README.md) - Project documentation

Happy coding! 🚀

