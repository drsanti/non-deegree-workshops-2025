# IoT Device Management API

REST API server for IoT device management using Prisma ORM with MongoDB. This project provides endpoints for managing IoT devices and their sensor data history, designed to integrate with the websocket server for real-time IoT device communication.

## Features

- RESTful API built with Fastify
- MongoDB database with Prisma ORM
- Device CRUD operations
- Device sensor data history tracking
- TypeScript for type safety
- Docker Compose for MongoDB setup

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker and Docker Compose
- MongoDB (via Docker Compose or standalone)

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Generate Prisma client:**
   ```bash
   npm run prisma:generate
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` (if not already present)
   - Update the `DATABASE_URL` and `PORT` as needed

## Running MongoDB with Docker Compose

This project includes a `docker-compose.yml` file to easily run MongoDB in a containerized environment.

### Quick Start

1. **Start MongoDB:**
   ```bash
   docker-compose up -d
   ```
   The `-d` flag runs the container in detached mode (in the background).

2. **Verify MongoDB is running:**
   ```bash
   docker-compose ps
   ```

3. **Initialize MongoDB replica set** (required for Prisma transactions):
   ```bash
   docker exec mongodb mongosh -u non-degree -p 'non-degree-#2025' --authenticationDatabase admin --eval "rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'localhost:27017'}]})" --quiet
   ```
   **Note:** 
   - Replace the username and password with your `.env` values if different
   - This only needs to be done once. The replica set configuration persists in the Docker volume
   - Wait a few seconds after starting MongoDB before initializing the replica set

4. **Push Prisma schema to database:**
   ```bash
   npm run prisma:push
   ```

### Common MongoDB Commands

- **Start MongoDB:** `docker-compose up -d`
- **Stop MongoDB:** `docker-compose down`
- **View logs:** `docker-compose logs -f mongodb`
- **Restart MongoDB:** `docker-compose restart mongodb`
- **Stop and remove volumes:** `docker-compose down -v` (⚠️ This will delete all data)

### Connection Details

- **Host:** `localhost`
- **Port:** `27017`
- **Connection String:** `mongodb://<username>:<password>@localhost:27017/<database>?authSource=admin`

### Data Persistence

MongoDB data is persisted in Docker volumes:
- `mongodb_data`: Contains the database files
- `mongodb_config`: Contains MongoDB configuration

Data will persist even if you stop the container. To completely remove data, use `docker-compose down -v`.

## Running the API Server

### Development Mode

```bash
npm run dev
```

This starts the server in watch mode with hot reload.

### Production Mode

```bash
npm run build
npm start
```

### Health Check

Once the server is running, verify it's working:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": 1234567890
}
```

## Environment Variables

The application uses the following environment variables (configured in `.env`):

- `DATABASE_URL`: MongoDB connection string
  - Format: `mongodb://username:password@localhost:27017/database?authSource=admin`
  - Default: `mongodb://non-degree:non-degree-%232025@localhost:27017/non-degree-db?authSource=admin`
- `PORT`: Server port (default: `3000`)
- `HOST`: Server host (default: `0.0.0.0`)

## API Endpoints

### Device Management

#### Get All Devices
```http
GET /api/devices
```

Returns a list of all IoT devices.

**Response:**
```json
[
  {
    "id": "device-id",
    "name": "Temperature Sensor",
    "type": "sensor",
    "status": "online",
    "lastUpdate": 1234567890,
    "data": {
      "temperature": 22.5,
      "humidity": 45.0,
      "power": "on"
    }
  }
]
```

#### Get Device by ID
```http
GET /api/devices/:id
```

Returns a specific device by its ID.

#### Create Device
```http
POST /api/devices
Content-Type: application/json

{
  "name": "Temperature Sensor",
  "type": "sensor",
  "status": "online",
  "data": {
    "temperature": 20,
    "humidity": 40,
    "power": "off"
  }
}
```

#### Update Device
```http
PUT /api/devices/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "type": "controller",
  "status": "offline"
}
```

#### Update Device Status
```http
PATCH /api/devices/:id/status
Content-Type: application/json

{
  "status": "online"
}
```

#### Update Device Data
```http
PATCH /api/devices/:id/data
Content-Type: application/json

{
  "data": {
    "temperature": 25.5,
    "humidity": 50.0,
    "power": "on"
  }
}
```

#### Delete Device
```http
DELETE /api/devices/:id
```

### Device Data History

#### Get Device History
```http
GET /api/devices/:id/history?startTime=2024-01-01T00:00:00Z&endTime=2024-01-31T23:59:59Z&limit=100
```

Query parameters:
- `startTime` (optional): ISO 8601 timestamp
- `endTime` (optional): ISO 8601 timestamp
- `limit` (optional): Maximum number of records (default: 100, max: 1000)

#### Create History Entry
```http
POST /api/devices/:id/history
Content-Type: application/json

{
  "temperature": 22.5,
  "humidity": 45.0,
  "power": "on"
}
```

#### Get Latest Reading
```http
GET /api/devices/:id/history/latest
```

Returns the most recent sensor reading for a device.

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run type-check` - Run TypeScript type checking
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:push` - Push schema changes to database
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## Project Structure

```
server/
├── prisma/
│   └── schema.prisma          # Prisma schema definition
├── src/
│   ├── index.ts               # Main server entry point
│   ├── types.ts               # TypeScript type definitions
│   ├── prisma/
│   │   └── client.ts          # Prisma client singleton
│   ├── services/
│   │   ├── device.service.ts  # Device business logic
│   │   └── deviceData.service.ts # Device data history logic
│   ├── routes/
│   │   ├── device.routes.ts   # Device API routes
│   │   └── deviceData.routes.ts # Device data history routes
│   └── utils/
│       └── validation.ts      # Request validation schemas
├── docker-compose.yml         # MongoDB Docker configuration
├── package.json               # Project dependencies
├── tsconfig.json             # TypeScript configuration
└── .env                      # Environment variables
```

## Integration with WebSocket Server

This API is designed to work alongside the websocket server. The data structures are compatible, allowing the websocket server to:
- Persist device data to MongoDB via API calls
- Query device history for analytics
- Manage device configurations

## License

ISC
