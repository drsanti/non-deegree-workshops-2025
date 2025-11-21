/**
 * Example 6: Connection Management & Reconnection
 *
 * This example demonstrates how to:
 * - Manage WebSocket connection lifecycle
 * - Implement automatic reconnection with exponential backoff
 * - Handle connection errors gracefully
 * - Properly clean up resources
 * - Handle React Strict Mode
 */

import { useState, useEffect, useRef } from "react";
import { Box, Flex, Text, Badge, Heading, Button } from "@radix-ui/themes";
import {
  DotFilledIcon,
  CircleIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import type { ConnectionStatus } from "../types";

const WS_URL = "ws://localhost:7890";
const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 1000; // 1 second

function Example06() {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [reconnectAttempts, setReconnectAttempts] = useState<number>(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const isCleaningUpRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(false);
  const mountTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);

  useEffect(() => {
    // Mark as mounted after a short delay to distinguish from Strict Mode cleanup
    mountTimeoutRef.current = setTimeout(() => {
      isMountedRef.current = true;
    }, 100);

    connectWebSocket();

    return () => {
      // Only cleanup if we're actually unmounting (not just Strict Mode double-invoke)
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

  const reconnect = () => {
    if (isCleaningUpRef.current) {
      return;
    }

    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      console.error("Max reconnection attempts reached");
      return;
    }

    const delay =
      INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current);
    reconnectAttemptsRef.current++;
    setReconnectAttempts(reconnectAttemptsRef.current);

    reconnectTimeoutRef.current = setTimeout(() => {
      if (!isCleaningUpRef.current) {
        connectWebSocket();
      }
    }, delay);
  };

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

      ws.onopen = () => {
        if (wsRef.current !== ws || isCleaningUpRef.current) {
          ws.close();
          return;
        }
        setConnectionStatus("connected");
        reconnectAttemptsRef.current = 0; // Reset on successful connection
        setReconnectAttempts(0);
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

        // Attempt to reconnect after delay for error cases
        if (
          (event.code === 1006 ||
            (event.code !== 1000 && event.code !== 1001)) &&
          !isCleaningUpRef.current
        ) {
          reconnect();
        }
      };
    } catch (error) {
      if (!isCleaningUpRef.current) {
        console.error("Failed to create WebSocket connection:", error);
        setConnectionStatus("error");
        reconnect();
      }
    }
  };

  const handleManualReconnect = () => {
    reconnectAttemptsRef.current = 0;
    setReconnectAttempts(0);
    connectWebSocket();
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
    <Box p="5" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <Heading size="6" mb="4">
        Example 6: Connection Management & Reconnection
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
          <Flex direction="column" gap="3">
            <Flex align="center" gap="3">
              {getStatusIcon()}
              <Text size="3" weight="medium">
                Connection Status
              </Text>
              <Badge color={getStatusColor()}>
                {connectionStatus.charAt(0).toUpperCase() +
                  connectionStatus.slice(1)}
              </Badge>
            </Flex>

            {connectionStatus === "error" && reconnectAttempts > 0 && (
              <Box
                p="2"
                style={{
                  background: "var(--orange-2)",
                  borderRadius: "var(--radius-2)",
                }}
              >
                <Text size="2" color="orange">
                  Reconnection attempt {reconnectAttempts} of{" "}
                  {MAX_RECONNECT_ATTEMPTS}
                </Text>
              </Box>
            )}

            {connectionStatus === "error" &&
              reconnectAttempts >= MAX_RECONNECT_ATTEMPTS && (
                <Box
                  p="2"
                  style={{
                    background: "var(--red-2)",
                    borderRadius: "var(--radius-2)",
                  }}
                >
                  <Text size="2" color="red">
                    Max reconnection attempts reached. Click "Reconnect" to try
                    again.
                  </Text>
                </Box>
              )}

            <Button
              onClick={handleManualReconnect}
              disabled={connectionStatus === "connected"}
              variant="soft"
            >
              Manual Reconnect
            </Button>
          </Flex>
        </Box>

        {/* Connection Info */}
        <Box
          p="4"
          style={{
            background: "var(--color-panel)",
            borderRadius: "var(--radius-3)",
            border: "1px solid var(--gray-6)",
          }}
        >
          <Flex direction="column" gap="2">
            <Text size="2" weight="medium">
              Connection Details
            </Text>
            <Box
              p="2"
              style={{
                background: "var(--gray-2)",
                borderRadius: "var(--radius-2)",
                fontFamily: "monospace",
                fontSize: "12px",
              }}
            >
              <Text size="1" color="gray">
                WebSocket URL: {WS_URL}
              </Text>
              <Text
                size="1"
                color="gray"
                style={{ display: "block", marginTop: "4px" }}
              >
                Ready State: {wsRef.current?.readyState ?? "N/A"}
              </Text>
              <Text
                size="1"
                color="gray"
                style={{ display: "block", marginTop: "4px" }}
              >
                Reconnect Attempts: {reconnectAttempts} /{" "}
                {MAX_RECONNECT_ATTEMPTS}
              </Text>
            </Box>
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
            <strong>What's happening:</strong> This example demonstrates
            automatic reconnection with exponential backoff. If the connection
            is lost (close code 1006), it will automatically attempt to
            reconnect with increasing delays: 1s, 2s, 4s, 8s, 16s. The
            connection properly cleans up on unmount and handles React Strict
            Mode.
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}

export default Example06;
