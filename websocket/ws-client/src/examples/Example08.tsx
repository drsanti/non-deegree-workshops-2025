/**
 * Example 8: Custom React Hooks for WebSocket
 *
 * This example demonstrates how to:
 * - Create custom React hooks for WebSocket
 * - Encapsulate WebSocket logic in reusable hooks
 * - Build hooks for device data management
 * - Combine hooks to create complex features
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Box, Flex, Text, Badge, Heading, Card } from "@radix-ui/themes";
import type {
  Device,
  ServerMessage,
  ClientMessage,
  ConnectionStatus,
  DeviceData,
} from "../types";

const WS_URL = "ws://localhost:7890";

// Custom hook for WebSocket connection
function useWebSocket(url: string) {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const wsRef = useRef<WebSocket | null>(null);
  const messageHandlersRef = useRef<
    Map<string, (message: ServerMessage) => void>
  >(new Map());
  const isCleaningUpRef = useRef<boolean>(false);

  useEffect(() => {
    isCleaningUpRef.current = false;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!isCleaningUpRef.current) {
        setStatus("connected");
      }
    };

    ws.onclose = () => {
      if (!isCleaningUpRef.current) {
        setStatus("disconnected");
      }
    };

    ws.onerror = () => {
      if (!isCleaningUpRef.current) {
        setStatus("error");
      }
    };

    ws.onmessage = (event: MessageEvent) => {
      if (isCleaningUpRef.current) return;

      try {
        const message = JSON.parse(event.data) as ServerMessage;
        messageHandlersRef.current.forEach((handler) => handler(message));
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    return () => {
      isCleaningUpRef.current = true;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [url]);

  const sendMessage = useCallback((message: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          ...message,
          timestamp: Date.now(),
        })
      );
    }
  }, []);

  const onMessage = useCallback(
    (type: string, handler: (message: ServerMessage) => void) => {
      messageHandlersRef.current.set(type, handler);
      return () => {
        messageHandlersRef.current.delete(type);
      };
    },
    []
  );

  return { status, sendMessage, onMessage };
}

// Custom hook for device data management
function useDeviceData() {
  const [devices, setDevices] = useState<Map<string, Device>>(new Map());

  const updateDevice = useCallback(
    (deviceId: string, updates: Partial<Device>) => {
      setDevices((prev) => {
        const newDevices = new Map(prev);
        const device = newDevices.get(deviceId);
        if (device) {
          newDevices.set(deviceId, { ...device, ...updates });
        }
        return newDevices;
      });
    },
    []
  );

  const setDeviceList = useCallback(
    (deviceList: Array<Omit<Device, "data"> & { data?: DeviceData }>) => {
      const deviceMap = new Map<string, Device>();
      deviceList.forEach((device) => {
        deviceMap.set(device.id, {
          ...device,
          data: device.data || {
            temperature: 0,
            humidity: 0,
            power: "off",
          },
        });
      });
      setDevices(deviceMap);
    },
    []
  );

  return { devices, updateDevice, setDeviceList };
}

// Combined hook for IoT devices
function useIoTDevices(url: string) {
  const { status, sendMessage, onMessage } = useWebSocket(url);
  const { devices, updateDevice, setDeviceList } = useDeviceData();

  useEffect(() => {
    if (status === "connected") {
      sendMessage({
        type: "request-device-list",
        timestamp: Date.now(),
      });
    }
  }, [status, sendMessage]);

  useEffect(() => {
    const unsubscribe = onMessage("device-list", (message) => {
      if (message.type === "device-list") {
        setDeviceList(message.devices);
      }
    });

    return unsubscribe;
  }, [onMessage, setDeviceList]);

  useEffect(() => {
    const unsubscribe = onMessage("sensor-data", (message) => {
      if (message.type === "sensor-data") {
        updateDevice(message.deviceId, {
          data: message.data,
          lastUpdate: message.timestamp,
          status: "online",
        });
      }
    });

    return unsubscribe;
  }, [onMessage, updateDevice]);

  useEffect(() => {
    const unsubscribe = onMessage("device-status", (message) => {
      if (message.type === "device-status") {
        updateDevice(message.deviceId, {
          status: message.status,
          data: message.data,
          lastUpdate: message.timestamp,
        });
      }
    });

    return unsubscribe;
  }, [onMessage, updateDevice]);

  const sendCommand = useCallback(
    (
      deviceId: string,
      command: "toggle-power" | "set-temperature" | "set-humidity",
      value?: number
    ) => {
      sendMessage({
        type: "device-command",
        deviceId,
        command,
        value,
        timestamp: Date.now(),
      });
    },
    [sendMessage]
  );

  return { status, devices, sendCommand };
}

// Component using the custom hook
function Example08() {
  const { status, devices, sendCommand } = useIoTDevices(WS_URL);

  return (
    <Box p="5" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <Heading size="6" mb="4">
        Example 8: Custom React Hooks for WebSocket
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
              <Badge color={status === "connected" ? "green" : "red"}>
                {status}
              </Badge>
            </Text>
            <Text size="2" weight="medium">
              Devices: <Badge>{devices.size}</Badge>
            </Text>
          </Flex>
        </Box>

        {/* Device Cards */}
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
                    opacity: device.status === "offline" ? 0.7 : 1,
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
                          <Badge color={power ? "green" : "red"} variant="soft">
                            {power ? "ON" : "OFF"}
                          </Badge>
                        </Flex>
                      </Flex>
                    </Box>

                    <button
                      onClick={() => sendCommand(device.id, "toggle-power")}
                      disabled={device.status !== "online"}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "4px",
                        border: "none",
                        background: power ? "var(--red-9)" : "var(--green-9)",
                        color: "white",
                        cursor:
                          device.status === "online"
                            ? "pointer"
                            : "not-allowed",
                        opacity: device.status === "online" ? 1 : 0.5,
                      }}
                    >
                      {power ? "Turn Off" : "Turn On"}
                    </button>
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
            <strong>What's happening:</strong> This example uses custom React
            hooks to encapsulate WebSocket logic. The `useWebSocket` hook
            manages the connection, `useDeviceData` manages device state, and
            `useIoTDevices` combines them. This makes the logic reusable and the
            component code much simpler.
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}

export default Example08;
