/**
 * Example 7: Error Handling & Validation
 *
 * This example demonstrates how to:
 * - Handle error messages from the server
 * - Validate incoming messages
 * - Display user-friendly error messages
 * - Handle JSON parsing errors
 * - Validate message structure
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
import { Cross2Icon } from "@radix-ui/react-icons";
import type { ServerMessage, ConnectionStatus } from "../types";

const WS_URL = "ws://localhost:7890";

interface ErrorInfo {
  id: string;
  message: string;
  timestamp: number;
  type: "server" | "validation" | "parse";
}

function Example07() {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [messagesReceived, setMessagesReceived] = useState<number>(0);
  const [invalidMessages, setInvalidMessages] = useState<number>(0);
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

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        setMessagesReceived((prev) => prev + 1);

        // Validate message structure
        if (!isValidMessage(data)) {
          setInvalidMessages((prev) => prev + 1);
          addError("Invalid message format received", "validation");
          console.error("Invalid message:", data);
          return;
        }

        // Handle valid message
        handleMessage(data as ServerMessage);
      } catch (error) {
        setInvalidMessages((prev) => prev + 1);
        addError("Failed to parse message JSON", "parse");
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

  // Validate message structure
  const isValidMessage = (data: unknown): data is ServerMessage => {
    if (typeof data !== "object" || data === null) {
      return false;
    }

    const obj = data as Record<string, unknown>;

    if (typeof obj.type !== "string" || typeof obj.timestamp !== "number") {
      return false;
    }

    // Validate specific message types
    switch (obj.type) {
      case "device-list":
        return Array.isArray(obj.devices);
      case "sensor-data":
        return (
          typeof obj.deviceId === "string" &&
          typeof obj.deviceName === "string" &&
          typeof obj.data === "object" &&
          obj.data !== null
        );
      case "device-status":
        return (
          typeof obj.deviceId === "string" &&
          typeof obj.deviceName === "string" &&
          typeof obj.status === "string"
        );
      case "connection-status":
        return typeof obj.clientCount === "number";
      case "error":
        return typeof obj.message === "string";
      default:
        return false;
    }
  };

  const handleMessage = (message: ServerMessage) => {
    switch (message.type) {
      case "error":
        addError(message.message, "server");
        break;
      // Handle other message types...
      default:
        // Message handled successfully
        break;
    }
  };

  const addError = (message: string, type: ErrorInfo["type"]) => {
    const error: ErrorInfo = {
      id: Date.now().toString() + Math.random().toString(36),
      message,
      timestamp: Date.now(),
      type,
    };

    setErrors((prev) => [...prev, error]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setErrors((prev) => prev.filter((e) => e.id !== error.id));
    }, 5000);
  };

  const removeError = (id: string) => {
    setErrors((prev) => prev.filter((e) => e.id !== id));
  };

  const getErrorTypeColor = (
    type: ErrorInfo["type"]
  ): "red" | "orange" | "yellow" => {
    switch (type) {
      case "server":
        return "red";
      case "validation":
        return "orange";
      case "parse":
        return "yellow";
    }
  };

  // Simulate an error for demonstration
  const simulateError = () => {
    addError("This is a simulated error message", "server");
  };

  // Send invalid message to test validation
  const sendInvalidMessage = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ invalid: "message" }));
    }
  };

  return (
    <Box p="5" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <Heading size="6" mb="4">
        Example 7: Error Handling & Validation
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
              Messages: <Badge>{messagesReceived}</Badge>
            </Text>
            <Text size="2" weight="medium">
              Invalid: <Badge color="orange">{invalidMessages}</Badge>
            </Text>
          </Flex>
        </Box>

        {/* Error Display */}
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
              Errors ({errors.length})
            </Text>
            {errors.length > 0 && (
              <Button variant="soft" size="1" onClick={() => setErrors([])}>
                Clear All
              </Button>
            )}
          </Flex>

          {errors.length === 0 ? (
            <Box
              p="4"
              style={{
                background: "var(--gray-2)",
                borderRadius: "var(--radius-2)",
                textAlign: "center",
              }}
            >
              <Text size="2" color="gray">
                No errors. All messages are valid!
              </Text>
            </Box>
          ) : (
            <ScrollArea style={{ height: "300px" }}>
              <Flex direction="column" gap="2">
                {errors.map((error) => (
                  <Box
                    key={error.id}
                    p="3"
                    style={{
                      background: `var(--${getErrorTypeColor(error.type)}-2)`,
                      borderRadius: "var(--radius-2)",
                      border: `1px solid var(--${getErrorTypeColor(
                        error.type
                      )}-6)`,
                    }}
                  >
                    <Flex align="center" justify="between" gap="2">
                      <Flex direction="column" gap="1" style={{ flex: 1 }}>
                        <Flex align="center" gap="2">
                          <Badge color={getErrorTypeColor(error.type)} size="1">
                            {error.type}
                          </Badge>
                          <Text size="1" color="gray">
                            {new Date(error.timestamp).toLocaleTimeString()}
                          </Text>
                        </Flex>
                        <Text size="2" color={getErrorTypeColor(error.type)}>
                          {error.message}
                        </Text>
                      </Flex>
                      <Button
                        variant="ghost"
                        size="1"
                        onClick={() => removeError(error.id)}
                      >
                        <Cross2Icon />
                      </Button>
                    </Flex>
                  </Box>
                ))}
              </Flex>
            </ScrollArea>
          )}
        </Box>

        {/* Test Controls */}
        <Box
          p="3"
          style={{
            background: "var(--color-panel)",
            borderRadius: "var(--radius-3)",
            border: "1px solid var(--gray-6)",
          }}
        >
          <Text size="2" weight="medium" mb="3">
            Test Error Handling
          </Text>
          <Flex gap="2">
            <Button variant="soft" onClick={simulateError}>
              Simulate Error
            </Button>
            <Button
              variant="soft"
              onClick={sendInvalidMessage}
              disabled={connectionStatus !== "connected"}
            >
              Send Invalid Message
            </Button>
          </Flex>
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
            <strong>What's happening:</strong> All incoming messages are
            validated before processing. Invalid messages are caught and
            displayed as errors. Server error messages are also displayed.
            Errors auto-dismiss after 5 seconds, or can be manually dismissed.
            Use the test buttons to simulate different error scenarios.
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}

export default Example07;
