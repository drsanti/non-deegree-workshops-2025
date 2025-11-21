/**
 * Example 9: Advanced Features
 *
 * This example demonstrates advanced features:
 * - Message queuing when disconnected
 * - Connection status history
 * - Performance optimization
 * - Optimistic UI updates
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Flex,
  Text,
  Badge,
  Heading,
  Card,
  Button,
  ScrollArea,
} from "@radix-ui/themes";
import type {
  Device,
  ServerMessage,
  ClientMessage,
  ConnectionStatus,
} from "../types";

const WS_URL = "ws://localhost:7890";

function Example09() {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [devices, setDevices] = useState<Map<string, Device>>(new Map());
  const [connectionHistory, setConnectionHistory] = useState<
    Array<{
      status: ConnectionStatus;
      timestamp: number;
    }>
  >([]);
  const [queuedMessages, setQueuedMessages] = useState<number>(0);
  const wsRef = useRef<WebSocket | null>(null);
  const messageQueueRef = useRef<ClientMessage[]>([]);
  const isCleaningUpRef = useRef<boolean>(false);

  // Track connection status changes
  useEffect(() => {
    setConnectionHistory((prev) => [
      ...prev,
      { status: connectionStatus, timestamp: Date.now() },
    ]);
  }, [connectionStatus]);

  useEffect(() => {
    isCleaningUpRef.current = false;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!isCleaningUpRef.current) {
        setConnectionStatus("connected");
        // Send queued messages
        flushMessageQueue();
      }
    };

    ws.onclose = () => {
      if (!isCleaningUpRef.current) {
        setConnectionStatus("disconnected");
      }
    };

    ws.onerror = () => {
      if (!isCleaningUpRef.current) {
        setConnectionStatus("error");
      }
    };

    ws.onmessage = (event: MessageEvent) => {
      if (isCleaningUpRef.current) return;

      try {
        const message = JSON.parse(event.data) as ServerMessage;
        handleMessage(message);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    // Request device list when connected
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "request-device-list",
          timestamp: Date.now(),
        })
      );
    }

    return () => {
      isCleaningUpRef.current = true;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  const flushMessageQueue = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      while (messageQueueRef.current.length > 0) {
        const message = messageQueueRef.current.shift();
        if (message) {
          wsRef.current.send(JSON.stringify(message));
        }
      }
      setQueuedMessages(0);
    }
  };

  const sendMessage = useCallback((message: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          ...message,
          timestamp: Date.now(),
        })
      );
    } else {
      // Queue message for later
      messageQueueRef.current.push({
        ...message,
        timestamp: Date.now(),
      });
      setQueuedMessages(messageQueueRef.current.length);
    }
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

  // Optimistic update for toggle power
  const handleTogglePower = (deviceId: string) => {
    const device = devices.get(deviceId);
    if (device) {
      // Optimistic update
      setDevices((prev) => {
        const newDevices = new Map(prev);
        const device = newDevices.get(deviceId);
        if (device) {
          newDevices.set(deviceId, {
            ...device,
            data: {
              ...device.data,
              power: device.data.power === "on" ? "off" : "on",
            },
          });
        }
        return newDevices;
      });

      // Send command
      sendMessage({
        type: "device-command",
        deviceId,
        command: "toggle-power",
        timestamp: Date.now(),
      });
    }
  };

  return (
    <Box p="5" style={{ maxWidth: "1400px", margin: "0 auto" }}>
      <Heading size="6" mb="4">
        Example 9: Advanced Features
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
          <Flex align="center" justify="between" wrap="wrap" gap="3">
            <Text size="2" weight="medium">
              Connection:{" "}
              <Badge color={connectionStatus === "connected" ? "green" : "red"}>
                {connectionStatus}
              </Badge>
            </Text>
            <Text size="2" weight="medium">
              Devices: <Badge>{devices.size}</Badge>
            </Text>
            {queuedMessages > 0 && (
              <Text size="2" weight="medium" color="orange">
                Queued Messages: <Badge color="orange">{queuedMessages}</Badge>
              </Text>
            )}
          </Flex>
        </Box>

        <Flex gap="4" style={{ alignItems: "flex-start" }}>
          {/* Device Cards */}
          <Box style={{ flex: 1 }}>
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
                  const temperature = device.data?.temperature ?? 0;
                  const humidity = device.data?.humidity ?? 0;
                  const power = device.data?.power === "on";

                  return (
                    <Card
                      key={device.id}
                      style={{
                        minWidth: "280px",
                        flex: "1 1 280px",
                      }}
                    >
                      <Flex direction="column" gap="3">
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

                        <Box
                          p="2"
                          style={{
                            background: "var(--gray-2)",
                            borderRadius: "var(--radius-2)",
                          }}
                        >
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
                              <Badge
                                color={power ? "green" : "red"}
                                variant="soft"
                              >
                                {power ? "ON" : "OFF"}
                              </Badge>
                            </Flex>
                          </Flex>
                        </Box>

                        <Button
                          onClick={() => handleTogglePower(device.id)}
                          disabled={device.status !== "online"}
                          color={power ? "red" : "green"}
                          variant={power ? "solid" : "soft"}
                          style={{ width: "100%" }}
                        >
                          {power ? "Turn Off" : "Turn On"}
                        </Button>
                      </Flex>
                    </Card>
                  );
                })}
              </Flex>
            )}
          </Box>

          {/* Connection History Sidebar */}
          <Box
            p="3"
            style={{
              background: "var(--color-panel)",
              borderRadius: "var(--radius-3)",
              border: "1px solid var(--gray-6)",
              minWidth: "300px",
            }}
          >
            <Text size="3" weight="medium" mb="3">
              Connection History
            </Text>
            <ScrollArea style={{ height: "400px" }}>
              <Flex direction="column" gap="2">
                {connectionHistory
                  .slice(-10)
                  .reverse()
                  .map((entry, index) => (
                    <Box
                      key={index}
                      p="2"
                      style={{
                        background: "var(--gray-2)",
                        borderRadius: "var(--radius-2)",
                      }}
                    >
                      <Flex align="center" gap="2">
                        <Badge
                          color={
                            entry.status === "connected"
                              ? "green"
                              : entry.status === "error"
                              ? "orange"
                              : "red"
                          }
                          size="1"
                        >
                          {entry.status}
                        </Badge>
                        <Text size="1" color="gray">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </Text>
                      </Flex>
                    </Box>
                  ))}
              </Flex>
            </ScrollArea>
          </Box>
        </Flex>

        {/* Instructions */}
        <Box
          p="3"
          style={{
            background: "var(--gray-2)",
            borderRadius: "var(--radius-2)",
          }}
        >
          <Text size="2" color="gray">
            <strong>Advanced Features:</strong> This example demonstrates
            message queuing (messages are queued when disconnected and sent when
            reconnected), optimistic UI updates (power toggle updates
            immediately), and connection history tracking. Try disconnecting and
            sending commands to see queuing in action.
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}

export default Example09;
