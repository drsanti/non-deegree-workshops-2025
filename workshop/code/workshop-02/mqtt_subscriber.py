#!/usr/bin/env python3
"""
Workshop 02: MQTT Subscriber
Subscribe to MQTT topics and receive messages
"""

import paho.mqtt.client as mqtt
import json
import os
from dotenv import load_dotenv

load_dotenv()

# MQTT Configuration
BROKER = os.getenv("MQTT_BROKER", "localhost")
PORT = int(os.getenv("MQTT_PORT", 1883))
TOPIC = "sensors/+"  # Subscribe to all sensor topics

def on_connect(client, userdata, flags, rc):
    """Callback when connected to broker"""
    if rc == 0:
        print("✓ Connected to MQTT broker!")
        client.subscribe(TOPIC)
        print(f"✓ Subscribed to: {TOPIC}")
        print("\nWaiting for messages... (Press Ctrl+C to stop)")
        print("-" * 60)
    else:
        print(f"✗ Failed to connect, return code {rc}")

def on_message(client, userdata, msg):
    """Callback when message is received"""
    try:
        # Try to parse as JSON
        payload = json.loads(msg.payload.decode())
        print(f"\nTopic: {msg.topic}")
        print(f"QoS: {msg.qos}")
        print(f"Message: {json.dumps(payload, indent=2)}")
        print("-" * 60)
    except json.JSONDecodeError:
        # If not JSON, print as string
        print(f"\nTopic: {msg.topic}")
        print(f"QoS: {msg.qos}")
        print(f"Message: {msg.payload.decode()}")
        print("-" * 60)

def on_subscribe(client, userdata, mid, granted_qos):
    """Callback when subscription is confirmed"""
    print(f"✓ Subscription confirmed: QoS {granted_qos}")

def main():
    # Create MQTT client
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.on_subscribe = on_subscribe
    
    # Connect to broker
    print(f"Connecting to MQTT broker at {BROKER}:{PORT}...")
    try:
        client.connect(BROKER, PORT, 60)
        client.loop_forever()
    except KeyboardInterrupt:
        print("\n\nStopping subscriber...")
        client.disconnect()
        print("✓ Disconnected")

if __name__ == "__main__":
    main()

