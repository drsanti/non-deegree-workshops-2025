# Workshop 1: Project Setup & Environment Configuration

**Duration:** 30-45 minutes  
**Level:** Beginner to Intermediate

## Introduction

In this workshop, you'll learn how to set up the complete development environment for the IoT Device Management API server. You'll understand the prerequisites, install necessary tools, configure Docker for MongoDB, set up Prisma, and verify everything works correctly.

## What You'll Learn

- Understanding project prerequisites and requirements
- Setting up Node.js, TypeScript, and development environment
- Configuring Docker and MongoDB
- Initializing Prisma and understanding environment variables
- Verifying the setup works

## Prerequisites

Before starting, you should have:
- Basic understanding of command line/terminal
- A code editor (VS Code recommended)
- Windows, macOS, or Linux operating system

## Step-by-Step Instructions

### Step 1: Install Node.js and npm

Node.js is the JavaScript runtime that powers our server. npm (Node Package Manager) comes bundled with Node.js.

1. **Check if Node.js is installed:**
   ```bash
   node --version
   npm --version
   ```

2. **If not installed, download and install:**
   - Visit [nodejs.org](https://nodejs.org/)
   - Download the LTS (Long Term Support) version (v18 or higher)
   - Run the installer and follow the instructions
   - Verify installation again with the commands above

**Why:** Node.js allows us to run JavaScript on the server, and npm manages our project dependencies.

### Step 2: Navigate to Project Directory

1. **Open your terminal/command prompt**
2. **Navigate to the server directory:**
   ```bash
   cd iot-device-api/server
   ```

**Why:** We need to be in the project directory to run commands that affect this specific project.

### Step 3: Install Project Dependencies

The `package.json` file lists all the libraries our project needs. Let's install them:

```bash
npm install
```

**What happens:**
- npm reads `package.json`
- Downloads all dependencies listed in `dependencies` and `devDependencies`
- Creates a `node_modules` folder with all packages
- Creates `package-lock.json` to lock versions

**Key dependencies:**
- `@prisma/client` - Prisma database client
- `fastify` - Web framework for building APIs
- `dotenv` - Loads environment variables from `.env` file

**Dev dependencies:**
- `typescript` - TypeScript compiler
- `tsx` - TypeScript execution tool
- `prisma` - Prisma CLI for database operations

### Step 4: Generate Prisma Client

Prisma needs to generate a client library based on our database schema:

```bash
npm run prisma:generate
```

**What happens:**
- Prisma reads `prisma/schema.prisma`
- Generates TypeScript types and database client code
- Creates files in `node_modules/.prisma/client/`

**Why:** The generated client provides type-safe database access methods.

### Step 5: Configure Environment Variables

Environment variables store configuration that changes between environments (development, production).

1. **Check if `.env` file exists:**
   ```bash
   ls -la .env
   # or on Windows: dir .env
   ```

2. **If it doesn't exist, copy from example:**
   ```bash
   cp .env.example .env
   ```

3. **Open `.env` file and verify:**
   ```env
   DATABASE_URL=mongodb://non-degree:non-degree-%232025@localhost:27017/non-degree-db?authSource=admin
   PORT=3000
   ```

**Important points:**
- `.env` contains sensitive data - never commit it to git
- `DATABASE_URL` includes username, password, host, port, and database name
- The `%23` in the password is URL encoding for `#` character
- `authSource=admin` tells MongoDB which database to use for authentication

### Step 6: Set Up Docker and MongoDB

MongoDB runs in a Docker container for easy setup and isolation.

1. **Install Docker Desktop:**
   - Visit [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
   - Download and install Docker Desktop
   - Start Docker Desktop application

2. **Verify Docker is running:**
   ```bash
   docker --version
   docker-compose --version
   ```

3. **Start MongoDB container:**
   ```bash
   docker-compose up -d
   ```

   The `-d` flag runs it in "detached" mode (background).

4. **Verify MongoDB is running:**
   ```bash
   docker-compose ps
   ```

   You should see the `mongodb` container with status "Up".

### Step 7: Initialize MongoDB Replica Set

Prisma requires MongoDB to run as a replica set (even for single-node setups).

```bash
docker exec mongodb mongosh -u non-degree -p 'non-degree-#2025' --authenticationDatabase admin --eval "rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'localhost:27017'}]})" --quiet
```

**What this does:**
- Connects to MongoDB inside the container
- Initializes a replica set named "rs0"
- Adds the current MongoDB instance as the first member

**Note:** This only needs to be done once. The configuration persists in the Docker volume.

### Step 8: Push Prisma Schema to Database

Create the database collections and indexes:

```bash
npm run prisma:push
```

**What happens:**
- Prisma connects to MongoDB
- Creates collections: `devices` and `device_data_history`
- Creates indexes for efficient queries
- Syncs schema with database

**Output should show:**
```
[+] Collection `devices`
[+] Collection `device_data_history`
[+] Index `device_data_history_deviceId_idx`
[+] Index `device_data_history_deviceId_timestamp_idx`
```

### Step 9: Start the Development Server

Now let's start the API server:

```bash
npm run dev
```

**What happens:**
- TypeScript files are compiled on-the-fly
- Server starts on port 3000 (or PORT from .env)
- File watching is enabled - changes auto-reload the server

**Expected output:**
```
Server listening on http://0.0.0.0:3000
Health check: http://0.0.0.0:3000/health
API endpoints available at http://0.0.0.0:3000/api
```

### Step 10: Verify Setup

Test that everything works:

1. **In a new terminal, test health endpoint:**
   ```bash
   curl http://localhost:3000/health
   ```

   **Expected response:**
   ```json
   {"status":"ok","timestamp":1234567890}
   ```

2. **Test getting devices (should return empty array):**
   ```bash
   curl http://localhost:3000/api/devices
   ```

   **Expected response:**
   ```json
   []
   ```

If both commands work, your setup is complete! ✅

## Code Examples

### package.json Scripts

The `package.json` file defines scripts you can run:

```json
{
  "scripts": {
    "start": "tsx src/index.ts",           // Production mode
    "dev": "tsx watch src/index.ts",       // Development with auto-reload
    "build": "tsc",                        // Compile TypeScript
    "type-check": "tsc --noEmit",          // Check types without compiling
    "prisma:generate": "prisma generate",  // Generate Prisma client
    "prisma:push": "prisma db push",       // Push schema to database
    "prisma:studio": "prisma studio"       // Open Prisma Studio GUI
  }
}
```

### Environment Variables Structure

```env
# Database connection string
# Format: mongodb://username:password@host:port/database?options
DATABASE_URL=mongodb://non-degree:non-degree-%232025@localhost:27017/non-degree-db?authSource=admin

# Server configuration
PORT=3000
HOST=0.0.0.0
```

## Explanations

### Why Docker for MongoDB?

- **Consistency:** Same MongoDB version across all environments
- **Isolation:** Doesn't interfere with system MongoDB installations
- **Easy cleanup:** Remove container and volumes to start fresh
- **Portability:** Works the same on Windows, macOS, and Linux

### Why Replica Set?

Prisma uses transactions for data consistency. MongoDB requires replica set configuration for transactions, even with a single node. This is a MongoDB requirement, not a Prisma limitation.

### Why Environment Variables?

- **Security:** Keep credentials out of code
- **Flexibility:** Different configs for dev/staging/production
- **Version Control:** `.env` is gitignored, `.env.example` shows structure

### Why Prisma Client Generation?

Prisma generates TypeScript types based on your schema. This provides:
- **Type Safety:** Compile-time checks for database operations
- **Autocomplete:** IDE suggestions for models and fields
- **Refactoring:** Safe renaming with TypeScript support

## Common Pitfalls

1. **MongoDB container keeps restarting:**
   - Check logs: `docker-compose logs mongodb`
   - Ensure replica set is initialized
   - Verify keyfile permissions (if using authentication)

2. **"Cannot find module '@prisma/client'":**
   - Run `npm install` first
   - Then run `npm run prisma:generate`

3. **Connection refused errors:**
   - Verify MongoDB is running: `docker-compose ps`
   - Check DATABASE_URL in `.env` matches your credentials
   - Ensure replica set is initialized

4. **Port already in use:**
   - Change PORT in `.env` to a different number (e.g., 3001)
   - Or stop the process using port 3000

5. **Prisma schema not synced:**
   - Run `npm run prisma:push` after schema changes
   - Check for errors in the output

## Summary

In this workshop, you've learned to:

✅ Install and verify Node.js and npm  
✅ Install project dependencies  
✅ Generate Prisma client  
✅ Configure environment variables  
✅ Set up Docker and MongoDB  
✅ Initialize MongoDB replica set  
✅ Push Prisma schema to database  
✅ Start the development server  
✅ Verify the setup works  

**Key Takeaways:**
- Environment variables keep sensitive data out of code
- Docker provides consistent database setup
- Prisma client must be generated after schema changes
- Replica set is required for Prisma transactions with MongoDB

## Next Steps

- **Workshop 2:** Understanding Project Architecture & Structure
- Explore `package.json` to understand all available scripts
- Try `npm run prisma:studio` to see the database GUI
- Read the [Prisma documentation](https://www.prisma.io/docs)
- Read the [Fastify documentation](https://www.fastify.io/docs/latest/)

