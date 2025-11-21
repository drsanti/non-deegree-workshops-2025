/**
 * Example Selector Component
 *
 * This component allows switching between different workshop examples.
 * Each example demonstrates a specific WebSocket client concept.
 */

import { useState } from "react";
import { Box, Flex, Text, Heading, Select } from "@radix-ui/themes";
import {
  Example01,
  Example02,
  Example03,
  Example04,
  Example05,
  Example06,
  Example07,
  Example08,
  Example09,
  Example10,
} from "./examples";

const EXAMPLES = [
  {
    value: "1",
    label: "Example 1: Basic WebSocket Connection",
    component: Example01,
  },
  { value: "2", label: "Example 2: Basic Messaging", component: Example02 },
  {
    value: "3",
    label: "Example 3: Device List Handling",
    component: Example03,
  },
  {
    value: "4",
    label: "Example 4: Real-time Sensor Data",
    component: Example04,
  },
  { value: "5", label: "Example 5: Device Control", component: Example05 },
  {
    value: "6",
    label: "Example 6: Connection Management",
    component: Example06,
  },
  { value: "7", label: "Example 7: Error Handling", component: Example07 },
  { value: "8", label: "Example 8: Custom Hooks", component: Example08 },
  { value: "9", label: "Example 9: Advanced Features", component: Example09 },
  { value: "10", label: "Example 10: Best Practices", component: Example10 },
] as const;

function Example() {
  const [selectedExample, setSelectedExample] = useState<string>("1");

  const selectedExampleData = EXAMPLES.find(
    (ex) => ex.value === selectedExample
  );
  const ExampleComponent = selectedExampleData?.component || Example01;

  return (
    <Box style={{ minHeight: "100vh", background: "var(--gray-1)" }}>
      {/* Header with Example Selector */}
      <Box
        p="4"
        style={{
          background: "var(--color-panel)",
          borderBottom: "1px solid var(--gray-6)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Flex
          direction="column"
          gap="3"
          style={{ maxWidth: "1400px", margin: "0 auto" }}
        >
          <Heading size="7">WebSocket Client Workshops</Heading>
          <Flex align="center" gap="3">
            <Text size="2" weight="medium" color="gray">
              Select Example:
            </Text>
            <Select.Root
              value={selectedExample}
              onValueChange={setSelectedExample}
            >
              <Select.Trigger style={{ minWidth: "400px" }} />
              <Select.Content>
                {EXAMPLES.map((example) => (
                  <Select.Item key={example.value} value={example.value}>
                    {example.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Flex>
          {selectedExampleData && (
            <Text size="2" color="gray">
              {selectedExampleData.label}
            </Text>
          )}
        </Flex>
      </Box>

      {/* Example Content */}
      <Box style={{ padding: "20px 0" }}>
        <ExampleComponent />
      </Box>

      {/* Footer with Navigation */}
      <Box
        p="4"
        style={{
          background: "var(--color-panel)",
          borderTop: "1px solid var(--gray-6)",
        }}
      >
        <Flex
          justify="between"
          align="center"
          style={{ maxWidth: "1400px", margin: "0 auto" }}
        >
          <Flex gap="2">
            {parseInt(selectedExample) > 1 && (
              <button
                onClick={() =>
                  setSelectedExample(String(parseInt(selectedExample) - 1))
                }
                style={{
                  padding: "8px 16px",
                  borderRadius: "4px",
                  border: "1px solid var(--gray-6)",
                  background: "var(--color-panel)",
                  cursor: "pointer",
                }}
              >
                ← Previous
              </button>
            )}
          </Flex>
          <Text size="2" color="gray">
            Example {selectedExample} of {EXAMPLES.length}
          </Text>
          <Flex gap="2">
            {parseInt(selectedExample) < EXAMPLES.length && (
              <button
                onClick={() =>
                  setSelectedExample(String(parseInt(selectedExample) + 1))
                }
                style={{
                  padding: "8px 16px",
                  borderRadius: "4px",
                  border: "1px solid var(--gray-6)",
                  background: "var(--color-panel)",
                  cursor: "pointer",
                }}
              >
                Next →
              </button>
            )}
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
}

export default Example;
