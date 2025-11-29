import { useMemo } from "react";
import type { SignalType, SignalParams, DataPoint } from "../lib/types";
import { generateSignal } from "../lib/signal-generators";

export function useSignalGenerator(
  type: SignalType,
  params: SignalParams
): DataPoint[] {
  return useMemo(() => {
    return generateSignal(type, params);
  }, [type, params]);
}
