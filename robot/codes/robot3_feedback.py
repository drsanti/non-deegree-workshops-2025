"""
Workshop 3: Feedback
Subscribe to robot/sensors to read joint angles.
"""

import json
import paho.mqtt.client as mqtt

BROKER = "127.0.0.1"
PORT = 1883
TOPIC = "robot/sensors"


def on_connect(client, userdata, flags, rc):
    print(f"Connected with result code {rc}")
    client.subscribe(TOPIC)


def on_message(client, userdata, msg):
    data = json.loads(msg.payload.decode())
    print(f"Received: {data}")


def main():
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(BROKER, PORT, 60)
    client.loop_forever()


if __name__ == "__main__":
    main()
