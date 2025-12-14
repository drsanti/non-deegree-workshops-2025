"""
Workshop 4: Interactive Control
Control the robot arm interactively from the command line.
"""

import json
import paho.mqtt.client as mqtt

BROKER = "127.0.0.1"
PORT = 1883
TOPIC = "robot/actuators"


def main():
    client = mqtt.Client()
    client.connect(BROKER, PORT, 60)
    while True:
        try:
            link_id = int(input("Link ID (0-5): "))
            angle = float(input("Angle (-180 to 180): "))
            duration = float(input("Duration (0.2-30): "))
            ease = input("Ease (e.g., power2.out): ") or "power2.out"
            cmd = {
                "linkId": link_id,
                "angle": angle,
                "duration": duration,
                "ease": ease,
            }
            client.publish(TOPIC, json.dumps(cmd))
            print(f"Published: {cmd}")
        except Exception as e:
            print(f"Error: {e}")
        cont = input("Send another command? (y/n): ").strip().lower()
        if cont != "y":
            break
    client.disconnect()


if __name__ == "__main__":
    main()
