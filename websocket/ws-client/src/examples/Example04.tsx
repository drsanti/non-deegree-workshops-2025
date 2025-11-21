/**
 * Example 4: Real-time Sensor Data Updates
 *
 * This example demonstrates how to:
 * - Handle sensor-data messages in real-time
 * - Update device data as it arrives
 * - Visualize sensor readings with color coding
 * - Display live sensor dashboard
 */

import { useState, useEffect, useRef } from "react";
import { Box, Flex, Text, Badge, Heading, Card } from "@radix-ui/themes";
import { UpdateIcon } from "@radix-ui/react-icons";
import type { Device, ServerMessage, ConnectionStatus } from "../types";

const WS_URL = "ws://localhost:7890";

function Example04() {
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
        // Update device sensor data in real-time
        setDevices((prev) => {
          const newDevices = new Map(prev);
          const device = newDevices.get(message.deviceId);
          if (device) {
            newDevices.set(message.deviceId, {
              ...device,
              data: message.data,
              lastUpdate: message.timestamp,
              status: "online", // Sensor data means device is online
            });
          }
          return newDevices;
        });
        break;

      case "device-status":
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
    }
  };

  // Color coding functions
  const getTemperatureColor = (temp: number): "red" | "blue" | "green" => {
    if (temp > 27) return "red"; // Hot
    if (temp < 18) return "blue"; // Cold
    return "green"; // Normal
  };

  const getHumidityColor = (humidity: number): "orange" | "gray" | "green" => {
    if (humidity > 70) return "orange"; // High
    if (humidity < 30) return "gray"; // Low
    return "green"; // Normal
  };

  const formatTimestamp = (timestamp?: number): string => {
    if (!timestamp) return "Never";
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Box p="5" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <Heading size="6" mb="4">
        Example 4: Real-time Sensor Data Updates
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

        {/* Device Cards with Sensor Data */}
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
              Waiting for devices and sensor data...
            </Text>
          </Box>
        ) : (
          <Flex wrap="wrap" gap="4">
            {Array.from(devices.values()).map((device) => {
              const temperature = device.data?.temperature ?? 0;
              const humidity = device.data?.humidity ?? 0;
              const power = device.data?.power ?? "off";

              return (
                <Card
                  key={device.id}
                  style={{
                    minWidth: "320px",
                    flex: "1 1 320px",
                    opacity: device.status === "offline" ? 0.7 : 1,
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
                        color={device.status === "online" ? "green" : "red"}
                        variant="soft"
                        mt="2"
                      >
                        {device.status}
                      </Badge>
                    </Box>

                    {/* Sensor Data */}
                    <Flex direction="column" gap="3">
                      <Box
                        p="2"
                        style={{
                          background: "var(--gray-2)",
                          borderRadius: "var(--radius-2)",
                        }}
                      >
                        <Flex align="center" justify="between">
                          <Text size="2" weight="medium" color="gray">
                            Temperature
                          </Text>
                          <Text
                            size="3"
                            weight="bold"
                            color={getTemperatureColor(temperature)}
                            style={{ fontFamily: "monospace" }}
                          >
                            {temperature
                              ? `${temperature.toFixed(1)}°C`
                              : "N/A"}
                          </Text>
                        </Flex>
                      </Box>

                      <Box
                        p="2"
                        style={{
                          background: "var(--gray-2)",
                          borderRadius: "var(--radius-2)",
                        }}
                      >
                        <Flex align="center" justify="between">
                          <Text size="2" weight="medium" color="gray">
                            Humidity
                          </Text>
                          <Text
                            size="3"
                            weight="bold"
                            color={getHumidityColor(humidity)}
                            style={{ fontFamily: "monospace" }}
                          >
                            {humidity ? `${humidity.toFixed(1)}%` : "N/A"}
                          </Text>
                        </Flex>
                      </Box>

                      <Box
                        p="2"
                        style={{
                          background: "var(--gray-2)",
                          borderRadius: "var(--radius-2)",
                        }}
                      >
                        <Flex align="center" justify="between">
                          <Text size="2" weight="medium" color="gray">
                            Power
                          </Text>
                          <Badge
                            color={power === "on" ? "green" : "red"}
                            variant="soft"
                          >
                            {power.toUpperCase()}
                          </Badge>
                        </Flex>
                      </Box>
                    </Flex>

                    {/* Last Update */}
                    {device.lastUpdate && (
                      <Flex align="center" gap="2">
                        <UpdateIcon style={{ width: "12px", height: "12px" }} />
                        <Text size="1" color="gray">
                          Last update: {formatTimestamp(device.lastUpdate)}
                        </Text>
                      </Flex>
                    )}
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
            <strong>What's happening:</strong> Sensor data messages arrive every
            3 seconds from the server. Each message updates the device's sensor
            readings (temperature, humidity, power) in real-time. The colors
            indicate: Temperature (Red=Hot, Green=Normal, Blue=Cold), Humidity
            (Orange=High, Green=Normal, Gray=Low).
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}

export default Example04;
