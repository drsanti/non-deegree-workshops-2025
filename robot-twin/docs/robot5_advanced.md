# Workshop 5: Advanced Control

This document describes the `robot5_advanced.py` script, which demonstrates advanced control of the robot arm by sending coordinated multi-joint commands and handling errors.

## Overview

The script connects to an MQTT broker and sends commands to move all joints of the robot arm in a coordinated way. It includes error handling to ensure that command parameters are within valid ranges.

## Script Location

- Path: `robot-twin/codes/robot5_advanced.py`

## How It Works

1. **MQTT Connection**: Connects to a local MQTT broker (`127.0.0.1`) on port `1883`.
2. **Command Generation**: Iterates through all joint indices (0-5), generating a command for each joint with a specific angle.
3. **Error Handling**: The `send_command` function checks that each command's parameters are valid:
   - `linkId` is between 0 and 5
   - `angle` is between -180 and 180
   - `duration` is between 0.2 and 30 seconds
   If any parameter is invalid, an error message is printed and the command is not sent.
4. **Publishing**: Valid commands are published as JSON messages to the topic `robot/actuators`.
5. **Timing**: Waits 5 seconds between each command to allow for sequential movement.

## Example Command Sequence

```json
{
  "linkId": 0,
  "angle": -90,
  "duration": 2,
  "ease": "power2.out"
}
```

## Usage

1. Ensure an MQTT broker is running on `127.0.0.1:1883`.
2. Run the script:

   ```sh
   python robot5_advanced.py
   ```

3. The script will connect, send commands to all joints with error checking, print status messages, and exit.

## Key Functions

- `send_command(client, cmd)`: Validates and publishes a command, printing errors if parameters are invalid.
- `main()`: Sets up the MQTT client, generates and sends commands for all joints, and manages connection lifecycle.

## Requirements

- Python 3.x
- `paho-mqtt` library (install with `pip install paho-mqtt`)

## Notes

- All joints can be rotated between **-180° and +180°**.
- The `ease` parameter supports the same set of easing functions as in Workshop 1. See `robot1_publish.md` for the full list.
- The script is designed for demonstration and educational purposes.
