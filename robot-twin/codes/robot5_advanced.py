"""
Workshop 5: Advanced Control
Send coordinated multi-joint commands and handle errors.
"""

import json
import time
import paho.mqtt.client as mqtt

BROKER = "127.0.0.1"
PORT = 1883
TOPIC = "robot/actuators"


# Example: Move all joints to random angles with error handling
def send_command(client, cmd):
    try:
        assert 0 <= cmd["linkId"] <= 5, "Invalid linkId"
        assert -180 <= cmd["angle"] <= 180, "Invalid angle"
        assert 0.2 <= cmd["duration"] <= 30, "Invalid duration"
        client.publish(TOPIC, json.dumps(cmd))
        print(f"Published: {cmd}")
    except AssertionError as e:
        print(f"Error: {e}")


def main():
    client = mqtt.Client()
    client.connect(BROKER, PORT, 60)
    for link_id in range(6):
        cmd = {
            "linkId": link_id,
            "angle": link_id * 30 - 90,
            "duration": 2,
            "ease": "power2.out",
        }
        send_command(client, cmd)
        time.sleep(5)
    client.disconnect()


if __name__ == "__main__":
    main()
