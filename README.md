# IoT Device Management - Full Stack Learning Project

A comprehensive full-stack TypeScript learning project demonstrating IoT device management with real-time communication, REST APIs, and database persistence. This project includes **20 progressive workshops** covering WebSocket clients, REST APIs, MongoDB, Prisma ORM, and React development.

## Overview

This repository contains two main projects that work together with a Docker-based WebSocket Server to create a complete IoT device management system:

1. **WebSocket Client** (`websocket/ws-client`) - React application with 10 workshops for WebSocket client development
2. **REST API Server** (`iot-device-api/server`) - RESTful API with MongoDB persistence and 10 workshops for backend development
3. **WebSocket Server** (Docker Image) - Real-time IoT device simulation server available as a Docker image from Docker Hub

**Note:** The WebSocket Server source code is maintained in a separate private repository. The server is available as a pre-built Docker image (`drsanti/ternion-realtime-iot-server:latest`) from Docker Hub for easy deployment.

## Projects

### 1. WebSocket Server (Docker Image)

The WebSocket Server is **not included in this repository** but is available as a Docker image from Docker Hub. It simulates IoT devices and enables real-time bidirectional communication.

**Docker Image:**
- **Image Name**: `drsanti/ternion-realtime-iot-server:latest`
- **Docker Hub**: https://hub.docker.com/r/drsanti/ternion-realtime-iot-server
- **Source Code**: Available in a separate private repository

**Features:**
- WebSocket server for real-time communication
- Simulates multiple IoT devices (temperature sensors, humidity monitors, controllers)
- Broadcasts sensor data updates to all connected clients
- Handles device control commands
- TypeScript with type-safe message handling
- Pre-built Docker image for easy deployment

**Usage:**
The server is deployed using Docker. See the [Docker Deployment](#docker-deployment) section for instructions.

**Tech Stack:**
- Node.js, TypeScript
- `ws` WebSocket library
- Docker containerization

### 2. WebSocket Client (`websocket/ws-client`)

A React application with **10 progressive workshops** teaching WebSocket client development from basics to production-ready patterns.

**Features:**
- 10 interactive workshop examples
- Real-time sensor data visualization
- Device status monitoring and control
- Automatic reconnection with exponential backoff
- Modern UI with Radix UI components
- Type-safe TypeScript implementation

**Workshops:**
1. Basic WebSocket Connection
2. Basic Messaging
3. Device List Handling
4. Real-time Sensor Data
5. Device Control
6. Connection Management
7. Error Handling
8. Custom Hooks
9. Advanced Features
10. Best Practices

**Tech Stack:**
- React 18, TypeScript
- Vite build tool
- Radix UI components
- WebSocket API

### 3. REST API Server (`iot-device-api/server`)

A RESTful API server with **10 progressive workshops** teaching backend development with MongoDB, Prisma ORM, and Fastify.

**Features:**
- RESTful API built with Fastify
- MongoDB database with Prisma ORM
- Device CRUD operations
- Device sensor data history tracking
- TypeScript for type safety
- Docker Compose for MongoDB setup

**Workshops:**
1. Setup Environment
2. Project Architecture
3. MongoDB & Prisma
4. Fastify REST API
5. TypeScript Backend
6. Device CRUD
7. Data History Queries
8. Error Handling & Validation
9. WebSocket Integration
10. Advanced Topics

**Tech Stack:**
- Node.js, TypeScript
- Fastify web framework
- Prisma ORM
- MongoDB database
- Docker Compose

## Project Structure

```
.
├── websocket/
│   └── ws-client/               # React WebSocket Client
│       ├── src/
│       │   ├── App.tsx         # Main application
│       │   ├── Example.tsx     # Workshop example selector
│       │   ├── examples/       # 10 workshop examples
│       │   └── components/
│       ├── workshops/          # 10 workshop markdown files
│       └── README.md
│
└── iot-device-api/
    └── server/                  # REST API Server
        ├── src/
        │   ├── index.ts        # Main server entry
        │   ├── routes/         # API routes
        │   ├── services/       # Business logic
        │   └── prisma/         # Prisma client
        ├── prisma/
        │   └── schema.prisma   # Database schema
        ├── workshops/          # 10 workshop markdown files
        ├── examples/           # Code examples
        └── README.md
```

**Note:** The WebSocket Server is not included in this repository. It is available as a Docker image (`drsanti/ternion-realtime-iot-server:latest`) from Docker Hub.

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for WebSocket Server and MongoDB)
- Modern web browser with WebSocket support

### Installation

1. **Install WebSocket Client dependencies:**
   ```bash
   cd websocket/ws-client
   npm install
   ```

