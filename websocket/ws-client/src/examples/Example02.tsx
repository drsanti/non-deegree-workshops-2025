/**
 * Example 2: Basic Messaging - Sending and Receiving Messages
 *
 * This example demonstrates how to:
 * - Send messages to the WebSocket server
 * - Receive and parse messages from the server
 * - Handle different message types
 * - Display message log
 */

import { useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  Text,
  Badge,
  Heading,
  Button,
  ScrollArea,
} from "@radix-ui/themes";
import type { ServerMessage, ClientMessage, ConnectionStatus } from "../types";

const WS_URL = "ws://localhost:7890";

function Example02() {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [messages, setMessages] = useState<ServerMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus("connected");
    };

    ws.onclose = () => {
      setConnectionStatus("disconnected");
    };

    ws.onerror = () => {
      setConnectionStatus("error");
    };

    // Handle incoming messages
    ws.onmessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data) as ServerMessage;
        setMessages((prev) => [...prev, message]);
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

  // Send a message to the server
  const sendMessage = (message: ClientMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const messageWithTimestamp = {
        ...message,
        timestamp: Date.now(),
      };
      wsRef.current.send(JSON.stringify(messageWithTimestamp));
    } else {
      console.error("WebSocket is not connected");
    }
  };

  // Request device list from server
  const requestDeviceList = () => {
    sendMessage({
      type: "request-device-list",
      timestamp: Date.now(),
    });
  };

  // Format message for display
  const formatMessage = (message: ServerMessage): string => {
    switch (message.type) {
      case "device-list":
        return `Device List (${message.devices.length} devices)`;
      case "sensor-data":
        return `Sensor Data: ${message.deviceName} - Temp: ${message.data.temperature}°C, Humidity: ${message.data.humidity}%`;
      case "device-status":
        return `Device Status: ${message.deviceName} - ${message.status}`;
      case "connection-status":
        return `Connection Status: ${message.clientCount} clients connected`;
      case "error":
        return `Error: ${message.message}`;
      default: {
        const _exhaustiveCheck: never = message;
        return `Unknown message type: ${
          (_exhaustiveCheck as ServerMessage).type
        }`;
      }
    }
  };

  // Get message type color
  const getMessageTypeColor = (
    type: string
  ): "blue" | "green" | "red" | "orange" | "gray" => {
    switch (type) {
      case "device-list":
        return "blue";
      case "sensor-data":
        return "green";
      case "device-status":
        return "orange";
      case "error":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <Box p="5" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <Heading size="6" mb="4">
        Example 2: Basic Messaging
      </Heading>

      <Flex direction="column" gap="4">
        {/* Connection Status */}
        <Box
          p="4"
          style={{
            background: "var(--color-panel)",
            borderRadius: "var(--radius-3)",
            border: "1px solid var(--gray-6)",
          }}
        >
          <Flex align="center" justify="between" mb="3">
            <Text size="3" weight="medium">
              Connection Status
            </Text>
            <Badge color={connectionStatus === "connected" ? "green" : "red"}>
              {connectionStatus}
            </Badge>
          </Flex>

          <Button
            onClick={requestDeviceList}
            disabled={connectionStatus !== "connected"}
            size="2"
          >
            Request Device List
          </Button>
        </Box>

        {/* Message Log */}
        <Box
          p="4"
          style={{
            background: "var(--color-panel)",
            borderRadius: "var(--radius-3)",
            border: "1px solid var(--gray-6)",
          }}
        >
          <Flex align="center" justify="between" mb="3">
            <Text size="3" weight="medium">
              Message Log ({messages.length} messages)
            </Text>
            <Button variant="soft" size="1" onClick={() => setMessages([])}>
              Clear
            </Button>
          </Flex>

          <ScrollArea style={{ height: "400px" }}>
            <Flex direction="column" gap="2">
              {messages.length === 0 ? (
                <Text
                  size="2"
                  color="gray"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No messages received yet. Click "Request Device List" to send
                  a message.
                </Text>
              ) : (
                messages.map((message, index) => (
                  <Box
                    key={index}
                    p="3"
                    style={{
                      background: "var(--gray-2)",
                      borderRadius: "var(--radius-2)",
                      border: "1px solid var(--gray-4)",
                    }}
                  >
                    <Flex align="center" gap="2" mb="2">
                      <Badge color={getMessageTypeColor(message.type)} size="1">
                        {message.type}
                      </Badge>
                      <Text size="1" color="gray">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </Text>
                    </Flex>
                    <Text size="2" style={{ fontFamily: "monospace" }}>
                      {formatMessage(message)}
                    </Text>
                  </Box>
                ))
              )}
            </Flex>
          </ScrollArea>
        </Box>

        {/* Instructions */}
        <Box
          p="3"
          style={{
            background: "var(--gray-2)",
            borderRadius: "var(--radius-2)",
          }}
        >
          <Text size="2" color="gray">
            <strong>Instructions:</strong> Click "Request Device List" to send a
            message to the server. The server will respond with a device-list
            message, and you'll see it appear in the log. As the server sends
            sensor data updates, they will also appear here.
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}

export default Example02;
