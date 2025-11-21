# Workshops: IoT Device Management Server

Welcome to the comprehensive workshop series for understanding and working with the IoT Device Management API server. These workshops are designed to take you from setup to advanced topics, covering all aspects of the server implementation.

## Workshop Overview

Each workshop is designed to be:
- **Duration:** 30-60 minutes
- **Format:** Step-by-step tutorials with code examples
- **Level:** Mixed (beginners to advanced)
- **Focus:** Both understanding concepts + practical skills
- **Assessment:** None (pure learning)

## Workshop List

### [Workshop 1: Project Setup & Environment Configuration](./workshops/01-setup-environment.md)
**Duration:** 30-45 minutes | **Level:** Beginner to Intermediate

Learn how to set up the complete development environment, including Node.js, TypeScript, Docker, MongoDB, and Prisma. Understand environment variables and verify your setup works correctly.

**Topics:**
- Installing Node.js and npm
- Understanding package.json and dependencies
- Setting up TypeScript configuration
- Docker Compose for MongoDB
- Environment variables and .env files
- MongoDB replica set initialization
- Running the development server

---

### [Workshop 2: Understanding Project Architecture & Structure](./workshops/02-project-architecture.md)
**Duration:** 45-60 minutes | **Level:** Beginner to Intermediate

Explore the project's architecture and understand how the code is organized. Learn about separation of concerns, the routes-services pattern, and how different parts work together.

**Topics:**
- Project directory structure
- File organization patterns
- Routes vs Services pattern
- Type definitions and interfaces
- Prisma client setup
- Entry point and server initialization
- Code organization best practices

---

### [Workshop 3: MongoDB & Prisma ORM Fundamentals](./workshops/03-mongodb-prisma.md)
**Duration:** 45-60 minutes | **Level:** Beginner to Intermediate

Learn about MongoDB (NoSQL database) and Prisma ORM. Understand how to define database schemas, work with MongoDB through Prisma, and perform database operations.

**Topics:**
- MongoDB basics (collections, documents, ObjectIds)
- Prisma schema syntax
- Defining models and relationships
- Prisma Client API
- Database operations (create, read, update, delete)
- Embedded documents vs references
- Indexes and query optimization

---

### [Workshop 4: Fastify Framework & REST API Design](./workshops/04-fastify-rest-api.md)
**Duration:** 45-60 minutes | **Level:** Beginner to Intermediate

Learn about the Fastify web framework and REST API principles. Understand how to create API endpoints, handle requests and responses, and organize routes effectively.

**Topics:**
- Fastify vs Express comparison
- Creating Fastify server instance
- Route definition and HTTP methods
- Request and response objects
- Route parameters and query strings
- Request validation with schemas
- Error handling in Fastify

---

### [Workshop 5: TypeScript in Backend Development](./workshops/05-typescript-backend.md)
**Duration:** 45-60 minutes | **Level:** Intermediate

Learn how TypeScript enhances backend development. Understand type definitions, interfaces, type safety, and common TypeScript patterns used in API development.

**Topics:**
- TypeScript configuration
- Type definitions for API requests/responses
- Interface design for domain models
- Type safety with Prisma
- Generic types in services
- Type guards for validation
- Common TypeScript patterns in APIs

---

### [Workshop 6: Device Management - CRUD Operations](./workshops/06-device-crud.md)
**Duration:** 45-60 minutes | **Level:** Intermediate

Learn how to implement CRUD (Create, Read, Update, Delete) operations for device management. Understand the service layer pattern, data transformations, and different types of updates.

**Topics:**
- Creating devices with Prisma
- Querying devices (findMany, findUnique)
- Updating device properties
- Partial updates vs full updates
- Deleting devices
- Service layer abstraction
- Data transformation between Prisma and API models

---

### [Workshop 7: Device Data History & Advanced Queries](./workshops/07-data-history-queries.md)
**Duration:** 45-60 minutes | **Level:** Intermediate to Advanced

Learn how to store and query time-series sensor data. Understand indexing, date range queries, pagination, and optimization strategies for historical data.

**Topics:**
- Creating history entries
- Querying with date ranges
- Using indexes for efficient queries
- Limiting and sorting results
- Getting latest records
- Time-series data patterns
- Query optimization strategies

---

### [Workshop 8: Error Handling & Request Validation](./workshops/08-error-handling-validation.md)
**Duration:** 45-60 minutes | **Level:** Intermediate

Learn how to properly handle errors and validate incoming requests. Understand HTTP status codes, error logging, validation schemas, and best practices for error responses.

**Topics:**
- Try-catch error handling
- Error logging and debugging
- Fastify validation schemas
- Custom error messages
- HTTP status codes (200, 201, 400, 404, 500)
- Error response formatting
- Validation best practices

---

### [Workshop 9: Integration with WebSocket Server](./workshops/09-websocket-integration.md)
**Duration:** 45-60 minutes | **Level:** Intermediate to Advanced

Learn how the REST API integrates with the WebSocket server. Understand the relationship between real-time communication and persistent storage, and how to synchronize data between services.

**Topics:**
- WebSocket server overview
- Making HTTP requests from Node.js
- Persisting WebSocket data via API
- Data synchronization patterns
- Handling device updates from WebSocket
- Real-time data logging
- Service communication patterns

---

### [Workshop 10: Advanced Topics & Best Practices](./workshops/10-advanced-topics.md)
**Duration:** 45-60 minutes | **Level:** Advanced

Learn about production considerations, performance optimization, security best practices, testing strategies, and deployment options for the IoT Device Management API.

**Topics:**
- Environment configuration for production
- Database connection pooling
- API rate limiting concepts
- Security considerations (authentication, authorization)
- Logging and monitoring
- Testing strategies (unit, integration)
- Docker deployment
- Performance optimization tips

---

## How to Use These Workshops

1. **Start with Workshop 1** - Even if you're experienced, it covers project-specific setup
2. **Follow in order** - Each workshop builds on previous concepts
3. **Take your time** - Don't rush; understanding is more important than speed
4. **Practice** - Try the examples and experiment
5. **Reference** - Come back to workshops as needed

## Prerequisites

Before starting, you should have:
- Basic command line/terminal knowledge
- A code editor (VS Code recommended)
- Basic understanding of JavaScript/TypeScript (helpful but not required)
- Interest in learning backend development

## Getting Started

1. **Complete Workshop 1** to set up your environment
2. **Verify setup** by running the server
3. **Proceed sequentially** through the workshops
4. **Experiment** with the code examples
5. **Ask questions** and explore further

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Fastify Documentation](https://www.fastify.io/docs/latest/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Node.js Documentation](https://nodejs.org/docs/)

## Workshop Completion

After completing all workshops, you will:
- ✅ Understand the complete project architecture
- ✅ Be able to set up and configure the server
- ✅ Know how to work with MongoDB and Prisma
- ✅ Understand REST API design with Fastify
- ✅ Be comfortable with TypeScript in backend development
- ✅ Be able to implement CRUD operations
- ✅ Understand time-series data and advanced queries
- ✅ Know error handling and validation best practices
- ✅ Understand service integration patterns
- ✅ Be aware of production considerations

**Happy learning!** 🚀

