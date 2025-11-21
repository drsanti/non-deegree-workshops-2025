# Workshop 10: Advanced Topics & Best Practices

**Duration:** 45-60 minutes  
**Level:** Advanced

## Introduction

In this final workshop, you'll learn about production considerations, performance optimization, security best practices, testing strategies, and deployment options for the IoT Device Management API.

## What You'll Learn

- Understand production considerations
- Learn performance optimization
- Understand security best practices
- Learn about testing strategies
- Explore deployment options

## Prerequisites

- Completed Workshop 1-9
- Understanding of the complete system
- Interest in production deployment

## Step-by-Step Instructions

### Step 1: Environment Configuration

**Development vs Production:**

```env
# Development (.env)
NODE_ENV=development
DATABASE_URL=mongodb://localhost:27017/non-degree-db
PORT=3000
LOG_LEVEL=debug

# Production (.env.production)
NODE_ENV=production
DATABASE_URL=mongodb://prod-server:27017/non-degree-db
PORT=3000
LOG_LEVEL=error
HOST=0.0.0.0
```

**Best practices:**
- Never commit `.env` files
- Use different databases for dev/prod
- Reduce logging in production
- Use environment-specific configs

### Step 2: Database Connection Pooling

Prisma manages connection pooling automatically:

```typescript
// Prisma client handles pooling
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
});

// Connection pool settings (in DATABASE_URL)
// mongodb://user:pass@host:port/db?maxPoolSize=10
```

**Optimization:**
- Default pool size is usually sufficient
- Monitor connection usage
- Adjust based on load
- Close connections on shutdown

### Step 3: API Rate Limiting

Prevent abuse with rate limiting:

```typescript
import rateLimit from '@fastify/rate-limit';

await fastify.register(rateLimit, {
  max: 100,  // Max requests
  timeWindow: '1 minute',  // Per time window
});

// Or per-route
fastify.register(rateLimit, {
  max: 10,
  timeWindow: '1 minute',
});
```

**Why rate limiting:**
- Prevent abuse
- Protect resources
- Fair usage
- DDoS mitigation

### Step 4: Security Considerations

**Authentication:**
```typescript
// Add authentication middleware
fastify.register(require('@fastify/jwt'), {
  secret: process.env.JWT_SECRET,
});

fastify.decorate('authenticate', async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

// Protect routes
fastify.get('/api/devices', {
  preHandler: [fastify.authenticate],
}, async (request, reply) => {
  // Protected route
});
```

**Authorization:**
- Role-based access control
- Resource-level permissions
- API key authentication
- OAuth integration

### Step 5: Logging and Monitoring

**Structured logging:**
```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
});

logger.info({ deviceId: '123', action: 'create' }, 'Device created');
logger.error({ error: err }, 'Failed to create device');
```

**Monitoring:**
- Application performance monitoring (APM)
- Error tracking (Sentry, Rollbar)
- Metrics collection (Prometheus)
- Health check endpoints

### Step 6: Testing Strategies

**Unit tests:**
```typescript
// Test service layer
describe('DeviceService', () => {
  it('should create a device', async () => {
    const device = await deviceService.createDevice({
      name: 'Test Sensor',
      type: 'sensor',
    });
    expect(device.name).toBe('Test Sensor');
  });
});
```

**Integration tests:**
```typescript
// Test API endpoints
describe('GET /api/devices', () => {
  it('should return devices', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/devices',
    });
    expect(response.statusCode).toBe(200);
  });
});
```

### Step 7: Docker Deployment

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mongodb://mongodb:27017/non-degree-db
    depends_on:
      - mongodb
  
  mongodb:
    image: mongo:latest
    # ... MongoDB config
```

### Step 8: Performance Optimization

**Query optimization:**
```typescript
// Use indexes
await prisma.deviceDataHistory.findMany({
  where: { deviceId },
  orderBy: { timestamp: 'desc' },
  take: 100,  // Limit results
});

// Select only needed fields
await prisma.device.findMany({
  select: {
    id: true,
    name: true,
    status: true,
    // Don't select large data field if not needed
  },
});
```

**Caching:**
```typescript
import fastifyRedis from '@fastify/redis';

await fastify.register(fastifyRedis, {
  host: 'localhost',
  port: 6379,
});

