# Workshop 07: IoT Device Simulator

## Objectives

By the end of this workshop, you will be able to:
- Understand IoT device simulation
- Create simulated sensor devices
- Generate realistic sensor data
- Visualize simulator data in real-time
- Integrate simulator with the complete platform

## Prerequisites

- Completed Workshop 06
- All Docker services running
- Understanding of MQTT and InfluxDB

## Part 1: Understanding Device Simulation

### Why Simulate Devices?

- Testing without physical hardware
- Generating test data
- Demonstrating system capabilities
- Learning IoT concepts

### Simulator Components

- **Device Classes**: Represent different sensor types
- **Data Generation**: Create realistic sensor readings
- **Publishing**: Send data via MQTT
- **Storage**: Save data to InfluxDB

## Part 2: Running the Simulator

### Starting the Simulator

The simulator is included in Docker Compose and runs automatically. You can also run it manually:

```bash
cd simulator
python iot_simulator.py
```

### Simulator Configuration

The simulator includes:
- Temperature sensors (2 devices)
- Humidity sensors (2 devices)
- Smart switches (2 devices)

All devices publish data every 5 seconds.

## Part 3: Understanding Simulator Code

### Device Structure

Each device has:
- `device_id`: Unique identifier
- `device_type`: Type of sensor
- `location`: Physical location
- `read()`: Method to generate data

### Exercise: Examine Device Classes

Look at the device implementations:
- `simulator/devices/temperature_sensor.py`
- `simulator/devices/humidity_sensor.py`
- `simulator/devices/smart_switch.py`

### Exercise: Modify Device Behavior

Create a custom device:

```python
# workshop/code/workshop-07/custom_sensor.py
import random
from datetime import datetime

class CustomSensor:
    def __init__(self, device_id, location):
        self.device_id = device_id
        self.location = location
        self.device_type = "custom"
        self.base_value = 50.0
        
    def read(self):
        value = self.base_value + random.uniform(-10, 10)
        return {
            "value": round(value, 2),
            "unit": "units",
            "location": self.location,
            "timestamp": datetime.utcnow().isoformat()
        }
```

## Part 4: Real-Time Visualization

### Exercise: Visualize Simulator Data

Create `workshop/code/workshop-07/visualize_simulator_data.py`:

```python
import paho.mqtt.client as mqtt
import json
from datetime import datetime
import matplotlib.pyplot as plt
from collections import deque
import time

# Data storage
temperature_data = deque(maxlen=100)
humidity_data = deque(maxlen=100)
timestamps = deque(maxlen=100)

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT broker!")
        client.subscribe("sensors/+/+")
    else:
        print(f"Failed to connect: {rc}")

def on_message(client, userdata, msg):
    try:
        topic_parts = msg.topic.split('/')
        device_type = topic_parts[1] if len(topic_parts) > 1 else "unknown"
        
        data = json.loads(msg.payload.decode())
        value = data.get('value', 0)
        timestamp = datetime.now()
        
        if device_type == "temperature":
            temperature_data.append(value)
            timestamps.append(timestamp)
            print(f"Temperature: {value}°C")
        elif device_type == "humidity":
            humidity_data.append(value)
            print(f"Humidity: {value}%")
            
    except Exception as e:
        print(f"Error: {e}")

# Setup MQTT
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
client.connect("localhost", 1883, 60)

print("Listening for simulator data...")
print("Press Ctrl+C to stop")

try:
    client.loop_start()
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("\nStopping...")
    client.loop_stop()
    client.disconnect()
```

## Part 5: Creating Custom Simulators

### Exercise: Advanced Simulator

Create `workshop/code/workshop-07/advanced_simulator.py`:

