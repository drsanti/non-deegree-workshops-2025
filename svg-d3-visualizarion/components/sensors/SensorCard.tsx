'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LineChart from '@/components/charts/LineChart';
import GaugeChart from '@/components/charts/GaugeChart';
import type { DashboardSensor } from '@/types/sensor';
import { getSensorColor } from '@/lib/d3-utils';

interface SensorCardProps {
  sensor: DashboardSensor;
}

export default function SensorCard({ sensor }: SensorCardProps) {
  const color = getSensorColor(sensor.metadata.type);
  const statusColor =
    sensor.status === 'active' ? 'bg-green-500' : sensor.status === 'error' ? 'bg-red-500' : 'bg-gray-500';

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{sensor.metadata.name}</CardTitle>
            <CardDescription>{sensor.metadata.location}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${statusColor}`} />
            <span className="text-xs text-muted-foreground capitalize">{sensor.status}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center">
          <GaugeChart
            value={sensor.currentValue}
            min={sensor.metadata.minValue}
            max={sensor.metadata.maxValue}
            unit={sensor.metadata.unit}
            sensorType={sensor.metadata.type}
            width={200}
            height={200}
            label={sensor.metadata.name}
          />
        </div>
        <div className="h-48">
          <LineChart
            data={sensor.timeSeries}
            width={600}
            height={200}
            sensorType={sensor.metadata.type}
            color={color}
          />
        </div>
        <div className="flex justify-between text-sm">
          <div>
            <span className="text-muted-foreground">Current: </span>
            <span className="font-semibold">
              {sensor.currentValue.toFixed(1)} {sensor.metadata.unit}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Range: </span>
            <span className="font-semibold">
              {sensor.metadata.minValue} - {sensor.metadata.maxValue} {sensor.metadata.unit}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

