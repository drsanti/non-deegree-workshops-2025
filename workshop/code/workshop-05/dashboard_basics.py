#!/usr/bin/env python3
"""
Workshop 05: FlowFuse Dashboard Basics
Send data to Node-RED Dashboard
"""

import paho.mqtt.client as mqtt
import json
import time
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))

def send_dashboard_data():
    """Send formatted data for dashboard"""
    client = mqtt.Client()
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    
    print("Sending data to Node-RED Dashboard...")
    print("Open http://localhost:1880/ui to see the dashboard")
    print("-" * 60)
    
    for i in range(20):
        # Temperature data
        temp_data = {"value": 20 + i * 0.3}
        client.publish("dashboard/temperature", json.dumps(temp_data))
        
        # Humidity data
        hum_data = {"value": 50 + i * 0.5}
        client.publish("dashboard/humidity", json.dumps(hum_data))
        
        # Pressure data
        press_data = {"value": 1013 + i}
        client.publish("dashboard/pressure", json.dumps(press_data))
        
        print(f"[{i+1}] Sent: temp={temp_data['value']:.1f}°C, "
              f"hum={hum_data['value']:.1f}%, press={press_data['value']}hPa")
        
        time.sleep(1)
    
    client.disconnect()
    print("\n✓ Data sent successfully!")

if __name__ == "__main__":
    send_dashboard_data()

