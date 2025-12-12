# Chapter 9: Troubleshooting and Best Practices

## Table of Contents

1. [Common Issues and Solutions](#common-issues-and-solutions)
2. [Debugging Strategies](#debugging-strategies)
3. [Log Analysis](#log-analysis)
4. [Network Troubleshooting](#network-troubleshooting)
5. [Volume Issues](#volume-issues)
6. [Performance Optimization](#performance-optimization)
7. [Security Checklist](#security-checklist)
8. [Maintenance Tasks](#maintenance-tasks)
9. [Cleanup Procedures](#cleanup-procedures)

## Common Issues and Solutions

### Issue 1: Port Already in Use

**Error**:
```
Error response from daemon: ports are not available: 
exposing port TCP 0.0.0.0:5000 -> 127.0.0.1:0: 
listen tcp 0.0.0.0:5000: bind: address already in use
```

**Solution 1: Find and Stop Process**

**Linux/Mac**:
```bash
# Find process using port
lsof -i :5000
# or
netstat -tulpn | grep 5000

# Kill process
kill -9 <PID>
```

**Windows**:
```powershell
# Find process using port
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F
```

**Solution 2: Change Port**

```yaml
# docker-compose.yml
services:
  flask-api:
    ports:
      - "5001:5000"  # Changed from 5000:5000
```

### Issue 2: Container Won't Start

**Error**:
```
Container exited with code 1
```

**Debugging Steps**:

1. **Check Logs**:
   ```bash
   docker-compose logs flask-api
   ```

2. **Run Container Interactively**:
   ```bash
   docker-compose run --rm flask-api bash
   ```

3. **Check Environment Variables**:
   ```bash
   docker-compose exec flask-api env
   ```

4. **Verify Dependencies**:
   ```bash
   docker-compose ps
   ```

### Issue 3: Cannot Connect to Service

**Error**:
```
Connection refused
```

**Troubleshooting**:

1. **Check Service is Running**:
   ```bash
   docker-compose ps
   ```

2. **Check Health Status**:
   ```bash
   docker inspect iot-flask-api | grep Health -A 10
   ```

3. **Test from Inside Container**:
   ```bash
   docker-compose exec flask-api curl http://influxdb:8086/health
   ```

4. **Check Network**:
   ```bash
   docker network inspect docker_iot-network
   ```

### Issue 4: Permission Denied

**Error**:
```
Permission denied: /app/data
```

**Solution**:

1. **Check File Permissions**:
   ```bash
   docker-compose exec flask-api ls -la /app
   ```

2. **Fix Permissions in Dockerfile**:
   ```dockerfile
   RUN chown -R appuser:appuser /app
   ```

3. **Use Correct User**:
   ```dockerfile
   USER appuser
   ```

### Issue 5: Out of Disk Space

**Error**:
```
no space left on device
```

**Solution**:

1. **Check Disk Usage**:
   ```bash
   docker system df
   ```

2. **Clean Up**:
   ```bash
   # Remove unused containers, networks, images
   docker system prune -a
   
   # Remove unused volumes
   docker volume prune
   ```

3. **Remove Specific Images**:
   ```bash
   docker rmi $(docker images -q)
   ```

## Debugging Strategies

### Strategy 1: Check Service Status

```bash
# List all services
docker-compose ps

# Check specific service
docker-compose ps flask-api

# Check with details
docker inspect iot-flask-api
```

### Strategy 2: View Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs flask-api

# Follow logs
docker-compose logs -f flask-api

# Last 100 lines
docker-compose logs --tail=100 flask-api

# Since time
docker-compose logs --since 10m flask-api
```

### Strategy 3: Execute Commands in Container

```bash
# Interactive shell
docker-compose exec flask-api bash

# Run command
docker-compose exec flask-api python --version

# Check processes
docker-compose exec flask-api ps aux

# Check network
docker-compose exec flask-api ping emqx
```

### Strategy 4: Inspect Container

```bash
# Full inspection
docker inspect iot-flask-api

# Specific information
docker inspect --format='{{.NetworkSettings.IPAddress}}' iot-flask-api
docker inspect --format='{{.Config.Env}}' iot-flask-api
docker inspect --format='{{.State.Status}}' iot-flask-api
```

### Strategy 5: Test Connectivity

```bash
# From host
curl http://localhost:5000/health

# From container
docker-compose exec flask-api curl http://influxdb:8086/health

# Test MQTT
docker-compose exec flask-api python -c "import paho.mqtt.client as mqtt; c = mqtt.Client(); c.connect('emqx', 1883); print('Connected')"
```

### Strategy 6: Rebuild and Restart

```bash
# Rebuild specific service
docker-compose build --no-cache flask-api

# Restart service
docker-compose restart flask-api

# Recreate service
docker-compose up -d --force-recreate flask-api
```

## Log Analysis

### Understanding Log Formats

**Docker Compose Logs**:
```
iot-flask-api    | 2024-12-12 10:00:00 INFO: Starting Flask application
iot-flask-api    | 2024-12-12 10:00:01 INFO: Connected to MQTT broker
```

**Format**: `container-name | timestamp message`

### Common Log Patterns

**Success Pattern**:
```
✓ Service started successfully
✓ Connected to database
✓ Listening on port 5000
```

**Error Pattern**:
```
✗ Failed to connect
✗ Connection refused
✗ Permission denied
```

### Filtering Logs

```bash
# Filter by keyword
docker-compose logs flask-api | grep ERROR

# Filter by time
docker-compose logs --since 1h flask-api

# Filter and save
docker-compose logs flask-api > flask-api.log
```

### Log Analysis Tools

**Using grep**:
```bash
# Count errors
docker-compose logs flask-api | grep -i error | wc -l

# Find specific error
docker-compose logs flask-api | grep "Connection refused"
```

**Using jq** (for JSON logs):
```bash
docker-compose logs flask-api | jq '.level == "ERROR"'
```

## Network Troubleshooting

### Issue: Containers Can't Communicate

**Check Network**:
```bash
# List networks
docker network ls

# Inspect network
docker network inspect docker_iot-network

# Check connected containers
docker network inspect docker_iot-network | grep -A 5 Containers
```

### Issue: DNS Resolution Fails

**Test DNS**:
```bash
# From container
docker-compose exec flask-api nslookup emqx
docker-compose exec flask-api ping emqx
```

**Solution**: Ensure services are on same network

### Issue: Port Not Accessible

**Check Port Mapping**:
```bash
# List port mappings
docker port iot-flask-api

# Check if port is listening
netstat -tulpn | grep 5000
```

**Test Port**:
```bash
# From host
curl http://localhost:5000/health

# From container
docker-compose exec flask-api curl http://localhost:5000/health
```

### Network Debugging Commands

```bash
# View network configuration
docker network inspect docker_iot-network

# Test connectivity
docker-compose exec flask-api ping -c 3 influxdb

# Check routing
docker-compose exec flask-api ip route

# View network interfaces
docker-compose exec flask-api ip addr
```

## Volume Issues

### Issue: Data Not Persisting

**Check Volume Mount**:
```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect docker_influxdb-data

# Check mount point
docker inspect iot-influxdb | grep -A 10 Mounts
```

### Issue: Permission Denied on Volume

**Solution**:
```bash
# Fix permissions
docker-compose exec influxdb chown -R influxdb:influxdb /var/lib/influxdb2
```

### Issue: Volume Full

**Check Volume Size**:
```bash
# Check disk usage
docker system df -v

# Check specific volume
du -sh $(docker volume inspect docker_influxdb-data | jq -r '.[0].Mountpoint')
```

**Clean Up**:
```bash
# Remove unused volumes
docker volume prune

# Remove specific volume (WARNING: deletes data)
docker volume rm docker_influxdb-data
```

### Backup and Restore

See [Volume Backup and Restore](../08-advanced-topics.md#volume-backup-and-restore) in Chapter 8.

## Performance Optimization

### Identify Performance Issues

**Monitor Resources**:
```bash
# Real-time stats
docker stats

# Specific container
docker stats iot-flask-api

# Historical data
docker stats --no-stream
```

### Optimize Image Size

**Check Image Sizes**:
```bash
docker images

# Sort by size
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | sort -k3 -h
```

**Optimization Techniques**:
- Use multi-stage builds
- Remove unnecessary files
- Use minimal base images
- Combine RUN commands
- Leverage layer caching

See [Image Optimization Techniques](../08-advanced-topics.md#image-optimization-techniques) in Chapter 8.

### Optimize Container Performance

**Set Resource Limits**:
```yaml
services:
  flask-api:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
```

**Monitor and Adjust**:
```bash
# Check actual usage
docker stats iot-flask-api

# Adjust limits based on usage
```

### Optimize Build Performance

**Use Build Cache**:
```bash
# Build with cache
docker-compose build

# Check cache usage
docker system df
```

**Parallel Builds**:
```bash
# Build multiple services in parallel
docker-compose build --parallel
```

## Security Checklist

### Image Security

- [ ] Use minimal base images
- [ ] Keep base images updated
- [ ] Scan images for vulnerabilities
- [ ] Don't store secrets in images
- [ ] Use non-root user
- [ ] Remove unnecessary packages

### Container Security

- [ ] Set resource limits
- [ ] Use read-only root filesystem where possible
- [ ] Drop unnecessary capabilities
- [ ] Use security profiles
- [ ] Enable no-new-privileges
- [ ] Limit network access

### Network Security

- [ ] Use custom networks
- [ ] Don't expose unnecessary ports
- [ ] Use internal networks for service communication
- [ ] Implement network policies

### Secrets Management

- [ ] Don't hardcode secrets
- [ ] Use environment variables
- [ ] Use Docker secrets (Docker Swarm)
- [ ] Rotate secrets regularly
- [ ] Use .env files (add to .gitignore)

### Regular Security Tasks

```bash
# Scan images
docker scout quickview my-image:latest

# Update base images
docker pull python:3.11-slim

# Review running containers
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
```

## Maintenance Tasks

### Daily Tasks

**Check Service Status**:
```bash
docker-compose ps
```

**Monitor Logs**:
```bash
docker-compose logs --tail=50
```

**Check Resource Usage**:
```bash
docker stats --no-stream
```

### Weekly Tasks

**Update Images**:
```bash
# Pull latest base images
docker-compose pull

# Rebuild services
docker-compose build --pull
```

**Clean Up**:
```bash
# Remove unused resources
docker system prune -f
```

**Backup Volumes**:
```bash
# Run backup script
./backup-volumes.sh
```

### Monthly Tasks

**Security Audit**:
```bash
# Scan all images
docker images | awk 'NR>1 {print $1":"$2}' | xargs -I {} docker scout quickview {}
```

**Review Logs**:
```bash
# Archive old logs
docker-compose logs > logs-$(date +%Y%m).log
```

**Update Dependencies**:
```bash
# Update requirements.txt
# Rebuild images
docker-compose build --no-cache
```

### Quarterly Tasks

**Full System Review**:
- Review security checklist
- Update all base images
- Review and optimize resource limits
- Audit network configuration
- Review backup procedures

## Cleanup Procedures

### Remove Stopped Containers

```bash
# Remove all stopped containers
docker container prune

# Remove specific container
docker rm container-name
```

### Remove Unused Images

```bash
# Remove unused images
docker image prune

# Remove all unused images (including tagged)
docker image prune -a

# Remove specific image
docker rmi image-name:tag
```

### Remove Unused Volumes

```bash
# Remove unused volumes
docker volume prune

# WARNING: This removes volumes not used by any container
```

### Remove Unused Networks

```bash
# Remove unused networks
docker network prune
```

### Complete Cleanup

```bash
# Remove everything unused
docker system prune -a --volumes

# WARNING: This removes:
# - All stopped containers
# - All unused networks
# - All unused images
# - All unused volumes
# - All build cache
```

### Selective Cleanup

**Remove Old Images**:
```bash
# Remove images older than 24 hours
docker image prune -a --filter "until=24h"
```

**Remove Specific Tag**:
```bash
# Remove all but latest
docker images | grep my-image | grep -v latest | awk '{print $3}' | xargs docker rmi
```

### Cleanup Script

**cleanup.sh**:
```bash
#!/bin/bash

echo "Cleaning up Docker resources..."

# Remove stopped containers
echo "Removing stopped containers..."
docker container prune -f

# Remove unused images
echo "Removing unused images..."
docker image prune -f

# Remove unused volumes (be careful!)
echo "Removing unused volumes..."
read -p "Remove unused volumes? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker volume prune -f
fi

# Remove build cache
echo "Removing build cache..."
docker builder prune -f

# Show disk usage
echo "Current disk usage:"
docker system df
```

## Best Practices Summary

### Development

1. **Use bind mounts** for code during development
2. **Enable hot reload** for faster iteration
3. **Use override files** for environment-specific configs
4. **Keep logs visible** during development
5. **Test locally** before pushing images

### Production

1. **Use published images** from registry
2. **Set resource limits** to prevent resource exhaustion
3. **Enable health checks** for all services
4. **Use restart policies** for automatic recovery
5. **Monitor logs** and set up alerting
6. **Regular backups** of volumes
7. **Security scanning** of images
8. **Keep images updated** with security patches

### General

1. **Document everything** in Dockerfiles and compose files
2. **Version control** all configuration files
3. **Test changes** in development first
4. **Monitor resource usage** regularly
5. **Clean up** unused resources periodically
6. **Keep backups** of important data
7. **Review logs** for errors and warnings
8. **Update dependencies** regularly

## Key Takeaways

1. **Check logs first** when troubleshooting
2. **Verify service status** before investigating
3. **Test connectivity** from multiple angles
4. **Use debugging commands** to inspect containers
5. **Clean up regularly** to prevent issues
6. **Monitor resources** to catch problems early
7. **Follow security best practices** always
8. **Document solutions** for future reference

## Next Steps

Now that you've completed all chapters:

1. **Review** all chapters and practice the concepts
2. **Build** your own Docker images
3. **Deploy** the IoT platform using Docker
4. **Experiment** with different configurations
5. **Share** your images on Docker Hub or GHCR

## Additional Resources

- [Docker Official Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Security](https://docs.docker.com/engine/security/)

## Exercises

1. **Troubleshoot** a deliberately broken Docker setup
2. **Create a cleanup script** for your system
3. **Set up monitoring** for all services
4. **Perform a security audit** of your images
5. **Create backup procedures** for all volumes
6. **Document** common issues and solutions for your team

