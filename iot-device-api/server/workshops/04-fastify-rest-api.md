# Workshop 4: Fastify Framework & REST API Design

**Duration:** 45-60 minutes  
**Level:** Beginner to Intermediate

## Introduction

In this workshop, you'll learn about the Fastify web framework and REST API principles. You'll understand how to create API endpoints, handle requests and responses, and organize routes effectively.

## What You'll Learn

- Understand Fastify framework basics
- Learn REST API principles
- Create API endpoints
- Understand request/response handling
- Learn route registration and organization

## Prerequisites

- Completed Workshop 1-3
- Basic understanding of HTTP (GET, POST, PUT, DELETE)
- Familiarity with JSON data format

## Step-by-Step Instructions

### Step 1: Understanding REST API Principles

REST (Representational State Transfer) is an architectural style for APIs:

**Key Principles:**
1. **Resources** - Everything is a resource (devices, users, etc.)
2. **HTTP Methods** - Use standard methods (GET, POST, PUT, DELETE, PATCH)
3. **Stateless** - Each request contains all needed information
4. **Uniform Interface** - Consistent URL patterns and responses

**RESTful URL Patterns:**
```
GET    /api/devices           # List all devices
GET    /api/devices/:id       # Get one device
POST   /api/devices           # Create a device
PUT    /api/devices/:id       # Update entire device
PATCH  /api/devices/:id       # Partial update
DELETE /api/devices/:id       # Delete device
```

### Step 2: Understanding Fastify vs Express

**Fastify:**
- Faster performance (up to 2x faster)
- Built-in schema validation
- TypeScript support
- Plugin architecture
- Lower overhead

**Express:**
- More mature ecosystem
- Larger community
- More middleware options
- Simpler for beginners

**Why Fastify for this project:**
- Performance matters for IoT APIs
- Built-in validation reduces code
- TypeScript-first design
- Modern architecture

### Step 3: Creating a Fastify Server

From `src/index.ts`:

```typescript
import Fastify from 'fastify';

// Create Fastify instance
const fastify = Fastify({
  logger: true,  // Enable request logging
});

// Start server
await fastify.listen({ port: 3000, host: '0.0.0.0' });
```

**Configuration Options:**
- `logger: true` - Enable request/response logging
- `bodyLimit` - Max request body size
- `disableRequestLogging` - Disable request logs
- `requestIdHeader` - Add request ID header

### Step 4: Defining Routes

Basic route structure:

```typescript
fastify.get('/path', async (request, reply) => {
  // Handle request
  return { message: 'Hello' };
});
```

**Route Components:**
1. **Method** - `get`, `post`, `put`, `patch`, `delete`
2. **Path** - URL pattern (`/api/devices`)
3. **Handler** - Async function that processes request
4. **Request** - Incoming HTTP request
5. **Reply** - Response builder

### Step 5: Understanding Request Object

The `request` object contains:

```typescript
fastify.get('/api/devices/:id', async (request, reply) => {
  // URL parameters
  const { id } = request.params;  // { id: "123" }
  
  // Query string
  const { limit } = request.query;  // ?limit=10
  
  // Request body (POST/PUT)
  const body = request.body;  // JSON data
  
  // Headers
  const contentType = request.headers['content-type'];
  
  // HTTP method
  const method = request.method;  // "GET"
});
```

### Step 6: Understanding Reply Object

The `reply` object builds responses:

```typescript
// Send JSON response
reply.send({ message: 'Success' });

// Set status code
reply.code(201).send({ id: '123' });

// Set headers
reply.header('X-Custom', 'value').send(data);

// Chain methods
reply
  .code(200)
  .header('Content-Type', 'application/json')
  .send({ data: devices });
```

**Common Status Codes:**
- `200` - OK (successful GET, PUT, PATCH)
- `201` - Created (successful POST)
- `400` - Bad Request (validation error)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error (server error)

### Step 7: Route Registration Pattern

Routes are organized in separate files:

```typescript
// src/routes/device.routes.ts
export async function deviceRoutes(fastify: FastifyInstance) {
  fastify.get('/api/devices', async (request, reply) => {
    // Route handler
  });
}

// src/index.ts
import { deviceRoutes } from './routes/device.routes.js';
fastify.register(deviceRoutes);
```

**Why this pattern:**
- **Organization** - Each domain has its own file
- **Modularity** - Easy to add/remove route groups
- **Testing** - Can test routes independently
- **Scalability** - Doesn't clutter main file

### Step 8: Route Parameters

Extract values from URL:

```typescript
// Route definition
fastify.get('/api/devices/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  // Use id to fetch device
});

// URL: /api/devices/123
// params: { id: "123" }
```

**Multiple parameters:**
```typescript
fastify.get('/api/devices/:deviceId/history/:historyId', async (request, reply) => {
  const { deviceId, historyId } = request.params;
});
```

### Step 9: Query Parameters

Extract from query string:

```typescript
fastify.get('/api/devices/:id/history', async (request, reply) => {
  const query = request.query as {
    startTime?: string;
    endTime?: string;
    limit?: number;
  };
  
  // URL: /api/devices/123/history?startTime=2024-01-01&limit=10
  // query: { startTime: "2024-01-01", limit: 10 }
});
```

