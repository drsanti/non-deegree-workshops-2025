#!/usr/bin/env python3
"""
Workshop 05: Node-RED Integration
Integrate Python with Node-RED flows
"""

import requests
import json
import paho.mqtt.client as mqtt
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

NODE_RED_URL = os.getenv("NODE_RED_URL", "http://localhost:1880")
MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))

def get_flows():
    """Get all Node-RED flows"""
    try:
        url = f"{NODE_RED_URL}/flows"
        response = requests.get(url)
        return response.json()
    except Exception as e:
        return {"error": str(e)}

def send_to_node_red_via_mqtt(topic, data):
    """Send data to Node-RED via MQTT"""
    client = mqtt.Client()
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.publish(topic, json.dumps(data))
    client.disconnect()

def main():
    print("=" * 60)
    print("Node-RED Integration")
    print("=" * 60)
    print(f"Node-RED URL: {NODE_RED_URL}")
    print()
    
    # Get flows
    print("1. Getting Node-RED flows...")
    flows = get_flows()
    if "error" in flows:
        print(f"   ✗ Error: {flows['error']}")
        print("   Make sure Node-RED is running!")
    else:
        print(f"   ✓ Found flows (check Node-RED UI for details)")
    
    print()
    
    # Send data via MQTT
    print("2. Sending data to Node-RED via MQTT...")
    for i in range(5):
        data = {
            "temperature": 20 + i * 0.5,
            "humidity": 50 + i,
            "timestamp": datetime.now().isoformat()
        }
        send_to_node_red_via_mqtt("sensors/dashboard", data)
        print(f"   Sent: {data}")
    
    print()
    print("=" * 60)
    print("Next steps:")
    print("1. Open Node-RED: http://localhost:1880")
    print("2. Check the dashboard at: http://localhost:1880/ui")
    print("3. See dashboard_basics.py for more examples")
    print("=" * 60)

if __name__ == "__main__":
    main()

