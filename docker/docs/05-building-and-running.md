# Chapter 5: Building and Running

## Table of Contents

1. [Building Images Locally](#building-images-locally)
2. [Building with Docker Compose](#building-with-docker-compose)
3. [Running Containers](#running-containers)
4. [Managing Containers](#managing-containers)
5. [Viewing Logs](#viewing-logs)
6. [Debugging Techniques](#debugging-techniques)
7. [Network Inspection](#network-inspection)
8. [Volume Management](#volume-management)

## Building Images Locally

### Basic Build Command

```bash
docker build -t image-name:tag .
```

**Options**:
- `-t`: Tag the image (name:tag)
- `.`: Build context (directory containing Dockerfile)

### Building Individual Services

#### Build Node-RED Image

```bash
cd docker/node-red
docker build -t iot-node-red:latest .
```

**Expected Output**:
```
Sending build context to Docker daemon  5.12kB
Step 1/6 : FROM nodered/node-red:latest
 ---> abc123def456
Step 2/6 : USER root
 ---> Using cache
 ---> def456ghi789
Step 3/6 : COPY package.json /data/package.json
 ---> ghi789jkl012
Step 4/6 : RUN cd /data && npm install --production --unsafe-perm
 ---> Running in xyz789abc123
 ---> jkl012mno345
Step 5/6 : COPY flows.json /data/flows.json
 ---> mno345pqr678
Step 6/6 : USER node-red
 ---> pqr678stu901
Successfully built stu901vwx234
Successfully tagged iot-node-red:latest
```

#### Build Flask API Image

```bash
cd api
docker build -t iot-flask-api:latest .
```

#### Build Simulator Image

```bash
cd simulator
docker build -t iot-simulator:latest .
```

### Build Options

#### Build with No Cache

```bash
docker build --no-cache -t my-image:latest .
```

**Use Case**: 
- Testing Dockerfile from scratch
- Ensuring reproducible builds
- Debugging build issues

#### Build with Progress Output

```bash
docker build --progress=plain -t my-image:latest .
```

**Use Case**: 
- Debugging build issues
- Seeing detailed output
- Understanding build process

#### Build with Build Arguments

```dockerfile
# In Dockerfile
ARG VERSION=latest
ENV APP_VERSION=${VERSION}
```

```bash
docker build --build-arg VERSION=1.0.0 -t my-image:1.0.0 .
```

## Building with Docker Compose

### Build All Services

```bash
cd docker
docker-compose build
```

**What it does**: 
- Builds all services with `build:` directive
- Skips services using pre-built images
- Uses cached layers when possible

### Build Specific Service

```bash
docker-compose build flask-api
```

**Use Case**: 
- Only one service changed
- Faster than building everything

### Build and Start

```bash
docker-compose up --build
```

**What it does**: 
- Builds images if needed
- Starts all services
- Shows logs from all services

**Detached Mode**:
```bash
docker-compose up --build -d
```

**Benefits**: 
- Runs in background
- Terminal remains available
- Services continue running

### Force Rebuild

```bash
docker-compose build --no-cache
```

**Use Case**: 
- Testing from scratch
- Debugging build issues
- Ensuring clean builds

## Running Containers

### Start All Services

```bash
cd docker
docker-compose up -d
```

**Expected Output**:
```
[+] Running 8/8
 ✔ Network docker_iot-network    Created
 ✔ Container iot-emqx            Started
 ✔ Container iot-influxdb        Started
 ✔ Container iot-node-red        Started
 ✔ Container iot-flask-api       Started
 ✔ Container iot-grafana         Started
 ✔ Container iot-nginx           Started
 ✔ Container iot-simulator       Started
```

### Start Specific Service

```bash
docker-compose up -d flask-api
```

**Note**: Starts dependencies automatically

### Start with Logs

```bash
docker-compose up
```

**What it does**: 
- Starts services in foreground
- Shows logs from all services
- Press `Ctrl+C` to stop

### Check Service Status

```bash
docker-compose ps
```

**Output**:
```
NAME                IMAGE               STATUS
iot-emqx            emqx/emqx:5.3       Up 2 minutes
iot-influxdb        influxdb:2.7        Up 2 minutes
iot-node-red        iot-node-red        Up 2 minutes
iot-flask-api       iot-flask-api       Up 2 minutes
iot-grafana         grafana/grafana     Up 2 minutes
iot-nginx           nginx:alpine        Up 2 minutes
iot-simulator       iot-simulator       Up 2 minutes
```

## Managing Containers

### Stop Services

```bash
docker-compose stop
```

**What it does**: 
- Stops all running containers
- Preserves container state
- Can be restarted with `start`

### Stop Specific Service

```bash
docker-compose stop flask-api
```

### Start Stopped Services

```bash
docker-compose start
```

### Restart Services

```bash
docker-compose restart
```

**Restart Specific Service**:
```bash
docker-compose restart flask-api
```

### Stop and Remove

```bash
docker-compose down
```

**What it does**: 
- Stops all containers
- Removes containers
- Removes network
- **Keeps volumes** (data preserved)

**Remove Everything**:
```bash
docker-compose down -v
```

**Warning**: This removes volumes! Data will be lost.

### Remove Specific Service

```bash
docker-compose rm flask-api
```

## Viewing Logs

### View All Logs

```bash
docker-compose logs
```

### View Specific Service Logs

```bash
docker-compose logs flask-api
```

### Follow Logs (Real-time)

```bash
docker-compose logs -f flask-api
```

**What it does**: 
- Shows logs in real-time
- Similar to `tail -f`
- Press `Ctrl+C` to exit

### View Last N Lines

```bash
docker-compose logs --tail=100 flask-api
```

### View Logs with Timestamps

```bash
docker-compose logs -t flask-api
```

### View Logs Since Time

```bash
docker-compose logs --since 10m flask-api
docker-compose logs --since 2024-01-01T00:00:00 flask-api
```

### Using Docker Logs Directly

```bash
docker logs iot-flask-api
docker logs -f iot-flask-api  # Follow
docker logs --tail=50 iot-flask-api  # Last 50 lines
```

## Debugging Techniques

### Execute Command in Running Container

```bash
docker-compose exec flask-api bash
```

**What it does**: 
- Opens interactive shell in container
- Useful for debugging
- Can run commands directly

**Example Commands**:
```bash
# Check if file exists
ls -la /app

# Check environment variables
env

# Test connection
curl http://influxdb:8086/health

# Check Python version
python --version
```

### Run One-off Command

```bash
docker-compose exec flask-api python --version
```

**Without Interactive Shell**:
```bash
docker-compose run --rm flask-api python --version
```

**`--rm`**: Removes container after command completes

### Inspect Container

```bash
docker inspect iot-flask-api
```

**What it shows**: 
- Container configuration
- Network settings
- Volume mounts
- Environment variables
- Health status

**Pretty Print**:
```bash
docker inspect --format='{{.NetworkSettings.IPAddress}}' iot-flask-api
```

### Check Container Resource Usage

```bash
docker stats
```

**Output**:
```
CONTAINER           CPU %     MEM USAGE / LIMIT     MEM %     NET I/O
iot-flask-api       0.50%     45.2MiB / 2GiB       2.21%     1.2kB / 648B
iot-node-red        0.30%     120.5MiB / 2GiB      5.89%     2.1kB / 1.5kB
```

**Monitor Specific Container**:
```bash
docker stats iot-flask-api
```

### Test Service Connectivity

```bash
# Test Flask API health endpoint
curl http://localhost:5000/health

# Test InfluxDB
curl http://localhost:8086/health

# Test EMQX
curl http://localhost:18083/api/v5/status
```

### View Container Processes

```bash
docker-compose exec flask-api ps aux
```

**What it shows**: 
- Running processes in container
- Resource usage
- Process tree

## Network Inspection

### List Networks

```bash
docker network ls
```

**Output**:
```
NETWORK ID     NAME                    DRIVER    SCOPE
abc123def456   docker_iot-network      bridge    local
def456ghi789   bridge                  bridge    local
```

### Inspect Network

```bash
docker network inspect docker_iot-network
```

**What it shows**: 
- Network configuration
- Connected containers
- IP addresses
- Subnet information

### Test Container-to-Container Communication

```bash
# From Flask API container, test InfluxDB connection
docker-compose exec flask-api curl http://influxdb:8086/health

# Test EMQX connection
docker-compose exec flask-api ping emqx
```

### View Container IP Address

```bash
docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' iot-flask-api
```

## Volume Management

### List Volumes

```bash
docker volume ls
```

**Output**:
```
DRIVER    VOLUME NAME
local     docker_influxdb-data
local     docker_influxdb-config
local     docker_emqx-data
local     docker_node-red-data
local     docker_grafana-data
```

### Inspect Volume

```bash
docker volume inspect docker_influxdb-data
```

**What it shows**: 
- Volume location on host
- Mount point
- Creation date

### Backup Volume

```bash
# Create backup
docker run --rm -v docker_influxdb-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/influxdb-backup.tar.gz /data
```

### Restore Volume

```bash
# Restore from backup
docker run --rm -v docker_influxdb-data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/influxdb-backup.tar.gz -C /
```

### Remove Volume

```bash
docker volume rm docker_influxdb-data
```

**Warning**: This deletes all data in the volume!

### Clean Up Unused Volumes

```bash
docker volume prune
```

**What it does**: 
- Removes volumes not used by any container
- Frees up disk space

## Common Workflows

### Development Workflow

```bash
# 1. Start services
docker-compose up -d

# 2. View logs
docker-compose logs -f flask-api

# 3. Make code changes (bind mount reflects changes)

# 4. Restart service if needed
docker-compose restart flask-api

# 5. Test changes
curl http://localhost:5000/health

# 6. Stop when done
docker-compose down
```

### Debugging Workflow

```bash
# 1. Check service status
docker-compose ps

# 2. View logs
docker-compose logs flask-api

# 3. Execute shell in container
docker-compose exec flask-api bash

# 4. Test connectivity
docker-compose exec flask-api curl http://influxdb:8086/health

# 5. Check environment variables
docker-compose exec flask-api env

# 6. Inspect container
docker inspect iot-flask-api
```

### Production-like Testing

```bash
# 1. Build images
docker-compose build

# 2. Start services
docker-compose up -d

# 3. Wait for health checks
sleep 30

# 4. Verify all services
docker-compose ps

# 5. Test endpoints
curl http://localhost:5000/health
curl http://localhost:8086/health

# 6. Monitor resources
docker stats
```

## Key Takeaways

1. **Build images** before running containers
2. **Use `docker-compose up -d`** for background execution
3. **View logs** to debug issues
4. **Execute commands** in containers for debugging
5. **Inspect** containers and networks for troubleshooting
6. **Manage volumes** carefully to preserve data

## Next Steps

Now that you can build and run the platform, proceed to:
- [Chapter 6: Publishing to GitHub Container Registry](06-publishing-ghcr.md) - Publish your images
- [Chapter 7: Publishing to Docker Hub](07-publishing-dockerhub.md) - Alternative publishing method

## Exercises

1. **Build all images** individually and compare build times
2. **Start services** and verify all are running
3. **View logs** from each service and understand the output
4. **Execute a command** in the Flask API container to test connectivity
5. **Inspect the network** and identify all connected containers

