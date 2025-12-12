# Workshop 03: Database Operations with InfluxDB

## Objectives

By the end of this workshop, you will be able to:
- Understand time-series databases
- Write data to InfluxDB
- Query data from InfluxDB using Flux
- View data in Grafana
- Integrate MQTT data with InfluxDB

## Prerequisites

- Completed Workshop 02
- InfluxDB service running
- Grafana service running

## Part 1: Understanding InfluxDB

### What is InfluxDB?

InfluxDB is a time-series database optimized for storing and querying time-stamped data, perfect for IoT applications.

### Key Concepts

- **Bucket**: Similar to a database (contains measurements)
- **Measurement**: Similar to a table (e.g., "temperature", "humidity")
- **Point**: A single data record with:
  - **Tags**: Indexed metadata (e.g., device_id, location)
  - **Fields**: Actual values (e.g., temperature value)
  - **Timestamp**: When the data was recorded

### Example Data Structure

```
Measurement: temperature
Tags: device_id=temp-001, location=living-room
Fields: value=25.5
Timestamp: 2024-01-15T10:30:00Z
```

## Part 2: Writing Data to InfluxDB

### Exercise: Basic Write Operation

Create `workshop/code/workshop-03/influxdb_write.py`:

```python
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# InfluxDB Configuration
URL = os.getenv("INFLUXDB_URL", "http://localhost:8086")
TOKEN = os.getenv("INFLUXDB_TOKEN", "my-super-secret-auth-token")
ORG = os.getenv("INFLUXDB_ORG", "iot-org")
BUCKET = os.getenv("INFLUXDB_BUCKET", "iot-data")

# Create client
client = InfluxDBClient(url=URL, token=TOKEN, org=ORG)
write_api = client.write_api(write_options=SYNCHRONOUS)

# Create a data point
point = Point("temperature") \
    .tag("device_id", "temp-001") \
    .tag("location", "living-room") \
    .field("value", 25.5) \
    .field("unit", "celsius") \
    .time(datetime.utcnow())

# Write to InfluxDB
write_api.write(bucket=BUCKET, org=ORG, record=point)
print(f"Data written: {point}")

# Write multiple points
points = []
for i in range(10):
    point = Point("temperature") \
        .tag("device_id", f"temp-{i:03d}") \
        .tag("location", "room-1") \
        .field("value", 20 + i * 0.5) \
        .time(datetime.utcnow())
    points.append(point)

write_api.write(bucket=BUCKET, org=ORG, record=points)
print(f"Written {len(points)} data points")

# Close client
client.close()
```

### Running the Write Script

```bash
python workshop/code/workshop-03/influxdb_write.py
```

## Part 3: Querying Data from InfluxDB

### Understanding Flux

Flux is InfluxDB's query language. Basic structure:

```flux
from(bucket: "iot-data")
  |> range(start: -1h)
  |> filter(fn: (r) => r["_measurement"] == "temperature")
  |> filter(fn: (r) => r["_field"] == "value")
```

### Exercise: Query Operations

Create `workshop/code/workshop-03/influxdb_query.py`:

```python
from influxdb_client import InfluxDBClient
import os
from dotenv import load_dotenv

load_dotenv()

# InfluxDB Configuration
URL = os.getenv("INFLUXDB_URL", "http://localhost:8086")
TOKEN = os.getenv("INFLUXDB_TOKEN", "my-super-secret-auth-token")
ORG = os.getenv("INFLUXDB_ORG", "iot-org")
BUCKET = os.getenv("INFLUXDB_BUCKET", "iot-data")

# Create client
client = InfluxDBClient(url=URL, token=TOKEN, org=ORG)
query_api = client.query_api()

# Query 1: Get all temperature data from last hour
query = f'''
from(bucket: "{BUCKET}")
  |> range(start: -1h)
  |> filter(fn: (r) => r["_measurement"] == "temperature")
  |> filter(fn: (r) => r["_field"] == "value")
'''

print("Query 1: Temperature data from last hour")
result = query_api.query(org=ORG, query=query)
for table in result:
    for record in table.records:
        print(f"Time: {record.get_time()}, Value: {record.get_value()}, Device: {record.values.get('device_id')}")

# Query 2: Get average temperature by device
query2 = f'''
from(bucket: "{BUCKET}")
  |> range(start: -1h)
  |> filter(fn: (r) => r["_measurement"] == "temperature")
  |> filter(fn: (r) => r["_field"] == "value")
  |> group(columns: ["device_id"])
  |> mean()
'''

print("\nQuery 2: Average temperature by device")
result = query_api.query(org=ORG, query=query2)
for table in result:
    for record in table.records:
        print(f"Device: {record.values.get('device_id')}, Average: {record.get_value()}")

# Query 3: Get latest value for each device
query3 = f'''
from(bucket: "{BUCKET}")
  |> range(start: -24h)
  |> filter(fn: (r) => r["_measurement"] == "temperature")
  |> filter(fn: (r) => r["_field"] == "value")
  |> group(columns: ["device_id"])
  |> last()
'''

print("\nQuery 3: Latest temperature by device")
result = query_api.query(org=ORG, query=query3)
for table in result:
    for record in table.records:
        print(f"Device: {record.values.get('device_id')}, Latest: {record.get_value()}, Time: {record.get_time()}")

# Close client
client.close()
```

