#!/usr/bin/env python3
"""
Workshop 07: Visualize Simulator Data
Visualize real-time simulator data
"""

import paho.mqtt.client as mqtt
import json
from datetime import datetime

MQTT_BROKER = "localhost"
MQTT_PORT = 1883
TOPIC = "sensors/+/+"

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✓ Connected to MQTT broker!")
        client.subscribe(TOPIC)
        print(f"✓ Subscribed to: {TOPIC}")
        print("\nListening for simulator data...")
        print("Open Grafana or Node-RED Dashboard to visualize")
        print("-" * 60)
    else:
        print(f"✗ Failed to connect: {rc}")

def on_message(client, userdata, msg):
    try:
        data = json.loads(msg.payload.decode())
        topic_parts = msg.topic.split('/')
        device_type = topic_parts[1] if len(topic_parts) > 1 else "unknown"
        
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {device_type}: {data.get('value', 'N/A')}")
    except Exception as e:
        print(f"Error: {e}")

def main():
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    
    try:
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        client.loop_forever()
    except KeyboardInterrupt:
        print("\nStopping...")
        client.disconnect()

if __name__ == "__main__":
    main()

