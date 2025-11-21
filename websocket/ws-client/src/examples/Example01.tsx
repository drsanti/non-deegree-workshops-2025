/**
 * Example 1: Basic WebSocket Connection Setup
 *
 * This example demonstrates how to:
 * - Create a WebSocket connection
 * - Track connection status
 * - Display connection state in the UI
 * - Handle connection lifecycle events
 */

import { useState, useEffect, useRef } from "react";
import { Box, Flex, Text, Badge, Heading } from "@radix-ui/themes";
import {
  DotFilledIcon,
  CircleIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import type { ConnectionStatus } from "../types";

const WS_URL = "ws://localhost:7890";

function Example01() {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Create WebSocket connection
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    // Set initial status to connecting
    setConnectionStatus("disconnected");

    // Handle connection open
    ws.onopen = () => {
      setConnectionStatus("connected");
    };

    // Handle connection close
    ws.onclose = () => {
      setConnectionStatus("disconnected");
    };

    // Handle errors
    ws.onerror = () => {
      setConnectionStatus("error");
    };

    // Cleanup function - runs when component unmounts
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  // Get status icon based on connection state
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

  // Get status color for badge
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
        Example 1: Basic WebSocket Connection
      </Heading>

      <Box
        p="5"
        style={{
          background: "var(--color-panel)",
          borderRadius: "var(--radius-3)",
          border: "1px solid var(--gray-6)",
        }}
      >
        <Flex direction="column" gap="4">
          <Text size="3" weight="medium">
            Connection Status
          </Text>

          <Flex align="center" gap="3">
            {getStatusIcon()}
            <Badge color={getStatusColor()} size="2">
              {connectionStatus.charAt(0).toUpperCase() +
                connectionStatus.slice(1)}
            </Badge>
          </Flex>

          <Box
            p="3"
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
              style={{ display: "block", marginTop: "8px" }}
            >
              Ready State: {wsRef.current?.readyState ?? "N/A"}
            </Text>
          </Box>

          <Box>
            <Text size="2" color="gray" mb="2" style={{ display: "block" }}>
              <strong>What's happening:</strong>
            </Text>
            <Text size="2" color="gray" style={{ display: "block" }}>
              • WebSocket connection is created when component mounts
            </Text>
            <Text size="2" color="gray" style={{ display: "block" }}>
              • Status updates automatically when connection opens/closes
            </Text>
            <Text size="2" color="gray" style={{ display: "block" }}>
              • Connection is closed when component unmounts
            </Text>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}

export default Example01;
