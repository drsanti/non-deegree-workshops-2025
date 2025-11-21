# Workshop 2: Understanding Project Architecture & Structure

**Duration:** 45-60 minutes  
**Level:** Beginner to Intermediate

## Introduction

In this workshop, you'll explore the project's architecture and understand how the code is organized. You'll learn about separation of concerns, the routes-services pattern, and how different parts of the application work together.

## What You'll Learn

- Understand the project folder structure
- Learn about separation of concerns (routes, services, types)
- Understand the MVC-like pattern used
- Explore the codebase organization

## Prerequisites

- Completed Workshop 1 (Setup & Environment)
- Basic understanding of file systems and directories
- Familiarity with the concept of modules/packages

## Step-by-Step Instructions

### Step 1: Explore the Project Root

Let's start by understanding the top-level structure:

```
iot-device-api/server/
├── prisma/              # Database schema and migrations
├── src/                 # Source code
├── node_modules/        # Dependencies (auto-generated)
├── dist/                # Compiled JavaScript (after build)
├── .env                 # Environment variables (not in git)
├── .env.example         # Example environment variables
├── .gitignore           # Git ignore rules
├── docker-compose.yml   # MongoDB Docker configuration
├── package.json         # Project metadata and dependencies
├── tsconfig.json        # TypeScript configuration
└── README.md            # Project documentation
```

**Key directories:**
- `prisma/` - Database schema definitions
- `src/` - All application source code
- `node_modules/` - Installed packages (don't edit)
- `dist/` - Compiled output (generated)

### Step 2: Understand the Source Code Structure

Navigate into the `src/` directory:

```
src/
├── index.ts                    # Application entry point
├── types.ts                    # TypeScript type definitions
├── prisma/
│   └── client.ts              # Prisma client singleton
├── routes/
│   ├── device.routes.ts       # Device API endpoints
│   └── deviceData.routes.ts   # Device data history endpoints
├── services/
│   ├── device.service.ts      # Device business logic
│   └── deviceData.service.ts  # Device data history logic
└── utils/
    └── validation.ts          # Request validation schemas
```

**Architecture Pattern:** This follows a **Routes → Services → Database** pattern (similar to MVC's Controller → Model → Database).

### Step 3: Examine the Entry Point

Let's look at `src/index.ts`:

```typescript
import dotenv from 'dotenv';
import Fastify from 'fastify';
import { deviceRoutes } from './routes/device.routes.js';
import { deviceDataRoutes } from './routes/deviceData.routes.js';

// Load environment variables
dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Create Fastify instance
const fastify = Fastify({
  logger: true,
});

// Register routes
fastify.register(deviceRoutes);
fastify.register(deviceDataRoutes);

// Health check endpoint
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: Date.now() };
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`Server listening on http://${HOST}:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
```

**What this file does:**
1. **Imports** - Loads dependencies and route modules
2. **Configuration** - Reads environment variables
3. **Server Creation** - Creates Fastify instance
4. **Route Registration** - Registers all API routes
5. **Server Startup** - Starts listening on specified port

**Why this structure:**
- Single entry point makes it clear where the app starts
- Route registration keeps the main file clean
- Error handling at the top level catches startup failures

### Step 4: Understand the Routes Layer

Routes handle HTTP requests and responses. Let's examine the pattern:

**File:** `src/routes/device.routes.ts`

```typescript
export async function deviceRoutes(fastify: FastifyInstance) {
  // GET /api/devices
  fastify.get('/api/devices', async (_request, reply) => {
    try {
      const devices = await deviceService.getAllDevices();
      return reply.code(200).send(devices);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: "Failed to fetch devices" });
    }
  });
  
  // More routes...
}
```

**Route responsibilities:**
- ✅ Define HTTP method and path
- ✅ Validate request (using schemas)
- ✅ Call service layer for business logic
- ✅ Handle errors
- ✅ Format and send response
- ❌ Should NOT contain business logic
- ❌ Should NOT directly access database

**Why separate routes:**
- Each route file handles one domain (devices, device data)
- Easy to find and modify specific endpoints
- Can be tested independently

### Step 5: Understand the Services Layer

Services contain business logic and database operations:

**File:** `src/services/device.service.ts`

```typescript
import { prisma } from '../prisma/client.js';

export const deviceService = {
  async getAllDevices(): Promise<Device[]> {
    const devices = await prisma.device.findMany({
      orderBy: { lastUpdate: 'desc' },
    });
    return devices.map(prismaDeviceToDevice);
  },
  
  async createDevice(data: CreateDeviceRequest): Promise<Device> {
    const device = await prisma.device.create({
      data: {
        name: data.name,
        type: data.type,
        status: data.status || 'online',
        data: deviceData as any,
      },
    });
    return prismaDeviceToDevice(device);
  },
  // More methods...
};
```

**Service responsibilities:**
- ✅ Business logic (data transformation, validation)
- ✅ Database operations (via Prisma)
- ✅ Data conversion (Prisma models → API models)
- ❌ Should NOT handle HTTP concerns
- ❌ Should NOT know about request/response objects

**Why services:**
- Reusable logic (can be called from routes, jobs, or other services)
- Testable without HTTP layer
- Single responsibility (one service = one domain)

### Step 6: Understand Type Definitions

Types ensure type safety across the application:

**File:** `src/types.ts`

```typescript
export type DeviceType = 'sensor' | 'controller';
export type DeviceStatus = 'online' | 'offline';
export type PowerStatus = 'on' | 'off';

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  lastUpdate: number;
  data: DeviceData;
}

