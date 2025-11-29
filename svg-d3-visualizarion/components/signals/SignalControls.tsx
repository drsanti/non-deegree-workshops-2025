'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { SignalParams } from '@/types/signal';
import { radiansToDegrees, degreesToRadians } from '@/lib/signal-utils';

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
  const [localParams, setLocalParams] = useState<SignalParams>(params);
  const [phaseInDegrees, setPhaseInDegrees] = useState(radiansToDegrees(params.phase));

  useEffect(() => {
    setLocalParams(params);
    setPhaseInDegrees(radiansToDegrees(params.phase));
  }, [params]);

  const updateParam = (key: keyof SignalParams, value: number) => {
    const newParams = { ...localParams, [key]: value };
    setLocalParams(newParams);
    
    if (key === 'phase') {
      setPhaseInDegrees(radiansToDegrees(value));
    }
    
    onParamsChange(newParams);
  };

  const updatePhaseFromDegrees = (degrees: number) => {
    setPhaseInDegrees(degrees);
    const radians = degreesToRadians(degrees);
    updateParam('phase', radians);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{signalType.charAt(0).toUpperCase() + signalType.slice(1)} Wave Parameters</CardTitle>
        <CardDescription>Adjust signal parameters to see real-time changes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency (Hz)</Label>
            <Input
              id="frequency"
              type="number"
              min="0.1"
              max="100"
              step="0.1"
              value={localParams.frequency}
              onChange={(e) => updateParam('frequency', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amplitude">Amplitude</Label>
            <Input
              id="amplitude"
              type="number"
              min="0.1"
              max="10"
              step="0.1"
              value={localParams.amplitude}
              onChange={(e) => updateParam('amplitude', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phase">Phase (degrees)</Label>
            <Input
              id="phase"
              type="number"
              min="-360"
              max="360"
              step="1"
              value={phaseInDegrees.toFixed(1)}
              onChange={(e) => updatePhaseFromDegrees(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sampleRate">Sample Rate (samples/s)</Label>
            <Input
              id="sampleRate"
              type="number"
              min="10"
              max="10000"
              step="10"
              value={localParams.sampleRate}
              onChange={(e) => updateParam('sampleRate', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="duration">Duration (seconds)</Label>
            <Input
              id="duration"
              type="number"
              min="0.1"
              max="20"
              step="0.1"
              value={localParams.duration}
              onChange={(e) => updateParam('duration', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Frequency:</span>
              <span className="ml-2 font-mono">{localParams.frequency.toFixed(2)} Hz</span>
            </div>
            <div>
              <span className="text-muted-foreground">Amplitude:</span>
              <span className="ml-2 font-mono">{localParams.amplitude.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Phase:</span>
              <span className="ml-2 font-mono">{phaseInDegrees.toFixed(1)}°</span>
            </div>
            <div>
              <span className="text-muted-foreground">Sample Rate:</span>
              <span className="ml-2 font-mono">{localParams.sampleRate} sps</span>
            </div>
            <div>
              <span className="text-muted-foreground">Duration:</span>
              <span className="ml-2 font-mono">{localParams.duration.toFixed(1)}s</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

