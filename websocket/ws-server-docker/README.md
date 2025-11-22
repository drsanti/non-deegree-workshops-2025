# WebSocket Server - Docker Deployment

This directory contains Docker Compose configuration for running the WebSocket IoT Server from Docker Hub.

## Overview

The WebSocket Server is available as a pre-built Docker image from Docker Hub: `drsanti/ternion-realtime-iot-server:latest`. This setup allows you to run the server using Docker Compose with easy configuration via environment variables or a `.env` file.

## Prerequisites

- Docker installed and running
- Docker Compose installed (usually included with Docker Desktop)

## Quick Start

### Option 1: Using Environment Variables (No .env file needed)

1. **Set environment variables and run:**
   ```bash
   export DEVICES='[{"id":"device-001","name":"Temperature Sensor","type":"sensor"},{"id":"device-002","name":"Humidity Monitor","type":"sensor"},{"id":"device-003","name":"Smart Thermostat","type":"controller"}]'
   docker-compose up -d
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f
   ```

3. **Stop the server:**
   ```bash
   docker-compose down
   ```

### Option 2: Using .env File (Recommended)

1. **Create a `.env` file in this directory:**
   ```bash
   touch .env
   ```

2. **Add configuration to `.env` file:**
   ```env
   # WebSocket Server Port
   PORT=7890

   # Device Configuration (REQUIRED)
   # JSON array of device objects
   DEVICES=[{"id":"device-001","name":"Temperature Sensor","type":"sensor"},{"id":"device-002","name":"Humidity Monitor","type":"sensor"},{"id":"device-003","name":"Smart Thermostat","type":"controller"}]

   # Simulation Settings
   TEMPERATURE_BASE=20
   TEMPERATURE_RANGE=10
   HUMIDITY_BASE=40
   HUMIDITY_RANGE=30
   SIMULATION_INTERVAL=3000

   # Initial Device Status
   INITIAL_DEVICE_STATUS=online
   INITIAL_POWER_STATUS=on
   ```

3. **Start the server:**
   ```bash
   docker-compose up -d
   ```

4. **View logs:**
   ```bash
   docker-compose logs -f
   ```

5. **Stop the server:**
   ```bash
   docker-compose down
   ```

## Configuration

### Using .env File

The `docker-compose.yml` file reads environment variables from your system environment. To use a `.env` file:

1. **Create `.env` file** in the same directory as `docker-compose.yml`
2. **Add your configuration** (see Environment Variables section below)
3. **Run `docker-compose up -d`** - Docker Compose automatically loads variables from `.env`

**Important:** The `.env` file is automatically loaded by Docker Compose. You don't need to specify it explicitly unless you want to use a different file name.

### Using Environment Variables Directly

You can also set environment variables directly in your terminal:

**On Linux/macOS:**
```bash
export DEVICES='[{"id":"device-001","name":"Temperature Sensor","type":"sensor"}]'
export PORT=7890
docker-compose up -d
```

**On Windows (PowerShell):**
```powershell
$env:DEVICES='[{"id":"device-001","name":"Temperature Sensor","type":"sensor"}]'
$env:PORT=7890
docker-compose up -d
```

**On Windows (Command Prompt):**
```cmd
set DEVICES=[{"id":"device-001","name":"Temperature Sensor","type":"sensor"}]
set PORT=7890
docker-compose up -d
```

## Environment Variables

### Required Variables

- **`DEVICES`** - JSON array of device configurations (REQUIRED)
  ```json
  [{"id":"device-001","name":"Temperature Sensor","type":"sensor"},{"id":"device-002","name":"Humidity Monitor","type":"sensor"}]
  ```
  - `id` - Unique device identifier (string)
  - `name` - Device display name (string)
  - `type` - Device type: `"sensor"` or `"controller"`

### Optional Variables (with defaults)

- **`PORT`** (default: `7890`) - WebSocket server port
- **`TEMPERATURE_BASE`** (default: `20`) - Base temperature for simulation (°C)
- **`TEMPERATURE_RANGE`** (default: `10`) - Temperature variation range (°C)
- **`HUMIDITY_BASE`** (default: `40`) - Base humidity for simulation (%)
- **`HUMIDITY_RANGE`** (default: `30`) - Humidity variation range (%)
- **`SIMULATION_INTERVAL`** (default: `3000`) - Interval in milliseconds for sensor updates
- **`INITIAL_DEVICE_STATUS`** (default: `online`) - Initial status: `"online"` or `"offline"`
- **`INITIAL_POWER_STATUS`** (default: `on`) - Initial power status: `"on"` or `"off"`

