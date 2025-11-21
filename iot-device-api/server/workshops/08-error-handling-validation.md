# Workshop 8: Error Handling & Request Validation

**Duration:** 45-60 minutes  
**Level:** Intermediate

## Introduction

In this workshop, you'll learn how to properly handle errors and validate incoming requests. You'll understand HTTP status codes, error logging, validation schemas, and best practices for error responses.

## What You'll Learn

- Implement proper error handling
- Validate incoming requests
- Handle database errors gracefully
- Create meaningful error responses
- Understand HTTP status codes

## Prerequisites

- Completed Workshop 1-7
- Understanding of try-catch blocks
- Basic knowledge of HTTP

## Step-by-Step Instructions

### Step 1: Understanding HTTP Status Codes

Status codes indicate request outcome:

**2xx - Success:**
- `200 OK` - Request succeeded
- `201 Created` - Resource created
- `204 No Content` - Success, no body

**4xx - Client Error:**
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Not allowed
- `404 Not Found` - Resource doesn't exist
- `422 Unprocessable Entity` - Validation failed

**5xx - Server Error:**
- `500 Internal Server Error` - Server problem
- `503 Service Unavailable` - Temporarily unavailable

### Step 2: Try-Catch Error Handling

Basic error handling pattern:

```typescript
async (request, reply) => {
  try {
    // Business logic
    const device = await deviceService.getDeviceById(id);
    return reply.code(200).send(device);
  } catch (error) {
    // Error handling
    fastify.log.error(error);
    return reply.code(500).send({ error: 'Failed to fetch device' });
  }
}
```

**Why try-catch:**
- Prevents server crashes
- Allows graceful error responses
- Enables error logging

### Step 3: Error Logging

Always log errors for debugging:

```typescript
catch (error) {
  fastify.log.error(error);  // Log the actual error
  return reply.code(500).send({ error: 'Failed' });
}
```

**What to log:**
- Full error object (stack trace)
- Request context (ID, path, method)
- User information (if available)

**What NOT to log:**
- Sensitive data (passwords, tokens)
- Full request bodies in production

### Step 4: Request Validation with Schemas

Fastify validates requests automatically:

```typescript
fastify.post('/api/devices', {
  schema: {
    body: {
      type: 'object',
      required: ['name', 'type'],
      properties: {
        name: { type: 'string', minLength: 1 },
        type: { type: 'string', enum: ['sensor', 'controller'] },
        status: { type: 'string', enum: ['online', 'offline'] },
      },
    },
  },
}, async (request, reply) => {
  // Request is already validated
  const device = await deviceService.createDevice(request.body);
  return reply.code(201).send(device);
});
```

**Validation happens:**
- Before handler runs
- Automatic error response if invalid
- Type-safe request body

### Step 5: Handling Not Found Errors

```typescript
fastify.get('/api/devices/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const device = await deviceService.getDeviceById(id);

  if (!device) {
    return reply.code(404).send({ error: 'Device not found' });
  }

  return reply.code(200).send(device);
});
```

**Key points:**
- Check for null/undefined
- Return 404 for missing resources
- Clear error message

### Step 6: Handling Database Errors

```typescript
async deleteDevice(id: string): Promise<boolean> {
  try {
    await prisma.device.delete({ where: { id } });
    return true;
  } catch (error) {
    // Prisma throws error if record doesn't exist
    return false;
  }
}
```

**Prisma errors:**
- `RecordNotFound` - Document doesn't exist
- `UniqueConstraintViolation` - Duplicate unique field
- `ConnectionError` - Database connection issue

### Step 7: Custom Error Messages

Provide helpful error messages:

```typescript
catch (error) {
  fastify.log.error(error);
  
  // Include error details in development
  const message = process.env.NODE_ENV === 'development'
    ? error.message
    : 'Failed to create device';
  
  return reply.code(500).send({ error: message });
}
```

**Best practices:**
- Clear, actionable messages
- Don't expose internals in production
- Include request ID for tracking

## Code Examples

### Complete Error Handling Pattern

