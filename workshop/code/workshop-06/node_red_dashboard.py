#!/usr/bin/env python3
"""
Workshop 06: Node-RED Dashboard
Send data to FlowFuse Dashboard
"""

import paho.mqtt.client as mqtt
import json
import time
from datetime import datetime

MQTT_BROKER = "localhost"
MQTT_PORT = 1883

def send_dashboard_data():
    """Send data to Node-RED Dashboard"""
    client = mqtt.Client()
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    
    print("Sending data to Node-RED Dashboard...")
    for i in range(20):
        data = {
            "temperature": 20 + i * 0.3,
            "humidity": 50 + i * 0.5,
            "pressure": 1013 + i,
            "timestamp": datetime.now().isoformat()
        }
        
        client.publish("dashboard/temperature", json.dumps({"value": data["temperature"]}))
        client.publish("dashboard/humidity", json.dumps({"value": data["humidity"]}))
        client.publish("dashboard/pressure", json.dumps({"value": data["pressure"]}))
        
        print(f"Sent: {data}")
        time.sleep(1)
    
    client.disconnect()

if __name__ == "__main__":
    send_dashboard_data()

