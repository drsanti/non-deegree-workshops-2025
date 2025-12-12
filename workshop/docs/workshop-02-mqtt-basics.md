# Workshop 02: MQTT Basics

## Objectives

By the end of this workshop, you will be able to:
- Understand MQTT protocol fundamentals
- Publish messages to MQTT topics
- Subscribe to MQTT topics and receive messages
- Use MQTT with Python's paho-mqtt library
- Handle MQTT callbacks and events

## Prerequisites

- Completed Workshop 01
- Docker services running (especially EMQX)
- Python virtual environment activated

## Part 1: Understanding MQTT

### What is MQTT?

MQTT (Message Queuing Telemetry Transport) is a lightweight messaging protocol designed for IoT devices. It uses a publish-subscribe pattern where:

- **Publishers** send messages to topics
- **Subscribers** receive messages from topics they're subscribed to
- **Broker** (EMQX) routes messages between publishers and subscribers

### MQTT Concepts

- **Topic**: A hierarchical string (e.g., `sensors/temperature/living-room`)
- **QoS (Quality of Service)**: Message delivery guarantee (0, 1, or 2)
- **Retain**: Keep last message on topic
- **Will Message**: Message sent if client disconnects unexpectedly

## Part 2: MQTT Publisher

### Exercise: Simple Publisher

Create `workshop/code/workshop-02/mqtt_publisher.py`:

```python
import paho.mqtt.client as mqtt
import json
import time
from datetime import datetime

# MQTT Configuration
BROKER = "localhost"
PORT = 1883
TOPIC = "sensors/temperature"

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT broker!")
    else:
        print(f"Failed to connect, return code {rc}")

def on_publish(client, userdata, mid):
    print(f"Message published: {mid}")

# Create client
client = mqtt.Client()
client.on_connect = on_connect
client.on_publish = on_publish

# Connect to broker
client.connect(BROKER, PORT, 60)
client.loop_start()

# Publish messages
for i in range(10):
    message = {
        "temperature": 20 + i,
        "timestamp": datetime.now().isoformat(),
        "sensor_id": "temp-001"
    }
    result = client.publish(TOPIC, json.dumps(message))
    print(f"Published: {message}")
    time.sleep(1)

client.loop_stop()
client.disconnect()
```

### Running the Publisher

```bash
python workshop/code/workshop-02/mqtt_publisher.py
```

## Part 3: MQTT Subscriber

### Exercise: Simple Subscriber

Create `workshop/code/workshop-02/mqtt_subscriber.py`:

```python
import paho.mqtt.client as mqtt
import json

# MQTT Configuration
BROKER = "localhost"
PORT = 1883
TOPIC = "sensors/+"

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT broker!")
        client.subscribe(TOPIC)
        print(f"Subscribed to: {TOPIC}")
    else:
        print(f"Failed to connect, return code {rc}")

def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
        print(f"Topic: {msg.topic}")
        print(f"Message: {payload}")
        print("-" * 50)
    except json.JSONDecodeError:
        print(f"Topic: {msg.topic}")
        print(f"Message: {msg.payload.decode()}")
        print("-" * 50)

# Create client
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

# Connect to broker
client.connect(BROKER, PORT, 60)
client.loop_forever()
```

### Running the Subscriber

```bash
python workshop/code/workshop-02/mqtt_subscriber.py
```

## Part 4: Advanced MQTT Features

### QoS Levels

- **QoS 0**: At most once (fire and forget)
- **QoS 1**: At least once (guaranteed delivery)
- **QoS 2**: Exactly once (guaranteed, no duplicates)

### Wildcards

- `+`: Single-level wildcard (e.g., `sensors/+/temperature`)
- `#`: Multi-level wildcard (e.g., `sensors/#`)

### Retained Messages

```python
client.publish(TOPIC, message, retain=True)
```

### Last Will and Testament

```python
client.will_set("device/status", "offline", qos=1, retain=True)
```

## Part 5: Practical Exercise

### Task: Temperature Monitoring System

Create a system that:
1. Publishes temperature readings every 5 seconds
2. Subscribes to temperature topics
3. Displays received messages with formatting

**Hints:**
- Use multiple topics: `sensors/temperature/room1`, `sensors/temperature/room2`
- Add error handling
- Use QoS 1 for reliable delivery
- Format output nicely

## Part 6: Testing with EMQX Dashboard

1. Open EMQX Dashboard: http://localhost:18083
2. Login: admin / public
3. Go to "WebSocket" or "Tools" → "MQTT Client"
4. Subscribe to topics and see messages in real-time

## Troubleshooting

### Connection Refused
- Check EMQX is running: `docker-compose ps`
- Verify broker address and port
- Check firewall settings

### Messages Not Received
- Verify subscription topic matches publication topic
- Check QoS levels match
- Ensure client is connected before publishing

### JSON Decode Errors
- Validate JSON format before publishing
- Handle non-JSON messages in subscriber

## Next Steps

- Workshop 03: Database Operations - Store MQTT data in InfluxDB
- Workshop 04: REST API - Create HTTP endpoints for MQTT operations

## Summary

In this workshop, you:
- ✅ Learned MQTT protocol fundamentals
- ✅ Created MQTT publishers and subscribers
- ✅ Used paho-mqtt library
- ✅ Handled MQTT callbacks
- ✅ Tested with EMQX dashboard

You can now send and receive messages via MQTT!