```typescript
fastify.post('/api/devices', {
  schema: {
    ...createDeviceSchema,
    response: {
      201: { /* success schema */ },
      400: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
        },
      },
    },
  },
}, async (request, reply) => {
  try {
    const device = await deviceService.createDevice(request.body as any);
    return reply.code(201).send(device);
  } catch (error) {
    fastify.log.error(error);
    
    // Check error type
    if (error instanceof ValidationError) {
      return reply.code(400).send({
        error: 'Validation failed',
        message: error.message,
      });
    }
    
    return reply.code(500).send({
      error: 'Failed to create device',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});
```

### Validation Schema Example

From `src/utils/validation.ts`:

```typescript
export const createDeviceSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['name', 'type'],
    properties: {
      name: { type: 'string', minLength: 1 },
      type: { type: 'string', enum: ['sensor', 'controller'] },
      status: { type: 'string', enum: ['online', 'offline'] },
      data: {
        type: 'object',
        properties: {
          temperature: { type: 'number' },
          humidity: { type: 'number' },
          power: { type: 'string', enum: ['on', 'off'] },
        },
      },
    },
  },
};
```

### Error Response Format

Consistent error format:

```typescript
// Success
{ "id": "123", "name": "Sensor", ... }

// Error
{
  "error": "Device not found",
  "message": "No device with id '123' exists"
}

// Validation error
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "body should have required property 'name'"
}
```

## Explanations

### Why Validate Requests?

**Security:**
- Prevent invalid data
- Stop injection attacks
- Enforce data constraints

**User Experience:**
- Clear error messages
- Catch errors early
- Prevent invalid operations

**Data Integrity:**
- Ensure required fields
- Validate data types
- Enforce business rules

### Why Log Errors?

**Debugging:**
- Stack traces show where errors occur
- Request context helps reproduce issues
- Error frequency indicates problems

**Monitoring:**
- Track error rates
- Identify patterns
- Alert on critical errors

### Error Handling Strategy

**Layer 1 - Validation:**
- Fastify schema validation
- Catches invalid requests early
- Returns 400 automatically

**Layer 2 - Business Logic:**
- Service layer checks
- Returns null for not found
- Throws for unexpected errors

**Layer 3 - Route Handler:**
- Catches service errors
- Maps to HTTP status codes
- Formats error responses

## Common Pitfalls

1. **Not logging errors:**
   ```typescript
   // ❌ Bad: No logging
   catch (error) {
     return reply.code(500).send({ error: 'Failed' });
   }
   
   // ✅ Good: Log errors
   catch (error) {
     fastify.log.error(error);
     return reply.code(500).send({ error: 'Failed' });
   }
   ```

2. **Exposing internal errors:**
   ```typescript
   // ❌ Bad: Exposes stack trace
   catch (error) {
     return reply.code(500).send({ error: error.stack });
   }
   
   // ✅ Good: Generic message in production
   catch (error) {
     fastify.log.error(error);
     const message = process.env.NODE_ENV === 'development'
       ? error.message
       : 'Internal server error';
     return reply.code(500).send({ error: message });
   }
   ```

3. **Wrong status codes:**
   ```typescript
   // ❌ Bad: 200 for error
   if (!device) {
     return reply.send({ error: 'Not found' });
   }
   
   // ✅ Good: 404 for not found
   if (!device) {
     return reply.code(404).send({ error: 'Not found' });
   }
   ```

4. **Not validating requests:**
   ```typescript
   // ❌ Bad: No validation
   fastify.post('/api/devices', async (request, reply) => {
     const device = await createDevice(request.body);
   });
   
   // ✅ Good: Schema validation
   fastify.post('/api/devices', {
     schema: { ...createDeviceSchema },
   }, async (request, reply) => {
     const device = await createDevice(request.body);
   });
   ```

## Summary

In this workshop, you've learned:

✅ HTTP status codes and when to use them  
✅ Try-catch error handling  
✅ Error logging best practices  
✅ Request validation with schemas  
✅ Handling not found errors  
✅ Database error handling  
✅ Custom error messages  

**Key Takeaways:**
- **Always validate requests:** Catch errors early
- **Log all errors:** Essential for debugging
- **Use appropriate status codes:** Clear communication
- **Don't expose internals:** Security and professionalism
- **Consistent error format:** Better client experience

## Next Steps

- **Workshop 9:** Integration with WebSocket Server
- Practice adding validation to new endpoints
- Study HTTP status code best practices
- Read Fastify validation documentation
- Implement error tracking/monitoring

