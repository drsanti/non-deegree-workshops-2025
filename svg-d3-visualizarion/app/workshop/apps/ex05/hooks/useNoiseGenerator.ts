import { useMemo } from "react";
import type { DataPoint } from "../lib/types";
import { addNoiseToSignal } from "../lib/noise-generators";

export function useNoiseGenerator(
  signal: DataPoint[],
  noiseLevel: number
): DataPoint[] {
  return useMemo(() => {
    return addNoiseToSignal(signal, noiseLevel);
  }, [signal, noiseLevel]);
}
