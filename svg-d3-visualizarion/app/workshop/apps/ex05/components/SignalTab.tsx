"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SignalChart from "./SignalChart";
import SignalControls from "./SignalControls";
import type { SignalParams, DataPoint } from "../lib/types";
import { signalColors } from "../lib/utils";

interface SignalTabProps {
  signalType: string;
  params: SignalParams;
  onParamsChange: (params: SignalParams) => void;
  cleanSignal: DataPoint[];
  noisySignal: DataPoint[];
}

export default function SignalTab({
  signalType,
  params,
  onParamsChange,
  cleanSignal,
  noisySignal,
}: SignalTabProps) {
  const color = signalColors[signalType] || "#3b82f6";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <SignalControls
        params={params}
        onParamsChange={onParamsChange}
        signalType={signalType}
      />

      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {signalType.charAt(0).toUpperCase() + signalType.slice(1)} Wave
              Visualization
            </CardTitle>
            <CardDescription>Clean signal vs signal with noise</CardDescription>
          </CardHeader>
          <CardContent>
            <SignalChart
              cleanData={cleanSignal}
              noisyData={noisySignal}
              color={color}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
