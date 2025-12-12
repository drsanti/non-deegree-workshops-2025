#!/usr/bin/env python3
"""
Workshop 02: MQTT Publisher
Publish messages to MQTT topics
"""

import paho.mqtt.client as mqtt
import json
import time
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# MQTT Configuration
BROKER = os.getenv("MQTT_BROKER", "localhost")
PORT = int(os.getenv("MQTT_PORT", 1883))
TOPIC = "sensors/temperature"

def on_connect(client, userdata, flags, rc):
    """Callback when connected to broker"""
    if rc == 0:
        print("✓ Connected to MQTT broker!")
    else:
        print(f"✗ Failed to connect, return code {rc}")

def on_publish(client, userdata, mid):
    """Callback when message is published"""
    print(f"  Message published: {mid}")

def main():
    # Create MQTT client
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_publish = on_publish
    
    # Connect to broker
    print(f"Connecting to MQTT broker at {BROKER}:{PORT}...")
    client.connect(BROKER, PORT, 60)
    client.loop_start()
    
    # Wait for connection
    time.sleep(1)
    
    # Publish messages
    print(f"\nPublishing messages to topic: {TOPIC}")
    print("-" * 50)
    
    for i in range(10):
        message = {
            "temperature": 20 + i * 0.5,
            "timestamp": datetime.now().isoformat(),
            "sensor_id": "temp-001",
            "unit": "celsius"
        }
        
        result = client.publish(TOPIC, json.dumps(message), qos=1)
        
        if result.rc == mqtt.MQTT_ERR_SUCCESS:
            print(f"[{i+1}] Published: {message}")
        else:
            print(f"[{i+1}] Failed to publish")
        
        time.sleep(1)
    
    # Disconnect
    client.loop_stop()
    client.disconnect()
    print("\n✓ Disconnected from broker")

if __name__ == "__main__":
    main()

