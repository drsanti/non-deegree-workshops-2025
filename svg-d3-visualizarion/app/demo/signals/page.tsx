"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SignalChart from "@/components/charts/SignalChart";
import SignalControls from "@/components/signals/SignalControls";
import { useSignalGenerator } from "@/hooks/useSignalGenerator";
import { getDefaultParams } from "@/lib/signal-utils";
import type { SignalType, SignalParams } from "@/types/signal";
import { getSensorColor } from "@/lib/d3-utils";

export default function SignalVisualization() {
  const [sineParams, setSineParams] = useState<SignalParams>(
    getDefaultParams("sine")
  );
  const [squareParams, setSquareParams] = useState<SignalParams>(
    getDefaultParams("square")
  );
  const [sawtoothParams, setSawtoothParams] = useState<SignalParams>(
    getDefaultParams("sawtooth")
  );
  const [activeTab, setActiveTab] = useState<SignalType>("sine");

  const sineSignal = useSignalGenerator({ type: "sine", params: sineParams });
  const squareSignal = useSignalGenerator({
    type: "square",
    params: squareParams,
  });
  const sawtoothSignal = useSignalGenerator({
    type: "sawtooth",
    params: sawtoothParams,
  });

  const signalColor = getSensorColor(activeTab);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            Signal Visualizer
          </h1>
          <p className="text-muted-foreground mt-2">
            Generate and visualize different signal types: sine, square, and
            sawtooth waves
          </p>
        </header>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as SignalType)}
          className="w-full"
        >
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="sine">Sine Wave</TabsTrigger>
            <TabsTrigger value="square">Square Wave</TabsTrigger>
            <TabsTrigger value="sawtooth">Sawtooth Wave</TabsTrigger>
          </TabsList>

          <TabsContent value="sine" className="mt-6 space-y-6">
            <SignalControls
              params={sineParams}
              onParamsChange={setSineParams}
              signalType="sine"
            />
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">
                Sine Wave Visualization
              </h2>
              {sineSignal.isValid && sineSignal.data.length > 0 ? (
                <SignalChart
                  data={sineSignal.data}
                  signalType="sine"
                  width={1000}
                  height={400}
                  color={signalColor}
                />
              ) : (
                <div className="flex items-center justify-center h-96 text-muted-foreground">
                  Invalid signal parameters. Please adjust the values.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="square" className="mt-6 space-y-6">
            <SignalControls
              params={squareParams}
              onParamsChange={setSquareParams}
              signalType="square"
            />
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">
                Square Wave Visualization
              </h2>
              {squareSignal.isValid && squareSignal.data.length > 0 ? (
                <SignalChart
                  data={squareSignal.data}
                  signalType="square"
                  width={1000}
                  height={400}
                  color={signalColor}
                />
              ) : (
                <div className="flex items-center justify-center h-96 text-muted-foreground">
                  Invalid signal parameters. Please adjust the values.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sawtooth" className="mt-6 space-y-6">
            <SignalControls
              params={sawtoothParams}
              onParamsChange={setSawtoothParams}
              signalType="sawtooth"
            />
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">
                Sawtooth Wave Visualization
              </h2>
              {sawtoothSignal.isValid && sawtoothSignal.data.length > 0 ? (
                <SignalChart
                  data={sawtoothSignal.data}
                  signalType="sawtooth"
                  width={1000}
                  height={400}
                  color={signalColor}
                />
              ) : (
                <div className="flex items-center justify-center h-96 text-muted-foreground">
                  Invalid signal parameters. Please adjust the values.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