// Cache device list
fastify.get('/api/devices', async (request, reply) => {
  const cached = await fastify.redis.get('devices');
  if (cached) {
    return JSON.parse(cached);
  }
  
  const devices = await deviceService.getAllDevices();
  await fastify.redis.setex('devices', 60, JSON.stringify(devices));
  return devices;
});
```

## Code Examples

### Production Server Configuration

```typescript
import Fastify from 'fastify';

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    prettyPrint: process.env.NODE_ENV === 'development',
  },
  trustProxy: true,  // For reverse proxies
  bodyLimit: 1048576,  // 1MB limit
});

// Health check for load balancers
fastify.get('/health', async () => {
  return {
    status: 'ok',
    timestamp: Date.now(),
    uptime: process.uptime(),
  };
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await fastify.close();
  process.exit(0);
});
```

### Error Tracking

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Capture errors
fastify.setErrorHandler((error, request, reply) => {
  Sentry.captureException(error);
  reply.code(500).send({ error: 'Internal server error' });
});
```

### Database Migration Strategy

```typescript
// Use Prisma migrations for production
// prisma/migrations/20240101000000_add_index/migration.sql

// In production:
// 1. Backup database
// 2. Run migrations
// 3. Deploy new code
// 4. Verify
```

## Explanations

### Why Production Config Differs

**Development:**
- Verbose logging
- Local database
- Hot reload
- Debug mode

**Production:**
- Minimal logging
- Remote database
- Compiled code
- Performance mode

### Security Layers

1. **Network** - Firewall, VPN
2. **Application** - Authentication, validation
3. **Database** - Access control, encryption
4. **Data** - Encryption at rest, in transit

### Testing Pyramid

```
        /\
       /  \      E2E Tests (few)
      /____\
     /      \    Integration Tests (some)
    /________\
   /          \  Unit Tests (many)
  /____________\
```

**Unit tests:**
- Fast, isolated
- Test individual functions
- Many tests

**Integration tests:**
- Test component interaction
- Moderate speed
- Some tests

**E2E tests:**
- Test full flow
- Slow, complex
- Few tests

### Deployment Strategies

**Blue-Green:**
- Two identical environments
- Switch traffic between them
- Zero downtime

**Rolling:**
- Update instances gradually
- Some old, some new running
- Gradual migration

**Canary:**
- Deploy to small subset
- Monitor, then expand
- Risk mitigation

## Common Pitfalls

1. **Not handling graceful shutdown:**
   ```typescript
   // ❌ Bad: Kills connections abruptly
   process.exit(1);
   
   // ✅ Good: Close connections first
   await fastify.close();
   await prisma.$disconnect();
   process.exit(0);
   ```

2. **Exposing sensitive data:**
   ```typescript
   // ❌ Bad: Logs passwords
   console.log('Connecting with:', DATABASE_URL);
   
   // ✅ Good: Sanitize logs
   logger.info('Connecting to database');
   ```

3. **No health checks:**
   ```typescript
   // ❌ Bad: No way to check if server is healthy
   
   // ✅ Good: Health endpoint
   fastify.get('/health', async () => {
     // Check database connection
     await prisma.$queryRaw`SELECT 1`;
     return { status: 'ok' };
   });
   ```

4. **Not monitoring:**
   ```typescript
   // ❌ Bad: No error tracking
   catch (error) {
     // Error lost
   }
   
   // ✅ Good: Track errors
   catch (error) {
     Sentry.captureException(error);
     logger.error(error);
   }
   ```

## Summary

In this workshop, you've learned:

✅ Environment configuration for production  
✅ Database connection pooling  
✅ API rate limiting  
✅ Security best practices  
✅ Logging and monitoring  
✅ Testing strategies  
✅ Docker deployment  
✅ Performance optimization  

**Key Takeaways:**
- **Production is different:** Separate configs and practices
- **Security is critical:** Authentication, authorization, validation
- **Monitor everything:** Logs, errors, performance
- **Test thoroughly:** Unit, integration, E2E
- **Optimize carefully:** Profile before optimizing
- **Deploy safely:** Use proven strategies

## Next Steps

- Review all workshops and practice concepts
- Set up a production-like environment
- Implement authentication and authorization
- Add comprehensive testing
- Deploy to a cloud platform
- Monitor and optimize based on real usage
- Read production deployment guides
- Study security best practices
- Explore advanced Prisma features
- Learn about microservices architecture

**Congratulations on completing all 10 workshops!** 🎉

You now have a comprehensive understanding of:
- Project setup and architecture
- MongoDB and Prisma ORM
- Fastify and REST APIs
- TypeScript in backend development
- CRUD operations
- Time-series data and queries
- Error handling and validation
- WebSocket integration
- Production best practices

Keep building and learning! 🚀

