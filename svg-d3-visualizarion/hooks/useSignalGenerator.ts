/**
 * Custom hook for generating signal data
 */

import { useMemo } from 'react';
import type { SignalType, SignalParams, SignalDataPoint } from '@/types/signal';
import { generateSignal, validateParams } from '@/lib/signal-utils';

interface UseSignalGeneratorOptions {
  type: SignalType;
  params: SignalParams;
  enabled?: boolean;
}

/**
 * Hook that generates signal data based on type and parameters
 */
export function useSignalGenerator({
  type,
  params,
  enabled = true,
}: UseSignalGeneratorOptions): {
  data: SignalDataPoint[];
  isValid: boolean;
} {
  const isValid = validateParams(params);

  const data = useMemo(() => {
    if (!enabled || !isValid) {
      return [];
    }
    return generateSignal(type, params);
  }, [type, params, enabled, isValid]);

  return { data, isValid };
}

