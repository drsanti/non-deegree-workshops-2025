"""
Workshop 1: Basic Publisher
Send a single command to move one joint of the robot arm via MQTT.
"""

import json
import paho.mqtt.client as mqtt

BROKER = "127.0.0.1"
PORT = 1883
TOPIC = "robot/actuators"

# Example command
command = {
    "linkId": 2,  # Joint index (0-5)
    "angle": 45,  # Target angle in degrees
    "duration": 5,  # Duration in seconds
    "ease": "power2.out",  # Easing function
}


def on_connect(client, userdata, flags, rc):
    print(f"Connected with result code {rc}")
    client.publish(TOPIC, json.dumps(command))
    print(f"Published: {command}")
    client.disconnect()


def main():
    client = mqtt.Client()
    client.on_connect = on_connect
    client.connect(BROKER, PORT, 60)
    client.loop_forever()


if __name__ == "__main__":
    main()
