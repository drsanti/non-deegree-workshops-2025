# Workshop 04: REST API Integration

## Objectives

By the end of this workshop, you will be able to:
- Understand REST API concepts
- Interact with the Flask API using Python
- Make HTTP requests (GET, POST, PUT, DELETE)
- Handle API responses and errors
- Use the API for MQTT and database operations

## Prerequisites

- Completed Workshop 03
- Flask API service running
- Understanding of HTTP methods

## Part 1: Understanding REST APIs

### What is a REST API?

REST (Representational State Transfer) is an architectural style for designing web services. Our Flask API provides endpoints for:
- MQTT operations (publish, subscribe)
- Database operations (write, query)
- Device management

### API Base URL

```
http://localhost:5000
```

### API Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `POST /mqtt/publish` - Publish MQTT message
- `POST /mqtt/subscribe` - Subscribe to MQTT topic
- `POST /database/write` - Write to InfluxDB
- `POST /database/query` - Query InfluxDB
- `GET /devices/list` - List all devices
- `POST /devices/register` - Register device

## Part 2: Making HTTP Requests

### Exercise: Basic API Client

Create `workshop/code/workshop-04/api_client.py`:

```python
import requests
import json

# API Configuration
API_BASE_URL = "http://localhost:5000"

def get_api_info():
    """Get API information"""
    response = requests.get(f"{API_BASE_URL}/")
    return response.json()

def check_health():
    """Check API health"""
    response = requests.get(f"{API_BASE_URL}/health")
    return response.json()

# Test API
print("API Information:")
print(json.dumps(get_api_info(), indent=2))

print("\nHealth Check:")
print(json.dumps(check_health(), indent=2))
```

### Running the Client

```bash
python workshop/code/workshop-04/api_client.py
```

## Part 3: MQTT API Operations

### Exercise: Publish via API

```python
import requests
import json
from datetime import datetime

API_BASE_URL = "http://localhost:5000"

def publish_mqtt_message(topic, message):
    """Publish message via API"""
    url = f"{API_BASE_URL}/mqtt/publish"
    payload = {
        "topic": topic,
        "message": message,
        "qos": 1
    }
    response = requests.post(url, json=payload)
    return response.json()

# Publish temperature data
message = {
    "temperature": 25.5,
    "humidity": 60,
    "timestamp": datetime.now().isoformat(),
    "device_id": "sensor-001"
}

result = publish_mqtt_message("sensors/data", message)
print(f"Published: {result}")
```

## Part 4: Database API Operations

### Exercise: Write to Database via API

```python
import requests
from datetime import datetime

API_BASE_URL = "http://localhost:5000"

def write_to_database(measurement, fields, tags=None):
    """Write data to InfluxDB via API"""
    url = f"{API_BASE_URL}/database/write"
    payload = {
        "measurement": measurement,
        "fields": fields,
        "tags": tags or {}
    }
    response = requests.post(url, json=payload)
    return response.json()

# Write temperature data
result = write_to_database(
    measurement="temperature",
    fields={"value": 25.5, "unit": "celsius"},
    tags={"device_id": "temp-001", "location": "living-room"}
)
print(f"Written: {result}")
```

### Exercise: Query Database via API

```python
import requests

API_BASE_URL = "http://localhost:5000"

def query_database(flux_query):
    """Query InfluxDB via API"""
    url = f"{API_BASE_URL}/database/query"
    payload = {"query": flux_query}
    response = requests.post(url, json=payload)
    return response.json()

# Query last hour of temperature data
query = '''
from(bucket: "iot-data")
  |> range(start: -1h)
  |> filter(fn: (r) => r["_measurement"] == "temperature")
  |> filter(fn: (r) => r["_field"] == "value")
'''

result = query_database(query)
print(f"Query Results: {len(result['results'])} records")
for record in result['results'][:5]:  # Show first 5
    print(record)
```

## Part 5: Device Management API

### Exercise: Device Operations

Create `workshop/code/workshop-04/api_examples.py`:

```python
import requests
import json

API_BASE_URL = "http://localhost:5000"

def register_device(device_id, device_type, device_name=None):
    """Register a new device"""
    url = f"{API_BASE_URL}/devices/register"
    payload = {
        "device_id": device_id,
        "device_type": device_type,
        "device_name": device_name or device_id
    }
    response = requests.post(url, json=payload)
    return response.json()

def list_devices():
    """List all devices"""
    url = f"{API_BASE_URL}/devices/list"
    response = requests.get(url)
    return response.json()

def get_device(device_id):
    """Get device information"""
    url = f"{API_BASE_URL}/devices/{device_id}"
    response = requests.get(url)
    return response.json()

def update_device_status(device_id, status):
    """Update device status"""
    url = f"{API_BASE_URL}/devices/{device_id}/status"
    payload = {"status": status}
    response = requests.put(url, json=payload)
    return response.json()

# Example usage
print("Registering devices...")
register_device("temp-001", "temperature", "Living Room Sensor")
register_device("hum-001", "humidity", "Living Room Humidity")

print("\nListing devices...")
devices = list_devices()
print(json.dumps(devices, indent=2))

print("\nGetting device info...")
device = get_device("temp-001")
print(json.dumps(device, indent=2))

print("\nUpdating device status...")
result = update_device_status("temp-001", "active")
print(json.dumps(result, indent=2))
```

## Part 6: Error Handling

### Exercise: Robust API Client

```python
import requests
from requests.exceptions import RequestException

def safe_api_call(method, url, **kwargs):
    """Make API call with error handling"""
    try:
        if method.upper() == "GET":
            response = requests.get(url, **kwargs)
        elif method.upper() == "POST":
            response = requests.post(url, **kwargs)
        elif method.upper() == "PUT":
            response = requests.put(url, **kwargs)
        elif method.upper() == "DELETE":
            response = requests.delete(url, **kwargs)
        else:
            return {"error": "Unsupported method"}
        
        response.raise_for_status()
        return response.json()
    
    except requests.exceptions.HTTPError as e:
        return {"error": f"HTTP Error: {e.response.status_code}", "details": str(e)}
    except requests.exceptions.ConnectionError:
        return {"error": "Connection Error: API not reachable"}
    except requests.exceptions.Timeout:
        return {"error": "Timeout: Request took too long"}
    except RequestException as e:
        return {"error": f"Request Error: {str(e)}"}

# Usage
result = safe_api_call("GET", "http://localhost:5000/health")
print(result)
```

## Part 7: Practical Exercise

### Task: Complete API Integration

Create a script that:
1. Registers multiple devices via API
2. Publishes sensor data via MQTT API
3. Writes data to database via API
4. Queries and displays results
5. Handles all errors gracefully

## Troubleshooting

### Connection Refused
- Check Flask API is running: `docker-compose ps`
- Verify API URL is correct
- Check firewall settings

### 400/500 Errors
- Check request payload format
- Verify required fields are present
- Check API logs: `docker-compose logs flask-api`

### JSON Errors
- Ensure payload is valid JSON
- Use `json.dumps()` for Python dicts
- Set `Content-Type: application/json` header

## Next Steps

- Workshop 05: Node-RED Integration
- Workshop 06: Data Visualization

## Summary

In this workshop, you:
- ✅ Learned REST API concepts
- ✅ Made HTTP requests with Python
- ✅ Used MQTT API endpoints
- ✅ Used database API endpoints
- ✅ Managed devices via API
- ✅ Handled API errors

You can now interact with all services via REST API!

