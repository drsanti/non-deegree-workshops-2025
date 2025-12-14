

# Workshop 1: Basic MQTT Publisher

This document explains the functionality and usage of the `robot1_publisher.py` script, which demonstrates how to send a single command to move one joint of a robot arm via MQTT.

## Overview

The script connects to an MQTT broker and publishes a command to control a specific joint of the robot arm. It is intended as an introductory example for Workshop 1.

## Script Location

- Path: `robot-twin/codes/robot1_publisher.py`

## How It Works

1. **MQTT Connection**: The script connects to a local MQTT broker (`127.0.0.1`) on port `1883`.
2. **Command Structure**: A command dictionary specifies the joint (`linkId`), target angle, duration, and easing function.
3. **Publishing**: Upon connecting, the script publishes the command as a JSON message to the topic `robot/actuators` and then disconnects.

## Example Command

```json
{
  "linkId": 2,          // Joint index (0-5)
  "angle": 45,          // Target angle in degrees (-180° and +180°)
  "duration": 5,        // Duration in seconds (0.2 - 30)
  "ease": "power2.out"  // Easing function
}
```


#### Joint Angle Range

All joints of the robot can be rotated between **-180° and +180°**.

#### Easing Functions

The `ease` parameter controls the motion profile of the joint movement. The following easing functions are supported:

```
none
power1, power1.in, power1.out, power1.inOut
power2, power2.in, power2.out, power2.inOut
power3, power3.in, power3.out, power3.inOut
power4, power4.in, power4.out, power4.inOut
back, back.in, back.out, back.inOut
bounce, bounce.in, bounce.out, bounce.inOut
circ, circ.in, circ.out, circ.inOut
elastic, elastic.in, elastic.out, elastic.inOut
expo, expo.in, expo.out, expo.inOut
sine, sine.in, sine.out, sine.inOut
```

## Usage

1. Ensure an MQTT broker is running on `127.0.0.1:1883`.
2. Run the script:

   ```sh
   python robot1_publisher.py
   ```

3. The script will connect, publish the command, print status messages, and exit.

## Key Functions

- `on_connect(client, userdata, flags, rc)`: Publishes the command upon successful connection.
- `main()`: Sets up the MQTT client and starts the connection loop.

## Requirements

- Python 3.x
- `paho-mqtt` library (install with `pip install paho-mqtt`)

## Notes

- Adjust the `command` dictionary to control different joints or change movement parameters.
- The script is designed for demonstration and educational purposes.
