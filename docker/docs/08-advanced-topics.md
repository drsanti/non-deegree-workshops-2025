# Chapter 8: Advanced Topics

## Table of Contents

1. [Multi-Stage Builds](#multi-stage-builds)
2. [Build Arguments and Secrets](#build-arguments-and-secrets)
3. [Docker Compose Overrides](#docker-compose-overrides)
4. [Development vs Production Configurations](#development-vs-production-configurations)
5. [Resource Limits and Constraints](#resource-limits-and-constraints)
6. [Docker Networking Deep Dive](#docker-networking-deep-dive)
7. [Volume Backup and Restore](#volume-backup-and-restore)
8. [Image Optimization Techniques](#image-optimization-techniques)
9. [Security Hardening](#security-hardening)

## Multi-Stage Builds

### What are Multi-Stage Builds?

**Multi-stage builds** allow you to use multiple `FROM` statements in a Dockerfile. Each `FROM` starts a new build stage. You can copy files from previous stages.

### Why Use Multi-Stage Builds?

**Benefits**:
- **Smaller Images**: Only include what's needed in final image
- **Build Tools**: Use build tools without including them in final image
- **Security**: Reduce attack surface
- **Efficiency**: Separate build and runtime environments

### Example: Python Application

**Single-Stage Build** (Large Image):
```dockerfile
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]
# Image size: ~900MB (includes build tools)
```

**Multi-Stage Build** (Smaller Image):
```dockerfile
# Stage 1: Build
FROM python:3.11 as builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .
ENV PATH=/root/.local/bin:$PATH
CMD ["python", "app.py"]
# Image size: ~120MB (only runtime dependencies)
```

### Example: Node.js Application

```dockerfile
# Stage 1: Build
FROM node:18 as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
CMD ["node", "dist/index.js"]
```

### Benefits for This Project

**Flask API Multi-Stage Example**:
```dockerfile
# Stage 1: Install dependencies
FROM python:3.11-slim as deps
WORKDIR /app
COPY requirements.txt .
RUN pip install --user -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-slim
WORKDIR /app
COPY --from=deps /root/.local /root/.local
COPY . .
ENV PATH=/root/.local/bin:$PATH
EXPOSE 5000
CMD ["python", "app.py"]
```

## Build Arguments and Secrets

### Build Arguments (ARG)

**Build arguments** allow you to pass values during build time.

**Dockerfile**:
```dockerfile
ARG VERSION=latest
ARG BUILD_DATE
ARG GIT_COMMIT

LABEL version=$VERSION
LABEL build-date=$BUILD_DATE
LABEL git-commit=$GIT_COMMIT

ENV APP_VERSION=$VERSION
```

**Build Command**:
```bash
docker build \
  --build-arg VERSION=1.0.0 \
  --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
  --build-arg GIT_COMMIT=$(git rev-parse HEAD) \
  -t my-app:1.0.0 .
```

### Using ARG in Docker Compose

**docker-compose.yml**:
```yaml
services:
  flask-api:
    build:
      context: ../api
      args:
        VERSION: ${VERSION:-latest}
        BUILD_DATE: ${BUILD_DATE}
```

### Build Secrets (Advanced)

**Docker BuildKit Secrets** allow secure passing of sensitive data during build.

**Dockerfile**:
```dockerfile
# syntax=docker/dockerfile:1
FROM python:3.11-slim
RUN --mount=type=secret,id=api_key \
    echo "API_KEY=$(cat /run/secrets/api_key)" > /app/.env
```

**Build Command**:
```bash
DOCKER_BUILDKIT=1 docker build \
  --secret id=api_key,src=./api_key.txt \
  -t my-app .
```

**Note**: Secrets are not included in final image layers.

## Docker Compose Overrides

### Using Override Files

**docker-compose.yml** (Base):
```yaml
services:
  flask-api:
    image: iot-flask-api:latest
    ports:
      - "5000:5000"
```

**docker-compose.override.yml** (Development):
```yaml
services:
  flask-api:
    build:
      context: ../api
    volumes:
      - ../api:/app
    environment:
      - FLASK_ENV=development
      - FLASK_DEBUG=1
```

**docker-compose.prod.yml** (Production):
```yaml
services:
  flask-api:
    image: ghcr.io/username/iot-flask-api:latest
    restart: always
    environment:
      - FLASK_ENV=production
```

### Using Override Files

**Development**:
```bash
docker-compose up -d
# Automatically uses docker-compose.override.yml
```

**Production**:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Common Override Patterns

**Development Override**:
```yaml
# docker-compose.dev.yml
services:
  flask-api:
    build:
      context: ../api
    volumes:
      - ../api:/app
    environment:
      - FLASK_ENV=development
```

**Testing Override**:
```yaml
# docker-compose.test.yml
services:
  flask-api:
    environment:
      - TESTING=true
      - DATABASE_URL=postgresql://test:test@test-db:5432/test
```

## Development vs Production Configurations

### Development Configuration

**Characteristics**:
- Hot reload enabled
- Debug mode on
- Bind mounts for code
- Verbose logging
- Development dependencies

**Example**:
```yaml
services:
  flask-api:
    build:
      context: ../api
    volumes:
      - ../api:/app
    environment:
      - FLASK_ENV=development
      - FLASK_DEBUG=1
    ports:
      - "5000:5000"
```

### Production Configuration

**Characteristics**:
- Optimized images
- Security hardened
- Resource limits
- Health checks
- Restart policies
- No bind mounts

**Example**:
```yaml
services:
  flask-api:
    image: ghcr.io/username/iot-flask-api:v1.0.0
    restart: unless-stopped
    environment:
      - FLASK_ENV=production
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Environment-Specific Files

**Structure**:
```
docker/
├── docker-compose.yml          # Base configuration
├── docker-compose.dev.yml      # Development overrides
├── docker-compose.prod.yml      # Production overrides
└── docker-compose.test.yml     # Testing overrides
```

**Usage**:
```bash
# Development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Testing
docker-compose -f docker-compose.yml -f docker-compose.test.yml up -d
```

## Resource Limits and Constraints

### Setting Resource Limits

**docker-compose.yml**:
```yaml
services:
  flask-api:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

**Explanation**:
- **limits**: Maximum resources container can use
- **reservations**: Guaranteed resources

### CPU Limits

```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'      # 2 CPUs
      cpus: '0.5'      # Half CPU
      cpus: '1.5'      # 1.5 CPUs
```

### Memory Limits

```yaml
deploy:
  resources:
    limits:
      memory: 512M     # 512 megabytes
      memory: 1G       # 1 gigabyte
      memory: 2GiB     # 2 gibibytes
```

### Monitoring Resource Usage

```bash
docker stats
```

**Output**:
```
CONTAINER           CPU %     MEM USAGE / LIMIT     MEM %
iot-flask-api      0.50%     45.2MiB / 512MiB       8.83%
```

### Best Practices

1. **Set Limits**: Prevent resource exhaustion
2. **Monitor Usage**: Adjust limits based on actual usage
3. **Reserve Resources**: Ensure minimum resources available
4. **Test Limits**: Verify applications work within limits

## Docker Networking Deep Dive

### Network Types

#### Bridge Network (Default)

```yaml
networks:
  iot-network:
    driver: bridge
```

**Characteristics**:
- Default for Docker Compose
- Containers can communicate by name
- Isolated from host network

#### Host Network

```yaml
services:
  flask-api:
    network_mode: host
```

**Characteristics**:
- Uses host network directly
- No port mapping needed
- Less isolation

#### None Network

```yaml
services:
  simulator:
    network_mode: none
```

**Characteristics**:
- No network access
- Maximum isolation
- Rarely used

### Custom Network Configuration

```yaml
networks:
  iot-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
          gateway: 172.20.0.1
```

### Network Inspection

```bash
# List networks
docker network ls

# Inspect network
docker network inspect docker_iot-network

# Test connectivity
docker network connect docker_iot-network container-name
```

## Volume Backup and Restore

### Backup Named Volume

```bash
# Backup InfluxDB data
docker run --rm \
  -v docker_influxdb-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/influxdb-backup-$(date +%Y%m%d).tar.gz -C /data .
```

### Restore Named Volume

```bash
# Restore InfluxDB data
docker run --rm \
  -v docker_influxdb-data:/data \
  -v $(pwd):/backup \
  alpine sh -c "cd /data && tar xzf /backup/influxdb-backup-20241212.tar.gz"
```

### Automated Backup Script

**backup-volumes.sh**:
```bash
#!/bin/bash

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup InfluxDB
docker run --rm \
  -v docker_influxdb-data:/data \
  -v $(pwd)/$BACKUP_DIR:/backup \
  alpine tar czf /backup/influxdb-$DATE.tar.gz -C /data .

# Backup Node-RED
docker run --rm \
  -v docker_node-red-data:/data \
  -v $(pwd)/$BACKUP_DIR:/backup \
  alpine tar czf /backup/nodered-$DATE.tar.gz -C /data .

echo "Backups created in $BACKUP_DIR"
```

### Restore from Backup

**restore-volumes.sh**:
```bash
#!/bin/bash

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup-file.tar.gz>"
  exit 1
fi

# Extract volume name from backup file
VOLUME_NAME=$(echo $BACKUP_FILE | cut -d'-' -f1)

# Restore volume
docker run --rm \
  -v docker_${VOLUME_NAME}-data:/data \
  -v $(pwd):/backup \
  alpine sh -c "cd /data && tar xzf /backup/$BACKUP_FILE"
```

## Image Optimization Techniques

### 1. Use Minimal Base Images

**Bad**:
```dockerfile
FROM ubuntu:latest
# ~200MB base
```

**Good**:
```dockerfile
FROM python:3.11-slim
# ~120MB base
```

**Better**:
```dockerfile
FROM python:3.11-alpine
# ~45MB base
```

### 2. Combine RUN Commands

**Bad**:
```dockerfile
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y wget
RUN rm -rf /var/lib/apt/lists/*
```

**Good**:
```dockerfile
RUN apt-get update && \
    apt-get install -y curl wget && \
    rm -rf /var/lib/apt/lists/*
```

### 3. Use .dockerignore

**Create .dockerignore**:
```
__pycache__
*.pyc
.git
.env
*.md
node_modules
.DS_Store
```

**Benefits**: Smaller build context, faster builds

### 4. Order Instructions by Change Frequency

**Bad**:
```dockerfile
COPY . .
RUN pip install -r requirements.txt
```

**Good**:
```dockerfile
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
```

### 5. Remove Unnecessary Files

```dockerfile
RUN apt-get update && \
    apt-get install -y curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
```

### 6. Use Multi-Stage Builds

See [Multi-Stage Builds](#multi-stage-builds) section above.

### 7. Leverage Layer Caching

Order instructions from least to most frequently changing:
1. Base image
2. System packages
3. Dependencies
4. Application code

## Security Hardening

### 1. Use Non-Root User

```dockerfile
FROM python:3.11-slim

RUN useradd -m -u 1000 appuser
USER appuser

WORKDIR /app
COPY . .
CMD ["python", "app.py"]
```

### 2. Scan Images for Vulnerabilities

```bash
# Docker Scout (built-in)
docker scout quickview my-image:latest

# Trivy
trivy image my-image:latest

# Snyk
snyk test --docker my-image:latest
```

### 3. Keep Base Images Updated

```dockerfile
# Use specific, recent versions
FROM python:3.11-slim

# Regularly update
FROM python:3.11.5-slim
```

### 4. Minimize Attack Surface

- Use minimal base images
- Install only necessary packages
- Remove build tools from final image
- Use multi-stage builds

### 5. Don't Store Secrets in Images

**Bad**:
```dockerfile
ENV API_KEY=secret123
```

**Good**:
```yaml
# docker-compose.yml
services:
  flask-api:
    environment:
      - API_KEY=${API_KEY}
```

### 6. Use Read-Only Root Filesystem

```yaml
services:
  flask-api:
    read_only: true
    tmpfs:
      - /tmp
      - /var/tmp
```

### 7. Limit Container Capabilities

```yaml
services:
  flask-api:
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
```

### 8. Use Security Profiles

```yaml
services:
  flask-api:
    security_opt:
      - no-new-privileges:true
```

## Key Takeaways

1. **Multi-stage builds** reduce image size
2. **Build arguments** enable flexible builds
3. **Override files** support multiple environments
4. **Resource limits** prevent resource exhaustion
5. **Network configuration** affects connectivity
6. **Volume backups** protect data
7. **Image optimization** improves performance
8. **Security hardening** reduces vulnerabilities

## Next Steps

Now that you understand advanced topics, proceed to:
- [Chapter 9: Troubleshooting and Best Practices](09-troubleshooting.md) - Common issues and solutions

## Exercises

1. **Convert Flask API Dockerfile** to use multi-stage builds
2. **Create docker-compose.override.yml** for development
3. **Set resource limits** for all services
4. **Create backup script** for all volumes
5. **Scan images** for vulnerabilities
6. **Optimize images** using techniques from this chapter

