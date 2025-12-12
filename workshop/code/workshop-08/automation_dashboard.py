#!/usr/bin/env python3
"""
Workshop 08: Automation Dashboard
Monitor automation events
"""

import paho.mqtt.client as mqtt
import json
from datetime import datetime

class AutomationDashboard:
    def __init__(self):
        self.automation_events = []
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
            print("✓ Automation dashboard connected!")
    
    def on_message(self, client, userdata, msg):
        try:
            data = json.loads(msg.payload.decode())
            event = {
                "timestamp": datetime.now().isoformat(),
                "device": data.get("device_type"),
                "action": data.get("state"),
                "reason": data.get("reason")
            }
            self.automation_events.append(event)
            print(f"Event: {event}")
        except Exception as e:
            print(f"Error: {e}")
    
    def run(self):
        print("Automation dashboard running...")
        try:
            import time
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\nStopping...")
            self.mqtt_client.loop_stop()
            self.mqtt_client.disconnect()

if __name__ == "__main__":
    dashboard = AutomationDashboard()
    dashboard.run()

