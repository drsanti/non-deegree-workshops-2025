# Workshop 3: Feedback (MQTT Subscriber)

This document describes the `robot3_feedback.py` script, which demonstrates how to subscribe to robot sensor data and read joint angles via MQTT.

## Overview

The script connects to an MQTT broker and subscribes to the topic that provides sensor feedback from the robot arm. It prints out the received joint angle data in real time.

## Script Location

- Path: `robot-twin/codes/robot3_feedback.py`

## How It Works

1. **MQTT Connection**: Connects to a local MQTT broker (`127.0.0.1`) on port `1883`.
2. **Subscription**: Subscribes to the topic `robot/sensors` to receive sensor data.
3. **Message Handling**: On receiving a message, decodes the JSON payload and prints the joint angles or other sensor data.

## Example Received Message

```json
{
  "jointAngles": [0, 45, -30, 90, 0, 0],
  "timestamp": 1700000000
}
```

## Usage

1. Ensure an MQTT broker is running on `127.0.0.1:1883` and the robot or simulator is publishing sensor data to `robot/sensors`.
2. Run the script:

   ```sh
   python robot3_feedback.py
   ```

3. The script will connect, subscribe to the topic, and print each received message.

## Key Functions

- `on_connect(client, userdata, flags, rc)`: Subscribes to the sensor topic upon connection.
- `on_message(client, userdata, msg)`: Handles incoming messages and prints the decoded data.
- `main()`: Sets up the MQTT client and starts the event loop.

## Requirements

- Python 3.x
- `paho-mqtt` library (install with `pip install paho-mqtt`)

## Notes

- The structure of the received data may vary depending on the robot or simulator implementation.
- This script is designed for demonstration and educational purposes.
