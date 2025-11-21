import { useState, FormEvent } from "react";
import {
  Card,
  Flex,
  Text,
  Heading,
  Badge,
  Button,
  TextField,
  Box,
  Separator,
} from "@radix-ui/themes";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  DotFilledIcon,
  CircleIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";
import type { Device, DeviceCommandHandler } from "../types";

interface DeviceCardProps {
  device: Device;
  onCommand: DeviceCommandHandler;
}

function DeviceCard({ device, onCommand }: DeviceCardProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const formatTimestamp = (timestamp?: number): string => {
    if (!timestamp) return "Never";
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const getTemperatureColor = (temp: number): "red" | "blue" | "green" => {
    if (temp > 27) return "red";
    if (temp < 18) return "blue";
    return "green";
  };

  const getHumidityColor = (humidity: number): "orange" | "gray" | "green" => {
    if (humidity > 70) return "orange";
    if (humidity < 30) return "gray";
    return "green";
  };

  const handleTogglePower = (): void => {
    onCommand(device.id, "toggle-power");
  };

  const handleSetTemperature = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const temp = parseFloat(formData.get("temperature") as string);
    if (!isNaN(temp) && temp >= 0 && temp <= 50) {
      onCommand(device.id, "set-temperature", temp);
    }
  };

  const handleSetHumidity = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const humidity = parseFloat(formData.get("humidity") as string);
    if (!isNaN(humidity) && humidity >= 0 && humidity <= 100) {
      onCommand(device.id, "set-humidity", humidity);
    }
  };

  const powerStatus = device.data?.power === "on";
  const temperature = device.data?.temperature || 0;
  const humidity = device.data?.humidity || 0;

  return (
    <Card
      style={{
        minWidth: "320px",
        flex: "1 1 320px",
        opacity: device.status === "offline" ? 0.7 : 1,
      }}
    >
      <Flex
        direction="column"
        gap="4"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: "pointer" }}
      >
        <Flex align="center" justify="between" onClick={(e) => e.stopPropagation()}>
          <Box>
            <Heading size="4" mb="1">
              {device.name}
            </Heading>
            <Text size="1" color="gray" style={{ fontFamily: "monospace" }}>
              {device.id}
            </Text>
          </Box>
          <Flex align="center" gap="2">
            <Badge
              color={device.status === "online" ? "green" : "red"}
              variant="soft"
            >
              {device.status === "online" ? (
                <DotFilledIcon style={{ width: "8px", height: "8px" }} />
              ) : (
                <CircleIcon style={{ width: "8px", height: "8px" }} />
              )}
              {device.status}
            </Badge>
            {isExpanded ? (
              <ChevronDownIcon style={{ width: "16px", height: "16px" }} />
            ) : (
              <ChevronRightIcon style={{ width: "16px", height: "16px" }} />
            )}
          </Flex>
        </Flex>

        <Separator />

        <Flex direction="column" gap="3">
          <Flex align="center" justify="between" p="2" style={{ background: "var(--gray-2)", borderRadius: "var(--radius-2)" }}>
            <Flex align="center" gap="2">
              <Text size="2" weight="medium" color="gray">
                Temperature
              </Text>
            </Flex>
            <Text
              size="3"
              weight="bold"
              style={{ fontFamily: "monospace" }}
              color={getTemperatureColor(temperature)}
            >
              {temperature ? `${temperature.toFixed(1)}°C` : "N/A"}
            </Text>
          </Flex>

          <Flex align="center" justify="between" p="2" style={{ background: "var(--gray-2)", borderRadius: "var(--radius-2)" }}>
            <Flex align="center" gap="2">
              <Text size="2" weight="medium" color="gray">
                Humidity
              </Text>
            </Flex>
            <Text
              size="3"
              weight="bold"
              style={{ fontFamily: "monospace" }}
              color={getHumidityColor(humidity)}
            >
              {humidity ? `${humidity.toFixed(1)}%` : "N/A"}
            </Text>
          </Flex>

          <Flex align="center" justify="between" p="2" style={{ background: "var(--gray-2)", borderRadius: "var(--radius-2)" }}>
            <Text size="2" weight="medium" color="gray">
              Power
            </Text>
            <Badge color={powerStatus ? "green" : "red"} variant="soft">
              {powerStatus ? "ON" : "OFF"}
            </Badge>
          </Flex>
        </Flex>

        <Box onClick={(e) => e.stopPropagation()}>
          <Button
            color={powerStatus ? "red" : "green"}
            variant={powerStatus ? "solid" : "soft"}
            onClick={handleTogglePower}
            disabled={device.status !== "online"}
            style={{ width: "100%" }}
          >
            {powerStatus ? "Turn Off" : "Turn On"}
          </Button>
        </Box>

        {isExpanded && (
          <Box pt="3" onClick={(e) => e.stopPropagation()}>
            <Separator mb="3" />
            <Flex align="center" justify="center" gap="2" mb="3">
              <UpdateIcon style={{ width: "12px", height: "12px" }} />
              <Text size="1" color="gray">
                Last update: {formatTimestamp(device.lastUpdate)}
              </Text>
            </Flex>

            <Flex direction="column" gap="3">
              <Box asChild>
                <form onSubmit={handleSetTemperature}>
                  <Flex direction="column" gap="2">
                    <Text size="2" weight="medium">
                      Set Temperature (°C)
                    </Text>
                    <Flex gap="2">
                      <TextField.Root
                        type="number"
                        name="temperature"
                        min="0"
                        max="50"
                        step="0.1"
                        defaultValue={temperature?.toFixed(1)}
                        style={{ flex: 1 }}
                      />
                      <Button type="submit">Set</Button>
                    </Flex>
                  </Flex>
                </form>
              </Box>

              <Box asChild>
                <form onSubmit={handleSetHumidity}>
                  <Flex direction="column" gap="2">
                    <Text size="2" weight="medium">
                      Set Humidity (%)
                    </Text>
                    <Flex gap="2">
                      <TextField.Root
                        type="number"
                        name="humidity"
                        min="0"
                        max="100"
                        step="0.1"
                        defaultValue={humidity?.toFixed(1)}
                        style={{ flex: 1 }}
                      />
                      <Button type="submit">Set</Button>
                    </Flex>
                  </Flex>
                </form>
              </Box>
            </Flex>
          </Box>
        )}
      </Flex>
    </Card>
  );
}

export default DeviceCard;