## Example .env File

Create a `.env` file with this content:

```env
# WebSocket Server Port
PORT=7890

# Device Configuration (REQUIRED)
# Format: JSON array with device objects
# Each device needs: id, name, and type (sensor or controller)
DEVICES=[{"id":"device-001","name":"Temperature Sensor","type":"sensor"},{"id":"device-002","name":"Humidity Monitor","type":"sensor"},{"id":"device-003","name":"Smart Thermostat","type":"controller"}]

# Temperature Simulation (in Celsius)
TEMPERATURE_BASE=20
TEMPERATURE_RANGE=10

# Humidity Simulation (in percentage)
HUMIDITY_BASE=40
HUMIDITY_RANGE=30

# Update Interval (in milliseconds)
SIMULATION_INTERVAL=3000

# Initial Device Status
INITIAL_DEVICE_STATUS=online
INITIAL_POWER_STATUS=on
```

## Docker Compose Commands

### Start the Server
```bash
docker-compose up -d
```
The `-d` flag runs the container in detached mode (background).

### View Logs
```bash
# Follow logs in real-time
docker-compose logs -f

# View last 100 lines
docker-compose logs --tail=100

# View logs for specific service
docker-compose logs -f websocket-server
```

### Stop the Server
```bash
docker-compose down
```

### Stop and Remove Volumes
```bash
docker-compose down -v
```

### Restart the Server
```bash
docker-compose restart
```

### View Running Containers
```bash
docker-compose ps
```

### Pull Latest Image
```bash
docker-compose pull
```

### Rebuild and Restart
```bash
docker-compose up -d --force-recreate
```

## Troubleshooting

### Server Not Starting

1. **Check if port is already in use:**
   ```bash
   # Linux/macOS
   lsof -i :7890
   
   # Windows
   netstat -ano | findstr :7890
   ```

2. **Check Docker logs:**
   ```bash
   docker-compose logs websocket-server
   ```

3. **Verify DEVICES variable is set:**
   ```bash
   # Check if DEVICES is in your .env file or environment
   docker-compose config
   ```

### Connection Refused

1. **Verify container is running:**
   ```bash
   docker-compose ps
   ```

2. **Check if port is exposed:**
   ```bash
   docker-compose port websocket-server 7890
   ```

3. **Test connection:**
   ```bash
   # The server should be accessible at ws://localhost:7890
   ```

### DEVICES Variable Issues

If you get errors about DEVICES:

1. **Ensure DEVICES is a valid JSON array:**
   ```json
   [{"id":"device-001","name":"Temperature Sensor","type":"sensor"}]
   ```

2. **In .env file, you can use single or double quotes:**
   ```env
   DEVICES=[{"id":"device-001","name":"Temperature Sensor","type":"sensor"}]
   ```
   Or:
   ```env
   DEVICES='[{"id":"device-001","name":"Temperature Sensor","type":"sensor"}]'
   ```

3. **Escape special characters properly in .env file**

4. **Check Docker Compose configuration:**
   ```bash
   docker-compose config
   ```
   This shows the final configuration with all variables resolved.

## Docker Hub Image

- **Image Name**: `drsanti/ternion-realtime-iot-server:latest`
- **Docker Hub**: https://hub.docker.com/r/drsanti/ternion-realtime-iot-server
- **Source Code**: Available in a separate private repository

## Connecting Clients

Once the server is running, clients can connect to:
```
ws://localhost:7890
```

For clients on other machines, use:
```
ws://your-server-ip:7890
```

## Network Configuration

The `docker-compose.yml` creates a bridge network (`iot-network`) for the server. If you need to connect other containers to this network:

```yaml
networks:
  - iot-network
```

## Security Notes

- The `.env` file may contain sensitive configuration
- Add `.env` to `.gitignore` if committing to version control
- Use Docker secrets or a secrets manager in production
- Consider using HTTPS/WSS in production with a reverse proxy

## Production Deployment

For production:

1. **Use a reverse proxy** (nginx, Traefik) for SSL/TLS
2. **Set up proper networking** for multi-host deployments
3. **Configure log aggregation** for monitoring
4. **Use Docker secrets** for sensitive data
5. **Set up health checks** and monitoring
6. **Configure resource limits** in docker-compose.yml

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Hub Image](https://hub.docker.com/r/drsanti/ternion-realtime-iot-server)
- Main project README: `../../README.md`
- WebSocket Client README: `../ws-client/README.md`