### Step 10: Request Body

Handle POST/PUT requests:

```typescript
fastify.post('/api/devices', async (request, reply) => {
  const body = request.body as CreateDeviceRequest;
  // body contains the JSON data sent by client
});
```

## Code Examples

### Complete Route Example

From `src/routes/device.routes.ts`:

```typescript
fastify.get(
  '/api/devices/:id',
  {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            // ... more properties
          },
        },
      },
    },
  },
  async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const device = await deviceService.getDeviceById(id);

      if (!device) {
        return reply.code(404).send({ error: 'Device not found' });
      }

      return reply.code(200).send(device);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch device' });
    }
  }
);
```

### Health Check Endpoint

Simple endpoint example:

```typescript
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: Date.now() };
});
```

**Why simple:**
- No validation needed
- Quick response
- Used for monitoring/load balancers

### Error Handling Pattern

Consistent error handling:

```typescript
async (request, reply) => {
  try {
    // Business logic
    const result = await service.doSomething();
    return reply.code(200).send(result);
  } catch (error) {
    // Log error
    fastify.log.error(error);
    
    // Return appropriate error
    if (error instanceof NotFoundError) {
      return reply.code(404).send({ error: 'Not found' });
    }
    return reply.code(500).send({ error: 'Internal server error' });
  }
}
```

## Explanations

### Why REST?

**Standardization:**
- Everyone understands GET/POST/PUT/DELETE
- Predictable URL patterns
- Easy to document and test

**Stateless:**
- Each request is independent
- Easier to scale horizontally
- No session management needed

**Cacheable:**
- GET requests can be cached
- Reduces server load
- Faster responses

### Why Fastify?

**Performance:**
- Built on Node.js streams
- Efficient JSON parsing
- Lower memory footprint
- 2x faster than Express in benchmarks

**Developer Experience:**
- Built-in validation
- TypeScript support
- Plugin ecosystem
- Good documentation

### Route Organization

**Flat structure (bad):**
```typescript
// All routes in one file - hard to maintain
fastify.get('/api/devices', ...);
fastify.get('/api/devices/:id', ...);
fastify.post('/api/devices', ...);
fastify.get('/api/history', ...);
// ... 50 more routes
```

**Modular structure (good):**
```typescript
// Separate files by domain
fastify.register(deviceRoutes);      // All device routes
fastify.register(deviceDataRoutes);  // All history routes
```

### Schema Validation

Fastify validates requests automatically:

```typescript
{
  schema: {
    body: {
      type: 'object',
      required: ['name', 'type'],
      properties: {
        name: { type: 'string', minLength: 1 },
        type: { type: 'string', enum: ['sensor', 'controller'] },
      },
    },
  },
}
```

**Benefits:**
- Automatic validation
- Clear error messages
- Type safety
- Less boilerplate code

## Common Pitfalls

1. **Forgetting async/await:**
   ```typescript
   // ❌ Wrong: Missing async
   fastify.get('/path', (request, reply) => {
     const data = service.getData();  // Returns Promise!
   });
   
   // ✅ Correct: Use async/await
   fastify.get('/path', async (request, reply) => {
     const data = await service.getData();
   });
   ```

2. **Not handling errors:**
   ```typescript
   // ❌ Wrong: No error handling
   fastify.get('/path', async (request, reply) => {
     const data = await service.getData();
     reply.send(data);
   });
   
   // ✅ Correct: Try-catch
   fastify.get('/path', async (request, reply) => {
     try {
       const data = await service.getData();
       reply.send(data);
     } catch (error) {
       reply.code(500).send({ error: 'Failed' });
     }
   });
   ```

3. **Wrong HTTP methods:**
   ```typescript
   // ❌ Wrong: GET for creating
   fastify.get('/api/devices', async (request, reply) => {
     await createDevice(request.body);
   });
   
   // ✅ Correct: POST for creating
   fastify.post('/api/devices', async (request, reply) => {
     await createDevice(request.body);
   });
   ```

4. **Not setting status codes:**
   ```typescript
   // ❌ Wrong: Default 200 for creation
   fastify.post('/api/devices', async (request, reply) => {
     const device = await createDevice(request.body);
     reply.send(device);  // Returns 200
   });
   
   // ✅ Correct: 201 for creation
   fastify.post('/api/devices', async (request, reply) => {
     const device = await createDevice(request.body);
     reply.code(201).send(device);
   });
   ```

## Summary

In this workshop, you've learned:

✅ REST API principles and conventions  
✅ Fastify framework basics  
✅ Creating and organizing routes  
✅ Handling requests (params, query, body)  
✅ Building responses with reply object  
✅ Route registration patterns  
✅ Schema validation  
✅ Error handling  

**Key Takeaways:**
- **REST provides structure:** Standard HTTP methods and URL patterns
- **Fastify is fast:** Built for performance
- **Routes should be organized:** Separate files by domain
- **Validation is built-in:** Use schemas for automatic validation
- **Error handling is crucial:** Always wrap async operations in try-catch

## Next Steps

- **Workshop 5:** TypeScript in Backend Development
- Try creating a new route following the pattern
- Experiment with different HTTP methods
- Read [Fastify documentation](https://www.fastify.io/docs/latest/)
- Study REST API best practices

