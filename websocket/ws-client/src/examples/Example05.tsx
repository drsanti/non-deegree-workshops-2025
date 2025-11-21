/**
 * Example 5: Device Control - Sending Device Commands
 *
 * This example demonstrates how to:
 * - Send device commands to the server
 * - Validate commands before sending
 * - Build device control interface
 * - Handle command responses
 * - Disable controls for offline devices
 */

import { useState, useEffect, useRef, FormEvent } from "react";
import {
  Box,
  Flex,
  Text,
  Badge,
  Heading,
  Card,
  Button,
  TextField,
} from "@radix-ui/themes";
import type {
  Device,
  ServerMessage,
  ConnectionStatus,
  DeviceCommandHandler,
} from "../types";

const WS_URL = "ws://localhost:7890";

function Example05() {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [devices, setDevices] = useState<Map<string, Device>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus("connected");
      ws.send(
        JSON.stringify({
          type: "request-device-list",
          timestamp: Date.now(),
        })
      );
    };

    ws.onclose = () => {
      setConnectionStatus("disconnected");
    };

    ws.onerror = () => {
      setConnectionStatus("error");
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data) as ServerMessage;
        handleMessage(message);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  const handleMessage = (message: ServerMessage) => {
    switch (message.type) {
      case "device-list":
        const deviceMap = new Map<string, Device>();
        message.devices.forEach((device) => {
          deviceMap.set(device.id, {
            ...device,
            data: {
              temperature: 0,
              humidity: 0,
              power: "off",
            },
          });
        });
        setDevices(deviceMap);
        break;

      case "sensor-data":
        setDevices((prev) => {
          const newDevices = new Map(prev);
          const device = newDevices.get(message.deviceId);
          if (device) {
            newDevices.set(message.deviceId, {
              ...device,
              data: message.data,
              lastUpdate: message.timestamp,
              status: "online",
            });
          }
          return newDevices;
        });
        break;

      case "device-status":
        // Device status updated after command
        setDevices((prev) => {
          const newDevices = new Map(prev);
          const device = newDevices.get(message.deviceId);
          if (device) {
            newDevices.set(message.deviceId, {
              ...device,
              status: message.status,
              data: message.data,
              lastUpdate: message.timestamp,
            });
          }
          return newDevices;
        });
        break;

      case "error":
        console.error("Server error:", message.message);
        // Could show error toast/notification here
        break;
    }
  };

  // Send command to device
  const sendCommand: DeviceCommandHandler = (
    deviceId: string,
    command: "toggle-power" | "set-temperature" | "set-humidity",
    value?: number
  ): void => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "device-command",
          deviceId,
          command,
          value,
          timestamp: Date.now(),
        })
      );
    } else {
      console.error("WebSocket is not connected");
    }
  };

  return (
    <Box p="5" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <Heading size="6" mb="4">
        Example 5: Device Control
      </Heading>

      <Flex direction="column" gap="4">
        {/* Status Bar */}
        <Box
          p="3"
          style={{
            background: "var(--color-panel)",
            borderRadius: "var(--radius-3)",
            border: "1px solid var(--gray-6)",
          }}
        >
          <Flex align="center" justify="between">
            <Text size="2" weight="medium">
              Connection:{" "}
              <Badge color={connectionStatus === "connected" ? "green" : "red"}>
                {connectionStatus}
              </Badge>
            </Text>
            <Text size="2" weight="medium">
              Devices: <Badge>{devices.size}</Badge>
            </Text>
          </Flex>
        </Box>

        {/* Device Cards with Controls */}
        {devices.size === 0 ? (
          <Box
            p="6"
            style={{
              background: "var(--color-panel)",
              borderRadius: "var(--radius-3)",
              border: "1px solid var(--gray-6)",
              textAlign: "center",
            }}
          >
            <Text size="3" color="gray">
              Waiting for devices...
            </Text>
          </Box>
        ) : (
          <Flex wrap="wrap" gap="4">
            {Array.from(devices.values()).map((device) => {
              const isOnline = device.status === "online";
              const temperature = device.data?.temperature ?? 0;
              const humidity = device.data?.humidity ?? 0;
              const power = device.data?.power === "on";

              const handleTogglePower = () => {
                sendCommand(device.id, "toggle-power");
              };

              const handleSetTemperature = (e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const temp = parseFloat(formData.get("temperature") as string);
                if (!isNaN(temp) && temp >= 0 && temp <= 50) {
                  sendCommand(device.id, "set-temperature", temp);
                }
              };

              const handleSetHumidity = (e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const humidity = parseFloat(formData.get("humidity") as string);
                if (!isNaN(humidity) && humidity >= 0 && humidity <= 100) {
                  sendCommand(device.id, "set-humidity", humidity);
                }
              };

              return (
                <Card
                  key={device.id}
                  style={{
                    minWidth: "350px",
                    flex: "1 1 350px",
                    opacity: !isOnline ? 0.7 : 1,
                  }}
                >
                  <Flex direction="column" gap="4">
                    {/* Device Header */}
                    <Box>
                      <Heading size="4" mb="1">
                        {device.name}
                      </Heading>
                      <Text
                        size="1"
                        color="gray"
                        style={{ fontFamily: "monospace" }}
                      >
                        {device.id}
                      </Text>
                      <Badge
                        color={isOnline ? "green" : "red"}
                        variant="soft"
                        mt="2"
                      >
                        {device.status}
                      </Badge>
                    </Box>

                    {/* Current Sensor Data */}
                    <Box
                      p="3"
                      style={{
                        background: "var(--gray-2)",
                        borderRadius: "var(--radius-2)",
                      }}
                    >
                      <Text size="2" weight="medium" mb="2">
                        Current Values
                      </Text>
                      <Flex direction="column" gap="2">
                        <Flex justify="between">
                          <Text size="2">Temperature:</Text>
                          <Text size="2" weight="bold">
                            {temperature.toFixed(1)}°C
                          </Text>
                        </Flex>
                        <Flex justify="between">
                          <Text size="2">Humidity:</Text>
                          <Text size="2" weight="bold">
                            {humidity.toFixed(1)}%
                          </Text>
                        </Flex>
                        <Flex justify="between">
                          <Text size="2">Power:</Text>
                          <Badge color={power ? "green" : "red"} variant="soft">
                            {power ? "ON" : "OFF"}
                          </Badge>
                        </Flex>
                      </Flex>
                    </Box>

                    {/* Device Controls */}
                    <Flex direction="column" gap="3">
                      <Text size="2" weight="medium">
                        Controls
                      </Text>

                      {/* Toggle Power */}
                      <Button
                        onClick={handleTogglePower}
                        disabled={!isOnline}
                        color={power ? "red" : "green"}
                        variant={power ? "solid" : "soft"}
                        style={{ width: "100%" }}
                      >
                        {power ? "Turn Off" : "Turn On"}
                      </Button>

                      {/* Set Temperature */}
                      <Box asChild>
                        <form onSubmit={handleSetTemperature}>
                          <Flex direction="column" gap="2">
                            <Text size="1" color="gray">
                              Set Temperature (°C)
                            </Text>
                            <Flex gap="2">
                              <TextField.Root
                                type="number"
                                name="temperature"
                                min="0"
                                max="50"
                                step="0.1"
                                defaultValue={temperature.toFixed(1)}
                                disabled={!isOnline}
                                style={{ flex: 1 }}
                              />
                              <Button type="submit" disabled={!isOnline}>
                                Set
                              </Button>
                            </Flex>
                          </Flex>
                        </form>
                      </Box>

                      {/* Set Humidity */}
                      <Box asChild>
                        <form onSubmit={handleSetHumidity}>
                          <Flex direction="column" gap="2">
                            <Text size="1" color="gray">
                              Set Humidity (%)
                            </Text>
                            <Flex gap="2">
                              <TextField.Root
                                type="number"
                                name="humidity"
                                min="0"
                                max="100"
                                step="0.1"
                                defaultValue={humidity.toFixed(1)}
                                disabled={!isOnline}
                                style={{ flex: 1 }}
                              />
                              <Button type="submit" disabled={!isOnline}>
                                Set
                              </Button>
                            </Flex>
                          </Flex>
                        </form>
                      </Box>
                    </Flex>
                  </Flex>
                </Card>
              );
            })}
          </Flex>
        )}

        {/* Instructions */}
        <Box
          p="3"
          style={{
            background: "var(--gray-2)",
            borderRadius: "var(--radius-2)",
          }}
        >
          <Text size="2" color="gray">
            <strong>Instructions:</strong> Use the controls to send commands to
            devices. Toggle power to turn devices on/off. Set temperature
            (0-50°C) and humidity (0-100%) using the forms. Controls are
            disabled when devices are offline. The server will respond with
            updated device status.
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}

export default Example05;
