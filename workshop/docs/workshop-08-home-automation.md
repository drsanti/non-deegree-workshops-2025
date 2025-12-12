# Workshop 08: Home Automation

## Objectives

By the end of this workshop, you will be able to:
- Design home automation workflows
- Create automation rules
- Integrate sensors and actuators
- Build automation dashboards
- Monitor automation events
- Handle automation errors

## Prerequisites

- Completed Workshop 07
- All services running
- Understanding of MQTT, InfluxDB, and Node-RED

## Part 1: Home Automation Concepts

### Automation Components

- **Sensors**: Input devices (temperature, humidity, motion)
- **Actuators**: Output devices (switches, lights, HVAC)
- **Rules**: Logic that connects sensors to actuators
- **Dashboard**: Monitor and control automation

### Example Automation Rules

1. **Temperature Control**: If temperature > 25°C, turn on AC
2. **Light Control**: If motion detected, turn on lights
3. **Security**: If door opened, send alert
4. **Energy Saving**: If no motion for 30min, turn off lights

## Part 2: Creating Automation Rules

### Exercise: Temperature-Based Automation

Create `workshop/code/workshop-08/home_automation.py`:

```python
import paho.mqtt.client as mqtt
import json
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

class HomeAutomation:
    def __init__(self):
        self.mqtt_client = None
        self.temperature_threshold = 25.0
        self.humidity_threshold = 70.0
        self.setup_mqtt()
        
    def setup_mqtt(self):
        self.mqtt_client = mqtt.Client()
        self.mqtt_client.on_connect = self.on_connect
        self.mqtt_client.on_message = self.on_message
        self.mqtt_client.connect("localhost", 1883, 60)
        self.mqtt_client.loop_start()
    
    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print("Automation system connected!")
            # Subscribe to sensor topics
            client.subscribe("sensors/temperature/+")
            client.subscribe("sensors/humidity/+")
        else:
            print(f"Failed to connect: {rc}")
    
    def on_message(self, client, userdata, msg):
        try:
            data = json.loads(msg.payload.decode())
            topic_parts = msg.topic.split('/')
            sensor_type = topic_parts[1]
            
            if sensor_type == "temperature":
                self.handle_temperature(data)
            elif sensor_type == "humidity":
                self.handle_humidity(data)
                
        except Exception as e:
            print(f"Error processing message: {e}")
    
    def handle_temperature(self, data):
        """Handle temperature sensor data"""
        temperature = data.get('value', 0)
        location = data.get('location', 'unknown')
        
        print(f"Temperature at {location}: {temperature}°C")
        
        # Rule: If temperature > threshold, turn on AC
        if temperature > self.temperature_threshold:
            self.control_device("ac", location, "on", f"Temperature {temperature}°C exceeds threshold")
        elif temperature < self.temperature_threshold - 2:
            self.control_device("ac", location, "off", f"Temperature {temperature}°C below threshold")
    
    def handle_humidity(self, data):
        """Handle humidity sensor data"""
        humidity = data.get('value', 0)
        location = data.get('location', 'unknown')
        
        print(f"Humidity at {location}: {humidity}%")
        
        # Rule: If humidity > threshold, turn on dehumidifier
        if humidity > self.humidity_threshold:
            self.control_device("dehumidifier", location, "on", f"Humidity {humidity}% exceeds threshold")
    
    def control_device(self, device_type, location, state, reason):
        """Control an actuator device"""
        command = {
            "device_type": device_type,
            "location": location,
            "state": state,
            "reason": reason,
            "timestamp": datetime.now().isoformat()
        }
        
        topic = f"automation/{device_type}/{location}"
        self.mqtt_client.publish(topic, json.dumps(command))
        print(f"Command sent: {device_type} at {location} -> {state} ({reason})")
    
    def run(self):
        """Run automation system"""
        print("Home automation system running...")
        print("Press Ctrl+C to stop")
        try:
            while True:
                import time
                time.sleep(1)
        except KeyboardInterrupt:
            print("\nStopping automation system...")
            self.mqtt_client.loop_stop()
            self.mqtt_client.disconnect()

if __name__ == "__main__":
    automation = HomeAutomation()
    automation.run()
```

## Part 3: Node-RED Automation Flows

### Exercise: Create Automation Flow

1. Open Node-RED: http://localhost:1880
2. Create flow:
   - **mqtt in** → Subscribe to "sensors/temperature/+"
   - **function** → Check threshold
   - **switch** → Route based on condition
   - **mqtt out** → Publish command
   - **ui-text** → Display status

### Flow Example

```json
[
    {
        "id": "temp-sensor",
        "type": "mqtt in",
        "topic": "sensors/temperature/+",
        "name": "Temperature Sensor"
    },
    {
        "id": "check-threshold",
        "type": "function",
        "name": "Check Threshold",
        "func": "if (msg.payload.value > 25) {\n    msg.payload.action = 'turn_on_ac';\n    return msg;\n} else {\n    return null;\n}"
    },
    {
        "id": "control-ac",
        "type": "mqtt out",
        "topic": "automation/ac",
        "name": "Control AC"
    }
]
```

## Part 4: Automation Dashboard

### Exercise: Build Automation Dashboard

