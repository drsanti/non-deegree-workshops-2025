# Workshop 2: Sequence Control

This document describes the `robot2_sequence.py` script, which demonstrates how to send a sequence of joint commands to a robot arm via MQTT.

## Overview

The script connects to an MQTT broker and publishes a series of commands to move different joints of the robot arm in sequence. Each command specifies the joint, target angle, movement duration, and easing function.

## Script Location

- Path: `robot-twin/codes/robot2_sequence.py`

## How It Works

1. **MQTT Connection**: Connects to a local MQTT broker (`127.0.0.1`) on port `1883`.
2. **Command Sequence**: Defines a list of command dictionaries, each targeting a different joint and movement.
3. **Publishing**: Iterates through the command list, publishing each command as a JSON message to the topic `robot/actuators`.
4. **Timing**: Waits for the specified `duration` before sending the next command, ensuring sequential movement.

## Example Command Sequence

```json
[
  {"linkId": 0, "angle": 30, "duration": 2, "ease": "power2.out"},
  {"linkId": 1, "angle": 45, "duration": 2, "ease": "power2.out"},
  {"linkId": 2, "angle": -30, "duration": 2, "ease": "power2.out"}
]
```

## Usage

1. Ensure an MQTT broker is running on `127.0.0.1:1883`.
2. Run the script:

   ```sh
   python robot2_sequence.py
   ```

3. The script will connect, publish each command in sequence, print status messages, and exit.

## Key Functions

- `main()`: Sets up the MQTT client, publishes each command in the sequence, and manages connection lifecycle.

## Requirements

- Python 3.x
- `paho-mqtt` library (install with `pip install paho-mqtt`)

## Notes

- All joints can be rotated between **-180° and +180°**.
- The `ease` parameter supports the same set of easing functions as in Workshop 1. See `robot1_publish.md` for the full list.
- Adjust the `commands` list to create different movement sequences or control other joints.
- The script is designed for demonstration and educational purposes.
