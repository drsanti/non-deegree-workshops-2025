#!/usr/bin/env python3
"""
Workshop 04: API Examples
Examples of using Flask API endpoints
"""

import requests
import json
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

API_BASE_URL = os.getenv("FLASK_API_URL", "http://localhost:5000")

def publish_mqtt(topic, message):
    """Publish message via MQTT API"""
    url = f"{API_BASE_URL}/mqtt/publish"
    payload = {
        "topic": topic,
        "message": message,
        "qos": 1
    }
    response = requests.post(url, json=payload)
    return response.json()

def write_to_database(measurement, fields, tags=None):
    """Write to InfluxDB via API"""
    url = f"{API_BASE_URL}/database/write"
    payload = {
        "measurement": measurement,
        "fields": fields,
        "tags": tags or {}
    }
    response = requests.post(url, json=payload)
    return response.json()

def query_database(flux_query):
    """Query InfluxDB via API"""
    url = f"{API_BASE_URL}/database/query"
    payload = {"query": flux_query}
    response = requests.post(url, json=payload)
    return response.json()

def register_device(device_id, device_type, device_name=None):
    """Register device via API"""
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

def main():
    print("=" * 60)
    print("API Examples")
    print("=" * 60)
    print()
    
    # Example 1: Publish MQTT message
    print("Example 1: Publishing MQTT message...")
    message = {
        "temperature": 25.5,
        "humidity": 60,
        "timestamp": datetime.now().isoformat(),
        "device_id": "sensor-001"
    }
    result = publish_mqtt("sensors/data", message)
    print(json.dumps(result, indent=2))
    print()
    
    # Example 2: Write to database
    print("Example 2: Writing to database...")
    result = write_to_database(
        measurement="temperature",
        fields={"value": 25.5, "unit": "celsius"},
        tags={"device_id": "temp-001", "location": "living-room"}
    )
    print(json.dumps(result, indent=2))
    print()
    
    # Example 3: Query database
    print("Example 3: Querying database...")
    query = '''
    from(bucket: "iot-data")
      |> range(start: -1h)
      |> filter(fn: (r) => r["_measurement"] == "temperature")
      |> filter(fn: (r) => r["_field"] == "value")
      |> limit(n: 5)
    '''
    result = query_database(query)
    print(f"Found {result.get('count', 0)} records")
    if result.get('results'):
        for record in result['results'][:3]:
            print(f"  - {record}")
    print()
    
    # Example 4: Device management
    print("Example 4: Registering devices...")
    register_device("temp-001", "temperature", "Living Room Sensor")
    register_device("hum-001", "humidity", "Living Room Humidity")
    
    devices = list_devices()
    print(f"Registered devices: {devices.get('count', 0)}")
    for device in devices.get('devices', [])[:3]:
        print(f"  - {device.get('device_id')}: {device.get('device_type')}")
    
    print()
    print("=" * 60)
    print("✓ All examples completed!")
    print("=" * 60)

if __name__ == "__main__":
    main()