Create `workshop/code/workshop-08/automation_dashboard.py`:

```python
import requests
import json
from datetime import datetime
import paho.mqtt.client as mqtt

class AutomationDashboard:
    def __init__(self):
        self.automation_events = []
        self.device_states = {}
        self.setup_mqtt()
    
    def setup_mqtt(self):
        self.mqtt_client = mqtt.Client()
        self.mqtt_client.on_connect = self.on_connect
        self.mqtt_client.on_message = self.on_message
        self.mqtt_client.connect("localhost", 1883, 60)
        self.mqtt_client.loop_start()
    
    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            client.subscribe("automation/#")
            client.subscribe("sensors/#")
    
    def on_message(self, client, userdata, msg):
        try:
            data = json.loads(msg.payload.decode())
            topic = msg.topic
            
            if topic.startswith("automation/"):
                self.handle_automation_event(data)
            elif topic.startswith("sensors/"):
                self.update_sensor_data(topic, data)
                
        except Exception as e:
            print(f"Error: {e}")
    
    def handle_automation_event(self, data):
        """Handle automation events"""
        event = {
            "timestamp": datetime.now().isoformat(),
            "device": data.get("device_type"),
            "location": data.get("location"),
            "action": data.get("state"),
            "reason": data.get("reason")
        }
        self.automation_events.append(event)
        print(f"Automation Event: {event}")
    
    def update_sensor_data(self, topic, data):
        """Update sensor data"""
        topic_parts = topic.split('/')
        sensor_type = topic_parts[1]
        device_id = topic_parts[2] if len(topic_parts) > 2 else "unknown"
        
        key = f"{sensor_type}_{device_id}"
        self.device_states[key] = {
            "value": data.get("value"),
            "timestamp": datetime.now().isoformat()
        }
    
    def get_status(self):
        """Get automation system status"""
        return {
            "events": self.automation_events[-10:],  # Last 10 events
            "devices": self.device_states,
            "timestamp": datetime.now().isoformat()
        }
    
    def run(self):
        """Run dashboard"""
        print("Automation dashboard running...")
        try:
            while True:
                import time
                time.sleep(5)
                status = self.get_status()
                print(f"\nStatus: {len(status['events'])} events, {len(status['devices'])} devices")
        except KeyboardInterrupt:
            print("\nStopping dashboard...")
            self.mqtt_client.loop_stop()
            self.mqtt_client.disconnect()

if __name__ == "__main__":
    dashboard = AutomationDashboard()
    dashboard.run()
```

## Part 5: Advanced Automation Features

### Scheduling

```python
import schedule
import time

def morning_routine():
    """Morning automation routine"""
    # Turn on lights
    # Adjust temperature
    # Start coffee maker
    pass

def evening_routine():
    """Evening automation routine"""
    # Dim lights
    # Lower temperature
    # Activate security
    pass

# Schedule routines
schedule.every().day.at("07:00").do(morning_routine)
schedule.every().day.at("22:00").do(evening_routine)

while True:
    schedule.run_pending()
    time.sleep(60)
```

### Multi-Condition Rules

```python
def complex_rule(temperature, humidity, motion, time_of_day):
    """Complex automation rule"""
    if time_of_day.hour >= 22 or time_of_day.hour < 7:
        # Night mode
        if motion:
            return "turn_on_lights"
        else:
            return "turn_off_lights"
    else:
        # Day mode
        if temperature > 25 and humidity > 70:
            return "turn_on_ac_and_dehumidifier"
        elif temperature < 20:
            return "turn_on_heater"
    
    return "no_action"
```

## Part 6: Monitoring and Logging

### Store Automation Events

```python
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

def log_automation_event(event_type, device, action, reason):
    """Log automation event to InfluxDB"""
    client = InfluxDBClient(
        url="http://localhost:8086",
        token="my-super-secret-auth-token",
        org="iot-org"
    )
    write_api = client.write_api(write_options=SYNCHRONOUS)
    
    point = Point("automation_events") \
        .tag("event_type", event_type) \
        .tag("device", device) \
        .field("action", action) \
        .field("reason", reason) \
        .time(datetime.utcnow())
    
    write_api.write(bucket="iot-data", org="iot-org", record=point)
    client.close()
```

## Part 7: Practical Exercise

### Task: Complete Home Automation System

Create a system with:
1. Multiple automation rules
2. Sensor integration
3. Actuator control
4. Dashboard monitoring
5. Event logging
6. Error handling
7. Scheduling

## Troubleshooting

### Rules Not Triggering
- Check sensor data is being received
- Verify threshold values
- Check MQTT topics match
- Review rule logic

### Devices Not Responding
- Verify actuator topics
- Check device connectivity
- Review command format
- Test manually

### Performance Issues
- Optimize rule evaluation
- Reduce message frequency
- Use efficient data structures

## Next Steps

- Workshop 09: Advanced Topics - Security and optimization
- Workshop 10: Capstone Project - Complete system

## Summary

In this workshop, you:
- ✅ Designed automation workflows
- ✅ Created automation rules
- ✅ Integrated sensors and actuators
- ✅ Built monitoring dashboards
- ✅ Implemented scheduling
- ✅ Added event logging

You can now build complete home automation systems!

