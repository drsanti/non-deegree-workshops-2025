# Workshop 09: Advanced Topics

## Objectives

By the end of this workshop, you will be able to:
- Implement security best practices
- Optimize system performance
- Scale the platform
- Use advanced Grafana features
- Handle errors and edge cases
- Monitor system health

## Prerequisites

- Completed Workshop 08
- Understanding of all previous concepts
- Basic knowledge of security and performance

## Part 1: Security Best Practices

### MQTT Security

#### Authentication

```python
import paho.mqtt.client as mqtt

# Use username and password
client = mqtt.Client()
client.username_pw_set("username", "password")
client.connect("localhost", 1883, 60)
```

#### TLS/SSL

```python
import ssl

client = mqtt.Client()
client.tls_set(ca_certs="ca.crt", certfile="client.crt", keyfile="client.key")
client.connect("localhost", 8883, 60)  # Use port 8883 for SSL
```

### API Security

#### API Keys

```python
import requests

headers = {
    "X-API-Key": "your-api-key-here"
}
response = requests.get("http://localhost:5000/api/data", headers=headers)
```

#### Rate Limiting

```python
from flask import Flask
from flask_limiter import Limiter

app = Flask(__name__)
limiter = Limiter(app, key_func=lambda: request.remote_addr)

@app.route('/api/data')
@limiter.limit("10 per minute")
def get_data():
    return {"data": "..."}
```

### Data Encryption

```python
from cryptography.fernet import Fernet

# Generate key
key = Fernet.generate_key()
cipher = Fernet(key)

# Encrypt data
encrypted = cipher.encrypt(b"sensitive data")

# Decrypt data
decrypted = cipher.decrypt(encrypted)
```

## Part 2: Performance Optimization

### Database Optimization

#### Batch Writes

```python
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import ASYNCHRONOUS

client = InfluxDBClient(url="...", token="...", org="...")
write_api = client.write_api(write_options=ASYNCHRONOUS)

# Batch multiple points
points = []
for i in range(1000):
    point = Point("measurement").field("value", i)
    points.append(point)

write_api.write(bucket="bucket", org="org", record=points)
```

#### Query Optimization

```flux
// Use specific time ranges
from(bucket: "iot-data")
  |> range(start: -1h)  // Specific range, not -30d

// Filter early
|> filter(fn: (r) => r["_measurement"] == "temperature")
|> filter(fn: (r) => r["device_id"] == "temp-001")

// Use aggregateWindow for large datasets
|> aggregateWindow(every: 5m, fn: mean)
```

### MQTT Optimization

#### QoS Selection

- Use QoS 0 for high-frequency, non-critical data
- Use QoS 1 for important commands
- Use QoS 2 sparingly (highest overhead)

#### Message Batching

```python
import json

# Batch multiple readings
batch = {
    "temperature": 25.5,
    "humidity": 60,
    "pressure": 1013,
    "timestamp": datetime.now().isoformat()
}
client.publish("sensors/batch", json.dumps(batch))
```

## Part 3: Scaling the Platform

### Horizontal Scaling

#### Load Balancing

```yaml
# docker-compose.yml
services:
  flask-api-1:
    # ... configuration
  flask-api-2:
    # ... configuration
  nginx:
    upstream:
      - flask-api-1
      - flask-api-2
```

#### Database Sharding

```python
# Route data to different buckets based on device
def get_bucket(device_id):
    # Simple sharding by device ID
    shard = hash(device_id) % 4
    return f"iot-data-shard-{shard}"
```

### Caching

```python
import redis
import json

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def get_cached_data(key):
    cached = redis_client.get(key)
    if cached:
        return json.loads(cached)
    return None

def cache_data(key, data, ttl=300):
    redis_client.setex(key, ttl, json.dumps(data))
```

## Part 4: Advanced Grafana Features

### Dashboard Variables

Create variables in Grafana:
1. Go to Dashboard Settings → Variables
2. Add variable:
   - Name: `device`
   - Type: Query
   - Query: `SHOW TAG VALUES WITH KEY = "device_id"`