```python
import time
import random
import json
from datetime import datetime
import paho.mqtt.client as mqtt
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
import os
from dotenv import load_dotenv

load_dotenv()

class AdvancedSimulator:
    def __init__(self):
        self.mqtt_client = None
        self.influx_client = None
        self.setup_connections()
        
    def setup_connections(self):
        # MQTT
        self.mqtt_client = mqtt.Client()
        self.mqtt_client.connect("localhost", 1883, 60)
        self.mqtt_client.loop_start()
        
        # InfluxDB
        self.influx_client = InfluxDBClient(
            url=os.getenv("INFLUXDB_URL", "http://localhost:8086"),
            token=os.getenv("INFLUXDB_TOKEN", "my-super-secret-auth-token"),
            org=os.getenv("INFLUXDB_ORG", "iot-org")
        )
        self.write_api = self.influx_client.write_api(write_options=SYNCHRONOUS)
    
    def simulate_temperature(self, device_id, location, base_temp=20.0):
        """Simulate temperature with daily cycle"""
        import math
        hour = datetime.now().hour
        # Simulate daily temperature cycle
        daily_variation = 5 * math.sin((hour - 6) * math.pi / 12)
        noise = random.uniform(-2, 2)
        temperature = base_temp + daily_variation + noise
        
        data = {
            "value": round(temperature, 2),
            "unit": "celsius",
            "location": location,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Publish to MQTT
        topic = f"sensors/temperature/{device_id}"
        self.mqtt_client.publish(topic, json.dumps(data))
        
        # Write to InfluxDB
        point = Point("temperature") \
            .tag("device_id", device_id) \
            .tag("location", location) \
            .field("value", temperature) \
            .time(datetime.utcnow())
        
        self.write_api.write(
            bucket=os.getenv("INFLUXDB_BUCKET", "iot-data"),
            org=os.getenv("INFLUXDB_ORG", "iot-org"),
            record=point
        )
        
        return data
    
    def run(self, interval=5):
        """Run simulator"""
        devices = [
            ("temp-001", "living-room", 22.0),
            ("temp-002", "bedroom", 20.0),
            ("temp-003", "kitchen", 21.0),
        ]
        
        print("Starting advanced simulator...")
        try:
            while True:
                for device_id, location, base_temp in devices:
                    data = self.simulate_temperature(device_id, location, base_temp)
                    print(f"{device_id}: {data['value']}°C")
                time.sleep(interval)
        except KeyboardInterrupt:
            print("\nStopping simulator...")
            self.mqtt_client.loop_stop()
            self.mqtt_client.disconnect()
            self.influx_client.close()

if __name__ == "__main__":
    simulator = AdvancedSimulator()
    simulator.run()
```

## Part 6: Viewing Data in Grafana

### Real-Time Dashboard

1. Open Grafana: http://localhost:3000
2. Go to "Explore"
3. Select InfluxDB datasource
4. Query:
   ```flux
   from(bucket: "iot-data")
     |> range(start: -5m)
     |> filter(fn: (r) => r["_measurement"] == "temperature")
   ```
5. Watch data update in real-time

### Node-RED Dashboard

1. Open Node-RED: http://localhost:1880
2. Check the pre-configured dashboard
3. Data should appear automatically from simulator

## Part 7: Practical Exercise

### Task: Complete Simulator System

Create a system that:
1. Simulates 5 different device types
2. Publishes to MQTT with different intervals
3. Stores all data in InfluxDB
4. Displays in Grafana dashboard
5. Shows in Node-RED dashboard
6. Handles errors gracefully

## Troubleshooting

### Simulator Not Publishing
- Check MQTT broker is running
- Verify connection settings
- Check network connectivity

### Data Not Appearing
- Verify InfluxDB is running
- Check bucket and organization
- Verify token is correct

### Performance Issues
- Reduce publish frequency
- Limit data points
- Optimize queries

## Next Steps

- Workshop 08: Home Automation - Use simulator data for automation
- Workshop 10: Capstone Project - Complete system integration

## Summary

In this workshop, you:
- ✅ Understood device simulation
- ✅ Ran the IoT simulator
- ✅ Created custom devices
- ✅ Visualized data in real-time
- ✅ Integrated with the platform

You can now simulate IoT devices and generate test data!