export interface CreateDeviceRequest {
  name: string;
  type: DeviceType;
  status?: DeviceStatus;
  data?: DeviceData;
}
```

**Type responsibilities:**
- ✅ Define data structures
- ✅ Provide type safety
- ✅ Document expected formats
- ✅ Enable IDE autocomplete

**Why separate types file:**
- Shared across routes, services, and utilities
- Single source of truth for data structures
- Easy to find and update

### Step 7: Understand Prisma Client Setup

**File:** `src/prisma/client.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**What this does:**
- Creates a singleton Prisma client instance
- Reuses the same instance across the application
- Prevents multiple database connections
- Configures logging based on environment

**Why singleton:**
- Database connections are expensive
- One connection pool is more efficient
- Prevents connection limit issues

### Step 8: Understand Validation Utilities

**File:** `src/utils/validation.ts`

```typescript
import { FastifySchema } from 'fastify';

export const createDeviceSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['name', 'type'],
    properties: {
      name: { type: 'string', minLength: 1 },
      type: { type: 'string', enum: ['sensor', 'controller'] },
      status: { type: 'string', enum: ['online', 'offline'] },
    },
  },
};
```

**Validation responsibilities:**
- ✅ Define request schemas
- ✅ Validate incoming data
- ✅ Provide clear error messages
- ✅ Ensure data integrity

**Why separate validation:**
- Reusable across routes
- Consistent validation rules
- Easy to update requirements

## Code Examples

### Request Flow Example

When a client makes a request, here's the flow:

```
1. HTTP Request → GET /api/devices
   ↓
2. Route Handler (device.routes.ts)
   - Validates request
   - Calls service
   ↓
3. Service Layer (device.service.ts)
   - Business logic
   - Calls Prisma
   ↓
4. Prisma Client (prisma/client.ts)
   - Database query
   ↓
5. MongoDB Database
   - Returns data
   ↓
6. Service transforms data
   ↓
7. Route formats response
   ↓
8. HTTP Response → JSON array of devices
```

### Module Import Pattern

Notice the `.js` extension in imports even though files are `.ts`:

```typescript
import { deviceRoutes } from './routes/device.routes.js';
```

**Why:** TypeScript compiles to JavaScript, and ES modules require explicit extensions. The `.js` refers to the compiled output, not the source file.

## Explanations

### Why Routes-Services Pattern?

**Separation of Concerns:**
- Routes = HTTP layer (web-specific)
- Services = Business logic (domain-specific)
- Database = Data persistence (infrastructure)

**Benefits:**
- **Testability:** Test services without HTTP
- **Reusability:** Services can be used by routes, jobs, CLI tools
- **Maintainability:** Changes to HTTP don't affect business logic
- **Clarity:** Each layer has a clear responsibility

### Why Not MVC?

Traditional MVC has:
- **Model** - Data + business logic
- **View** - Presentation
- **Controller** - Request handling

Our API has:
- **Routes** - Like controllers (HTTP handling)
- **Services** - Like models (business logic)
- **No Views** - APIs return JSON, not HTML

So it's MVC-like but adapted for APIs.

### Why Type Definitions?

TypeScript types provide:
- **Compile-time safety:** Catch errors before runtime
- **Documentation:** Types describe what data is expected
- **IDE support:** Autocomplete and refactoring
- **Refactoring confidence:** TypeScript ensures changes are consistent

### Why Prisma Client Singleton?

**Connection Pooling:**
- Prisma manages a connection pool
- Multiple instances = multiple pools = wasted resources
- Singleton ensures one pool shared across the app

**Development Hot Reload:**
- In development, modules reload on file changes
- Without singleton, each reload creates a new client
- Global variable preserves the client across reloads

## Common Pitfalls

1. **Putting business logic in routes:**
   ```typescript
   // ❌ Bad: Business logic in route
   fastify.post('/api/devices', async (request, reply) => {
     const device = await prisma.device.create({...});
     // Complex business logic here...
   });
   
   // ✅ Good: Business logic in service
   fastify.post('/api/devices', async (request, reply) => {
     const device = await deviceService.createDevice(request.body);
   });
   ```

2. **Accessing database directly from routes:**
   - Routes should call services, not Prisma directly
   - Services provide abstraction and reusability

3. **Creating multiple Prisma clients:**
   - Always import from `prisma/client.ts`
   - Don't create `new PrismaClient()` in multiple places

4. **Forgetting to transform data:**
   - Prisma returns database models
   - Services should transform to API models
   - Example: `prismaDeviceToDevice()` function

## Summary

In this workshop, you've learned:

✅ Project directory structure  
✅ Routes-Services-Database pattern  
✅ Entry point and server initialization  
✅ Route layer responsibilities  
✅ Service layer responsibilities  
✅ Type definitions and their purpose  
✅ Prisma client singleton pattern  
✅ Validation utilities  

**Key Takeaways:**
- **Separation of Concerns:** Each layer has a specific responsibility
- **Routes handle HTTP:** Request/response, validation, error handling
- **Services handle logic:** Business rules, database operations, data transformation
- **Types ensure safety:** Compile-time checks and documentation
- **Singleton pattern:** Efficient resource usage for database connections

## Next Steps

- **Workshop 3:** MongoDB & Prisma ORM Fundamentals
- Explore the actual route implementations in `src/routes/`
- Read through service implementations in `src/services/`
- Try adding a new route following the existing pattern
- Study the type definitions to understand data structures

