/**
 * Example 10: Best Practices & Production Ready
 *
 * This example demonstrates production-ready practices:
 * - Comprehensive type safety
 * - Proper resource cleanup
 * - Error handling and logging
 * - Performance monitoring
 * - Security best practices
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Box, Flex, Text, Badge, Heading, Card } from "@radix-ui/themes";
import type {
  Device,
  ServerMessage,
  ClientMessage,
  ConnectionStatus,
} from "../types";

const WS_URL = "ws://localhost:7890";

// Production-ready WebSocket hook with comprehensive error handling
function useProductionWebSocket(url: string) {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [error, setError] = useState<Error | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const messageHandlersRef = useRef<
    Map<string, (message: ServerMessage) => void>
  >(new Map());
  const isCleaningUpRef = useRef<boolean>(false);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const reconnectAttemptsRef = useRef<number>(0);
  const metricsRef = useRef({
    messagesReceived: 0,
    messagesSent: 0,
    errors: 0,
    connectionStartTime: 0,
  });

  // Log errors for monitoring
  const logError = useCallback(
    (error: Error, context?: Record<string, unknown>) => {
      console.error("WebSocket Error:", error, context);
      setError(error);
      metricsRef.current.errors++;

      // In production, send to error tracking service
      // if (window.Sentry) {
      //   window.Sentry.captureException(error, { extra: context });
      // }
    },
    []
  );

  useEffect(() => {
    isCleaningUpRef.current = false;
    metricsRef.current.connectionStartTime = Date.now();

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (isCleaningUpRef.current) {
          ws.close();
          return;
        }
        setStatus("connected");
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onclose = (event) => {
        if (isCleaningUpRef.current) return;

        if (event.code === 1006) {
          setStatus("error");
          logError(new Error("Connection lost"), { code: event.code });

          // Attempt reconnection
          if (reconnectAttemptsRef.current < 5) {
            reconnectAttemptsRef.current++;
            reconnectTimeoutRef.current = setTimeout(() => {
              if (!isCleaningUpRef.current) {
                // Reconnect logic would go here
              }
            }, 3000);
          }
        } else {
          setStatus("disconnected");
        }
      };

      ws.onerror = () => {
        if (!isCleaningUpRef.current) {
          setStatus("error");
          logError(new Error("WebSocket connection error"));
        }
      };

      ws.onmessage = (event: MessageEvent) => {
        if (isCleaningUpRef.current) return;

        try {
          const data = JSON.parse(event.data);
          metricsRef.current.messagesReceived++;

          // Validate message structure
          if (!isValidMessage(data)) {
            logError(new Error("Invalid message format"), { data });
            return;
          }

          const message = data as ServerMessage;
          messageHandlersRef.current.forEach((handler) => {
            try {
              handler(message);
            } catch (err) {
              logError(err as Error, { messageType: message.type });
            }
          });
        } catch (err) {
          logError(err as Error, { rawData: event.data });
        }
      };
    } catch (err) {
      logError(err as Error, { url });
    }

    return () => {
      isCleaningUpRef.current = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.onmessage = null;
        wsRef.current.onopen = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [url, logError]);

  const sendMessage = useCallback(
    (message: ClientMessage) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(
            JSON.stringify({
              ...message,
              timestamp: Date.now(),
            })
          );
          metricsRef.current.messagesSent++;
        } catch (err) {
          logError(err as Error, { message });
        }
      }
    },
    [logError]
  );

  const onMessage = useCallback(
    (type: string, handler: (message: ServerMessage) => void) => {
      messageHandlersRef.current.set(type, handler);
      return () => {
        messageHandlersRef.current.delete(type);
      };
    },
    []
  );

  return {
    status,
    error,
    sendMessage,
    onMessage,
    metrics: metricsRef.current,
  };
}

// Validate message structure
function isValidMessage(data: unknown): data is ServerMessage {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;
  if (typeof obj.type !== "string" || typeof obj.timestamp !== "number") {
    return false;
  }

  // Additional validation based on message type
  switch (obj.type) {
    case "device-list":
      return Array.isArray(obj.devices);
    case "sensor-data":
    case "device-status":
      return typeof obj.deviceId === "string";
    case "error":
      return typeof obj.message === "string";
    case "connection-status":
      return typeof obj.clientCount === "number";
    default:
      return false;
  }
}

// Component using production-ready hook
function Example10() {
  const { status, error, sendMessage, onMessage, metrics } =
    useProductionWebSocket(WS_URL);
  const [devices, setDevices] = useState<Map<string, Device>>(new Map());

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
      }
    });

    return unsubscribe;
  }, [onMessage]);

  useEffect(() => {
    const unsubscribe = onMessage("sensor-data", (message) => {
      if (message.type === "sensor-data") {
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
      }
    });

    return unsubscribe;
  }, [onMessage]);

  const connectionUptime =
    status === "connected"
      ? Math.floor((Date.now() - metrics.connectionStartTime) / 1000)
      : 0;

  return (
    <Box p="5" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <Heading size="6" mb="4">
        Example 10: Best Practices & Production Ready
      </Heading>

      <Flex direction="column" gap="4">
        {/* Status and Metrics */}
        <Box
          p="4"
          style={{
            background: "var(--color-panel)",
            borderRadius: "var(--radius-3)",
            border: "1px solid var(--gray-6)",
          }}
        >
          <Flex direction="column" gap="3">
            <Flex align="center" justify="between" wrap="wrap" gap="3">
              <Text size="2" weight="medium">
                Connection:{" "}
                <Badge color={status === "connected" ? "green" : "red"}>
                  {status}
                </Badge>
              </Text>
              <Text size="2" weight="medium">
                Devices: <Badge>{devices.size}</Badge>
              </Text>
              <Text size="2" weight="medium">
                Messages Received: <Badge>{metrics.messagesReceived}</Badge>
              </Text>
              <Text size="2" weight="medium">
                Messages Sent: <Badge>{metrics.messagesSent}</Badge>
              </Text>
              {status === "connected" && (
                <Text size="2" weight="medium">
                  Uptime: <Badge>{connectionUptime}s</Badge>
                </Text>
              )}
            </Flex>

            {error && (
              <Box
                p="2"
                style={{
                  background: "var(--red-2)",
                  borderRadius: "var(--radius-2)",
                  border: "1px solid var(--red-6)",
                }}
              >
                <Text size="2" color="red">
                  Error: {error.message}
                </Text>
              </Box>
            )}

            {metrics.errors > 0 && (
              <Text size="1" color="orange">
                Errors: {metrics.errors}
              </Text>
            )}
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
            <strong>Production Features:</strong> This example demonstrates
            production-ready practices including comprehensive error handling,
            message validation, performance metrics tracking, proper resource
            cleanup, and type safety. All errors are logged and can be sent to
            error tracking services in production.
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}

export default Example10;
