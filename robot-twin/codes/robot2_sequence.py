"""
Workshop 2: Sequence Control
Send a sequence of joint commands to the robot arm via MQTT.
"""

import json
import time
import paho.mqtt.client as mqtt

BROKER = "127.0.0.1"
PORT = 1883
TOPIC = "robot/actuators"

commands = [
    {"linkId": 0, "angle": 30, "duration": 2, "ease": "power2.out"},
    {"linkId": 1, "angle": 45, "duration": 2, "ease": "power2.out"},
    {"linkId": 2, "angle": -30, "duration": 2, "ease": "power2.out"},
]


def main():
    client = mqtt.Client()
    client.connect(BROKER, PORT, 60)
    client.loop_start()
    for cmd in commands:
        client.publish(TOPIC, json.dumps(cmd))
        print(f"Published: {cmd}")
        time.sleep(cmd["duration"])
    client.loop_stop()
    client.disconnect()


if __name__ == "__main__":
    main()
