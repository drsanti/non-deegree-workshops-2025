#!/usr/bin/env python3
"""Quick test to verify MQTT messages are being published"""
import paho.mqtt.client as mqtt
import json
import time

received = []

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("[OK] Connected to MQTT broker!")
        client.subscribe("sensors/#")
        print("[OK] Subscribed to sensors/#")
    else:
        print(f"[FAIL] Connection failed: {rc}")

def on_message(client, userdata, msg):
    try:
        data = json.loads(msg.payload.decode())
        received.append((msg.topic, data))
        print(f"Received: {msg.topic} -> {data}")
    except:
        print(f"Received: {msg.topic} -> {msg.payload.decode()}")

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

print("Connecting to MQTT broker...")
client.connect("localhost", 1883, 60)
client.loop_start()

print("Listening for 10 seconds...")
time.sleep(10)

client.loop_stop()
client.disconnect()

print(f"\nTotal messages received: {len(received)}")
if received:
    print("\nSample messages:")
    for topic, data in received[:5]:
        print(f"  {topic}: {data}")

