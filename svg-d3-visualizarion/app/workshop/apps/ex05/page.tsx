"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SignalTab from "./components/SignalTab";
import { useSignalGenerator } from "./hooks/useSignalGenerator";
import { useNoiseGenerator } from "./hooks/useNoiseGenerator";
import { getDefaultParams } from "./lib/utils";
import type { SignalType, SignalParams } from "./lib/types";

export default function Example05() {
  const [activeTab, setActiveTab] = useState<SignalType>("sine");
  const [sineParams, setSineParams] = useState<SignalParams>(
    getDefaultParams()
  );
  const [squareParams, setSquareParams] = useState<SignalParams>(
    getDefaultParams()
  );
  const [sawtoothParams, setSawtoothParams] = useState<SignalParams>(
    getDefaultParams()
  );

  const sineSignal = useSignalGenerator("sine", sineParams);
  const squareSignal = useSignalGenerator("square", squareParams);
  const sawtoothSignal = useSignalGenerator("sawtooth", sawtoothParams);

  const sineNoisy = useNoiseGenerator(sineSignal, sineParams.noiseLevel);
  const squareNoisy = useNoiseGenerator(squareSignal, squareParams.noiseLevel);
  const sawtoothNoisy = useNoiseGenerator(
    sawtoothSignal,
    sawtoothParams.noiseLevel
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            Example 05: Full Signal Visualizer
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete signal visualizer with all signal types, noise generation,
            and full parameter controls
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
            <SignalTab
              signalType="sine"
              params={sineParams}
              onParamsChange={setSineParams}
              cleanSignal={sineSignal}
              noisySignal={sineNoisy}
            />
          </TabsContent>

          <TabsContent value="square" className="mt-6 space-y-6">
            <SignalTab
              signalType="square"
              params={squareParams}
              onParamsChange={setSquareParams}
              cleanSignal={squareSignal}
              noisySignal={squareNoisy}
            />
          </TabsContent>

          <TabsContent value="sawtooth" className="mt-6 space-y-6">
            <SignalTab
              signalType="sawtooth"
              params={sawtoothParams}
              onParamsChange={setSawtoothParams}
              cleanSignal={sawtoothSignal}
              noisySignal={sawtoothNoisy}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
