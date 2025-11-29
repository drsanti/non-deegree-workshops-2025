'use client';

import SensorCard from './SensorCard';
import type { DashboardSensor } from '@/types/sensor';

interface SensorGridProps {
  sensors: DashboardSensor[];
}

export default function SensorGrid({ sensors }: SensorGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sensors.map((sensor) => (
        <SensorCard key={sensor.metadata.id} sensor={sensor} />
      ))}
    </div>
  );
}

