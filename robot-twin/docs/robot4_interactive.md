# Workshop 4: Interactive Control

This document describes the `robot4_interactive.py` script, which allows interactive control of the robot arm from the command line via MQTT.

## Overview

The script connects to an MQTT broker and lets the user input joint commands interactively. Each command is sent to the robot arm in real time, enabling hands-on experimentation and control.

## Script Location

- Path: `robot-twin/codes/robot4_interactive.py`

## How It Works

1. **MQTT Connection**: Connects to a local MQTT broker (`127.0.0.1`) on port `1883`.
2. **Interactive Input**: Prompts the user for joint parameters:
   - `linkId`: Joint index (0-5)
   - `angle`: Target angle in degrees (-180 to 180)
   - `duration`: Movement duration in seconds (0.2 to 30)
   - `ease`: Easing function (default: `power2.out`)
3. **Publishing**: Sends each command as a JSON message to the topic `robot/actuators`.
4. **Loop**: Repeats the process until the user chooses to exit.

## Example Interactive Session

```
Link ID (0-5): 2
Angle (-180 to 180): 45
Duration (0.2-30): 5
Ease (e.g., power2.out):
Published: {'linkId': 2, 'angle': 45.0, 'duration': 5.0, 'ease': 'power2.out'}
Send another command? (y/n): n
```

## Usage

1. Ensure an MQTT broker is running on `127.0.0.1:1883`.
2. Run the script:

   ```sh
   python robot4_interactive.py
   ```

3. Follow the prompts to send commands interactively.

## Key Functions

- `main()`: Handles user input, command construction, publishing, and connection lifecycle.

## Requirements

- Python 3.x
- `paho-mqtt` library (install with `pip install paho-mqtt`)

## Notes

- All joints can be rotated between **-180° and +180°**.
- The `ease` parameter supports the same set of easing functions as in Workshop 1. See `robot1_publish.md` for the full list.
- The script is designed for demonstration and educational purposes.
