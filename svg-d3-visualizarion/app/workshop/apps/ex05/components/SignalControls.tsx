"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SignalParams } from "../lib/types";
import { degreesToRadians, radiansToDegrees } from "../lib/utils";

interface SignalControlsProps {
  params: SignalParams;
  onParamsChange: (params: SignalParams) => void;
  signalType: string;
}

export default function SignalControls({
  params,
  onParamsChange,
  signalType,
}: SignalControlsProps) {
  const updateParam = (key: keyof SignalParams, value: number) => {
    onParamsChange({ ...params, [key]: value });
  };

  const phaseInDegrees = radiansToDegrees(params.phase);

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>
          {signalType.charAt(0).toUpperCase() + signalType.slice(1)} Wave
          Parameters
        </CardTitle>
        <CardDescription>Adjust signal and noise parameters</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`${signalType}-frequency`}>Frequency (Hz)</Label>
          <Input
            id={`${signalType}-frequency`}
            type="number"
            min="0.1"
            max="10"
            step="0.1"
            value={params.frequency}
            onChange={(e) =>
              updateParam("frequency", parseFloat(e.target.value) || 0)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${signalType}-amplitude`}>Amplitude</Label>
          <Input
            id={`${signalType}-amplitude`}
            type="number"
            min="0.1"
            max="5"
            step="0.1"
            value={params.amplitude}
            onChange={(e) =>
              updateParam("amplitude", parseFloat(e.target.value) || 0)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${signalType}-phase`}>Phase (degrees)</Label>
          <Input
            id={`${signalType}-phase`}
            type="number"
            min="-360"
            max="360"
            step="1"
            value={phaseInDegrees.toFixed(1)}
            onChange={(e) =>
              updateParam(
                "phase",
                degreesToRadians(parseFloat(e.target.value) || 0)
              )
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${signalType}-sampleRate`}>
            Sample Rate (samples/s)
          </Label>
          <Input
            id={`${signalType}-sampleRate`}
            type="number"
            min="10"
            max="1000"
            step="10"
            value={params.sampleRate}
            onChange={(e) =>
              updateParam("sampleRate", parseFloat(e.target.value) || 0)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${signalType}-duration`}>Duration (seconds)</Label>
          <Input
            id={`${signalType}-duration`}
            type="number"
            min="0.1"
            max="10"
            step="0.1"
            value={params.duration}
            onChange={(e) =>
              updateParam("duration", parseFloat(e.target.value) || 0)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${signalType}-noiseLevel`}>Noise Level</Label>
          <Input
            id={`${signalType}-noiseLevel`}
            type="number"
            min="0"
            max="1"
            step="0.05"
            value={params.noiseLevel}
            onChange={(e) =>
              updateParam("noiseLevel", parseFloat(e.target.value) || 0)
            }
          />
        </div>

        <div className="pt-4 border-t space-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">Frequency: </span>
            <span className="font-mono">{params.frequency.toFixed(2)} Hz</span>
          </div>
          <div>
            <span className="text-muted-foreground">Amplitude: </span>
            <span className="font-mono">{params.amplitude.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Phase: </span>
            <span className="font-mono">{phaseInDegrees.toFixed(1)}°</span>
          </div>
          <div>
            <span className="text-muted-foreground">Sample Rate: </span>
            <span className="font-mono">{params.sampleRate} sps</span>
          </div>
          <div>
            <span className="text-muted-foreground">Duration: </span>
            <span className="font-mono">{params.duration.toFixed(1)}s</span>
          </div>
          <div>
            <span className="text-muted-foreground">Noise Level: </span>
            <span className="font-mono">{params.noiseLevel.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
