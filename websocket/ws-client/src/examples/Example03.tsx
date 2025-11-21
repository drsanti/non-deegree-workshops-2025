/**
 * Example 3: Device List Handling
 *
 * This example demonstrates how to:
 * - Receive and handle device-list messages
 * - Store devices in a Map for efficient lookups
 * - Display device information
 * - Update devices when status changes
 */

import { useState, useEffect, useRef } from "react";
import { Box, Flex, Text, Badge, Heading, Card } from "@radix-ui/themes";
import { DotFilledIcon, CircleIcon } from "@radix-ui/react-icons";
import type { Device, ServerMessage, ConnectionStatus } from "../types";

const WS_URL = "ws://localhost:7890";

function Example03() {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [devices, setDevices] = useState<Map<string, Device>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus("connected");
      // Request device list when connected
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
        // Replace entire device list
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

      case "device-status":
        // Update device status
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

      case "sensor-data":
        // Update device sensor data (also marks as online)
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
    }
  };

  const formatTimestamp = (timestamp?: number): string => {
    if (!timestamp) return "Never";
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Box p="5" style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <Heading size="6" mb="4">
        Example 3: Device List Handling
      </Heading>

      <Flex direction="column" gap="4">
        {/* Connection Status */}
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

        {/* Device List */}
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
              No devices available. Waiting for device list...
            </Text>
          </Box>
        ) : (
          <Flex wrap="wrap" gap="4">
            {Array.from(devices.values()).map((device) => (
              <Card
                key={device.id}
                style={{
                  minWidth: "280px",
                  flex: "1 1 280px",
                  opacity: device.status === "offline" ? 0.7 : 1,
                }}
              >
                <Flex direction="column" gap="3">
                  <Flex align="center" justify="between">
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
                    </Box>
                    <Badge
                      color={device.status === "online" ? "green" : "red"}
                      variant="soft"
                    >
                      {device.status === "online" ? (
                        <DotFilledIcon
                          style={{ width: "8px", height: "8px" }}
                        />
                      ) : (
                        <CircleIcon style={{ width: "8px", height: "8px" }} />
                      )}
                      {device.status}
                    </Badge>
                  </Flex>

                  <Box
                    p="2"
                    style={{
                      background: "var(--gray-2)",
                      borderRadius: "var(--radius-2)",
                    }}
                  >
                    <Text size="2" weight="medium" mb="1">
                      Device Type
                    </Text>
                    <Badge variant="soft" color="blue">
                      {device.type}
                    </Badge>
                  </Box>

                  {device.lastUpdate && (
                    <Box>
                      <Text size="1" color="gray">
                        Last update: {formatTimestamp(device.lastUpdate)}
                      </Text>
                    </Box>
                  )}
                </Flex>
              </Card>
            ))}
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
            <strong>What's happening:</strong> When the connection opens, a
            request is sent for the device list. The server responds with all
            available devices, which are stored in a Map for efficient lookups.
            As devices send updates, their status and data are updated in
            real-time.
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}

export default Example03;