3. Use in queries: `filter(fn: (r) => r["device_id"] == "$device")`

### Transformations

```python
# Apply transformations via API
transformation = {
    "id": "transform",
    "type": "organize",
    "options": {
        "excludeByName": {},
        "indexByName": {},
        "renameByName": {
            "value": "Temperature"
        }
    }
}
```

### Annotations

```python
def create_annotation(text, tags):
    """Create Grafana annotation"""
    annotation = {
        "text": text,
        "tags": tags,
        "time": int(datetime.now().timestamp() * 1000)
    }
    
    response = requests.post(
        f"{GRAFANA_URL}/api/annotations",
        json=annotation,
        auth=("admin", "admin")
    )
    return response.json()
```

## Part 5: Error Handling and Resilience

### Retry Logic

```python
import time
from functools import wraps

def retry(max_attempts=3, delay=1):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise
                    time.sleep(delay * (attempt + 1))
            return None
        return wrapper
    return decorator

@retry(max_attempts=3)
def write_to_database(point):
    write_api.write(bucket="bucket", org="org", record=point)
```

### Circuit Breaker

```python
class CircuitBreaker:
    def __init__(self, failure_threshold=5, timeout=60):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.failures = 0
        self.last_failure_time = None
        self.state = "closed"  # closed, open, half-open
    
    def call(self, func, *args, **kwargs):
        if self.state == "open":
            if time.time() - self.last_failure_time > self.timeout:
                self.state = "half-open"
            else:
                raise Exception("Circuit breaker is open")
        
        try:
            result = func(*args, **kwargs)
            if self.state == "half-open":
                self.state = "closed"
                self.failures = 0
            return result
        except Exception as e:
            self.failures += 1
            self.last_failure_time = time.time()
            if self.failures >= self.failure_threshold:
                self.state = "open"
            raise
```

## Part 6: Monitoring and Health Checks

### Health Check Endpoint

```python
from flask import Flask, jsonify
import paho.mqtt.client as mqtt
from influxdb_client import InfluxDBClient

app = Flask(__name__)

@app.route('/health')
def health_check():
    status = {
        "status": "healthy",
        "checks": {}
    }
    
    # Check MQTT
    try:
        client = mqtt.Client()
        client.connect("localhost", 1883, 10)
        client.disconnect()
        status["checks"]["mqtt"] = "ok"
    except:
        status["checks"]["mqtt"] = "failed"
        status["status"] = "unhealthy"
    
    # Check InfluxDB
    try:
        client = InfluxDBClient(url="http://localhost:8086", token="...")
        client.ping()
        status["checks"]["influxdb"] = "ok"
    except:
        status["checks"]["influxdb"] = "failed"
        status["status"] = "unhealthy"
    
    return jsonify(status), 200 if status["status"] == "healthy" else 503
```

### Metrics Collection

```python
from prometheus_client import Counter, Histogram, start_http_server

# Define metrics
mqtt_messages = Counter('mqtt_messages_total', 'Total MQTT messages', ['topic'])
db_write_duration = Histogram('db_write_duration_seconds', 'Database write duration')

# Use metrics
mqtt_messages.labels(topic='sensors/temperature').inc()

with db_write_duration.time():
    write_to_database(point)
```

## Part 7: Practical Exercise

### Task: Optimize and Secure System

1. Add authentication to MQTT
2. Implement API rate limiting
3. Add caching layer
4. Optimize database queries
5. Add health checks
6. Implement error handling
7. Set up monitoring

## Troubleshooting

### Performance Issues
- Profile code to find bottlenecks
- Optimize database queries
- Use caching
- Scale horizontally

### Security Concerns
- Use TLS for all connections
- Implement authentication
- Encrypt sensitive data
- Regular security audits

## Next Steps

- Workshop 10: Capstone Project - Apply all concepts

## Summary

In this workshop, you:
- ✅ Implemented security best practices
- ✅ Optimized system performance
- ✅ Learned scaling techniques
- ✅ Used advanced Grafana features
- ✅ Added error handling
- ✅ Set up monitoring

You're now ready to build production-ready IoT systems!

