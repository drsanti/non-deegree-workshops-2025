import { useState, useEffect, useRef } from "react";
import { Box, Flex, Text, Heading, Badge } from "@radix-ui/themes";
import {
  DotFilledIcon,
  CircleIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import DeviceCard from "./components/DeviceCard";
import type {
  Device,
  ServerMessage,
  DeviceCommandHandler,
  ConnectionStatus,
} from "./types";

const WS_URL = "ws://localhost:7890";

function AppIoT() {
  const [devices, setDevices] = useState<Map<string, Device>>(new Map());
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [clientCount, setClientCount] = useState<number>(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const isCleaningUpRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(false);
  const mountTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Mark as mounted after a short delay to distinguish from Strict Mode cleanup
    // Strict Mode cleanup happens immediately, real unmount happens later
    mountTimeoutRef.current = setTimeout(() => {
      isMountedRef.current = true;
    }, 100);

    connectWebSocket();

    return () => {
      // Only cleanup if we're actually unmounting (not just Strict Mode double-invoke)
      // If isMountedRef is false, this is likely Strict Mode cleanup, so skip it
      if (!isMountedRef.current) {
        // This is likely Strict Mode cleanup - don't close the connection
        if (mountTimeoutRef.current) {
          clearTimeout(mountTimeoutRef.current);
          mountTimeoutRef.current = null;
        }
        return;
      }

      // This is a real unmount - clean up properly
      isCleaningUpRef.current = true;
      if (mountTimeoutRef.current) {
        clearTimeout(mountTimeoutRef.current);
        mountTimeoutRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (wsRef.current) {
        // Remove event handlers to prevent reconnection during cleanup
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.onmessage = null;
        wsRef.current.onopen = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  const connectWebSocket = (): void => {
    // Don't connect if we're cleaning up
    if (isCleaningUpRef.current) {
      return;
    }

    // Reset cleanup flag when starting a new connection attempt
    isCleaningUpRef.current = false;

    // Close existing connection if any
    if (wsRef.current) {
      // Remove event handlers to prevent triggering reconnection
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;
      wsRef.current.onopen = null;
      if (
        wsRef.current.readyState === WebSocket.CONNECTING ||
        wsRef.current.readyState === WebSocket.OPEN
      ) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      // Set message handler immediately to ensure we receive messages
      // even if they arrive before onopen fires
      ws.onmessage = (event: MessageEvent) => {
        if (wsRef.current !== ws || isCleaningUpRef.current) {
          return;
        }
        try {
          const message = JSON.parse(event.data) as ServerMessage;
          handleMessage(message);
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      };

      ws.onopen = () => {
        if (wsRef.current !== ws || isCleaningUpRef.current) {
          ws.close();
          return;
        }
        setConnectionStatus("connected");
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onerror = () => {
        if (!isCleaningUpRef.current) {
          if (
            ws.readyState === WebSocket.CONNECTING ||
            ws.readyState === WebSocket.OPEN
          ) {
            console.error("WebSocket connection error");
          }
        }
      };

      ws.onclose = (event: CloseEvent) => {
        if (isCleaningUpRef.current) {
          return;
        }

        if (wsRef.current === ws) {
          wsRef.current = null;
        }

        // Set status based on close code
        // 1000 = Normal Closure, 1001 = Going Away
        // 1006 = Abnormal Closure (connection lost)
        if (
          event.code === 1006 ||
          (event.code !== 1000 && event.code !== 1001)
        ) {
          setConnectionStatus("error");
        } else {
          setConnectionStatus("disconnected");
        }

        // Attempt to reconnect after 3 seconds for error cases
        if (
          (event.code === 1006 ||
            (event.code !== 1000 && event.code !== 1001)) &&
          !isCleaningUpRef.current
        ) {
          reconnectTimeoutRef.current = setTimeout(() => {
            if (!isCleaningUpRef.current) {
              connectWebSocket();
            }
          }, 3000);
        }
      };
    } catch (error) {
      if (!isCleaningUpRef.current) {
        console.error("Failed to create WebSocket connection:", error);
        setConnectionStatus("error");

        reconnectTimeoutRef.current = setTimeout(() => {
          if (!isCleaningUpRef.current) {
            connectWebSocket();
          }
        }, 3000);
      }
    }
  };

  const handleMessage = (message: ServerMessage): void => {
    switch (message.type) {
      case "device-list":
        const deviceMap = new Map<string, Device>();
        message.devices.forEach((device) => {
          deviceMap.set(device.id, {
            ...device,
            data: { temperature: 0, humidity: 0, power: "off" },
          });
        });
        setDevices(deviceMap);
        break;

      case "sensor-data":
        // Update device sensor data
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
        // Update device status
        setDevices((prev) => {
          const newDevices = new Map(prev);
          const device = newDevices.get(message.deviceId);
          if (device) {
            newDevices.set(message.deviceId, {
              ...device,
              data: message.data,
              status: message.status,
              lastUpdate: message.timestamp,
            });
          }
          return newDevices;
        });
        break;

      case "connection-status":
        setClientCount(message.clientCount || 0);
        break;

      case "error":
        console.error("Server error:", message.message);
        break;

      default:
        const _exhaustiveCheck: never = message;
        console.warn("Unknown message type:", _exhaustiveCheck);
    }
  };

  const sendCommand: DeviceCommandHandler = (
    deviceId: string,
    command: "toggle-power" | "set-temperature" | "set-humidity",
    value: number | undefined = undefined
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

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return (
          <DotFilledIcon
            style={{
              color: "var(--green-9)",
              width: "12px",
              height: "12px",
              animation: "pulse 2s infinite",
            }}
          />
        );
      case "error":
        return (
          <ExclamationTriangleIcon
            style={{
              color: "var(--orange-9)",
              width: "12px",
              height: "12px",
            }}
          />
        );
      case "disconnected":
        return (
          <CircleIcon
            style={{
              color: "var(--red-9)",
              width: "12px",
              height: "12px",
            }}
          />
        );
      default:
        return null;
    }
  };

  const getStatusColor = (): "green" | "red" | "orange" | "gray" => {
    switch (connectionStatus) {
      case "connected":
        return "green";
      case "disconnected":
        return "red";
      case "error":
        return "orange";
      default:
        return "gray";
    }
  };

  return (
    <Box className="app">
      <Flex
        asChild
        align="center"
        justify="between"
        p="5"
        style={{
          background: "var(--color-panel)",
          borderBottom: "1px solid var(--gray-6)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <header>
          <Heading size="7">IoT Device Monitor</Heading>
          <Flex align="center" gap="3">
            <Flex align="center" gap="2">
              {getStatusIcon()}
              <Text size="2" weight="medium">
                {connectionStatus.charAt(0).toUpperCase() +
                  connectionStatus.slice(1)}
              </Text>
            </Flex>
            {connectionStatus === "connected" && (
              <Badge color={getStatusColor()}>
                {clientCount} client{clientCount !== 1 ? "s" : ""}
              </Badge>
            )}
          </Flex>
        </header>
      </Flex>

      <Box
        p="5"
        style={{ maxWidth: "1400px", margin: "0 auto", width: "100%" }}
      >
        {devices.size === 0 ? (
          <Box
            p="6"
            style={{
              textAlign: "center",
              background: "var(--color-panel)",
              borderRadius: "var(--radius-3)",
              border: "1px solid var(--gray-6)",
            }}
          >
            <Text size="4" color="gray">
              Waiting for devices...
            </Text>
          </Box>
        ) : (
          <Flex wrap="wrap" gap="4">
            {Array.from(devices.values()).map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                onCommand={sendCommand}
              />
            ))}
          </Flex>
        )}
      </Box>
    </Box>
  );
}

export default AppIoT;