### Running the Query Script

```bash
python workshop/code/workshop-03/influxdb_query.py
```

## Part 4: Viewing Data in Grafana

### Accessing Grafana

1. Open Grafana: http://localhost:3000
2. Login: admin / admin
3. Go to "Explore" to run queries
4. Select InfluxDB datasource

### Creating a Simple Dashboard

1. Go to "Dashboards" → "New Dashboard"
2. Add a new panel
3. Select InfluxDB datasource
4. Write a Flux query:
   ```flux
   from(bucket: "iot-data")
     |> range(start: -1h)
     |> filter(fn: (r) => r["_measurement"] == "temperature")
   ```
5. Visualize as time series

### Exercise: View Your Data

Create `workshop/code/workshop-03/visualize_data.py`:

```python
"""
Script to write sample data and view in Grafana
"""
from influxdb_write import write_sample_data
import time

print("Writing sample data to InfluxDB...")
write_sample_data()

print("\nData written! Now:")
print("1. Open Grafana: http://localhost:3000")
print("2. Go to Explore")
print("3. Select InfluxDB datasource")
print("4. Run query: from(bucket: \"iot-data\") |> range(start: -5m)")
```

## Part 5: MQTT to InfluxDB Integration

### Exercise: Store MQTT Messages in InfluxDB

Combine MQTT subscriber with InfluxDB writer:

```python
import paho.mqtt.client as mqtt
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
import json
import os
from dotenv import load_dotenv

load_dotenv()

# MQTT Configuration
MQTT_BROKER = "localhost"
MQTT_PORT = 1883
MQTT_TOPIC = "sensors/+"

# InfluxDB Configuration
INFLUX_URL = os.getenv("INFLUXDB_URL", "http://localhost:8086")
INFLUX_TOKEN = os.getenv("INFLUXDB_TOKEN", "my-super-secret-auth-token")
INFLUX_ORG = os.getenv("INFLUXDB_ORG", "iot-org")
INFLUX_BUCKET = os.getenv("INFLUXDB_BUCKET", "iot-data")

# Setup InfluxDB
influx_client = InfluxDBClient(url=INFLUX_URL, token=INFLUX_TOKEN, org=INFLUX_ORG)
write_api = influx_client.write_api(write_options=SYNCHRONOUS)

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT broker!")
        client.subscribe(MQTT_TOPIC)
    else:
        print(f"Failed to connect: {rc}")

def on_message(client, userdata, msg):
    try:
        data = json.loads(msg.payload.decode())
        
        # Extract measurement from topic (e.g., sensors/temperature -> temperature)
        measurement = msg.topic.split('/')[-1]
        
        # Create InfluxDB point
        point = Point(measurement)
        
        # Add tags
        if 'device_id' in data:
            point.tag("device_id", data['device_id'])
        if 'location' in data:
            point.tag("location", data['location'])
        
        # Add fields
        for key, value in data.items():
            if key not in ['device_id', 'location', 'timestamp']:
                point.field(key, value)
        
        # Write to InfluxDB
        write_api.write(bucket=INFLUX_BUCKET, org=INFLUX_ORG, record=point)
        print(f"Stored: {msg.topic} -> {data}")
        
    except Exception as e:
        print(f"Error processing message: {e}")

# Setup MQTT
mqtt_client = mqtt.Client()
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message
mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
mqtt_client.loop_forever()
```

## Part 6: Practical Exercise

### Task: Data Collection System

Create a system that:
1. Subscribes to multiple MQTT topics
2. Stores all messages in InfluxDB
3. Queries and displays statistics
4. Creates a Grafana dashboard

## Troubleshooting

### Connection Errors
- Verify InfluxDB is running: `docker-compose ps`
- Check token and organization name
- Verify bucket exists

### Query Errors
- Check Flux syntax
- Verify measurement and field names
- Use InfluxDB UI to test queries

### Data Not Appearing
- Check time range in queries
- Verify data was written (check InfluxDB UI)
- Refresh Grafana dashboard

## Next Steps

- Workshop 04: REST API - Create HTTP endpoints
- Workshop 06: Data Visualization - Advanced Grafana features

## Summary

In this workshop, you:
- ✅ Learned InfluxDB concepts
- ✅ Wrote data to InfluxDB
- ✅ Queried data using Flux
- ✅ Viewed data in Grafana
- ✅ Integrated MQTT with InfluxDB

You can now store and retrieve time-series data!

