#!/usr/bin/env python3
"""
Workshop 08: Home Automation
Home automation system example
"""

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
        self.setup_mqtt()
        
    def setup_mqtt(self):
        self.mqtt_client = mqtt.Client()
        self.mqtt_client.on_connect = self.on_connect
        self.mqtt_client.on_message = self.on_message
        self.mqtt_client.connect("localhost", 1883, 60)
        self.mqtt_client.loop_start()
    
    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print("✓ Automation system connected!")
            client.subscribe("sensors/temperature/+")
            client.subscribe("sensors/humidity/+")
        else:
            print(f"✗ Failed to connect: {rc}")
    
    def on_message(self, client, userdata, msg):
        try:
            data = json.loads(msg.payload.decode())
            topic_parts = msg.topic.split('/')
            sensor_type = topic_parts[1]
            
            if sensor_type == "temperature":
                self.handle_temperature(data)
        except Exception as e:
            print(f"Error: {e}")
    
    def handle_temperature(self, data):
        temperature = data.get('value', 0)
        location = data.get('location', 'unknown')
        
        if temperature > self.temperature_threshold:
            self.control_device("ac", location, "on", f"Temperature {temperature}°C exceeds threshold")
    
    def control_device(self, device_type, location, state, reason):
        command = {
            "device_type": device_type,
            "location": location,
            "state": state,
            "reason": reason,
            "timestamp": datetime.now().isoformat()
        }
        topic = f"automation/{device_type}/{location}"
        self.mqtt_client.publish(topic, json.dumps(command))
        print(f"Command: {device_type} at {location} -> {state}")
    
    def run(self):
        print("Home automation system running...")
        try:
            import time
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\nStopping...")
            self.mqtt_client.loop_stop()
            self.mqtt_client.disconnect()

if __name__ == "__main__":
    automation = HomeAutomation()
    automation.run()