2. **Set up MongoDB for REST API Server:**
   ```bash
   cd iot-device-api/server
   docker-compose up -d
   ```
   This starts MongoDB in a Docker container. Wait a few seconds for MongoDB to initialize.

3. **Initialize MongoDB Replica Set:**
   ```bash
   docker exec mongodb mongosh -u non-degree -p 'non-degree-#2025' --authenticationDatabase admin --eval "rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'localhost:27017'}]})" --quiet
   ```
   Prisma requires MongoDB to run as a replica set (even for single-node setups).

4. **Install REST API Server dependencies:**
   ```bash
   cd iot-device-api/server
   npm install
   npm run prisma:generate
   ```
   **Note:** MongoDB must be running and replica set initialized before running `prisma:generate`.

4. **WebSocket Server:**
   The WebSocket Server is available as a Docker image. No local installation needed. See [Docker Deployment](#docker-deployment) section.

### Running the Projects

#### Option 1: WebSocket Real-Time Demo

1. **Start the WebSocket Server using Docker:**
   ```bash
   docker run -d \
     --name ternion-realtime-iot-server \
     -p 7890:7890 \
     -e DEVICES='[{"id":"device-001","name":"Temperature Sensor","type":"sensor"},{"id":"device-002","name":"Humidity Monitor","type":"sensor"},{"id":"device-003","name":"Smart Thermostat","type":"controller"}]' \
     drsanti/ternion-realtime-iot-server:latest
   ```
   Server runs on `ws://localhost:7890`
   
   **Or use Docker Compose:**
   ```bash
   # Create a docker-compose.yml file (see Docker Deployment section)
   docker-compose up -d
   ```

2. **Start the WebSocket Client:**
   ```bash
   cd websocket/ws-client
   npm run dev
   ```
   Client opens at `http://localhost:5173`

3. **Open your browser** and navigate to `http://localhost:5173`
   - Use the example selector to explore the 10 workshops
   - Each example demonstrates different WebSocket concepts

#### Option 2: REST API with Database

1. **Start MongoDB with Docker Compose:**
   ```bash
   cd iot-device-api/server
   docker-compose up -d
   ```

2. **Initialize MongoDB Replica Set:**
   ```bash
   docker exec mongodb mongosh -u non-degree -p 'non-degree-#2025' --authenticationDatabase admin --eval "rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'localhost:27017'}]})" --quiet
   ```

3. **Push Prisma Schema:**
   ```bash
   cd iot-device-api/server
   npm run prisma:push
   ```

4. **Start the REST API Server:**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:3000`

5. **Explore the workshops** in `iot-device-api/server/workshops/`

## Learning Path

### WebSocket Client Development (10 Workshops)

**Beginner (Workshops 1-3):**
- Basic WebSocket connections
- Sending and receiving messages
- Managing device state

**Intermediate (Workshops 4-6):**
- Real-time data updates
- Device control interfaces
- Connection lifecycle management

**Advanced (Workshops 7-10):**
- Error handling and validation
- Custom React hooks
- Advanced features (queuing, optimistic updates)
- Production-ready practices

### Backend API Development (10 Workshops)

**Beginner (Workshops 1-3):**
- Environment setup
- Project architecture
- MongoDB and Prisma basics

**Intermediate (Workshops 4-6):**
- Fastify REST API development
- TypeScript backend patterns
- CRUD operations

**Advanced (Workshops 7-10):**
- Data history queries
- Error handling and validation
- WebSocket integration
- Advanced topics and optimization

## Tech Stack Summary

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Radix UI** - Component library
- **WebSocket API** - Real-time communication

### Backend
- **Node.js** - Runtime
- **TypeScript** - Type safety
- **Fastify** - Web framework
- **Prisma** - ORM
- **MongoDB** - Database
- **ws** - WebSocket library

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## Key Features

### Real-Time Communication
- WebSocket bidirectional communication
- Automatic reconnection with exponential backoff
- Real-time sensor data updates
- Device control commands

### Data Persistence
- MongoDB database for device storage
- Prisma ORM for type-safe database access
- Device data history tracking
- RESTful API endpoints

### Developer Experience
- **20 Progressive Workshops** - Comprehensive learning materials
- **TypeScript** - Full type safety across all projects
- **Interactive Examples** - Working code examples for each concept
- **Docker Support** - Easy deployment and setup
- **Modern Tooling** - Vite, Fastify, Prisma

## Documentation

Each project includes detailed documentation:

- **WebSocket Server**: Available via Docker Hub at https://hub.docker.com/r/drsanti/ternion-realtime-iot-server (source code in separate private repository)
- **WebSocket Client**: `websocket/ws-client/README.md`
- **REST API Server**: `iot-device-api/server/README.md`

## Development Commands

### WebSocket Server (Docker)

The WebSocket Server runs as a Docker container. Use these commands:

```bash
# Pull the latest image
docker pull drsanti/ternion-realtime-iot-server:latest

# Run the server
docker run -d \
  --name ternion-realtime-iot-server \
  -p 7890:7890 \
  -e DEVICES='[{"id":"device-001","name":"Temperature Sensor","type":"sensor"}]' \
  drsanti/ternion-realtime-iot-server:latest

# View logs
docker logs -f ternion-realtime-iot-server

# Stop the server
docker stop ternion-realtime-iot-server

# Remove the container
docker rm ternion-realtime-iot-server
```

### WebSocket Client
```bash
cd websocket/ws-client
npm run dev      # Development server
npm run build    # Production build
npm run type-check
```

### REST API Server
```bash
cd iot-device-api/server
npm run dev      # Development with watch
npm start        # Production
npm run prisma:generate  # Generate Prisma client
npm run prisma:push      # Push schema to database
npm run prisma:studio    # Open Prisma Studio
```

## Docker Deployment

### WebSocket Server

The WebSocket Server is available as a pre-built Docker image from Docker Hub.

**Option 1: Using Docker directly**

```bash
docker run -d \
  --name ternion-realtime-iot-server \
  -p 7890:7890 \
  -e DEVICES='[{"id":"device-001","name":"Temperature Sensor","type":"sensor"},{"id":"device-002","name":"Humidity Monitor","type":"sensor"},{"id":"device-003","name":"Smart Thermostat","type":"controller"}]' \
  -e PORT=7890 \
  -e TEMPERATURE_BASE=20 \
  -e TEMPERATURE_RANGE=10 \
  -e HUMIDITY_BASE=40 \
  -e HUMIDITY_RANGE=30 \
  -e SIMULATION_INTERVAL=3000 \
  drsanti/ternion-realtime-iot-server:latest
```

**Option 2: Using Docker Compose**

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  websocket-server:
    image: drsanti/ternion-realtime-iot-server:latest
    container_name: ternion-realtime-iot-server
    ports:
      - "7890:7890"
    environment:
      - PORT=7890
      - DEVICES='[{"id":"device-001","name":"Temperature Sensor","type":"sensor"},{"id":"device-002","name":"Humidity Monitor","type":"sensor"},{"id":"device-003","name":"Smart Thermostat","type":"controller"}]'
      - TEMPERATURE_BASE=20
      - TEMPERATURE_RANGE=10
      - HUMIDITY_BASE=40
      - HUMIDITY_RANGE=30
      - SIMULATION_INTERVAL=3000
    restart: unless-stopped
```

Then run:
```bash
docker-compose up -d
```

**Docker Hub:**
- **Image**: `drsanti/ternion-realtime-iot-server:latest`
- **URL**: https://hub.docker.com/r/drsanti/ternion-realtime-iot-server

**Environment Variables:**
- `PORT` (default: `7890`) - WebSocket server port
- `DEVICES` (required) - JSON array of device configurations
- `TEMPERATURE_BASE` (default: `20`) - Base temperature for simulation
- `TEMPERATURE_RANGE` (default: `10`) - Temperature variation range
- `HUMIDITY_BASE` (default: `40`) - Base humidity for simulation
- `HUMIDITY_RANGE` (default: `30`) - Humidity variation range
- `SIMULATION_INTERVAL` (default: `3000`) - Interval in milliseconds for sensor updates
- `INITIAL_DEVICE_STATUS` (default: `online`) - Initial status of devices
- `INITIAL_POWER_STATUS` (default: `on`) - Initial power status

### REST API Server (MongoDB)
```bash
cd iot-device-api/server
docker-compose up -d
```

## TypeScript

All projects are fully written in TypeScript with:
- **Strict type checking** enabled
- **Shared type definitions** where applicable
- **Type-safe** APIs and components
- **IntelliSense** support

## Browser Support

Modern browsers with WebSocket and ES6+ support:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

ISC

## Contributing

This is a comprehensive learning project. Feel free to use it as a starting point for your own IoT applications or to learn full-stack TypeScript development.

## Next Steps

1. **Start with WebSocket Client Workshops** - Learn real-time communication
2. **Explore REST API Workshops** - Learn backend development
3. **Combine Both** - Integrate WebSocket and REST API for a complete solution
4. **Build Your Own** - Use these patterns in your projects
