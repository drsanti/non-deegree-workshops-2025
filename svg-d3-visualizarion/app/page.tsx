'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SensorGrid from '@/components/sensors/SensorGrid';
import BarChart from '@/components/charts/BarChart';
import { generateDashboardSensors, updateSensorReading } from '@/lib/sensor-data';
import type { DashboardSensor } from '@/types/sensor';

export default function Home() {
  const [sensors, setSensors] = useState<DashboardSensor[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Initialize sensors
    const initialSensors = generateDashboardSensors(6);
    setSensors(initialSensors);
  }, []);

  useEffect(() => {
    // Simulate real-time updates every 5 seconds
    const interval = setInterval(() => {
      setSensors((prevSensors) => prevSensors.map(updateSensorReading));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">IoT Sensor Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Real-time visualization of sensor data using D3.js and React SVG
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Sensor Overview</h2>
                <SensorGrid sensors={sensors} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="mt-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Sensor Comparison</h2>
                <div className="bg-card rounded-lg border p-6">
                  <BarChart data={sensors} width={1000} height={400} />
                </div>
              </div>
        </div>
          </TabsContent>
        </Tabs>
        </div>
    </div>
  );
}
